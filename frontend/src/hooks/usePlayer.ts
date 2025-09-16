import { useCallback, useEffect, useRef } from 'react';
import { usePlayerStore } from '@/stores/player.store';
import { ContentDetails, StreamSource, Subtitle } from '@/types/content.types';

/**
 * Custom hook for video player functionality
 * Integrates with the player store and provides player controls
 */
export function usePlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const {
    content,
    sources,
    subtitles,
    isPlaying,
    isLoading,
    isFullscreen,
    volume,
    muted,
    currentTime,
    duration,
    buffered,
    quality,
    subtitleTrack,
    error,
    autoplay,
    
    // Actions
    setContent,
    setSources,
    setSubtitles,
    play,
    pause,
    // togglePlayPause,
    setCurrentTime,
    setDuration,
    setBuffered,
    setVolume,
    toggleMute,
    setQuality,
    setSubtitleTrack,
    setFullscreen,
    // toggleFullscreen,
    setLoading,
    setError,
    setAutoplay,
    reset,
  } = usePlayerStore();

  // Initialize player with content
  const initializePlayer = useCallback((
    newContent: ContentDetails,
    newSources: StreamSource[],
    newSubtitles: Subtitle[] = []
  ) => {
    setContent(newContent);
    setSources(newSources);
    setSubtitles(newSubtitles);
    setError(null);
  }, [setContent, setSources, setSubtitles, setError]);

  // Play video
  const handlePlay = useCallback(async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.play();
        play();
      } catch (error) {
        setError('Failed to play video');
        console.error('Play error:', error);
      }
    }
  }, [play, setError]);

  // Pause video
  const handlePause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      pause();
    }
  }, [pause]);

  // Toggle play/pause
  const handleTogglePlayPause = useCallback(() => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  }, [isPlaying, handlePlay, handlePause]);

  // Seek to specific time
  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, [setCurrentTime]);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setVolume(newVolume);
    }
  }, [setVolume]);

  // Handle mute toggle
  const handleToggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted;
      videoRef.current.muted = newMuted;
      toggleMute();
    }
  }, [toggleMute]);

  // Handle fullscreen toggle
  const handleToggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        if (videoRef.current?.requestFullscreen) {
          await videoRef.current.requestFullscreen();
          setFullscreen(true);
        }
      } catch (error) {
        console.error('Fullscreen error:', error);
      }
    } else {
      try {
        await document.exitFullscreen();
        setFullscreen(false);
      } catch (error) {
        console.error('Exit fullscreen error:', error);
      }
    }
  }, [setFullscreen]);

  // Handle quality change
  const handleQualityChange = useCallback((newQuality: string) => {
    setQuality(newQuality);
    // In a real implementation, this would switch video sources
    // For now, just update the store
  }, [setQuality]);

  // Handle subtitle track change
  const handleSubtitleChange = useCallback((track: string | null) => {
    setSubtitleTrack(track);
    // In a real implementation, this would enable/disable subtitle tracks
    // For now, just update the store
  }, [setSubtitleTrack]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => setLoading(true);
    const handleCanPlay = () => setLoading(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleVolumeChangeEvent = () => {
      setVolume(video.volume);
    };
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (duration > 0) {
          setBuffered((bufferedEnd / duration) * 100);
        }
      }
    };
    const handleError = () => {
      setError('Video playback error');
      setLoading(false);
    };

    // Add event listeners
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('volumechange', handleVolumeChangeEvent);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('error', handleError);

    // Cleanup
    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('volumechange', handleVolumeChangeEvent);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('error', handleError);
    };
  }, [setLoading, setCurrentTime, setDuration, setVolume, setBuffered, setError]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [setFullscreen]);

  return {
    // Refs
    videoRef,
    
    // State
    content,
    sources,
    subtitles,
    isPlaying,
    isLoading,
    isFullscreen,
    volume,
    muted,
    currentTime,
    duration,
    buffered,
    quality,
    subtitleTrack,
    error,
    autoplay,
    
    // Actions
    initializePlayer,
    play: handlePlay,
    pause: handlePause,
    togglePlayPause: handleTogglePlayPause,
    seek: handleSeek,
    setVolume: handleVolumeChange,
    toggleMute: handleToggleMute,
    setQuality: handleQualityChange,
    setSubtitleTrack: handleSubtitleChange,
    toggleFullscreen: handleToggleFullscreen,
    setAutoplay,
    reset,
    
    // Utility
    formatTime: (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    },
  };
}