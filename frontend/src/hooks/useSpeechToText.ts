import { useEffect, useRef, useState } from "react";

function cleanTranscript(text: string): string {
  let cleaned = text.trim();
  // Remove hesitation fillers
  cleaned = cleaned.replace(/\b(?:uh|um|ah|hmm|éh|ahn)\b/gi, "");
  // Replace 3+ repeated letters at end of word with single
  cleaned = cleaned.replace(/(\w)\1{2,}\b/g, "$1");
  // Collapse multiple spaces
  cleaned = cleaned.replace(/\s+/g, " ");
  // Capitalize first letter
  if (cleaned) cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return cleaned.trim();
}

const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export function useSpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const lastFinalIndexRef = useRef(0);
  const isSupported = !!SpeechRecognition;

  const start = () => {
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "pt-BR";

    recognition.onresult = (event: any) => {
      let newFinal = "";
      for (let i = lastFinalIndexRef.current; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          newFinal += event.results[i][0].transcript;
          lastFinalIndexRef.current = i + 1;
        }
      }
      if (newFinal) {
        setTranscript(cleanTranscript(newFinal));
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    lastFinalIndexRef.current = 0;
    recognition.start();
    setIsListening(true);
  };

  const stop = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return { isListening, transcript, start, stop, isSupported };
}
