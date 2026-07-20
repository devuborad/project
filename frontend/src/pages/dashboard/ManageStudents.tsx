import { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Search, Plus, Trash2, Mail, GraduationCap, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function ManageStudents() {
  const [courseFilter, setCourseFilter] = useState('All');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [newStudent, setNewStudent] = useState({ email: '', course: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/faculty/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/faculty/all-students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAllStudents(data);
      }
    } catch (error) {
      console.error('Error fetching all students:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchAllStudents();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/faculty/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newStudent)
      });
      const data = await response.json();
      if (response.ok) {
        setStudents([...students, data]);
        setIsAddModalOpen(false);
        setNewStudent({ email: '', course: '' });
      } else {
        alert(data.error || 'Failed to add student');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveStudent = async (course: string, studentId: number) => {
    if (!confirm('Are you sure you want to remove this student from the course?')) return;
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch(`http://localhost:5000/api/faculty/students/${encodeURIComponent(course)}/${studentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setStudents(students.filter(s => !(s.id === studentId && s.course === course)));
      } else {
        alert('Failed to remove student');
      }
    } catch (error) {
      console.error('Error removing student:', error);
    }
  };

  const filteredStudents = courseFilter === 'All' ? students : students.filter(s => s.course === courseFilter);

  // Derive unique courses from the student list
  const courses = Array.from(new Set(students.map(s => s.course)));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manage Students</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage the roster of students in your courses.</p>
        </div>
        <Button variant="gradient" className="shrink-0 group" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
          Add Student
        </Button>
      </div>

      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search students by name or email..." 
              className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-gray-900 dark:text-white focus:outline-none focus:border-brand-primary/50 transition-all"
            />
          </div>
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

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10">
                <th className="pb-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Student Details</th>
                <th className="pb-4 text-sm font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Academic Info</th>
                <th className="pb-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                <th className="pb-4 text-sm font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-500">Loading students...</td></tr>
              ) : filteredStudents.map((student, idx) => (
                <tr key={`${student.id}-${student.course}-${idx}`} className="border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-primary/20 to-purple-500/20 flex items-center justify-center shrink-0 border border-brand-primary/20 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${student.name}`} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-base">{student.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3.5 h-3.5" />
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 hidden sm:table-cell">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                        <GraduationCap className="w-4 h-4 text-brand-primary" />
                        {student.major}
                      </span>
                      <span className="text-xs text-gray-500">{student.year}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                      {student.course}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleRemoveStudent(student.course, student.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors" 
                        title="Remove Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No students found matching your criteria.</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Student to Course</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-900 dark:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Student</label>
                <select 
                  required 
                  value={newStudent.email} 
                  onChange={e => setNewStudent({...newStudent, email: e.target.value})} 
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                >
                  <option value="" disabled>Select a student...</option>
                  {allStudents.map(s => (
                    <option key={s.id} value={s.email}>
                      {s.first_name} {s.last_name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Code/Name</label>
                <input required type="text" value={newStudent.course} onChange={e => setNewStudent({...newStudent, course: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" placeholder="e.g. CS301" />
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="gradient" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Student'}
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
