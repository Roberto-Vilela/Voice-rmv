#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONTROLLER_PID_FILE="${TMPDIR:-/tmp}/voice-rmv-translation-controller.pid"
CONTROLLER_LOG_FILE="${TMPDIR:-/tmp}/voice-rmv-translation-controller.log"

lms daemon up >/dev/null

if [[ -f "$CONTROLLER_PID_FILE" ]] && kill -0 "$(cat "$CONTROLLER_PID_FILE")" 2>/dev/null; then
  echo "Translation controller already running with PID $(cat "$CONTROLLER_PID_FILE")."
  exit 0
fi

nohup python3 "$ROOT_DIR/scripts/translation_model_controller.py" \
  >"$CONTROLLER_LOG_FILE" 2>&1 &
echo "$!" >"$CONTROLLER_PID_FILE"

echo "TranslateGemma API: http://localhost:11437/v1"
echo "CPU-only controller: http://localhost:11436"
echo "Controller log: $CONTROLLER_LOG_FILE"
