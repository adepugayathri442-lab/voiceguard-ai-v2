import React from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Bell, 
  Lock, 
  Trash2, 
  Check, 
  Sliders, 
  Volume2, 
  Radio, 
  Smartphone,
  Mic,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SettingsPage() {
  const { settings, setSettings, clearAllData, showToast } = useApp();

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    showToast(`Setting "${key}" updated.`, 'info');
  };

  const handleSensitivityChange = (val) => {
    setSettings(prev => ({ ...prev, sensitivity: val }));
    showToast(`Detection Sensitivity set to ${val}.`, 'info');
  };

  const handleThresholdChange = (e) => {
    const val = Number(e.target.value);
    setSettings(prev => ({ ...prev, riskThreshold: val }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Settings className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">Engine Configuration</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">System & Telemetry Settings</h2>
          <p className="text-xs text-slate-400">
            Configure risk tolerance thresholds, real-time VAD parameters, and local data persistence.
          </p>
        </div>

        <button
          onClick={clearAllData}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:border-rose-700 text-rose-300 border border-slate-700 text-xs font-bold flex items-center space-x-2 transition-all active:scale-95"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Local Storage Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Detection Parameters */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Detection Engine Parameters</h3>
          </div>

          <div className="space-y-4">
            {/* Real-time toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200">Continuous Voice Activity Detection (VAD)</span>
                <p className="text-[11px] text-slate-400">Monitor incoming stream volume and speech density</p>
              </div>
              <button
                onClick={() => toggleSetting('realTimeDetection')}
                className={`w-11 h-6 rounded-full transition-colors relative ${settings.realTimeDetection ? 'bg-cyan-500' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${settings.realTimeDetection ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            {/* Sensitivity */}
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1.5">VAD Energy Sensitivity</label>
              <div className="grid grid-cols-3 gap-2">
                {['LOW', 'MEDIUM', 'HIGH'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => handleSensitivityChange(lvl)}
                    className={`py-1.5 text-xs font-mono font-semibold rounded-lg border transition-all ${
                      settings.sensitivity === lvl
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/60'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Risk Threshold */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300 font-bold">Security Alert Risk Threshold</span>
                <span className="text-rose-400 font-bold">{settings.riskThreshold} / 100</span>
              </div>
              <input
                type="range"
                min="40"
                max="90"
                step="5"
                value={settings.riskThreshold}
                onChange={handleThresholdChange}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[10px] text-slate-500">
                Analyses resulting in a calculated risk score &gt;= {settings.riskThreshold} will immediately trigger a critical security alert.
              </span>
            </div>

            {/* Auto Alert */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs font-bold text-slate-200">Auto-Prompt Out-of-band Verification</span>
                <p className="text-[11px] text-slate-400">Launch emergency modal when impersonation is flagged</p>
              </div>
              <button
                onClick={() => toggleSetting('autoAlertOnHighRisk')}
                className={`w-11 h-6 rounded-full transition-colors relative ${settings.autoAlertOnHighRisk ? 'bg-cyan-500' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${settings.autoAlertOnHighRisk ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Security & Privacy */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Lock className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Security & Privacy Governance</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-white block">Microphone Access Policy</span>
              <p className="text-slate-400 text-[11px]">
                Microphone capture is only initiated after explicit user interaction. No background recording occurs when the engine is idle.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-white block">Local Zero-Knowledge Processing</span>
              <p className="text-slate-400 text-[11px]">
                Audio decoding and feature extraction execute entirely within the local browser Web Audio context. Raw audio is never transmitted across the network without user authorization.
              </p>
            </div>

            {/* Sound alerts */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-xs font-bold text-slate-200">Audible Cybersecurity Alerts</span>
                <p className="text-[11px] text-slate-400">Audible warning on critical threat detection</p>
              </div>
              <button
                onClick={() => toggleSetting('soundAlerts')}
                className={`w-11 h-6 rounded-full transition-colors relative ${settings.soundAlerts ? 'bg-cyan-500' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${settings.soundAlerts ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Developer / Demo Testing Mode (Requirement 22 & 27) */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-slate-900/70 border border-amber-500/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Developer / Demonstration Mode</h3>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              settings.demoMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
            }`}>
              {settings.demoMode ? 'ENABLED (TEST BENCH ACTIVE)' : 'DISABLED (PRODUCTION REAL MIC DEFAULT)'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-white">Enable Developer Test Vector Controls</span>
              <p className="text-xs text-slate-400 max-w-xl">
                Production mode is default. Enabling this option exposes quick test injection controls in the sidebar for demonstrating known voice cloning vectors without requiring live speech.
              </p>
            </div>

            <button
              onClick={() => toggleSetting('demoMode')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                settings.demoMode 
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              {settings.demoMode ? 'Disable Demo Mode' : 'Enable Demo Mode'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
