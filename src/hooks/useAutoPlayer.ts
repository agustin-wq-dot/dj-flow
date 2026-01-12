import { useEffect, useRef } from "react";
import { usePlayerContext } from "@/context/PlayerContext";
import { outroSeconds } from "@/utils/music";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";

const CHECK_INTERVAL = 250;

export function useAutoPlayer() {
  const { playlist, autoPlaying } = usePlayerContext();

  const indexRef = useRef(0);
  const activeDeck = useRef<"A" | "B">("A");
  const nextStarted = useRef(false);

  const deckA = useYouTubePlayer({ volume: 100 });
  const deckB = useYouTubePlayer({ volume: 100 });

  function getCurrentDeck() {
    return activeDeck.current === "A" ? deckA : deckB;
  }

  function getNextDeck() {
    return activeDeck.current === "A" ? deckB : deckA;
  }

  useEffect(() => {
    if (!autoPlaying || playlist.length === 0) return;

    const currentDeck = getCurrentDeck();
    const track = playlist[indexRef.current];

    currentDeck.loadVideo(track.videoId);
    currentDeck.play();

    const interval = setInterval(() => {
      const duration = currentDeck.getDuration();
      const currentTime = currentDeck.getCurrentTime();

      if (!duration || !currentTime) return;

      const outro = outroSeconds(track.bpm, track.barsOutro ?? 8);
      const timeLeft = duration - currentTime;

      if (timeLeft <= outro && !nextStarted.current) {
        const nextTrack = playlist[indexRef.current + 1];
        if (!nextTrack) return;

        const nextDeck = getNextDeck();
        nextDeck.cueVideo(nextTrack.videoId);
        nextDeck.play();

        nextStarted.current = true;
      }

      if (timeLeft <= 0.5) {
        indexRef.current++;
        activeDeck.current = activeDeck.current === "A" ? "B" : "A";
        nextStarted.current = false;
      }
    }, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [autoPlaying, playlist]);
}
