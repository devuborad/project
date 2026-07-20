import { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { FileText, Plus, CheckCircle, Clock, Trash2, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function ManageAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', due_date: '', course: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/faculty/assignments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/faculty/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newAssignment)
      });
      if (response.ok) {
        const data = await response.json();
        setAssignments([...assignments, data].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()));
        setIsAddModalOpen(false);
        setNewAssignment({ title: '', description: '', due_date: '', course: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch(`http://localhost:5000/api/faculty/assignments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setAssignments(assignments.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manage Assignments</h1>
          <p className="text-gray-600 dark:text-gray-400">Create, distribute, and grade course assignments.</p>
        </div>
        <Button variant="gradient" className="shrink-0" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          New Assignment
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading assignments...</div>
        ) : assignments.map(assignment => (
          <GlassCard key={assignment.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{assignment.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{assignment.course} • Due: {new Date(assignment.due_date).toLocaleDateString()} at {new Date(assignment.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <div className="flex gap-4 mt-3">
                  <span className="text-xs font-medium text-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {assignment.submitted_count || 0} Submitted</span>
                  <span className="text-xs font-medium text-orange-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 
                    {Math.max(0, (assignment.total_enrolled || 0) - (assignment.submitted_count || 0))} Pending
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 shrink-0 items-center">
              <Button variant="gradient" className="w-full sm:w-auto">View Submissions</Button>
              <button onClick={() => handleDelete(assignment.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </GlassCard>
        ))}

        {!loading && assignments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No assignments created yet.</p>
          </div>
        )}
      </div>

      {/* Add Assignment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <GlassCard className="w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Assignment</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-900 dark:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assignment Title</label>
                <input required type="text" value={newAssignment.title} onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Code</label>
                <input required type="text" value={newAssignment.course} onChange={e => setNewAssignment({...newAssignment, course: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" placeholder="e.g. CS301" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date & Time</label>
                <input required type="datetime-local" value={newAssignment.due_date} onChange={e => setNewAssignment({...newAssignment, due_date: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                <textarea rows={3} value={newAssignment.description} onChange={e => setNewAssignment({...newAssignment, description: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white resize-none" />
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="gradient" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Assignment'}
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
