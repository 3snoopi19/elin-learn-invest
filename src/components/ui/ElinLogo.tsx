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
    sm: 'h-10 w-auto max-w-[120px]',
    md: 'h-14 w-auto max-w-[160px]', 
    lg: 'h-20 w-auto max-w-[200px]',
    xl: 'h-24 w-auto max-w-[240px]'
  };

  const glowStyles = {
    none: '',
    subtle: 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]',
    medium: 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)]',
    strong: 'drop-shadow-[0_6px_12px_rgba(0,0,0,0.2)]'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={elinLogo} 
        alt="ELIN - Learn & Invest" 
        className={`${sizeClasses[size]} ${glowStyles[glowIntensity]} object-contain transition-all duration-300`}
      />
    </div>
  );
};
