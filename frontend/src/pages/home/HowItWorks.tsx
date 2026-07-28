import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';

const steps = [
  {
    number: '01',
    tag: 'Authentication & SSO',
    title: 'Initialize Profile',
    desc: 'Sign up with your university email or student PRN. CampusAI instantly maps your academic department and degree requirements.',
    metric: '< 30s setup',
  },
  {
    number: '02',
    tag: 'Autonomous Sync',
    title: 'Connect Neural Hubs',
    desc: 'Upload course syllabi and lecture PDFs into the Learning Hub. Our vector engine indexes and organizes your entire curriculum.',
    metric: '100% automated',
  },
  {
    number: '03',
    tag: 'Elevated Outcomes',
    title: 'Succeed & Advance',
    desc: 'Interact with AI Copilot for homework guidance, generate targeted resumes in Resume Studio, and match with elite internships.',
    metric: '3.9+ GPA average',
  },
];

export function HowItWorks() {
  return (
    <section className="py-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Aurora Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-brand-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <span className="ai-badge !py-1.5 !px-4 !text-xs flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
              <span>NEURAL ONBOARDING FLOW</span>
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 text-gray-900 dark:text-white"
          >
            Three steps to your <span className="text-gradient">AI university OS.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-base sm:text-lg"
          >
            Get operational with CampusAI in under a minute with our seamless neural enrollment.
          </motion.p>
        </div>

        <div className="relative">
          {/* Glowing Laser Connecting Beam */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-ai-gradient opacity-40 -translate-y-12 hidden md:block" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <GlassCard 
                  className="p-8 h-full flex flex-col items-start text-left border border-gray-200/80 dark:border-white/10 bg-gradient-to-br from-white/90 via-white/60 to-transparent dark:from-white/[0.05] dark:via-white/[0.02] dark:to-transparent transition-all duration-300 group relative"
                  hoverEffect={true}
                >
                  <div className="flex items-center justify-between w-full mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center text-xl font-black text-white shadow-lg shadow-brand-primary/30 group-hover:scale-110 transition-transform duration-300">
                      {step.number}
                    </div>
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400">
                      {step.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2.5 group-hover:text-brand-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6 flex-grow">
                    {step.desc}
                  </p>

                  <div className="w-full pt-4 border-t border-gray-200/60 dark:border-white/10 flex items-center justify-between text-xs font-bold text-brand-primary">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      <span>{step.metric}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

