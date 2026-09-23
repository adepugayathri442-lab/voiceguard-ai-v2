import React, { useState } from 'react';
import { 
  Mic, 
  Cpu, 
  Activity, 
  Fingerprint, 
  Bot, 
  BarChart3, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  CheckCircle2, 
  Ban, 
  ArrowDown, 
  Sparkles,
  Layers,
  ChevronRight,
  Play
} from 'lucide-react';

export default function SystemFlowScreen({ onSelectDemoScenario }) {
  const [activePathway, setActivePathway] = useState('ALL'); // 'ALL' | 'GENUINE' | 'AI_CLONE' | 'GENERIC_AI' | 'UNKNOWN'

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
          <Layers className="w-3.5 h-3.5" />
          <span>END-TO-END ARCHITECTURE PIPELINE</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
          System Decision Flow & Forensics
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Multi-stage physical signal processing and biometric decision pipeline: from real-time microphone ingestion to independent multi-factor verification.
        </p>
      </div>

      {/* Pathway Selector */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-2 rounded-2xl glass-card border border-slate-800 max-w-2xl mx-auto text-xs font-mono">
        <button
          onClick={() => setActivePathway('ALL')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            activePathway === 'ALL'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Complete Architecture
        </button>

        <button
          onClick={() => setActivePathway('GENUINE')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            activePathway === 'GENUINE'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Test 1: Genuine Path (Allow)
        </button>

        <button
          onClick={() => setActivePathway('AI_CLONE')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            activePathway === 'AI_CLONE'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Test 4: Clone Path (Block)
        </button>
      </div>

      {/* VISUAL FLOWCHART CONTAINER */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* STEP 1: VOICE INPUT */}
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 text-center shadow-lg space-y-1.5">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/30">
            <Mic className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white font-mono">1. Microphone / Audio Stream Input</h3>
          <p className="text-[11px] text-slate-400">
            Captures raw incoming PCM audio stream at 48kHz without destructive noise suppression.
          </p>
        </div>

        {/* Arrow */}
        <div className="flex justify-center text-cyan-400">
          <ArrowDown className="w-5 h-5 animate-bounce" />
        </div>

        {/* STEP 2: AUDIO PREPROCESSING */}
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-900/90 border border-slate-700 text-center shadow-lg space-y-1.5">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white font-mono">2. Audio Preprocessing & Framing</h3>
          <p className="text-[11px] text-slate-400">
            Zero-crossing normalization, framing into 512-sample windows, dynamic range quantization.
          </p>
        </div>

        {/* Arrow */}
        <div className="flex justify-center text-cyan-400">
          <ArrowDown className="w-5 h-5" />
        </div>

        {/* STEP 3: DUAL ACOUSTIC & PROSODY ANALYSIS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1.5">
            <Activity className="w-6 h-6 text-cyan-400 mx-auto" />
            <h4 className="text-xs font-bold text-white font-mono">3A. Acoustic & Spectral Analysis</h4>
            <p className="text-[10.5px] text-slate-400">
              FFT Spectral centroid, phase continuity, comb-filtering artifacts, high-frequency cutoff (&gt;10.5 kHz).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1.5">
            <Activity className="w-6 h-6 text-indigo-400 mx-auto" />
            <h4 className="text-xs font-bold text-white font-mono">3B. Prosody & Cadence Analysis</h4>
            <p className="text-[10.5px] text-slate-400">
              Autocorrelation pitch (F0), organic micro-jitter (natural &gt; 0.25%), glottal pulse asymmetry.
            </p>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center text-cyan-400">
          <ArrowDown className="w-5 h-5" />
        </div>

        {/* STEP 4: SPEAKER VERIFICATION & BIOMETRIC VAULT */}
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/40 text-center shadow-lg space-y-1.5">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
            <Fingerprint className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white font-mono">4. Speaker Verification (Voice Vault)</h3>
          <p className="text-[11px] text-slate-400">
            Compares speaker formant dispersion against enrolled user profile. Calculates biometric similarity score (0–100%).
          </p>
        </div>

        {/* Arrow */}
        <div className="flex justify-center text-cyan-400">
          <ArrowDown className="w-5 h-5" />
        </div>

        {/* STEP 5: AI VOICE DETECTION */}
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-900/90 border border-amber-500/40 text-center shadow-lg space-y-1.5">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white font-mono">5. 🤖 AI Voice & Vocoder Detection</h3>
          <p className="text-[11px] text-slate-400">
            Detects generative neural TTS (VALL-E, ElevenLabs, HiFi-GAN) signatures and anti-spoof authenticity.
          </p>
        </div>

        {/* Arrow */}
        <div className="flex justify-center text-cyan-400">
          <ArrowDown className="w-5 h-5" />
        </div>

        {/* STEP 6: CONTEXT ANALYSIS & DYNAMIC RISK SCORE */}
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 text-center shadow-lg space-y-1.5">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white font-mono">6. Context Analysis & Dynamic Risk Score</h3>
          <p className="text-[11px] text-slate-400">
            Combines AI probability, voice similarity, caller history, and VoIP spoof indicators into a deterministic 0–100 risk score.
          </p>
        </div>

        {/* Arrow */}
        <div className="flex justify-center text-cyan-400">
          <ArrowDown className="w-5 h-5" />
        </div>

        {/* BRANCHING DECISION POINT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-2">
          {/* BRANCH A: LOW / MEDIUM RISK */}
          <div className={`p-5 rounded-2xl border transition-all ${
            activePathway === 'GENUINE' || activePathway === 'ALL'
              ? 'bg-emerald-950/25 border-emerald-500/50 shadow-lg shadow-emerald-950/40'
              : 'opacity-40 border-slate-800'
          }`}>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>LOW / MEDIUM RISK (Score &lt; 50)</span>
            </div>
            <h4 className="text-sm font-bold text-white mt-1">Legitimate Voice Stream</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Natural biological prosody confirmed. Biometric match confirmed or third-party verified.
            </p>
            <div className="mt-4 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold flex items-center justify-between">
              <span>ACTION: ALLOW & MONITOR</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* BRANCH B: HIGH / CRITICAL RISK */}
          <div className={`p-5 rounded-2xl border transition-all ${
            activePathway === 'AI_CLONE' || activePathway === 'ALL'
              ? 'bg-rose-950/30 border-rose-500/60 shadow-lg shadow-rose-950/50'
              : 'opacity-40 border-slate-800'
          }`}>
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono font-bold">
              <ShieldAlert className="w-4 h-4 animate-pulse" />
              <span>HIGH / CRITICAL RISK (Score &gt; 50)</span>
            </div>
            <h4 className="text-sm font-bold text-white mt-1">AI Impersonation / Threat</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Synthetic neural speech or high-similarity voice clone attack detected.
            </p>
            <div className="mt-4 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold flex items-center justify-between">
              <span>⚠️ CRITICAL SECURITY ALERT</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>

            {/* INDEPENDENT VERIFICATION LAYER */}
            <div className="mt-4 pt-3 border-t border-rose-900/60 space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-indigo-300">
                <Key className="w-3.5 h-3.5" />
                <span>Independent Multi-Factor Verification</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono">
                <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
                  <span className="block font-bold">VERIFIED</span>
                  <span className="text-[10px] text-slate-400">→ ALLOW TRANSACTION</span>
                </div>
                <div className="p-2 rounded bg-rose-950/60 border border-rose-500/50 text-rose-300">
                  <span className="block font-bold">NOT VERIFIED</span>
                  <span className="text-[10px] text-slate-300">→ BLOCK ACTION</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
