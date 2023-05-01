import sys
from sentence_transformers import SentenceTransformer

input_path = sys.argv[1]

# Returns a comma separated embedding
def get_sbert_embedding(text):
    return ','.join(map(str, SentenceTransformer("sentence-transformers/all-mpnet-base-v2", device="cpu").encode(text, show_progress_bar=False)))

with open(input_path, "r") as f:
    input = f.read()

print(get_sbert_embedding(input), end="")
