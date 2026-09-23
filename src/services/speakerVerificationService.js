/**
 * VoiceGuard AI - Speaker Biometric Verification Service
 * Compares extracted acoustic features against enrolled trusted voice profiles.
 */

export class SpeakerVerificationService {
  /**
   * Verify audio features against an enrolled voice profile
   * @param {Object} currentFeatures - Extracted features of current audio
   * @param {Object|null} enrolledProfile - Stored reference profile
   * @returns {Object} Verification outcome
   */
  verifySpeaker(currentFeatures, enrolledProfile = null) {
    if (!enrolledProfile) {
      return {
        hasEnrolledProfile: false,
        matchPercentage: null,
        status: 'UNKNOWN_SPEAKER',
        label: 'NO TRUSTED PROFILE ENROLLED',
        similarityConfidence: 'LOW',
        distance: null,
        details: 'No reference voice profile enrolled in the local biometric vault.'
      };
    }

    const basePitch = enrolledProfile.fundamentalPitchHz || enrolledProfile.baselinePitchHz || 135;
    const currentPitch = currentFeatures.fundamentalPitchHz || 135;
    const pitchDelta = Math.abs(currentPitch - basePitch) / Math.max(1, basePitch);

    const baseCentroid = enrolledProfile.spectralCentroidHz || enrolledProfile.formantDispersionHz || 2200;
    const currentCentroid = currentFeatures.spectralCentroidHz || 2200;
    const centroidDelta = Math.abs(currentCentroid - baseCentroid) / Math.max(1, baseCentroid);

    // MFCC filterbank cosine similarity if available
    let mfccCosine = 0.85;
    if (currentFeatures.mfccBands && enrolledProfile.mfccBands && enrolledProfile.mfccBands.length === currentFeatures.mfccBands.length) {
      let dot = 0;
      let magA = 0;
      let magB = 0;
      for (let i = 0; i < currentFeatures.mfccBands.length; i++) {
        const a = currentFeatures.mfccBands[i];
        const b = enrolledProfile.mfccBands[i];
        dot += a * b;
        magA += a * a;
        magB += b * b;
      }
      const denom = Math.sqrt(magA * magB);
      mfccCosine = denom > 0 ? Math.max(0, Math.min(1, dot / denom)) : 0.8;
    }

    // Weighted similarity calculation:
    // 40% Pitch F0 match, 30% Spectral Centroid match, 30% Filterbank Cosine
    const pitchMatch = Math.max(0, 100 - pitchDelta * 200);
    const centroidMatch = Math.max(0, 100 - centroidDelta * 150);
    const filterbankMatch = mfccCosine * 100;

    const combinedScore = Math.round(pitchMatch * 0.4 + centroidMatch * 0.3 + filterbankMatch * 0.3);
    const matchPercentage = Math.max(5, Math.min(99, combinedScore));

    let status = 'UNKNOWN_SPEAKER';
    let label = 'POSSIBLE IMPERSONATION / UNKNOWN SPEAKER';

    if (matchPercentage >= 78) {
      status = 'TRUSTED_VOICE';
      label = 'TRUSTED VOICE MATCH';
    } else if (matchPercentage >= 55) {
      status = 'MODERATE_MATCH';
      label = 'BORDERLINE SPEAKER SIMILARITY';
    } else {
      status = 'UNKNOWN_SPEAKER';
      label = 'UNKNOWN SPEAKER / LOW MATCH';
    }

    return {
      hasEnrolledProfile: true,
      matchPercentage,
      status,
      label,
      profileName: enrolledProfile.name || 'Primary Registered User',
      enrolledId: enrolledProfile.id || enrolledProfile.voiceFingerprintId,
      pitchDeltaPercent: +(pitchDelta * 100).toFixed(1),
      centroidDeltaPercent: +(centroidDelta * 100).toFixed(1),
      details: matchPercentage >= 78
        ? `Acoustic match confirmed (${matchPercentage}% similarity). Pitch F0 (${currentPitch}Hz) and vocal timbre align with enrolled profile.`
        : `Vocal biometric parameters diverge from enrolled profile (${matchPercentage}% similarity). Pitch delta: +${(pitchDelta * 100).toFixed(1)}%.`
    };
  }
}

export const speakerVerificationService = new SpeakerVerificationService();
export default speakerVerificationService;
