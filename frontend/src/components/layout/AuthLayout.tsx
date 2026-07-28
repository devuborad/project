import { Outlet, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center relative selection:bg-brand-primary selection:text-white p-4 sm:p-6 overflow-hidden">
      {/* Aurora & Neural Background */}
      <div className="fixed inset-0 bg-gray-50 dark:bg-brand-dark z-[-1] transition-colors duration-300" />
      <div className="fixed inset-0 bg-aurora opacity-75 z-[-1]" />
      <div className="fixed inset-0 bg-noise opacity-40 z-[-1]" />
      <div className="fixed -top-[300px] -left-[300px] w-[600px] h-[600px] bg-brand-primary/15 rounded-full blur-[150px] pointer-events-none z-[-1]" />
      <div className="fixed -bottom-[300px] -right-[300px] w-[600px] h-[600px] bg-purple-500/15 rounded-full blur-[150px] pointer-events-none z-[-1]" />

      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="fixed top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-gray-200/80 dark:border-white/15 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-brand-primary/50 transition-all shadow-sm group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span className="text-xs font-semibold">Back to Home</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[1050px] bg-white/80 dark:bg-brand-dark/80 backdrop-blur-3xl border border-gray-200/90 dark:border-white/15 rounded-[32px] overflow-hidden flex shadow-[0_20px_80px_rgba(0,0,0,0.25)] relative transition-colors"
      >
        {/* Glow behind the card */}
        <div className="absolute -top-px left-0 right-0 h-px bg-ai-gradient opacity-80" />

        {/* Left Side - Image/Branding */}
        <div className="hidden lg:flex w-5/12 bg-gradient-to-br from-gray-100/90 via-gray-100/40 to-transparent dark:from-brand-darker dark:via-white/[0.02] dark:to-transparent relative flex-col justify-between p-10 overflow-hidden border-r border-gray-200/80 dark:border-white/10 transition-colors">
          <div className="absolute top-1/4 -right-20 w-64 h-64 bg-brand-primary/20 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-1/4 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-[90px] pointer-events-none" />

          {/* Top badge */}
          <div className="flex items-center gap-2">
            <span className="ai-badge !py-1 !px-3 !text-[11px] flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-brand-primary" />
              <span>CampusAI Neural OS 4.0</span>
            </span>
          </div>

          {/* Center Brand Feature */}
          <div className="relative z-10 my-auto py-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center mb-6 shadow-xl shadow-brand-primary/35">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-3 leading-tight">
              Empower Your Campus Journey
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
              Access AI-driven resume coaching, intelligent course roadmap generation, and live academic analytics—built for tomorrow's leaders.
            </p>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
                <span>Enterprise-grade university security</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                <Sparkles className="w-4 h-4 text-brand-primary shrink-0" />
                <span>Real-time AI Copilot assistance 24/7</span>
              </div>
            </div>
          </div>

          {/* Bottom attribution */}
          <div className="relative z-10 text-xs text-gray-500 dark:text-gray-500 flex items-center justify-between">
            <span>© {new Date().getFullYear()} CampusAI Inc.</span>
            <span className="font-mono text-[10px]">v4.2.0-neural</span>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-7/12 p-8 sm:p-14 relative bg-transparent flex flex-col justify-center">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
}

