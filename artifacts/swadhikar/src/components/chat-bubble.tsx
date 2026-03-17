import { format } from "date-fns";
import { Check, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/hooks/use-chat-session";
import { motion } from "framer-motion";

interface ChatBubbleProps {
  message: ChatMessage;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^#{1,3} (.+)$/gm, "<strong class=\"text-base\">$1</strong>")
    .replace(/^(\d+)\. (.+)$/gm, "<span class=\"block mt-1\"><span class=\"font-semibold\">$1.</span> $2</span>")
    .replace(/^- (.+)$/gm, "<span class=\"block mt-0.5 pl-2\">• $1</span>")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const isStreaming = message.streaming;

  let timeString = "";
  try {
    timeString = format(new Date(message.timestamp), "h:mm a");
  } catch {
    timeString = "";
  }

  let moduleStyles = "bg-white border-border shadow-sm text-foreground";
  
  if (!isUser && message.module) {
    switch (message.module) {
      case "legal":
        moduleStyles = "bg-blue-50 border-blue-200 text-blue-900 shadow-sm shadow-blue-500/5";
        break;
      case "kisan":
        moduleStyles = "bg-green-50 border-green-200 text-green-900 shadow-sm shadow-green-500/5";
        break;
      case "yojana":
        moduleStyles = "bg-orange-50 border-orange-200 text-orange-900 shadow-sm shadow-orange-500/5";
        break;
      default:
        moduleStyles = "bg-white border-border text-foreground shadow-sm";
    }
  } else if (isUser) {
    moduleStyles = "bg-[#E0F8D8] border-[#c5e6bc] text-slate-800 shadow-sm";
  }

  const moduleLabel: Record<string, string> = {
    legal: "⚖️ LEGAL",
    kisan: "🌾 KISAN",
    yojana: "🏛️ YOJANA",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn("flex w-full mb-3", isUser ? "justify-end" : "justify-start")}
    >
      <div className={cn("flex max-w-[88%] md:max-w-[78%]", isUser ? "flex-row-reverse" : "flex-row")}>
        {/* Avatar */}
        <div className={cn("flex-shrink-0 flex items-end", isUser ? "ml-2" : "mr-2")}>
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shadow-sm",
            isUser ? "bg-primary text-primary-foreground" : "bg-white border border-border text-primary"
          )}>
            {isUser ? (
              <span className="text-xs font-bold">You</span>
            ) : (
              <img
                src={`${import.meta.env.BASE_URL}images/logo-mark.png`}
                alt="Swadhikar"
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-xs font-bold">S</span>';
                }}
              />
            )}
          </div>
        </div>

        {/* Bubble */}
        <div className={cn(
          "relative px-4 py-3 rounded-2xl border",
          moduleStyles,
          isUser ? "rounded-br-sm" : "rounded-bl-sm"
        )}>
          {/* Module Badge */}
          {!isUser && message.module && message.module !== "general" && moduleLabel[message.module] && (
            <div className="mb-1.5">
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block",
                message.module === "legal" ? "bg-blue-100 text-blue-700" :
                message.module === "kisan" ? "bg-green-100 text-green-700" :
                "bg-orange-100 text-orange-700"
              )}>
                {moduleLabel[message.module]}
              </span>
            </div>
          )}

          {/* Message Content */}
          {isUser ? (
            <div className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
              {message.message}
            </div>
          ) : (
            <div
              className="text-[15px] leading-relaxed break-words"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(message.message) + (isStreaming && message.message ? '<span class="inline-block w-0.5 h-4 bg-current align-middle ml-0.5 animate-pulse">▋</span>' : ""),
              }}
            />
          )}

          {/* Streaming dots if empty */}
          {isStreaming && !message.message && (
            <div className="flex items-center gap-1 py-1">
              <div className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}

          {/* Timestamp */}
          {!isStreaming && timeString && (
            <div className="flex items-center justify-end gap-1 mt-1.5 opacity-50">
              <span className="text-[11px] font-medium">{timeString}</span>
              {isUser && <Check className="w-3 h-3" />}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
