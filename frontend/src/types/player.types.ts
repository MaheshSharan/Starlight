import { StreamSource, Subtitle } from './content.types';

// Player configuration
export interface PlayerConfig {
  sources: StreamSource[];
  subtitles: Subtitle[];
  autoplay: boolean;
  controls: boolean;
  responsive: boolean;
  volume: number;
  muted: boolean;
  currentTime: number;
  duration: number;
}

// Player state
export interface PlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  isFullscreen: boolean;
  volume: number;
  muted: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  quality: string;
  subtitleTrack: string | null;
  error: string | null;
}

// Player events
export interface PlayerEvents {
  onPlay: () => void;
  onPause: () => void;
  onTimeUpdate: (currentTime: number) => void;
  onDurationChange: (duration: number) => void;
  onVolumeChange: (volume: number) => void;
  onQualityChange: (quality: string) => void;
  onSubtitleChange: (track: string | null) => void;
  onFullscreenChange: (isFullscreen: boolean) => void;
  onError: (error: string) => void;
}

// Player controls
export interface PlayerControls {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setQuality: (quality: string) => void;
  setSubtitleTrack: (track: string | null) => void;
  toggleFullscreen: () => void;
}