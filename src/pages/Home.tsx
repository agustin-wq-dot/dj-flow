import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

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

  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentVideoId = playlist[currentIndex];

  // Load YouTube API once
  useEffect(() => {
    if (window.YT) return;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {};
  }, []);

  // Create / load player
  useEffect(() => {
    if (!currentVideoId || !window.YT || !containerRef.current) return;

    if (playerRef.current) {
      playerRef.current.loadVideoById(currentVideoId);
      return;
    }

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId: currentVideoId,
      playerVars: {
        autoplay: 1,
        controls: 1,
      },
      events: {
        onReady: (e: any) => e.target.playVideo(),
        onStateChange: (e: any) => {
          // ENDED = 0
          if (e.data === window.YT.PlayerState.ENDED) {
            setCurrentIndex((i) =>
              i + 1 < playlist.length ? i + 1 : i
            );
          }
        },
      },
    });
  }, [currentVideoId, playlist.length]);

  const loadPlaylist = () => {
    const ids = input
      .split('\n')
      .map(extractVideoId)
      .filter((v): v is string => Boolean(v));

    setPlaylist(ids);
    setCurrentIndex(0);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Auto-DJ</h1>

      {/* Input */}
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
          <div ref={containerRef} className="w-full h-full" />
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
