import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Clock, BookOpen, AlertCircle, TrendingUp, Sparkles, ChevronRight, Briefcase, FileText } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { FacultyOverview } from './FacultyOverview';

export function DashboardOverview() {
  const [user] = useState<any>(() => {
    const userStr = localStorage.getItem('campus_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  if (user?.role === 'faculty') {
    return <FacultyOverview />;
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 text-gray-900 dark:text-white shadow-[0_0_40px_rgba(255,31,77,0.2)]"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[80px] rounded-full pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-4 border border-white/20">
              <Sparkles className="w-3 h-3" />
              AI Daily Briefing
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Good morning, {user?.first_name || 'Student'}!</h1>
            <p className="text-white/80 max-w-xl">
              You have 2 assignments due today and a Computer Networks lecture in 45 minutes. I've prepared a quick review of your previous notes.
            </p>
          </div>
          <div className="shrink-0">
            <Button variant="glass" className="bg-white/20 border-white/30 text-gray-900 dark:text-white hover:bg-white/30">
              <Bot className="w-5 h-5 mr-2" />
              Start Review Session
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column (2/3) */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassCard className="p-4 flex flex-col gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Attendance</span>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">85%</span>
                <span className="text-xs text-green-400 mb-1 flex items-center"><TrendingUp className="w-3 h-3 mr-1" />+2%</span>
              </div>
            </GlassCard>
            <GlassCard className="p-4 flex flex-col gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">CGPA</span>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">8.9</span>
                <span className="text-xs text-brand-primary mb-1 flex items-center">Top 10%</span>
              </div>
            </GlassCard>
            <GlassCard className="p-4 flex flex-col gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Study Hours</span>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">24h</span>
                <span className="text-xs text-gray-500 mb-1">this week</span>
              </div>
            </GlassCard>
            <GlassCard className="p-4 flex flex-col gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Tasks Done</span>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">12</span>
                <span className="text-xs text-gray-500 mb-1">/ 15</span>
              </div>
            </GlassCard>
          </div>

          {/* Upcoming Schedule */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Today's Schedule</h2>
              <button className="text-sm text-brand-primary hover:text-brand-secondary transition-colors flex items-center">
                View Calendar <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              {[
                { time: '09:00 AM', title: 'Computer Networks', type: 'Lecture', color: 'bg-blue-500/20 text-blue-400 border-blue-500/20' },
                { time: '11:30 AM', title: 'Data Structures Lab', type: 'Lab', color: 'bg-purple-500/20 text-purple-400 border-purple-500/20' },
                { time: '02:00 PM', title: 'AI Study Group', type: 'Meeting', color: 'bg-brand-primary/20 text-brand-primary border-brand-primary/20' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:bg-white/[0.04] transition-colors group cursor-pointer">
                  <div className="w-20 shrink-0 text-sm font-medium text-gray-600 dark:text-gray-400 mt-0.5">{item.time}</div>
                  <div className="w-2 h-2 rounded-full bg-gray-600 mt-2 shrink-0 group-hover:bg-brand-primary transition-colors" />
                  <div className="flex-1">
                    <h4 className="text-gray-900 dark:text-white font-medium mb-1 group-hover:text-brand-primary transition-colors">{item.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-md border ${item.color}`}>
                      {item.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>

        {/* Right Column (1/3) */}
        <div className="flex flex-col gap-6">
          
          {/* AI Suggestions */}
          <GlassCard className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-[40px] rounded-full" />
            <div className="flex items-center gap-2 mb-6 relative z-10">
              <Bot className="w-5 h-5 text-brand-primary" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Copilot Suggestions</h2>
            </div>
            
            <div className="flex flex-col gap-3 relative z-10">
              <div className="p-4 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 cursor-pointer hover:bg-brand-primary/20 transition-colors">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-gray-900 dark:text-white text-sm font-medium mb-1">DBMS Assignment Due</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Due tonight at 11:59 PM. You are 70% complete. Want me to review your SQL queries?</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-gray-200 dark:border-white/10 cursor-pointer hover:bg-white/[0.06] transition-colors">
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-gray-600 dark:text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-gray-900 dark:text-white text-sm font-medium mb-1">New Internship Match</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Google just posted a SWE Intern role matching your React skills. Apply before Friday.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-gray-200 dark:border-white/10 cursor-pointer hover:bg-white/[0.06] transition-colors">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-gray-600 dark:text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-gray-900 dark:text-white text-sm font-medium mb-1">Notes Summarized</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">I've created a mind map for yesterday's OS lecture.</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard className="p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:bg-white/[0.05] hover:border-gray-200 dark:border-white/10 transition-all group text-gray-600 dark:text-gray-400 hover:text-brand-primary">
                <FileText className="w-6 h-6" />
                <span className="text-xs font-medium text-center">Scan Notes</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:bg-white/[0.05] hover:border-gray-200 dark:border-white/10 transition-all group text-gray-600 dark:text-gray-400 hover:text-brand-primary">
                <Clock className="w-6 h-6" />
                <span className="text-xs font-medium text-center">Log Hours</span>
              </button>
            </div>
          </GlassCard>

        </div>
      </div>
    </div>
  );
}
