import { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Calendar, Plus, X, MapPin, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function ManageEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', event_date: '', location: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newEvent)
      });
      const data = await response.json();
      if (response.ok) {
        setEvents([data, ...events]);
        setIsAddModalOpen(false);
        setNewEvent({ title: '', description: '', event_date: '', location: '' });
      } else {
        alert(data.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this event?')) return;
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setEvents(events.filter(e => e.id !== id));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manage Events</h1>
          <p className="text-gray-600 dark:text-gray-400">Post and manage upcoming club events and workshops.</p>
        </div>
        <Button variant="gradient" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GlassCard 
          onClick={() => setIsAddModalOpen(true)}
          className="p-6 flex flex-col items-center justify-center text-center border-dashed border-2 border-gray-300 dark:border-white/20 min-h-[200px] cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          <Calendar className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create New Event</h3>
          <p className="text-sm text-gray-500 mt-2">Set up a new workshop, seminar, or social gathering.</p>
        </GlassCard>

        {loading ? (
          <div className="flex items-center justify-center p-6"><p className="text-gray-500">Loading events...</p></div>
        ) : events.map(event => (
          <GlassCard key={event.id} className="p-0 overflow-hidden flex flex-col">
            <div className="h-32 bg-brand-gradient flex items-center justify-center relative">
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full absolute top-4 right-4">
                Upcoming
              </span>
              <Calendar className="w-12 h-12 text-white opacity-80" />
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{event.description}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(event.event_date).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location || 'TBA'}</span>
                </div>
              </div>

              <div className="mt-auto flex gap-2">
                <Button variant="outline" className="flex-1 text-xs text-red-500 hover:bg-red-500/10 hover:text-red-600 border-red-500/20" onClick={() => handleDelete(event.id)}>
                  Cancel Event
                </Button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Event</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-900 dark:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Title</label>
                <input required type="text" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea rows={3} value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date & Time</label>
                <input required type="datetime-local" value={newEvent.event_date} onChange={e => setNewEvent({...newEvent, event_date: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location / Platform</label>
                <input type="text" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="gradient" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
