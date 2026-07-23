import { Outlet, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center relative selection:bg-brand-primary selection:text-gray-900 dark:text-white p-4">
      {/* Background */}
      <div className="fixed inset-0 bg-gray-50 dark:bg-brand-dark z-[-1] transition-colors duration-300" />
      <div className="fixed inset-0 bg-aurora z-[-1]" />
      <div className="fixed inset-0 bg-noise z-[-1]" />

      <Link 
        to="/" 
        className="fixed top-8 left-8 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[1000px] bg-white/70 dark:bg-white/[0.03] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden flex shadow-2xl relative transition-colors"
      >
        {/* Glow behind the card */}
        <div className="absolute -inset-1 bg-brand-gradient opacity-20 blur-2xl z-[-1]" />

        {/* Left Side - Image/Branding */}
        <div className="hidden lg:flex w-1/2 bg-gray-100 dark:bg-brand-darker relative items-center justify-center p-12 overflow-hidden border-r border-gray-200 dark:border-white/5 transition-colors">
          <div className="absolute inset-0 bg-brand-primary/10 blur-[100px]" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center mb-6 shadow-lg shadow-brand-primary/30">
              <Sparkles className="w-8 h-8 text-gray-900 dark:text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Welcome to CampusAI</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Join the most advanced student ecosystem. Manage your academics, discover opportunities, and grow your career with AI.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 relative bg-transparent">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
}
