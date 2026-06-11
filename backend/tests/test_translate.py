from unittest.mock import AsyncMock, patch

from app.models.schemas import TranslationSegment
from app.services.translator import TranslationError


async def test_translate_segments(client):
    translated = [
        TranslationSegment(id="segment-0", text="Ola, mundo."),
        TranslationSegment(id="segment-1", text="Como voce esta?"),
    ]
    with patch(
        "app.routers.translate.translate_segments",
        new=AsyncMock(return_value=translated),
    ) as mock_translate:
        response = await client.post(
            "/api/translate",
            json={
                "segments": [
                    {"id": "segment-0", "text": "Hello, world."},
                    {"id": "segment-1", "text": "How are you?"},
                ],
                "source_lang": "en",
                "target_lang": "pt-BR",
            },
        )

    assert response.status_code == 200
    assert response.json()["segments"] == [
        {"id": "segment-0", "text": "Ola, mundo."},
        {"id": "segment-1", "text": "Como voce esta?"},
    ]
    mock_translate.assert_awaited_once()


async def test_translate_task_persists_segments(client, mock_db_session):
    translated = [TranslationSegment(id="segment-0", text="Texto traduzido.")]
    with patch(
        "app.routers.translate.translate_segments",
        new=AsyncMock(return_value=translated),
    ):
        response = await client.post(
            "/api/translate-task/11111111-1111-1111-1111-111111111111",
            json={
                "segments": [{"id": "segment-0", "text": "Translated text."}],
                "source_lang": "en",
                "target_lang": "pt-BR",
            },
        )

    assert response.status_code == 200
    task = mock_db_session.execute.return_value.scalar_one_or_none.return_value
    assert task.extra_data["translation_segments"] == [
        {"id": "segment-0", "text": "Texto traduzido."}
    ]
    assert task.extra_data["translation_source"] == "en"
    mock_db_session.commit.assert_awaited()


async def test_translate_returns_actionable_controller_error(client):
    with patch(
        "app.routers.translate.translate_segments",
        new=AsyncMock(
            side_effect=TranslationError(
                "Translation model controller is unavailable. "
                "Run scripts/start-translation-server.sh on the host."
            )
        ),
    ):
        response = await client.post(
            "/api/translate",
            json={
                "segments": [{"id": "segment-0", "text": "Hello."}],
                "source_lang": "en",
                "target_lang": "pt-BR",
            },
        )

    assert response.status_code == 502
    assert "start-translation-server.sh" in response.json()["detail"]


async def test_translate_rejects_empty_segments(client):
    response = await client.post(
        "/api/translate",
        json={
            "segments": [],
            "source_lang": "en",
            "target_lang": "pt-BR",
        },
    )

    assert response.status_code == 422
