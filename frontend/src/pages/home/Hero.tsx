import { motion } from 'framer-motion';
import { Bot, ArrowRight, Sparkles, Zap, TrendingUp, BookOpen } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center pt-28 pb-16 px-4 overflow-hidden">
      {/* Background Aurora & Mesh Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-brand-primary/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full text-center relative z-10">
        
        {/* Flagship AI Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 mb-8"
        >
          <span className="ai-badge !py-1.5 !px-4 !text-xs sm:!text-sm flex items-center gap-2 shadow-lg shadow-brand-primary/20">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <Sparkles className="w-4 h-4 text-brand-primary" />
            <span>INTRODUCING NEURAL CAMPUSAI 4.0</span>
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[1.08] text-gray-900 dark:text-white"
        >
          One Neural Platform for <br className="hidden sm:block" />
          <span className="text-gradient">Every Ambitious Student</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-11 leading-relaxed font-normal"
        >
          Stop switching between fragmented university apps. CampusAI unifies live academic analytics, autonomous career coaching, course roadmaps, and flagship AI assistance into an extraordinary student OS.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Link to="/signup" className="w-full sm:w-auto">
            <Button size="lg" variant="gradient" className="w-full sm:w-auto px-8 py-4 text-base font-bold shadow-xl shadow-brand-primary/30">
              <span>Initialize Workspace</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link to="/features" className="w-full sm:w-auto">
            <Button size="lg" variant="glass" className="w-full sm:w-auto px-8 py-4 text-base font-semibold border-gray-200/80 dark:border-white/15">
              <span>Explore Neural Engine</span>
            </Button>
          </Link>
        </motion.div>
        
        {/* Animated Multi-Layered Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-5xl mx-auto perspective-1000"
        >
          <div className="absolute -inset-4 bg-ai-gradient opacity-20 blur-3xl rounded-[48px] pointer-events-none" />
          <div className="relative rounded-t-[40px] border border-gray-200/80 dark:border-white/15 bg-white/70 dark:bg-brand-darker/70 p-3 pt-5 shadow-2xl backdrop-blur-2xl">
            {/* Top Window Bar */}
            <div className="flex items-center justify-between mb-4 px-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-mono text-gray-500">
                <span>campusai.edu/neural-workspace</span>
              </div>
              <div className="w-12" />
            </div>
            
            {/* Mockup Surface */}
            <div className="rounded-t-3xl overflow-hidden border border-gray-200/80 dark:border-white/10 bg-gray-900/90 dark:bg-brand-dark/90 h-[440px] sm:h-[480px] flex items-center justify-center relative group transition-colors">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-25 group-hover:opacity-35 transition-opacity duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
              
              {/* Floating Glass Widget 1 - Top Left */}
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-8 left-6 sm:left-12 glass-card p-4 sm:p-5 rounded-2xl flex items-center gap-3.5 border border-white/20 shadow-xl max-w-xs text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/40 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400">Academic Trajectory</p>
                  <p className="text-base font-bold text-white">GPA Forecast: <span className="text-green-400">3.94</span></p>
                </div>
              </motion.div>

              {/* Floating Glass Widget 2 - Top Right */}
              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-12 right-6 sm:right-12 glass-card p-4 sm:p-5 rounded-2xl hidden sm:flex items-center gap-3.5 border border-white/20 shadow-xl max-w-xs text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400">Adaptive Roadmap</p>
                  <p className="text-base font-bold text-white">Advanced ML Track</p>
                </div>
              </motion.div>

              {/* Center Neural Copilot Glass Pill */}
              <motion.div 
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 glass-card p-6 sm:p-8 rounded-3xl flex items-center gap-5 border border-brand-primary/30 shadow-2xl bg-brand-dark/80 backdrop-blur-3xl max-w-md mx-4 text-left"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center shrink-0 shadow-lg shadow-brand-primary/40 relative">
                  <Bot className="w-7 h-7 text-white" />
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-brand-dark animate-ping" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">Neural 4.0 Active</span>
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-semibold">Live</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">CampusAI Copilot</h3>
                  <p className="text-sm text-gray-300">"We synthesized 14 lecture notes and generated a 20-question practice exam for your Systems Midterm."</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

