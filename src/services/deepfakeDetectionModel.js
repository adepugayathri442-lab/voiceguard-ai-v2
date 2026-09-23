/**
 * VoiceGuard AI - Deepfake Speech Model Inference Client
 * Connects directly to the real Python inference service (ASVspoof-LCNN-v2).
 * Sends raw audio bytes and processes genuine model logits/probabilities.
 * 
 * STRICT COMPLIANCE:
 * - NO fake HUMAN fallbacks on error.
 * - If model is unavailable -> returns MODEL_UNAVAILABLE.
 * - Supports: AI_GENERATED, HUMAN, UNCERTAIN, INSUFFICIENT_AUDIO, MODEL_UNAVAILABLE.
 */

const DEFAULT_API_URL = import.meta.env?.VITE_ML_API_URL || 'http://127.0.0.1:8000';

export class DeepfakeDetectionModel {
  constructor() {
    this.apiUrl = DEFAULT_API_URL;
    this.lastHealthCheck = null;
  }

  /**
   * Check connection status of the real AI detection model backend
   * @returns {Promise<Object>} { isOnline: boolean, status: string, model: string }
   */
  async checkHealth() {
    try {
      // Always query the real ML backend directly.
      const res = await fetch(`${this.apiUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });

      if (res && res.ok) {
        const data = await res.json();
        this.lastHealthCheck = {
          isOnline: true,
          status: 'CONNECTED',
          model: data.model || 'Pellav2 Audio Deepfake Detector',
          version: data.version || 'Pellav2'
        };
        return this.lastHealthCheck;
      }
    } catch (e) {
      // Offline
    }

    this.lastHealthCheck = {
      isOnline: false,
      status: 'OFFLINE',
      model: 'Pellav2 Audio Deepfake Detector',
      version: 'Pellav2'
    };
    return this.lastHealthCheck;
  }

  /**
   * Send real audio bytes to the AI deepfake voice detection model
   * @param {Blob} wavBlob Standardized 16kHz mono WAV Blob containing real audio samples
   * @param {Object} metadata File metadata for forensic audit logging
   * @returns {Promise<Object>} Structured model prediction
   */
  async predictAudioBytes(wavBlob, metadata = {}) {
    const startTime = performance.now();
    const filename = metadata.name || 'recorded_speech.wav';
    const duration = metadata.duration || 0;
    const sampleRate = metadata.sampleRate || 16000;
    const byteSize = wavBlob.size || 0;

    // STEP 12: CRITICAL DEBUG LOGGING (Client Side)
    console.group('[VoiceGuard AI Engine] Audio Submission to Detection Model');
    console.log('• Audio Filename:    ', filename);
    console.log('• Audio Duration:    ', `${duration.toFixed(2)}s`);
    console.log('• Audio Format:      ', wavBlob.type || 'audio/wav');
    console.log('• Sample Rate:       ', `${sampleRate} Hz`);
    console.log('• Channels:          ', 1, '(Mono Standardized)');
    console.log('• Actual Byte Size:  ', `${byteSize} bytes`);
    console.log('• Model Target URL:  ', `${this.apiUrl}/api/detect-voice`);
    const requestBody = wavBlob;

    try {
      // Always send directly to the real Pellav2 ML backend.
      const res = await fetch(`${this.apiUrl}/api/detect-voice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'audio/wav'
        },
        body: requestBody,
        signal: AbortSignal.timeout(15000)
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      const modelData = await res.json();
      const clientLatency = +(performance.now() - startTime).toFixed(1);

      console.log('• Model Response:    ', modelData);
      console.log('• Classification:    ', modelData.classification);
      console.log('• AI Probability:    ', modelData.aiProbability);
      console.log('• Human Probability: ', modelData.humanProbability);
      console.log('• Confidence:        ', modelData.confidence);
      console.log('• Total Client Latency:', `${clientLatency}ms`);
      console.groupEnd();

      return {
        ...modelData,
        status: 'CONNECTED',
        clientLatencyMs: clientLatency
      };

    } catch (err) {
      console.warn('[VoiceGuard AI] Real model inference failed or backend offline:', err.message);
      console.groupEnd();

      // STEP 13: REMOVE FALLBACK BUG
      // NEVER silently fall back to HUMAN on error!
      return {
        classification: 'MODEL_UNAVAILABLE',
        aiProbability: 0.0,
        humanProbability: 0.0,
        confidence: 0.0,
        status: 'OFFLINE',
        error: err.message,
        modelName: 'Pellav2 Audio Deepfake Detector',
        modelVersion: 'Pellav2',
        reason: `AI DETECTION UNAVAILABLE — Backend inference model is offline or unreachable (${err.message}). Start the inference service using 'python server.py'.`,
        signals: [{
          id: 'MODEL_OFFLINE',
          title: 'Model Backend Offline',
          category: 'System Telemetry',
          status: 'WARNING',
          direction: 'NEUTRAL',
          measuredValue: 'Connection Refused',
          weight: 0,
          explanation: 'The deepfake neural network is offline. Heuristic audio analysis may proceed, but deepfake detection is not certified.'
        }]
      };
    }
  }
}

export const deepfakeDetectionModel = new DeepfakeDetectionModel();
export default deepfakeDetectionModel;
