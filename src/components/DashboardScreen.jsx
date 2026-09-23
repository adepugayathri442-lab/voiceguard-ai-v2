import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Activity, 
  Cpu, 
  Phone, 
  UserCheck, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  Play, 
  Radio, 
  ArrowUpRight, 
  Sliders, 
  Layers, 
  Flame, 
  Clock, 
  Fingerprint,
  RotateCcw
} from 'lucide-react';
import { getStoredHistory, getStoredProfile } from '../utils/storage';
import { INITIAL_HISTORY_SEED } from '../utils/mockData';

export default function DashboardScreen({ onNavigateToTab, onRunDemoTest }) {
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let list = getStoredHistory();
    if (!list || list.length === 0) {
      list = INITIAL_HISTORY_SEED;
    }
    setHistory(list);
    setProfile(getStoredProfile());
  }, []);

  // Compute live cybersecurity metrics
  const totalCalls = history.length;
  const aiThreats = history.filter(c => c.verdict === 'AI_SYNTHETIC' && !c.isCloneAlert).length;
  const voiceClones = history.filter(c => c.isCloneAlert || c.state === 'STATE_3_AI_CLONE_ATTACK' || c.state === 'STATE_3_AI_VOICE_CLONE').length;
  const humanVerified = history.filter(c => c.verdict === 'HUMAN').length;
  const highRiskCalls = history.filter(c => (c.riskScore >= 51 || c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL')).length;

  const recentCalls = history.slice(0, 5);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Top Banner & Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <div className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>LIVE BIOMETRIC INTERCEPTOR</span>
            </div>
            <span className="text-xs font-mono text-slate-500">DEFENSE LEVEL 1</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1.5">
            VoiceGuard AI Security Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Real-time biometric voice integrity monitoring, neural vocoder deepfake detection, and impersonation clone defense.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => onNavigateToTab('record')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold font-mono transition-all shadow-lg shadow-cyan-500/20 flex items-center space-x-2"
          >
            <Radio className="w-4 h-4 animate-pulse text-black" />
            <span>Launch Live Call Monitor</span>
          </button>

          <button
            onClick={() => onNavigateToTab('flow')}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono transition-colors flex items-center space-x-1.5"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>View System Flow</span>
          </button>
        </div>
      </div>

      {/* TOP 5 CYBERSECURITY METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Calls */}
        <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1.5 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">TOTAL CALLS</span>
            <Phone className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
            {totalCalls}
          </div>
          <div className="text-[10px] font-mono text-slate-500 flex items-center space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span>Continuous Audio Ingestion</span>
          </div>
        </div>

        {/* AI Threats Detected */}
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-1.5 relative overflow-hidden group hover:border-amber-500/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-amber-300 font-bold">AI THREATS</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-300">
            {aiThreats}
          </div>
          <div className="text-[10px] font-mono text-amber-400/80 flex items-center space-x-1">
            <span>Synthetic Vocoder Intercepts</span>
          </div>
        </div>

        {/* Voice Clones Detected */}
        <div className="p-4 rounded-2xl bg-rose-950/25 border-2 border-rose-500/60 shadow-lg shadow-rose-950/40 space-y-1.5 relative overflow-hidden group hover:border-rose-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-rose-300 font-extrabold">CLONE ATTACKS</span>
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-400 text-glow-red">
            {voiceClones}
          </div>
          <div className="text-[10px] font-mono text-rose-300 flex items-center space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping"></span>
            <span>Targeted User Impersonations</span>
          </div>
        </div>

        {/* Human Verified */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-1.5 relative overflow-hidden group hover:border-emerald-500/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-emerald-300 font-bold">HUMAN VERIFIED</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-300">
            {humanVerified}
          </div>
          <div className="text-[10px] font-mono text-emerald-400/80 flex items-center space-x-1">
            <span>Biological Vocal Tract Matched</span>
          </div>
        </div>

        {/* High Risk Calls */}
        <div className="p-4 rounded-2xl glass-card border border-rose-500/30 space-y-1.5 relative overflow-hidden col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">HIGH RISK RATE</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
            {totalCalls > 0 ? Math.round((highRiskCalls / totalCalls) * 100) : 0}%
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            {highRiskCalls} calls scored &gt; 50/100
          </div>
        </div>
      </div>

      {/* QUICK DEMO TEST LAUNCHPAD FOR HACKATHON */}
      <div className="glass-card rounded-3xl p-6 border border-cyan-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold font-mono">
              ⚡
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase font-mono tracking-wider">
                Hackathon Quick Scenario Launchpad
              </h3>
              <p className="text-xs text-slate-400">
                Instantly trigger any of the 4 demonstration scenarios. Output is 100% deterministic and demo-ready.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
            DEMO PRESETS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Test 1 */}
          <button
            onClick={() => onRunDemoTest('demo-genuine')}
            className="p-4 rounded-2xl bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/40 text-left space-y-2 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                TEST 1
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">LOW RISK</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-200 group-hover:text-emerald-100 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Genuine Human</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Authentic user • 95%+ Similarity • Anti-spoof pass
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-emerald-400">
              <span>Execute Test 1</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>

          {/* Test 2 */}
          <button
            onClick={() => onRunDemoTest('demo-unknown-human')}
            className="p-4 rounded-2xl bg-blue-950/20 hover:bg-blue-950/40 border border-blue-500/40 text-left space-y-2 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                TEST 2
              </span>
              <span className="text-[10px] font-mono text-blue-400 font-bold">MODERATE RISK</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-200 group-hover:text-blue-100 flex items-center space-x-1.5">
                <Play className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>Unknown Human</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Biological speech • Third-party caller • Unmatched
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-blue-400">
              <span>Execute Test 2</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>

          {/* Test 3 */}
          <button
            onClick={() => onRunDemoTest('demo-generic-ai')}
            className="p-4 rounded-2xl bg-amber-950/25 hover:bg-amber-950/40 border border-amber-500/50 text-left space-y-2 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                TEST 3
              </span>
              <span className="text-[10px] font-mono text-amber-400 font-bold">HIGH RISK</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200 group-hover:text-amber-100 flex items-center space-x-1.5">
                <Play className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Generic AI Voice</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                AI Synthetic (97%) • Neural vocoder • Scam bot
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-amber-400">
              <span>Execute Test 3</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>

          {/* Test 4 */}
          <button
            onClick={() => onRunDemoTest('demo-clone-attack')}
            className="p-4 rounded-2xl bg-rose-950/30 hover:bg-rose-950/45 border-2 border-rose-500/60 text-left space-y-2 transition-all group shadow-md shadow-rose-950/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-rose-500 text-black">
                TEST 4 🚨
              </span>
              <span className="text-[10px] font-mono text-rose-300 font-black animate-pulse">CRITICAL</span>
            </div>
            <div>
              <h4 className="text-sm font-black text-rose-200 group-hover:text-white flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 animate-bounce" />
                <span>AI Voice Clone</span>
              </h4>
              <p className="text-[11px] text-rose-200/80 mt-1">
                AI Synthetic + 94%+ Similarity • Impersonation
              </p>
            </div>
            <div className="pt-2 border-t border-rose-900/60 flex items-center justify-between text-[11px] font-mono text-rose-400 font-bold">
              <span>Execute Test 4</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* TWO-COLUMN GRID: SYSTEM STATUS & RECENT DETECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Forensic Detections Table */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Recent Voice Integrity Detections
              </h3>
            </div>
            <button
              onClick={() => onNavigateToTab('history')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center space-x-1"
            >
              <span>View Full Log</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentCalls.map((call) => {
              const isAi = call.verdict === 'AI_SYNTHETIC';
              const isClone = call.isCloneAlert || call.state === 'STATE_3_AI_CLONE_ATTACK' || call.state === 'STATE_3_AI_VOICE_CLONE';
              const isGenuine = call.state === 'STATE_1_GENUINE_USER';

              return (
                <div
                  key={call.id || call.callId}
                  onClick={() => onNavigateToTab('history')}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isClone ? 'bg-rose-500/20 text-rose-400' :
                      isGenuine ? 'bg-emerald-500/20 text-emerald-400' :
                      isAi ? 'bg-amber-500/20 text-amber-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {isClone ? <ShieldAlert className="w-4 h-4 animate-pulse" /> :
                       isGenuine ? <CheckCircle2 className="w-4 h-4" /> :
                       isAi ? <Cpu className="w-4 h-4" /> :
                       <Phone className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold font-mono text-white">{call.callerNumber}</span>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                          isClone ? 'bg-rose-500 text-black' :
                          isGenuine ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          isAi ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {isClone ? 'CLONE DETECTED' : call.verdict}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{call.finalVerdict}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-white">
                      Risk: <span className={`${
                        call.riskLevel === 'CRITICAL' ? 'text-rose-400' :
                        call.riskLevel === 'HIGH' ? 'text-amber-400' :
                        call.riskLevel === 'MODERATE' ? 'text-blue-400' :
                        'text-emerald-400'
                      }`}>{call.riskScore}/100</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Defense Engine & Biometric Vault Health */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              System Defense Status
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold">Neural Vocoder Detection</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Phase discontinuity & comb-filtering analysis active on 48kHz audio stream.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold">Biometric Voice Vault</span>
                {profile ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                    ENROLLED
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                    DEMO VAULT
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {profile ? `Baseline F0: ${profile.baselinePitch || '138 Hz'} • Vault ID: ${profile.voiceFingerprintId?.slice(0, 10)}...` : 'Demo biometric key armed for hackathon presentation.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold">Anti-Spoofing & Liveness</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  98.4% ACCURACY
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Glottal pulse turbulence & organic micro-tremor verification enabled.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigateToTab('profile')}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold border border-slate-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Fingerprint className="w-4 h-4 text-cyan-400" />
              <span>Configure My Voice Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
