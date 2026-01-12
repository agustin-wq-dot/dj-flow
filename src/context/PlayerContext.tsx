import React, { createContext, useContext, useState } from 'react';
import { Track } from '@/types/dj';

export type PlayerMode = 'manual' | 'auto';

interface PlayerContextState {
  mode: PlayerMode;
  setMode: (mode: PlayerMode) => void;
  playlist: Track[];
  setPlaylist: (tracks: Track[]) => void;
}

const PlayerContext = createContext<PlayerContextState | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<PlayerMode>('manual');
  const [playlist, setPlaylist] = useState<Track[]>([]);

  return (
    <PlayerContext.Provider
      value={{
        mode,
        setMode,
        playlist,
        setPlaylist,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error('usePlayerContext must be used within PlayerProvider');
  }
  return ctx;
};
