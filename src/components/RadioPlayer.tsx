import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Music, 
  Loader2, 
  Heart, 
  Share2, 
  Search, 
  LayoutGrid,
  TrendingUp,
  Sparkles,
  History
} from 'lucide-react';
import radioData from '../data/radioStations.json';

interface Station {
  name: string;
  language?: string;
  streamURL: string;
  website?: string;
  desc?: string;
  logo: string;
}

export const RadioPlayer: React.FC = () => {
  const [currentStation, setCurrentStation] = useState<Station | null>(radioData.stations[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'player' | 'library'>('player');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stations = radioData.stations as Station[];

  const filteredStations = useMemo(() => {
    return stations.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      (s.language && s.language.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, stations]);

  const favorites = useMemo(() => stations.slice(0, 6), [stations]);
  const trending = useMemo(() => stations.slice(6, 12), [stations]);
  const recents = useMemo(() => stations.slice(2, 5), [stations]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handlePlayStation = (station: Station) => {
    if (currentStation?.streamURL === station.streamURL) {
      togglePlay();
      return;
    }

    setIsLoading(true);
    setCurrentStation(station);
    setIsPlaying(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = station.streamURL;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Playback error:", err);
          setIsLoading(false);
        });
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentStation) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  };

  const handleShare = () => {
    if (navigator.share && currentStation) {
      navigator.share({
        title: currentStation.name,
        text: `Listening to ${currentStation.name} on Global IPTV Radio!`,
        url: window.location.href,
      }).catch(console.error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#050810] text-slate-100 flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 font-sans overflow-y-auto lg:overflow-hidden relative">
      {/* Decorative Background Shapes */}
      <div className="absolute top-[-10%] -left-[10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] -right-[10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-indigo-500/[0.02] blur-[100px] rounded-full pointer-events-none" />

      <audio ref={audioRef} onWaiting={() => setIsLoading(true)} onPlaying={() => setIsLoading(false)} />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 h-full relative z-10 pb-24 lg:pb-0">
        
        {/* LEFT PANEL: SMART PLAYER */}
        <div className={`flex flex-col items-center justify-center space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 ${activeTab === 'library' ? 'hidden lg:flex' : 'flex'}`}>
           <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-[60px] animate-pulse" />
              
              {/* Main Circular Dial */}
              <div className="relative w-64 h-64 sm:w-72 md:w-80 rounded-full bg-[#0b132b] border-[10px] sm:border-[12px] border-[#1c2541] shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_2px_20px_rgba(255,255,255,0.05)] flex flex-col items-center justify-center p-6 transition-transform duration-500 hover:scale-[1.02]">
                 <div className={`absolute inset-0 rounded-full border-4 border-cyan-400/20 ${isPlaying ? 'animate-ping' : ''}`} />
                 
                 <div className="text-center z-10">
                    <span className="text-[10px] font-black tracking-[0.3em] text-cyan-400/60 uppercase mb-1 sm:mb-2 block">Frequency</span>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter mb-1">
                       {currentStation ? (currentStation.name.length > 8 ? currentStation.name.slice(0, 4) : currentStation.name) : '94.3'}
                    </h2>
                    <span className="text-xs sm:text-sm font-bold text-cyan-400 uppercase tracking-widest">MHz FM</span>
                 </div>

                 <div className="absolute bottom-12 sm:bottom-16 flex gap-1 items-end h-6 sm:h-8">
                    {[...Array(10)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-1 bg-cyan-500/40 rounded-full transition-all duration-300"
                        style={{ 
                          height: isPlaying ? `${20 + Math.random() * 80}%` : '4px',
                          opacity: 0.3 + (i / 10) * 0.7
                        }}
                      />
                    ))}
                 </div>
              </div>
           </div>

           <div className="text-center space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                 {currentStation?.name || 'Select a Station'}
              </h3>
              <p className="text-cyan-400/80 font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs">
                 {currentStation?.language || 'Global'} • Live Radio
              </p>
           </div>

           <div className="w-full max-w-xs h-12 bg-[#0b132b] rounded-2xl border border-white/5 flex items-center justify-center gap-0.5 px-4 overflow-hidden relative group">
              <div className="absolute inset-y-0 left-1/2 w-1 bg-red-600/80 z-10 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
              {[...Array(40)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-0.5 rounded-full transition-all duration-150 ${i % 3 === 0 ? 'bg-indigo-500' : 'bg-slate-700'}`}
                  style={{ 
                    height: isPlaying ? `${Math.random() * 80 + 10}%` : '4px',
                    opacity: isPlaying ? 1 : 0.4
                  }}
                />
              ))}
           </div>

           {/* Controls */}
           <div className="flex items-center gap-6 sm:gap-10">
              <button className="text-slate-500 hover:text-red-500 transition-colors">
                 <Heart className="h-6 w-6" />
              </button>
              
              <div className="flex items-center gap-4 group/vol">
                 <button onClick={() => setIsMuted(!isMuted)} className="text-slate-500 hover:text-white transition-colors">
                    {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                 </button>
                 <input 
                   type="range" min="0" max="1" step="0.05"
                   value={isMuted ? 0 : volume}
                   onChange={(e) => setVolume(parseFloat(e.target.value))}
                   className="w-0 group-hover/vol:w-20 transition-all duration-300 h-1 accent-indigo-500 bg-slate-800 rounded-full appearance-none cursor-pointer hidden sm:block"
                 />
              </div>

              <button 
                onClick={togglePlay}
                disabled={isLoading}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-[0_10px_40px_rgba(79,70,229,0.4)] transition-all hover:scale-110 active:scale-95 hover:shadow-[0_15px_50px_rgba(79,70,229,0.6)] disabled:opacity-50"
              >
                 {isLoading ? (
                   <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin" />
                 ) : isPlaying ? (
                   <Pause className="h-8 w-8 sm:h-10 sm:w-10 fill-current" />
                 ) : (
                   <Play className="h-8 w-8 sm:h-10 sm:w-10 fill-current ml-1" />
                 )}
              </button>

              <button onClick={handleShare} className="text-slate-500 hover:text-cyan-500 transition-colors">
                 <Share2 className="h-6 w-6" />
              </button>
           </div>
        </div>

        {/* RIGHT PANEL: DISCOVERY */}
        <div className={`flex flex-col space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 custom-scrollbar overflow-y-auto pr-2 ${activeTab === 'player' ? 'hidden lg:flex' : 'flex'}`}>
           <div className="space-y-4">
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                 <input 
                   type="text"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   placeholder="Search global stations..."
                   className="w-full bg-[#0b132b] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-indigo-600 outline-none text-sm transition-all shadow-inner"
                 />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
                 {['All', 'Trending', 'Retro', 'Instrumental', 'Sports', 'News'].map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setSearch(cat === 'All' ? '' : cat)}
                      className={`shrink-0 px-4 py-2 rounded-xl border border-white/5 text-[10px] font-bold transition-all ${
                        (cat === 'All' && !search) || search === cat 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-[#1c2541] text-slate-400 hover:text-white hover:bg-indigo-600/20'
                      }`}
                    >
                       {cat}
                    </button>
                 ))}
              </div>
           </div>

           {search ? (
              <section className="space-y-4">
                 <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2 text-slate-400">
                       <Search className="h-4 w-4 text-indigo-400" />
                       <h4 className="text-[10px] font-black uppercase tracking-widest">Search Results ({filteredStations.length})</h4>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredStations.map((s, idx) => (
                       <button 
                         key={idx}
                         onClick={() => handlePlayStation(s)}
                         className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[#0b132b]/50 border border-white/5 hover:bg-white/5 transition-all group text-left"
                       >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shrink-0`}>
                             <Music className="h-5 w-5 text-white/90" />
                          </div>
                          <div className="min-w-0">
                             <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors truncate">{s.name}</p>
                             <p className="text-[9px] text-slate-500 font-bold uppercase">{s.language || 'Global'}</p>
                          </div>
                       </button>
                    ))}
                 </div>
              </section>
           ) : (
              <>
                <section className="space-y-4">
                   <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2 text-slate-400">
                         <History className="h-4 w-4 text-indigo-400" />
                         <h4 className="text-[10px] font-black uppercase tracking-widest">Recent</h4>
                      </div>
                   </div>
                   <div className="space-y-2">
                      {recents.map((s, idx) => (
                         <button 
                           key={idx}
                           onClick={() => handlePlayStation(s)}
                           className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#0b132b]/50 border border-white/5 hover:bg-white/5 transition-all group"
                         >
                            <div className="flex items-center gap-4">
                               <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${idx % 2 === 0 ? 'from-pink-500 to-rose-600' : 'from-indigo-500 to-purple-600'} shadow-lg`}>
                                  <Music className="h-5 w-5 text-white/90" />
                               </div>
                               <div className="text-left">
                                  <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{s.name}</p>
                                  <p className="text-[9px] text-slate-500 font-bold uppercase">{s.language || 'FM'}</p>
                               </div>
                            </div>
                         </button>
                      ))}
                   </div>
                </section>

                <section className="space-y-4">
                   <div className="flex items-center gap-2 text-slate-400 px-1">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest">Favorite</h4>
                   </div>
                   <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none no-scrollbar">
                      {favorites.map((s, idx) => (
                         <button 
                           key={idx}
                           onClick={() => handlePlayStation(s)}
                           className="shrink-0 w-28 sm:w-32 group space-y-2"
                         >
                            <div className="aspect-square rounded-3xl overflow-hidden relative shadow-2xl transition-transform duration-300 group-hover:scale-105">
                               <div className={`absolute inset-0 bg-gradient-to-tr ${idx % 3 === 0 ? 'from-orange-500 to-amber-600' : idx % 3 === 1 ? 'from-cyan-500 to-blue-600' : 'from-purple-500 to-indigo-600'}`} />
                               <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play className="h-8 w-8 text-white fill-current" />
                               </div>
                               <div className="absolute bottom-3 left-3 right-3 text-left">
                                  <p className="text-[10px] font-black text-white/90 truncate leading-tight">{s.name}</p>
                                  <p className="text-[8px] font-bold text-white/60">Live FM</p>
                               </div>
                            </div>
                         </button>
                      ))}
                   </div>
                </section>

                <section className="space-y-4">
                   <div className="flex items-center gap-2 text-slate-400 px-1">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest">Recommended</h4>
                   </div>
                   <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {trending.slice(0, 4).map((s, idx) => (
                         <button 
                           key={idx}
                           onClick={() => handlePlayStation(s)}
                           className="relative h-20 sm:h-24 rounded-3xl overflow-hidden group shadow-xl"
                         >
                            <div className={`absolute inset-0 bg-gradient-to-br ${idx % 2 === 0 ? 'from-emerald-500 to-teal-600' : 'from-indigo-600 to-blue-700'} opacity-80 group-hover:opacity-100 transition-opacity`} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                               <p className="text-xs sm:text-sm font-black text-white text-center leading-tight">{s.name}</p>
                               <div className="mt-2 h-1 w-6 sm:w-8 bg-white/30 rounded-full group-hover:w-10 sm:group-hover:w-12 transition-all" />
                            </div>
                         </button>
                      ))}
                   </div>
                </section>
              </>
           )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 flex items-center justify-center z-[100]">
         <div className="flex items-center bg-[#0b132b]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-xs">
            <button 
              onClick={() => setActiveTab('player')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === 'player' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'}`}
            >
               <Music className="h-4 w-4" />
               <span>PLAYER</span>
            </button>
            <button 
              onClick={() => setActiveTab('library')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === 'library' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'}`}
            >
               <LayoutGrid className="h-4 w-4" />
               <span>LIBRARY</span>
            </button>
         </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(79, 70, 229, 0.4); }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};
