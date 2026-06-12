# Sample Input

## Text

```text
Artificial intelligence is transforming how we interact with technology.
From virtual assistants to autonomous vehicles, the impact is profound.
```

## YouTube URL

```
https://youtube.com/watch?v=dQw4w9WgXcQ
```

## API Usage

```bash
curl -X POST http://localhost:8456/api/narrate/text \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"text": "Hello, world!", "voice": "en-US-AriaNeural"}'
```
