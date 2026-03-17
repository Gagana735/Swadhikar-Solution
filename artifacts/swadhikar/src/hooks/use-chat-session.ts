import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useSendMessage } from "@workspace/api-client-react";
import type { ChatMessage, ChatHistoryResponse } from "@workspace/api-client-react/src/generated/api.schemas";

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

export function useChatSession() {
  // Manage Session ID
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem("swadhikar_session_id");
    if (stored) return stored;
    const newId = uuidv4();
    localStorage.setItem("swadhikar_session_id", newId);
    return newId;
  });

  // Manage Language Preferences
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("swadhikar_language") || "en";
  });

  useEffect(() => {
    localStorage.setItem("swadhikar_language", language);
  }, [language]);

  const sendMessageMutation = useSendMessage();

  // Local state for optimistic updates and immediate feedback
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Load history with sessionId as query param
  const refetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/history?sessionId=${encodeURIComponent(sessionId)}`);
      if (res.ok) {
        const data: ChatHistoryResponse = await res.json();
        if (data?.messages) {
          setLocalMessages(data.messages);
        }
      }
    } catch (e) {
      // Silently ignore
    }
  }, [sessionId]);

  // Initial load
  useEffect(() => {
    setIsLoadingHistory(true);
    refetchHistory().finally(() => setIsLoadingHistory(false));
  }, [refetchHistory]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Optimistic User Message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      message: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setLocalMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        data: {
          message: text.trim(),
          language,
          sessionId,
        },
      });

      // Append Assistant Response
      const assistantMessage: ChatMessage = {
        id: response.id,
        role: "assistant",
        message: response.message,
        timestamp: response.timestamp,
        module: response.module as any, // Cast to match schema type
      };

      setLocalMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Optional: Add a local error message bubble
      setLocalMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          message: "Sorry, I am having trouble connecting to the network. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
      // Silently refresh history in background to ensure consistency
      refetchHistory();
    }
  }, [language, sessionId, sendMessageMutation, refetchHistory]);

  return {
    sessionId,
    language,
    setLanguage,
    messages: localMessages,
    isLoadingHistory,
    isTyping,
    sendMessage,
  };
}
