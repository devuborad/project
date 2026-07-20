import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ChevronDown } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [prnNumber, setPrnNumber] = useState('');
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
        <p className="text-gray-600 dark:text-gray-400">Join CampusAI and transform your campus life.</p>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        {successMsg && <p className="text-green-500 mt-2 text-sm font-medium">{successMsg}</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        
        <div className="space-y-1 relative">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">I am a...</label>
          <div className="relative group">
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white focus:outline-none focus:border-brand-primary focus:bg-gray-200 dark:bg-white/10 transition-all appearance-none cursor-pointer"
            >
              <option value="student" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Student</option>
              <option value="faculty" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Faculty Member</option>
              <option value="club_admin" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Club Admin</option>
              <option value="admin" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">System Admin</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 relative">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">First Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="text" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John" 
                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-600 focus:outline-none focus:border-brand-primary focus:bg-gray-200 dark:bg-white/10 transition-all"
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="space-y-1 relative">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Last Name</label>
            <div className="relative group">
              <input 
                type="text" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe" 
                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white placeholder-gray-600 focus:outline-none focus:border-brand-primary focus:bg-gray-200 dark:bg-white/10 transition-all"
                required
                autoComplete="new-password"
              />
            </div>
          </div>
        </div>

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
            />
          </div>
        </div>

        <div className="space-y-1 relative">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Mobile Number</label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="tel" 
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="+1 234 567 890" 
              className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-600 focus:outline-none focus:border-brand-primary focus:bg-gray-200 dark:bg-white/10 transition-all"
              required
            />
          </div>
        </div>

        {role === 'student' && (
          <div className="space-y-1 relative">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">PRN Number</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="text" 
                value={prnNumber}
                onChange={(e) => setPrnNumber(e.target.value)}
                placeholder="e.g. 123456789" 
                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-600 focus:outline-none focus:border-brand-primary focus:bg-gray-200 dark:bg-white/10 transition-all"
                required
              />
            </div>
          </div>
        )}

        <div className="space-y-1 relative">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-12 text-gray-900 dark:text-white placeholder-gray-600 focus:outline-none focus:border-brand-primary focus:bg-gray-200 dark:bg-white/10 transition-all"
              required
              autoComplete="new-password"
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

        <div className="space-y-1 relative">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Confirm Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
            <input 
              type={showConfirmPassword ? 'text' : 'password'} 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-12 text-gray-900 dark:text-white placeholder-gray-600 focus:outline-none focus:border-brand-primary focus:bg-gray-200 dark:bg-white/10 transition-all"
              required
              autoComplete="new-password"
            />
            <button 
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 dark:text-white transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>


        <Button type="submit" variant="gradient" className="w-full mt-6" disabled={loading}>
          {loading ? 'Creating...' : 'Create Account'}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-gray-900 dark:text-white font-medium hover:text-brand-primary transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  );
}
