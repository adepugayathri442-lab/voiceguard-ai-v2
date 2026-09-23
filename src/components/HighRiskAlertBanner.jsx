import React from 'react';
import { ShieldAlert, AlertOctagon, PhoneOff, X, ArrowRight, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

/**
 * HighRiskAlertBanner
 * Sliding high-contrast warning banner displayed whenever active call risk exceeds 75%.
 */
export default function HighRiskAlertBanner() {
  const { 
    highRiskAlertActive, 
    dismissHighRiskAlert, 
    selectedCall, 
    liveRiskScore,
    terminateCall 
  } = useApp();

  if (!highRiskAlertActive || !selectedCall) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950 via-rose-900 to-red-950 border-2 border-rose-500/80 shadow-2xl shadow-rose-900/50 p-4 mb-4 animate-in slide-in-from-top-4 duration-300">
      {/* Dynamic Animated Warning Background Scan Line */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(244,63,94,0.15)_50%,transparent_100%)] animate-shimmer" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Icon & Alert Title */}
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-rose-500 text-white shadow-lg shadow-rose-600/40 animate-pulse shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-mono font-extrabold uppercase tracking-wider animate-pulse">
                CRITICAL IMPERSONATION ALERT
              </span>
              <span className="text-xs font-mono text-rose-200">
                THREAT SCORE: <strong className="text-white text-sm">{liveRiskScore}%</strong>
              </span>
            </div>
            <h4 className="text-base font-bold text-white font-mono mt-0.5 tracking-tight">
              Suspected Synthetic Voice Clone Detected on Active Line
            </h4>
            <p className="text-xs text-rose-200/90 font-sans mt-0.5">
              Caller <strong className="text-white">{selectedCall.callerName}</strong> ({selectedCall.callerId}) matches neural TTS vocoder artifact profile. Risk exceeds security threshold (75%).
            </p>
          </div>
        </div>

        {/* Right: Quick Response Actions */}
        <div className="flex items-center space-x-2.5 shrink-0 self-end md:self-center">
          <button
            onClick={() => terminateCall(selectedCall.id)}
            className="px-4 py-2 rounded-xl bg-white text-rose-950 hover:bg-rose-100 font-mono font-bold text-xs flex items-center space-x-2 shadow-lg transition-all active:scale-95"
          >
            <PhoneOff className="w-3.5 h-3.5 fill-current text-rose-600" />
            <span>TERMINATE SIP TRUNK</span>
          </button>

          <button
            onClick={dismissHighRiskAlert}
            className="p-2 rounded-xl text-rose-300 hover:text-white hover:bg-rose-800/50 transition-colors"
            title="Acknowledge Alert"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
