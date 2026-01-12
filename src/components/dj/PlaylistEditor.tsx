import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { usePlaylist } from '@/hooks/usePlaylist';
import { Track } from '@/types/dj';
import { Plus, Trash2, Play, Music } from 'lucide-react';
import { toast } from 'sonner';

interface PlaylistEditorProps {
  onStartDJ: (tracks: Track[]) => void;
}

export const PlaylistEditor: React.FC<PlaylistEditorProps> = ({ onStartDJ }) => {
  const [input, setInput] = useState('');
  const { tracks, isLoading, addTracks, removeTrack, clearPlaylist } = usePlaylist();

  const handleAddTracks = async () => {
    if (!input.trim()) return;
    
    const count = await addTracks(input);
    if (count > 0) {
      toast.success(`${count} track(s) agregado(s)`);
      setInput('');
    } else {
      toast.error('No se encontraron videos válidos');
    }
  };

  const handleStartDJ = () => {
    if (tracks.length < 1) {
      toast.error('Agrega al menos 1 track para comenzar');
      return;
    }
    onStartDJ(tracks);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-deck-a via-accent to-deck-b bg-clip-text text-transparent">
            DJ Web App
          </h1>
          <p className="text-muted-foreground">
            Pega links de YouTube para crear tu playlist
          </p>
        </div>

        {/* Input Section */}
        <div className="space-y-4 p-6 rounded-xl bg-card border border-border">
          <Textarea
            placeholder="Pega tus links de YouTube aquí (uno por línea o separados por coma)

Ejemplo:
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/abcdef12345"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[150px] resize-none bg-input"
          />
          
          <div className="flex gap-3">
            <Button
              onClick={handleAddTracks}
              disabled={isLoading || !input.trim()}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                'Cargando...'
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Tracks
                </>
              )}
            </Button>
            
            {tracks.length > 0 && (
              <Button
                variant="destructive"
                onClick={clearPlaylist}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Playlist Preview */}
        {tracks.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Music className="h-5 w-5" />
                Tu Playlist ({tracks.length} tracks)
              </h2>
              
              <Button
                size="lg"
                onClick={handleStartDJ}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Play className="h-5 w-5 mr-2" />
                Iniciar DJ Mode
              </Button>
            </div>

            <div className="grid gap-3">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <span className="text-muted-foreground font-mono w-8 text-right">
                    {index + 1}
                  </span>
                  
                  <img
                    src={track.thumbnail}
                    alt={track.title}
                    className="w-20 h-12 object-cover rounded"
                  />
                  
                  <p className="flex-1 font-medium truncate">{track.title}</p>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTrack(track.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {tracks.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Music className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p>Tu playlist está vacía</p>
            <p className="text-sm">Agrega algunos links de YouTube para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
};
