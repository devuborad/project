import { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Search, Edit2, Crown, User, Star } from 'lucide-react';

export function ManageMembers() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingMember, setEditingMember] = useState<number | null>(null);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/clubs/members', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleRoleChange = async (student_id: number, newRole: string) => {
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch(`http://localhost:5000/api/clubs/members/${student_id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role: newRole })
      });
      if (response.ok) {
        setMembers(members.map(m => m.student_id === student_id ? { ...m, role: newRole } : m));
        setEditingMember(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleApprove = async (student_id: number) => {
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch(`http://localhost:5000/api/clubs/members/${student_id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setMembers(members.map(m => m.student_id === student_id ? { ...m, club_admin_approved: 1 } : m));
      } else {
        alert('Failed to approve member');
      }
    } catch (error) {
      console.error('Error approving member:', error);
    }
  };

  const filteredMembers = members.filter(m => 
    m.email.toLowerCase().includes(search.toLowerCase()) || 
    m.first_name.toLowerCase().includes(search.toLowerCase()) ||
    m.last_name.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Club Leader': return <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Crown className="w-3 h-3" /> Leader</span>;
      case 'Event Lead': return <span className="bg-purple-500/10 text-purple-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Star className="w-3 h-3" /> Event Lead</span>;
      case 'Hackathon Lead': return <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Star className="w-3 h-3" /> Hackathon Lead</span>;
      default: return <span className="bg-gray-500/10 text-gray-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><User className="w-3 h-3" /> {role}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Club Members</h1>
          <p className="text-gray-600 dark:text-gray-400">View members and assign leadership roles for your club.</p>
        </div>
      </div>

      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-2 pl-12 pr-4 text-gray-900 dark:text-white focus:outline-none focus:border-brand-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10">
                <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Member</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Email</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Joined Date</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Role</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">Loading members...</td></tr>
              ) : filteredMembers.map((m, idx) => (
                <tr key={`${m.user_id}-${idx}`} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-primary/20 overflow-hidden shrink-0">
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${m.first_name}`} alt="Avatar" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{m.first_name} {m.last_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{m.email}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {m.joined_at ? new Date(m.joined_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    {m.club_admin_approved === 0 ? (
                      <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full text-xs font-bold">Pending</span>
                    ) : m.sys_admin_approved === 0 ? (
                      <span className="bg-orange-500/10 text-orange-500 px-2 py-1 rounded-full text-xs font-bold">Pending System Admin</span>
                    ) : (
                      <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-xs font-bold">Active</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingMember === m.student_id && m.role !== 'Club Leader' ? (
                      <select 
                        className="bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded px-2 py-1 text-sm text-gray-900 dark:text-white"
                        defaultValue={m.role}
                        onChange={(e) => handleRoleChange(m.student_id, e.target.value)}
                        onBlur={() => setEditingMember(null)}
                      >
                        <option value="Member">Member</option>
                        <option value="Event Lead">Event Lead</option>
                        <option value="Hackathon Lead">Hackathon Lead</option>
                        <option value="Co-Lead">Co-Lead</option>
                      </select>
                    ) : (
                      getRoleBadge(m.role)
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {m.club_admin_approved === 0 && (
                        <button 
                          onClick={() => handleApprove(m.student_id)}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {m.role !== 'Club Leader' && (
                        <button 
                          onClick={() => setEditingMember(m.student_id)}
                          className="p-2 text-gray-400 hover:text-brand-primary transition-colors"
                          title="Edit Role"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
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
