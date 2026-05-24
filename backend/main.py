from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pdf_processor import extract_text_from_pdf, split_text_into_chunks
from vector_store import store_chunks
from chat import chat_with_pdf, stream_chat_with_pdf, summarize_pdf
from pydantic import BaseModel
import shutil
import os
import json

app = FastAPI(title="Clario API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://clario-liart.vercel.app"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    question: str
    collection_name: str
    language: str = "English"

class StreamChatRequest(BaseModel):
    question: str
    collection_name: str
    language: str = "English"

@app.get("/")
def home():
    return {"message": "Clario API is running 🚀"}

@app.options("/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str):
    return {}

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    text = extract_text_from_pdf(temp_path)
    chunks = split_text_into_chunks(text)
    collection_name = file.filename.replace(".pdf", "").replace(" ", "_")
    store_chunks(chunks, collection_name)
    
    try:
        summary = summarize_pdf(text[:3000])
    except:
        summary = "Ask me anything about this document!"
    
    pdf_storage_path = f"pdfs/{file.filename}"
    os.makedirs("pdfs", exist_ok=True)
    shutil.copy(temp_path, pdf_storage_path)
    os.remove(temp_path)
    
    return {
        "filename": file.filename,
        "total_chunks": len(chunks),
        "collection": collection_name,
        "summary": summary,
        "status": "PDF processed and stored successfully ✅"
    }

@app.post("/chat")
def chat(request: ChatRequest):
    answer = chat_with_pdf(request.question, request.collection_name, request.language)
    return {
        "question": request.question,
        "answer": answer
    }

@app.post("/chat/stream")
async def chat_stream(request: StreamChatRequest):
    async def generate():
        for chunk in stream_chat_with_pdf(
            request.question,
            request.collection_name,
            request.language
        ):
            yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        yield "data: [DONE]\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

@app.get("/pdf/{filename}")
async def get_pdf(filename: str):
    from fastapi.responses import FileResponse
    pdf_path = f"pdfs/{filename}"
    if os.path.exists(pdf_path):
        return FileResponse(pdf_path, media_type="application/pdf")
    return {"error": "PDF not found"}