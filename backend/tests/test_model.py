import torch

from ml.model import BiLSTMEmotionClassifier, EXPECTED_EMOTIONS
from ml.preprocessing import build_vocabulary, encode_text, tokenize


def test_tokenizer_and_vocabulary_handle_known_and_unknown_words() -> None:
    vocabulary = build_vocabulary(["I feel joyful!", "I feel calm."], max_size=20)

    encoded = encode_text("I feel unexpectedly joyful.", vocabulary, max_length=8)

    assert tokenize("I feel joyful!") == ["i", "feel", "joyful", "!"]
    assert encoded[0] == vocabulary["i"]
    assert vocabulary["<unk>"] in encoded


def test_bilstm_returns_six_emotion_logits() -> None:
    model = BiLSTMEmotionClassifier(
        vocab_size=12,
        num_classes=len(EXPECTED_EMOTIONS),
        embedding_dim=8,
        hidden_dim=10,
        dropout=0,
    )
    logits = model(
        torch.tensor([[2, 3, 0], [4, 5, 6]], dtype=torch.long),
        torch.tensor([2, 3], dtype=torch.long),
    )

    assert logits.shape == (2, 6)
