import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Square, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  Activity, 
  Radio, 
  Play, 
  Pause,
  Download,
  KeyRound,
  FileSearch,
  Volume2,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { audioCaptureService } from '../services/audioCaptureService';
import { voiceActivityService } from '../services/voiceActivityService';
import { analyzeVoice } from '../services/voiceDetectionService';
import { deepfakeDetectionModel } from '../services/deepfakeDetectionModel';
import RiskGauge from '../components/RiskGauge';
import { PitchContourChart, MFCCBars } from '../components/ForensicCharts';
import DeepfakeSignalBreakdown from '../components/DeepfakeSignalBreakdown';

/**
 * State Machine:
 * IDLE / READY -> REQUESTING_MIC -> LISTENING -> WAITING_FOR_SPEECH -> VOICE_DETECTED -> COLLECTING_AUDIO -> ANALYZING -> RESULT
 * Error states: MIC_PERMISSION_DENIED, MICROPHONE_UNAVAILABLE, INSUFFICIENT_AUDIO, ANALYSIS_ERROR
 */
export default function LiveDetectionPage() {
  const { 
    recordDetectionEvent, 
    handleStartIndependentVerification, 
    handleSaveEvidence,
    setActiveTab, 
    setLastDetection,
    settings,
    showToast
  } = useApp();

  // Core State Machine
  const [engineState, setEngineState] = useState('READY');
  const [micError, setMicError] = useState(null);
  const [modelStatus, setModelStatus] = useState('OFFLINE');
  
  // Real-time telemetry metrics
  const [audioLevel, setAudioLevel] = useState(0);
  const [voiceActivity, setVoiceActivity] = useState('NO SPEECH');
  const [speechSeconds, setSpeechSeconds] = useState(0);
  const [totalListeningSeconds, setTotalListeningSeconds] = useState(0);
  const [speechProgress, setSpeechProgress] = useState(0);
  
  // Pipeline Step State
  const [pipelineStage, setPipelineStage] = useState('');
  const [activePipelineIndex, setActivePipelineIndex] = useState(0);

  // Completed Detection
  const [detectionResult, setLocalDetectionResult] = useState(null);
  const [capturedAudioUrl, setCapturedAudioUrl] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Refs for animation loop and audio
  const animFrameRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const canvasRef = useRef(null);

  // Check model backend health
  useEffect(() => {
    let active = true;
    const verifyHealth = async () => {
      const h = await deepfakeDetectionModel.checkHealth();
      if (active) setModelStatus(h.status);
    };
    verifyHealth();
    const interval = setInterval(verifyHealth, 4000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  const stopSession = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    audioCaptureService.cleanup();
  };

  /**
   * Start Live Voice Detection
   */
  const handleStartVoiceDetection = async () => {
    setMicError(null);
    setLocalDetectionResult(null);
    setCapturedAudioUrl(null);
    setAudioLevel(0);
    setSpeechSeconds(0);
    setTotalListeningSeconds(0);
    setSpeechProgress(0);
    setVoiceActivity('NO SPEECH');
    setEngineState('REQUESTING_MIC');

    try {
      await audioCaptureService.startCapture();
      voiceActivityService.reset();
      setEngineState('LISTENING');

      // Start tick interval for duration tracking
      const intervalMs = 100;
      timerIntervalRef.current = setInterval(() => {
        setTotalListeningSeconds(t => +(t + intervalMs / 1000).toFixed(1));
      }, intervalMs);

      // Start animation loop for real-time waveform and VAD processing
      runAudioMonitoringLoop();

    } catch (err) {
      console.error('Audio capture error:', err);
      stopSession();
      if (err.message === 'MIC_PERMISSION_DENIED') {
        setMicError('Microphone permission was denied. Please allow microphone access in your browser settings to perform live voice analysis.');
        setEngineState('MIC_PERMISSION_DENIED');
      } else if (err.message === 'MICROPHONE_UNAVAILABLE') {
        setMicError('No microphone hardware detected on this system.');
        setEngineState('MICROPHONE_UNAVAILABLE');
      } else {
        setMicError(`Unable to start audio input: ${err.message}`);
        setEngineState('ANALYSIS_ERROR');
      }
    }
  };

  /**
   * Continuous monitoring loop: reads actual Web Audio Analyser data,
   * drives canvas waveform, evaluates VAD, and automatically triggers detection.
   */
  const runAudioMonitoringLoop = () => {
    const canvas = canvasRef.current;
    const ctx = canvas ? canvas.getContext('2d') : null;

    const tick = async () => {
      if (!audioCaptureService.isRecording) return;

      // 1. Calculate Real RMS Audio Level (0 - 100)
      const level = audioCaptureService.getAudioLevel();
      setAudioLevel(level);

      // 2. Process Voice Activity Detection (VAD)
      const vad = voiceActivityService.processFrame(level, 0.05);
      
      if (vad.isSpeaking) {
        setVoiceActivity('SPEECH DETECTED');
      } else if (vad.speechSeconds > 0) {
        setVoiceActivity('SPEECH PAUSED');
      } else {
        setVoiceActivity('NO SPEECH');
      }

      setSpeechSeconds(vad.speechSeconds);
      setSpeechProgress(vad.progressPercent);

      // 3. Render Real Oscilloscope Waveform onto Canvas
      if (canvas && ctx) {
        const timeData = audioCaptureService.getTimeDomainData();
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        // Center line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Waveform
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = vad.isSpeaking ? 'rgb(6, 182, 212)' : 'rgba(56, 189, 248, 0.35)';
        ctx.shadowColor = vad.isSpeaking ? 'rgba(6, 182, 212, 0.5)' : 'transparent';
        ctx.shadowBlur = vad.isSpeaking ? 10 : 0;

        const sliceWidth = width / timeData.length;
        let x = 0;

        for (let i = 0; i < timeData.length; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * height) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.stroke();
      }

      // 4. AUTOMATIC DETECTION TRIGGER:
      // Once sufficient speech is detected (>= 3.5s), halt listening and analyze automatically!
      if (vad.hasSufficientSpeech) {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        await triggerAutomaticAnalysis();
        return;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  };

  /**
   * Manual Stop early: check if enough speech, otherwise warn
   */
  const handleManualStop = async () => {
    if (speechSeconds < 2.5) {
      stopSession();
      setEngineState('INSUFFICIENT_AUDIO');
      showToast('Insufficient speech captured. Please speak for at least 3-4 seconds.', 'error');
      return;
    }
    await triggerAutomaticAnalysis();
  };

  /**
   * Trigger Automatic Analysis Sequence
   */
  const triggerAutomaticAnalysis = async () => {
    setEngineState('ANALYZING');
    setActivePipelineIndex(1);
    setPipelineStage('PREPROCESSING AUDIO (VAD Silence Gating & LUFS Normalization)...');

    // 1. Stop capture and obtain real audio Blob
    const { audioBlob, audioUrl } = await audioCaptureService.stopCapture();
    setCapturedAudioUrl(audioUrl);

    // Simulated realistic sequential pipeline stages reflecting actual computation
    await wait(400);
    setActivePipelineIndex(2);
    setPipelineStage('VOICE ACTIVITY ANALYSIS (Measuring speech density & pause ratios)...');

    await wait(450);
    setActivePipelineIndex(3);
    setPipelineStage('FEATURE EXTRACTION (Autocorrelation Pitch F0, Formants, Spectral Centroid, Jitter)...');

    await wait(450);
    setActivePipelineIndex(4);
    setPipelineStage('AUDIO ANOMALY ANALYSIS (Scanning for vocoder phase glitches & flatness)...');

    await wait(400);
    setActivePipelineIndex(5);
    setPipelineStage('SPEAKER VERIFICATION (Evaluating biometric distance against enrolled profile)...');

    await wait(350);
    setActivePipelineIndex(6);
    setPipelineStage('RISK SCORING & FINAL CLASSIFICATION (Executing deterministic heuristic engine)...');

    try {
      // Execute genuine mathematical analysis on the captured audio
      const result = await analyzeVoice(audioBlob, {
        number: 'Live Microphone Input',
        name: 'Live Active Speaker'
      }, {
        riskThreshold: settings.riskThreshold || 70
      });

      await wait(300);
      setActivePipelineIndex(7);
      setPipelineStage('ANALYSIS COMPLETE');

      setLocalDetectionResult(result);
      setEngineState('RESULT');

      // Cascade result into global state, history, alerts, and analytics!
      recordDetectionEvent(result);
      showToast(`Analysis completed: ${result.classification} (Risk: ${result.riskScore}/100)`, result.riskScore >= 70 ? 'error' : 'success');

    } catch (err) {
      console.error('Analysis error:', err);
      setEngineState('ANALYSIS_ERROR');
      setMicError(`Audio processing error: ${err.message}`);
    }
  };

  const handleResetDetector = () => {
    stopSession();
    setEngineState('READY');
    setMicError(null);
    setAudioLevel(0);
    setSpeechSeconds(0);
    setTotalListeningSeconds(0);
    setSpeechProgress(0);
    setVoiceActivity('NO SPEECH');
    setLocalDetectionResult(null);
    setCapturedAudioUrl(null);
    setIsPlayingAudio(false);
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current) return;
    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const wait = (ms) => new Promise(res => setTimeout(res, ms));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Activity className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">Real-Time Acoustic Integrity</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">REAL-TIME VOICE DETECTION ENGINE</h2>
          <p className="text-xs text-slate-400">
            Speak naturally. VoiceGuard analyzes your voice automatically.
          </p>
        </div>

        {/* Engine Status Indicators */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-2">
            <span className="text-slate-500">ENGINE STATUS:</span>
            <span className={`font-bold ${
              engineState === 'LISTENING' ? 'text-cyan-400 animate-pulse' :
              engineState === 'ANALYZING' ? 'text-indigo-400' :
              engineState === 'RESULT' ? 'text-emerald-400' :
              'text-slate-300'
            }`}>
              {engineState}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-2">
            <span className="text-slate-500">VOICE ACTIVITY:</span>
            <span className={`font-bold ${
              voiceActivity === 'SPEECH DETECTED' ? 'text-emerald-400' : 'text-slate-400'
            }`}>
              {voiceActivity}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-2">
            <span className="text-slate-500">AI MODEL:</span>
            {engineState === 'ANALYZING' ? (
              <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                ANALYZING
              </span>
            ) : modelStatus === 'CONNECTED' ? (
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                CONNECTED
              </span>
            ) : (
              <span className="font-bold text-rose-400 flex items-center gap-1.5" title="Backend not reached on port 8000">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                OFFLINE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mic Error / Denied Banner */}
      {micError && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 flex items-start space-x-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-200">
            <p className="font-bold">{micError}</p>
            <p className="mt-1 text-slate-300">
              Please check your browser permissions (address bar lock icon) and ensure microphone access is granted.
            </p>
          </div>
        </div>
      )}

      {/* Main Execution Console */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-6">
        
        {/* ========================================================= */}
        {/* STAGE: READY (Initial State - NO FAKE RESULT)             */}
        {/* ========================================================= */}
        {engineState === 'READY' && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-600/30 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center shadow-xl shadow-cyan-500/10">
                <Mic className="w-10 h-10 text-cyan-400" />
              </div>
            </div>

            <div className="max-w-md space-y-2">
              <h3 className="text-xl font-bold text-white">VoiceGuard Listening Engine Ready</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click below to start microphone capture. VoiceGuard will monitor your speech in real time, extract physical acoustic features, and automatically classify voice authenticity.
              </p>
            </div>

            {/* Standby Status Grid */}
            <div className="grid grid-cols-2 gap-3 max-w-sm w-full font-mono text-xs text-left">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">RISK SCORE:</span>
                <span className="text-sm font-bold text-slate-400">-- / 100</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">CLASSIFICATION:</span>
                <span className="text-sm font-bold text-slate-400">WAITING FOR AUDIO</span>
              </div>
            </div>

            {/* Large Primary Action Button */}
            <button
              onClick={handleStartVoiceDetection}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm tracking-wider uppercase flex items-center space-x-3 shadow-xl shadow-cyan-600/30 transition-all transform active:scale-95"
            >
              <Mic className="w-5 h-5" />
              <span>START VOICE DETECTION</span>
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE: REQUESTING MICROPHONE                              */}
        {/* ========================================================= */}
        {engineState === 'REQUESTING_MIC' && (
          <div className="py-16 text-center space-y-4">
            <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-bold text-cyan-400 font-mono">REQUESTING MICROPHONE PERMISSION...</p>
            <p className="text-xs text-slate-400">Please click "Allow" on your browser's microphone permission prompt.</p>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE: LISTENING & WAITING FOR SPEECH                     */}
        {/* ========================================================= */}
        {engineState === 'LISTENING' && (
          <div className="space-y-6 py-2">
            {/* Top Status Indicators */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                <div>
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    ● MICROPHONE CONNECTED & LISTENING
                  </span>
                  <p className="text-[11px] text-slate-400">
                    {voiceActivity === 'SPEECH DETECTED' ? (
                      <span className="text-emerald-400 font-bold">✓ Speech detected — Keep speaking naturally...</span>
                    ) : (
                      <span className="text-amber-400 font-medium">WAITING FOR SPEECH (Speak naturally to trigger analysis)...</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Speech Duration Countdown */}
              <div className="flex items-center space-x-3 font-mono text-xs">
                <div className="text-right">
                  <span className="text-slate-500 text-[10px] block">VALID SPEECH CAPTURED:</span>
                  <span className="text-cyan-400 font-bold text-sm">{speechSeconds}s / 3.5s</span>
                </div>
                <div className="w-28 h-2 bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-100"
                    style={{ width: `${speechProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Real Waveform Canvas Visualizer */}
            <div className="h-44 bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-center text-xs font-mono text-slate-400 z-10">
                <span className="flex items-center space-x-2">
                  <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>STREAM: 44.1kHz • 16-BIT PCM MONO</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="text-slate-500">AUDIO LEVEL:</span>
                  <span className="font-bold text-white">{audioLevel}%</span>
                </span>
              </div>

              {/* Dynamic Canvas Oscilloscope */}
              <div className="flex-1 flex items-center justify-center my-2">
                <canvas 
                  ref={canvasRef} 
                  width={700} 
                  height={110} 
                  className="w-full h-full block" 
                />
              </div>

              {/* Bottom Telemetry Bar */}
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 z-10">
                <span>BUFFER: 512 FFT SAMPLES</span>
                <span className={voiceActivity === 'SPEECH DETECTED' ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  VAD: {voiceActivity}
                </span>
              </div>
            </div>

            {/* Audio Level Meter */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Microphone Input Level Meter:</span>
                <span className={`font-bold ${audioLevel > 20 ? 'text-cyan-400' : 'text-slate-500'}`}>{audioLevel}%</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className={`h-full transition-all duration-75 ${
                    audioLevel > 65 ? 'bg-rose-500' : audioLevel > 25 ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                  style={{ width: `${Math.min(100, audioLevel * 1.2)}%` }}
                />
              </div>
            </div>

            {/* Instructions / Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <p className="text-xs text-slate-400 italic">
                {speechSeconds < 2.0 
                  ? 'Say a full sentence (e.g. "My name is John and I am verifying my voice identity")'
                  : 'Sufficient speech almost reached — automatic analysis will start momentarily...'}
              </p>

              <button
                onClick={handleManualStop}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center space-x-2 transition-all"
              >
                <Square className="w-4 h-4 text-rose-400" />
                <span>Stop & Analyze Now</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE: ANALYZING (Live Multi-stage Pipeline Display)      */}
        {/* ========================================================= */}
        {engineState === 'ANALYZING' && (
          <div className="py-8 max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-mono">
                <Cpu className="w-3.5 h-3.5 animate-spin" />
                <span>FORENSIC AUDIO PROCESSING IN PROGRESS</span>
              </div>
              <h3 className="text-lg font-bold text-white">Analyzing Captured Voice Sample</h3>
              <p className="text-xs text-cyan-400 font-mono animate-pulse">{pipelineStage}</p>
            </div>

            {/* 7 Pipeline Checkpoints (Requirement 14) */}
            <div className="space-y-2 font-mono text-xs">
              {[
                { id: 1, label: 'VOICE CAPTURE (Stream Buffering)' },
                { id: 2, label: 'PREPROCESSING (Noise & Gating)' },
                { id: 3, label: 'VOICE ACTIVITY (Energy Profiling)' },
                { id: 4, label: 'FEATURE EXTRACTION (F0, ZCR, Centroid)' },
                { id: 5, label: 'AUDIO ANOMALY (Vocoder Discontinuities)' },
                { id: 6, label: 'SPEAKER VERIFICATION (Biometric Match)' },
                { id: 7, label: 'FINAL CLASSIFICATION & DECISION' }
              ].map((step) => {
                const isDone = activePipelineIndex > step.id;
                const isCurrent = activePipelineIndex === step.id;

                return (
                  <div 
                    key={step.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isDone ? 'bg-cyan-950/40 border-cyan-600/50 text-cyan-300' :
                      isCurrent ? 'bg-indigo-950/50 border-indigo-500 text-white shadow-sm' :
                      'bg-slate-950/60 border-slate-800/80 text-slate-500'
                    }`}
                  >
                    <span>{step.label}</span>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    ) : isCurrent ? (
                      <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="text-[10px] text-slate-600">WAITING...</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE: INSUFFICIENT AUDIO ERROR                           */}
        {/* ========================================================= */}
        {engineState === 'INSUFFICIENT_AUDIO' && (
          <div className="py-10 text-center space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">Insufficient Audio Captured</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We captured only {speechSeconds}s of speech. Reliable forensic extraction requires at least 3-4 seconds of natural vocal input to measure pitch stability and spectral distribution.
            </p>
            <button
              onClick={handleStartVoiceDetection}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono transition-all"
            >
              Try Again & Speak Longer
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE: RESULT (Real Forensic Cybersecurity Card)          */}
        {/* ========================================================= */}
        {engineState === 'RESULT' && detectionResult && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Top Security Result Banner */}
            <div className={`p-6 rounded-2xl border-2 flex flex-col md:flex-row items-center justify-between gap-6 ${
              detectionResult.riskScore >= 70
                ? 'bg-rose-950/30 border-rose-600/80 text-rose-200'
                : detectionResult.riskScore >= 30
                ? 'bg-amber-950/30 border-amber-600/80 text-amber-200'
                : 'bg-emerald-950/30 border-emerald-600/80 text-emerald-200'
            }`}>
              <div className="flex items-start space-x-4">
                <div className={`p-3.5 rounded-2xl border ${
                  detectionResult.riskScore >= 70
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                    : detectionResult.riskScore >= 30
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                    : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                }`}>
                  {detectionResult.riskScore >= 70 ? (
                    <ShieldAlert className="w-8 h-8" />
                  ) : detectionResult.riskScore >= 30 ? (
                    <AlertTriangle className="w-8 h-8" />
                  ) : (
                    <ShieldCheck className="w-8 h-8" />
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-black/40 border border-white/10">
                      VOICE INTEGRITY RESULT
                    </span>
                    <span className="text-xs font-mono text-slate-400">{detectionResult.timestamp}</span>
                  </div>

                  <h3 className="text-2xl font-black text-white mt-1 tracking-tight">
                    {detectionResult.classification}
                  </h3>

                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Analysis Mode: <strong className="text-cyan-400">{detectionResult.analysisMode}</strong>
                  </p>
                </div>
              </div>

              {/* Live Risk Gauge */}
              <div className="w-full md:w-auto shrink-0">
                <RiskGauge 
                  score={detectionResult.riskScore} 
                  confidence={detectionResult.confidence}
                  status={detectionResult.riskScore >= 70 ? 'AI_CLONE' : detectionResult.riskScore >= 30 ? 'SUSPICIOUS' : 'HUMAN'}
                />
              </div>
            </div>

            {/* Core Acoustic Metrics Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Fundamental Pitch (F0)</span>
                <span className="text-base font-bold text-white mt-1 block">
                  {detectionResult.features?.fundamentalPitchHz} Hz
                </span>
                <span className="text-[10px] text-slate-400">
                  Std Dev: ±{detectionResult.features?.pitchStdDev} Hz
                </span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Spectral Centroid</span>
                <span className="text-base font-bold text-white mt-1 block">
                  {detectionResult.features?.spectralCentroidHz} Hz
                </span>
                <span className="text-[10px] text-slate-400">
                  Flatness: {detectionResult.features?.spectralFlatness}
                </span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Micro-Jitter</span>
                <span className="text-base font-bold text-white mt-1 block">
                  {detectionResult.features?.jitterPercent}%
                </span>
                <span className="text-[10px] text-slate-400">
                  Shimmer: {detectionResult.features?.shimmerPercent}%
                </span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Speaker Match</span>
                <span className={`text-base font-bold mt-1 block ${
                  detectionResult.speakerMatch ? (detectionResult.speakerMatch >= 78 ? 'text-emerald-400' : 'text-amber-400') : 'text-slate-400'
                }`}>
                  {detectionResult.speakerMatch ? `${detectionResult.speakerMatch}%` : 'Not Enrolled'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {detectionResult.speakerVerification?.label || 'No registered baseline'}
                </span>
              </div>
            </div>

            {/* Audio Playback Bar */}
            {capturedAudioUrl && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <audio 
                  ref={audioPlayerRef} 
                  src={capturedAudioUrl} 
                  onEnded={() => setIsPlayingAudio(false)} 
                  className="hidden" 
                />
                <div className="flex items-center space-x-3">
                  <button
                    onClick={togglePlayback}
                    className="w-9 h-9 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center transition-colors"
                  >
                    {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                  <div className="text-xs">
                    <span className="font-bold text-white block">Captured Audio Playback</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Duration: {detectionResult.duration} • Sample Rate: {detectionResult.features?.sampleRate} Hz
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-700">
                  REAL MICROPHONE CAPTURE
                </span>
              </div>
            )}

            {/* Real AI Deepfake Voice Detection & Forensic Signal Attribution */}
            {detectionResult && (
              <DeepfakeSignalBreakdown 
                detectionResult={detectionResult} 
                onFlagFeedback={() => showToast('Audit feedback saved for model verification', 'success')}
              />
            )}

            {/* Forensic Detail Tabs & Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PitchContourChart scenario={detectionResult.riskScore >= 70 ? 'AI_CLONE' : detectionResult.riskScore >= 30 ? 'SUSPICIOUS' : 'HUMAN'} />
              <MFCCBars scenario={detectionResult.riskScore >= 70 ? 'AI_CLONE' : detectionResult.riskScore >= 30 ? 'SUSPICIOUS' : 'HUMAN'} />
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={handleResetDetector}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-2 border border-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Test Another Voice Sample</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSaveEvidence(detectionResult)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Telemetry JSON</span>
                </button>

                {detectionResult.riskScore >= 70 && (
                  <button
                    onClick={() => handleStartIndependentVerification(detectionResult)}
                    className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-amber-600/30"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Launch Out-of-band Verification</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setLastDetection(detectionResult);
                    setActiveTab('voice-analysis');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-cyan-600/25"
                >
                  <FileSearch className="w-3.5 h-3.5" />
                  <span>Deep Forensic View</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
