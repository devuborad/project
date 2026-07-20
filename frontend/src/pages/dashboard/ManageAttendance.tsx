import { GlassCard } from '../../components/ui/GlassCard';
import { Search, UserCheck, UserX, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function ManageAttendance() {
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
          <div className="flex-1 w-full flex gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-sm text-gray-500">Course</label>
              <select className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-2 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-brand-primary">
                <option>CS301 - Data Structures</option>
                <option>CS402 - Artificial Intelligence</option>
              </select>
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-sm text-gray-500">Date</label>
              <input type="date" className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-2 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-brand-primary" />
            </div>
          </div>
          <Button variant="gradient" className="shrink-0"><Search className="w-4 h-4 mr-2" /> Load Roster</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10">
                <th className="pb-3 text-sm font-medium text-gray-500">Student Name</th>
                <th className="pb-3 text-sm font-medium text-gray-500">ID / Email</th>
                <th className="pb-3 text-sm font-medium text-gray-500">Status</th>
                <th className="pb-3 text-sm font-medium text-gray-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-primary/20 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=Student${i}`} alt="Avatar" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">Alex Student {i}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-gray-500">student{i}@college.edu</td>
                  <td className="py-4">
                    {i % 3 === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"><UserX className="w-3 h-3" /> Absent</span>
                    ) : i % 4 === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"><Clock className="w-3 h-3" /> Late</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400"><UserCheck className="w-3 h-3" /> Present</span>
                    )}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-500/10 transition-colors" title="Mark Present"><UserCheck className="w-4 h-4" /></button>
                      <button className="p-2 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 transition-colors" title="Mark Late"><Clock className="w-4 h-4" /></button>
                      <button className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors" title="Mark Absent"><UserX className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
