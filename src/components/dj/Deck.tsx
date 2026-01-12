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
  onLoadNext: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

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
  onLoadNext,
}) => {
  const isDeckA = deckId === 'A';
  const gradientClass = isDeckA ? 'deck-gradient-a' : 'deck-gradient-b';
  const accentColor = isDeckA ? 'bg-deck-a' : 'bg-deck-b';
  const borderColor = isDeckA ? 'border-deck-a/30' : 'border-deck-b/30';
  const glowClass = isDeckA ? 'glow-primary' : 'glow-secondary';

  return (
    <div className={`rounded-xl border ${borderColor} ${gradientClass} p-4 flex flex-col gap-4`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className={`text-2xl font-bold ${isDeckA ? 'text-deck-a' : 'text-deck-b'}`}>
          DECK {deckId}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onLoadNext}
          className="text-xs"
        >
          Load Next
        </Button>
      </div>

      {/* Video Player */}
      <div className={`relative aspect-video rounded-lg overflow-hidden bg-muted ${state.isPlaying ? glowClass : ''}`}>
        <div id={containerId} className="w-full h-full" />
        {!state.track && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <span className="text-muted-foreground">No track loaded</span>
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="min-h-[40px]">
        {state.track ? (
          <p className="text-sm font-medium truncate">{state.track.title}</p>
        ) : (
          <p className="text-sm text-muted-foreground">—</p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <Slider
          value={[state.currentTime]}
          max={state.track?.duration || 100}
          step={1}
          onValueChange={([value]) => onSeek(value)}
          disabled={!state.track}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(state.currentTime)}</span>
          <span>{state.track ? formatTime(state.track.duration) : '--:--'}</span>
        </div>
      </div>

      {/* Play/Pause */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={state.isPlaying ? onPause : onPlay}
          disabled={!state.track}
          className={`w-16 h-16 rounded-full ${accentColor} hover:opacity-90`}
        >
          {state.isPlaying ? (
            <Pause className="h-8 w-8" />
          ) : (
            <Play className="h-8 w-8 ml-1" />
          )}
        </Button>
      </div>

      {/* Volume */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Volume</span>
          <span>{Math.round(effectiveVolume * 100)}%</span>
        </div>
        <Slider
          value={[state.volume * 100]}
          max={100}
          step={1}
          onValueChange={([value]) => onVolumeChange(value / 100)}
        />
      </div>

      {/* Tempo/Speed */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Tempo</span>
          <span>{state.playbackRate.toFixed(2)}x</span>
        </div>
        <Slider
          value={[state.playbackRate * 100]}
          min={50}
          max={200}
          step={5}
          onValueChange={([value]) => onPlaybackRateChange(value / 100)}
        />
      </div>

      {/* Loop Controls */}
      <div className="space-y-2">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <RotateCcw className="h-3 w-3" /> Loop
        </span>
        <div className="flex gap-2">
          {([4, 8, 16] as const).map((duration) => (
            <Button
              key={duration}
              variant={state.loop?.duration === duration ? 'default' : 'outline'}
              size="sm"
              onClick={() => onToggleLoop(duration)}
              disabled={!state.track}
              className={`flex-1 ${state.loop?.duration === duration ? accentColor : ''}`}
            >
              {duration}s
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
