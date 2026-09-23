import os
import torch
import torch.nn as nn
import librosa
import numpy as np
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report


# =========================
# SETTINGS
# =========================

DATASET_PATH = os.path.expanduser("~/Downloads/voiceguard_dataset")
MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "voiceguard_cnn.pt"
)

SAMPLE_RATE = 16000
DURATION = 4
MAX_SAMPLES = SAMPLE_RATE * DURATION


# =========================
# DEVICE
# =========================

if torch.backends.mps.is_available():
    DEVICE = torch.device("mps")
else:
    DEVICE = torch.device("cpu")

print("Using device:", DEVICE)


# =========================
# SAME MODEL ARCHITECTURE
# =========================

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
        x = self.classifier(x)

        return x


# =========================
# LOAD MODEL
# =========================

model = VoiceCNN()

model.load_state_dict(
    torch.load(
        MODEL_PATH,
        map_location="cpu"
    )
)

model = model.to(DEVICE)
model.eval()

print("Model loaded successfully.")


# =========================
# AUDIO PREPROCESSING
# =========================

def preprocess_audio(path):

    audio, _ = librosa.load(
        path,
        sr=SAMPLE_RATE,
        mono=True
    )

    audio = audio / (
        np.max(np.abs(audio)) + 1e-8
    )

    if len(audio) < MAX_SAMPLES:

        audio = np.pad(
            audio,
            (0, MAX_SAMPLES - len(audio))
        )

    else:

        audio = audio[:MAX_SAMPLES]

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

    mel = (
        mel - mel.mean()
    ) / (
        mel.std() + 1e-8
    )

    mel = torch.tensor(
        mel,
        dtype=torch.float32
    )

    mel = mel.unsqueeze(0)
    mel = mel.unsqueeze(0)

    return mel


# =========================
# TEST DATA
# =========================

test_path = os.path.join(
    DATASET_PATH,
    "test"
)

y_true = []
y_pred = []

human_path = os.path.join(
    test_path,
    "human"
)

ai_path = os.path.join(
    test_path,
    "ai"
)


# =========================
# TEST HUMAN
# =========================

print("\nTesting HUMAN samples...")

for file in os.listdir(human_path):

    if not file.endswith(".wav"):
        continue

    path = os.path.join(
        human_path,
        file
    )

    x = preprocess_audio(path)
    x = x.to(DEVICE)

    with torch.no_grad():

        output = model(x)
        prediction = torch.argmax(
            output,
            dim=1
        ).item()

    y_true.append(0)
    y_pred.append(prediction)


# =========================
# TEST AI
# =========================

print("Testing AI samples...")

for file in os.listdir(ai_path):

    if not file.endswith(".wav"):
        continue

    path = os.path.join(
        ai_path,
        file
    )

    x = preprocess_audio(path)
    x = x.to(DEVICE)

    with torch.no_grad():

        output = model(x)
        prediction = torch.argmax(
            output,
            dim=1
        ).item()

    y_true.append(1)
    y_pred.append(prediction)


# =========================
# RESULTS
# =========================

accuracy = accuracy_score(
    y_true,
    y_pred
)

matrix = confusion_matrix(
    y_true,
    y_pred
)

print("\n==============================")
print("VOICEGUARD TEST RESULTS")
print("==============================")

print(
    f"\nTest samples: {len(y_true)}"
)

print(
    f"Test Accuracy: {accuracy * 100:.2f}%"
)

print("\nConfusion Matrix:")
print(matrix)

print("\nClassification Report:")

print(
    classification_report(
        y_true,
        y_pred,
        target_names=[
            "HUMAN",
            "AI"
        ]
    )
)