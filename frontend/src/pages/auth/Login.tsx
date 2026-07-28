import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight, Shield } from 'lucide-react';
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

  const handleDemoJudgeLogin = () => {
    const demoAdminUser = {
      id: 1,
      email: 'admin@campus.edu',
      first_name: 'Hackathon',
      last_name: 'Judge',
      role: 'admin',
      avatar_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Judge'
    };
    localStorage.setItem('campus_token', 'demo-judge-token-2026');
    localStorage.setItem('campus_user', JSON.stringify(demoAdminUser));
    localStorage.setItem('campus_demo_mode', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col h-full justify-center">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/25 text-brand-primary text-xs font-semibold mb-3">
          <Shield className="w-3.5 h-3.5" />
          <span>Secure University Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
          Welcome Back
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Sign in to your neural academic dashboard and resume where you left off.
        </p>
        {error && (
          <div className="mt-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
        <div className="space-y-1.5 relative">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 ml-1">
            University Email
          </label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              className="w-full bg-gray-100/90 dark:bg-white/[0.04] border border-gray-200/90 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:bg-white dark:focus:bg-white/[0.08] transition-all shadow-inner"
              required
              autoComplete="username"
            />
          </div>
        </div>

        <div className="space-y-1.5 relative">
          <div className="flex items-center justify-between ml-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Password
            </label>
            <a href="#" className="text-xs font-semibold text-brand-primary hover:text-brand-secondary transition-colors">
              Forgot password?
            </a>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-gray-100/90 dark:bg-white/[0.04] border border-gray-200/90 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:bg-white dark:focus:bg-white/[0.08] transition-all shadow-inner"
              required
              autoComplete="current-password"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white p-1 rounded-lg transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <Button 
          type="submit" 
          variant="gradient" 
          className="w-full mt-8 py-4 font-bold rounded-2xl shadow-lg shadow-brand-primary/30 flex items-center justify-center gap-2 text-base" 
          disabled={loading}
        >
          {loading ? (
            <span>Authenticating Neural Key...</span>
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </>
          )}
        </Button>

        {/* Hackathon Judge One-Click Demo Mode */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleDemoJudgeLogin}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-purple-500/20 hover:from-amber-500/30 hover:via-orange-500/30 hover:to-purple-500/30 border-2 border-amber-500/40 text-amber-500 dark:text-amber-400 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:scale-[1.01]"
          >
            <span>🚀 Explore as Hackathon Judge (Demo Mode)</span>
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-200/80 dark:border-white/10 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          New to CampusAI?{' '}
          <Link to="/signup" className="text-gray-900 dark:text-white font-bold hover:text-brand-primary transition-colors inline-flex items-center gap-1">
            <span>Create your account</span>
            <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
          </Link>
        </p>
      </div>
    </div>
  );
}

