import { GlassCard } from '../../components/ui/GlassCard';
import { FileText, Plus, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function ManageAssignments() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manage Assignments</h1>
          <p className="text-gray-600 dark:text-gray-400">Create, distribute, and grade course assignments.</p>
        </div>
        <Button variant="gradient">
          <Plus className="w-5 h-5 mr-2" />
          New Assignment
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Placeholder Assignment */}
        <GlassCard className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Data Structures Midterm Project</h3>
              <p className="text-sm text-gray-500 mt-1">CS301 • Due: Tomorrow at 11:59 PM</p>
              <div className="flex gap-4 mt-3">
                <span className="text-xs font-medium text-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> 45 Submitted</span>
                <span className="text-xs font-medium text-orange-500 flex items-center gap-1"><Clock className="w-3 h-3" /> 12 Pending</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button variant="outline" className="w-full sm:w-auto">Edit</Button>
            <Button variant="gradient" className="w-full sm:w-auto">Grade Submissions</Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
