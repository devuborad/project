import { motion } from 'framer-motion';

const stats = [
  { value: '10K+', label: 'Active Students' },
  { value: '500+', label: 'Events Hosted' },
  { value: '50+', label: 'Campus Clubs' },
  { value: '1,200+', label: 'Internships Landed' },
];

export function Stats() {
  return (
    <section className="py-20 px-6 relative z-10 border-y border-gray-100 dark:border-white/5 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
              className="text-center"
            >
              <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 text-gradient">
                {stat.value}
              </h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
