import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, Paperclip, FileText, Image as ImageIcon, Search, RotateCw, Clock, Copy, Check, Briefcase, Cpu } from 'lucide-react';
import { cn } from '../../utils/cn';
import { MarkdownRenderer } from './MarkdownRenderer';

interface Message {
  id?: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  agent?: string;
  confidence?: number;
  intent?: string;
  collaborationSteps?: any[];
}

export function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'ai', content: 'Hi there! How can I assist you with your studies or campus life today?', timestamp: new Date(), agent: 'Study Agent' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [activePrompt, setActivePrompt] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getThinkingText = () => {
    const text = activePrompt.toLowerCase();
    if (/attendance|attend|absent|skip|miss|percentage/i.test(text)) {
      return 'Attendance Agent is calculating...';
    }
    if (/assignment|due|deadline|pending|submit|homework/i.test(text)) {
      return 'Assignment Agent is checking deadlines...';
    }
    if (/hackathon|resume|internship|skill|project|career|job/i.test(text)) {
      return 'Career Agent is searching...';
    }
    if (/hour to study|hours to study|exam tomorrow|exam prep|plan|timetable/i.test(text)) {
      return 'Campus Assistant is preparing plan...';
    }
    return 'Multi-Agent Neural Engine is synthesizing...';
  };

  const renderAgentBadge = (agent?: string) => {
    const name = agent || 'Study Agent';
    if (name === 'MultiAgentCollaboration' || name === 'Collaborative 5-Agent Synergy') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-sm bg-gradient-to-r from-brand-primary/20 via-purple-500/20 to-blue-500/20 border-brand-primary/40 text-brand-primary dark:text-purple-300">
          <Sparkles className="w-3 h-3 text-brand-primary animate-pulse" />
          <span>Collaborative 5-Agent Synergy</span>
        </div>
      );
    }

    let badgeClasses = 'bg-purple-500/15 border-purple-500/30 text-purple-400 dark:text-purple-300';
    let icon = <Bot className="w-3 h-3 text-purple-400" />;

    if (name === 'Assignment Agent') {
      badgeClasses = 'bg-blue-500/15 border-blue-500/30 text-blue-400 dark:text-blue-300';
      icon = <FileText className="w-3 h-3 text-blue-400" />;
    } else if (name === 'Attendance Agent') {
      badgeClasses = 'bg-amber-500/15 border-amber-500/30 text-amber-400 dark:text-amber-300';
      icon = <Clock className="w-3 h-3 text-amber-400" />;
    } else if (name === 'Career Agent') {
      badgeClasses = 'bg-pink-500/15 border-pink-500/30 text-pink-400 dark:text-pink-300';
      icon = <Briefcase className="w-3 h-3 text-pink-400" />;
    } else if (name === 'Campus Assistant') {
      badgeClasses = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 dark:text-emerald-300';
      icon = <Sparkles className="w-3 h-3 text-emerald-400" />;
    }

    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-sm ${badgeClasses}`}>
        {icon}
        <span>{name}</span>
      </div>
    );
  };

  const filteredMessages = messages.filter(msg => 
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim() && !selectedFile) return;

    const userMsg = text.trim();
    setActivePrompt(userMsg);
    let displayMsg = userMsg;
    if (selectedFile) {
      displayMsg += `\n\n[Attached: ${selectedFile.name}]`;
    }

    setMessages(prev => [...prev, { id: Date.now().toString() + '-user', role: 'user', content: displayMsg, timestamp: new Date() }]);
    setMessage('');
    const fileToUpload = selectedFile;
    setSelectedFile(null); // Clear file immediately after sending
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('campus_token') || '';
      
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
        setMessages(prev => [...prev, { 
          id: Date.now().toString() + '-ai',
          role: 'ai', 
          content: data.response, 
          agent: data.agent || 'Study Agent',
          confidence: data.confidence,
          intent: data.intent,
          collaborationSteps: data.data?.collaborationSteps,
          timestamp: new Date() 
        }]);
      } else {
        console.error('Error from AI endpoint:', response.statusText);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: 'I am sorry, something went wrong on our end.', timestamp: new Date(), agent: 'Study Agent' }]);
      }
    } catch (error) {
      console.error('Network error calling AI:', error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: 'I am unable to connect to the server at the moment.', timestamp: new Date(), agent: 'Study Agent' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    // Find the last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      // Extract the prompt (remove attachments part if any for simplicity, or just send raw content)
      let prompt = lastUserMessage.content;
      const attachedMatch = prompt.indexOf('\n\n[Attached:');
      if (attachedMatch !== -1) {
        prompt = prompt.substring(0, attachedMatch);
      }
      handleSend(prompt);
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
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-brand-gradient shadow-[0_0_35px_rgba(255,31,77,0.55)] flex items-center justify-center text-white group cursor-pointer border border-white/20"
            title="Open CampusAI Copilot"
          >
            <Bot className="w-7 h-7 group-hover:scale-110 transition-transform duration-300" />
            {/* Pulsating Neural Ring */}
            <span className="absolute inset-0 rounded-full border-2 border-brand-primary/80 animate-ping opacity-60 pointer-events-none" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-brand-dark flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[440px] h-[640px] max-h-[85vh] bg-white/90 dark:bg-brand-dark/95 backdrop-blur-3xl border border-gray-200/90 dark:border-white/15 rounded-3xl flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-300"
          >
            {/* Glowing top accent gradient line */}
            <div className="h-1 w-full bg-ai-gradient" />

            {/* Header */}
            <div className="p-4 px-5 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-white/40 dark:bg-white/[0.02] backdrop-blur-md">
              <div className="flex items-center gap-3.5">
                <div className="relative w-10 h-10 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-md shadow-brand-primary/30">
                  <Bot className="w-5 h-5 text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-brand-dark" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm tracking-tight">CampusAI Copilot</h3>
                    <span className="ai-badge !py-0.5 !px-2 !text-[10px]">Neural 4.0</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Online & Ready to Assist</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  title="Search message history"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  title="Minimize Copilot"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <AnimatePresence>
              {isSearchOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 py-2.5 border-b border-gray-200 dark:border-white/10 bg-gray-50/80 dark:bg-black/30"
                >
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Filter conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-4">
              {filteredMessages.map((msg, idx) => (
                <div key={idx} className={cn("flex items-start gap-3", msg.role === 'user' ? "justify-end" : "")}>
                  {msg.role === 'ai' && (
                    <div className="w-8 h-8 shrink-0 rounded-xl bg-gradient-to-br from-brand-primary/20 to-purple-500/20 flex items-center justify-center border border-brand-primary/30 mt-1 shadow-sm">
                      <Bot className="w-4 h-4 text-brand-primary" />
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-1.5 max-w-[85%]">
                    <div className={cn(
                      "p-4 shadow-sm",
                      msg.role === 'ai' 
                        ? "bg-white/90 dark:bg-white/[0.06] backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-2xl rounded-tl-sm text-gray-900 dark:text-gray-100 shadow-sm"
                        : "bg-brand-gradient rounded-2xl rounded-tr-sm shadow-md shadow-brand-primary/20 text-white"
                    )}>
                      {msg.role === 'ai' ? (
                        <>
                          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-gray-200/50 dark:border-white/5">
                            {renderAgentBadge(msg.agent)}
                            {msg.confidence && (
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                                {Math.round(msg.confidence * 100)}% conf
                              </span>
                            )}
                          </div>
                          <div className="mb-3 p-3 rounded-2xl bg-gradient-to-br from-purple-500/5 via-brand-primary/5 to-transparent border border-purple-500/20 shadow-sm">
                            <div className="flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-300 mb-2">
                              <div className="flex items-center gap-1.5">
                                <Cpu className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
                                <span>Autonomous Agent Execution Workflow</span>
                              </div>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">100% Executed</span>
                            </div>

                            {/* Horizontal Flow Timeline */}
                            <div className="flex flex-wrap items-center gap-1.5 py-1.5 text-[11px] font-medium">
                              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-white/10">
                                <span>👤 User Question</span>
                              </div>

                              <span className="text-gray-400 font-bold">↓</span>

                              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                <span>🧭 Router</span>
                              </div>

                              <span className="text-gray-400 font-bold">↓</span>

                              {msg.collaborationSteps && msg.collaborationSteps.length > 0 ? (
                                msg.collaborationSteps.map((step: any, sIdx: number) => (
                                  <span key={sIdx} className="flex items-center gap-1.5">
                                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 shadow-sm">
                                      <span>⚡ {step.agent || msg.agent}</span>
                                    </span>
                                    <span className="text-gray-400 font-bold">↓</span>
                                  </span>
                                ))
                              ) : (
                                <>
                                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 shadow-sm">
                                    <span>⚡ {msg.agent || 'Campus Assistant'}</span>
                                  </div>
                                  <span className="text-gray-400 font-bold">↓</span>
                                </>
                              )}

                              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold">
                                <span>✨ Final Response</span>
                              </div>
                            </div>

                            {msg.collaborationSteps && msg.collaborationSteps.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-purple-500/10 space-y-1">
                                {msg.collaborationSteps.map((step: any, sIdx: number) => (
                                  <div key={sIdx} className="text-[11px] text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                    <span className="font-semibold text-purple-600 dark:text-purple-300">{step.agent}:</span>
                                    <span className="text-gray-600 dark:text-gray-300">{step.summary}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <MarkdownRenderer content={msg.content} />
                        </>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      )}
                    </div>
                    
                    <div className={cn(
                      "flex items-center gap-2 text-[10px] font-medium text-gray-400 dark:text-gray-500",
                      msg.role === 'user' ? "justify-end pr-1" : "pl-1"
                    )}>
                      <Clock className="w-3 h-3" />
                      <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      
                      {msg.role === 'ai' && (
                         <button 
                           onClick={() => handleCopy(msg.content, msg.id || idx.toString())}
                           className="ml-2 flex items-center gap-1 text-gray-400 hover:text-brand-primary transition-colors"
                           title="Copy Message"
                         >
                           {copiedId === (msg.id || idx.toString()) ? (
                             <>
                               <Check className="w-3 h-3 text-green-500" />
                               <span className="text-green-500 font-semibold">Copied</span>
                             </>
                           ) : (
                             <>
                               <Copy className="w-3 h-3" />
                               <span>Copy</span>
                             </>
                           )}
                         </button>
                      )}

                      {msg.role === 'ai' && idx === messages.length - 1 && (
                         <button 
                           onClick={handleRegenerate}
                           className="ml-2 flex items-center gap-1 text-gray-400 hover:text-brand-primary transition-colors"
                           title="Regenerate Response"
                         >
                           <RotateCw className="w-3 h-3" />
                           <span>Regenerate</span>
                         </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator & Live Agent Execution Timeline */}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 shrink-0 rounded-xl bg-gradient-to-br from-brand-primary/20 to-purple-500/20 flex items-center justify-center border border-brand-primary/30 mt-1">
                    <Bot className="w-4 h-4 text-brand-primary animate-pulse" />
                  </div>
                  <div className="bg-white/90 dark:bg-white/[0.06] backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-2xl rounded-tl-sm p-4 flex flex-col gap-2.5 shadow-sm max-w-[85%]">
                    <div className="flex items-center gap-2">
                      <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-2 h-2 rounded-full bg-brand-primary" />
                      <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-purple-500" />
                      <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-xs text-gray-700 dark:text-gray-300 ml-1 font-semibold">{getThinkingText()}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-medium pt-1.5 border-t border-gray-200/60 dark:border-white/10">
                      <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300">👤 Input</span>
                      <span className="text-gray-400">→</span>
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 animate-pulse">🧭 Router</span>
                      <span className="text-gray-400">→</span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20">⚡ Active AI Agent</span>
                      <span className="text-gray-400">→</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">✨ Synthesizing</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts */}
            {messages.length === 1 && (
              <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
                <button 
                  onClick={() => handleSend("Summarize Notes")}
                  className="whitespace-nowrap px-3.5 py-1.5 rounded-full bg-gray-100/80 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/15 transition-all flex items-center gap-1.5 hover:border-brand-primary/30"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                  Summarize Notes
                </button>
                <button 
                  onClick={() => handleSend("Find Internships")}
                  className="whitespace-nowrap px-3.5 py-1.5 rounded-full bg-gray-100/80 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/15 transition-all flex items-center gap-1.5 hover:border-brand-primary/30"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                  Find Internships
                </button>
                <button 
                  onClick={() => handleSend("Explain Coursework")}
                  className="whitespace-nowrap px-3.5 py-1.5 rounded-full bg-gray-100/80 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/15 transition-all flex items-center gap-1.5 hover:border-brand-primary/30"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                  Explain Coursework
                </button>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-white/60 dark:bg-black/20 backdrop-blur-lg">
              {selectedFile && (
                <div className="mb-3 flex items-center justify-between bg-brand-primary/10 dark:bg-white/[0.06] border border-brand-primary/20 dark:border-white/10 rounded-xl p-2.5 px-3">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {selectedFile.type.includes('pdf') ? <FileText className="w-4 h-4 text-brand-primary shrink-0" /> : <ImageIcon className="w-4 h-4 text-brand-primary shrink-0" />}
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-[220px]">{selectedFile.name}</span>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
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
                  className="absolute left-2 p-2 rounded-full text-gray-400 hover:text-brand-primary hover:bg-gray-100 dark:hover:bg-white/10 transition-colors z-10"
                  title="Attach file (PDF or Image)"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask CampusAI anything..." 
                  className="w-full bg-gray-100/90 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full py-3 pl-11 pr-12 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary focus:bg-white dark:focus:bg-white/10 transition-all shadow-inner"
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
                    "absolute right-1.5 p-2.5 rounded-full transition-all duration-200",
                    (message.trim().length > 0 || selectedFile) && !isLoading 
                      ? "bg-brand-primary text-white hover:bg-brand-secondary shadow-md shadow-brand-primary/30" 
                      : "bg-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  )}
                  title="Send message"
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

