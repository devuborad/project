import { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Search, Edit2, Trash2, Shield, User, GraduationCap, Building, Plus, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EditUserModal } from '../../components/admin/EditUserModal';
import { AdminClubRequests } from '../../components/admin/AdminClubRequests';

export function ManageUsers() {
  const [activeTab, setActiveTab] = useState<'users' | 'clubs'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingStatus, setEditingStatus] = useState<any>(null);
  const [editProfileUser, setEditProfileUser] = useState<any>(null);
  
  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ first_name: '', last_name: '', email: '', mobile_number: '', password: '', role: 'student' });
  const [isAdding, setIsAdding] = useState(false);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleRoleChange = async (id: number, newRole: string) => {
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role: newRole })
      });
      if (response.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
        setEditingUser(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, account_status: newStatus } : u));
        setEditingStatus(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newUser)
      });
      
      const data = await response.json();
      if (response.ok) {
        setUsers([data, ...users]);
        setIsAddModalOpen(false);
        setNewUser({ first_name: '', last_name: '', email: '', mobile_number: '', password: '', role: 'student' });
      } else {
        alert(data.error || 'Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Network error occurred.');
    } finally {
      setIsAdding(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.first_name.toLowerCase().includes(search.toLowerCase()) ||
    u.last_name.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4 text-red-500" />;
      case 'faculty': return <GraduationCap className="w-4 h-4 text-purple-500" />;
      case 'club_admin': return <Building className="w-4 h-4 text-orange-500" />;
      default: return <User className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">System Admin</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage all accounts and approvals.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('users')} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-white dark:bg-brand-primary text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              Manage Users
            </button>
            <button 
              onClick={() => setActiveTab('clubs')} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'clubs' ? 'bg-white dark:bg-brand-primary text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              Club Requests
            </button>
          </div>
          {activeTab === 'users' && (
            <Button variant="gradient" onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add User
            </Button>
          )}
        </div>
      </div>

      {activeTab === 'clubs' ? (
        <AdminClubRequests />
      ) : (
      <>
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
                <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">User</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Email</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Mobile</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Role</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">Loading users...</td></tr>
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-primary/20 overflow-hidden shrink-0">
                        <img src={u.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${u.first_name}`} alt="Avatar" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{u.first_name} {u.last_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{u.email}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{u.mobile_number || 'N/A'}</td>
                  <td className="py-3 px-4">
                    {editingUser === u.id ? (
                      <select 
                        className="bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded px-2 py-1 text-sm text-gray-900 dark:text-white"
                        defaultValue={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        onBlur={() => setEditingUser(null)}
                      >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="club_admin">Club Admin</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        {getRoleIcon(u.role)}
                        <span className="text-sm text-gray-900 dark:text-white capitalize">{u.role.replace('_', ' ')}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingStatus === u.id ? (
                      <select 
                        className="bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded px-2 py-1 text-sm text-gray-900 dark:text-white"
                        defaultValue={u.account_status || 'active'}
                        onChange={(e) => handleStatusChange(u.id, e.target.value)}
                        onBlur={() => setEditingStatus(null)}
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          u.account_status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                          u.account_status === 'suspended' ? 'bg-red-500/10 text-red-500' :
                          'bg-green-500/10 text-green-500'
                        }`}>
                          {(u.account_status || 'active').toUpperCase()}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setEditingStatus(u.id)}
                        className="p-2 text-gray-400 hover:text-brand-primary transition-colors"
                        title="Edit Status"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setEditProfileUser(u)}
                        className="p-2 text-gray-400 hover:text-brand-primary transition-colors"
                        title="Edit Full Profile"
                      >
                        <User className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setEditingUser(u.id)}
                        className="p-2 text-gray-400 hover:text-brand-primary transition-colors"
                        title="Edit Role"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New User</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-900 dark:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                  <input required type="text" value={newUser.first_name} onChange={e => setNewUser({...newUser, first_name: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                  <input type="text" value={newUser.last_name} onChange={e => setNewUser({...newUser, last_name: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
                <input type="tel" value={newUser.mobile_number} onChange={e => setNewUser({...newUser, mobile_number: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Temporary Password</label>
                <input required type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white">
                  <option value="student">Student</option>
                  <option value="faculty">Faculty Member</option>
                  <option value="club_admin">Club Admin</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="gradient" className="flex-1" disabled={isAdding}>
                  {isAdding ? 'Adding...' : 'Add User'}
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {editProfileUser && (
        <EditUserModal 
          user={editProfileUser} 
          onClose={() => setEditProfileUser(null)} 
          onSave={() => {
            fetchUsers();
          }} 
        />
      )}
      
      {/* End users view */}
      </>
      )}
    </div>
  );
}
