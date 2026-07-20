import { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Briefcase, Plus, Trophy, X, Calendar, DollarSign, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function ManageHackathons() {
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newHackathon, setNewHackathon] = useState({ 
    title: '', description: '', start_date: '', end_date: '', 
    max_team_size: 4, prize_pool: '', registration_link: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHackathons = async () => {
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/hackathons', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHackathons(data);
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  const handleAddHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/hackathons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newHackathon)
      });
      const data = await response.json();
      if (response.ok) {
        setHackathons([data, ...hackathons]);
        setIsAddModalOpen(false);
        setNewHackathon({ title: '', description: '', start_date: '', end_date: '', max_team_size: 4, prize_pool: '', registration_link: '' });
      } else {
        alert(data.error || 'Failed to create hackathon');
      }
    } catch (error) {
      console.error('Error creating hackathon:', error);
      alert('Network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this hackathon?')) return;
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch(`http://localhost:5000/api/hackathons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setHackathons(hackathons.filter(h => h.id !== id));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete hackathon');
      }
    } catch (error) {
      console.error('Error deleting hackathon:', error);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manage Hackathons</h1>
          <p className="text-gray-600 dark:text-gray-400">Organize competitions and track student registrations.</p>
        </div>
        <Button variant="gradient" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Post Hackathon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GlassCard 
          onClick={() => setIsAddModalOpen(true)}
          className="p-6 flex flex-col items-center justify-center text-center border-dashed border-2 border-gray-300 dark:border-white/20 min-h-[200px] cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          <Trophy className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">New Hackathon</h3>
          <p className="text-sm text-gray-500 mt-2">Create a new coding challenge for students.</p>
        </GlassCard>

        {loading ? (
          <div className="flex items-center justify-center p-6"><p className="text-gray-500">Loading hackathons...</p></div>
        ) : hackathons.map(hackathon => (
          <GlassCard key={hackathon.id} className="p-0 overflow-hidden flex flex-col">
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                  <Briefcase className="w-6 h-6" />
                </div>
                {new Date(hackathon.end_date) > new Date() ? (
                  <span className="bg-green-500/10 text-green-500 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">Active</span>
                ) : (
                  <span className="bg-gray-500/10 text-gray-500 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">Ended</span>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{hackathon.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{hackathon.description}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(hackathon.start_date).toLocaleDateString()} - {new Date(hackathon.end_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <DollarSign className="w-4 h-4" />
                  <span>Prize Pool: {hackathon.prize_pool || 'TBA'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>Max Team Size: {hackathon.max_team_size}</span>
                </div>
              </div>

              <div className="mt-auto flex gap-2">
                {hackathon.registration_link && (
                  <Button 
                    variant="outline" 
                    className="flex-1 text-xs" 
                    onClick={() => window.open(hackathon.registration_link, '_blank')}
                  >
                    View Link
                  </Button>
                )}
                <Button variant="outline" className="flex-1 text-xs text-red-500 hover:bg-red-500/10 hover:text-red-600 border-red-500/20" onClick={() => handleDelete(hackathon.id)}>
                  Delete
                </Button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <GlassCard className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Post Hackathon</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-900 dark:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddHackathon} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hackathon Title</label>
                <input required type="text" value={newHackathon.title} onChange={e => setNewHackathon({...newHackathon, title: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea rows={4} value={newHackathon.description} onChange={e => setNewHackathon({...newHackathon, description: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                  <input required type="datetime-local" value={newHackathon.start_date} onChange={e => setNewHackathon({...newHackathon, start_date: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                  <input required type="datetime-local" value={newHackathon.end_date} onChange={e => setNewHackathon({...newHackathon, end_date: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Team Size</label>
                  <input type="number" min="1" max="10" value={newHackathon.max_team_size} onChange={e => setNewHackathon({...newHackathon, max_team_size: parseInt(e.target.value)})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prize Pool</label>
                  <input type="text" placeholder="e.g. $5000" value={newHackathon.prize_pool} onChange={e => setNewHackathon({...newHackathon, prize_pool: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Registration Link (Optional)</label>
                <input type="url" placeholder="https://..." value={newHackathon.registration_link} onChange={e => setNewHackathon({...newHackathon, registration_link: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="gradient" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Posting...' : 'Post Hackathon'}
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
