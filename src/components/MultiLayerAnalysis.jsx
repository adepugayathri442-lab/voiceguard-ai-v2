import React, { useState } from 'react';
import { Layers, Waves, Activity, Fingerprint, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * MultiLayerAnalysis
 * Comprehensive 4-tier forensic breakdown with animated progress bars & telemetry.
 */
export default function MultiLayerAnalysis({ call, liveRiskScore = 0 }) {
  const [expandedLayer, setExpandedLayer] = useState(null);

  const isAttack = call?.waveformType === 'CLONE_ATTACK' || liveRiskScore >= 70;
  const isSuspicious = call?.waveformType === 'HYBRID_SUSPICIOUS' || (liveRiskScore >= 30 && liveRiskScore < 70);

  // Fallback / dynamic metrics
  const artifacts = call?.artifacts || {
    phaseDiscontinuity: isAttack ? 94.2 : isSuspicious ? 62.0 : 8.1,
    highFreqCutoff: isAttack ? 88.5 : isSuspicious ? 71.5 : 12.0,
    spectralCombFiltering: isAttack ? 91.0 : isSuspicious ? 58.0 : 5.4
  };

  const prosody = call?.prosody || {
    neuralTtsRhythm: isAttack ? 89.4 : isSuspicious ? 65.0 : 6.2,
    unnaturalPitchContours: isAttack ? 92.1 : isSuspicious ? 59.2 : 9.5,
    microCadenceFlatness: isAttack ? 86.7 : isSuspicious ? 68.0 : 11.0
  };

  const biometrics = call?.biometrics || {
    crossSessionMatch: isAttack ? 95.4 : isSuspicious ? 42.0 : 98.2,
    formantDispersionDelta: isAttack ? '14.2 Hz' : isSuspicious ? '45.0 Hz' : '2.1 Hz',
    embeddingDistance: isAttack ? 0.18 : isSuspicious ? 0.52 : 0.08
  };

  const antiSpoof = call?.antiSpoof || {
    glottalAirflow: isAttack ? 18.5 : isSuspicious ? 54.0 : 96.0,
    respirationCadence: isAttack ? 22.0 : isSuspicious ? 49.0 : 94.5,
    livenessScore: isAttack ? 19.0 : isSuspicious ? 51.5 : 97.2
  };

  const layers = [
    {
      id: 'acoustic',
      title: 'Acoustic & Spectral Artifacts',
      subtitle: 'Vocoder phase continuity & neural resynthesis jitter',
      icon: Waves,
      threatScore: Math.round((artifacts.phaseDiscontinuity + artifacts.highFreqCutoff + artifacts.spectralCombFiltering) / 3),
      metrics: [
        { label: 'Vocoder Phase Discontinuity', value: `${artifacts.phaseDiscontinuity}%`, alert: artifacts.phaseDiscontinuity > 50 },
        { label: 'High-Frequency Spectral Cutoff (>3.8kHz)', value: `${artifacts.highFreqCutoff}%`, alert: artifacts.highFreqCutoff > 50 },
        { label: 'Spectral Comb Filtering Artifacts', value: `${artifacts.spectralCombFiltering}%`, alert: artifacts.spectralCombFiltering > 50 }
      ],
      details: 'Identifies phase irregularities introduced during HiFi-GAN and WaveNet vocoding synthesis.'
    },
    {
      id: 'prosody',
      title: 'Prosody & Behavioral Patterns',
      subtitle: 'Fundamental pitch (F0) contours & syllable cadence',
      icon: Activity,
      threatScore: Math.round((prosody.neuralTtsRhythm + prosody.unnaturalPitchContours + prosody.microCadenceFlatness) / 3),
      metrics: [
        { label: 'Neural TTS Rhythm Regularity', value: `${prosody.neuralTtsRhythm}%`, alert: prosody.neuralTtsRhythm > 50 },
        { label: 'Unnatural Pitch (F0) Variance', value: `${prosody.unnaturalPitchContours}%`, alert: prosody.unnaturalPitchContours > 50 },
        { label: 'Micro-Cadence Flatness', value: `${prosody.microCadenceFlatness}%`, alert: prosody.microCadenceFlatness > 50 }
      ],
      details: 'Analyzes sub-second speech transitions for robotic regularity absent in human biological vocal cords.'
    },
    {
      id: 'biometrics',
      title: 'Cross-Session Voice Biometrics',
      subtitle: 'ECAPA-TDNN 512-dim embedding cosine similarity',
      icon: Fingerprint,
      threatScore: isAttack ? 92 : isSuspicious ? 58 : 12,
      metrics: [
        { label: 'Cosine Profile Similarity', value: `${biometrics.crossSessionMatch}%`, alert: false, isPositive: true },
        { label: 'Vocal Tract Formant Delta', value: biometrics.formantDispersionDelta, alert: isAttack },
        { label: 'Cos Distance Metric', value: biometrics.embeddingDistance.toString(), alert: biometrics.embeddingDistance > 0.4 }
      ],
      details: 'Matches speaker voiceprint against enrolled biometric vault embeddings to detect clone impersonations.'
    },
    {
      id: 'liveness',
      title: 'Anti-Spoofing & Liveness',
      subtitle: 'Glottal airflow dynamics & micro-respiration cycles',
      icon: ShieldAlert,
      threatScore: Math.round(100 - antiSpoof.livenessScore),
      metrics: [
        { label: 'Biological Glottal Airflow', value: `${antiSpoof.glottalAirflow}%`, alert: antiSpoof.glottalAirflow < 40 },
        { label: 'Micro-Respiration Cadence', value: `${antiSpoof.respirationCadence}%`, alert: antiSpoof.respirationCadence < 40 },
        { label: 'Acoustic Liveness Index', value: `${antiSpoof.livenessScore}%`, alert: antiSpoof.livenessScore < 50 }
      ],
      details: 'Verifies natural human breathing dynamics and vocal tract physiological aerodynamics.'
    }
  ];

  return (
    <div className="p-4 rounded-2xl bg-[#0B0F19]/90 border border-slate-800/90 shadow-xl backdrop-blur-md space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Multi-Layer Forensic Telemetry
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          4-TIER ENSEMBLE ENGINE
        </span>
      </div>

      {/* Layer Cards */}
      <div className="space-y-2.5">
        {layers.map((layer) => {
          const Icon = layer.icon;
          const isHighThreat = layer.threatScore >= 60;
          const isExpanded = expandedLayer === layer.id;

          return (
            <div 
              key={layer.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isHighThreat 
                  ? 'bg-rose-950/20 border-rose-600/30' 
                  : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700/80'
              }`}
            >
              {/* Row Header */}
              <button
                onClick={() => setExpandedLayer(isExpanded ? null : layer.id)}
                className="w-full p-3 flex items-center justify-between text-left focus:outline-none"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`p-1.5 rounded-lg shrink-0 ${
                    isHighThreat ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold font-mono text-slate-200 block truncate">
                      {layer.title}
                    </span>
                    <span className="text-[10.5px] text-slate-400 font-sans block truncate">
                      {layer.subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0 ml-2">
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">
                      Anomaly
                    </span>
                    <span className={`text-xs font-mono font-bold ${
                      isHighThreat ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {layer.threatScore}%
                    </span>
                  </div>

                  {/* Visual mini bar */}
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isHighThreat ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${layer.threatScore}%` }}
                    />
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expanded Breakdown */}
              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-800/60 bg-slate-950/60 space-y-2.5 text-xs font-mono animate-in slide-in-from-top-1 duration-150">
                  <p className="text-[11px] font-sans text-slate-400 leading-tight">
                    {layer.details}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {layer.metrics.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/50">
                        <span className="text-slate-300 text-[11px]">{m.label}</span>
                        <span className={`font-bold text-[11px] ${
                          m.alert ? 'text-rose-400' : m.isPositive ? 'text-cyan-300' : 'text-emerald-400'
                        }`}>
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
