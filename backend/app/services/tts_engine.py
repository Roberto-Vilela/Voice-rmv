import edge_tts
import inspect


async def synthesize(text: str, voice: str = "en-US-AriaNeural") -> bytes:
    communicate = edge_tts.Communicate(text, voice)
    audio = b""
    stream = communicate.stream()
    if inspect.isawaitable(stream):
        stream = await stream
    async for chunk in stream:
        if chunk["type"] == "audio":
            audio += chunk["data"]
    return audio


async def list_voices() -> list[dict]:
    voices = await edge_tts.list_voices()
    return [
        {"name": v["ShortName"], "locale": v["Locale"], "gender": v["Gender"]}
        for v in voices
    ]
