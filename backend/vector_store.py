import chromadb
import os

client = chromadb.PersistentClient(path="./chroma_db")

def store_chunks(chunks: list, collection_name: str):
    collection = client.get_or_create_collection(name=collection_name)
    collection.add(
        documents=chunks,
        ids=[f"chunk_{i}" for i in range(len(chunks))]
    )
    return f"Stored {len(chunks)} chunks successfully"

def retrieve_relevant_chunks(query: str, collection_name: str, n_results: int = 3):
    collection = client.get_or_create_collection(name=collection_name)
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    return results['documents'][0]