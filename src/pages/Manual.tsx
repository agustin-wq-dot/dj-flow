import { Deck as Decks } from "@/components/dj/Deck";

export default function Manual() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Modo Manual</h2>
      <Decks 
        deckId="A" 
        containerId="deck-a" 
        state={{ isPlaying: false, track: null, playbackRate: 1 }} 
        effectiveVolume={50}
        onPlay={() => {}}
        onPause={() => {}}
        onSeek={() => {}}
        onVolumeChange={() => {}}
        onPlaybackRateChange={() => {}}
        onToggleLoop={() => {}}
      />
    </div>
  );
}
