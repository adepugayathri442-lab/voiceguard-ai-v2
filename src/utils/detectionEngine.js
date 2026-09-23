/**
 * Voice Integrity & Impersonation Detection Engine for VoiceGuard AI
 * Strictly enforces 5-Step Decision Priority:
 * 1. AI / Synthetic Detection & Anti-Spoofing
 * 2. Voice Biometric Similarity against Registered Profile
 * 3. Authenticity Verification
 * 4. Deterministic Risk Score (0–100)
 * 5. Final Security Decision (4 Final States)
 */

import { getStoredProfile, getCallsByPhoneNumber } from './storage.js';
import deepfakeDetectionModel from '../services/deepfakeDetectionModel.js';
import { convertBlobToWav } from './audioUtils.js';

export const THRESHOLDS = {
  SIMILARITY_HIGH: 78.0, // >= 78% indicates acoustic similarity to registered profile
  AI_CONFIDENCE_THRESHOLD: 70.0, // >= 70% indicates synthetic/vocoder voice
};

export const DETECTION_STATES = {
  STATE_1_GENUINE_USER: 'STATE_1_GENUINE_USER',
  STATE_2_GENERIC_AI_VOICE: 'STATE_2_GENERIC_AI_VOICE',
  STATE_3_AI_CLONE_ATTACK: 'STATE_3_AI_CLONE_ATTACK',
  STATE_4_UNKNOWN_HUMAN: 'STATE_4_UNKNOWN_HUMAN',
};

/**
 * Calculate deterministic Risk Score (0 - 100) based on physical evidence
 */
export function calculateRiskScore({ isAi, aiConfidence, voiceSimilarity, antiSpoofScore, isClone, isKnownCaller }) {
  if (isClone) {
    // State 3: AI Voice Clone - High similarity + Synthetic artifacts
    // Normalized to 76–99 (CRITICAL RISK)
    const base = 78 + Math.round((voiceSimilarity - 78) * 0.7 + (aiConfidence * 0.12));
    return Math.min(98, Math.max(78, base));
  } else if (isAi) {
    // State 2: Generic AI Voice - Synthetic artifacts, not matched to user
    // Normalized to 51–75 (HIGH RISK)
    const base = 52 + Math.round(aiConfidence * 0.22);
    return Math.min(75, Math.max(52, base));
  } else if (voiceSimilarity >= THRESHOLDS.SIMILARITY_HIGH && antiSpoofScore >= 55) {
    // State 1: Genuine User - Human voice + High similarity + Authenticity verified
    // Normalized to 0–20 (LOW RISK)
    const base = Math.round((100 - voiceSimilarity) * 0.7 + (100 - antiSpoofScore) * 0.1);
    return Math.max(5, Math.min(20, base));
  } else {
    // State 4: Unknown Human - Biological voice + Low similarity
    // Normalized to 21–50 (MODERATE RISK)
    const base = 22 + Math.round((100 - voiceSimilarity) * 0.18 + (isKnownCaller ? 0 : 6));
    return Math.min(50, Math.max(22, base));
  }
}

export function getRiskLevel(score) {
  if (score >= 76) return 'CRITICAL';
  if (score >= 51) return 'HIGH';
  if (score >= 21) return 'MODERATE';
  return 'LOW';
}

/**
 * DETERMINISTIC HACKATHON DEMO RESULT FACTORY
 * Imported from dedicated demoResults.js utility
 */
export { createDemoResult } from "./demoResults.js";

/**
 * Automatic analysis of recorded call audio
 * @param {Object} options
 * @param {Object} options.extractedFeatures - Physical acoustic features
 * @param {number} options.durationSeconds - Call duration in seconds
 * @param {string} options.callerNumber - Phone number
 * @param {boolean} options.isEnrolling - Enrollment mode
 * @param {string} [options.developerDemoScenario] - Optional test bench override
 * @returns {Promise<Object>} Final forensic decision report
 */
export async function analyzeVoiceRecording({ 
  extractedFeatures = null,
  audioBlob = null,
  durationSeconds = 5, 
  callerNumber = '+91 98765 43210',
  isEnrolling = false,
  developerDemoScenario = null,
}) {
  const storedProfile = getStoredProfile();

  // 1. VOICE PROFILE ENROLLMENT FLOW
  if (isEnrolling) {
    const pitch = extractedFeatures?.fundamentalPitchHz || 138;
    const centroid = extractedFeatures?.spectralCentroidHz || 1780;
    const jitter = extractedFeatures?.jitterScore || 0.44;
    const hnr = extractedFeatures?.harmonicsNoiseRatioDb || 22.8;
    const hash = 'VPR-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now().toString().slice(-4);

    return {
      isEnrolling: true,
      voiceFingerprintId: hash,
      baselinePitchHz: pitch,
      baselinePitch: `${pitch} Hz`,
      formantDispersionHz: centroid,
      formantDispersion: `${centroid} Hz`,
      jitterPercent: `${jitter}%`,
      harmonicsToNoiseRatio: `${hnr} dB`,
      registeredAt: new Date().toISOString(),
      rawFeatures: extractedFeatures || {},
    };
  }

  // 2. CRITICAL HACKATHON ROUTE:
  // When a demo scenario is selected, create and return the deterministic demo result FIRST!
  // It does NOT depend on microphone input, features, random values, or race conditions.
  if (developerDemoScenario) {
    const norm = String(developerDemoScenario).toLowerCase().trim();
    if (norm === 'demo-genuine' || norm === 'case-a-genuine') {
      return createDemoResult('demo-genuine', callerNumber, durationSeconds);
    }
    if (norm === 'demo-unknown-human' || norm === 'case-d-unknown-human') {
      return createDemoResult('demo-unknown-human', callerNumber, durationSeconds);
    }
    if (norm === 'demo-generic-ai' || norm === 'case-b-generic-ai') {
      return createDemoResult('demo-generic-ai', callerNumber, durationSeconds);
    }
    if (norm === 'demo-clone-attack' || norm === 'case-c-clone-attack') {
      return createDemoResult('demo-clone-attack', callerNumber, durationSeconds);
    }
  }

  // 3. REAL BACKEND AUDIO DETECTION
  if (!audioBlob || audioBlob.size === 0) {
    return {
      id: `VG-${Date.now()}`,
      state: 'ERROR',
      finalVerdict: '⚠️ AUDIO NOT AVAILABLE',
      identityResult: 'No audio recording was provided.',
      riskScore: 0,
      riskLevel: 'UNKNOWN',
      isAi: false,
      isClone: false,
      aiConfidence: 0,
      voiceSimilarity: 0,
      antiSpoofScore: 0,
      durationSeconds,
      callerNumber,
      error: 'No audio recording was provided.'
    };
  }

  let wavBlob;

  try {
    wavBlob = await convertBlobToWav(audioBlob);
  } catch (error) {
    return {
      id: `VG-${Date.now()}`,
      state: 'ERROR',
      finalVerdict: '⚠️ AUDIO CONVERSION FAILED',
      identityResult: 'The recorded audio could not be converted to WAV.',
      riskScore: 0,
      riskLevel: 'UNKNOWN',
      isAi: false,
      isClone: false,
      aiConfidence: 0,
      voiceSimilarity: 0,
      antiSpoofScore: 0,
      durationSeconds,
      callerNumber,
      error: error?.message || 'Audio conversion failed.'
    };
  }

  const modelResult = await deepfakeDetectionModel.predictAudioBytes(
    wavBlob,
    {
      name: 'recorded_speech.wav',
      duration: durationSeconds,
      sampleRate: 16000
    }
  );

  if (
    !modelResult ||
    modelResult.classification === 'MODEL_UNAVAILABLE' ||
    modelResult.classification === 'ERROR'
  ) {
    return {
      id: `VG-${Date.now()}`,
      state: 'ERROR',
      finalVerdict: '⚠️ AI DETECTION UNAVAILABLE',
      identityResult: 'Backend detection service could not analyze this recording.',
      riskScore: 0,
      riskLevel: 'UNKNOWN',
      isAi: false,
      isClone: false,
      aiConfidence: 0,
      voiceSimilarity: 0,
      antiSpoofScore: 0,
      durationSeconds,
      callerNumber,
      error: modelResult?.error || modelResult?.reason || 'Backend detection failed.',
      modelResult
    };
  }

  const isAi = modelResult.classification === 'AI_GENERATED';
  const aiConfidence = Number(modelResult.aiProbability || 0) * 100;
  const antiSpoofScore = Number(modelResult.humanProbability || 0) * 100;

  const previousCalls = getCallsByPhoneNumber(callerNumber);
  const isKnownCaller = previousCalls.length > 0;

  let voiceSimilarity = 0;

  if (storedProfile && extractedFeatures) {
    const pitchDiff = Math.abs(
      Number(extractedFeatures.fundamentalPitchHz || 0) -
      Number(storedProfile.pitch || 0)
    );

    voiceSimilarity = Math.max(
      0,
      Math.min(100, 100 - pitchDiff)
    );
  }

  const isHighSimilarity = voiceSimilarity >= THRESHOLDS.SIMILARITY_HIGH;

  let state;
  let finalVerdict;
  let identityResult;
  let isClone = false;

  if (isAi && isHighSimilarity) {
    state = DETECTION_STATES.STATE_3_AI_CLONE_ATTACK;
    finalVerdict = '🚨 AI VOICE CLONE ATTACK DETECTED';
    identityResult = 'POSSIBLE IMPERSONATION OF REGISTERED USER';
    isClone = true;
  } else if (isAi) {
    state = DETECTION_STATES.STATE_2_GENERIC_AI_VOICE;
    finalVerdict = '🚨 AI-GENERATED VOICE DETECTED';
    identityResult = 'NOT A VERIFIED HUMAN VOICE';
  } else if (!isAi && isHighSimilarity) {
    state = DETECTION_STATES.STATE_1_GENUINE_USER;
    finalVerdict = '✅ GENUINE HUMAN VOICE';
    identityResult = 'REGISTERED USER VERIFIED';
  } else {
    state = DETECTION_STATES.STATE_4_UNKNOWN_HUMAN;
    finalVerdict = '⚠️ UNKNOWN HUMAN VOICE';
    identityResult = 'NOT MATCHED TO REGISTERED USER';
  }

  const riskScore = calculateRiskScore({
    isAi,
    aiConfidence,
    voiceSimilarity,
    antiSpoofScore,
    isClone,
    isKnownCaller
  });

  const riskLevel = getRiskLevel(riskScore);

  return {
    id: `VG-${Date.now()}`,
    state,
    finalVerdict,
    identityResult,
    riskScore,
    riskLevel,
    isAi,
    isClone,
    aiConfidence,
    voiceSimilarity,
    antiSpoofScore,
    durationSeconds,
    callerNumber,
    modelResult,
    modelName: modelResult.modelName,
    modelVersion: modelResult.modelVersion,
    signals: modelResult.signals || [],
    audioMetadata: modelResult.audioMetadata || {}
  };

}
