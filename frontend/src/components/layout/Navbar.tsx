import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Menu, X, UserCircle, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';
import { cn } from '../../utils/cn';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Features', path: '/#features' },
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Hubs', path: '/dashboard/learning' },
  { name: 'Resume Studio', path: '/dashboard/resume' },
  { name: 'Calendar', path: '/dashboard/calendar' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('campus_user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('campus_token');
    localStorage.removeItem('campus_user');
    setUser(null);
    setMobileMenuOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (path.startsWith('/#')) {
      const id = path.substring(2);
      const element = document.getElementById(id);
      if (element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: 'smooth' });
        setMobileMenuOpen(false);
      }
    } else {
      setMobileMenuOpen(false);
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'fixed top-0 inset-x-0 z-50 flex justify-center px-4 py-4 transition-all duration-500',
        isScrolled ? 'py-2' : 'py-6'
      )}
    >
      <nav
        className={cn(
          'flex items-center justify-between w-full px-6 py-3 rounded-full transition-all duration-500 mx-auto',
          isScrolled 
            ? 'max-w-4xl bg-white/70 dark:bg-brand-dark/40 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-lg mt-2' 
            : 'max-w-7xl bg-transparent mt-0'
        )}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-brand-gradient">
            <Sparkles className="w-5 h-5 text-gray-900 dark:text-white" />
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-20" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-brand-secondary transition-colors">
            Campus<span className="text-brand-primary">AI</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              onClick={(e) => handleLinkClick(e, link.path)}
              className="text-sm font-medium px-4 py-2 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-2 text-gray-900 dark:text-white font-medium hover:text-brand-primary transition-colors">
                <UserCircle className="w-5 h-5" />
                <span>{user.first_name}</span>
              </Link>
              <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10">Sign In</Button>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-gray-900 dark:text-white p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-[80px] inset-x-4 p-4 glass-card flex flex-col gap-4 md:hidden"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                onClick={(e) => handleLinkClick(e, link.path)}
                className="px-4 py-3 text-lg font-medium text-gray-900 dark:text-white hover:bg-gray-200 dark:bg-white/10 rounded-xl transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-200 dark:border-white/10 flex flex-col gap-4">
              <div className="flex justify-between items-center px-4">
                <span className="text-gray-900 dark:text-white font-medium">Theme</span>
                <ThemeToggle />
              </div>
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 text-gray-900 dark:text-white font-medium hover:text-brand-primary py-2">
                    <UserCircle className="w-5 h-5" />
                    <span>Go to Dashboard</span>
                  </Link>
                  <Button variant="outline" onClick={handleLogout} className="w-full justify-center text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">Logout</Button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">Sign In</Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
