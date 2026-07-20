import { motion } from 'framer-motion';
import { Bot, BookOpen, Briefcase, FileText, LayoutDashboard, BarChart3 } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';

const features = [
  {
    icon: <Bot className="w-6 h-6 text-brand-primary" />,
    title: 'AI Copilot',
    description: 'Your personal assistant for answering questions, summarizing notes, and generating study plans.',
  },
  {
    icon: <BookOpen className="w-6 h-6 text-brand-primary" />,
    title: 'Smart Learning Hub',
    description: 'Access AI-organized notes, past papers, and subjects. Find exactly what you need instantly.',
  },
  {
    icon: <Briefcase className="w-6 h-6 text-brand-primary" />,
    title: 'Opportunity Hub',
    description: 'Discover internships, hackathons, and scholarships tailored to your skills and interests.',
  },
  {
    icon: <FileText className="w-6 h-6 text-brand-primary" />,
    title: 'Resume Studio',
    description: 'Build ATS-friendly resumes with real-time AI scoring and tailored suggestions.',
  },
  {
    icon: <LayoutDashboard className="w-6 h-6 text-brand-primary" />,
    title: 'Student Dashboard',
    description: 'Manage attendance, upcoming events, and assignments in one beautiful, unified view.',
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-brand-primary" />,
    title: 'Admin Analytics',
    description: 'Powerful insights for faculty and admins to track engagement and performance across campus.',
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
    <section id="features" className="py-24 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
          >
            Everything you need. <br />
            <span className="text-gray-600 dark:text-gray-400">Powered by AI.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            A completely reimagined campus experience where every tool works seamlessly together to help you succeed.
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
              <GlassCard className="p-8 h-full flex flex-col items-start text-left">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed flex-grow">
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
