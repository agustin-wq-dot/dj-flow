import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { DJMode } from '@/types/dj';

interface CrossfaderProps {
  position: number; // -1 to 1
  mode: DJMode;
  onChange: (position: number) => void;
  onModeChange: (mode: DJMode) => void;
}

export const Crossfader: React.FC<CrossfaderProps> = ({
  position,
  mode,
  onChange,
  onModeChange,
}) => {
  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-muted/50 border border-border">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'automatic' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('automatic')}
          className={mode === 'automatic' ? 'bg-accent text-accent-foreground' : ''}
        >
          Auto
        </Button>
        <Button
          variant={mode === 'manual' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('manual')}
          className={mode === 'manual' ? 'bg-accent text-accent-foreground' : ''}
        >
          Manual
        </Button>
      </div>

      {/* Crossfader */}
      <div className="w-full max-w-md space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span className="text-deck-a">A</span>
          <span className="text-muted-foreground">Crossfader</span>
          <span className="text-deck-b">B</span>
        </div>
        <div className="relative">
          <Slider
            value={[position]}
            min={-1}
            max={1}
            step={0.01}
            onValueChange={([value]) => onChange(value)}
            disabled={mode === 'automatic'}
            className="cursor-pointer"
          />
          {/* Center indicator */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-4 bg-muted-foreground/30 pointer-events-none" />
        </div>
        <div className="flex justify-center text-xs text-muted-foreground">
          {mode === 'automatic' ? (
            <span>Modo automático activado</span>
          ) : (
            <span>
              {position < -0.5 ? 'Deck A' : position > 0.5 ? 'Deck B' : 'Mezclando'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
