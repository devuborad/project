import { useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Plus, Video, Clock, BookOpen, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function ManageLectures() {
  const [courseFilter, setCourseFilter] = useState('All');

  const lectures = [
    { id: 1, title: 'Introduction to Trees', date: '2023-10-15', time: '10:00 AM', course: 'CS301 - Data Structures', topic: 'Trees, Binary Trees, BST', meetingLink: 'https://zoom.us/j/123456789' },
    { id: 2, title: 'Neural Networks Basics', date: '2023-10-16', time: '02:00 PM', course: 'CS402 - Artificial Intelligence', topic: 'Perceptrons, Activation Functions', meetingLink: 'https://zoom.us/j/987654321' },
    { id: 3, title: 'Graph Algorithms', date: '2023-10-22', time: '10:00 AM', course: 'CS301 - Data Structures', topic: 'BFS, DFS, Dijkstra', meetingLink: 'https://zoom.us/j/1122334455' },
  ];

  const filteredLectures = courseFilter === 'All' ? lectures : lectures.filter(l => l.course === courseFilter);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manage Lectures</h1>
          <p className="text-gray-600 dark:text-gray-400">Schedule and manage your lecture sessions and materials.</p>
        </div>
        <Button variant="gradient" className="shrink-0 group">
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming Lectures</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">12</h3>
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
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">2</h3>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-primary">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Hours Taught</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">48h</h3>
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
              <option value="CS301 - Data Structures">CS301 - Data Structures</option>
              <option value="CS402 - Artificial Intelligence">CS402 - Artificial Intelligence</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredLectures.map((lecture) => (
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
                <a href={lecture.meetingLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-500/20 transition-colors">
                  <Video className="w-4 h-4" />
                  Join
                </a>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 rounded-lg text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 transition-colors" title="Edit Lecture">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors" title="Delete Lecture">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredLectures.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No lectures scheduled for this course.</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
