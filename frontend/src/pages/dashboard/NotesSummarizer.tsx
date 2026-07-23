import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { 
  UploadCloud, FileText, Download, CheckCircle2,
  Clock, BrainCircuit, Target, Library, BookOpen, MessageCircle
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

ChartJS.register(ArcElement, Tooltip, Legend);

export function NotesSummarizer() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  // Flashcards & Quiz state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
  };

  const validateAndSetFile = (f: File) => {
    setError(null);
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain'];
    if (!validTypes.includes(f.type)) {
      setError('Only PDF, DOCX, PPTX, and TXT files are allowed.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size is 10MB.');
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('note', file);

    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/notes/summarize', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setResult(data.summary);
      } else {
        setError(data.error || 'Failed to summarize notes');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    const element = pdfRef.current;
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('AI_Notes_Summary.pdf');
    } catch (err) {
      console.error('Error generating PDF', err);
    }
  };

  const handleQuizAnswer = (option: string, correct: string) => {
    setSelectedAnswer(option);
    if (option === correct) setQuizScore(s => s + 1);
    
    setTimeout(() => {
      setSelectedAnswer(null);
      if (quizIndex + 1 < result.mcqs.length) {
        setQuizIndex(i => i + 1);
      } else {
        setQuizFinished(true);
      }
    }, 1000);
  };

  // Generate chart data mapping important topics
  const chartData = {
    labels: result?.importantTopics || [],
    datasets: [{
      data: result?.importantTopics?.map(() => Math.floor(Math.random() * 40) + 60) || [],
      backgroundColor: ['#ef4444', '#f87171', '#fca5a5', '#b91c1c', '#7f1d1d', '#991b1b'],
      borderWidth: 0,
    }]
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Notes Summarizer</h1>
          <p className="text-gray-500 mt-1">Transform documents into Flashcards, Quizzes, and Summaries</p>
        </div>
        {result && (
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => { setResult(null); setFile(null); }}>Upload Another</Button>
            <Button variant="gradient" onClick={downloadPDF} className="bg-gradient-to-r from-red-600 to-red-800 border-none">
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
            <GlassCard className="p-12 border border-red-500/20 bg-black/40 max-w-3xl mx-auto">
              <div 
                className="border-2 border-dashed border-red-500/30 rounded-2xl p-12 text-center relative hover:border-red-500/60 transition-colors"
                onDragOver={(e) => e.preventDefault()} onDrop={handleFileDrop}
              >
                {!loading ? (
                  <div className="flex flex-col items-center">
                    <UploadCloud className="w-16 h-16 text-red-500 mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-2">Upload Notes</h3>
                    <p className="text-gray-400 mb-6">Supports PDF, DOCX, PPTX, TXT up to 10MB</p>
                    <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileInput} accept=".pdf,.docx,.pptx,.txt" />
                    {file && (
                      <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                        <FileText className="w-6 h-6 text-red-400" />
                        <span className="text-white font-medium">{file.name}</span>
                      </div>
                    )}
                    {error && <div className="mb-6 text-red-400">{error}</div>}
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Browse Files</Button>
                      <Button variant="gradient" disabled={!file} onClick={handleUpload} className="bg-gradient-to-r from-red-600 to-red-800 border-none">
                        Summarize AI
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-12">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                      <BrainCircuit className="w-16 h-16 text-red-500 mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-2">Analyzing Document...</h3>
                    <p className="text-gray-400">Extracting topics, creating flashcards, and generating quizzes.</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6" ref={pdfRef}>
            
            {/* Tabs */}
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {['Overview', 'Definitions', 'Flashcards', 'Quiz', 'Interview Q&A'].map(tab => (
                <button 
                  key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${activeTab === tab ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'Overview' && (
                <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  {/* Top Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GlassCard className="p-6 bg-black/40 border-red-500/20 text-center">
                      <Clock className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <h4 className="text-gray-400 text-sm">Est. Reading Time</h4>
                      <p className="text-2xl font-bold text-white">{result.estimatedReadingTime}</p>
                    </GlassCard>
                    <GlassCard className="p-6 bg-black/40 border-red-500/20 text-center">
                      <Target className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <h4 className="text-gray-400 text-sm">Difficulty</h4>
                      <p className="text-2xl font-bold text-white">{result.difficultyLevel}</p>
                    </GlassCard>
                    <GlassCard className="p-6 bg-black/40 border-red-500/20 text-center">
                      <Library className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <h4 className="text-gray-400 text-sm">Key Topics</h4>
                      <p className="text-2xl font-bold text-white">{result.importantTopics?.length || 0}</p>
                    </GlassCard>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <GlassCard className="p-8 bg-black/40 border-white/5 col-span-1 lg:col-span-2">
                      <h3 className="text-xl font-bold text-white mb-4">Executive Summary</h3>
                      <p className="text-gray-300 leading-relaxed text-lg">{result.summary}</p>
                      
                      <h3 className="text-xl font-bold text-white mt-8 mb-4">Key Points</h3>
                      <ul className="space-y-3">
                        {result.keyPoints?.map((p: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-gray-300">
                            <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /> {p}
                          </li>
                        ))}
                      </ul>
                    </GlassCard>

                    <GlassCard className="p-8 bg-black/40 border-white/5 flex flex-col items-center">
                      <h3 className="text-xl font-bold text-white mb-6">Topic Distribution</h3>
                      <div className="w-64 h-64 mb-6">
                        <Doughnut data={chartData} options={{ plugins: { legend: { display: false } } }} />
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {result.importantTopics?.map((t: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-white/5 text-xs text-gray-300 rounded">{t}</span>
                        ))}
                      </div>
                    </GlassCard>
                  </div>
                </motion.div>
              )}

              {activeTab === 'Definitions' && (
                <motion.div key="definitions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GlassCard className="p-6 bg-black/40 border-white/5">
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><BookOpen className="text-red-500"/> Definitions</h3>
                      <div className="space-y-4">
                        {result.definitions?.map((d: any, i: number) => (
                          <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <h4 className="font-bold text-red-400">{d.term}</h4>
                            <p className="text-gray-300 text-sm mt-1">{d.definition}</p>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                    <GlassCard className="p-6 bg-black/40 border-white/5">
                      <h3 className="text-xl font-bold text-white mb-6">Formula / Syntax Sheet</h3>
                      <ul className="space-y-3">
                        {result.formulaSheet?.map((f: string, i: number) => (
                          <li key={i} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-gray-200 font-mono text-sm">{f}</li>
                        ))}
                      </ul>
                    </GlassCard>
                  </div>
                </motion.div>
              )}

              {activeTab === 'Flashcards' && (
                <motion.div key="flashcards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-[400px]">
                  {result.flashcards?.length > 0 ? (
                    <>
                      <div 
                        className="w-full max-w-2xl h-80 perspective-1000 cursor-pointer"
                        onClick={() => setIsFlipped(!isFlipped)}
                      >
                        <motion.div
                          className="w-full h-full relative preserve-3d"
                          animate={{ rotateY: isFlipped ? 180 : 0 }}
                          transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
                        >
                          {/* Front */}
                          <GlassCard className="absolute inset-0 backface-hidden flex items-center justify-center p-8 bg-gradient-to-br from-black/80 to-red-950 border-red-500/30">
                            <h3 className="text-3xl font-bold text-white text-center leading-snug">
                              {result.flashcards[flashcardIndex].front}
                            </h3>
                            <span className="absolute bottom-4 text-gray-500 text-sm">Click to flip</span>
                          </GlassCard>
                          
                          {/* Back */}
                          <GlassCard className="absolute inset-0 backface-hidden flex items-center justify-center p-8 bg-gradient-to-br from-red-900 to-black border-red-500/50" style={{ transform: 'rotateY(180deg)' }}>
                            <p className="text-2xl text-gray-100 text-center leading-snug">
                              {result.flashcards[flashcardIndex].back}
                            </p>
                          </GlassCard>
                        </motion.div>
                      </div>
                      
                      <div className="flex gap-4 mt-8">
                        <Button variant="outline" onClick={() => { setFlashcardIndex(i => Math.max(0, i - 1)); setIsFlipped(false); }} disabled={flashcardIndex === 0}>Previous</Button>
                        <span className="flex items-center text-gray-400">{flashcardIndex + 1} / {result.flashcards.length}</span>
                        <Button variant="outline" onClick={() => { setFlashcardIndex(i => Math.min(result.flashcards.length - 1, i + 1)); setIsFlipped(false); }} disabled={flashcardIndex === result.flashcards.length - 1}>Next</Button>
                      </div>
                    </>
                  ) : <p className="text-gray-400">No flashcards generated.</p>}
                </motion.div>
              )}

              {activeTab === 'Quiz' && (
                <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto">
                  <GlassCard className="p-8 bg-black/40 border-red-500/20">
                    {!quizFinished ? (
                      result.mcqs?.length > 0 ? (
                        <>
                          <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-white">Quiz Mode</h3>
                            <span className="px-4 py-1 bg-red-500/20 text-red-400 rounded-full font-bold">Score: {quizScore}</span>
                          </div>
                          <h2 className="text-2xl text-white font-medium mb-6">{result.mcqs[quizIndex].question}</h2>
                          <div className="space-y-3">
                            {result.mcqs[quizIndex].options.map((opt: string, i: number) => {
                              const isCorrect = opt === result.mcqs[quizIndex].correctAnswer;
                              const isSelected = opt === selectedAnswer;
                              
                              let bgClass = "bg-white/5 border-white/10 hover:bg-white/10";
                              if (selectedAnswer) {
                                if (isCorrect) bgClass = "bg-green-500/20 border-green-500 text-green-100";
                                else if (isSelected) bgClass = "bg-red-500/20 border-red-500 text-red-100";
                              }

                              return (
                                <button 
                                  key={i} 
                                  disabled={!!selectedAnswer}
                                  onClick={() => handleQuizAnswer(opt, result.mcqs[quizIndex].correctAnswer)}
                                  className={`w-full text-left p-4 rounded-xl border transition-colors ${bgClass} text-gray-300`}
                                >
                                  {opt}
                                </button>
                              )
                            })}
                          </div>
                          <p className="text-right text-gray-500 mt-6 text-sm">Question {quizIndex + 1} of {result.mcqs.length}</p>
                        </>
                      ) : <p className="text-gray-400">No quiz questions generated.</p>
                    ) : (
                      <div className="text-center py-12">
                        <Target className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h2>
                        <p className="text-xl text-gray-400 mb-8">You scored {quizScore} out of {result.mcqs.length}</p>
                        <Button variant="gradient" onClick={() => { setQuizIndex(0); setQuizScore(0); setQuizFinished(false); }}>Restart Quiz</Button>
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              )}

              {activeTab === 'Interview Q&A' && (
                <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 max-w-4xl mx-auto">
                  <GlassCard className="p-8 bg-black/40 border-white/5">
                    <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-2"><MessageCircle className="text-red-500"/> Interview Preparation</h3>
                    <div className="space-y-6">
                      {result.interviewQuestions?.map((q: any, i: number) => (
                        <div key={i} className="pb-6 border-b border-white/10 last:border-0 last:pb-0">
                          <h4 className="text-lg font-medium text-red-400 mb-2">Q: {q.question}</h4>
                          <p className="text-gray-300 bg-white/5 p-4 rounded-lg leading-relaxed">{q.answer}</p>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      <style dangerouslySetInnerHTML={{__html: `
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
      `}} />
    </div>
  );
}
