import { useState, useCallback, useRef, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  language?: string;
  disabled?: boolean;
}

// Map our language codes to BCP-47 locale tags for SpeechRecognition
const LANG_MAP: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  ta: "ta-IN",
  bn: "bn-IN",
  te: "te-IN",
  pa: "pa-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  mr: "mr-IN",
  gu: "gu-IN",
};

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export function VoiceInput({ onTranscript, language = "en", disabled = false }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    setIsSupported(supported);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();

    recognition.lang = LANG_MAP[language] || "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      if (transcript.trim()) {
        onTranscript(transcript.trim());
      }
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, language, onTranscript]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  if (!isSupported) {
    return (
      <button
        type="button"
        title="Voice input not supported in this browser"
        disabled
        className="p-3 text-muted-foreground/40 cursor-not-allowed flex-shrink-0"
      >
        <MicOff className="w-6 h-6" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      title={isListening ? "Stop listening" : "Speak your question"}
      className={cn(
        "p-3 flex-shrink-0 rounded-full transition-all",
        isListening
          ? "text-red-500 bg-red-50 animate-pulse scale-110"
          : "text-muted-foreground hover:text-primary hover:bg-primary/5",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
    </button>
  );
}

interface ListeningIndicatorProps {
  visible: boolean;
}

export function ListeningIndicator({ visible }: ListeningIndicatorProps) {
  if (!visible) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full text-red-600 text-xs font-semibold animate-pulse">
      <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
      Listening...
    </div>
  );
}
