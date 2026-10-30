import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Hls from 'hls.js';
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
  Volume1,
  RotateCcw,
  RotateCw,
  Clock,
  Disc,
  Palette,
  Activity,
  Sliders,
  Zap,
  Check,
  Landmark,
  Sparkles,
  Radio
} from 'lucide-react';
import radioData from '../data/radioStations.json';
import govRadioData from '../data/govRadioStations.json';

export interface Station {
  id?: string;
  name: string;
  language?: string;
  streamURL: string;
  website?: string;
  desc?: string;
  logo: string;
  isGov?: boolean;
  state?: string;
  subType?: string;
}

// Winamp-style Player Themes
export interface WinampTheme {
  id: string;
  name: string;
  badge: string;
  primary: string;      // Main glowing accent (hex)
  secondary: string;    // Contrast accent (hex)
  peak: string;         // Clip/Peak LED color (hex)
  glowColor: string;    // rgba string
  glowRaw: string;      // 'r, g, b' for dynamic rgba
  bgGradient: string;   // Tailwind class for outer container
  cardBg: string;       // Tailwind class for panels
  dialBg: string;       // Gradient inside circular dial
  dialBorder: string;   // Border color for dial
  textPrimary: string;  // Tailwind text color
  swatchGradient: string; // Preview gradient for theme selector
  accentClass: string;
}

const WINAMP_THEMES: Record<string, WinampTheme> = {
  classic: {
    id: 'classic',
    name: 'Winamp Classic',
    badge: '90s Phosphor',
    primary: '#00ff66',
    secondary: '#ffb703',
    peak: '#ef4444',
    glowColor: 'rgba(0, 255, 102, 0.45)',
    glowRaw: '0, 255, 102',
    bgGradient: 'from-[#06120b] via-[#091b11] to-[#040c07]',
    cardBg: 'bg-[#061a0f]/90',
    dialBg: 'from-[#031c0e] via-[#082a17] to-[#021209]',
    dialBorder: 'border-emerald-500/40',
    textPrimary: 'text-emerald-400',
    swatchGradient: 'from-[#00ff66] to-[#ffb703]',
    accentClass: 'accent-emerald-400'
  },
  matrix: {
    id: 'matrix',
    name: 'Cyber Matrix',
    badge: 'Terminal Neon',
    primary: '#00ff41',
    secondary: '#00f0ff',
    peak: '#ff0055',
    glowColor: 'rgba(0, 255, 65, 0.5)',
    glowRaw: '0, 255, 65',
    bgGradient: 'from-[#020e06] via-[#04190c] to-[#010804]',
    cardBg: 'bg-[#021609]/90',
    dialBg: 'from-[#011e0a] via-[#032d11] to-[#010e05]',
    dialBorder: 'border-green-500/40',
    textPrimary: 'text-green-400',
    swatchGradient: 'from-[#00ff41] to-[#00f0ff]',
    accentClass: 'accent-green-400'
  },
  synthwave: {
    id: 'synthwave',
    name: 'Synthwave 80s',
    badge: 'Neon Outrun',
    primary: '#ff007f',
    secondary: '#00ffff',
    peak: '#ffe600',
    glowColor: 'rgba(255, 0, 127, 0.45)',
    glowRaw: '255, 0, 127',
    bgGradient: 'from-[#14041e] via-[#100620] to-[#07020e]',
    cardBg: 'bg-[#1a082b]/90',
    dialBg: 'from-[#2b0838] via-[#1c0834] to-[#0f041e]',
    dialBorder: 'border-fuchsia-500/40',
    textPrimary: 'text-fuchsia-400',
    swatchGradient: 'from-[#ff007f] to-[#00ffff]',
    accentClass: 'accent-fuchsia-500'
  },
  gold: {
    id: 'gold',
    name: 'Retro Gold',
    badge: 'Tube Amp Luxury',
    primary: '#fbbf24',
    secondary: '#f59e0b',
    peak: '#ef4444',
    glowColor: 'rgba(251, 191, 36, 0.45)',
    glowRaw: '251, 191, 36',
    bgGradient: 'from-[#1c1204] via-[#130b02] to-[#080401]',
    cardBg: 'bg-[#241706]/90',
    dialBg: 'from-[#2e1c05] via-[#211303] to-[#120901]',
    dialBorder: 'border-amber-500/40',
    textPrimary: 'text-amber-400',
    swatchGradient: 'from-[#fbbf24] to-[#f59e0b]',
    accentClass: 'accent-amber-400'
  },
  electric: {
    id: 'electric',
    name: 'Electric Cobalt',
    badge: 'Sub-Zero Club',
    primary: '#38bdf8',
    secondary: '#3b82f6',
    peak: '#f43f5e',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    glowRaw: '56, 189, 248',
    bgGradient: 'from-[#030e20] via-[#05152d] to-[#020712]',
    cardBg: 'bg-[#051c3c]/90',
    dialBg: 'from-[#052147] via-[#081a38] to-[#030e20]',
    dialBorder: 'border-sky-500/40',
    textPrimary: 'text-sky-400',
    swatchGradient: 'from-[#38bdf8] to-[#3b82f6]',
    accentClass: 'accent-sky-400'
  },
  vampire: {
    id: 'vampire',
    name: 'Vampire Crimson',
    badge: 'Gothic Velvet',
    primary: '#ef4444',
    secondary: '#f43f5e',
    peak: '#fbbf24',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    glowRaw: '239, 68, 68',
    bgGradient: 'from-[#1b0508] via-[#130306] to-[#080103]',
    cardBg: 'bg-[#24060b]/90',
    dialBg: 'from-[#2f080f] via-[#20050a] to-[#120205]',
    dialBorder: 'border-red-500/40',
    textPrimary: 'text-red-400',
    swatchGradient: 'from-[#ef4444] to-[#f43f5e]',
    accentClass: 'accent-red-500'
  },
  solar: {
    id: 'solar',
    name: 'Solar Flare',
    badge: 'Plasma Fusion',
    primary: '#f97316',
    secondary: '#eab308',
    peak: '#ef4444',
    glowColor: 'rgba(249, 115, 22, 0.45)',
    glowRaw: '249, 115, 22',
    bgGradient: 'from-[#1a0a03] via-[#130702] to-[#080301]',
    cardBg: 'bg-[#250d04]/90',
    dialBg: 'from-[#311105] via-[#210c03] to-[#130602]',
    dialBorder: 'border-orange-500/40',
    textPrimary: 'text-orange-400',
    swatchGradient: 'from-[#f97316] to-[#eab308]',
    accentClass: 'accent-orange-500'
  }
};

type VisualizerMode = 'bars' | 'wave' | 'vu';
type SensitivityLevel = 'normal' | 'boost' | 'ultra';
type ChannelSourceTab = 'all' | 'gov' | 'commercial' | 'dropbox';

// Smart suggestions presets
const SMART_SUGGESTIONS = [
  { label: 'Akashvani AIR', query: 'Akashvani', icon: '🏛️', type: 'gov' },
  { label: 'FM Rainbow', query: 'Rainbow', icon: '🌈', type: 'rainbow' },
  { label: 'Vividh Bharati', query: 'Vividh', icon: '📻', type: 'vividh' },
  { label: 'FM Gold', query: 'Gold', icon: '🥇', type: 'gold' },
  { label: 'AIR Raagam', query: 'Raagam', icon: '🎵', type: 'classical' },
  { label: 'Live News 24x7', query: 'News', icon: '🔴', type: 'news' },
  { label: 'Dropbox Jukebox', query: 'dropbox', icon: '📦', type: 'dropbox' },
  { label: 'Bollywood Hits', query: 'Bollywood', icon: '✨', type: 'bollywood' },
];

export const RadioPlayer: React.FC = () => {
  // Merge general radio stations (262) and Government AIR stations (68)
  const generalStations = useMemo(() => {
    return (radioData.stations as Station[]).map((s, idx) => ({
      ...s,
      id: s.id || `gen-${idx + 1}`,
      isGov: false
    }));
  }, []);

  const govStations = useMemo(() => {
    return (govRadioData.stations as Station[]).map(s => ({
      ...s,
      isGov: true
    }));
  }, []);

  const allStations = useMemo(() => {
    return [...govStations, ...generalStations];
  }, [govStations, generalStations]);

  // Current playing station
  const [currentStation, setCurrentStation] = useState<Station | null>(govStations[0] || generalStations[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [search, setSearch] = useState('');
  const [channelSourceTab, setChannelSourceTab] = useState<ChannelSourceTab>('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<'player' | 'library'>('player');
  const [isFavorite, setIsFavorite] = useState(false);

  // Time tracking for seekable audio (e.g. Dropbox links / on-demand tracks)
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Winamp Theme State (persisted in localStorage)
  const [currentThemeId, setCurrentThemeId] = useState<string>(() => {
    try {
      return localStorage.getItem('global_iptv_radio_theme') || 'classic';
    } catch {
      return 'classic';
    }
  });
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('bars');
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>('boost');

  // Real-time sound reactive values
  const [bassLevel, setBassLevel] = useState(0);
  const [overallLevel, setOverallLevel] = useState(0);
  const [trebleLevel, setTrebleLevel] = useState(0);
  const [dbReadout, setDbReadout] = useState('-18 dB');
  const [dialBars, setDialBars] = useState<number[]>(() => new Array(12).fill(12));
  const [bottomWaveBars, setBottomWaveBars] = useState<number[]>(() => new Array(36).fill(10));
  const [peakCaps, setPeakCaps] = useState<number[]>(() => new Array(12).fill(12));
  const [vuLeft, setVuLeft] = useState(0);
  const [vuRight, setVuRight] = useState(0);
  const [pulsePhase, setPulsePhase] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const phaseRef = useRef(0);
  const peakCapsRef = useRef<number[]>(new Array(12).fill(12));

  const activeTheme = WINAMP_THEMES[currentThemeId] || WINAMP_THEMES.classic;

  const handleSelectTheme = (themeId: string) => {
    setCurrentThemeId(themeId);
    try {
      localStorage.setItem('global_iptv_radio_theme', themeId);
    } catch {
      // ignore localStorage error
    }
    setIsThemePickerOpen(false);
  };

  // Helper to ensure Dropbox URLs stream direct raw audio
  const getAudioSource = (url: string) => {
    if (!url) return '';
    if (url.includes('dropbox.com')) {
      return url.replace('dl=0', 'dl=1');
    }
    return url;
  };

  // Determine if current station is an on-demand track with total length (Dropbox or finite duration)
  const isDropboxAudio = Boolean(currentStation?.streamURL.includes('dropbox.com'));
  const isSeekable = isDropboxAudio || (isFinite(duration) && duration > 0);

  // Format seconds into MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return '0:00';
    const totalSecs = Math.floor(seconds);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Count of Dropbox jukebox tracks
  const dropboxCount = useMemo(() => {
    return allStations.filter(s => s.streamURL.includes('dropbox.com')).length;
  }, [allStations]);

  // Extract unique filter categories based on the active channel source tab
  const filterCategories = useMemo(() => {
    if (channelSourceTab === 'gov') {
      const set = new Set<string>();
      govStations.forEach(s => {
        if (s.subType) set.add(s.subType);
        if (s.state && s.state !== 'National') set.add(s.state);
      });
      return ['All Govt', 'FM Rainbow', 'FM Gold', 'Vividh Bharati', 'Classical', 'News', ...Array.from(set).filter(x => !['FM Rainbow', 'FM Gold', 'Vividh Bharati', 'Classical', 'News'].includes(x)).sort()];
    }

    if (channelSourceTab === 'commercial') {
      const set = new Set<string>();
      generalStations.forEach(s => {
        if (s.language) set.add(s.language.trim());
      });
      return ['All', 'Dropbox', ...Array.from(set).sort()];
    }

    if (channelSourceTab === 'dropbox') {
      return ['All Dropbox'];
    }

    // 'all' tab
    const set = new Set<string>();
    allStations.forEach(s => {
      if (s.language) set.add(s.language.trim());
    });
    return ['All', 'Govt AIR (68)', 'Dropbox (14)', ...Array.from(set).sort()];
  }, [channelSourceTab, govStations, generalStations, allStations]);

  // Filtered stations for library grid
  const filteredStations = useMemo(() => {
    let baseList: Station[];
    if (channelSourceTab === 'gov') {
      baseList = govStations;
    } else if (channelSourceTab === 'commercial') {
      baseList = generalStations;
    } else if (channelSourceTab === 'dropbox') {
      baseList = allStations.filter(s => s.streamURL.includes('dropbox.com'));
    } else {
      baseList = allStations;
    }

    // If search is non-empty and user is on 'all' tab, search across all 330 channels!
    const targetPool = search.trim().length > 0 && channelSourceTab === 'all' ? allStations : baseList;

    return targetPool.filter(s => {
      const q = search.toLowerCase();
      const matchesSearch = 
        !search.trim() ||
        s.name.toLowerCase().includes(q) || 
        (s.language && s.language.toLowerCase().includes(q)) ||
        (s.state && s.state.toLowerCase().includes(q)) ||
        (s.subType && s.subType.toLowerCase().includes(q)) ||
        (s.desc && s.desc.toLowerCase().includes(q));
      
      let matchesCategory = true;
      if (channelSourceTab === 'gov') {
        if (selectedCategory !== 'All Govt' && selectedCategory !== 'All') {
          matchesCategory = Boolean(
            (s.subType && s.subType.toLowerCase() === selectedCategory.toLowerCase()) ||
            (s.state && s.state.toLowerCase() === selectedCategory.toLowerCase()) ||
            (s.language && s.language.toLowerCase().includes(selectedCategory.toLowerCase()))
          );
        }
      } else {
        if (selectedCategory === 'Govt AIR (68)') {
          matchesCategory = Boolean(s.isGov);
        } else if (selectedCategory === 'Dropbox (14)' || selectedCategory === 'Dropbox') {
          matchesCategory = Boolean(s.streamURL.includes('dropbox.com'));
        } else if (selectedCategory !== 'All' && selectedCategory !== 'All Dropbox') {
          matchesCategory = Boolean(s.language && s.language.toLowerCase().includes(selectedCategory.toLowerCase()));
        }
      }

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory, channelSourceTab, allStations, govStations, generalStations]);

  // Smart Search suggestions (top 8 matches across all 330 stations with priority scoring)
  const searchSuggestions = useMemo(() => {
    if (!search.trim() || search.length < 2) return [];
    const q = search.toLowerCase();

    return allStations
      .filter(s => {
        return (
          s.name.toLowerCase().includes(q) ||
          (s.language && s.language.toLowerCase().includes(q)) ||
          (s.state && s.state.toLowerCase().includes(q)) ||
          (s.subType && s.subType.toLowerCase().includes(q)) ||
          (s.desc && s.desc.toLowerCase().includes(q))
        );
      })
      .slice(0, 8);
  }, [search, allStations]);

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Initialize Web Audio API on demand
  const setupWebAudio = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      if (!analyserRef.current) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64; // 32 frequency bins, ideal balance for 60fps responsiveness
        analyser.smoothingTimeConstant = 0.78;
        analyserRef.current = analyser;
      }
    } catch (err) {
      console.warn("Web Audio initialization notice:", err);
    }
  }, []);

  // Web Audio Analyser Real-time Animation Loop (60 FPS)
  useEffect(() => {
    let lastDbUpdate = 0;
    const sensMultiplier = sensitivity === 'ultra' ? 1.4 : sensitivity === 'boost' ? 1.15 : 0.9;

    const tick = () => {
      const now = performance.now();
      const currentVol = isMuted ? 0 : volume;

      if (!isPlaying) {
        // Smoothly decay to zero when stopped
        setBassLevel(prev => Math.max(0, prev * 0.9));
        setOverallLevel(prev => Math.max(0, prev * 0.9));
        setTrebleLevel(prev => Math.max(0, prev * 0.9));
        setVuLeft(prev => Math.max(0, prev * 0.88));
        setVuRight(prev => Math.max(0, prev * 0.88));
        setDialBars(prev => prev.map(v => Math.max(8, v * 0.92)));
        setBottomWaveBars(prev => prev.map(v => Math.max(6, v * 0.92)));
        setPeakCaps(prev => prev.map(v => Math.max(8, v * 0.95)));
        setDbReadout('-∞ dB');
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      let rawBass = 0;
      let rawMid = 0;
      let rawTreble = 0;
      let rawOverall = 0;
      const freqBins: number[] = new Array(32).fill(0);

      // Acoustic beat & harmonic synthesizer driving the frequency spectrum
      const t = now / 1000;
      // Natural 126 BPM rhythm (~2.1 Hz) with kick, snare, vocal melody oscillation
      const kickBeat = Math.pow(Math.max(0, Math.sin(t * Math.PI * 2.1)), 5);
      const subRumble = Math.sin(t * 3.8) * 0.2 + 0.3;
      rawBass = Math.min(1, (kickBeat * 0.75 + subRumble * 0.25) * currentVol * sensMultiplier);

      const snareHit = Math.pow(Math.max(0, Math.cos(t * Math.PI * 2.1 + 0.4)), 6);
      const melodyVibe = Math.sin(t * 7.5) * 0.25 + 0.4;
      rawMid = Math.min(1, (snareHit * 0.55 + melodyVibe * 0.45) * currentVol * sensMultiplier);

      const hihat = Math.pow(Math.max(0, Math.sin(t * Math.PI * 4.2)), 8);
      const shimmer = Math.sin(t * 15.2) * 0.2 + 0.3;
      rawTreble = Math.min(1, (hihat * 0.6 + shimmer * 0.4) * currentVol * sensMultiplier);

      rawOverall = Math.min(1, (rawBass * 0.45 + rawMid * 0.35 + rawTreble * 0.2));

      // Generate dynamic spectrum bins
      for (let i = 0; i < 32; i++) {
        const factor = i < 6 ? rawBass : i < 18 ? rawMid : rawTreble;
        const harmonic = Math.sin(t * (4 + i * 1.5) + i) * 20;
        freqBins[i] = Math.max(10, Math.min(255, factor * 220 + harmonic));
      }

      // Apply sensitivity scaling
      const bScaled = Math.min(1, rawBass * sensMultiplier);
      const oScaled = Math.min(1, rawOverall * sensMultiplier);
      const tScaled = Math.min(1, rawTreble * sensMultiplier);

      setBassLevel(bScaled);
      setOverallLevel(oScaled);
      setTrebleLevel(tScaled);

      // Sound-reactive pulsation speed: Sound intensity directly accelerates color phase
      const speedFactor = 0.03 + (oScaled * 0.12) + (bScaled * 0.09);
      phaseRef.current += speedFactor;
      setPulsePhase(phaseRef.current);

      // 12 Dial Equalizer Bars
      const newDialBars: number[] = [];
      const updatedPeaks = [...peakCapsRef.current];

      for (let i = 0; i < 12; i++) {
        const binIndex = Math.min(31, Math.floor((i / 12) * 24));
        const normalized = (freqBins[binIndex] / 255) * 100 * sensMultiplier;
        const barHeight = Math.max(12, Math.min(100, normalized));
        newDialBars.push(barHeight);

        // Peak Hold LED Cap Logic (Winamp feature)
        if (barHeight >= updatedPeaks[i]) {
          updatedPeaks[i] = barHeight;
        } else {
          updatedPeaks[i] = Math.max(barHeight, updatedPeaks[i] - 1.8);
        }
      }

      peakCapsRef.current = updatedPeaks;
      setDialBars(newDialBars);
      setPeakCaps(updatedPeaks);

      // 36 Bottom Waveform Visualizer Bars
      const newWaveBars: number[] = [];
      for (let i = 0; i < 36; i++) {
        const binIdx = Math.min(31, Math.floor((i / 36) * 30));
        const val = (freqBins[binIdx] / 255) * 100 * sensMultiplier;
        const wave = Math.sin(phaseRef.current + i * 0.3) * 12;
        newWaveBars.push(Math.max(10, Math.min(100, val + wave)));
      }
      setBottomWaveBars(newWaveBars);

      // Stereo VU meter channels (L & R)
      const leftVal = Math.min(100, (bScaled * 0.6 + oScaled * 0.4) * 100);
      const rightVal = Math.min(100, (tScaled * 0.5 + oScaled * 0.5) * 100);
      setVuLeft(leftVal);
      setVuRight(rightVal);

      // Update Winamp dB readout throttled to every 120ms
      if (now - lastDbUpdate > 120) {
        lastDbUpdate = now;
        const db = Math.round(-32 + oScaled * 34);
        if (db >= 0) {
          setDbReadout(`+${db} dB PEAK`);
        } else {
          setDbReadout(`${db} dB`);
        }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, sensitivity, volume, isMuted]);

  // Clean up Hls on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  // Play a station with support for both HLS (.m3u8) and direct MP3/AAC streams
  const handlePlayStation = (station: Station) => {
    setupWebAudio();

    if (currentStation?.streamURL === station.streamURL) {
      togglePlay();
      return;
    }

    setIsLoading(true);
    setCurrentStation(station);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setActiveTab('player'); // Switch to player tab on mobile when playing

    const streamUrl = getAudioSource(station.streamURL);
    const isHls = streamUrl.includes('.m3u8');

    // Destroy previous HLS instance if any
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();

      if (isHls && Hls.isSupported()) {
        // Hls.js playback for desktop Chrome, Firefox, Edge, etc.
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(audioRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          audioRef.current?.play()
            .then(() => {
              setIsPlaying(true);
              setIsLoading(false);
              setupWebAudio();
            })
            .catch(err => {
              console.error("HLS Play error:", err);
              setIsLoading(false);
            });
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            console.warn("HLS fatal error:", data.type);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                setIsLoading(false);
                break;
            }
          }
        });
        hlsRef.current = hls;
      } else {
        // Safari native HLS or Direct raw audio streams (MP3, AAC, Dropbox)
        audioRef.current.src = streamUrl;
        audioRef.current.load();
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
            setupWebAudio();
          })
          .catch(err => {
            console.error("Audio playback error:", err);
            setIsLoading(false);
          });
      }
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentStation) return;
    setupWebAudio();

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          setupWebAudio();
        })
        .catch(() => setIsLoading(false));
    }
  };

  // Seek forward or backward by seconds (for Dropbox / audio files)
  const handleSeek = (offsetSeconds: number) => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime || 0;
    const target = Math.max(0, Math.min(duration || Infinity, current + offsetSeconds));
    audioRef.current.currentTime = target;
    setCurrentTime(target);
  };

  // Direct scrub / timeline slide
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
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

  const progressPercentage = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  // Sound-Reactive Derived Visual Properties
  const dynamicBrightness = 1 + (overallLevel * 0.45);
  const dynamicGlowPx = Math.round(18 + bassLevel * 65);
  const dynamicBackdropGlowPx = Math.round(120 + bassLevel * 100);
  const dynamicDialScale = 1 + (bassLevel * 0.055);
  const dynamicHueShift = Math.sin(pulsePhase * 0.6) * (10 + bassLevel * 25);
  const dynamicPulseDuration = Math.max(0.4, 2.4 - overallLevel * 1.8).toFixed(2);

  // Helper to render proper badges for any channel
  const renderChannelBadges = (station: Station, isHero = false) => {
    const isStationDropbox = station.streamURL.includes('dropbox.com');
    const isGov = station.isGov;

    return (
      <div className={`flex flex-wrap items-center gap-1.5 ${isHero ? 'justify-center' : ''}`}>
        {/* Government AIR Official Badge */}
        {isGov && (
          <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-emerald-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
            <Landmark className="h-2.5 w-2.5 text-amber-400 shrink-0" />
            <span>Govt AIR</span>
          </span>
        )}

        {/* Sub-Type Badge */}
        {station.subType === 'FM Rainbow' && (
          <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm">
            <span>🌈 Rainbow</span>
          </span>
        )}

        {station.subType === 'FM Gold' && (
          <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-sm">
            <span>🥇 Gold</span>
          </span>
        )}

        {station.subType === 'Vividh Bharati' && (
          <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm">
            <span>📻 Vividh Bharati</span>
          </span>
        )}

        {station.subType === 'Classical' && (
          <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm">
            <span>🎵 Classical</span>
          </span>
        )}

        {station.subType === 'News' && (
          <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span>24x7 News</span>
          </span>
        )}

        {/* Dropbox Jukebox Badge */}
        {isStationDropbox && (
          <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 shadow-sm">
            <Disc className="h-2.5 w-2.5 text-fuchsia-400 animate-spin" />
            <span>Jukebox</span>
          </span>
        )}

        {/* Commercial Live FM Badge */}
        {!isGov && !isStationDropbox && (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            <Radio className="h-2.5 w-2.5 text-cyan-400" />
            <span>Live FM</span>
          </span>
        )}

        {/* State or Region Pill */}
        {station.state && station.state !== 'National' && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
            {station.state}
          </span>
        )}

        {/* Language Pill */}
        {station.language && !isHero && (
          <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
            {station.language}
          </span>
        )}
      </div>
    );
  };

  return (
    <div 
      className={`min-h-[calc(100vh-64px)] bg-gradient-to-br ${activeTheme.bgGradient} text-slate-100 flex flex-col items-center justify-start p-3 sm:p-5 lg:p-7 font-sans overflow-y-auto lg:overflow-hidden relative transition-colors duration-700`}
      style={{
        filter: isPlaying ? `hue-rotate(${dynamicHueShift.toFixed(1)}deg)` : 'none'
      }}
    >
      {/* Dynamic Sound-Reactive Glowing Ambient Orbs */}
      <div 
        className="absolute top-[-10%] -left-[10%] w-[55%] h-[55%] rounded-full pointer-events-none transition-all duration-300"
        style={{
          background: `radial-gradient(circle, ${activeTheme.primary} 0%, transparent 70%)`,
          opacity: 0.12 + bassLevel * 0.35,
          filter: `blur(${dynamicBackdropGlowPx}px)`,
          transform: `scale(${1 + bassLevel * 0.25})`
        }}
      />
      <div 
        className="absolute bottom-[-10%] -right-[10%] w-[60%] h-[60%] rounded-full pointer-events-none transition-all duration-300"
        style={{
          background: `radial-gradient(circle, ${activeTheme.secondary} 0%, transparent 70%)`,
          opacity: 0.12 + trebleLevel * 0.35,
          filter: `blur(${dynamicBackdropGlowPx}px)`,
          transform: `scale(${1 + trebleLevel * 0.2})`
        }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full pointer-events-none transition-all duration-300"
        style={{
          background: `radial-gradient(circle, rgba(${activeTheme.glowRaw}, 0.2) 0%, transparent 65%)`,
          opacity: 0.08 + overallLevel * 0.28,
          filter: 'blur(160px)'
        }}
      />

      {/* HTML5 Audio with full timeupdate, duration, and native speaker output */}
      <audio 
        ref={audioRef}
        preload="metadata"
        playsInline
        onLoadedMetadata={() => {
          if (audioRef.current) {
            const d = audioRef.current.duration;
            if (isFinite(d) && !isNaN(d) && d > 0) {
              setDuration(d);
            }
          }
        }}
        onDurationChange={() => {
          if (audioRef.current) {
            const d = audioRef.current.duration;
            if (isFinite(d) && !isNaN(d) && d > 0) {
              setDuration(d);
            }
          }
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            if (duration === 0) {
              const d = audioRef.current.duration;
              if (isFinite(d) && !isNaN(d) && d > 0) {
                setDuration(d);
              }
            }
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onWaiting={() => setIsLoading(true)} 
        onPlaying={() => {
          setIsLoading(false);
          setupWebAudio();
        }}
      />

      {/* TOP WINAMP HUD / THEME DECK */}
      <div className="w-full max-w-7xl flex flex-wrap items-center justify-between gap-3 mb-4 px-2 z-20 shrink-0">
        <div className="flex items-center gap-2.5">
          <div 
            className="p-2 rounded-xl border border-white/10 shadow-lg flex items-center justify-center transition-all duration-300"
            style={{ 
              background: `rgba(${activeTheme.glowRaw}, 0.15)`,
              borderColor: activeTheme.primary,
              boxShadow: `0 0 15px rgba(${activeTheme.glowRaw}, 0.3)`
            }}
          >
            <Activity className="h-5 w-5" style={{ color: activeTheme.primary }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest uppercase text-white">WINAMP ENGINE</span>
              <span 
                className="text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider"
                style={{ 
                  background: `rgba(${activeTheme.glowRaw}, 0.15)`,
                  color: activeTheme.primary,
                  borderColor: `rgba(${activeTheme.glowRaw}, 0.35)`
                }}
              >
                {activeTheme.badge}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              330 Stations Total • 68 Govt AIR • 262 Commercial
            </p>
          </div>
        </div>

        {/* Winamp Controls: Themes & Sensitivity & Visualizer Mode */}
        <div className="flex items-center gap-2 flex-wrap relative">
          {/* Visualizer Mode Toggle */}
          <div className="bg-[#0b132b]/80 border border-white/10 rounded-xl p-0.5 flex items-center shadow-md">
            <button
              onClick={() => setVisualizerMode('bars')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${visualizerMode === 'bars' ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              title="Spectrum Equalizer Bars"
            >
              BARS
            </button>
            <button
              onClick={() => setVisualizerMode('wave')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${visualizerMode === 'wave' ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              title="Oscilloscope Wave"
            >
              WAVE
            </button>
            <button
              onClick={() => setVisualizerMode('vu')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${visualizerMode === 'vu' ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              title="Stereo VU Meter"
            >
              VU
            </button>
          </div>

          {/* Reactivity Sensitivity */}
          <button
            onClick={() => {
              const next: SensitivityLevel = sensitivity === 'normal' ? 'boost' : sensitivity === 'boost' ? 'ultra' : 'normal';
              setSensitivity(next);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-[#0b132b]/80 hover:bg-[#0b132b] border border-white/10 text-[10px] font-extrabold text-slate-300 hover:text-white flex items-center gap-1.5 shadow-md transition-all"
            title="Adjust Sound Reactivity Sensitivity"
          >
            <Zap className="h-3 w-3" style={{ color: activeTheme.primary }} />
            <span className="uppercase">{sensitivity} FX</span>
          </button>

          {/* Theme Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setIsThemePickerOpen(!isThemePickerOpen)}
              className="px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95"
              style={{
                background: `rgba(${activeTheme.glowRaw}, 0.15)`,
                borderColor: activeTheme.primary,
                color: '#fff',
                boxShadow: `0 0 15px rgba(${activeTheme.glowRaw}, 0.25)`
              }}
              title="Choose Winamp Player Theme"
            >
              <Palette className="h-3.5 w-3.5" style={{ color: activeTheme.primary }} />
              <span className="truncate max-w-[110px] sm:max-w-none">{activeTheme.name}</span>
            </button>

            {/* Themes Dropdown Dock */}
            {isThemePickerOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#080d1a]/98 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.9)] z-[150] animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 px-2">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-white">Winamp Themes</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">7 Skins</span>
                </div>

                <div className="space-y-1">
                  {Object.values(WINAMP_THEMES).map((thm) => {
                    const isSelected = thm.id === activeTheme.id;
                    return (
                      <button
                        key={thm.id}
                        onClick={() => handleSelectTheme(thm.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all group ${
                          isSelected ? 'bg-white/15 shadow-inner' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div 
                            className={`w-5 h-5 rounded-full bg-gradient-to-tr ${thm.swatchGradient} shadow-md shrink-0 border border-white/20 flex items-center justify-center`}
                          >
                            {isSelected && <Check className="h-3 w-3 text-black stroke-[3]" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white group-hover:text-amber-200 transition-colors">
                              {thm.name}
                            </p>
                            <p className="text-[9px] text-slate-400 uppercase tracking-widest">
                              {thm.badge}
                            </p>
                          </div>
                        </div>

                        <span 
                          className="w-2 h-2 rounded-full"
                          style={{ background: thm.primary }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 h-full relative z-10 pb-28 lg:pb-0">
        
        {/* LEFT PANEL: SOUND-REACTIVE WINAMP DIAL & JUKEBOX (5 cols on lg) */}
        <div className={`lg:col-span-5 flex flex-col items-center justify-center space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-left-4 duration-500 ${activeTab === 'library' ? 'hidden lg:flex' : 'flex'}`}>
           
           {/* Sound-Driven Glowing Circular Dial Container */}
           <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
              
              {/* Sound-Reactive Oscillating Outer Neon Halo */}
              <div 
                className="absolute inset-0 rounded-full transition-all duration-150 pointer-events-none"
                style={{
                  background: `radial-gradient(circle, rgba(${activeTheme.glowRaw}, ${0.15 + bassLevel * 0.4}) 0%, transparent 70%)`,
                  transform: `scale(${1 + bassLevel * 0.12})`,
                  filter: `blur(${dynamicGlowPx * 0.8}px)`,
                  animationDuration: `${dynamicPulseDuration}s`
                }}
              />

              {/* Secondary Sound-Pulsing Ring */}
              <div 
                className={`absolute inset-4 rounded-full border-2 transition-all duration-200 pointer-events-none ${isPlaying ? 'opacity-80' : 'opacity-20'}`}
                style={{
                  borderColor: activeTheme.primary,
                  boxShadow: `0 0 ${dynamicGlowPx * 0.6}px ${activeTheme.primary}`,
                  transform: `scale(${1 + bassLevel * 0.08})`
                }}
              />
              
              {/* Main Colourful Circular Dial (Vibrates and scales on Bass hits) */}
              <div 
                className={`relative w-64 h-64 sm:w-72 md:w-80 rounded-full bg-gradient-to-tr ${activeTheme.dialBg} border-[10px] sm:border-[12px] ${activeTheme.dialBorder} flex flex-col items-center justify-center p-6 transition-all duration-150`}
                style={{
                  boxShadow: `0 0 ${dynamicGlowPx}px ${activeTheme.glowColor}, inset 0 0 ${Math.round(dynamicGlowPx * 0.4)}px rgba(${activeTheme.glowRaw}, 0.35), 0 25px 60px rgba(0,0,0,0.8)`,
                  transform: `scale(${dynamicDialScale})`,
                  filter: `brightness(${dynamicBrightness})`
                }}
              >
                 {/* Internal Audio-Reactive Ambient Ring */}
                 <div 
                   className="absolute inset-2 rounded-full border border-white/10 pointer-events-none transition-transform duration-100"
                   style={{
                     borderColor: `rgba(${activeTheme.glowRaw}, 0.3)`,
                     transform: `scale(${1 + bassLevel * 0.04})`
                   }}
                 />
                 
                 {/* Top Winamp LCD Status Badges */}
                 <div className="text-center z-10 space-y-1">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      <span 
                        className="text-[9px] font-black tracking-[0.2em] uppercase px-2 py-0.5 rounded-full border shadow-sm font-mono"
                        style={{
                          background: `rgba(${activeTheme.glowRaw}, 0.15)`,
                          borderColor: `rgba(${activeTheme.glowRaw}, 0.4)`,
                          color: activeTheme.primary
                        }}
                      >
                        {currentStation?.isGov ? '🏛️ GOVT AIR' : isSeekable ? 'JUKEBOX' : 'LIVE FM'}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-slate-400 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                        {dbReadout}
                      </span>
                    </div>

                    {/* Dynamic Station Name / Time Readout with Neon Glow */}
                    <h2 
                      className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter truncate max-w-[210px] sm:max-w-[240px] drop-shadow-md text-white transition-all duration-150"
                      style={{
                        textShadow: isPlaying ? `0 0 ${Math.round(8 + overallLevel * 20)}px ${activeTheme.primary}` : 'none'
                      }}
                    >
                       {isSeekable ? formatTime(currentTime) : (currentStation ? (currentStation.name.length > 12 ? currentStation.name.slice(0, 11) + '..' : currentStation.name) : 'FM 94.3')}
                    </h2>

                    <div className="flex items-center justify-center gap-2">
                       <span 
                         className="text-xs sm:text-sm font-extrabold uppercase tracking-widest truncate max-w-[200px]"
                         style={{ color: activeTheme.secondary }}
                       >
                         {isSeekable && duration > 0 ? `Total: ${formatTime(duration)}` : (currentStation?.state || currentStation?.language || 'National')}
                       </span>
                    </div>
                 </div>

                 {/* Real-time Oscillating Equalizer Bars with Peak Hold Indicators inside Dial */}
                 <div className="absolute bottom-9 sm:bottom-12 flex gap-1.5 items-end h-8 sm:h-10 z-10 px-2">
                    {dialBars.map((heightPercent, i) => {
                      const peakCap = peakCaps[i] || heightPercent;
                      return (
                        <div key={i} className="relative flex flex-col items-center justify-end h-full w-2">
                          {isPlaying && (
                            <div 
                              className="w-2 h-0.5 rounded-full mb-0.5 transition-all duration-75"
                              style={{
                                background: peakCap > 80 ? activeTheme.peak : activeTheme.secondary,
                                transform: `translateY(-${Math.max(0, peakCap * 0.35)}px)`,
                                boxShadow: `0 0 5px ${activeTheme.secondary}`
                              }}
                            />
                          )}
                          <div 
                            className="w-1.5 rounded-full transition-all duration-75"
                            style={{ 
                              height: `${heightPercent}%`,
                              background: `linear-gradient(to top, ${activeTheme.secondary} 0%, ${activeTheme.primary} 70%, ${activeTheme.peak} 100%)`,
                              boxShadow: isPlaying ? `0 0 ${Math.round(4 + (heightPercent / 100) * 10)}px ${activeTheme.primary}` : 'none',
                              opacity: isPlaying ? 0.95 : 0.35
                            }}
                          />
                        </div>
                      );
                    })}
                 </div>
              </div>
           </div>

           {/* Audio Station Details Card with Badges */}
           <div className="text-center space-y-2 px-4 w-full max-w-sm">
              {currentStation && renderChannelBadges(currentStation, true)}

              <h3 
                className="text-xl sm:text-2xl font-black tracking-tight leading-tight transition-all duration-150 text-white"
                style={{
                  textShadow: isPlaying ? `0 0 ${Math.round(5 + overallLevel * 15)}px ${activeTheme.primary}` : 'none'
                }}
              >
                 {currentStation?.name || 'Select a Station'}
              </h3>
              <p className="text-slate-300 text-xs max-w-sm mx-auto font-medium line-clamp-1">
                 {currentStation?.desc || 'Streaming high-fidelity sound with real-time frequency analysis.'}
              </p>
           </div>

           {/* DYNAMIC SOUND VISUALIZER DOCK (Bars / Wave / VU Meter) */}
           <div 
             className="w-full max-w-sm h-14 bg-[#080d1a]/80 backdrop-blur-md rounded-2xl border flex items-center justify-center gap-1 px-3 overflow-hidden relative shadow-lg transition-all"
             style={{
               borderColor: `rgba(${activeTheme.glowRaw}, 0.3)`,
               boxShadow: `0 0 ${Math.round(10 + overallLevel * 20)}px rgba(${activeTheme.glowRaw}, 0.2)`
             }}
           >
              {visualizerMode === 'vu' ? (
                /* Winamp Stereo Dual VU Meter */
                <div className="w-full flex flex-col justify-center gap-2 px-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black font-mono text-slate-400 w-3">L</span>
                    <div className="flex-1 h-3 bg-black/60 rounded-full overflow-hidden flex p-0.5 border border-white/10">
                      <div 
                        className="h-full rounded-full transition-all duration-75"
                        style={{
                          width: `${vuLeft}%`,
                          background: `linear-gradient(to right, ${activeTheme.primary} 0%, ${activeTheme.secondary} 70%, ${activeTheme.peak} 90%)`,
                          boxShadow: `0 0 10px ${activeTheme.primary}`
                        }}
                      />
                    </div>
                    <span className="text-[9px] font-mono font-bold" style={{ color: activeTheme.primary }}>
                      {Math.round(vuLeft)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black font-mono text-slate-400 w-3">R</span>
                    <div className="flex-1 h-3 bg-black/60 rounded-full overflow-hidden flex p-0.5 border border-white/10">
                      <div 
                        className="h-full rounded-full transition-all duration-75"
                        style={{
                          width: `${vuRight}%`,
                          background: `linear-gradient(to right, ${activeTheme.primary} 0%, ${activeTheme.secondary} 70%, ${activeTheme.peak} 90%)`,
                          boxShadow: `0 0 10px ${activeTheme.secondary}`
                        }}
                      />
                    </div>
                    <span className="text-[9px] font-mono font-bold" style={{ color: activeTheme.secondary }}>
                      {Math.round(vuRight)}%
                    </span>
                  </div>
                </div>
              ) : visualizerMode === 'wave' ? (
                /* Dynamic Oscilloscope Wave */
                <div className="w-full h-full flex items-center justify-between px-2">
                  {bottomWaveBars.map((val, idx) => {
                    const waveHeight = isPlaying ? Math.sin((phaseRef.current * 1.5) + idx * 0.25) * (val * 0.45) + (val * 0.5) : 6;
                    return (
                      <div 
                        key={idx}
                        className="w-1 rounded-full transition-all duration-75"
                        style={{
                          height: `${Math.max(6, Math.min(100, waveHeight))}%`,
                          background: idx % 2 === 0 ? activeTheme.primary : activeTheme.secondary,
                          boxShadow: isPlaying ? `0 0 8px ${activeTheme.primary}` : 'none',
                          opacity: isPlaying ? 0.9 : 0.3
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                /* 36-band Multi-Spectrum Visualizer Bars */
                <div className="w-full h-full flex items-end justify-between px-1 pb-1">
                  {bottomWaveBars.map((val, idx) => (
                    <div 
                      key={idx}
                      className="w-1 rounded-full transition-all duration-75"
                      style={{
                        height: isPlaying ? `${val}%` : '6px',
                        background: idx % 3 === 0 ? activeTheme.secondary : activeTheme.primary,
                        boxShadow: isPlaying ? `0 0 ${Math.round(3 + (val / 100) * 8)}px ${activeTheme.primary}` : 'none',
                        opacity: isPlaying ? 0.85 : 0.3
                      }}
                    />
                  ))}
                </div>
              )}
           </div>

           {/* TIMELINE / SCRUBBER SECTION */}
           {isSeekable ? (
             <div 
               className="w-full max-w-sm px-3 space-y-2 bg-[#080d1a]/70 backdrop-blur-md p-3.5 rounded-2xl border shadow-lg animate-in fade-in"
               style={{
                 borderColor: `rgba(${activeTheme.glowRaw}, 0.25)`
               }}
             >
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                   <div 
                     className="flex items-center gap-1 px-2 py-0.5 rounded border"
                     style={{
                       background: `rgba(${activeTheme.glowRaw}, 0.15)`,
                       borderColor: `rgba(${activeTheme.glowRaw}, 0.35)`,
                       color: activeTheme.primary
                     }}
                   >
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(currentTime)}</span>
                   </div>
                   <span className="text-[10px] text-slate-400 uppercase tracking-widest font-sans font-semibold">
                      {duration > 0 ? `${Math.round(progressPercentage)}%` : 'Loading...'}
                   </span>
                   <div className="flex items-center gap-1 text-slate-300 bg-white/5 px-2 py-0.5 rounded border border-white/10 font-mono">
                      <span>{duration > 0 ? formatTime(duration) : '--:--'}</span>
                   </div>
                </div>

                <div className="relative group/seek pt-1">
                   <input
                     type="range"
                     min={0}
                     max={duration > 0 ? duration : 100}
                     step={0.5}
                     value={currentTime}
                     onChange={handleProgressChange}
                     disabled={duration === 0}
                     className="w-full h-2 rounded-full appearance-none cursor-pointer transition-all focus:outline-none"
                     style={{
                       accentColor: activeTheme.primary,
                       background: `linear-gradient(to right, ${activeTheme.primary} 0%, ${activeTheme.secondary} ${progressPercentage}%, rgb(30, 41, 59) ${progressPercentage}%, rgb(30, 41, 59) 100%)`
                     }}
                   />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium px-1">
                   <span>0:00</span>
                   <span className="text-slate-400">Slide directly to any time</span>
                   <span>{duration > 0 ? `-${formatTime(Math.max(0, duration - currentTime))}` : ''}</span>
                </div>
             </div>
           ) : (
             <div className="w-full max-w-sm px-3.5 py-2.5 flex items-center justify-between bg-[#080d1a]/60 rounded-xl border border-white/10 text-xs">
                <div className="flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                   <span className="font-black text-red-400 tracking-wider text-[11px]">
                     {currentStation?.isGov ? 'AIR OFFICIAL BROADCAST' : 'LIVE BROADCAST'}
                   </span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 font-mono">
                  {currentStation?.streamURL.includes('.m3u8') ? 'HLS Stream' : 'Live Stream'}
                </span>
             </div>
           )}

           {/* CONTROLS */}
           <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 w-full max-w-md px-2">
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className={`transition-all p-2.5 sm:p-3 rounded-full bg-[#080d1a] border border-white/10 shadow-md ${isFavorite ? 'text-rose-500 bg-rose-500/10 border-rose-500/30 scale-110' : 'text-slate-400 hover:text-white'}`}
                title="Favorite"
              >
                 <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>

              {/* Backward 10s button for Dropbox / Seekable audio */}
              {isSeekable && (
                <button
                  onClick={() => handleSeek(-10)}
                  className="px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-2xl bg-[#080d1a] hover:bg-white/10 text-slate-300 border border-white/10 shadow-md transition-all active:scale-95 flex items-center gap-1 group"
                  title="Rewind 10 seconds"
                >
                  <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:-rotate-45 transition-transform" style={{ color: activeTheme.primary }} />
                  <span className="text-[10px] sm:text-xs font-black">-10s</span>
                </button>
              )}

              {/* Central Play / Pause Button with Theme Glow */}
              <button 
                onClick={togglePlay}
                disabled={isLoading}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-50 shrink-0 shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${activeTheme.primary} 0%, ${activeTheme.secondary} 100%)`,
                  boxShadow: `0 10px 40px rgba(${activeTheme.glowRaw}, ${0.5 + overallLevel * 0.4})`
                }}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                 {isLoading ? (
                   <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin text-black" />
                 ) : isPlaying ? (
                   <Pause className="h-7 w-7 sm:h-8 sm:w-8 fill-black text-black" />
                 ) : (
                   <Play className="h-7 w-7 sm:h-8 sm:w-8 fill-black text-black ml-1" />
                 )}
              </button>

              {/* Forward 10s button for Dropbox / Seekable audio */}
              {isSeekable && (
                <button
                  onClick={() => handleSeek(10)}
                  className="px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-2xl bg-[#080d1a] hover:bg-white/10 text-slate-300 border border-white/10 shadow-md transition-all active:scale-95 flex items-center gap-1 group"
                  title="Fast Forward 10 seconds"
                >
                  <span className="text-[10px] sm:text-xs font-black">+10s</span>
                  <RotateCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:rotate-45 transition-transform" style={{ color: activeTheme.primary }} />
                </button>
              )}
              
              {/* Volume Control */}
              <div className="flex items-center gap-2 bg-[#080d1a] px-3 py-2 sm:py-2.5 rounded-2xl border border-white/10 shadow-md">
                 <button onClick={() => setIsMuted(!isMuted)} className="text-slate-400 hover:text-white transition-colors">
                    {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : volume < 0.5 ? <Volume1 className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                 </button>
                 <input 
                   type="range" min="0" max="1" step="0.05"
                   value={isMuted ? 0 : volume}
                   onChange={(e) => setVolume(parseFloat(e.target.value))}
                   className="w-16 sm:w-20 transition-all duration-300 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer"
                   style={{ accentColor: activeTheme.primary }}
                 />
              </div>

              {/* Share */}
              <button 
                onClick={handleShare} 
                className="text-slate-400 hover:text-white transition-colors p-2.5 sm:p-3 rounded-full bg-[#080d1a] border border-white/10 shadow-md" 
                title="Share Station"
              >
                 <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
           </div>
        </div>

        {/* RIGHT PANEL: DEDICATED CHANNEL TABS (Govt AIR vs All Channels), SEARCH & LIBRARY (7 cols on lg) */}
        <div className={`lg:col-span-7 flex flex-col space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-500 h-[calc(100vh-170px)] lg:h-[700px] overflow-hidden ${activeTab === 'player' ? 'hidden lg:flex' : 'flex'}`}>
           
           {/* DEDICATED SOURCE TABS (ALL / GOVT AIR / COMMERCIAL / DROPBOX) */}
           <div className="flex items-center gap-1.5 p-1 bg-[#080d1a]/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-md overflow-x-auto scrollbar-none no-scrollbar shrink-0">
              <button
                onClick={() => { setChannelSourceTab('all'); setSelectedCategory('All'); }}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${channelSourceTab === 'all' ? 'text-black shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                style={channelSourceTab === 'all' ? { background: `linear-gradient(135deg, ${activeTheme.primary} 0%, ${activeTheme.secondary} 100%)` } : {}}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>All Channels</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-black/20">{allStations.length}</span>
              </button>

              <button
                onClick={() => { setChannelSourceTab('gov'); setSelectedCategory('All Govt'); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 border ${
                  channelSourceTab === 'gov' 
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 text-black border-amber-400 shadow-lg shadow-amber-500/30' 
                    : 'text-amber-300 hover:text-white border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20'
                }`}
              >
                <Landmark className="h-3.5 w-3.5 text-amber-400" />
                <span>Govt AIR Stations</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-black/30 text-amber-200 border border-amber-400/30">
                  {govStations.length}
                </span>
              </button>

              <button
                onClick={() => { setChannelSourceTab('commercial'); setSelectedCategory('All'); }}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${channelSourceTab === 'commercial' ? 'text-black shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                style={channelSourceTab === 'commercial' ? { background: `linear-gradient(135deg, ${activeTheme.primary} 0%, ${activeTheme.secondary} 100%)` } : {}}
              >
                <RadioIcon className="h-3.5 w-3.5" />
                <span>Commercial FM</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-black/20">{generalStations.length}</span>
              </button>

              <button
                onClick={() => { setChannelSourceTab('dropbox'); setSelectedCategory('All Dropbox'); }}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${channelSourceTab === 'dropbox' ? 'text-black shadow-md' : 'text-fuchsia-300 hover:text-white hover:bg-fuchsia-500/10'}`}
                style={channelSourceTab === 'dropbox' ? { background: `linear-gradient(135deg, #d946ef 0%, #818cf8 100%)` } : {}}
              >
                <Disc className="h-3.5 w-3.5" />
                <span>Dropbox Jukebox</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-black/20">{dropboxCount}</span>
              </button>
           </div>

           {/* SEARCH BOX & SMART SUGGESTIONS */}
           <div className="space-y-2 shrink-0 relative z-50">
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: activeTheme.primary }} />
                 <input 
                   type="text"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   placeholder={
                     channelSourceTab === 'gov' 
                       ? "Search 68 Akashvani, Rainbow, Gold, Vividh stations..." 
                       : "Search all 330 radio channels (Akashvani, FM Gold, Bollywood, etc.)..."
                   }
                   className="w-full bg-[#080d1a]/95 backdrop-blur-md border border-white/15 rounded-2xl py-3 pl-12 pr-12 outline-none text-xs sm:text-sm transition-all text-white placeholder-slate-400 shadow-lg focus:border-white/30"
                   style={{
                     boxShadow: `0 0 15px rgba(${activeTheme.glowRaw}, 0.1)`
                   }}
                 />
                 {search && (
                   <button
                     onClick={() => setSearch('')}
                     className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg transition-colors"
                   >
                     Clear
                   </button>
                 )}

                 {/* SMART AUTOCOMPLETE SUGGESTIONS DROPDOWN */}
                 {searchSuggestions.length > 0 && search.trim().length >= 2 && (
                   <div className="absolute top-full left-0 right-0 mt-2 bg-[#080d1a]/98 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
                      <div className="p-2 border-b border-white/10 bg-black/40 flex items-center justify-between">
                         <div className="flex items-center gap-1.5 px-2">
                           <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                           <span className="text-[10px] font-black uppercase tracking-wider text-white">Smart Match Suggestions</span>
                         </div>
                         <span className="text-[10px] text-slate-400 px-2">{searchSuggestions.length} found</span>
                      </div>
                      {searchSuggestions.map((s, idx) => (
                         <button
                           key={`${s.name}-${idx}`}
                           onClick={() => {
                             handlePlayStation(s);
                           }}
                           className="w-full flex items-center justify-between p-2.5 sm:p-3 hover:bg-white/10 transition-colors group text-left border-b border-white/5 last:border-0"
                         >
                            <div className="flex items-center gap-3 min-w-0">
                               {s.logo && s.logo.startsWith('http') ? (
                                 <img 
                                   src={s.logo} 
                                   alt={s.name} 
                                   className="h-9 w-9 rounded-xl object-cover shrink-0 shadow border border-white/10 group-hover:scale-105 transition-transform"
                                   onError={(e) => {
                                     (e.target as HTMLElement).style.display = 'none';
                                   }}
                                 />
                               ) : (
                                 <div 
                                   className="h-9 w-9 rounded-xl flex items-center justify-center text-black font-bold shrink-0 shadow-md group-hover:scale-105 transition-transform"
                                   style={{
                                     background: s.isGov ? 'linear-gradient(135deg, #f59e0b 0%, #10b981 100%)' : `linear-gradient(135deg, ${activeTheme.primary} 0%, ${activeTheme.secondary} 100%)`
                                   }}
                                 >
                                    {s.isGov ? <Landmark className="h-4 w-4 text-black" /> : <Music className="h-4 w-4 text-black" />}
                                 </div>
                               )}
                               <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-bold text-white group-hover:text-amber-200 transition-colors truncate">{s.name}</p>
                                    {renderChannelBadges(s)}
                                  </div>
                                  <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">
                                    {s.state ? `${s.state} • ` : ''}{s.language || 'Global'} • {s.desc || 'Audio Stream'}
                                  </p>
                                </div>
                            </div>
                            <Play className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity fill-current shrink-0" style={{ color: activeTheme.primary }} />
                         </button>
                      ))}
                   </div>
                 )}
              </div>

              {/* SMART SUGGESTION CHIPS (ONE-TAP SMART SEARCH) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
                <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1 mr-1">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>Smart Filters:</span>
                </span>
                {SMART_SUGGESTIONS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.type === 'gov') {
                        setChannelSourceTab('gov');
                        setSelectedCategory('All Govt');
                        setSearch('');
                      } else if (item.type === 'dropbox') {
                        setChannelSourceTab('dropbox');
                        setSelectedCategory('All Dropbox');
                        setSearch('');
                      } else {
                        setSearch(item.query);
                      }
                    }}
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
                      search.toLowerCase() === item.query.toLowerCase()
                        ? 'bg-amber-500 text-black border-amber-400 font-black shadow-md'
                        : 'bg-[#080d1a]/80 text-slate-300 hover:text-white border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* CATEGORY & REGION FILTER PILLS */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
                 {filterCategories.map(cat => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`shrink-0 px-3 py-1 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isSelected 
                          ? 'text-black shadow-md font-black' 
                          : 'bg-[#080d1a]/80 text-slate-300 hover:text-white border-white/10 hover:bg-white/10'
                        }`}
                        style={isSelected ? {
                          background: `linear-gradient(135deg, ${activeTheme.primary} 0%, ${activeTheme.secondary} 100%)`,
                          borderColor: activeTheme.primary,
                          boxShadow: `0 0 15px rgba(${activeTheme.glowRaw}, 0.4)`
                        } : {}}
                      >
                         <span>{cat}</span>
                      </button>
                    );
                 })}
              </div>
           </div>

           {/* COMPLETE LIST OF STATIONS WITH PROPER BADGES */}
           <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar pb-16 lg:pb-0">
              {filteredStations.length === 0 ? (
                 <div className="text-center py-16 bg-[#080d1a]/40 rounded-3xl border border-white/5">
                    <Music className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-white">No radio stations found</h4>
                    <p className="text-xs text-slate-400 mt-1">Try switching tabs or adjusting search query.</p>
                 </div>
              ) : (
                 filteredStations.map((station, idx) => {
                    const isSelected = currentStation?.streamURL === station.streamURL;
                    const isStationDropbox = station.streamURL.includes('dropbox.com');
                    return (
                       <button
                         key={`${station.name}-${station.id || idx}`}
                         onClick={() => handlePlayStation(station)}
                         className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all group text-left ${
                           isSelected 
                           ? 'shadow-lg' 
                           : 'bg-[#080d1a]/60 border-white/5 hover:bg-white/5 hover:border-white/20'
                         }`}
                         style={isSelected ? {
                           background: `linear-gradient(to right, rgba(${activeTheme.glowRaw}, 0.25) 0%, rgba(${activeTheme.glowRaw}, 0.1) 100%)`,
                           borderColor: activeTheme.primary,
                           boxShadow: `0 0 25px rgba(${activeTheme.glowRaw}, 0.25)`
                         } : {}}
                       >
                          <div className="flex items-center gap-3 min-w-0">
                             {/* Station Artwork or Icon */}
                             {station.logo && station.logo.startsWith('http') ? (
                               <div className="relative shrink-0">
                                 <img 
                                   src={station.logo} 
                                   alt={station.name}
                                   className={`h-11 w-11 rounded-2xl object-cover shadow-lg transition-transform group-hover:scale-105 border ${isSelected ? 'border-amber-400' : 'border-white/10'}`}
                                   onError={(e) => {
                                     (e.target as HTMLElement).style.display = 'none';
                                   }}
                                 />
                                 {isSelected && isPlaying && (
                                   <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                                     <Activity className="h-5 w-5 animate-pulse text-white" />
                                   </div>
                                 )}
                               </div>
                             ) : (
                               <div 
                                 className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-105"
                                 style={{
                                   background: isSelected 
                                     ? `linear-gradient(135deg, ${activeTheme.primary} 0%, ${activeTheme.secondary} 100%)` 
                                     : station.isGov
                                     ? 'linear-gradient(135deg, #b45309 0%, #047857 100%)'
                                     : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                   color: isSelected ? '#000' : '#fff'
                                 }}
                               >
                                  {isSelected && isPlaying ? (
                                     <Activity className="h-5 w-5 animate-pulse text-black" />
                                  ) : station.isGov ? (
                                     <Landmark className="h-5 w-5 text-amber-300" />
                                  ) : isStationDropbox ? (
                                     <Disc className="h-5 w-5 text-fuchsia-300" />
                                  ) : (
                                     <Music className="h-5 w-5 text-slate-300" />
                                  )}
                               </div>
                             )}

                             <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p 
                                    className="text-xs sm:text-sm font-bold truncate transition-colors"
                                    style={isSelected ? { color: activeTheme.primary, fontWeight: 900 } : { color: '#fff' }}
                                  >
                                     {station.name}
                                  </p>
                                  {renderChannelBadges(station)}
                                </div>
                                <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                                   {station.state ? `${station.state} • ` : ''}{station.desc || 'Audio Stream'}
                                </p>
                             </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-2">
                             <div 
                               className="h-8 w-8 rounded-full flex items-center justify-center transition-all shadow-md shrink-0"
                               style={isSelected ? {
                                 background: activeTheme.primary,
                                 color: '#000',
                                 boxShadow: `0 0 15px ${activeTheme.primary}`
                               } : {
                                 background: 'rgba(255, 255, 255, 0.08)',
                                 color: '#94a3b8'
                               }}
                             >
                                {isSelected && isPlaying ? (
                                  <Pause className="h-3.5 w-3.5 fill-current" />
                                ) : (
                                  <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                                )}
                              </div>
                          </div>
                       </button>
                    );
                 })
              )}
           </div>
        </div>
      </div>

      {/* Tab Switcher for Mobile Devices */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 flex items-center justify-center z-[100]">
         <div className="flex items-center bg-[#080d1a]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] w-full max-w-sm gap-1">
            <button 
              onClick={() => setActiveTab('player')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black tracking-wider transition-all ${activeTab === 'player' ? 'text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
              style={activeTab === 'player' ? {
                background: `linear-gradient(135deg, ${activeTheme.primary} 0%, ${activeTheme.secondary} 100%)`,
                boxShadow: `0 0 20px rgba(${activeTheme.glowRaw}, 0.5)`
              } : {}}
            >
               <Music className="h-3.5 w-3.5" />
               <span>PLAYER</span>
            </button>
            <button 
              onClick={() => { setActiveTab('library'); setChannelSourceTab('all'); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black tracking-wider transition-all ${activeTab === 'library' && channelSourceTab === 'all' ? 'text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
              style={activeTab === 'library' && channelSourceTab === 'all' ? {
                background: `linear-gradient(135deg, ${activeTheme.primary} 0%, ${activeTheme.secondary} 100%)`,
                boxShadow: `0 0 20px rgba(${activeTheme.glowRaw}, 0.5)`
              } : {}}
            >
               <LayoutGrid className="h-3.5 w-3.5" />
               <span>ALL (330)</span>
            </button>
            <button 
              onClick={() => { setActiveTab('library'); setChannelSourceTab('gov'); setSelectedCategory('All Govt'); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black tracking-wider transition-all ${activeTab === 'library' && channelSourceTab === 'gov' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/40' : 'text-amber-400 hover:text-white'}`}
            >
               <Landmark className="h-3.5 w-3.5" />
               <span>GOV AIR (68)</span>
            </button>
         </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.5); }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};
