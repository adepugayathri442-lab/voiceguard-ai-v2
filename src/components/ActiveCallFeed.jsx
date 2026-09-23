import React from 'react';
import { 
  PhoneCall, 
  PhoneOff, 
  MapPin, 
  Globe, 
  Clock, 
  AlertOctagon, 
  ShieldCheck, 
  AlertTriangle,
  Radio
} from 'lucide-react';
import { useApp } from '../context/AppContext';

/**
 * ActiveCallFeed
 * Real-time telephony list displaying ongoing SIP trunk channels.
 * Clicking any call updates telemetry, waveform, and threat analysis.
 */
export default function ActiveCallFeed() {
  const { 
    activeCallFeed, 
    selectedCallId, 
    selectCall 
  } = useApp();

  const formatDuration = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 rounded-2xl bg-[#0B0F19]/90 border border-slate-800/90 shadow-xl backdrop-blur-md flex flex-col h-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Active SIP Trunk Call Feed
          </h3>
        </div>
        <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/50 text-[10px] font-mono text-cyan-400 font-bold">
          <span>{activeCallFeed.filter(c => c.status !== 'TERMINATED').length} ACTIVE</span>
        </div>
      </div>

      {/* Call Items List */}
      <div className="space-y-2.5 overflow-y-auto max-h-[620px] pr-1 scrollbar-thin">
        {activeCallFeed.map((call) => {
          const isSelected = call.id === selectedCallId;
          const isTerminated = call.status === 'TERMINATED';
          const isHighThreat = call.riskScore >= 70;
          const isMediumThreat = call.riskScore >= 30 && call.riskScore < 70;

          return (
            <div
              key={call.id}
              onClick={() => selectCall(call.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 relative overflow-hidden ${
                isSelected
                  ? 'bg-cyan-950/30 border-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                  : isTerminated
                  ? 'bg-slate-900/30 border-slate-800/40 opacity-60 hover:opacity-80'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              {/* Selected indicator bar on left */}
              {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-500" />
              )}

              {/* Call Top Line */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-white truncate">
                      {call.callerName}
                    </span>
                    {call.urgency === 'HIGH' && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        URGENT
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 block truncate">
                    {call.callerId}
                  </span>
                </div>

                {/* Threat / Status Badge */}
                <div className="text-right shrink-0">
                  {isTerminated ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      DISCONNECTED
                    </span>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isHighThreat 
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                          : isMediumThreat
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        {call.riskScore}% RISK
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Call Context Summary */}
              <div className="text-xs text-slate-300 font-sans line-clamp-1 mb-2">
                {call.context}
              </div>

              {/* Call Metadata Pills (Location, Language, Live Timer) */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-slate-800/70 text-[10px] font-mono text-slate-400">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>{call.location}</span>
                  </span>
                  <span className="flex items-center space-x-1 hidden sm:flex">
                    <Globe className="w-3 h-3 text-slate-500" />
                    <span>{call.language}</span>
                  </span>
                </div>

                <div className="flex items-center space-x-1 font-bold text-cyan-300">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>{formatDuration(call.durationSeconds)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
