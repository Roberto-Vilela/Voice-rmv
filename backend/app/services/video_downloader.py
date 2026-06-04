import yt_dlp


def download_video(url: str, output_dir: str, on_progress=None) -> dict:
    def progress_hook(d):
        if on_progress and d["status"] == "downloading":
            total = d.get("total_bytes") or d.get("total_bytes_estimate", 0)
            downloaded = d.get("downloaded_bytes", 0)
            if total:
                on_progress(int(downloaded / total * 100))

    opts = {
        "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "outtmpl": f"{output_dir}/%(id)s.%(ext)s",
        "quiet": True,
        "progress_hooks": [progress_hook] if on_progress else [],
    }

    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=True)
        file_path = ydl.prepare_filename(info)

        ext = "mp4"
        if not file_path.endswith(".mp4"):
            file_path = f"{output_dir}/{info['id']}.{ext}"

        return {
            "file_path": file_path,
            "title": info.get("title", ""),
            "duration": info.get("duration", 0),
        }
