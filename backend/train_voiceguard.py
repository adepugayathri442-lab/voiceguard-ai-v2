import os
import torch
import torch.nn as nn
import torch.optim as optim
import librosa
import numpy as np
from torch.utils.data import Dataset, DataLoader


# =========================
# 1. SETTINGS
# =========================

DATASET_PATH = os.path.expanduser("~/Downloads/voiceguard_dataset")

SAMPLE_RATE = 16000
DURATION = 4
MAX_SAMPLES = SAMPLE_RATE * DURATION

BATCH_SIZE = 16
EPOCHS = 10
LEARNING_RATE = 0.001

# Apple GPU
if torch.backends.mps.is_available():
    DEVICE = torch.device("mps")
else:
    DEVICE = torch.device("cpu")

print("Using device:", DEVICE)


# =========================
# 2. DATASET
# =========================

class VoiceDataset(Dataset):

    def __init__(self, folder):

        self.files = []
        self.labels = []

        human_folder = os.path.join(folder, "human")
        ai_folder = os.path.join(folder, "ai")

        # Human = 0
        for file in os.listdir(human_folder):
            if file.endswith(".wav"):
                self.files.append(os.path.join(human_folder, file))
                self.labels.append(0)

        # AI = 1
        for file in os.listdir(ai_folder):
            if file.endswith(".wav"):
                self.files.append(os.path.join(ai_folder, file))
                self.labels.append(1)

        print(folder, "files:", len(self.files))

    def __len__(self):
        return len(self.files)

    def __getitem__(self, index):

        path = self.files[index]
        label = self.labels[index]

        try:
            audio, _ = librosa.load(
                path,
                sr=SAMPLE_RATE,
                mono=True
            )

            # Normalize
            audio = audio / (np.max(np.abs(audio)) + 1e-8)

            # Fix audio length
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

            # Normalize spectrogram
            mel = (mel - mel.mean()) / (mel.std() + 1e-8)

            mel = torch.tensor(
                mel,
                dtype=torch.float32
            )

            # CNN expects [channels, height, width]
            mel = mel.unsqueeze(0)

            label = torch.tensor(
                label,
                dtype=torch.long
            )

            return mel, label

        except Exception as e:

            print("Error loading:", path)
            print(e)

            return self.__getitem__(
                (index + 1) % len(self.files)
            )


# =========================
# 3. CNN MODEL
# =========================

class VoiceCNN(nn.Module):

    def __init__(self):

        super().__init__()

        self.features = nn.Sequential(

            nn.Conv2d(
                1, 32,
                kernel_size=3,
                padding=1
            ),
            nn.ReLU(),
            nn.BatchNorm2d(32),
            nn.MaxPool2d(2),

            nn.Conv2d(
                32, 64,
                kernel_size=3,
                padding=1
            ),
            nn.ReLU(),
            nn.BatchNorm2d(64),
            nn.MaxPool2d(2),

            nn.Conv2d(
                64, 128,
                kernel_size=3,
                padding=1
            ),
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
# 4. LOAD DATA
# =========================

train_dataset = VoiceDataset(
    os.path.join(DATASET_PATH, "train")
)

val_dataset = VoiceDataset(
    os.path.join(DATASET_PATH, "val")
)

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=0
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0
)


# =========================
# 5. MODEL
# =========================

model = VoiceCNN().to(DEVICE)

criterion = nn.CrossEntropyLoss()

optimizer = optim.Adam(
    model.parameters(),
    lr=LEARNING_RATE
)


# =========================
# 6. TRAINING
# =========================

print("\nStarting training...\n")

for epoch in range(EPOCHS):

    model.train()

    total_loss = 0
    correct = 0
    total = 0

    for batch_x, batch_y in train_loader:

        batch_x = batch_x.to(DEVICE)
        batch_y = batch_y.to(DEVICE)

        optimizer.zero_grad()

        outputs = model(batch_x)

        loss = criterion(
            outputs,
            batch_y
        )

        loss.backward()

        optimizer.step()

        total_loss += loss.item()

        predictions = torch.argmax(
            outputs,
            dim=1
        )

        correct += (
            predictions == batch_y
        ).sum().item()

        total += batch_y.size(0)

    train_accuracy = (
        100 * correct / total
    )

    # =========================
    # VALIDATION
    # =========================

    model.eval()

    val_correct = 0
    val_total = 0

    with torch.no_grad():

        for batch_x, batch_y in val_loader:

            batch_x = batch_x.to(DEVICE)
            batch_y = batch_y.to(DEVICE)

            outputs = model(batch_x)

            predictions = torch.argmax(
                outputs,
                dim=1
            )

            val_correct += (
                predictions == batch_y
            ).sum().item()

            val_total += batch_y.size(0)

    val_accuracy = (
        100 * val_correct / val_total
    )

    print(
        f"Epoch {epoch + 1}/{EPOCHS} | "
        f"Loss: {total_loss / len(train_loader):.4f} | "
        f"Train Accuracy: {train_accuracy:.2f}% | "
        f"Validation Accuracy: {val_accuracy:.2f}%"
    )


# =========================
# 7. SAVE MODEL
# =========================

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "voiceguard_cnn.pt"
)

torch.save(
    model.state_dict(),
    MODEL_PATH
)

print("\nTraining completed!")
print("Model saved at:")
print(MODEL_PATH)