from unittest.mock import MagicMock, patch

import pytest


@pytest.fixture
def mock_whisper_model():
    model = MagicMock()
    segment = MagicMock()
    segment.start = 0.0
    segment.end = 2.5
    segment.text = "olá mundo teste"

    info = MagicMock()
    info.duration = 2.5
    info.language = "en"

    model.transcribe.return_value = ([segment], info)
    return model


def test_transcribe_returns_correct_structure(mock_whisper_model):
    with patch("app.services.transcriber.get_model", return_value=mock_whisper_model):
        from app.services.transcriber import transcribe

        result = transcribe("/fake/path.wav")

        assert result["text"] == "olá mundo teste"
        assert len(result["segments"]) == 1
        assert result["segments"][0]["text"] == "olá mundo teste"
        assert result["duration"] == 2.5
        assert result["language"] == "en"

        mock_whisper_model.transcribe.assert_called_once_with(
            "/fake/path.wav",
            task="transcribe",
            language=None,
            word_timestamps=True,
        )


def test_transcribe_calls_get_model(mock_whisper_model):
    with patch("app.services.transcriber.get_model", return_value=mock_whisper_model) as mock_get:
        from app.services.transcriber import transcribe

        transcribe("/fake/path.wav")

        mock_get.assert_called_once()


def test_transcribe_empty_audio():
    model = MagicMock()
    model.transcribe.return_value = ([], MagicMock(duration=0.0, language="en"))

    with patch("app.services.transcriber.get_model", return_value=model):
        from app.services.transcriber import transcribe

        result = transcribe("/fake/silence.wav")

        assert result["text"] == ""
        assert result["segments"] == []
