import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlayerProvider } from "@/context/PlayerContext";
import Home from "@/pages/Home";
import Manual from "@/pages/Manual";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <PlayerProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/manual" element={<Manual />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </PlayerProvider>
  );
}
