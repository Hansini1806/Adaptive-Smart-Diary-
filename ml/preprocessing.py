import re
from collections import Counter


TOKEN_PATTERN = re.compile(r"[a-z]+(?:'[a-z]+)?|[0-9]+|[^\w\s]", re.IGNORECASE)
PAD_TOKEN = "<pad>"
UNKNOWN_TOKEN = "<unk>"


def tokenize(text: str) -> list[str]:
    return TOKEN_PATTERN.findall(text.lower())


def build_vocabulary(
    texts: list[str],
    *,
    max_size: int = 30_000,
    min_frequency: int = 1,
) -> dict[str, int]:
    counts: Counter[str] = Counter()
    for text in texts:
        counts.update(tokenize(text))

    vocabulary = {PAD_TOKEN: 0, UNKNOWN_TOKEN: 1}
    for token, count in counts.most_common():
        if count < min_frequency or len(vocabulary) >= max_size:
            break
        vocabulary[token] = len(vocabulary)
    return vocabulary


def encode_text(text: str, vocabulary: dict[str, int], max_length: int) -> list[int]:
    tokens = tokenize(text)[:max_length]
    unknown_index = vocabulary[UNKNOWN_TOKEN]
    token_ids = [vocabulary.get(token, unknown_index) for token in tokens]
    return token_ids or [unknown_index]
