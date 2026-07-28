import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, UploadCloud, FileText, AlertCircle, RefreshCw, 
  Download, Copy, Sparkles, Send, BookOpen, Brain, Layers, 
  MessageSquare, ChevronLeft, ChevronRight, Check, X, FileCheck, 
  Award
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';

interface MCQ {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Flashcard {
  front: string;
  back: string;
}

interface Definition {
  term: string;
  definition: string;
}

interface InterviewQuestion {
  question: string;
  answer: string;
}

interface StudyNoteResult {
  noteId: number;
  fileName: string;
  fileSize: number;
  summary: string;
  keyPoints: string[];
  definitions: Definition[];
  interviewQuestions: InterviewQuestion[];
  mcqs: MCQ[];
  flashcards: Flashcard[];
  createdAt?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  agent?: string;
}

const SAMPLE_QUESTIONS = [
  'Explain Binary Trees',
  'Explain OS Scheduling',
  'Difference between Stack and Queue',
  'Explain DBMS normalization'
];

export function StudyAgent() {
  // Navigation / Tabs State
  const [activeTab, setActiveTab] = useState<'summary' | 'quiz' | 'flashcards' | 'definitions' | 'interview'>('summary');
  const [mode, setMode] = useState<'upload' | 'chat'>('upload');

  // File Upload & Processing State
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [noteResult, setNoteResult] = useState<StudyNoteResult | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Flashcards State
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Conversational Study Q&A State
  const [chatInput, setChatInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: 'Hello! I am your AI Study Agent. Ask me anything like "Explain Binary Trees" or "Explain OS Scheduling", or upload your PDF study notes for an instant Summary, Quiz, and Flashcard kit!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    // Validate PDF only
    if (selectedFile.type !== 'application/pdf') {
      setError('Invalid file format. Please select a valid PDF file.');
      return;
    }
    // Validate Max 20 MB size
    const maxSizeBytes = 20 * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      setError('The selected file is too large. Maximum size is 20 MB.');
      return;
    }
    if (selectedFile.size === 0) {
      setError('The selected file is empty (0 bytes). Please upload a valid PDF.');
      return;
    }
    setFile(selectedFile);
  };

  // Processing Animation Steps
  const runProgressSteps = async () => {
    const steps = [
      { text: 'Reading PDF...', progress: 20, delay: 900 },
      { text: 'Analyzing...', progress: 45, delay: 1200 },
      { text: 'Generating Summary...', progress: 65, delay: 1400 },
      { text: 'Creating Quiz...', progress: 85, delay: 1200 },
      { text: 'Creating Flashcards...', progress: 95, delay: 800 }
    ];

    for (const step of steps) {
      setProcessingStep(step.text);
      setUploadProgress(step.progress);
      await new Promise(r => setTimeout(r, step.delay));
    }
  };

  const handleUploadPDF = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    setUploadProgress(10);
    setProcessingStep('Reading PDF...');

    // Run processing animation in parallel with API call
    const animPromise = runProgressSteps();

    try {
      const token = localStorage.getItem('campus_token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/api/study-agent/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      await animPromise; // Ensure user sees progress steps

      if (response.ok && data.success) {
        setProcessingStep('Done');
        setUploadProgress(100);
        setNoteResult(data.data);
        setActiveTab('summary');
        // Reset quiz & flashcard states
        setSelectedAnswers({});
        setQuizSubmitted(false);
        setFlashcardIndex(0);
        setIsFlipped(false);
      } else {
        setError(data.error || 'Failed to process PDF.');
      }
    } catch (err: any) {
      console.error('PDF Upload Error:', err);
      let errMsg = 'Internet or network connection error while processing PDF.';
      if (err.message && err.message.includes('corrupt')) {
        errMsg = 'The uploaded PDF appears to be corrupted or unreadable.';
      }
      setError(errMsg);
    } finally {
      setIsUploading(false);
    }
  };

  // Study Q&A Handler
  const handleAskQuestion = async (questionText?: string) => {
    const q = questionText || chatInput;
    if (!q || !q.trim() || isAsking) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!questionText) setChatInput('');
    setIsAsking(true);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('campus_token') || '';
      const historyPayload = chatMessages
        .filter(m => m.id !== 'welcome')
        .slice(-6)
        .map(m => ({
          role: m.sender === 'user' ? 'Student' : 'StudyAgent',
          text: m.text
        }));

      const res = await fetch('http://localhost:5000/api/study-agent/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question: q.trim(),
          history: historyPayload,
          contextNoteId: noteResult ? noteResult.noteId : undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const agentMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: data.data.answer,
          agent: data.agent || data.data.agent || 'Study Agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, agentMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: `Error: ${data.error || 'Could not reach Study Agent AI.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const netErrorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: 'Network connection error while contacting Study Agent AI. Please check your connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, netErrorMsg]);
    } finally {
      setIsAsking(false);
    }
  };

  // Action Button Helpers
  const handleCopySummary = () => {
    if (!noteResult) return;
    const textToCopy = `# ${noteResult.fileName} — Study Notes\n\n## Summary\n${noteResult.summary}\n\n## Key Points\n${noteResult.keyPoints.map(p => `- ${p}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadSummary = () => {
    if (!noteResult) return;
    const content = `# Study Summary: ${noteResult.fileName}\n\n## Overview\n${noteResult.summary}\n\n## Core Key Points\n${noteResult.keyPoints.map(p => `• ${p}`).join('\n')}\n`;
    handleDownloadFile(`${noteResult.fileName.replace('.pdf', '')}_Summary.md`, content);
  };

  const handleDownloadQuiz = () => {
    if (!noteResult) return;
    const content = `# Multiple Choice Quiz: ${noteResult.fileName}\n\n${noteResult.mcqs.map((m, idx) => `### Q${idx + 1}. ${m.question}\n${m.options.map(opt => `  [ ] ${opt}`).join('\n')}\n**Correct Answer**: ${m.correctAnswer}\n`).join('\n---\n\n')}`;
    handleDownloadFile(`${noteResult.fileName.replace('.pdf', '')}_Quiz.md`, content);
  };

  const handleDownloadFlashcards = () => {
    if (!noteResult) return;
    const content = `# Revision Flashcards: ${noteResult.fileName}\n\n${noteResult.flashcards.map((f, i) => `### Card ${i + 1}\n- **Front (Question)**: ${f.front}\n- **Back (Answer)**: ${f.back}\n`).join('\n---\n\n')}`;
    handleDownloadFile(`${noteResult.fileName.replace('.pdf', '')}_Flashcards.md`, content);
  };

  // Quiz submission & score check
  const handleSubmitQuiz = () => {
    if (!noteResult) return;
    let score = 0;
    noteResult.mcqs.forEach((mcq, idx) => {
      if (selectedAnswers[idx] === mcq.correctAnswer) {
        score += 1;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-primary/20 via-brand-secondary/15 to-transparent p-6 border border-brand-primary/30 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-brand-primary/20 border border-brand-primary/40 text-brand-primary shadow-lg shadow-brand-primary/10">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">Study Agent</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
                  AI Academic Tutor
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Upload PDF notes (max 20MB) to generate instant Summaries, Quizzes, Flashcards & Technical Interviews, or ask study questions.
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 bg-dark-900/60 p-1.5 rounded-xl border border-white/10 self-start md:self-center">
            <button
              onClick={() => setMode('upload')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'upload' 
                  ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/30' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>PDF Study Kit</span>
            </button>
            <button
              onClick={() => setMode('chat')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'chat' 
                  ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/30' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Study Q&A Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* ERROR BANNER */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 flex items-start justify-between gap-3 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Upload or Processing Error</h4>
                <p className="text-xs text-red-200/80 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 rounded-lg hover:bg-red-500/20 text-red-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODE 1: PDF STUDY KIT (UPLOAD + RESULTS) */}
      {mode === 'upload' && (
        <div className="space-y-6">
          {/* UPLOAD PDF CARD */}
          <GlassCard className="p-6 border border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`flex-1 w-full border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  file 
                    ? 'border-brand-primary/60 bg-brand-primary/5' 
                    : 'border-white/15 hover:border-brand-primary/40 hover:bg-white/5'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept=".pdf,application/pdf"
                  className="hidden"
                  disabled={isUploading}
                />
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-brand-primary">
                    {file ? <FileCheck className="w-8 h-8 text-emerald-400" /> : <UploadCloud className="w-8 h-8" />}
                  </div>
                  {file ? (
                    <div>
                      <p className="text-base font-semibold text-white">{file.name}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Ready for AI Synthesis
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-base font-medium text-gray-200">
                        Drag & Drop your PDF study notes here, or <span className="text-brand-primary font-semibold">browse files</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1.5">
                        Accepted format: <span className="text-gray-300 font-semibold">PDF only</span> • Max size: <span className="text-gray-300 font-semibold">20 MB</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload & Action Controls */}
              <div className="flex flex-col gap-3 w-full md:w-64 shrink-0">
                <Button
                  onClick={handleUploadPDF}
                  disabled={!file || isUploading}
                  className="w-full py-3.5 flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 font-semibold shadow-lg shadow-brand-primary/20"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{processingStep || 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Study Kit</span>
                    </>
                  )}
                </Button>

                {noteResult && (
                  <Button
                    onClick={() => {
                      setFile(null);
                      setNoteResult(null);
                      setError(null);
                    }}
                    variant="outline"
                    className="w-full py-2.5 flex items-center justify-center gap-2 text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Upload Another PDF</span>
                  </Button>
                )}
              </div>
            </div>

            {/* PROGRESS AND THINKING ANIMATION */}
            {isUploading && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>Study Agent AI Workflow: {processingStep}</span>
                  </div>
                  <span className="text-gray-400">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-dark-900 rounded-full overflow-hidden border border-white/10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-brand-primary via-purple-500 to-brand-secondary"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-gray-500 mt-2 font-medium">
                  <span className={uploadProgress >= 20 ? 'text-brand-primary' : ''}>1. Read PDF</span>
                  <span className={uploadProgress >= 45 ? 'text-brand-primary' : ''}>2. Analyze</span>
                  <span className={uploadProgress >= 65 ? 'text-brand-primary' : ''}>3. Summary</span>
                  <span className={uploadProgress >= 85 ? 'text-brand-primary' : ''}>4. Quiz</span>
                  <span className={uploadProgress >= 95 ? 'text-brand-primary' : ''}>5. Flashcards</span>
                </div>
              </div>
            )}
          </GlassCard>

          {/* GENERATED RESULTS NAVIGATION & TABS */}
          {noteResult && (
            <div className="space-y-6">
              {/* ACTION BUTTONS HEADER */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-dark-900/60 p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-brand-primary" />
                  <div>
                    <h3 className="text-base font-semibold text-white">{noteResult.fileName}</h3>
                    <p className="text-xs text-gray-400">
                      Generated • {(noteResult.fileSize / (1024 * 1024)).toFixed(2)} MB • {noteResult.mcqs.length} MCQs • {noteResult.flashcards.length} Cards
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={handleDownloadSummary}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Summary</span>
                  </Button>

                  <Button
                    onClick={handleCopySummary}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
                  </Button>

                  <Button
                    onClick={handleDownloadQuiz}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Quiz</span>
                  </Button>

                  <Button
                    onClick={handleDownloadFlashcards}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Flashcards</span>
                  </Button>

                  <Button
                    onClick={handleUploadPDF}
                    size="sm"
                    className="flex items-center gap-1.5 text-xs bg-brand-primary/20 text-brand-primary hover:bg-brand-primary/30 border border-brand-primary/40"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Generate Again</span>
                  </Button>
                </div>
              </div>

              {/* TABS SWITCHER */}
              <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
                {[
                  { id: 'summary', label: 'Summary', icon: <FileText className="w-4 h-4" /> },
                  { id: 'quiz', label: 'Quiz (10 MCQs)', icon: <Award className="w-4 h-4" /> },
                  { id: 'flashcards', label: 'Flashcards', icon: <Layers className="w-4 h-4" /> },
                  { id: 'definitions', label: 'Definitions', icon: <BookOpen className="w-4 h-4" /> },
                  { id: 'interview', label: 'Interview Q&A', icon: <Brain className="w-4 h-4" /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md shadow-brand-primary/20 font-semibold'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* TAB 1: SUMMARY */}
              {activeTab === 'summary' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <GlassCard className="p-6 border border-white/10 lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-brand-primary" />
                        <span>AI Student Summary</span>
                      </h3>
                      <span className="text-xs text-gray-400">Concise Academic Synthesis</span>
                    </div>
                    <div className="prose prose-invert max-w-none text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                      {noteResult.summary}
                    </div>
                  </GlassCard>

                  <GlassCard className="p-6 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-brand-primary" />
                        <span>Core Key Points</span>
                      </h3>
                      <span className="text-xs text-gray-400">{noteResult.keyPoints.length} Points</span>
                    </div>
                    <ul className="space-y-3">
                      {noteResult.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-300 bg-white/5 p-3 rounded-xl border border-white/5">
                          <span className="w-5 h-5 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </div>
              )}

              {/* TAB 2: QUIZ (10 MCQs) */}
              {activeTab === 'quiz' && (
                <GlassCard className="p-6 border border-white/10 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Award className="w-5 h-5 text-brand-primary" />
                        <span>Interactive Multiple-Choice Quiz (10 MCQs)</span>
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Test your comprehension of the uploaded PDF notes.
                      </p>
                    </div>

                    {quizSubmitted && (
                      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-primary/20 to-purple-500/20 border border-brand-primary/40">
                        <Award className="w-5 h-5 text-brand-primary" />
                        <span className="text-sm font-semibold text-white">
                          Score: <span className="text-brand-primary">{quizScore}</span> / {noteResult.mcqs.length} (
                          {Math.round((quizScore / (noteResult.mcqs.length || 1)) * 100)}%)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {noteResult.mcqs.map((mcq, idx) => {
                      const userAns = selectedAnswers[idx];
                      const isCorrect = userAns === mcq.correctAnswer;
                      return (
                        <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <h4 className="text-base font-semibold text-white">
                              <span className="text-brand-primary mr-2">Q{idx + 1}.</span>
                              {mcq.question}
                            </h4>
                            {quizSubmitted && (
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                                  isCorrect 
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                }`}
                              >
                                {isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {mcq.options.map((opt, optIdx) => {
                              const isSelected = userAns === opt;
                              const isThisCorrect = quizSubmitted && opt === mcq.correctAnswer;
                              const isThisWrong = quizSubmitted && isSelected && !isCorrect;

                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => {
                                    if (!quizSubmitted) {
                                      setSelectedAnswers(prev => ({ ...prev, [idx]: opt }));
                                    }
                                  }}
                                  disabled={quizSubmitted}
                                  className={`p-3.5 rounded-xl text-left text-sm transition-all border flex items-center justify-between ${
                                    isThisCorrect
                                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-medium'
                                      : isThisWrong
                                      ? 'bg-red-500/20 border-red-500 text-red-200'
                                      : isSelected
                                      ? 'bg-brand-primary/25 border-brand-primary text-white font-medium'
                                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                                  }`}
                                >
                                  <span>{opt}</span>
                                  {isThisCorrect && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                                  {isThisWrong && <X className="w-4 h-4 text-red-400 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>

                          {quizSubmitted && !isCorrect && (
                            <div className="text-xs text-emerald-300 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                              <span className="font-semibold">Correct Answer:</span> {mcq.correctAnswer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* QUIZ CONTROLS */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    {!quizSubmitted ? (
                      <Button
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(selectedAnswers).length === 0}
                        className="px-8 py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary font-semibold"
                      >
                        Submit Quiz & Check Answers
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setSelectedAnswers({});
                          setQuizSubmitted(false);
                          setQuizScore(0);
                        }}
                        variant="outline"
                        className="px-6 py-2"
                      >
                        Retake Quiz
                      </Button>
                    )}
                  </div>
                </GlassCard>
              )}

              {/* TAB 3: FLASHCARDS */}
              {activeTab === 'flashcards' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-brand-primary" />
                      <span>Interactive Revision Flashcards</span>
                    </h3>
                    <span className="text-xs text-gray-400">
                      Card {flashcardIndex + 1} of {noteResult.flashcards.length || 1}
                    </span>
                  </div>

                  {noteResult.flashcards.length > 0 ? (
                    <div className="flex flex-col items-center gap-6">
                      {/* FLIP CARD */}
                      <div
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="w-full max-w-xl h-80 perspective cursor-pointer"
                      >
                        <motion.div
                          className="w-full h-full relative"
                          animate={{ rotateY: isFlipped ? 180 : 0 }}
                          transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
                          style={{ transformStyle: 'preserve-3d' }}
                        >
                          {/* FRONT */}
                          <div
                            className="absolute inset-0 w-full h-full p-8 rounded-3xl bg-gradient-to-br from-dark-800 to-dark-900 border border-brand-primary/40 shadow-2xl flex flex-col justify-between"
                            style={{ backfaceVisibility: 'hidden' }}
                          >
                            <div className="flex justify-between items-center text-xs font-semibold text-brand-primary">
                              <span>FLASHCARD QUESTION</span>
                              <span>Click card to flip</span>
                            </div>
                            <div className="text-center my-auto">
                              <h4 className="text-xl font-bold text-white leading-snug">
                                {noteResult.flashcards[flashcardIndex].front}
                              </h4>
                            </div>
                            <div className="text-center text-xs text-gray-500">
                              Front side
                            </div>
                          </div>

                          {/* BACK */}
                          <div
                            className="absolute inset-0 w-full h-full p-8 rounded-3xl bg-gradient-to-br from-brand-primary/20 to-purple-900/30 border border-brand-primary shadow-2xl flex flex-col justify-between"
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                          >
                            <div className="flex justify-between items-center text-xs font-semibold text-emerald-400">
                              <span>EXPLANATION / ANSWER</span>
                              <span>Click card to flip</span>
                            </div>
                            <div className="text-center my-auto overflow-y-auto max-h-48 pr-2">
                              <p className="text-base text-gray-100 leading-relaxed">
                                {noteResult.flashcards[flashcardIndex].back}
                              </p>
                            </div>
                            <div className="text-center text-xs text-gray-400">
                              Back side
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* NAVIGATION BUTTONS */}
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={() => {
                            setIsFlipped(false);
                            setFlashcardIndex(prev => (prev > 0 ? prev - 1 : noteResult.flashcards.length - 1));
                          }}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Previous Card</span>
                        </Button>
                        <span className="text-sm font-semibold text-white px-4 py-1.5 rounded-full bg-white/10">
                          {flashcardIndex + 1} / {noteResult.flashcards.length}
                        </span>
                        <Button
                          onClick={() => {
                            setIsFlipped(false);
                            setFlashcardIndex(prev => (prev < noteResult.flashcards.length - 1 ? prev + 1 : 0));
                          }}
                          className="flex items-center gap-2"
                        >
                          <span>Next Card</span>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-400 bg-white/5 rounded-2xl border border-white/10">
                      No flashcards generated for this document.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: DEFINITIONS */}
              {activeTab === 'definitions' && (
                <GlassCard className="p-6 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-brand-primary" />
                      <span>Important Academic Definitions</span>
                    </h3>
                    <span className="text-xs text-gray-400">{noteResult.definitions.length} Terms</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {noteResult.definitions.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <h4 className="text-sm font-bold text-brand-primary flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand-primary shrink-0" />
                          <span>{item.term}</span>
                        </h4>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {item.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* TAB 5: INTERVIEW Q&A */}
              {activeTab === 'interview' && (
                <GlassCard className="p-6 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Brain className="w-5 h-5 text-brand-primary" />
                      <span>Technical Interview Questions & Answers</span>
                    </h3>
                    <span className="text-xs text-gray-400">{noteResult.interviewQuestions.length} Q&As</span>
                  </div>

                  <div className="space-y-4">
                    {noteResult.interviewQuestions.map((iq, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                        <h4 className="text-sm font-bold text-white flex items-start gap-2">
                          <span className="text-brand-primary shrink-0">Q{idx + 1}.</span>
                          <span>{iq.question}</span>
                        </h4>
                        <div className="p-3 rounded-xl bg-dark-900/50 border border-white/5 text-xs text-gray-300 leading-relaxed">
                          <span className="font-semibold text-emerald-400 mr-2">Answer:</span>
                          {iq.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODE 2: CONVERSATIONAL STUDY Q&A ASSISTANT */}
      {mode === 'chat' && (
        <GlassCard className="p-6 border border-white/10 flex flex-col h-[700px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-primary/20 text-brand-primary">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Study Q&A Assistant</h3>
                <p className="text-xs text-gray-400">
                  Ask any computer science or academic question. Examples: Explain Binary Trees, Explain OS Scheduling, etc.
                </p>
              </div>
            </div>
            {noteResult && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-xs text-brand-primary">
                <FileText className="w-3.5 h-3.5" />
                <span>Context: {noteResult.fileName}</span>
              </div>
            )}
          </div>

          {/* SAMPLE QUESTIONS CHIPS */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs text-gray-400 self-center mr-1">Sample Questions:</span>
            {SAMPLE_QUESTIONS.map((sq, idx) => (
              <button
                key={idx}
                onClick={() => handleAskQuestion(sq)}
                disabled={isAsking}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-brand-primary/20 hover:text-brand-primary text-gray-300 border border-white/10 transition-colors"
              >
                {sq}
              </button>
            ))}
          </div>

          {/* CHAT MESSAGES CONTAINER */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'agent' && (
                  <div className="w-8 h-8 rounded-xl bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-brand-primary shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-2xl p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-tr-none'
                      : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-none whitespace-pre-line'
                  }`}
                >
                  {msg.sender === 'agent' && (
                    <div className="mb-2 pb-1.5 border-b border-white/5 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        • {msg.agent || 'Study Agent'}
                      </span>
                    </div>
                  )}
                  <p>{msg.text}</p>
                  <span className="block text-[10px] opacity-60 mt-1.5 text-right">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            {isAsking && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-brand-primary shrink-0">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-brand-primary animate-spin" />
                  <span>Study Agent is thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* CHAT INPUT FORM */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskQuestion();
            }}
            className="flex items-center gap-2 border-t border-white/10 pt-4"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask anything (e.g. Explain Binary Trees, Difference between Stack and Queue)..."
              disabled={isAsking}
              className="flex-1 px-4 py-3 rounded-xl bg-dark-900/80 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-primary"
            />
            <Button
              type="submit"
              disabled={!chatInput.trim() || isAsking}
              className="px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary flex items-center gap-2"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </GlassCard>
      )}
    </div>
  );
}
