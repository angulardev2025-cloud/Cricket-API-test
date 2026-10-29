import React, { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, Play, Globe, ChevronDown, Tv } from 'lucide-react';
import searchIndexData from '../data/searchIndex.json';
import rawCountriesList from '../data/countriesList.json';
import { CountryInfo } from '../types/iptv';

interface DashboardProps {
  onSelectChannel: (code: string, channelId: string) => void;
  onSelectCountry: (code: string) => void;
  onOpenCountryModal: () => void;
}

interface SearchResult {
  n: string; // name
  c: string; // country code
  i: string; // id
  f: string; // flag
}

const typedSearchIndex = searchIndexData as SearchResult[];
const countriesList = rawCountriesList as CountryInfo[];

export const Dashboard: React.FC<DashboardProps> = ({ 
  onSelectChannel,
  onSelectCountry,
  onOpenCountryModal
}) => {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

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

  const regions = ['All', 'Asia', 'Europe', 'Americas', 'Africa', 'Oceania'];

  const filteredCountries = useMemo(() => {
    if (selectedRegion === 'All') return countriesList.slice(0, 24);
    return countriesList.filter(c => c.region.toLowerCase() === selectedRegion.toLowerCase());
  }, [selectedRegion]);

  return (
    <div className="min-h-screen bg-[#07090e] p-4 sm:p-6 lg:p-8 text-slate-100 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 space-y-12">
        {/* Hero Header */}
        <header className="text-center pt-2 sm:pt-6 relative z-50">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-4">
            <Globe className="h-3.5 w-3.5" />
            <span>182 Countries • 14,500+ Live Streams</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight">
            Global <span className="text-amber-500">IPTV</span> Directory
          </h1>
          <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto mb-6 px-4">
            Search 14,500+ channels instantly or select a country to explore live streams.
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
              <div className="absolute top-full left-2 right-2 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 overflow-y-auto max-h-[400px] z-[100]">
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
        </header>

        {/* Dynamic Smooth Marquee (Stock Market Style - India Only) */}
        <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden bg-slate-900/30 border-y border-white/5 py-8 group">
           <div className="animate-marquee hover:pause-marquee flex items-center whitespace-nowrap">
              {typedSearchIndex.filter(item => item.c === 'in').map((item, idx) => (
                 <button 
                   key={`${item.i}-${idx}`}
                   onClick={() => onSelectChannel(item.c, item.i)}
                   className="inline-flex items-center gap-6 px-12 py-3 border-r border-white/5 hover:bg-indigo-600/10 transition-all group/item shrink-0"
                 >
                    <span className="text-4xl filter saturate-50 group-hover/item:saturate-100 transition-all transform group-hover/item:scale-110 duration-300">
                       {item.f}
                    </span>
                    <div className="text-left">
                       <p className="text-lg font-black text-white/90 group-hover/item:text-amber-400 transition-colors tracking-tight uppercase">
                          {item.n}
                       </p>
                       <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                          <span className="tracking-widest uppercase">INDIA • LIVE</span>
                       </p>
                    </div>
                 </button>
              ))}
              {/* Duplicate for infinite loop */}
              {typedSearchIndex.filter(item => item.c === 'in').map((item, idx) => (
                 <button 
                   key={`dup-${item.i}-${idx}`}
                   onClick={() => onSelectChannel(item.c, item.i)}
                   className="inline-flex items-center gap-6 px-12 py-3 border-r border-white/5 hover:bg-indigo-600/10 transition-all group/item shrink-0"
                 >
                    <span className="text-4xl filter saturate-50 group-hover/item:saturate-100 transition-all transform group-hover/item:scale-110 duration-300">
                       {item.f}
                    </span>
                    <div className="text-left">
                       <p className="text-lg font-black text-white/90 group-hover/item:text-amber-400 transition-colors tracking-tight uppercase">
                          {item.n}
                       </p>
                       <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                          <span className="tracking-widest uppercase">INDIA • LIVE</span>
                       </p>
                    </div>
                 </button>
              ))}
           </div>
        </div>

        {/* Country Cards Grid Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Tv className="h-6 w-6 text-amber-500" />
                <span>Explore Countries & Regions</span>
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Select a country card to launch live television streams.
              </p>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto scrollbar-none">
              {regions.map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                    selectedRegion === reg
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800'
                  }`}
                >
                  {reg}
                </button>
              ))}

              <button
                onClick={onOpenCountryModal}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 transition-all shrink-0 flex items-center gap-1"
              >
                <span>All 182</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                onClick={() => onSelectCountry(country.code)}
                className="glass-panel hover:border-amber-500/50 p-4 rounded-2xl flex flex-col items-center text-center group transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-amber-500/5 bg-slate-900/60 border border-slate-800"
              >
                <div className="text-4xl sm:text-5xl mb-3 transform group-hover:scale-110 transition-transform">
                  {country.flag}
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors truncate w-full">
                  {country.name}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-1">
                  {country.channelCount} Channels
                </p>
                <span className="mt-3 text-[10px] font-bold text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  Watch Live →
                </span>
              </button>
            ))}
          </div>

          <div className="text-center pt-4">
            <button
              onClick={onOpenCountryModal}
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold px-6 py-3 rounded-xl text-sm border border-slate-800 hover:border-amber-500 transition-all inline-flex items-center gap-2 shadow-lg"
            >
              <Globe className="h-4 w-4 text-amber-500" />
              <span>Browse All 182 Countries & Territories</span>
            </button>
          </div>
        </section>
      </div>

      <footer className="text-center text-xs text-slate-500 py-6 border-t border-slate-900 mt-16">
        <p>© Global IPTV Player • Multi-Country Streaming Platform</p>
      </footer>
    </div>
  );
};
