import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { Channel, ChannelStream, PlaybackStatus } from '../types/iptv';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  AlertTriangle,
  Radio,
  Layers,
  PictureInPicture2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface VideoPlayerProps {
  channel: Channel | null;
  onPrevChannel: () => void;
  onNextChannel: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  channel,
  onPrevChannel,
  onNextChannel,
  isFavorite,
  onToggleFavorite,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeStreamIndex, setActiveStreamIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<'contain' | 'cover' | 'fill'>('contain');
  const [showControls, setShowControls] = useState<boolean>(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStream: ChannelStream | undefined = channel?.streams[activeStreamIndex];

  // Reset stream index when channel changes
  useEffect(() => {
    setActiveStreamIndex(0);
    setErrorMessage(null);
  }, [channel?.id]);

  // Load and play HLS stream
  const loadStream = useCallback((streamUrl: string) => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    setStatus('loading');
    setErrorMessage(null);

    // Destroy previous HLS instance if any
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Try HLS.js first
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        manifestLoadingTimeOut: 12000,
        manifestLoadingMaxRetry: 2,
        levelLoadingTimeOut: 12000,
        levelLoadingMaxRetry: 2,
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus('playing');
        video.play().catch(() => {
          // Autoplay policy may require user interaction or mute
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {
            setIsPlaying(false);
          });
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setErrorMessage('Network / CORS error loading stream. The broadcaster may restrict web playback or require specific headers.');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setErrorMessage('Media decoding error occurred. Attempting stream recovery...');
              hls.recoverMediaError();
              break;
            default:
              setErrorMessage(`Stream playback halted: ${data.details}`);
              hls.destroy();
              setStatus('error');
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari/iOS support
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => setIsPlaying(false));
        });
        setStatus('playing');
      });

      video.addEventListener('error', () => {
        setStatus('error');
        setErrorMessage('Failed to decode native HLS video stream.');
      });
    } else {
      setStatus('error');
      setErrorMessage('Your browser does not support HLS video streaming.');
    }
  }, []);

  useEffect(() => {
    if (currentStream?.url) {
      loadStream(currentStream.url);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentStream?.url, loadStream]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setStatus('buffering');
    const handlePlaying = () => setStatus('playing');

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
    };
  }, []);

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyM') {
        toggleMute();
      } else if (e.code === 'KeyF') {
        toggleFullscreen();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        onNextChannel();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        onPrevChannel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {
        video.muted = true;
        setIsMuted(true);
        video.play();
      });
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;
    video.volume = val;
    setVolume(val);
    if (val === 0) {
      video.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch {
      // PiP not supported or blocked
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3500);
  };

  const handleNextStreamOption = () => {
    if (!channel || channel.streams.length <= 1) return;
    const nextIdx = (activeStreamIndex + 1) % channel.streams.length;
    setActiveStreamIndex(nextIdx);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800 group select-none ${
        isFullscreen ? 'h-screen w-screen rounded-none' : 'aspect-video max-h-[70vh]'
      }`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className={`w-full h-full object-${aspectRatio} bg-black`}
        playsInline
      />

      {/* Top Overlay Badge Bar */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 z-20 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-red-600/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-sm">
            <Radio className="h-3.5 w-3.5 live-dot" />
            <span>LIVE</span>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-slate-700/60 flex items-center gap-2">
            <span className="font-extrabold text-sm sm:text-base text-white tracking-wide">
              {channel?.name || 'Select a Channel'}
            </span>
            {currentStream?.resolution && (
              <span className="text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
                {currentStream.resolution}
              </span>
            )}
          </div>

          {channel && (
            <span className="hidden sm:inline-block text-xs font-medium bg-slate-800/80 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
              {channel.language} • {channel.category}
            </span>
          )}
        </div>

        {/* Favorite & Quick Switcher */}
        {channel && (
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded-full border backdrop-blur-md transition-all ${
                isFavorite
                  ? 'bg-amber-500 text-black border-amber-400 font-bold'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-800'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Sparkles className="h-4 w-4" />
            </button>
            <button
              onClick={onPrevChannel}
              className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md transition-all"
              title="Previous channel (Arrow Left)"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={onNextChannel}
              className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md transition-all"
              title="Next channel (Arrow Right)"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Buffering Spinner */}
      {status === 'loading' || status === 'buffering' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none z-10">
          <div className="h-12 w-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mb-3"></div>
          <span className="text-sm font-medium text-slate-200 tracking-wider">
            Connecting to live broadcast stream...
          </span>
        </div>
      ) : null}

      {/* Error & Stream Fallback Panel */}
      {status === 'error' || errorMessage ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-6 text-center z-15">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-3" />
          <h4 className="text-lg font-bold text-white mb-2">Stream Playback Warning</h4>
          <p className="text-sm text-slate-300 max-w-md mb-4 leading-relaxed">
            {errorMessage || 'Unable to play this stream directly in browser.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {channel && channel.streams.length > 1 && (
              <button
                onClick={handleNextStreamOption}
                className="btn-gradient-success bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
              >
                <Layers className="h-4 w-4" />
                <span>
                  Switch to Alternate Stream ({activeStreamIndex + 1}/{channel.streams.length})
                </span>
              </button>
            )}

            <button
              onClick={() => currentStream?.url && loadStream(currentStream.url)}
              className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-2 rounded-xl text-sm flex items-center gap-2 border border-slate-700 transition-all"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Retry Stream</span>
            </button>

            {currentStream?.url && (
              <a
                href={currentStream.url}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-medium px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-800"
              >
                <span>Direct Link</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      ) : null}

      {/* Alternate Stream Switcher Floating Button if multiple streams exist */}
      {channel && channel.streams.length > 1 && !errorMessage && (
        <div className="absolute top-20 right-4 z-20">
          <button
            onClick={handleNextStreamOption}
            className="glass-panel text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-200 hover:text-white border border-slate-700 hover:border-amber-500 flex items-center gap-1.5 shadow-md transition-all"
            title="Switch stream source / resolution"
          >
            <Layers className="h-3.5 w-3.5 text-amber-400" />
            <span>
              Source {activeStreamIndex + 1}/{channel.streams.length}
            </span>
          </button>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between transition-opacity duration-300 z-20 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Play/Pause & Volume */}
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="p-3 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-transform hover:scale-105 shadow-lg"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
          </button>

          <div className="flex items-center gap-2 group/vol">
            <button
              onClick={toggleMute}
              className="p-2 text-slate-300 hover:text-white transition-colors"
              title="Mute / Unmute (M)"
            >
              {isMuted || volume === 0 ? <VolumeX className="h-5 w-5 text-red-400" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 sm:w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        </div>

        {/* Video Settings & Fullscreen */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Aspect Ratio Switcher */}
          <button
            onClick={() => {
              const nextRatio = aspectRatio === 'contain' ? 'cover' : aspectRatio === 'cover' ? 'fill' : 'contain';
              setAspectRatio(nextRatio);
            }}
            className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all uppercase"
            title="Aspect Ratio"
          >
            {aspectRatio}
          </button>

          {/* Picture in Picture */}
          <button
            onClick={togglePiP}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            title="Picture-in-Picture"
          >
            <PictureInPicture2 className="h-4 w-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            title="Fullscreen (F)"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
