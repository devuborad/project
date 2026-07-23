import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, Paperclip, FileText, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { MarkdownRenderer } from './MarkdownRenderer';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hi there! How can I assist you with your studies or campus life today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim() && !selectedFile) return;

    const userMsg = text.trim();
    let displayMsg = userMsg;
    if (selectedFile) {
      displayMsg += `\n\n[Attached: ${selectedFile.name}]`;
    }

    setMessages(prev => [...prev, { role: 'user', content: displayMsg }]);
    setMessage('');
    const fileToUpload = selectedFile;
    setSelectedFile(null); // Clear file immediately after sending
    setIsLoading(true);

    try {
      const token = localStorage.getItem('campus_token');
      
      const formData = new FormData();
      formData.append('prompt', userMsg || 'Analyze this file.');
      if (fileToUpload) {
        formData.append('file', fileToUpload);
      }

      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
      } else {
        console.error('Error from AI endpoint:', response.statusText);
        setMessages(prev => [...prev, { role: 'ai', content: 'I am sorry, something went wrong on our end.' }]);
      }
    } catch (error) {
      console.error('Network error calling AI:', error);
      setMessages(prev => [...prev, { role: 'ai', content: 'I am unable to connect to the server at the moment.' }]);
    } finally {
      setIsLoading(false);
    }
  };

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
            className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] h-[600px] max-h-[80vh] bg-white/95 dark:bg-brand-dark/95 backdrop-blur-3xl border border-gray-200 dark:border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-colors"
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
              {messages.map((msg, idx) => (
                <div key={idx} className={cn("flex items-start gap-3", msg.role === 'user' ? "justify-end" : "")}>
                  {msg.role === 'ai' && (
                    <div className="w-8 h-8 shrink-0 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center border border-gray-100 dark:border-white/5">
                      <Bot className="w-4 h-4 text-brand-primary" />
                    </div>
                  )}
                  
                  <div className={cn(
                    "p-4 max-w-[85%] shadow-sm",
                    msg.role === 'ai' 
                      ? "bg-white/90 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl rounded-tl-sm"
                      : "bg-gradient-to-br from-red-600 to-red-800 rounded-2xl rounded-tr-sm shadow-lg shadow-red-500/20 text-white"
                  )}>
                    {msg.role === 'ai' ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center border border-gray-100 dark:border-white/5">
                    <Bot className="w-4 h-4 text-brand-primary" />
                  </div>
                  <div className="bg-white/90 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2 shadow-sm">
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-2 h-2 rounded-full bg-red-500" />
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-red-500" />
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-red-500" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                <button 
                  onClick={() => handleSend("Summarize Notes")}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:bg-white/10 transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-brand-primary" />
                  Summarize Notes
                </button>
                <button 
                  onClick={() => handleSend("Find Internships")}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:bg-white/10 transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-brand-primary" />
                  Find Internships
                </button>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-white/[0.02]">
              {selectedFile && (
                <div className="mb-3 flex items-center justify-between bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-2 px-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {selectedFile.type.includes('pdf') ? <FileText className="w-4 h-4 text-brand-primary" /> : <ImageIcon className="w-4 h-4 text-brand-primary" />}
                    <span className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{selectedFile.name}</span>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="text-gray-500 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="relative flex items-center">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  hidden 
                  accept="application/pdf,image/png,image/jpeg,image/webp,image/heic,image/heif" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="absolute left-2 p-2 rounded-full text-gray-400 hover:text-brand-primary hover:bg-gray-200 dark:hover:bg-white/10 transition-colors z-10"
                  title="Attach file (PDF or Image)"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask CampusAI anything..." 
                  className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full py-3 pl-12 pr-12 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary focus:bg-gray-200 dark:bg-white/10 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleSend(message);
                    }
                  }}
                  disabled={isLoading}
                />
                <button 
                  onClick={() => !isLoading && handleSend(message)}
                  disabled={isLoading || (!message.trim() && !selectedFile)}
                  className={cn(
                    "absolute right-2 p-2 rounded-full transition-colors",
                    (message.trim().length > 0 || selectedFile) && !isLoading 
                      ? "bg-brand-primary text-gray-900 dark:text-white hover:bg-brand-secondary" 
                      : "bg-transparent text-gray-500 hover:text-gray-900 dark:text-white"
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
