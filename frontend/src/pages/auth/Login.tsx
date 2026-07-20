import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(localStorage.getItem('campus_last_email') || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      // Save token and redirect
      localStorage.setItem('campus_token', data.token);
      localStorage.setItem('campus_user', JSON.stringify(data.user));
      localStorage.setItem('campus_last_email', email);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full justify-center">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
        <p className="text-gray-600 dark:text-gray-400">Sign in to continue to CampusAI.</p>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
        <div className="space-y-1 relative">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Email</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@college.edu"
              className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-600 focus:outline-none focus:border-brand-primary focus:bg-gray-200 dark:bg-white/10 transition-all"
              required
              autoComplete="username"
            />
          </div>
        </div>

        <div className="space-y-1 relative">
          <div className="flex items-center justify-between ml-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <a href="#" className="text-xs text-brand-primary hover:text-brand-secondary transition-colors">Forgot password?</a>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-12 text-gray-900 dark:text-white placeholder-gray-600 focus:outline-none focus:border-brand-primary focus:bg-gray-200 dark:bg-white/10 transition-all"
              required
              autoComplete="current-password"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 dark:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <Button type="submit" variant="gradient" className="w-full mt-8" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-8">
        Don't have an account?{' '}
        <Link to="/signup" className="text-gray-900 dark:text-white font-medium hover:text-brand-primary transition-colors">
          Create one now
        </Link>
      </p>
    </div>
  );
}
