import { Coins } from "lucide-react";

interface Document {
  id: string;
  title: string;
  image_url: string;
  total_earnings: number;
  created_at: string;
}

interface VaultPolaroidProps {
  document: Document;
  index: number;
  onClick: () => void;
}

export const VaultPolaroid = ({ document, index, onClick }: VaultPolaroidProps) => {
  // Generate consistent random rotation and position for each document
  const rotations = [-4, -2, 0, 2, 4, -3, 1, 3, -1];
  const rotation = rotations[index % rotations.length];
  
  // Calculate position in a scattered grid
  const row = Math.floor(index / 3);
  const col = index % 3;
  const offsetX = (Math.sin(index * 2.5) * 20);
  const offsetY = (Math.cos(index * 1.8) * 20);

  return (
    <div
      onClick={onClick}
      className="absolute cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10 group"
      style={{
        left: `${10 + col * 30 + offsetX}%`,
        top: `${10 + row * 280 + offsetY}px`,
        transform: `rotate(${rotation}deg)`,
        width: '280px',
      }}
    >
      {/* Polaroid Frame */}
      <div
        className="bg-gradient-to-br from-[#f8f4e6] to-[#e8dcc4] p-4 pb-16 shadow-lg"
        style={{
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Photo */}
        <div className="relative overflow-hidden bg-background aspect-square mb-3">
          <img
            src={document.image_url}
            alt={document.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            style={{
              filter: 'sepia(0.2) contrast(1.05)',
            }}
          />
          
          {/* Sepia overlay */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(112, 66, 20, 0.08) 0%, rgba(156, 107, 58, 0.05) 100%)',
            }}
          />
        </div>

        {/* Handwritten Title */}
        <div className="text-center px-2">
          <p 
            className="text-base font-handwriting mb-1 text-[#3a3230] line-clamp-2"
            style={{
              fontFamily: 'Dancing Script, cursive',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            }}
          >
            {document.title}
          </p>
          
          {/* Earnings Badge */}
          <div className="flex items-center justify-center gap-1 mt-2">
            <Coins 
              className="w-3 h-3" 
              style={{ color: 'hsl(42 88% 45%)' }} 
            />
            <span 
              className="text-xs font-bold font-display"
              style={{ 
                color: 'hsl(42 88% 45%)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
              }}
            >
              {document.total_earnings?.toFixed(4) || '0.0000'} BSV
            </span>
          </div>
        </div>
      </div>

      {/* Shadow beneath polaroid */}
      <div
        className="absolute inset-0 bg-black/20 blur-md -z-10"
        style={{
          transform: 'translateY(8px) scale(0.98)',
        }}
      />
    </div>
  );
};
