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
    mock_ydl.prepare_filename.return_value = "/tmp/abc123.mp4"

    with patch("src.utils.video_downloader.yt_dlp.YoutubeDL", return_value=mock_ydl):
        from src.utils.video_downloader import download_video

        result = download_video("https://youtube.com/watch?v=test", "/tmp")

        assert result == {
            "file_path": "/tmp/abc123.mp4",
            "title": "Test Video",
            "duration": 120,
        }


def test_download_video_calls_extract_info():
    mock_ydl = MagicMock()
    mock_ydl.__enter__.return_value = mock_ydl
    mock_ydl.extract_info.return_value = {"id": "abc123", "title": "Test", "duration": 60}
    mock_ydl.prepare_filename.return_value = "/tmp/abc123.mp4"

    with patch("src.utils.video_downloader.yt_dlp.YoutubeDL", return_value=mock_ydl) as mock_cls:
        from src.utils.video_downloader import download_video

        download_video("https://example.com/video", "/tmp")

        mock_cls.assert_called_once()
        mock_ydl.extract_info.assert_called_once_with("https://example.com/video", download=True)


def test_download_video_fallback_ext():
    mock_ydl = MagicMock()
    mock_ydl.__enter__.return_value = mock_ydl
    mock_ydl.extract_info.return_value = {"id": "abc123", "title": "Test", "duration": 60}
    mock_ydl.prepare_filename.return_value = "/tmp/abc123.webm"

    with patch("src.utils.video_downloader.yt_dlp.YoutubeDL", return_value=mock_ydl):
        from src.utils.video_downloader import download_video

        result = download_video("https://example.com/video", "/tmp")

        assert result["file_path"] == "/tmp/abc123.mp4"


def test_download_video_progress_hook():
    captured = []

    def on_progress(pct):
        captured.append(pct)

    mock_ydl = MagicMock()
    mock_ydl.__enter__.return_value = mock_ydl
    mock_ydl.extract_info.return_value = {"id": "abc123", "title": "Test", "duration": 60}
    mock_ydl.prepare_filename.return_value = "/tmp/abc123.mp4"

    with patch("src.utils.video_downloader.yt_dlp.YoutubeDL", return_value=mock_ydl) as mock_cls:
        from src.utils.video_downloader import download_video

        download_video("https://example.com/video", "/tmp", on_progress=on_progress)

        opts = mock_cls.call_args[0][0]
        hook = opts.get("progress_hooks", [None])[0]
        if hook:
            hook({"status": "downloading", "total_bytes": 100, "downloaded_bytes": 50})

        assert len(captured) == 1
        assert captured[0] == 50
