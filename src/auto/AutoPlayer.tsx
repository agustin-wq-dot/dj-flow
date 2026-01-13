import React, { useEffect, useRef, useState } from 'react';
import { Track } from '@/types/Track';

interface AutoPlayerProps {
  playlist: Track[];
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const AutoPlayer: React.FC<AutoPlayerProps> = ({ playlist }) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentTrack = playlist[currentIndex];

  useEffect(() => {
    if (window.YT) {
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
      },
      events: {
        onStateChange: onStateChange,
      },
    });
  };

  const onStateChange = (event: any) => {
    // 0 = ended
    if (event.data === 0) {
      playNext();
    }
  };

  const playNext = () => {
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIndex);
    playerRef.current.loadVideoById(
      playlist[nextIndex].youtubeId
    );
  };

  return (
    <div className="space-y-4">
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <div ref={containerRef} className="w-full h-full" />
      </div>

      <div className="text-sm opacity-80">
        Reproduciendo: {currentTrack.title}
      </div>
    </div>
  );
};
