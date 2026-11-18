# Local translation setup

Translation uses a dedicated CPU-only TranslateGemma process. It does not need the LM Studio daemon or change other loaded models.

1. Install a CPU `llama-server` backend and an existing TranslateGemma GGUF model.
2. Create `.env.translation` in the project root (ignored by Git):

   ```dotenv
   TRANSLATION_MODEL_PATH=/absolute/path/to/translategemma-4b-it.Q4_K_M.gguf
   # Optional if llama-server is not on PATH or installed as an LM Studio CPU backend:
   # TRANSLATION_LLAMA_SERVER=/absolute/path/to/llama-server
   ```

3. From the project root, run:

   ```bash
   bash scripts/start-translation-server.sh
   ```

The script loads `.env` and `.env.translation`. With a user systemd manager, it starts the transient `voice-rmv-translation.service`; otherwise it uses nohup. Run the script again after a reboot. Local overrides in `.env.translation` must use the same controller token as the API's `TRANSLATION_CONTROLLER_TOKEN`.

The controller listens on port 11436 and starts the model on demand on port 11437. The default idle timeout is 600 seconds. Host ports must be reachable from the API container via `host.docker.internal`. The provider screen reads the API's effective configuration at `GET /api/translate/config`; it does not report model readiness.

The model runs with `--n-gpu-layers 0`, alias `translategemma-4b-cpu`, and the Gemma conversation template. An occupied model port produces an error; the controller never kills unrelated processes.

Logs and status:

```bash
tail -n 50 /tmp/voice-rmv-translation-controller.log
systemctl --user status voice-rmv-translation.service
```

After changing controller code, restart it and wait for the startup script's readiness check:

```bash
systemctl --user restart voice-rmv-translation.service
bash scripts/start-translation-server.sh
```

First translation can take longer while loading the GGUF file. If it fails, inspect logs for missing paths, permissions, a port conflict, or a model startup error. No model is downloaded automatically.
