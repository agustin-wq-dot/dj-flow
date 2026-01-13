import { useCallback, useRef } from 'react';
import { useYouTubePlayer } from './useYouTubePlayer';
import { DeckState, LoopSettings } from '@/types/dj';
import { Track } from '@/types/Track';

interface UseDeckOptions {
  deckId: 'A' | 'B';
  onStateChange: (state: Partial<DeckState>) => void;
  onEnded?: () => void;
}

export const useDeck = ({ deckId, onStateChange, onEnded }: UseDeckOptions) => {
  const containerId = `youtube-player-${deckId}`;
  const loopRef = useRef<LoopSettings | null>(null);

  const handleTimeUpdate = useCallback((time: number) => {
    onStateChange({ currentTime: time });

    // Loop check
    if (loopRef.current && time >= loopRef.current.end) {
      seekTo(loopRef.current.start);
    }
  }, [onStateChange]);

  const handleStateChange = useCallback((state: number) => {
    // YouTube PlayerState: 1 = PLAYING, 2 = PAUSED
    if (state === 1) {
      onStateChange({ isPlaying: true });
    } else if (state === 2) {
      onStateChange({ isPlaying: false });
    }
  }, [onStateChange]);

  const {
    isReady,
    loadVideo,
    play,
    pause,
    seekTo,
    setVolume,
    setPlaybackRate,
    getDuration,
    getCurrentTime,
  } = useYouTubePlayer(containerId, {
    onTimeUpdate: handleTimeUpdate,
    onReady: () => onStateChange({ isReady: true }),
    onStateChange: handleStateChange,
    onEnded,
  });

  const loadTrack = useCallback((track: Track, autoplay: boolean = false) => {
    loopRef.current = null;
    loadVideo(track.videoId);
    onStateChange({
      track,
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      loop: null,
    });
    
    if (autoplay) {
      setTimeout(() => play(), 500);
    }
  }, [loadVideo, onStateChange, play]);

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

  return {
    containerId,
    isReady,
    loadTrack,
    play,
    pause,
    seekTo,
    setVolume,
    setPlaybackRate,
    toggleLoop,
    getDuration,
    getCurrentTime,
  };
};
