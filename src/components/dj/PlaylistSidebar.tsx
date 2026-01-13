import React from 'react';
import { Track } from '@/types/dj';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, GripVertical, Music } from 'lucide-react';

interface PlaylistSidebarProps {
  tracks: Track[];
  currentTrackIndex: number;
  onRemoveTrack: (trackId: string) => void;
  onSelectTrack: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export const PlaylistSidebar: React.FC<PlaylistSidebarProps> = ({
  tracks,
  currentTrackIndex,
  onRemoveTrack,
  onSelectTrack,
}) => {
  return (
    <div className="h-full flex flex-col bg-sidebar rounded-xl border border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border">
        <h3 className="font-semibold flex items-center gap-2">
          <Music className="h-4 w-4" />
          Playlist ({tracks.length})
        </h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {tracks.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No hay tracks en la playlist
            </div>
          ) : (
            tracks.map((track, index) => (
              <div
                key={track.id}
                className={`
                  flex items-center gap-2 p-2 rounded-lg cursor-pointer
                  transition-colors hover:bg-sidebar-accent
                  ${index === currentTrackIndex ? 'bg-sidebar-accent border border-primary/30' : ''}
                `}
                onClick={() => onSelectTrack(index)}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 cursor-grab" />
                
                <img
                  src={track.thumbnail || `https://img.youtube.com/vi/${track.youtubeId}/mqdefault.jpg`}
                  alt={track.title}
                  className="w-12 h-9 object-cover rounded"
                />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{track.title}</p>
                  {index === currentTrackIndex && (
                    <span className="text-xs text-primary">Reproduciendo</span>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveTrack(track.id);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
