import React, { useState, useEffect } from 'react';
import { Channel } from '../types/iptv';
import { VideoPlayer } from './VideoPlayer';
import { Search, Loader2, Play, Tv, Sparkles, History, Radio, X } from 'lucide-react';
import searchIndexData from '../data/searchIndex.json';

interface SimpleViewProps {
  currentChannel: Channel | null;
  onSelectChannel: (code: string, channelId: string) => void;
  favorites: string[];
  onToggleFavorite: (channel: Channel) => void;
  recents: string[];
  suggestedChannels: Channel[];
}

interface SearchResult {
  n: string; // name
  c: string; // country code
  i: string; // id
  f: string; // flag
}

const typedSearchIndex = searchIndexData as SearchResult[];

export const SimpleView: React.FC<SimpleViewProps> = ({
  currentChannel,
  onSelectChannel,
  favorites,
  onToggleFavorite,
  suggestedChannels
}) => {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (q.length >= 2) {
      setIsSearching(true);
      const results = typedSearchIndex
        .filter(item => item.n.toLowerCase().includes(q))
        .slice(0, 12);
      setSuggestions(results);
      setIsSearching(false);
    } else {
      setSuggestions([]);
    }
  }, [search]);

  const handleClearSearch = () => {
    setSearch('');
    setSuggestions([]);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col p-4 sm:p-6 space-y-6">
      {/* Top Search Bar */}
      <div className="max-w-4xl mx-auto w-full relative z-[70]">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 14,500+ channels instantly..."
            className="w-full bg-slate-900/80 backdrop-blur-xl text-white rounded-2xl py-4 pl-12 pr-12 border border-slate-800 focus:ring-2 focus:ring-red-600 focus:border-transparent focus:outline-none shadow-2xl transition-all text-sm sm:text-base"
          />
          {search && (
            <button 
              onClick={handleClearSearch}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {isSearching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500 animate-spin" />
          )}
        </div>

        {/* Global Search Suggestions Overlay */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 overflow-y-auto max-h-[450px]">
            <div className="p-3 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Top Suggestions</span>
              <span className="text-[10px] text-red-500 font-bold px-2">{suggestions.length} Channels found</span>
            </div>
            {suggestions.map((item, idx) => (
              <button
                key={`${item.i}-${idx}`}
                onClick={() => {
                  onSelectChannel(item.c, item.i);
                  handleClearSearch();
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-red-600/10 transition-all group text-left border-b border-slate-800/50 last:border-0"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-bold text-red-500 shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors border border-slate-700">
                    {item.n.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-bold text-white group-hover:text-red-500 transition-colors">{item.n}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span className="text-base">{item.f}</span>
                      <span className="font-semibold">{item.c.toUpperCase()}</span>
                    </p>
                  </div>
                </div>
                <Play className="h-4 w-4 text-red-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Video Player Section */}
      <div className="max-w-5xl mx-auto w-full">
        {currentChannel ? (
          <div className="space-y-4">
            <VideoPlayer
              channel={currentChannel}
              onPrevChannel={() => {}}
              onNextChannel={() => {}}
              isFavorite={favorites.includes(currentChannel.id)}
              onToggleFavorite={() => onToggleFavorite(currentChannel)}
            />
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold">
                    {currentChannel.name.slice(0, 1).toUpperCase()}
                 </div>
                 <div>
                    <h2 className="text-lg font-bold text-white leading-tight">{currentChannel.name}</h2>
                    <p className="text-xs text-slate-500">{currentChannel.language} • {currentChannel.category}</p>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <div className="flex items-center gap-1 text-[10px] bg-red-600 text-white px-2 py-1 rounded font-bold">
                    <Radio className="h-3 w-3" />
                    <span>LIVE</span>
                 </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="aspect-video rounded-3xl bg-slate-900 border border-slate-800 border-dashed flex flex-col items-center justify-center space-y-4 text-slate-600">
             <Tv className="h-16 w-16 animate-pulse" />
             <p className="text-lg font-medium">Search or select a channel below to start</p>
          </div>
        )}
      </div>

      {/* Queue / Quick Switch Section (YouTube Style) */}
      <div className="max-w-6xl mx-auto w-full space-y-8 pt-4">
        {/* Favorites Section */}
        {favorites.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest">Your Favorites</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none no-scrollbar">
              {suggestedChannels.filter(c => favorites.includes(c.id)).map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => onSelectChannel('in', ch.id)}
                  className="flex-shrink-0 w-36 sm:w-44 group space-y-2"
                >
                  <div className="aspect-video rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-red-600 transition-all relative overflow-hidden shadow-lg">
                    <span className="text-2xl font-black text-slate-800 group-hover:text-red-500/20">{ch.name.slice(0, 2).toUpperCase()}</span>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                       <Play className="h-8 w-8 text-white fill-current" />
                    </div>
                    {currentChannel?.id === ch.id && (
                       <div className="absolute bottom-1 right-1 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg">PLAYING</div>
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 group-hover:text-white truncate text-left px-1">{ch.name}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Suggested Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400">
            <History className="h-4 w-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest">Recommended Channels</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
             {suggestedChannels.slice(0, 12).map(ch => (
                <button
                  key={ch.id}
                  onClick={() => onSelectChannel('in', ch.id)}
                  className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-900 transition-all group text-left border border-transparent hover:border-slate-800"
                >
                   <div className="w-24 h-16 sm:w-28 sm:h-16 rounded-xl bg-slate-950 border border-slate-800 flex-shrink-0 flex items-center justify-center group-hover:border-red-600/50 overflow-hidden relative shadow-md">
                      <span className="text-xl font-black text-slate-900">{ch.name.slice(0, 2).toUpperCase()}</span>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <Play className="h-6 w-6 text-white fill-current" />
                      </div>
                   </div>
                   <div className="min-w-0 py-0.5">
                      <h4 className="text-sm font-bold text-white group-hover:text-red-500 transition-colors truncate">{ch.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{ch.category} • {ch.language}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                         <span className="text-[8px] bg-red-600/10 text-red-500 border border-red-600/20 px-1.5 py-0.5 rounded font-black uppercase">Live</span>
                         <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-bold uppercase">1080p</span>
                      </div>
                   </div>
                </button>
             ))}
          </div>
        </section>
      </div>
    </div>
  );
};
