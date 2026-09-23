/**
 * VoiceGuard AI - Mock Data Store
 * SIH Problem Statement 26104: Voice Cloning Detection & Prevention
 */

export const INITIAL_CALLS_HISTORY = [
  {
    id: 'evt-9042',
    timestamp: '2026-09-10 23:48:12',
    caller: '+91 98490 23145',
    callerName: 'Unknown (Purporting to be HDFC Branch)',
    voiceType: 'AI_CLONE',
    confidence: 94.7,
    riskScore: 92,
    threatLevel: 'CRITICAL',
    status: 'BLOCKED',
    actionTaken: 'Independent Verification Failed - Call Terminated & Blocked',
    duration: '00:42',
    indicators: [
      'Vocoder Neural Artifacts Detected (HiFi-GAN pattern)',
      'Unnatural Fundamental Frequency (F0) Flatness',
      'Phase Discontinuity at 3.8 kHz',
      'Acoustic Embedding Mismatch with Claimed Identity'
    ]
  },
  {
    id: 'evt-8991',
    timestamp: '2026-09-10 21:15:04',
    caller: '+91 94401 88721',
    callerName: 'Ananya Sharma (Colleague)',
    voiceType: 'HUMAN',
    confidence: 96.4,
    riskScore: 12,
    threatLevel: 'LOW',
    status: 'VERIFIED',
    actionTaken: 'Passed Speaker Verification - Normal Call Permitted',
    duration: '04:18',
    indicators: [
      'Natural Biological Jitter & Shimmer Verified',
      'Dynamic Vocal Tract Resonances (Formants F1-F4 Normal)',
      'Speaker Embedding Match: 98.1% with Enrolled Voice'
    ]
  },
  {
    id: 'evt-8910',
    timestamp: '2026-09-10 18:32:45',
    caller: '+91 77029 44102',
    callerName: 'Courier Delivery Executive',
    voiceType: 'HUMAN',
    confidence: 89.2,
    riskScore: 24,
    threatLevel: 'LOW',
    status: 'VERIFIED',
    actionTaken: 'Background Monitored - No Anomaly Detected',
    duration: '01:05',
    indicators: [
      'Ambient Road Noise with Natural Acoustic Occlusion',
      'Realistic Prosodic Pauses & Breathing Dynamics'
    ]
  },
  {
    id: 'evt-8854',
    timestamp: '2026-09-10 14:08:19',
    caller: '+91 91210 55690',
    callerName: 'Telecom Offer Executive',
    voiceType: 'SUSPICIOUS',
    confidence: 72.1,
    riskScore: 64,
    threatLevel: 'MEDIUM',
    status: 'FLAGGED',
    actionTaken: 'Stepped-up Secondary In-Call Audio Verification',
    duration: '02:30',
    indicators: [
      'Unusual Latency (>600ms) in Turn-Taking Response',
      'Sub-band Energy Anomaly around 4kHz-6kHz',
      'Elevated Urgency & Financial Keywords Detected'
    ]
  },
  {
    id: 'evt-8740',
    timestamp: '2026-09-09 20:44:11',
    caller: '+91 80081 22910',
    callerName: 'Alleged Police Sub-Inspector',
    voiceType: 'AI_CLONE',
    confidence: 96.1,
    riskScore: 95,
    threatLevel: 'CRITICAL',
    status: 'BLOCKED',
    actionTaken: 'Immediate High-Risk Threat Block - Audio Evidence Exported',
    duration: '00:28',
    indicators: [
      'Text-to-Speech (TTS) Latent Synthesis Glitches',
      'Lack of Glottal Pulse Variation (Robotic Monotone Prosody)',
      'High-Risk Digital Arrest / Extortion Context Pattern'
    ]
  }
];

export const INITIAL_ALERTS = [
  {
    id: 'alt-101',
    type: 'CRITICAL',
    title: 'High-Confidence Voice Clone Attack Blocked',
    caller: '+91 98490 23145',
    callerName: 'Bank Impersonator',
    timestamp: '15 mins ago',
    riskScore: 92,
    confidence: 94.7,
    reason: 'Deepfake synthetic speech signature detected via multi-band spectral analysis.',
    read: false,
    resolved: true,
    action: 'Auto-Terminated & Blacklisted'
  },
  {
    id: 'alt-102',
    type: 'CRITICAL',
    title: 'Extortion Call using Cloned Authority Voice',
    caller: '+91 80081 22910',
    callerName: 'Digital Arrest Threat',
    timestamp: 'Yesterday 20:44',
    riskScore: 95,
    confidence: 96.1,
    reason: 'Synthesized voice impersonating law enforcement officer with zero glottal pulse variation.',
    read: true,
    resolved: true,
    action: 'Reported to Cyber Crime Cell'
  },
  {
    id: 'alt-103',
    type: 'WARNING',
    title: 'Suspicious Synthetic Latency Pattern',
    caller: '+91 91210 55690',
    callerName: 'Unknown Caller',
    timestamp: 'Yesterday 14:08',
    riskScore: 64,
    confidence: 72.1,
    reason: 'Abnormal conversational latency coupled with robotic spectral harmonics.',
    read: true,
    resolved: false,
    action: 'Flagged for Analyst Review'
  },
  {
    id: 'alt-104',
    type: 'INFO',
    title: 'Trusted Voice Profile Verified',
    caller: '+91 94401 88721',
    callerName: 'Ananya Sharma',
    timestamp: 'Yesterday 21:15',
    riskScore: 12,
    confidence: 96.4,
    reason: 'Biometric voice match confirmed against registered 512-dim ECAPA-TDNN embedding.',
    read: true,
    resolved: true,
    action: 'Access Granted'
  }
];

export const INITIAL_TRUSTED_VOICES = [
  {
    id: 'tv-1',
    name: 'Ananya Sharma',
    relationship: 'Colleague / Business Partner',
    phone: '+91 94401 88721',
    status: 'ENROLLED',
    trustScore: 99,
    samplesEnrolled: 5,
    lastVerified: '2026-09-10 21:15',
    embeddingId: 'emb-usr-94401'
  },
  {
    id: 'tv-2',
    name: 'Rajesh Kumar (Father)',
    relationship: 'Immediate Family',
    phone: '+91 98480 11223',
    status: 'ENROLLED',
    trustScore: 98,
    samplesEnrolled: 8,
    lastVerified: '2026-09-08 19:30',
    embeddingId: 'emb-usr-98480'
  },
  {
    id: 'tv-3',
    name: 'Dr. Suresh Varma',
    relationship: 'Family Physician',
    phone: '+91 99890 33445',
    status: 'PENDING_VERIFICATION',
    trustScore: 82,
    samplesEnrolled: 2,
    lastVerified: '2026-09-02 11:20',
    embeddingId: 'emb-usr-99890'
  }
];

export const INITIAL_SETTINGS = {
  realTimeDetection: true,
  sensitivity: 'HIGH', // LOW, MEDIUM, HIGH
  riskThreshold: 70,
  autoAlertOnAi: true,
  monitorIncoming: true,
  monitorOutgoing: false,
  highRiskWarningModal: true,
  protectionMode: 'AUTO_DEFENSE', // NOTIFY_ONLY, PROMPT_USER, AUTO_DEFENSE
  independentVerificationMethod: 'OTP_AND_PHRASE', // OTP, PHRASE, OTP_AND_PHRASE
  criticalAlertsEnabled: true,
  soundAlerts: true,
  localProcessingOnly: true,
  audioRetentionHours: 24,
  anonymizeNumbers: false
};

export const INITIAL_ANALYTICS = {
  callsMonitored: 124,
  humanVerified: 98,
  aiDetected: 18,
  suspiciousCalls: 8,
  threatsPrevented: 26,
  modelAccuracy: '98.4%',
  precisionScore: '97.9%',
  recallScore: '99.1%',
  f1Score: '98.5%',
  avgDetectionLatencyMs: 42,
  trendData: [
    { day: 'Mon', human: 18, ai: 2, suspicious: 1 },
    { day: 'Tue', human: 22, ai: 4, suspicious: 2 },
    { day: 'Wed', human: 15, ai: 1, suspicious: 0 },
    { day: 'Thu', human: 26, ai: 5, suspicious: 3 },
    { day: 'Fri', human: 17, ai: 6, suspicious: 2 }
  ],
  riskDistribution: [
    { range: '0-30 (Low)', count: 98, color: '#10B981' },
    { range: '31-70 (Medium)', count: 8, color: '#F59E0B' },
    { range: '71-100 (High)', count: 18, color: '#EF4444' }
  ]
};

export const INITIAL_ACTIVE_CALLS = [
  {
    id: 'CALL-8092',
    callerId: '+91 98490 23145',
    callerName: 'Rajiv Mehta (Corporate VIP)',
    location: 'Mumbai, IN',
    language: 'Hindi - Maharashtra',
    durationSeconds: 84,
    context: 'Fund Transfer Verification ($120,000)',
    urgency: 'HIGH',
    riskScore: 92,
    threatLevel: 'CRITICAL',
    status: 'ACTIVE_SUSPICIOUS',
    waveformType: 'CLONE_ATTACK',
    aiConfidence: 96.8,
    similarityMatch: 95.4,
    artifacts: {
      phaseDiscontinuity: 94.2,
      highFreqCutoff: 88.5,
      spectralCombFiltering: 91.0
    },
    prosody: {
      neuralTtsRhythm: 89.4,
      unnaturalPitchContours: 92.1,
      microCadenceFlatness: 86.7
    },
    biometrics: {
      crossSessionMatch: 95.4,
      formantDispersionDelta: '14.2 Hz',
      embeddingDistance: 0.18
    },
    antiSpoof: {
      glottalAirflow: 18.5,
      respirationCadence: 22.0,
      livenessScore: 19.0
    },
    audioTelemetry: {
      sampleRate: '16000 Hz',
      codec: 'G.711u / SIP-TLS',
      bitrate: '64 kbps',
      jitterMs: '0.42 ms',
      packetLoss: '0.0%',
      spectralCentroid: '3,840 Hz'
    },
    transcript: "Yes, this is Rajiv Mehta. Please authorize the immediate RTGS transfer of 1 crore rupees to the vendor account in Singapore right now. It's urgent."
  },
  {
    id: 'CALL-8104',
    callerId: '+91 91234 56789',
    callerName: 'Priya Sharma',
    location: 'Bengaluru, IN',
    language: 'English - Indian Neutral',
    durationSeconds: 156,
    context: 'Standard Customer Service Inquiry',
    urgency: 'LOW',
    riskScore: 14,
    threatLevel: 'LOW',
    status: 'ACTIVE_CLEARED',
    waveformType: 'HUMAN_CLEARED',
    aiConfidence: 4.2,
    similarityMatch: 98.2,
    artifacts: {
      phaseDiscontinuity: 8.1,
      highFreqCutoff: 12.0,
      spectralCombFiltering: 5.4
    },
    prosody: {
      neuralTtsRhythm: 6.2,
      unnaturalPitchContours: 9.5,
      microCadenceFlatness: 11.0
    },
    biometrics: {
      crossSessionMatch: 98.2,
      formantDispersionDelta: '2.1 Hz',
      embeddingDistance: 0.08
    },
    antiSpoof: {
      glottalAirflow: 96.0,
      respirationCadence: 94.5,
      livenessScore: 97.2
    },
    audioTelemetry: {
      sampleRate: '48000 Hz',
      codec: 'WebRTC Opus HD',
      bitrate: '128 kbps',
      jitterMs: '0.18 ms',
      packetLoss: '0.0%',
      spectralCentroid: '1,920 Hz'
    },
    transcript: "Hi, I'm calling to inquire about the renewal date on my health insurance policy and update my mailing address."
  },
  {
    id: 'CALL-8117',
    callerId: '+1 (555) 839-2041',
    callerName: 'Unverified External SIP Trunk',
    location: 'London, UK',
    language: 'English - UK Corporate',
    durationSeconds: 42,
    context: 'VIP Account Password & MFA Reset',
    urgency: 'HIGH',
    riskScore: 64,
    threatLevel: 'MEDIUM',
    status: 'ACTIVE_ELEVATED',
    waveformType: 'HYBRID_SUSPICIOUS',
    aiConfidence: 68.5,
    similarityMatch: 42.0,
    artifacts: {
      phaseDiscontinuity: 62.0,
      highFreqCutoff: 71.5,
      spectralCombFiltering: 58.0
    },
    prosody: {
      neuralTtsRhythm: 65.0,
      unnaturalPitchContours: 59.2,
      microCadenceFlatness: 68.0
    },
    biometrics: {
      crossSessionMatch: 42.0,
      formantDispersionDelta: '45.0 Hz',
      embeddingDistance: 0.52
    },
    antiSpoof: {
      glottalAirflow: 54.0,
      respirationCadence: 49.0,
      livenessScore: 51.5
    },
    audioTelemetry: {
      sampleRate: '16000 Hz',
      codec: 'SIP G.729',
      bitrate: '32 kbps',
      jitterMs: '1.24 ms',
      packetLoss: '0.4%',
      spectralCentroid: '2,710 Hz'
    },
    transcript: "Good afternoon. I'm locked out of my corporate terminal and need my secondary authenticator bypassed for login."
  },
  {
    id: 'CALL-8129',
    callerId: '+91 94401 88721',
    callerName: 'Ananya Deshmukh',
    location: 'Pune, IN',
    language: 'Marathi / English',
    durationSeconds: 210,
    context: 'Commercial Invoice Verification ($45,000)',
    urgency: 'MEDIUM',
    riskScore: 18,
    threatLevel: 'LOW',
    status: 'ACTIVE_CLEARED',
    waveformType: 'HUMAN_CLEARED',
    aiConfidence: 5.8,
    similarityMatch: 97.5,
    artifacts: {
      phaseDiscontinuity: 11.0,
      highFreqCutoff: 14.5,
      spectralCombFiltering: 8.2
    },
    prosody: {
      neuralTtsRhythm: 9.0,
      unnaturalPitchContours: 12.1,
      microCadenceFlatness: 14.0
    },
    biometrics: {
      crossSessionMatch: 97.5,
      formantDispersionDelta: '3.4 Hz',
      embeddingDistance: 0.11
    },
    antiSpoof: {
      glottalAirflow: 93.5,
      respirationCadence: 91.0,
      livenessScore: 94.0
    },
    audioTelemetry: {
      sampleRate: '48000 Hz',
      codec: 'WebRTC Opus',
      bitrate: '96 kbps',
      jitterMs: '0.22 ms',
      packetLoss: '0.0%',
      spectralCentroid: '2,040 Hz'
    },
    transcript: "Checking in to confirm that the tax clearance certificate attached to invoice #8892 has been received."
  }
];

export const INITIAL_POLICY_RULES = {
  wireTransferThreshold: 65,
  credentialResetThreshold: 70,
  supportInquiryThreshold: 85,
  autoDisconnectThreshold: 90,
  highRiskAlertThreshold: 75,
  autoTriggerMFA: true,
  outOfBandCallback: true,
  vocoderPhaseScan: true,
  strictSpectralFilter: true,
  supervisorEscalation: true,
  silentListeningTelemetry: true
};

export const INITIAL_COMPLIANCE_DATA = {
  inferenceMode: 'EDGE', // 'EDGE' or 'CLOUD'
  ephemeralBuffer: true,
  autoScrubHours: 24,
  embeddingRetentionDays: 30,
  anonymizeVoiceprints: true,
  sha256AuditProof: '9f83ac58a8a3a0e692f87a8b4293f4ec130a84c2f8295b9d7e30d4a974b7e801',
  frameworks: [
    { 
      id: 'gdpr',
      name: 'GDPR Article 9 (Biometric Special Category Data)', 
      status: '100% COMPLIANT', 
      grade: 'PASS',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      details: 'Zero raw voice waveforms stored without explicit consent; only mathematical cosine vectors generated in volatile RAM.' 
    },
    { 
      id: 'rbi',
      name: 'RBI Cyber Security Framework for Financial Entities', 
      status: 'ACTIVE ENFORCEMENT', 
      grade: 'CERTIFIED',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      details: 'AES-256-GCM encryption at rest; TLS 1.3 SIP signaling; Mandatory out-of-band challenge integration for wire transfers.' 
    },
    { 
      id: 'iso',
      name: 'ISO/IEC 27001:2022 & SOC 2 Type II Telephony Controls', 
      status: 'VERIFIED AUDIT', 
      grade: 'AUDITED',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      details: 'Continuous automated intrusion monitoring of Session Border Controller (SBC) boundary feeds.' 
    },
    { 
      id: 'nist',
      name: 'NIST SP 800-63B Digital Identity & Liveness Authentication', 
      status: 'LEVEL AAL3', 
      grade: 'CONFORMING',
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      details: 'Physical glottal airflow respiration analysis protects against pre-recorded replay and synthetic injection attacks.' 
    }
  ]
};

export const INITIAL_AUDIT_LOG = [
  {
    incidentId: 'INC-2026-9042',
    timestamp: '2026-09-17 22:48:12',
    callerId: '+91 98490 23145',
    claimedIdentity: 'Rajiv Mehta (Corporate VIP)',
    callContext: 'Fund Transfer Verification ($120,000)',
    riskScore: 92,
    threatLevel: 'CRITICAL',
    verdict: 'AI VOICE CLONE (HiFi-GAN)',
    transcriptSnippet: 'Authorize immediate RTGS transfer of 1 crore rupees to Singapore account...',
    actionTaken: 'Terminated Call & Triggered Secondary Out-of-Band MFA',
    operator: 'Autonomous SOC Node 01'
  },
  {
    incidentId: 'INC-2026-8991',
    timestamp: '2026-09-17 21:15:04',
    callerId: '+91 94401 88721',
    claimedIdentity: 'Ananya Sharma (Colleague)',
    callContext: 'General Business Consultation',
    riskScore: 12,
    threatLevel: 'LOW',
    verdict: 'AUTHENTIC HUMAN VOICE',
    transcriptSnippet: 'Checking in on the financial summary report for Q3...',
    actionTaken: 'Allowed & Monitored in Background',
    operator: 'Autonomous SOC Node 01'
  },
  {
    incidentId: 'INC-2026-8854',
    timestamp: '2026-09-17 19:08:19',
    callerId: '+91 91210 55690',
    claimedIdentity: 'Telecom Offer Executive',
    callContext: 'SIM Card Swap Request',
    riskScore: 68,
    threatLevel: 'MEDIUM',
    verdict: 'SUSPICIOUS HYBRID SPEECH',
    transcriptSnippet: 'Need verification for urgent SIM card activation within 30 minutes...',
    actionTaken: 'Flagged & Escalated to Fraud Supervisor',
    operator: 'SOC Analyst Tier 1'
  },
  {
    incidentId: 'INC-2026-8740',
    timestamp: '2026-09-16 18:44:11',
    callerId: '+91 80081 22910',
    claimedIdentity: 'Alleged Law Enforcement Officer',
    callContext: 'Digital Arrest Threat / Extortion',
    riskScore: 96,
    threatLevel: 'CRITICAL',
    verdict: 'AI CLONE IMPERSONATION',
    transcriptSnippet: 'This is Crime Branch. Stay on the line or your bank accounts will be seized...',
    actionTaken: 'Emergency Disconnect & Reported to Cyber Crime Cell',
    operator: 'Autonomous Defense Engine'
  },
  {
    incidentId: 'INC-2026-8612',
    timestamp: '2026-09-16 14:12:05',
    callerId: '+1 (555) 349-2910',
    claimedIdentity: 'International Banking Desk',
    callContext: 'Foreign Exchange Wire Request',
    riskScore: 78,
    threatLevel: 'CRITICAL',
    verdict: 'SYNTHETIC TTS DETECTED',
    transcriptSnippet: 'Confirmation needed for $85,000 swift transaction to Swiss holding...',
    actionTaken: 'Terminated Call & Blocked Originating SIP Trunk',
    operator: 'Autonomous SOC Node 02'
  }
];

