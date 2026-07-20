import { useState, useEffect } from 'react';
import { User, Mail, GraduationCap, Briefcase, BookOpen, TrendingUp, Edit2, Save, X, ExternalLink } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';

export function Profile() {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    major: '',
    graduation_year: '',
    bio: '',
    github_url: '',
    linkedin_url: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/students/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          major: data.major || '',
          graduation_year: data.graduation_year || '',
          bio: data.bio || '',
          github_url: data.github_url || '',
          linkedin_url: data.linkedin_url || ''
        });
        
        // Also update local storage if names changed
        const currentLocal = JSON.parse(localStorage.getItem('campus_user') || '{}');
        localStorage.setItem('campus_user', JSON.stringify({
          ...currentLocal,
          first_name: data.first_name,
          last_name: data.last_name
        }));
      } else {
        // Fallback to local storage if API fails (e.g., faculty/admin not supported yet)
        const userStr = localStorage.getItem('campus_user');
        if (userStr) setUser(JSON.parse(userStr));
      }
    } catch (e) {
      console.error(e);
      const userStr = localStorage.getItem('campus_user');
      if (userStr) setUser(JSON.parse(userStr));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/students/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        await fetchProfile(); // Refresh data
        setIsEditing(false);
      } else {
        alert('Failed to update profile');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating profile');
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-400">Loading profile...</div>;
  }
  if (!user) {
    return <div className="p-8 text-red-400">Failed to load profile.</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
      {/* Header Profile Card */}
      <GlassCard className="p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[80px] rounded-full pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-purple-500 to-brand-primary p-1 shrink-0">
            <div className="w-full h-full rounded-full border-4 border-brand-dark overflow-hidden">
              <img src={user.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.first_name}`} alt="Profile" className="w-full h-full object-cover bg-white" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {user.first_name} {user.last_name || ''}
            </h1>
            <p className="text-brand-primary font-medium mb-4 capitalize">{user.role}</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1"><Mail className="w-4 h-4" /> {user.email}</div>
              {(!isEditing) && (
                <>
                  <div className="flex items-center gap-1"><GraduationCap className="w-4 h-4" /> {user.graduation_year ? `Class of ${user.graduation_year}` : 'N/A'}</div>
                  <div className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {user.major || 'No major specified'}</div>
                </>
              )}
            </div>
          </div>
          
          <div className="shrink-0 flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}><X className="w-4 h-4 mr-2" /> Cancel</Button>
                <Button variant="default" onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Save</Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}><Edit2 className="w-4 h-4 mr-2" /> Edit Profile</Button>
            )}
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* About Me / Details */}
        <GlassCard className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-brand-primary" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Details</h2>
          </div>
          
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-400">First Name</label>
                  <input 
                    type="text" 
                    value={formData.first_name} 
                    onChange={e => setFormData({...formData, first_name: e.target.value})} 
                    placeholder="John"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-400">Last Name</label>
                  <input 
                    type="text" 
                    value={formData.last_name} 
                    onChange={e => setFormData({...formData, last_name: e.target.value})} 
                    placeholder="Doe"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">Major</label>
                <input 
                  type="text" 
                  value={formData.major} 
                  onChange={e => setFormData({...formData, major: e.target.value})} 
                  placeholder="Computer Science"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">Graduation Year</label>
                <input 
                  type="number" 
                  value={formData.graduation_year} 
                  onChange={e => setFormData({...formData, graduation_year: e.target.value})} 
                  placeholder="2025"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">Bio</label>
                <textarea 
                  value={formData.bio} 
                  onChange={e => setFormData({...formData, bio: e.target.value})} 
                  placeholder="Tell us about yourself..."
                  className="w-full bg-white/[0.05] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-brand-primary min-h-[100px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">GitHub URL</label>
                <input 
                  type="url" 
                  value={formData.github_url} 
                  onChange={e => setFormData({...formData, github_url: e.target.value})} 
                  placeholder="https://github.com/yourusername"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">LinkedIn URL</label>
                <input 
                  type="url" 
                  value={formData.linkedin_url} 
                  onChange={e => setFormData({...formData, linkedin_url: e.target.value})} 
                  placeholder="https://linkedin.com/in/yourusername"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {user.bio || "No bio added yet. Click 'Edit Profile' to add one!"}
              </p>
              <div className="flex gap-4 mt-2">
                {user.github_url ? (
                  <a href={user.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <ExternalLink className="w-4 h-4" /> GitHub
                  </a>
                ) : (
                  <span className="flex items-center gap-2 text-sm text-gray-600 opacity-50"><ExternalLink className="w-4 h-4" /> GitHub</span>
                )}
                
                {user.linkedin_url ? (
                  <a href={user.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-500 transition-colors">
                    <ExternalLink className="w-4 h-4" /> LinkedIn
                  </a>
                ) : (
                  <span className="flex items-center gap-2 text-sm text-gray-600 opacity-50"><ExternalLink className="w-4 h-4" /> LinkedIn</span>
                )}
              </div>
            </>
          )}
        </GlassCard>

        {/* Quick Stats */}
        <GlassCard className="p-6 flex flex-col gap-4 h-fit">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-brand-primary" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">My CampusAI Stats</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-gray-100 dark:border-white/5 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-brand-primary/50" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                <p className="text-xs text-gray-500">Notes Uploaded</p>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-white/[0.02] border border-gray-100 dark:border-white/5 flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-brand-secondary/50" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
                <p className="text-xs text-gray-500">Active Applications</p>
              </div>
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
