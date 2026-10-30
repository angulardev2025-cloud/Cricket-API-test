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
  Radio as RadioIcon,
  Volume1
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
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [activeTab, setActiveTab] = useState<'player' | 'library'>('player');
  const [isFavorite, setIsFavorite] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stations = radioData.stations as Station[];

  // Extract unique languages for filter
  const languages = useMemo(() => {
    const set = new Set<string>();
    stations.forEach(s => {
      if (s.language) set.add(s.language.trim());
    });
    return ['All', ...Array.from(set).sort()];
  }, [stations]);

  // Filtered stations for library grid
  const filteredStations = useMemo(() => {
    return stations.filter(s => {
      const matchesSearch = 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        (s.language && s.language.toLowerCase().includes(search.toLowerCase())) ||
        (s.desc && s.desc.toLowerCase().includes(search.toLowerCase()));
      
      const matchesLang = selectedLanguage === 'All' || (s.language && s.language.toLowerCase() === selectedLanguage.toLowerCase());

      return matchesSearch && matchesLang;
    });
  }, [search, selectedLanguage, stations]);

  // Search suggestions (top 6 matches for radio search dropdown out of 262)
  const searchSuggestions = useMemo(() => {
    if (!search.trim() || search.length < 2) return [];
    return stations.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.language && s.language.toLowerCase().includes(search.toLowerCase()))
    ).slice(0, 6);
  }, [search, stations]);

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
    setSearch('');
    setActiveTab('player'); // Switch to player tab on mobile when playing

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
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-[#04060f] via-[#090e1f] to-[#04060f] text-slate-100 flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 font-sans overflow-y-auto lg:overflow-hidden relative">
      {/* Dynamic Glowing Background Orbs */}
      <div className="absolute top-[-10%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] -right-[10%] w-[60%] h-[60%] bg-fuchsia-600/15 blur-[160px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-cyan-500/10 blur-[180px] rounded-full pointer-events-none" />

      <audio ref={audioRef} onWaiting={() => setIsLoading(true)} onPlaying={() => setIsLoading(false)} />

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 h-full relative z-10 pb-28 lg:pb-0">
        
        {/* LEFT PANEL: COLOURFUL SMART RADIO PLAYER (5 cols on lg) */}
        <div className={`lg:col-span-5 flex flex-col items-center justify-center space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 ${activeTab === 'library' ? 'hidden lg:flex' : 'flex'}`}>
           <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
              {/* Oscillating Neon Rings */}
              <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 opacity-30 blur-2xl ${isPlaying ? 'animate-ping duration-1000' : ''}`} />
              
              {/* Main Colourful Circular Dial */}
              <div className="relative w-64 h-64 sm:w-72 md:w-80 rounded-full bg-gradient-to-tr from-[#0b132b] via-[#111c42] to-[#1e1b4b] border-[10px] sm:border-[12px] border-indigo-500/30 shadow-[0_25px_60px_rgba(79,70,229,0.3),inset_0_2px_25px_rgba(255,255,255,0.1)] flex flex-col items-center justify-center p-6 transition-transform duration-500 hover:scale-[1.02]">
                 <div className={`absolute inset-0 rounded-full border-4 border-fuchsia-500/30 ${isPlaying ? 'animate-pulse' : ''}`} />
                 
                 <div className="text-center z-10">
                    <span className="text-[10px] font-black tracking-[0.3em] text-fuchsia-400 uppercase mb-1 sm:mb-2 block drop-shadow">Live FM Dial</span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter mb-1 truncate max-w-[200px] bg-gradient-to-r from-white via-indigo-200 to-fuchsia-300 bg-clip-text text-transparent">
                       {currentStation ? (currentStation.name.length > 12 ? currentStation.name.slice(0, 10) + '..' : currentStation.name) : 'FM 94.3'}
                    </h2>
                    <span className="text-xs sm:text-sm font-extrabold text-cyan-300 uppercase tracking-widest">{currentStation?.language || 'Global'}</span>
                 </div>

                 {/* Oscillating Equalizer Bars inside Dial */}
                 <div className="absolute bottom-12 sm:bottom-16 flex gap-1.5 items-end h-8 sm:h-10">
                    {[...Array(12)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1.5 bg-gradient-to-t from-indigo-500 to-fuchsia-400 rounded-full ${isPlaying ? 'animate-wave' : ''}`}
                        style={{ 
                          height: isPlaying ? '100%' : '6px',
                          animationDelay: `${i * 0.08}s`,
                          boxShadow: isPlaying ? '0 0 10px rgba(232, 121, 249, 0.8)' : 'none'
                        }}
                      />
                    ))}
                 </div>
              </div>
           </div>

           <div className="text-center space-y-2 px-4">
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                 {currentStation?.name || 'Select a Station'}
              </h3>
              <p className="text-indigo-300/80 text-xs max-w-sm mx-auto font-medium">
                 {currentStation?.desc || 'Streaming high-quality live radio worldwide.'}
              </p>
           </div>

           {/* Oscillating Waveform Visualizer */}
           <div className="w-full max-w-xs h-14 bg-[#0b132b]/80 backdrop-blur-md rounded-2xl border border-indigo-500/30 flex items-center justify-center gap-1 px-4 overflow-hidden relative shadow-[0_0_20px_rgba(79,70,229,0.2)]">
              <div className="absolute inset-y-0 left-1/2 w-1 bg-fuchsia-500 z-10 shadow-[0_0_15px_rgba(232,121,249,1)] animate-pulse" />
              {[...Array(36)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1 rounded-full ${i % 2 === 0 ? 'bg-indigo-400' : 'bg-fuchsia-400'} ${isPlaying ? 'animate-wave' : ''}`}
                  style={{ 
                    height: isPlaying ? '100%' : '6px',
                    animationDelay: `${(i % 6) * 0.1}s`,
                    opacity: isPlaying ? 0.9 : 0.3
                  }}
                />
              ))}
           </div>

           {/* Controls - Mobile-friendly flex-wrap layout preventing any button overlap */}
           <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 w-full max-w-md px-2">
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className={`transition-colors p-3 rounded-full bg-[#0b132b] border border-white/10 shadow-md ${isFavorite ? 'text-rose-500 bg-rose-500/10 border-rose-500/30 scale-110' : 'text-slate-400 hover:text-white'}`}
                title="Favorite"
              >
                 <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              
              <div className="flex items-center gap-3 bg-[#0b132b] px-3.5 py-2.5 rounded-2xl border border-white/10 shadow-md">
                 <button onClick={() => setIsMuted(!isMuted)} className="text-slate-400 hover:text-white transition-colors">
                    {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : volume < 0.5 ? <Volume1 className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                 </button>
                 <input 
                   type="range" min="0" max="1" step="0.05"
                   value={isMuted ? 0 : volume}
                   onChange={(e) => setVolume(parseFloat(e.target.value))}
                   className="w-20 sm:w-24 transition-all duration-300 h-1.5 accent-fuchsia-500 bg-slate-800 rounded-full appearance-none cursor-pointer"
                 />
              </div>

              <button 
                onClick={togglePlay}
                disabled={isLoading}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-indigo-600 via-fuchsia-600 to-pink-600 text-white flex items-center justify-center shadow-[0_10px_40px_rgba(217,70,239,0.5)] transition-all hover:scale-110 active:scale-95 hover:shadow-[0_15px_50px_rgba(217,70,239,0.8)] disabled:opacity-50 shrink-0"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                 {isLoading ? (
                   <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin" />
                 ) : isPlaying ? (
                   <Pause className="h-8 w-8 sm:h-10 sm:w-10 fill-current" />
                 ) : (
                   <Play className="h-8 w-8 sm:h-10 sm:w-10 fill-current ml-1" />
                 )}
              </button>

              <button onClick={handleShare} className="text-slate-400 hover:text-cyan-400 transition-colors p-3 rounded-full bg-[#0b132b] border border-white/10 shadow-md" title="Share Station">
                 <Share2 className="h-5 w-5" />
              </button>
           </div>
        </div>

        {/* RIGHT PANEL: DEDICATED 262 RADIO STATIONS SEARCH & LIBRARY (7 cols on lg) */}
        <div className={`lg:col-span-7 flex flex-col space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 h-[calc(100vh-160px)] lg:h-[680px] overflow-hidden ${activeTab === 'player' ? 'hidden lg:flex' : 'flex'}`}>
           
           {/* Dedicated Radio Stations Search Box (Searching strictly out of 262 radio stations) */}
           <div className="space-y-4 shrink-0 relative z-50">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <RadioIcon className="h-5 w-5 text-fuchsia-400 animate-pulse" />
                    <h3 className="text-base font-black text-white uppercase tracking-tight">Radio Stations Library</h3>
                 </div>
                 <span className="text-xs font-mono text-fuchsia-300 bg-fuchsia-500/10 px-3 py-1 rounded-full border border-fuchsia-500/20 shadow-sm">
                    {filteredStations.length} / 262 Radio Channels
                 </span>
              </div>

              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-fuchsia-400" />
                 <input 
                   type="text"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   placeholder="Search 262 radio channels..."
                   className="w-full bg-[#0b132b]/95 backdrop-blur-md border border-indigo-500/30 rounded-2xl py-3.5 pl-12 pr-12 focus:ring-2 focus:ring-fuchsia-500 outline-none text-xs sm:text-sm transition-all shadow-[0_0_25px_rgba(79,70,229,0.15)] text-white placeholder-slate-400"
                 />
                 {search && (
                   <button
                     onClick={() => setSearch('')}
                     className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-indigo-600/50 hover:bg-indigo-600 text-white px-2.5 py-1 rounded-lg transition-colors"
                   >
                     Clear
                   </button>
                 )}

                 {/* Radio Search Suggestions Dropdown (strictly out of 262 radio channels) */}
                 {searchSuggestions.length > 0 && (
                   <div className="absolute top-full left-0 right-0 mt-2 bg-[#0b132b]/98 backdrop-blur-2xl border border-indigo-500/40 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
                      <div className="p-2 border-b border-white/10 bg-indigo-950/60 flex items-center justify-between">
                         <span className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-wider px-2">Radio Station Suggestions</span>
                         <span className="text-[10px] text-slate-400 px-2">{searchSuggestions.length} found</span>
                      </div>
                      {searchSuggestions.map((s, idx) => (
                         <button
                           key={`${s.name}-${idx}`}
                           onClick={() => handlePlayStation(s)}
                           className="w-full flex items-center justify-between p-3 hover:bg-fuchsia-600/20 transition-colors group text-left border-b border-white/5 last:border-0"
                         >
                            <div className="flex items-center gap-3 min-w-0">
                               <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-fuchsia-600 flex items-center justify-center text-white font-bold shrink-0 shadow-md group-hover:scale-105 transition-transform">
                                  <Music className="h-4 w-4" />
                               </div>
                               <div className="min-w-0">
                                  <p className="text-xs font-bold text-white group-hover:text-fuchsia-300 transition-colors truncate">{s.name}</p>
                                  <p className="text-[9px] text-indigo-300 uppercase tracking-wider">{s.language || 'Global'}</p>
                               </div>
                            </div>
                            <Play className="h-3.5 w-3.5 text-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity fill-current" />
                         </button>
                      ))}
                   </div>
                 )}
              </div>

              {/* Language Filter Pills */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
                 {languages.map(lang => (
                    <button 
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`shrink-0 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        selectedLanguage === lang 
                        ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white border-fuchsia-500 shadow-md shadow-fuchsia-600/30' 
                        : 'bg-[#0b132b]/80 text-slate-300 hover:text-white border-white/10 hover:bg-indigo-600/20'
                      }`}
                    >
                       {lang}
                    </button>
                 ))}
              </div>
           </div>

           {/* Complete List of 262 Radio Stations */}
           <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 custom-scrollbar pb-16 lg:pb-0">
              {filteredStations.length === 0 ? (
                 <div className="text-center py-16 bg-[#0b132b]/40 rounded-3xl border border-white/5">
                    <Music className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-white">No radio stations found</h4>
                    <p className="text-xs text-slate-400 mt-1">Try searching out of the 262 radio stations.</p>
                 </div>
              ) : (
                 filteredStations.map((station, idx) => {
                    const isSelected = currentStation?.streamURL === station.streamURL;
                    return (
                       <button
                         key={`${station.name}-${idx}`}
                         onClick={() => handlePlayStation(station)}
                         className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all group text-left ${
                           isSelected 
                           ? 'bg-gradient-to-r from-indigo-900/40 to-fuchsia-900/40 border-fuchsia-500 shadow-[0_0_25px_rgba(217,70,239,0.3)]' 
                           : 'bg-[#0b132b]/60 border-white/5 hover:bg-white/5 hover:border-indigo-500/30'
                         }`}
                       >
                          <div className="flex items-center gap-3.5 min-w-0">
                             <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-105 ${
                                isSelected ? 'bg-gradient-to-tr from-indigo-600 to-fuchsia-600 text-white animate-pulse' : 'bg-gradient-to-br from-indigo-500/80 to-purple-600/80 text-white/90'
                             }`}>
                                {isSelected && isPlaying ? (
                                   <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                   <Music className="h-5 w-5" />
                                )}
                             </div>
                             <div className="min-w-0">
                                <p className={`text-xs sm:text-sm font-bold truncate transition-colors ${isSelected ? 'text-fuchsia-300 font-black' : 'text-white group-hover:text-indigo-300'}`}>
                                   {station.name}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                                   {station.desc || 'Live FM Audio Stream'}
                                </p>
                             </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                             {station.language && (
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-200">
                                   {station.language}
                                </span>
                             )}
                             <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                                isSelected ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/50' : 'bg-white/5 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white'
                             }`}>
                                <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                              </div>
                          </div>
                       </button>
                    );
                 })
              )}
           </div>
        </div>
      </div>

      {/* Tab Switcher for Mobile */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 flex items-center justify-center z-[100]">
         <div className="flex items-center bg-[#0b132b]/95 backdrop-blur-2xl border border-indigo-500/30 rounded-2xl p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] w-full max-w-xs">
            <button 
              onClick={() => setActiveTab('player')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === 'player' ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/30' : 'text-slate-400 hover:text-white'}`}
            >
               <Music className="h-4 w-4" />
               <span>PLAYER</span>
            </button>
            <button 
              onClick={() => setActiveTab('library')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === 'library' ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/30' : 'text-slate-400 hover:text-white'}`}
            >
               <LayoutGrid className="h-4 w-4" />
               <span>STATIONS (262)</span>
            </button>
         </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(217, 70, 239, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(217, 70, 239, 0.6); }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};
