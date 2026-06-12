from unittest.mock import patch

import pytest


class TestExtractAudio:
    def test_calls_ffmpeg_with_correct_args(self):
        with patch("src.utils.audio_processor.subprocess.run") as mock_run:
            from src.utils.audio_processor import extract_audio

            result = extract_audio("/path/video.mp4")

            mock_run.assert_called_once()
            args = mock_run.call_args[0][0]
            assert "ffmpeg" in args[0]
            assert "/path/video.mp4" in args
            assert result == "/path/video.wav"

    def test_default_output_path(self):
        with patch("src.utils.audio_processor.subprocess.run") as mock_run:
            from src.utils.audio_processor import extract_audio

            result = extract_audio("/path/video.mp4")
            assert result == "/path/video.wav"


class TestConvertToWav:
    def test_calls_ffmpeg(self):
        with patch("src.utils.audio_processor.subprocess.run") as mock_run:
            from src.utils.audio_processor import convert_to_wav

            result = convert_to_wav("/path/audio.mp3")

            mock_run.assert_called_once()
            args = mock_run.call_args[0][0]
            assert "ffmpeg" in args[0]
            assert "/path/audio.mp3" in args
            assert result == "/path/audio.wav"

    def test_default_output_path(self):
        with patch("src.utils.audio_processor.subprocess.run"):
            from src.utils.audio_processor import convert_to_wav

            result = convert_to_wav("/path/audio.mp3")
            assert result == "/path/audio.wav"


class TestGetMediaDuration:
    def test_uses_ffprobe(self):
        mock_run = patch("src.utils.audio_processor.subprocess.run").start()
        mock_run.return_value.stdout = "123.45\n"

        from src.utils.audio_processor import get_media_duration

        result = get_media_duration("/path/audio.wav")
        assert result == 123.45

        mock_run.assert_called_once()
        args = mock_run.call_args[0][0]
        assert "ffprobe" in args[0]
