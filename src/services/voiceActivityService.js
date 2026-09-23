/**
 * VoiceGuard AI - Voice Activity Detection (VAD) Service
 * Evaluates real-time audio frames to reliably detect speech vs background silence/noise.
 */

export class VoiceActivityService {
  constructor(options = {}) {
    this.speechRmsThreshold = options.speechRmsThreshold || 12; // 0-100 scale
    this.silenceTimeoutMs = options.silenceTimeoutMs || 1200; // time before voice considered paused
    this.requiredSpeechDurationSec = options.requiredSpeechDurationSec || 3.5; // minimum speech needed for analysis
    
    this.speechSeconds = 0;
    this.totalSeconds = 0;
    this.isSpeaking = false;
    this.lastSpeechTime = 0;
    this.historyFrames = [];
  }

  reset() {
    this.speechSeconds = 0;
    this.totalSeconds = 0;
    this.isSpeaking = false;
    this.lastSpeechTime = 0;
    this.historyFrames = [];
  }

  /**
   * Process a single audio tick from animation frame or interval
   * @param {number} currentRmsLevel - Audio level 0-100
   * @param {number} deltaSec - Time elapsed since last tick in seconds
   * @returns {Object} VAD evaluation state
   */
  processFrame(currentRmsLevel, deltaSec = 0.1) {
    this.totalSeconds += deltaSec;
    const now = Date.now();

    // Check if current energy crosses speech threshold
    const exceedsThreshold = currentRmsLevel >= this.speechRmsThreshold;

    if (exceedsThreshold) {
      this.isSpeaking = true;
      this.lastSpeechTime = now;
      this.speechSeconds += deltaSec;
    } else {
      // Check if within silence hangover period
      if (this.isSpeaking && (now - this.lastSpeechTime) > this.silenceTimeoutMs) {
        this.isSpeaking = false;
      }
    }

    const speechRatio = this.totalSeconds > 0 
      ? Math.round((this.speechSeconds / this.totalSeconds) * 100) 
      : 0;

    const hasSufficientSpeech = this.speechSeconds >= this.requiredSpeechDurationSec;

    return {
      isSpeaking: this.isSpeaking,
      speechSeconds: +(this.speechSeconds.toFixed(1)),
      totalSeconds: +(this.totalSeconds.toFixed(1)),
      speechRatio,
      hasSufficientSpeech,
      progressPercent: Math.min(100, Math.round((this.speechSeconds / this.requiredSpeechDurationSec) * 100))
    };
  }
}

export const voiceActivityService = new VoiceActivityService();
export default voiceActivityService;
