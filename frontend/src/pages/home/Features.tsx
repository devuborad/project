import { motion } from 'framer-motion';
import { Bot, BookOpen, Briefcase, FileText, LayoutDashboard, BarChart3, Sparkles, ArrowUpRight } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';

const features = [
  {
    icon: <Bot className="w-6 h-6 text-brand-primary" />,
    title: 'AI Copilot',
    tag: 'Neural Assistant',
    description: 'Your autonomous academic copilot for answering questions, synthesizing notes, and generating semester study roadmaps.',
  },
  {
    icon: <BookOpen className="w-6 h-6 text-purple-400" />,
    title: 'Smart Learning Hub',
    tag: 'Semantic RAG',
    description: 'Access AI-organized notes, past papers, and curricula. Search by concept or formula and find exact answers instantly.',
  },
  {
    icon: <Briefcase className="w-6 h-6 text-green-400" />,
    title: 'Opportunity Hub',
    tag: 'Algorithmic Matching',
    description: 'Discover tier-1 tech internships, global hackathons, and research scholarships matched precisely to your technical skills.',
  },
  {
    icon: <FileText className="w-6 h-6 text-yellow-400" />,
    title: 'Resume Studio',
    tag: 'ATS Score Engine',
    description: 'Build recruiter-ready resumes with real-time AI scoring, bullet-point enhancement, and tailored role suggestions.',
  },
  {
    icon: <LayoutDashboard className="w-6 h-6 text-blue-400" />,
    title: 'Student Dashboard',
    tag: 'Realtime Sync',
    description: 'Manage attendance, upcoming hackathons, and assignments in one neural, unified high-performance view.',
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-red-400" />,
    title: 'Admin Analytics',
    tag: 'Predictive ML',
    description: 'Powerful predictive analytics for faculty and university admins to monitor engagement, attendance, and campus performance.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Features() {
  return (
    <section id="features" className="py-28 px-4 sm:px-6 relative z-10 overflow-hidden">
      {/* Background aurora blur */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <span className="ai-badge !py-1.5 !px-4 !text-xs flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
              <span>UNIFIED CAMPUS PLATFORM</span>
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 text-gray-900 dark:text-white leading-tight"
          >
            Everything you need. <br />
            <span className="text-gradient">Supercharged by AI.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed"
          >
            A completely reimagined university OS where every tool communicates intelligently to elevate your academic and career trajectory.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <GlassCard 
                className="p-8 h-full flex flex-col items-start text-left border border-gray-200/80 dark:border-white/10 bg-gradient-to-br from-white/90 via-white/60 to-transparent dark:from-white/[0.04] dark:via-white/[0.02] dark:to-transparent transition-all duration-300 group relative overflow-hidden"
                hoverEffect={true}
              >
                {/* Subtle corner light */}
                <div className="absolute -top-16 -right-16 w-36 h-36 bg-brand-primary/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="flex items-center justify-between w-full mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 dark:bg-white/5 flex items-center justify-center border border-brand-primary/20 dark:border-white/10 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300">
                    {feature.tag}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2.5 group-hover:text-brand-primary transition-colors flex items-center gap-1.5">
                  <span>{feature.title}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-brand-primary" />
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed flex-grow">
                  {feature.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

