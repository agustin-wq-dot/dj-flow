import React, { createContext, useContext, useState } from "react";
import { Track } from "@/types/Track";

export type PlayerMode = "auto" | "manual";

interface PlayerContextType {
  playlist: Track[];
  mode: PlayerMode;
  autoPlaying: boolean;

  setPlaylist(tracks: Track[]): void;
  startAuto(): void;
  stopAuto(): void;
  setManual(): void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [mode, setMode] = useState<PlayerMode>("manual");
  const [autoPlaying, setAutoPlaying] = useState(false);

  function startAuto() {
    setMode("auto");
    setAutoPlaying(false); // desactivado a propósito
    console.warn("[AutoMode] desactivado temporalmente");
  }

  function stopAuto() {
    setAutoPlaying(false);
  }

  function setManual() {
    setMode("manual");
    setAutoPlaying(false);
  }

  return (
    <PlayerContext.Provider
      value={{
        playlist,
        mode,
        autoPlaying,
        setPlaylist,
        startAuto,
        stopAuto,
        setManual,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayerContext() {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("usePlayerContext must be used inside PlayerProvider");
  }
  return ctx;
}
