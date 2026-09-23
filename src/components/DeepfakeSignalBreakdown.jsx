import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  HelpCircle, 
  Activity, 
  Cpu, 
  Volume2, 
  AlertTriangle, 
  Flag, 
  Check, 
  Info,
  ChevronDown,
  ChevronUp,
  Radio,
  Wifi,
  WifiOff
} from 'lucide-react';

export default function DeepfakeSignalBreakdown({ detectionResult, onFlagFeedback }) {
  const [showLogits, setShowLogits] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState('false_positive');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  if (!detectionResult) return null;

  const {
    classification = 'MODEL UNAVAILABLE',
    rawClassification = 'MODEL_UNAVAILABLE',
    aiProbability = 0,
    humanProbability = 0,
    confidence = 0,
    modelName = 'ASVspoof-LCNN-v2.4',
    modelVersion = '2.4.0',
    modelStatus = 'OFFLINE',
    modelInferenceTimeMs = 0,
    rawLogits = null,
    modelSignals = [],
    analysisMode = ''
  } = detectionResult;

  const isModelConnected = modelStatus === 'CONNECTED';
  const isAI = rawClassification === 'AI_GENERATED';
  const isHuman = rawClassification === 'HUMAN';
  const isUncertain = rawClassification === 'UNCERTAIN';
  const isInsufficient = rawClassification === 'INSUFFICIENT_AUDIO';
  const isOffline = rawClassification === 'MODEL_UNAVAILABLE' || !isModelConnected;

  // Configuration for primary classification card
  const badgeConfig = isOffline ? {
    bg: 'bg-slate-900/90 border-slate-700 text-slate-400',
    barBg: 'bg-slate-600',
    icon: WifiOff,
    title: 'AI DETECTION UNAVAILABLE',
    label: 'MODEL BACKEND OFFLINE',
    glow: ''
  } : isAI ? {
    bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    barBg: 'bg-rose-500',
    icon: ShieldAlert,
    title: 'AI-GENERATED VOICE DETECTED',
    label: 'SYNTHETIC / CLONED SPEECH',
    glow: 'shadow-[0_0_25px_rgba(244,63,94,0.25)]'
  } : isHuman ? {
    bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    barBg: 'bg-emerald-500',
    icon: ShieldCheck,
    title: 'HUMAN VOICE VERIFIED',
    label: 'BIOLOGICAL VOCAL DYNAMICS',
    glow: 'shadow-[0_0_25px_rgba(16,185,129,0.25)]'
  } : isInsufficient ? {
    bg: 'bg-slate-900/80 border-slate-700 text-slate-400',
    barBg: 'bg-slate-500',
    icon: Volume2,
    title: 'INSUFFICIENT AUDIO',
    label: 'SAMPLE TOO SHORT OR SILENT',
    glow: ''
  } : {
    bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    barBg: 'bg-amber-500',
    icon: HelpCircle,
    title: 'UNCERTAIN / BORDERLINE',
    label: 'ACOUSTIC MANIFOLD OVERLAP',
    glow: 'shadow-[0_0_25px_rgba(245,158,11,0.25)]'
  };

  const IconComponent = badgeConfig.icon;

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    const feedbackItem = {
      id: `FB-${Date.now()}`,
      timestamp: new Date().toISOString(),
      classification,
      aiProbability,
      humanProbability,
      feedbackType,
      notes: feedbackNotes,
      model: modelName
    };

    try {
      const existing = JSON.parse(localStorage.getItem('voiceguard_feedback_audit') || '[]');
      existing.unshift(feedbackItem);
      localStorage.setItem('voiceguard_feedback_audit', JSON.stringify(existing.slice(0, 100)));
    } catch (err) {
      console.warn('Could not persist feedback audit:', err);
    }

    setFeedbackSubmitted(true);
    if (onFlagFeedback) onFlagFeedback(feedbackItem);
    setTimeout(() => {
      setShowFeedbackModal(false);
      setFeedbackSubmitted(false);
      setFeedbackNotes('');
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* 1. Model Status Header (Step 16) */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400 uppercase">AI DETECTION MODEL:</span>
          <strong className="text-slate-200">{modelName}</strong>
        </div>
        <div className="flex items-center space-x-2">
          {isModelConnected ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              CONNECTED (ONLINE)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              OFFLINE
            </span>
          )}
        </div>
      </div>

      {/* 2. Primary Classification & Model Prediction Result (Step 10) */}
      {isOffline ? (
        <div className="p-6 rounded-2xl border border-slate-700 bg-slate-900/90 text-slate-300 space-y-3">
          <div className="flex items-center space-x-3 text-rose-400">
            <WifiOff className="w-6 h-6" />
            <h3 className="text-lg font-bold font-mono">AI DETECTION UNAVAILABLE</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The Python AI speech anti-spoofing backend (<code className="text-cyan-400 font-mono">http://127.0.0.1:8000</code>) is currently unreachable.
            Per system integrity rules, <strong>VoiceGuard AI will NEVER falsely classify audio as HUMAN when the model is offline.</strong>
          </p>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-cyan-400">
            To start the inference backend: <span className="text-white">python3 backend/server.py</span>
          </div>
        </div>
      ) : (
        <div className={`p-6 rounded-2xl border transition-all ${badgeConfig.bg} ${badgeConfig.glow}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className={`p-3.5 rounded-xl border ${badgeConfig.bg}`}>
                <IconComponent className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono tracking-wider uppercase text-slate-400">
                    {analysisMode.includes('AI DEEPFAKE') ? 'AI DEEPFAKE DETECTION' : 'HEURISTIC AUDIO ANALYSIS'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    PROBABILISTIC MODEL
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold font-mono tracking-tight mt-0.5">
                  {badgeConfig.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sub-type: <span className="text-slate-300 font-medium">{badgeConfig.label}</span>
                </p>
              </div>
            </div>

            {/* Step 6 Model Output Metrics */}
            <div className="grid grid-cols-3 gap-3 text-right">
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">AI Prob</span>
                <span className="text-lg font-bold font-mono text-rose-400">
                  {(aiProbability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Human Prob</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {(humanProbability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Confidence</span>
                <span className="text-lg font-bold font-mono text-cyan-400">
                  {confidence}%
                </span>
              </div>
            </div>
          </div>

          {/* Probabilistic Confidence Bar */}
          <div className="mt-5 pt-4 border-t border-slate-700/50">
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1.5">
              <span>Human Probability ({(humanProbability * 100).toFixed(1)}%)</span>
              <span className="text-amber-400 font-semibold">{rawClassification}</span>
              <span>AI Probability ({(aiProbability * 100).toFixed(1)}%)</span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${badgeConfig.barBg}`}
                style={{ width: `${Math.min(100, Math.max(5, isAI ? aiProbability * 100 : (isHuman ? humanProbability * 100 : confidence)))}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Model Telemetry & Contributing Signals */}
      {modelSignals && modelSignals.length > 0 && isModelConnected && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-semibold text-slate-300 uppercase font-mono">
                Model Signal Attribution ({modelSignals.length} Forensic Telemetries)
              </h3>
            </div>
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <Flag className="w-3.5 h-3.5 text-amber-400" />
              Flag Misclassification
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {modelSignals.map((sig) => {
              const isSigAI = sig.direction === 'INDICATES_AI';
              return (
                <div key={sig.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500 uppercase">{sig.category}</span>
                    <span className={`px-1.5 py-0.5 rounded border uppercase ${
                      isSigAI ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {sig.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200">{sig.title}</h4>
                  <div className="text-[11px] font-mono text-cyan-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                    {sig.measuredValue}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {sig.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Raw Logits & Latency Drawer (Step 12 & Step 6) */}
      {rawLogits && isModelConnected && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <button
            onClick={() => setShowLogits(!showLogits)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Model Telemetry: {modelName} (v{modelVersion})</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>{modelInferenceTimeMs}ms inference</span>
              {showLogits ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showLogits && (
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-mono grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Z(AI) LOGIT</span>
                <span className="text-base font-bold text-rose-400 mt-0.5 block">{rawLogits.ai}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Z(HUMAN) LOGIT</span>
                <span className="text-base font-bold text-emerald-400 mt-0.5 block">{rawLogits.human}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">P(AI) SOFTMAX</span>
                <span className="text-base font-bold text-rose-400 mt-0.5 block">{(aiProbability * 100).toFixed(1)}%</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">P(HUMAN) SOFTMAX</span>
                <span className="text-base font-bold text-emerald-400 mt-0.5 block">{(humanProbability * 100).toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. User Feedback Modal for False Positives / False Negatives */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center gap-2 mb-2">
              <Flag className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white font-mono">Flag Detection Misclassification</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Help improve the real AI detection model by logging classification audits.
            </p>

            {feedbackSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-white">Feedback Logged for Audit</h4>
                <p className="text-xs text-slate-400">Your classification flag has been recorded in the local verification log.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1.5">Feedback Classification</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 cursor-pointer hover:border-slate-700">
                      <input 
                        type="radio" 
                        name="fbType" 
                        value="false_positive"
                        checked={feedbackType === 'false_positive'}
                        onChange={(e) => setFeedbackType(e.target.value)}
                        className="text-cyan-500 focus:ring-0"
                      />
                      <div className="text-xs">
                        <div className="text-slate-200 font-medium">False Positive (False Alarm)</div>
                        <div className="text-slate-400 text-[11px]">Audio was authentic human speech, but flagged as AI/cloned.</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 cursor-pointer hover:border-slate-700">
                      <input 
                        type="radio" 
                        name="fbType" 
                        value="false_negative"
                        checked={feedbackType === 'false_negative'}
                        onChange={(e) => setFeedbackType(e.target.value)}
                        className="text-cyan-500 focus:ring-0"
                      />
                      <div className="text-xs">
                        <div className="text-slate-200 font-medium">False Negative (Missed Detection)</div>
                        <div className="text-slate-400 text-[11px]">Audio was AI-generated/cloned, but flagged as human speech.</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Additional Notes (Optional)</label>
                  <textarea 
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
                    placeholder="e.g., ElevenLabs generated sample with background room noise..."
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-xs font-mono bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition-colors"
                  >
                    Submit Audit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
