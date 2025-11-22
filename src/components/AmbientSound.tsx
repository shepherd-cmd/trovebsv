import { useEffect, useRef } from 'react';
import { useTroveStore } from '@/store/useTroveStore';
import { Volume2, VolumeX } from 'lucide-react';

export const AmbientSound = () => {
  const { ambientSoundMuted, setAmbientSoundMuted } = useTroveStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.03;
    audioRef.current = audio;

    if (!ambientSoundMuted) {
      const playAudio = async () => {
        try {
          await audio.play();
        } catch (error) {
        }
      };
      playAudio();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [ambientSoundMuted]);

  const toggleMute = () => {
    const newMutedState = !ambientSoundMuted;
    setAmbientSoundMuted(newMutedState);
    
    if (audioRef.current) {
      if (newMutedState) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  return (
    <button
      onClick={toggleMute}
      className="fixed bottom-4 left-4 z-50 p-3 rounded-full leather-card hover:scale-110 transition-all"
      style={{ 
        bottom: 'calc(1rem + env(safe-area-inset-bottom))',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
      title={ambientSoundMuted ? 'Enable ambient sound' : 'Mute ambient sound'}
    >
      {ambientSoundMuted ? (
        <VolumeX className="w-5 h-5" style={{ color: 'hsl(38 60% 45%)' }} />
      ) : (
        <Volume2 className="w-5 h-5" style={{ color: 'hsl(38 60% 45%)' }} />
      )}
    </button>
  );
};
