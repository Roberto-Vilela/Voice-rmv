#!/usr/bin/env python3
import json
import logging
import os
import signal
import socket
import subprocess
import threading
import time
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

logging.basicConfig(
    level=logging.DEBUG,
    format="[translation-controller] %(levelname)s %(message)s",
)
log = logging.getLogger("controller")

MODEL_PATH = os.environ.get(
    "TRANSLATION_MODEL_PATH",
    "/home/roberto_vilela/.lmstudio/models/mradermacher/"
    "translategemma-4b-it-GGUF/translategemma-4b-it.Q4_K_M.gguf",
)
LLAMA_SERVER = os.environ.get(
    "TRANSLATION_LLAMA_SERVER",
    "/tmp/.mount_LM-StugKWqsO/resources/app/.webpack/bin/extensions/"
    "backends/llama.cpp-linux-x86_64-avx2-2.20.1/llama-server",
)
TRANSLATION_API_PORT = int(os.environ.get("TRANSLATION_API_PORT", "11437"))
MODEL_IDENTIFIER = os.environ.get(
    "TRANSLATION_MODEL_IDENTIFIER",
    "translategemma-4b-cpu",
)
CONTROLLER_TOKEN = os.environ.get(
    "TRANSLATION_CONTROLLER_TOKEN",
    "voice-rmv-local-controller",
)
IDLE_TTL = int(os.environ.get("TRANSLATION_IDLE_TTL", "600"))
CONTEXT_LENGTH = int(os.environ.get("TRANSLATION_CONTEXT_LENGTH", "4096"))
HOST = os.environ.get("TRANSLATION_CONTROLLER_HOST", "0.0.0.0")
PORT = int(os.environ.get("TRANSLATION_CONTROLLER_PORT", "11436"))

_load_lock = threading.Lock()
_server_process: subprocess.Popen[str] | None = None
_last_request_time: float = time.monotonic()
_timer_thread: threading.Thread | None = None


def _start_server() -> None:
    global _server_process
    if _server_process is not None and _server_process.poll() is None:
        log.debug("Server already running, skipping start")
        return
    log.info("Starting llama-server...")
    # Force-kill any leftover process on the port
    try:
        subprocess.run(
            ["fuser", "-k", f"{TRANSLATION_API_PORT}/tcp"],
            capture_output=True,
            timeout=5,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass
    for i in range(20):
        try:
            with socket.create_connection(("127.0.0.1", TRANSLATION_API_PORT), timeout=0.5):
                log.debug("Port %d still in use, retrying (%d/20)", TRANSLATION_API_PORT, i + 1)
                time.sleep(0.5)
        except (OSError, socket.timeout):
            log.debug("Port %d is free", TRANSLATION_API_PORT)
            break
    _server_process = subprocess.Popen(
        [
            LLAMA_SERVER,
            "--model", MODEL_PATH,
            "--ctx-size", str(CONTEXT_LENGTH),
            "--port", str(TRANSLATION_API_PORT),
            "--host", "0.0.0.0",
            "--no-jinja",
            "--chat-template", "chatml",
            "--parallel", "1",
            "--no-warmup",
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def _stop_server() -> None:
    global _server_process
    if _server_process is None:
        log.debug("No server to stop")
        return
    proc = _server_process
    _server_process = None
    log.info("Stopping llama-server (PID %d)...", proc.pid)
    os.kill(proc.pid, signal.SIGTERM)
    try:
        proc.wait(timeout=10)
    except subprocess.TimeoutExpired:
        log.warning("Server did not respond to SIGTERM, sending SIGKILL")
        os.kill(proc.pid, signal.SIGKILL)
        proc.wait()
    log.debug("Process stopped, waiting for port release...")
    for i in range(20):
        if not _port_in_use("127.0.0.1", TRANSLATION_API_PORT):
            log.debug("Port %d released", TRANSLATION_API_PORT)
            return
        log.debug("Port %d still in use, waiting (%d/20)", TRANSLATION_API_PORT, i + 1)
        time.sleep(0.5)
    log.warning("Port %d still in use after 10s", TRANSLATION_API_PORT)


def _port_in_use(host: str, port: int) -> bool:
    try:
        with socket.create_connection((host, port), timeout=1):
            return True
    except (OSError, socket.timeout):
        return False


def _server_is_alive() -> bool:
    return _server_process is not None and _server_process.poll() is None


def _wait_for_server(host: str, port: int, timeout: float = 60.0) -> bool:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if not _server_is_alive():
            return False
        try:
            with socket.create_connection((host, port), timeout=2):
                break
        except (OSError, socket.timeout):
            time.sleep(0.5)
    else:
        return False

    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if not _server_is_alive():
            return False
        try:
            req = urllib.request.Request(
                f"http://{host}:{port}/v1/models",
                method="GET",
            )
            with urllib.request.urlopen(req, timeout=2) as resp:
                if resp.status == 200:
                    return True
        except (urllib.error.HTTPError, urllib.error.URLError, OSError):
            pass
        time.sleep(0.5)
    return False


def _schedule_ttl() -> None:
    global _timer_thread

    def _loop() -> None:
        global _last_request_time
        while True:
            time.sleep(5)
            with _load_lock:
                if _server_is_alive() and time.monotonic() - _last_request_time > IDLE_TTL:
                    _stop_server()

    if _timer_thread is not None and _timer_thread.is_alive():
        return
    _timer_thread = threading.Thread(target=_loop, daemon=True)
    _timer_thread.start()


def _touch_last_request() -> None:
    global _last_request_time
    _last_request_time = time.monotonic()


def ensure_model_loaded() -> dict[str, object]:
    with _load_lock:
        if _server_is_alive():
            log.debug("Model already loaded")
            _touch_last_request()
            return {"loaded": True, "loaded_now": False, "identifier": MODEL_IDENTIFIER}

        log.info("Model not loaded, starting server...")
        _touch_last_request()
        _start_server()
        log.debug("Waiting for server to become ready...")
        if not _wait_for_server("127.0.0.1", TRANSLATION_API_PORT):
            alive = _server_is_alive()
            log.error("Server failed to start (alive=%s)", alive)
            if alive:
                log.debug("Server started but not responding on port, stopping")
            _stop_server()
            raise RuntimeError(
                "Could not start TranslateGemma on CPU. "
                f"Server process alive={alive}. "
                "Check the llama-server binary and model path."
            )
        log.info("Server is ready")
        _schedule_ttl()
        return {"loaded": True, "loaded_now": True, "identifier": MODEL_IDENTIFIER}


class Handler(BaseHTTPRequestHandler):
    server_version = "VoiceRMVTranslationController/1.0"

    def _authorized(self) -> bool:
        return self.headers.get("Authorization") == f"Bearer {CONTROLLER_TOKEN}"

    def _send_json(self, status: int, payload: dict[str, object]) -> None:
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self) -> None:
        if not self._authorized():
            self._send_json(401, {"detail": "Unauthorized"})
            return
        if self.path != "/status":
            self._send_json(404, {"detail": "Not found"})
            return
        self._send_json(
            200,
            {
                "loaded": _server_is_alive(),
                "identifier": MODEL_IDENTIFIER,
                "device": "cpu",
                "idle_ttl": IDLE_TTL,
                "port": TRANSLATION_API_PORT,
            },
        )

    def do_POST(self) -> None:
        if not self._authorized():
            self._send_json(401, {"detail": "Unauthorized"})
            return
        if self.path != "/ensure":
            self._send_json(404, {"detail": "Not found"})
            return
        try:
            self._send_json(200, ensure_model_loaded())
        except (RuntimeError, subprocess.SubprocessError) as exc:
            self._send_json(503, {"detail": str(exc)})

    def log_message(self, format_string: str, *args: object) -> None:
        print(f"[translation-controller] {self.address_string()} {format_string % args}")


if __name__ == "__main__":
    print(
        f"Translation controller listening on {HOST}:{PORT}; "
        f"model={MODEL_IDENTIFIER}; device=cpu; ttl={IDLE_TTL}s; "
        f"api=0.0.0.0:{TRANSLATION_API_PORT}"
    )
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
