import React from 'react';
import { Channel } from '../types/iptv';
import { VideoPlayer } from './VideoPlayer';
import { Tv, Sparkles, History, Radio, Play } from 'lucide-react';

interface SimpleViewProps {
  currentChannel: Channel | null;
  onSelectChannel: (code: string, channelId: string) => void;
  favorites: string[];
  onToggleFavorite: (channel: Channel) => void;
  recents: string[];
  suggestedChannels: Channel[];
  currentCountryCode: string;
  onBack: () => void;
}

export const SimpleView: React.FC<SimpleViewProps> = ({
  currentChannel,
  onSelectChannel,
  favorites,
  onToggleFavorite,
  suggestedChannels,
  currentCountryCode,
  onBack
}) => {

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col p-4 sm:p-6 space-y-6">
      {/* Back to Home Button (Requested) */}
      <div className="max-w-5xl mx-auto w-full flex justify-start">
         <button 
           onClick={onBack}
           className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-500 transition-all uppercase tracking-widest bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800 hover:border-amber-500/50"
         >
            <History className="h-4 w-4" />
            <span>Back to Dashboard</span>
         </button>
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
              onTogglePiP={() => {}}
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
                  onClick={() => onSelectChannel(currentCountryCode, ch.id)}
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
                  onClick={() => onSelectChannel(currentCountryCode, ch.id)}
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
