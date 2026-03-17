import { useState, useEffect, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

export const LANGUAGES_V2 = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिंदी" },
  { code: "ta", name: "தமிழ்" },
  { code: "bn", name: "বাংলা" },
  { code: "te", name: "తెలుగు" },
  { code: "pa", name: "ਪੰਜਾਬੀ" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "ml", name: "മലയാളം" },
  { code: "mr", name: "मराठी" },
  { code: "gu", name: "ગુજરાતી" },
];

export interface ChatMessageV2 {
  id: string;
  role: "user" | "assistant";
  message: string;
  timestamp: string;
  module?: "legal" | "kisan" | "yojana" | "general";
  streaming?: boolean;
}

const STORAGE_KEY_MESSAGES = "swadhikar_v2_messages";
const STORAGE_KEY_SESSION = "swadhikar_v2_session_id";
const STORAGE_KEY_LANGUAGE = "swadhikar_v2_language";

function loadMessagesFromStorage(): ChatMessageV2[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (!raw) return [];
    return JSON.parse(raw) as ChatMessageV2[];
  } catch {
    return [];
  }
}

function saveMessagesToStorage(messages: ChatMessageV2[]) {
  try {
    // Only save finalized messages (not streaming)
    const toSave = messages.filter((m) => !m.streaming);
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(toSave));
  } catch {
    // Ignore storage errors
  }
}

export function useChatV2() {
  const [sessionId, setSessionId] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY_SESSION);
    if (stored) return stored;
    const newId = uuidv4();
    localStorage.setItem(STORAGE_KEY_SESSION, newId);
    return newId;
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_LANGUAGE) || "en";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LANGUAGE, language);
  }, [language]);

  const [messages, setMessages] = useState<ChatMessageV2[]>(() => loadMessagesFromStorage());
  const [isTyping, setIsTyping] = useState(false);

  // Save messages to localStorage whenever they change (excluding streaming ones)
  useEffect(() => {
    saveMessagesToStorage(messages);
  }, [messages]);

  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessageV2 = {
      id: uuidv4(),
      role: "user",
      message: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    const streamingId = uuidv4();
    const streamingMsg: ChatMessageV2 = {
      id: streamingId,
      role: "assistant",
      message: "",
      timestamp: new Date().toISOString(),
      streaming: true,
    };
    setMessages((prev) => [...prev, streamingMsg]);

    abortRef.current = new AbortController();

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          message: text.trim(),
          language,
          sessionId,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalModule: ChatMessageV2["module"] = "general";
      let finalTimestamp = new Date().toISOString();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const json = JSON.parse(line.slice(6));
            if (json.done) {
              finalModule = json.module ?? "general";
              finalTimestamp = json.timestamp ?? new Date().toISOString();
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamingId
                    ? { ...m, streaming: false, module: finalModule, timestamp: finalTimestamp }
                    : m
                )
              );
            } else if (json.content) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamingId
                    ? { ...m, message: m.message + json.content }
                    : m
                )
              );
            }
          } catch {
            // skip
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Chat V2 error:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingId
            ? {
                ...m,
                message: "Sorry, I'm having trouble connecting right now. Please try again.",
                streaming: false,
                module: "general" as const,
              }
            : m
        )
      );
    } finally {
      setIsTyping(false);
      abortRef.current = null;
    }
  }, [language, sessionId, isTyping]);

  const clearChat = useCallback(() => {
    // Abort any in-progress stream
    abortRef.current?.abort();
    setIsTyping(false);
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY_MESSAGES);
    // Generate a new session ID so history doesn't bleed over
    const newId = uuidv4();
    localStorage.setItem(STORAGE_KEY_SESSION, newId);
    setSessionId(newId);
  }, []);

  return {
    sessionId,
    language,
    setLanguage,
    messages,
    isTyping,
    sendMessage,
    clearChat,
  };
}
