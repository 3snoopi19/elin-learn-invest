import React from 'react';

interface ElinIconProps {
  className?: string;
  size?: number;
  glowIntensity?: 'none' | 'subtle' | 'medium' | 'strong';
}

export const ElinIcon: React.FC<ElinIconProps> = ({ 
  className = '', 
  size = 32,
  glowIntensity = 'medium'
}) => {
  const glowStyles = {
    none: '',
    subtle: 'drop-shadow-[0_0_4px_rgba(22,163,74,0.3)]',
    medium: 'drop-shadow-[0_0_6px_rgba(22,163,74,0.5)]',
    strong: 'drop-shadow-[0_0_8px_rgba(22,163,74,0.7)]'
  };

  return (
    <div className={`${glowStyles[glowIntensity]} ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 48 48"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="iconPrimaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <linearGradient id="iconAccentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <filter id="iconGlow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Simplified Book Base for Icon */}
        <path
          d="M8 14 L32 14 Q35 14 35 17 L35 31 Q35 34 32 34 L11 34 Q8 34 8 31 Z"
          fill="url(#iconPrimaryGradient)"
          filter="url(#iconGlow)"
        />
        
        {/* Book Pages */}
        <path
          d="M10 16 L30 16 Q32 16 32 18 L32 29 Q32 31 30 31 L12 31 Q10 31 10 29 Z"
          fill="rgba(255,255,255,0.15)"
        />
        
        {/* Growth Arrow - Prominent for Icon */}
        <path
          d="M24 10 Q27 8 30 11 Q31 13 29 15 L26 13 Q24 15 22 13 Q21 11 22 9 Q24 10 24 10 Z"
          fill="url(#iconAccentGradient)"
          filter="url(#iconGlow)"
        />
        
        {/* Arrow Shaft */}
        <rect
          x="23.5"
          y="15"
          width="1"
          height="10"
          fill="url(#iconAccentGradient)"
          rx="0.5"
        />
        
        {/* Single Knowledge Particle */}
        <circle cx="36" cy="20" r="1.2" fill="#16a34a" opacity="0.8">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
};