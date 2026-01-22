import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DeckState, createEmptyDeckState } from '@/types/dj';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ManualDeck } from '@/components/dj/ManualDeck';
import { ArrowLeft, Headphones } from 'lucide-react';

export default function Manual() {
  const [deckAState, setDeckAState] = useState<DeckState>(createEmptyDeckState());
  const [deckBState, setDeckBState] = useState<DeckState>(createEmptyDeckState());
  const [crossfader, setCrossfader] = useState(0.5);

  const computeVolume = (deck: 'A' | 'B') => {
    // Equal power crossfade
    if (deck === 'A') {
      return Math.cos((crossfader) * Math.PI / 2);
    }
    return Math.sin((crossfader) * Math.PI / 2);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Headphones className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Manual DJ</h1>
          </div>
        </div>
      </div>

      {/* Decks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ManualDeck
          deckId="A"
          state={deckAState}
          onStateChange={(state) => setDeckAState(prev => ({ ...prev, ...state }))}
          effectiveVolume={computeVolume('A')}
        />
        <ManualDeck
          deckId="B"
          state={deckBState}
          onStateChange={(state) => setDeckBState(prev => ({ ...prev, ...state }))}
          effectiveVolume={computeVolume('B')}
        />
      </div>

      {/* Crossfader */}
      <div className="max-w-2xl mx-auto bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-bold text-[hsl(var(--deck-a))]">A</span>
          <h2 className="font-semibold text-muted-foreground uppercase tracking-wide text-sm">
            Crossfader
          </h2>
          <span className="text-lg font-bold text-[hsl(var(--deck-b))]">B</span>
        </div>
        
        <Slider
          value={[crossfader]}
          onValueChange={([val]) => setCrossfader(val)}
          step={0.01}
          min={0}
          max={1}
          className="mb-4"
        />

        {/* Visual indicator */}
        <div className="flex h-3 rounded-full overflow-hidden bg-muted">
          <div 
            className="bg-[hsl(var(--deck-a))] transition-all duration-100"
            style={{ width: `${(1 - crossfader) * 100}%` }}
          />
          <div 
            className="bg-[hsl(var(--deck-b))] transition-all duration-100"
            style={{ width: `${crossfader * 100}%` }}
          />
        </div>

        {/* Quick buttons */}
        <div className="flex justify-between mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCrossfader(0)}
            className="text-[hsl(var(--deck-a))]"
          >
            Full A
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCrossfader(0.5)}
          >
            Center
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCrossfader(1)}
            className="text-[hsl(var(--deck-b))]"
          >
            Full B
          </Button>
        </div>
      </div>
    </div>
  );
}
