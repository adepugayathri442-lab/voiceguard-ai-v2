import React from 'react';
import { 
  ShieldCheck, 
  PhoneCall, 
  UserCheck, 
  Bot, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight,
  TrendingUp, 
  Activity,
  Play,
  FileSearch,
  Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function DashboardPage() {
  const { 
    analytics, 
    history, 
    alerts, 
    trustedVoices,
    setActiveTab, 
    setLastDetection 
  } = useApp();

  const handleViewAnalysis = (eventItem) => {
    setLastDetection(eventItem);
    setActiveTab('voice-analysis');
  };

  const statCards = [
    { 
      label: 'Total Analyses', 
      value: analytics.callsMonitored, 
      sub: analytics.callsMonitored === 0 ? 'No analyses yet' : 'Real audio sessions', 
      icon: PhoneCall, 
      color: 'text-cyan-400', 
      bg: 'bg-cyan-950/30 border-cyan-800/40' 
    },
    { 
      label: 'High-Risk Threats', 
      value: analytics.highRisk, 
      sub: analytics.highRisk === 0 ? 'Zero active threats' : 'Critical interception', 
      icon: ShieldAlert, 
      color: 'text-rose-400', 
      bg: 'bg-rose-950/30 border-rose-800/40' 
    },
    { 
      label: 'Suspicious Detections', 
      value: analytics.suspiciousCalls, 
      sub: 'Acoustic anomalies', 
      icon: AlertTriangle, 
      color: 'text-amber-400', 
      bg: 'bg-amber-950/30 border-amber-800/40' 
    },
    { 
      label: 'Authentic / Human', 
      value: analytics.humanVerified, 
      sub: 'Biometric human voices', 
      icon: UserCheck, 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-950/30 border-emerald-800/40' 
    },
    { 
      label: 'Verified Voices', 
      value: trustedVoices.length, 
      sub: 'Enrolled profiles in vault', 
      icon: Users, 
      color: 'text-indigo-400', 
      bg: 'bg-indigo-950/30 border-indigo-800/40' 
    },
  ];

  const recentThreats = history.filter(h => h.riskScore >= 70 || h.riskLevel === 'HIGH').slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Protection Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
              PROTECTION ACTIVE • VOICE DEFENSE ENGINE READY
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Voice Integrity Operations Center
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Protect against voice cloning and impersonation attacks using real-time audio feature forensics and biometric verification.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('live-detection')}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/25 flex items-center space-x-2 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Live Detection</span>
          </button>
        </div>
      </div>

      {/* 5 Real Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              className={`p-4 rounded-xl border backdrop-blur-sm ${card.bg} transition-all hover:translate-y-[-2px]`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">{card.label}</span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="mt-2 text-2xl font-black font-mono text-white tracking-tight">
                {card.value}
              </div>
              <div className="mt-1 text-[10px] font-mono text-slate-500">
                {card.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Feeds Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Detection History (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Recent Detection Stream</h3>
                <p className="text-xs text-slate-400">All completed analyses stored in local history</p>
              </div>
              <button 
                onClick={() => setActiveTab('history')}
                className="text-xs text-cyan-400 hover:underline flex items-center"
              >
                <span>Full History</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            {history.length > 0 ? (
              <div className="space-y-2.5">
                {history.slice(0, 5).map((evt) => {
                  const isHigh = evt.riskScore >= 70 || evt.riskLevel === 'HIGH';
                  const isMed = evt.riskScore >= 30 && evt.riskScore < 70;

                  return (
                    <div 
                      key={evt.id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          isHigh ? 'bg-rose-500 shadow-sm shadow-rose-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono font-bold text-white">{evt.caller}</span>
                            <span className="text-[10px] text-slate-500">({evt.timestamp.slice(11)})</span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                            {evt.classification} • {evt.indicators?.[0] || 'Acoustic inspection passed'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right font-mono">
                          <span className={`text-xs font-bold ${
                            isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            Risk: {evt.riskScore}/100
                          </span>
                          <div className="text-[10px] text-slate-500">{evt.duration || '00:04'}</div>
                        </div>
                        <button
                          onClick={() => handleViewAnalysis(evt)}
                          className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 font-mono"
                        >
                          Analyze
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <Activity className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-400">No detection history recorded yet.</p>
                <button
                  onClick={() => setActiveTab('live-detection')}
                  className="px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/40 text-xs font-bold font-mono transition-all inline-flex items-center space-x-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run First Voice Detection</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: High-Risk Alerts & Trusted Profile Quick Status */}
        <div className="space-y-5">
          {/* Recent Alerts Feed */}
          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Security Alerts</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                {alerts.length} ALERTS
              </span>
            </div>

            {alerts.length > 0 ? (
              <div className="space-y-2">
                {alerts.slice(0, 3).map((alert) => (
                  <div 
                    key={alert.id}
                    className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-1 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-rose-300">{alert.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{alert.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">{alert.reason}</p>
                    <div className="pt-1 text-[10px] font-mono text-rose-400 font-semibold">
                      Risk Score: {alert.riskScore}/100
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center font-mono">
                No active security alerts. System normal.
              </p>
            )}
          </div>

          {/* Trusted Voice Status Card */}
          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Trusted Biometric Vault</h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">
                {trustedVoices.length} Enrolled
              </span>
            </div>

            {trustedVoices.length > 0 ? (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">PRIMARY VOICE:</span>
                  <span className="text-white font-bold">{trustedVoices[0].name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">BASELINE F0:</span>
                  <span className="text-cyan-400">{trustedVoices[0].baselinePitchHz} Hz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">STATUS:</span>
                  <span className="text-emerald-400 font-bold">ENROLLED</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-3 space-y-2">
                <p className="text-xs text-slate-400">
                  No voice profile enrolled yet. Enroll your voice to enable impersonation verification.
                </p>
                <button
                  onClick={() => setActiveTab('trusted-voices')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono transition-all"
                >
                  Enroll Voice Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
