import React, { useState, useMemo, useEffect, useCallback } from 'react';
import rawCountriesList from './data/countriesList.json';
import defaultIndiaData from './data/channels.json';
import { GLOBAL_POPULAR_CODES } from './constants';
import { Channel, CountryInfo, CountryData } from './types/iptv';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { CategoryFilter } from './components/CategoryFilter';
import { ChannelCard } from './components/ChannelCard';
import { PlaylistModal } from './components/PlaylistModal';
import { CountryModal } from './components/CountryModal';
import { Dashboard } from './components/Dashboard';
import { PinLock } from './components/PinLock';
import { SimpleView } from './components/SimpleView';
import { RadioPlayer } from './components/RadioPlayer';
import {
  Tv,
  Flame,
  Radio,
  History,
  Sparkles,
  Loader2,
  ArrowLeft,
  ChevronDown,
  Globe,
} from 'lucide-react';

const countriesList = rawCountriesList as CountryInfo[];

// In-memory cache for loaded country channel datasets
const countryCache = new Map<string, Channel[]>();
// Preload India into cache
countryCache.set('in', defaultIndiaData as Channel[]);

export const App: React.FC = () => {
  // Check 24-hour PIN authentication
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const authTime = localStorage.getItem('bharat_iptv_auth_time');
      if (!authTime) return false;
      const elapsed = Date.now() - parseInt(authTime, 10);
      const twentyFourHours = 24 * 60 * 60 * 1000;
      return elapsed < twentyFourHours;
    } catch {
      return false;
    }
  });

  const [view, setView] = useState<'dashboard' | 'player' | 'radio'>('dashboard');
  const [viewMode, setViewMode] = useState<'normal' | 'simple'>(() => {
     return (localStorage.getItem('bharat_iptv_view_mode') as 'normal' | 'simple') || 'normal';
  });

  // Selected country code
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(() => {
    try {
      return localStorage.getItem('bharat_iptv_country') || 'in';
    } catch {
      return 'in';
    }
  });

  const currentCountry = useMemo(() => {
    return (
      countriesList.find((c) => c.code === selectedCountryCode) ||
      countriesList.find((c) => c.code === 'in') || {
        code: 'in',
        name: 'India',
        flag: '🇮🇳',
        region: 'Asia',
        channelCount: defaultIndiaData.length,
      }
    );
  }, [selectedCountryCode]);

  // Channels for the current country
  const [channels, setChannels] = useState<Channel[]>(() => {
    return countryCache.get(selectedCountryCode) || (defaultIndiaData as Channel[]);
  });
  const [isLoadingCountry, setIsLoadingCountry] = useState(false);

  // Favorites stored in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bharat_iptv_favorites');
      return saved ? JSON.parse(saved) : ['AajTak.in@SD', '9XM.in@SD', 'NDTV24x7.in@SD'];
    } catch {
      return ['AajTak.in@SD', '9XM.in@SD', 'NDTV24x7.in@SD'];
    }
  });

  // Recent channels stored in localStorage
  const [recents, setRecents] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bharat_iptv_recents');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active playing channel
  const [activeChannel, setActiveChannel] = useState<Channel | null>(() => {
    const initialChannels = countryCache.get(selectedCountryCode) || (defaultIndiaData as Channel[]);
    return initialChannels[0] || null;
  });

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedQuality, setSelectedQuality] = useState('All');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showOnlyRecents, setShowOnlyRecents] = useState(false);
  const [visibleCount, setVisibleCount] = useState(36);

  // Modals
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [isFloatingPiP, setIsFloatingPiP] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


  // Save view mode
  useEffect(() => {
    localStorage.setItem('bharat_iptv_view_mode', viewMode);
  }, [viewMode]);

  // Save selected country to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bharat_iptv_country', selectedCountryCode);
    } catch {
      // storage unavailable
    }
  }, [selectedCountryCode]);

  // Load country data dynamically
  const loadCountryChannels = useCallback(async (code: string, targetChannelId?: string) => {
    if (countryCache.has(code)) {
      const cached = countryCache.get(code)!;
      setChannels(cached);
      
      if (targetChannelId) {
        const found = cached.find(c => c.id === targetChannelId);
        setActiveChannel(found || cached[0] || null);
      } else {
        setActiveChannel(cached[0] || null);
      }

      setSelectedCategory('All');
      setSelectedLanguage('All');
      setSelectedQuality('All');
      setVisibleCount(36);
      return;
    }

    setIsLoadingCountry(true);
    try {
      const res = await fetch(`/data/countries/${code}.json`);
      if (res.ok) {
        const data: CountryData = await res.json();
        countryCache.set(code, data.channels);
        setChannels(data.channels);
        
        if (targetChannelId) {
          const found = data.channels.find(c => c.id === targetChannelId);
          setActiveChannel(found || data.channels[0] || null);
        } else {
          setActiveChannel(data.channels[0] || null);
        }
      } else {
        setChannels(defaultIndiaData as Channel[]);
        setActiveChannel((defaultIndiaData as Channel[])[0] || null);
      }
    } catch (e) {
      console.error('Failed to load country data:', e);
      setChannels(defaultIndiaData as Channel[]);
      setActiveChannel((defaultIndiaData as Channel[])[0] || null);
    } finally {
      setIsLoadingCountry(false);
      setSelectedCategory('All');
      setSelectedLanguage('All');
      setSelectedQuality('All');
      setVisibleCount(36);
    }
  }, []);

  const handleSelectCountry = (code: string) => {
    setSelectedCountryCode(code);
    loadCountryChannels(code);
    setView('player');
  };

  const handleSelectGlobalChannel = (code: string, channelId: string) => {
    setSelectedCountryCode(code);
    loadCountryChannels(code, channelId);
    setView('player');
    setViewMode('simple'); // Switch to simple view for a "new page" player experience
  };

  // Sync favorites
  useEffect(() => {
    try {
      localStorage.setItem('bharat_iptv_favorites', JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  // Sync recents
  useEffect(() => {
    try {
      localStorage.setItem('bharat_iptv_recents', JSON.stringify(recents));
    } catch {}
  }, [recents]);

  const toggleFavorite = (channel: Channel) => {
    setFavorites((prev) => {
      if (prev.includes(channel.id)) {
        return prev.filter((id) => id !== channel.id);
      } else {
        return [...prev, channel.id];
      }
    });
  };

  const handleSelectChannel = useCallback((channel: Channel) => {
    setActiveChannel(channel);
    setRecents((prev) => {
      const filtered = prev.filter((id) => id !== channel.id);
      return [channel.id, ...filtered].slice(0, 20);
    });

    if (window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Compute distinct categories and languages for current country
  const categories = useMemo(() => {
    const set = new Set<string>();
    channels.forEach((c) => set.add(c.category));
    return Array.from(set).sort();
  }, [channels]);

  const languages = useMemo(() => {
    const set = new Set<string>();
    channels.forEach((c) => set.add(c.language));
    return Array.from(set).sort();
  }, [channels]);

  // Filter channels based on search and selected options
  const filteredChannels = useMemo(() => {
    return channels.filter((c) => {
      if (showOnlyFavorites && !favorites.includes(c.id)) {
        return false;
      }
      if (showOnlyRecents && !recents.includes(c.id)) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = c.name.toLowerCase().includes(query);
        const matchesCat = c.category.toLowerCase().includes(query);
        const matchesLang = c.language.toLowerCase().includes(query);
        const matchesStream = c.streams.some((s) => s.rawTitle.toLowerCase().includes(query));
        if (!matchesName && !matchesCat && !matchesLang && !matchesStream) {
          return false;
        }
      }
      if (selectedCategory !== 'All' && c.category !== selectedCategory) {
        return false;
      }
      if (selectedLanguage !== 'All' && c.language !== selectedLanguage) {
        return false;
      }
      if (selectedQuality !== 'All') {
        const matchesQuality = c.streams.some((s) =>
          s.resolution.toLowerCase().includes(selectedQuality.toLowerCase())
        );
        if (!matchesQuality) return false;
      }
      return true;
    });
  }, [
    channels,
    searchQuery,
    selectedCategory,
    selectedLanguage,
    selectedQuality,
    showOnlyFavorites,
    showOnlyRecents,
    favorites,
    recents,
  ]);

  // Channel zapping
  const handleNextChannel = useCallback(() => {
    const currentIndex = filteredChannels.findIndex((c) => c.id === activeChannel?.id);
    if (currentIndex !== -1 && currentIndex < filteredChannels.length - 1) {
      handleSelectChannel(filteredChannels[currentIndex + 1]);
    } else if (filteredChannels.length > 0) {
      handleSelectChannel(filteredChannels[0]);
    }
  }, [filteredChannels, activeChannel?.id, handleSelectChannel]);

  const handlePrevChannel = useCallback(() => {
    const currentIndex = filteredChannels.findIndex((c) => c.id === activeChannel?.id);
    if (currentIndex > 0) {
      handleSelectChannel(filteredChannels[currentIndex - 1]);
    } else if (filteredChannels.length > 0) {
      handleSelectChannel(filteredChannels[filteredChannels.length - 1]);
    }
  }, [filteredChannels, activeChannel?.id, handleSelectChannel]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        const video = document.querySelector('video');
        if (video) {
          if (video.paused) video.play();
          else video.pause();
        }
      } else if (e.code === 'ArrowDown' || e.code === 'KeyN') {
        e.preventDefault();
        handleNextChannel();
      } else if (e.code === 'ArrowUp' || e.code === 'KeyP') {
        e.preventDefault();
        handlePrevChannel();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        const video = document.querySelector('video');
        if (video) video.muted = !video.muted;
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      } else if (e.code === 'Escape') {
        setIsFloatingPiP(false);
        setIsCountryModalOpen(false);
        setIsPlaylistModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextChannel, handlePrevChannel]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedLanguage('All');
    setSelectedQuality('All');
    setShowOnlyFavorites(false);
    setShowOnlyRecents(false);
    setSearchQuery('');
  };

  // Top featured channels of current country
  const featuredChannels = useMemo(() => {
    return channels.slice(0, 15);
  }, [channels]);

  const displayedChannels = filteredChannels.slice(0, visibleCount);

  if (!isAuthenticated) {
    return <PinLock onSuccess={() => setIsAuthenticated(true)} />;
  }

  const toggleViewMode = () => setViewMode(prev => prev === 'normal' ? 'simple' : 'normal');

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans">
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-2 z-[150] shadow-lg sticky top-0">
          <span>⚠️ You are offline. Cached streams, favorites, and radio stations remain accessible.</span>
        </div>
      )}
      <Header
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setVisibleCount(36);
        }}
        currentCountry={currentCountry}
        filteredCount={filteredChannels.length}
        onOpenCountryModal={() => setIsCountryModalOpen(true)}
        onHomeClick={() => setView('dashboard')}
        onRadioClick={() => setView('radio')}
        onSelectChannel={handleSelectGlobalChannel}
        view={view}
        viewMode={viewMode}
        onViewChange={setView}
        onToggleViewMode={toggleViewMode}
      />

      <main className="flex-1 relative">
        {isLoadingCountry && view === 'player' ? (
          <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 text-amber-500 animate-spin mb-3" />
            <h3 className="text-base font-bold text-white">Loading {currentCountry.name} TV Channels...</h3>
            <p className="text-xs text-slate-400 mt-1">Preparing HLS live stream catalog</p>
          </div>
        ) : (
          <>
            {view === 'radio' && <RadioPlayer />}
            
            {view === 'dashboard' && (
              <Dashboard 
                onSelectChannel={handleSelectGlobalChannel}
                onSelectCountry={handleSelectCountry}
                onOpenCountryModal={() => setIsCountryModalOpen(true)}
              />
            )}

            {view === 'player' && viewMode === 'simple' && (
              <SimpleView 
                currentChannel={activeChannel}
                onSelectChannel={handleSelectGlobalChannel}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                recents={recents}
                suggestedChannels={channels}
                currentCountryCode={selectedCountryCode}
                onBack={() => setView('dashboard')}
              />
            )}

            {view === 'player' && viewMode === 'normal' && (
              <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Back to Home Button */}
                <div className="flex items-center justify-between">
                   <button
                     onClick={() => setView('dashboard')}
                     className="flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-white transition-colors"
                   >
                     <ArrowLeft className="h-4 w-4" />
                     <span>Back to Country Dashboard</span>
                   </button>
                </div>

                {/* Popular Country Quick Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
                  <span className="text-xs font-semibold text-slate-400 shrink-0 flex items-center gap-1.5 mr-1">
                    <Globe className="h-3.5 w-3.5 text-amber-400" />
                    <span>Country:</span>
                  </span>

                  {GLOBAL_POPULAR_CODES.map((code) => {
                    const countryItem = countriesList.find((c) => c.code === code);
                    if (!countryItem) return null;
                    const isSelected = countryItem.code === selectedCountryCode;
                    return (
                      <button
                        key={code}
                        onClick={() => handleSelectCountry(code)}
                        className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all border ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                            : 'bg-slate-900/80 text-slate-300 hover:text-white border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <span>{countryItem.flag}</span>
                        <span>{countryItem.name}</span>
                        <span className={`text-[10px] font-normal ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                          ({countryItem.channelCount})
                        </span>
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setIsCountryModalOpen(true)}
                    className="shrink-0 text-xs font-bold px-3.5 py-1.5 rounded-full bg-slate-900 text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-400 transition-all flex items-center gap-1"
                  >
                    <span>All 182 Countries</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Main Stage: Player & Quick TV Guide */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-8 flex flex-col gap-3">
                    <VideoPlayer
                      channel={activeChannel}
                      onPrevChannel={handlePrevChannel}
                      onNextChannel={handleNextChannel}
                      isFavorite={activeChannel ? favorites.includes(activeChannel.id) : false}
                      onToggleFavorite={() => activeChannel && toggleFavorite(activeChannel)}
                      onTogglePiP={() => setIsFloatingPiP(!isFloatingPiP)}
                    />

                    {activeChannel && (
                      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-slate-800 border border-slate-700 font-black text-amber-400 flex items-center justify-center text-lg shadow-inner shrink-0">
                            {activeChannel.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="text-lg font-extrabold text-white">
                                {activeChannel.name}
                              </h2>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                {activeChannel.category}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Country: <span className="text-slate-200">{currentCountry.name} {currentCountry.flag}</span> • Sources: <span className="text-amber-400 font-bold">{activeChannel.streams.length}</span>
                            </p>
                          </div>
                        </div>

                        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                          <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded font-mono">
                            ← →
                          </span>
                          <span>Zap</span>
                          <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded font-mono ml-2">
                            Space
                          </span>
                          <span>Play/Pause</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-4 glass-panel rounded-2xl p-4 flex flex-col max-h-[580px]">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-amber-500" />
                        <h3 className="font-bold text-sm text-white">
                          {currentCountry.flag} {currentCountry.name} Guide
                        </h3>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {channels.length} Channels
                      </span>
                    </div>

                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => {
                          setShowOnlyRecents(false);
                          setShowOnlyFavorites(false);
                        }}
                        className={`flex-1 text-xs py-1.5 font-semibold rounded-lg transition-all ${
                          !showOnlyRecents && !showOnlyFavorites
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-300 hover:text-white'
                        }`}
                      >
                        Featured
                      </button>
                      <button
                        onClick={() => {
                          setShowOnlyFavorites(true);
                          setShowOnlyRecents(false);
                        }}
                        className={`flex-1 text-xs py-1.5 font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                          showOnlyFavorites
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-300 hover:text-white'
                        }`}
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Favorites</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowOnlyRecents(true);
                          setShowOnlyFavorites(false);
                        }}
                        className={`flex-1 text-xs py-1.5 font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                          showOnlyRecents
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-300 hover:text-white'
                        }`}
                      >
                        <History className="h-3 w-3" />
                        <span>Recents</span>
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                      {(showOnlyRecents
                        ? channels.filter((c) => recents.includes(c.id))
                        : showOnlyFavorites
                        ? channels.filter((c) => favorites.includes(c.id))
                        : featuredChannels
                      ).map((ch) => {
                        const isSelected = activeChannel?.id === ch.id;
                        return (
                          <div
                            key={ch.id}
                            onClick={() => handleSelectChannel(ch)}
                            className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between transition-all border ${
                              isSelected
                                ? 'bg-amber-500/10 border-amber-500 text-white font-bold'
                                : 'bg-slate-900/60 hover:bg-slate-800 border-slate-800/80 text-slate-300 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`h-7 w-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                                  isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {ch.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="truncate">
                                <p className="text-xs truncate">{ch.name}</p>
                                <p className="text-[10px] text-slate-400 font-normal">
                                  {ch.category}
                                </p>
                              </div>
                            </div>

                            {isSelected ? (
                              <Radio className="h-3.5 w-3.5 text-amber-400 live-dot shrink-0" />
                            ) : (
                              <span className="text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 shrink-0">
                                {ch.streams[0]?.resolution || 'HD'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>

                <section className="space-y-6 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                        <Tv className="h-5 w-5 text-amber-500" />
                        <span>
                          {currentCountry.flag} {currentCountry.name} Channel Directory
                        </span>
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        Browsing {filteredChannels.length} of {currentCountry.channelCount} live streams
                      </p>
                    </div>
                  </div>

                  <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={(cat) => {
                      setSelectedCategory(cat);
                      setShowOnlyFavorites(false);
                      setVisibleCount(36);
                    }}
                    languages={languages}
                    selectedLanguage={selectedLanguage}
                    onSelectLanguage={(lang) => {
                      setSelectedLanguage(lang);
                      setVisibleCount(36);
                    }}
                    selectedQuality={selectedQuality}
                    onSelectQuality={(q) => {
                      setSelectedQuality(q);
                      setVisibleCount(36);
                    }}
                    showOnlyFavorites={showOnlyFavorites}
                    onToggleShowFavorites={() => {
                      setShowOnlyFavorites(!showOnlyFavorites);
                      setVisibleCount(36);
                    }}
                    favoritesCount={favorites.length}
                    onResetFilters={resetFilters}
                  />

                  {filteredChannels.length === 0 ? (
                    <div className="glass-panel text-center py-16 px-4 rounded-2xl">
                      <Tv className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                      <h3 className="text-base font-bold text-white mb-1">No channels found in this filter</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                        Try searching with different keywords or resetting category filters.
                      </p>
                      <button
                        onClick={resetFilters}
                        className="btn-gradient-success bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                      >
                        Reset all filters
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {displayedChannels.map((channel) => (
                          <ChannelCard
                            key={channel.id}
                            channel={channel}
                            isActive={activeChannel?.id === channel.id}
                            isFavorite={favorites.includes(channel.id)}
                            onSelect={handleSelectChannel}
                            onToggleFavorite={toggleFavorite}
                          />
                        ))}
                      </div>

                      {visibleCount < filteredChannels.length && (
                        <div className="text-center pt-8 pb-4">
                          <button
                            onClick={() => setVisibleCount((prev) => prev + 36)}
                            className="glass-panel hover:bg-slate-800 text-slate-200 hover:text-white font-bold px-8 py-3 rounded-xl text-sm border border-slate-700 hover:border-amber-500 transition-all inline-flex items-center gap-2 shadow-lg"
                          >
                            <span>Load More Channels ({filteredChannels.length - visibleCount} remaining)</span>
                            <ChevronDown className="h-4 w-4 text-amber-400" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </section>
              </div>
            )}
          </>
        )}
      </main>

      {/* Country Selection Modal */}
      <CountryModal
        isOpen={isCountryModalOpen}
        onClose={() => setIsCountryModalOpen(false)}
        countries={countriesList}
        selectedCountryCode={selectedCountryCode}
        onSelectCountry={handleSelectCountry}
      />

      {/* Playlist Source Modal */}
      <PlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        currentCountry={currentCountry}
      />

      {/* Floating Picture-in-Picture Player Widget */}
      {isFloatingPiP && activeChannel && view !== 'player' && (
        <div className="fixed bottom-6 right-6 z-[200] w-72 sm:w-80 aspect-video rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] border-2 border-amber-500 bg-black overflow-hidden animate-in fade-in slide-in-from-bottom-4 group">
          <VideoPlayer
            channel={activeChannel}
            onPrevChannel={handlePrevChannel}
            onNextChannel={handleNextChannel}
            isFavorite={favorites.includes(activeChannel.id)}
            onToggleFavorite={() => toggleFavorite(activeChannel)}
            onTogglePiP={() => setIsFloatingPiP(false)}
            isFloatingPiP={true}
          />
          <button
            onClick={() => setIsFloatingPiP(false)}
            className="absolute top-2 right-2 z-50 bg-slate-900/80 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors shadow-lg text-xs font-bold leading-none"
            title="Close PiP"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
