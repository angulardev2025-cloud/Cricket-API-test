import React, { useState, useMemo } from 'react';
import { CountryInfo } from '../types/iptv';
import { Search, Tv, ArrowRight, Globe } from 'lucide-react';

interface DashboardProps {
  countries: CountryInfo[];
  onSelectCountry: (code: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ countries, onSelectCountry }) => {
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');

  const regions = useMemo(() => {
    const set = new Set<string>();
    countries.forEach((c) => set.add(c.region));
    return ['All', ...Array.from(set).sort()];
  }, [countries]);

  const filtered = useMemo(() => {
    return countries.filter((c) => {
      if (selectedRegion !== 'All' && c.region !== selectedRegion) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
      }
      return true;
    });
  }, [countries, selectedRegion, search]);

  return (
    <div className="min-h-screen bg-[#07090e] p-4 sm:p-6 lg:p-8 text-slate-100 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto w-full">
        {/* Hero Header */}
        <header className="mb-8 sm:mb-12 text-center pt-6 sm:pt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-4">
            <Globe className="h-3.5 w-3.5" />
            <span>182 Countries • 14,500+ Live Streams</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight">
            Global <span className="text-amber-500">IPTV</span> Directory
          </h1>
          <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto mb-6 px-4">
            Select a country below to launch live television streams across news, movies, sports, and entertainment.
          </p>

          <div className="relative max-w-xl mx-auto px-2">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country (e.g. India, USA, France, Japan)..."
              className="w-full bg-slate-900 text-white rounded-2xl py-3.5 sm:py-4 pl-12 pr-6 border border-slate-700/80 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-xl text-sm sm:text-base"
            />
          </div>

          {/* Region Tabs */}
          <div className="flex items-center justify-center gap-1.5 overflow-x-auto pt-6 pb-2 px-2 scrollbar-none">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-12">
          {filtered.map((country) => (
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
        </div>
      </div>

      <footer className="text-center text-xs text-slate-500 py-6 border-t border-slate-900">
        <p>© Global IPTV Player • Powered by public streams from iptv-org/iptv</p>
      </footer>
    </div>
  );
};
