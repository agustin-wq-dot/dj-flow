import { useState, useCallback } from 'react';
import { Track, extractVideoId } from '@/types/dj';

const STORAGE_KEY = 'dj-playlist';

export const usePlaylist = () => {
  const [tracks, setTracks] = useState<Track[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(false);

  const saveToStorage = useCallback((newTracks: Track[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTracks));
  }, []);

  const fetchVideoInfo = async (videoId: string): Promise<Partial<Track> | null> => {
    try {
      // Using noembed for basic info (no API key needed)
      const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
      const data = await response.json();
      
      if (data.error) return null;
      
      return {
        title: data.title || 'Unknown Title',
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      };
    } catch {
      return {
        title: 'Unknown Title',
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      };
    }
  };

  const addTracks = useCallback(async (urls: string) => {
    setIsLoading(true);
    const lines = urls.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    const newTracks: Track[] = [];

    for (const url of lines) {
      const videoId = extractVideoId(url);
      if (!videoId) continue;

      // Check if already exists
      if (tracks.some(t => t.youtubeId === videoId)) continue;

      const info = await fetchVideoInfo(videoId);
      if (info) {
        newTracks.push({
          id: `${videoId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          youtubeId: videoId,
          source: 'youtube',
          title: info.title || 'Unknown Title',
          thumbnail: info.thumbnail || '',
          duration: 0,
        });
      }
    }

    const updatedTracks = [...tracks, ...newTracks];
    setTracks(updatedTracks);
    saveToStorage(updatedTracks);
    setIsLoading(false);
    
    return newTracks.length;
  }, [tracks, saveToStorage]);

  const removeTrack = useCallback((trackId: string) => {
    const updatedTracks = tracks.filter(t => t.id !== trackId);
    setTracks(updatedTracks);
    saveToStorage(updatedTracks);
  }, [tracks, saveToStorage]);

  const reorderTracks = useCallback((fromIndex: number, toIndex: number) => {
    const updatedTracks = [...tracks];
    const [removed] = updatedTracks.splice(fromIndex, 1);
    updatedTracks.splice(toIndex, 0, removed);
    setTracks(updatedTracks);
    saveToStorage(updatedTracks);
  }, [tracks, saveToStorage]);

  const clearPlaylist = useCallback(() => {
    setTracks([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    tracks,
    isLoading,
    addTracks,
    removeTrack,
    reorderTracks,
    clearPlaylist,
  };
};
