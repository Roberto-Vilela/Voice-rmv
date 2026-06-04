import subprocess
from pathlib import Path


def extract_audio(video_path: str, output_path: str | None = None) -> str:
    video = Path(video_path)
    if output_path is None:
        output_path = video.with_suffix(".wav")

    subprocess.run(
        [
            "ffmpeg", "-i", str(video),
            "-vn", "-acodec", "pcm_s16le",
            "-ar", "16000", "-ac", "1",
            "-y", str(output_path),
        ],
        check=True, capture_output=True,
    )
    return str(output_path)


def convert_to_wav(input_path: str, output_path: str | None = None) -> str:
    inp = Path(input_path)
    if output_path is None:
        output_path = inp.with_suffix(".wav")

    subprocess.run(
        [
            "ffmpeg", "-i", str(inp),
            "-acodec", "pcm_s16le",
            "-ar", "16000", "-ac", "1",
            "-y", str(output_path),
        ],
        check=True, capture_output=True,
    )
    return str(output_path)
