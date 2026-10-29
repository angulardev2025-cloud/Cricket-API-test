import React, { useState, useMemo } from 'react';
import { CountryInfo } from '../types/iptv';
import { X, Search, Globe, Check, Tv } from 'lucide-react';

interface CountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  countries: CountryInfo[];
  selectedCountryCode: string;
  onSelectCountry: (code: string) => void;
}

export const CountryModal: React.FC<CountryModalProps> = ({
  isOpen,
  onClose,
  countries,
  selectedCountryCode,
  onSelectCountry,
}) => {
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');

  const regions = useMemo(() => {
    const set = new Set<string>();
    countries.forEach((c) => set.add(c.region));
    return ['All', ...Array.from(set).sort()];
  }, [countries]);

  const filteredCountries = useMemo(() => {
    return countries.filter((c) => {
      if (selectedRegion !== 'All' && c.region !== selectedRegion) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        return (
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [countries, selectedRegion, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative text-slate-100">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Select Country</h3>
              <p className="text-xs text-slate-400">
                182 Countries • Over 20,000+ Live IPTV Channels
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Region Bar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country (e.g. India, United States, Canada, Japan...)"
              className="w-full bg-slate-900 text-slate-100 placeholder-slate-400 text-sm rounded-xl pl-10 pr-4 py-2.5 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              autoFocus
            />
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                  selectedRegion === reg
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                    : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>

        {/* Country Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {filteredCountries.map((country) => {
            const isSelected = country.code === selectedCountryCode;
            return (
              <button
                key={country.code}
                onClick={() => {
                  onSelectCountry(country.code);
                  onClose();
                }}
                className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-white font-bold shadow-md shadow-amber-500/10'
                    : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 text-slate-200 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-xl shrink-0" role="img" aria-label={country.name}>
                    {country.flag}
                  </span>
                  <div className="truncate">
                    <p className="text-xs sm:text-sm font-semibold truncate leading-tight">
                      {country.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-normal">
                      {country.region}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-amber-400 flex items-center gap-1">
                    <Tv className="h-2.5 w-2.5" />
                    <span>{country.channelCount}</span>
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-amber-400 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredCountries.length} countries</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
