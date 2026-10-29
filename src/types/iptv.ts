export interface ChannelStream {
  url: string;
  resolution: string;
  rawTitle: string;
  isGeoBlocked?: boolean;
  isNot247?: boolean;
  referrer?: string;
  userAgent?: string;
}

export interface Channel {
  id: string;
  name: string;
  category: string;
  language: string;
  streams: ChannelStream[];
}

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'buffering' | 'error';

export interface PlayerStats {
  resolution?: string;
  currentBitrate?: number;
  bufferLength?: number;
  droppedFrames?: number;
}
