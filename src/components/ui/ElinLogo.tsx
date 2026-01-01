import React from 'react';
import elinLogo from '@/assets/elin-logo.png';

interface ElinLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  showBrandName?: boolean;
  glowIntensity?: 'none' | 'subtle' | 'medium' | 'strong';
}

export const ElinLogo: React.FC<ElinLogoProps> = ({ 
  className = '', 
  size = 'md',
  showSubtitle = false,
  showBrandName = true,
  glowIntensity = 'medium'
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10', 
    lg: 'h-14 w-14',
    xl: 'h-18 w-18'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const glowStyles = {
    none: '',
    subtle: 'drop-shadow-[0_2px_4px_rgba(59,130,246,0.2)]',
    medium: 'drop-shadow-[0_4px_8px_rgba(59,130,246,0.3)]',
    strong: 'drop-shadow-[0_6px_12px_rgba(59,130,246,0.4)]'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src={elinLogo} 
        alt="ELIN" 
        className={`${sizeClasses[size]} ${glowStyles[glowIntensity]} object-contain transition-all duration-300 rounded-lg`}
      />
      {showBrandName && (
        <span 
          className={`${textSizeClasses[size]} font-bold bg-gradient-to-r from-primary via-cyan-500 to-primary bg-clip-text text-transparent tracking-tight`}
          style={{
            backgroundSize: '200% 100%',
          }}
        >
          ELIN
        </span>
      )}
      {showSubtitle && (
        <span className="text-xs text-muted-foreground ml-1 hidden sm:inline">
          Learn & Invest
        </span>
      )}
    </div>
  );
};
