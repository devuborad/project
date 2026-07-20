import { GlassCard } from '../../components/ui/GlassCard';
import { Users, Calendar, Trophy, Star } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function ClubAdminOverview() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Club Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your club, events, and members.</p>
        </div>
        <Button variant="gradient">Create Event</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-primary">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Members</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">128</h3>
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
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">3</h3>
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
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">1</h3>
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
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">4.9</h3>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Event Registrations</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-primary/20 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=Member${i}`} alt="Avatar" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Alex Member {i}</p>
                  <p className="text-xs text-gray-500">Registered for Tech Meetup</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">{i} hour ago</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
