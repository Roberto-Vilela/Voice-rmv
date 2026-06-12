from unittest.mock import AsyncMock, patch

import pytest

from app.models.schemas import TranslationSegment


@pytest.mark.asyncio
async def test_translate_segments():
    segments = [TranslationSegment(id="seg-0", text="Hello world")]
    mock_translated = [TranslationSegment(id="seg-0", text="Olá mundo")]

    with patch("src.utils.translator.translate_segments", new_callable=AsyncMock) as mock:
        mock.return_value = mock_translated
        from src.utils.translator import translate_segments

        result = await translate_segments(segments, "en", "pt-BR")

        assert result == mock_translated


def test_translate_response_formats_segments():
    from app.routers.translate import _response

    segments = [TranslationSegment(id="seg-0", text="Olá mundo")]
    result = _response(segments)

    assert result.segments == segments
    assert result.translated_text == "Olá mundo"


def test_translate_returns_actionable_controller_error():
    from src.utils.translator import TranslationError

    err = TranslationError("Translation model controller failed: 503 Service Unavailable")
    assert "Translation model controller failed" in str(err)


@pytest.mark.asyncio
async def test_translate_rejects_empty_segments():
    from src.utils.translator import translate_segments

    result = await translate_segments([], "en", "pt-BR")
    assert result == []
