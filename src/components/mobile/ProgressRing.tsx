import { motion } from "framer-motion";

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  label?: string;
  value?: string;
  subLabel?: string;
  className?: string;
}

export const ProgressRing = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = "hsl(var(--primary))",
  bgColor = "hsl(var(--muted))",
  label,
  value,
  subLabel,
  className = "",
}: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {value && (
          <motion.span 
            className="text-2xl font-black text-text-heading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {value}
          </motion.span>
        )}
        {label && (
          <span className="text-xs text-text-muted font-medium">{label}</span>
        )}
      </div>
      
      {/* Sub label below ring */}
      {subLabel && (
        <p className="mt-2 text-sm text-text-secondary text-center">{subLabel}</p>
      )}
    </div>
  );
};

interface MultiProgressRingProps {
  segments: Array<{
    progress: number;
    color: string;
    label: string;
  }>;
  size?: number;
  strokeWidth?: number;
  centerValue?: string;
  centerLabel?: string;
}

export const MultiProgressRing = ({
  segments,
  size = 140,
  strokeWidth = 10,
  centerValue,
  centerLabel,
}: MultiProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  let accumulatedProgress = 0;

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        
        {/* Segment circles */}
        {segments.map((segment, index) => {
          const segmentOffset = circumference - (segment.progress / 100) * circumference;
          const rotation = (accumulatedProgress / 100) * 360;
          accumulatedProgress += segment.progress;
          
          return (
            <motion.circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: segmentOffset }}
              transition={{ duration: 1, ease: "easeOut", delay: index * 0.15 }}
              style={{
                transform: `rotate(${rotation}deg)`,
                transformOrigin: '50% 50%',
              }}
            />
          );
        })}
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {centerValue && (
          <motion.span 
            className="text-3xl font-black text-text-heading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {centerValue}
          </motion.span>
        )}
        {centerLabel && (
          <span className="text-xs text-text-muted font-medium">{centerLabel}</span>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-xs text-text-muted">{segment.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
