import React from 'react';

export interface ProgressRingProps {
  percentage: number;
  color?: 'blue' | 'green' | 'orange';
}

export const ProgressRing: React.FC<ProgressRingProps> = ({ percentage, color = 'blue' }) => {
  const radius = 28;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} className={`progress-ring-svg color-${color}`}>
      <circle
        className="ring-background"
        stroke="currentColor"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        className="ring-progress"
        stroke="currentColor"
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        className="progress-text"
      >
        {percentage}%
      </text>
    </svg>
  );
};

