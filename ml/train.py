import argparse
import json
import random
from pathlib import Path

import numpy as np
import torch
from torch import nn
from torch.utils.data import DataLoader, Dataset

from ml.data import load_emotion_dataset
from ml.model import BiLSTMEmotionClassifier
from ml.preprocessing import build_vocabulary, encode_text


PROJECT_DIR = Path(__file__).resolve().parents[1]
DEFAULT_ARTIFACT_DIR = PROJECT_DIR / "ml" / "artifacts"


class EmotionDataset(Dataset[tuple[torch.Tensor, torch.Tensor]]):
    def __init__(
        self,
        texts: list[str],
        labels: list[int],
        vocabulary: dict[str, int],
        max_length: int,
    ) -> None:
        self.sequences = [
            encode_text(text, vocabulary, max_length) for text in texts
        ]
        self.labels = labels

    def __len__(self) -> int:
        return len(self.labels)

    def __getitem__(self, index: int) -> tuple[torch.Tensor, torch.Tensor]:
        sequence = torch.tensor(self.sequences[index], dtype=torch.long)
        label = torch.tensor(self.labels[index], dtype=torch.long)
        return sequence, label


def collate_batch(
    batch: list[tuple[torch.Tensor, torch.Tensor]],
    pad_index: int,
) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
    sequences, labels = zip(*batch, strict=True)
    lengths = torch.tensor([len(sequence) for sequence in sequences], dtype=torch.long)
    padded = nn.utils.rnn.pad_sequence(
        sequences,
        batch_first=True,
        padding_value=pad_index,
    )
    return padded, lengths, torch.stack(labels)


def set_seed(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def train_model(
    *,
    epochs: int = 5,
    batch_size: int = 128,
    learning_rate: float = 1e-3,
    embedding_dim: int = 100,
    hidden_dim: int = 128,
    dropout: float = 0.3,
    max_length: int = 80,
    max_vocabulary: int = 30_000,
    seed: int = 42,
    artifact_dir: Path = DEFAULT_ARTIFACT_DIR,
) -> Path:
    set_seed(seed)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    dataset, class_names = load_emotion_dataset()

    training_split = dataset["train"]
    training_texts = list(training_split["text"])
    vocabulary = build_vocabulary(training_texts, max_size=max_vocabulary)
    pad_index = vocabulary["<pad>"]
    train_data = EmotionDataset(
        training_texts,
        list(training_split["label"]),
        vocabulary,
        max_length,
    )
    validation_split = dataset["validation"]
    validation_data = EmotionDataset(
        list(validation_split["text"]),
        list(validation_split["label"]),
        vocabulary,
        max_length,
    )
    collate = lambda batch: collate_batch(batch, pad_index)
    train_loader = DataLoader(
        train_data,
        batch_size=batch_size,
        shuffle=True,
        collate_fn=collate,
        generator=torch.Generator().manual_seed(seed),
    )
    validation_loader = DataLoader(
        validation_data,
        batch_size=batch_size,
        shuffle=False,
        collate_fn=collate,
    )

    model = BiLSTMEmotionClassifier(
        vocab_size=len(vocabulary),
        num_classes=len(class_names),
        embedding_dim=embedding_dim,
        hidden_dim=hidden_dim,
        dropout=dropout,
        pad_index=pad_index,
    ).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate)
    criterion = nn.CrossEntropyLoss()
    best_validation_accuracy = -1.0
    best_state: dict[str, torch.Tensor] | None = None

    print(
        f"Training on {device}; {len(train_data)} train rows, "
        f"{len(validation_data)} validation rows; labels: {class_names}"
    )
    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0
        correct = 0
        total = 0
        for token_ids, lengths, labels in train_loader:
            token_ids, lengths, labels = (
                token_ids.to(device),
                lengths.to(device),
                labels.to(device),
            )
            optimizer.zero_grad(set_to_none=True)
            logits = model(token_ids, lengths)
            loss = criterion(logits, labels)
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()

            total_loss += loss.item() * labels.size(0)
            correct += (logits.argmax(dim=1) == labels).sum().item()
            total += labels.size(0)

        validation_accuracy = _accuracy(model, validation_loader, device)
        train_loss = total_loss / total
        train_accuracy = correct / total
        print(
            f"Epoch {epoch}/{epochs} — loss: {train_loss:.4f}, "
            f"train accuracy: {train_accuracy:.4f}, "
            f"validation accuracy: {validation_accuracy:.4f}"
        )
        if validation_accuracy > best_validation_accuracy:
            best_validation_accuracy = validation_accuracy
            best_state = {
                name: tensor.detach().cpu().clone()
                for name, tensor in model.state_dict().items()
            }

    if best_state is None:
        raise RuntimeError("Training completed without a best model checkpoint.")

    artifact_dir.mkdir(parents=True, exist_ok=True)
    config = {
        "embedding_dim": embedding_dim,
        "hidden_dim": hidden_dim,
        "dropout": dropout,
        "max_length": max_length,
        "pad_index": pad_index,
        "dataset": "dair-ai/emotion",
        "model_version": "bilstm-emotion-v1",
        "seed": seed,
        "epochs": epochs,
        "batch_size": batch_size,
        "learning_rate": learning_rate,
        "best_validation_accuracy": best_validation_accuracy,
    }
    (artifact_dir / "vocab.json").write_text(
        json.dumps(vocabulary, ensure_ascii=False),
        encoding="utf-8",
    )
    (artifact_dir / "model_config.json").write_text(
        json.dumps(config, indent=2),
        encoding="utf-8",
    )
    torch.save(
        {
            "state_dict": best_state,
            "class_names": class_names,
            "model_version": config["model_version"],
        },
        artifact_dir / "model.pt",
    )
    print(f"Saved best validation checkpoint to: {artifact_dir}")
    return artifact_dir


def _accuracy(
    model: BiLSTMEmotionClassifier,
    loader: DataLoader,
    device: torch.device,
) -> float:
    model.eval()
    correct = 0
    total = 0
    with torch.inference_mode():
        for token_ids, lengths, labels in loader:
            logits = model(token_ids.to(device), lengths.to(device))
            correct += (logits.argmax(dim=1).cpu() == labels).sum().item()
            total += labels.size(0)
    return correct / total if total else 0.0


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the diary emotion BiLSTM.")
    parser.add_argument("--epochs", type=int, default=5)
    parser.add_argument("--batch-size", type=int, default=128)
    parser.add_argument("--learning-rate", type=float, default=1e-3)
    parser.add_argument("--max-length", type=int, default=80)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--artifact-dir", type=Path, default=DEFAULT_ARTIFACT_DIR)
    args = parser.parse_args()
    if args.epochs < 1:
        parser.error("--epochs must be at least 1")
    train_model(
        epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.learning_rate,
        max_length=args.max_length,
        seed=args.seed,
        artifact_dir=args.artifact_dir,
    )


if __name__ == "__main__":
    main()
