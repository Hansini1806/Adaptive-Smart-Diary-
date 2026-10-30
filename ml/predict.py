import argparse
from pathlib import Path

import torch

from ml.model import BiLSTMEmotionClassifier, load_artifacts, predict_emotion


PROJECT_DIR = Path(__file__).resolve().parents[1]
DEFAULT_ARTIFACT_DIR = PROJECT_DIR / "ml" / "artifacts"


def main() -> None:
    parser = argparse.ArgumentParser(description="Classify diary text with trained weights.")
    parser.add_argument("text", help="Diary text to classify.")
    parser.add_argument("--artifact-dir", type=Path, default=DEFAULT_ARTIFACT_DIR)
    args = parser.parse_args()

    artifacts = load_artifacts(args.artifact_dir, map_location="cpu")
    config = artifacts["model_config"]
    model = BiLSTMEmotionClassifier(
        vocab_size=len(artifacts["vocab"]),
        num_classes=len(artifacts["class_names"]),
        embedding_dim=config["embedding_dim"],
        hidden_dim=config["hidden_dim"],
        dropout=config["dropout"],
        pad_index=artifacts["vocab"]["<pad>"],
    )
    model.load_state_dict(artifacts["state_dict"])
    model.eval()
    with torch.inference_mode():
        print(predict_emotion(args.text, model, artifacts))


if __name__ == "__main__":
    main()
