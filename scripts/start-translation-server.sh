#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONTROLLER_PID_FILE="${TMPDIR:-/tmp}/voice-rmv-translation-controller.pid"
CONTROLLER_LOG_FILE="${TMPDIR:-/tmp}/voice-rmv-translation-controller.log"

# Local machine paths stay outside version control. This server does not need the LM Studio daemon.
if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a
  source "$ROOT_DIR/.env"
  set +a
fi
if [[ -f "$ROOT_DIR/.env.translation" ]]; then
  set -a
  source "$ROOT_DIR/.env.translation"
  set +a
fi

if command -v systemd-run >/dev/null && systemctl --user show-environment >/dev/null 2>&1; then
  if ! systemctl --user is-active --quiet voice-rmv-translation.service; then
    systemd-run --user --collect --unit=voice-rmv-translation \
      --property=Restart=on-failure \
      --property="EnvironmentFile=-$ROOT_DIR/.env" \
      --property="EnvironmentFile=-$ROOT_DIR/.env.translation" \
      --property="StandardOutput=append:$CONTROLLER_LOG_FILE" \
      --property="StandardError=append:$CONTROLLER_LOG_FILE" \
      --working-directory="$ROOT_DIR" \
      python3 -u "$ROOT_DIR/scripts/translation_model_controller.py"
  fi
elif [[ -f "$CONTROLLER_PID_FILE" ]] && kill -0 "$(cat "$CONTROLLER_PID_FILE")" 2>/dev/null; then
  echo "Translation controller already running with PID $(cat "$CONTROLLER_PID_FILE")."
  exit 0
else
  nohup python3 -u "$ROOT_DIR/scripts/translation_model_controller.py" \
    >"$CONTROLLER_LOG_FILE" 2>&1 &
  echo "$!" >"$CONTROLLER_PID_FILE"
fi

python3 - <<'PY'
import json, os, time, urllib.request
for _ in range(30):
    try:
        req = urllib.request.Request(
            f"http://127.0.0.1:{os.environ.get('TRANSLATION_CONTROLLER_PORT', '11436')}/status",
            headers={"Authorization": "Bearer " + os.environ.get("TRANSLATION_CONTROLLER_TOKEN", "voice-rmv-local-controller")},
        )
        with urllib.request.urlopen(req, timeout=1) as response:
            json.load(response)
        break
    except OSError:
        time.sleep(0.1)
else:
    raise SystemExit("Translation controller failed to start. Check /tmp/voice-rmv-translation-controller.log")
PY

echo "TranslateGemma API: http://localhost:11437/v1"
echo "CPU-only controller: http://localhost:11436"
echo "Controller log: $CONTROLLER_LOG_FILE"
