// src/pages/Manual.tsx
import React, { useState } from 'react';
import { Deck } from '@/components/Deck';
import { DeckState } from '@/types/dj';
import { Slider } from '@/components/ui/slider';

export default function Manual() {
  // Estado de cada deck
  const [deckA, setDeckA] = useState<DeckState>({
    isPlaying: false,
    volume: 1,
    position: 0,
  });

  const [deckB, setDeckB] = useState<DeckState>({
    isPlaying: false,
    volume: 1,
    position: 0,
  });

  // Estado del crossfader (0 = todo deck A, 1 = todo deck B)
  const [crossfader, setCrossfader] = useState(0.5);

  // Función para actualizar volumen relativo de cada deck según crossfader
  const computeVolume = (deck: 'A' | 'B') => {
    if (deck === 'A') return (1 - crossfader) * deckA.volume;
    else return crossfader * deckB.volume;
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Manual DJ</h1>

      <div className="flex gap-8">
        {/* Deck A */}
        <Deck
          deckId="A"
          containerId="deck-a"
          state={deckA}
          setState={setDeckA}
          volume={computeVolume('A')}
        />

        {/* Deck B */}
        <Deck
          deckId="B"
          containerId="deck-b"
          state={deckB}
          setState={setDeckB}
          volume={computeVolume('B')}
        />
      </div>

      {/* Crossfader */}
      <div className="mt-4">
        <h2 className="mb-2 font-semibold">Crossfader</h2>
        <Slider
          value={crossfader}
          onValueChange={(val) => setCrossfader(val)}
          step={0.01}
          min={0}
          max={1}
        />
        <div className="flex justify-between text-sm mt-1">
          <span>Deck A</span>
          <span>Deck B</span>
        </div>
      </div>
    </div>
  );
}
