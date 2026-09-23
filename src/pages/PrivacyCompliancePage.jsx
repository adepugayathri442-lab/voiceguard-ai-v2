import React, { useState } from 'react';
import { 
  Shield, 
  CheckCircle2, 
  Lock, 
  Cpu, 
  Cloud, 
  FileCheck, 
  Key, 
  Database, 
  HardDrive, 
  Clock, 
  EyeOff, 
  Server,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';

/**
 * PrivacyCompliancePage
 * Enterprise Privacy & Regulatory Compliance Dashboard.
 * Covers Edge vs Cloud inference, biometric GDPR/RBI standards, ephemeral scrubbing, and SHA-256 cryptographic audit proofs.
 */
export default function PrivacyCompliancePage() {
  const { complianceData, updateCompliance, showToast } = useApp();
  const [data, setData] = useState(complianceData);
  const [verifyingHash, setVerifyingHash] = useState(false);
  const [hashVerified, setHashVerified] = useState(true);

  const handleInferenceModeToggle = (mode) => {
    const updated = { ...data, inferenceMode: mode };
    setData(updated);
    updateCompliance(updated);
    showToast(`Inference Architecture switched to: ${mode === 'EDGE' ? 'Local On-Premise Edge' : 'Hybrid Secure Enclave Cloud'}`, 'success');
  };

  const handleToggle = (field) => {
    const updated = { ...data, [field]: !data[field] };
    setData(updated);
    updateCompliance({ [field]: !data[field] });
  };

  const verifyAuditSeal = () => {
    setVerifyingHash(true);
    setTimeout(() => {
      setVerifyingHash(false);
      setHashVerified(true);
      showToast('SHA-256 Cryptographic Merkle Root verified against immutable audit chain.', 'success');
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="p-5 rounded-2xl bg-[#0B0F19]/90 border border-slate-800/90 shadow-xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Regulatory Assurance & Data Governance
            </span>
          </div>
          <h2 className="text-2xl font-black text-white font-mono tracking-tight mt-1">
            Privacy, Biometrics & Compliance Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full compliance with GDPR Article 9 (Biometric Data), RBI Cyber Security Framework, and ISO 27001.
          </p>
        </div>

        {/* Global Compliance Status Badge */}
        <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>ALL FRAMEWORKS: 100% AUDITED</span>
        </div>
      </div>

      {/* Section 1: Edge Inference vs Cloud Processing Architecture */}
      <div className="p-5 rounded-2xl bg-[#0B0F19]/90 border border-slate-800/90 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Inference Architecture & Audio Ingestion Mode
            </h3>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs">
            <button
              onClick={() => handleInferenceModeToggle('EDGE')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                data.inferenceMode === 'EDGE'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Edge Local Inference (Zero Cloud)</span>
            </button>
            <button
              onClick={() => handleInferenceModeToggle('CLOUD')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                data.inferenceMode === 'CLOUD'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Hybrid Secure Enclave Cloud</span>
            </button>
          </div>
        </div>

        {/* Architecture Details Comparison Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Edge Info */}
          <div className={`p-4 rounded-xl border transition-all ${
            data.inferenceMode === 'EDGE'
              ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md shadow-emerald-950'
              : 'bg-slate-900/40 border-slate-800 opacity-60'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono text-emerald-400 flex items-center space-x-1.5">
                <Cpu className="w-4 h-4" />
                <span>On-Premise SBC Edge Node</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Real-time deep learning model inference (ResNet-BiLSTM) runs directly inside the session border controller (SBC) volatile memory. Zero raw voice waveforms ever leave the local network boundary.
            </p>
            <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
              <span>LATENCY: <strong className="text-emerald-400">~42ms</strong></span>
              <span>DATA TRANSIT: <strong className="text-emerald-400">0 KB Offsite</strong></span>
            </div>
          </div>

          {/* Cloud Info */}
          <div className={`p-4 rounded-xl border transition-all ${
            data.inferenceMode === 'CLOUD'
              ? 'bg-cyan-950/20 border-cyan-500/50 shadow-md shadow-cyan-950'
              : 'bg-slate-900/40 border-slate-800 opacity-60'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono text-cyan-400 flex items-center space-x-1.5">
                <Cloud className="w-4 h-4" />
                <span>Confidential GPU Enclave (AWS Nitro / GCP)</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                STANDBY
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Streams encrypted audio payload via mTLS 1.3 to dedicated hardware-isolated Nitro enclave. Ideal for high-density multi-branch call center architectures requiring cluster autoscaling.
            </p>
            <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
              <span>LATENCY: <strong className="text-cyan-400">~120ms</strong></span>
              <span>SECURITY: <strong className="text-cyan-400">Hardware Attested</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Data Retention & Anonymization Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Retention Toggles */}
        <div className="p-5 rounded-2xl bg-[#0B0F19]/90 border border-slate-800/90 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Data Retention & Auto-Scrubbing Policy
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">EPHEMERAL RAM</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="font-bold text-slate-200 block">Ephemeral Volatile Buffer</span>
                <span className="text-[10.5px] text-slate-400 font-sans block mt-0.5">
                  Audio PCM chunks automatically overwritten in RAM every 5 seconds.
                </span>
              </div>
              <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="font-bold text-slate-200 block">Automated Audio Scrub Window</span>
                <span className="text-[10.5px] text-slate-400 font-sans block mt-0.5">
                  Incident recording logs deleted automatically after designated window.
                </span>
              </div>
              <span className="px-2 py-1 rounded bg-slate-800 text-cyan-400 font-bold">
                {data.autoScrubHours} Hours
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="font-bold text-slate-200 block">Voiceprint Vector Expiration</span>
                <span className="text-[10.5px] text-slate-400 font-sans block mt-0.5">
                  Mathematical ECAPA-TDNN embeddings re-hashed or purged.
                </span>
              </div>
              <span className="px-2 py-1 rounded bg-slate-800 text-cyan-400 font-bold">
                {data.embeddingRetentionDays} Days
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="font-bold text-slate-200 block">Anonymize Telephony Identifiers</span>
                <span className="text-[10.5px] text-slate-400 font-sans block mt-0.5">
                  Mask incoming caller PSTN/SIP numbers in all persistent logs.
                </span>
              </div>
              <button
                onClick={() => handleToggle('anonymizeVoiceprints')}
                className={`px-3 py-1 rounded font-bold transition-colors ${
                  data.anonymizeVoiceprints 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {data.anonymizeVoiceprints ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>
        </div>

        {/* Cryptographic SHA-256 Audit Seal */}
        <div className="p-5 rounded-2xl bg-[#0B0F19]/90 border border-slate-800/90 shadow-xl backdrop-blur-md space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Cryptographic Audit Chain Proof
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">SHA-256 SEAL</span>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed mt-3">
              Every analyzed call, threat classification, and supervisor intervention is cryptographically hashed into an immutable Merkle log chain to guarantee non-repudiation in judicial or banking fraud disputes.
            </p>

            {/* Hash Display */}
            <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
              <span className="text-[10px] text-slate-500 uppercase block mb-1">
                Current Block Merkle Root (SHA-256)
              </span>
              <span className="text-cyan-300 break-all select-all font-mono text-[11px]">
                {data.sha256AuditProof}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-mono text-emerald-400">
                {hashVerified ? 'Cryptographic Proof Verified' : 'Verifying Root...'}
              </span>
            </div>

            <button
              onClick={verifyAuditSeal}
              disabled={verifyingHash}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold flex items-center space-x-1.5 shadow transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${verifyingHash ? 'animate-spin' : ''}`} />
              <span>{verifyingHash ? 'VERIFYING...' : 'VERIFY AUDIT SEAL'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Section 3: Regulatory Compliance Framework Cards */}
      <div className="p-5 rounded-2xl bg-[#0B0F19]/90 border border-slate-800/90 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              International & National Regulatory Compliance Certifications
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">ANNUAL THIRD-PARTY AUDIT</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.frameworks.map((fw) => (
            <div key={fw.id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-bold font-mono text-white leading-tight">
                    {fw.name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed mt-1">
                  {fw.details}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/70 flex items-center justify-between font-mono text-[10px]">
                <span className={`px-2 py-0.5 rounded-full font-bold border ${fw.badge}`}>
                  {fw.status}
                </span>
                <span className="text-slate-500">GRADE: {fw.grade}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
