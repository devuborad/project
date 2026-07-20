import { useState, useEffect, useRef } from 'react';
import { FileText, Download, UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';

export function ResumeStudio() {
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchResume = async () => {
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/students/resume', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setResume(data);
      } else {
        setResume(null);
      }
    } catch (error) {
      console.error('Error fetching resume:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/students/resume', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        fetchResume();
      } else {
        alert('Failed to upload resume');
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Left Column: ATS Score & Suggestions */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <GlassCard className="p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-primary/5" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 relative z-10">ATS Match Score</h2>
          
          <div className="relative w-40 h-40 flex items-center justify-center mb-6 z-10">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" className="stroke-gray-200 dark:stroke-white/10" strokeWidth="12" fill="none" />
              {resume && (
                <circle 
                  cx="80" cy="80" r="70" 
                  className="stroke-brand-primary" 
                  strokeWidth="12" fill="none" 
                  strokeDasharray="440" 
                  strokeDashoffset={440 - (440 * resume.ats_score) / 100} 
                  strokeLinecap="round" 
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {resume ? resume.ats_score : 0}<span className="text-xl text-gray-600 dark:text-gray-400">%</span>
              </span>
              <span className="text-xs text-brand-primary font-medium mt-1">
                {resume ? (resume.ats_score >= 85 ? 'Excellent' : resume.ats_score >= 70 ? 'Good' : 'Needs Work') : 'No Data'}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 relative z-10">
            {resume ? resume.feedback : 'Upload a resume to get your ATS score and feedback.'}
          </p>
        </GlassCard>

        {resume && (
          <GlassCard className="p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">AI Suggestions</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Formatting Check</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">PDF format detected. Machine readable.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-xl bg-brand-primary/10 border border-brand-primary/20">
                <AlertCircle className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Missing Keywords</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Depending on your field, adding specific software or methodology keywords could improve this score.</p>
                </div>
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Right Column: Resume Preview */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resume Manager</h2>
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleUpload} 
              accept=".pdf"
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />} 
              {resume ? 'Update' : 'Upload'}
            </Button>
            {resume && (
              <Button variant="gradient" size="sm" onClick={() => window.open(resume.file_url, '_blank')}>
                <Download className="w-4 h-4 mr-2" /> View/Download PDF
              </Button>
            )}
          </div>
        </div>

        <GlassCard className="flex-1 min-h-[600px] p-2 flex items-center justify-center bg-white/[0.02] border-dashed border-2 border-gray-200 dark:border-white/10">
          {loading ? (
            <div className="text-gray-500">Loading resume...</div>
          ) : resume ? (
            <div className="w-full h-full min-h-[600px] flex items-center justify-center flex-col">
               <FileText className="w-16 h-16 text-brand-primary mb-4" />
               <p className="text-gray-900 dark:text-white font-medium">Your resume is uploaded securely.</p>
               <p className="text-sm text-gray-500 mt-2">Uploaded on {new Date(resume.uploaded_at).toLocaleString()}</p>
               <Button className="mt-4" variant="outline" onClick={() => window.open(resume.file_url, '_blank')}>View Document</Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center max-w-sm">
              <UploadCloud className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Resume Found</h3>
              <p className="text-sm text-gray-500 mb-6">Upload your PDF resume to get an instant AI ATS score and feedback.</p>
              <Button variant="gradient" onClick={() => fileInputRef.current?.click()}>
                Upload PDF
              </Button>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
