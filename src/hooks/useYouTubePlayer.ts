import { useEffect, useRef, useCallback, useState } from 'react';

interface YouTubePlayer {
  destroy: () => void;
  loadVideoById: (videoId: string) => void;
  cueVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  getDuration: () => number;
  getCurrentTime: () => number;
  getPlayerState: () => number;
}

interface YouTubePlayerEvent {
  data: number;
  target: YouTubePlayer;
}

interface YouTubePlayerOptions {
  height: string;
  width: string;
  videoId: string;
  playerVars: Record<string, number | string>;
  events: {
    onReady: () => void;
    onStateChange: (event: YouTubePlayerEvent) => void;
  };
}

interface YouTubeAPI {
  Player: new (elementId: string, options: YouTubePlayerOptions) => YouTubePlayer;
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface UseYouTubePlayerOptions {
  onReady?: () => void;
  onStateChange?: (state: number) => void;
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
}

let apiLoaded = false;
let apiLoading = false;
const readyCallbacks: (() => void)[] = [];

const loadYouTubeAPI = (): Promise<void> => {
  return new Promise((resolve) => {
    if (apiLoaded) {
      resolve();
      return;
    }

    readyCallbacks.push(resolve);

    if (apiLoading) return;

    apiLoading = true;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      apiLoaded = true;
      readyCallbacks.forEach((cb) => cb());
      readyCallbacks.length = 0;
    };
  });
};

export const useYouTubePlayer = (
  containerId: string,
  options: UseYouTubePlayerOptions = {}
) => {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const timeUpdateInterval = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const startTimeUpdate = useCallback(() => {
    if (timeUpdateInterval.current) return;
    
    timeUpdateInterval.current = window.setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        optionsRef.current.onTimeUpdate?.(playerRef.current.getCurrentTime());
      }
    }, 100);
  }, []);

  const stopTimeUpdate = useCallback(() => {
    if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current);
      timeUpdateInterval.current = null;
    }
  }, []);

  const initPlayer = useCallback(async (videoId?: string) => {
    await loadYouTubeAPI();

    if (playerRef.current) {
      playerRef.current.destroy();
    }

    playerRef.current = new window.YT.Player(containerId, {
      height: '100%',
      width: '100%',
      videoId: videoId || '',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        playsinline: 1,
      },
      events: {
        onReady: () => {
          setIsReady(true);
          optionsRef.current.onReady?.();
        },
        onStateChange: (event) => {
          optionsRef.current.onStateChange?.(event.data);

          // YouTube PlayerState.PLAYING = 1
          if (event.data === 1) {
            startTimeUpdate();
          } else {
            stopTimeUpdate();
          }

          // YouTube PlayerState.ENDED = 0
          if (event.data === 0) {
            optionsRef.current.onEnded?.();
          }
        },
      },
    });
  }, [containerId, startTimeUpdate, stopTimeUpdate]);

  const loadVideo = useCallback((videoId: string) => {
    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      playerRef.current.loadVideoById(videoId);
    }
  }, []);

  const cueVideo = useCallback((videoId: string) => {
    if (playerRef.current && typeof playerRef.current.cueVideoById === 'function') {
      playerRef.current.cueVideoById(videoId);
    }
  }, []);

  const play = useCallback(() => {
    playerRef.current?.playVideo();
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo();
  }, []);

  const seekTo = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true);
  }, []);

  const setVolume = useCallback((volume: number) => {
    playerRef.current?.setVolume(volume * 100);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    playerRef.current?.setPlaybackRate(rate);
  }, []);

  const getDuration = useCallback((): number => {
    return playerRef.current?.getDuration() || 0;
  }, []);

  const getCurrentTime = useCallback((): number => {
    return playerRef.current?.getCurrentTime() || 0;
  }, []);

  useEffect(() => {
    initPlayer();

    return () => {
      stopTimeUpdate();
      playerRef.current?.destroy();
    };
  }, []);

  return {
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
    player: playerRef.current,
  };
};
