import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

export function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-brand-gradient shadow-[0_0_30px_rgba(255,31,77,0.4)] flex items-center justify-center text-gray-900 dark:text-white group"
          >
            <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
            {/* Ping effect */}
            <span className="absolute inset-0 rounded-full border-2 border-brand-primary animate-ping opacity-50" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] h-[600px] max-h-[80vh] bg-brand-dark/95 backdrop-blur-3xl border border-gray-200 dark:border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center">
                  <Bot className="w-4 h-4 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Campus AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-gray-200 dark:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              
              {/* AI Message */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 shrink-0 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center border border-gray-100 dark:border-white/5">
                  <Bot className="w-4 h-4 text-brand-primary" />
                </div>
                <div className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl rounded-tl-sm p-3 max-w-[80%]">
                  <p className="text-sm text-gray-200">
                    Hi Alex! I noticed you have a DBMS assignment due tonight. Need help reviewing your SQL queries?
                  </p>
                </div>
              </div>

              {/* User Message */}
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-brand-gradient rounded-2xl rounded-tr-sm p-3 max-w-[80%] shadow-lg shadow-brand-primary/20">
                  <p className="text-sm text-gray-900 dark:text-white">
                    Yes please, I'm stuck on the JOIN query.
                  </p>
                </div>
              </div>

              {/* Typing indicator */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 shrink-0 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center border border-gray-100 dark:border-white/5">
                  <Bot className="w-4 h-4 text-brand-primary" />
                </div>
                <div className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl rounded-tl-sm p-3 flex items-center gap-1">
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                </div>
              </div>

            </div>

            {/* Suggested Prompts */}
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
              <button className="whitespace-nowrap px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:bg-white/10 transition-colors flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand-primary" />
                Summarize Notes
              </button>
              <button className="whitespace-nowrap px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:bg-white/10 transition-colors flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand-primary" />
                Find Internships
              </button>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-white/[0.02]">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask CampusAI anything..." 
                  className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary focus:bg-gray-200 dark:bg-white/10 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setMessage(''); // Handle send
                    }
                  }}
                />
                <button 
                  onClick={() => setMessage('')}
                  className={cn(
                    "absolute right-2 p-2 rounded-full transition-colors",
                    message.length > 0 ? "bg-brand-primary text-gray-900 dark:text-white hover:bg-brand-secondary" : "bg-transparent text-gray-500 hover:text-gray-900 dark:text-white"
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
