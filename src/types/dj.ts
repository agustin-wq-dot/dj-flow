export interface Track {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  duration: number;
}

export interface DeckState {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  playbackRate: number;
  loop: LoopSettings | null;
}

export interface LoopSettings {
  start: number;
  end: number;
  duration: 4 | 8 | 16;
}

export type DJMode = 'automatic' | 'manual';

export interface PlayerState {
  deckA: DeckState;
  deckB: DeckState;
  activeDeck: 'A' | 'B';
  crossfaderPosition: number; // -1 (full A) to 1 (full B)
  mode: DJMode;
  playlist: Track[];
  currentTrackIndex: number;
}

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

export const createEmptyDeckState = (): DeckState => ({
  track: null,
  isPlaying: false,
  currentTime: 0,
  volume: 1,
  playbackRate: 1,
  loop: null,
});
