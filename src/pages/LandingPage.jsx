import React from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Mic, 
  Activity, 
  Cpu, 
  Zap, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  PhoneCall, 
  Users, 
  BarChart3, 
  KeyRound, 
  Volume2, 
  Layers, 
  Globe, 
  Sparkles, 
  Radio, 
  FileWarning, 
  Briefcase, 
  Server, 
  Sliders, 
  Eye, 
  LayoutDashboard, 
  Check, 
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LandingPage() {
  const { setActiveTab } = useApp();

  return (
    <div className="w-full min-h-screen bg-[#070B14] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-800/80">
        {/* Cyber Glow Ambient Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/20 via-blue-600/15 to-indigo-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            
            {/* Status Pill Badge */}
            <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 shadow-lg shadow-cyan-500/10 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest">
                Enterprise Voice Security • Real-Time Protection
              </span>
            </div>

            {/* Main Headings */}
            <div className="space-y-3">
              <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white font-sans">
                VoiceGuard <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">AI</span>
              </h1>
              
              <p className="text-2xl sm:text-3xl text-slate-200 font-semibold tracking-tight">
                Voice Cloning Detection and Prevention
              </p>

              <p className="text-lg sm:text-xl font-mono text-cyan-400/90 font-medium">
                Analyze the Voice. Detect the Fake. Secure the Trust.
              </p>
            </div>

            {/* Short Explanation */}
            <p className="max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
              VoiceGuard AI detects AI-generated and cloned voices in real time, helping prevent voice-based impersonation, fraud, and unauthorized disclosure of sensitive information.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-sm border border-slate-700 hover:border-cyan-500/60 shadow-xl shadow-cyan-950/40 flex items-center justify-center space-x-2.5 transition-all group"
              >
                <LayoutDashboard className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>Enter Dashboard</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => setActiveTab('live-detection')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-mono font-bold text-sm shadow-xl shadow-cyan-600/30 flex items-center justify-center space-x-2.5 transition-all hover:scale-105 active:scale-95"
              >
                <Mic className="w-4 h-4 animate-pulse" />
                <span>Start Live Detection</span>
              </button>
            </div>

            {/* Live Security Metrics Bar */}
            <div className="pt-8 w-full">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-[#0B0F19]/90 border border-slate-800/90 shadow-2xl backdrop-blur-md">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-left">
                  <div className="text-[11px] font-mono text-slate-400">INSPECTION LATENCY</div>
                  <div className="text-xl font-bold font-mono text-cyan-400">&lt; 45ms</div>
                  <div className="text-[10px] text-slate-500">Zero-lag in-stream analysis</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-left">
                  <div className="text-[11px] font-mono text-slate-400">DEFENSE PROTOCOL</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">ACTIVE</div>
                  <div className="text-[10px] text-slate-500">Autonomous threat mitigation</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-left">
                  <div className="text-[11px] font-mono text-slate-400">FORENSIC TELEMETRY</div>
                  <div className="text-xl font-bold font-mono text-indigo-400">MULTI-LAYER</div>
                  <div className="text-[10px] text-slate-500">Glottal, vocoder & prosody</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-left">
                  <div className="text-[11px] font-mono text-slate-400">COMPLIANCE STANDARD</div>
                  <div className="text-xl font-bold font-mono text-white">DPDP / GDPR</div>
                  <div className="text-[10px] text-slate-500">Privacy-preserving feature isolation</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 2. PROBLEM SECTION */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 border-b border-slate-800/80 bg-gradient-to-b from-[#070B14] via-[#090D18] to-[#070B14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-500/30 text-rose-400 text-xs font-mono font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>THE EMERGING THREAT LANDSCAPE</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-sans">
              Your Voice Can Be Cloned. <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-orange-400">
                Your Trust Shouldn't Be.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
              Modern generative AI can generate highly realistic synthetic voices in seconds using minimal sample audio. These synthetic clones are weaponized for impersonation, financial fraud, social engineering, and unauthorized access to secure systems.
            </p>
          </div>

          {/* Threat Vectors 4-Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Threat 1 */}
            <div className="p-6 rounded-2xl bg-[#0B0F19]/90 border border-slate-800 hover:border-rose-500/40 transition-all hover:-translate-y-1 shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Executive & CEO Impersonation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fraudsters clone executive voices to authorize fraudulent urgent wire transfers, vendor payments, and corporate transactions over telephone calls.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-rose-400/90">
                <span>Vulnerability: High</span>
                <span>Wire Fraud Target</span>
              </div>
            </div>

            {/* Threat 2 */}
            <div className="p-6 rounded-2xl bg-[#0B0F19]/90 border border-slate-800 hover:border-amber-500/40 transition-all hover:-translate-y-1 shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PhoneCall className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Social Engineering & Vishing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Targeted phishing attacks mimicking trusted colleagues, IT helpdesk personnel, or vendor representatives to extract credentials and MFA tokens.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-amber-400/90">
                <span>Threat Vector: Vishing</span>
                <span>Credential Theft</span>
              </div>
            </div>

            {/* Threat 3 */}
            <div className="p-6 rounded-2xl bg-[#0B0F19]/90 border border-slate-800 hover:border-indigo-500/40 transition-all hover:-translate-y-1 shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <KeyRound className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Voice Biometric Bypass</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                High-fidelity zero-shot neural synthesis capable of fooling basic telephone voiceprints, automated IVR security, and acoustic identification systems.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-indigo-400/90">
                <span>Target: IVR Gateways</span>
                <span>Authentication Bypass</span>
              </div>
            </div>

            {/* Threat 4 */}
            <div className="p-6 rounded-2xl bg-[#0B0F19]/90 border border-slate-800 hover:border-cyan-500/40 transition-all hover:-translate-y-1 shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileWarning className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Confidential Data Leaks</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Adversaries deploying fabricated emergency scenarios and regulatory inquiries to manipulate employees into disclosing classified IP or patient records.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-cyan-400/90">
                <span>Risk: Data Breach</span>
                <span>Unauthorized Disclosure</span>
              </div>
            </div>

          </div>

          {/* Threat Metric Callout */}
          <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900/60 to-amber-950/30 border border-rose-900/50 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
                Critical Cyber Reality
              </span>
              <h4 className="text-xl font-bold text-white mt-1">
                Zero-Shot Cloning Requires Less Than 3 Seconds of Public Audio
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                A single social media post, podcast snippet, or voicemail message provides threat actors sufficient acoustic data to synthesize an indistinguishable replica.
              </p>
            </div>
            <div className="flex items-center space-x-6 shrink-0">
              <div className="text-center">
                <div className="text-3xl font-black text-rose-400 font-mono">3.0s</div>
                <div className="text-[11px] text-slate-400 font-mono uppercase">Audio Sample Needed</div>
              </div>
              <div className="h-10 w-px bg-slate-800" />
              <div className="text-center">
                <div className="text-3xl font-black text-amber-400 font-mono">+300%</div>
                <div className="text-[11px] text-slate-400 font-mono uppercase">YoY Deepfake Attacks</div>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 3. HOW VOICEGUARD AI WORKS */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>FORENSIC SIGNAL FLOW</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-sans">
              How VoiceGuard AI Works
            </h2>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              VoiceGuard analyzes characteristics such as acoustic patterns, spectral features, prosody and voice characteristics to identify suspicious synthetic speech.
            </p>
          </div>

          {/* 4-Step Visual Flow */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="relative p-6 rounded-2xl bg-[#0B0F19]/90 border border-slate-800 hover:border-cyan-500/50 transition-all shadow-xl group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-black font-mono text-cyan-400/80">01</span>
                <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Mic className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Capture Voice</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ingests live microphone streams, VoIP SIP audio, or recorded evidence with real-time Voice Activity Detection (VAD) to filter background noise and isolate clean vocal frames.
              </p>
              <div className="mt-4 text-[11px] font-mono text-cyan-400/80 flex items-center space-x-1">
                <span>Input: 16kHz PCM Stream</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-2xl bg-[#0B0F19]/90 border border-slate-800 hover:border-blue-500/50 transition-all shadow-xl group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-black font-mono text-blue-400/80">02</span>
                <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Analyze Acoustic Signals</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Extracts physical physiological metrics: LPC inverse glottal residual impulses, cycle-to-cycle micro-jitter perturbation, and high-frequency spectral roll-offs.
              </p>
              <div className="mt-4 text-[11px] font-mono text-blue-400/80 flex items-center space-x-1">
                <span>Features: Glottal & Prosodic</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-2xl bg-[#0B0F19]/90 border border-slate-800 hover:border-indigo-500/50 transition-all shadow-xl group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-black font-mono text-indigo-400/80">03</span>
                <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Cpu className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Detect AI Patterns</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Neural vocoders (HiFi-GAN, MelGAN) introduce distinct phase comb ripples between 4–8 kHz and sterile mathematical zero pauses that biological vocal folds never produce.
              </p>
              <div className="mt-4 text-[11px] font-mono text-indigo-400/80 flex items-center space-x-1">
                <span>Scanning: Vocoder Comb Lines</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative p-6 rounded-2xl bg-[#0B0F19]/90 border border-slate-800 hover:border-emerald-500/50 transition-all shadow-xl group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-black font-mono text-emerald-400/80">04</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Generate Risk Assessment</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Produces continuous 0–100 risk scoring, transparent signal contribution breakdowns, and triggers autonomous enterprise actions (alerts, step-up MFA, or call kill).
              </p>
              <div className="mt-4 text-[11px] font-mono text-emerald-400/80 flex items-center space-x-1">
                <span>Output: Risk Score & Action</span>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 4. REAL-TIME PROTECTION SECTION */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 border-b border-slate-800/80 bg-gradient-to-b from-[#070B14] via-[#0A0F1D] to-[#070B14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>CONTINUOUS IN-STREAM MONITORING</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-sans">
                Engineered for Real-Time Operational Defense
              </h2>

              <p className="text-base text-slate-300 leading-relaxed">
                VoiceGuard AI delivers sub-second deepfake detection designed to protect mission-critical communications without introducing call latency or disrupting natural conversation flow.
              </p>

              {/* Designed For 5 Pillars */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  DESIGNED FOR HIGH-RISK COMMUNICATION ENVIRONMENTS:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <PhoneCall className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Live Calls</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Continuous in-stream conversational inspection with real-time waveform visualization.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Server className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">VoIP Telephony</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Seamless SIP trunk, WebRTC, and enterprise PBX integration with zero packet delay.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Users className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Enterprise Communication</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Protecting executive video conferences, internal bridge calls, and helpdesk lines.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <KeyRound className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Banking & Financial</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Step-up verification before approving high-value wire transfers and account modifications.</p>
                    </div>
                  </div>

                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Lock className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Sensitive Conversations</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Ensuring identity integrity during legal deliberations, merger discussions, and healthcare consultations.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Right: Protection Status ACTIVE Console Visual (5 cols) */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-2xl bg-[#0B0F19]/95 border-2 border-emerald-500/30 shadow-2xl shadow-emerald-950/30 space-y-5">
                
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                      Protection Status: ACTIVE
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                    REAL-TIME ENGINE
                  </span>
                </div>

                {/* Simulated Telemetry Feed */}
                <div className="space-y-3 font-mono text-xs">
                  
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-slate-300">Glottal LPC Filter</span>
                    </div>
                    <span className="text-emerald-400 font-bold">ONLINE (38ms)</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-slate-300">Vocoder Comb Scanner</span>
                    </div>
                    <span className="text-emerald-400 font-bold">ACTIVE (0.0ms)</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-slate-300">Digital Silence Gating</span>
                    </div>
                    <span className="text-emerald-400 font-bold">MONITORING</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-slate-300">Micro-Jitter Evaluator</span>
                    </div>
                    <span className="text-emerald-400 font-bold">CALIBRATED</span>
                  </div>

                </div>

                {/* Live Acoustic Ripple Visual */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>LIVE ACOUSTIC TRACE</span>
                    <span className="text-cyan-400">16,000 Hz MONO</span>
                  </div>
                  <div className="h-10 flex items-end justify-between gap-1 px-1">
                    {[45, 60, 25, 80, 95, 40, 70, 85, 30, 90, 65, 50, 75, 40, 60, 85, 95, 35, 70, 55, 45, 80, 65, 50].map((h, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-gradient-to-t from-cyan-600 to-emerald-400 rounded-t-sm"
                        style={{ height: `${h}%`, opacity: 0.6 + (h / 250) }}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-1 text-[11px] font-mono text-slate-500 text-center">
                  Zero-Trust Telemetry • End-to-End Encrypted Signal Chain
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 5. DETECTION RESULT PREVIEW */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-semibold">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>CLASSIFICATION INTERFACE DEMONSTRATION</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-sans">
              Detection Result Preview
            </h2>

            <p className="text-base text-slate-400">
              Clear, transparent verdicts generated from deep physiological acoustics. Below is a UI demonstration of authentic voice verification versus synthetic deepfake detection.
            </p>
          </div>

          {/* Dual Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* HUMAN VOICE CARD */}
            <div className="p-7 rounded-2xl bg-[#0B0F19]/95 border-2 border-emerald-500/40 shadow-2xl shadow-emerald-950/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-emerald-950 text-emerald-400 text-xs font-mono font-bold border-b border-l border-emerald-500/30 rounded-bl-xl">
                HUMAN VOICE
              </div>

              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xl font-black text-white font-mono flex items-center space-x-2">
                    <span>✓ Verified</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-sans font-bold">CLEARED</span>
                  </div>
                  <p className="text-xs text-slate-400">Authentic Biological Speaker Identified</p>
                </div>
              </div>

              {/* Confidence & Risk */}
              <div className="grid grid-cols-2 gap-3 mb-6 p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                <div>
                  <span className="text-slate-500 block">CONFIDENCE SCORE</span>
                  <span className="text-xl font-bold text-emerald-400">98.4%</span>
                  <span className="text-[10px] text-slate-400 block">Natural Organic Speech</span>
                </div>
                <div>
                  <span className="text-slate-500 block">RISK INDEX</span>
                  <span className="text-xl font-bold text-cyan-400">12 / 100</span>
                  <span className="text-[10px] text-slate-400 block">Within Safe Tolerance</span>
                </div>
              </div>

              {/* Physical Acoustic Telemetry */}
              <div className="space-y-2.5 text-xs font-mono">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Forensic Acoustic Findings:</div>
                <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/60 flex items-center justify-between">
                  <span className="text-slate-300">Glottal LPC Residual:</span>
                  <span className="text-emerald-400 font-semibold">Impulsive (Peak/RMS: 5.4)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/60 flex items-center justify-between">
                  <span className="text-slate-300">Vocal Cord Micro-Jitter:</span>
                  <span className="text-emerald-400 font-semibold">0.82% (Natural Instability)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/60 flex items-center justify-between">
                  <span className="text-slate-300">Acoustic Noise Floor:</span>
                  <span className="text-emerald-400 font-semibold">Ambient Room Noise Present</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Action: Allowed without friction</span>
                <span className="text-emerald-400 font-bold">Threat: None</span>
              </div>
            </div>

            {/* AI-GENERATED VOICE CARD */}
            <div className="p-7 rounded-2xl bg-[#0B0F19]/95 border-2 border-rose-500/50 shadow-2xl shadow-rose-950/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-rose-950 text-rose-400 text-xs font-mono font-bold border-b border-l border-rose-500/30 rounded-bl-xl">
                AI-GENERATED VOICE
              </div>

              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-rose-400 animate-pulse" />
                </div>
                <div>
                  <div className="text-xl font-black text-rose-400 font-mono flex items-center space-x-2">
                    <span>⚠ Threat Detected</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 font-sans font-bold">FLAGGED</span>
                  </div>
                  <p className="text-xs text-slate-400">Synthetic Voice Clone Impersonation</p>
                </div>
              </div>

              {/* Confidence & Risk */}
              <div className="grid grid-cols-2 gap-3 mb-6 p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                <div>
                  <span className="text-slate-500 block">AI PROBABILITY</span>
                  <span className="text-xl font-bold text-rose-400">94.7%</span>
                  <span className="text-[10px] text-slate-400 block">High Vocoder Signature</span>
                </div>
                <div>
                  <span className="text-slate-500 block">RISK INDEX</span>
                  <span className="text-xl font-bold text-rose-400">92 / 100</span>
                  <span className="text-[10px] text-slate-400 block">CRITICAL THREAT</span>
                </div>
              </div>

              {/* Physical Acoustic Telemetry */}
              <div className="space-y-2.5 text-xs font-mono">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Forensic Acoustic Findings:</div>
                <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/60 flex items-center justify-between">
                  <span className="text-slate-300">Vocoder Phase Ripple:</span>
                  <span className="text-rose-400 font-semibold">Anomalous Comb Index (6.2 kHz)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/60 flex items-center justify-between">
                  <span className="text-slate-300">Vocal Cord Micro-Jitter:</span>
                  <span className="text-rose-400 font-semibold">0.11% (Parametric Quantization)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/60 flex items-center justify-between">
                  <span className="text-slate-300">Silence Noise Floor:</span>
                  <span className="text-rose-400 font-semibold">Sterile Digital Zeros (0.0000)</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-rose-400 font-bold">Action: Step-Up MFA / Terminate Call</span>
                <span className="text-rose-400 font-bold">Threat: Critical</span>
              </div>
            </div>

          </div>

          {/* Explicit Demonstration Notice */}
          <div className="mt-8 p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3 text-xs text-slate-400">
            <span className="text-cyan-400 font-mono font-bold mt-0.5">ℹ️ NOTE:</span>
            <p>
              This is a visual UI demonstration of VoiceGuard AI's dual classification standards. Live audio detections are executed dynamically through the actual backend inference service connected to the Live Detection and Audio Analysis screens.
            </p>
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 6. KEY FEATURES */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 border-b border-slate-800/80 bg-gradient-to-b from-[#070B14] via-[#090D18] to-[#070B14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>CORE CAPABILITIES</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-sans">
              Comprehensive Voice Defense Platform
            </h2>

            <p className="text-base text-slate-400">
              Enterprise cybersecurity features engineered to protect every layer of conversational voice authentication.
            </p>
          </div>

          {/* 8 Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-[#0B0F19]/90 border border-slate-800 hover:border-cyan-500/40 transition-all hover:-translate-y-1 shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Real-Time Voice Detection</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sub-second audio processing provides instantaneous live verdict updates directly in the browser with live oscilloscope waveform visualization.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-[#0B0F19]/90 border border-slate-800 hover:border-blue-500/40 transition-all hover:-translate-y-1 shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">AI Voice / Deepfake Detection</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Detects synthetic speech produced by neural vocoders (HiFi-GAN, MelGAN), diffusion voice clones, and zero-shot voice conversion models.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-[#0B0F19]/90 border border-slate-800 hover:border-indigo-500/40 transition-all hover:-translate-y-1 shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Acoustic & Spectral Analysis</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Decomposes speech into physical acoustic metrics including LPC glottal impulse residuals, autocorrelation pitch F0, and spectral centroid flatness.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl bg-[#0B0F19]/90 border border-slate-800 hover:border-emerald-500/40 transition-all hover:-translate-y-1 shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Risk Scoring</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Continuous 0–100 risk scoring index calibrated against configurable enterprise security policies and operational tolerance thresholds.
              </p>
            </div>

            {/* Card 5 */}
            <div className="p-6 rounded-2xl bg-[#0B0F19]/90 border border-slate-800 hover:border-rose-500/40 transition-all hover:-translate-y-1 shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Suspicious Call Alerts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated modal alerts, sliding top-banner alarms, and incident audit logging when synthetic speech exceeds critical threat thresholds.
              </p>
            </div>

            {/* Card 6 */}
            <div className="p-6 rounded-2xl bg-[#0B0F19]/90 border border-slate-800 hover:border-cyan-500/40 transition-all hover:-translate-y-1 shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Privacy-Focused Processing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Designed for DPDP Act and GDPR compliance with client-side feature isolation, local storage persistence, and zero permanent recording retention.
              </p>
            </div>

            {/* Card 7 */}
            <div className="p-6 rounded-2xl bg-[#0B0F19]/90 border border-slate-800 hover:border-blue-500/40 transition-all hover:-translate-y-1 shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Server className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Enterprise Integration</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Standard REST API hooks, WebRTC compatibility, and SOC incident dispatch workflows for frictionless contact center deployment.
              </p>
            </div>

            {/* Card 8 */}
            <div className="p-6 rounded-2xl bg-[#0B0F19]/90 border border-slate-800 hover:border-indigo-500/40 transition-all hover:-translate-y-1 shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Multilingual / Accent-Aware</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Focuses on physiological glottal fold closure and mathematical vocoder artifacts rather than vocabulary, remaining robust across all languages and accents.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 7. SECURITY MESSAGE */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-24 border-b border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-cyan-950/50 via-slate-900/90 to-indigo-950/50 border-2 border-cyan-500/40 shadow-2xl shadow-cyan-950/50 text-center space-y-6 relative overflow-hidden">
            
            <div className="w-16 h-16 rounded-2xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center mx-auto text-cyan-400 shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-8 h-8 text-cyan-400" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-sans">
              Secure Every Conversation
            </h2>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              VoiceGuard AI adds an additional layer of protection before sensitive actions, financial approvals, or confidential information are shared.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <div className="px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-xs font-mono text-cyan-300 flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>Zero-Trust Architecture</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-xs font-mono text-cyan-300 flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>Non-Invasive Telemetry</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-xs font-mono text-cyan-300 flex items-center space-x-2">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>Tamper-Resistant Audit Trail</span>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 8. FINAL CTA */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-sans">
            Verify the Voice. Protect the Conversation.
          </h2>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Experience real-time voice cloning detection and explore our enterprise security operations center.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-sm border border-slate-700 hover:border-cyan-500/60 shadow-xl flex items-center justify-center space-x-2.5 transition-all group"
            >
              <LayoutDashboard className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>Enter Dashboard</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => setActiveTab('live-detection')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-mono font-bold text-sm shadow-xl shadow-cyan-600/30 flex items-center justify-center space-x-2.5 transition-all hover:scale-105 active:scale-95"
            >
              <Mic className="w-4 h-4 animate-pulse" />
              <span>Start Live Detection</span>
            </button>
          </div>

          {/* Security Notice & Build Version Footer */}
          <div className="pt-16 text-center text-xs font-mono text-slate-500 border-t border-slate-900 mt-12">
            <p>VOICEGUARD AI • ENTERPRISE VOICE CLONING DETECTION & REAL-TIME DEFENSE</p>
            <p className="text-[11px] text-slate-600 mt-1">SIH Problem Statement 26104 • Zero-Trust Biometric Security</p>
          </div>

        </div>
      </section>

    </div>
  );
}
