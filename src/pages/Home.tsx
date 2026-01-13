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

const CROSSFADE_SECONDS = 6;

const Home: React.FC = () => {
  const [input, setInput] = useState('');
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [activeDeck, setActiveDeck] = useState<'A' | 'B'>('A');
  const [started, setStarted] = useState(false);

  const [readyA, setReadyA] = useState(false);
  const [readyB, setReadyB] = useState(false);

  const deckARef = useRef<any>(null);
  const deckBRef = useRef<any>(null);

  const containerARef = useRef<HTMLDivElement>(null);
  const containerBRef = useRef<HTMLDivElement>(null);

  const fadeRef = useRef<any>(null);

  // Load YouTube API
  useEffect(() => {
    if (window.YT) return;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {};
  }, []);

  // Init players
  useEffect(() => {
    if (!window.YT || !containerARef.current || !containerBRef.current) return;
    if (deckARef.current || deckBRef.current) return;

    deckARef.current = new window.YT.Player(containerARef.current, {
      playerVars: { autoplay: 0, controls: 0 },
      events: {
        onReady: () => setReadyA(true),
      },
    });

    deckBRef.current = new window.YT.Player(containerBRef.current, {
      playerVars: { autoplay: 0, controls: 0 },
      events: {
        onReady: () => setReadyB(true),
      },
    });
  }, []);

  // Monitor crossfade
  useEffect(() => {
    if (!started) return;

    const interval = setInterval(() => {
      const active =
        activeDeck === 'A' ? deckARef.current : deckBRef.current;
      const next =
        activeDeck === 'A' ? deckBRef.current : deckARef.current;

      if (!active || !next) return;

      const duration = active.getDuration?.();
      const current = active.getCurrentTime?.();

      if (!duration || !current) return;

      if (duration - current <= CROSSFADE_SECONDS && !fadeRef.current) {
        startCrossfade(active, next);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [activeDeck, index, started]);

  const startCrossfade = (from: any, to: any) => {
    const nextIndex = index + 1;
    if (nextIndex >= playlist.length) return;

    to.loadVideoById(playlist[nextIndex]);
    to.setVolume(0);
    to.playVideo();

    let step = 0;
    const steps = CROSSFADE_SECONDS * 10;

    fadeRef.current = setInterval(() => {
      step++;

      from.setVolume(Math.max(0, 100 - (step * 100) / steps));
      to.setVolume(Math.min(100, (step * 100) / steps));

      if (step >= steps) {
        clearInterval(fadeRef.current);
        fadeRef.current = null;

        from.stopVideo();
        setIndex(nextIndex);
        setActiveDeck((d) => (d === 'A' ? 'B' : 'A'));
      }
    }, 100);
  };

  const loadPlaylist = () => {
    const ids = input
      .split('\n')
      .map(extractVideoId)
      .filter((v): v is string => Boolean(v));

    setPlaylist(ids);
    setIndex(0);
    setActiveDeck('A');
    setStarted(false);
  };

  const startAutoDJ = () => {
    if (!playlist.length) return;
    if (!readyA) return;

    const player = deckARef.current;
    if (!player) return;

    player.loadVideoById(playlist[0]);
    player.setVolume(100);
    player.playVideo();

    setStarted(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Auto-DJ</h1>

      <div className="space-y-2">
        <Textarea
          rows={6}
          placeholder="Pegá una URL por línea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="flex gap-2">
          <Button onClick={loadPlaylist}>Cargar playlist</Button>
          <Button
            onClick={startAutoDJ}
            disabled={!playlist.length || !readyA || started}
          >
            ▶ Play Auto-DJ
          </Button>
        </div>
      </div>

      {/* Players invisibles */}
      <div className="hidden">
        <div ref={containerARef} />
        <div ref={containerBRef} />
      </div>

      {playlist.length > 0 && (
        <div className="text-sm space-y-1">
          {playlist.map((id, i) => (
            <div
              key={id}
              className={`px-2 py-1 rounded ${
                i === index
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {i + 1}. {id}
              {i === index && ` (Deck ${activeDeck})`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
