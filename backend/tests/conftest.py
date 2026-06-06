from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.routers.narrate import get_db as narrate_get_db
from app.routers.history import get_db as history_get_db


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
    task_mock.voice = "en-US-AriaNeural"
    task_mock.input_text = "test"
    task_mock.input_url = None
    task_mock.input_file = None
    task_mock.transcription = "texto transcrito"
    task_mock.audio_path = "/tmp/output/narrations/audio.mp3"
    task_mock.duration_seconds = 3.0
    task_mock.error = None
    task_mock.extra_data = None
    task_mock.created_at = datetime.now(timezone.utc)
    task_mock.updated_at = datetime.now(timezone.utc)

    result_mock = MagicMock()
    result_mock.scalar_one_or_none.return_value = task_mock
    result_mock.scalars.return_value.all.return_value = [task_mock]
    session.execute = AsyncMock(return_value=result_mock)

    return session


@pytest.fixture(autouse=True)
def override_get_db(mock_db_session):
    async def _get_db():
        yield mock_db_session

    app.dependency_overrides[narrate_get_db] = _get_db
    app.dependency_overrides[history_get_db] = _get_db
    yield
    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def mock_voice_listing():
    with patch(
        "app.main.list_voices",
        new=AsyncMock(return_value=[
            {"name": "en-US-AriaNeural", "locale": "en-US", "gender": "Female"},
            {"name": "en-US-AriaNeural", "locale": "en-US", "gender": "Female"},
        ]),
    ):
        yield


@pytest.fixture
def mock_transcriber():
    with patch("app.services.transcriber.transcribe") as mock:
        mock.return_value = {
            "text": "texto transcrito",
            "segments": [{"start": 0.0, "end": 1.0, "text": "texto transcrito"}],
            "duration": 2.5,
            "language": "en",
        }
        yield mock
