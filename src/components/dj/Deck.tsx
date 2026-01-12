// src/components/Deck.tsx
import React, { useEffect, useRef } from 'react';
import { DeckState } from '@/types/dj';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface DeckProps {
  deckId: 'A' | 'B';
  containerId: string;
  deckState: DeckState | undefined;          // Puede llegar undefined
  setDeckState?: (state: DeckState) => void; // Opcional para prevenir crashes
  volume: number;
}

export const Deck: React.FC<DeckProps> = ({ deckId, containerId, deckState, setDeckState, volume }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Si deckState o setDeckState no existen, no renderizamos nada
  if (!deckState || !setDeckState) return null;

  // Actualizar volumen cuando cambia prop
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Play / Pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (deckState.isPlaying) {
      audioRef.current.pause();
      setDeckState({ ...deckState, isPlaying: false });
    } else {
      audioRef.current.play();
      setDeckState({ ...deckState, isPlaying: true });
    }
  };

  // Reiniciar
  const restart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setDeckState({ ...deckState, position: 0 });
  };

  // Actualizar posición
  const onTimeUpdate = () => {
    if (!audioRef.current) return;
    setDeckState({ ...deckState, position: audioRef.current.currentTime });
  };

  return (
    <div className="flex flex-col gap-2 border p-4 rounded">
      <h2 className="font-bold text-lg">Deck {deckId}</h2>

      {/* Contenedor de audio */}
      <audio
        ref={audioRef}
        id={containerId}
        onTimeUpdate={onTimeUpdate}
        src="" // Aquí ponés la URL de la canción
      />

      {/* Controles */}
      <div className="flex gap-2">
        <Button onClick={togglePlay}>
          {deckState.isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </Button>
        <Button onClick={restart}>
          <RotateCcw size={16} />
        </Button>
      </div>

      {/* Slider posición */}
      <Slider
        value={deckState.position}
        onValueChange={(val) => {
          if (audioRef.current) audioRef.current.currentTime = val;
          setDeckState({ ...deckState, position: val });
        }}
        min={0}
        max={audioRef.current?.duration || 0}
        step={0.01}
      />
    </div>
  );
};
