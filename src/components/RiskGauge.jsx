import React from 'react';

export default function RiskGauge({ score = 0, confidence = 90, status = 'LOW RISK' }) {
  // Score: 0 - 100
  // 0 - 29: Low (Green)
  // 30 - 69: Medium (Amber)
  // 70 - 100: High (Rose/Red)
  const isHigh = score >= 70;
  const isMedium = score >= 30 && score < 70;
  const isLow = score < 30;

  const color = isHigh ? '#EF4444' : isMedium ? '#F59E0B' : '#10B981';
  const label = isHigh ? 'HIGH RISK' : isMedium ? 'MEDIUM RISK' : 'LOW RISK';
  const strokeDashoffset = 251.2 - (251.2 * Math.min(100, Math.max(0, score))) / 100;

  // Clean status label
  const displayStatus = typeof status === 'string' 
    ? (status.includes('CLONE') ? 'SYNTHETIC CLONE' :
       status.includes('SYNTHETIC') ? 'POSSIBLE SYNTHETIC' :
       status.includes('HUMAN') || status.includes('AUTHENTIC') ? 'AUTHENTIC HUMAN' :
       status.includes('UNKNOWN') ? 'UNKNOWN SPEAKER' : status)
    : label;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900/70 rounded-2xl border border-slate-800">
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Radial SVG Gauge */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle track */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
            strokeDasharray="251.2"
            strokeDashoffset="0"
          />
          {/* Colored progress arc */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke={color}
            strokeWidth="8"
            strokeDasharray="251.2"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute flex flex-col items-center text-center">
          <span className="text-3xl font-black font-mono tracking-tight text-white">{score}</span>
          <span className="text-[10px] font-mono text-slate-400 -mt-1">/ 100</span>
          <span 
            className="text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-full mt-1 border"
            style={{ 
              color, 
              borderColor: `${color}40`, 
              backgroundColor: `${color}15` 
            }}
          >
            {label}
          </span>
        </div>
      </div>

      {/* Scale Breakdown bar */}
      <div className="w-full mt-4 space-y-1.5 text-xs">
        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>0 (Low)</span>
          <span className="text-amber-400">30</span>
          <span className="text-rose-400">70</span>
          <span>100 (High)</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <div className="w-[30%] bg-emerald-500/80" title="0-29: Low"></div>
          <div className="w-[40%] bg-amber-500/80" title="30-69: Medium"></div>
          <div className="w-[30%] bg-rose-500/80" title="70-100: High"></div>
        </div>
      </div>

      <div className="w-full mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400">Calculated Confidence:</span>
        <span className="font-bold text-slate-200">{confidence}%</span>
      </div>
      <div className="w-full mt-1 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400">Classification:</span>
        <span className={`font-bold ${isHigh ? 'text-rose-400' : isMedium ? 'text-amber-400' : 'text-emerald-400'}`}>
          {displayStatus}
        </span>
      </div>
    </div>
  );
}
