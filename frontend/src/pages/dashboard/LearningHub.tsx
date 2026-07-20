import { useState } from 'react';
import { Search, Filter, BookOpen, FileText, Download, PlayCircle, Folder } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { motion } from 'framer-motion';

const subjects = ['All', 'Computer Science', 'Mathematics', 'Physics', 'Literature'];

const materials = [
  { id: 1, title: 'Operating Systems - Chapter 4', type: 'Notes', subject: 'Computer Science', date: '2 days ago', size: '2.4 MB', icon: <FileText className="w-5 h-5 text-blue-400" /> },
  { id: 2, title: 'Linear Algebra Midterm 2023', type: 'Past Papers', subject: 'Mathematics', date: '1 week ago', size: '1.1 MB', icon: <BookOpen className="w-5 h-5 text-purple-400" /> },
  { id: 3, title: 'Quantum Mechanics Intro', type: 'Lectures', subject: 'Physics', date: '3 days ago', size: '45 mins', icon: <PlayCircle className="w-5 h-5 text-brand-primary" /> },
  { id: 4, title: 'Database Normalization PDF', type: 'Notes', subject: 'Computer Science', date: 'Just now', size: '3.8 MB', icon: <FileText className="w-5 h-5 text-blue-400" /> },
];

export function LearningHub() {
  const [activeSubject, setActiveSubject] = useState('All');

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
          <button className="p-2 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-gray-200 dark:bg-white/10 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Folders / Categories */}
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {subjects.map((subject) => (
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
        {materials.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="p-5 flex flex-col group cursor-pointer h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <button className="text-gray-500 hover:text-brand-primary transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-gray-900 dark:text-white font-medium mb-1 group-hover:text-brand-primary transition-colors line-clamp-2">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 mb-4">{item.subject}</p>
              
              <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>{item.date}</span>
                <span>{item.size}</span>
              </div>
            </GlassCard>
          </motion.div>
        ))}
        
        {/* Upload Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard className="p-5 flex flex-col items-center justify-center text-center h-full border-dashed border-2 border-gray-200 dark:border-white/10 hover:border-brand-primary/50 bg-transparent hover:bg-brand-primary/5 cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
              <Folder className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-1">Upload Material</h3>
            <p className="text-xs text-gray-500 max-w-[160px]">Drag and drop files or click to browse</p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
