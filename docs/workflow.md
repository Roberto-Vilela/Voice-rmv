# Workflow

The narration pipeline follows these steps:

1. **Input** — text, YouTube URL, audio file, or video file
2. **Download / Extract** — yt-dlp downloads videos; ffmpeg extracts audio
3. **Transcribe** — faster-whisper converts speech to text with timestamps
4. **Synthesize** — edge-tts generates narrated audio from the transcript
5. **Deliver** — audio file is served via the output endpoint

## Task Lifecycle

```
pending → processing → completed
                   ↘ error
```
