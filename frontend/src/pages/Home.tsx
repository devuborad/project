import { Hero } from './home/Hero';
import { Features } from './home/Features';
import { AIFeatures } from './home/AIFeatures';
import { HowItWorks } from './home/HowItWorks';
import { Stats } from './home/Stats';

export function Home() {
  return (
    <div className="flex flex-col gap-24 pb-24 overflow-hidden">
      <Hero />
      <Stats />
      <Features />
      <AIFeatures />
      <HowItWorks />
      {/* TODO: Add Testimonials and FAQ */}
    </div>
  );
}
