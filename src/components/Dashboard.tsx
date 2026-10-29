import React, { useState, useMemo, useEffect } from 'react';
import { CountryInfo } from '../types/iptv';
import { Search, Tv, ArrowRight, Globe, Loader2, Play, Layout, LayoutTemplate } from 'lucide-react';
import searchIndexData from '../data/searchIndex.json';

interface DashboardProps {
  countries: CountryInfo[];
  onSelectCountry: (code: string) => void;
  onSelectChannel: (code: string, channelId: string) => void;
  viewMode: 'normal' | 'simple';
  onToggleViewMode: () => void;
}

interface SearchResult {
  n: string; // name
  c: string; // country code
  i: string; // id
  f: string; // flag
}

const typedSearchIndex = searchIndexData as SearchResult[];

export const Dashboard: React.FC<DashboardProps> = ({ 
  countries, 
  onSelectCountry, 
  onSelectChannel,
  viewMode,
  onToggleViewMode
}) => {
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const regions = useMemo(() => {
    const set = new Set<string>();
    countries.forEach((c) => set.add(c.region));
    return ['All', ...Array.from(set).sort()];
  }, [countries]);

  const filteredCountries = useMemo(() => {
    return countries.filter((c) => {
      if (selectedRegion !== 'All' && c.region !== selectedRegion) return false;
      const q = search.toLowerCase().trim();
      if (q.length > 0 && q.length < 3) {
         return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
      }
      if (q.length >= 3) {
         return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
      }
      return true;
    });
  }, [countries, selectedRegion, search]);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (q.length >= 3) {
      setIsSearching(true);
      const results = typedSearchIndex
        .filter(item => item.n.toLowerCase().includes(q))
        .slice(0, 10);
      setSuggestions(results);
      setIsSearching(false);
    } else {
      setSuggestions([]);
    }
  }, [search]);

  return (
    <div className="min-h-screen bg-[#07090e] p-4 sm:p-6 lg:p-8 text-slate-100 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1">
        {/* Layout Switcher Mini */}
        <div className="flex justify-end mb-4">
           <button 
             onClick={onToggleViewMode}
             className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-600 transition-all text-xs font-bold text-slate-400 hover:text-white"
           >
              {viewMode === 'normal' ? <LayoutTemplate className="h-4 w-4" /> : <Layout className="h-4 w-4" />}
              <span>Switch to Simple View</span>
           </button>
        </div>

        {/* Hero Header */}
        <header className="mb-8 sm:mb-12 text-center pt-2 sm:pt-6 relative z-50">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-4">
            <Globe className="h-3.5 w-3.5" />
            <span>182 Countries • 14,500+ Live Streams</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight">
            Global <span className="text-amber-500">IPTV</span> Directory
          </h1>
          <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto mb-6 px-4">
            Search 14,500+ channels or select a country to browse.
          </p>

          <div className="relative max-w-xl mx-auto px-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search any channel (e.g. HBO, BBC, Star, 9XM)..."
                className="w-full bg-slate-900 text-white rounded-2xl py-3.5 sm:py-4 pl-12 pr-12 border border-slate-700/80 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-xl text-sm sm:text-base transition-all"
              />
              {isSearching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500 animate-spin" />
              )}
            </div>

            {/* Global Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-2 right-2 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 overflow-y-auto max-h-[400px]">
                <div className="p-2 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Channel Suggestions</span>
                  <span className="text-[10px] text-slate-600 px-2">{suggestions.length} results</span>
                </div>
                {suggestions.map((item, idx) => (
                  <button
                    key={`${item.i}-${idx}`}
                    onClick={() => onSelectChannel(item.c, item.i)}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-amber-500/10 transition-colors group text-left border-b border-slate-800/50 last:border-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                        {item.n.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">{item.n}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <span>{item.f}</span>
                          <span>{item.c.toUpperCase()}</span>
                        </p>
                      </div>
                    </div>
                    <Play className="h-4 w-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Region Tabs */}
          <div className="flex items-center justify-center gap-1.5 overflow-x-auto pt-8 pb-2 px-2 scrollbar-none">
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`shrink-0 text-xs font-semibold px-4 py-2 rounded-full border transition-all ${
                  selectedRegion === reg
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </header>

        {/* Countries Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-12 relative z-10">
          {filteredCountries.map((country) => (
            <button
              key={country.code}
              onClick={() => onSelectCountry(country.code)}
              className="group bg-slate-900/80 border border-slate-800/80 p-3.5 sm:p-4 rounded-2xl text-left hover:border-amber-500 hover:bg-slate-800 transition-all shadow-md hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl sm:text-4xl" role="img" aria-label={country.name}>
                  {country.flag}
                </span>
                <span className="text-[10px] sm:text-xs bg-slate-800 px-2 py-0.5 rounded-md text-amber-400 font-bold flex items-center gap-1 border border-slate-700">
                  <Tv className="h-3 w-3" />
                  {country.channelCount}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white mb-1 truncate group-hover:text-amber-400 transition-colors">
                  {country.name}
                </h3>
                <p className="text-[11px] text-slate-400 flex items-center justify-between mt-1 pt-1 border-t border-slate-800/80">
                  <span>{country.region}</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
                </p>
              </div>
            </button>
          ))}
          {filteredCountries.length === 0 && (
             <div className="col-span-full py-20 text-center glass-panel rounded-3xl">
                <Globe className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400">No countries found for this region or search query.</p>
             </div>
          )}
        </div>
      </div>

      <footer className="text-center text-xs text-slate-500 py-6 border-t border-slate-900 mt-auto">
        <p>© Global IPTV Player • Multi-Country Streaming Platform</p>
      </footer>
    </div>
  );
};
