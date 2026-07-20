import { useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Search, Plus, Trash2, Mail, GraduationCap } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function ManageStudents() {
  const [courseFilter, setCourseFilter] = useState('All');

  const students = [
    { id: 1, name: 'Alice Johnson', email: 'alice.j@college.edu', major: 'Computer Science', year: 'Junior', course: 'CS301 - Data Structures' },
    { id: 2, name: 'Bob Smith', email: 'bob.s@college.edu', major: 'Software Engineering', year: 'Senior', course: 'CS402 - Artificial Intelligence' },
    { id: 3, name: 'Charlie Davis', email: 'charlie.d@college.edu', major: 'Computer Science', year: 'Sophomore', course: 'CS301 - Data Structures' },
    { id: 4, name: 'Diana Prince', email: 'diana.p@college.edu', major: 'Data Science', year: 'Senior', course: 'CS402 - Artificial Intelligence' },
  ];

  const filteredStudents = courseFilter === 'All' ? students : students.filter(s => s.course === courseFilter);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manage Students</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage the roster of students in your courses.</p>
        </div>
        <Button variant="gradient" className="shrink-0 group">
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
              <option value="CS301 - Data Structures">CS301 - Data Structures</option>
              <option value="CS402 - Artificial Intelligence">CS402 - Artificial Intelligence</option>
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
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-primary/20 to-purple-500/20 flex items-center justify-center shrink-0 border border-brand-primary/20">
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${student.name}`} alt="Avatar" className="w-8 h-8 rounded-full" />
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
                      <button className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors" title="Remove Student">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No students found matching your criteria.</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
