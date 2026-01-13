import React from 'react';
import { AutoPlayer } from '@/auto/AutoPlayer';
import { Track } from '@/types/Track';

const playlist: Track[] = [
  {
    id: '1',
    title: 'Metallica - Until It Sleeps',
    source: 'youtube',
    youtubeId: 'FDmU6lpOpoE',
  },
  {
    id: '2',
    title: 'Metallica - Nothing Else Matters',
    source: 'youtube',
    youtubeId: 'tAGnKpE4NCI',
  },
];

export default function Automatic() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Auto DJ</h1>

      <AutoPlayer playlist={playlist} />

      <div className="text-xs opacity-60">
        Modo automático – reproducción continua
      </div>
    </div>
  );
}
