// src/audio/AudioEngine.ts
let audioContext: AudioContext | null = null;
const bufferCache = new Map<string, AudioBuffer>();

export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

export async function loadAudioBuffer(url: string): Promise<AudioBuffer> {
  if (bufferCache.has(url)) {
    return bufferCache.get(url)!;
  }

  const ctx = getAudioContext();
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

  bufferCache.set(url, audioBuffer);
  return audioBuffer;
}
