import { useState, useEffect } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { CheckCircle, XCircle } from 'lucide-react';

export function AdminClubRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/admin/club-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching club requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (clubId: number, studentId: number) => {
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch(`http://localhost:5000/api/admin/club-requests/${clubId}/${studentId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setRequests(requests.filter(r => !(r.club_id === clubId && r.student_id === studentId)));
      } else {
        alert('Failed to approve request');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Pending Club Join Requests</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/10">
              <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Student</th>
              <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Club</th>
              <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Requested Date</th>
              <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-500">Loading requests...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-500">No pending club requests</td></tr>
            ) : requests.map((r, idx) => (
              <tr key={`${r.club_id}-${r.student_id}-${idx}`} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{r.first_name} {r.last_name}</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{r.club_name}</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{new Date(r.joined_at).toLocaleDateString()}</td>
                <td className="py-3 px-4 text-right">
                  <button 
                    onClick={() => handleApprove(r.club_id, r.student_id)}
                    className="flex items-center justify-end gap-2 text-green-500 hover:text-green-600 ml-auto font-medium text-sm transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
