import { motion } from 'framer-motion';
import { Sparkles, Zap, Brain, Target, MessageSquare, BookText } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';

const aiFeatures = [
  {
    icon: <MessageSquare className="w-5 h-5 text-brand-primary" />,
    title: 'Campus AI Copilot',
    desc: 'Ask questions about your courses, campus events, or get help with coding assignments.',
  },
  {
    icon: <Brain className="w-5 h-5 text-brand-primary" />,
    title: 'Notes Summarizer',
    desc: 'Upload 50-page PDFs and get a concise summary in seconds.',
  },
  {
    icon: <Zap className="w-5 h-5 text-brand-primary" />,
    title: 'Resume Analyzer',
    desc: 'Get instant feedback on your resume format, keywords, and ATS compatibility.',
  },
  {
    icon: <Target className="w-5 h-5 text-brand-primary" />,
    title: 'Career Coach',
    desc: 'Receive personalized interview tips and career roadmaps based on your profile.',
  },
  {
    icon: <BookText className="w-5 h-5 text-brand-primary" />,
    title: 'Smart Search',
    desc: 'Find any document, assignment, or past paper instantly using semantic search.',
  },
];

export function AIFeatures() {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 glass-card mb-6"
            >
              <Sparkles className="w-4 h-4 text-brand-primary" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Next-Gen AI</span>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
            >
              Intelligence woven into <span className="text-brand-primary">every interaction.</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8"
            >
              CampusAI doesn't just store data; it understands it. From summarizing your readings to planning your career path, AI is built directly into the tools you use every day.
            </motion.p>
          </div>

          <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {aiFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={i === 0 ? 'sm:col-span-2' : ''}
              >
                <GlassCard className="p-6 h-full border-t border-gray-200 dark:border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent hover:from-white/[0.08]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-brand-dark flex items-center justify-center border border-gray-200 dark:border-white/10 transition-colors">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
