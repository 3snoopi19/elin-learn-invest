import React from 'react';

interface ElinLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  glowIntensity?: 'none' | 'subtle' | 'medium' | 'strong';
}

export const ElinLogo: React.FC<ElinLogoProps> = ({ 
  className = '', 
  size = 'md',
  showSubtitle = true,
  glowIntensity = 'medium'
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12', 
    lg: 'h-16',
    xl: 'h-20'
  };

  const glowStyles = {
    none: '',
    subtle: 'drop-shadow-[0_0_8px_rgba(22,163,74,0.3)]',
    medium: 'drop-shadow-[0_0_12px_rgba(22,163,74,0.5)]',
    strong: 'drop-shadow-[0_0_16px_rgba(22,163,74,0.7)]'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} ${glowStyles[glowIntensity]}`}>
        <svg
          viewBox="0 0 48 48"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
            <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Book Base - Stylized and Modern */}
          <path
            d="M8 12 L32 12 Q36 12 36 16 L36 32 Q36 36 32 36 L12 36 Q8 36 8 32 Z"
            fill="url(#primaryGradient)"
            filter="url(#glow)"
            opacity="0.9"
          />
          
          {/* Book Pages - Layered Effect */}
          <path
            d="M10 14 L30 14 Q33 14 33 17 L33 30 Q33 33 30 33 L13 33 Q10 33 10 30 Z"
            fill="rgba(255,255,255,0.1)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="0.5"
          />
          
          {/* Growth Arrow/Leaf - Dynamic Upward Movement */}
          <path
            d="M24 8 Q28 6 32 10 Q34 12 32 16 Q30 14 28 12 L26 14 Q24 16 22 14 Q20 12 22 10 Q24 8 24 8 Z"
            fill="url(#accentGradient)"
            filter="url(#glow)"
          />
          
          {/* Arrow Shaft */}
          <rect
            x="23"
            y="16"
            width="2"
            height="12"
            fill="url(#accentGradient)"
            rx="1"
            opacity="0.8"
          />
          
          {/* Knowledge Particles - Floating Elements */}
          <circle cx="38" cy="18" r="1.5" fill="#16a34a" opacity="0.6">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="40" cy="24" r="1" fill="#3b82f6" opacity="0.5">
            <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="36" cy="28" r="0.8" fill="#06b6d4" opacity="0.4">
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite" />
          </circle>
          
          {/* Connecting Line - Data Flow */}
          <path
            d="M32 20 Q36 22 38 18"
            stroke="rgba(22,163,74,0.3)"
            strokeWidth="0.8"
            fill="none"
            strokeDasharray="2,2"
          >
            <animate attributeName="stroke-dashoffset" values="0;4" dur="2s" repeatCount="indefinite" />
          </path>
        </svg>
      </div>

      {/* Text Logo */}
      <div className="flex flex-col">
        {/* ELIN Text */}
        <div className="relative">
          <h1 
            className="font-bold text-foreground tracking-tight leading-none"
            style={{
              fontSize: size === 'sm' ? '1.25rem' : size === 'md' ? '1.5rem' : size === 'lg' ? '2rem' : '2.5rem',
              textShadow: glowIntensity !== 'none' ? '0 0 10px rgba(255,255,255,0.3)' : 'none'
            }}
          >
            ELIN
          </h1>
          {/* Subtle gradient overlay */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold tracking-tight leading-none"
            style={{
              fontSize: size === 'sm' ? '1.25rem' : size === 'md' ? '1.5rem' : size === 'lg' ? '2rem' : '2.5rem',
              opacity: 0.7
            }}
          >
            ELIN
          </div>
        </div>

        {/* Subtitle */}
        {showSubtitle && (
          <p 
            className="text-muted-foreground font-medium tracking-wide"
            style={{
              fontSize: size === 'sm' ? '0.625rem' : size === 'md' ? '0.75rem' : size === 'lg' ? '0.875rem' : '1rem',
              marginTop: size === 'sm' ? '-2px' : '-4px'
            }}
          >
            Investment Mentor
          </p>
        )}
      </div>
    </div>
  );
};