from datasets import DatasetDict, load_dataset

from ml.model import EXPECTED_EMOTIONS


DATASET_NAME = "dair-ai/emotion"


def load_emotion_dataset() -> tuple[DatasetDict, list[str]]:
    dataset = load_dataset(DATASET_NAME)
    required_splits = {"train", "validation", "test"}
    if not required_splits.issubset(dataset.keys()):
        raise ValueError(
            f"{DATASET_NAME} must provide train, validation, and test splits."
        )

    class_names = dataset["train"].features["label"].names
    if set(class_names) != EXPECTED_EMOTIONS:
        raise ValueError(
            "Dataset labels do not match the expected six emotions: "
            f"{sorted(EXPECTED_EMOTIONS)}. Found: {class_names}"
        )
    for split_name in required_splits:
        if dataset[split_name].features["label"].names != class_names:
            raise ValueError(f"Label order differs in the {split_name} split.")
        if not {"text", "label"}.issubset(dataset[split_name].column_names):
            raise ValueError(f"The {split_name} split must contain text and label columns.")

    return dataset, class_names
