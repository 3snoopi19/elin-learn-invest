import React from 'react';
import elinLogo from '@/assets/elin-logo.png';

interface ElinLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  glowIntensity?: 'none' | 'subtle' | 'medium' | 'strong';
}

export const ElinLogo: React.FC<ElinLogoProps> = ({ 
  className = '', 
  size = 'md',
  showSubtitle = false,
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
    subtle: 'drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]',
    medium: 'drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]',
    strong: 'drop-shadow-[0_0_16px_rgba(59,130,246,0.7)]'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={elinLogo} 
        alt="ELIN - Learn & Invest" 
        className={`${sizeClasses[size]} ${glowStyles[glowIntensity]} w-auto object-contain`}
      />
    </div>
  );
};
