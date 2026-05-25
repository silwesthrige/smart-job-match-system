import re
import math
from collections import Counter, defaultdict
from typing import List, Tuple
import numpy as np

WORD_RE = re.compile(r"\b[a-z0-9+#.+-]+\b", re.IGNORECASE)


def tokenize(text: str) -> List[str]:
    return WORD_RE.findall(text.lower())


def compute_tfidf_similarity(cv_text: str, job_texts: List[str], max_features: int = 5000) -> List[float]:
    """Compute cosine similarity between cv_text and each job_text using simple TF-IDF.
    Returns list of similarity scores in same order as job_texts.
    """
    docs = [cv_text] + job_texts
    tokenized = [tokenize(d) for d in docs]
    N = len(tokenized)

    # document frequency
    df = Counter()
    for tokens in tokenized:
        df.update(set(tokens))

    # choose vocabulary: top terms by df
    most_common = [t for t, _ in df.most_common(max_features)]
    vocab = {t: i for i, t in enumerate(most_common)}
    V = len(vocab)
    if V == 0:
        return [0.0] * len(job_texts)

    # compute idf
    idf = np.zeros(V, dtype=float)
    for term, idx in vocab.items():
        idf[idx] = math.log((N + 1) / (1 + df.get(term, 0))) + 1.0

    # compute tfidf vectors
    vectors = np.zeros((N, V), dtype=float)
    for i, tokens in enumerate(tokenized):
        if not tokens:
            continue
        counts = Counter(t for t in tokens if t in vocab)
        total = sum(counts.values())
        if total == 0:
            continue
        for t, c in counts.items():
            idx = vocab[t]
            tf = c / total
            vectors[i, idx] = tf * idf[idx]

    # normalize
    norms = np.linalg.norm(vectors, axis=1)
    # avoid divide by zero
    norms = np.where(norms == 0, 1e-9, norms)
    vectors = vectors / norms[:, None]

    cv_vec = vectors[0]
    job_vecs = vectors[1:]
    sims = job_vecs.dot(cv_vec)
    return sims.tolist()
