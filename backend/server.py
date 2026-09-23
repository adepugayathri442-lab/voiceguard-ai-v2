import json
import os
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import librosa
import numpy as np
import soundfile as sf
import torch
import torch.nn as nn
from transformers import Wav2Vec2Model

HOST = "127.0.0.1"
PORT = 8000
SAMPLE_RATE = 16000
CROP_SAMPLES = 4 * SAMPLE_RATE
MODEL_NAME = "facebook/wav2vec2-xls-r-300m"
WEIGHTS_URL = "https://huggingface.co/Sadanie/pellav2-audio-deepfake-detector"

DEVICE = (
    "cuda"
    if torch.cuda.is_available()
    else "mps"
    if torch.backends.mps.is_available()
    else "cpu"
)

class Pellav2Detector(nn.Module):
    def __init__(self):
        super().__init__()
        self.backbone = Wav2Vec2Model.from_pretrained(MODEL_NAME)
        self.layer_weights = nn.Parameter(
            torch.zeros(self.backbone.config.num_hidden_layers + 1)
        )
        self.head = nn.Linear(self.backbone.config.hidden_size, 1)

    def forward(self, x):
        hidden_states = self.backbone(
            x, output_hidden_states=True
        ).hidden_states
        weights = torch.softmax(self.layer_weights, dim=0)
        stacked = torch.stack(hidden_states)
        fused = stacked.mul(weights[:, None, None, None]).sum(0)
        pooled = fused.mean(dim=1)
        return self.head(pooled).squeeze(-1)

print("Loading Pellav2 model...")
print("Backbone:", MODEL_NAME)
print("Device:", DEVICE)

MODEL = Pellav2Detector().to(DEVICE)

# Download the detector checkpoint from Hugging Face on first startup.
WEIGHTS_PATH = os.path.expanduser(
    "~/.cache/voiceguard/pellav2_detector.pt"
)
os.makedirs(os.path.dirname(WEIGHTS_PATH), exist_ok=True)

if not os.path.exists(WEIGHTS_PATH):
    print("Downloading Pellav2 detector weights (~1.26 GB)...")
    from huggingface_hub import hf_hub_download
    downloaded = hf_hub_download(
        repo_id="Sadanie/pellav2-audio-deepfake-detector",
        filename="pellav2_detector.pt",
        cache_dir=os.path.expanduser("~/.cache/voiceguard/hf"),
    )
    import shutil
    shutil.copy2(downloaded, WEIGHTS_PATH)

state = torch.load(WEIGHTS_PATH, map_location=DEVICE, weights_only=False)
MODEL.load_state_dict(state)
MODEL.eval()

print("Pellav2 detector loaded successfully.")

def decode_audio(audio_bytes):
    import io
    data, sr = sf.read(io.BytesIO(audio_bytes), dtype="float32")
    if data.ndim > 1:
        data = np.mean(data, axis=1)
    data = np.asarray(data, dtype=np.float32)

    if sr != SAMPLE_RATE:
        data = librosa.resample(
            data, orig_sr=sr, target_sr=SAMPLE_RATE
        ).astype(np.float32)
        sr = SAMPLE_RATE

    if data.size == 0:
        raise ValueError("Audio payload is empty.")

    return data, sr

def make_crop(wav):
    if len(wav) >= CROP_SAMPLES:
        offset = (len(wav) - CROP_SAMPLES) // 2
        crop = wav[offset:offset + CROP_SAMPLES]
    else:
        crop = np.pad(
            wav,
            (0, CROP_SAMPLES - len(wav)),
            mode="constant"
        )

    crop = crop.astype(np.float32)
    crop = (crop - crop.mean()) / (crop.std() + 1e-7)
    return crop

def detect(audio_bytes):
    wav, sr = decode_audio(audio_bytes)

    # Remove leading/trailing silence so microphone recordings are
    # judged on speech rather than silence/noise.
    try:
        trimmed, _ = librosa.effects.trim(wav, top_db=30)
        if len(trimmed) >= int(0.75 * SAMPLE_RATE):
            wav = trimmed
    except Exception:
        pass

    # Score several overlapping speech windows instead of relying on
    # one arbitrary 4-second center crop.
    window = 4 * SAMPLE_RATE
    hop = 2 * SAMPLE_RATE

    if len(wav) <= window:
        crops = [make_crop(wav)]
    else:
        starts = list(range(0, len(wav) - window + 1, hop))
        if not starts:
            starts = [0]
        crops = [make_crop(wav[start:start + window]) for start in starts]

        # Include the final part of the recording.
        final_start = len(wav) - window
        if final_start not in starts:
            crops.append(make_crop(wav[final_start:final_start + window]))

    scores = []

    start_time = time.perf_counter()

    with torch.inference_mode():
        for crop in crops:
            x = torch.from_numpy(crop)[None].to(DEVICE)
            logit = MODEL(x)
            scores.append(float(torch.sigmoid(logit).item()))

    elapsed_ms = (time.perf_counter() - start_time) * 1000

    # Median is deliberately used to prevent one bad/noisy segment
    # from flipping the complete recording.
    ai_probability = float(np.median(scores))

    classification = (
        "AI_GENERATED" if ai_probability >= 0.50 else "HUMAN"
    )
    human_probability = 1.0 - ai_probability
    confidence = max(ai_probability, human_probability)

    print("• Speech chunks analyzed:", len(scores))
    print("• Chunk AI scores:", [round(v, 4) for v in scores])
    print("• Aggregated AI score:", round(ai_probability, 4))

    return {
        "classification": classification,
        "status": classification,
        "ai_probability": round(ai_probability, 4),
        "human_probability": round(human_probability, 4),
        "confidence": round(confidence, 4),
        "aiProbability": round(ai_probability, 4),
        "humanProbability": round(human_probability, 4),
        "model": "Pellav2 Audio Deepfake Detector",
        "modelName": "Pellav2 Audio Deepfake Detector",
        "model_version": "Pellav2",
        "modelVersion": "Pellav2",
        "sample_rate": sr,
        "duration_seconds": round(len(wav) / SAMPLE_RATE, 3),
        "inference_ms": round(elapsed_ms, 1),
        "inferenceTimeMs": round(elapsed_ms, 1),
        "chunk_scores": [round(v, 4) for v in scores],
    }

def extract_audio(body, content_type):
    if not content_type or "multipart/form-data" not in content_type:
        return body

    boundary_token = "boundary="
    if boundary_token not in content_type:
        return body

    boundary = content_type.split(boundary_token, 1)[1].strip().strip('"')
    marker = ("--" + boundary).encode()

    parts = body.split(marker)
    for part in parts:
        if b"Content-Disposition:" not in part:
            continue
        header_end = part.find(b"\r\n\r\n")
        if header_end < 0:
            continue
        payload = part[header_end + 4:]
        payload = payload.rstrip(b"\r\n-")
        if payload:
            return payload

    raise ValueError("No audio file found in multipart request.")

class Handler(BaseHTTPRequestHandler):
    def _send_json(self, payload, code=200):
        data = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self):
        self._send_json({"ok": True})

    def do_GET(self):
        if self.path in ("/health", "/api/health"):
            self._send_json({
                "status": "healthy",
                "service": "VoiceGuard AI Backend",
                "model": "Pellav2 Audio Deepfake Detector",
                "device": DEVICE,
            })
        else:
            self._send_json({"status": "not_found"}, 404)

    def do_POST(self):
        if self.path != "/api/detect-voice":
            self._send_json({"error": "NOT_FOUND"}, 404)
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length)
            if not body:
                raise ValueError("NO_AUDIO_PAYLOAD_PROVIDED")

            audio_bytes = extract_audio(
                body,
                self.headers.get("Content-Type", "")
            )

            print("\n" + "=" * 62)
            print("[VoiceGuard ML Inference Engine] Pellav2")
            print("• Incoming bytes:", len(audio_bytes))

            result = detect(audio_bytes)

            print("• Classification:", result["classification"])
            print("• AI Probability:", result["ai_probability"])
            print("• Human Probability:", result["human_probability"])
            print("• Confidence:", result["confidence"])
            print("• Inference Time:", result["inference_ms"], "ms")
            print("=" * 62)

            self._send_json(result)

        except Exception as exc:
            print("Detection error:", repr(exc))
            self._send_json({
                "classification": "MODEL_UNAVAILABLE",
                "status": "MODEL_UNAVAILABLE",
                "error": str(exc),
                "ai_probability": 0.0,
                "human_probability": 0.0,
                "confidence": 0.0,
            }, 500)

if __name__ == "__main__":
    print("=" * 62)
    print("VoiceGuard AI — Pellav2 Deepfake Detection Service")
    print("Endpoint:", f"http://{HOST}:{PORT}/api/detect-voice")
    print("Health:", f"http://{HOST}:{PORT}/health")
    print("=" * 62)
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
