import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { PlayerState } from '@/types/player.types';
import { StreamSource, Subtitle } from '@/types/content.types';
import { ContentDetails } from '@/types/content.types';

interface PlayerStoreState extends PlayerState {
  // Content and sources
  content: ContentDetails | null;
  sources: StreamSource[];
  subtitles: Subtitle[];
  
  // Player settings
  autoplay: boolean;
  
  // Actions
  setContent: (content: ContentDetails | null) => void;
  setSources: (sources: StreamSource[]) => void;
  setSubtitles: (subtitles: Subtitle[]) => void;
  
  // Playback controls
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setBuffered: (buffered: number) => void;
  
  // Volume controls
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  
  // Quality and subtitles
  setQuality: (quality: string) => void;
  setSubtitleTrack: (track: string | null) => void;
  
  // Fullscreen
  setFullscreen: (isFullscreen: boolean) => void;
  toggleFullscreen: () => void;
  
  // Loading and error states
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Settings
  setAutoplay: (autoplay: boolean) => void;
  
  // Utility actions
  reset: () => void;
}

const initialState = {
  content: null,
  sources: [],
  subtitles: [],
  isPlaying: false,
  isLoading: false,
  isFullscreen: false,
  volume: 1,
  muted: false,
  currentTime: 0,
  duration: 0,
  buffered: 0,
  quality: 'auto',
  subtitleTrack: null,
  error: null,
  autoplay: false,
};

export const usePlayerStore = create<PlayerStoreState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // Content setters
      setContent: (content) => set({ content }),
      setSources: (sources) => set({ sources }),
      setSubtitles: (subtitles) => set({ subtitles }),
      
      // Playback controls
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      togglePlayPause: () => {
        const { isPlaying } = get();
        set({ isPlaying: !isPlaying });
      },
      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration }),
      setBuffered: (buffered) => set({ buffered }),
      
      // Volume controls
      setVolume: (volume) => {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        set({ 
          volume: clampedVolume,
          muted: clampedVolume === 0,
        });
      },
      toggleMute: () => {
        const { muted, volume } = get();
        if (muted) {
          set({ muted: false, volume: volume > 0 ? volume : 0.5 });
        } else {
          set({ muted: true });
        }
      },
      
      // Quality and subtitles
      setQuality: (quality) => set({ quality }),
      setSubtitleTrack: (track) => set({ subtitleTrack: track }),
      
      // Fullscreen
      setFullscreen: (isFullscreen) => set({ isFullscreen }),
      toggleFullscreen: () => {
        const { isFullscreen } = get();
        set({ isFullscreen: !isFullscreen });
      },
      
      // Loading and error states
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      // Settings
      setAutoplay: (autoplay) => set({ autoplay }),
      
      // Utility actions
      reset: () => set(initialState),
    }),
    {
      name: 'player-store',
    }
  )
);