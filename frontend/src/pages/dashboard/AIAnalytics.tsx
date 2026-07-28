import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Brain, RefreshCw, Bot, Clock, Layers, Activity } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';

// Circular progress SVG component
const ProgressRing = ({ value, label, color }: { value: number, label: string, color: string }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="transform -rotate-90 w-32 h-32">
          <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200 dark:text-gray-800" />
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
        <div className="absolute text-2xl font-bold text-gray-900 dark:text-white">{value}%</div>
      </div>
      <span className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
    </div>
  );
};

export function AIAnalytics() {
  const [_data, setData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLatest();
    fetchUserAnalytics();
  }, []);

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('campus_token') || '';

  const fetchLatest = async () => {
    try {
      const token = getToken();
      const res = await fetch('/api/recommendations/latest', {
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

  const fetchUserAnalytics = async () => {
    try {
      const token = getToken();
      const res = await fetch('/api/analytics/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.success && result.data) {
        setAnalyticsData(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch user analytics:', err);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch('/api/recommendations/generate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setData(result.data);
        await fetchUserAnalytics();
      } else {
        setError(result.error || 'Failed to generate new AI recommendations');
      }
    } catch (err) {
      setError('Error connecting to AI Neural Engine.');
    } finally {
      setLoading(false);
    }
  };

  const stats = analyticsData?.stats || {
    total_study_hours: 24,
    weekly_progress_percent: 88,
    attendance_trend_percent: 84,
    completed_assignments: 5,
    generated_quizzes: 7,
    pdf_upload_count: 3
  };

  const memory = analyticsData?.memory || {
    student_name: 'Student',
    department: 'Computer Science & Engineering',
    semester: '6th Semester',
    preferred_learning_style: 'Visual & Code Examples',
    study_habits: 'Prefers step-by-step breakdowns and practice quizzes.',
    weak_topics: ['Operating Systems Concurrency', 'Database Indexing', 'Graph Algorithms']
  };

  const recentWorkflows = analyticsData?.recentWorkflows || [];
  const agentUtilization = analyticsData?.agentUtilization || [
    { agent_name: 'Study Agent', usage_count: 14, avg_time_ms: 820 },
    { agent_name: 'Campus Assistant', usage_count: 8, avg_time_ms: 450 },
    { agent_name: 'Assignment Agent', usage_count: 6, avg_time_ms: 380 },
    { agent_name: 'Career Agent', usage_count: 4, avg_time_ms: 910 }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              Neural Engine 4.0
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Autonomous Platform Analytics</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            AI Analytics & Long-Term Memory
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Real-time multi-agent activity, RAG knowledge indexing, and personalized student memory timeline.
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl shadow-lg bg-brand-gradient text-white font-semibold hover:opacity-95 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Synthesizing Data...' : 'Refresh AI Analytics'}
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Top Progress Rings & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 flex flex-col items-center justify-center text-center">
          <ProgressRing value={stats.weekly_progress_percent || 88} label="Weekly Goal Progress" color="text-brand-primary" />
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{stats.total_study_hours || 24} total study hours logged</span>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col items-center justify-center text-center">
          <ProgressRing value={stats.attendance_trend_percent || 85} label="Attendance Safety Score" color="text-emerald-500" />
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Safe above 75% mandatory threshold</span>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-xs font-semibold text-purple-500 bg-purple-500/10 px-2.5 py-1 rounded-full">RAG Indexed</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.pdf_upload_count || 3} PDFs</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Active in Vector Knowledge Base</p>
          </div>
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Quizzes Auto-Generated</span>
            <span className="font-bold text-gray-900 dark:text-white">{stats.generated_quizzes || 7}</span>
          </div>
        </GlassCard>
      </div>

      {/* Student Long-Term AI Memory Context Card */}
      <GlassCard className="p-6 border-l-4 border-brand-primary">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Student Long-Term AI Memory</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Persistent context injected automatically into all agent interactions
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Active Sync
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="p-3.5 rounded-2xl bg-gray-100/60 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5">
            <p className="text-[11px] text-gray-400 font-semibold uppercase">Department</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{memory.department}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-gray-100/60 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5">
            <p className="text-[11px] text-gray-400 font-semibold uppercase">Semester</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{memory.semester}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-gray-100/60 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5">
            <p className="text-[11px] text-gray-400 font-semibold uppercase">Learning Style</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{memory.preferred_learning_style}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-gray-100/60 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5">
            <p className="text-[11px] text-gray-400 font-semibold uppercase">Study Window</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{memory.study_habits}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mr-2">Known Weak Topics:</span>
          {(memory.weak_topics || []).map((topic: string, i: number) => (
            <span key={i} className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-semibold">
              {topic}
            </span>
          ))}
        </div>
      </GlassCard>

      {/* Multi-Agent Utilization & Autonomous Workflow Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Utilization Card */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">Agent Utilization</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Activity breakdown by agent specialization</p>
              </div>
            </div>
            <span className="text-xs text-purple-500 font-bold">4 Specialized Agents</span>
          </div>

          <div className="space-y-4">
            {agentUtilization.map((agent: any, i: number) => {
              const maxCount = Math.max(...agentUtilization.map((a: any) => Number(a.usage_count) || 1), 1);
              const pct = Math.round(((Number(agent.usage_count) || 1) / maxCount) * 100);
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-900 dark:text-white">{agent.agent_name}</span>
                    <span className="text-gray-500">{agent.usage_count} calls ({agent.avg_time_ms ? `${Math.round(agent.avg_time_ms)}ms avg` : 'fast'})</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-purple-500 to-brand-primary rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Recent Workflows Activity Feed */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">Autonomous Workflow Feed</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">n8n and scheduled automation triggers</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Live Feed
            </span>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {recentWorkflows.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                Autonomous scheduler is active. No logs yet.
              </div>
            ) : (
              recentWorkflows.map((wf: any, idx: number) => (
                <div key={idx} className="p-3 rounded-2xl bg-gray-100/60 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                      <Activity className="w-4 h-4 text-brand-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{wf.workflow_name}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">Trigger: {wf.trigger_type}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 uppercase">
                    {wf.status || 'success'}
                  </span>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
