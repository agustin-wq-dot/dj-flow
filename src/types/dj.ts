import { Track } from './Track';

export type { Track } from './Track';

export type DJMode = 'automatic' | 'manual';

export interface LoopSettings {
  start: number;
  end: number;
  duration: number;
}

export interface CuePoint {
  id: string;
  time: number;
  color: string;
  label?: string;
}

export interface EQSettings {
  high: number;  // -12 to +12 dB
  mid: number;
  low: number;
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
  bpm: number;
  cuePoints: CuePoint[];
  eq: EQSettings;
  trim: number;  // 0 to 2 (1 = normal)
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
  bpm: 120,
  cuePoints: [],
  eq: { high: 0, mid: 0, low: 0 },
  trim: 1,
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
