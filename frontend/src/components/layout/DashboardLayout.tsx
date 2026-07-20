import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  LayoutDashboard, 
  BookOpen, 
  Briefcase, 
  FileText, 
  Calendar, 
  Settings, 
  LogOut,
  Search,
  Menu,
  X,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { AICopilot } from '../ui/AICopilot';
import { ThemeToggle } from '../ui/ThemeToggle';

const studentLinks = [
  { icon: <Sparkles className="w-5 h-5" />, label: 'Home', path: '/' },
  { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
  { icon: <BookOpen className="w-5 h-5" />, label: 'Learning Hub', path: '/dashboard/learning' },
  { icon: <Briefcase className="w-5 h-5" />, label: 'Opportunities', path: '/dashboard/opportunities' },
  { icon: <FileText className="w-5 h-5" />, label: 'Resume Studio', path: '/dashboard/resume' },
  { icon: <Calendar className="w-5 h-5" />, label: 'Calendar', path: '/dashboard/calendar' },
];

const facultyLinks = [
  { icon: <Sparkles className="w-5 h-5" />, label: 'Home', path: '/' },
  { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Faculty Dashboard', path: '/dashboard' },
  { icon: <BookOpen className="w-5 h-5" />, label: 'Manage Students', path: '/dashboard/students' },
  { icon: <FileText className="w-5 h-5" />, label: 'Manage Lectures', path: '/dashboard/lectures' },
  { icon: <Calendar className="w-5 h-5" />, label: 'Calendar', path: '/dashboard/calendar' },
  { icon: <Briefcase className="w-5 h-5" />, label: 'Attendance', path: '/dashboard/attendance' },
  { icon: <FileText className="w-5 h-5" />, label: 'Assignments', path: '/dashboard/assignments' },
];

const clubAdminLinks = [
  { icon: <Sparkles className="w-5 h-5" />, label: 'Home', path: '/' },
  { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Club Dashboard', path: '/dashboard' },
  { icon: <Calendar className="w-5 h-5" />, label: 'Manage Events', path: '/dashboard/events' },
  { icon: <Briefcase className="w-5 h-5" />, label: 'Manage Hackathons', path: '/dashboard/hackathons' },
  { icon: <Users className="w-5 h-5" />, label: 'Members', path: '/dashboard/members' },
];

const adminLinks = [
  { icon: <Sparkles className="w-5 h-5" />, label: 'Home', path: '/' },
  { icon: <LayoutDashboard className="w-5 h-5" />, label: 'System Admin', path: '/dashboard' },
  { icon: <Users className="w-5 h-5" />, label: 'Manage Users', path: '/dashboard/users' },
  { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/dashboard/settings' },
];

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [user] = useState<any>(() => {
    const userStr = localStorage.getItem('campus_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('campus_token');
    localStorage.removeItem('campus_user');
    navigate('/');
  };

  if (!user) {
    return null; // Don't render layout while redirecting
  }

  const getLinks = () => {
    if (user?.role === 'faculty') return facultyLinks;
    if (user?.role === 'club_admin') return clubAdminLinks;
    if (user?.role === 'admin') return adminLinks;
    return studentLinks;
  };

  return (
    <div className="min-h-screen bg-brand-dark flex overflow-hidden selection:bg-brand-primary selection:text-gray-900 dark:text-white">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-noise opacity-50 z-[-1]" />
      <div className="fixed -top-[200px] -left-[200px] w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none z-[-1]" />

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 80 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="hidden md:flex flex-col border-r border-gray-100 dark:border-white/5 bg-white/[0.02] backdrop-blur-3xl relative z-20"
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100 dark:border-white/5">
          <Link to="/" className="flex items-center gap-2 overflow-hidden">
            <div className="min-w-[32px] h-8 rounded-xl bg-brand-gradient flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-gray-900 dark:text-white" />
            </div>
            {sidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-gray-900 dark:text-white whitespace-nowrap"
              >
                CampusAI
              </motion.span>
            )}
          </Link>
        </div>

        <div className="flex flex-col gap-2 p-4 mt-4 flex-1">
          {getLinks().map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.label}
                to={link.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative overflow-hidden",
                  isActive ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-white/5"
                )}
                title={!sidebarOpen ? link.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-brand-primary/20 border border-brand-primary/30 rounded-xl"
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3 w-full">
                  <div className={cn("transition-colors", isActive ? "text-brand-primary" : "")}>
                    {link.icon}
                  </div>
                  {sidebarOpen && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap font-medium">
                      {link.label}
                    </motion.span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-white/5 flex flex-col gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium whitespace-nowrap">Collapse</span>}
          </button>
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-white/5 transition-colors"
          >
            <Settings className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium whitespace-nowrap">Settings</span>}
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors w-full text-left">
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium whitespace-nowrap">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Header & Sidebar */}
      <div className="md:hidden fixed top-0 inset-x-0 h-16 border-b border-gray-100 dark:border-white/5 bg-brand-darker/80 backdrop-blur-xl z-50 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-gray-900 dark:text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">CampusAI</span>
        </Link>
        <button onClick={() => setMobileOpen(true)} className="text-gray-900 dark:text-white p-2">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-brand-dark border-r border-gray-200 dark:border-white/10 z-50 p-4 flex flex-col md:hidden"
            >
              <div className="flex justify-end mb-8">
                <button onClick={() => setMobileOpen(false)} className="text-gray-600 dark:text-gray-400 p-2"><X className="w-6 h-6" /></button>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                {getLinks().map((link) => (
                  <Link
                    key={link.label}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                      location.pathname === link.path ? "bg-brand-primary/20 text-brand-primary" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white"
                    )}
                  >
                    {link.icon}
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-20 border-b border-gray-100 dark:border-white/5 hidden md:flex items-center justify-between px-8 bg-transparent backdrop-blur-md z-10 shrink-0">
          <div className="relative w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="w-full bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-full py-2.5 pl-11 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary/50 focus:bg-gray-200 dark:bg-white/10 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-2 py-1 rounded bg-gray-200 dark:bg-white/10 text-[10px] text-gray-600 dark:text-gray-400 font-mono">⌘K</kbd>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="h-8 w-px bg-gray-200 dark:bg-white/10 mx-2" />
            <Link to="/dashboard/profile" className="flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-brand-primary p-[2px]">
                <div className="w-full h-full rounded-full border-2 border-brand-dark overflow-hidden">
                  <img src={user?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.first_name || 'Alex'}`} alt="Profile" className="w-full h-full object-cover bg-white" />
                </div>
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-brand-primary transition-colors">
                  {user ? `${user.first_name} ${user.last_name || ''}` : 'Loading...'}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'Student'}</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 scroll-smooth relative z-0">
          <Outlet />
        </div>
      </main>

      {/* AI Copilot */}
      <AICopilot />
    </div>
  );
}
