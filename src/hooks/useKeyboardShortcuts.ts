import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsOptions {
  deckA: {
    play: () => void;
    pause: () => void;
    isPlaying: boolean;
    jumpToCue: (index: number) => void;
    pitchUp: () => void;
    pitchDown: () => void;
  };
  deckB: {
    play: () => void;
    pause: () => void;
    isPlaying: boolean;
    jumpToCue: (index: number) => void;
    pitchUp: () => void;
    pitchDown: () => void;
  };
  crossfaderLeft: () => void;
  crossfaderRight: () => void;
  crossfaderCenter: () => void;
}

export const useKeyboardShortcuts = (options: KeyboardShortcutsOptions) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    const key = e.key.toLowerCase();

    switch (key) {
      // Deck A controls
      case 'q':
        // Toggle play/pause Deck A
        if (options.deckA.isPlaying) {
          options.deckA.pause();
        } else {
          options.deckA.play();
        }
        e.preventDefault();
        break;
      
      case '1':
        options.deckA.jumpToCue(0);
        e.preventDefault();
        break;
      case '2':
        options.deckA.jumpToCue(1);
        e.preventDefault();
        break;
      case '3':
        options.deckA.jumpToCue(2);
        e.preventDefault();
        break;
      case '4':
        options.deckA.jumpToCue(3);
        e.preventDefault();
        break;

      case 'a':
        options.deckA.pitchDown();
        e.preventDefault();
        break;
      case 's':
        options.deckA.pitchUp();
        e.preventDefault();
        break;

      // Deck B controls
      case 'p':
        // Toggle play/pause Deck B
        if (options.deckB.isPlaying) {
          options.deckB.pause();
        } else {
          options.deckB.play();
        }
        e.preventDefault();
        break;

      case '7':
        options.deckB.jumpToCue(0);
        e.preventDefault();
        break;
      case '8':
        options.deckB.jumpToCue(1);
        e.preventDefault();
        break;
      case '9':
        options.deckB.jumpToCue(2);
        e.preventDefault();
        break;
      case '0':
        options.deckB.jumpToCue(3);
        e.preventDefault();
        break;

      case 'k':
        options.deckB.pitchDown();
        e.preventDefault();
        break;
      case 'l':
        options.deckB.pitchUp();
        e.preventDefault();
        break;

      // Crossfader controls
      case 'z':
        options.crossfaderLeft();
        e.preventDefault();
        break;
      case 'x':
        options.crossfaderCenter();
        e.preventDefault();
        break;
      case 'c':
        options.crossfaderRight();
        e.preventDefault();
        break;

      // Space for global play/pause (both decks)
      case ' ':
        if (options.deckA.isPlaying) {
          options.deckA.pause();
        } else {
          options.deckA.play();
        }
        if (options.deckB.isPlaying) {
          options.deckB.pause();
        } else {
          options.deckB.play();
        }
        e.preventDefault();
        break;
    }
  }, [options]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Keyboard shortcuts legend
export const KEYBOARD_SHORTCUTS = {
  deckA: {
    playPause: 'Q',
    cue1: '1',
    cue2: '2', 
    cue3: '3',
    cue4: '4',
    pitchDown: 'A',
    pitchUp: 'S',
  },
  deckB: {
    playPause: 'P',
    cue1: '7',
    cue2: '8',
    cue3: '9',
    cue4: '0',
    pitchDown: 'K',
    pitchUp: 'L',
  },
  crossfader: {
    left: 'Z',
    center: 'X',
    right: 'C',
  },
  global: {
    toggleAll: 'Space',
  },
};
