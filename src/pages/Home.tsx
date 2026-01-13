import React, { useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const extractVideoId = (url: string): string | null => {
  try {
    const u = new URL(url.trim());
    if (u.hostname.includes('youtube.com')) {
      return u.searchParams.get('v');
    }
    if (u.hostname === 'youtu.be') {
      return u.pathname.replace('/', '');
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

  const playerRef = useRef<any>(null);

  const currentVideoId = playlist[currentIndex];

  const loadPlaylist = () => {
    const ids = input
      .split('\n')
      .map(extractVideoId)
      .filter((v): v is string => Boolean(v));

    setPlaylist(ids);
    setCurrentIndex(0);
  };

  const onReady = (event: any) => {
    playerRef.current = event.target;
    event.target.playVideo();
  };

  const onEnd = () => {
    setCurrentIndex((prev) => {
      if (prev + 1 < playlist.length) {
        return prev + 1;
      }
      return prev; // fin de playlist
    });
  };

  useEffect(() => {
    if (playerRef.current && currentVideoId) {
      playerRef.current.loadVideoById(currentVideoId);
    }
  }, [currentVideoId]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Auto-DJ</h1>

      {/* Input playlist */}
      <div className="space-y-2">
        <Textarea
          placeholder={`Pegá una URL por línea\nhttps://www.youtube.com/watch?v=xxxx`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
        />
        <Button onClick={loadPlaylist}>Cargar playlist</Button>
      </div>

      {/* Player */}
      {currentVideoId && (
        <div className="aspect-video bg-black rounded overflow-hidden">
          <YouTube
            videoId={currentVideoId}
            onReady={onReady}
            onEnd={onEnd}
            opts={{
              width: '100%',
              height: '100%',
              playerVars: {
                autoplay: 1,
              },
            }}
          />
        </div>
      )}

      {/* Playlist visual */}
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
