import React from 'react';
import elinLogo from '@/assets/elin-logo.png';

interface ElinIconProps {
  className?: string;
  size?: number;
  glowIntensity?: 'none' | 'subtle' | 'medium' | 'strong';
}

export const ElinIcon: React.FC<ElinIconProps> = ({ 
  className = '', 
  size = 40,
  glowIntensity = 'medium'
}) => {
  const glowStyles = {
    none: '',
    subtle: 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]',
    medium: 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]',
    strong: 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]'
  };

  return (
    <img 
      src={elinLogo} 
      alt="ELIN Icon" 
      className={`${glowStyles[glowIntensity]} ${className} transition-all duration-300`}
      style={{ width: 'auto', height: size, maxWidth: size * 3, objectFit: 'contain' }}
    />
  );
};
