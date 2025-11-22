import { useRef, useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VintageCameraProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export function VintageCamera({ onCapture, onClose }: VintageCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsReady(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        
        // Stop the camera
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 leather-card hover-brass rounded-full"
      >
        <X className="w-6 h-6" style={{ color: 'hsl(38 60% 45%)' }} />
      </button>

      {/* Video container with vintage viewfinder */}
      <div className="relative w-full h-full flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          style={{ filter: 'sepia(0.1)' }}
        />
        
        {/* Vintage Brass Viewfinder Overlay */}
        {isReady && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Dark vignette overlay */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 30%, rgba(20, 15, 10, 0.6) 70%, rgba(20, 15, 10, 0.9) 100%)',
              }}
            />
            
            {/* Corner Brackets - Top Left */}
            <div className="absolute top-[15%] left-[10%] w-24 h-24">
              <div 
                className="absolute top-0 left-0 w-full h-1 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, hsl(38 60% 45%), hsl(38 60% 35%))',
                  boxShadow: '0 0 10px rgba(218, 165, 32, 0.6), 0 2px 4px rgba(0, 0, 0, 0.4)',
                }}
              />
              <div 
                className="absolute top-0 left-0 w-1 h-full rounded-full"
                style={{
                  background: 'linear-gradient(180deg, hsl(38 60% 45%), hsl(38 60% 35%))',
                  boxShadow: '0 0 10px rgba(218, 165, 32, 0.6), 2px 0 4px rgba(0, 0, 0, 0.4)',
                }}
              />
              {/* Corner ornament */}
              <div 
                className="absolute top-0 left-0 w-3 h-3 rounded-full"
                style={{
                  background: 'radial-gradient(circle, hsl(45 95% 65%), hsl(38 60% 45%))',
                  boxShadow: '0 0 12px rgba(255, 215, 100, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                }}
              />
            </div>

            {/* Corner Brackets - Top Right */}
            <div className="absolute top-[15%] right-[10%] w-24 h-24">
              <div 
                className="absolute top-0 right-0 w-full h-1 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, hsl(38 60% 35%), hsl(38 60% 45%))',
                  boxShadow: '0 0 10px rgba(218, 165, 32, 0.6), 0 2px 4px rgba(0, 0, 0, 0.4)',
                }}
              />
              <div 
                className="absolute top-0 right-0 w-1 h-full rounded-full"
                style={{
                  background: 'linear-gradient(180deg, hsl(38 60% 45%), hsl(38 60% 35%))',
                  boxShadow: '0 0 10px rgba(218, 165, 32, 0.6), -2px 0 4px rgba(0, 0, 0, 0.4)',
                }}
              />
              <div 
                className="absolute top-0 right-0 w-3 h-3 rounded-full"
                style={{
                  background: 'radial-gradient(circle, hsl(45 95% 65%), hsl(38 60% 45%))',
                  boxShadow: '0 0 12px rgba(255, 215, 100, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                }}
              />
            </div>

            {/* Corner Brackets - Bottom Left */}
            <div className="absolute bottom-[15%] left-[10%] w-24 h-24">
              <div 
                className="absolute bottom-0 left-0 w-full h-1 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, hsl(38 60% 45%), hsl(38 60% 35%))',
                  boxShadow: '0 0 10px rgba(218, 165, 32, 0.6), 0 -2px 4px rgba(0, 0, 0, 0.4)',
                }}
              />
              <div 
                className="absolute bottom-0 left-0 w-1 h-full rounded-full"
                style={{
                  background: 'linear-gradient(180deg, hsl(38 60% 35%), hsl(38 60% 45%))',
                  boxShadow: '0 0 10px rgba(218, 165, 32, 0.6), 2px 0 4px rgba(0, 0, 0, 0.4)',
                }}
              />
              <div 
                className="absolute bottom-0 left-0 w-3 h-3 rounded-full"
                style={{
                  background: 'radial-gradient(circle, hsl(45 95% 65%), hsl(38 60% 45%))',
                  boxShadow: '0 0 12px rgba(255, 215, 100, 0.8), inset 0 -1px 1px rgba(255, 255, 255, 0.3)',
                }}
              />
            </div>

            {/* Corner Brackets - Bottom Right */}
            <div className="absolute bottom-[15%] right-[10%] w-24 h-24">
              <div 
                className="absolute bottom-0 right-0 w-full h-1 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, hsl(38 60% 35%), hsl(38 60% 45%))',
                  boxShadow: '0 0 10px rgba(218, 165, 32, 0.6), 0 -2px 4px rgba(0, 0, 0, 0.4)',
                }}
              />
              <div 
                className="absolute bottom-0 right-0 w-1 h-full rounded-full"
                style={{
                  background: 'linear-gradient(180deg, hsl(38 60% 35%), hsl(38 60% 45%))',
                  boxShadow: '0 0 10px rgba(218, 165, 32, 0.6), -2px 0 4px rgba(0, 0, 0, 0.4)',
                }}
              />
              <div 
                className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
                style={{
                  background: 'radial-gradient(circle, hsl(45 95% 65%), hsl(38 60% 45%))',
                  boxShadow: '0 0 12px rgba(255, 215, 100, 0.8), inset 0 -1px 1px rgba(255, 255, 255, 0.3)',
                }}
              />
            </div>

            {/* Gold Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Horizontal line */}
              <div 
                className="absolute w-32 h-px"
                style={{
                  background: 'linear-gradient(90deg, transparent, hsl(42 88% 55%) 20%, hsl(45 95% 65%) 50%, hsl(42 88% 55%) 80%, transparent)',
                  boxShadow: '0 0 8px rgba(255, 215, 100, 0.6)',
                  opacity: 0.5,
                }}
              />
              {/* Vertical line */}
              <div 
                className="absolute w-px h-32"
                style={{
                  background: 'linear-gradient(180deg, transparent, hsl(42 88% 55%) 20%, hsl(45 95% 65%) 50%, hsl(42 88% 55%) 80%, transparent)',
                  boxShadow: '0 0 8px rgba(255, 215, 100, 0.6)',
                  opacity: 0.5,
                }}
              />
              {/* Center circle */}
              <div 
                className="absolute w-4 h-4 rounded-full"
                style={{
                  border: '1px solid hsl(42 88% 55%)',
                  boxShadow: '0 0 10px rgba(255, 215, 100, 0.6)',
                  opacity: 0.4,
                }}
              />
            </div>

            {/* Top bar with "TROVE ARCHIVE" text */}
            <div className="absolute top-8 left-0 right-0 flex justify-center">
              <div 
                className="px-6 py-2 rounded-lg font-display text-lg tracking-widest"
                style={{
                  background: 'linear-gradient(180deg, rgba(30, 20, 10, 0.8), rgba(20, 15, 10, 0.9))',
                  color: 'hsl(42 88% 55%)',
                  textShadow: '0 0 10px rgba(218, 165, 32, 0.8), 0 2px 4px rgba(0, 0, 0, 0.6)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(255, 215, 100, 0.2)',
                  border: '1px solid hsl(38 60% 35%)',
                }}
              >
                TROVE ARCHIVE
              </div>
            </div>
          </div>
        )}

        {/* Capture button */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-auto">
          <button
            onClick={capturePhoto}
            disabled={!isReady}
            className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50"
            style={{
              background: 'radial-gradient(circle, hsl(45 95% 65%), hsl(38 60% 45%))',
              boxShadow: '0 0 30px rgba(218, 165, 32, 0.8), 0 8px 20px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.4), inset 0 -2px 4px rgba(0, 0, 0, 0.4)',
              border: '4px solid hsl(38 60% 35%)',
            }}
          >
            <div 
              className="w-14 h-14 rounded-full"
              style={{
                background: 'radial-gradient(circle, hsl(42 88% 55%), hsl(38 60% 40%))',
                boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.5)',
              }}
            >
              <Camera 
                className="w-full h-full p-3" 
                style={{ color: 'hsl(30 25% 10%)', stroke: 'hsl(30 25% 10%)' }}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
