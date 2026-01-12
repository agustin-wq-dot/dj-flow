/**
 * useAutoPlayer
 *
 * Modo automático DESACTIVADO.
 * Este archivo existe solo para que el proyecto buildée.
 * NO crea players.
 * NO usa YouTube.
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
