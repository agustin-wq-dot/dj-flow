import { Track } from './Track';

export type { Track } from './Track';

export type DJMode = 'automatic' | 'manual';

export interface LoopSettings {
  start: number;
  end: number;
  duration: number;
}

export interface DeckState {
  track: Track | null;
  isReady: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  loop: LoopSettings | null;
}

export const createEmptyDeckState = (): DeckState => ({
  track: null,
  isReady: false,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  playbackRate: 1,
  loop: null,
});

export const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};
