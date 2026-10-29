import React, { useState } from 'react';
import { X, Download, ExternalLink, Check, ShieldAlert } from 'lucide-react';
import { CountryInfo } from '../types/iptv';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCountry: CountryInfo;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({
  isOpen,
  onClose,
  currentCountry,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const m3uUrl = `https://raw.githubusercontent.com/iptv-org/iptv/master/streams/${currentCountry.code}.m3u`;

  const handleCopy = () => {
    navigator.clipboard.writeText(m3uUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl">
            {currentCountry.flag}
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">
              {currentCountry.name} M3U Streams
            </h3>
            <p className="text-xs text-slate-400">
              iptv-org / streams / {currentCountry.code}.m3u
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-300">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Country / Territory:</span>
              <span className="text-white font-bold flex items-center gap-1.5">
                <span>{currentCountry.flag}</span>
                <span>{currentCountry.name} ({currentCountry.code.toUpperCase()})</span>
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Indexed Channels:</span>
              <span className="text-amber-400 font-bold">{currentCountry.channelCount} Channels</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Region:</span>
              <span className="text-slate-200">{currentCountry.region}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Repository:</span>
              <a
                href="https://github.com/iptv-org/iptv"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>github.com/iptv-org/iptv</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Direct Raw M3U Playlist URL:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={m3uUrl}
                className="flex-1 bg-slate-950 text-xs px-3 py-2 rounded-lg border border-slate-800 font-mono text-slate-300 select-all"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : null}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="bg-amber-950/20 border border-amber-800/40 p-3.5 rounded-xl text-xs text-amber-200/90 flex gap-2.5">
            <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-300">Playback & Compatibility Note:</p>
              <p className="leading-relaxed">
                Public IPTV streams are provided by individual broadcasters worldwide. Some streams may have geo-blocking or CORS header policies for browsers. If a channel fails to play, use the <strong>"Alternate Stream"</strong> button in the video controls to try backup CDN sources.
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <a
              href={`/data/countries/${currentCountry.code}.json`}
              download={`${currentCountry.code}-channels.json`}
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1.5 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download JSON</span>
            </a>
            <button
              onClick={onClose}
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
