# AI-Powered Intelligent College Search & Knowledge Platform

## 1. Project Vision & Problem Statement

### ❌ The Problem
In almost every college, academic information is incredibly scattered and difficult to find. 
- **Scattered Data:** Previous year question papers (PYQs), lecture notes, syllabus copies, academic calendars, and placement notices are spread across random WhatsApp groups, obscure college website links, Google Drives, and student laptops.
- **Bad Searchability:** Traditional search engines only look at the *filename*. If a student searches for "DBMS normalization notes", but the file is named `Unit3_DB_Notes_final.pdf`, they won't find it.
- **Information Overload:** When a student has a specific question (e.g., "What is the eligibility for the TCS placement drive?"), they currently have to download a 20-page PDF notice, open it, and read through it manually just to find one sentence.

### ✅ The Solution
This project is an **AI-Powered Intelligent College Knowledge Platform**—a specialized, private "Google Search + ChatGPT" built exclusively for a college's internal documents. 
1. **Centralized Hub:** Administrators and Faculty upload all college PDFs (notes, notices, PYQs) to one single platform.
2. **Semantic Search (Understanding Meaning):** By using AI embeddings, the search engine *reads* the inside of the documents. It understands the meaning of words and finds the exact paragraph inside a PDF, even if the filename is completely unrelated.
3. **Instant AI Answers (RAG):** Instead of just giving the student a list of PDFs to download, a built-in LLM reads the retrieved documents in the background and types out a direct, conversational answer with citations.

---

## 2. High-Impact Feature List

To make this a solid, impressive final-year project, the following features will be implemented:

### Core Requirements
- **Hybrid Search Engine:** Combines Traditional Keyword Search (TF-IDF) with Semantic Vector Search.
- **RAG LLM Integration:** Generates natural language answers based *only* on the college's uploaded PDFs to prevent hallucination.
- **Role-Based Access Control (RBAC):** Secure JWT authentication for Admins, Faculty, and Students.

### "Wow Factor" Features (To Impress Faculty)
- **Smart Quiz Generator:** An AI button that reads retrieved notes and auto-generates 5 MCQ questions for instant study practice.
- **Analytics Dashboard:** Visual charts (Chart.js) for Admins showing trending search queries, most active departments, and system usage.
- **Explainable Search Results:** A tooltip on search results showing *why* a document was ranked highly (Keyword match vs Semantic match).
- **Document Deduplication:** Prevents uploading the same PDF twice using SHA-256 hashing.
- **Caching & Rate Limiting:** Uses Redis caching for frequently asked questions to reduce API calls and demonstrate scalable engineering.

---

## 3. System Architecture & Tech Stack

This project utilizes a modern **Microservice Architecture** to balance robust web API handling (Node.js) with powerful AI/NLP processing (Python).

### 1. Frontend (What the User Sees)
- **Tech Used:** React.js (Vite), Tailwind CSS, Framer Motion.
- **Purpose:** This is the website interface. Students will use it to search for documents, and admins will use it to upload PDFs. Tailwind ensures the design is modern and premium, while Framer Motion adds smooth animations.

### 2. Main Backend (The Traffic Controller)
- **Tech Used:** Node.js, Express.js, TypeScript, Prisma ORM.
- **Purpose:** Think of this as the main manager of the application. It receives requests from the frontend, handles user logins (Authentication), fetches standard data from the database, and communicates with the external Groq AI API.

### 3. AI Microservice (The Heavy Lifter)
- **Tech Used:** Python, FastAPI, `pdfplumber`, `sentence-transformers`.
- **Purpose:** JavaScript (Node.js) is not great at reading complex PDFs or running heavy AI math. To solve this, we create a small, separate Python server. When Node.js receives a PDF, it hands the file over to Python. Python reads the text, turns it into mathematical AI vectors (embeddings), and saves it.

### 4. Database (The Storage)
- **Tech Used:** PostgreSQL with the `pgvector` extension.
- **Purpose:** It stores everything. It holds normal data (like user accounts, passwords, and upload dates) AND the complex AI vectors needed for the semantic search, all in one place.

### 5. Generative AI Engine (The Answering System)
- **Tech Used:** Groq API (running Llama 3).
- **Purpose:** When the search engine finds the relevant PDF paragraphs in the database, it sends that text to Groq. Groq instantly reads those paragraphs and types out a natural, human-like answer for the student.

### Architecture Flow Explained:
1. **Uploading:** Admin uploads a PDF on the website (**React**) ➔ Sends it to the Main Backend (**Node.js**) ➔ Hands the heavy work to the AI Service (**Python**) ➔ Python extracts text, creates AI vectors, and saves them to the Database (**PostgreSQL**).
2. **Searching:** Student types a question (**React**) ➔ Sends it to the Main Backend (**Node.js**) ➔ Node.js searches the Database (**PostgreSQL**) for matching text ➔ Sends the matched text to the AI Engine (**Groq API**) ➔ Groq generates the final answer ➔ Node.js sends it back to the website (**React**) for the student to read.

---

## 4. Implementation Roadmap

The development is broken down into structured, achievable phases.

### Phase 1: Foundation & Project Setup
- Initialize Git repository.
- Setup React + Tailwind frontend template.
- Setup Node.js + Express backend with TypeScript.
- Setup Python FastAPI microservice.
- Configure local PostgreSQL database with `pgvector` via Docker Compose.

### Phase 2: Core Data Pipeline & AI Service
- Implement PDF upload functionality from React to Node.js.
- Build Python endpoint to receive PDF, extract text, and chunk it.
- Integrate `sentence-transformers` in Python to generate vector embeddings.
- Save documents, metadata, and vectors to PostgreSQL.
- Implement Document Deduplication (SHA-256).

### Phase 3: The Search Engine Core
- Implement traditional keyword search (Inverted Index/TF-IDF concepts).
- Implement semantic similarity search using `pgvector` in Node.js.
- Build the Hybrid Ranking algorithm to combine scores and return the best results.
- Add "Explainable Search Results" logic.

### Phase 4: RAG Integration & AI Features
- Integrate Groq API in Node.js.
- Create prompt templates to answer user queries using retrieved document chunks.
- Build the **Smart Quiz Generator** endpoint.
- Implement Redis caching for frequent queries.

### Phase 5: UI/UX & Polish
- Build out the Student Search UI (search bar, result cards, AI answer panel, Quiz modal).
- Build the Admin/Faculty Dashboard UI (Upload screens, Analytics Dashboard).
- Implement Role-Based Access Control (RBAC) across the frontend and backend.
- Refine animations and aesthetic design.

### Phase 6: DevOps, Testing & Documentation
- Write Dockerfiles for React, Node.js, and Python.
- Setup GitHub Actions for automated testing/building.
- Draft the final project report/research paper detailing the hybrid search algorithm.
