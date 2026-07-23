import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Copy, Check, Sparkles, Loader2, Paperclip, FileText, Image as ImageIcon, X } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { MarkdownRenderer } from '../../components/ui/MarkdownRenderer';

type Message = {
  id?: number;
  sender: 'user' | 'ai';
  message: string;
};

const SUGGESTED_QUESTIONS = [
  "I know Java and React. What's my career path?",
  "Review my skills for a DevOps role.",
  "What projects should I build for an AI Internship?",
  "How do I optimize my LinkedIn for FAANG?"
];

export function CareerCoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/career/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setMessages(data.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch career chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (text: string) => {
    if (!text.trim() && !selectedFile) return;
    
    let displayMsg = text.trim();
    if (selectedFile) {
      displayMsg += `\n\n[Attached: ${selectedFile.name}]`;
    }

    const userMsg: Message = { sender: 'user', message: displayMsg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const fileToUpload = selectedFile;
    setSelectedFile(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('campus_token');
      
      const formData = new FormData();
      formData.append('message', text.trim() || 'Analyze this file.');
      if (fileToUpload) {
        formData.append('file', fileToUpload);
      }

      const response = await fetch('http://localhost:5000/api/career/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setMessages(prev => [...prev, { sender: 'ai', message: data.message }]);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', message: '**Error:** ' + (data.error || 'Failed to process request.') }]);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { sender: 'ai', message: '**Network Error:** ' + error.message }]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-red-500" />
          AI Career Coach
        </h1>
        <p className="text-gray-500 mt-1">Personalized guidance on skills, salaries, roles, and interview prep.</p>
      </div>

      <GlassCard className="flex-1 flex flex-col bg-black/40 border-red-500/20 overflow-hidden relative">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
              <Bot className="w-16 h-16 text-red-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Welcome to Your Career Hub!</h3>
              <p className="text-gray-400 max-w-md">Tell me about your current skills, goals, or ask for resume advice. I'll analyze your profile and provide a comprehensive career path.</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-red-500" />
                </div>
              )}
              
              <div className={`group relative max-w-[80%] rounded-2xl p-5 ${
                msg.sender === 'user' 
                  ? 'bg-red-600 text-white rounded-tr-none' 
                  : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
              }`}>
                {msg.sender === 'ai' && (
                  <button 
                    onClick={() => copyToClipboard(msg.message, idx)}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-black/40 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedId === idx ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
                
                {msg.sender === 'ai' ? (
                  <MarkdownRenderer content={msg.message} />
                ) : (
                  <p className="leading-relaxed">{msg.message}</p>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-gray-300" />
                </div>
              )}
            </motion.div>
          ))}

          {loading && (
            <div className="flex gap-4 justify-start">
              <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-red-500" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-5 flex items-center gap-2">
                <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                <span className="text-gray-400">Analyzing your career profile...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/60 border-t border-white/5">
          {/* Suggested Questions */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-red-500/20 hover:border-red-500/50 hover:text-white transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex flex-col gap-3 relative"
          >
            {selectedFile && (
              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  {selectedFile.type.includes('pdf') ? <FileText className="w-5 h-5 text-red-500" /> : <ImageIcon className="w-5 h-5 text-red-500" />}
                  <span className="text-sm text-gray-300 truncate max-w-[300px]">{selectedFile.name}</span>
                </div>
                <button type="button" onClick={() => setSelectedFile(null)} className="text-gray-500 hover:text-red-500 transition-colors p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="flex gap-3 relative">
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
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors z-10"
                title="Attach file (PDF or Image)"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for resume review, salary estimates, or project ideas..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl pl-14 pr-6 py-4 text-white focus:outline-none focus:border-red-500/50 transition-colors"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={(!input.trim() && !selectedFile) || loading}
                className="px-6 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-800 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </GlassCard>
    </div>
  );
}
