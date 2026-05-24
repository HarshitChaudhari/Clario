import os

# Simple in-memory document store
documents_store = {}

def store_chunks(chunks: list, collection_name: str):
    documents_store[collection_name] = chunks
    return f"Stored {len(chunks)} chunks successfully"

def retrieve_relevant_chunks(query: str, collection_name: str, n_results: int = 3):
    chunks = documents_store.get(collection_name, [])
    if not chunks:
        return ["No document found."]
    
    # Simple keyword matching
    query_words = set(query.lower().split())
    scored = []
    for chunk in chunks:
        chunk_words = set(chunk.lower().split())
        score = len(query_words & chunk_words)
        scored.append((score, chunk))
    
    scored.sort(reverse=True)
    top_chunks = [chunk for _, chunk in scored[:n_results]]
    return top_chunks if top_chunks else chunks[:n_results]