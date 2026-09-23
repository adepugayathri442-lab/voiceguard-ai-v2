import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Phone, 
  Ban, 
  Lock, 
  CheckCircle2, 
  Download, 
  Flame, 
  Info,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { getStoredHistory } from '../utils/storage';
import { INITIAL_HISTORY_SEED } from '../utils/mockData';

export default function SecurityAlertsScreen({ onSelectRecord }) {
  const [alerts, setAlerts] = useState([]);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    let list = getStoredHistory();
    if (!list || list.length === 0) list = INITIAL_HISTORY_SEED;
    // Filter to AI threats and clones
    const threats = list.filter(c => c.verdict === 'AI_SYNTHETIC' || c.isCloneAlert || c.riskScore >= 51);
    setAlerts(threats);
  }, []);

  const triggerAction = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-rose-400 animate-pulse" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Security Threat Alerts
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Active security incidents flagging intercepted AI deepfakes, synthetic robocalls, and unauthorized clone attempts.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            {alerts.length} THREATS INTERCEPTED
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-3">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Active Threat Alerts</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All calls monitored through VoiceGuard AI have maintained verified human biometrics.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const isClone = alert.isCloneAlert || alert.state === 'STATE_3_AI_CLONE_ATTACK' || alert.state === 'STATE_3_AI_VOICE_CLONE';

            return (
              <div
                key={alert.id || alert.callId}
                className={`p-5 rounded-2xl border transition-all ${
                  isClone
                    ? 'bg-rose-950/30 border-rose-500/60 shadow-lg shadow-rose-950/50'
                    : 'bg-amber-950/25 border-amber-500/40 shadow-md shadow-amber-950/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3.5">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                      isClone ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}>
                      {isClone ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase ${
                          isClone ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-500 text-black'
                        }`}>
                          {isClone ? '🚨 VOICE CLONE ATTACK' : '🚨 AI SYNTHETIC THREAT'}
                        </span>
                        <span className="text-xs font-mono font-bold text-white flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-cyan-400" />
                          <span>{alert.callerNumber}</span>
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          Risk: <strong className="text-rose-400">{alert.riskScore}/100</strong>
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white">
                        {alert.finalVerdict}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-1">
                        {alert.callerLabel} • Biometric match: {alert.voiceSimilarity}% • AI Confidence: {alert.confidence}%
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                    <button
                      onClick={() => triggerAction(`Caller ${alert.callerNumber} has been added to Global Blacklist.`)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 text-xs font-mono font-bold transition-colors flex items-center space-x-1"
                    >
                      <Ban className="w-3 h-3 text-rose-400" />
                      <span>Block Number</span>
                    </button>

                    <button
                      onClick={() => triggerAction(`Outbound transaction holds placed for session ${alert.callId}.`)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono transition-colors flex items-center space-x-1"
                    >
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>Freeze Transfers</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
