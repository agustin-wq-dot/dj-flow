import React from 'react';
import { Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { KEYBOARD_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';

const KeyBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-xs font-mono font-semibold bg-muted border border-border rounded shadow-sm">
    {children}
  </kbd>
);

export const KeyboardShortcutsLegend: React.FC = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Keyboard className="h-4 w-4" />
          Atajos
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Atajos de Teclado</h4>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Deck A */}
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-[hsl(var(--deck-a))] uppercase tracking-wide">
                Deck A
              </h5>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Play/Pause</span>
                  <KeyBadge>{KEYBOARD_SHORTCUTS.deckA.playPause}</KeyBadge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">CUE 1-4</span>
                  <div className="flex gap-0.5">
                    <KeyBadge>1</KeyBadge>
                    <KeyBadge>2</KeyBadge>
                    <KeyBadge>3</KeyBadge>
                    <KeyBadge>4</KeyBadge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pitch -/+</span>
                  <div className="flex gap-0.5">
                    <KeyBadge>{KEYBOARD_SHORTCUTS.deckA.pitchDown}</KeyBadge>
                    <KeyBadge>{KEYBOARD_SHORTCUTS.deckA.pitchUp}</KeyBadge>
                  </div>
                </div>
              </div>
            </div>

            {/* Deck B */}
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-[hsl(var(--deck-b))] uppercase tracking-wide">
                Deck B
              </h5>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Play/Pause</span>
                  <KeyBadge>{KEYBOARD_SHORTCUTS.deckB.playPause}</KeyBadge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">CUE 1-4</span>
                  <div className="flex gap-0.5">
                    <KeyBadge>7</KeyBadge>
                    <KeyBadge>8</KeyBadge>
                    <KeyBadge>9</KeyBadge>
                    <KeyBadge>0</KeyBadge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pitch -/+</span>
                  <div className="flex gap-0.5">
                    <KeyBadge>{KEYBOARD_SHORTCUTS.deckB.pitchDown}</KeyBadge>
                    <KeyBadge>{KEYBOARD_SHORTCUTS.deckB.pitchUp}</KeyBadge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Crossfader & Global */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Crossfader A/Center/B</span>
              <div className="flex gap-0.5">
                <KeyBadge>{KEYBOARD_SHORTCUTS.crossfader.left}</KeyBadge>
                <KeyBadge>{KEYBOARD_SHORTCUTS.crossfader.center}</KeyBadge>
                <KeyBadge>{KEYBOARD_SHORTCUTS.crossfader.right}</KeyBadge>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Play/Pause Ambos</span>
              <KeyBadge>␣</KeyBadge>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
