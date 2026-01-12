import { useCallback, useEffect, useRef } from 'react';
import { useYouTubePlayer } from './useYouTubePlayer';
import { DeckState, Track, LoopSettings } from '@/types/dj';

interface UseDeckOptions {
  deckId: 'A' | 'B';
  onStateChange: (state: Partial<DeckState>) => void;
  onEnded: () => void;
}

export const useDeck = ({ deckId, onStateChange, onEnded }: UseDeckOptions) => {
  const containerId = `youtube-player-${deckId}`;
  const loopRef = useRef<LoopSettings | null>(null);
  const currentTimeRef = useRef(0);

  const handleTimeUpdate = useCallback((time: number) => {
    currentTimeRef.current = time;
    onStateChange({ currentTime: time });

    // Handle loop
    if (loopRef.current && time >= loopRef.current.end) {
      seekTo(loopRef.current.start);
    }
  }, [onStateChange]);

  const handleStateChange = useCallback((state: number) => {
    // 1 = playing, 2 = paused
    onStateChange({ isPlaying: state === 1 });
  }, [onStateChange]);

  const {
    isReady,
    loadVideo,
    cueVideo,
    play,
    pause,
    seekTo,
    setVolume,
    setPlaybackRate,
    getDuration,
    getCurrentTime,
  } = useYouTubePlayer(containerId, {
    onTimeUpdate: handleTimeUpdate,
    onStateChange: handleStateChange,
    onEnded,
  });

  const loadTrack = useCallback((track: Track, autoplay = false) => {
    loopRef.current = null;
    onStateChange({ track, loop: null, currentTime: 0 });
    
    if (autoplay) {
      loadVideo(track.videoId);
    } else {
      cueVideo(track.videoId);
    }
  }, [loadVideo, cueVideo, onStateChange]);

  const toggleLoop = useCallback((duration: 4 | 8 | 16) => {
    if (loopRef.current?.duration === duration) {
      loopRef.current = null;
      onStateChange({ loop: null });
    } else {
      const currentTime = getCurrentTime();
      const loop: LoopSettings = {
        start: currentTime,
        end: currentTime + duration,
        duration,
      };
      loopRef.current = loop;
      onStateChange({ loop });
    }
  }, [getCurrentTime, onStateChange]);

  const updateVolume = useCallback((volume: number) => {
    setVolume(volume);
    onStateChange({ volume });
  }, [setVolume, onStateChange]);

  const updatePlaybackRate = useCallback((rate: number) => {
    setPlaybackRate(rate);
    onStateChange({ playbackRate: rate });
  }, [setPlaybackRate, onStateChange]);

  return {
    containerId,
    isReady,
    loadTrack,
    play,
    pause,
    seekTo,
    setVolume: updateVolume,
    setPlaybackRate: updatePlaybackRate,
    toggleLoop,
    getDuration,
    getCurrentTime,
  };
};
