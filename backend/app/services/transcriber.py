from faster_whisper import WhisperModel

model: WhisperModel | None = None


def get_model() -> WhisperModel:
    global model
    if model is None:
        model = WhisperModel("base", device="cpu", compute_type="int8")
    return model


def transcribe(audio_path: str, language: str | None = None) -> dict:
    model = get_model()
    segments_gen, info = model.transcribe(audio_path, language=language, task="transcribe", word_timestamps=True)
    segments = list(segments_gen)
    return {
        "text": " ".join(seg.text for seg in segments),
        "segments": [
            {
                "start": seg.start,
                "end": seg.end,
                "text": seg.text,
                "words": [{"word": w.word, "start": w.start, "end": w.end} for w in seg.words]
            }
            for seg in segments
        ],
        "duration": info.duration,
        "language": info.language,
    }
