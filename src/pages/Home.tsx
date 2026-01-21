import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import SettingsPopup from '@/components/dj/SettingsPopup';
import { LiveQueue } from '@/components/dj/LiveQueue';
import { Track } from '@/types/Track';

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

// Fetch video metadata from noembed
const fetchVideoInfo = async (videoId: string): Promise<Partial<Track>> => {
  try {
    const response = await fetch(
      `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
    );
    const data = await response.json();
    
    return {
      title: data.title || 'Título desconocido',
      artist: data.author_name || undefined,
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    };
  } catch {
    return {
      title: 'Título desconocido',
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    };
  }
};

// YouTube player states
const YT_STATES: Record<number, string> = {
  [-1]: 'UNSTARTED',
  [0]: 'ENDED',
  [1]: 'PLAYING',
  [2]: 'PAUSED',
  [3]: 'BUFFERING',
  [5]: 'CUED',
};

const Home: React.FC = () => {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeDeck, setActiveDeck] = useState<'A' | 'B'>('A');
  const [crossfadeSeconds, setCrossfadeSeconds] = useState(60);
  const [triggerVolume, setTriggerVolume] = useState(70);
  const [skipIntroSeconds, setSkipIntroSeconds] = useState(2);
  const [playersReady, setPlayersReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAddingTrack, setIsAddingTrack] = useState(false);
  
  // Debug state
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [deckAState, setDeckAState] = useState({ state: 'INIT', time: 0, duration: 0, volume: 0 });
  const [deckBState, setDeckBState] = useState({ state: 'INIT', time: 0, duration: 0, volume: 0 });
  const [fadeProgress, setFadeProgress] = useState(0);
  const [nextTrackPreloaded, setNextTrackPreloaded] = useState(false);

  const deckARef = useRef<any>(null);
  const deckBRef = useRef<any>(null);
  const containerARef = useRef<HTMLDivElement>(null);
  const containerBRef = useRef<HTMLDivElement>(null);

  const fadeTimer = useRef<any>(null);
  const monitorTimer = useRef<any>(null);
  const debugTimer = useRef<any>(null);
  const readyCount = useRef(0);

  // Refs to track current state in callbacks
  const playlistRef = useRef<Track[]>([]);
  const indexRef = useRef(0);
  const activeDeckRef = useRef<'A' | 'B'>('A');
  const crossfadeSecondsRef = useRef(60);
  const triggerVolumeRef = useRef(70);
  const skipIntroSecondsRef = useRef(2);
  const isFading = useRef(false);
  const preloadedRef = useRef(false);

  // Debug log function
  const log = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[AutoDJ ${timestamp}] ${msg}`);
    setDebugLogs(prev => [...prev.slice(-19), `${timestamp} - ${msg}`]);
  }, []);

  // Sync refs with state
  useEffect(() => { playlistRef.current = playlist; }, [playlist]);
  useEffect(() => { indexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { activeDeckRef.current = activeDeck; }, [activeDeck]);
  useEffect(() => { crossfadeSecondsRef.current = crossfadeSeconds; }, [crossfadeSeconds]);
  useEffect(() => { triggerVolumeRef.current = triggerVolume; }, [triggerVolume]);
  useEffect(() => { skipIntroSecondsRef.current = skipIntroSeconds; }, [skipIntroSeconds]);

  // Debug timer to update deck states
  useEffect(() => {
    debugTimer.current = setInterval(() => {
      if (deckARef.current?.getPlayerState) {
        const state = deckARef.current.getPlayerState?.() ?? -1;
        const time = deckARef.current.getCurrentTime?.() ?? 0;
        const duration = deckARef.current.getDuration?.() ?? 0;
        const volume = deckARef.current.getVolume?.() ?? 0;
        setDeckAState({ state: YT_STATES[state] || 'UNKNOWN', time, duration, volume });
      }
      if (deckBRef.current?.getPlayerState) {
        const state = deckBRef.current.getPlayerState?.() ?? -1;
        const time = deckBRef.current.getCurrentTime?.() ?? 0;
        const duration = deckBRef.current.getDuration?.() ?? 0;
        const volume = deckBRef.current.getVolume?.() ?? 0;
        setDeckBState({ state: YT_STATES[state] || 'UNKNOWN', time, duration, volume });
      }
    }, 200);

    return () => clearInterval(debugTimer.current);
  }, []);

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
      log('✅ Ambos players listos');
    }
  };

  /* ================= PLAYER STATE HANDLER ================= */

  const handlePlayerState = useCallback((e: any, deck: 'A' | 'B') => {
    const stateName = YT_STATES[e.data] || 'UNKNOWN';
    
    // Log all state changes for debugging
    log(`Deck ${deck}: ${stateName}`);

    // Handle CUED state for preloaded track
    if (e.data === 5) { // CUED
      if (deck !== activeDeckRef.current) {
        log(`✅ Deck ${deck} precargado y listo`);
        setNextTrackPreloaded(true);
      }
    }

    // Only handle PLAYING events from the active deck for monitoring
    if (deck === activeDeckRef.current && e.data === 1) { // PLAYING
      setIsPlaying(true);
      log(`▶ Deck ${deck} reproduciendo, iniciando monitoreo`);
      startMonitoring();
    }
  }, []);

  /* ================= PRELOAD NEXT TRACK ================= */

  const preloadNextTrack = useCallback(() => {
    if (preloadedRef.current) return;
    
    const nextIdx = indexRef.current + 1;
    if (nextIdx >= playlistRef.current.length) {
      log('📋 No hay más tracks para precargar');
      return;
    }

    const inactivePlayer = activeDeckRef.current === 'A' 
      ? deckBRef.current 
      : deckARef.current;
    
    const inactiveDeck = activeDeckRef.current === 'A' ? 'B' : 'A';

    if (!inactivePlayer?.cueVideoById) return;

    const nextTrack = playlistRef.current[nextIdx];
    log(`📥 Precargando track ${nextIdx + 1} en Deck ${inactiveDeck}: ${nextTrack.title}`);
    
    // cueVideoById loads without playing
    inactivePlayer.cueVideoById(nextTrack.youtubeId);
    inactivePlayer.setVolume(0);
    preloadedRef.current = true;
  }, [log]);

  /* ================= MONITORING ================= */

  const startMonitoring = useCallback(() => {
    clearInterval(monitorTimer.current);
    preloadedRef.current = false;
    setNextTrackPreloaded(false);

    const activePlayer = activeDeckRef.current === 'A' ? deckARef.current : deckBRef.current;

    monitorTimer.current = setInterval(() => {
      if (!activePlayer || typeof activePlayer.getDuration !== 'function') return;
      
      const duration = activePlayer.getDuration();
      const current = activePlayer.getCurrentTime();
      
      if (!duration || duration <= 0) return;

      const remaining = duration - current;
      const preloadTime = crossfadeSecondsRef.current + 5;

      // Preload 5 seconds before crossfade starts
      if (remaining <= preloadTime && !preloadedRef.current) {
        preloadNextTrack();
      }
      
      // Trigger crossfade
      if (remaining <= crossfadeSecondsRef.current && remaining > 0 && !isFading.current) {
        clearInterval(monitorTimer.current);
        log(`⏱ Tiempo restante: ${remaining.toFixed(1)}s - Iniciando crossfade`);
        triggerCrossfade();
      }
    }, 300);
  }, [preloadNextTrack, log]);

  /* ================= CROSSFADE WITH TWO-PHASE EQUAL-POWER CURVE ================= */

  const triggerCrossfade = useCallback(() => {
    if (isFading.current) {
      log('⚠ Ya hay un crossfade en progreso');
      return;
    }

    const nextIdx = indexRef.current + 1;
    if (nextIdx >= playlistRef.current.length) {
      log('🏁 Fin de la playlist');
      setIsPlaying(false);
      return;
    }

    isFading.current = true;
    const nextTrack = playlistRef.current[nextIdx];
    log(`🔄 Crossfade: Track ${indexRef.current + 1} → Track ${nextIdx + 1} "${nextTrack.title}" (trigger: ${triggerVolumeRef.current}%)`);

    const currentDeck = activeDeckRef.current;
    const fromPlayer = currentDeck === 'A' ? deckARef.current : deckBRef.current;
    const toPlayer = currentDeck === 'A' ? deckBRef.current : deckARef.current;
    const toDeck = currentDeck === 'A' ? 'B' : 'A';

    // If not preloaded, load now (fallback)
    if (!preloadedRef.current) {
      log(`⚠ Track no precargado, cargando ahora en Deck ${toDeck}`);
      toPlayer.loadVideoById(nextTrack.youtubeId, skipIntroSecondsRef.current);
    } else {
      // Start playback of the preloaded (cued) video with skip intro
      log(`▶ Iniciando reproducción en Deck ${toDeck} (skip ${skipIntroSecondsRef.current}s)`);
      toPlayer.seekTo(skipIntroSecondsRef.current, true);
      toPlayer.playVideo();
    }
    
    toPlayer.setVolume(0);

    let step = 0;
    const totalSteps = crossfadeSecondsRef.current * 10; // 10 steps per second
    
    // triggerVolume = 85% significa: cuando el saliente baja a 85%, el entrante empieza a sonar fuerte
    // Phase 1: Saliente baja de 100% a triggerVolume%, entrante permanece en 0% (silencio)
    // Phase 2: Crossfade real con equal-power curve
    const triggerVol = triggerVolumeRef.current;
    // triggerPoint = proporción del tiempo donde saliente alcanza triggerVolume
    // Si triggerVolume = 85%, queremos que phase1 sea corta (solo bajar 15%)
    // Si triggerVolume = 10%, queremos que phase1 sea larga (bajar 90%)
    const triggerPoint = (100 - triggerVol) / 100;

    log(`📊 Crossfade config: duration=${crossfadeSecondsRef.current}s, triggerVol=${triggerVol}%, triggerPoint=${(triggerPoint * 100).toFixed(0)}%`);

    fadeTimer.current = setInterval(() => {
      step++;

      // Check if incoming player is buffering - pause fade if so
      const toPlayerState = toPlayer.getPlayerState?.() ?? -1;
      if (toPlayerState === 3) { // BUFFERING
        log('⏸ Pausando fade - buffering');
        return; // Skip this step, don't increment
      }

      // Progress ratio from 0 to 1
      const t = step / totalSteps;

      let fadeOutVol: number;
      let fadeInVol: number;

      if (t <= triggerPoint) {
        // Phase 1: Saliente baja de 100% a triggerVolume%, entrante permanece MUDO
        // Usamos curva lineal para esta fase de "preparación"
        const phase1Progress = t / triggerPoint;
        fadeOutVol = 100 - (100 - triggerVol) * phase1Progress;
        fadeInVol = 0; // Entrante todavía no suena
      } else {
        // Phase 2: Crossfade real con equal-power curve
        // Saliente: triggerVolume% → 0%
        // Entrante: 0% → 100%
        const phase2Progress = (t - triggerPoint) / (1 - triggerPoint);
        
        // Only start fade-in if incoming player is actually PLAYING
        if (toPlayerState !== 1) {
          // Not playing yet, maintain volumes
          fadeOutVol = triggerVol;
          fadeInVol = 0;
        } else {
          // Equal-power curves: cos para saliente, sin para entrante
          fadeOutVol = Math.cos(phase2Progress * Math.PI / 2) * triggerVol;
          fadeInVol = Math.sin(phase2Progress * Math.PI / 2) * 100;
        }
      }

      fromPlayer.setVolume(Math.round(fadeOutVol));
      toPlayer.setVolume(Math.round(fadeInVol));
      
      setFadeProgress(Math.round(t * 100));

      if (step >= totalSteps) {
        clearInterval(fadeTimer.current);
        fadeTimer.current = null;

        fromPlayer.stopVideo();
        fromPlayer.setVolume(0);
        
        // Ensure toPlayer is at full volume
        toPlayer.setVolume(100);
        
        // Switch active deck
        const newDeck = currentDeck === 'A' ? 'B' : 'A';
        setActiveDeck(newDeck);
        activeDeckRef.current = newDeck;
        
        setCurrentIndex(nextIdx);
        indexRef.current = nextIdx;
        
        isFading.current = false;
        preloadedRef.current = false;
        setNextTrackPreloaded(false);
        setFadeProgress(0);

        log(`✅ Crossfade completado - Deck ${newDeck} activo`);

        // Start monitoring the new active player
        startMonitoring();
      }
    }, 100);
  }, [startMonitoring, log]);

  /* ================= ADD TRACK TO QUEUE ================= */

  const addTrackToQueue = useCallback(async (url: string) => {
    const videoId = extractVideoId(url);
    if (!videoId) {
      log('⚠ URL inválida');
      return;
    }

    // Check for duplicates
    if (playlistRef.current.some(t => t.youtubeId === videoId)) {
      log('⚠ Track ya está en la cola');
      return;
    }

    setIsAddingTrack(true);
    
    try {
      const info = await fetchVideoInfo(videoId);
      const newTrack: Track = {
        id: `${videoId}-${Date.now()}`,
        youtubeId: videoId,
        source: 'youtube',
        title: info.title || 'Sin título',
        artist: info.artist,
        thumbnail: info.thumbnail,
      };

      setPlaylist(prev => [...prev, newTrack]);
      log(`➕ Track agregado: ${newTrack.title}`);

      // If this is the first track and not playing, start playback
      if (playlistRef.current.length === 0 && playersReady && !isPlaying) {
        setTimeout(() => {
          startPlaybackFromIndex(0);
        }, 100);
      }
    } catch (error) {
      log('⚠ Error al agregar track');
    } finally {
      setIsAddingTrack(false);
    }
  }, [playersReady, isPlaying, log]);

  /* ================= REMOVE TRACK FROM QUEUE ================= */

  const removeTrackFromQueue = useCallback((trackId: string) => {
    const trackIndex = playlistRef.current.findIndex(t => t.id === trackId);
    if (trackIndex === -1) return;

    // Don't remove currently playing or past tracks
    if (trackIndex <= indexRef.current) {
      log('⚠ No se puede eliminar el track actual o pasado');
      return;
    }

    setPlaylist(prev => prev.filter(t => t.id !== trackId));
    log(`🗑 Track eliminado`);
  }, [log]);

  /* ================= START PLAYBACK ================= */

  const startPlaybackFromIndex = useCallback((startIndex: number) => {
    if (playlistRef.current.length === 0) return;

    log(`🎵 Iniciando playback desde track ${startIndex + 1}`);

    setCurrentIndex(startIndex);
    indexRef.current = startIndex;
    setActiveDeck('A');
    activeDeckRef.current = 'A';
    isFading.current = false;
    preloadedRef.current = false;
    setNextTrackPreloaded(false);
    setFadeProgress(0);

    clearInterval(monitorTimer.current);
    clearInterval(fadeTimer.current);

    const track = playlistRef.current[startIndex];
    
    if (deckARef.current && typeof deckARef.current.loadVideoById === 'function') {
      log(`▶ Cargando track en Deck A: ${track.title}`);
      deckARef.current.loadVideoById(track.youtubeId, skipIntroSecondsRef.current);
      deckARef.current.setVolume(100);
    }
  }, [log]);

  /* ================= UI ================= */

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getTimeRemaining = (state: { time: number; duration: number }) => {
    if (!state.duration) return '--:--';
    return formatTime(state.duration - state.time);
  };

  const currentTrack = playlist[currentIndex];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Auto-DJ</h1>
        <SettingsPopup
          crossfadeDuration={crossfadeSeconds}
          onCrossfadeDurationChange={setCrossfadeSeconds}
          triggerVolume={triggerVolume}
          onTriggerVolumeChange={setTriggerVolume}
          skipIntroSeconds={skipIntroSeconds}
          onSkipIntroSecondsChange={setSkipIntroSeconds}
        />
      </div>

<!--      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6"> -->
      <div className="flex flex-col gap-6">
        {/* Left: Decks */}
        <div className="space-y-6">
          {/* Status bar */}
          <div className="flex gap-2 items-center flex-wrap">
            {!playersReady && (
              <span className="text-sm text-muted-foreground">
                Cargando players...
              </span>
            )}
            {isPlaying && currentTrack && (
              <span className="text-sm text-muted-foreground">
                Track {currentIndex + 1} de {playlist.length}: <span className="text-foreground font-medium">{currentTrack.title}</span>
              </span>
            )}
            {isFading.current && (
              <span className="text-sm text-primary font-medium">
                🔄 Crossfade: {fadeProgress}%
              </span>
            )}
            {nextTrackPreloaded && !isFading.current && (
              <span className="text-sm text-green-500">
                ✓ Siguiente precargado
              </span>
            )}
          </div>

          {/* Decks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(['A', 'B'] as const).map((deck) => {
              const deckState = deck === 'A' ? deckAState : deckBState;
              const isActive = activeDeck === deck;
              
              return (
                <div
                  key={deck}
                  className={cn(
                    'rounded-xl border p-3 space-y-2',
                    isActive && isPlaying
                      ? 'border-green-500 bg-green-500/5'
                      : 'border-muted'
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-semibold">
                      Deck {deck}{' '}
                      {isActive && isPlaying && (
                        <span className="text-green-500">(ON AIR)</span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">
                      {deckState.state}
                    </div>
                  </div>

                  <div className="aspect-video bg-black rounded overflow-hidden">
                    <div
                      ref={deck === 'A' ? containerARef : containerBRef}
                      className="w-full h-full"
                    />
                  </div>

                  {/* Deck stats */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-muted/50 rounded p-2">
                      <div className="text-muted-foreground">Tiempo</div>
                      <div className="font-mono">{formatTime(deckState.time)}</div>
                    </div>
                    <div className="bg-muted/50 rounded p-2">
                      <div className="text-muted-foreground">Restante</div>
                      <div className="font-mono">{getTimeRemaining(deckState)}</div>
                    </div>
                    <div className="bg-muted/50 rounded p-2">
                      <div className="text-muted-foreground">Volumen</div>
                      <div className="font-mono">{Math.round(deckState.volume)}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Debug panel */}
          <div className="border rounded-lg p-3 bg-muted/30">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-sm">Debug Log</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setDebugLogs([])}
                className="h-6 text-xs"
              >
                Limpiar
              </Button>
            </div>
            <div className="h-32 overflow-y-auto font-mono text-xs space-y-0.5">
              {debugLogs.length === 0 ? (
                <div className="text-muted-foreground">Sin logs aún...</div>
              ) : (
                debugLogs.map((logEntry, i) => (
                  <div key={i} className="text-muted-foreground">
                    {logEntry}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Live Queue */}
        <LiveQueue
          tracks={playlist}
          currentIndex={currentIndex}
          onRemoveTrack={removeTrackFromQueue}
          onAddTrack={addTrackToQueue}
          isLoading={isAddingTrack}
        />
      </div>
    </div>
  );
};

export default Home;
