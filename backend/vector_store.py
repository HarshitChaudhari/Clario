import chromadb
from sentence_transformers import SentenceTransformer
import os

os.environ["HF_HUB_OFFLINE"]= "1" #Using cached model
#Initialize chromadb
client = chromadb.PersistentClient(path="./chroma_db")
model = SentenceTransformer('all-MiniLM-L6-v2')

def store_chunks(chunks: list, collection_name: str):
    #Create or get collection
    collection = client.get_or_create_collection(name=collection_name)
    
    #generate embeddings
    embeddings = model.encode(chunks).tolist()
    
    #Store in ChromaDB
    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=[f"chunk_{i}" for i in range(len(chunks))]
    )
    return f"Stored {len(chunks)} chunks successfully"

def retrieve_relevant_chunks(query: str, collection_name:str, n_results: int = 3):
    collection = client.get_or_create_collection(name=collection_name)
    query_embedding = model.encode([query]).tolist()
    
    results = collection.query(
        query_embeddings = query_embedding,
        n_results=n_results
    )
    return results['documents'][0]