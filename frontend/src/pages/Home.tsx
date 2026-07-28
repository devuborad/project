import { Hero } from './home/Hero';
import { Features } from './home/Features';
import { AIFeatures } from './home/AIFeatures';
import { HowItWorks } from './home/HowItWorks';
import { Stats } from './home/Stats';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export function Home() {
  return (
    <div className="flex flex-col pb-16 overflow-hidden">
      <Hero />
      <Stats />
      <AIFeatures />
      <Features />
      <HowItWorks />
      
      {/* Flagship Bottom CTA */}
      <section className="py-24 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto rounded-[36px] bg-gradient-to-br from-brand-dark via-gray-900 to-brand-dark p-10 sm:p-16 border border-white/15 shadow-2xl relative overflow-hidden text-center">
          {/* Background Ambient Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/25 rounded-full blur-[110px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/25 rounded-full blur-[110px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
              <span>START YOUR NEURAL JOURNEY TODAY</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Ready to upgrade your <br />
              <span className="text-gradient">university experience?</span>
            </h2>

            <p className="text-gray-300 text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of students and faculty leveraging CampusAI to optimize their GPA, automate note synthesis, and accelerate career outcomes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" variant="gradient" className="w-full sm:w-auto px-8 py-4 font-bold shadow-xl shadow-brand-primary/40">
                  <span>Create Free Student Account</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="glass" className="w-full sm:w-auto px-8 py-4 font-semibold text-white border-white/20">
                  <span>Sign In to Portal</span>
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex items-center justify-center gap-6 text-xs text-gray-400 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span>Enterprise University SSO</span>
              </span>
              <span>•</span>
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

