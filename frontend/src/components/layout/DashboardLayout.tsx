import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  LayoutDashboard, 
  BookOpen, 
  Briefcase, 
  FileText, 
  Calendar, 
  LogOut,
  Menu,
  X,
  Users,
  Brain,
  ChevronLeft,
  ChevronRight,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { AICopilot } from '../ui/AICopilot';
import { ThemeToggle } from '../ui/ThemeToggle';
import { UniversalSearch } from '../ui/UniversalSearch';
import { NotificationBell } from '../ui/NotificationBell';

const studentLinks = [
  { icon: <Sparkles className="w-5 h-5" />, label: 'Home', path: '/' },
  { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
  { icon: <Bot className="w-5 h-5 text-brand-primary" />, label: 'Study Agent', path: '/dashboard/study-agent' },
  { icon: <BookOpen className="w-5 h-5" />, label: 'Learning Hub', path: '/dashboard/learning' },
  { icon: <Brain className="w-5 h-5" />, label: 'AI Analytics', path: '/dashboard/ai-analytics' },
  { icon: <Briefcase className="w-5 h-5" />, label: 'Opportunities', path: '/dashboard/opportunities' },
  { icon: <FileText className="w-5 h-5" />, label: 'Resume Studio', path: '/dashboard/resume' },
  { icon: <FileText className="w-5 h-5" />, label: 'Assignments', path: '/dashboard/student-assignments' },
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
  { icon: <BookOpen className="w-5 h-5" />, label: 'Notes', path: '/dashboard/notes' },
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
  { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Admin Panel', path: '/dashboard' },
  { icon: <Users className="w-5 h-5" />, label: 'Manage Users', path: '/dashboard/users' },
];

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('campus_user') || localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {}
    } else {
      // Default fallback student user for preview
      setUser({ first_name: 'Alex', last_name: 'Rivera', role: 'student', email: 'alex@university.edu' });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('campus_token');
    localStorage.removeItem('campus_user');
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) return studentLinks;
    switch (user.role) {
      case 'admin':
        return adminLinks;
      case 'faculty':
        return facultyLinks;
      case 'club_admin':
        return clubAdminLinks;
      default:
        return studentLinks;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-darker flex text-gray-900 dark:text-gray-100 transition-colors font-sans antialiased">
      {/* Desktop Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 80 }}
        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        className="hidden md:flex flex-col bg-white/70 dark:bg-brand-dark/70 backdrop-blur-2xl border-r border-gray-200/80 dark:border-white/10 z-20 shrink-0 relative transition-colors shadow-sm"
      >
        <div className="h-20 flex items-center justify-between px-5 border-b border-gray-200/80 dark:border-white/10">
          {sidebarOpen ? (
            <Link to="/" className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-md shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white truncate">
                Campus<span className="text-brand-primary">AI</span>
              </span>
            </Link>
          ) : (
            <Link to="/" className="w-9 h-9 mx-auto rounded-xl bg-brand-gradient flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </Link>
          )}
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex-1 py-6 px-3.5 space-y-1.5 overflow-y-auto">
          {getNavLinks().map((link, index) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={index}
                to={link.path}
                className={cn(
                  'flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-medium transition-all group relative',
                  isActive 
                    ? 'bg-brand-gradient text-white shadow-md shadow-brand-primary/25 font-semibold' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-white/[0.04]'
                )}
                title={!sidebarOpen ? link.label : undefined}
              >
                <div className={cn(
                  'shrink-0 transition-transform group-hover:scale-110',
                  isActive ? 'text-white' : 'text-gray-400 dark:text-gray-400 group-hover:text-brand-primary'
                )}>
                  {link.icon}
                </div>
                {sidebarOpen && <span className="truncate">{link.label}</span>}
                {isActive && sidebarOpen && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white ml-auto shadow-sm" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="p-3.5 border-t border-gray-200/80 dark:border-white/10 mt-auto">
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors",
              !sidebarOpen && "justify-center px-0"
            )}
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="font-semibold">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 inset-x-0 h-16 border-b border-gray-200/80 dark:border-white/10 bg-white/85 dark:bg-brand-darker/90 backdrop-blur-2xl z-50 flex items-center justify-between px-4 transition-colors">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold tracking-tight text-gray-900 dark:text-white">Campus<span className="text-brand-primary">AI</span></span>
        </Link>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button onClick={() => setMobileOpen(true)} className="text-gray-900 dark:text-white p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" aria-label="Open menu">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-brand-dark border-r border-gray-200 dark:border-white/10 z-50 p-5 flex flex-col md:hidden transition-colors shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <Link to="/" className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-sm">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">Campus<span className="text-brand-primary">AI</span></span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 space-y-1.5 overflow-y-auto">
                {getNavLinks().map((link, index) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={index}
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all',
                        isActive 
                          ? 'bg-brand-gradient text-white shadow-md font-semibold' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                      )}
                    >
                      <div className={cn(isActive ? 'text-white' : 'text-gray-400')}>{link.icon}</div>
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-colors w-full font-medium text-sm">
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-20 border-b border-gray-200/80 dark:border-white/10 hidden md:flex items-center justify-between px-8 bg-white/40 dark:bg-brand-dark/40 backdrop-blur-2xl z-10 shrink-0">
          <div className="flex items-center gap-4">
            <UniversalSearch />
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-brand-primary/10 to-purple-500/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold shadow-sm">
              <Bot className="w-3.5 h-3.5 animate-bounce" />
              <span>Autonomous Agent Platform Active</span>
            </div>
            {localStorage.getItem('campus_demo_mode') === 'true' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-sm animate-pulse">
                <span>🚀 Hackathon Judge Preview (Seeded Data)</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3.5">
            <NotificationBell />
            <ThemeToggle />
            <div className="h-7 w-px bg-gray-200 dark:bg-white/10 mx-1" />
            <Link to="/dashboard/profile" className="flex items-center gap-3.5 pl-2 pr-4 py-1.5 rounded-full bg-gray-100/80 dark:bg-white/[0.04] hover:bg-gray-200/80 dark:hover:bg-white/[0.08] border border-gray-200/80 dark:border-white/10 transition-all cursor-pointer group shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-brand-primary p-[2px] shrink-0">
                <div className="w-full h-full rounded-full border-2 border-white dark:border-brand-dark overflow-hidden transition-colors">
                  <img src={user?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.first_name || 'Alex'}`} alt="Profile" className="w-full h-full object-cover bg-white" />
                </div>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand-primary transition-colors leading-tight">
                  {user ? `${user.first_name} ${user.last_name || ''}` : 'Loading...'}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 capitalize font-medium">{user?.role || 'Student'}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-full text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all shadow-sm flex items-center justify-center"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 scroll-smooth relative">
          <Outlet />
        </div>
      </main>

      {/* AI Copilot */}
      <AICopilot />
    </div>
  );
}

