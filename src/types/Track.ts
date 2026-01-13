export interface Track {
  id: string;
  title: string;
  source: 'youtube';
  youtubeId: string;
  videoId?: string; // Alias for youtubeId for compatibility
  thumbnail?: string;
  duration?: number;
}