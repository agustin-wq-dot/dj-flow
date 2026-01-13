import React, { useState } from 'react';
import { Deck } from '@/components/dj/Deck';
import { DeckState, createEmptyDeckState } from '@/types/dj';
import { Slider } from '@/components/ui/slider';
import { useDeck } from '@/hooks/useDeck';

export default function Manual() {
  const [deckAState, setDeckAState] = useState<DeckState>(createEmptyDeckState());
  const [deckBState, setDeckBState] = useState<DeckState>(createEmptyDeckState());
  const [crossfader, setCrossfader] = useState(0.5);

  const deckA = useDeck({
    deckId: 'A',
    onStateChange: (state) => setDeckAState(prev => ({ ...prev, ...state })),
  });

  const deckB = useDeck({
    deckId: 'B',
    onStateChange: (state) => setDeckBState(prev => ({ ...prev, ...state })),
  });

  const computeVolume = (deck: 'A' | 'B') => {
    if (deck === 'A') return (1 - crossfader) * deckAState.volume;
    return crossfader * deckBState.volume;
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Manual DJ</h1>

      <div className="flex gap-8">
        <Deck
          deckId="A"
          containerId={deckA.containerId}
          state={deckAState}
          effectiveVolume={computeVolume('A')}
          onPlay={deckA.play}
          onPause={deckA.pause}
          onSeek={deckA.seekTo}
          onVolumeChange={(v) => setDeckAState(prev => ({ ...prev, volume: v }))}
          onPlaybackRateChange={deckA.setPlaybackRate}
          onToggleLoop={deckA.toggleLoop}
          onLoadNext={() => {}}
        />
        <Deck
          deckId="B"
          containerId={deckB.containerId}
          state={deckBState}
          effectiveVolume={computeVolume('B')}
          onPlay={deckB.play}
          onPause={deckB.pause}
          onSeek={deckB.seekTo}
          onVolumeChange={(v) => setDeckBState(prev => ({ ...prev, volume: v }))}
          onPlaybackRateChange={deckB.setPlaybackRate}
          onToggleLoop={deckB.toggleLoop}
          onLoadNext={() => {}}
        />
      </div>

      <div className="mt-4">
        <h2 className="mb-2 font-semibold">Crossfader</h2>
        <Slider
          value={[crossfader]}
          onValueChange={([val]) => setCrossfader(val)}
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
