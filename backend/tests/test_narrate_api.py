import pytest


class TestHealth:
    async def test_health_returns_ok(self, client):
        resp = await client.get("/api/health")
        assert resp.status_code == 200
        assert resp.json() == {"status": "ok"}


class TestVoices:
    async def test_voices_returns_list(self, client):
        resp = await client.get("/api/voices")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


class TestNarrateText:
    async def test_narrate_text_success(self, client, mock_text_task_delay):
        resp = await client.post(
            "/api/narrate/text",
            json={"text": "Olá mundo", "voice": "en-US-AriaNeural"},
        )

        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "pending"
        assert data["progress"] == 0
        assert data["input_text"] == "Olá mundo"
        assert data["voice"] == "en-US-AriaNeural"
        assert data["type"] == "text"
        assert data["audio_url"] is None
        assert data["error"] is None
        mock_text_task_delay.assert_called_once_with(
            "Olá mundo", "en-US-AriaNeural", data["id"], 1.0, 0, 1.0
        )

    async def test_narrate_text_default_voice(self, client, mock_text_task_delay):
        resp = await client.post(
            "/api/narrate/text",
            json={"text": "teste"},
        )

        assert resp.status_code == 200
        data = resp.json()
        assert data["voice"] == "en-US-AriaNeural"
        mock_text_task_delay.assert_called_once()

    async def test_narrate_text_synthesize_error(self, client, mock_text_task_delay):
        mock_text_task_delay.side_effect = RuntimeError("Celery error")

        with pytest.raises(RuntimeError, match="Celery error"):
            await client.post(
                "/api/narrate/text",
                json={"text": "teste"},
            )


class TestNarrateVideoUrl:
    async def test_narrate_video_url_returns_pending(self, client, mock_celery_delay):
        resp = await client.post(
            "/api/narrate/video-url",
            json={
                "url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
                "voice": "en-US-AriaNeural",
            },
        )

        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "pending"
        assert data["input_url"] == "https://youtube.com/watch?v=dQw4w9WgXcQ"
        assert data["type"] == "video_url"
        mock_celery_delay.assert_called_once()

    async def test_narrate_video_url_default_voice(self, client, mock_celery_delay):
        resp = await client.post(
            "/api/narrate/video-url",
            json={"url": "https://youtube.com/watch?v=test"},
        )

        assert resp.status_code == 200
        assert resp.json()["voice"] == "en-US-AriaNeural"


class TestNarrateUpload:
    async def test_upload_audio_file(self, client):
        resp = await client.post(
            "/api/narrate/upload",
            data={"voice": "en-US-AriaNeural"},
            files={"file": ("audio.mp3", b"fake audio content", "audio/mpeg")},
        )

        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "pending"
        assert data["input_file"] == "audio.mp3"
        assert data["type"] == "audio_upload"

    async def test_upload_video_file(self, client):
        resp = await client.post(
            "/api/narrate/upload",
            data={"voice": "en-US-AriaNeural"},
            files={"file": ("video.mp4", b"fake video content", "video/mp4")},
        )

        assert resp.status_code == 200
        data = resp.json()
        assert data["type"] == "video_upload"
        assert data["input_file"] == "video.mp4"

    async def test_upload_without_voice_uses_default(self, client):
        resp = await client.post(
            "/api/narrate/upload",
            files={"file": ("audio.wav", b"fake", "audio/wav")},
        )

        assert resp.status_code == 200
        assert resp.json()["voice"] == "en-US-AriaNeural"


class TestGetTask:
    async def test_get_task_found(self, client):
        resp = await client.get("/api/tasks/11111111-1111-1111-1111-111111111111")

        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == "11111111-1111-1111-1111-111111111111"
        assert data["status"] == "completed"

    async def test_get_task_not_found(self, client, mock_db_session):
        mock_db_session.execute.return_value.scalar_one_or_none.return_value = None

        resp = await client.get("/api/tasks/22222222-2222-2222-2222-222222222222")

        assert resp.status_code == 404
        assert resp.json()["detail"] == "Task not found"


class TestListTasks:
    async def test_list_tasks(self, client):
        resp = await client.get("/api/tasks")

        assert resp.status_code == 200
        data = resp.json()
        assert "tasks" in data
        assert "total" in data


class TestPatchTask:
    async def test_patch_task_can_clear_source_fields(self, client, mock_db_session):
        task = mock_db_session.execute.return_value.scalar_one_or_none.return_value
        task.input_file = "video.mp4"
        task.input_url = "https://youtube.com/watch?v=test"
        task.audio_path = "/tmp/output/narrations/audio.mp3"
        task.extra_data = {"display_name": "Original title", "keep": "value"}

        resp = await client.patch(
            "/api/tasks/11111111-1111-1111-1111-111111111111",
            json={
                "transcription": "",
                "input_file": None,
                "input_url": None,
                "audio_path": None,
                "extra_data": {"display_name": ""},
            },
        )

        assert resp.status_code == 200
        assert task.transcription == ""
        assert task.input_file is None
        assert task.input_url is None
        assert task.audio_path is None
        assert task.extra_data == {"display_name": "", "keep": "value"}
        mock_db_session.commit.assert_awaited()
