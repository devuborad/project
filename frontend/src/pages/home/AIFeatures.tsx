import { motion } from 'framer-motion';
import { Zap, Brain, Target, MessageSquare, BookText, Cpu, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';

const aiFeatures = [
  {
    icon: <MessageSquare className="w-6 h-6 text-brand-primary" />,
    title: 'Campus AI Copilot',
    tag: 'Realtime Neural NLP',
    desc: 'Engage with an academic assistant trained on university curricula, coding assignments, and campus schedules.',
    highlight: '24/7 Academic Support',
  },
  {
    icon: <Brain className="w-6 h-6 text-purple-400" />,
    title: 'Notes & Lecture Synthesizer',
    tag: 'GPT-4o Vision & Audio',
    desc: 'Upload 100-page research PDFs, slide decks, or recorded lectures to generate structured cheat sheets in seconds.',
    highlight: 'Instant PDF Synthesis',
  },
  {
    icon: <Zap className="w-6 h-6 text-yellow-400" />,
    title: 'AI Resume Analyzer',
    tag: 'ATS 99% Engine',
    desc: 'Receive instant algorithmic feedback on formatting, keyword density, and ATS optimization for tier-1 tech internships.',
    highlight: 'Live Score Tracking',
  },
  {
    icon: <Target className="w-6 h-6 text-green-400" />,
    title: 'Adaptive Career Coach',
    tag: 'Roadmap Generator',
    desc: 'Simulate technical interviews and receive customized semester roadmaps tailored to your career aspirations.',
    highlight: 'Mock Tech Interviews',
  },
  {
    icon: <BookText className="w-6 h-6 text-blue-400" />,
    title: 'Semantic University Search',
    tag: 'Vector Embeddings',
    desc: 'Find any assignment, syllabus, club announcement, or library resource instantly with meaning-based search.',
    highlight: 'Zero-Latency Queries',
  },
];

export function AIFeatures() {
  return (
    <section className="py-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Subtle Aurora Backdrop */}
      <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="lg:w-5/12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 mb-6"
            >
              <span className="ai-badge !py-1.5 !px-3.5 !text-xs flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-brand-primary animate-spin" style={{ animationDuration: '8s' }} />
                <span>NEURAL ENGINE OVERVIEW</span>
              </span>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 leading-tight text-gray-900 dark:text-white"
            >
              Intelligence woven into <span className="text-gradient">every campus workflow.</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 dark:text-gray-400 text-base sm:text-lg leading-relaxed mb-10"
            >
              CampusAI doesn't just store university data—it synthesizes it. From autonomous lecture notes to real-time career roadmap generation, our neural architecture powers every academic interaction.
            </motion.p>

            {/* Neural Benchmarks Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 gap-4 p-5 rounded-3xl bg-gray-100/80 dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/10"
            >
              <div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">0.18s</p>
                <p className="text-xs text-gray-500 font-medium">Avg NLP Latency</p>
              </div>
              <div>
                <p className="text-2xl font-black text-brand-primary">99.8%</p>
                <p className="text-xs text-gray-500 font-medium">Syllabus Accuracy</p>
              </div>
              <div>
                <p className="text-2xl font-black text-purple-400">100K+</p>
                <p className="text-xs text-gray-500 font-medium">Lectures Analyzed</p>
              </div>
            </motion.div>
          </div>

          <div className="lg:w-7/12 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {aiFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={i === 0 ? 'sm:col-span-2' : ''}
              >
                <GlassCard 
                  className="p-7 h-full border border-gray-200/80 dark:border-white/10 bg-gradient-to-br from-white/90 via-white/50 to-transparent dark:from-white/[0.05] dark:via-white/[0.02] dark:to-transparent transition-all duration-300 group relative overflow-hidden"
                  hoverEffect={true}
                >
                  {/* Subtle hover gradient glow */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 dark:bg-white/5 flex items-center justify-center border border-brand-primary/20 dark:border-white/10 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300">
                      {feature.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-primary transition-colors flex items-center gap-1.5">
                    <span>{feature.title}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-brand-primary" />
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    {feature.desc}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200/60 dark:border-white/10">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    <span>{feature.highlight}</span>
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

