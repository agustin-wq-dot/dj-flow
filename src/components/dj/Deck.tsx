import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { DeckState } from '@/types/dj';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface DeckProps {
  deckId: 'A' | 'B';
  containerId: string;
  state: DeckState;
  effectiveVolume: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onPlaybackRateChange: (rate: number) => void;
  onToggleLoop: (duration: 4 | 8 | 16) => void;
}

export const Deck: React.FC<DeckProps> = ({
  deckId,
  containerId,
  state,
  effectiveVolume,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onPlaybackRateChange,
  onToggleLoop,
}) => {
  const accentColor = deckId === 'A' ? 'text-blue-500' : 'text-red-500';

  return (
    <div className="space-y-4">
      <h3 className={`font-bold ${accentColor}`}>Deck {deckId}</h3>

      {/* Transport */}
      <div className="flex gap-2">
        {!state.isPlaying ? (
          <Button onClick={onPlay} disabled={!state.track}>
            <Play className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={onPause}>
            <Pause className="w-4 h-4" />
          </Button>
        )}

        <Button
          variant="outline"
          onClick={() => onSeek(0)}
          disabled={!state.track}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Volume */}
      <div>
        <label className="text-xs">Volume</label>
        <Slider
          value={[effectiveVolume]}
          max={100}
          step={1}
          onValueChange={([v]) => onVolumeChange(v)}
        />
      </div>

      {/* Playback Rate */}
      <div>
        <label className="text-xs">Speed</label>
        <Slider
          value={[state.playbackRate]}
          min={0.5}
          max={1.5}
          step={0.05}
          onValueChange={([v]) => onPlaybackRateChange(v)}
        />
      </div>

      {/* Loop */}
      <div className="flex gap-2">
        {[4, 8, 16].map((duration) => (
          <Button
            key={duration}
            variant={state.loop?.duration === duration ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToggleLoop(duration as 4 | 8 | 16)}
            disabled={!state.track}
          >
            {duration}s
          </Button>
        ))}
      </div>

      {/* Player */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
        <div id={containerId} className="w-full h-full" />
      </div>
    </div>
  );
};
