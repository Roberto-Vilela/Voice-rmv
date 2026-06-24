import time

from faster_whisper import WhisperModel

_MODEL_CACHE: dict[str, tuple[WhisperModel, float]] = {}
_TTL_SECONDS = 600


def _cache_key(model_size: str, device: str) -> str:
    return f"{model_size}_{device}"


def get_model(
    model_size: str = "base",
    device: str = "cpu",
    compute_type: str = "int8",
) -> WhisperModel:
    key = _cache_key(model_size, device)
    entry = _MODEL_CACHE.get(key)

    if entry and time.time() - entry[1] < _TTL_SECONDS:
        return entry[0]

    if entry:
        del _MODEL_CACHE[key]

    model = WhisperModel(model_size, device=device, compute_type=compute_type)
    _MODEL_CACHE[key] = (model, time.time())
    return model


def transcribe(
    audio_path: str,
    language: str | None = None,
    model_size: str = "base",
    device: str = "cpu",
    compute_type: str = "int8",
    initial_prompt: str | None = None,
) -> dict:
    model = get_model(model_size, device, compute_type)
    segments_gen, info = model.transcribe(
        audio_path,
        language=language,
        initial_prompt=initial_prompt,
        task="transcribe",
        word_timestamps=True,
    )
    segments = list(segments_gen)
    # Fidelity rule: the Whisper transcript is the source of truth.
    # No post-correction, grammar rewrite, or heuristic text mutation is allowed here.
    return {
        "text": " ".join(seg.text for seg in segments),
        "segments": [
            {
                "start": seg.start,
                "end": seg.end,
                "text": seg.text,
                "words": [
                    {"word": w.word, "start": w.start, "end": w.end}
                    for w in seg.words
                ],
            }
            for seg in segments
        ],
        "duration": info.duration,
        "language": info.language,
    }
