import { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Search, UserCheck, UserX, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function ManageAttendance() {
  const [lectures, setLectures] = useState<any[]>([]);
  const [selectedLectureId, setSelectedLectureId] = useState<string>('');
  
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<number | null>(null);

  // Fetch all scheduled lectures
  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const token = localStorage.getItem('campus_token');
        const response = await fetch('http://localhost:5000/api/faculty/lectures', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setLectures(data);
          if (data.length > 0) {
            setSelectedLectureId(data[0].id.toString());
          }
        }
      } catch (error) {
        console.error('Error fetching lectures:', error);
      }
    };
    fetchLectures();
  }, []);

  const loadRoster = async () => {
    if (!selectedLectureId) return;
    const lecture = lectures.find(l => l.id.toString() === selectedLectureId);
    if (!lecture) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('campus_token');
      // lecture.date is an ISO string or Date, extract just the YYYY-MM-DD
      const dateStr = new Date(lecture.date).toISOString().split('T')[0];
      const response = await fetch(`http://localhost:5000/api/faculty/attendance/${encodeURIComponent(lecture.course)}/${dateStr}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error loading roster:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLectureId) {
      loadRoster();
    }
  }, [selectedLectureId]);

  const markAttendance = async (studentId: number, status: string) => {
    const lecture = lectures.find(l => l.id.toString() === selectedLectureId);
    if (!lecture) return;
    const dateStr = new Date(lecture.date).toISOString().split('T')[0];

    setIsSubmitting(studentId);
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/faculty/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          course: lecture.course,
          date: dateStr,
          studentId,
          status
        })
      });
      
      if (response.ok) {
        // Update local state
        setStudents(students.map(s => s.id === studentId ? { ...s, status } : s));
      } else {
        alert('Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Track Attendance</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor and update student attendance records.</p>
        </div>
      </div>

      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-end mb-6">
          <div className="flex-1 w-full max-w-xl space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Lecture Session</label>
            <select 
              value={selectedLectureId}
              onChange={(e) => setSelectedLectureId(e.target.value)}
              className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-brand-primary"
            >
              <option value="" disabled>Select a scheduled lecture...</option>
              {lectures.map(l => {
                const dateStr = new Date(l.date).toLocaleDateString();
                return (
                  <option key={l.id} value={l.id.toString()}>
                    {l.title} - {l.course} ({dateStr} at {l.time})
                  </option>
                );
              })}
              {lectures.length === 0 && <option value="" disabled>No lectures scheduled yet.</option>}
            </select>
          </div>
          <Button variant="gradient" className="shrink-0 h-12 px-6" onClick={loadRoster} disabled={!selectedLectureId || loading}>
            <Search className="w-4 h-4 mr-2" /> Load Roster
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10">
                <th className="pb-3 text-sm font-medium text-gray-500">Student Name</th>
                <th className="pb-3 text-sm font-medium text-gray-500">Email</th>
                <th className="pb-3 text-sm font-medium text-gray-500">Current Status</th>
                <th className="pb-3 text-sm font-medium text-gray-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-500">Loading roster...</td></tr>
              ) : students.map((student) => (
                <tr key={student.id} className="border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-primary/20 overflow-hidden flex items-center justify-center shrink-0">
                        <img src={student.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${student.name}`} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{student.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-gray-500">{student.email}</td>
                  <td className="py-4">
                    {!student.status ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400">Not Marked</span>
                    ) : student.status === 'Absent' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"><UserX className="w-3 h-3" /> Absent</span>
                    ) : student.status === 'Late' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"><Clock className="w-3 h-3" /> Late</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400"><UserCheck className="w-3 h-3" /> Present</span>
                    )}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => markAttendance(student.id, 'Present')}
                        disabled={isSubmitting === student.id}
                        className={`p-2 rounded-lg transition-colors ${student.status === 'Present' ? 'bg-green-100 text-green-600 dark:bg-green-500/20' : 'text-gray-400 hover:text-green-500 hover:bg-green-500/10'}`} 
                        title="Mark Present"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => markAttendance(student.id, 'Late')}
                        disabled={isSubmitting === student.id}
                        className={`p-2 rounded-lg transition-colors ${student.status === 'Late' ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20' : 'text-gray-400 hover:text-orange-500 hover:bg-orange-500/10'}`} 
                        title="Mark Late"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => markAttendance(student.id, 'Absent')}
                        disabled={isSubmitting === student.id}
                        className={`p-2 rounded-lg transition-colors ${student.status === 'Absent' ? 'bg-red-100 text-red-600 dark:bg-red-500/20' : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'}`} 
                        title="Mark Absent"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && students.length === 0 && selectedLectureId && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No students enrolled in this course yet.</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
