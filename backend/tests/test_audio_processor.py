from pathlib import Path
from unittest.mock import patch

import pytest


def test_extract_audio_calls_ffmpeg():
    with patch("app.services.audio_processor.subprocess.run") as mock_run:
        from app.services.audio_processor import extract_audio

        result = extract_audio("/tmp/video.mp4", "/tmp/audio.wav")

        assert result == "/tmp/audio.wav"
        mock_run.assert_called_once_with(
            [
                "ffmpeg", "-i", "/tmp/video.mp4",
                "-vn", "-acodec", "pcm_s16le",
                "-ar", "16000", "-ac", "1",
                "-y", "/tmp/audio.wav",
            ],
            check=True, capture_output=True,
        )


def test_extract_audio_default_output():
    with patch("app.services.audio_processor.subprocess.run") as mock_run:
        from app.services.audio_processor import extract_audio

        result = extract_audio("/tmp/video.mp4")

        assert result == "/tmp/video.wav"
        mock_run.assert_called_once()


def test_convert_to_wav_calls_ffmpeg():
    with patch("app.services.audio_processor.subprocess.run") as mock_run:
        from app.services.audio_processor import convert_to_wav

        result = convert_to_wav("/tmp/audio.mp3", "/tmp/audio.wav")

        assert result == "/tmp/audio.wav"
        mock_run.assert_called_once_with(
            [
                "ffmpeg", "-i", "/tmp/audio.mp3",
                "-acodec", "pcm_s16le",
                "-ar", "16000", "-ac", "1",
                "-y", "/tmp/audio.wav",
            ],
            check=True, capture_output=True,
        )


def test_convert_to_wav_default_output():
    with patch("app.services.audio_processor.subprocess.run") as mock_run:
        from app.services.audio_processor import convert_to_wav

        result = convert_to_wav("/tmp/audio.mp3")

        assert result == "/tmp/audio.wav"
        mock_run.assert_called_once()


def test_get_media_duration_uses_ffprobe():
    with patch("app.services.audio_processor.subprocess.run") as mock_run:
        mock_run.return_value.stdout = "12.345\n"
        from app.services.audio_processor import get_media_duration

        result = get_media_duration("/tmp/narration.mp3")

        assert result == 12.345
        mock_run.assert_called_once_with(
            [
                "ffprobe",
                "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                "/tmp/narration.mp3",
            ],
            check=True,
            capture_output=True,
            text=True,
        )
