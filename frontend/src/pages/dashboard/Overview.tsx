import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Clock, BookOpen, AlertCircle, TrendingUp, Sparkles, ChevronRight, Briefcase, FileText, X, CheckCircle2, FileSearch, Compass, Target, Lightbulb } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { FacultyOverview } from './FacultyOverview';
import { useNavigate } from 'react-router-dom';

export function DashboardOverview() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const navigate = useNavigate();

  // Modal states
  const [activeModal, setActiveModal] = useState<'attendance' | 'cgpa' | 'tasks' | null>(null);
  const [modalData, setModalData] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('campus_user');
    if (userStr) {
      try { setUser(JSON.parse(userStr)); } catch (e) {}
    }

    const fetchOverview = async () => {
      try {
        const token = localStorage.getItem('campus_token');
        const response = await fetch('http://localhost:5000/api/students/overview', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const resData = await response.json();
          setData(resData);
        }
      } catch (error) {
        console.error('Error fetching overview:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSuggestions = async () => {
      try {
        const token = localStorage.getItem('campus_token');
        const res = await fetch('http://localhost:5000/api/ai/suggestions', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const resData = await res.json();
          setAiSuggestions(resData);
        }
      } catch (error) {
        console.error('Error fetching AI suggestions:', error);
      } finally {
        setSuggestionsLoading(false);
      }
    };
    
    // Only fetch if student
    if (userStr && JSON.parse(userStr).role !== 'faculty') {
      fetchOverview();
      fetchSuggestions();
    } else {
      setLoading(false);
      setSuggestionsLoading(false);
    }
  }, []);

  const openModal = async (type: 'attendance' | 'cgpa' | 'tasks') => {
    setActiveModal(type);
    setModalLoading(true);
    setModalData([]);
    try {
      const token = localStorage.getItem('campus_token');
      let endpoint = '';
      if (type === 'attendance') endpoint = '/attendance-details';
      else if (type === 'cgpa') endpoint = '/grades';
      else if (type === 'tasks') endpoint = '/completed-tasks';

      const response = await fetch(`http://localhost:5000/api/students${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const resData = await response.json();
        setModalData(resData);
      }
    } catch (error) {
      console.error(`Error fetching ${type} details:`, error);
    } finally {
      setModalLoading(false);
    }
  };

  if (user?.role === 'faculty') {
    return <FacultyOverview />;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center text-gray-500 min-h-[60vh] gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
        <p className="text-sm font-semibold">Synchronizing Neural Workspace...</p>
      </div>
    );
  }

  const attendance = data?.attendance || 0;
  const tasksDone = data?.tasksDone || 0;
  const totalTasks = data?.totalTasks || 0;
  const upcomingSchedule = data?.upcomingSchedule || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto relative pb-12">
      {/* Supercharged Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-brand-dark via-gray-900 to-brand-dark p-8 sm:p-10 text-white shadow-2xl border border-white/15"
      >
        {/* Ambient Aurora Orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/25 blur-[100px] rounded-full pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-purple-500/20 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-xl rounded-full text-xs font-bold mb-4 border border-white/20 text-brand-primary shadow-sm">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>AI DAILY ACADEMIC BRIEFING</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-2.5 tracking-tight">
              Welcome back, <span className="text-gradient">{user?.first_name || 'Student'}</span>!
            </h1>
            <p className="text-gray-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              You have <span className="font-bold text-white">{totalTasks - tasksDone} assignments</span> pending review. {upcomingSchedule.length > 0 ? `Your next lecture is "${upcomingSchedule[0]?.title}" at ${upcomingSchedule[0]?.time}.` : 'No upcoming classes scheduled for today.'}
            </p>
          </div>
          <div className="shrink-0">
            <Button 
              variant="gradient" 
              onClick={() => navigate('/learning-hub')}
              className="px-6 py-3.5 font-bold rounded-2xl shadow-xl shadow-brand-primary/30 flex items-center gap-2"
            >
              <Bot className="w-5 h-5 text-white" />
              <span>Launch AI Workspace</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column (2/3) */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <GlassCard 
              className="p-5 flex flex-col justify-between cursor-pointer border border-gray-200/80 dark:border-white/10 hover:border-brand-primary/50 transition-all group" 
              onClick={() => openModal('attendance')}
              hoverEffect={true}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Attendance</span>
                <Clock className="w-4 h-4 text-brand-primary group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-gray-900 dark:text-white">{attendance}%</span>
                {attendance >= 75 ? (
                  <span className="text-xs font-bold text-green-500 flex items-center"><TrendingUp className="w-3 h-3 mr-0.5" />Optimal</span>
                ) : (
                  <span className="text-xs font-bold text-red-500 flex items-center"><AlertCircle className="w-3 h-3 mr-0.5" />Low</span>
                )}
              </div>
              <span className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">Click to view log →</span>
            </GlassCard>

            <GlassCard 
              className="p-5 flex flex-col justify-between cursor-pointer border border-gray-200/80 dark:border-white/10 hover:border-brand-primary/50 transition-all group" 
              onClick={() => openModal('cgpa')}
              hoverEffect={true}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">CGPA</span>
                <TrendingUp className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-gray-900 dark:text-white">{data?.cgpa || 'N/A'}</span>
              </div>
              <span className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">Semester grades →</span>
            </GlassCard>

            <GlassCard className="p-5 flex flex-col justify-between border border-gray-200/80 dark:border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Study Hours</span>
                <BookOpen className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-gray-900 dark:text-white">{data?.studyHours || 0}h</span>
                <span className="text-xs text-gray-500">this week</span>
              </div>
              <span className="text-[10px] text-green-500 mt-2 font-semibold">↑ 12% vs last week</span>
            </GlassCard>

            <GlassCard 
              className="p-5 flex flex-col justify-between cursor-pointer border border-gray-200/80 dark:border-white/10 hover:border-brand-primary/50 transition-all group" 
              onClick={() => openModal('tasks')}
              hoverEffect={true}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Tasks Done</span>
                <CheckCircle2 className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-gray-900 dark:text-white">{tasksDone}</span>
                <span className="text-xs text-gray-500">/ {totalTasks}</span>
              </div>
              <span className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">Completed queue →</span>
            </GlassCard>
          </div>

          {/* Upcoming Schedule */}
          <GlassCard className="p-7 border border-gray-200/80 dark:border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Schedule</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Live academic timetable and classroom locations</p>
              </div>
              <button 
                onClick={() => navigate('/learning-hub')} 
                className="text-xs font-semibold text-brand-primary hover:text-brand-secondary transition-colors flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-primary/10"
              >
                <span>View Full Calendar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-3.5">
              {upcomingSchedule.length > 0 ? upcomingSchedule.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 hover:border-brand-primary/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-16 shrink-0 text-xs font-mono font-bold text-brand-primary px-2.5 py-1.5 rounded-xl bg-brand-primary/10 text-center">
                      {item.time}
                    </div>
                    <div>
                      <h4 className="text-gray-900 dark:text-white font-bold text-sm sm:text-base group-hover:text-brand-primary transition-colors">{item.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.course}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20">
                    Live Session
                  </span>
                </div>
              )) : (
                <div className="p-8 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 text-center">
                  <p className="text-gray-500 text-sm font-medium">No classes scheduled for today. Enjoy your study time!</p>
                </div>
              )}
            </div>
          </GlassCard>

        </div>

        {/* Right Column (1/3) */}
        <div className="flex flex-col gap-6">
          
          {/* Multi-Agent AI Suggestions */}
          <GlassCard className="p-6 relative overflow-hidden border border-brand-primary/30 bg-gradient-to-br from-white/95 via-white/70 to-transparent dark:from-white/[0.05] dark:via-white/[0.02] dark:to-transparent">
            <div className="absolute top-0 right-0 w-36 h-36 bg-brand-primary/15 blur-[45px] rounded-full pointer-events-none" />
            
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-brand-gradient flex items-center justify-center shadow-md shadow-brand-primary/30">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">Multi-Agent AI Suggestions</h2>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">4 Active Campus Agents</span>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                Live AI
              </span>
            </div>

            {suggestionsLoading ? (
              <div className="py-8 text-center text-xs text-gray-500 dark:text-gray-400 animate-pulse">
                Consulting Attendance, Assignment & Career Agents...
              </div>
            ) : aiSuggestions ? (
              <div className="flex flex-col gap-3.5 relative z-10">
                {/* 1. Today's Study Goal (Campus Assistant) */}
                <div 
                  onClick={() => navigate('/dashboard/study-agent')}
                  className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/25 cursor-pointer hover:bg-purple-500/15 transition-all group shadow-sm"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                      <Target className="w-3 h-3" /> Today's Study Goal
                    </span>
                    <span className="text-[10px] font-semibold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full">
                      Campus Assistant
                    </span>
                  </div>
                  <h4 className="text-gray-900 dark:text-white text-xs font-bold mb-1 group-hover:text-purple-400 transition-colors">
                    {aiSuggestions.todayStudyGoal?.title || "Complete 2 hours of focused assignment work"}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 whitespace-pre-line leading-relaxed">
                    {aiSuggestions.todayStudyGoal?.content || "- [ ] Complete draft for urgent assignment\n- [ ] Review lecture slide deck"}
                  </p>
                </div>

                {/* 2. Attendance Alert (Attendance Agent) */}
                <div 
                  onClick={() => openModal('attendance')}
                  className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 cursor-pointer hover:bg-amber-500/15 transition-all group shadow-sm"
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      <Clock className="w-3 h-3" /> Attendance Alert
                    </span>
                    <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">
                      Attendance Agent
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-200 font-medium">
                    {aiSuggestions.attendanceAlert?.message || "Optimal attendance! You can safely skip up to 2 lectures."}
                  </p>
                </div>

                {/* 3. Priority Assignment (Assignment Agent) */}
                <div 
                  onClick={() => openModal('tasks')}
                  className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/25 cursor-pointer hover:bg-blue-500/15 transition-all group shadow-sm"
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                      <FileText className="w-3 h-3" /> Priority Assignment
                    </span>
                    <span className="text-[10px] font-semibold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full">
                      Assignment Agent
                    </span>
                  </div>
                  <h4 className="text-gray-900 dark:text-white text-xs font-bold">
                    {aiSuggestions.upcomingAssignment?.title || "No urgent assignments pending"}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Course: {aiSuggestions.upcomingAssignment?.course || "All courses up to date"} | Due: {aiSuggestions.upcomingAssignment?.dueDate || "N/A"}
                  </p>
                </div>

                {/* 4. Recommended Skills (Career Agent) */}
                <div 
                  onClick={() => navigate('/opportunity-hub')}
                  className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/25 cursor-pointer hover:bg-pink-500/15 transition-all group shadow-sm"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-pink-400 uppercase tracking-wider">
                      <Briefcase className="w-3 h-3" /> Recommended Skills
                    </span>
                    <span className="text-[10px] font-semibold text-pink-300 bg-pink-500/20 px-2 py-0.5 rounded-full">
                      Career Agent
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {aiSuggestions.recommendedSkills?.map((skill: string, i: number) => (
                      <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-white/10 dark:bg-black/20 text-gray-800 dark:text-gray-200 border border-white/10">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 5. AI Generated Daily Tip */}
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 shadow-sm">
                  <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    <span className="font-bold text-emerald-400 mr-1">💡 Tip of the Day:</span>
                    {aiSuggestions.aiGeneratedTips?.[0] || "Use the 50/10 Pomodoro rule: 50 minutes of deep study, 10 minutes away from screens."}
                  </p>
                </div>
              </div>
            ) : null}
          </GlassCard>

          {/* Quick AI Tool Launchers */}
          <GlassCard className="p-6 border border-gray-200/80 dark:border-white/10">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Neural AI Toolkit</h2>
            <div className="grid grid-cols-2 gap-2.5">
              <button 
                onClick={() => navigate('/dashboard/study-agent')}
                className="col-span-2 flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-brand-primary/20 to-brand-secondary/10 border border-brand-primary/40 hover:border-brand-primary transition-all text-left group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-brand-primary" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-brand-primary transition-colors block">Study Agent (New)</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block">AI Academic Tutor & PDF Kit</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary text-white">PRO</span>
              </button>

              <button 
                onClick={() => navigate('/learning-hub')}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-100/70 dark:bg-white/[0.04] border border-gray-200/70 dark:border-white/10 hover:border-brand-primary/50 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200 group-hover:text-brand-primary transition-colors">Learning Hub</span>
              </button>

              <button 
                onClick={() => navigate('/opportunity-hub')}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-100/70 dark:bg-white/[0.04] border border-gray-200/70 dark:border-white/10 hover:border-brand-primary/50 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200 group-hover:text-brand-primary transition-colors">Opportunities</span>
              </button>

              <button 
                onClick={() => navigate('/resume-analyzer')}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-100/70 dark:bg-white/[0.04] border border-gray-200/70 dark:border-white/10 hover:border-brand-primary/50 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                  <FileSearch className="w-4 h-4 text-yellow-400" />
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200 group-hover:text-brand-primary transition-colors">Resume AI</span>
              </button>

              <button 
                onClick={() => navigate('/roadmap-generator')}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-100/70 dark:bg-white/[0.04] border border-gray-200/70 dark:border-white/10 hover:border-brand-primary/50 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200 group-hover:text-brand-primary transition-colors">AI Roadmap</span>
              </button>
            </div>
          </GlassCard>

          {/* Recent Faculty Activity */}
          <GlassCard className="p-6 border border-gray-200/80 dark:border-white/10">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Recent Campus Activity</h2>
            <div className="flex flex-col gap-3.5">
              {recentActivity.length > 0 ? recentActivity.map((item: any, i: number) => (
                <div key={i} className="flex flex-col gap-1.5 pb-3 border-b border-gray-200/60 dark:border-white/5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{item.title}</span>
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary shrink-0">
                      {item.type}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-gray-500">
                    <span className="font-medium text-gray-600 dark:text-gray-400">{item.course}</span>
                    <span>{item.first_name} {item.last_name}</span>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-xs py-2">No recent campus activity broadcasted.</p>
              )}
            </div>
          </GlassCard>

        </div>
      </div>


      {/* Detail Modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-brand-dark border border-gray-200 dark:border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh]"
            >
              <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/[0.02]">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                  {activeModal === 'attendance' && 'Detailed Attendance'}
                  {activeModal === 'cgpa' && 'Academic Results'}
                  {activeModal === 'tasks' && 'Completed Assignments'}
                </h3>
                <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-red-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
                {modalLoading ? (
                  <div className="text-center text-gray-500 py-8">Loading...</div>
                ) : modalData.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">No records found.</div>
                ) : (
                  modalData.map((item, i) => (
                    <div key={i} className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Course: <span className="text-brand-primary">{item.course}</span>
                        </p>
                      </div>
                      
                      {activeModal === 'attendance' && (
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${item.status === 'Present' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'}`}>
                            {item.status}
                          </span>
                          <p className="text-xs text-gray-500 mt-2">{new Date(item.date).toLocaleDateString()} at {item.time}</p>
                        </div>
                      )}

                      {activeModal === 'cgpa' && (
                        <div className="text-right flex flex-col items-end">
                          <span className="text-xl font-bold text-gray-900 dark:text-white">{item.grade}</span>
                          <span className="text-xs text-gray-500">Grade</span>
                        </div>
                      )}

                      {activeModal === 'tasks' && (
                        <div className="text-right">
                          <span className="text-xs text-green-600 dark:text-green-400 flex items-center justify-end gap-1 mb-1">
                            <CheckCircle2 className="w-3 h-3" /> Submitted
                          </span>
                          <p className="text-xs text-gray-500">on {new Date(item.submitted_at).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


