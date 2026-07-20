import { FileText, Download, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';

export function ResumeStudio() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Left Column: ATS Score & Suggestions */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <GlassCard className="p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-primary/5" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 relative z-10">ATS Match Score</h2>
          
          <div className="relative w-40 h-40 flex items-center justify-center mb-6 z-10">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" className="stroke-white/10" strokeWidth="12" fill="none" />
              <circle 
                cx="80" cy="80" r="70" 
                className="stroke-brand-primary" 
                strokeWidth="12" fill="none" 
                strokeDasharray="440" 
                strokeDashoffset="75" 
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">83<span className="text-xl text-gray-600 dark:text-gray-400">%</span></span>
              <span className="text-xs text-brand-primary font-medium mt-1">Excellent</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 relative z-10">Your resume is highly optimized for Software Engineering roles.</p>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">AI Suggestions</h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Strong Action Verbs</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Great job using words like 'Developed' and 'Architected'.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-xl bg-brand-primary/10 border border-brand-primary/20">
              <AlertCircle className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Missing Keywords</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Add 'AWS' and 'Docker' to improve match rate for backend roles.</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Right Column: Resume Preview */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resume Preview</h2>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <UploadCloud className="w-4 h-4 mr-2" /> Update
            </Button>
            <Button variant="gradient" size="sm">
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
          </div>
        </div>

        <GlassCard className="flex-1 min-h-[600px] p-2 flex items-center justify-center bg-white/[0.02]">
          {/* Mock Document */}
          <div className="w-[85%] max-w-[600px] aspect-[1/1.414] bg-white rounded-sm shadow-2xl p-8 flex flex-col">
            <div className="border-b-2 border-gray-800 pb-4 mb-6 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Alex Student</h1>
              <p className="text-sm text-gray-600">alex@college.edu | github.com/alex | linkedin.com/in/alex</p>
            </div>
            
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 mb-2 uppercase text-left tracking-wider">Education</h2>
                <div className="flex justify-between items-start text-left">
                  <div>
                    <h3 className="font-semibold text-gray-800">Stanford University</h3>
                    <p className="text-sm text-gray-600">B.S. in Computer Science</p>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">Expected 2025</span>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 mb-2 uppercase text-left tracking-wider">Experience</h2>
                <div className="flex justify-between items-start text-left mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">Software Engineering Intern</h3>
                    <p className="text-sm text-gray-600 italic">TechCorp Inc.</p>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">Summer 2024</span>
                </div>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 text-left">
                  <li>Developed a microservice using Node.js that reduced API latency by 30%.</li>
                  <li>Architected a new React frontend dashboard for internal data analytics.</li>
                </ul>
              </div>
              
              <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity flex justify-center text-gray-600 dark:text-gray-400">
                <FileText className="w-16 h-16 opacity-10" />
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
