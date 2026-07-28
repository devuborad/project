import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, Sparkles, ArrowRight, ShieldCheck, GraduationCap, Briefcase, Users, ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';

const roles = [
  { id: 'student', label: 'Student', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'faculty', label: 'Faculty', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'club_admin', label: 'Club Admin', icon: <Users className="w-4 h-4" /> },
  { id: 'admin', label: 'Admin', icon: <ShieldAlert className="w-4 h-4" /> },
];

export function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [prnNumber, setPrnNumber] = useState('');
  const [major, setMajor] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          first_name: firstName, 
          last_name: lastName || 'User', 
          email, 
          mobile_number: mobileNumber,
          prn_number: role === 'student' ? prnNumber : undefined,
          major: role === 'student' ? major : undefined,
          department: role === 'faculty' ? department : undefined,
          password, 
          role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.errors?.[0]?.msg || 'Failed to register');
      }

      if (data.pending) {
        setSuccessMsg(data.message);
        localStorage.setItem('campus_last_email', email);
        // Clear form
        setFirstName(''); setLastName(''); setEmail(''); setMobileNumber(''); setPassword(''); setConfirmPassword('');
      } else {
        // Save token and redirect
        localStorage.setItem('campus_token', data.token);
        localStorage.setItem('campus_user', JSON.stringify(data.user));
        localStorage.setItem('campus_last_email', email);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full justify-center">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/25 text-brand-primary text-xs font-semibold mb-2.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>University Identity Enrollment</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1.5 tracking-tight">
          Create Account
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Select your campus role and initialize your AI academic profile.
        </p>
        {error && (
          <div className="mt-3 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-3 p-3 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-500 text-sm font-medium flex items-center gap-2">
            <span>✓</span>
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        {/* Interactive Role Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 ml-1">
            I am enrolling as a...
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {roles.map((item) => {
              const isSelected = role === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setRole(item.id)}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all duration-200",
                    isSelected
                      ? "bg-brand-primary/15 border-brand-primary text-brand-primary shadow-sm"
                      : "bg-gray-100/70 dark:bg-white/[0.04] border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-brand-primary/40"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1 relative">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 ml-1">First Name</label>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="text" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John" 
                className="w-full bg-gray-100/90 dark:bg-white/[0.04] border border-gray-200/90 dark:border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 focus:bg-white dark:focus:bg-white/[0.08] transition-all"
                required
                autoComplete="given-name"
              />
            </div>
          </div>

          <div className="space-y-1 relative">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 ml-1">Last Name</label>
            <div className="relative group">
              <input 
                type="text" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe" 
                className="w-full bg-gray-100/90 dark:bg-white/[0.04] border border-gray-200/90 dark:border-white/10 rounded-xl py-3 px-3.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 focus:bg-white dark:focus:bg-white/[0.08] transition-all"
                required
                autoComplete="family-name"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1 relative">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@college.edu" 
                className="w-full bg-gray-100/90 dark:bg-white/[0.04] border border-gray-200/90 dark:border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 focus:bg-white dark:focus:bg-white/[0.08] transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1 relative">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 ml-1">Mobile Number</label>
            <div className="relative group">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="tel" 
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+1 234 567 890" 
                className="w-full bg-gray-100/90 dark:bg-white/[0.04] border border-gray-200/90 dark:border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 focus:bg-white dark:focus:bg-white/[0.08] transition-all"
                required
              />
            </div>
          </div>
        </div>

        {role === 'student' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1 relative">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 ml-1">PRN Number</label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
                <input 
                  type="text" 
                  value={prnNumber}
                  onChange={(e) => setPrnNumber(e.target.value)}
                  placeholder="e.g. 123456789" 
                  className="w-full bg-gray-100/90 dark:bg-white/[0.04] border border-gray-200/90 dark:border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 focus:bg-white dark:focus:bg-white/[0.08] transition-all"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1 relative">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 ml-1">Major or Degree</label>
              <div className="relative group">
                <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
                <input 
                  type="text" 
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="e.g. B.Tech CS" 
                  className="w-full bg-gray-100/90 dark:bg-white/[0.04] border border-gray-200/90 dark:border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 focus:bg-white dark:focus:bg-white/[0.08] transition-all"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {role === 'faculty' && (
          <div className="space-y-1 relative">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 ml-1">Subjects You Teach</label>
            <div className="relative group">
              <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="text" 
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Data Structures, Algorithms" 
                className="w-full bg-gray-100/90 dark:bg-white/[0.04] border border-gray-200/90 dark:border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 focus:bg-white dark:focus:bg-white/[0.08] transition-all"
                required
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1 relative">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-gray-100/90 dark:bg-white/[0.04] border border-gray-200/90 dark:border-white/10 rounded-xl py-3 pl-10 pr-10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 focus:bg-white dark:focus:bg-white/[0.08] transition-all"
                required
                autoComplete="new-password"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1 relative">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 ml-1">Confirm Password</label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-gray-100/90 dark:bg-white/[0.04] border border-gray-200/90 dark:border-white/10 rounded-xl py-3 pl-10 pr-10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 focus:bg-white dark:focus:bg-white/[0.08] transition-all"
                required
                autoComplete="new-password"
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white p-1"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          variant="gradient" 
          className="w-full mt-6 py-3.5 font-bold rounded-2xl shadow-lg shadow-brand-primary/25 flex items-center justify-center gap-2 text-base" 
          disabled={loading}
        >
          {loading ? (
            <span>Initializing Neural ID...</span>
          ) : (
            <>
              <span>Create AI Account</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-gray-200/80 dark:border-white/10 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already enrolled in CampusAI?{' '}
          <Link to="/login" className="text-gray-900 dark:text-white font-bold hover:text-brand-primary transition-colors inline-flex items-center gap-1">
            <span>Sign In here</span>
            <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
          </Link>
        </p>
      </div>
    </div>
  );
}

