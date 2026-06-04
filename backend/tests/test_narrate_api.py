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
    async def test_narrate_text_success(self, client, mock_synthesize):
        resp = await client.post(
            "/api/narrate/text",
            json={"text": "Olá mundo", "voice": "pt-BR-FranciscaNeural"},
        )

        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "completed"
        assert data["progress"] == 100
        assert data["input_text"] == "Olá mundo"
        assert data["voice"] == "pt-BR-FranciscaNeural"
        assert data["type"] == "text"
        assert data["audio_url"] is not None
        assert data["error"] is None
        mock_synthesize.assert_awaited_once_with("Olá mundo", "pt-BR-FranciscaNeural")

    async def test_narrate_text_default_voice(self, client, mock_synthesize):
        resp = await client.post(
            "/api/narrate/text",
            json={"text": "teste"},
        )

        assert resp.status_code == 200
        data = resp.json()
        assert data["voice"] == "pt-BR-FranciscaNeural"

    async def test_narrate_text_synthesize_error(self, client, mock_synthesize):
        mock_synthesize.side_effect = RuntimeError("Falha no TTS")

        resp = await client.post(
            "/api/narrate/text",
            json={"text": "teste"},
        )

        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "error"
        assert data["error"] == "Falha no TTS"


class TestNarrateVideoUrl:
    async def test_narrate_video_url_returns_pending(self, client, mock_celery_delay):
        resp = await client.post(
            "/api/narrate/video-url",
            json={
                "url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
                "voice": "pt-BR-FranciscaNeural",
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
        assert resp.json()["voice"] == "pt-BR-FranciscaNeural"


class TestNarrateUpload:
    async def test_upload_audio_file(self, client):
        resp = await client.post(
            "/api/narrate/upload",
            data={"voice": "pt-BR-FranciscaNeural"},
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
            data={"voice": "pt-BR-FranciscaNeural"},
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
        assert resp.json()["voice"] == "pt-BR-FranciscaNeural"


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
