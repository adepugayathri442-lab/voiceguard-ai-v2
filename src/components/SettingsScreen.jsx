import React, { useState } from 'react';
import { 
  Sliders, 
  Shield, 
  Database, 
  RotateCcw, 
  Check, 
  SlidersHorizontal, 
  AlertTriangle, 
  Lock, 
  Info,
  Layers,
  Cpu
} from 'lucide-react';
import { INITIAL_HISTORY_SEED } from '../utils/mockData';

export default function SettingsScreen({ onOpenSupabaseModal }) {
  const [similarityThreshold, setSimilarityThreshold] = useState(78);
  const [aiConfidenceThreshold, setAiConfidenceThreshold] = useState(70);
  const [voipAdvisoryEnabled, setVoipAdvisoryEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetHistorySeed = () => {
    if (window.confirm('Reset all audit history back to initial hackathon demonstration seed?')) {
      localStorage.setItem('voiceguard_call_history_v2', JSON.stringify(INITIAL_HISTORY_SEED));
      window.location.reload();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-6 h-6 text-cyan-400" />
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            System & Security Settings
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Tune forensic detection thresholds, biometric similarity tolerances, and zero-backend vault persistence.
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center space-x-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Settings saved to local browser vault successfully.</span>
        </div>
      )}

      {/* Thresholds Card */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Biometric & Forensic Decision Thresholds</span>
          </h3>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
            ENGINE CORE
          </span>
        </div>

        <div className="space-y-5 text-xs">
          {/* Similarity Threshold */}
          <div className="space-y-2">
            <div className="flex justify-between items-center font-mono">
              <span className="text-slate-300 font-bold">Biometric Voice Similarity Threshold (Genuine User Match):</span>
              <span className="text-cyan-400 font-bold text-sm">{similarityThreshold}%</span>
            </div>
            <input
              type="range"
              min={60}
              max={95}
              value={similarityThreshold}
              onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Incoming voice streams scoring above {similarityThreshold}% acoustic similarity will trigger profile correlation check.
            </p>
          </div>

          {/* AI Confidence Threshold */}
          <div className="space-y-2">
            <div className="flex justify-between items-center font-mono">
              <span className="text-slate-300 font-bold">AI Synthetic Voice Confidence Threshold:</span>
              <span className="text-amber-400 font-bold text-sm">{aiConfidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={90}
              value={aiConfidenceThreshold}
              onChange={(e) => setAiConfidenceThreshold(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Acoustic vocoder phase discontinuity confidence required to classify audio as synthetic neural speech.
            </p>
          </div>

          {/* VoIP Toggle */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-200 block">VoIP Caller ID Spoofing Advisories</span>
              <p className="text-[11px] text-slate-500">
                Warn users that caller ID phone numbers can be faked via SIP gateways without voice match.
              </p>
            </div>
            <button
              onClick={() => setVoipAdvisoryEnabled(!voipAdvisoryEnabled)}
              className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-colors ${
                voipAdvisoryEnabled ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {voipAdvisoryEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold font-mono transition-all shadow-md shadow-cyan-500/20"
          >
            Apply Configurations
          </button>
        </div>
      </div>

      {/* Backend & Data Persistence Card */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Storage & Demo Data Management</span>
          </h3>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            BROWSER VAULT
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="font-bold text-white block">Reset Demonstration Seed Log</span>
            <p className="text-slate-400 text-[11px]">
              Restores the default 4 demonstration history records for hackathon presentations.
            </p>
            <button
              onClick={handleResetHistorySeed}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Seed Log</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="font-bold text-white block">Supabase Cloud Roadmap</span>
            <p className="text-slate-400 text-[11px]">
              View PostgreSQL schema & RLS policies for multi-device sync and cloud archival.
            </p>
            <button
              onClick={onOpenSupabaseModal}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Open Supabase Guide</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
