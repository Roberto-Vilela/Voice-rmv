from unittest.mock import MagicMock, patch

import pytest


def test_download_video_returns_correct_structure():
    mock_ydl = MagicMock()
    mock_ydl.__enter__.return_value = mock_ydl
    mock_ydl.extract_info.return_value = {
        "id": "abc123",
        "title": "Test Video",
        "duration": 120,
    }
    mock_ydl.prepare_filename.return_value = "/tmp/video/abc123.mp4"

    with patch("app.services.video_downloader.yt_dlp.YoutubeDL", return_value=mock_ydl):
        from app.services.video_downloader import download_video

        result = download_video("https://example.com/video", "/tmp/video")

        assert result["file_path"] == "/tmp/video/abc123.mp4"
        assert result["title"] == "Test Video"
        assert result["duration"] == 120


def test_download_video_calls_extract_info():
    mock_ydl = MagicMock()
    mock_ydl.__enter__.return_value = mock_ydl
    mock_ydl.extract_info.return_value = {"id": "abc123", "title": "", "duration": 0}
    mock_ydl.prepare_filename.return_value = "/tmp/video/abc123.mp4"

    with patch("app.services.video_downloader.yt_dlp.YoutubeDL", return_value=mock_ydl):
        from app.services.video_downloader import download_video

        download_video("https://youtube.com/watch?v=test", "/tmp/video")

        mock_ydl.extract_info.assert_called_once_with(
            "https://youtube.com/watch?v=test", download=True
        )


def test_download_video_fallback_ext():
    mock_ydl = MagicMock()
    mock_ydl.__enter__.return_value = mock_ydl
    mock_ydl.extract_info.return_value = {
        "id": "abc123",
        "title": "Test",
        "duration": 60,
    }
    mock_ydl.prepare_filename.return_value = "/tmp/video/abc123.webm"

    with patch("app.services.video_downloader.yt_dlp.YoutubeDL", return_value=mock_ydl):
        from app.services.video_downloader import download_video

        result = download_video("https://example.com/v", "/tmp/video")

        assert result["file_path"] == "/tmp/video/abc123.mp4"


def test_download_video_progress_hook():
    progress_values = []

    def on_progress(value):
        progress_values.append(value)

    mock_ydl = MagicMock()
    mock_ydl.__enter__.return_value = mock_ydl
    mock_ydl.extract_info.return_value = {"id": "abc123", "title": "", "duration": 0}
    mock_ydl.prepare_filename.return_value = "/tmp/video/abc123.mp4"

    with patch("app.services.video_downloader.yt_dlp.YoutubeDL", return_value=mock_ydl):
        from app.services.video_downloader import download_video

        download_video("https://example.com/v", "/tmp/video", on_progress=on_progress)

        opts = mock_ydl.call_args[0][0]
        hook = opts["progress_hooks"][0]

        hook({"status": "downloading", "total_bytes": 100, "downloaded_bytes": 50})

        assert progress_values == [50]
