import chromadb
import os
from dotenv import load_dotenv

load_dotenv()

client = chromadb.PersistentClient(path="./chroma_db")

# Use simple hash-based embeddings instead of sentence-transformers
class SimpleEmbedding:
    def encode(self, texts):
        import hashlib
        import numpy as np
        if isinstance(texts, str):
            texts = [texts]
        embeddings = []
        for text in texts:
            # Create a deterministic embedding from text
            hash_val = hashlib.sha256(text.encode()).hexdigest()
            # Convert to float array
            embedding = [int(hash_val[i:i+2], 16) / 255.0 for i in range(0, 64, 2)]
            embeddings.append(embedding)
        return np.array(embeddings)

model = SimpleEmbedding()

def store_chunks(chunks: list, collection_name: str):
    collection = client.get_or_create_collection(name=collection_name)
    embeddings = model.encode(chunks).tolist()
    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=[f"chunk_{i}" for i in range(len(chunks))]
    )
    return f"Stored {len(chunks)} chunks successfully"

def retrieve_relevant_chunks(query: str, collection_name: str, n_results: int = 3):
    collection = client.get_or_create_collection(name=collection_name)
    query_embedding = model.encode([query]).tolist()
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=n_results
    )
    return results['documents'][0]