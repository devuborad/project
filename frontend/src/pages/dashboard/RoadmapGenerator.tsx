import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, BookOpen, Code, Briefcase, GraduationCap, 
  ArrowRight, ArrowLeft, Download, CheckCircle2,
  Clock, Target, Compass, PlayCircle, FileText
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function RoadmapGenerator() {
  const [step, setStep] = useState(1);
  const [, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const pdfRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    year: '3rd Year',
    semester: '5th Semester',
    branch: 'Computer Science',
    cgpa: '8.5',
    skills: '',
    languages: '',
    frameworks: '',
    interests: '',
    careerGoal: '',
    duration: '6 Months',
    hoursPerDay: '3'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setStep(4); // Processing step

    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/roadmap/generate', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setResult(data.roadmap);
        setStep(5); // Results step
      } else {
        setError(data.error || 'Failed to generate roadmap');
        setStep(3);
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      setStep(3);
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
      pdf.save('AI_Learning_Roadmap.pdf');
    } catch (err) {
      console.error('Error generating PDF', err);
    }
  };

  const renderWizard = () => (
    <GlassCard className="p-8 bg-black/40 border-red-500/20 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -z-10 -translate-y-1/2 rounded-full">
          <div className="h-full bg-red-500 rounded-full transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }} />
        </div>
        {[1, 2, 3].map((num) => (
          <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= num ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-gray-800 text-gray-500'}`}>
            {num}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><GraduationCap className="text-red-500"/> Academic Profile</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Year</label>
                <select name="year" value={formData.year} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none">
                  <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Semester</label>
                <select name="semester" value={formData.semester} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none">
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s}>{s}th Semester</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Branch</label>
                <input name="branch" value={formData.branch} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none" placeholder="e.g. Computer Science" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Current CGPA</label>
                <input name="cgpa" value={formData.cgpa} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none" placeholder="e.g. 8.5" />
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Code className="text-red-500"/> Current Skills</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Programming Languages (Comma separated)</label>
                <input name="languages" value={formData.languages} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none" placeholder="e.g. Python, Java, C++" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Frameworks & Tools</label>
                <input name="frameworks" value={formData.frameworks} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none" placeholder="e.g. React, Node.js, Docker" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Other Skills (Soft skills, domains)</label>
                <input name="skills" value={formData.skills} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none" placeholder="e.g. UI/UX, Public Speaking, Data Analysis" />
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Target className="text-red-500"/> Goals & Availability</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Specific Career Goal</label>
                <input name="careerGoal" value={formData.careerGoal} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none" placeholder="e.g. Full Stack Developer at FAANG, Data Scientist" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Key Interests</label>
                <input name="interests" value={formData.interests} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none" placeholder="e.g. Web3, AI, Open Source" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Target Duration</label>
                  <select name="duration" value={formData.duration} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none">
                    <option>3 Months</option><option>6 Months</option><option>1 Year</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Hours Dedicated per Day</label>
                  <select name="hoursPerDay" value={formData.hoursPerDay} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none">
                    <option>1-2 Hours</option><option>3-4 Hours</option><option>5+ Hours</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={handlePrev} disabled={step === 1}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        {step < 3 ? (
          <Button variant="gradient" onClick={handleNext} className="bg-gradient-to-r from-red-600 to-red-800 border-none">
            Next <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button variant="gradient" onClick={handleSubmit} className="bg-gradient-to-r from-red-600 to-red-800 border-none">
            Generate AI Roadmap <Compass className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
    </GlassCard>
  );

  const renderList = (items: string[]) => (
    <ul className="space-y-3">
      {items?.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
          <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /> {item}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Supercharged Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="ai-badge !py-1 !px-3 !text-xs">SEMESTER ROADMAP ARCHITECT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            AI Roadmap <span className="text-gradient">Generator</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1.5 text-sm sm:text-base">
            Navigate your career with personalized, AI-generated semester milestones and custom study modules.
          </p>
        </div>
        {result && (
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => { setResult(null); setStep(1); }}>Start Over</Button>
            <Button variant="gradient" onClick={downloadPDF} className="shadow-lg shadow-brand-primary/30">
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
          </div>
        )}
      </div>

      {step <= 3 && renderWizard()}

      {step === 4 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative w-32 h-32 mb-8">
            <motion.div className="absolute inset-0 border-t-4 border-red-500 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
            <Map className="absolute inset-0 m-auto w-12 h-12 text-red-400 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Architecting your Future...</h3>
          <p className="text-gray-400">Synthesizing 18 custom modules just for you.</p>
        </div>
      )}

      {step === 5 && result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6" ref={pdfRef}>
          
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {['Overview', 'Roadmaps', 'Resources', 'Career Prep'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${activeTab === tab ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'Overview' && (
              <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <GlassCard className="p-8 bg-black/40 border-red-500/20">
                  <h3 className="text-xl font-bold text-white mb-4">Your Executive Summary</h3>
                  <p className="text-gray-300 leading-relaxed text-lg">{result.learningRoadmap}</p>
                </GlassCard>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <GlassCard className="p-6 bg-black/40 border-white/5">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Clock className="text-red-400"/> Weekly Plan</h3>
                    {renderList(result.weeklyPlan)}
                  </GlassCard>
                  <GlassCard className="p-6 bg-black/40 border-white/5">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Target className="text-red-400"/> Monthly Milestones</h3>
                    {renderList(result.monthlyMilestones)}
                  </GlassCard>
                </div>
              </motion.div>
            )}

            {activeTab === 'Roadmaps' && (
              <motion.div key="roadmaps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassCard className="p-6 bg-black/40 border-white/5">
                    <h3 className="font-bold text-white mb-4">Core Technologies</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.recommendedTechnologies?.map((tech: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-300 rounded-md text-sm">{tech}</span>
                      ))}
                    </div>
                  </GlassCard>
                  <GlassCard className="p-6 bg-black/40 border-white/5">
                    <h3 className="font-bold text-white mb-4">Data Structures & Algorithms</h3>
                    {renderList(result.dsaRoadmap)}
                  </GlassCard>
                  <GlassCard className="p-6 bg-black/40 border-white/5">
                    <h3 className="font-bold text-white mb-4">Development Pathway</h3>
                    {renderList(result.developmentRoadmap)}
                  </GlassCard>
                  <GlassCard className="p-6 bg-black/40 border-white/5">
                    <h3 className="font-bold text-white mb-4">AI / ML / DevOps Essentials</h3>
                    {renderList([...(result.aiMlRoadmap||[]), ...(result.devOpsRoadmap||[])])}
                  </GlassCard>
                </div>
              </motion.div>
            )}

            {activeTab === 'Resources' && (
              <motion.div key="resources" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <GlassCard className="p-6 bg-black/40 border-white/5">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><PlayCircle className="text-red-400"/> YouTube Channels</h3>
                    {renderList(result.youtubeChannels)}
                  </GlassCard>
                  <GlassCard className="p-6 bg-black/40 border-white/5">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><BookOpen className="text-red-400"/> Free Resources & Books</h3>
                    {renderList([...(result.freeResources||[]), ...(result.books||[])])}
                  </GlassCard>
                  <GlassCard className="p-6 bg-black/40 border-white/5">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Code className="text-red-400"/> GitHub Ideas</h3>
                    {renderList(result.githubIdeas)}
                  </GlassCard>
                </div>
              </motion.div>
            )}

            {activeTab === 'Career Prep' && (
              <motion.div key="career" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassCard className="p-6 bg-black/40 border-white/5">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Briefcase className="text-red-400"/> Placement & Interview</h3>
                    {renderList([...(result.interviewPrepTimeline||[]), ...(result.placementPrep||[])])}
                  </GlassCard>
                  <GlassCard className="p-6 bg-black/40 border-white/5">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><FileText className="text-red-400"/> Resume & Internships</h3>
                    {renderList([...(result.resumeImprovement||[]), ...(result.internshipTimeline||[])])}
                  </GlassCard>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
