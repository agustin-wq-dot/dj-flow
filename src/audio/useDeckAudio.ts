// src/audio/useDeckAudio.ts
import { useRef, useState } from 'react';
import { getAudioContext, loadAudioBuffer } from './AudioEngine';

export function useDeckAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  async function load(url: string) {
    ctxRef.current = getAudioContext();
    bufferRef.current = await loadAudioBuffer(url);

    if (!gainRef.current) {
      gainRef.current = ctxRef.current.createGain();
      gainRef.current.gain.value = volume;
      gainRef.current.connect(ctxRef.current.destination);
    }
  }

  function play() {
    if (!ctxRef.current || !bufferRef.current || isPlaying) return;

    const source = ctxRef.current.createBufferSource();
    source.buffer = bufferRef.current;
    source.connect(gainRef.current!);
    source.start();

    source.onended = () => {
      setIsPlaying(false);
      sourceRef.current = null;
    };

    sourceRef.current = source;
    setIsPlaying(true);
  }

  function stop() {
    sourceRef.current?.stop();
    sourceRef.current = null;
    setIsPlaying(false);
  }

  function setGain(value: number) {
    setVolume(value);
    if (gainRef.current) {
      gainRef.current.gain.value = value;
    }
  }

  return {
    load,
    play,
    stop,
    isPlaying,
    volume,
    setGain,
  };
}
