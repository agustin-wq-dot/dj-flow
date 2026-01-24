import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeckState, EQSettings } from '@/types/dj';
import { BpmTapper } from './BpmTapper';

interface DeckControlsProps {
  deckId: 'A' | 'B';
  state: DeckState;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (volume: number) => void;
  onPlaybackRateChange: (rate: number) => void;
  onToggleLoop: (duration: 4 | 8 | 16) => void;
  onSetCue: () => void;
  onJumpToCue: (cueId: string) => void;
  onBpmChange: (bpm: number) => void;
  onEqChange: (eq: EQSettings) => void;
  onTrimChange: (trim: number) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// CUE button colors
const CUE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

export const DeckControls: React.FC<DeckControlsProps> = ({
  deckId,
  state,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onPlaybackRateChange,
  onToggleLoop,
  onSetCue,
  onJumpToCue,
  onBpmChange,
  onEqChange,
  onTrimChange,
}) => {
  const isDeckA = deckId === 'A';
  const deckColorClass = isDeckA ? 'bg-[hsl(var(--deck-a))]' : 'bg-[hsl(var(--deck-b))]';
  const deckBorderClass = isDeckA ? 'border-[hsl(var(--deck-a)/0.5)]' : 'border-[hsl(var(--deck-b)/0.5)]';

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-1">
        <Slider
          value={[state.currentTime]}
          max={state.duration || 100}
          step={0.1}
          onValueChange={([val]) => onSeek(val)}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(state.currentTime)}</span>
          <span>-{formatTime((state.duration || 0) - state.currentTime)}</span>
        </div>
      </div>

      {/* Main Transport Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button
          size="lg"
          variant={state.isPlaying ? 'default' : 'outline'}
          onClick={state.isPlaying ? onPause : onPlay}
          className={cn(
            'h-14 w-14 rounded-full',
            state.isPlaying && deckColorClass
          )}
        >
          {state.isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 ml-1" />
          )}
        </Button>
      </div>

      {/* CUE Points */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">CUE Points</span>
          <Button
            size="sm"
            variant="outline"
            onClick={onSetCue}
            className="h-7 text-xs"
          >
            + Set CUE
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((idx) => {
            const cue = state.cuePoints[idx];
            return (
              <Button
                key={idx}
                size="sm"
                variant={cue ? 'default' : 'outline'}
                onClick={() => cue && onJumpToCue(cue.id)}
                disabled={!cue}
                className="h-8 text-xs font-mono"
                style={cue ? { backgroundColor: CUE_COLORS[idx] } : {}}
              >
                {cue ? formatTime(cue.time) : `CUE ${idx + 1}`}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Loop Controls */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Loop</span>
        <div className="grid grid-cols-3 gap-2">
          {([4, 8, 16] as const).map((duration) => (
            <Button
              key={duration}
              size="sm"
              variant={state.loop?.duration === duration ? 'default' : 'outline'}
              onClick={() => onToggleLoop(duration)}
              className={cn(
                'h-9',
                state.loop?.duration === duration && deckColorClass
              )}
            >
              <Repeat className="h-3 w-3 mr-1" />
              {duration}s
            </Button>
          ))}
        </div>
      </div>

      {/* BPM Control with Tap */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tempo</span>
        <BpmTapper 
          deckId={deckId}
          currentBpm={state.bpm}
          onBpmChange={onBpmChange}
        />
        {/* Pitch (playback rate) */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-14">Pitch:</span>
          <Slider
            value={[state.playbackRate]}
            min={0.5}
            max={1.5}
            step={0.01}
            onValueChange={([val]) => onPlaybackRateChange(val)}
            className="flex-1"
          />
          <span className="text-xs font-mono w-12 text-right">
            {((state.playbackRate - 1) * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* EQ Controls */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">EQ</span>
        <div className="space-y-2">
          {(['high', 'mid', 'low'] as const).map((band) => (
            <div key={band} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground uppercase w-10">{band}</span>
              <Slider
                value={[state.eq[band]]}
                min={-12}
                max={12}
                step={1}
                onValueChange={([val]) => onEqChange({ ...state.eq, [band]: val })}
                className="flex-1"
              />
              <span className="text-xs font-mono w-8 text-right">
                {state.eq[band] > 0 ? '+' : ''}{state.eq[band]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trim & Volume */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">TRIM</span>
            <span className="font-mono">{(state.trim * 100).toFixed(0)}%</span>
          </div>
          <Slider
            value={[state.trim]}
            min={0}
            max={2}
            step={0.01}
            onValueChange={([val]) => onTrimChange(val)}
          />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">VOL</span>
            <span className="font-mono">{(state.volume * 100).toFixed(0)}%</span>
          </div>
          <Slider
            value={[state.volume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={([val]) => onVolumeChange(val)}
          />
        </div>
      </div>
    </div>
  );
};
