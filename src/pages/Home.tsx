import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface Track {
  id: string;
  title: string;
  youtubeId: string;
}

const PLAYLIST: Track[] = [
  {
    id: '1',
    title: 'Metallica - Until It Sleeps',
    youtubeId: 'FDmU6lpOpoE',
  },
  {
    id: '2',
    title: 'Metallica - Nothing Else Matters',
    youtubeId: 'tAGnKpE4NCI',
  },
];

export default function Home() {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentTrack = PLAYLIST[currentIndex];

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      initPlayer();
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = initPlayer;
  }, []);

  const initPlayer = () => {
    if (!containerRef.current) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId: currentTrack.youtubeId,
      playerVars: {
        autoplay: 1,
        controls: 1,
        rel: 0,
      },
      events: {
        onStateChange: (event: any) => {
          // 0 = ended
          if (event.data === 0) {
            playNext();
          }
        },
      },
    });
  };

  const playNext = () => {
    const nextIndex = (currentIndex + 1) % PLAYLIST.length;
    setCurrentIndex(nextIndex);
    playerRef.current.loadVideoById(
      PLAYLIST[nextIndex].youtubeId
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Auto DJ</h1>

      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <div ref={containerRef} className="w-full h-full" />
      </div>

      <div className="text-sm opacity-80">
        Reproduciendo: {currentTrack.title}
      </div>

      <div className="text-xs opacity-60">
        Modo automático – reproducción continua
      </div>
    </div>
  );
}

