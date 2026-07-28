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
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
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
        isScrolled ? 'py-3' : 'py-5'
      )}
    >
      <nav
        className={cn(
          'flex items-center justify-between w-full px-6 py-3.5 rounded-full transition-all duration-500 mx-auto',
          isScrolled 
            ? 'max-w-5xl bg-white/80 dark:bg-brand-dark/75 backdrop-blur-2xl border border-gray-200/90 dark:border-white/15 shadow-[0_10px_40px_rgba(0,0,0,0.25)]' 
            : 'max-w-7xl bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl border border-gray-200/60 dark:border-white/10 shadow-sm'
        )}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-brand-gradient shadow-md shadow-brand-primary/30 group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-5 h-5 text-white" />
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-25" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-brand-primary transition-colors">
            Campus<span className="text-brand-primary">AI</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1 bg-gray-100/70 dark:bg-white/[0.04] px-2 py-1 rounded-full border border-gray-200/60 dark:border-white/5">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              onClick={(e) => handleLinkClick(e, link.path)}
              className="relative text-sm font-medium px-4 py-1.5 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 transition-all duration-200"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-3 bg-gray-100/70 dark:bg-white/[0.05] pl-3 pr-2 py-1.5 rounded-full border border-gray-200/60 dark:border-white/10">
              <Link to="/dashboard" className="flex items-center gap-2 text-gray-900 dark:text-white font-medium hover:text-brand-primary text-sm transition-colors">
                <UserCircle className="w-4 h-4 text-brand-primary" />
                <span>{user.first_name}</span>
              </Link>
              <button 
                onClick={handleLogout} 
                className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors" 
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="gradient" size="sm" className="shadow-md shadow-brand-primary/25 font-semibold">
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-gray-900 dark:text-white p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[84px] inset-x-4 p-5 bg-white/95 dark:bg-brand-dark/95 backdrop-blur-3xl border border-gray-200/90 dark:border-white/15 rounded-3xl flex flex-col gap-3 shadow-2xl md:hidden"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                onClick={(e) => handleLinkClick(e, link.path)}
                className="px-4 py-3 text-base font-medium text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-2xl transition-colors flex items-center justify-between"
              >
                <span>{link.name}</span>
              </Link>
            ))}
            <div className="pt-4 mt-2 border-t border-gray-200 dark:border-white/10 flex flex-col gap-3">
              <div className="flex justify-between items-center px-4 py-1">
                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Theme Mode</span>
                <ThemeToggle />
              </div>
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 text-gray-900 dark:text-white font-medium hover:text-brand-primary py-2.5 rounded-xl bg-gray-100 dark:bg-white/5">
                    <UserCircle className="w-5 h-5 text-brand-primary" />
                    <span>Go to Dashboard</span>
                  </Link>
                  <Button variant="outline" onClick={handleLogout} className="w-full justify-center text-red-500 border-red-500/50 hover:bg-red-50 dark:hover:bg-red-500/10">Logout</Button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="gradient" className="w-full justify-center shadow-lg shadow-brand-primary/30">Sign In</Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

