import { Link } from 'react-router-dom';
import { Sparkles, Globe, MessageCircle, Mail, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-brand-dark/95 backdrop-blur-3xl overflow-hidden transition-colors">
      {/* Aurora Glow Separator Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-0.5 bg-ai-gradient opacity-80" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand-primary/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand - Span 4 */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4">
            <Link to="/" className="flex items-center gap-2.5 mb-6 group inline-flex">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-brand-gradient shadow-md shadow-brand-primary/30 group-hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-5 h-5 text-white" />
                <div className="absolute inset-0 rounded-2xl bg-white/20 animate-ping opacity-25" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-brand-primary transition-colors">
                Campus<span className="text-brand-primary">AI</span>
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed max-w-sm">
              The neural operating system for ambitious students. Elevate your academic workflow, discover internships, and master coursework with flagship AI.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 rounded-xl glass flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-brand-primary dark:hover:text-white hover:border-brand-primary/50 hover:-translate-y-0.5 transition-all shadow-sm">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl glass flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-brand-primary dark:hover:text-white hover:border-brand-primary/50 hover:-translate-y-0.5 transition-all shadow-sm">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl glass flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-brand-primary dark:hover:text-white hover:border-brand-primary/50 hover:-translate-y-0.5 transition-all shadow-sm">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links - Span 2 */}
          <div className="lg:col-span-2">
            <h4 className="text-gray-900 dark:text-white font-bold text-sm tracking-wide uppercase mb-6">Platform</h4>
            <ul className="space-y-3.5">
              <li><Link to="/features" className="text-gray-600 dark:text-gray-400 hover:text-brand-primary dark:hover:text-white transition-colors text-sm font-medium">Features</Link></li>
              <li><Link to="/hubs" className="text-gray-600 dark:text-gray-400 hover:text-brand-primary dark:hover:text-white transition-colors text-sm font-medium">Learning Hub</Link></li>
              <li><Link to="/opportunities" className="text-gray-600 dark:text-gray-400 hover:text-brand-primary dark:hover:text-white transition-colors text-sm font-medium">Opportunities</Link></li>
              <li><Link to="/resume" className="text-gray-600 dark:text-gray-400 hover:text-brand-primary dark:hover:text-white transition-colors text-sm font-medium">Resume Studio</Link></li>
            </ul>
          </div>

          {/* Company - Span 2 */}
          <div className="lg:col-span-2">
            <h4 className="text-gray-900 dark:text-white font-bold text-sm tracking-wide uppercase mb-6">Company</h4>
            <ul className="space-y-3.5">
              <li><Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-brand-primary dark:hover:text-white transition-colors text-sm font-medium">About Us</Link></li>
              <li><Link to="/careers" className="text-gray-600 dark:text-gray-400 hover:text-brand-primary dark:hover:text-white transition-colors text-sm font-medium">Careers</Link></li>
              <li><Link to="/blog" className="text-gray-600 dark:text-gray-400 hover:text-brand-primary dark:hover:text-white transition-colors text-sm font-medium">Blog</Link></li>
              <li><Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-brand-primary dark:hover:text-white transition-colors text-sm font-medium">Contact</Link></li>
            </ul>
          </div>

          {/* Newsletter - Span 4 */}
          <div className="lg:col-span-4">
            <div className="mb-4">
              <span className="ai-badge !py-0.5 !px-2.5 !text-[10px] mb-2">Neural Network Dispatch</span>
              <h4 className="text-gray-900 dark:text-white font-bold text-base mt-1">Stay Connected</h4>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
              Subscribe to receive curated academic AI prompts and platform updates weekly.
            </p>
            <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your university email..." 
                className="flex-1 bg-gray-100/90 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary focus:bg-white dark:focus:bg-white/10 transition-all shadow-inner"
              />
              <Button variant="gradient" className="shrink-0 px-6 font-semibold shadow-md shadow-brand-primary/20">
                <span>Join</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} CampusAI Inc. Powered by Neural Engine.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-brand-primary dark:hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-brand-primary dark:hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/security" className="hover:text-brand-primary dark:hover:text-white transition-colors">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

