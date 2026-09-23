/**
 * VoiceGuard AI - Ensemble & Signal Fusion Service
 * Combines neural anti-spoofing model outputs with physical heuristic signals:
 * - Neural vocoder phase comb artifacts & spectral roll-offs
 * - Pitch/prosody micro-dynamics (jitter, shimmer, F0 std dev)
 * - Acoustic room ambiance vs digital zero noise floor
 * - Phase coherence & temporal frame transitions
 * 
 * Generates:
 * 1. Classification: "likely human" | "likely AI-generated or cloned" | "uncertain"
 * 2. Continuous confidence score (0 - 100%, never claiming 100% accuracy)
 * 3. Transparent contributing signals breakdown for forensic auditing
 */

export class EnsembleFusionService {
  /**
   * Fuse model inference and heuristic features into a final forensic assessment
   * @param {Object} modelResult Output from deepfakeDetectionModel
   * @param {Object} extractedFeatures Output from featureExtractionService
   * @param {Object} options Configuration overrides
   */
  fuse(modelResult, extractedFeatures, options = {}) {
    const { vocoder, prosody, noise, durationSeconds } = extractedFeatures;
    const modelProbSpoof = modelResult.probabilities.spoof;
    const modelProbHuman = modelResult.probabilities.human;

    const contributingSignals = [];
    let spoofEvidenceWeight = 0;
    let humanEvidenceWeight = 0;

    // Check for insufficient audio duration
    if (durationSeconds < 1.5) {
      return {
        classification: 'uncertain',
        confidenceScore: 30.0,
        riskTier: 'MEDIUM',
        isAIGenerated: null,
        summary: 'Audio sample is too short (< 1.5s) to reliably evaluate acoustic prosody or spectral comb artifacts.',
        modelInference: modelResult,
        contributingSignals: [{
          id: 'DURATION_SHORT',
          title: 'Sample Duration Insufficient',
          category: 'Acoustic Quality',
          status: 'WARNING',
          direction: 'NEUTRAL',
          measuredValue: `${durationSeconds}s (min 2.0s recommended)`,
          weight: 100,
          explanation: 'Insufficient phonetic phonemes captured to reliably detect prosodic micro-variations.'
        }],
        disclaimer: 'Probabilistic analysis cannot achieve reliable certainty on audio clips under 2 seconds.'
      };
    }

    // -------------------------------------------------------------
    // SIGNAL 1: Neural Vocoder & Spectral Comb Artifacts
    // -------------------------------------------------------------
    const rippleScore = vocoder.vocoderRippleScore;
    if (vocoder.phaseCombArtifactsDetected || rippleScore > 0.45) {
      const weight = Math.min(30, Math.round(rippleScore * 35));
      spoofEvidenceWeight += weight;
      contributingSignals.push({
        id: 'VOCODER_COMB_RIPPLE',
        title: 'Neural Vocoder Phase Ripple',
        category: 'Spectral Artifacts',
        status: 'ANOMALOUS',
        direction: 'INDICATES_AI',
        measuredValue: `Comb Index: ${(rippleScore * 100).toFixed(1)}%`,
        weight,
        explanation: 'Periodic spectral comb ripple detected in upper frequencies (4kHz–10kHz), typical of HiFi-GAN/MelGAN neural vocoders.'
      });
    } else {
      humanEvidenceWeight += 15;
      contributingSignals.push({
        id: 'VOCODER_COMB_CLEAN',
        title: 'Vocoder Comb Regularity',
        category: 'Spectral Artifacts',
        status: 'NORMAL',
        direction: 'INDICATES_HUMAN',
        measuredValue: `Comb Index: ${(rippleScore * 100).toFixed(1)}% (Clean)`,
        weight: 15,
        explanation: 'Smooth spectral envelope without harmonic comb modulation artifacts.'
      });
    }

    // High frequency sharp cutoff
    if (vocoder.unnaturalHighFreqRollOff) {
      spoofEvidenceWeight += 18;
      contributingSignals.push({
        id: 'HIGH_FREQ_CUTOFF',
        title: 'Acoustic Bandwidth Cutoff',
        category: 'Spectral Artifacts',
        status: 'ANOMALOUS',
        direction: 'INDICATES_AI',
        measuredValue: `Hard cutoff at ~${vocoder.highFreqCutoffHz} Hz`,
        weight: 18,
        explanation: 'Abrupt frequency brick-wall drop-off consistent with 16kHz or 24kHz neural speech model synthesis limits.'
      });
    }

    // -------------------------------------------------------------
    // SIGNAL 2: Pitch & Prosody Naturalness (Micro-Jitter & F0 Dynamics)
    // -------------------------------------------------------------
    const jitter = prosody.jitterPercent;
    const f0Std = prosody.f0StdDev;

    if (prosody.unnaturalPitchRigidity) {
      let weight = 0;
      let reason = '';
      if (jitter < 0.22 && jitter > 0) {
        weight += 22;
        reason = `Robotic micro-jitter absence (${jitter}%, natural 0.30%–1.8%)`;
      }
      if (f0Std < 7.0 && f0Std > 0) {
        weight += 18;
        reason += (reason ? ' + ' : '') + `Monotone pitch contour (F0 std: ${f0Std} Hz)`;
      }
      spoofEvidenceWeight += weight;
      contributingSignals.push({
        id: 'PITCH_PROSODY_RIGID',
        title: 'Pitch Prosody Dynamics',
        category: 'Prosodic Consistency',
        status: 'ANOMALOUS',
        direction: 'INDICATES_AI',
        measuredValue: `Jitter: ${jitter}% | F0 Std: ${f0Std} Hz`,
        weight,
        explanation: reason || 'Unnatural pitch stability indicating neural parametric synthesis.'
      });
    } else if (jitter >= 0.28 && jitter <= 2.2 && f0Std >= 10.0) {
      humanEvidenceWeight += 25;
      contributingSignals.push({
        id: 'PITCH_PROSODY_NATURAL',
        title: 'Vocal Cord Perturbation (Jitter/F0)',
        category: 'Prosodic Consistency',
        status: 'NORMAL',
        direction: 'INDICATES_HUMAN',
        measuredValue: `Jitter: ${jitter}% | F0 Std: ${f0Std} Hz`,
        weight: 25,
        explanation: 'Biological micro-pitch perturbation and natural expressive intonation verified.'
      });
    } else {
      contributingSignals.push({
        id: 'PITCH_PROSODY_INCONCLUSIVE',
        title: 'Pitch Prosody Consistency',
        category: 'Prosodic Consistency',
        status: 'BORDERLINE',
        direction: 'NEUTRAL',
        measuredValue: `Jitter: ${jitter}% | F0 Std: ${f0Std} Hz`,
        weight: 5,
        explanation: 'Pitch variation is within borderline acoustic ranges.'
      });
    }

    // -------------------------------------------------------------
    // SIGNAL 3: Environmental Noise Floor & Respiration
    // -------------------------------------------------------------
    if (noise.unnaturallyCleanNoiseFloor) {
      spoofEvidenceWeight += 20;
      contributingSignals.push({
        id: 'NOISE_FLOOR_STERILE',
        title: 'Environmental Background Noise',
        category: 'Acoustic Environment',
        status: 'ANOMALOUS',
        direction: 'INDICATES_AI',
        measuredValue: noise.hasDigitalSilence ? 'Exact Digital Silence (0.00000)' : `Purity ${(noise.noiseFloorPurity * 100).toFixed(1)}%`,
        weight: 20,
        explanation: 'Synthetically sanitized silence between syllables with total absence of physical room ambience.'
      });
    } else {
      humanEvidenceWeight += 15;
      contributingSignals.push({
        id: 'NOISE_FLOOR_AMBIENT',
        title: 'Physical Acoustic Ambiance',
        category: 'Acoustic Environment',
        status: 'NORMAL',
        direction: 'INDICATES_HUMAN',
        measuredValue: `Noise floor: ${(noise.avgNoiseFloor * 1000).toFixed(2)} mRMS`,
        weight: 15,
        explanation: 'Presence of natural acoustic environment ambiance and physical microphone noise floor.'
      });
    }

    // -------------------------------------------------------------
    // SIGNAL 4: Neural Anti-Spoofing Model Core Output
    // -------------------------------------------------------------
    const modelWeight = 35;
    if (modelProbSpoof >= 0.65) {
      spoofEvidenceWeight += Math.round(modelProbSpoof * modelWeight);
      contributingSignals.unshift({
        id: 'NEURAL_MODEL_SPOOF',
        title: 'Anti-Spoofing Neural Classifier',
        category: 'Deep Neural Model',
        status: 'ANOMALOUS',
        direction: 'INDICATES_AI',
        measuredValue: `${(modelProbSpoof * 100).toFixed(1)}% Spoof Probability (Logit: ${modelResult.rawLogits.spoof})`,
        weight: Math.round(modelProbSpoof * modelWeight),
        explanation: 'Neural network detected high-order spectral and temporal embedding patterns matching ASVspoof/WaveFake synthetic distributions.'
      });
    } else if (modelProbHuman >= 0.65) {
      humanEvidenceWeight += Math.round(modelProbHuman * modelWeight);
      contributingSignals.unshift({
        id: 'NEURAL_MODEL_HUMAN',
        title: 'Anti-Spoofing Neural Classifier',
        category: 'Deep Neural Model',
        status: 'NORMAL',
        direction: 'INDICATES_HUMAN',
        measuredValue: `${(modelProbHuman * 100).toFixed(1)}% Human Probability (Logit: ${modelResult.rawLogits.human})`,
        weight: Math.round(modelProbHuman * modelWeight),
        explanation: 'Neural network confirmed feature embedding congruence with genuine biological human vocal tract acoustic distributions.'
      });
    } else {
      contributingSignals.unshift({
        id: 'NEURAL_MODEL_UNCERTAIN',
        title: 'Anti-Spoofing Neural Classifier',
        category: 'Deep Neural Model',
        status: 'BORDERLINE',
        direction: 'NEUTRAL',
        measuredValue: `Spoof: ${(modelProbSpoof * 100).toFixed(1)}% | Human: ${(modelProbHuman * 100).toFixed(1)}%`,
        weight: 10,
        explanation: 'Neural model predictions are ambiguous across acoustic manifold boundaries.'
      });
    }

    // -------------------------------------------------------------
    // ENSEMBLE DECISION & CONFIDENCE SCORE CALCULATION
    // -------------------------------------------------------------
    // Calculate balanced fused probability: 50% model + 50% physical acoustic heuristics
    const heuristicSpoofRatio = spoofEvidenceWeight / Math.max(1, spoofEvidenceWeight + humanEvidenceWeight);
    const combinedSpoofScore = (modelProbSpoof * 0.50) + (heuristicSpoofRatio * 0.50);

    let classification = 'uncertain';
    let confidenceScore = 50.0;
    let riskTier = 'MEDIUM';

    // Decision Thresholds
    if (combinedSpoofScore >= 0.62) {
      classification = 'likely AI-generated or cloned';
      riskTier = 'HIGH';
      // Confidence reflects how strongly it is classified as AI (capped at 97.8% - no 100%)
      confidenceScore = Math.min(97.8, Math.max(62.5, +(combinedSpoofScore * 100).toFixed(1)));
    } else if (combinedSpoofScore <= 0.38) {
      classification = 'likely human';
      riskTier = 'LOW';
      // Confidence reflects how strongly it is classified as Human (capped at 98.2% - no 100%)
      const humanScore = 1.0 - combinedSpoofScore;
      confidenceScore = Math.min(98.2, Math.max(63.0, +(humanScore * 100).toFixed(1)));
    } else {
      classification = 'uncertain';
      riskTier = 'MEDIUM';
      // Uncertainty confidence measures how borderline the sample is (typically 45% - 59%)
      confidenceScore = Math.max(45.0, Math.min(60.0, +(50 + Math.abs(combinedSpoofScore - 0.5) * 40).toFixed(1)));
    }

    return {
      classification,
      confidenceScore,
      riskTier,
      isAIGenerated: classification === 'likely AI-generated or cloned',
      combinedSpoofScore: +combinedSpoofScore.toFixed(4),
      modelInference: modelResult,
      contributingSignals,
      summary: classification === 'likely AI-generated or cloned'
        ? `High probability of synthetic speech synthesis (${confidenceScore}% confidence). Anomalies detected across vocoder harmonics and prosody.`
        : classification === 'likely human'
          ? `High probability of natural human speech (${confidenceScore}% confidence). Natural glottal perturbation and acoustic ambiance verified.`
          : `Acoustic indicators are inconclusive (${confidenceScore}% confidence). Secondary verification is recommended.`,
      disclaimer: 'VoiceGuard AI detection is probabilistic and subject to false positives or false negatives, especially on compressed audio, background noise, or cutting-edge generative models. Do not rely solely on this analysis for legal or identity verification.'
    };
  }
}

export const ensembleFusionService = new EnsembleFusionService();
export default ensembleFusionService;
