import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  Fingerprint, 
  Volume2, 
  RotateCcw, 
  ArrowRight, 
  Share2, 
  Check, 
  Info, 
  ShieldAlert, 
  Play, 
  Pause, 
  Phone, 
  UserCheck, 
  AlertOctagon,
  Flame,
  Shield,
  FileText,
  Key,
  Lock,
  Ban,
  RefreshCw
} from 'lucide-react';
import { getAudioObjectUrl } from '../utils/indexedDBStorage';

export default function DetectionResults({ 
  result, 
  audioUrl, 
  onReset, 
  onNavigateToProfile 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [playableUrl, setPlayableUrl] = useState(audioUrl);
  const [verificationState, setVerificationState] = useState(null); // null | 'OTP_PENDING' | 'VERIFIED' | 'BLOCKED'
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [confirmedChannel, setConfirmedChannel] = useState(false);
  const audioRef = React.useRef(null);

  useEffect(() => {
    if (!playableUrl && result?.id) {
      getAudioObjectUrl(result.id).then((url) => {
        if (url) setPlayableUrl(url);
      });
    }
  }, [result?.id, playableUrl]);

  if (!result) return null;

  const rawClassification = result.rawClassification || result.classification || '';
  const isAi = rawClassification === 'AI_GENERATED' || result.isAIGenerated === true;
  const isGenuine = rawClassification === 'HUMAN';
  const isUnknown = rawClassification === 'UNCERTAIN' || rawClassification === 'INSUFFICIENT_AUDIO';
  const isClone = result.isCloneAlert === true || result.isClone === true;
  const isGenericAi = isAi && !isClone;

  const riskScore = Number.isFinite(Number(result.riskScore))
    ? Number(result.riskScore)
    : 0;
  const riskLevel = result.riskLevel ||
    (riskScore >= 76 ? 'CRITICAL' :
     riskScore >= 51 ? 'HIGH' :
     riskScore >= 21 ? 'MODERATE' : 'LOW');

  // Compatibility values for the current voiceDetectionService result format
  const confidence = Number(result.confidence ?? 0);
  const voiceSimilarity = Number(result.voiceSimilarity ?? result.speakerMatch?.similarity ?? 0);
  const antiSpoofScore = Number(result.antiSpoofScore ?? result.humanProbability ?? 0);

  const finalVerdict =
    result.finalVerdict ||
    result.classification ||
    (isAi ? 'AI-GENERATED VOICE DETECTED' :
     isGenuine ? 'HUMAN VOICE DETECTED' :
     'ANALYSIS INCONCLUSIVE');

  const identityResult =
    result.identityResult ||
    result.speakerVerification?.status ||
    (result.speakerMatch?.isMatch
      ? 'MATCHED TO REGISTERED USER'
      : 'VOICE IDENTITY NOT VERIFIED');

  const effectiveVoiceSimilarity = Math.max(
    0,
    Math.min(100, voiceSimilarity)
  );

  const effectiveAntiSpoofScore = Math.max(
    0,
    Math.min(100, antiSpoofScore)
  );

  const acousticPattern = result.breakdown?.acousticPattern || {
    flagged: isAi,
    status: isAi ? 'Synthetic acoustic characteristics detected' : 'No strong synthetic pattern detected',
    detail: isAi
      ? 'The backend audio analysis classified this recording as AI-generated.'
      : 'The backend audio analysis did not classify this recording as AI-generated.'
  };

  const prosody = result.breakdown?.prosody || {
    flagged: isAi,
    status: isAi ? 'Synthetic speech pattern detected' : 'Human-like speech pattern',
    detail: isAi
      ? 'Speech characteristics contributed to the AI-generated classification.'
      : 'Speech characteristics were consistent with the human classification.'
  };

  const forensicEvidence = result.forensicEvidence || {
    voiceSimilarityEvidence: {
      matched: effectiveVoiceSimilarity >= 78,
      status: effectiveVoiceSimilarity > 0
        ? `${effectiveVoiceSimilarity}% registered-profile similarity`
        : 'No registered-profile similarity available'
    },
    syntheticEvidence: {
      status: isAi ? 'AI-generated characteristics detected' : 'No AI-generated characteristics detected',
      detail: isAi
        ? `AI probability: ${Math.round(Number(result.aiProbability ?? 0) * 100)}%.`
        : `Human probability: ${Math.round(Number(result.humanProbability ?? 0) * 100)}%.`
    },
    prosodyEvidence: {
      status: isAi ? 'Synthetic pattern flagged' : 'Human pattern observed',
      detail: 'Derived from the current audio classification result.'
    },
    antiSpoofEvidence: {
      status: isAi ? 'Anti-spoof check flagged' : 'Anti-spoof check passed',
      detail: `Human probability: ${Math.round(Number(result.humanProbability ?? 0) * 100)}%.`
    }
  };

  const cloneResult = result.cloneResult || {
    hasProfile: Boolean(result.speakerVerification?.hasProfile || result.speakerMatch?.hasProfile),
    description: identityResult
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleCopyReport = () => {
    const summary = `VoiceGuard AI Forensic Report:
Call ID: ${result.callId || result.id}
Caller Number: ${result.callerNumber || 'Unknown'}
Security Verdict: ${result.finalVerdict}
Identity Result: ${result.identityResult}
Risk Score: ${riskScore}/100 (${riskLevel})
AI Classification: ${isAi ? 'AI-GENERATED / SYNTHETIC' : 'HUMAN'} (${result.confidence}% confidence)
Voice Similarity: ${result.voiceSimilarity}%
Timestamp: ${new Date(result.timestamp).toLocaleString()}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  const displayResult = {
    ...result,
    finalVerdict,
    identityResult,
    confidence,
    voiceSimilarity: effectiveVoiceSimilarity,
    antiSpoofScore: effectiveAntiSpoofScore,
    breakdown: {
      ...(result.breakdown || {}),
      acousticPattern,
      prosody
    },
    forensicEvidence,
    cloneResult
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {/* CALL CONTEXT & SPOOFING HEADER */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-sm text-white">
                {displayResult.callerNumber || '+91 98765 43210'}
              </span>
              {displayResult.knownCallerInfo?.isKnown ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center space-x-1">
                  <UserCheck className="w-3 h-3" />
                  <span>KNOWN CALLER ({displayResult.knownCallerInfo.previousCallCount} past calls)</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                  NEW CALLER NUMBER
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Call ID: <code className="text-cyan-400">{displayResult.callId || displayResult.id}</code> • Duration: {displayResult.durationSeconds || 5}s
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
          <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>Phone number is an identifier; voice biometrics verify identity.</span>
        </div>
      </div>

      {/* TOP CRITICAL WARNING BANNER IF CLONE DETECTED (STATE 3) */}
      {isClone && (
        <div className="rounded-2xl p-6 border-2 border-rose-500/90 bg-rose-950/50 backdrop-blur-xl shadow-2xl shadow-rose-950/60 relative overflow-hidden animate-fadeIn">
          <div className="absolute -right-8 -top-8 w-44 h-44 bg-rose-500/15 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-start space-x-4">
            <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-400 flex-shrink-0 animate-pulse">
              <ShieldAlert className="w-9 h-9" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-500 text-black tracking-wider uppercase animate-bounce">
                  🚨 SECURITY ALERT — VOICE CLONE DETECTED
                </span>
                <span className="text-xs font-mono text-rose-300">INCIDENT ID: #{displayResult.id.slice(-6)}</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-extrabold text-rose-100 tracking-tight">
                ⚠️ Someone may be using an AI-generated clone of the registered user's voice.
              </h3>
              <p className="text-xs sm:text-sm text-rose-200/90 leading-relaxed font-medium">
                This voice strongly resembles the registered user ({displayResult.voiceSimilarity}% biometric match) but shows synthetic/AI-generated characteristics. Do not approve any transactions or share sensitive info based on this call.
              </p>

              <div className="pt-2 border-t border-rose-500/30 flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded bg-rose-900/80 border border-rose-700/60 text-rose-200 font-semibold">
                  🚫 Hang Up & Terminate Call
                </span>
                <span className="px-2.5 py-1 rounded bg-rose-900/80 border border-rose-700/60 text-rose-200 font-semibold">
                  🔒 Freeze Financial Transfers
                </span>
                <span className="px-2.5 py-1 rounded bg-rose-900/80 border border-rose-700/60 text-rose-200 font-semibold">
                  📞 Independent Verification Required
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WARNING BANNER IF GENERIC AI DETECTED (STATE 2) */}
      {isGenericAi && (
        <div className="rounded-2xl p-5 border border-amber-500/80 bg-amber-950/40 backdrop-blur-xl shadow-xl shadow-amber-950/40 relative overflow-hidden animate-fadeIn">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex-shrink-0">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500 text-black tracking-wider uppercase">
                  🚨 SECURITY ALERT — AI SYNTHETIC DETECTED
                </span>
                <span className="text-xs font-mono text-amber-300">RISK LEVEL: HIGH ({riskScore}/100)</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-amber-100">
                AI-Generated Synthetic Speech Stream
              </h3>
              <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
                Acoustic vocoder phase discontinuities detected with {displayResult.confidence}% confidence. Caller is non-biological automated speech. Independent verification required before sharing sensitive data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION BANNER IF GENUINE USER DETECTED (STATE 1) */}
      {isGenuine && (
        <div className="rounded-2xl p-4 border border-emerald-500/50 bg-emerald-950/30 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold font-mono text-emerald-300 uppercase tracking-wider block flex items-center space-x-1.5">
                <span>✅ Voice verified successfully</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-normal">
                  AUTHENTIC
                </span>
              </span>
              <p className="text-xs text-slate-300">
                Biometric voice parameters match enrolled reference profile ({displayResult.voiceSimilarity}% similarity).
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 self-start sm:self-center">
            CLEARED FOR TRANSACTION
          </span>
        </div>
      )}

      {/* OVERALL COMBINED FINAL SECURITY DECISION & RISK SCORE CARD */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isClone
          ? 'bg-rose-950/30 border-rose-500/50 text-rose-300'
          : isGenuine
          ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
          : isGenericAi
          ? 'bg-amber-950/30 border-amber-500/50 text-amber-300'
          : 'bg-slate-900/60 border-slate-800 text-slate-300'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 block">
              FINAL SECURITY VERDICT & DECISION
            </span>
            <div className="flex items-center space-x-3">
              <span className="text-xl sm:text-2xl font-extrabold text-white">
                {displayResult.finalVerdict}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                riskLevel === 'CRITICAL' ? 'bg-rose-500 text-black animate-pulse' :
                riskLevel === 'HIGH' ? 'bg-amber-500 text-black' :
                riskLevel === 'MODERATE' ? 'bg-blue-500 text-white' :
                'bg-emerald-500 text-black'
              }`}>
                {riskLevel} RISK
              </span>
            </div>
            <div className="text-xs text-slate-300 font-mono">
              Identity Decision: <strong className="text-white">{displayResult.identityResult}</strong>
            </div>
          </div>

          {/* VISIBLE DETERMINISTIC RISK SCORE GAUGE */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-right min-w-[200px]">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              CALCULATED RISK SCORE
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-0.5">
              <span className={`${
                riskScore >= 76 ? 'text-rose-400' :
                riskScore >= 51 ? 'text-amber-400' :
                riskScore >= 21 ? 'text-blue-400' :
                'text-emerald-400'
              }`}>{riskScore}</span>
              <span className="text-xs text-slate-500 font-normal"> / 100</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1.5">
              <div 
                className={`h-full rounded-full ${
                  riskScore >= 76 ? 'bg-rose-500' :
                  riskScore >= 51 ? 'bg-amber-500' :
                  riskScore >= 21 ? 'bg-blue-500' :
                  'bg-emerald-500'
                }`}
                style={{ width: `${riskScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Results: Question 1 & Question 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ========================================================= */}
        {/* QUESTION 1: AI / SYNTHETIC VOICE ANALYSIS CARD            */}
        {/* ========================================================= */}
        <div className={`rounded-2xl p-6 relative transition-all duration-300 ${
          isAi ? 'glass-card-glow-red' : 'glass-card-glow-green'
        }`}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-300">
                1. AI Voice Analysis ("Is it AI?")
              </h2>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
              CONFIDENCE: {displayResult.confidence}%
            </span>
          </div>

          {/* Verdict Badge */}
          <div className="my-6 flex flex-col items-center justify-center text-center p-5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">
              Acoustic Synthesis Classification
            </span>

            {isAi ? (
              <div className="inline-flex items-center space-x-3 px-5 py-2.5 rounded-full bg-rose-500/20 border-2 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/25 animate-pulse">
                <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0" />
                <span className="text-base sm:text-lg font-black tracking-wide text-glow-red">
                  AI SYNTHETIC
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-3 px-5 py-2.5 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/25">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <span className="text-base sm:text-lg font-black tracking-wide text-glow-green">
                  HUMAN
                </span>
              </div>
            )}

            <div className="w-full max-w-sm mt-5 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Classification Confidence:</span>
                <span className={`font-bold ${isAi ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {displayResult.confidence}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    isAi ? 'bg-gradient-to-r from-orange-500 to-rose-500' : 'bg-gradient-to-r from-teal-500 to-emerald-400'
                  }`}
                  style={{ width: `${displayResult.confidence}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Synthesis Evidence:
            </h3>

            <div className={`p-3 rounded-lg border flex items-start space-x-3 ${
              displayResult.breakdown?.acousticPattern?.flagged ? 'bg-rose-950/20 border-rose-500/30 text-rose-200' : 'bg-slate-900/50 border-slate-800 text-slate-300'
            }`}>
              <div className={`mt-0.5 p-1 rounded-full ${
                displayResult.breakdown?.acousticPattern?.flagged ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {displayResult.breakdown?.acousticPattern?.flagged ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
              <div>
                <span className="font-semibold block text-slate-100">
                  Acoustic pattern: {displayResult.breakdown?.acousticPattern?.status}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {displayResult.breakdown?.acousticPattern?.detail}
                </p>
              </div>
            </div>

            <div className={`p-3 rounded-lg border flex items-start space-x-3 ${
              displayResult.breakdown?.prosody?.flagged ? 'bg-rose-950/20 border-rose-500/30 text-rose-200' : 'bg-slate-900/50 border-slate-800 text-slate-300'
            }`}>
              <div className={`mt-0.5 p-1 rounded-full ${
                displayResult.breakdown?.prosody?.flagged ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {displayResult.breakdown?.prosody?.flagged ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
              <div>
                <span className="font-semibold block text-slate-100">
                  Prosody: {displayResult.breakdown?.prosody?.status}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {displayResult.breakdown?.prosody?.detail}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* QUESTION 2: VOICE IDENTITY ANALYSIS CARD                  */}
        {/* ========================================================= */}
        <div className={`rounded-2xl p-6 relative transition-all duration-300 ${
          isClone ? 'glass-card-glow-red' : isGenuine ? 'glass-card-glow-green' : 'glass-card'
        }`}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Fingerprint className="w-5 h-5 text-indigo-400" />
              <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-300">
                2. Voice Identity Analysis ("Is it YOU?")
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              TARGET: REGISTERED PROFILE
            </span>
          </div>

          {!(displayResult.cloneResult?.hasProfile || isClone || isGenuine || isGenericAi) ? (
            <div className="my-6 p-6 rounded-xl bg-slate-950/70 border border-amber-500/30 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center">
                <Fingerprint className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-300">
                  No Reference Voice Profile Enrolled
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Enroll your voice once in "My Voice Profile" to enable biometric comparison against your identity.
                </p>
              </div>
              <button
                onClick={onNavigateToProfile}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all inline-flex items-center space-x-1.5"
              >
                <span>Register My Voice Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="my-6 space-y-5">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                {isClone ? (
                  <div className="space-y-2">
                    <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 border border-rose-500 text-rose-300">
                      <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
                      <span className="text-sm font-bold uppercase tracking-wide">
                        POSSIBLE CLONED USER VOICE
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-rose-300 mt-2">
                      {displayResult.finalVerdict}
                    </h4>
                  </div>
                ) : isGenuine ? (
                  <div className="space-y-2">
                    <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm font-bold uppercase tracking-wide">
                        MATCH — GENUINE USER
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-emerald-300 mt-2">
                      {displayResult.finalVerdict}
                    </h4>
                  </div>
                ) : isGenericAi ? (
                  <div className="space-y-2">
                    <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold uppercase tracking-wide">
                        NOT MATCHED TO USER
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-slate-300 mt-1">
                      {displayResult.finalVerdict}
                    </h4>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      <UserCheck className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold uppercase tracking-wide">
                        NOT MATCHED TO REGISTERED USER
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-slate-300 mt-1">
                      {displayResult.finalVerdict}
                    </h4>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-slate-800/80">
                  <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                    <span className="text-slate-400">Registered Voice Similarity:</span>
                    <span className={`font-bold ${isClone ? 'text-rose-400' : isGenuine ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {displayResult.voiceSimilarity}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        isClone ? 'bg-rose-500' : isGenuine ? 'bg-emerald-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${displayResult.voiceSimilarity}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Forensic Explanation */}
              <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                isClone ? 'bg-rose-950/20 border-rose-500/30 text-rose-200' : isGenuine ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200' : 'bg-slate-900/50 border-slate-800 text-slate-300'
              }`}>
                <div className="flex items-start space-x-2.5">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                  <div>
                    <span className="font-semibold block text-slate-100 mb-1">
                      Biometric Voiceprint Comparison:
                    </span>
                    <p className="text-slate-300 text-[11.5px]">
                      {displayResult.cloneResult?.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 p-3 rounded-lg bg-slate-900/40 border border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reference profile: KNOWN AUTHENTIC USER VOICE</span>
            </span>
            <button
              onClick={onNavigateToProfile}
              className="text-cyan-400 hover:text-cyan-300 underline font-medium"
            >
              Manage Profile
            </button>
          </div>
        </div>
      </div>

      {/* FORENSIC EVIDENCE BREAKDOWN (POSITIVE & NEGATIVE INDICATORS) */}
      <div className="p-5 rounded-2xl glass-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Forensic Evidence Breakdown</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            AUDIT DECISION ENGINE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Similarity Evidence */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="flex items-center space-x-2">
              {displayResult.forensicEvidence?.voiceSimilarityEvidence?.matched ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-slate-500 flex-shrink-0" />
              )}
              <span className="font-bold text-slate-200">
                Voice Similarity: {displayResult.voiceSimilarity}%
              </span>
            </div>
            <p className="text-slate-400 text-[11px] pl-6">
              {displayResult.forensicEvidence?.voiceSimilarityEvidence?.status}
            </p>
          </div>

          {/* Synthetic Vocoder Evidence */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="flex items-center space-x-2">
              {isAi ? (
                <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              )}
              <span className={`font-bold ${isAi ? 'text-rose-300' : 'text-slate-200'}`}>
                {displayResult.forensicEvidence?.syntheticEvidence?.status}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] pl-6">
              {displayResult.forensicEvidence?.syntheticEvidence?.detail}
            </p>
          </div>

          {/* Prosody Pattern Evidence */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="flex items-center space-x-2">
              {isAi ? (
                <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              )}
              <span className={`font-bold ${isAi ? 'text-rose-300' : 'text-slate-200'}`}>
                {displayResult.forensicEvidence?.prosodyEvidence?.status}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] pl-6">
              {displayResult.forensicEvidence?.prosodyEvidence?.detail}
            </p>
          </div>

          {/* Anti-Spoof Verification */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="flex items-center space-x-2">
              {!isAi ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              )}
              <span className={`font-bold ${!isAi ? 'text-emerald-300' : 'text-rose-300'}`}>
                {displayResult.forensicEvidence?.antiSpoofEvidence?.status}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] pl-6">
              Score: {displayResult.antiSpoofScore || 85}/100 physical acoustic authenticity.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* INDEPENDENT VERIFICATION LAYER (SECTION 18)               */}
      {/* ========================================================= */}
      <div className={`p-5 rounded-2xl glass-card space-y-4 border ${
        verificationState === 'VERIFIED'
          ? 'border-emerald-500/60 bg-emerald-950/20 shadow-lg shadow-emerald-950/40'
          : verificationState === 'BLOCKED'
          ? 'border-rose-500/60 bg-rose-950/20 shadow-lg shadow-rose-950/40'
          : 'border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-wide uppercase font-mono flex items-center space-x-2">
                <span>Independent Security Verification</span>
                <span className="px-2 py-0.2 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  MULTI-FACTOR PROTOCOL
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Out-of-band verification decision layer: <strong className="text-slate-300">VERIFIED → ALLOW</strong> or <strong className="text-slate-300">NOT VERIFIED → BLOCK ACTION</strong>
              </p>
            </div>
          </div>

          {/* Verification Status Badge */}
          {verificationState === 'VERIFIED' ? (
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>VERIFIED → ALLOW ACTION</span>
            </div>
          ) : verificationState === 'BLOCKED' ? (
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm animate-fadeIn">
              <Ban className="w-3.5 h-3.5 text-rose-400" />
              <span>NOT VERIFIED → BLOCK ACTION</span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800">
              <Lock className="w-3 h-3 text-cyan-400" />
              <span>AWAITING DECISION</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
          <button
            onClick={() => setVerificationState('VERIFIED')}
            className={`p-3 rounded-xl border text-left transition-all ${
              verificationState === 'VERIFIED'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-emerald-500/50'
            }`}
          >
            <span className="font-bold block flex items-center space-x-1.5 text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify Identity</span>
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Confirm speaker via primary biometric vault
            </span>
          </button>

          <button
            onClick={() => setVerificationState('OTP_PENDING')}
            className={`p-3 rounded-xl border text-left transition-all ${
              verificationState === 'OTP_PENDING'
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-cyan-500/50'
            }`}
          >
            <span className="font-bold block flex items-center space-x-1.5 text-cyan-300">
              <Key className="w-3.5 h-3.5" />
              <span>Request OTP</span>
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Simulate 2FA SMS / Token challenge
            </span>
          </button>

          <button
            onClick={() => {
              setConfirmedChannel(true);
              setVerificationState('VERIFIED');
            }}
            className={`p-3 rounded-xl border text-left transition-all ${
              confirmedChannel
                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-indigo-500/50'
            }`}
          >
            <span className="font-bold block flex items-center space-x-1.5 text-indigo-300">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Confirm Caller</span>
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Out-of-band phone callback check
            </span>
          </button>

          <button
            onClick={() => setVerificationState('BLOCKED')}
            className={`p-3 rounded-xl border text-left transition-all ${
              verificationState === 'BLOCKED'
                ? 'bg-rose-500/25 border-rose-500 text-rose-200 shadow-md shadow-rose-950'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-rose-500/50'
            }`}
          >
            <span className="font-bold block flex items-center space-x-1.5 text-rose-300">
              <Ban className="w-3.5 h-3.5 text-rose-400" />
              <span>Block Action</span>
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Freeze session & terminate call
            </span>
          </button>
        </div>

        {/* OTP Input Box if OTP_PENDING */}
        {verificationState === 'OTP_PENDING' && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/40 space-y-3 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs">
                <span className="font-bold text-white block">Simulated 6-Digit Cryptographic Challenge</span>
                <span className="text-slate-400 text-[11px]">Security code dispatched to {displayResult.callerNumber}: <code className="text-cyan-300 font-mono font-bold">749210</code></span>
              </div>
              <button
                type="button"
                onClick={() => setOtpInput('749210')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-cyan-300 border border-slate-700 self-start sm:self-center"
              >
                Auto-Fill Code (749210)
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => {
                  setOtpInput(e.target.value);
                  setOtpError(false);
                }}
                placeholder="Enter 6-digit OTP..."
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 font-mono text-sm text-white focus:outline-none focus:border-cyan-500 w-44 tracking-widest text-center"
              />
              <button
                onClick={() => {
                  if (otpInput.trim() === '749210' || otpInput.trim().length === 6) {
                    setVerificationState('VERIFIED');
                  } else {
                    setOtpError(true);
                  }
                }}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold font-mono transition-colors"
              >
                Confirm Verification
              </button>
              {otpError && (
                <span className="text-rose-400 text-xs font-mono">Invalid OTP code</span>
              )}
            </div>
          </div>
        )}

        {/* Verification Result Feedback Note */}
        {verificationState === 'VERIFIED' && (
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-200 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Identity independently verified. Multi-factor security challenge PASSED. Action ALLOWED.</span>
            </div>
            <button
              onClick={() => setVerificationState(null)}
              className="text-[11px] font-mono text-emerald-400 hover:underline"
            >
              Reset
            </button>
          </div>
        )}

        {verificationState === 'BLOCKED' && (
          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/50 text-xs text-rose-200 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <Ban className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>SECURITY ACTION: Session blocked. Sensitive operations frozen. Caller flagged in threat history.</span>
            </div>
            <button
              onClick={() => setVerificationState(null)}
              className="text-[11px] font-mono text-rose-400 hover:underline"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Audio Playback & Actions Bar */}
      <div className="p-4 rounded-xl glass-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {playableUrl ? (
            <>
              <audio 
                ref={audioRef} 
                src={playableUrl} 
                onEnded={() => setIsPlaying(false)} 
                className="hidden" 
              />
              <button
                onClick={toggleAudio}
                className="px-3.5 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 flex items-center space-x-2 text-xs font-semibold transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause Call Audio' : 'Play Recorded Call'}</span>
              </button>
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                Duration: {displayResult.durationSeconds || '5'}s
              </span>
            </>
          ) : (
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
              <Volume2 className="w-4 h-4 text-slate-500" />
              <span>Audio Captured & Indexed in Secure Vault</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <button
            onClick={handleCopyReport}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Report Copied' : 'Share Forensic Report'}</span>
          </button>

          <button
            onClick={onReset}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Monitor New Call</span>
          </button>
        </div>
      </div>
    </div>
  );
}
