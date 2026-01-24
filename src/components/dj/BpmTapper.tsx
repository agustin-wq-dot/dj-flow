import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BpmTapperProps {
  deckId: 'A' | 'B';
  currentBpm: number;
  onBpmChange: (bpm: number) => void;
}

export const BpmTapper: React.FC<BpmTapperProps> = ({
  deckId,
  currentBpm,
  onBpmChange,
}) => {
  const [taps, setTaps] = useState<number[]>([]);
  const [isActive, setIsActive] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  
  const isDeckA = deckId === 'A';

  const handleTap = useCallback(() => {
    const now = Date.now();
    
    // Clear timeout for resetting
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Reset if too much time passed (> 2 seconds)
    const newTaps = taps.length > 0 && now - taps[taps.length - 1] > 2000 
      ? [now] 
      : [...taps, now].slice(-8); // Keep last 8 taps
    
    setTaps(newTaps);
    setIsActive(true);
    
    // Calculate BPM from tap intervals
    if (newTaps.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < newTaps.length; i++) {
        intervals.push(newTaps[i] - newTaps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const bpm = Math.round(60000 / avgInterval);
      
      // Clamp BPM to reasonable range
      if (bpm >= 60 && bpm <= 180) {
        onBpmChange(bpm);
      }
    }
    
    // Reset active state after 2 seconds of no taps
    timeoutRef.current = window.setTimeout(() => {
      setIsActive(false);
      setTaps([]);
    }, 2000);
  }, [taps, onBpmChange]);

  const handleReset = useCallback(() => {
    setTaps([]);
    setIsActive(false);
    onBpmChange(120);
  }, [onBpmChange]);

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={isActive ? 'default' : 'outline'}
        onClick={handleTap}
        className={cn(
          'font-mono text-xs min-w-[80px] transition-all',
          isActive && (isDeckA 
            ? 'bg-[hsl(var(--deck-a))] hover:bg-[hsl(var(--deck-a)/0.9)]' 
            : 'bg-[hsl(var(--deck-b))] hover:bg-[hsl(var(--deck-b)/0.9)]'),
          isActive && 'scale-95'
        )}
      >
        TAP {taps.length > 0 ? `(${taps.length})` : ''}
      </Button>
      
      <div className={cn(
        'text-lg font-bold font-mono min-w-[60px] text-center',
        isDeckA ? 'text-[hsl(var(--deck-a))]' : 'text-[hsl(var(--deck-b))]'
      )}>
        {currentBpm}
      </div>
      
      <span className="text-xs text-muted-foreground">BPM</span>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={handleReset}
        className="text-xs px-2 h-7"
      >
        Reset
      </Button>
    </div>
  );
};
