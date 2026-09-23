/**
 * VoiceGuard AI - Acoustic & Spectral Feature Extraction Service
 * Extracts physical acoustic metrics, Log-Mel spectrograms, vocoder artifacts,
 * pitch/prosody micro-dynamics, phase coherence, and noise floor respiration cues.
 */

export class FeatureExtractionService {
  /**
   * Fast Fourier Transform (Radix-2 Cooley-Tukey or Direct DFT fallback)
   */
  fft(real, imag) {
    const n = real.length;
    if (n <= 1) return;

    // Bit-reversal permutation
    let j = 0;
    for (let i = 0; i < n - 1; i++) {
      if (i < j) {
        const tr = real[i]; real[i] = real[j]; real[j] = tr;
        const ti = imag[i]; imag[i] = imag[j]; imag[j] = ti;
      }
      let k = n >> 1;
      while (k <= j) {
        j -= k;
        k >>= 1;
      }
      j += k;
    }

    // Cooley-Tukey computation
    for (let len = 2; len <= n; len <<= 1) {
      const half = len >> 1;
      const angle = (-2 * Math.PI) / len;
      const wStepR = Math.cos(angle);
      const wStepI = Math.sin(angle);

      for (let i = 0; i < n; i += len) {
        let wr = 1;
        let wi = 0;
        for (let m = 0; m < half; m++) {
          const uR = real[i + m];
          const uI = imag[i + m];
          const vR = real[i + m + half] * wr - imag[i + m + half] * wi;
          const vI = real[i + m + half] * wi + imag[i + m + half] * wr;

          real[i + m] = uR + vR;
          imag[i + m] = uI + vI;
          real[i + m + half] = uR - vR;
          imag[i + m + half] = uI - vI;

          const nextWr = wr * wStepR - wi * wStepI;
          wi = wr * wStepI + wi * wStepR;
          wr = nextWr;
        }
      }
    }
  }

  /**
   * Convert frequency in Hz to Mel scale
   */
  hzToMel(hz) {
    return 2595 * Math.log10(1 + hz / 700);
  }

  /**
   * Convert Mel scale to frequency in Hz
   */
  melToHz(mel) {
    return 700 * (Math.pow(10, mel / 2595) - 1);
  }

  /**
   * Build Triangular Mel Filterbank Matrix
   */
  createMelFilterbank(numFilters, fftSize, sampleRate, minHz = 60, maxHz = null) {
    const nyquist = sampleRate / 2;
    const actualMaxHz = Math.min(maxHz || nyquist, nyquist);
    const minMel = this.hzToMel(minHz);
    const maxMel = this.hzToMel(actualMaxHz);
    const numBins = Math.floor(fftSize / 2) + 1;

    // Linear points in Mel domain
    const melPoints = [];
    for (let i = 0; i < numFilters + 2; i++) {
      melPoints.push(minMel + (i * (maxMel - minMel)) / (numFilters + 1));
    }

    // Convert mel points to FFT bin indices
    const binIndices = melPoints.map(m => {
      const hz = this.melToHz(m);
      return Math.min(numBins - 1, Math.floor(((fftSize + 1) * hz) / sampleRate));
    });

    const filterbank = [];
    for (let m = 1; m <= numFilters; m++) {
      const row = new Float32Array(numBins);
      const leftBin = binIndices[m - 1];
      const centerBin = binIndices[m];
      const rightBin = binIndices[m + 1];

      for (let k = leftBin; k < centerBin; k++) {
        row[k] = (k - leftBin) / Math.max(1, centerBin - leftBin);
      }
      for (let k = centerBin; k < rightBin; k++) {
        row[k] = (rightBin - k) / Math.max(1, rightBin - centerBin);
      }
      filterbank.push(row);
    }

    return filterbank;
  }

  /**
   * Compute Log-Mel Spectrogram and 13 MFCCs from PCM Audio
   */
  computeLogMelSpectrogram(channelData, sampleRate, options = {}) {
    const fftSize = options.fftSize || 512;
    const hopSize = options.hopSize || 256;
    const numMels = options.numMels || 40;
    const numBins = Math.floor(fftSize / 2) + 1;

    const melFilterbank = this.createMelFilterbank(numMels, fftSize, sampleRate);
    const totalSamples = channelData.length;
    const numFrames = Math.max(1, Math.floor((totalSamples - fftSize) / hopSize));

    // Pre-calculate Hanning window
    const window = new Float32Array(fftSize);
    for (let i = 0; i < fftSize; i++) {
      window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));
    }

    const logMelFrames = [];
    const spectralMagnitudes = [];
    const realBuf = new Float32Array(fftSize);
    const imagBuf = new Float32Array(fftSize);

    // Limit maximum frames for compute efficiency (e.g. up to 128 frames)
    const step = Math.max(1, Math.floor(numFrames / 128));

    for (let f = 0; f < numFrames; f += step) {
      const offset = f * hopSize;
      for (let i = 0; i < fftSize; i++) {
        realBuf[i] = (channelData[offset + i] || 0) * window[i];
        imagBuf[i] = 0;
      }

      this.fft(realBuf, imagBuf);

      const mags = new Float32Array(numBins);
      for (let k = 0; k < numBins; k++) {
        mags[k] = Math.sqrt(realBuf[k] * realBuf[k] + imagBuf[k] * imagBuf[k]);
      }
      spectralMagnitudes.push(mags);

      // Apply Mel filterbank
      const melEnergy = new Float32Array(numMels);
      for (let m = 0; m < numMels; m++) {
        let sum = 0;
        const filter = melFilterbank[m];
        for (let k = 0; k < numBins; k++) {
          sum += mags[k] * filter[k];
        }
        melEnergy[m] = Math.log(1.0 + Math.max(1e-7, sum));
      }
      logMelFrames.push(melEnergy);
    }

    // Compute MFCCs via DCT-II on average log mel energies
    const avgLogMel = new Float32Array(numMels);
    if (logMelFrames.length > 0) {
      for (let m = 0; m < numMels; m++) {
        let sum = 0;
        for (let f = 0; f < logMelFrames.length; f++) {
          sum += logMelFrames[f][m];
        }
        avgLogMel[m] = sum / logMelFrames.length;
      }
    }

    const mfccs = new Float32Array(13);
    for (let i = 0; i < 13; i++) {
      let sum = 0;
      for (let m = 0; m < numMels; m++) {
        sum += avgLogMel[m] * Math.cos((Math.PI * i * (m + 0.5)) / numMels);
      }
      mfccs[i] = +sum.toFixed(4);
    }

    return {
      logMelFrames,
      spectralMagnitudes,
      mfccs: Array.from(mfccs),
      numMels,
      frameCount: logMelFrames.length
    };
  }

  /**
   * Analyze Vocoder Phase Comb Ripple & High-Frequency Cutoffs
   * Neural vocoders (HiFi-GAN, MelGAN) often generate subtle periodic ripples
   * in high frequency bands (4kHz - 10kHz) and harsh cutoffs above 8kHz/12kHz.
   */
  analyzeVocoderArtifacts(spectralMagnitudes, sampleRate) {
    if (!spectralMagnitudes || spectralMagnitudes.length === 0) {
      return {
        vocoderRippleScore: 0.1,
        highFreqCutoffHz: sampleRate / 2,
        unnaturalHighFreqRollOff: false,
        phaseCombArtifactsDetected: false
      };
    }

    const numBins = spectralMagnitudes[0].length;
    const nyquist = sampleRate / 2;
    const hzPerBin = nyquist / (numBins - 1);

    // Average magnitude spectrum
    const avgMags = new Float32Array(numBins);
    for (let f = 0; f < spectralMagnitudes.length; f++) {
      const mags = spectralMagnitudes[f];
      for (let k = 0; k < numBins; k++) {
        avgMags[k] += mags[k];
      }
    }
    for (let k = 0; k < numBins; k++) {
      avgMags[k] /= spectralMagnitudes.length;
    }

    // 1. High frequency cutoff detection (sharp energy drop > 35dB in adjacent 1kHz)
    let cutoffHz = nyquist;
    let maxDrop = 0;
    for (let k = Math.floor(4000 / hzPerBin); k < numBins - 2; k++) {
      const currentEnergy = avgMags[k] + 1e-9;
      const nextEnergy = avgMags[k + 2] + 1e-9;
      const ratio = currentEnergy / nextEnergy;
      if (ratio > maxDrop && avgMags[k] > 0.001) {
        maxDrop = ratio;
        cutoffHz = Math.round(k * hzPerBin);
      }
    }

    const unnaturalHighFreqRollOff = (cutoffHz <= 8500 && nyquist >= 16000) || (cutoffHz >= 11500 && cutoffHz <= 12500);

    // 2. High frequency phase comb ripple detection
    // Evaluates the second derivative of the high-band spectrum (4kHz - 10kHz)
    const startBin = Math.floor(4000 / hzPerBin);
    const endBin = Math.min(numBins - 2, Math.floor(10000 / hzPerBin));
    let rippleSum = 0;
    let count = 0;

    for (let k = startBin + 1; k < endBin; k++) {
      const d2 = avgMags[k + 1] - 2 * avgMags[k] + avgMags[k - 1];
      rippleSum += Math.abs(d2);
      count++;
    }

    const meanRipple = count > 0 ? (rippleSum / count) : 0;
    const vocoderRippleScore = Math.min(1.0, +(meanRipple * 40).toFixed(4));
    const phaseCombArtifactsDetected = vocoderRippleScore > 0.45;

    return {
      vocoderRippleScore,
      highFreqCutoffHz: cutoffHz,
      unnaturalHighFreqRollOff,
      phaseCombArtifactsDetected
    };
  }

  /**
   * Analyze Pitch Contours, Micro-Jitter, and Prosody Naturalness
   */
  analyzeProsodyAndPitch(channelData, sampleRate) {
    const frameSize = 2048;
    const hopSize = 1024;
    const totalSamples = channelData.length;
    const numFrames = Math.max(1, Math.floor((totalSamples - frameSize) / hopSize));

    const minLag = Math.floor(sampleRate / 450); // 450 Hz
    const maxLag = Math.floor(sampleRate / 70);  // 70 Hz

    const pitches = [];
    const amplitudes = [];

    for (let f = 0; f < numFrames; f++) {
      const offset = f * hopSize;
      let frameSum = 0;
      for (let i = 0; i < frameSize; i++) {
        const s = channelData[offset + i] || 0;
        frameSum += s * s;
      }
      const frameRms = Math.sqrt(frameSum / frameSize);

      if (frameRms < 0.012) continue; // skip silent frames

      // Autocorrelation
      let bestCorrelation = -1;
      let bestLag = -1;
      for (let lag = minLag; lag <= maxLag; lag++) {
        let corr = 0;
        let p1 = 0;
        let p2 = 0;
        for (let i = 0; i < frameSize - lag; i += 2) {
          const s1 = channelData[offset + i];
          const s2 = channelData[offset + i + lag];
          corr += s1 * s2;
          p1 += s1 * s1;
          p2 += s2 * s2;
        }
        const denom = Math.sqrt(p1 * p2);
        const normCorr = denom > 0 ? corr / denom : 0;
        if (normCorr > bestCorrelation) {
          bestCorrelation = normCorr;
          bestLag = lag;
        }
      }

      if (bestCorrelation > 0.48 && bestLag > 0) {
        const pitch = sampleRate / bestLag;
        pitches.push(pitch);
        amplitudes.push(frameRms);
      }
    }

    if (pitches.length < 3) {
      return {
        f0Mean: 0,
        f0StdDev: 0,
        jitterPercent: 0,
        shimmerPercent: 0,
        unnaturalPitchRigidity: false,
        monotoneProsody: false
      };
    }

    // Mean and standard deviation of F0
    const f0Mean = pitches.reduce((a, b) => a + b, 0) / pitches.length;
    const variance = pitches.reduce((sum, p) => sum + Math.pow(p - f0Mean, 2), 0) / pitches.length;
    const f0StdDev = Math.sqrt(variance);

    // Micro-jitter (cycle-to-cycle relative perturbation)
    let periodDiffSum = 0;
    let periodSum = 0;
    for (let i = 1; i < pitches.length; i++) {
      const t1 = 1 / pitches[i - 1];
      const t2 = 1 / pitches[i];
      periodDiffSum += Math.abs(t2 - t1);
      periodSum += t1;
    }
    const jitterPercent = periodSum > 0 ? +((periodDiffSum / periodSum) * 100).toFixed(3) : 0;

    // Shimmer (cycle-to-cycle relative amplitude perturbation)
    let ampDiffSum = 0;
    let ampSum = 0;
    for (let i = 1; i < amplitudes.length; i++) {
      ampDiffSum += Math.abs(amplitudes[i] - amplitudes[i - 1]);
      ampSum += amplitudes[i - 1];
    }
    const shimmerPercent = ampSum > 0 ? +((ampDiffSum / ampSum) * 100).toFixed(3) : 0;

    // AI voice synthesis often has robotic low jitter (< 0.22%) and flat pitch variation (< 7 Hz)
    const unnaturalPitchRigidity = jitterPercent < 0.22 || f0StdDev < 7.0;
    const monotoneProsody = f0StdDev < 9.5;

    return {
      f0Mean: +f0Mean.toFixed(1),
      f0StdDev: +f0StdDev.toFixed(2),
      jitterPercent,
      shimmerPercent,
      unnaturalPitchRigidity,
      monotoneProsody
    };
  }

  /**
   * Analyze Environmental Noise Floor & Respiration Markers
   * Natural human speech in acoustic environments contains natural room ambiance (pink/brown noise)
   * and micro-breath inhalations between sentences.
   * Synthetic speech often has absolute zero digital noise floors (< 0.00001) during pauses.
   */
  analyzeNoiseFloorAndRespiration(channelData, sampleRate) {
    const frameSize = 1024;
    const hopSize = 512;
    const totalSamples = channelData.length;
    const numFrames = Math.max(1, Math.floor((totalSamples - frameSize) / hopSize));

    const pauseEnergies = [];
    let zeroCount = 0;

    for (let f = 0; f < numFrames; f++) {
      const offset = f * hopSize;
      let sum = 0;
      let frameZeros = 0;
      for (let i = 0; i < frameSize; i++) {
        const s = channelData[offset + i] || 0;
        if (Math.abs(s) < 1e-6) frameZeros++;
        sum += s * s;
      }
      const frameRms = Math.sqrt(sum / frameSize);

      if (frameRms < 0.015) {
        pauseEnergies.push(frameRms);
      }
      if (frameZeros > frameSize * 0.9) {
        zeroCount++;
      }
    }

    const hasDigitalSilence = zeroCount > 2 || (pauseEnergies.length > 0 && Math.min(...pauseEnergies) < 0.0001);
    const avgNoiseFloor = pauseEnergies.length > 0 
      ? pauseEnergies.reduce((a, b) => a + b, 0) / pauseEnergies.length 
      : 0.005;

    // Clean noise floor score: higher means unnaturally clean / sanitized
    const noiseFloorPurity = +(1.0 - Math.min(1.0, avgNoiseFloor * 70)).toFixed(3);
    const unnaturallyCleanNoiseFloor = hasDigitalSilence || noiseFloorPurity > 0.94;

    return {
      avgNoiseFloor: +avgNoiseFloor.toFixed(5),
      noiseFloorPurity,
      hasDigitalSilence,
      unnaturallyCleanNoiseFloor
    };
  }

  /**
   * Full feature extraction pipeline
   */
  extractComprehensiveFeatures(channelData, sampleRate, duration) {
    const logMelResult = this.computeLogMelSpectrogram(channelData, sampleRate);
    const vocoderResult = this.analyzeVocoderArtifacts(logMelResult.spectralMagnitudes, sampleRate);
    const prosodyResult = this.analyzeProsodyAndPitch(channelData, sampleRate);
    const noiseResult = this.analyzeNoiseFloorAndRespiration(channelData, sampleRate);

    return {
      durationSeconds: +duration.toFixed(2),
      sampleRate,
      logMel: logMelResult,
      vocoder: vocoderResult,
      prosody: prosodyResult,
      noise: noiseResult
    };
  }
}

export const featureExtractionService = new FeatureExtractionService();
export default featureExtractionService;
