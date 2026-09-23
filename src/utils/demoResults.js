/**
 * VoiceGuard AI - Deterministic Hackathon Demo Result Factory
 * 
 * Provides 100% deterministic, immutable forensic results for the four canonical hackathon demo buttons:
 * 1. demo-genuine       -> HUMAN, Low Risk (<= 20), Alert: NO
 * 2. demo-unknown-human -> HUMAN, Medium Risk (30-50), Alert: NO
 * 3. demo-generic-ai    -> AI_SYNTHETIC, High Risk (>= 70), Alert: NO
 * 4. demo-clone-attack  -> AI_SYNTHETIC, Critical Risk (>= 90), Alert: YES (Voice Clone Alert)
 * 
 * ZERO dependency on microphone hardware, Web Audio API, Math.random(), or asynchronous race conditions.
 */

import { getCallsByPhoneNumber } from './storage.js';

export const DEMO_SCENARIO_IDS = {
  GENUINE: 'demo-genuine',
  UNKNOWN_HUMAN: 'demo-unknown-human',
  GENERIC_AI: 'demo-generic-ai',
  CLONE_ATTACK: 'demo-clone-attack',
};

/**
 * Creates a complete forensic analysis result for a demo scenario.
 * @param {string} scenarioId - One of 'demo-genuine', 'demo-unknown-human', 'demo-generic-ai', 'demo-clone-attack'
 * @param {string} callerNumber - Phone number associated with the call
 * @param {number} durationSeconds - Simulated call duration
 * @returns {Object} Deterministic forensic report
 */
export function createDemoResult(scenarioId, callerNumber = '+91 98765 43210', durationSeconds = 5) {
  const norm = String(scenarioId || '').toLowerCase().trim();
  const timestamp = new Date().toISOString();
  
  let previousCalls = [];
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      previousCalls = getCallsByPhoneNumber(callerNumber) || [];
    }
  } catch (e) {
    previousCalls = [];
  }
  const isKnownCaller = previousCalls.length > 0;

  // =========================================================================
  // TEST 1 — GENUINE HUMAN (Must reliably be HUMAN, LOW risk)
  // =========================================================================
  if (
    norm === 'demo-genuine' || 
    norm === 'case-a-genuine' || 
    norm === 'genuine' || 
    norm === 'human'
  ) {
    const callId = 'CALL-GENUINE-88214';
    const verdict = 'HUMAN';
    const finalVerdict = '✅ GENUINE HUMAN VOICE';
    const confidence = 97.4;
    const riskLevel = 'LOW';
    const riskScore = 12;
    const isCloneAlert = false;
    const state = 'STATE_1_GENUINE_USER';
    const identityResult = 'REGISTERED USER VERIFIED';
    const voiceSimilarity = 95.8;
    const antiSpoofScore = 95;

    const acousticEvidence = {
      status: 'Natural biological glottal pulses',
      detail: 'Natural human vocal tract resonance verified. Organic glottal airflow dynamics with standard biological jitter.',
      flagged: false,
    };
    const spectralEvidence = {
      status: 'Continuous exponential harmonic decay',
      detail: 'Natural analog acoustic spectrum across 0–8 kHz. No spectral cutoff or vocoder comb-filtering.',
      flagged: false,
    };
    const prosodyEvidence = {
      status: 'Dynamic organic human inflection',
      detail: 'Normal conversational rhythm with natural respiratory cadence and micro-pitch pitch variance.',
      flagged: false,
    };
    const speakerVerification = {
      status: 'REGISTERED USER VERIFIED',
      similarity: '95.8%',
      matched: true,
    };
    const aiDetectionEvidence = {
      status: 'BIOLOGICAL HUMAN VOICE',
      confidence: '97.4%',
      isAi: false,
    };
    const antiSpoofEvidence = {
      status: 'Authenticity / anti-spoof verified',
      score: '95/100',
      flagged: false,
    };

    return {
      id: callId,
      callId,
      timestamp,
      callerNumber,
      durationSeconds,
      verdict,
      finalVerdict,
      confidence,
      voiceSimilarity,
      identityResult,
      riskScore,
      riskLevel,
      isCloneAlert,
      state,
      antiSpoofScore,
      acousticEvidence,
      spectralEvidence,
      prosodyEvidence,
      speakerVerification,
      aiDetectionEvidence,
      antiSpoofEvidence,
      warningBanner: null,
      breakdown: {
        acousticPattern: acousticEvidence,
        prosody: prosodyEvidence,
        spectralArtifacts: spectralEvidence,
      },
      cloneResult: {
        checked: true,
        hasProfile: true,
        verdict: identityResult,
        similarityScore: voiceSimilarity,
        headline: finalVerdict,
        description: 'Biometric voice match confirmed (95.8% match). Vocal tract formant dispersion matches registered baseline.',
        warningBanner: null,
        state,
      },
      forensicEvidence: {
        voiceSimilarityEvidence: {
          score: `${voiceSimilarity}%`,
          status: 'High similarity to registered profile',
          matched: true,
        },
        syntheticEvidence: {
          status: 'Natural biological vocal tract resonance',
          detail: 'Glottal air-pulse turbulence and organic micro-tremors verified.',
          flagged: false,
        },
        prosodyEvidence: {
          status: 'Natural conversational prosody & pitch variation',
          detail: 'Dynamic pitch variability with natural respiratory pauses.',
          flagged: false,
        },
        antiSpoofEvidence,
      },
      knownCallerInfo: {
        isKnown: isKnownCaller,
        previousCallCount: previousCalls.length,
        previousCalls: previousCalls.slice(0, 3),
        spoofingAdvisory: 'Phone numbers can be spoofed using VoIP dialers. Always verify through voice biometrics rather than caller ID alone.',
      },
      extractedFeatures: {
        fundamentalPitchHz: 138,
        spectralCentroidHz: 1780,
        jitterScore: 0.42,
        harmonicsNoiseRatioDb: 23.4,
        energyVariance: 0.045,
        antiSpoofScore: 95,
        isSyntheticSignature: false,
      }
    };
  }

  // =========================================================================
  // TEST 2 — UNKNOWN HUMAN (Must reliably be HUMAN, MEDIUM risk)
  // =========================================================================
  if (
    norm === 'demo-unknown-human' || 
    norm === 'case-d-unknown-human' || 
    norm === 'unknown-human' || 
    norm === 'unknown' ||
    norm === 'suspicious'
  ) {
    const callId = 'CALL-UNKNOWN-49102';
    const verdict = 'HUMAN';
    const finalVerdict = '⚠️ UNKNOWN HUMAN VOICE';
    const confidence = 95.2;
    const riskLevel = 'MEDIUM';
    const riskScore = 36;
    const isCloneAlert = false;
    const state = 'STATE_4_UNKNOWN_HUMAN';
    const identityResult = 'NOT MATCHED TO REGISTERED USER';
    const voiceSimilarity = 35.0;
    const antiSpoofScore = 90;

    const acousticEvidence = {
      status: 'Natural biological glottal pulses',
      detail: 'Biological human voice characteristics detected from a third-party speaker.',
      flagged: false,
    };
    const spectralEvidence = {
      status: 'Natural analog acoustic spectrum',
      detail: 'Uncorrelated vocal tract envelope. No neural synthesis artifacts.',
      flagged: false,
    };
    const prosodyEvidence = {
      status: 'Natural human conversational prosody',
      detail: 'Natural speech pauses and organic vocal micro-tremors present.',
      flagged: false,
    };
    const speakerVerification = {
      status: 'NOT MATCHED TO REGISTERED USER',
      similarity: '35.0%',
      matched: false,
    };
    const aiDetectionEvidence = {
      status: 'BIOLOGICAL HUMAN VOICE',
      confidence: '95.2%',
      isAi: false,
    };
    const antiSpoofEvidence = {
      status: 'Authenticity / anti-spoof verified',
      score: '90/100',
      flagged: false,
    };

    return {
      id: callId,
      callId,
      timestamp,
      callerNumber,
      durationSeconds,
      verdict,
      finalVerdict,
      confidence,
      voiceSimilarity,
      identityResult,
      riskScore,
      riskLevel,
      isCloneAlert,
      state,
      antiSpoofScore,
      acousticEvidence,
      spectralEvidence,
      prosodyEvidence,
      speakerVerification,
      aiDetectionEvidence,
      antiSpoofEvidence,
      warningBanner: null,
      breakdown: {
        acousticPattern: acousticEvidence,
        prosody: prosodyEvidence,
        spectralArtifacts: spectralEvidence,
      },
      cloneResult: {
        checked: true,
        hasProfile: true,
        verdict: identityResult,
        similarityScore: voiceSimilarity,
        headline: finalVerdict,
        description: 'Natural human voice detected, but acoustic baseline has low similarity (35.0%) to registered voice profile. Classified as a third-party human caller.',
        warningBanner: null,
        state,
      },
      forensicEvidence: {
        voiceSimilarityEvidence: {
          score: `${voiceSimilarity}%`,
          status: 'Low similarity to registered profile',
          matched: false,
        },
        syntheticEvidence: {
          status: 'Natural biological vocal tract resonance',
          detail: 'Glottal air-pulse turbulence and organic micro-tremors verified.',
          flagged: false,
        },
        prosodyEvidence: {
          status: 'Natural conversational prosody & pitch variation',
          detail: 'Dynamic pitch variability with natural respiratory pauses.',
          flagged: false,
        },
        antiSpoofEvidence,
      },
      knownCallerInfo: {
        isKnown: isKnownCaller,
        previousCallCount: previousCalls.length,
        previousCalls: previousCalls.slice(0, 3),
        spoofingAdvisory: 'Phone numbers can be spoofed using VoIP dialers. Always verify through voice biometrics rather than caller ID alone.',
      },
      extractedFeatures: {
        fundamentalPitchHz: 198,
        spectralCentroidHz: 2320,
        jitterScore: 0.48,
        harmonicsNoiseRatioDb: 21.0,
        energyVariance: 0.038,
        antiSpoofScore: 90,
        isSyntheticSignature: false,
      }
    };
  }

  // =========================================================================
  // TEST 3 — GENERIC AI VOICE (Must reliably be AI_SYNTHETIC, HIGH risk)
  // =========================================================================
  if (
    norm === 'demo-generic-ai' || 
    norm === 'case-b-generic-ai' || 
    norm === 'generic-ai' || 
    norm === 'ai'
  ) {
    const callId = 'CALL-GENERIC-AI-63198';
    const verdict = 'AI_SYNTHETIC';
    const finalVerdict = '🚨 AI-GENERATED VOICE DETECTED';
    const confidence = 98.2;
    const riskLevel = 'HIGH';
    const riskScore = 72;
    const isCloneAlert = false;
    const state = 'STATE_2_GENERIC_AI_VOICE';
    const identityResult = 'NOT A VERIFIED HUMAN VOICE';
    const voiceSimilarity = 25.0;
    const antiSpoofScore = 20;

    const acousticEvidence = {
      status: 'Synthetic neural vocoder phase artifacts detected',
      detail: 'Phase discontinuities, comb-filtering artifacts, and pitch quantization detected.',
      flagged: true,
    };
    const spectralEvidence = {
      status: 'Repetitive harmonic comb-filtering signatures',
      detail: 'Spectral clipping above 10.5 kHz; unnatural harmonic distribution.',
      flagged: true,
    };
    const prosodyEvidence = {
      status: 'Monotone cadence / synthetic pitch flattening',
      detail: 'Unnatural mathematical timing in phonetic transitions; absence of biological micro-vibrato.',
      flagged: true,
    };
    const speakerVerification = {
      status: 'NOT A VERIFIED HUMAN VOICE',
      similarity: '25.0%',
      matched: false,
    };
    const aiDetectionEvidence = {
      status: 'AI SYNTHETIC SPEECH DETECTED',
      confidence: '98.2%',
      isAi: true,
    };
    const antiSpoofEvidence = {
      status: 'Anti-spoof verification failed',
      score: '20/100',
      flagged: true,
    };

    return {
      id: callId,
      callId,
      timestamp,
      callerNumber,
      durationSeconds,
      verdict,
      finalVerdict,
      confidence,
      voiceSimilarity,
      identityResult,
      riskScore,
      riskLevel,
      isCloneAlert,
      state,
      antiSpoofScore,
      acousticEvidence,
      spectralEvidence,
      prosodyEvidence,
      speakerVerification,
      aiDetectionEvidence,
      antiSpoofEvidence,
      warningBanner: null,
      breakdown: {
        acousticPattern: acousticEvidence,
        prosody: prosodyEvidence,
        spectralArtifacts: spectralEvidence,
      },
      cloneResult: {
        checked: true,
        hasProfile: true,
        verdict: identityResult,
        similarityScore: voiceSimilarity,
        headline: finalVerdict,
        description: 'Voice is synthetic AI (98.2% probability), but has low acoustic similarity (25.0%) to registered voice profile. Not an impersonation clone.',
        warningBanner: null,
        state,
      },
      forensicEvidence: {
        voiceSimilarityEvidence: {
          score: `${voiceSimilarity}%`,
          status: 'Low similarity to registered profile',
          matched: false,
        },
        syntheticEvidence: {
          status: 'Synthetic vocoder characteristics detected',
          detail: 'Phase discontinuities, comb-filtering artifacts, and pitch quantization detected (98.2% confidence).',
          flagged: true,
        },
        prosodyEvidence: {
          status: 'Inorganic pitch contour / flat cadence',
          detail: 'Unnatural mathematical timing in phonetic transitions; absence of biological micro-vibrato.',
          flagged: true,
        },
        antiSpoofEvidence,
      },
      knownCallerInfo: {
        isKnown: isKnownCaller,
        previousCallCount: previousCalls.length,
        previousCalls: previousCalls.slice(0, 3),
        spoofingAdvisory: 'Phone numbers can be spoofed using VoIP dialers. Always verify through voice biometrics rather than caller ID alone.',
      },
      extractedFeatures: {
        fundamentalPitchHz: 125,
        spectralCentroidHz: 2890,
        jitterScore: 0.12,
        harmonicsNoiseRatioDb: 11.2,
        energyVariance: 0.005,
        antiSpoofScore: 20,
        isSyntheticSignature: true,
      }
    };
  }

  // =========================================================================
  // TEST 4 — AI VOICE CLONE ATTACK (Must ALWAYS be AI_SYNTHETIC + isCloneAlert)
  // =========================================================================
  const callId = 'CALL-CLONE-ATTACK-99041';
  const verdict = 'AI_SYNTHETIC';
  const finalVerdict = '🚨 VOICE CLONE / IMPERSONATION DETECTED';
  const confidence = 98.6;
  const riskLevel = 'CRITICAL';
  const riskScore = 96;
  const isCloneAlert = true;
  const state = 'STATE_3_AI_CLONE_ATTACK';
  const identityResult = 'VOICE MATCHED BUT SYNTHETIC / IMPERSONATION DETECTED';
  const voiceSimilarity = 96.2;
  const antiSpoofScore = 15;

  const warningBanner = {
    title: '🚨 SECURITY ALERT — VOICE CLONE DETECTED',
    message: "Someone may be using an AI-generated clone of the registered user's voice. Do not approve any transactions or share sensitive info based on this call.",
    evidence: [
      'High voice similarity to registered profile: 96.2% match',
      'Synthetic vocoder phase discontinuities detected (98.6% AI confidence)',
      'Anti-spoofing verification failed: robotic micro-cadence signature',
    ],
  };

  const acousticEvidence = {
    status: 'Synthetic vocoder artifacts detected',
    detail: 'HiFi-GAN neural synthesis artifacts detected with 98.6% confidence.',
    flagged: true,
  };
  const spectralEvidence = {
    status: 'Comb-filtering phase glitches detected',
    detail: 'Comb-filtering patterns and phase discontinuities typical of neural voice cloning.',
    flagged: true,
  };
  const prosodyEvidence = {
    status: 'Unnatural pitch contours / inorganic micro-timing',
    detail: 'Mathematical pitch quantization and absence of organic respiration intervals.',
    flagged: true,
  };
  const speakerVerification = {
    status: 'MATCHED TO REGISTERED PROFILE (96.2%)',
    similarity: '96.2%',
    matched: true,
  };
  const aiDetectionEvidence = {
    status: 'AI SYNTHETIC SPEECH DETECTED',
    confidence: '98.6%',
    isAi: true,
  };
  const antiSpoofEvidence = {
    status: 'Anti-spoof verification FAILED',
    score: '15/100',
    flagged: true,
  };

  return {
    id: callId,
    callId,
    timestamp,
    callerNumber,
    durationSeconds,
    verdict,
    finalVerdict,
    confidence,
    voiceSimilarity,
    identityResult,
    riskScore,
    riskLevel,
    isCloneAlert,
    state,
    antiSpoofScore,
    acousticEvidence,
    spectralEvidence,
    prosodyEvidence,
    speakerVerification,
    aiDetectionEvidence,
    antiSpoofEvidence,
    warningBanner,
    breakdown: {
      acousticPattern: acousticEvidence,
      prosody: prosodyEvidence,
      spectralArtifacts: spectralEvidence,
    },
    cloneResult: {
      checked: true,
      hasProfile: true,
      verdict: identityResult,
      similarityScore: voiceSimilarity,
      headline: finalVerdict,
      description: "CRITICAL: Caller matches enrolled voice (96.2% similarity) but contains artificial vocoder signatures (98.6% AI probability). This is an active voice cloning impersonation attack.",
      warningBanner,
      state,
    },
    forensicEvidence: {
      voiceSimilarityEvidence: {
        score: `${voiceSimilarity}%`,
        status: 'High similarity to registered profile (Targeted attack)',
        matched: true,
      },
      syntheticEvidence: {
        status: 'Synthetic vocoder characteristics detected',
        detail: 'HiFi-GAN / DiffWave neural synthesis footprint detected.',
        flagged: true,
      },
      prosodyEvidence: {
        status: 'Inorganic pitch contour / flat cadence',
        detail: 'Sub-harmonic pitch rigidity (Variance < 4.0 Hz).',
        flagged: true,
      },
      antiSpoofEvidence,
    },
    knownCallerInfo: {
      isKnown: isKnownCaller,
      previousCallCount: previousCalls.length,
      previousCalls: previousCalls.slice(0, 3),
      spoofingAdvisory: 'CRITICAL WARNING: Caller ID spoofing active. Attacker is spoofing a trusted number while transmitting cloned biometric speech.',
    },
    extractedFeatures: {
      fundamentalPitchHz: 142,
      spectralCentroidHz: 3950,
      jitterScore: 0.08,
      harmonicsNoiseRatioDb: 9.8,
      energyVariance: 0.003,
      antiSpoofScore: 15,
      isSyntheticSignature: true,
    }
  };
}

/**
 * Converts a demo result to an AppContext-compatible event record
 */
export function convertDemoResultToAppEvent(result) {
  const isAi = result.verdict === 'AI_SYNTHETIC';
  const isClone = result.isCloneAlert;
  const isHuman = result.verdict === 'HUMAN';

  return {
    id: result.id,
    timestamp: result.timestamp.replace('T', ' ').slice(0, 19),
    caller: result.callerNumber,
    callerName: isClone 
      ? 'Potential Impersonator (Targeted Clone)' 
      : isHuman && result.state === 'STATE_1_GENUINE_USER'
      ? 'Registered Account Holder'
      : isHuman
      ? 'Third-Party Human Caller'
      : 'Automated Telemarketer AI',
    voiceType: isClone ? 'AI_CLONE' : isAi ? 'AI_SYNTHETIC' : 'HUMAN',
    confidence: result.confidence,
    riskScore: result.riskScore,
    threatLevel: result.riskLevel,
    requiresAlert: isClone,
    requiresVerification: result.riskScore >= 70,
    recommendedAction: isClone 
      ? 'BLOCK_AND_INDEPENDENT_VERIFY' 
      : result.riskScore >= 70
      ? 'FLAG_FOR_REVIEW'
      : 'ALLOW_AND_MONITOR',
    status: result.riskScore >= 70 ? 'FLAGGED' : 'VERIFIED',
    indicators: isClone ? [
      'Targeted AI Voice Clone Attack detected (96.2% similarity)',
      'Neural vocoder synthesis signature confirmed (98.6% AI)',
      'Anti-spoofing verification failed: robotic phase artifacts',
    ] : isAi ? [
      'Generic neural speech synthesizer detected (98.2% AI)',
      'Unnatural mathematical timing in phonetic transitions',
      'Comb-filtering phase distortion detected',
    ] : result.state === 'STATE_1_GENUINE_USER' ? [
      'Verified biological vocal tract resonance',
      'Biometric voice baseline matched to registered profile (95.8%)',
      'Organic human respiration and glottal dynamics confirmed',
    ] : [
      'Biological human voice confirmed (95.2% confidence)',
      'Low similarity to registered profile (35.0%) — third-party caller',
      'Anti-spoofing verification passed (90/100)',
    ],
    // Embed full result object for rich forensic display
    rawDemoResult: result,
  };
}
