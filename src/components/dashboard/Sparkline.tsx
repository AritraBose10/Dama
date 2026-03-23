import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  criticalThresholdHigh?: number;
  criticalThresholdLow?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 80,
  height = 24,
  color = '#22d3ee',
  criticalThresholdHigh,
  criticalThresholdLow,
}) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = padding + (1 - (val - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  // Determine trend: compare last value to first
  const trend = data[data.length - 1] - data[0];
  const isCrashing = criticalThresholdLow !== undefined && data[data.length - 1] < criticalThresholdLow;
  const isSpiking = criticalThresholdHigh !== undefined && data[data.length - 1] > criticalThresholdHigh;
  const lineColor = isCrashing || isSpiking ? '#ef4444' : trend > 0 ? '#f59e0b' : color;

  // Fill gradient
  const fillPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <svg width={width} height={height} className="inline-block align-middle">
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={fillPoints}
        fill={`url(#grad-${color.replace('#','')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={lineColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last point dot */}
      {data.length > 0 && (() => {
        const lastX = padding + ((data.length - 1) / (data.length - 1)) * (width - padding * 2);
        const lastY = padding + (1 - (data[data.length - 1] - min) / range) * (height - padding * 2);
        return (
          <circle cx={lastX} cy={lastY} r="2" fill={lineColor} />
        );
      })()}
    </svg>
  );
};
