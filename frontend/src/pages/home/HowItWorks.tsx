import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Register Profile',
    desc: 'Sign up with your college ID and let CampusAI understand your major, skills, and goals.',
  },
  {
    number: '02',
    title: 'Explore Hubs',
    desc: 'Dive into the Learning Hub for notes or the Opportunity Hub for internships matched to you.',
  },
  {
    number: '03',
    title: 'Grow & Succeed',
    desc: 'Use the AI Copilot to study smarter and the Resume Studio to land your dream job.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
          >
            How it works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 dark:text-gray-400"
          >
            Three simple steps to transform your academic journey.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent -translate-y-1/2 hidden md:block" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-full glass-card flex items-center justify-center text-xl font-bold text-gray-900 dark:text-white mb-6 relative group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_0_30px_rgba(255,31,77,0.4)]">
                  {/* Glow */}
                  <div className="absolute inset-0 rounded-full bg-brand-primary opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-500" />
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
