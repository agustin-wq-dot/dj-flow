import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePlayerContext } from "@/context/PlayerContext";

export default function Home() {
  const navigate = useNavigate();
  const { startAuto, setManual } = usePlayerContext();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8">
      <h1 className="text-3xl font-bold">DJ Flow</h1>

      <div className="flex gap-6">
        <Button
          size="lg"
          onClick={() => {
            startAuto();
            navigate("/auto");
          }}
        >
          ▶ Modo Automático
        </Button>

        <Button
          size="lg"
          variant="outline"
          onClick={() => {
            setManual();
            navigate("/manual");
          }}
        >
          🎛️ Modo Manual
        </Button>
      </div>
    </div>
  );
}

