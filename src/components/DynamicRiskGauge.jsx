import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, Cpu, Fingerprint } from 'lucide-react';

/**
 * DynamicRiskGauge
 * High-end circular SVG gauge for real-time impersonation risk scoring.
 * Color scales: Green (<30%), Amber (30-70%), Crimson Red (>70%).
 */
export default function DynamicRiskGauge({ 
  riskScore = 0, 
  call = null,
  isSimulating = false 
}) {
  const normalizedScore = Math.min(100, Math.max(0, Math.round(riskScore)));

  // Determine color scheme
  let color = '#10B981'; // Emerald Green
  let strokeColor = 'stroke-emerald-500';
  let bgColor = 'bg-emerald-500/10';
  let borderCol = 'border-emerald-500/30';
  let textColor = 'text-emerald-400';
  let statusText = 'AUTHENTIC HUMAN';
  let subStatus = 'Biometric & Acoustic Verification Verified';
  let Icon = ShieldCheck;

  if (normalizedScore >= 70) {
    color = '#F43F5E'; // Rose / Crimson
    strokeColor = 'stroke-rose-500';
    bgColor = 'bg-rose-500/15';
    borderCol = 'border-rose-500/40';
    textColor = 'text-rose-400';
    statusText = 'CRITICAL AI CLONE THREAT';
    subStatus = 'High Neural Vocoder & Spectral Synthesis Artifacts';
    Icon = ShieldAlert;
  } else if (normalizedScore >= 30) {
    color = '#F59E0B'; // Amber
    strokeColor = 'stroke-amber-500';
    bgColor = 'bg-amber-500/15';
    borderCol = 'border-amber-500/40';
    textColor = 'text-amber-400';
    statusText = 'SUSPICIOUS / ELEVATED RISK';
    subStatus = 'Abnormal Latency & Syllable Cadence Regularity';
    Icon = AlertTriangle;
  }

  // SVG circular arc math
  const size = 200;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use a 270-degree open gauge for cybersecurity aesthetic
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (normalizedScore / 100) * arcLength;

  return (
    <div className={`p-5 rounded-2xl bg-[#0B0F19]/90 border ${borderCol} shadow-xl backdrop-blur-md flex flex-col items-center justify-between relative overflow-hidden transition-all duration-300`}>
      {/* Subtle background glow */}
      <div 
        className="absolute w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none -top-10 -right-10"
        style={{ backgroundColor: color }}
      />

      {/* Header */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800/80 mb-2">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Impersonation Threat Index
          </span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${bgColor} ${textColor} border ${borderCol}`}>
          {normalizedScore >= 70 ? 'CRITICAL' : normalizedScore >= 30 ? 'ELEVATED' : 'NOMINAL'}
        </span>
      </div>

      {/* SVG Circular Gauge */}
      <div className="relative w-[200px] h-[190px] flex items-center justify-center my-1">
        <svg 
          className="w-full h-full transform -rotate-135"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1E293B"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Foreground Dynamic Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${color}80)`
            }}
          />
        </svg>

        {/* Center Score Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center -mt-2">
          <Icon className={`w-6 h-6 ${textColor} mb-1 animate-bounce-subtle`} />
          <div className="flex items-baseline space-x-0.5">
            <span className={`text-4xl font-black font-mono tracking-tight ${textColor}`}>
              {normalizedScore}
            </span>
            <span className="text-sm font-mono text-slate-500 font-semibold">%</span>
          </div>
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mt-0.5">
            RISK FACTOR
          </span>
        </div>
      </div>

      {/* Verdict & Sub-Status */}
      <div className="w-full text-center space-y-1 my-1">
        <div className={`text-sm font-black font-mono tracking-wide ${textColor}`}>
          {statusText}
        </div>
        <p className="text-[11px] text-slate-400 font-sans leading-tight line-clamp-1">
          {subStatus}
        </p>
      </div>

      {/* Mini Forensic Telemetry Chips */}
      <div className="w-full grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 font-mono text-xs">
        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center space-x-2">
          <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <div className="truncate">
            <span className="text-[9px] text-slate-500 uppercase block">AI Synthesis</span>
            <span className="text-xs font-bold text-slate-200">
              {call?.aiConfidence ? `${call.aiConfidence}%` : `${normalizedScore > 50 ? 94.8 : 4.2}%`}
            </span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center space-x-2">
          <Fingerprint className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <div className="truncate">
            <span className="text-[9px] text-slate-500 uppercase block">Biometric Match</span>
            <span className="text-xs font-bold text-slate-200">
              {call?.similarityMatch ? `${call.similarityMatch}%` : `${normalizedScore > 50 ? 95.4 : 98.2}%`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
