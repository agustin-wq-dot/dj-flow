import React, { useState, useCallback } from 'react';
import { DeckState, CuePoint, EQSettings, extractVideoId } from '@/types/dj';
import { Track } from '@/types/Track';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeckControls } from './DeckControls';
import { useDeck } from '@/hooks/useDeck';

interface ManualDeckProps {
  deckId: 'A' | 'B';
  state: DeckState;
  onStateChange: (state: Partial<DeckState>) => void;
  effectiveVolume: number;
}

export const ManualDeck: React.FC<ManualDeckProps> = ({
  deckId,
  state,
  onStateChange,
  effectiveVolume,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const isDeckA = deckId === 'A';
  const gradientClass = isDeckA ? 'deck-gradient-a' : 'deck-gradient-b';
  const borderColorClass = isDeckA 
    ? 'border-[hsl(var(--deck-a)/0.3)]' 
    : 'border-[hsl(var(--deck-b)/0.3)]';
  const textColorClass = isDeckA 
    ? 'text-[hsl(var(--deck-a))]' 
    : 'text-[hsl(var(--deck-b))]';

  const deck = useDeck({
    deckId,
    onStateChange: (newState) => {
      onStateChange(newState);
      // Update duration when ready
      if (newState.isReady) {
        const duration = deck.getDuration();
        if (duration > 0) {
          onStateChange({ duration });
        }
      }
    },
  });

  const handleLoadTrack = useCallback(async () => {
    const videoId = extractVideoId(urlInput);
    if (!videoId) return;

    setIsLoading(true);
    
    // Fetch track info
    try {
      const response = await fetch(
        `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
      );
      const data = await response.json();
      
      const track: Track = {
        id: `${videoId}-${Date.now()}`,
        youtubeId: videoId,
        source: 'youtube',
        title: data.title || 'Unknown Track',
        artist: data.author_name || 'Unknown Artist',
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      };
      
      deck.loadTrack(track, false);
      setUrlInput('');
    } catch (error) {
      console.error('Error loading track:', error);
    } finally {
      setIsLoading(false);
    }
  }, [urlInput, deck]);

  const handleSetCue = useCallback(() => {
    const newCue: CuePoint = {
      id: `cue-${Date.now()}`,
      time: state.currentTime,
      color: ['#ef4444', '#f97316', '#eab308', '#22c55e'][state.cuePoints.length % 4],
    };
    onStateChange({
      cuePoints: [...state.cuePoints.slice(0, 3), newCue].slice(0, 4),
    });
  }, [state.currentTime, state.cuePoints, onStateChange]);

  const handleJumpToCue = useCallback((cueId: string) => {
    const cue = state.cuePoints.find(c => c.id === cueId);
    if (cue) {
      deck.seekTo(cue.time);
    }
  }, [state.cuePoints, deck]);

  const handleEqChange = useCallback((eq: EQSettings) => {
    onStateChange({ eq });
    // Note: EQ would need Web Audio API for real implementation
  }, [onStateChange]);

  const handleTrimChange = useCallback((trim: number) => {
    onStateChange({ trim });
  }, [onStateChange]);

  const handleBpmChange = useCallback((bpm: number) => {
    onStateChange({ bpm: Math.max(60, Math.min(180, bpm)) });
  }, [onStateChange]);

  // Update volume with trim applied - only when player is ready
  React.useEffect(() => {
    if (!deck.isReady) return;
    const finalVolume = state.volume * state.trim * effectiveVolume;
    deck.setVolume(finalVolume);
  }, [state.volume, state.trim, effectiveVolume, deck.isReady, deck]);

  return (
    <div className={cn(
      'rounded-xl border p-4 space-y-4',
      gradientClass,
      borderColorClass
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={cn('font-bold text-xl', textColorClass)}>
          Deck {deckId}
        </h2>
        {state.isReady && (
          <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
            Ready
          </span>
        )}
      </div>

      {/* Track Load Section */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="YouTube URL or Video ID"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLoadTrack()}
            className="flex-1"
          />
          <Button 
            onClick={handleLoadTrack} 
            disabled={!urlInput || isLoading}
            variant="secondary"
          >
            <Upload className="h-4 w-4 mr-1" />
            Load
          </Button>
        </div>
      </div>

      {/* YouTube Player Container */}
      <div className="aspect-video bg-black/50 rounded-lg overflow-hidden relative">
        <div id={deck.containerId} className="w-full h-full" />
        {!state.track && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <Music2 className="h-12 w-12 mb-2 opacity-50" />
            <span className="text-sm">Load a track to begin</span>
          </div>
        )}
      </div>

      {/* Track Info */}
      {state.track && (
        <div className="flex items-center gap-3 p-2 bg-card/50 rounded-lg">
          {state.track.thumbnail && (
            <img 
              src={state.track.thumbnail} 
              alt="" 
              className="w-12 h-12 rounded object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{state.track.title}</div>
            <div className="text-sm text-muted-foreground truncate">
              {state.track.artist}
            </div>
          </div>
        </div>
      )}

      {/* Deck Controls */}
      <DeckControls
        deckId={deckId}
        state={state}
        onPlay={deck.play}
        onPause={deck.pause}
        onSeek={deck.seekTo}
        onVolumeChange={(v) => onStateChange({ volume: v })}
        onPlaybackRateChange={deck.setPlaybackRate}
        onToggleLoop={deck.toggleLoop}
        onSetCue={handleSetCue}
        onJumpToCue={handleJumpToCue}
        onBpmChange={handleBpmChange}
        onEqChange={handleEqChange}
        onTrimChange={handleTrimChange}
      />

      {/* Effective Volume Meter */}
      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">Output Level</span>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-100',
              isDeckA ? 'bg-[hsl(var(--deck-a))]' : 'bg-[hsl(var(--deck-b))]'
            )}
            style={{ width: `${effectiveVolume * state.volume * state.trim * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
