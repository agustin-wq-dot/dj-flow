import { useCallback, useEffect, useRef, useState } from 'react';
import { useYouTubePlayer } from './useYouTubePlayer';
import { DeckState, Track, LoopSettings } from '@/types/dj';

interface UseDeckOptions {
  deckId: 'A' | 'B';
  onStateChange: (state: Partial<DeckState>) => void;
}

export const useDeck = ({ deckId, onStateChange }: UseDeckOptions) => {
  const containerId = `youtube-player-${deckId}`;
  const loopRef = useRef<LoopSettings | null>(null);
  const currentTimeRef = useRef(0);

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
  } = useYouTubePlayer({
    containerId,
    onTimeUpdate: (time) => {
      currentTimeRef.current = time;
      onStateChange({ currentTime: time });

      // Loop manual (permitido)
      if (loopRef.current && time >= loopRef.current.end) {
        seekTo(loopRef.current.start);
      }
    },
    onReady: () => onStateChange({ isReady: true }),
    onPlay: () => onStateChange({ isPlaying: true }),
    onPause: () => onStateChange({ isPlaying: false }),
  });

  const loadTrack = useCallback((track: Track) => {
    loadVideo(track.videoId);
    onStateChange({
      track,
      currentTime: 0,
      duration: 0,
      isPlaying: false,
    });
  }, [loadVideo, onStateChange]);

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
