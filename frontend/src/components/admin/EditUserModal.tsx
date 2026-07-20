import { useState, useEffect } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

export function EditUserModal({ user, onClose, onSave }: { user: any, onClose: () => void, onSave: () => void }) {
  const [formData, setFormData] = useState<any>({ ...user });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${user.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        onSave();
        onClose();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error(error);
      alert('Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <GlassCard className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit User: {user.first_name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
              <input type="text" value={formData.first_name || ''} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
              <input type="text" value={formData.last_name || ''} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" />
            </div>
          </div>
          
          {user.role === 'student' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PRN Number</label>
                <input type="text" value={formData.prn_number || ''} onChange={e => setFormData({...formData, prn_number: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" placeholder="Update PRN (if needed)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Major</label>
                <input type="text" value={formData.major || ''} onChange={e => setFormData({...formData, major: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" placeholder="Update Major (if needed)" />
              </div>
            </>
          )}

          {user.role === 'faculty' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                <input type="text" value={formData.department || ''} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white" placeholder="Update Department (if needed)" />
              </div>
            </>
          )}

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="gradient" className="flex-1" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
