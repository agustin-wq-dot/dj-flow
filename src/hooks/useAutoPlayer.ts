/**
 * useAutoPlayer
 *
 * Modo automático desactivado temporalmente.
 * Este hook existe solo para mantener compatibilidad
 * sin romper el build ni crear players invisibles.
 */

export function useAutoPlayer() {
  return {
    play: () => {
      console.warn("[AutoPlayer] play() desactivado");
    },
    stop: () => {
      console.warn("[AutoPlayer] stop() desactivado");
    },
  };
}
