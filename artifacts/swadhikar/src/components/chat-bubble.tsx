import { format } from "date-fns";
import { Check, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@workspace/api-client-react/src/generated/api.schemas";
import { motion } from "framer-motion";

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  const timeString = format(new Date(message.timestamp), "h:mm a");

  // Determine styling based on module
  let moduleStyles = "bg-white border-border shadow-sm text-foreground";
  let ModuleIcon = Bot;
  
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
      case "general":
        moduleStyles = "bg-white border-border text-foreground shadow-sm";
        break;
    }
  } else if (isUser) {
    // User bubble style (WhatsApp-ish green)
    moduleStyles = "bg-[#E0F8D8] border-[#c5e6bc] text-slate-800 shadow-sm";
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "flex max-w-[85%] md:max-w-[75%] lg:max-w-[65%]",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        
        {/* Avatar */}
        <div className={cn(
          "flex-shrink-0 flex items-end",
          isUser ? "ml-2" : "mr-2"
        )}>
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shadow-sm",
            isUser ? "bg-primary text-primary-foreground" : "bg-white border border-border text-primary"
          )}>
            {isUser ? <User className="w-5 h-5" /> : <img src={`${import.meta.env.BASE_URL}images/logo-mark.png`} alt="Swadhikar" className="w-5 h-5 object-contain" />}
          </div>
        </div>

        {/* Bubble */}
        <div className={cn(
          "relative px-4 py-3 rounded-2xl border",
          moduleStyles,
          isUser ? "rounded-br-sm" : "rounded-bl-sm"
        )}>
          
          {/* Module Badge (if assistant and specialized) */}
          {!isUser && message.module && message.module !== "general" && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block",
                message.module === "legal" ? "bg-blue-100 text-blue-700" :
                message.module === "kisan" ? "bg-green-100 text-green-700" :
                "bg-orange-100 text-orange-700"
              )}>
                {message.module.toUpperCase()}
              </span>
            </div>
          )}

          {/* Message Text */}
          <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {message.message}
          </div>

          {/* Timestamp & Status */}
          <div className="flex items-center justify-end gap-1 mt-1 opacity-60">
            <span className="text-[11px] font-medium">{timeString}</span>
            {isUser && <Check className="w-3 h-3" />}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
