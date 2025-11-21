import React from 'react';
import elinLogo from '@/assets/elin-logo.png';

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
    subtle: 'drop-shadow-[0_0_4px_rgba(59,130,246,0.3)]',
    medium: 'drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]',
    strong: 'drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]'
  };

  return (
    <img 
      src={elinLogo} 
      alt="ELIN Icon" 
      className={`${glowStyles[glowIntensity]} ${className}`}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
};
