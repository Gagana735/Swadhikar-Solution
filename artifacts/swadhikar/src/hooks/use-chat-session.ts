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

export interface ChatSession {
  id: string;
  startedAt: string;
  preview: string;
  messages: ChatMessage[];
}

const LS_CURRENT_MSGS = "swadhikar_messages";
const LS_SESSION_ID   = "swadhikar_session_id";
const LS_LANGUAGE     = "swadhikar_language";
const LS_HISTORY      = "swadhikar_history";

function loadCurrentMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(LS_CURRENT_MSGS);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch { return []; }
}

function saveCurrentMessages(msgs: ChatMessage[]) {
  try {
    localStorage.setItem(LS_CURRENT_MSGS, JSON.stringify(msgs.filter((m) => !m.streaming)));
  } catch { /* ignore */ }
}

export function loadHistory(): ChatSession[] {
  try {
    const raw = localStorage.getItem(LS_HISTORY);
    return raw ? (JSON.parse(raw) as ChatSession[]) : [];
  } catch { return []; }
}

function saveHistory(sessions: ChatSession[]) {
  try {
    localStorage.setItem(LS_HISTORY, JSON.stringify(sessions));
  } catch { /* ignore */ }
}

function archiveCurrentSession(sessionId: string, messages: ChatMessage[]) {
  const userMsgs = messages.filter((m) => m.role === "user" && !m.streaming);
  if (userMsgs.length === 0) return;

  const preview = userMsgs[0].message.slice(0, 80);
  const startedAt = messages[0]?.timestamp ?? new Date().toISOString();

  const sessions = loadHistory();
  const existing = sessions.findIndex((s) => s.id === sessionId);
  const entry: ChatSession = {
    id: sessionId,
    startedAt,
    preview,
    messages: messages.filter((m) => !m.streaming),
  };

  if (existing >= 0) {
    sessions[existing] = entry;
  } else {
    sessions.unshift(entry);
  }

  // Keep at most 30 sessions
  saveHistory(sessions.slice(0, 30));
}

export function useChatSession() {
  const [sessionId, setSessionId] = useState(() => {
    const stored = localStorage.getItem(LS_SESSION_ID);
    if (stored) return stored;
    const newId = uuidv4();
    localStorage.setItem(LS_SESSION_ID, newId);
    return newId;
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem(LS_LANGUAGE) || "en";
  });

  useEffect(() => {
    localStorage.setItem(LS_LANGUAGE, language);
  }, [language]);

  const [messages, setMessages] = useState<ChatMessage[]>(() => loadCurrentMessages());
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  // Persist current messages to localStorage on every change
  useEffect(() => {
    saveCurrentMessages(messages);
  }, [messages]);

  // Archive current session when user navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      archiveCurrentSession(sessionId, messages);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [sessionId, messages]);

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
    setMessages((prev) => [
      ...prev,
      {
        id: streamingId,
        role: "assistant",
        message: "",
        timestamp: new Date().toISOString(),
        streaming: true,
      },
    ]);

    abortRef.current = new AbortController();

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({ message: text.trim(), language, sessionId }),
      });

      if (!response.ok || !response.body) throw new Error(`HTTP error: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

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
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamingId
                    ? { ...m, streaming: false, module: json.module ?? "general", timestamp: json.timestamp ?? m.timestamp }
                    : m
                )
              );
            } else if (json.content) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamingId ? { ...m, message: m.message + json.content } : m
                )
              );
            }
          } catch { /* skip malformed */ }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Chat error:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingId
            ? { ...m, message: "Sorry, I'm having trouble connecting right now. Please try again.", streaming: false, module: "general" }
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

    // Archive before clearing
    setMessages((prev) => {
      archiveCurrentSession(sessionId, prev);
      return [];
    });

    localStorage.removeItem(LS_CURRENT_MSGS);
    const newId = uuidv4();
    localStorage.setItem(LS_SESSION_ID, newId);
    setSessionId(newId);
  }, [sessionId]);

  const loadSession = useCallback((session: ChatSession) => {
    archiveCurrentSession(sessionId, messages);
    setMessages(session.messages);
    localStorage.setItem(LS_CURRENT_MSGS, JSON.stringify(session.messages));
    localStorage.setItem(LS_SESSION_ID, session.id);
    setSessionId(session.id);
  }, [sessionId, messages]);

  return {
    sessionId,
    language,
    setLanguage,
    messages,
    isLoadingHistory,
    isTyping,
    sendMessage,
    clearChat,
    loadSession,
  };
}
