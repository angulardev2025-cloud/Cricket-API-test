import React from 'react';
import { Search, Tv, ChevronDown, Play, Loader2, Radio, LayoutTemplate } from 'lucide-react';
import { CountryInfo } from '../types/iptv';
import searchIndexData from '../data/searchIndex.json';

interface SearchResult {
  n: string; // name
  c: string; // country code
  i: string; // id
  f: string; // flag
}

const typedSearchIndex = searchIndexData as SearchResult[];

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentCountry: CountryInfo;
  filteredCount: number;
  onOpenCountryModal: () => void;
  onHomeClick: () => void;
  onRadioClick: () => void;
  onSelectChannel: (code: string, channelId: string) => void;
  view: 'dashboard' | 'player' | 'radio';
  viewMode: 'normal' | 'simple';
  onViewChange: (view: 'dashboard' | 'player' | 'radio') => void;
  onToggleViewMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  currentCountry,
  filteredCount,
  onOpenCountryModal,
  onHomeClick,
  onRadioClick,
  onSelectChannel,
  view,
  viewMode,
  onViewChange,
  onToggleViewMode,
}) => {
  const [suggestions, setSuggestions] = React.useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  React.useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    if (q.length >= 3) {
      setIsSearching(true);
      const results = typedSearchIndex
        .filter(item => item.n.toLowerCase().includes(q))
        .slice(0, 8);
      setSuggestions(results);
      setIsSearching(false);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleSelectSuggestion = (code: string, id: string) => {
     onSelectChannel(code, id);
     onSearchChange('');
     setSuggestions([]);
  };

  return (
    <header className="sticky top-0 z-[100] bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Country Selector */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div 
            onClick={onHomeClick} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 shrink-0 group-hover:scale-110 transition-transform">
              <Tv className="h-5 w-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg sm:text-xl text-white tracking-tight group-hover:text-amber-400 transition-colors">
                  Global IPTV
                </h1>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                182 Countries • 20,000+ Streams
              </p>
            </div>
          </div>

          {/* Professional Digital Clock */}
          <div className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-slate-900/50 border border-slate-800 font-mono text-[10px] sm:text-xs font-bold text-amber-500 shadow-inner tracking-widest shrink-0">
             <span className="min-w-[65px] sm:min-w-[72px] text-center">{formatTime(time)}</span>
          </div>

          {/* Country Switcher Button */}
          <button
            onClick={onOpenCountryModal}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white px-3.5 py-2 rounded-xl border border-slate-800 hover:border-amber-500/50 shadow-sm transition-all"
            title="Switch Country"
          >
            <span className="text-lg leading-none">{currentCountry.flag}</span>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold leading-tight text-white">{currentCountry.name}</p>
              <p className="text-[10px] text-amber-400 font-medium">{currentCountry.channelCount} Channels</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
          </button>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              onViewChange('dashboard');
              if (viewMode === 'simple') onToggleViewMode();
            }}
            className={`text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all ${
              view === 'dashboard' || (view === 'player' && viewMode === 'normal')
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <Tv className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Normal</span>
          </button>

          <button
            onClick={() => {
              onViewChange('player');
              if (viewMode === 'normal') onToggleViewMode();
            }}
            className={`text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all ${
              view === 'player' && viewMode === 'simple'
                ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <LayoutTemplate className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Simple</span>
          </button>

          <button
            onClick={onRadioClick}
            className={`text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all ${
              view === 'radio'
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <Radio className={`h-3.5 w-3.5 ${view === 'radio' ? 'animate-pulse' : ''}`} />
            <span className="hidden xs:inline">Radio</span>
          </button>
        </div>

        {/* Central Search Bar (Hidden on Radio view to prevent global results) */}
        {view !== 'radio' ? (
          <div className="w-full md:max-w-md relative">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search 14,500+ channels..."
                className="w-full bg-slate-900 text-slate-100 placeholder-slate-400 text-xs sm:text-sm rounded-xl pl-10 pr-20 py-2.5 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-inner"
              />
              {isSearching ? (
                 <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500 animate-spin" />
              ) : searchQuery ? (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded"
                >
                  Clear
                </button>
              ) : (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700 hidden sm:inline">
                  {filteredCount} found
                </span>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-1">
                 <div className="p-2 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Global Results</span>
                 </div>
                 {suggestions.map((item, idx) => (
                    <button
                      key={`${item.i}-${idx}`}
                      onClick={() => handleSelectSuggestion(item.c, item.i)}
                      className="w-full flex items-center justify-between p-2.5 hover:bg-amber-500/10 transition-colors group text-left border-b border-slate-800/50 last:border-0"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold text-amber-500 shrink-0 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                          {item.n.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors truncate">{item.n}</p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <span>{item.f}</span>
                            <span className="uppercase font-medium">{item.c}</span>
                          </p>
                        </div>
                      </div>
                      <Play className="h-3.5 w-3.5 text-amber-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0" />
                    </button>
                 ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-indigo-950/80 border border-indigo-500/30 px-4 py-2 rounded-xl text-xs font-bold text-fuchsia-300 shadow-inner">
             <Radio className="h-4 w-4 animate-pulse text-fuchsia-400" />
             <span>Radio Mode active • Use dedicated radio search below</span>
          </div>
        )}

      </div>
    </header>
  );
};
