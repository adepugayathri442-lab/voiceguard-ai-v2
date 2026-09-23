import React, { useState } from 'react';
import { 
  BellRing, 
  AlertTriangle, 
  Info, 
  ShieldAlert, 
  CheckCheck, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  Play
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AlertsPage() {
  const { alerts, setAlerts, history, setActiveTab, setLastDetection, showToast } = useApp();
  const [activeCategory, setActiveCategory] = useState('ALL');

  const filteredAlerts = alerts.filter(a => {
    if (activeCategory === 'ALL') return true;
    return a.type === activeCategory;
  });

  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    showToast('All alerts marked as read.', 'info');
  };

  const markSingleRead = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const dismissAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    showToast('Alert dismissed.', 'info');
  };

  const viewAnalysisForAlert = (alert) => {
    markSingleRead(alert.id);
    // Try to find the original full detection record in history
    const matchingRecord = history.find(h => h.id === alert.id || h.caller === alert.caller);
    if (matchingRecord) {
      setLastDetection(matchingRecord);
    } else {
      setLastDetection({
        id: alert.id,
        timestamp: alert.timestamp,
        caller: alert.caller,
        callerName: alert.callerName,
        classification: alert.title,
        voiceType: alert.type === 'CRITICAL' ? 'POSSIBLE VOICE CLONE' : 'SUSPICIOUS',
        confidence: alert.confidence || 88,
        riskScore: alert.riskScore || 75,
        riskLevel: alert.type === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
        indicators: [alert.reason]
      });
    }
    setActiveTab('voice-analysis');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-rose-950 text-rose-400 border border-rose-800">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold text-rose-400 uppercase">Threat Notification Center</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">Real-Time Security Alerts</h2>
          <p className="text-xs text-slate-400">
            Categorized alerts dispatched automatically when calculated risk scores cross the configured threshold.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={markAllRead}
            disabled={alerts.length === 0}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all disabled:opacity-40"
          >
            <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 p-1 bg-slate-900/60 rounded-xl border border-slate-800 w-fit">
        {['ALL', 'CRITICAL', 'WARNING'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeCategory === cat
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Alerts Stream */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => {
            const isCrit = alert.type === 'CRITICAL';
            const isWarn = alert.type === 'WARNING';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all ${
                  !alert.read ? 'bg-slate-900/90' : 'bg-slate-950/60 opacity-80'
                } ${
                  isCrit 
                    ? 'border-rose-900/50 hover:border-rose-600/70' 
                    : isWarn 
                    ? 'border-amber-900/50 hover:border-amber-600/70' 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3.5">
                    <div className={`p-2.5 rounded-xl mt-0.5 ${
                      isCrit ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                      isWarn ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                      'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    }`}>
                      {isCrit ? <ShieldAlert className="w-5 h-5" /> : isWarn ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          isCrit ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                          isWarn ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}>
                          {alert.type}
                        </span>
                        <span className="text-xs font-mono text-slate-500">{alert.timestamp}</span>
                        {!alert.read && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white mt-1">{alert.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{alert.reason}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400">
                        <span>TARGET: <strong className="text-white">{alert.caller}</strong></span>
                        {alert.riskScore && (
                          <span>RISK: <strong className={isCrit ? 'text-rose-400' : 'text-amber-400'}>{alert.riskScore}/100</strong></span>
                        )}
                        <span>ACTION: <strong className="text-cyan-400">{alert.action}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <button
                      onClick={() => viewAnalysisForAlert(alert)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold flex items-center space-x-1 border border-slate-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Forensics</span>
                    </button>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                      title="Dismiss"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-16 text-center text-slate-500 font-mono bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
            <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No security alerts recorded. Threat surveillance active.</p>
          </div>
        )}
      </div>
    </div>
  );
}
