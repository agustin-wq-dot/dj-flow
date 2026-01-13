import React, { useState } from 'react';
import { Track } from '@/types/dj';
import { PlaylistEditor } from '@/components/dj/PlaylistEditor';
import { DJModeView } from '@/components/dj/DJModeView';

export default function Index() {
  const [mode, setMode] = useState<'editor' | 'dj'>('editor');
  const [tracks, setTracks] = useState<Track[]>([]);

  const handleStartDJ = (selectedTracks: Track[]) => {
    setTracks(selectedTracks);
    setMode('dj');
  };

  const handleBack = () => {
    setMode('editor');
  };

  if (mode === 'dj') {
    return <DJModeView initialTracks={tracks} onBack={handleBack} />;
  }

  return <PlaylistEditor onStartDJ={handleStartDJ} />;
}
