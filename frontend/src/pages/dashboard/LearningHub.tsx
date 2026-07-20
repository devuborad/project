import { useState, useEffect, useRef } from 'react';
import { Search, Filter, BookOpen, FileText, Download, PlayCircle, Folder, Loader2 } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';

const subjectsList = ['All', 'Computer Science', 'Mathematics', 'Physics', 'Literature', 'Other'];

export function LearningHub() {
  const [activeSubject, setActiveSubject] = useState('All');
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchNotes = async (subject = '') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('campus_token');
      const url = `http://localhost:5000/api/notes${subject && subject !== 'All' ? `?subject=${encodeURIComponent(subject)}` : ''}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes(activeSubject);
  }, [activeSubject]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    formData.append('subject', activeSubject === 'All' ? 'Computer Science' : activeSubject);
    formData.append('file_type', file.type.includes('pdf') ? 'PDF' : file.type.includes('image') ? 'IMAGE' : 'OTHER');

    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/notes/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        fetchNotes(activeSubject); // Refresh list
      } else {
        alert('Failed to upload note');
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'PDF': return <FileText className="w-5 h-5 text-red-400" />;
      case 'IMAGE': return <FileText className="w-5 h-5 text-blue-400" />;
      case 'PPT': return <BookOpen className="w-5 h-5 text-orange-400" />;
      default: return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Smart Learning Hub</h1>
          <p className="text-gray-600 dark:text-gray-400">Access AI-organized notes, materials, and past papers.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search materials..." 
              className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full py-2 pl-9 pr-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-primary focus:bg-gray-200 dark:bg-white/10 w-full md:w-64 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Folders / Categories */}
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {subjectsList.map((subject) => (
          <button
            key={subject}
            onClick={() => setActiveSubject(subject)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeSubject === subject 
                ? 'bg-brand-primary text-gray-900 dark:text-white shadow-[0_0_15px_rgba(255,31,77,0.3)]' 
                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:bg-white/10 hover:text-gray-900 dark:text-white border border-gray-100 dark:border-white/5'
            }`}
          >
            {subject}
          </button>
        ))}
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center text-gray-500">Loading materials...</div>
        ) : (
          notes.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="p-5 flex flex-col group h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getIcon(item.file_type)}
                  </div>
                  <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-brand-primary transition-colors cursor-pointer">
                    <Download className="w-4 h-4" />
                  </a>
                </div>
                <h3 className="text-gray-900 dark:text-white font-medium mb-1 group-hover:text-brand-primary transition-colors line-clamp-2" title={item.title}>
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 mb-4">{item.subject} • by {item.first_name}</p>
                
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  <span>{formatSize(parseInt(item.file_size || '0'))}</span>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
        
        {/* Upload Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard 
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`p-5 flex flex-col items-center justify-center text-center h-[200px] border-dashed border-2 border-gray-200 dark:border-white/10 hover:border-brand-primary/50 bg-transparent hover:bg-brand-primary/5 cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-brand-primary animate-spin mb-3" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                <Folder className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            )}
            <h3 className="text-gray-900 dark:text-white font-medium mb-1">{isUploading ? 'Uploading...' : 'Upload Material'}</h3>
            <p className="text-xs text-gray-500 max-w-[160px]">Click to browse files</p>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png"
            />
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
