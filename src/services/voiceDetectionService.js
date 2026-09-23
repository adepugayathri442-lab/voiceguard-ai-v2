/**
 * VoiceGuard AI - Unified Voice & Deepfake Detection Service
 * Real audio pipeline:
 * Audio Upload/Mic -> Float32 PCM Decode -> Resample 16kHz -> WAV Encode ->
 * Real Python Model Inference (ASVspoof-LCNN-v2) -> Prediction -> Result Screen.
 * 
 * STRICT COMPLIANCE:
 * - NO fallback to HUMAN on error.
 * - Supports: AI_GENERATED, HUMAN, UNCERTAIN, INSUFFICIENT_AUDIO, MODEL_UNAVAILABLE.
 * - Uses ACTUAL model output.
 */

import { audioAnalysisService } from './audioAnalysisService';
import { deepfakeDetectionModel } from './deepfakeDetectionModel';
import { speakerVerificationService } from './speakerVerificationService';
import { getStoredProfile } from '../utils/storage';
import { encodeWAV } from '../utils/wavEncoder';

/**
 * Resample Float32 array to 16,000 Hz if needed
 */
function resampleTo16k(channelData, originalSampleRate) {
  if (originalSampleRate === 16000 || channelData.length === 0) {
    return channelData;
  }
  const targetLength = Math.round(channelData.length * 16000 / originalSampleRate);
  const result = new Float32Array(targetLength);
  const ratio = (channelData.length - 1) / (targetLength - 1);
  for (let i = 0; i < targetLength; i++) {
    const srcIndex = i * ratio;
    const low = Math.floor(srcIndex);
    const high = Math.ceil(srcIndex);
    const weight = srcIndex - low;
    result[i] = (1 - weight) * channelData[low] + weight * (channelData[high] || channelData[low]);
  }
  return result;
}

/**
 * End-to-end voice analysis passing REAL audio bytes to the AI deepfake model
 * @param {Blob|ArrayBuffer} audioBlobOrBuffer - Real captured audio
 * @param {Object} callerMeta - Phone number, name, or metadata
 * @param {Object} options - Sensitivity, threshold, demo overrides
 * @returns {Promise<Object>} Final forensic result report
 */
export async function analyzeVoice(audioBlobOrBuffer, callerMeta = {}, options = {}) {
  // Step 1: Decode raw audio bytes using browser Web Audio API
  const { channelData, sampleRate, duration } = await audioAnalysisService.decodeAudio(audioBlobOrBuffer);

  // Step 2: Resample to 16,000 Hz (mono) as required by ASVspoof neural anti-spoofing models
  const pcm16k = resampleTo16k(channelData, sampleRate);

  // Step 3: Encode into standardized 16-bit Mono 16kHz WAV Blob containing real audio samples
  const wavBlob = encodeWAV(pcm16k, 16000);

  // Step 4: Run Real Model Inference (ASVspoof-LCNN-v2) by sending real audio bytes
  const filename = callerMeta.name || callerMeta.number || 'audio_sample.wav';
  const modelResult = await deepfakeDetectionModel.predictAudioBytes(wavBlob, {
    name: filename,
    duration,
    sampleRate: 16000
  });

  // Step 5: Extract standard acoustic features for charts and biometric verification
  const features = await audioAnalysisService.extractForensicFeatures(audioBlobOrBuffer);

  // Step 6: Biometric Speaker Verification against enrolled trusted voice
  const enrolledProfile = getStoredProfile();
  const speakerVerification = speakerVerificationService.verifySpeaker(features, enrolledProfile);

  // Step 7: Map classification strictly conforming to Step 6, 7 & 10
  const modelStatus = modelResult.status || 'OFFLINE';
  const rawClass = modelResult.classification; // AI_GENERATED | HUMAN | UNCERTAIN | INSUFFICIENT_AUDIO | MODEL_UNAVAILABLE

  let classification = 'MODEL UNAVAILABLE';
  let riskScore = 0;
  let riskLevel = 'LOW';
  let requiresAlert = false;
  let analysisMode = 'HEURISTIC AUDIO ANALYSIS';
  let isAIGenerated = false;

  if (rawClass === 'AI_GENERATED') {
    classification = 'AI-GENERATED VOICE';
    isAIGenerated = true;
    const aiProb = Number(modelResult.aiProbability ?? 0);
    const normalizedAiProb = aiProb > 1 ? aiProb / 100 : aiProb;
    riskScore = Math.min(99, Math.max(76, Math.round(normalizedAiProb * 100)));
    riskLevel = 'HIGH';
    requiresAlert = true;
    analysisMode = `AI DEEPFAKE DETECTION (${modelResult.modelName})`;
  } else if (rawClass === 'HUMAN') {
    classification = 'HUMAN VOICE';
    isAIGenerated = false;
    riskScore = Math.max(5, Math.min(25, Math.round((1 - modelResult.humanProbability) * 30)));
    riskLevel = 'LOW';
    requiresAlert = false;
    analysisMode = `AI DEEPFAKE DETECTION (${modelResult.modelName})`;
  } else if (rawClass === 'UNCERTAIN') {
    classification = 'UNCERTAIN';
    isAIGenerated = false;
    riskScore = 50;
    riskLevel = 'MEDIUM';
    requiresAlert = false;
    analysisMode = `AI DEEPFAKE DETECTION (${modelResult.modelName})`;
  } else if (rawClass === 'INSUFFICIENT_AUDIO') {
    classification = 'INSUFFICIENT AUDIO';
    isAIGenerated = false;
    riskScore = 0;
    riskLevel = 'LOW';
    requiresAlert = false;
    analysisMode = 'INSUFFICIENT AUDIO';
  } else {
    // MODEL_UNAVAILABLE or backend offline (STEP 13: NEVER SILENTLY FALL BACK TO HUMAN)
    classification = 'MODEL UNAVAILABLE';
    isAIGenerated = false;
    riskScore = 0;
    riskLevel = 'LOW';
    requiresAlert = false;
    analysisMode = 'AI DETECTION UNAVAILABLE (Model Offline)';
  }

  const callId = `VG-${Date.now().toString().slice(-6)}`;
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

  return {
    id: callId,
    callId,
    timestamp,
    caller: callerMeta.number || callerMeta.name || '+91 98490 23145',
    callerName: callerMeta.name || (isAIGenerated ? 'Suspected AI Synthesizer' : 'Active Speaker'),
    
    // Core Model Outputs conforming strictly to user specification
    classification,
    rawClassification: rawClass,
    aiProbability: Number(modelResult.aiProbability ?? 0) > 1
      ? Number(modelResult.aiProbability) / 100
      : Number(modelResult.aiProbability ?? 0),
    humanProbability: Number(modelResult.humanProbability ?? 0) > 1
      ? Number(modelResult.humanProbability) / 100
      : Number(modelResult.humanProbability ?? 0),
    confidence: modelResult.confidence ? +(modelResult.confidence * 100).toFixed(1) : 0,
    modelName: modelResult.modelName || 'ASVspoof-LCNN-v2.4',
    modelVersion: modelResult.modelVersion || '2.4.0',
    modelStatus,
    modelInferenceTimeMs: modelResult.inferenceTimeMs || 0,
    rawLogits: modelResult.rawLogits || null,
    modelSignals: modelResult.signals || [],
    isAIGenerated,

    // Risk Assessment
    riskScore,
    riskLevel,
    requiresAlert,
    status: requiresAlert ? 'FLAGGED' : (rawClass === 'HUMAN' ? 'VERIFIED' : rawClass),
    analysisMode,

    // Biometric Verification
    speakerMatch: speakerVerification.matchPercentage,
    speakerVerification,

    // Forensic Physical Telemetry
    features,
    duration: `${Math.floor(duration / 60).toString().padStart(2, '0')}:${Math.round(duration % 60).toString().padStart(2, '0')}`,
    indicators: (modelResult.signals && modelResult.signals.length > 0)
      ? modelResult.signals.map(s => `${s.title}: ${s.measuredValue}`)
      : [modelResult.reason || 'Forensic analysis completed.']
  };
}

export default {
  analyzeVoice
};
