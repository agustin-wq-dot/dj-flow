import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlayerProvider } from "@/context/PlayerContext";
import { useAutoPlayer } from "@/hooks/useAutoPlayer";
import Home from "@/pages/Home";
import Manual from "@/pages/Manual";

function AutoPlayerMount() {
  useAutoPlayer();
  return null;
}

export default function App() {
  return (
    <PlayerProvider>
      <AutoPlayerMount />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/manual" element={<Manual />} />
        </Routes>
      </BrowserRouter>
    </PlayerProvider>
  );
}
