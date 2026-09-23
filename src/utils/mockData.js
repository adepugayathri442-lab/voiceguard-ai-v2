/**
 * Demo Presets and Initial History Seed Data for VoiceGuard AI
 * Configured with phone numbers demonstrating same-number spoofing tracking.
 */

export const DEMO_PRESETS = [
  {
    id: 'case-a-genuine',
    scenarioId: 'demo-genuine',
    title: 'Test 1: Genuine User Voice',
    subtitle: 'Human Voice + High Similarity to Profile',
    description: 'Simulates genuine phone call from the registered user with authentic glottal resonance matching the enrolled baseline.',
    verdict: 'HUMAN',
    similarity: 'HIGH (95.4%)',
    identity: 'MATCH — REGISTERED USER',
    risk: 'LOW',
  },
  {
    id: 'case-d-unknown-human',
    scenarioId: 'demo-unknown-human',
    title: 'Test 2: Unknown Human Caller',
    subtitle: 'Human Voice + Low Similarity',
    description: 'Simulates a legitimate biological human third party (e.g., bank customer service agent) with unique vocal timbre.',
    verdict: 'HUMAN',
    similarity: 'LOW (28.2%)',
    identity: 'NOT MATCHED TO REGISTERED USER',
    risk: 'MODERATE',
  },
  {
    id: 'case-b-generic-ai',
    scenarioId: 'demo-generic-ai',
    title: 'Test 3: Generic AI Robocaller',
    subtitle: 'AI-Generated Voice + Low Similarity',
    description: 'Simulates an automated AI agent or synthetic telemarketer (VALL-E/ElevenLabs) not targeting the registered user.',
    verdict: 'AI_SYNTHETIC',
    similarity: 'LOW (21.0%)',
    identity: 'AI VOICE — NOT MATCHED TO USER',
    risk: 'HIGH',
  },
  {
    id: 'case-c-clone-attack',
    scenarioId: 'demo-clone-attack',
    title: 'Test 4: AI Voice Clone Attack 🚨',
    subtitle: 'AI-Generated Voice + High Similarity (CRITICAL)',
    description: 'Simulates an AI deepfake clone trained on your voice attempting identity impersonation and urgent scam requests.',
    verdict: 'AI_SYNTHETIC',
    similarity: 'HIGH (94.8%)',
    identity: 'POSSIBLE CLONED USER VOICE',
    risk: 'CRITICAL',
  },
];

export const INITIAL_HISTORY_SEED = [
  {
    id: 'CALL-90421',
    callId: 'CALL-90421',
    callerNumber: '+91 98765 43210',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    duration: '00:22.4',
    verdict: 'AI_SYNTHETIC',
    finalVerdict: '🚨 VOICE CLONE DETECTED',
    confidence: 94.8,
    voiceSimilarity: 91.4,
    identityResult: 'POSSIBLE CLONED USER VOICE',
    riskScore: 94,
    riskLevel: 'CRITICAL',
    isCloneAlert: true,
    state: 'STATE_3_AI_VOICE_CLONE',
    antiSpoofScore: 14,
    callerLabel: 'Incoming Call: Wire Transfer Request',
    acousticPattern: 'Synthetic neural vocoder phase artifacts detected',
    prosody: 'Monotone cadence / synthetic pitch flattening',
    spectralArtifacts: 'High-frequency spectral clipping above 10.5 kHz',
    cloneComparison: {
      performed: true,
      similarity: 91.4,
      status: 'POSSIBLE CLONED USER VOICE',
      headline: '🚨 VOICE CLONE DETECTED',
      note: 'Surface similarity: 91.4% — Neural clone signature detected. Voice mimics registered user.',
    },
    knownCallerInfo: {
      isKnown: true,
      previousCallCount: 1,
      spoofingAdvisory: 'Phone numbers can be spoofed using VoIP dialers. Always verify through voice biometrics rather than caller ID alone.',
    },
    forensicEvidence: {
      voiceSimilarityEvidence: {
        score: '91.4%',
        status: 'High similarity to registered profile',
        matched: true,
      },
      syntheticEvidence: {
        status: 'Synthetic vocoder characteristics detected',
        detail: 'Phase discontinuities, comb-filtering artifacts, and pitch quantization detected (94.8% confidence).',
        flagged: true,
      },
      prosodyEvidence: {
        status: 'Inorganic pitch contour / flat cadence',
        detail: 'Unnatural mathematical timing in phonetic transitions; absence of biological micro-vibrato.',
        flagged: true,
      },
      antiSpoofEvidence: {
        status: 'Anti-spoof verification failed',
        score: '14/100',
        flagged: true,
      }
    }
  },
  {
    id: 'CALL-88129',
    callId: 'CALL-88129',
    callerNumber: '+91 98765 43210',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    duration: '00:18.0',
    verdict: 'HUMAN',
    finalVerdict: '✅ GENUINE VOICE',
    confidence: 96.2,
    voiceSimilarity: 97.2,
    identityResult: 'MATCH — GENUINE USER',
    riskScore: 12,
    riskLevel: 'LOW',
    isCloneAlert: false,
    state: 'STATE_1_GENUINE_USER',
    antiSpoofScore: 88,
    callerLabel: 'Family Check-in Call',
    acousticPattern: 'Natural biological glottal pulses',
    prosody: 'Dynamic organic human inflection',
    spectralArtifacts: 'None detected across 0–8 kHz spectrum',
    cloneComparison: {
      performed: true,
      similarity: 97.2,
      status: 'MATCH — GENUINE USER',
      headline: '✅ GENUINE VOICE',
      note: 'Biometric voice match confirmed (97.2% match). Vocal tract formant dispersion matches baseline.',
    },
    knownCallerInfo: {
      isKnown: false,
      previousCallCount: 0,
    },
    forensicEvidence: {
      voiceSimilarityEvidence: {
        score: '97.2%',
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
      antiSpoofEvidence: {
        status: 'Authenticity / anti-spoof verified',
        score: '88/100',
        flagged: false,
      }
    }
  },
  {
    id: 'CALL-77341',
    callId: 'CALL-77341',
    callerNumber: '+91 91234 56789',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    duration: '00:11.5',
    verdict: 'AI_SYNTHETIC',
    finalVerdict: '🚨 AI-GENERATED VOICE',
    confidence: 98.4,
    voiceSimilarity: 19.5,
    identityResult: 'NOT MATCHED TO USER',
    riskScore: 70,
    riskLevel: 'HIGH',
    isCloneAlert: false,
    state: 'STATE_2_GENERIC_AI_VOICE',
    antiSpoofScore: 22,
    callerLabel: 'Automated Warranty Scam',
    acousticPattern: 'Concatenative text-to-speech audio junctions',
    prosody: 'Robotic flat pitch curve & unnatural cadenced pauses',
    spectralArtifacts: 'Repetitive harmonic comb-filtering signatures',
    cloneComparison: {
      performed: true,
      similarity: 19.5,
      status: 'NOT MATCHED TO USER',
      headline: '🚨 AI-GENERATED VOICE',
      note: 'Commercial AI speech synthesizer detected (19.5% similarity). Not an impersonation clone.',
    },
    knownCallerInfo: {
      isKnown: false,
      previousCallCount: 0,
    },
    forensicEvidence: {
      voiceSimilarityEvidence: {
        score: '19.5%',
        status: 'Low similarity to registered profile',
        matched: false,
      },
      syntheticEvidence: {
        status: 'Synthetic vocoder characteristics detected',
        detail: 'Phase discontinuities and unnatural harmonic comb-filtering detected (98.4% confidence).',
        flagged: true,
      },
      prosodyEvidence: {
        status: 'Inorganic pitch contour / flat cadence',
        detail: 'Robotic flat pitch curve & unnatural cadenced pauses.',
        flagged: true,
      },
      antiSpoofEvidence: {
        status: 'Anti-spoof verification failed',
        score: '22/100',
        flagged: true,
      }
    }
  },
  {
    id: 'CALL-65209',
    callId: 'CALL-65209',
    callerNumber: '+91 99887 76655',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    duration: '00:16.2',
    verdict: 'HUMAN',
    finalVerdict: '⚠️ UNKNOWN VOICE',
    confidence: 94.0,
    voiceSimilarity: 28.0,
    identityResult: 'NOT MATCHED TO REGISTERED USER',
    riskScore: 35,
    riskLevel: 'MODERATE',
    isCloneAlert: false,
    state: 'STATE_4_UNKNOWN_HUMAN',
    antiSpoofScore: 84,
    callerLabel: 'Courier Delivery Call',
    acousticPattern: 'Authentic glottal pulse trains',
    prosody: 'Natural human micro-tremors and conversational pauses',
    spectralArtifacts: 'Natural analog environmental room acoustics',
    cloneComparison: {
      performed: true,
      similarity: 28.0,
      status: 'NOT MATCHED TO REGISTERED USER',
      headline: '⚠️ UNKNOWN VOICE',
      note: 'Biological human voice detected. Low similarity to user profile (28.0%). Third-party speaker.',
    },
    knownCallerInfo: {
      isKnown: false,
      previousCallCount: 0,
    },
    forensicEvidence: {
      voiceSimilarityEvidence: {
        score: '28.0%',
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
      antiSpoofEvidence: {
        status: 'Authenticity / anti-spoof verified',
        score: '84/100',
        flagged: false,
      }
    }
  }
];
