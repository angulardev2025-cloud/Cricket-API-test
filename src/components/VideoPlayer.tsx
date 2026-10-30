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

  const currentStream: ChannelStream | undefined = channel?.streams[activeStreamIndex];

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
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
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
      className={`relative w-full overflow-hidden bg-black group select-none ${
        isFullscreen ? 'h-screen w-screen' : isFloatingPiP ? 'h-full w-full' : 'aspect-video rounded-xl border border-slate-800 shadow-2xl'
      }`}
    >
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
          <p className="text-zinc-500 text-sm mt-1">Click to stream live</p>
        </div>
      )}

      <video
        ref={videoRef}
        onClick={togglePlay}
        className="w-full h-full bg-black cursor-pointer"
        playsInline
      />

      {/* Simplified Bottom Bar (YouTube Style) */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-2 sm:p-4 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 z-30 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button 
                onClick={onPrevChannel} 
                className="text-white/60 hover:text-white transition-colors p-1"
                title="Previous channel"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              <button onClick={togglePlay} className="text-white hover:scale-110 transition-transform p-1">
                {isPlaying ? <Pause className="h-5 w-5 sm:h-6 sm:w-6 fill-current" /> : <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />}
              </button>

              <button 
                onClick={onNextChannel} 
                className="text-white/60 hover:text-white transition-colors p-1"
                title="Next channel"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 group/vol shrink-0">
              <button onClick={toggleMute} className="text-white/80 hover:text-white p-1">
                {isMuted || volume === 0 ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
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
                className="w-0 group-hover/vol:w-16 sm:group-hover/vol:w-20 transition-all duration-300 h-1 accent-red-600 appearance-none bg-white/30 rounded-full cursor-pointer"
              />
              
              {/* Resolution Badge */}
              {currentStream?.resolution && (
                <span className="text-[9px] sm:text-[10px] font-bold bg-white/10 text-white border border-white/20 px-1.5 py-0.5 rounded uppercase shrink-0">
                  {currentStream.resolution}
                </span>
              )}
            </div>
            
            {!isFloatingPiP && (
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                 <span className="text-white text-xs sm:text-sm font-bold truncate max-w-[80px] sm:max-w-[200px]">
                   {channel?.name}
                 </span>
                 <div className="hidden xs:flex items-center gap-1 text-[8px] sm:text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold shrink-0">
                   <Radio className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                   <span>LIVE</span>
                 </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {channel && channel.streams.length > 1 && (
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`text-white/80 hover:text-white transition-all p-1 ${showSettings ? 'rotate-45 text-red-500' : ''}`}
                title="Select Source"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}

            <button 
              onClick={handleCast}
              className="text-white/80 hover:text-white transition-all p-1"
              title="Cast to TV"
            >
              <Cast className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <button 
              onClick={handlePiP}
              className="text-white/80 hover:text-white transition-all p-1"
              title="Picture-in-Picture mode"
            >
              <PictureInPicture2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {!isFloatingPiP && (
              <>
                <button 
                  onClick={onToggleFavorite}
                  className={`transition-all p-1 ${isFavorite ? 'text-amber-400 scale-110' : 'text-white/60 hover:text-white'}`}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Sparkles className={`h-4 w-4 sm:h-5 sm:w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                
                <button onClick={toggleFullscreen} className="text-white/80 hover:text-white p-1">
                  {isFullscreen ? <Minimize className="h-4 w-4 sm:h-5 sm:w-5" /> : <Maximize className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Settings Overlay (Source Picker) */}
      {showSettings && (
        <div className="absolute bottom-12 sm:bottom-16 right-2 sm:right-4 glass-panel p-2 rounded-xl z-50 border border-white/10 w-40 sm:w-48 shadow-2xl animate-in slide-in-from-bottom-2">
          <p className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase px-3 py-1">Select Source</p>
          <div className="space-y-1">
            {channel?.streams.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveStreamIndex(idx);
                  setShowSettings(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-[10px] sm:text-xs transition-colors ${
                  activeStreamIndex === idx ? 'bg-red-600 text-white font-bold' : 'text-zinc-300 hover:bg-white/10'
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
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
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
            className="mt-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] sm:text-xs flex items-center gap-2 border border-white/5"
          >
            <RotateCcw className="h-3 w-3" />
            Retry
          </button>
        </div>
      )}
    </div>
  );
};
