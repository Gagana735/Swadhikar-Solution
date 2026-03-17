import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Send, ArrowLeft, Globe, RefreshCw, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatSession, LANGUAGES, type ChatMessage } from "@/hooks/use-chat-session";
import { ChatBubble } from "@/components/chat-bubble";
import { TypingIndicator } from "@/components/typing-indicator";
import { VoiceInput, ListeningIndicator } from "@/components/chat-v2/VoiceInput";
import { cn } from "@/lib/utils";

const QUICK_REPLIES = [
  "⚖️ Know my rights",
  "🌾 Farmer schemes",
  "🏛️ Government benefits",
  "📝 How to file RTI"
];

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome-local",
  role: "assistant" as const,
  message: "Namaste! I'm Swadhikar, your rights navigator. I can help you with:\n\n⚖️ Legal rights and how to claim them\n🌾 Farmer schemes and crop insurance\n🏛️ Government welfare schemes you qualify for\n\nWhat would you like help with today?",
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
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onCancel}
          />
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
                  This will permanently delete all messages and start a fresh session.
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

export default function ChatPage() {
  const { 
    messages, 
    isLoadingHistory, 
    isTyping, 
    sendMessage,
    clearChat,
    language, 
    setLanguage 
  } = useChatSession();
  
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isTyping) return;
    sendMessage(inputValue);
    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleQuickReply = (reply: string) => {
    const cleanReply = reply.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
    sendMessage(cleanReply);
  };

  const handleTranscript = useCallback((text: string) => {
    setIsListening(false);
    setInputValue((prev) => (prev ? prev + " " + text : text));
    textareaRef.current?.focus();
  }, []);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

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
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <img src={`${import.meta.env.BASE_URL}images/logo-mark.png`} alt="Logo" className="w-6 h-6 object-contain" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg leading-none">Swadhikar</h1>
                <p className="text-xs text-secondary font-medium mt-0.5 tracking-wide">स्वाधिकार • ALWAYS ONLINE</p>
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
                <span className="hidden sm:inline">{LANGUAGES.find(l => l.code === language)?.name || "Eng"}</span>
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
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Language</div>
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setShowLanguageMenu(false);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between",
                            language === lang.code ? "text-primary font-bold bg-primary/5" : "text-foreground"
                          )}
                        >
                          {lang.name}
                          {language === lang.code && <div className="w-2 h-2 rounded-full bg-primary" />}
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
        <main className="flex-1 overflow-y-auto chat-scroll p-4 pb-2">
          <div className="flex justify-center mb-6 mt-2">
            <div className="bg-black/5 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-muted-foreground">
              Today
            </div>
          </div>

          {isLoadingHistory ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
              <img src={`${import.meta.env.BASE_URL}images/logo-mark.png`} alt="Loading" className="w-12 h-12 opacity-20 animate-pulse" />
              <p className="text-sm font-medium">Loading session...</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {displayMessages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} className="h-1" />
            </div>
          )}
        </main>

        {/* Input Area */}
        <div className="bg-white/80 backdrop-blur-xl border-t p-3 sm:p-4 z-20">

          {/* Listening indicator */}
          {isListening && (
            <div className="flex justify-center mb-2">
              <ListeningIndicator visible={isListening} />
            </div>
          )}

          {/* Quick Replies */}
          <div className="flex overflow-x-auto chat-scroll gap-2 pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
            {QUICK_REPLIES.map((reply) => (
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

          {/* Input Form */}
          <form onSubmit={handleSend} className="flex items-end gap-2 relative">
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your question..."
                className="w-full bg-accent/30 border border-border focus:border-primary/50 focus:bg-white rounded-2xl px-4 py-3 min-h-[50px] max-h-[120px] resize-none outline-none transition-all text-[15px]"
                rows={1}
              />
            </div>
            
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="w-[50px] h-[50px] flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:hover:scale-100 flex-shrink-0"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
          
          <div className="text-center mt-2">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Powered by AI • Verify info before taking action</span>
          </div>
        </div>
        
      </div>
    </>
  );
}
