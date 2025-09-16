// Streaming and Player Types

import { ContentDetails } from './content.types';

// Stream Source interface
export interface StreamSource {
  url: string;
  quality: StreamQuality;
  type: StreamType;
  provider: string;
  language?: string;
  size?: number; // File size in bytes
  headers?: Record<string, string>; // Custom headers for the stream
}

// Stream Quality options
export type StreamQuality = '360p' | '480p' | '720p' | '1080p' | '1440p' | '2160p' | '4K' | 'auto';

// Stream Type options
export type StreamType = 'mp4' | 'hls' | 'dash' | 'webm' | 'mkv';

// Subtitle interface
export interface Subtitle {
  url: string;
  language: string;
  label: string;
  default: boolean;
  format: SubtitleFormat;
}

// Subtitle format options
export type SubtitleFormat = 'vtt' | 'srt' | 'ass' | 'ssa';

// Player Configuration
export interface PlayerConfig {
  sources: StreamSource[];
  subtitles: Subtitle[];
  poster?: string;
  autoplay: boolean;
  controls: boolean;
  responsive: boolean;
  muted: boolean;
  loop: boolean;
  preload: 'none' | 'metadata' | 'auto';
  crossorigin?: 'anonymous' | 'use-credentials';
  playbackRates: number[];
  defaultQuality?: StreamQuality;
  preferredLanguage?: string;
}

// Player Data interface combining content and streaming info
export interface PlayerData {
  content: ContentDetails;
  sources: StreamSource[];
  subtitles: Subtitle[];
  config: PlayerConfig;
}

// Streaming Provider interface
export interface StreamingProvider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  priority: number; // Lower number = higher priority
  supportedQualities: StreamQuality[];
  supportedTypes: StreamType[];
  rateLimit?: {
    requests: number;
    window: number; // in milliseconds
  };
}

// Stream Request interface
export interface StreamRequest {
  contentId: number;
  contentType: 'movie' | 'tv';
  season?: number; // For TV shows
  episode?: number; // For TV shows
  preferredQuality?: StreamQuality;
  preferredLanguage?: string;
}

// Stream Response interface
export interface StreamResponse {
  success: boolean;
  sources: StreamSource[];
  subtitles: Subtitle[];
  provider: string;
  cached: boolean;
  expiresAt?: Date;
}

// Episode Stream Request for TV shows
export interface EpisodeStreamRequest extends StreamRequest {
  season: number;
  episode: number;
}

// Stream Cache Entry
export interface StreamCacheEntry {
  contentId: number;
  contentType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  sources: StreamSource[];
  subtitles: Subtitle[];
  provider: string;
  createdAt: Date;
  expiresAt: Date;
}

// Stream Analytics for tracking popular content
export interface StreamAnalytics {
  id?: number;
  contentId: number;
  contentType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  provider: string;
  quality: StreamQuality;
  success: boolean;
  errorMessage?: string;
  responseTime: number; // in milliseconds
  createdAt?: Date;
}

// Player State interface for frontend
export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  fullscreen: boolean;
  currentQuality: StreamQuality;
  currentSubtitle?: string; // Language code
  buffered: Array<{ start: number; end: number }> | null; // Simplified buffered ranges
  loading: boolean;
  error?: string;
}

// Player Events
export type PlayerEvent = 
  | 'play'
  | 'pause'
  | 'ended'
  | 'timeupdate'
  | 'volumechange'
  | 'fullscreenchange'
  | 'qualitychange'
  | 'subtitlechange'
  | 'error'
  | 'loadstart'
  | 'loadeddata'
  | 'canplay'
  | 'canplaythrough'
  | 'waiting'
  | 'seeking'
  | 'seeked';

// Player Event Handler
export interface PlayerEventHandler {
  event: PlayerEvent;
  handler: (data?: any) => void;
}

// Stream Validation Result
export interface StreamValidationResult {
  valid: boolean;
  accessible: boolean;
  quality: StreamQuality;
  duration?: number;
  error?: string;
}