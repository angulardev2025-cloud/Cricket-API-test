import React from 'react';
import { Channel } from '../types/iptv';
import { Star, Radio, Layers } from 'lucide-react';

interface ChannelCardProps {
  channel: Channel;
  isActive: boolean;
  isFavorite: boolean;
  onSelect: (channel: Channel) => void;
  onToggleFavorite: (channel: Channel) => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  isActive,
  isFavorite,
  onSelect,
  onToggleFavorite,
}) => {
  const highestRes = channel.streams[0]?.resolution || 'HD';
  const hasMultipleStreams = channel.streams.length > 1;

  // Category color accents
  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'news': return 'text-red-400 bg-red-950/40 border-red-800/50';
      case 'music': return 'text-purple-400 bg-purple-950/40 border-purple-800/50';
      case 'movies': return 'text-amber-400 bg-amber-950/40 border-amber-800/50';
      case 'sports': return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50';
      case 'kids': return 'text-pink-400 bg-pink-950/40 border-pink-800/50';
      case 'devotional': return 'text-orange-400 bg-orange-950/40 border-orange-800/50';
      default: return 'text-blue-400 bg-blue-950/40 border-blue-800/50';
    }
  };

  return (
    <div
      onClick={() => onSelect(channel)}
      className={`group relative rounded-xl p-3.5 transition-all duration-200 cursor-pointer flex flex-col justify-between border ${
        isActive
          ? 'bg-amber-950/20 border-amber-500 shadow-lg shadow-amber-500/10 -translate-y-1'
          : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700 hover:-translate-y-0.5'
      }`}
    >
      {/* Top Header: Category Tag & Favorite */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getCategoryColor(
            channel.category
          )}`}
        >
          {channel.category}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(channel);
          }}
          className={`p-1.5 rounded-lg transition-colors ${
            isFavorite
              ? 'text-amber-400 hover:text-amber-300'
              : 'text-slate-500 hover:text-slate-300'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Middle: Channel Name & Icon */}
      <div className="flex items-start gap-3 my-1">
        <div
          className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center font-black text-sm border shadow-inner ${
            isActive
              ? 'bg-amber-500 text-black border-amber-400'
              : 'bg-slate-800 text-slate-300 border-slate-700 group-hover:bg-slate-700'
          }`}
        >
          {channel.name.slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={`font-bold text-sm leading-snug truncate ${
              isActive ? 'text-amber-400' : 'text-slate-100 group-hover:text-white'
            }`}
          >
            {channel.name}
          </h3>
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {channel.language}
          </p>
        </div>
      </div>

      {/* Bottom Info: Quality & Active Indicator */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/80 text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
            {highestRes}
          </span>
          {hasMultipleStreams && (
            <span className="flex items-center gap-0.5 text-slate-400 text-[10px]" title="Multiple stream feeds available">
              <Layers className="h-3 w-3" />
              <span>{channel.streams.length}</span>
            </span>
          )}
        </div>

        {isActive ? (
          <span className="flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
            <Radio className="h-3 w-3 live-dot" />
            <span>PLAYING</span>
          </span>
        ) : (
          <span className="text-slate-500 group-hover:text-amber-400 font-medium transition-colors">
            Watch Now →
          </span>
        )}
      </div>
    </div>
  );
};
