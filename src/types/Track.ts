export interface Track {
  videoId: string;
  title: string;
  bpm: number;
  barsOutro?: number; // default 8
}
