import React, { useState } from 'react';
import { Track } from '@/types/Track';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Music, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveQueueProps {
  tracks: Track[];
  currentIndex: number;
  onRemoveTrack: (trackId: string) => void;
  onAddTrack: (url: string) => void;
  isLoading?: boolean;
}

export const LiveQueue: React.FC<LiveQueueProps> = ({
  tracks,
  currentIndex,
  onRemoveTrack,
  onAddTrack,
  isLoading = false,
}) => {
  const [showAddInput, setShowAddInput] = useState(false);
  const [newUrl, setNewUrl] = useState('');

  const handleAdd = () => {
    if (newUrl.trim()) {
      onAddTrack(newUrl.trim());
      setNewUrl('');
      setShowAddInput(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    } else if (e.key === 'Escape') {
      setShowAddInput(false);
      setNewUrl('');
    }
  };

  return (
    <div className="border rounded-xl p-4 bg-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Cola en Vivo</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {tracks.length} tracks
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddInput(!showAddInput)}
          className="h-8 gap-1"
        >
          <Plus className="h-4 w-4" />
          Agregar
        </Button>
      </div>

      {/* Add track input */}
      {showAddInput && (
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Pegar URL de YouTube..."
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1"
          />
          <Button onClick={handleAdd} size="sm" disabled={!newUrl.trim() || isLoading}>
            {isLoading ? '...' : 'Agregar'}
          </Button>
        </div>
      )}

      {/* Track list */}
      <ScrollArea className="h-[300px]">
        <div className="space-y-2 pr-2">
          {tracks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              La cola está vacía. Agregá tracks para empezar.
            </div>
          ) : (
            tracks.map((track, index) => {
              const isCurrent = index === currentIndex;
              const isPast = index < currentIndex;

              return (
                <div
                  key={track.id}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-lg transition-all',
                    isCurrent && 'bg-primary/10 border border-primary/30',
                    isPast && 'opacity-50',
                    !isCurrent && !isPast && 'hover:bg-muted/50'
                  )}
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                    {track.thumbnail ? (
                      <img
                        src={track.thumbnail}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Volume2 className="h-4 w-4 text-primary animate-pulse" />
                      </div>
                    )}
                  </div>

                  {/* Track info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-primary bg-primary/20 px-1.5 py-0.5 rounded uppercase">
                          ON AIR
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {index + 1}.
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate" title={track.title}>
                      {track.title}
                    </p>
                    {track.artist && (
                      <p className="text-xs text-muted-foreground truncate">
                        {track.artist}
                      </p>
                    )}
                  </div>

                  {/* Remove button (not for current or past) */}
                  {!isCurrent && !isPast && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 flex-shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                      onClick={() => onRemoveTrack(track.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default LiveQueue;
