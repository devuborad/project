import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Target, Brain, AlertTriangle, Calendar, BookOpen, Briefcase, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';

// A simple circular progress component using SVG
const ProgressRing = ({ value, label, color }: { value: number, label: string, color: string }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="transform -rotate-90 w-32 h-32">
          <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-800" />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent"
            strokeDasharray={circumference}
            className={color}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute text-2xl font-bold text-white">{value}%</div>
      </div>
      <span className="mt-2 text-sm font-medium text-gray-400">{label}</span>
    </div>
  );
};

export function AIAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLatest();
  }, []);

  const fetchLatest = async () => {
    try {
      const token = localStorage.getItem('campus_token');
      const res = await fetch('http://localhost:5000/api/recommendations/latest', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.success && result.data) {
        setData(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch latest insights');
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('campus_token');
      const res = await fetch('http://localhost:5000/api/recommendations/generate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'Failed to generate insights');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Brain className="w-16 h-16 text-red-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white">Synthesizing Your Profile...</h2>
        <p className="text-gray-400 max-w-md text-center">Gemini is analyzing your attendance, assignments, and skills to build a personalized roadmap.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-red-500" />
            AI Recommendation Engine
          </h1>
          <p className="text-gray-500 mt-1">Predictive analytics and personalized career pathways.</p>
        </div>
        <Button variant="gradient" onClick={handleGenerate} className="bg-gradient-to-r from-red-600 to-red-800 border-none">
          <RefreshCw className="w-4 h-4 mr-2" /> {data ? "Refresh Insights" : "Generate Insights"}
        </Button>
      </div>

      {error && <div className="p-4 bg-red-500/20 text-red-400 rounded-xl border border-red-500/50">{error}</div>}

      {!data && !loading && !error && (
        <GlassCard className="p-12 text-center border-red-500/20 bg-black/40">
          <Brain className="w-20 h-20 text-gray-600 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-white mb-2">No Insights Generated Yet</h3>
          <p className="text-gray-400 mb-8">Click the button above to let Gemini analyze your academic profile.</p>
        </GlassCard>
      )}

      <AnimatePresence>
        {data && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* Top Row: Progress Rings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard className="p-8 bg-black/40 border-white/5 flex flex-col items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6"><TrendingUp className="text-blue-500"/> Opportunity Score</h3>
                <ProgressRing value={data.scores.opportunity} label="Based on market demand" color="text-blue-500" />
              </GlassCard>
              <GlassCard className="p-8 bg-black/40 border-white/5 flex flex-col items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6"><Briefcase className="text-purple-500"/> Career Potential</h3>
                <ProgressRing value={data.scores.career} label="Skill alignment" color="text-purple-500" />
              </GlassCard>
              <GlassCard className="p-8 bg-black/40 border-white/5 flex flex-col items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6"><Target className="text-green-500"/> Readiness</h3>
                <ProgressRing value={data.scores.readiness} label="Academic performance" color="text-green-500" />
              </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Insights Panel */}
              <GlassCard className="p-8 bg-black/40 border-red-500/20 lg:col-span-2">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Brain className="text-red-500"/> AI Recommendations
                </h3>
                <div className="space-y-4">
                  {data.insights.map((insight: string, idx: number) => (
                    <motion.div 
                      initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }}
                      key={idx} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-start gap-3"
                    >
                      <Sparkles className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-gray-200 leading-relaxed">{insight}</p>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>

              {/* Sidebar Alerts */}
              <div className="space-y-6">
                <GlassCard className="p-6 bg-red-950/20 border-red-500/30">
                  <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2"><AlertTriangle /> Risk Alerts</h3>
                  {data.riskAlerts && data.riskAlerts.length > 0 ? (
                    <div className="space-y-3">
                      {data.riskAlerts.map((alert: any, i: number) => (
                        <div key={i} className={`p-3 rounded-lg border ${alert.severity === 'High' ? 'bg-red-500/20 border-red-500/50 text-red-200' : 'bg-orange-500/20 border-orange-500/50 text-orange-200'}`}>
                          <span className="text-xs font-bold uppercase mb-1 block">{alert.severity} Priority</span>
                          {alert.message}
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-gray-400">No critical risks identified. Great job!</p>}
                </GlassCard>
                
                <GlassCard className="p-6 bg-black/40 border-white/5">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Calendar className="text-blue-400" /> Upcoming Deadlines</h3>
                  {data.upcomingDeadlines && data.upcomingDeadlines.length > 0 ? (
                    <ul className="space-y-2">
                      {data.upcomingDeadlines.map((d: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                          <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" /> {d}
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-gray-400">No immediate deadlines.</p>}
                </GlassCard>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-6 bg-black/40 border-white/5">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><BookOpen className="text-emerald-400"/> Learning Path</h3>
                <div className="space-y-3">
                  {data.learningSuggestions?.map((s: string, i: number) => (
                    <div key={i} className="group flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-transparent transition-all cursor-pointer">
                      <span className="text-gray-300 group-hover:text-emerald-200">{s}</span>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-400" />
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-6 bg-black/40 border-white/5">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Target className="text-amber-400"/> Suggested Events & Clubs</h3>
                <div className="space-y-3">
                  {data.recommendedEvents?.map((e: string, i: number) => (
                    <div key={i} className="group flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-amber-500/10 hover:border-amber-500/30 border border-transparent transition-all cursor-pointer">
                      <span className="text-gray-300 group-hover:text-amber-200">{e}</span>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-amber-400" />
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
