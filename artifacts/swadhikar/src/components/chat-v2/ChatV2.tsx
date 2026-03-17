import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { ArrowLeft, Globe, RefreshCw, Sparkles, X, AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useChatV2, LANGUAGES_V2 } from "@/hooks/use-chat-v2";
import { MessageBubbleV2 } from "./MessageBubbleV2";
import { InputBoxV2 } from "./InputBoxV2";
import { cn } from "@/lib/utils";

const QUICK_REPLIES = [
  "⚖️ Know my rights",
  "🌾 Farmer schemes",
  "🏛️ Government benefits",
  "📝 How to file RTI",
];

const WELCOME_MESSAGE = {
  id: "welcome-v2",
  role: "assistant" as const,
  message:
    "Namaste! I'm Swadhikar, your rights navigator. I can help you with:\n\n⚖️ Legal rights and how to claim them\n🌾 Farmer schemes and crop insurance\n🏛️ Government welfare schemes you qualify for\n\nYou can also tap the 🎤 mic to speak your question!\nWhat would you like help with today?",
  timestamp: new Date().toISOString(),
  module: "general" as const,
};

function ClearConfirmDialog({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onCancel}
          />
          {/* Dialog */}
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-sm bg-white rounded-2xl shadow-2xl border border-border p-6"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">Clear Chat?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This will permanently delete all messages in this conversation and start a fresh session.
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-white text-foreground font-semibold text-sm hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20"
                >
                  Clear Chat
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function ChatV2() {
  const { language, setLanguage, messages, isTyping, sendMessage, clearChat } = useChatV2();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleClearConfirm = () => {
    clearChat();
    setShowClearConfirm(false);
  };

  const displayMessages = messages.length > 0 ? messages : [WELCOME_MESSAGE];

  return (
    <>
      <ClearConfirmDialog
        open={showClearConfirm}
        onConfirm={handleClearConfirm}
        onCancel={() => setShowClearConfirm(false)}
      />

      <div className="flex flex-col h-[100dvh] bg-[#f8f9fa] max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
        {/* Header */}
        <header className="bg-white px-4 py-3 shadow-sm border-b z-20 flex items-center justify-between sticky top-0">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <img
                  src={`${import.meta.env.BASE_URL}images/logo-mark.png`}
                  alt="Logo"
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-lg leading-none">Swadhikar</h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> V2
                  </span>
                </div>
                <p className="text-xs text-secondary font-medium mt-0.5 tracking-wide">
                  स्वाधिकार • ALWAYS ONLINE
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Clear Chat Button */}
            <button
              onClick={() => setShowClearConfirm(true)}
              title="Clear chat history"
              className="p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/50 hover:bg-accent text-sm font-medium transition-colors"
              >
                <Globe className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">
                  {LANGUAGES_V2.find((l) => l.code === language)?.name || "Eng"}
                </span>
                <span className="sm:hidden uppercase">{language}</span>
              </button>

              <AnimatePresence>
                {showLanguageMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowLanguageMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-border z-40 py-2 max-h-[60vh] overflow-y-auto"
                    >
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Select Language
                      </div>
                      {LANGUAGES_V2.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setShowLanguageMenu(false);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between",
                            language === lang.code
                              ? "text-primary font-bold bg-primary/5"
                              : "text-foreground"
                          )}
                        >
                          {lang.name}
                          {language === lang.code && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto p-4 pb-2">
          <div className="flex justify-center mb-6 mt-2">
            <div className="bg-black/5 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-muted-foreground">
              Today
            </div>
          </div>

          <div className="flex flex-col">
            {displayMessages.map((msg) => (
              <MessageBubbleV2 key={msg.id} message={msg} />
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex w-full mb-3 justify-start"
              >
                <div className="flex flex-row">
                  <div className="flex-shrink-0 flex items-end mr-2">
                    <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center shadow-sm">
                      <img
                        src={`${import.meta.env.BASE_URL}images/logo-mark.png`}
                        alt="S"
                        className="w-5 h-5 object-contain opacity-50 grayscale"
                        onError={(e) => {
                          const el = e.target as HTMLImageElement;
                          el.style.display = "none";
                          if (el.parentElement) el.parentElement.textContent = "S";
                        }}
                      />
                    </div>
                  </div>
                  <div className="px-4 py-3.5 rounded-2xl rounded-bl-sm bg-white border border-border shadow-sm flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        </main>

        {/* Input Area */}
        <InputBoxV2
          onSend={sendMessage}
          isTyping={isTyping}
          language={language}
          quickReplies={QUICK_REPLIES}
        />
      </div>
    </>
  );
}
