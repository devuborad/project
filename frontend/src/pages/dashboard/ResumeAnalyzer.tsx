import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { 
  UploadCloud, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Briefcase,
  Award,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';

ChartJS.register(ArcElement, Tooltip, Legend);

export function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size is 5MB.');
      return;
    }
    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/resume/analyze', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setResult(data.analysis);
      } else {
        setError(data.error || 'Analysis failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const doughnutData = {
    labels: ['Match', 'Gap'],
    datasets: [
      {
        data: result ? [result.atsScore, 100 - result.atsScore] : [0, 100],
        backgroundColor: ['#ef4444', '#1f2937'], // Red & Dark Gray
        borderWidth: 0,
        cutout: '80%',
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Supercharged Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="ai-badge !py-1 !px-3 !text-xs">ATS 99% SIMULATION ENGINE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            AI Resume <span className="text-gradient">Analyzer</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1.5 text-sm sm:text-base">
            Get algorithmic ATS scoring, recruiter keyword gaps, and tailored career feedback in seconds.
          </p>
        </div>
        {result && (
          <Button variant="outline" onClick={() => { setResult(null); setFile(null); }}>
            Analyze Another Resume
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <GlassCard className="p-10 sm:p-14 border border-brand-primary/20 bg-gradient-to-br from-white/90 via-white/50 to-transparent dark:from-white/[0.05] dark:via-white/[0.02] dark:to-transparent">
              <div 
                className="border-2 border-dashed border-brand-primary/40 rounded-3xl p-12 text-center relative hover:border-brand-primary/80 transition-all duration-300 bg-gray-50/50 dark:bg-white/[0.01]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
              >
                {!loading ? (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-brand-gradient rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand-primary/30">
                      <UploadCloud className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Drag & Drop your Resume</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Strictly PDF documents up to 5MB</p>
                    
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileInput} 
                      accept=".pdf"
                    />
                    
                    {file && (
                      <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                        <FileText className="w-6 h-6 text-red-400" />
                        <span className="text-white font-medium">{file.name}</span>
                        <button onClick={() => setFile(null)} className="ml-auto text-gray-400 hover:text-white">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {error && (
                      <div className="mb-6 text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                      </div>
                    )}

                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        Browse Files
                      </Button>
                      <Button 
                        variant="gradient" 
                        disabled={!file} 
                        onClick={handleUpload}
                        className="bg-gradient-to-r from-red-600 to-red-800 border-none"
                      >
                        Analyze Now
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-12">
                    <div className="relative w-24 h-24 mb-8">
                      <motion.div
                        className="absolute inset-0 border-t-4 border-red-500 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      />
                      <FileText className="absolute inset-0 m-auto w-10 h-10 text-red-400 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Analyzing Resume...</h3>
                    <p className="text-gray-400">Extracting text, running ATS simulation, and generating feedback.</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Top Row: Score & Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <GlassCard className="p-8 flex flex-col items-center justify-center text-center col-span-1 bg-black/40 border-red-500/20">
                <h3 className="text-xl font-bold text-white mb-6">ATS Match Score</h3>
                <div className="relative w-48 h-48 mb-4">
                  <Doughnut 
                    data={doughnutData} 
                    options={{ cutout: '85%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }} 
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-5xl font-black text-white"
                    >
                      {result.atsScore}
                    </motion.span>
                    <span className="text-sm text-red-400 font-medium">/ 100</span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-8 col-span-1 lg:col-span-2 bg-black/40 border-white/5">
                <h3 className="text-xl font-bold text-white mb-4">Professional Summary</h3>
                <p className="text-gray-300 leading-relaxed text-lg">{result.summary}</p>
                
                <div className="mt-8">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Career Path Recommendation</h4>
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                    <Briefcase className="w-6 h-6 text-red-400" />
                    <span className="text-white font-medium">{result.careerPath}</span>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Middle Row: Strengths, Weaknesses, Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Strengths */}
              <GlassCard className="p-6 bg-gradient-to-b from-green-500/5 to-transparent border-green-500/20">
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-bold text-white">Key Strengths</h3>
                </div>
                <ul className="space-y-3">
                  {result.strengths.map((s: string, i: number) => (
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      key={i} className="flex items-start gap-2 text-sm text-gray-300"
                    >
                      <ChevronRight className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      {s}
                    </motion.li>
                  ))}
                </ul>
              </GlassCard>

              {/* Weaknesses */}
              <GlassCard className="p-6 bg-gradient-to-b from-red-500/5 to-transparent border-red-500/20">
                <div className="flex items-center gap-2 mb-6">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  <h3 className="text-lg font-bold text-white">Areas for Improvement</h3>
                </div>
                <ul className="space-y-3">
                  {result.weaknesses.map((w: string, i: number) => (
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      key={i} className="flex items-start gap-2 text-sm text-gray-300"
                    >
                      <ChevronRight className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      {w}
                    </motion.li>
                  ))}
                </ul>
              </GlassCard>

              {/* Missing Skills */}
              <GlassCard className="p-6 bg-black/40 border-white/5">
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">Missing Technical Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.map((skill: string, i: number) => (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                      key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Bottom Row: Priority Timeline & Tips */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard className="p-8 bg-black/40 border-white/5">
                <h3 className="text-xl font-bold text-white mb-6">Priority Improvements Timeline</h3>
                <div className="relative border-l-2 border-red-500/30 ml-4 space-y-8">
                  {result.priority.map((p: string, i: number) => (
                    <div key={i} className="relative pl-6">
                      <div className="absolute w-4 h-4 bg-red-500 rounded-full -left-[9px] top-1 ring-4 ring-black" />
                      <p className="text-gray-300">{p}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <div className="space-y-6">
                <GlassCard className="p-6 bg-black/40 border-white/5">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-6 h-6 text-yellow-400" />
                    <h3 className="font-bold text-white">Recommended Certifications</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.certifications.map((c: string, i: number) => (
                      <li key={i} className="text-sm text-gray-400 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> {c}
                      </li>
                    ))}
                  </ul>
                </GlassCard>

                <GlassCard className="p-6 bg-black/40 border-white/5">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-6 h-6 text-purple-400" />
                    <h3 className="font-bold text-white">Interview Preparation Tips</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.interviewTips.map((t: string, i: number) => (
                      <li key={i} className="text-sm text-gray-400 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" /> {t}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
