import json
from pathlib import Path
from typing import Any

import torch
from torch import nn
from torch.nn.utils.rnn import pack_padded_sequence

from ml.preprocessing import encode_text


EXPECTED_EMOTIONS = {"sadness", "joy", "love", "anger", "fear", "surprise"}


class BiLSTMEmotionClassifier(nn.Module):
    def __init__(
        self,
        *,
        vocab_size: int,
        num_classes: int,
        embedding_dim: int = 100,
        hidden_dim: int = 128,
        dropout: float = 0.3,
        pad_index: int = 0,
    ) -> None:
        super().__init__()
        self.embedding = nn.Embedding(
            vocab_size,
            embedding_dim,
            padding_idx=pad_index,
        )
        self.lstm = nn.LSTM(
            input_size=embedding_dim,
            hidden_size=hidden_dim,
            batch_first=True,
            bidirectional=True,
        )
        self.dropout = nn.Dropout(dropout)
        self.classifier = nn.Linear(hidden_dim * 2, num_classes)

    def forward(self, token_ids: torch.Tensor, lengths: torch.Tensor) -> torch.Tensor:
        embedded = self.embedding(token_ids)
        packed = pack_padded_sequence(
            embedded,
            lengths.cpu(),
            batch_first=True,
            enforce_sorted=False,
        )
        _, (hidden, _) = self.lstm(packed)
        final_state = torch.cat((hidden[-2], hidden[-1]), dim=1)
        return self.classifier(self.dropout(final_state))


def load_artifacts(
    artifact_dir: Path,
    *,
    map_location: str | torch.device = "cpu",
) -> dict[str, Any]:
    model_path = artifact_dir / "model.pt"
    vocabulary_path = artifact_dir / "vocab.json"
    config_path = artifact_dir / "model_config.json"
    for path in (model_path, vocabulary_path, config_path):
        if not path.is_file():
            raise FileNotFoundError(f"Required trained model artifact was not found: {path}")

    with vocabulary_path.open(encoding="utf-8") as file:
        vocabulary = json.load(file)
    with config_path.open(encoding="utf-8") as file:
        model_config = json.load(file)
    checkpoint = torch.load(model_path, map_location=map_location, weights_only=True)
    class_names = checkpoint["class_names"]
    if set(class_names) != EXPECTED_EMOTIONS:
        raise ValueError("The model artifact must contain the six expected emotion labels.")

    return {
        "state_dict": checkpoint["state_dict"],
        "class_names": class_names,
        "model_version": checkpoint["model_version"],
        "vocab": vocabulary,
        "model_config": model_config,
    }


def predict_emotion(
    text: str,
    model: BiLSTMEmotionClassifier,
    artifacts: dict[str, Any],
) -> dict[str, Any]:
    model_config = artifacts["model_config"]
    token_ids = encode_text(
        text,
        artifacts["vocab"],
        model_config["max_length"],
    )
    input_tensor = torch.tensor([token_ids], dtype=torch.long)
    lengths = torch.tensor([len(token_ids)], dtype=torch.long)
    logits = model(input_tensor, lengths)
    probabilities_tensor = torch.softmax(logits, dim=1)[0]
    probabilities = {
        emotion: float(probabilities_tensor[index].item())
        for index, emotion in enumerate(artifacts["class_names"])
    }
    emotion = max(probabilities, key=probabilities.get)

    return {
        "emotion": emotion,
        "confidence": probabilities[emotion],
        "probabilities": probabilities,
        "model_version": artifacts["model_version"],
    }
