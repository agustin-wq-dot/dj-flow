import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Track, DeckState, DJMode, createEmptyDeckState } from '@/types/dj';
import { Deck } from './Deck';
import { Crossfader } from './Crossfader';
import { PlaylistSidebar } from './PlaylistSidebar';
import { Button } from '@/components/ui/button';
import { useDeck } from '@/hooks/useDeck';
import { ArrowLeft } from 'lucide-react';

interface DJModeViewProps {
  initialTracks: Track[];
  onBack: () => void;
}

export const DJModeView: React.FC<DJModeViewProps> = ({ initialTracks, onBack }) => {
  const [tracks, setTracks] = useState<Track[]>(initialTracks);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [nextTrackIndex, setNextTrackIndex] = useState(1);
  const [activeDeck, setActiveDeck] = useState<'A' | 'B'>('A');
  const [mode, setMode] = useState<DJMode>('automatic');
  const [crossfaderPosition, setCrossfaderPosition] = useState(-1);
  
  const [deckAState, setDeckAState] = useState<DeckState>(createEmptyDeckState);
  const [deckBState, setDeckBState] = useState<DeckState>(createEmptyDeckState);

  const deckADurationRef = useRef(0);
  const deckBDurationRef = useRef(0);

  const handleDeckAStateChange = useCallback((state: Partial<DeckState>) => {
    setDeckAState(prev => ({ ...prev, ...state }));
  }, []);

  const handleDeckBStateChange = useCallback((state: Partial<DeckState>) => {
    setDeckBState(prev => ({ ...prev, ...state }));
  }, []);

  const loadNextTrackOnDeck = useCallback((deck: 'A' | 'B') => {
    const nextIdx = deck === activeDeck ? nextTrackIndex : currentTrackIndex;
    if (nextIdx >= tracks.length) return;

    const track = tracks[nextIdx];
    if (deck === 'A') {
      deckA.loadTrack(track, false);
    } else {
      deckB.loadTrack(track, false);
    }

    if (deck !== activeDeck) {
      setCurrentTrackIndex(nextIdx);
      setNextTrackIndex(Math.min(nextIdx + 1, tracks.length - 1));
    }
  }, [activeDeck, currentTrackIndex, nextTrackIndex, tracks]);

  const handleDeckAEnded = useCallback(() => {
    if (mode === 'automatic' && tracks.length > 1) {
      // Switch to deck B
      setActiveDeck('B');
      setCrossfaderPosition(1);
      deckB.play();
      
      // Load next track on deck A
      const nextIdx = Math.min(nextTrackIndex + 1, tracks.length - 1);
      if (nextIdx < tracks.length) {
        const track = tracks[nextIdx];
        deckA.loadTrack(track, false);
        setNextTrackIndex(nextIdx);
      }
      setCurrentTrackIndex(prev => Math.min(prev + 1, tracks.length - 1));
    }
  }, [mode, tracks, nextTrackIndex]);

  const handleDeckBEnded = useCallback(() => {
    if (mode === 'automatic' && tracks.length > 1) {
      // Switch to deck A
      setActiveDeck('A');
      setCrossfaderPosition(-1);
      deckA.play();
      
      // Load next track on deck B
      const nextIdx = Math.min(nextTrackIndex + 1, tracks.length - 1);
      if (nextIdx < tracks.length) {
        const track = tracks[nextIdx];
        deckB.loadTrack(track, false);
        setNextTrackIndex(nextIdx);
      }
      setCurrentTrackIndex(prev => Math.min(prev + 1, tracks.length - 1));
    }
  }, [mode, tracks, nextTrackIndex]);

  const deckA = useDeck({
    deckId: 'A',
    onStateChange: handleDeckAStateChange,
    onEnded: handleDeckAEnded,
  });

  const deckB = useDeck({
    deckId: 'B',
    onStateChange: handleDeckBStateChange,
    onEnded: handleDeckBEnded,
  });

  // Calculate effective volumes based on crossfader
  const getEffectiveVolumes = useCallback(() => {
    // Crossfader: -1 = full A, 1 = full B
    const volumeA = deckAState.volume * Math.min(1, 1 - crossfaderPosition);
    const volumeB = deckBState.volume * Math.min(1, 1 + crossfaderPosition);
    return { volumeA, volumeB };
  }, [crossfaderPosition, deckAState.volume, deckBState.volume]);

  // Apply crossfader effect
  useEffect(() => {
    const { volumeA, volumeB } = getEffectiveVolumes();
    deckA.setVolume(volumeA);
    deckB.setVolume(volumeB);
  }, [crossfaderPosition, deckAState.volume, deckBState.volume]);

  // Initial load
  useEffect(() => {
    if (tracks.length > 0 && deckA.isReady) {
      const firstTrack = tracks[0];
      deckA.loadTrack(firstTrack, true);
      setCrossfaderPosition(-1);
      
      if (tracks.length > 1 && deckB.isReady) {
        const secondTrack = tracks[1];
        deckB.loadTrack(secondTrack, false);
        setNextTrackIndex(1);
      }
    }
  }, [deckA.isReady, deckB.isReady]);

  // Update track duration when loaded
  useEffect(() => {
    const interval = setInterval(() => {
      const durationA = deckA.getDuration();
      const durationB = deckB.getDuration();
      
      if (durationA > 0 && durationA !== deckADurationRef.current) {
        deckADurationRef.current = durationA;
        setDeckAState(prev => prev.track ? { ...prev, track: { ...prev.track, duration: durationA } } : prev);
      }
      
      if (durationB > 0 && durationB !== deckBDurationRef.current) {
        deckBDurationRef.current = durationB;
        setDeckBState(prev => prev.track ? { ...prev, track: { ...prev.track, duration: durationB } } : prev);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [deckA, deckB]);

  const handleRemoveTrack = useCallback((trackId: string) => {
    setTracks(prev => prev.filter(t => t.id !== trackId));
  }, []);

  const handleSelectTrack = useCallback((index: number) => {
    const track = tracks[index];
    if (!track) return;

    const targetDeck = activeDeck === 'A' ? 'B' : 'A';
    if (targetDeck === 'A') {
      deckA.loadTrack(track, false);
    } else {
      deckB.loadTrack(track, false);
    }
    setCurrentTrackIndex(index);
  }, [tracks, activeDeck, deckA, deckB]);

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    setTracks(prev => {
      const updated = [...prev];
      const [removed] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, removed);
      return updated;
    });
  }, []);

  const { volumeA, volumeB } = getEffectiveVolumes();

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-deck-a via-accent to-deck-b bg-clip-text text-transparent">
          DJ Mode
        </h1>
        <div className="w-24" />
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-[1fr_280px] gap-4">
        {/* Decks Area */}
        <div className="space-y-4">
          {/* Decks */}
          <div className="grid grid-cols-2 gap-6">
            <Deck
              deckId="A"
              containerId={deckA.containerId}
              state={deckAState}
              effectiveVolume={volumeA}
              onPlay={deckA.play}
              onPause={deckA.pause}
              onSeek={deckA.seekTo}
              onVolumeChange={(v) => setDeckAState(prev => ({ ...prev, volume: v }))}
              onPlaybackRateChange={deckA.setPlaybackRate}
              onToggleLoop={deckA.toggleLoop}
              onLoadNext={() => loadNextTrackOnDeck('A')}
            />
            <Deck
              deckId="B"
              containerId={deckB.containerId}
              state={deckBState}
              effectiveVolume={volumeB}
              onPlay={deckB.play}
              onPause={deckB.pause}
              onSeek={deckB.seekTo}
              onVolumeChange={(v) => setDeckBState(prev => ({ ...prev, volume: v }))}
              onPlaybackRateChange={deckB.setPlaybackRate}
              onToggleLoop={deckB.toggleLoop}
              onLoadNext={() => loadNextTrackOnDeck('B')}
            />
          </div>

          {/* Crossfader */}
          <Crossfader
            position={crossfaderPosition}
            mode={mode}
            onChange={setCrossfaderPosition}
            onModeChange={setMode}
          />
        </div>

        {/* Playlist Sidebar */}
        <PlaylistSidebar
          tracks={tracks}
          currentTrackIndex={currentTrackIndex}
          onRemoveTrack={handleRemoveTrack}
          onSelectTrack={handleSelectTrack}
          onReorder={handleReorder}
        />
      </div>
    </div>
  );
};
