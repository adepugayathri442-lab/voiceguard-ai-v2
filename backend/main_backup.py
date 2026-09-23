from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="VoiceGuard AI Backend",
    description="Real-Time Voice Cloning Detection & Prevention API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VoiceAnalysisRequest(BaseModel):
    scenario: str = "unknown"


@app.get("/")
def root():
    return {
        "service": "VoiceGuard AI Backend",
        "status": "online",
        "problem_statement": "SIH 26104",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "VoiceGuard AI",
        "backend": "FastAPI",
    }


@app.post("/api/analyze-voice")
def analyze_voice(request: VoiceAnalysisRequest):

    if request.scenario == "ai":
        return {
            "classification": "AI_GENERATED",
            "ai_probability": 94.7,
            "human_probability": 5.3,
            "risk_score": 92,
            "risk_level": "CRITICAL",
            "recommendation": "Terminate call and blacklist caller",
        }

    elif request.scenario == "human":
        return {
            "classification": "HUMAN",
            "ai_probability": 3.6,
            "human_probability": 96.4,
            "risk_score": 12,
            "risk_level": "LOW",
            "recommendation": "Allow call",
        }

    elif request.scenario == "suspicious":
        return {
            "classification": "SUSPICIOUS",
            "ai_probability": 72.8,
            "human_probability": 27.2,
            "risk_score": 64,
            "risk_level": "HIGH",
            "recommendation": "Perform step-up verification",
        }

    return {
        "classification": "UNKNOWN",
        "ai_probability": 50.0,
        "human_probability": 50.0,
        "risk_score": 50,
        "risk_level": "MEDIUM",
        "recommendation": "Continue monitoring",
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "VoiceGuard AI",
        "backend": "FastAPI",
        "model": "ASVspoof-LCNN-v2.4",
        "version": "2.4.0",
        "model_available": False
    }

@app.post("/api/detect-voice")
async def detect_voice(audio: UploadFile = File(...)):
    return {
        "classification": "MODEL_UNAVAILABLE",
        "aiProbability": 0,
        "humanProbability": 0,
        "confidence": 0,
        "reason": "ASVspoof-LCNN-v2.4 model is not installed or configured yet."
    }
