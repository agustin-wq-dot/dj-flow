// src/pages/Manual.tsx
import React, { useState } from 'react';
import { Deck } from '@/components/Deck';
import { DeckState } from '@/types/dj';
import { Slider } from '@/components/ui/slider';

export default function Manual() {
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

  const [crossfader, setCrossfader] = useState(0.5);

  // Calcula volumen relativo según crossfader
  const computeVolume = (deck: 'A' | 'B') => {
    if (deck === 'A') return (1 - crossfader) * deckA.volume;
    return crossfader * deckB.volume;
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Manual DJ</h1>

      <div className="flex gap-8">
        <Deck
          deckId="A"
          containerId="deck-a"
          deckState={deckA}
          setDeckState={setDeckA}
          volume={computeVolume('A')}
        />
        <Deck
          deckId="B"
          containerId="deck-b"
          deckState={deckB}
          setDeckState={setDeckB}
          volume={computeVolume('B')}
        />
      </div>

      {/* Crossfader */}
      <div className="mt-4">
        <h2 className="mb-2 font-semibold">Crossfader</h2>
        <Slider
          value={crossfader}
          onValueChange={setCrossfader}
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
