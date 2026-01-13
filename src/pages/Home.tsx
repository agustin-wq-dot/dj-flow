import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const extractVideoId = (url: string): string | null => {
  try {
    const u = new URL(url.trim());
    if (u.hostname.includes('youtube.com')) {
      return u.searchParams.get('v');
    }
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1);
    }
    return null;
  } catch {
    return null;
  }
};

const Home: React.FC = () => {
  const [input, setInput] = useState('');
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentVideoId = playlist[currentIndex];

  const loadPlaylist = () => {
    const ids = input
      .split('\n')
      .map(extractVideoId)
      .filter((v): v is string => Boolean(v));

    setPlaylist(ids);
    setCurrentIndex(0);
  };

  // Auto-advance (cuando cambia index, se recarga iframe)
  useEffect(() => {
    if (!currentVideoId) return;

    const timer = setTimeout(() => {
      // fallback simple: 4 minutos
      setCurrentIndex((i) =>
        i + 1 < playlist.length ? i + 1 : i
      );
    }, 240000);

    return () => clearTimeout(timer);
  }, [currentVideoId, playlist.length]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Auto-DJ</h1>

      {/* Playlist input */}
      <div className="space-y-2">
        <Textarea
          rows={6}
          placeholder={`Pegá una URL por línea\nhttps://www.youtube.com/watch?v=xxxx`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button onClick={loadPlaylist}>
          Cargar playlist
        </Button>
      </div>

      {/* Player */}
      {currentVideoId && (
        <div className="aspect-video bg-black rounded overflow-hidden">
          <iframe
            key={currentVideoId}
            src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&controls=1`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )}

      {/* Playlist */}
      {playlist.length > 0 && (
        <div className="space-y-1 text-sm">
          {playlist.map((id, i) => (
            <div
              key={id}
              className={`px-2 py-1 rounded ${
                i === currentIndex
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {i + 1}. {id}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
