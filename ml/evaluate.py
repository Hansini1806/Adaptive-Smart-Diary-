import argparse
import json
from pathlib import Path

import torch
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    precision_recall_fscore_support,
)
from torch.utils.data import DataLoader

from ml.data import load_emotion_dataset
from ml.model import BiLSTMEmotionClassifier, load_artifacts
from ml.train import EmotionDataset, collate_batch


PROJECT_DIR = Path(__file__).resolve().parents[1]
DEFAULT_ARTIFACT_DIR = PROJECT_DIR / "ml" / "artifacts"


def evaluate_model(artifact_dir: Path = DEFAULT_ARTIFACT_DIR) -> dict[str, object]:
    dataset, dataset_class_names = load_emotion_dataset()
    artifacts = load_artifacts(artifact_dir, map_location="cpu")
    class_names = artifacts["class_names"]
    if dataset_class_names != class_names:
        raise ValueError("Saved model label order does not match the dataset label order.")

    config = artifacts["model_config"]
    vocabulary = artifacts["vocab"]
    model = BiLSTMEmotionClassifier(
        vocab_size=len(vocabulary),
        num_classes=len(class_names),
        embedding_dim=config["embedding_dim"],
        hidden_dim=config["hidden_dim"],
        dropout=config["dropout"],
        pad_index=vocabulary["<pad>"],
    )
    model.load_state_dict(artifacts["state_dict"])
    model.eval()

    test_split = dataset["test"]
    test_data = EmotionDataset(
        list(test_split["text"]),
        list(test_split["label"]),
        vocabulary,
        config["max_length"],
    )
    loader = DataLoader(
        test_data,
        batch_size=128,
        shuffle=False,
        collate_fn=lambda batch: collate_batch(batch, vocabulary["<pad>"]),
    )
    true_labels: list[int] = []
    predicted_labels: list[int] = []
    with torch.inference_mode():
        for token_ids, lengths, labels in loader:
            predictions = model(token_ids, lengths).argmax(dim=1)
            true_labels.extend(labels.tolist())
            predicted_labels.extend(predictions.tolist())

    precision, recall, f1, _ = precision_recall_fscore_support(
        true_labels,
        predicted_labels,
        labels=list(range(len(class_names))),
        average="macro",
        zero_division=0,
    )
    matrix = confusion_matrix(
        true_labels,
        predicted_labels,
        labels=list(range(len(class_names))),
    )
    report: dict[str, object] = {
        "dataset": "dair-ai/emotion",
        "split": "test",
        "test_examples": len(true_labels),
        "model_version": artifacts["model_version"],
        "class_names": class_names,
        "accuracy": float(accuracy_score(true_labels, predicted_labels)),
        "macro_precision": float(precision),
        "macro_recall": float(recall),
        "macro_f1": float(f1),
        "confusion_matrix": matrix.tolist(),
        "confusion_matrix_rows_true_columns_predicted": True,
    }
    (artifact_dir / "evaluation.json").write_text(
        json.dumps(report, indent=2),
        encoding="utf-8",
    )
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate the trained model on test data.")
    parser.add_argument("--artifact-dir", type=Path, default=DEFAULT_ARTIFACT_DIR)
    args = parser.parse_args()
    report = evaluate_model(args.artifact_dir)
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
