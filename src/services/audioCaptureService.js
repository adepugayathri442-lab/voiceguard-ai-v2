/**
 * VoiceGuard AI - Real Audio Capture Service
 * Manages browser microphone stream, Web Audio Context, AnalyserNode, and MediaRecorder.
 */

class AudioCaptureService {
  constructor() {
    this.audioContext = null;
    this.mediaStream = null;
    this.sourceNode = null;
    this.analyser = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
  }

  /**
   * Request microphone access and initialize audio graph
   */
  async startCapture() {
    this.cleanup();
    this.recordedChunks = [];

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('MICROPHONE_UNSUPPORTED');
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // Keep raw acoustic subtleties for forensic analysis
          autoGainControl: false,
          sampleRate: 44100
        },
        video: false
      });
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('MIC_PERMISSION_DENIED');
      }
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        throw new Error('MICROPHONE_UNAVAILABLE');
      }
      throw err;
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioCtx();
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.7;

    this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.sourceNode.connect(this.analyser);

    // Setup MediaRecorder for capturing audio blob
    let mimeType = 'audio/webm;codecs=opus';
    if (!MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else {
        mimeType = '';
      }
    }

    this.mediaRecorder = mimeType
      ? new MediaRecorder(this.mediaStream, { mimeType })
      : new MediaRecorder(this.mediaStream);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(100);
    this.isRecording = true;
    return true;
  }

  /**
   * Real-time Frequency Domain Data for spectrum visualization
   */
  getFrequencyData() {
    if (!this.analyser) return new Uint8Array(0);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  /**
   * Real-time Time Domain (Waveform) Data
   */
  getTimeDomainData() {
    if (!this.analyser) return new Uint8Array(0);
    const data = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(data);
    return data;
  }

  /**
   * Compute real-time RMS audio volume level (0 - 100)
   */
  getAudioLevel() {
    if (!this.analyser) return 0;
    const data = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(data);

    let sumSquares = 0;
    for (let i = 0; i < data.length; i++) {
      const normalized = (data[i] - 128) / 128;
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / data.length);
    // Scale RMS dynamically to 0-100 for UI meters
    const level = Math.min(100, Math.round(rms * 400));
    return level;
  }

  /**
   * Stop recording and return the captured audio blob and preview URL
   */
  async stopCapture() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.cleanup();
        resolve({ audioBlob: null, audioUrl: null });
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mime = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.recordedChunks, { type: mime });
        const url = URL.createObjectURL(blob);
        this.cleanup();
        resolve({ audioBlob: blob, audioUrl: url });
      };

      try {
        this.mediaRecorder.stop();
      } catch {
        this.cleanup();
        resolve({ audioBlob: null, audioUrl: null });
      }
    });
  }

  /**
   * Tear down all audio tracks, context, and nodes safely
   */
  cleanup() {
    this.isRecording = false;
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.sourceNode) {
      try { this.sourceNode.disconnect(); } catch {}
      this.sourceNode = null;
    }
    if (this.analyser) {
      try { this.analyser.disconnect(); } catch {}
      this.analyser = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try { this.audioContext.close(); } catch {}
      this.audioContext = null;
    }
    this.mediaRecorder = null;
  }
}

export const audioCaptureService = new AudioCaptureService();
export default audioCaptureService;
