import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SettingsPopupProps {
  crossfadeDuration: number;
  onCrossfadeDurationChange: (value: number) => void;
  triggerVolume: number;
  onTriggerVolumeChange: (value: number) => void;
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({
  crossfadeDuration,
  onCrossfadeDurationChange,
  triggerVolume,
  onTriggerVolumeChange,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Configuración</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración Auto-DJ
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Crossfade Duration */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Crossfade Duration</label>
              <span className="text-sm text-muted-foreground font-mono">
                {crossfadeDuration}s
              </span>
            </div>
            <Slider
              min={6}
              max={20}
              step={1}
              value={[crossfadeDuration]}
              onValueChange={([v]) => onCrossfadeDurationChange(v)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>6s</span>
              <span>20s</span>
            </div>
          </div>

          {/* Trigger Volume */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Crossfade Trigger Volume</label>
              <span className="text-sm text-muted-foreground font-mono">
                {triggerVolume}%
              </span>
            </div>
            <Slider
              min={10}
              max={90}
              step={5}
              value={[triggerVolume]}
              onValueChange={([v]) => onTriggerVolumeChange(v)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10%</span>
              <span>90%</span>
            </div>
            <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
              ℹ️ El siguiente track empieza a sonar fuerte cuando el deck saliente 
              baja a este volumen durante el crossfade. Valores más altos = 
              transición más temprana.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsPopup;
