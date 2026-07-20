import { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Users, FileCheck, Database, Activity } from 'lucide-react';

export function AdminOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const token = localStorage.getItem('campus_token');
        const response = await fetch('http://localhost:5000/api/admin/overview', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const resData = await response.json();
          setData(resData);
        }
      } catch (error) {
        console.error('Error fetching admin overview:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">System Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage all aspects of the CampusAI platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-primary">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '-' : data?.totalUsers || 0}</h3>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-500">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Clubs</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '-' : data?.activeClubs || 0}</h3>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">System Health</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Excellent</h3>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Approvals</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '-' : data?.pendingApprovals || 0}</h3>
            </div>
          </div>
        </GlassCard>
      </div>
      
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity Logs</h2>
        <div className="space-y-4">
          {loading ? (
            <p className="text-gray-500">Loading activity...</p>
          ) : data?.recentActivity?.length > 0 ? (
            data.recentActivity.map((activity: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                <Activity className="w-5 h-5 text-gray-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.description}</p>
                  <p className="text-xs text-gray-500">{new Date(activity.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No recent activity.</p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
