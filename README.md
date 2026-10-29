# AI-Powered Intelligent College Search & Knowledge Platform
**Final-Year BTech CSE Major Project • October 2026**

A centralized, college-specific search and knowledge platform bringing notes, previous-year question papers (PYQs), syllabus documents, notices, and placement circulars into one unified, searchable system.

Combines:
1. **Core CSE & Information Retrieval (IR)**: Custom Inverted Index, tokenization, stemming, stop-word removal, and BM25 ranking algorithm implemented from scratch.
2. **Modern AI / Semantic Retrieval**: Dense vector embeddings (`all-MiniLM-L6-v2`), cosine similarity, hybrid rank fusion, and grounded RAG synthesis via Meta's Llama 3 (Groq API).
3. **Database & Cloud Storage**: MongoDB via Mongoose and ImageKit.io CDN for fast, distributed document delivery.
4. **DevOps & Infrastructure**: Docker containerization, Docker Compose, role-based security.

---

## 🏛️ Roles & Portals (RBAC)

The platform supports 3 distinct roles with dedicated portals:

| Role | Portal & Capabilities |
| :--- | :--- |
| **🎓 STUDENT** | Sub-second hybrid search, grounded AI answers with page-level citations, personal bookmarks/library, search history, and AI quiz retention generator. |
| **👨‍🏫 FACULTY** | Upload lecture notes, PYQs, and syllabi with departmental tags; ImageKit CDN processing; monitor student engagement and view/download telemetry. |
| **⚡ SUPER ADMIN** | Platform-wide analytics, user management (role assignment/promotion), document lifecycle control, and 1-click Inverted Index rebuilding. |

---

## 📐 Hybrid Ranking Formula (Module 4)

$$S_{\text{final}} = 0.45 \cdot S_{\text{BM25}} + 0.35 \cdot S_{\text{Semantic}} + 0.10 \cdot S_{\text{Popularity}} + 0.10 \cdot S_{\text{Freshness}}$$

*Weights are fully tunable via the UI sliders during live demonstrations.*

---

## 🚀 Quick Start Guide

### 1. Database (MongoDB)
Start MongoDB via Docker or a local instance:
```bash
docker compose up -d
```
*(Default URI: `mongodb://127.0.0.1:27017/college_intelligence`)*

### 2. Backend Setup
```bash
cd backend
npm install
# Seed initial demo accounts (Student, Faculty, Admin) and sample indexed documents:
npm run seed
npm run dev
```

### 3. AI Microservice (Optional for Vector Embeddings)
```bash
cd ai-service
pip install fastapi uvicorn sentence-transformers pdfplumber
uvicorn app.main:app --port 8000 --reload
```
*(Note: If the Python AI service is offline, the backend automatically uses its built-in fallback embedder so search never crashes).*

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🔑 Pre-seeded Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Student** | `student@college.edu` | `password123` |
| **Faculty** | `faculty@college.edu` | `password123` |
| **Admin** | `admin@college.edu` | `password123` |

*(You can also use the **Quick Demo Switcher** pills in the top navbar to instantly test any role with one click).*
