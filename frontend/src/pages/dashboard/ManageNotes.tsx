import { useState, useEffect, useRef } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { FileText, Trash2, Plus, UploadCloud, X } from 'lucide-react';

export function ManageNotes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/faculty/notes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('subject', subject);
    formData.append('file', file);

    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/faculty/notes', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        await fetchNotes();
        setShowModal(false);
        setTitle('');
        setSubject('');
        setFile(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to upload note');
      }
    } catch (error) {
      console.error('Error uploading note:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch(`http://localhost:5000/api/faculty/notes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setNotes(notes.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Subject Notes</h1>
          <p className="text-gray-600 dark:text-gray-400">Upload study materials and PDFs for your students.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Upload Note
        </Button>
      </div>

      <GlassCard className="p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-brand-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Notes Uploaded</h3>
            <p className="text-gray-600 dark:text-gray-400">Upload study materials to help your students.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map(note => (
              <div key={note.id} className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white/[0.02] flex flex-col justify-between h-full group">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 text-[10px] font-bold tracking-wider rounded border border-brand-primary/20 bg-brand-primary/10 text-brand-primary uppercase">
                      {note.subject}
                    </span>
                    <span className="px-2 py-1 text-[10px] font-bold tracking-wider rounded border border-gray-200 dark:border-white/20 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400">
                      {note.file_size}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{note.title}</h3>
                  <p className="text-xs text-gray-500 mb-4">Uploaded on {new Date(note.created_at).toLocaleDateString()}</p>
                </div>
                
                <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-white/5">
                  <a href={note.file_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" className="w-full text-xs py-1.5 h-auto">View PDF</Button>
                  </a>
                  <button onClick={() => handleDelete(note.id)} className="p-2 rounded-lg text-gray-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Note</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-brand-primary"
                  placeholder="e.g. Chapter 1: Introduction"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject / Course</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-brand-primary"
                  placeholder="e.g. CS101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PDF File</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-primary/50 transition-colors bg-gray-50 dark:bg-[#0f0f0f]"
                >
                  <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">
                    {file ? file.name : "Click to select a PDF"}
                  </span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFile(e.target.files[0]);
                    }
                  }}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={uploading || !file}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
