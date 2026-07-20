import { useState, useEffect } from 'react';
import { Users, BookOpen, Calendar, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';

export function FacultyOverview() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('campus_user');
    if (userStr) {
      try { setUser(JSON.parse(userStr)); } catch (e) {}
    }
  }, []);

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
            <span className="text-sm font-medium text-green-500 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> +12%
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">248</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Total Students</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
              <Clock className="w-4 h-4" /> Due Today
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">3</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Active Assignments</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-green-500 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Upcoming
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">2</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Events Hosted</p>
        </GlassCard>
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Submissions</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-purple-500 p-[2px]">
                    <div className="w-full h-full bg-brand-dark rounded-full overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=Student${i}`} alt="Avatar" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Alex Student {i+1}</p>
                    <p className="text-xs text-gray-500">Submitted Data Structures Homework</p>
                  </div>
                </div>
                <button className="text-sm font-medium text-brand-primary hover:text-brand-secondary">Grade</button>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Upcoming Schedule</h2>
          <div className="space-y-4">
             <div className="p-4 rounded-xl border border-gray-100 dark:border-white/5 flex gap-4">
               <div className="flex flex-col items-center justify-center min-w-[60px] bg-brand-primary/10 rounded-lg text-brand-primary">
                 <span className="text-xs font-bold uppercase">Oct</span>
                 <span className="text-xl font-bold">24</span>
               </div>
               <div>
                 <h4 className="font-medium text-gray-900 dark:text-white">Midterm Evaluation</h4>
                 <p className="text-sm text-gray-500 mt-1">Room 304 • 10:00 AM</p>
               </div>
             </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
