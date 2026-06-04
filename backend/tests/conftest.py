from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def mock_synthesize():
    with patch("app.routers.narrate.synthesize", new_callable=AsyncMock) as mock:
        mock.return_value = b"fake_audio_bytes"
        yield mock


@pytest.fixture
def mock_celery_delay():
    with patch(
        "app.routers.narrate.narrate_video_url_task.delay",
        new_callable=MagicMock,
    ) as mock:
        yield mock


def _set_default_task_attrs(task):
    """Preenche atributos que seriam setados pelo banco (created_at, id)."""
    import uuid

    if task.id is None:
        task.id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    task.created_at = now
    task.updated_at = now
    if task.status == "pending":
        task.progress = 0


@pytest.fixture
def mock_db_session():
    session = AsyncMock()
    session.add = MagicMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock(side_effect=_set_default_task_attrs)

    # Mock para execute (usado por GET /tasks)
    task_mock = MagicMock()
    task_mock.id = "11111111-1111-1111-1111-111111111111"
    task_mock.type = "text"
    task_mock.status = "completed"
    task_mock.progress = 100
    task_mock.voice = "pt-BR-FranciscaNeural"
    task_mock.input_text = "test"
    task_mock.input_url = None
    task_mock.input_file = None
    task_mock.transcription = "texto transcrito"
    task_mock.audio_path = "/tmp/output/narrations/audio.mp3"
    task_mock.duration_seconds = 3.0
    task_mock.error = None
    task_mock.created_at = datetime.now(timezone.utc)
    task_mock.updated_at = datetime.now(timezone.utc)

    result_mock = MagicMock()
    result_mock.scalar_one_or_none.return_value = task_mock
    result_mock.scalars.return_value.all.return_value = [task_mock]
    session.execute = AsyncMock(return_value=result_mock)

    return session


@pytest.fixture(autouse=True)
def override_get_db(mock_db_session):
    with (
        patch("app.routers.narrate.get_db") as mock_narrate_db,
        patch("app.routers.history.get_db") as mock_history_db,
    ):
        mock_narrate_db.return_value.__aenter__.return_value = mock_db_session
        mock_history_db.return_value.__aenter__.return_value = mock_db_session
        yield


@pytest.fixture
def mock_transcriber():
    with patch("app.services.transcriber.transcribe") as mock:
        mock.return_value = {
            "text": "texto transcrito",
            "segments": [{"start": 0.0, "end": 1.0, "text": "texto transcrito"}],
            "duration": 2.5,
            "language": "pt",
        }
        yield mock
