export interface LoopSettings {
  start: number;
  end: number;
  duration: number;
}

export interface DeckState {
  track: import("./Track").Track | null;
  isReady: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  loop: LoopSettings | null;
}
