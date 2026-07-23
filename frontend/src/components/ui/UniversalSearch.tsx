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
        className="relative w-96 group cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
        <div className="w-full bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-full py-2.5 pl-11 pr-4 text-sm text-gray-500 dark:text-gray-400 group-hover:border-red-500/50 transition-all flex items-center justify-between">
          <span>Search campus data...</span>
          <kbd className="px-2 py-1 rounded bg-gray-200 dark:bg-white/10 text-[10px] text-gray-600 dark:text-gray-400 font-mono">⌘K</kbd>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-3xl bg-gray-900/90 backdrop-blur-xl border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-4 border-b border-white/10 flex items-center gap-4">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') performSearch(query);
                  }}
                  placeholder="Ask CampusAI anything... (e.g. 'Show me React Internships')"
                  className="flex-1 bg-transparent text-white text-lg focus:outline-none placeholder-gray-500"
                />
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md hover:bg-white/10 text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
                
                {loading && (
                  <div className="p-12 flex flex-col items-center justify-center text-gray-400">
                    <Loader2 className="w-8 h-8 text-red-500 animate-spin mb-4" />
                    <p>Searching database and generating answer...</p>
                  </div>
                )}

                {!loading && !results && query.length === 0 && (
                  <div className="p-4">
                    {recentSearches.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-3">Recent Searches</h3>
                        {recentSearches.map((sq, i) => (
                          <div 
                            key={i}
                            onClick={() => performSearch(sq)}
                            className="flex items-center gap-3 px-3 py-3 hover:bg-red-500/10 rounded-xl cursor-pointer text-gray-300 transition-colors group"
                          >
                            <History className="w-4 h-4 text-gray-500 group-hover:text-red-400" />
                            <span>{sq}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-3">Try Searching For</h3>
                      <div className="flex flex-wrap gap-2 px-2">
                        {["Upcoming Hackathons", "React Notes", "Web Dev Clubs", "Computer Science Faculty"].map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => performSearch(suggestion)}
                            className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-red-500/20 hover:border-red-500/50 hover:text-white transition-colors"
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
                    <div className="bg-gradient-to-r from-red-900/30 to-black/30 border border-red-500/20 rounded-xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles className="w-24 h-24" />
                      </div>
                      <div className="flex items-start gap-3 relative z-10">
                        <Sparkles className="w-5 h-5 text-red-400 mt-1 shrink-0" />
                        <div>
                          <h3 className="text-sm font-semibold text-red-400 mb-1 flex items-center gap-2">
                            AI Summary 
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 uppercase tracking-wider border border-red-500/30">
                              {results.intent}
                            </span>
                          </h3>
                          <p className="text-gray-200 leading-relaxed">{results.answer}</p>
                        </div>
                      </div>
                    </div>

                    {/* Results Section */}
                    {results.results && results.results.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-4 px-1">Raw Matches ({results.results.length})</h3>
                        <div className="grid gap-3">
                          {results.results.map((item, i) => (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              key={i} 
                              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-red-500/30 hover:bg-white/10 transition-colors flex justify-between items-center group cursor-pointer"
                            >
                              <div>
                                <h4 className="text-white font-medium mb-1">{item.title}</h4>
                                <p className="text-sm text-gray-400 line-clamp-1">{item.description}</p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-red-400 transform group-hover:translate-x-1 transition-all" />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-white/10 bg-black/40 text-xs text-gray-500 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><kbd className="bg-white/10 rounded px-1.5 py-0.5">Enter</kbd> to search</span>
                  <span className="flex items-center gap-1"><kbd className="bg-white/10 rounded px-1.5 py-0.5">ESC</kbd> to close</span>
                </div>
                <div>CampusAI Smart Search</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
