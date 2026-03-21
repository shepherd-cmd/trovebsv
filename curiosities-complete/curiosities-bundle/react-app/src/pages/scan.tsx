import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileCameraFlow } from "@/components/MobileCameraFlow";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const Scan = () => {
  const navigate = useNavigate();
  const [showCamera, setShowCamera] = useState(true);

  return (
    <div className="min-h-screen bg-background relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-50"
        onClick={() => navigate("/")}
      >
        <X className="h-6 w-6" style={{ color: 'hsl(38 60% 45%)' }} />
      </Button>

      {showCamera && (
        <MobileCameraFlow
          onClose={() => {
            setShowCamera(false);
            navigate("/");
          }}
        />
      )}
    </div>
  );
};

export default Scan;
