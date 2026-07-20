import { motion } from 'framer-motion';
import { Bot, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 px-4 overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full text-center relative z-10">
        
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 glass-card mb-8"
        >
          <Sparkles className="w-4 h-4 text-brand-primary" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Introducing CampusAI 2.0</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.1]"
        >
          One Smart Platform for <br className="hidden md:block" />
          <span className="text-gradient">Every Student</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Stop switching between 10 different apps. CampusAI combines academics, opportunities, AI assistance, and campus services into one beautiful, intelligent ecosystem.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Link to="/signup">
            <Button size="lg" variant="gradient" className="w-full sm:w-auto">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/demo">
            <Button size="lg" variant="glass" className="w-full sm:w-auto">
              Watch Demo
            </Button>
          </Link>
        </motion.div>
        
        {/* Animated Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-5xl mx-auto perspective-1000"
        >
          <div className="absolute inset-0 bg-brand-primary/20 blur-[100px] rounded-[40px] transform scale-95 translate-y-10" />
          <div className="relative rounded-t-[40px] border-t border-x border-white/20 glass bg-white/[0.02] p-2 pt-4 shadow-2xl backdrop-blur-2xl">
            <div className="flex gap-2 mb-4 px-4">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            
            <div className="rounded-t-3xl overflow-hidden border-t border-x border-gray-200 dark:border-white/10 bg-brand-darker/80 h-[400px] flex items-center justify-center relative group">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity duration-700" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent" />
              
              <div className="relative z-10 glass-card p-6 flex items-center gap-4 animate-float">
                <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center">
                  <Bot className="w-6 h-6 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Campus AI Copilot</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Analyzing your upcoming assignments...</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
