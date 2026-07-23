import { Link } from 'react-router-dom';
import { Sparkles, Globe, MessageCircle, Mail } from 'lucide-react';
import { Button } from '../ui/Button';

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-brand-dark overflow-hidden transition-colors">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-brand-primary to-transparent opacity-50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-brand-gradient">
                <Sparkles className="w-4 h-4 text-gray-900 dark:text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-brand-secondary transition-colors">
                Campus<span className="text-brand-primary">AI</span>
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
              One Smart Platform for Every Student. Elevate your campus experience with AI-driven insights, opportunities, and academics.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:border-brand-primary transition-all">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:border-brand-primary transition-all">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:border-brand-primary transition-all">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-semibold mb-6">Platform</h4>
            <ul className="space-y-4">
              <li><Link to="/features" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors text-sm">Features</Link></li>
              <li><Link to="/hubs" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors text-sm">Learning Hub</Link></li>
              <li><Link to="/opportunities" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors text-sm">Opportunities</Link></li>
              <li><Link to="/resume" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors text-sm">Resume Studio</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 dark:text-white font-semibold mb-6">Company</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors text-sm">About Us</Link></li>
              <li><Link to="/careers" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors text-sm">Careers</Link></li>
              <li><Link to="/blog" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors text-sm">Blog</Link></li>
              <li><Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-semibold mb-6">Stay Updated</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Get the latest news and updates from CampusAI.
            </p>
            <form className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary transition-colors"
              />
              <Button variant="gradient" className="w-full">Subscribe</Button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} CampusAI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-gray-500 hover:text-gray-900 dark:text-white text-sm transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-500 hover:text-gray-900 dark:text-white text-sm transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
