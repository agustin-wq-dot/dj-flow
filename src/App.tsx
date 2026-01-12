import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlayerProvider } from "@/context/PlayerContext";
import Home from "@/pages/Home";
import Manual from "@/pages/Manual";

export default function App() {
  return (
    <PlayerProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/manual" element={<Manual />} />
        </Routes>
      </BrowserRouter>
    </PlayerProvider>
  );
}
