import { PlayerProvider } from '@/context/PlayerContext';
import { ManualDJPage } from '@/pages/ManualDJPage';

function App() {
  return (
    <PlayerProvider>
      <ManualDJPage />
    </PlayerProvider>
  );
}

export default App;
