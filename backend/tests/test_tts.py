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

        result = await synthesize("Olá mundo", "en-US-AriaNeural")

        assert result == b"chunk1chunk2"
        mock_communicate.stream.assert_awaited_once()


@pytest.mark.asyncio
async def test_synthesize_empty_text():
    mock_communicate = AsyncMock()
    mock_communicate.stream.return_value.__aiter__.return_value = []

    with patch("app.services.tts_engine.edge_tts.Communicate", return_value=mock_communicate):
        from app.services.tts_engine import synthesize

        result = await synthesize("", "en-US-AriaNeural")

        assert result == b""


@pytest.mark.asyncio
async def test_synthesize_with_timing_returns_word_boundaries():
    mock_communicate = AsyncMock()
    mock_communicate.stream.return_value.__aiter__.return_value = [
        {"type": "audio", "data": b"audio"},
        {
            "type": "WordBoundary",
            "offset": 5_000_000,
            "duration": 2_500_000,
            "text": "Olá",
        },
    ]

    with patch("app.services.tts_engine.edge_tts.Communicate", return_value=mock_communicate):
        from app.services.tts_engine import synthesize_with_timing

        result = await synthesize_with_timing("Olá", "pt-BR-FranciscaNeural")

        assert result == {
            "audio": b"audio",
            "word_boundaries": [{"text": "Olá", "start": 0.5, "end": 0.75}],
        }


def test_build_narration_segments_uses_tts_timeline():
    from app.services.tts_engine import build_narration_segments

    result = build_narration_segments(
        [
            {"start": 0.0, "end": 0.8, "text": "Frase curta."},
            {"start": 0.8, "end": 2.0, "text": "Outra frase maior."},
        ],
        [
            {"text": "Frase", "start": 0.2, "end": 0.5},
            {"text": "curta", "start": 0.5, "end": 0.9},
            {"text": "Outra", "start": 1.1, "end": 1.5},
            {"text": "frase", "start": 1.5, "end": 1.9},
            {"text": "maior", "start": 1.9, "end": 2.4},
        ],
        narration_duration=2.7,
    )

    assert result == [
        {"start": 0.2, "end": 1.1, "text": "Frase curta."},
        {"start": 1.1, "end": 2.7, "text": "Outra frase maior."},
    ]


@pytest.mark.asyncio
async def test_list_voices_returns_formatted_list():
    raw_voices = [
        {"ShortName": "en-US-AriaNeural", "Locale": "en-US", "Gender": "Female", "LocalName": "Aria"},
        {"ShortName": "pt-BR-AntonioNeural", "Locale": "pt-BR", "Gender": "Male", "LocalName": "Antônio"},
    ]

    with patch("app.services.tts_engine.edge_tts.list_voices", new_callable=AsyncMock) as mock:
        mock.return_value = raw_voices
        from app.services.tts_engine import list_voices

        result = await list_voices()

        assert result == [
            {"name": "en-US-AriaNeural", "locale": "en-US", "gender": "Female"},
            {"name": "pt-BR-AntonioNeural", "locale": "pt-BR", "gender": "Male"},
        ]
