import React, { useState, useMemo } from 'react';
import { CountryInfo } from '../types/iptv';
import { Search, Tv, ArrowRight } from 'lucide-react';

interface DashboardProps {
  countries: CountryInfo[];
  onSelectCountry: (code: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ countries, onSelectCountry }) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return countries.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [countries, search]);

  return (
    <div className="min-h-screen bg-[#07090e] p-6 text-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <header className="mb-12 text-center pt-10">
          <h1 className="text-5xl font-extrabold text-white mb-4">
            Global <span className="text-amber-500">IPTV</span> Player
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            Access 20,000+ live television channels from 182 countries worldwide.
          </p>

          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by country name (e.g. India, USA, France)..."
              className="w-full bg-slate-900 text-white rounded-2xl py-4 pl-12 pr-6 border border-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-xl"
            />
          </div>
        </header>

        {/* Countries Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((country) => (
            <button
              key={country.code}
              onClick={() => onSelectCountry(country.code)}
              className="group bg-slate-900 border border-slate-800 p-4 rounded-2xl text-left hover:border-amber-500 hover:bg-slate-800 transition-all shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl" role="img" aria-label={country.name}>{country.flag}</span>
                <span className="text-xs bg-slate-800 px-2 py-1 rounded-md text-amber-400 font-bold flex items-center gap-1">
                  <Tv className="h-3 w-3" />
                  {country.channelCount}
                </span>
              </div>
              <h3 className="font-bold text-white mb-1 truncate">{country.name}</h3>
              <p className="text-xs text-slate-400 flex items-center justify-between mt-2">
                {country.region}
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
