export function outroSeconds(bpm: number, bars: number = 8): number {
  const secondsPerBeat = 60 / bpm;
  const beatsPerBar = 4;
  return secondsPerBeat * beatsPerBar * bars;
}
