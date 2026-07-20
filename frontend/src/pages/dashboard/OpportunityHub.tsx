import { useState } from 'react';
import { Search, MapPin, DollarSign, Building, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';

const tags = ['All', 'Internships', 'Hackathons', 'Scholarships', 'Remote'];

const opportunities = [
  { id: 1, title: 'Frontend Developer Intern', company: 'Google', location: 'Remote', stipend: '$8,000/mo', type: 'Internship', tags: ['React', 'TypeScript'] },
  { id: 2, title: 'Global AI Hackathon 2024', company: 'CampusAI', location: 'Online', stipend: '$50k Prize Pool', type: 'Hackathon', tags: ['AI', 'Web3'] },
  { id: 3, title: 'Software Engineering Summer Intern', company: 'Microsoft', location: 'Seattle, WA', stipend: '$7,500/mo', type: 'Internship', tags: ['C++', 'Azure'] },
  { id: 4, title: 'Women in Tech Scholarship', company: 'TechFoundation', location: 'Global', stipend: '$10,000', type: 'Scholarship', tags: ['Diversity'] },
];

export function OpportunityHub() {
  const [activeTag, setActiveTag] = useState('All');

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Opportunity Hub</h1>
          <p className="text-gray-600 dark:text-gray-400">Discover internships, hackathons, and scholarships tailored to your skills.</p>
        </div>
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search roles, companies..." 
            className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-primary focus:bg-gray-200 dark:bg-white/10 w-full transition-all"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeTag === tag 
                ? 'bg-brand-primary text-gray-900 dark:text-white' 
                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:bg-white/10 hover:text-gray-900 dark:text-white border border-gray-100 dark:border-white/5'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {opportunities.map((opp, i) => (
          <motion.div
            key={opp.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="p-6 h-full flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-white/10 flex items-center justify-center font-bold text-xl text-gray-900 dark:text-white">
                    {opp.company.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-semibold group-hover:text-brand-primary transition-colors">{opp.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Building className="w-3 h-3" /> {opp.company}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300 mb-6">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-gray-500" /> {opp.location}</span>
                <span className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-gray-500" /> {opp.stipend}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-2 py-1 bg-gray-200 dark:bg-white/10 rounded-md text-xs text-gray-900 dark:text-white border border-gray-200 dark:border-white/10">{opp.type}</span>
                {opp.tags.map(t => (
                  <span key={t} className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-md text-xs text-gray-600 dark:text-gray-400">{t}</span>
                ))}
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs text-gray-500">Posted 2 days ago</span>
                <Button size="sm" variant="glass" className="h-8 px-4 text-xs">
                  Apply Now <ExternalLink className="w-3 h-3 ml-1.5" />
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
