import React from 'react';
import { Search, Tv, Info, ExternalLink } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalChannels: number;
  filteredCount: number;
  onOpenPlaylistModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  totalChannels,
  filteredCount,
  onOpenPlaylistModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
              <Tv className="h-5 w-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
                  Bharat IPTV
                </h1>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {totalChannels} Indian TV Streams • in.m3u
              </p>
            </div>
          </div>

          {/* Mobile Info Button */}
          <button
            onClick={onOpenPlaylistModal}
            className="md:hidden p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
            title="Playlist Info"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>

        {/* Central Search Bar */}
        <div className="w-full md:max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search 850+ channels (e.g. Aaj Tak, 9XM, Star, Sun, DD...)"
              className="w-full bg-slate-900 text-slate-100 placeholder-slate-400 text-sm rounded-xl pl-10 pr-20 py-2.5 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-inner"
            />
            {searchQuery ? (
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
        </div>

        {/* Right Action buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={onOpenPlaylistModal}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <Info className="h-3.5 w-3.5 text-amber-400" />
            <span>Stream Source</span>
          </button>

          <a
            href="https://github.com/iptv-org/iptv/blob/master/streams/in.m3u"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>iptv-org</span>
          </a>
        </div>
      </div>
    </header>
  );
};
