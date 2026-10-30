from functools import lru_cache
from pathlib import Path

import torch

from ml.model import BiLSTMEmotionClassifier, load_artifacts, predict_emotion


class EmotionModelService:
    def __init__(self, artifact_dir: Path) -> None:
        self.artifacts = load_artifacts(artifact_dir, map_location="cpu")
        model_config = self.artifacts["model_config"]
        self.model = BiLSTMEmotionClassifier(
            vocab_size=len(self.artifacts["vocab"]),
            num_classes=len(self.artifacts["class_names"]),
            embedding_dim=model_config["embedding_dim"],
            hidden_dim=model_config["hidden_dim"],
            dropout=model_config["dropout"],
            pad_index=self.artifacts["vocab"]["<pad>"],
        )
        self.model.load_state_dict(self.artifacts["state_dict"])
        self.model.eval()

    def predict(self, text: str) -> dict[str, object]:
        with torch.inference_mode():
            return predict_emotion(text, self.model, self.artifacts)


@lru_cache(maxsize=2)
def get_model_service(artifact_dir: str) -> EmotionModelService:
    return EmotionModelService(Path(artifact_dir))
