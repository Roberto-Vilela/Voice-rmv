from faster_whisper import WhisperModel

model: WhisperModel | None = None


def get_model() -> WhisperModel:
    global model
    if model is None:
        model = WhisperModel("base", device="cpu", compute_type="int8")
    return model


def transcribe(audio_path: str) -> dict:
    model = get_model()
    segments, info = model.transcribe(audio_path, language="pt")
    return {
        "text": " ".join(seg.text for seg in segments),
        "segments": [
            {"start": seg.start, "end": seg.end, "text": seg.text}
            for seg in segments
        ],
        "duration": info.duration,
        "language": info.language,
    }
