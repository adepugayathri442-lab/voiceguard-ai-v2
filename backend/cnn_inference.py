import os
import torch
import torch.nn as nn
import librosa
import numpy as np


SAMPLE_RATE = 16000
DURATION = 4
MAX_SAMPLES = SAMPLE_RATE * DURATION

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "voiceguard_cnn.pt"
)


class VoiceCNN(nn.Module):

    def __init__(self):
        super().__init__()

        self.features = nn.Sequential(
            nn.Conv2d(1, 32, 3, padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(32),
            nn.MaxPool2d(2),

            nn.Conv2d(32, 64, 3, padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(64),
            nn.MaxPool2d(2),

            nn.Conv2d(64, 128, 3, padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(128),
            nn.MaxPool2d(2),

            nn.AdaptiveAvgPool2d((1, 1))
        )

        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, 2)
        )

    def forward(self, x):
        x = self.features(x)
        return self.classifier(x)


class VoiceGuardCNN:

    def __init__(self):

        if torch.backends.mps.is_available():
            self.device = torch.device("mps")
        else:
            self.device = torch.device("cpu")

        self.model = VoiceCNN()

        state_dict = torch.load(
            MODEL_PATH,
            map_location="cpu"
        )

        self.model.load_state_dict(state_dict)

        self.model = self.model.to(self.device)
        self.model.eval()

        print(
            f"VoiceGuard CNN loaded on {self.device}"
        )

    def preprocess(self, audio_bytes):

        # Convert WAV bytes to temporary file
        import tempfile

        with tempfile.NamedTemporaryFile(
            suffix=".wav",
            delete=False
        ) as temp:

            temp.write(audio_bytes)
            temp_path = temp.name

        try:

            audio, _ = librosa.load(
                temp_path,
                sr=SAMPLE_RATE,
                mono=True
            )

        finally:

            os.remove(temp_path)

        # Normalize
        audio = audio / (
            np.max(np.abs(audio)) + 1e-8
        )

        # Fixed 4-second input
        if len(audio) < MAX_SAMPLES:

            audio = np.pad(
                audio,
                (0, MAX_SAMPLES - len(audio))
            )

        else:

            audio = audio[:MAX_SAMPLES]

        # Log-Mel Spectrogram
        mel = librosa.feature.melspectrogram(
            y=audio,
            sr=SAMPLE_RATE,
            n_fft=1024,
            hop_length=256,
            n_mels=64
        )

        mel = librosa.power_to_db(
            mel,
            ref=np.max
        )

        # Same normalization used during training
        mel = (
            mel - mel.mean()
        ) / (
            mel.std() + 1e-8
        )

        tensor = torch.tensor(
            mel,
            dtype=torch.float32
        )

        tensor = tensor.unsqueeze(0)
        tensor = tensor.unsqueeze(0)

        return tensor.to(self.device)

    def predict(self, audio_bytes):

        x = self.preprocess(audio_bytes)

        with torch.no_grad():

            logits = self.model(x)

            probabilities = torch.softmax(
                logits,
                dim=1
            )[0]

        human_probability = (
            probabilities[0].item()
        )

        ai_probability = (
            probabilities[1].item()
        )

        if ai_probability >= human_probability:
            classification = "AI_GENERATED"
        else:
            classification = "HUMAN"

        confidence = max(
            ai_probability,
            human_probability
        )

        return {
            "classification": classification,
            "aiProbability": round(
                ai_probability,
                4
            ),
            "humanProbability": round(
                human_probability,
                4
            ),
            "confidence": round(
                confidence,
                4
            ),
            "modelName": "VoiceGuard CNN",
            "modelVersion": "1.0.0"
        }


# Load once when backend starts
voiceguard_cnn = VoiceGuardCNN()