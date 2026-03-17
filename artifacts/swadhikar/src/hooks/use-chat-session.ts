import { useState, useEffect, useCallback } from "react";
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
  { code: "gu", name: "ગુજરાતી" },
];

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  message: string;
  timestamp: string;
  module?: "legal" | "kisan" | "yojana" | "general";
  streaming?: boolean;
}

export function useChatSession() {
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem("swadhikar_session_id");
    if (stored) return stored;
    const newId = uuidv4();
    localStorage.setItem("swadhikar_session_id", newId);
    return newId;
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("swadhikar_language") || "en";
  });

  useEffect(() => {
    localStorage.setItem("swadhikar_language", language);
  }, [language]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/history?sessionId=${encodeURIComponent(sessionId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.messages?.length > 0) {
          setMessages(data.messages);
        }
      }
    } catch {
      // silently ignore
    }
  }, [sessionId]);

  useEffect(() => {
    setIsLoadingHistory(true);
    fetchHistory().finally(() => setIsLoadingHistory(false));
  }, [fetchHistory]);

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

    // Create a placeholder streaming message
    const streamingId = uuidv4();
    const streamingMsg: ChatMessage = {
      id: streamingId,
      role: "assistant",
      message: "",
      timestamp: new Date().toISOString(),
      streaming: true,
    };
    setMessages((prev) => [...prev, streamingMsg]);

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
              // Finalize streaming message
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamingId
                    ? { ...m, streaming: false, module: finalModule, timestamp: finalTimestamp }
                    : m
                )
              );
            } else if (json.content) {
              // Append streamed text
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
    } catch (err) {
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
    }
  }, [language, sessionId, isTyping]);

  return {
    sessionId,
    language,
    setLanguage,
    messages,
    isLoadingHistory,
    isTyping,
    sendMessage,
  };
}
