import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeDeck, setActiveDeck] = useState<'A' | 'B'>('A');
  const [crossfadeSeconds, setCrossfadeSeconds] = useState(6);
  const [playersReady, setPlayersReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const deckARef = useRef<any>(null);
  const deckBRef = useRef<any>(null);
  const containerARef = useRef<HTMLDivElement>(null);
  const containerBRef = useRef<HTMLDivElement>(null);

  const fadeTimer = useRef<any>(null);
  const monitorTimer = useRef<any>(null);
  const readyCount = useRef(0);

  // Refs to track current state in callbacks
  const playlistRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const activeDeckRef = useRef<'A' | 'B'>('A');
  const crossfadeSecondsRef = useRef(6);
  const isFading = useRef(false);

  // Sync refs with state
  useEffect(() => { playlistRef.current = playlist; }, [playlist]);
  useEffect(() => { indexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { activeDeckRef.current = activeDeck; }, [activeDeck]);
  useEffect(() => { crossfadeSecondsRef.current = crossfadeSeconds; }, [crossfadeSeconds]);

  /* ================= YT API ================= */

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      initPlayers();
      return;
    }

    const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
    if (existingScript) {
      const checkReady = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkReady);
          initPlayers();
        }
      }, 100);
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

    const commonVars = {
      controls: 0,
      playsinline: 1,
      origin: window.location.origin,
    };

    deckARef.current = new window.YT.Player(containerARef.current, {
      playerVars: commonVars,
      events: {
        onReady: onPlayerReady,
        onStateChange: (e: any) => handlePlayerState(e, 'A'),
      },
    });

    deckBRef.current = new window.YT.Player(containerBRef.current, {
      playerVars: commonVars,
      events: {
        onReady: onPlayerReady,
        onStateChange: (e: any) => handlePlayerState(e, 'B'),
      },
    });
  };

  const onPlayerReady = (e: any) => {
    e.target.setVolume(0);
    readyCount.current += 1;
    if (readyCount.current === 2) {
      setPlayersReady(true);
    }
  };

  /* ================= PLAYER STATE HANDLER ================= */

  const handlePlayerState = useCallback((e: any, deck: 'A' | 'B') => {
    // Only handle events from the active deck
    if (deck !== activeDeckRef.current) return;

    const activePlayer = deck === 'A' ? deckARef.current : deckBRef.current;
    const nextPlayer = deck === 'A' ? deckBRef.current : deckARef.current;

    if (e.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      startMonitoring(activePlayer, nextPlayer);
    }

    if (e.data === window.YT.PlayerState.ENDED) {
      triggerCrossfade();
    }
  }, []);

  /* ================= MONITORING ================= */

  const startMonitoring = useCallback((from: any, to: any) => {
    clearInterval(monitorTimer.current);

    monitorTimer.current = setInterval(() => {
      if (!from || typeof from.getDuration !== 'function') return;
      
      const duration = from.getDuration();
      const current = from.getCurrentTime();
      
      if (!duration || duration <= 0) return;

      const remaining = duration - current;
      
      if (remaining <= crossfadeSecondsRef.current && remaining > 0 && !isFading.current) {
        clearInterval(monitorTimer.current);
        triggerCrossfade();
      }
    }, 300);
  }, []);

  /* ================= CROSSFADE ================= */

  const triggerCrossfade = useCallback(() => {
    if (isFading.current) return;

    const nextIdx = indexRef.current + 1;
    if (nextIdx >= playlistRef.current.length) {
      // End of playlist
      setIsPlaying(false);
      return;
    }

    isFading.current = true;

    const currentDeck = activeDeckRef.current;
    const fromPlayer = currentDeck === 'A' ? deckARef.current : deckBRef.current;
    const toPlayer = currentDeck === 'A' ? deckBRef.current : deckARef.current;

    // Load and prepare next track
    toPlayer.loadVideoById(playlistRef.current[nextIdx]);
    toPlayer.setVolume(0);

    let step = 0;
    const totalSteps = crossfadeSecondsRef.current * 10;

    fadeTimer.current = setInterval(() => {
      step++;

      const fadeOutVol = Math.max(0, 100 - (step * 100) / totalSteps);
      const fadeInVol = Math.min(100, (step * 100) / totalSteps);

      fromPlayer.setVolume(fadeOutVol);
      toPlayer.setVolume(fadeInVol);

      if (step >= totalSteps) {
        clearInterval(fadeTimer.current);
        fadeTimer.current = null;

        fromPlayer.stopVideo();
        fromPlayer.setVolume(0);
        
        // Switch active deck
        const newDeck = currentDeck === 'A' ? 'B' : 'A';
        setActiveDeck(newDeck);
        activeDeckRef.current = newDeck;
        
        setCurrentIndex(nextIdx);
        indexRef.current = nextIdx;
        
        isFading.current = false;

        // Start monitoring the new active player
        startMonitoring(toPlayer, fromPlayer);
      }
    }, 100);
  }, [startMonitoring]);

  /* ================= START PLAYBACK ================= */

  const startAutoDJ = useCallback(() => {
    // Parse playlist from input
    const ids = input
      .split('\n')
      .map(extractVideoId)
      .filter((v): v is string => Boolean(v));

    if (!ids.length) return;

    // Reset state
    setPlaylist(ids);
    playlistRef.current = ids;
    setCurrentIndex(0);
    indexRef.current = 0;
    setActiveDeck('A');
    activeDeckRef.current = 'A';
    isFading.current = false;

    clearInterval(monitorTimer.current);
    clearInterval(fadeTimer.current);

    // Start playback on Deck A
    const startPlayback = () => {
      if (deckARef.current && typeof deckARef.current.loadVideoById === 'function') {
        deckARef.current.loadVideoById(ids[0]);
        deckARef.current.setVolume(100);
      } else {
        setTimeout(startPlayback, 100);
      }
    };

    startPlayback();
  }, [input]);

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

      <div className="flex gap-2 items-center">
        <Button onClick={startAutoDJ} disabled={!playersReady || !input.trim()}>
          ▶ Play Auto-DJ
        </Button>
        {isPlaying && (
          <span className="text-sm text-muted-foreground">
            Track {currentIndex + 1} de {playlist.length}
          </span>
        )}
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
              {activeDeck === deck && isPlaying && (
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
