import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoiceInput, ListeningIndicator } from "./VoiceInput";

interface InputBoxV2Props {
  onSend: (text: string) => void;
  isTyping: boolean;
  language: string;
  quickReplies?: string[];
}

export function InputBoxV2({ onSend, isTyping, language, quickReplies = [] }: InputBoxV2Props) {
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text || isTyping) return;
    onSend(text);
    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [inputValue, isTyping, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTranscript = useCallback((text: string) => {
    setIsListening(false);
    setInputValue((prev) => (prev ? prev + " " + text : text));
    textareaRef.current?.focus();
  }, []);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-resize textarea
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  const handleQuickReply = (reply: string) => {
    const clean = reply.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]/gu, "").trim();
    onSend(clean);
  };

  const canSend = inputValue.trim().length > 0 && !isTyping;

  return (
    <div className="bg-white/80 backdrop-blur-xl border-t p-3 sm:p-4 z-20">
      {/* Listening indicator */}
      {isListening && (
        <div className="flex justify-center mb-2">
          <ListeningIndicator visible={isListening} />
        </div>
      )}

      {/* Quick Replies */}
      {quickReplies.length > 0 && (
        <div className="flex overflow-x-auto gap-2 pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              onClick={() => handleQuickReply(reply)}
              disabled={isTyping}
              className="flex-shrink-0 px-4 py-2 bg-white border border-border hover:border-primary/50 hover:bg-primary/5 rounded-full text-sm font-medium text-foreground whitespace-nowrap transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-40"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-end gap-2">
        <VoiceInput
          onTranscript={handleTranscript}
          language={language}
          disabled={isTyping}
        />

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your question... (Enter to send)"
            rows={1}
            className="w-full bg-accent/30 border border-border focus:border-primary/50 focus:bg-white rounded-2xl px-4 py-3 min-h-[50px] max-h-[120px] resize-none outline-none transition-all text-[15px] placeholder:text-muted-foreground/60"
          />
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          className={cn(
            "w-[50px] h-[50px] flex items-center justify-center rounded-full shadow-lg transition-all flex-shrink-0",
            canSend
              ? "bg-primary text-primary-foreground shadow-primary/30 hover:scale-105 active:scale-95"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          <Send className="w-5 h-5 ml-0.5" />
        </button>
      </div>

      <div className="text-center mt-2">
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
          Powered by AI • Verify info before taking action
        </span>
      </div>
    </div>
  );
}
