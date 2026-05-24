from openai import OpenAI
from vector_store import retrieve_relevant_chunks
import os

api_key = os.environ.get("OPENROUTER_API_KEY")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key
)

MODEL = "nvidia/nemotron-3-super-120b-a12b:free"

def chat_with_pdf(question: str, collection_name: str, language: str = "English") -> str:
    relevant_chunks = retrieve_relevant_chunks(question, collection_name)
    context = "\n\n".join(relevant_chunks)
    prompt = f"""Answer the question based only on the context below.
If the answer is not in the context, say "I couldn't find that in the document."
Answer in {language}.

Context:
{context}

Question: {question}

Answer:"""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

def stream_chat_with_pdf(question: str, collection_name: str, language: str = "English"):
    relevant_chunks = retrieve_relevant_chunks(question, collection_name)
    context = "\n\n".join(relevant_chunks)
    prompt = f"""Answer the question based only on the context below.
If the answer is not in the context, say "I couldn't find that in the document."
Answer in {language}.

Context:
{context}

Question: {question}

Answer:"""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}]
    )
    yield response.choices[0].message.content

def summarize_pdf(text: str) -> str:
    prompt = f"""Summarize the following document in 3-4 sentences.
Be concise and highlight the main topics covered.

Document:
{text}

Summary:"""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content