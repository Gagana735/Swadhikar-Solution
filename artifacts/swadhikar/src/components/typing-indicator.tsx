import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full mb-4 justify-start"
    >
      <div className="flex flex-row max-w-[85%]">
        <div className="flex-shrink-0 flex items-end mr-2">
          <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center shadow-sm">
             <img src={`${import.meta.env.BASE_URL}images/logo-mark.png`} alt="Swadhikar" className="w-5 h-5 object-contain opacity-50 grayscale" />
          </div>
        </div>
        
        <div className="px-4 py-3.5 rounded-2xl rounded-bl-sm bg-white border border-border shadow-sm flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary/60 typing-dot"></div>
          <div className="w-2 h-2 rounded-full bg-primary/60 typing-dot"></div>
          <div className="w-2 h-2 rounded-full bg-primary/60 typing-dot"></div>
        </div>
      </div>
    </motion.div>
  );
}
