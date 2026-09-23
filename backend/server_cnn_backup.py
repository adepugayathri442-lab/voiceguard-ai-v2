#!/usr/bin/env python3
"""
VoiceGuard AI - Local Speech Anti-Spoofing & Deepfake Voice Inference Service
Architecture: ASVspoof Glottal Dynamics & Spectral Anti-Spoofing Classifier
Processes real raw audio bytes via POST /api/detect-voice.
"""

import sys
import os
import io
import time
import json
import math
import struct
import wave
from http.server import HTTPServer, BaseHTTPRequestHandler
import numpy as np
from cnn_inference import voiceguard_cnn

PORT = 8000
MODEL_NAME = "VoiceGuard CNN"
MODEL_VERSION = "1.0.0"

class AudioProcessor:
    @staticmethod
    def parse_wav_bytes(audio_bytes):
        """Parse raw WAV bytes into float32 numpy array and sample rate"""
        try:
            with io.BytesIO(audio_bytes) as bio:
                with wave.open(bio, 'rb') as wf:
                    channels = wf.getnchannels()
                    sampwidth = wf.getsampwidth()
                    framerate = wf.getframerate()
                    nframes = wf.getnframes()
                    raw_data = wf.readframes(nframes)

                    if sampwidth == 2:
                        samples = np.frombuffer(raw_data, dtype=np.int16).astype(np.float32) / 32768.0
                    elif sampwidth == 1:
                        samples = (np.frombuffer(raw_data, dtype=np.uint8).astype(np.float32) - 128.0) / 128.0
                    elif sampwidth == 4:
                        samples = np.frombuffer(raw_data, dtype=np.int32).astype(np.float32) / 2147483648.0
                    else:
                        samples = np.frombuffer(raw_data, dtype=np.float32)

                    # If stereo/multi-channel, take channel 0
                    if channels > 1:
                        samples = samples[::channels]

                    return samples, framerate, channels, nframes
        except Exception as e:
            # Fallback for raw PCM with RIFF header
            if len(audio_bytes) >= 44 and audio_bytes[:4] == b'RIFF':
                pcm_data = audio_bytes[44:]
                samples = np.frombuffer(pcm_data, dtype=np.int16).astype(np.float32) / 32768.0
                return samples, 16000, 1, len(samples)
            raise ValueError(f"Unable to parse WAV container: {e}")

    @staticmethod
    def resample_to_16k(samples, src_rate):
        """Resample audio signal to standard 16,000 Hz if necessary"""
        if src_rate == 16000 or len(samples) == 0:
            return samples
        target_len = int(len(samples) * 16000 / src_rate)
        indices = np.linspace(0, len(samples) - 1, target_len)
        return np.interp(indices, np.arange(len(samples)), samples).astype(np.float32)

    @staticmethod
    def extract_deepfake_signatures(samples, sample_rate=16000):
        """
        Extract physical acoustic deepfake indicators:
        1. Digital Silence: Exact 0.0s inserted between phonemes in synthetic speech
        2. Glottal Residual Impulsiveness: Human vocal fold closure produces high peak-to-RMS & kurtosis
        3. Micro-Jitter: Cycle-to-cycle pitch instability of human vocal folds (0.3% - 1.8%)
        """
        # 1. Digital silence detection
        zero_ratio = float(np.count_nonzero(samples == 0.0) / max(1, len(samples)))
        win_size = 512
        win_rmss = [float(np.sqrt(np.mean(samples[i:i+win_size]**2))) for i in range(0, len(samples)-win_size, win_size)]
        min_pause_rms = float(min(win_rmss)) if win_rmss else 0.0
        has_digital_silence = bool(zero_ratio > 0.05 or min_pause_rms < 1e-5)

        # 2. LPC Glottal Residual on steady voiced segments
        frame_len = 2048
        voiced_chunks = []
        for i in range(0, len(samples) - frame_len, frame_len):
            chunk = samples[i:i+frame_len]
            r = np.sqrt(np.mean(chunk**2))
            if r > 0.02 and np.min(np.abs(chunk)) > 1e-6:
                voiced_chunks.append(chunk)
                if len(voiced_chunks) >= 3:
                    break

        if voiced_chunks:
            seg = np.concatenate(voiced_chunks)
            order = 14
            corr = np.correlate(seg, seg, mode='full')[len(seg)-1:len(seg)+order]
            a = np.zeros(order + 1)
            a[0] = 1.0
            e = corr[0]
            for i in range(1, order + 1):
                k = -np.sum(a[:i] * corr[i:0:-1]) / e
                a[1:i+1] += k * a[i-1::-1]
                a[i] = k
                e *= (1.0 - k * k)
                if e <= 0:
                    break
            res = np.convolve(seg, a, mode='same')
            rms_res = float(np.sqrt(np.mean(res**2))) + 1e-9
            peak_res = float(np.max(np.abs(res)))
            peak_to_rms = float(peak_res / rms_res)
            kurtosis = float(np.mean(res**4) / (rms_res**4))
        else:
            peak_to_rms = 2.0
            kurtosis = 3.0

        is_glottal_impulsive = bool(peak_to_rms >= 4.8 and kurtosis >= 15.0)

        # 3. Micro-Jitter (Period Perturbation)
        # Autocorrelation pitch extraction
        min_lag = int(sample_rate / 400) # 400 Hz
        max_lag = int(sample_rate / 70)  # 70 Hz
        pitches = []
        for i in range(0, len(samples) - 1024, 512):
            frame = samples[i:i+1024]
            if np.sqrt(np.mean(frame**2)) < 0.02:
                continue
            corr = np.correlate(frame, frame, mode='full')[1023:]
            if len(corr) > max_lag:
                best_lag = min_lag + np.argmax(corr[min_lag:max_lag])
                if corr[best_lag] > 0.4 * corr[0]:
                    pitches.append(sample_rate / best_lag)

        if len(pitches) >= 3:
            diffs = np.abs(np.diff(1.0 / np.array(pitches)))
            mean_period = np.mean(1.0 / np.array(pitches))
            jitter_pct = float((np.mean(diffs) / (mean_period + 1e-9)) * 100.0)
        else:
            jitter_pct = 0.5

        return {
            "has_digital_silence": has_digital_silence,
            "zero_ratio": round(zero_ratio, 4),
            "min_pause_rms": round(min_pause_rms, 6),
            "glottal_peak_to_rms": round(peak_to_rms, 2),
            "glottal_kurtosis": round(kurtosis, 2),
            "is_glottal_impulsive": is_glottal_impulsive,
            "jitter_percent": round(jitter_pct, 3)
        }


def run_inference(samples, sample_rate, duration, byte_size):
    """Run inference using the trained VoiceGuard CNN."""
    start_time = time.time()

    # Check for insufficient audio
    rms_total = float(np.sqrt(np.mean(samples ** 2))) if len(samples) > 0 else 0.0

    if duration < 1.0 or rms_total < 0.003:
        return {
            "classification": "INSUFFICIENT_AUDIO",
            "aiProbability": 0.0,
            "humanProbability": 0.0,
            "confidence": 0.0,
            "modelName": MODEL_NAME,
            "modelVersion": MODEL_VERSION,
            "inferenceTimeMs": round((time.time() - start_time) * 1000, 1),
            "reason": "Audio duration is under 1.0 second or contains no audible vocal speech.",
            "signals": [],
            "audioMetadata": {
                "duration": round(duration, 2),
                "sampleRate": sample_rate,
                "channels": 1,
                "byteSize": byte_size,
                "rmsEnergy": round(rms_total, 5)
            }
        }

    # Resample to 16 kHz
    audio_16k = AudioProcessor.resample_to_16k(samples, sample_rate)

    # Convert NumPy audio to WAV bytes for the CNN
    wav_buffer = io.BytesIO()
    clipped = np.clip(audio_16k, -1.0, 1.0)
    pcm16 = (clipped * 32767.0).astype(np.int16)

    with wave.open(wav_buffer, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(16000)
        wf.writeframes(pcm16.tobytes())

    wav_bytes = wav_buffer.getvalue()

    # ACTUAL trained VoiceGuard CNN inference
    cnn_result = voiceguard_cnn.predict(wav_bytes)

    inference_ms = round((time.time() - start_time) * 1000, 1)

    signals = [
        {
            "id": "VOICEGUARD_CNN",
            "title": "VoiceGuard CNN Deepfake Classifier",
            "category": "AI Voice Detection",
            "status": (
                "ANOMALOUS"
                if cnn_result["classification"] == "AI_GENERATED"
                else "NORMAL"
            ),
            "direction": (
                "INDICATES_AI"
                if cnn_result["classification"] == "AI_GENERATED"
                else "INDICATES_HUMAN"
            ),
            "measuredValue": (
                f"AI: {cnn_result['aiProbability'] * 100:.2f}% | "
                f"Human: {cnn_result['humanProbability'] * 100:.2f}%"
            ),
            "weight": 100,
            "explanation": (
                "Prediction generated by the trained VoiceGuard CNN "
                "using a 64-bin log-mel spectrogram."
            )
        }
    ]

    return {
        "classification": cnn_result["classification"],
        "aiProbability": cnn_result["aiProbability"],
        "humanProbability": cnn_result["humanProbability"],
        "confidence": cnn_result["confidence"],
        "rawLogits": {
            "ai": cnn_result["aiProbability"],
            "human": cnn_result["humanProbability"]
        },
        "modelName": cnn_result["modelName"],
        "modelVersion": cnn_result["modelVersion"],
        "inferenceTimeMs": inference_ms,
        "signals": signals,
        "audioMetadata": {
            "duration": round(duration, 2),
            "sampleRate": sample_rate,
            "channels": 1,
            "byteSize": byte_size,
            "rmsEnergy": round(rms_total, 4)
        }
    }


class RequestHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        if self.path in ["/health", "/api/health"]:
            res = {
                "status": "CONNECTED",
                "model": MODEL_NAME,
                "version": MODEL_VERSION,
                "timestamp": time.time()
            }
            self._set_headers(200)
            self.wfile.write(json.dumps(res).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(b'{"error": "NOT_FOUND"}')

    def do_POST(self):
        if self.path in ["/api/detect-voice", "/api/detect-spoof"]:
            try:
                content_type = self.headers.get('Content-Type', '')
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)

                audio_bytes = b''
                filename = "audio_stream.wav"

                # Parse Multipart Form Data
                if 'multipart/form-data' in content_type:
                    boundary = content_type.split("boundary=")[-1].encode('utf-8')
                    parts = body.split(b'--' + boundary)
                    for part in parts:
                        if b'name="audio"' in part or b'filename=' in part:
                            for line in part.split(b'\r\n'):
                                if b'filename=' in line:
                                    try:
                                        filename = line.split(b'filename=')[1].split(b'"')[1].decode('utf-8')
                                    except Exception:
                                        pass
                            header_end = part.find(b'\r\n\r\n')
                            if header_end != -1:
                                audio_bytes = part[header_end + 4:].rstrip(b'\r\n')
                                break
                elif 'audio/' in content_type or 'application/octet-stream' in content_type:
                    audio_bytes = body
                elif 'application/json' in content_type:
                    data = json.loads(body.decode('utf-8'))
                    if 'pcm' in data:
                        pcm_arr = np.array(data['pcm'], dtype=np.float32)
                        sr = data.get('sampleRate', 16000)
                        dur = len(pcm_arr) / sr
                        res = run_inference(pcm_arr, sr, dur, len(body))
                        self._set_headers(200)
                        self.wfile.write(json.dumps(res).encode('utf-8'))
                        return
                    elif 'audioBase64' in data:
                        import base64
                        audio_bytes = base64.b64decode(data['audioBase64'])

                if not audio_bytes:
                    self._set_headers(400)
                    self.wfile.write(b'{"error": "NO_AUDIO_PAYLOAD_PROVIDED"}')
                    return

                # Decode audio bytes
                samples, sample_rate, channels, total_frames = AudioProcessor.parse_wav_bytes(audio_bytes)
                duration = len(samples) / sample_rate

                # CRITICAL DEBUG LOGGING (Step 12)
                print("=" * 60)
                print("[VoiceGuard ML Inference Engine] Processing Incoming Audio:")
                print(f"  • Filename:        {filename}")
                print(f"  • Byte Size:       {len(audio_bytes)} bytes")
                print(f"  • Duration:        {duration:.2f} seconds")
                print(f"  • Sample Rate:     {sample_rate} Hz (Channels: {channels})")
                print(f"  • Model Target:    {MODEL_NAME}")

                # Run Inference
                result = run_inference(samples, sample_rate, duration, len(audio_bytes))

                print(f"  • Inference Time:  {result['inferenceTimeMs']} ms")
                print(f"  • Classification:  {result['classification']}")
                print(f"  • AI Probability:  {result['aiProbability']} ({result['aiProbability']*100:.1f}%)")
                print(f"  • Human Prob:      {result['humanProbability']} ({result['humanProbability']*100:.1f}%)")
                print(f"  • Confidence:      {result['confidence']}")
                print("=" * 60)

                self._set_headers(200)
                self.wfile.write(json.dumps(result).encode('utf-8'))

            except Exception as e:
                print(f"[VoiceGuard ML] Error processing audio: {e}")
                self._set_headers(500)
                err_res = {
                    "classification": "MODEL_UNAVAILABLE",
                    "error": str(e),
                    "aiProbability": 0.0,
                    "humanProbability": 0.0,
                    "confidence": 0.0,
                    "modelName": MODEL_NAME,
                    "modelVersion": MODEL_VERSION
                }
                self.wfile.write(json.dumps(err_res).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(b'{"error": "ENDPOINT_NOT_FOUND"}')

def run_server():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, RequestHandler)
    print("=" * 60)
    print(f"VoiceGuard AI Deepfake Voice Inference Service Started")
    print(f"Model:    {MODEL_NAME} (v{MODEL_VERSION})")
    print(f"Endpoint: http://127.0.0.1:{PORT}/api/detect-voice")
    print(f"Health:   http://127.0.0.1:{PORT}/health")
    print("=" * 60)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
