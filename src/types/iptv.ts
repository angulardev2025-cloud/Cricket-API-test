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

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  region: string;
  channelCount: number;
}

export interface CountryData extends CountryInfo {
  channels: Channel[];
}

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'buffering' | 'error';
