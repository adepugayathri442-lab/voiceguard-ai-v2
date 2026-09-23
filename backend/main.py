from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="VoiceGuard AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Risk Engine
# -----------------------------
def calculate_risk(ai_probability: float):

    if ai_probability >= 90:
        return {
            "risk_score": ai_probability,
            "risk_level": "CRITICAL",
            "recommendation": "Terminate call and block sensitive actions"
        }

    elif ai_probability >= 70:
        return {
            "risk_score": ai_probability,
            "risk_level": "HIGH",
            "recommendation": "Require additional verification"
        }

    elif ai_probability >= 40:
        return {
            "risk_score": ai_probability,
            "risk_level": "MEDIUM",
            "recommendation": "Monitor call and perform verification"
        }

    else:
        return {
            "risk_score": ai_probability,
            "risk_level": "LOW",
            "recommendation": "Continue monitoring"
        }


# -----------------------------
# Health Check
# -----------------------------
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "VoiceGuard AI Backend"
    }


# -----------------------------
# Voice Analysis
# -----------------------------
@app.post("/api/analyze-voice")
async def analyze_voice(audio: UploadFile = File(...)):

    audio_data = await audio.read()

    # Temporary value.
    # Later this will come from the trained ML model.
    ai_probability = 0

    risk = calculate_risk(ai_probability)

    return {
        "filename": audio.filename,
        "classification": "UNCERTAIN",
        "ai_probability": ai_probability,
        "human_probability": 100 - ai_probability,
        "risk_score": risk["risk_score"],
        "risk_level": risk["risk_level"],
        "recommendation": risk["recommendation"]
    }