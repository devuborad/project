import { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Plus, Video, Clock, BookOpen, Trash2, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function ManageLectures() {
  const [courseFilter, setCourseFilter] = useState('All');
  const [lectures, setLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLecture, setNewLecture] = useState({ title: '', date: '', time: '', course: '', topic: '', meetingLink: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLectures = async () => {
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/faculty/lectures', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLectures(data);
      }
    } catch (error) {
      console.error('Error fetching lectures:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, []);

  const handleAddLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/faculty/lectures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newLecture)
      });
      const data = await response.json();
      if (response.ok) {
        setLectures([data, ...lectures]);
        setIsAddModalOpen(false);
        setNewLecture({ title: '', date: '', time: '', course: '', topic: '', meetingLink: '' });
      } else {
        alert(data.error || 'Failed to add lecture');
      }
    } catch (error) {
      console.error('Error creating lecture:', error);
      alert('Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this lecture?')) return;
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch(`http://localhost:5000/api/faculty/lectures/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setLectures(lectures.filter(l => l.id !== id));
      } else {
        alert('Failed to delete lecture');
      }
    } catch (error) {
      console.error('Error deleting lecture:', error);
    }
  };

  const filteredLectures = courseFilter === 'All' ? lectures : lectures.filter(l => l.course === courseFilter);

  // Derive unique courses taught for the filter
  const courses = Array.from(new Set(lectures.map(l => l.course)));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manage Lectures</h1>
          <p className="text-gray-600 dark:text-gray-400">Schedule and manage your lecture sessions and materials.</p>
        </div>
        <Button variant="gradient" className="shrink-0 group" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
          Add Lecture
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Lectures</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{lectures.length}</h3>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-500">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Courses</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{courses.length}</h3>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Lecture Schedule</h2>
          <div className="flex-1 w-full md:w-auto md:max-w-xs space-y-1">
            <select 
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-brand-primary"
            >
              <option value="All">All Courses</option>
              {courses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : filteredLectures.map((lecture) => (
            <div key={lecture.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-brand-primary/30 transition-colors">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-primary/20 to-purple-500/20 flex flex-col items-center justify-center shrink-0 border border-brand-primary/20">
                  <span className="text-xs font-bold text-brand-primary">{new Date(lecture.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{new Date(lecture.date).getDate()}</span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{lecture.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {lecture.time}</span>
                    <span className="inline-flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {lecture.course}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{lecture.topic}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 md:border-l md:border-gray-200 md:dark:border-white/10 md:pl-6">
                {lecture.meeting_link && (
                  <a href={lecture.meeting_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-500/20 transition-colors">
                    <Video className="w-4 h-4" />
                    Join
                  </a>
                )}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDelete(lecture.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors" title="Delete Lecture">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!loading && filteredLectures.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No lectures scheduled for this course.</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Add Lecture Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Lecture</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-900 dark:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLecture} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lecture Title</label>
                <input required type="text" value={newLecture.title} onChange={e => setNewLecture({...newLecture, title: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input required type="date" value={newLecture.date} onChange={e => setNewLecture({...newLecture, date: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                  <input required type="time" value={newLecture.time} onChange={e => setNewLecture({...newLecture, time: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Code/Name</label>
                <input required type="text" value={newLecture.course} onChange={e => setNewLecture({...newLecture, course: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" placeholder="e.g. CS301" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic</label>
                <input type="text" value={newLecture.topic} onChange={e => setNewLecture({...newLecture, topic: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Link (Optional)</label>
                <input type="url" value={newLecture.meetingLink} onChange={e => setNewLecture({...newLecture, meetingLink: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="gradient" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Lecture'}
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
