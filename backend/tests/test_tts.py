from unittest.mock import AsyncMock, patch

import pytest


@pytest.mark.asyncio
async def test_synthesize_returns_bytes():
    mock_communicate = AsyncMock()
    mock_communicate.stream.return_value.__aiter__.return_value = [
        {"type": "audio", "data": b"chunk1"},
        {"type": "audio", "data": b"chunk2"},
        {"type": "text", "data": ""},
    ]

    with patch("app.services.tts_engine.edge_tts.Communicate", return_value=mock_communicate):
        from app.services.tts_engine import synthesize

        result = await synthesize("Olá mundo", "pt-BR-FranciscaNeural")

        assert result == b"chunk1chunk2"
        mock_communicate.stream.assert_awaited_once()


@pytest.mark.asyncio
async def test_synthesize_empty_text():
    mock_communicate = AsyncMock()
    mock_communicate.stream.return_value.__aiter__.return_value = []

    with patch("app.services.tts_engine.edge_tts.Communicate", return_value=mock_communicate):
        from app.services.tts_engine import synthesize

        result = await synthesize("", "pt-BR-FranciscaNeural")

        assert result == b""


@pytest.mark.asyncio
async def test_list_voices_returns_formatted_list():
    raw_voices = [
        {"ShortName": "pt-BR-FranciscaNeural", "Locale": "pt-BR", "Gender": "Female", "LocalName": "Francisca"},
        {"ShortName": "pt-BR-AntonioNeural", "Locale": "pt-BR", "Gender": "Male", "LocalName": "Antônio"},
    ]

    with patch("app.services.tts_engine.edge_tts.list_voices", new_callable=AsyncMock) as mock:
        mock.return_value = raw_voices
        from app.services.tts_engine import list_voices

        result = await list_voices()

        assert result == [
            {"name": "pt-BR-FranciscaNeural", "locale": "pt-BR", "gender": "Female"},
            {"name": "pt-BR-AntonioNeural", "locale": "pt-BR", "gender": "Male"},
        ]
