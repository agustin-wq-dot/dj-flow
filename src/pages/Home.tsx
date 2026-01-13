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
  const [started, setStarted] = useState(false);
  const [crossfadeSeconds, setCrossfadeSeconds] = useState(6);

  const deckARef = useRef<any>(null);
  const deckBRef = useRef<any>(null);

  const containerARef = useRef<HTMLDivElement>(null);
  const containerBRef = useRef<HTMLDivElement>(null);

  const fadeTimer = useRef<any>(null);
  const monitorTimer = useRef<any>(null);

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
      playerVars: { controls: 0 },
      events: { onStateChange: onStateChangeA },
    });

    deckBRef.current = new window.YT.Player(containerBRef.current, {
      playerVars: { controls: 0 },
      events: { onStateChange: onStateChangeB },
    });
  };

  /* ================= STATE CHANGE ================= */

  const onStateChangeA = (e: any) => {
    if (activeDeck !== 'A') return;
    handleStateChange(e, deckARef.current, deckBRef.current);
  };

  const onStateChangeB = (e: any) => {
    if (activeDeck !== 'B') return;
    handleStateChange(e, deckBRef.current, deckARef.current);
  };

  const handleStateChange = (e: any, from: any, to: any) => {
    if (e.data === window.YT.PlayerState.PLAYING) {
      startMonitoring(from, to);
    }

    if (e.data === window.YT.PlayerState.ENDED) {
      forceNext(from, to);
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

    to.loadVideoById(playlist[nextIndex]);
    to.setVolume(0);
    to.playVideo();

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

  const forceNext = (from: any, to: any) => {
    if (fadeTimer.current) return;
    startCrossfade(from, to);
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
    setStarted(false);
  };

  const startAutoDJ = () => {
    if (!playlist.length || !deckARef.current) return;

    deckARef.current.loadVideoById(playlist[0]);
    deckARef.current.setVolume(100);
    deckARef.current.playVideo();
    setStarted(true);
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
        <Button onClick={startAutoDJ}>▶ Play Auto-DJ</Button>
      </div>

      {/* ===== DECKS ===== */}
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
