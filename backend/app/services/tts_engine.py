import edge_tts


async def synthesize(text: str, voice: str = "pt-BR-FranciscaNeural") -> bytes:
    communicate = edge_tts.Communicate(text, voice)
    audio = b""
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio += chunk["data"]
    return audio


async def list_voices() -> list[dict]:
    voices = await edge_tts.list_voices()
    return [
        {"name": v["ShortName"], "locale": v["Locale"], "gender": v["Gender"]}
        for v in voices
    ]
