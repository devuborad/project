import { useState, useEffect } from 'react';
import { Search, MapPin, DollarSign, Building, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';

const tagsList = ['All', 'Internship', 'Hackathon', 'Scholarship'];

export function OpportunityHub() {
  const [activeTag, setActiveTag] = useState('All');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOpportunities = async (type = '') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('campus_token');
      const url = `http://localhost:5000/api/internships${type && type !== 'All' ? `?type=${encodeURIComponent(type)}` : ''}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOpportunities(data);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities(activeTag);
  }, [activeTag]);

  const handleApply = async (id: number) => {
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/internships/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ internship_id: id })
      });
      if (response.ok) {
        alert('Successfully applied!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to apply');
      }
    } catch (error) {
      console.error('Apply error:', error);
      alert('Network error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-12">
      {/* Supercharged Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 mb-2.5">
            <span className="ai-badge !py-1 !px-3 !text-xs">ALGORITHMIC ROLE MATCHING</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-1.5 tracking-tight">
            Opportunity <span className="text-gradient">Hub</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Discover internships, hackathons, and research scholarships tailored to your resume ATS skills.
          </p>
        </div>
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search roles, companies, tags..." 
            className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-primary focus:bg-gray-200 dark:bg-white/10 w-full transition-all"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {tagsList.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeTag === tag 
                ? 'bg-brand-primary text-gray-900 dark:text-white shadow-[0_0_15px_rgba(255,31,77,0.3)]' 
                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:bg-white/10 hover:text-gray-900 dark:text-white border border-gray-100 dark:border-white/5'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center text-gray-500">Loading opportunities...</div>
        ) : opportunities.length === 0 ? (
          <div className="col-span-full py-12 flex justify-center text-gray-500">No opportunities found.</div>
        ) : opportunities.map((opp, i) => (
          <motion.div
            key={opp.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard className="p-6 h-full flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-white/10 flex items-center justify-center font-bold text-xl text-gray-900 dark:text-white">
                    {opp.company?.charAt(0) || '?'}
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
                <span className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-gray-500" /> {opp.stipend || 'Unpaid'}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-2 py-1 bg-gray-200 dark:bg-white/10 rounded-md text-xs text-gray-900 dark:text-white border border-gray-200 dark:border-white/10">{opp.type}</span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-2 flex-1">
                {opp.description}
              </p>

              <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs text-gray-500">Posted by {opp.first_name}</span>
                <Button size="sm" variant="glass" className="h-8 px-4 text-xs" onClick={() => handleApply(opp.id)}>
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
