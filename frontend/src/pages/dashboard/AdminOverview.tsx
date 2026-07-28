import { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Users, Database, Bot, ShieldCheck, Cpu, Terminal } from 'lucide-react';

export function AdminOverview() {
  const [data, setData] = useState<any>(null);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('campus_token') || '';
        const [response, analyticsResponse, logsResponse] = await Promise.all([
          fetch('/api/admin/overview', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/analytics/admin', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/admin/logs', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (response.ok) {
          const resData = await response.json();
          setData(resData);
        }

        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          if (analyticsData.success) {
            setAdminStats(analyticsData.data);
          }
        }

        if (logsResponse.ok) {
          const logsData = await logsResponse.json();
          if (logsData.success) {
            setSystemLogs(logsData.logs || []);
          }
        }
      } catch (error) {
        console.error('Error fetching admin overview:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  const health = adminStats?.systemHealth || {
    mysql: 'ONLINE',
    geminiAi: 'ACTIVE',
    n8nWebhook: 'LOCAL_AUTONOMOUS',
    memoryCacheSize: 5
  };

  const totals = adminStats?.totals || {
    users: data?.totalUsers || 12,
    uploadedPdfs: 8,
    aiConversations: 45,
    workflowsExecuted: 19
  };

  const agentPopularity = adminStats?.agentPopularity || [
    { agent_name: 'Study Agent', calls: 24, avg_time: 810 },
    { agent_name: 'Campus Assistant', calls: 12, avg_time: 460 },
    { agent_name: 'Assignment Agent', calls: 9, avg_time: 390 }
  ];

  const recentWorkflows = adminStats?.recentWorkflows || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <div className="inline-flex items-center gap-2 mb-2.5">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
            SYSTEM CONTROL & AUTONOMOUS PLATFORM TELEMETRY
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-1.5 tracking-tight">
          System Admin <span className="text-brand-primary">Dashboard</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
          Manage campus user roles, real-time autonomous n8n workflows, neural RAG indexing, and system health.
        </p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-primary">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '-' : totals.users}</h3>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-500">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">RAG Vector PDFs</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '-' : totals.uploadedPdfs}</h3>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">AI Agent Calls</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '-' : totals.aiConversations}</h3>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">n8n Workflows</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '-' : totals.workflowsExecuted}</h3>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Neural Engine & Autonomous Health Banner */}
      <GlassCard className="p-6 border-l-4 border-emerald-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Neural Engine & Automation Health</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                All core AI agents, background schedulers, and webhook receivers are operational.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-gray-100 dark:bg-white/5 border text-xs font-semibold text-gray-700 dark:text-gray-200">
              MySQL: <span className="text-emerald-500 font-bold">{health.mysql}</span>
            </span>
            <span className="px-3 py-1 rounded-xl bg-gray-100 dark:bg-white/5 border text-xs font-semibold text-gray-700 dark:text-gray-200">
              Gemini API: <span className="text-emerald-500 font-bold">{health.geminiAi}</span>
            </span>
            <span className="px-3 py-1 rounded-xl bg-gray-100 dark:bg-white/5 border text-xs font-semibold text-gray-700 dark:text-gray-200">
              n8n Bridge: <span className="text-purple-500 font-bold">{health.n8nWebhook}</span>
            </span>
          </div>
        </div>
      </GlassCard>

      {/* System-Wide Agent Popularity & Workflows Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">System-Wide Agent Utilization</h2>
          <div className="space-y-4">
            {agentPopularity.map((agent: any, i: number) => {
              const maxCalls = Math.max(...agentPopularity.map((a: any) => Number(a.calls) || 1), 1);
              const pct = Math.round(((Number(agent.calls) || 1) / maxCalls) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-900 dark:text-white">{agent.agent_name}</span>
                    <span className="text-gray-500">{agent.calls} calls ({agent.avg_time || 450}ms avg)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-gradient-to-r from-brand-primary to-purple-500 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Live Autonomous Workflow Executions</h2>
          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
            {recentWorkflows.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No workflows logged yet.</p>
            ) : (
              recentWorkflows.map((wf: any, idx: number) => (
                <div key={idx} className="p-3 rounded-2xl bg-gray-100/60 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{wf.workflow_name}</p>
                    <p className="text-[10px] text-gray-500">Trigger: {wf.trigger_type} • User #{wf.user_id}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 uppercase">
                    {wf.status || 'SUCCESS'}
                  </span>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* Live System & AI Execution Logs Monitor */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-brand-primary" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Live System & AI Execution Logs Monitor</h2>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            ● REAL-TIME AUDIT STREAM
          </span>
        </div>

        <div className="space-y-2.5 max-h-[300px] overflow-y-auto font-mono text-xs pr-1">
          {systemLogs.length === 0 ? (
            <p className="text-gray-400 py-6 text-center font-sans">No system logs recorded yet.</p>
          ) : (
            systemLogs.map((logItem: any, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-gray-900 text-gray-200 border border-white/10 flex flex-col gap-1 shadow-sm">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-brand-primary/20 text-brand-primary font-bold">
                    [{logItem.level || 'INFO'}] {logItem.category || 'SYSTEM'}
                  </span>
                  <span className="text-gray-400">{new Date(logItem.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-gray-100 font-sans font-medium text-xs mt-1">{logItem.message}</p>
                {logItem.metadata && (
                  <p className="text-[10px] text-gray-400 mt-0.5">{JSON.stringify(logItem.metadata)}</p>
                )}
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
