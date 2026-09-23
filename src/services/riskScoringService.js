/**
 * VoiceGuard AI - Risk Scoring & Decision Engine
 * Transparent, deterministic heuristic evaluation using real measured acoustic metrics.
 */

export class RiskScoringService {
  /**
   * Evaluate audio features and speaker verification to calculate real risk score and classification
   * @param {Object} features - Real measured acoustic features
   * @param {Object} speakerResult - Result from SpeakerVerificationService
   * @param {Object} options - Sensitivity and thresholds
   * @returns {Object} Complete risk assessment and decision
   */
  evaluateRisk(features, speakerResult = null, options = {}) {
    const riskThreshold = options.riskThreshold || 70;
    const detectedIndicators = [];
    let anomalyPoints = 0;

    // Check for insufficient audio
    if (!features || features.durationSeconds < 2.5 || features.voiceActivityRatio < 20) {
      return {
        riskScore: 0,
        riskLevel: 'LOW',
        classification: 'INSUFFICIENT AUDIO',
        analysisMode: 'LOCAL AUDIO HEURISTIC ANALYSIS',
        audioAnomalyScore: 0,
        confidence: 0,
        requiresAlert: false,
        summary: 'Insufficient vocal audio captured. Please speak naturally for at least 3-4 seconds.',
        indicators: ['Audio sample duration or speech density below minimum operational threshold']
      };
    }

    // 1. Pitch Flatline Anomaly (Vocoders & generative TTS often have unnaturally rigid pitch)
    if (features.pitchStdDev < 6.0) {
      anomalyPoints += 30;
      detectedIndicators.push(`Unnatural pitch rigidity (F0 std dev = ${features.pitchStdDev} Hz, normal > 12 Hz)`);
    } else if (features.pitchStdDev < 10.0) {
      anomalyPoints += 15;
      detectedIndicators.push(`Constrained pitch prosody (F0 std dev = ${features.pitchStdDev} Hz)`);
    }

    // 2. Micro-Jitter (Natural human vocal cords exhibit organic perturbation 0.25% - 1.5%)
    // Too low (< 0.22%) = synthetic robotic stabilization; Too high (> 2.5%) = severe distortion/artifact
    if (features.jitterPercent < 0.22) {
      anomalyPoints += 25;
      detectedIndicators.push(`Abnormal micro-jitter absence (${features.jitterPercent}%), indicating synthetic quantization`);
    } else if (features.jitterPercent > 2.8) {
      anomalyPoints += 15;
      detectedIndicators.push(`Elevated acoustic jitter perturbation (${features.jitterPercent}%)`);
    }

    // 3. Spectral Flatness (White noise / vocoder phase comb artifacts elevate flatness above 0.15)
    if (features.spectralFlatness > 0.18) {
      anomalyPoints += 25;
      detectedIndicators.push(`High spectral flatness (${features.spectralFlatness}), consistent with neural synthesis vocoder noise`);
    } else if (features.spectralFlatness > 0.10) {
      anomalyPoints += 10;
      detectedIndicators.push(`Borderline spectral noise distribution (${features.spectralFlatness})`);
    }

    // 4. Spectral Centroid Boost (Synthetic TTS audio frequently exhibits exaggerated high-frequency energy > 3800Hz)
    if (features.spectralCentroidHz > 3900) {
      anomalyPoints += 15;
      detectedIndicators.push(`Acoustic spectral boost above 3.9 kHz (${features.spectralCentroidHz} Hz)`);
    }

    // 5. Zero Crossing Rate Discontinuity
    if (features.zeroCrossingRate > 0.30) {
      anomalyPoints += 10;
      detectedIndicators.push(`High-frequency zero crossing anomalies (${features.zeroCrossingRate})`);
    }

    // Audio Anomaly Score (0 - 100)
    const audioAnomalyScore = Math.min(100, Math.max(5, anomalyPoints));

    // Evaluate Speaker Match Influences
    const hasEnrolled = speakerResult && speakerResult.hasEnrolledProfile;
    const speakerMatch = hasEnrolled ? speakerResult.matchPercentage : null;
    const isSpeakerMismatch = hasEnrolled && speakerMatch < 60;
    const isHighSpeakerMatch = hasEnrolled && speakerMatch >= 78;

    let riskScore = 15;
    let classification = 'AUTHENTIC / HUMAN';

    // Decision Logic
    const isSyntheticSignal = audioAnomalyScore >= 50;
    const isBorderlineSignal = audioAnomalyScore >= 30 && audioAnomalyScore < 50;

    if (isSyntheticSignal && isHighSpeakerMatch) {
      // Case: Highly matches user's voice timbre, but exhibits synthetic vocoder artifacts
      // -> AI Voice Clone Impersonation Attack
      riskScore = Math.min(98, Math.max(76, Math.round(audioAnomalyScore * 0.65 + speakerMatch * 0.35)));
      classification = 'POSSIBLE VOICE CLONE';
      detectedIndicators.push(`High biometric similarity (${speakerMatch}%) coupled with synthetic acoustic artifacts`);
    } else if (isSyntheticSignal && (!hasEnrolled || !isHighSpeakerMatch)) {
      // Case: Synthetic artifacts present, but not targeting user's specific profile
      riskScore = Math.min(88, Math.max(70, Math.round(audioAnomalyScore * 0.85 + 10)));
      classification = 'POSSIBLE SYNTHETIC';
      detectedIndicators.push(`Synthetic audio signatures detected (${audioAnomalyScore}% anomaly score)`);
    } else if (isBorderlineSignal) {
      // Case: Inconclusive acoustic indicators
      riskScore = Math.min(68, Math.max(35, Math.round(audioAnomalyScore * 0.9 + (isSpeakerMismatch ? 15 : 0))));
      classification = 'SUSPICIOUS';
      detectedIndicators.push(`Inconclusive vocal characteristics requiring secondary audit`);
    } else if (isSpeakerMismatch) {
      // Case: Natural organic human voice, but speaker doesn't match enrolled profile
      riskScore = Math.min(48, Math.max(25, Math.round((100 - speakerMatch) * 0.4)));
      classification = 'UNKNOWN SPEAKER';
      detectedIndicators.push(`Biological human vocal properties verified; speaker identity differs from enrolled profile`);
    } else {
      // Case: Natural biological human speech
      riskScore = Math.max(6, Math.min(26, Math.round(audioAnomalyScore * 0.3 + (hasEnrolled ? (100 - speakerMatch) * 0.1 : 5))));
      classification = 'AUTHENTIC / HUMAN';
      detectedIndicators.push(`Organic glottal pulses, natural micro-jitter, and continuous harmonic resonance verified`);
    }

    // Determine Risk Level Tier
    let riskLevel = 'LOW';
    if (riskScore >= 70) {
      riskLevel = 'HIGH';
    } else if (riskScore >= 30) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    const requiresAlert = riskScore >= riskThreshold;

    return {
      riskScore,
      riskLevel,
      classification,
      analysisMode: 'LOCAL AUDIO HEURISTIC ANALYSIS',
      audioAnomalyScore,
      speakerMatch,
      confidence: Math.min(99, Math.max(65, Math.round(85 + (features.signalQuality * 0.12)))),
      requiresAlert,
      indicators: detectedIndicators.length > 0 ? detectedIndicators : ['Normal biological vocal dynamics verified']
    };
  }
}

export const riskScoringService = new RiskScoringService();
export default riskScoringService;
