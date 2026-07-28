import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, History, Sparkles, Loader2, ArrowRight } from 'lucide-react';

export function UniversalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [results, setResults] = useState<{answer: string, results: any[], intent: string} | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch history on open
  useEffect(() => {
    if (isOpen) {
      fetchHistory();
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // Reset on close
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch('http://localhost:5000/api/search/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setRecentSearches(data.history || []);
      }
    } catch (err) {
      console.error('Failed to fetch search history');
    }
  };

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setResults(null);
    setQuery(searchQuery);

    try {
      const token = localStorage.getItem('campus_token');
      const response = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setResults(data);
        // Add to local recent searches optimistically
        setRecentSearches(prev => [searchQuery, ...prev.filter(q => q !== searchQuery)].slice(0, 5));
      }
    } catch (err) {
      console.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Search Bar Trigger for UI integration */}
      <div 
        className="relative w-80 lg:w-96 group cursor-pointer"
        onClick={() => setIsOpen(true)}
        title="Search CampusAI (⌘K)"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-brand-primary transition-colors duration-300" />
        <div className="w-full bg-gray-100/80 dark:bg-white/[0.05] border border-gray-200/80 dark:border-white/10 rounded-full py-2 pl-11 pr-3 text-sm text-gray-600 dark:text-gray-400 group-hover:border-brand-primary/40 group-hover:bg-white dark:group-hover:bg-white/[0.08] group-hover:shadow-[0_0_20px_rgba(255,31,77,0.15)] transition-all duration-300 flex items-center justify-between">
          <span className="truncate">Search campus data...</span>
          <kbd className="px-2 py-0.5 rounded-full bg-gray-200/80 dark:bg-white/10 text-[10px] text-gray-700 dark:text-gray-300 font-mono font-semibold border border-gray-300/60 dark:border-white/15">⌘K</kbd>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: -24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -24 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="w-full max-w-3xl bg-white/95 dark:bg-brand-dark/95 backdrop-blur-3xl border border-gray-200/90 dark:border-white/15 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.45)] overflow-hidden relative z-10"
            >
              <div className="h-1 w-full bg-ai-gradient" />

              <div className="p-4 px-5 border-b border-gray-200 dark:border-white/10 flex items-center gap-3.5 bg-white/40 dark:bg-white/[0.02]">
                <Search className="w-5 h-5 text-brand-primary shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') performSearch(query);
                  }}
                  placeholder="Ask CampusAI anything... (e.g. 'Show me React Internships')"
                  className="flex-1 bg-transparent text-gray-900 dark:text-white text-base md:text-lg font-medium focus:outline-none placeholder-gray-400 dark:placeholder-gray-500"
                />
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
                
                {loading && (
                  <div className="p-14 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <Loader2 className="w-8 h-8 text-brand-primary animate-spin mb-4" />
                    <p className="font-medium text-sm">Searching database & generating neural answer...</p>
                  </div>
                )}

                {!loading && !results && query.length === 0 && (
                  <div className="p-6">
                    {recentSearches.length > 0 && (
                      <div className="mb-7">
                        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 mb-3">Recent Searches</h3>
                        {recentSearches.map((sq, i) => (
                          <div 
                            key={i}
                            onClick={() => performSearch(sq)}
                            className="flex items-center gap-3 px-3.5 py-3 hover:bg-brand-primary/10 dark:hover:bg-white/5 rounded-2xl cursor-pointer text-gray-700 dark:text-gray-300 transition-colors group"
                          >
                            <History className="w-4 h-4 text-gray-400 group-hover:text-brand-primary transition-colors" />
                            <span className="font-medium text-sm">{sq}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 mb-3">Suggested Queries</h3>
                      <div className="flex flex-wrap gap-2 px-1">
                        {["Upcoming Hackathons", "React Notes", "Web Dev Clubs", "Computer Science Faculty"].map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => performSearch(suggestion)}
                            className="px-4 py-2 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-brand-primary/10 hover:border-brand-primary/40 hover:text-brand-primary dark:hover:text-white transition-all"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {!loading && results && (
                  <div className="p-6 space-y-6">
                    {/* AI Answer Section */}
                    <div className="bg-gradient-to-br from-brand-primary/10 via-purple-500/5 to-transparent border border-brand-primary/30 dark:border-white/10 rounded-2xl p-5 relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Sparkles className="w-28 h-28 text-brand-primary" />
                      </div>
                      <div className="flex items-start gap-3.5 relative z-10">
                        <div className="w-8 h-8 rounded-xl bg-brand-primary/20 flex items-center justify-center shrink-0 border border-brand-primary/30">
                          <Sparkles className="w-4 h-4 text-brand-primary" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
                            AI Neural Summary 
                            <span className="ai-badge !py-0.5 !px-2 !text-[10px]">
                              {results.intent}
                            </span>
                          </h3>
                          <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-sm">{results.answer}</p>
                        </div>
                      </div>
                    </div>

                    {/* Results Section */}
                    {results.results && results.results.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-1">Raw Matches ({results.results.length})</h3>
                        <div className="grid gap-2.5">
                          {results.results.map((item, i) => (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              key={i} 
                              className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/10 hover:border-brand-primary/40 hover:bg-white dark:hover:bg-white/[0.08] hover:shadow-md transition-all flex justify-between items-center group cursor-pointer"
                            >
                              <div>
                                <h4 className="text-gray-900 dark:text-white font-semibold text-sm mb-1 group-hover:text-brand-primary transition-colors">{item.title}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{item.description}</p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-primary transform group-hover:translate-x-1 transition-all shrink-0 ml-4" />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="p-3.5 px-5 border-t border-gray-200 dark:border-white/10 bg-gray-50/80 dark:bg-black/30 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><kbd className="bg-gray-200 dark:bg-white/10 rounded-md px-1.5 py-0.5 font-mono">Enter</kbd> to search</span>
                  <span className="flex items-center gap-1.5"><kbd className="bg-gray-200 dark:bg-white/10 rounded-md px-1.5 py-0.5 font-mono">ESC</kbd> to close</span>
                </div>
                <div className="font-medium text-gray-400">CampusAI Smart Search</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
