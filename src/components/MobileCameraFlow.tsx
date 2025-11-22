import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface MobileCameraFlowProps {
  onClose: () => void;
}

export const MobileCameraFlow = ({ onClose }: MobileCameraFlowProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

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
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Camera access error:", error);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(imageData);
      
      // Stop camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const inscribeDocument = async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    
    try {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Redirect to auth page
        navigate("/auth");
        return;
      }

      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Upload to Supabase storage
      const fileName = `document-${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Create document record
      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          user_id: session.user.id,
          title: 'Untitled Document',
          category: 'Historical',
          image_url: publicUrl,
          rarity_score: 50,
          usefulness_score: 50,
          price_per_page: 0.001,
          total_pages: 1,
          status: 'pending'
        });

      if (insertError) throw insertError;

      // Navigate to app dashboard
      navigate("/app");
    } catch (error) {
      console.error("Inscription error:", error);
      alert("Failed to inscribe document. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-background/80 backdrop-blur-sm"
        style={{ 
          top: 'calc(1rem + env(safe-area-inset-top))',
          color: 'hsl(38 60% 45%)'
        }}
      >
        <X className="w-6 h-6" />
      </button>

      {!capturedImage ? (
        // Camera View
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'sepia(0.15) contrast(1.1)' }}
          />
          
          {/* Vintage Viewfinder Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
            
            {/* Corner Brackets */}
            <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 opacity-80" 
                 style={{ borderColor: 'hsl(38 60% 45%)' }} />
            <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 opacity-80" 
                 style={{ borderColor: 'hsl(38 60% 45%)' }} />
            <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 opacity-80" 
                 style={{ borderColor: 'hsl(38 60% 45%)' }} />
            <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 opacity-80" 
                 style={{ borderColor: 'hsl(38 60% 45%)' }} />
            
            {/* Crosshair */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-[1px] opacity-40" style={{ backgroundColor: 'hsl(42 88% 55%)' }} />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-[1px] opacity-40" 
                   style={{ backgroundColor: 'hsl(42 88% 55%)' }} />
            </div>
            
            {/* Label */}
            <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-center">
              <p className="font-display text-sm tracking-widest opacity-60" 
                 style={{ color: 'hsl(38 60% 45%)' }}>
                TROVE ARCHIVE
              </p>
            </div>
          </div>

          {/* Shutter Button */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
               style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <button
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full relative group"
              style={{
                background: 'radial-gradient(circle, hsl(38 60% 50%) 0%, hsl(38 60% 35%) 100%)',
                boxShadow: '0 0 30px rgba(218, 165, 32, 0.6), 0 8px 20px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
              }}
            >
              <div className="absolute inset-2 rounded-full bg-background/90 group-active:scale-90 transition-transform" />
            </button>
          </div>
        </div>
      ) : (
        // Preview View
        <div className="relative w-full h-full bg-background">
          <img
            src={capturedImage}
            alt="Captured"
            className="absolute inset-0 w-full h-full object-contain"
          />
          
          {/* Action Buttons */}
          <div className="absolute bottom-8 left-0 right-0 flex gap-4 px-8 justify-center"
               style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <button
              onClick={retakePhoto}
              disabled={isProcessing}
              className="flex-1 max-w-[200px] py-4 px-6 rounded-lg font-display font-bold text-lg transition-all"
              style={{
                background: 'linear-gradient(145deg, hsl(0 0% 25%), hsl(0 0% 15%))',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
                border: '2px solid hsl(0 0% 30%)',
                color: 'hsl(38 60% 45%)',
              }}
            >
              Retake
            </button>
            <button
              onClick={inscribeDocument}
              disabled={isProcessing}
              className="flex-1 max-w-[200px] py-4 px-6 rounded-lg font-display font-bold text-lg transition-all"
              style={{
                background: 'linear-gradient(145deg, hsl(38 60% 50%), hsl(38 60% 35%))',
                boxShadow: '0 4px 16px rgba(218, 165, 32, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.2), 0 0 30px rgba(218, 165, 32, 0.3)',
                border: '2px solid hsl(38 70% 40%)',
                color: 'hsl(30 25% 10%)',
              }}
            >
              {isProcessing ? 'Processing...' : 'Inscribe on BSV'}
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
