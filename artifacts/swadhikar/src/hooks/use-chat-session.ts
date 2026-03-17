import { useState, useEffect, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिंदी" },
  { code: "ta", name: "தமிழ்" },
  { code: "bn", name: "বাংলা" },
  { code: "te", name: "తెలుగు" },
  { code: "pa", name: "ਪੰਜਾਬੀ" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "ml", name: "മലയാളം" },
  { code: "mr", name: "मराठी" },
  { code: "gu", name: "ગુજરાతી" },
];

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  message: string;
  timestamp: string;
  module?: "legal" | "kisan" | "yojana" | "general";
  streaming?: boolean;
}

const LS_MESSAGES = "swadhikar_messages";
const LS_SESSION  = "swadhikar_session_id";
const LS_LANGUAGE = "swadhikar_language";

function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(LS_MESSAGES);
    if (!raw) return [];
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [];
  }
}

function saveMessages(msgs: ChatMessage[]) {
  try {
    localStorage.setItem(LS_MESSAGES, JSON.stringify(msgs.filter((m) => !m.streaming)));
  } catch { /* ignore */ }
}

export function useChatSession() {
  const [sessionId, setSessionId] = useState(() => {
    const stored = localStorage.getItem(LS_SESSION);
    if (stored) return stored;
    const newId = uuidv4();
    localStorage.setItem(LS_SESSION, newId);
    return newId;
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem(LS_LANGUAGE) || "en";
  });

  useEffect(() => {
    localStorage.setItem(LS_LANGUAGE, language);
  }, [language]);

  const [messages, setMessages] = useState<ChatMessage[]>(() => loadMessages());
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Persist messages to localStorage on every change
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: "user",
      message: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    const streamingId = uuidv4();
    const streamingMsg: ChatMessage = {
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
      let finalModule: ChatMessage["module"] = "general";
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
            // skip malformed SSE lines
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Chat error:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingId
            ? {
                ...m,
                message: "Sorry, I'm having trouble connecting right now. Please try again.",
                streaming: false,
                module: "general",
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
    abortRef.current?.abort();
    setIsTyping(false);
    setMessages([]);
    localStorage.removeItem(LS_MESSAGES);
    const newId = uuidv4();
    localStorage.setItem(LS_SESSION, newId);
    setSessionId(newId);
  }, []);

  return {
    sessionId,
    language,
    setLanguage,
    messages,
    isLoadingHistory,
    isTyping,
    sendMessage,
    clearChat,
  };
}
