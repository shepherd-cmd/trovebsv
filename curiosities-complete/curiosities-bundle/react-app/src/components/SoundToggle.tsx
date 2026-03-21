import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { toggleSounds, areSoundsEnabled } from '@/utils/stepSounds';

export const SoundToggle = () => {
  const [enabled, setEnabled] = useState(areSoundsEnabled());

  const handleToggle = () => {
    const newState = toggleSounds();
    setEnabled(newState);
  };

  return (
    <button
      onClick={handleToggle}
      className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
      style={{
        background: 'linear-gradient(145deg, hsl(35 25% 18%), hsl(30 20% 12%))',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6), inset 0 1px 3px rgba(255, 215, 100, 0.1)',
        border: '2px solid hsl(38 60% 35%)',
      }}
      title={enabled ? 'Mute sounds' : 'Unmute sounds'}
    >
      {enabled ? (
        <Volume2 className="w-5 h-5" style={{ color: 'hsl(42 88% 55%)' }} />
      ) : (
        <VolumeX className="w-5 h-5" style={{ color: 'hsl(38 60% 45%)' }} />
      )}
    </button>
  );
};
