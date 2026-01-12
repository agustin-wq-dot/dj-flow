import { usePlayerContext } from "@/context/PlayerContext";
import { useNavigate } from "react-router-dom";
import { Track } from "@/types/Track";

export default function Home() {
  const { playlist, setPlaylist, startAuto, setManual } = usePlayerContext();
  const navigate = useNavigate();

  function loadDemoPlaylist() {
    const tracks: Track[] = [
      { videoId: "VIDEO_ID_1", title: "Track 1", bpm: 124 },
      { videoId: "VIDEO_ID_2", title: "Track 2", bpm: 126 },
      { videoId: "VIDEO_ID_3", title: "Track 3", bpm: 125 },
    ];
    setPlaylist(tracks);
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>DJ Flow</h1>

      <button onClick={loadDemoPlaylist}>
        Cargar playlist
      </button>

      <br /><br />

      <button
        disabled={!playlist.length}
        onClick={startAuto}
      >
        ▶ Play Automático
      </button>

      <br /><br />

      <button
        onClick={() => {
          setManual();
          navigate("/manual");
        }}
      >
        🎛 Modo Manual
      </button>
    </div>
  );
}
