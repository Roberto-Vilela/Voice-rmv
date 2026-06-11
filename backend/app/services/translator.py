import asyncio
import json
import re
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from openai import (
    APIConnectionError,
    APIStatusError,
    APITimeoutError,
    AsyncOpenAI,
    AuthenticationError,
    NotFoundError,
)

from app.config import settings
from app.models.schemas import TranslationSegment

_client: AsyncOpenAI | None = None
_load_lock = asyncio.Lock()
_chatml_pattern = re.compile(r"<\|im_end\|>\s*$")
_marker_pattern = re.compile(
    r"<<<SEGMENT:(?P<id>[^>]+)>>>\s*(?P<text>.*?)(?=\n<<<SEGMENT:|\Z)",
    re.DOTALL,
)


class TranslationError(RuntimeError):
    pass


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(
            base_url=settings.translation_base_url,
            api_key=settings.translation_api_key,
            timeout=180.0,
        )
    return _client


def _controller_request() -> dict[str, object]:
    request = Request(
        f"{settings.translation_controller_url.rstrip('/')}/ensure",
        method="POST",
        headers={
            "Authorization": f"Bearer {settings.translation_controller_token}",
            "Content-Type": "application/json",
        },
        data=b"{}",
    )
    try:
        with urlopen(request, timeout=190) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise TranslationError(f"Translation model controller failed: {detail}") from exc
    except URLError as exc:
        raise TranslationError(
            "Translation model controller is unavailable. "
            "Run scripts/start-translation-server.sh on the host."
        ) from exc


async def _ensure_model_loaded() -> None:
    async with _load_lock:
        await asyncio.to_thread(_controller_request)


def _language_name(language: str) -> str:
    names = {
        "auto": "the detected source language",
        "en": "English",
        "en-US": "English",
        "pt": "Portuguese",
        "pt-BR": "Brazilian Portuguese",
        "es": "Spanish",
        "fr": "French",
        "de": "German",
        "it": "Italian",
        "ja": "Japanese",
        "ko": "Korean",
        "zh": "Chinese",
    }
    return names.get(language, language)


def _tag_segments(segments: list[TranslationSegment]) -> str:
    return "\n".join(f"<<<SEGMENT:{segment.id}>>>\n{segment.text}" for segment in segments)


def _parse_tagged_translation(
    content: str,
    expected_ids: set[str],
) -> dict[str, str] | None:
    parsed = {
        match.group("id").strip(): match.group("text").strip()
        for match in _marker_pattern.finditer(content)
    }
    if set(parsed) != expected_ids or any(not text for text in parsed.values()):
        return None
    return parsed


async def _completion(prompt: str, max_tokens: int) -> str:
    client = _get_client()
    try:
        response = await client.chat.completions.create(
            model=settings.translation_model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=max_tokens,
            extra_body={"ttl": settings.translation_idle_ttl},
        )
    except AuthenticationError as exc:
        raise TranslationError("Translation server rejected its API credentials.") from exc
    except NotFoundError as exc:
        raise TranslationError(
            f"Translation model '{settings.translation_model}' is not available."
        ) from exc
    except (APIConnectionError, APITimeoutError) as exc:
        raise TranslationError(
            "Translation server is unavailable or the CPU model did not finish loading."
        ) from exc
    except APIStatusError as exc:
        raise TranslationError(
            f"Translation server returned HTTP {exc.status_code}."
        ) from exc

    content = response.choices[0].message.content
    if not content or not content.strip():
        raise TranslationError("Translation model returned an empty response.")
    return _chatml_pattern.sub("", content.strip())


async def _translate_individually(
    segments: list[TranslationSegment],
    source_lang: str,
    target_lang: str,
) -> list[TranslationSegment]:
    translated: list[TranslationSegment] = []
    source = _language_name(source_lang)
    target = _language_name(target_lang)
    for segment in segments:
        content = await _completion(
            (
                f"Translate the text from {source} to {target}. "
                "Return only the translated text, without explanations.\n\n"
                f"{segment.text}"
            ),
            max_tokens=min(2048, max(128, len(segment.text) * 2)),
        )
        translated.append(TranslationSegment(id=segment.id, text=content))
    return translated


async def _translate_batch(
    segments: list[TranslationSegment],
    source_lang: str,
    target_lang: str,
) -> list[TranslationSegment]:
    source = _language_name(source_lang)
    target = _language_name(target_lang)
    prompt = (
        f"Translate every segment from {source} to {target}. "
        "Preserve every <<<SEGMENT:id>>> marker exactly, preserve segment order, "
        "and return only the markers and translated text.\n\n"
        f"{_tag_segments(segments)}"
    )
    content = await _completion(
        prompt,
        max_tokens=min(8192, max(512, sum(len(segment.text) for segment in segments) * 2)),
    )
    parsed = _parse_tagged_translation(content, {segment.id for segment in segments})
    if parsed is None:
        return await _translate_individually(segments, source_lang, target_lang)

    return [
        TranslationSegment(id=segment.id, text=parsed[segment.id])
        for segment in segments
    ]


def _split_long_segment(
    segment: TranslationSegment,
    max_chars: int = 1000,
) -> list[TranslationSegment]:
    if len(segment.text) <= max_chars:
        return [segment]
    parts: list[TranslationSegment] = []
    for i in range(0, len(segment.text), max_chars):
        chunk = segment.text[i : i + max_chars]
        parts.append(TranslationSegment(id=f"{segment.id}_part_{len(parts)}", text=chunk))
    return parts


def _build_batches(
    segments: list[TranslationSegment],
    max_characters: int = 2000,
) -> list[list[TranslationSegment]]:
    batches: list[list[TranslationSegment]] = []
    current: list[TranslationSegment] = []
    current_size = 0

    for segment in segments:
        for chunk in _split_long_segment(segment):
            chunk_size = len(chunk.text)
            if current and current_size + chunk_size > max_characters:
                batches.append(current)
                current = []
                current_size = 0
            current.append(chunk)
            current_size += chunk_size

    if current:
        batches.append(current)
    return batches


def _merge_chunks(segments: list[TranslationSegment]) -> list[TranslationSegment]:
    result: list[TranslationSegment] = []
    current_base: str | None = None
    current_parts: list[tuple[int, str]] = []

    for seg in segments:
        if "_part_" in seg.id:
            base_id, part_str = seg.id.rsplit("_part_", 1)
            if current_base is None:
                current_base = base_id
            if base_id == current_base:
                current_parts.append((int(part_str), seg.text))
                continue
            combined = "".join(text for _, text in sorted(current_parts, key=lambda x: x[0]))
            result.append(TranslationSegment(id=current_base, text=combined))
            current_base = base_id
            current_parts = [(int(part_str), seg.text)]
        else:
            if current_base is not None:
                combined = "".join(text for _, text in sorted(current_parts, key=lambda x: x[0]))
                result.append(TranslationSegment(id=current_base, text=combined))
                current_base = None
                current_parts = []
            result.append(seg)

    if current_base is not None:
        combined = "".join(text for _, text in sorted(current_parts, key=lambda x: x[0]))
        result.append(TranslationSegment(id=current_base, text=combined))

    return result


async def translate_segments(
    segments: list[TranslationSegment],
    source_lang: str = "auto",
    target_lang: str = "pt-BR",
) -> list[TranslationSegment]:
    translated: list[TranslationSegment] = []
    for batch in _build_batches(segments):
        await _ensure_model_loaded()
        translated.extend(await _translate_batch(batch, source_lang, target_lang))
    return _merge_chunks(translated)
