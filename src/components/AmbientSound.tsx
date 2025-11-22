import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export const AmbientSound = () => {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('ambientSoundMuted');
    return saved === 'true';
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio context for ambient sound
    // Note: Actual audio files should be added to public/sounds/
    const audio = new Audio();
    
    // For now, we'll use a data URL for a very subtle tone
    // In production, replace with actual ambient sound files
    audio.loop = true;
    audio.volume = 0.03; // Very low volume
    audioRef.current = audio;

    // Auto-play on mount (if not muted)
    if (!isMuted) {
      const playAudio = async () => {
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (error) {
          // Autoplay prevented
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
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
    }
    localStorage.setItem('ambientSoundMuted', String(isMuted));
  }, [isMuted]);

  return (
    <button
      onClick={() => setIsMuted(!isMuted)}
      className="fixed bottom-4 left-4 z-50 p-3 rounded-full leather-card hover:scale-110 transition-all"
      style={{ 
        bottom: 'calc(1rem + env(safe-area-inset-bottom))',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
      title={isMuted ? 'Enable ambient sound' : 'Mute ambient sound'}
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5" style={{ color: 'hsl(38 60% 45%)' }} />
      ) : (
        <Volume2 className="w-5 h-5" style={{ color: 'hsl(38 60% 45%)' }} />
      )}
    </button>
  );
};
