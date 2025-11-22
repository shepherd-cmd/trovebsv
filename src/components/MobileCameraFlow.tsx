import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { InscriptionBottomSheet } from "./InscriptionBottomSheet";
import { InscriptionLoadingAnimation } from "./InscriptionLoadingAnimation";
import { InscriptionSuccessAnimation } from "./InscriptionSuccessAnimation";
import { haptics } from "@/utils/haptics";

interface MobileCameraFlowProps {
  onClose: () => void;
}

export const MobileCameraFlow = ({ onClose }: MobileCameraFlowProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [filteredImage, setFilteredImage] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [isInscribing, setIsInscribing] = useState(false);
  const [inscriptionSuccess, setInscriptionSuccess] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [txid, setTxid] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const filterCanvasRef = useRef<HTMLCanvasElement>(null);
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

  const applyVintageFilter = (sourceImage: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = filterCanvasRef.current;
        if (!canvas) return;

        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply sepia tone
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Sepia formula
          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189); // Red
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168); // Green
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131); // Blue
        }

        ctx.putImageData(imageData, 0, 0);

        // Add film grain
        ctx.globalAlpha = 0.05;
        for (let i = 0; i < canvas.width * canvas.height / 50; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const size = Math.random() * 2;
          const brightness = Math.random() * 255;
          ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
          ctx.fillRect(x, y, size, size);
        }
        ctx.globalAlpha = 1.0;

        // Add vignette
        const gradient = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 0,
          canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.7
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Reduce contrast slightly for aged look
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = 'rgba(255, 250, 240, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;

        const filtered = canvas.toDataURL("image/jpeg", 0.9);
        resolve(filtered);
      };
      img.src = sourceImage;
    });
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Haptic feedback on shutter press
    haptics.medium();

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg", 0.9);
      
      // Store original
      setOriginalImage(imageData);
      
      // Apply vintage filter
      const filtered = await applyVintageFilter(imageData);
      setFilteredImage(filtered);
      setCapturedImage(filtered);
      
      // Stop camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setOriginalImage(null);
    setFilteredImage(null);
    setShowOriginal(false);
    startCamera();
  };

  const toggleFilter = () => {
    if (showOriginal && filteredImage) {
      setCapturedImage(filteredImage);
    } else if (!showOriginal && originalImage) {
      setCapturedImage(originalImage);
    }
    setShowOriginal(!showOriginal);
  };

  const inscribeDocument = async (title: string, royaltyPercent: number) => {
    if (!capturedImage) return;
    
    setShowBottomSheet(false);
    setIsInscribing(true);
    setDocumentTitle(title);
    
    try {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Redirect to auth page
        navigate("/auth");
        return;
      }

      // Convert base64 to blob (use filtered image for inscription)
      const imageToInscribe = filteredImage || capturedImage;
      const response = await fetch(imageToInscribe);
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

      // Simulate blockchain inscription (in production, call HandCash/MoneyButton API)
      await new Promise(resolve => setTimeout(resolve, 3000));
      const mockTxid = `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      // Create document record
      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          user_id: session.user.id,
          title: title,
          category: 'Historical',
          image_url: publicUrl,
          rarity_score: 75,
          usefulness_score: 70,
          price_per_page: royaltyPercent / 100,
          total_pages: 1,
          status: 'inscribed',
          inscription_txid: mockTxid,
        });

      if (insertError) throw insertError;

      setTxid(mockTxid);
      setIsInscribing(false);
      setInscriptionSuccess(true);
      
      // Haptic feedback on success
      haptics.success();
    } catch (error) {
      console.error("Inscription error:", error);
      alert("Failed to inscribe document. Please try again.");
      setIsInscribing(false);
    }
  };

  const handleCloseSuccess = () => {
    setInscriptionSuccess(false);
    navigate("/app");
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background">
      {/* Loading Animation */}
      {isInscribing && <InscriptionLoadingAnimation />}
      
      {/* Success Animation */}
      {inscriptionSuccess && (
        <InscriptionSuccessAnimation 
          onClose={handleCloseSuccess}
          documentTitle={documentTitle}
          txid={txid}
          treasurySponsored={true}
        />
      )}
      
      {/* Bottom Sheet */}
      {showBottomSheet && (
        <InscriptionBottomSheet
          onClose={() => setShowBottomSheet(false)}
          onInscribe={inscribeDocument}
        />
      )}
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
          
          {/* Filter Toggle */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10"
               style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            <button
              onClick={toggleFilter}
              className="px-6 py-3 rounded-full font-display font-semibold text-sm transition-all backdrop-blur-sm"
              style={{
                background: showOriginal 
                  ? 'rgba(60, 50, 40, 0.8)' 
                  : 'linear-gradient(145deg, rgba(139, 90, 0, 0.8), rgba(105, 70, 0, 0.8))',
                boxShadow: showOriginal 
                  ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
                  : '0 2px 8px rgba(218, 165, 32, 0.4)',
                border: '1px solid rgba(218, 165, 32, 0.3)',
                color: showOriginal ? 'hsl(38 60% 60%)' : 'hsl(30 25% 10%)',
              }}
            >
              {showOriginal ? 'Original' : 'Antique'} ✓
            </button>
          </div>
          
          {/* Action Buttons */}
          <div className="absolute bottom-8 left-0 right-0 flex gap-4 px-8 justify-center"
               style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <button
              onClick={retakePhoto}
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
              onClick={() => setShowBottomSheet(true)}
              className="flex-1 max-w-[200px] py-4 px-6 rounded-lg font-display font-bold text-lg transition-all"
              style={{
                background: 'linear-gradient(145deg, hsl(38 60% 50%), hsl(38 60% 35%))',
                boxShadow: '0 4px 16px rgba(218, 165, 32, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.2), 0 0 30px rgba(218, 165, 32, 0.3)',
                border: '2px solid hsl(38 70% 40%)',
                color: 'hsl(30 25% 10%)',
              }}
            >
              Inscribe on BSV
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={filterCanvasRef} className="hidden" />
    </div>
  );
};
