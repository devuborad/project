import { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Users, Calendar, Trophy, Star } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function ClubAdminOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const token = localStorage.getItem('campus_token');
        const response = await fetch('http://localhost:5000/api/clubs/overview', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const resData = await response.json();
          setData(resData);
        }
      } catch (error) {
        console.error('Error fetching club overview:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Club Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your club, events, and members.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-primary">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Members</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '-' : data?.activeMembers || 0}</h3>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-500">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming Events</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '-' : data?.upcomingEvents || 0}</h3>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Hackathons</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '-' : data?.hackathons || 0}</h3>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-500">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Club Rating</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '-' : data?.rating || 'N/A'}</h3>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Event Registrations</h2>
        <div className="space-y-4">
          {loading ? (
            <p className="text-gray-500">Loading registrations...</p>
          ) : data?.recentRegistrations?.length > 0 ? (
            data.recentRegistrations.map((reg: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/20 overflow-hidden shrink-0">
                    <img src={reg.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${reg.first_name}`} alt="Avatar" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{reg.first_name} {reg.last_name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-xs">Registered for {reg.title}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{new Date(reg.registered_at).toLocaleDateString()}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No recent registrations.</p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
