import edge_tts
import inspect
import re


TICKS_PER_SECOND = 10_000_000


def _seconds(value: int | float | None) -> float:
    return max(0.0, float(value or 0) / TICKS_PER_SECOND)


def _word_count(text: str) -> int:
    return len(re.findall(r"\w+", text, flags=re.UNICODE))


def _rate_from_speed(speed: float) -> str:
    pct = (speed - 1.0) * 100
    return f"{pct:+.0f}%"


def _pitch_str(pitch: int) -> str:
    return f"{pitch:+d}Hz"


def _volume_str(volume: float) -> str:
    pct = (volume - 1.0) * 100
    return f"{pct:+.0f}%"


async def synthesize(text: str, voice: str = "en-US-AriaNeural", speed: float | None = None, pitch: int | None = None, volume: float | None = None) -> bytes:
    rate = _rate_from_speed(speed) if speed is not None else "+0%"
    pitch_str = _pitch_str(pitch) if pitch is not None else "+0Hz"
    vol_str = _volume_str(volume) if volume is not None else "+0%"
    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch_str, volume=vol_str)
    audio = b""
    stream = communicate.stream()
    if inspect.isawaitable(stream):
        stream = await stream
    async for chunk in stream:
        if chunk["type"] == "audio":
            audio += chunk["data"]
    return audio


async def synthesize_with_timing(text: str, voice: str = "en-US-AriaNeural") -> dict:
    communicate = edge_tts.Communicate(text, voice, boundary="WordBoundary")
    audio = bytearray()
    word_boundaries: list[dict] = []
    stream = communicate.stream()
    if inspect.isawaitable(stream):
        stream = await stream

    async for chunk in stream:
        if chunk["type"] == "audio":
            audio.extend(chunk["data"])
        elif chunk["type"] == "WordBoundary":
            start = _seconds(chunk.get("offset"))
            duration = _seconds(chunk.get("duration"))
            word_boundaries.append(
                {
                    "text": chunk.get("text", ""),
                    "start": start,
                    "end": start + duration,
                }
            )

    return {"audio": bytes(audio), "word_boundaries": word_boundaries}


def build_narration_segments(
    source_segments: list[dict],
    word_boundaries: list[dict],
    narration_duration: float,
) -> list[dict]:
    if not source_segments:
        return []

    if not word_boundaries:
        source_duration = max(
            (float(segment.get("end") or 0) for segment in source_segments),
            default=0.0,
        )
        scale = narration_duration / source_duration if source_duration > 0 else 1.0
        return [
            {
                "start": float(segment.get("start") or 0) * scale,
                "end": float(segment.get("end") or 0) * scale,
                "text": segment.get("text", ""),
            }
            for segment in source_segments
        ]

    counts = [_word_count(str(segment.get("text") or "")) for segment in source_segments]
    total_words = sum(counts)
    if total_words == 0:
        counts = [1] * len(source_segments)
        total_words = len(source_segments)

    narration_segments: list[dict] = []
    consumed_words = 0
    boundary_count = len(word_boundaries)

    for index, (segment, count) in enumerate(zip(source_segments, counts)):
        start_index = round(consumed_words / total_words * boundary_count)
        consumed_words += count
        end_index = (
            boundary_count
            if index == len(source_segments) - 1
            else round(consumed_words / total_words * boundary_count)
        )
        selected = word_boundaries[start_index:end_index]

        if selected:
            start = float(selected[0]["start"])
            end = float(selected[-1]["end"])
        else:
            start = narration_segments[-1]["end"] if narration_segments else 0.0
            end = start

        narration_segments.append(
            {
                "start": start,
                "end": end,
                "text": segment.get("text", ""),
            }
        )

    for index in range(len(narration_segments) - 1):
        next_start = narration_segments[index + 1]["start"]
        narration_segments[index]["end"] = max(
            narration_segments[index]["end"],
            next_start,
        )

    narration_segments[-1]["end"] = max(
        narration_segments[-1]["end"],
        narration_duration,
    )
    return narration_segments


async def list_voices() -> list[dict]:
    voices = await edge_tts.list_voices()
    return [
        {"name": v["ShortName"], "locale": v["Locale"], "gender": v["Gender"]}
        for v in voices
    ]
