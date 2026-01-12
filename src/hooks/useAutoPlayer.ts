/**
 * useAutoPlayer
 *
 * Modo automático DESACTIVADO TEMPORALMENTE
 * Este hook existe solo para no romper imports.
 * La lógica real se va a reimplementar correctamente
 * con decks renderizados en DOM.
 */

export type AutoPlayerStatus = 'idle' | 'playing' | 'transition';

export interface UseAutoPlayerResult {
  status: AutoPlayerStatus;
  play: () => void;
  stop: () => void;
}

export function useAutoPlayer(): UseAutoPlayerResult {
  return {
    status: 'idle',
    play: () => {
      console.warn('[AutoPlayer] play() desactivado');
    },
    stop: () => {
      console.warn('[AutoPlayer] stop() desactivado');
    },
  };
}

