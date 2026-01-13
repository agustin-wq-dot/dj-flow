import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const extractVideoId = (url: string): string | null => {
  try {
    const u = new URL(url.trim());
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
    if (u.hostname === 'youtu.be') return u.pathname.slice(1);
    return null;
  } catch {
    return null;
  }
};

const Home: React.FC = () => {
  const [input, setInput] = useState('');
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [activeDeck, setActiveDeck] = useState<'A' | 'B'>('A');
  const [crossfadeSeconds, setCrossfadeSeconds] = useState(6);
  const [playersReady, setPlayersReady] = useState(false);

  const deckARef = useRef<any>(null);
  const deckBRef = useRef<any>(null);

  const containerARef = useRef<HTMLDivElement>(null);
  const containerBRef = useRef<HTMLDivElement>(null);

  const fadeTimer = useRef<any>(null);
  const monitorTimer = useRef<any>(null);

  const readyCount = useRef(0);
  const pendingPlayRef = useRef<'A' | 'B' | null>(null);

  /* ================= YT API ================= */

  useEffect(() => {
    if (window.YT) {
      initPlayers();
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = initPlayers;
  }, []);

  const initPlayers = () => {
    if (!containerARef.current || !containerBRef.current) return;
    if (deckARef.current || deckBRef.current) return;

    deckARef.current = new window.YT.Player(containerARef.current, {
      playerVars: { controls: 0, playsinline: 1 },
      events: {
        onReady: onPlayerReady,
        onStateChange: (e: any) => onStateChange(e, 'A'),
      },
    });

    deckBRef.current = new window.YT.Player(containerBRef.current, {
      playerVars: { controls: 0, playsinline: 1 },
      events: {
        onReady: onPlayerReady,
        onStateChange: (e: any) => onStateChange(e, 'B'),
      },
    });
  };

  const onPlayerReady = () => {
    readyCount.current += 1;
    if (readyCount.current === 2) {
      setPlayersReady(true);
    }
  };

  /* ================= STATE CHANGE ================= */

  const onStateChange = (e: any, deck: 'A' | 'B') => {
    const player = deck === 'A' ? deckARef.current : deckBRef.current;
    const other = deck === 'A' ? deckBRef.current : deckARef.current;

    if (e.data === window.YT.PlayerState.CUED && pendingPlayRef.current === deck) {
      pendingPlayRef.current = null;
      player.playVideo();
      return;
    }

    if (deck !== activeDeck) return;

    if (e.data === window.YT.PlayerState.PLAYING) {
      startMonitoring(player, other);
    }

    if (e.data === window.YT.PlayerState.ENDED) {
      startCrossfade(player, other);
    }
  };

  /* ================= AUTO DJ ================= */

  const startMonitoring = (from: any, to: any) => {
    clearInterval(monitorTimer.current);

    monitorTimer.current = setInterval(() => {
      const duration = from.getDuration();
      const current = from.getCurrentTime();
      if (!duration || !current) return;

      if (duration - current <= crossfadeSeconds) {
        clearInterval(monitorTimer.current);
        startCrossfade(from, to);
      }
    }, 500);
  };

  const startCrossfade = (from: any, to: any) => {
    if (fadeTimer.current) return;

    const nextIndex = index + 1;
    if (nextIndex >= playlist.length) return;

    pendingPlayRef.current = activeDeck === 'A' ? 'B' : 'A';

    to.cueVideoById(playlist[nextIndex]);
    to.setVolume(0);

    let step = 0;
    const steps = crossfadeSeconds * 10;

    fadeTimer.current = setInterval(() => {
      step++;

      from.setVolume(Math.max(0, 100 - (step * 100) / steps));
      to.setVolume(Math.min(100, (step * 100) / steps));

      if (step >= steps) {
        clearInterval(fadeTimer.current);
        fadeTimer.current = null;

        from.stopVideo();
        setIndex(nextIndex);
        setActiveDeck((d) => (d === 'A' ? 'B' : 'A'));
      }
    }, 100);
  };

  /* ================= CONTROLES ================= */

  const loadPlaylist = () => {
    const ids = input
      .split('\n')
      .map(extractVideoId)
      .filter((v): v is string => Boolean(v));

    setPlaylist(ids);
    setIndex(0);
    setActiveDeck('A');
  };

  const startAutoDJ = () => {
    if (!playersReady || !playlist.length) return;

    deckARef.current.loadVideoById(playlist[0]);
    deckARef.current.setVolume(100);
    deckARef.current.playVideo();
  };

  /* ================= UI ================= */

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Auto-DJ</h1>

      <Textarea
        rows={5}
        placeholder="Pegá una URL de YouTube por línea"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Crossfade: {crossfadeSeconds}s
        </label>
        <Slider
          min={2}
          max={20}
          step={1}
          value={[crossfadeSeconds]}
          onValueChange={([v]) => setCrossfadeSeconds(v)}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={loadPlaylist}>Cargar playlist</Button>
        <Button onClick={startAutoDJ} disabled={!playersReady}>
          ▶ Play Auto-DJ
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(['A', 'B'] as const).map((deck) => (
          <div
            key={deck}
            className={cn(
              'rounded-xl border p-3 space-y-2',
              activeDeck === deck
                ? 'border-green-500 bg-green-500/5'
                : 'border-muted'
            )}
          >
            <div className="font-semibold">
              Deck {deck}{' '}
              {activeDeck === deck && (
                <span className="text-green-500">(ON AIR)</span>
              )}
            </div>

            <div className="aspect-video bg-black rounded overflow-hidden">
              <div
                ref={deck === 'A' ? containerARef : containerBRef}
                className="w-full h-full"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
