import { useEffect, useRef } from 'react';
import { useTroveStore } from '@/store/useTroveStore';
import { Volume2, VolumeX } from 'lucide-react';
import { toggleSounds } from '@/utils/stepSounds';

// Single unified sound control — handles both ambient music and step/interaction sounds
export const AmbientSound = () => {
  const { ambientSoundMuted, setAmbientSoundMuted } = useTroveStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.03;
    audioRef.current = audio;

    if (!ambientSoundMuted) {
      audio.play().catch(() => {});
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [ambientSoundMuted]);

  const handleToggle = () => {
    const newMuted = !ambientSoundMuted;
    setAmbientSoundMuted(newMuted);
    toggleSounds(); // sync step/interaction sounds

    if (audioRef.current) {
      newMuted ? audioRef.current.pause() : audioRef.current.play().catch(() => {});
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="fixed z-50 flex items-center justify-center transition-all duration-200 hover:scale-110"
      style={{
        bottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
        right: '1.5rem',
        width: '2.75rem',
        height: '2.75rem',
        borderRadius: '50%',
        background: 'hsl(222 16% 11% / 0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid hsl(222 14% 22%)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}
      title={ambientSoundMuted ? 'Enable sound' : 'Mute sound'}
    >
      {ambientSoundMuted ? (
        <VolumeX className="w-4 h-4" style={{ color: 'hsl(222 10% 50%)' }} />
      ) : (
        <Volume2 className="w-4 h-4" style={{ color: 'hsl(42 95% 60%)' }} />
      )}
    </button>
  );
};
