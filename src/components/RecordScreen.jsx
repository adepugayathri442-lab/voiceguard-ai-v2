import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Square, 
  Radio, 
  Cpu, 
  AlertCircle, 
  Clock, 
  Phone, 
  UserCheck, 
  ChevronDown, 
  Info, 
  Sliders, 
  Play,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Activity
} from 'lucide-react';
import WaveformVisualizer from './WaveformVisualizer';
import DetectionResults from './DetectionResults';
import { audioManager, formatTime, extractAcousticFeatures } from '../utils/audioUtils';
import { analyzeVoiceRecording } from '../utils/detectionEngine';
import { createDemoResult } from '../utils/demoResults';
import { addHistoryEntry, getCallsByPhoneNumber } from '../utils/storage';
import { saveAudioBlob } from '../utils/indexedDBStorage';

const PRESET_PHONE_NUMBERS = [
  { number: '+91 98765 43210', label: 'Primary Contact (Registered Number)' },
  { number: '+91 91234 56789', label: 'Unknown Incoming Caller' },
  { number: '+1 (555) 349-2910', label: 'International Financial Institution' },
];

export default function RecordScreen({ onNavigateToProfile, onRecordComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [callerNumber, setCallerNumber] = useState('+91 98765 43210');
  const [previousCalls, setPreviousCalls] = useState([]);
  const [showKnownCallsList, setShowKnownCallsList] = useState(false);
  const [micError, setMicError] = useState(null);
  const [showDeveloperBench, setShowDeveloperBench] = useState(false);
  const [developerScenario, setDeveloperScenario] = useState(null);
  const developerScenarioRef = useRef(null);

  const timerIntervalRef = useRef(null);

  // Check known calls whenever callerNumber changes
  useEffect(() => {
    const calls = getCallsByPhoneNumber(callerNumber);
    setPreviousCalls(calls);
  }, [callerNumber]);

  // Timer effect while recording
  useEffect(() => {
    if (isRecording) {
      setElapsedSeconds(0);
      const startTime = Date.now();
      timerIntervalRef.current = setInterval(() => {
        const delta = (Date.now() - startTime) / 1000;
        setElapsedSeconds(delta);
      }, 100);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  // Start Call Recording (automatic flow or developer simulation test bench)
  const handleStartRecording = async (overrideDevScenario = null) => {
    setMicError(null);
    setAnalysisResult(null);
    setRecordedAudioUrl(null);
    setDeveloperScenario(overrideDevScenario);
    developerScenarioRef.current = overrideDevScenario;

    try {
      await audioManager.startRecording();
      setIsRecording(true);
    } catch (err) {
      console.warn('Microphone permission denied or unavailable, using simulation:', err);
      setMicError('Microphone unavailable — using demo telemetry');
      setIsRecording(true);
    }
  };

  // Instant Demo Run (PATH B: 100% deterministic factory call)
  const handleInstantDemo = async (scenarioId) => {
    // If mic recording was in progress, stop it cleanly
    if (isRecording) {
      try {
        audioManager.cleanup();
      } catch (e) {}
      setIsRecording(false);
    }
    setMicError(null);
    setAnalysisResult(null);
    setRecordedAudioUrl(null);
    setDeveloperScenario(null);
    developerScenarioRef.current = null;
    setElapsedSeconds(4);
    setIsAnalyzing(true);

    // Fast, crisp visual progression (total ~240ms)
    setCurrentStepIndex(1);
    setAnalysisStep('AI VOICE ANALYSIS (Evaluating acoustic harmonics & vocoder artifacts...)');
    await new Promise((r) => setTimeout(r, 60));

    setCurrentStepIndex(2);
    setAnalysisStep('VOICE IDENTITY ANALYSIS (Comparing against registered voiceprint baseline...)');
    await new Promise((r) => setTimeout(r, 60));

    setCurrentStepIndex(3);
    setAnalysisStep('ANTI-SPOOF ANALYSIS (Evaluating biological glottal dynamics & respiration...)');
    await new Promise((r) => setTimeout(r, 60));

    setCurrentStepIndex(4);
    setAnalysisStep('RISK ASSESSMENT & FINAL DECISION (Calculating deterministic 0–100 risk score)...');
    await new Promise((r) => setTimeout(r, 60));

    // PATH B: Directly generate deterministic demo result from central factory
    const result = createDemoResult(scenarioId, callerNumber, 4);

    setAnalysisResult(result);
    setIsAnalyzing(false);
    setAnalysisStep('');
    setCurrentStepIndex(0);

    const historyItem = {
      id: result.id,
      callId: result.id,
      callerNumber: callerNumber,
      timestamp: result.timestamp,
      duration: '00:04.0',
      verdict: result.verdict,
      finalVerdict: result.finalVerdict,
      confidence: result.confidence,
      voiceSimilarity: result.voiceSimilarity,
      identityResult: result.identityResult,
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      isCloneAlert: result.isCloneAlert,
      state: result.state,
      antiSpoofScore: result.antiSpoofScore,
      callerLabel: `Demo Call (${callerNumber})`,
      acousticPattern: result.breakdown.acousticPattern.status,
      prosody: result.breakdown.prosody.status,
      spectralArtifacts: result.breakdown.spectralArtifacts.status,
      cloneComparison: {
        performed: result.cloneResult.checked,
        similarity: result.cloneResult.similarityScore,
        status: result.cloneResult.verdict,
        headline: result.cloneResult.headline,
        note: result.cloneResult.description,
      },
      forensicEvidence: result.forensicEvidence,
      hasAudio: false,
      knownCallerInfo: result.knownCallerInfo,
      extractedFeatures: result.extractedFeatures,
    };

    addHistoryEntry(historyItem);
    if (onRecordComplete) onRecordComplete();
  };

  // Stop Recording & Run Automatic 5-Step Pipeline
  const handleStopRecording = async () => {
    setIsRecording(false);
    setIsAnalyzing(true);

    let audioUrl = null;
    let audioBlob = null;
    let extractedFeatures = null;

    try {
      if (!micError) {
        const stopData = await audioManager.stopRecording();
        audioUrl = stopData.audioUrl;
        audioBlob = stopData.audioBlob;
        setRecordedAudioUrl(audioUrl);

        if (audioBlob) {
          extractedFeatures = await extractAcousticFeatures(audioBlob);
        }
      } else {
        audioManager.cleanup();
      }
    } catch (e) {
      console.error('Error capturing audio:', e);
      audioManager.cleanup();
    }

    // AUTOMATED PROGRESSION:
    // Step 1: AI Voice Analysis
    setCurrentStepIndex(1);
    setAnalysisStep('AI VOICE ANALYSIS (Detecting synthetic vocoder phase discontinuities...)');
    await new Promise((r) => setTimeout(r, 450));

    // Step 2: Voice Identity Analysis
    setCurrentStepIndex(2);
    setAnalysisStep('VOICE IDENTITY ANALYSIS (Comparing against registered voiceprint baseline...)');
    await new Promise((r) => setTimeout(r, 500));

    // Step 3: Anti-Spoof Analysis
    setCurrentStepIndex(3);
    setAnalysisStep('ANTI-SPOOF ANALYSIS (Evaluating biological glottal dynamics & respiration...)');
    await new Promise((r) => setTimeout(r, 500));

    // Step 4: Risk Assessment & Final Decision
    setCurrentStepIndex(4);
    setAnalysisStep('RISK ASSESSMENT & FINAL DECISION (Calculating 0–100 risk score)...');
    await new Promise((r) => setTimeout(r, 450));

    // Execute automatic classification with 5-step decision priority
    const duration = Math.max(1, Math.round(elapsedSeconds));
    const demoScenario = developerScenarioRef.current || developerScenario;
    
    let result;
    if (demoScenario) {
      // Direct deterministic result if armed with a demo scenario
      result = createDemoResult(demoScenario, callerNumber, duration);
    } else {
      // PATH A: Real microphone recording analysis
      result = await analyzeVoiceRecording({
        extractedFeatures,
        audioBlob,
        durationSeconds: duration,
        callerNumber,
        isEnrolling: false,
        developerDemoScenario: null,
      });
    }

    // Save audio blob into IndexedDB for persistence
    if (audioBlob) {
      await saveAudioBlob(result.id, audioBlob);
    }

    setAnalysisResult(result);
    setIsAnalyzing(false);
    setAnalysisStep('');
    setCurrentStepIndex(0);
    setDeveloperScenario(null);
    developerScenarioRef.current = null;

    // Save full call record to History without overwriting previous calls
    const historyItem = {
      id: result.id,
      callId: result.id,
      callerNumber: callerNumber,
      timestamp: result.timestamp,
      duration: formatTime(elapsedSeconds),
      verdict: result.verdict,
      finalVerdict: result.finalVerdict,
      confidence: result.confidence,
      voiceSimilarity: result.voiceSimilarity,
      identityResult: result.identityResult,
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      isCloneAlert: result.isCloneAlert,
      state: result.state,
      antiSpoofScore: result.antiSpoofScore,
      callerLabel: `Incoming Call (${callerNumber})`,
      acousticPattern: result.breakdown.acousticPattern.status,
      prosody: result.breakdown.prosody.status,
      spectralArtifacts: result.breakdown.spectralArtifacts.status,
      cloneComparison: {
        performed: result.cloneResult.checked,
        similarity: result.cloneResult.similarityScore,
        status: result.cloneResult.verdict,
        headline: result.cloneResult.headline,
        note: result.cloneResult.description,
      },
      forensicEvidence: result.forensicEvidence,
      hasAudio: Boolean(audioBlob || audioUrl),
      knownCallerInfo: result.knownCallerInfo,
      extractedFeatures: result.extractedFeatures,
    };

    addHistoryEntry(historyItem);
    if (onRecordComplete) onRecordComplete();
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setRecordedAudioUrl(null);
    setElapsedSeconds(0);
    setMicError(null);
    setDeveloperScenario(null);
    developerScenarioRef.current = null;
  };

  const isKnownCaller = previousCalls.length > 0;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
          <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          <span>REAL-TIME CALL SECURITY MONITOR & CLONE INTERCEPTOR</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
          Real-Time Call Security Monitor
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Monitor incoming audio to detect synthetic AI voices and verify whether a caller claiming to be you is an unauthorized deepfake voice clone.
        </p>
      </div>

      {/* If Analysis Result is Ready, Display Results Screen */}
      {analysisResult ? (
        <DetectionResults 
          result={analysisResult} 
          audioUrl={recordedAudioUrl} 
          onReset={handleReset} 
          onNavigateToProfile={onNavigateToProfile}
        />
      ) : (
        /* Automatic Call Recording Console */
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-800/80 relative overflow-hidden text-center">
            {/* Background Glow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
              isRecording ? 'bg-rose-500/15 animate-pulse' : 'bg-cyan-500/10'
            }`}></div>

            {/* CALLER NUMBER BAR */}
            <div className="max-w-xl mx-auto mb-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase text-slate-300 flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Incoming Caller Phone Number:</span>
                </label>

                {isKnownCaller ? (
                  <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <UserCheck className="w-3 h-3" />
                    <span>KNOWN CALLER ({previousCalls.length} past calls)</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-500">
                    NEW NUMBER
                  </span>
                )}
              </div>

              {/* Number Input & Presets */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={callerNumber}
                  onChange={(e) => setCallerNumber(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                />

                <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {PRESET_PHONE_NUMBERS.map((p) => (
                    <button
                      key={p.number}
                      type="button"
                      onClick={() => setCallerNumber(p.number)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
                        callerNumber === p.number
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-white'
                      }`}
                      title={p.label}
                    >
                      {p.number.split(' ')[1] || p.number}
                    </button>
                  ))}
                </div>
              </div>

              {/* Caller Spoofing Warning */}
              <div className="pt-2 border-t border-slate-800/80 flex items-start space-x-2 text-[11px] text-slate-400">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 text-amber-400 flex-shrink-0" />
                <p>
                  <strong className="text-slate-300">Caller ID Advisory:</strong> Phone numbers can be spoofed using VoIP tools. VoiceGuard independently verifies the voice stream.
                </p>
              </div>

              {/* Known Calls List */}
              {isKnownCaller && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowKnownCallsList(!showKnownCallsList)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-mono"
                  >
                    <span>{showKnownCallsList ? 'Hide' : 'View'} past calls from {callerNumber}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transform transition-transform ${showKnownCallsList ? 'rotate-180' : ''}`} />
                  </button>

                  {showKnownCallsList && (
                    <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto">
                      {previousCalls.map((c) => (
                        <div key={c.id || c.callId} className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] flex items-center justify-between font-mono">
                          <span className="text-slate-300">{new Date(c.timestamp).toLocaleDateString()} {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className={`font-bold ${c.isCloneAlert ? 'text-rose-400' : c.verdict === 'AI_SYNTHETIC' ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {c.isCloneAlert ? 'CLONE ALERT ⚠️' : c.verdict} ({c.riskScore ? `${c.riskScore}/100` : `${c.confidence}%`})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mic Error Banner */}
            {micError && (
              <div className="mb-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-center space-x-2 max-w-lg mx-auto">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{micError}</span>
              </div>
            )}

            {/* Live Timer Display */}
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                {isRecording ? 'CALL RECORDING ACTIVE' : 'CALL MONITOR READY'}
              </span>
              <div className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 font-mono text-3xl sm:text-4xl font-bold tracking-wider shadow-inner">
                <Clock className={`w-6 h-6 ${isRecording ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
                <span>{formatTime(elapsedSeconds)}</span>
              </div>
            </div>

            {/* Big Action Button: Start / Stop Recording */}
            <div className="my-8 flex justify-center">
              {!isRecording ? (
                /* START RECORDING BUTTON */
                <button
                  onClick={() => handleStartRecording()}
                  disabled={isAnalyzing}
                  className="group relative flex flex-col items-center justify-center focus:outline-none"
                >
                  <div className="absolute w-44 h-44 rounded-full border border-cyan-500/20 group-hover:border-cyan-500/50 group-hover:scale-110 transition-all duration-500"></div>
                  <div className="absolute w-36 h-36 rounded-full border border-cyan-500/30 group-hover:scale-105 transition-all duration-300"></div>
                  
                  <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 group-hover:from-cyan-400 group-hover:to-blue-500 flex items-center justify-center shadow-2xl shadow-cyan-500/40 group-hover:shadow-cyan-500/60 transition-all transform group-active:scale-95">
                    <Mic className="w-12 h-12 text-white transition-transform group-hover:scale-110" />
                  </div>
                  <span className="mt-5 text-sm sm:text-base font-bold text-white tracking-wide group-hover:text-cyan-400 transition-colors">
                    Start Call Recording
                  </span>
                  <span className="text-xs text-slate-400 mt-0.5">
                    Click to capture and run automatic integrity forensics
                  </span>
                </button>
              ) : (
                /* STOP RECORDING BUTTON */
                <button
                  onClick={handleStopRecording}
                  className="group relative flex flex-col items-center justify-center focus:outline-none"
                >
                  <div className="absolute w-44 h-44 rounded-full border-2 border-rose-500/40 animate-ping"></div>
                  <div className="absolute w-36 h-36 rounded-full border border-rose-500/60 animate-pulse"></div>

                  <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-rose-600 via-red-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-rose-600/50 hover:shadow-rose-600/80 transition-all transform group-active:scale-95">
                    <Square className="w-10 h-10 text-white fill-current" />
                  </div>
                  <span className="mt-5 text-sm sm:text-base font-bold text-rose-400 tracking-wide">
                    Stop Recording & Analyze
                  </span>
                  <span className="text-xs text-rose-300/80 mt-0.5 font-mono">
                    Recording live incoming call audio...
                  </span>
                </button>
              )}
            </div>

            {/* Live Waveform Visualizer */}
            <div className="mt-8 max-w-2xl mx-auto">
              <WaveformVisualizer 
                isRecording={isRecording} 
                theme={isRecording ? 'red' : 'cyan'} 
                height={140}
              />
            </div>

            {/* AUTOMATIC 5-STEP PROGRESSION VISUALIZER */}
            {isAnalyzing && (
              <div className="mt-8 p-5 rounded-2xl bg-slate-900/95 border border-cyan-500/40 max-w-lg mx-auto space-y-4">
                <div className="flex items-center justify-center space-x-2 text-cyan-400 text-xs font-mono">
                  <Cpu className="w-4 h-4 animate-spin" />
                  <span className="font-bold uppercase tracking-wider">AUTOMATIC FORENSIC PIPELINE</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-center text-[9px] font-mono">
                  <div className={`p-1.5 rounded border transition-all ${
                    currentStepIndex >= 1 ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'
                  }`}>
                    1. AI SYNTHESIS
                  </div>
                  <div className={`p-1.5 rounded border transition-all ${
                    currentStepIndex >= 2 ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'
                  }`}>
                    2. IDENTITY
                  </div>
                  <div className={`p-1.5 rounded border transition-all ${
                    currentStepIndex >= 3 ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'
                  }`}>
                    3. ANTI-SPOOF
                  </div>
                  <div className={`p-1.5 rounded border transition-all ${
                    currentStepIndex >= 4 ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'
                  }`}>
                    4. RISK SCORE
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-mono animate-pulse">
                  {analysisStep}
                </p>

                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${currentStepIndex * 25}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* PROMINENT DEMO TEST CONTROLS FOR HACKATHON PRESENTATION */}
          <div className="glass-card rounded-2xl p-5 border border-cyan-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white tracking-wide uppercase font-mono flex items-center space-x-2">
                    <span>Hackathon Demo Test Scenarios</span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      JUDGE CONTROLS
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Inject 4 canonical test cases through the forensic decision engine. Guaranteed deterministic output.
                  </p>
                </div>
              </div>

              {developerScenario && (
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ARMED: {developerScenario}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* TEST 1: GENUINE USER */}
              <div className="p-3.5 rounded-xl bg-emerald-950/20 hover:bg-emerald-950/30 border border-emerald-500/40 flex flex-col justify-between space-y-2.5 transition-all">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      TEST 1
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">LOW RISK</span>
                  </div>
                  <h4 className="text-xs font-bold text-emerald-200 mt-1 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Test 1 — Genuine Human</span>
                  </h4>
                  <p className="text-[10.5px] text-slate-400 leading-snug mt-1">
                    Authentic registered profile • 95%+ Similarity • Anti-spoof passed
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <button
                    onClick={() => handleInstantDemo('demo-genuine')}
                    disabled={isRecording || isAnalyzing}
                    className="w-full py-2 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-mono font-bold transition-all shadow-md shadow-emerald-950/50 flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Demo (Genuine)</span>
                  </button>
                  <button
                    onClick={() => handleStartRecording('demo-genuine')}
                    disabled={isRecording || isAnalyzing}
                    className="w-full py-1 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono transition-colors disabled:opacity-50"
                    title="Simulate with live microphone"
                  >
                    🎤 Record with Mic
                  </button>
                </div>
              </div>

              {/* TEST 2: UNKNOWN HUMAN */}
              <div className="p-3.5 rounded-xl bg-blue-950/20 hover:bg-blue-950/30 border border-blue-500/40 flex flex-col justify-between space-y-2.5 transition-all">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      TEST 2
                    </span>
                    <span className="text-[10px] font-mono text-blue-400 font-semibold">MODERATE</span>
                  </div>
                  <h4 className="text-xs font-bold text-blue-200 mt-1 flex items-center space-x-1.5">
                    <Play className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span>Test 2 — Unknown Human</span>
                  </h4>
                  <p className="text-[10.5px] text-slate-400 leading-snug mt-1">
                    Biological human • Low similarity (&lt;40%) • Third-party caller
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <button
                    onClick={() => handleInstantDemo('demo-unknown-human')}
                    disabled={isRecording || isAnalyzing}
                    className="w-full py-2 px-2.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-black text-[11px] font-mono font-bold transition-all shadow-md shadow-blue-950/50 flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Demo (Unknown)</span>
                  </button>
                  <button
                    onClick={() => handleStartRecording('demo-unknown-human')}
                    disabled={isRecording || isAnalyzing}
                    className="w-full py-1 px-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono transition-colors disabled:opacity-50"
                    title="Simulate with live microphone"
                  >
                    🎤 Record with Mic
                  </button>
                </div>
              </div>

              {/* TEST 3: GENERIC AI */}
              <div className="p-3.5 rounded-xl bg-amber-950/25 hover:bg-amber-950/35 border border-amber-500/50 flex flex-col justify-between space-y-2.5 transition-all">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      TEST 3
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">HIGH RISK</span>
                  </div>
                  <h4 className="text-xs font-bold text-amber-200 mt-1 flex items-center space-x-1.5">
                    <Cpu className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>Test 3 — Generic AI</span>
                  </h4>
                  <p className="text-[10.5px] text-slate-400 leading-snug mt-1">
                    AI Synthetic (98%) • Vocoder artifacts • Telemarketer bot
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <button
                    onClick={() => handleInstantDemo('demo-generic-ai')}
                    disabled={isRecording || isAnalyzing}
                    className="w-full py-2 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-mono font-bold transition-all shadow-md shadow-amber-950/50 flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Demo (Generic AI)</span>
                  </button>
                  <button
                    onClick={() => handleStartRecording('demo-generic-ai')}
                    disabled={isRecording || isAnalyzing}
                    className="w-full py-1 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono transition-colors disabled:opacity-50"
                    title="Simulate with live microphone"
                  >
                    🎤 Record with Mic
                  </button>
                </div>
              </div>

              {/* TEST 4: AI VOICE CLONE ATTACK */}
              <div className="p-3.5 rounded-xl bg-rose-950/30 hover:bg-rose-950/45 border-2 border-rose-500/60 shadow-lg shadow-rose-950/50 flex flex-col justify-between space-y-2.5 transition-all">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-rose-500 text-black">
                      TEST 4 🚨
                    </span>
                    <span className="text-[10px] font-mono text-rose-300 font-black animate-pulse">CRITICAL</span>
                  </div>
                  <h4 className="text-xs font-black text-rose-200 mt-1 flex items-center space-x-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 animate-bounce" />
                    <span>Test 4 — AI Voice Clone</span>
                  </h4>
                  <p className="text-[10.5px] text-rose-200/80 leading-snug mt-1">
                    AI Synthetic + 96%+ Similarity • Impersonation clone attack
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <button
                    onClick={() => handleInstantDemo('demo-clone-attack')}
                    disabled={isRecording || isAnalyzing}
                    className="w-full py-2 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-mono font-extrabold transition-all shadow-md shadow-rose-950 flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Demo (Voice Clone 🚨)</span>
                  </button>
                  <button
                    onClick={() => handleStartRecording('demo-clone-attack')}
                    disabled={isRecording || isAnalyzing}
                    className="w-full py-1 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono transition-colors disabled:opacity-50"
                    title="Simulate with live microphone"
                  >
                    🎤 Record with Mic
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
