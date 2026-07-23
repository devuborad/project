import { useState, useEffect, useRef } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { FileText, UploadCloud, CheckCircle2, Clock, Calendar, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function StudentAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Submit modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/students/assignments', {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !file) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append('assignment_id', selectedAssignment.id.toString());
    formData.append('file', file);

    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/students/assignments/submit', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        await fetchAssignments();
        setShowSubmitModal(false);
        setSelectedAssignment(null);
        setFile(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit assignment');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const pendingAssignments = assignments.filter(a => !a.submission_url);
  const completedAssignments = assignments.filter(a => a.submission_url);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Assignments</h1>
          <p className="text-gray-600 dark:text-gray-400">View and submit your coursework.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Assignments */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-primary" />
            Pending ({pendingAssignments.length})
          </h2>
          
          <div className="space-y-4">
            {pendingAssignments.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">You have no pending assignments! 🎉</p>
            ) : (
              pendingAssignments.map(assignment => {
                const isOverdue = new Date(assignment.due_date) < new Date();
                
                return (
                  <div key={assignment.id} className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white/[0.02] flex flex-col hover:bg-white/[0.05] transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-1 text-[10px] font-bold tracking-wider rounded border border-brand-primary/20 bg-brand-primary/10 text-brand-primary uppercase">
                        {assignment.course}
                      </span>
                      {isOverdue ? (
                        <span className="text-xs text-red-500 font-medium bg-red-500/10 px-2 py-1 rounded">Overdue</span>
                      ) : (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Due {new Date(assignment.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{assignment.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{assignment.description}</p>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/5">
                      <Button onClick={() => { setSelectedAssignment(assignment); setShowSubmitModal(true); }} className="w-full">
                        <UploadCloud className="w-4 h-4 mr-2" />
                        Submit Work
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>

        {/* Completed Assignments */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Completed ({completedAssignments.length})
          </h2>
          
          <div className="space-y-4">
            {completedAssignments.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">No assignments submitted yet.</p>
            ) : (
              completedAssignments.map(assignment => (
                <div key={assignment.id} className="p-4 rounded-xl border border-green-500/20 bg-green-500/5 flex flex-col hover:bg-green-500/10 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-1 text-[10px] font-bold tracking-wider rounded border border-green-500/20 text-green-600 dark:text-green-400 uppercase">
                      {assignment.course}
                    </span>
                    {assignment.grade ? (
                      <span className="text-sm font-bold text-gray-900 dark:text-white bg-white/50 dark:bg-white/10 px-2 py-0.5 rounded">
                        Grade: {assignment.grade}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">Not Graded</span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{assignment.title}</h3>
                  <div className="mt-4 flex gap-2">
                    <a href={assignment.submission_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="outline" className="w-full h-8 text-xs border-green-500/30 text-green-600 hover:bg-green-500/10">View Submission</Button>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* Submit Modal */}
      <AnimatePresence>
        {showSubmitModal && selectedAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Submit Assignment</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-medium">
                {selectedAssignment.course}: {selectedAssignment.title}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Work (PDF, ZIP, DOCX)</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-primary/50 transition-colors bg-gray-50 dark:bg-[#0f0f0f]"
                  >
                    <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500 text-center px-4">
                      {file ? file.name : "Click to select a file"}
                    </span>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowSubmitModal(false); setFile(null); }}>Cancel</Button>
                  <Button type="submit" className="flex-1" disabled={submitting || !file}>
                    {submitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
