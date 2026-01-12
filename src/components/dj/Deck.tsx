// src/components/Deck.tsx
import React, { useEffect, useRef } from 'react';
import { DeckState } from '@/types/dj';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface DeckProps {
  deckId: 'A' | 'B';
  containerId: string;
  deckState?: DeckState;          // Puede llegar undefined
  setDeckState?: (state: DeckState) => void; // Opcional
  volume: number;
}

export const Deck: React.FC<DeckProps> = ({ deckId, containerId, deckState, setDeckState, volume }) => {
  // Valores seguros por defecto
  const safeDeckState: DeckState = deckState || {
    isPlaying: false,
    volume: 1,
    position: 0,
  };

  const safeSetDeckState = setDeckState || (() => {});

  const audioRef = useRef<HTMLAudioElement>(null);

  // Actualizar volumen según prop
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Play / Pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (safeDeckState.isPlaying) {
      audioRef.current.pause();
      safeSetDeckState({ ...safeDeckState, isPlaying: false });
    } else {
      audioRef.current.play();
      safeSetDeckState({ ...safeDeckState, isPlaying: true });
    }
  };

  // Reiniciar
  const restart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    safeSetDeckState({ ...safeDeckState, position: 0 });
  };

  // Actualizar posición
  const onTimeUpdate = () => {
    if (!audioRef.current) return;
    safeSetDeckState({ ...safeDeckState, position: audioRef.current.currentTime });
  };

  return (
    <div className="flex flex-col gap-2 border p-4 rounded">
      <h2 className="font-bold text-lg">Deck {deckId}</h2>

      <audio
        ref={audioRef}
        id={containerId}
        onTimeUpdate={onTimeUpdate}
        src="" // Poner URL real de la canción
      />

      <div className="flex gap-2">
        <Button onClick={togglePlay}>
          {safeDeckState.isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </Button>
        <Button onClick={restart}>
          <RotateCcw size={16} />
        </Button>
      </div>

      <Slider
        value={safeDeckState.position}
        onValueChange={(val) => {
          if (audioRef.current) audioRef.current.currentTime = val;
          safeSetDeckState({ ...safeDeckState, position: val });
        }}
        min={0}
        max={audioRef.current?.duration || 0}
        step={0.01}
      />
    </div>
  );
};
