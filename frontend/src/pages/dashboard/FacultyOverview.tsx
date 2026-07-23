import { useState, useEffect } from 'react';
import { Users, BookOpen, Calendar, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';

export function FacultyOverview() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('campus_user');
    if (userStr) {
      try { setUser(JSON.parse(userStr)); } catch (e) {}
    }

    const fetchOverview = async () => {
      try {
        const token = localStorage.getItem('campus_token');
        const response = await fetch('http://localhost:5000/api/faculty/overview', {
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
    fetchOverview();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading overview...</div>;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Good morning, Professor {user?.last_name || user?.first_name || ''}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Here's what's happening in your classes today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{data?.totalStudents || 0}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Total Enrolled Students</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{data?.activeAssignments || 0}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Active Assignments</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{data?.upcomingLectures || 0}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Upcoming Scheduled Lectures</p>
        </GlassCard>
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Submissions</h2>
          <div className="space-y-4">
            {data?.recentSubmissions?.map((sub: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-purple-500 p-[2px]">
                    <div className="w-full h-full bg-gray-100 dark:bg-brand-dark rounded-full overflow-hidden transition-colors">
                      <img src={sub.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${sub.first_name}`} alt="Avatar" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{sub.first_name} {sub.last_name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">Submitted {sub.title}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{new Date(sub.submitted_at).toLocaleDateString()}</span>
              </div>
            ))}
            {(!data?.recentSubmissions || data.recentSubmissions.length === 0) && (
              <p className="text-sm text-gray-500">No recent submissions.</p>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Upcoming Schedule</h2>
          <div className="space-y-4">
            {data?.upcomingSchedule?.map((lec: any, i: number) => (
              <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-white/5 flex gap-4">
                <div className="flex flex-col items-center justify-center min-w-[60px] bg-brand-primary/10 rounded-lg text-brand-primary">
                  <span className="text-xs font-bold uppercase">{new Date(lec.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-xl font-bold">{new Date(lec.date).getDate()}</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{lec.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{lec.course} • {lec.time}</p>
                </div>
              </div>
            ))}
            {(!data?.upcomingSchedule || data.upcomingSchedule.length === 0) && (
              <p className="text-sm text-gray-500">No upcoming lectures scheduled.</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
