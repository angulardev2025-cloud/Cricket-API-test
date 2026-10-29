import React, { useState, useMemo, useEffect, useCallback } from 'react';
import channelsData from './data/channels.json';
import { Channel } from './types/iptv';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { CategoryFilter } from './components/CategoryFilter';
import { ChannelCard } from './components/ChannelCard';
import { PlaylistModal } from './components/PlaylistModal';
import {
  Tv,
  Flame,
  Radio,
  History,
  Sparkles,
  ChevronDown
} from 'lucide-react';

const typedChannels = channelsData as Channel[];

export const App: React.FC = () => {
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

  // Active channel
  const [activeChannel, setActiveChannel] = useState<Channel>(() => {
    // Default to popular channel like Aaj Tak or 9XM or first channel
    const defaultChan =
      typedChannels.find((c) => c.name.toLowerCase().includes('aaj tak')) ||
      typedChannels.find((c) => c.name.toLowerCase().includes('9xm')) ||
      typedChannels[0];
    return defaultChan;
  });

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedQuality, setSelectedQuality] = useState('All');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showOnlyRecents, setShowOnlyRecents] = useState(false);
  const [visibleCount, setVisibleCount] = useState(36);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bharat_iptv_favorites', JSON.stringify(favorites));
    } catch {
      // storage unavailable
    }
  }, [favorites]);

  // Sync recents to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bharat_iptv_recents', JSON.stringify(recents));
    } catch {
      // storage unavailable
    }
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

    // Scroll player into view smoothly if on mobile
    if (window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Compute distinct categories and languages
  const categories = useMemo(() => {
    const set = new Set<string>();
    typedChannels.forEach((c) => set.add(c.category));
    return Array.from(set).sort();
  }, []);

  const languages = useMemo(() => {
    const set = new Set<string>();
    typedChannels.forEach((c) => set.add(c.language));
    return Array.from(set).sort();
  }, []);

  // Filter channels based on search and selected options
  const filteredChannels = useMemo(() => {
    return typedChannels.filter((c) => {
      // Favorites filter
      if (showOnlyFavorites && !favorites.includes(c.id)) {
        return false;
      }

      // Recents filter
      if (showOnlyRecents && !recents.includes(c.id)) {
        return false;
      }

      // Search Query
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

      // Category filter
      if (selectedCategory !== 'All' && c.category !== selectedCategory) {
        return false;
      }

      // Language filter
      if (selectedLanguage !== 'All' && c.language !== selectedLanguage) {
        return false;
      }

      // Quality filter
      if (selectedQuality !== 'All') {
        const matchesQuality = c.streams.some((s) =>
          s.resolution.toLowerCase().includes(selectedQuality.toLowerCase())
        );
        if (!matchesQuality) return false;
      }

      return true;
    });
  }, [
    searchQuery,
    selectedCategory,
    selectedLanguage,
    selectedQuality,
    showOnlyFavorites,
    showOnlyRecents,
    favorites,
    recents,
  ]);

  // Handle Channel Zapping (Next / Previous channel)
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

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedLanguage('All');
    setSelectedQuality('All');
    setShowOnlyFavorites(false);
    setShowOnlyRecents(false);
    setSearchQuery('');
  };

  // Featured channels for quick hero bar
  const featuredChannels = useMemo(() => {
    const names = ['Aaj Tak', '9XM', 'NDTV 24x7', 'WION', 'Star Sports 2', 'B4U Movies', 'Colors', 'DD National'];
    return names
      .map((n) => typedChannels.find((c) => c.name.toLowerCase().includes(n.toLowerCase())))
      .filter((c): c is Channel => Boolean(c));
  }, []);

  const displayedChannels = filteredChannels.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans">
      <Header
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setVisibleCount(36);
        }}
        totalChannels={typedChannels.length}
        filteredCount={filteredChannels.length}
        onOpenPlaylistModal={() => setIsModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Main Stage: Player & Quick Controls */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Video Screen */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            <VideoPlayer
              channel={activeChannel}
              onPrevChannel={handlePrevChannel}
              onNextChannel={handleNextChannel}
              isFavorite={activeChannel ? favorites.includes(activeChannel.id) : false}
              onToggleFavorite={() => activeChannel && toggleFavorite(activeChannel)}
            />

            {/* Quick Channel Info Bar */}
            {activeChannel && (
              <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-slate-800 border border-slate-700 font-black text-amber-400 flex items-center justify-center text-lg shadow-inner">
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
                      Language: <span className="text-slate-200">{activeChannel.language}</span> • Available Sources: <span className="text-amber-400 font-bold">{activeChannel.streams.length}</span>
                    </p>
                  </div>
                </div>

                {/* Keyboard Shortcuts Hint */}
                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                  <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded font-mono">
                    ← →
                  </span>
                  <span>Zap Channels</span>
                  <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded font-mono ml-2">
                    Space
                  </span>
                  <span>Play/Pause</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick TV Guide / Featured & Recent Strip */}
          <div className="lg:col-span-4 glass-panel rounded-2xl p-4 flex flex-col max-h-[580px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500" />
                <h3 className="font-bold text-sm text-white">Quick Channels</h3>
              </div>
              <span className="text-[11px] text-slate-400">
                {typedChannels.length} in India
              </span>
            </div>

            {/* Quick List Tabs */}
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

            {/* Scrollable Mini List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {(showOnlyRecents
                ? typedChannels.filter((c) => recents.includes(c.id))
                : showOnlyFavorites
                ? typedChannels.filter((c) => favorites.includes(c.id))
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
                          {ch.language} • {ch.category}
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

        {/* Channel Browser & Filters */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Tv className="h-5 w-5 text-amber-500" />
                <span>Channel Directory</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Browsing {filteredChannels.length} channels from iptv-org India directory
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

          {/* Channels Grid */}
          {filteredChannels.length === 0 ? (
            <div className="glass-panel text-center py-16 px-4 rounded-2xl">
              <Tv className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No channels found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                Try searching with different keywords or resetting category and language filters.
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

              {/* Load More Button */}
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
      </main>

      {/* Playlist Source Modal */}
      <PlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        totalChannels={typedChannels.length}
      />

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© Bharat IPTV Player • Powered by public streams from iptv-org/iptv (in.m3u)</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-amber-400 hover:underline"
            >
              M3U Stream Info
            </button>
            <a
              href="https://github.com/iptv-org/iptv"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-white"
            >
              iptv-org GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
