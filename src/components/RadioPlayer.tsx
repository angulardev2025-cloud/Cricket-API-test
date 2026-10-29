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
  Radio as RadioIcon
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

      <audio ref={audioRef} onWaiting={() => setIsLoading(true)} onPlaying={() => setIsLoading(false)} />

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 h-full relative z-10 pb-24 lg:pb-0">
        
        {/* LEFT PANEL: SMART PLAYER (5 cols on lg) */}
        <div className={`lg:col-span-5 flex flex-col items-center justify-center space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 ${activeTab === 'library' ? 'hidden lg:flex' : 'flex'}`}>
           <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-[60px] animate-pulse" />
              
              {/* Main Circular Dial */}
              <div className="relative w-64 h-64 sm:w-72 md:w-80 rounded-full bg-[#0b132b] border-[10px] sm:border-[12px] border-[#1c2541] shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_2px_20px_rgba(255,255,255,0.05)] flex flex-col items-center justify-center p-6 transition-transform duration-500 hover:scale-[1.02]">
                 <div className={`absolute inset-0 rounded-full border-4 border-indigo-400/20 ${isPlaying ? 'animate-ping' : ''}`} />
                 
                 <div className="text-center z-10">
                    <span className="text-[10px] font-black tracking-[0.3em] text-indigo-400/80 uppercase mb-1 sm:mb-2 block">Live Radio FM</span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter mb-1 truncate max-w-[200px]">
                       {currentStation ? (currentStation.name.length > 12 ? currentStation.name.slice(0, 10) + '..' : currentStation.name) : 'FM 94.3'}
                    </h2>
                    <span className="text-xs sm:text-sm font-bold text-indigo-400 uppercase tracking-widest">{currentStation?.language || 'Global'}</span>
                 </div>

                 <div className="absolute bottom-12 sm:bottom-16 flex gap-1 items-end h-6 sm:h-8">
                    {[...Array(10)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-1 bg-indigo-500/60 rounded-full transition-all duration-300"
                        style={{ 
                          height: isPlaying ? `${20 + Math.random() * 80}%` : '4px',
                          opacity: 0.3 + (i / 10) * 0.7
                        }}
                      />
                    ))}
                 </div>
              </div>
           </div>

           <div className="text-center space-y-2 px-4">
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                 {currentStation?.name || 'Select a Station'}
              </h3>
              <p className="text-slate-400 text-xs max-w-sm mx-auto">
                 {currentStation?.desc || 'Streaming live via Global IPTV Radio network.'}
              </p>
           </div>

           {/* Audio Visualizer */}
           <div className="w-full max-w-xs h-12 bg-[#0b132b] rounded-2xl border border-white/5 flex items-center justify-center gap-0.5 px-4 overflow-hidden relative group">
              <div className="absolute inset-y-0 left-1/2 w-1 bg-indigo-600 z-10 shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
              {[...Array(40)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-0.5 rounded-full transition-all duration-150 ${i % 3 === 0 ? 'bg-indigo-400' : 'bg-slate-700'}`}
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

              <button onClick={handleShare} className="text-slate-500 hover:text-indigo-400 transition-colors">
                 <Share2 className="h-6 w-6" />
              </button>
           </div>
        </div>

        {/* RIGHT PANEL: ALL STATIONS LIBRARY & EXCLUSIVE SEARCH (7 cols on lg) */}
        <div className={`lg:col-span-7 flex flex-col space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 h-[calc(100vh-140px)] lg:h-[650px] overflow-hidden ${activeTab === 'player' ? 'hidden lg:flex' : 'flex'}`}>
           {/* Exclusive Radio Search Bar */}
           <div className="space-y-4 shrink-0">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <RadioIcon className="h-5 w-5 text-indigo-400" />
                    <h3 className="text-base font-black text-white uppercase tracking-tight">Radio Stations Library</h3>
                 </div>
                 <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                    {filteredStations.length} / {stations.length} Stations
                 </span>
              </div>

              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <input 
                   type="text"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   placeholder="Search only radio channels (e.g. Bollywood, Arijit, Sonu, Hits)..."
                   className="w-full bg-[#0b132b] border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 focus:ring-2 focus:ring-indigo-600 outline-none text-xs sm:text-sm transition-all shadow-inner text-white placeholder-slate-400"
                 />
                 {search && (
                   <button
                     onClick={() => setSearch('')}
                     className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg"
                   >
                     Clear
                   </button>
                 )}
              </div>

              {/* Language / Category Filter Pills */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
                 {languages.map(lang => (
                    <button 
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`shrink-0 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        selectedLanguage === lang 
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30' 
                        : 'bg-[#0b132b] text-slate-400 hover:text-white border-white/5 hover:bg-indigo-600/20'
                      }`}
                    >
                       {lang}
                    </button>
                 ))}
              </div>
           </div>

           {/* Complete List of Stations */}
           <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 custom-scrollbar">
              {filteredStations.length === 0 ? (
                 <div className="text-center py-16 bg-[#0b132b]/40 rounded-3xl border border-white/5">
                    <Music className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-white">No radio stations found</h4>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or language filter.</p>
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
                           ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.2)]' 
                           : 'bg-[#0b132b]/60 border-white/5 hover:bg-white/5'
                         }`}
                       >
                          <div className="flex items-center gap-3.5 min-w-0">
                             <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:scale-105 ${
                                isSelected ? 'bg-indigo-600 text-white' : 'bg-gradient-to-br from-indigo-500/80 to-purple-600/80 text-white'
                             }`}>
                                {isSelected && isPlaying ? (
                                   <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                   <Music className="h-5 w-5" />
                                )}
                             </div>
                             <div className="min-w-0">
                                <p className={`text-xs sm:text-sm font-bold truncate transition-colors ${isSelected ? 'text-indigo-400' : 'text-white group-hover:text-indigo-300'}`}>
                                   {station.name}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                   {station.desc || 'Live FM Audio Stream'}
                                </p>
                             </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                             {station.language && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-indigo-300">
                                   {station.language}
                                </span>
                             )}
                             <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                                isSelected ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white'
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
         <div className="flex items-center bg-[#0b132b]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] w-full max-w-xs">
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
               <span>STATIONS ({stations.length})</span>
            </button>
         </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(79, 70, 229, 0.6); }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};
