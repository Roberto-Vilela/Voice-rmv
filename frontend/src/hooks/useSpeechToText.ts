import { useEffect, useRef, useState } from "react";

function detectPreferredDictationLanguage(): string {
  const locale = (navigator.language || "").toLowerCase();
  if (locale.startsWith("pt")) return "pt-BR";
  if (locale.startsWith("en")) return "en-US";
  return "pt-BR";
}

export function useSpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [dictationError, setDictationError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const isSupported = !!(navigator.mediaDevices?.getUserMedia);

  const start = async (theme = "outros", useGpu = false) => {
    if (!isSupported) return;

    setDictationError(null);
    setTranscript("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        setIsProcessing(true);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        const form = new FormData();
        const preferredLanguage = detectPreferredDictationLanguage();
        form.append("file", blob, "recording.webm");
        form.append("theme", theme);
        form.append("use_gpu", String(useGpu));
        form.append("language", preferredLanguage);

        try {
          const res = await fetch("/api/transcribe", { method: "POST", body: form });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.detail || `Transcription failed (${res.status})`);
          }
          const data = await res.json();
          setTranscript(data.text);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Transcription failed";
          setDictationError(msg);
          setTranscript("");
        } finally {
          setIsProcessing(false);
          stream.getTracks().forEach((t) => t.stop());
        }
      };

      recorder.start();
      setIsListening(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Microphone access denied";
      setDictationError(msg);
    }
  };

  const stop = () => {
    mediaRecorderRef.current?.stop();
    setIsListening(false);
  };

  const clearError = () => setDictationError(null);

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { isListening, transcript, isProcessing, dictationError, start, stop, clearError, isSupported };
}
