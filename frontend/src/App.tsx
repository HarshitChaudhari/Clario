import { useState, useRef, useEffect } from "react"
import axios from "axios"
import ReactMarkdown from "react-markdown"
import { Upload, Send, FileText, Loader2, Mic, MicOff, Copy, Check, ChevronDown, X, Sparkles, BookOpen } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface UploadedDoc {
  filename: string
  collection: string
  summary: string
  chunks: number
}

export default function App() {
  const [docs, setDocs] = useState<UploadedDoc[]>([])
  const [activeDoc, setActiveDoc] = useState<UploadedDoc | null>(null)
  const [uploading, setUploading] = useState(false)
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState("English")
  const [showLang, setShowLang] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [showPDF, setShowPDF] = useState(false)
  const [dragging, setDragging] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const languages = ["English", "Hindi", "Gujarati", "Marathi"]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const saved = localStorage.getItem("clario_messages")
    const savedDocs = localStorage.getItem("clario_docs")
    if (saved) setMessages(JSON.parse(saved))
    if (savedDocs) {
      const parsedDocs = JSON.parse(savedDocs)
      setDocs(parsedDocs)
      if (parsedDocs.length > 0) setActiveDoc(parsedDocs[0])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("clario_messages", JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    localStorage.setItem("clario_docs", JSON.stringify(docs))
  }, [docs])

  const handleUpload = async (uploadFile: File) => {
    setUploading(true)
    const formData = new FormData()
    formData.append("file", uploadFile)
    try {
      const res = await axios.post("https://clario-5ucn.onrender.com/upload", formData)
      const newDoc: UploadedDoc = {
        filename: res.data.filename,
        collection: res.data.collection,
        summary: res.data.summary,
        chunks: res.data.total_chunks
      }
      setDocs(prev => [...prev, newDoc])
      setActiveDoc(newDoc)
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `✦ **${res.data.filename}** is ready.\n\n**Summary**\n${res.data.summary}\n\nAsk me anything.`
      }])
    } catch {
      alert("Upload failed. Make sure backend is running.")
    }
    setUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.type === "application/pdf") handleUpload(dropped)
  }

  const handleChat = async () => {
    if (!question.trim() || !activeDoc) return
    const userMessage = question
    setQuestion("")
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setLoading(true)
    try {
      const res = await axios.post("https://clario-5ucn.onrender.com/chat", {
        question: userMessage,
        collection_name: activeDoc.collection,
        language
      })
      setMessages(prev => [...prev, { role: "assistant", content: res.data.answer }])
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }])
    }
    setLoading(false)
  }

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice not supported. Use Chrome.")
      return
    }
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }
    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.lang = language === "Hindi" ? "hi-IN" : language === "Gujarati" ? "gu-IN" : language === "Marathi" ? "mr-IN" : "en-US"
    recognition.onresult = (e: any) => { setQuestion(e.results[0][0].transcript); setIsListening(false) }
    recognition.onend = () => setIsListening(false)
    recognition.start()
    recognitionRef.current = recognition
    setIsListening(true)
  }

  const copyMessage = (content: string, index: number) => {
    navigator.clipboard.writeText(content)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500&family=Geist+Mono:wght@300;400&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #1c1917;
          color: #e7e0d8;
          font-family: 'Geist', sans-serif;
          min-height: 100vh;
          overflow: hidden;
        }

        .app {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #1c1917;
        }

        .app::before {
          content: '';
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background:
            radial-gradient(ellipse at 15% 0%, rgba(59,130,246,0.07) 0%, transparent 45%),
            radial-gradient(ellipse at 85% 100%, rgba(99,102,241,0.05) 0%, transparent 45%);
          pointer-events: none;
          z-index: 0;
        }

        .header {
          display: flex;
          align-items: center;
          padding: 0 1.5rem;
          height: 52px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: relative;
          z-index: 10;
          background: rgba(28,25,23,0.9);
          backdrop-filter: blur(12px);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .logo-mark {
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 16px rgba(59,130,246,0.3);
        }

        .logo-name {
          font-size: 16px;
          font-weight: 500;
          color: #e7e0d8;
          letter-spacing: 0.02em;
        }

        .logo-sep {
          width: 1px;
          height: 14px;
          background: rgba(255,255,255,0.1);
          margin: 0 6px;
        }

        .logo-tagline {
          font-size: 12px;
          color: rgba(231,224,216,0.35);
          font-weight: 300;
        }

        .header-right {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .lang-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(231,224,216,0.5);
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-family: 'Geist', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }

        .lang-btn:hover {
          border-color: rgba(59,130,246,0.4);
          color: #93c5fd;
        }

        .lang-dropdown {
          position: absolute;
          top: 48px;
          right: 70px;
          background: #252220;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          overflow: hidden;
          z-index: 100;
          min-width: 130px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }

        .lang-option {
          display: block;
          width: 100%;
          text-align: left;
          padding: 8px 14px;
          font-size: 12px;
          font-family: 'Geist', sans-serif;
          color: rgba(231,224,216,0.5);
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.15s;
        }

        .lang-option:hover { background: rgba(59,130,246,0.08); color: #93c5fd; }
        .lang-option.active { color: #3b82f6; }

        .clear-btn {
          font-size: 12px;
          font-family: 'Geist', sans-serif;
          color: rgba(231,224,216,0.2);
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
          padding: 4px 8px;
        }

        .clear-btn:hover { color: rgba(231,224,216,0.5); }

        .main {
          display: flex;
          flex: 1;
          overflow: hidden;
          position: relative;
          z-index: 1;
        }

        .sidebar {
          width: 256px;
          border-right: 1px solid rgba(255,255,255,0.05);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
          background: rgba(20,18,16,0.5);
        }

        .sidebar-label {
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(231,224,216,0.25);
          font-weight: 400;
        }

        .upload-zone {
          border: 1px dashed rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 1.25rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.25s;
          background: rgba(255,255,255,0.01);
        }

        .upload-zone:hover, .upload-zone.dragging {
          border-color: rgba(59,130,246,0.45);
          background: rgba(59,130,246,0.04);
        }

        .upload-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(59,130,246,0.1);
          border: 1px solid rgba(59,130,246,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #60a5fa;
        }

        .upload-text {
          font-size: 11px;
          color: rgba(231,224,216,0.3);
          text-align: center;
          line-height: 1.6;
        }

        .processing {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          color: #60a5fa;
        }

        .doc-item {
          padding: 9px 11px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.05);
          cursor: pointer;
          transition: all 0.2s;
        }

        .doc-item:hover {
          border-color: rgba(59,130,246,0.2);
          background: rgba(59,130,246,0.04);
        }

        .doc-item.active {
          border-color: rgba(59,130,246,0.35);
          background: rgba(59,130,246,0.07);
        }

        .doc-name {
          font-size: 12px;
          color: rgba(231,224,216,0.7);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .doc-meta {
          font-size: 10px;
          color: rgba(231,224,216,0.2);
          margin-top: 2px;
          font-family: 'Geist Mono', monospace;
        }

        .view-pdf-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 11px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.05);
          background: none;
          color: rgba(231,224,216,0.35);
          font-size: 11px;
          font-family: 'Geist', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          text-align: left;
        }

        .view-pdf-btn:hover {
          border-color: rgba(59,130,246,0.25);
          color: #93c5fd;
        }

        .pdf-panel {
          width: 380px;
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          background: rgba(20,18,16,0.3);
        }

        .pdf-header {
          padding: 10px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pdf-title {
          font-size: 11px;
          color: rgba(231,224,216,0.3);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 300px;
        }

        .close-btn {
          background: none;
          border: none;
          color: rgba(231,224,216,0.2);
          cursor: pointer;
          transition: color 0.2s;
          padding: 2px;
        }

        .close-btn:hover { color: rgba(231,224,216,0.6); }

        .chat-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.75rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.05) transparent;
        }

        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
        }

        .empty-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #60a5fa;
        }

        .empty-title {
          font-size: 20px;
          font-weight: 300;
          color: rgba(231,224,216,0.4);
          letter-spacing: 0.01em;
        }

        .empty-sub {
          font-size: 12px;
          color: rgba(231,224,216,0.18);
          letter-spacing: 0.06em;
        }

        .msg-row {
          display: flex;
          animation: fadeUp 0.25s ease;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .msg-row.user { justify-content: flex-end; }
        .msg-row.assistant { justify-content: flex-start; }

        .bubble {
          max-width: 70%;
          padding: 11px 15px;
          border-radius: 12px;
          font-size: 13.5px;
          line-height: 1.65;
          position: relative;
        }

        .bubble.user {
          background: rgba(59,130,246,0.12);
          border: 1px solid rgba(59,130,246,0.2);
          color: rgba(231,224,216,0.88);
          border-bottom-right-radius: 3px;
        }

        .bubble.assistant {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          color: rgba(231,224,216,0.8);
          border-bottom-left-radius: 3px;
        }

        .copy-btn {
          position: absolute;
          top: -9px;
          right: -9px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #252220;
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(231,224,216,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s;
        }

        .msg-row:hover .copy-btn { opacity: 1; }
        .copy-btn:hover { color: #60a5fa; border-color: rgba(59,130,246,0.3); }

        .thinking {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          border-bottom-left-radius: 3px;
          width: fit-content;
          font-size: 11px;
          color: rgba(231,224,216,0.25);
          letter-spacing: 0.08em;
        }

        .dots {
          display: flex;
          gap: 3px;
        }

        .dots span {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #60a5fa;
          animation: blink 1.2s infinite;
        }

        .dots span:nth-child(2) { animation-delay: 0.2s; }
        .dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }

        .input-area {
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 1rem 2rem 1.25rem;
          background: rgba(28,25,23,0.7);
          backdrop-filter: blur(12px);
        }

        .active-label {
          font-size: 10px;
          color: rgba(96,165,250,0.5);
          letter-spacing: 0.08em;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .input-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 9px 12px;
          transition: border-color 0.2s;
        }

        .input-box:focus-within {
          border-color: rgba(59,130,246,0.3);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.05);
        }

        .input-field {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          font-size: 13.5px;
          font-family: 'Geist', sans-serif;
          color: rgba(231,224,216,0.85);
          font-weight: 300;
        }

        .input-field::placeholder { color: rgba(231,224,216,0.18); }
        .input-field:disabled { cursor: not-allowed; }

        .icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          color: rgba(231,224,216,0.2);
          transition: all 0.2s;
        }

        .icon-btn:hover { color: #60a5fa; }
        .icon-btn.listening { color: #f87171; }

        .send-btn {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border: none;
          border-radius: 7px;
          padding: 6px 10px;
          cursor: pointer;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 0 12px rgba(59,130,246,0.25);
        }

        .send-btn:hover {
          box-shadow: 0 0 20px rgba(59,130,246,0.4);
          transform: translateY(-1px);
        }

        .send-btn:disabled {
          opacity: 0.25;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .prose-custom p { margin: 0 0 8px; }
        .prose-custom p:last-child { margin-bottom: 0; }
        .prose-custom strong { color: #93c5fd; font-weight: 500; }
        .prose-custom ul { padding-left: 16px; margin: 8px 0; }
        .prose-custom li { margin: 3px 0; }
        .prose-custom code {
          background: rgba(59,130,246,0.08);
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 12px;
          font-family: 'Geist Mono', monospace;
          color: #93c5fd;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 2px; }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="app">
        <header className="header">
          <div className="logo">
            <div className="logo-mark">
              <Sparkles size={14} color="white" />
            </div>
            <span className="logo-name">Clario</span>
            <div className="logo-sep" />
            <span className="logo-tagline">Ask anything. Understand everything.</span>
          </div>
          <div className="header-right">
            <div style={{ position: "relative" }}>
              <button className="lang-btn" onClick={() => setShowLang(!showLang)}>
                {language} <ChevronDown size={11} />
              </button>
              {showLang && (
                <div className="lang-dropdown">
                  {languages.map(lang => (
                    <button
                      key={lang}
                      className={`lang-option ${language === lang ? "active" : ""}`}
                      onClick={() => { setLanguage(lang); setShowLang(false) }}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="clear-btn" onClick={() => { setMessages([]); localStorage.removeItem("clario_messages") }}>
              Clear history
            </button>
          </div>
        </header>

        <div className="main">
          <aside className="sidebar">
            <span className="sidebar-label">Documents</span>

            <label
              className={`upload-zone ${dragging ? "dragging" : ""}`}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <div className="upload-icon">
                <Upload size={17} />
              </div>
              <span className="upload-text">
                {uploading ? "Processing..." : "Drop PDF here\nor click to browse"}
              </span>
              <input
                type="file"
                accept=".pdf"
                style={{ display: "none" }}
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) handleUpload(f)
                }}
              />
            </label>

            {uploading && (
              <div className="processing">
                <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                Processing PDF...
              </div>
            )}

            {docs.length > 0 && (
              <>
                <span className="sidebar-label" style={{ marginTop: "4px" }}>Uploaded</span>
                {docs.map((doc, i) => (
                  <div
                    key={i}
                    className={`doc-item ${activeDoc?.collection === doc.collection ? "active" : ""}`}
                    onClick={() => { setActiveDoc(doc); setShowPDF(false) }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <BookOpen size={11} style={{ color: "#60a5fa", flexShrink: 0 }} />
                      <span className="doc-name">{doc.filename}</span>
                    </div>
                    <span className="doc-meta">{doc.chunks} segments</span>
                  </div>
                ))}
              </>
            )}

            {activeDoc && (
              <button className="view-pdf-btn" onClick={() => setShowPDF(!showPDF)}>
                <FileText size={12} />
                {showPDF ? "Hide document" : "View document"}
              </button>
            )}
          </aside>

          {showPDF && activeDoc && (
            <div className="pdf-panel">
              <div className="pdf-header">
                <span className="pdf-title">{activeDoc.filename}</span>
                <button className="close-btn" onClick={() => setShowPDF(false)}>
                  <X size={14} />
                </button>
              </div>
              <iframe
                src={`https://clario-5ucn.onrender.com/pdf/${activeDoc.filename}`}
                style={{ flex: 1, border: "none", width: "100%" }}
                title="PDF Viewer"
              />
            </div>
          )}

          <div className="chat-area">
            <div className="messages">
              {messages.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Sparkles size={26} />
                  </div>
                  <p className="empty-title">Begin with a document</p>
                  <p className="empty-sub">Upload a PDF to start your inquiry</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`msg-row ${msg.role}`}>
                  <div className={`bubble ${msg.role}`}>
                    {msg.role === "assistant" ? (
                      <div className="prose-custom">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : msg.content}
                    {msg.role === "assistant" && (
                      <button className="copy-btn" onClick={() => copyMessage(msg.content, i)}>
                        {copiedIndex === i
                          ? <Check size={11} style={{ color: "#60a5fa" }} />
                          : <Copy size={11} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="msg-row assistant">
                  <div className="thinking">
                    <div className="dots">
                      <span /><span /><span />
                    </div>
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
              {activeDoc && (
                <p className="active-label">
                  <FileText size={10} />
                  {activeDoc.filename}
                </p>
              )}
              <div className="input-box">
                <input
                  className="input-field"
                  type="text"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !loading && handleChat()}
                  placeholder={activeDoc ? "Ask a question about your document..." : "Upload a document to begin..."}
                  disabled={!activeDoc}
                />
                <button className={`icon-btn ${isListening ? "listening" : ""}`} onClick={handleVoice}>
                  {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                </button>
                <button
                  className="send-btn"
                  onClick={handleChat}
                  disabled={!activeDoc || !question.trim() || loading}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}