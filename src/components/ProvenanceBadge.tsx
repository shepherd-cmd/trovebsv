import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';

interface ProvenanceBadgeProps {
  score: number;
  description: string;
  className?: string;
}

export const ProvenanceBadge = ({ score, description, className = '' }: ProvenanceBadgeProps) => {
  const getColor = () => {
    if (score >= 90) return { bg: 'rgba(52, 168, 83, 0.1)', border: 'rgba(52, 168, 83, 0.3)', text: 'hsl(120 60% 50%)' };
    if (score >= 70) return { bg: 'rgba(251, 188, 4, 0.1)', border: 'rgba(251, 188, 4, 0.3)', text: 'hsl(42 88% 55%)' };
    return { bg: 'rgba(234, 67, 53, 0.1)', border: 'rgba(234, 67, 53, 0.3)', text: 'hsl(0 84% 60%)' };
  };

  const colors = getColor();
  const Icon = score >= 90 ? CheckCircle : score >= 70 ? Shield : AlertTriangle;

  return (
    <div 
      className={`relative px-6 py-4 rounded-lg backdrop-blur-md font-display ${className}`}
      style={{
        background: `linear-gradient(135deg, ${colors.bg}, rgba(60, 50, 40, 0.2))`,
        border: `2px solid ${colors.border}`,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Parchment texture overlay */}
      <div 
        className="absolute inset-0 rounded-lg opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.3' /%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative flex items-center gap-3">
        <Icon 
          className="w-6 h-6 flex-shrink-0" 
          style={{ color: colors.text }}
        />
        <div className="flex-1">
          <div className="text-lg font-bold mb-1" style={{ color: colors.text }}>
            Provenance Score: {score}%
          </div>
          <div className="text-sm opacity-90" style={{ color: 'hsl(30 15% 75%)' }}>
            {description}
          </div>
        </div>
      </div>

      {/* Decorative corner elements */}
      <div 
        className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 opacity-30"
        style={{ borderColor: colors.border }}
      />
      <div 
        className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 opacity-30"
        style={{ borderColor: colors.border }}
      />
      <div 
        className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 opacity-30"
        style={{ borderColor: colors.border }}
      />
      <div 
        className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 opacity-30"
        style={{ borderColor: colors.border }}
      />
    </div>
  );
};
