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
  Settings,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Tv,
  PictureInPicture2,
  Cast
} from 'lucide-react';

interface VideoPlayerProps {
  channel: Channel | null;
  onPrevChannel: () => void;
  onNextChannel: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onTogglePiP: () => void;
  isFloatingPiP?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  channel,
  onPrevChannel,
  onNextChannel,
  isFavorite,
  onToggleFavorite,
  onTogglePiP,
  isFloatingPiP = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isStreamLoaded, setIsStreamLoaded] = useState<boolean>(false);
  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeStreamIndex, setActiveStreamIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Gesture handling state refs
  const lastTapRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const [gestureFeedback, setGestureFeedback] = useState<string | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStream: ChannelStream | undefined = channel?.streams[activeStreamIndex];

  // Sync native fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    setActiveStreamIndex(0);
    setErrorMessage(null);
    setIsStreamLoaded(false);
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, [channel?.id]);

  const loadStream = useCallback((streamUrl: string) => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    setStatus('loading');
    setErrorMessage(null);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus('playing');
        video.play().catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => setIsPlaying(false));
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setErrorMessage('Connection error. Try another source.');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setStatus('error');
              setErrorMessage('Stream unavailable.');
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play();
        });
        setStatus('playing');
      });
    }
  }, []);

  useEffect(() => {
    if (isStreamLoaded && currentStream?.url) {
      loadStream(currentStream.url);
    }
  }, [isStreamLoaded, currentStream?.url, loadStream]);

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

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
      triggerFeedback('Fullscreen');
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
      triggerFeedback('Exit Fullscreen');
    }
  };

  const triggerFeedback = (text: string) => {
    setGestureFeedback(text);
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => {
      setGestureFeedback(null);
    }, 1200);
  };

  // Mobile gesture handling: double tap to fullscreen, swipe up/down
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_THRESHOLD = 300;

    // Check vertical swipe gesture for fullscreen
    if (e.changedTouches.length > 0) {
      const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
      if (deltaY < -60) {
        // Swiped UP -> Enter Fullscreen
        if (!document.fullscreenElement && containerRef.current) {
          containerRef.current.requestFullscreen().catch(() => {});
          setIsFullscreen(true);
          triggerFeedback('Swipe: Fullscreen');
          return;
        }
      } else if (deltaY > 60) {
        // Swiped DOWN -> Exit Fullscreen
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
          setIsFullscreen(false);
          triggerFeedback('Swipe: Windowed');
          return;
        }
      }
    }

    // Check double tap gesture
    if (now - lastTapRef.current < DOUBLE_TAP_THRESHOLD) {
      toggleFullscreen();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      // Single tap: toggle controls visibility
      setShowControls(prev => !prev);
    }
  };

  const handlePiP = async () => {
    try {
      const video = videoRef.current;
      if (!video) return;
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      } else {
        onTogglePiP();
      }
    } catch {
      onTogglePiP();
    }
  };

  const handleCast = () => {
    alert("Casting: Searching for Chromecast & AirPlay displays...");
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSettings) setShowControls(false);
    }, 3000);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full overflow-hidden bg-black group select-none ${
        isFullscreen ? 'h-screen w-screen' : isFloatingPiP ? 'h-full w-full' : 'aspect-video rounded-xl border border-slate-800 shadow-2xl'
      }`}
    >
      {/* Top Overlay Badge Bar (Placed away from bottom controls to prevent any overlap on mobile) */}
      <div className="absolute top-2.5 sm:top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none transition-opacity duration-300">
        <div className="flex items-center gap-2 pointer-events-auto">
          {!isFloatingPiP && (
            <span className="text-[11px] sm:text-xs font-bold bg-black/70 backdrop-blur-md text-white border border-white/20 px-2.5 py-1 rounded-xl shadow-lg truncate max-w-[150px] sm:max-w-[280px]">
              {channel?.name || 'Live Stream'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Resolution Badge - cleanly positioned at top right */}
          {currentStream?.resolution && (
            <span className="text-[10px] sm:text-xs font-black bg-black/75 backdrop-blur-md text-amber-400 border border-amber-500/40 px-2.5 py-0.5 rounded-lg uppercase shadow-lg">
              {currentStream.resolution}
            </span>
          )}
          <div className="flex items-center gap-1 text-[9px] sm:text-[10px] bg-red-600/90 backdrop-blur-md text-white px-2 py-0.5 rounded-lg font-bold shadow-lg">
            <Radio className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-pulse" />
            <span>LIVE</span>
          </div>
        </div>
      </div>

      {/* Gesture Feedback Toast */}
      {gestureFeedback && (
        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none animate-in fade-in zoom-in-95">
          <div className="bg-black/85 backdrop-blur-xl border border-white/20 text-white font-extrabold text-sm sm:text-base px-5 py-2.5 rounded-2xl shadow-2xl">
            {gestureFeedback}
          </div>
        </div>
      )}

      {/* Youtube Style Poster */}
      {!isStreamLoaded && (
        <div 
          onClick={() => setIsStreamLoaded(true)}
          className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 cursor-pointer z-40 group/poster"
        >
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-center justify-center">
             <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-2xl">
               <Play className="h-8 w-8 text-white fill-current" />
             </div>
          </div>
          <Tv className="h-16 w-16 text-zinc-800 mb-4" />
          <h2 className="text-xl font-bold text-zinc-300">{channel?.name}</h2>
          <p className="text-zinc-500 text-sm mt-1">Tap to stream live</p>
        </div>
      )}

      <video
        ref={videoRef}
        onClick={togglePlay}
        className="w-full h-full bg-black cursor-pointer object-contain"
        playsInline
      />

      {/* Bottom Bar: Touch-optimized, enlarged touch targets (min 44px on mobile) */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-2.5 sm:p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent transition-opacity duration-300 z-30 ${
          showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between gap-1 sm:gap-4">
          {/* Left Controls: Touch Friendly Playback */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onPrevChannel(); }} 
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full text-white/70 hover:text-white active:bg-white/10 active:scale-95 transition-all"
              title="Previous channel"
              aria-label="Previous channel"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
              className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white active:scale-90 transition-all shadow-md"
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-5 w-5 sm:h-6 sm:w-6 fill-current" /> : <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-current ml-0.5" />}
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); onNextChannel(); }} 
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full text-white/70 hover:text-white active:bg-white/10 active:scale-95 transition-all"
              title="Next channel"
              aria-label="Next channel"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Mute & Volume with wide touch target */}
            <div className="flex items-center gap-1 group/vol">
              <button 
                onClick={(e) => { e.stopPropagation(); toggleMute(); }} 
                className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full text-white/80 hover:text-white active:bg-white/10 active:scale-95 transition-all"
                title={isMuted ? 'Unmute' : 'Mute'}
                aria-label="Mute / Unmute"
              >
                {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  if (videoRef.current) videoRef.current.volume = v;
                }}
                className="w-0 group-hover/vol:w-16 sm:group-hover/vol:w-20 transition-all duration-300 h-1.5 accent-red-600 appearance-none bg-white/30 rounded-full cursor-pointer hidden xs:block"
                aria-label="Volume slider"
              />
            </div>
          </div>

          {/* Right Action Controls: Generous 44px touch targets */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {channel && channel.streams.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full text-white/80 hover:text-white active:bg-white/10 active:scale-95 transition-all ${showSettings ? 'rotate-45 text-red-500 bg-white/10' : ''}`}
                title="Select Source"
                aria-label="Select Source"
              >
                <Settings className="h-5 w-5" />
              </button>
            )}

            <button 
              onClick={(e) => { e.stopPropagation(); handleCast(); }}
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full text-white/80 hover:text-white active:bg-white/10 active:scale-95 transition-all"
              title="Cast to TV"
              aria-label="Cast to TV"
            >
              <Cast className="h-5 w-5" />
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); handlePiP(); }}
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full text-white/80 hover:text-white active:bg-white/10 active:scale-95 transition-all"
              title="Picture-in-Picture mode"
              aria-label="Picture-in-Picture"
            >
              <PictureInPicture2 className="h-5 w-5" />
            </button>

            {!isFloatingPiP && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                  className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full active:bg-white/10 active:scale-95 transition-all ${isFavorite ? 'text-amber-400' : 'text-white/70 hover:text-white'}`}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  aria-label="Favorite channel"
                >
                  <Sparkles className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} 
                  className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full text-white/80 hover:text-white active:bg-white/10 active:scale-95 transition-all"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (Double-tap / Swipe up)'}
                  aria-label="Fullscreen"
                >
                  {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Settings Overlay (Source Picker) */}
      {showSettings && (
        <div className="absolute bottom-14 sm:bottom-16 right-2 sm:right-4 glass-panel p-2.5 rounded-2xl z-50 border border-white/15 w-44 sm:w-52 shadow-2xl animate-in slide-in-from-bottom-2">
          <p className="text-[10px] font-extrabold text-zinc-400 uppercase px-3 py-1 tracking-wider">Select Stream Source</p>
          <div className="space-y-1">
            {channel?.streams.map((s, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveStreamIndex(idx);
                  setShowSettings(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  activeStreamIndex === idx ? 'bg-red-600 text-white shadow-md' : 'text-zinc-300 hover:bg-white/10'
                }`}
              >
                Source {idx + 1} {s.resolution ? `(${s.resolution})` : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Buffering/Loading */}
      {isStreamLoaded && (status === 'loading' || status === 'buffering') && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20 pointer-events-none">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error Overlay */}
      {isStreamLoaded && errorMessage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 z-50 text-center p-4 sm:p-6">
          <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-red-500 mb-3" />
          <p className="text-white text-xs sm:text-sm font-medium">{errorMessage}</p>
          <button 
            onClick={() => loadStream(currentStream!.url)}
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs flex items-center gap-2 border border-white/5 active:scale-95 transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            Retry Stream
          </button>
        </div>
      )}
    </div>
  );
};
