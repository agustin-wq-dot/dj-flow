import React, { useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { CuePoint } from '@/types/dj';

interface WaveformProps {
  deckId: 'A' | 'B';
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  cuePoints: CuePoint[];
  loopStart?: number;
  loopEnd?: number;
  onSeek: (time: number) => void;
}

export const Waveform: React.FC<WaveformProps> = ({
  deckId,
  currentTime,
  duration,
  isPlaying,
  cuePoints,
  loopStart,
  loopEnd,
  onSeek,
}) => {
  const isDeckA = deckId === 'A';
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Generate pseudo-random waveform bars for visual effect
  const bars = useMemo(() => {
    const barCount = 120;
    const result: number[] = [];
    // Use a seeded random based on duration for consistency
    let seed = Math.floor(duration * 1000) || 12345;
    for (let i = 0; i < barCount; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      const rnd = seed / 233280;
      // Create wave-like pattern with some randomness
      const wave = Math.sin((i / barCount) * Math.PI * 8) * 0.3;
      const height = 0.2 + rnd * 0.6 + wave * 0.2;
      result.push(Math.max(0.15, Math.min(1, height)));
    }
    return result;
  }, [duration]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (duration <= 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newTime = Math.max(0, Math.min(duration - 0.1, percent * duration));
    
    console.log(`[Waveform] Seek: ${newTime.toFixed(2)}s (${(percent * 100).toFixed(1)}%)`);
    onSeek(newTime);
  }, [duration, onSeek]);

  return (
    <div className="space-y-1">
      <div
        className={cn(
          'relative h-16 rounded-lg overflow-hidden cursor-pointer',
          'bg-card/50 border',
          isDeckA ? 'border-[hsl(var(--deck-a)/0.3)]' : 'border-[hsl(var(--deck-b)/0.3)]'
        )}
        onClick={handleClick}
      >
        {/* Waveform bars */}
        <div className="absolute inset-0 flex items-center justify-center gap-[1px] px-1">
          {bars.map((height, i) => {
            const barPosition = (i / bars.length) * 100;
            const isPast = barPosition < progressPercent;
            const isNearPlayhead = Math.abs(barPosition - progressPercent) < 2;

            return (
              <div
                key={i}
                className={cn(
                  'flex-1 rounded-sm transition-all duration-75',
                  isPast
                    ? isDeckA
                      ? 'bg-[hsl(var(--deck-a))]'
                      : 'bg-[hsl(var(--deck-b))]'
                    : 'bg-muted-foreground/30',
                  isNearPlayhead && isPlaying && 'scale-y-110'
                )}
                style={{
                  height: `${height * 100}%`,
                }}
              />
            );
          })}
        </div>

        {/* Loop region overlay */}
        {loopStart !== undefined && loopEnd !== undefined && duration > 0 && (
          <div
            className={cn(
              'absolute top-0 bottom-0 opacity-30',
              isDeckA ? 'bg-[hsl(var(--deck-a))]' : 'bg-[hsl(var(--deck-b))]'
            )}
            style={{
              left: `${(loopStart / duration) * 100}%`,
              width: `${((loopEnd - loopStart) / duration) * 100}%`,
            }}
          />
        )}

        {/* Cue point markers */}
        {cuePoints.map((cue) => (
          <div
            key={cue.id}
            className="absolute top-0 bottom-0 w-1 z-10"
            style={{
              left: `${duration > 0 ? (cue.time / duration) * 100 : 0}%`,
              backgroundColor: cue.color,
            }}
            title={`CUE: ${formatTime(cue.time)}`}
          >
            <div
              className="absolute -top-0 left-0 w-3 h-3 -translate-x-1"
              style={{ 
                backgroundColor: cue.color,
                clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)',
              }}
            />
          </div>
        ))}

        {/* Playhead */}
        <div
          className={cn(
            'absolute top-0 bottom-0 w-0.5 z-20 transition-all',
            isDeckA ? 'bg-[hsl(var(--deck-a))]' : 'bg-[hsl(var(--deck-b))]',
            isPlaying && 'shadow-lg'
          )}
          style={{
            left: `${progressPercent}%`,
            boxShadow: isPlaying
              ? `0 0 8px 2px hsl(var(--deck-${isDeckA ? 'a' : 'b'}))`
              : undefined,
          }}
        />

        {/* Time overlay */}
        <div className="absolute bottom-1 left-2 text-xs font-mono text-foreground/70 bg-background/50 px-1 rounded">
          {formatTime(currentTime)}
        </div>
        <div className="absolute bottom-1 right-2 text-xs font-mono text-foreground/70 bg-background/50 px-1 rounded">
          -{formatTime(Math.max(0, duration - currentTime))}
        </div>
      </div>
    </div>
  );
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
