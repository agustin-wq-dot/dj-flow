import React, { useState } from 'react';
import { DeckState } from '@/types/dj';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, Repeat } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useDeckAudio } from '../../audio/useDeckAudio';

interface DeckProps {
  deckId: 'A' | 'B';
  containerId: string;
  state: DeckState;
  effectiveVolume: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (seconds: number) => void;
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

const isYouTubeUrl = (url: string): boolean => {
  return /youtube\.com|youtu\.be/.test(url);
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
  const deckColor = isDeckA ? 'deck-a' : 'deck-b';

  // 🔊 Web Audio
  const audio = useDeckAudio();
  const [sourceUrl, setSourceUrl] = useState('');

  const isAudioMode =
    sourceUrl.trim().length > 0 && !isYouTubeUrl(sourceUrl);

  const handleLoad = () => {
    if (isAudioMode) {
      audio.load(sourceUrl);
    } else {
      // YouTube: la carga real ya la maneja el parent
      onLoadNext();
    }
  };

  const handlePlay = () => {
    if (isAudioMode) {
      audio.play();
    } else {
      onPlay();
    }
  };

  const handlePause = () => {
    if (isAudioMode) {
      audio.stop();
    } else {
      onPause();
    }
  };

  const handleVolumeChange = (val: number) => {
    if (isAudioMode) {
      audio.setGain(val);
    }
    onVolumeChange(val);
  };

  return (
    <div
      className={cn(
        'rounded-xl border p-4 space-y-4',
        isDeckA
          ? 'bg-deck-a/5 border-deck-a/30'
          : 'bg-deck-b/5 border-deck-b/30'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={cn('font-bold text-lg', `text-${deckColor}`)}>
          Deck {deckId}
        </h2>
        <Button variant="outline" size="sm" onClick={onLoadNext}>
          <SkipForward className="h-4 w-4 mr-1" />
          Load Next
        </Button>
      </div>

      {/* Source */}
      <div className="text-xs opacity-70">
        Source: {isAudioMode ? 'Audio URL' : 'YouTube'}
      </div>

      {/* URL Input */}
      <div className="space-y-2">
        <input
          className="w-full p-2 text-sm border rounded"
          placeholder="YouTube URL o audio (mp3, wav)"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
        />
        <Button size="sm" variant="secondary" onClick={handleLoad}>
          Cargar
        </Button>
      </div>

      {/* YouTube Container */}
      <div className="aspect-video bg-black/50 rounded-lg overflow-hidden">
        <div id={containerId} className="w-full h-full" />
      </div>

      {/* Track Info */}
      {state.track && (
        <div className="text-sm truncate text-foreground/80">
          {state.track.title}
        </div>
      )}

      {/* Progress */}
      <div className="space-y-1">
        <Slider
          value={[state.currentTime]}
          max={state.duration || 100}
          step={0.1}
          onValueChange={([val]) => onSeek(val)}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(state.currentTime)}</span>
          <span>{formatTime(state.duration || 0)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        <Button
          size="icon"
          variant={state.isPlaying ? 'default' : 'outline'}
          onClick={state.isPlaying ? handlePause : handlePlay}
          className={
            state.isPlaying ? `bg-${deckColor} hover:bg-${deckColor}/90` : ''
          }
        >
          {state.isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <div className="flex gap-1">
          {([4, 8, 16] as const).map((duration) => (
            <Button
              key={duration}
              size="sm"
              variant={
                state.loop?.duration === duration ? 'default' : 'outline'
              }
              onClick={() => onToggleLoop(duration)}
              className={cn(
                'text-xs px-2',
                state.loop?.duration === duration && `bg-${deckColor}`
              )}
            >
              <Repeat className="h-3 w-3 mr-1" />
              {duration}s
            </Button>
          ))}
        </div>
      </div>

      {/* Volume & Tempo */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Volume</label>
          <Slider
            value={[state.volume]}
            max={1}
            step={0.01}
            onValueChange={([val]) => handleVolumeChange(val)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            Tempo: {state.playbackRate.toFixed(2)}x
          </label>
          <Slider
            value={[state.playbackRate]}
            min={0.5}
            max={2}
            step={0.05}
            onValueChange={([val]) => onPlaybackRateChange(val)}
          />
        </div>
      </div>

      {/* Effective Volume */}
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all', `bg-${deckColor}`)}
          style={{ width: `${effectiveVolume * 100}%` }}
        />
      </div>
    </div>
  );
};
