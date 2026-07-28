import { motion } from 'framer-motion';
import { GlassCard } from '../../components/ui/GlassCard';
import { Users, BookOpen, TrendingUp, Cpu } from 'lucide-react';

const stats = [
  { value: '14,800+', label: 'Active Neural Profiles', sub: 'Across 40+ campus departments', icon: <Users className="w-5 h-5 text-brand-primary" /> },
  { value: '2,400+', label: 'AI Roadmaps Generated', sub: 'Customized semester schedules', icon: <BookOpen className="w-5 h-5 text-purple-400" /> },
  { value: '99.4%', label: 'Resume ATS Pass Rate', sub: 'For tier-1 tech internships', icon: <TrendingUp className="w-5 h-5 text-green-400" /> },
  { value: '100K+', label: 'Lectures Synthesized', sub: 'Indexed in vector database', icon: <Cpu className="w-5 h-5 text-blue-400" /> },
];

export function Stats() {
  return (
    <section className="py-20 px-4 sm:px-6 relative z-10 border-y border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.015] overflow-hidden">
      <div className="absolute inset-0 bg-aurora opacity-40 z-[-1]" />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
            >
              <GlassCard className="p-6 text-left border border-gray-200/80 dark:border-white/10 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/10 group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-1.5 text-gradient">
                  {stat.value}
                </h3>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  {stat.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.sub}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

