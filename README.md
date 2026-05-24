# Clario — Ask anything. Understand everything.

> An AI-powered PDF chat application that lets you have natural conversations with any document.

![Clario UI](https://img.shields.io/badge/Status-Live-brightgreen) ![Python](https://img.shields.io/badge/Python-3.11-blue) ![React](https://img.shields.io/badge/React-TypeScript-61DAFB) ![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green) ![LangChain](https://img.shields.io/badge/LangChain-RAG-orange)

---

## What is Clario?

Clario is a full-stack Retrieval-Augmented Generation (RAG) application that allows users to upload any PDF document and have an intelligent AI-powered conversation with it. Instead of reading through hundreds of pages, simply ask questions and get instant, accurate answers grounded in your document's content.

---

## Features

- **Upload any PDF** — Drag and drop or click to upload any PDF document
- **AI-powered chat** — Ask questions in plain English and get intelligent answers
- **Auto document summary** — Get an instant summary when you upload a document
- **Multiple PDF support** — Upload and switch between multiple documents in one session
- **Chat history** — Conversations persist across browser sessions
- **PDF viewer** — View the original document alongside the chat
- **Voice input** — Ask questions using your microphone
- **Multilingual** — Get answers in English, Hindi, Gujarati, or Marathi
- **Copy responses** — One-click copy for any AI response
- **Luxury dark UI** — Clean, professional interface inspired by modern AI tools

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React + TypeScript | UI framework |
| Tailwind CSS | Styling |
| Axios | API communication |
| React Markdown | Rendering AI responses |
| Lucide React | Icons |
| Vite | Build tool |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | REST API server |
| PyMuPDF | PDF text extraction |
| LangChain | RAG pipeline orchestration |
| ChromaDB | Vector database |
| Sentence Transformers | Text embeddings (all-MiniLM-L6-v2) |
| NVIDIA Nemotron via OpenRouter | LLM for answer generation |
| Python Dotenv | Environment management |

---

## Architecture

```
User uploads PDF
      ↓
PyMuPDF extracts text
      ↓
LangChain splits into chunks (500 chars)
      ↓
Sentence Transformers converts to vectors
      ↓
ChromaDB stores vectors locally
      ↓
User asks a question
      ↓
ChromaDB finds top 3 relevant chunks
      ↓
LLM generates answer from context
      ↓
React displays the response
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- OpenRouter API key (free at openrouter.ai)

### 1. Clone the repository
```bash
git clone https://github.com/HarshitChaudhari/Clario.git
cd Clario
```

### 2. Backend setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

pip install fastapi uvicorn python-multipart pymupdf langchain langchain-community langchain-text-splitters chromadb sentence-transformers openai python-dotenv
```

### 3. Create environment file
Create a `.env` file inside the `backend` folder:
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 4. Run the backend
```bash
uvicorn main:app --reload
```
Backend runs at `http://localhost:8000`
API docs available at `http://localhost:8000/docs`

### 5. Frontend setup
```bash
cd ../frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`

---

## Usage

1. Open `http://localhost:5173` in your browser
2. Click the upload zone or drag and drop a PDF
3. Wait for processing — you'll see an auto-generated summary
4. Type your question in the input box and press Enter
5. Switch between uploaded documents using the sidebar
6. Use the language selector to get answers in your preferred language

---

## Project Structure

```
Clario/
├── backend/
│   ├── main.py              # FastAPI app and endpoints
│   ├── chat.py              # LLM integration (OpenRouter)
│   ├── pdf_processor.py     # PDF extraction and chunking
│   ├── vector_store.py      # ChromaDB embeddings
│   └── .env                 # API keys (not committed)
└── frontend/
    └── src/
        ├── App.tsx          # Main React component
        ├── main.tsx         # Entry point
        └── index.css        # Global styles
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/upload` | Upload and process a PDF |
| POST | `/chat` | Ask a question about a document |
| GET | `/pdf/{filename}` | Retrieve original PDF for viewing |

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `OPENROUTER_API_KEY` | OpenRouter API key for LLM access | Yes |

---

## Built By

**Harshit Chaudhari**
B.Tech in Artificial Intelligence and Data Science
ITMBU, Vadodara

- GitHub: [@HarshitChaudhari](https://github.com/HarshitChaudhari)
- LinkedIn: [linkedin.com/in/harshit-chaudhari](https://linkedin.com/in/harshit-chaudhari)

---

## License

MIT License — feel free to use, modify, and distribute.
