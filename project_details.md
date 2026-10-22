# College Search & Intelligence Platform
**Comprehensive Project Documentation**

---

## 1. Project Overview & Details

The **College Search & Intelligence Platform** is an AI-powered academic assistant designed to solve the problem of information overload in modern education. College students are frequently overwhelmed by scattered PDFs, lengthy syllabi, and massive sets of notes. Finding a specific concept within these static documents is time-consuming and inefficient.

Our platform transforms these static documents into an **interactive, intelligent knowledge base**. By acting as a 24/7 personalized tutor, the system ensures that students get instant, generative answers that are strictly grounded in their official course materials, completely eliminating AI hallucinations.

### Key Features
- **Strict Role-Based Access Control (RBAC)**: Secure separation between Student and Teacher/Admin experiences.
- **Intelligent Document Processing**: Automated extraction, deduplication, chunking, and semantic vectorization of PDF materials.
- **Generative AI Search**: Natural language querying that synthesizes direct answers from the uploaded knowledge base.
- **Admin Analytics**: Real-time insights into platform usage, total processed documents, and search metrics.

---

## 2. Technology Stack

The platform employs a modern, scalable microservice architecture to separate heavy AI computations from the main web server.

### Frontend (Client-Side)
- **Framework**: React.js powered by Vite for lightning-fast HMR and building.
- **Styling**: Tailwind CSS for a highly responsive, modern, and clean UI.
- **Language**: TypeScript for robust type safety.
- **Routing & State**: React Router DOM and isolated `sessionStorage` for secure session management.
- **Icons**: Lucide React.

### Backend (Main Server)
- **Framework**: Node.js with Express.js.
- **Database**: PostgreSQL for relational data storage.
- **ORM**: Prisma for type-safe database queries and schema management.
- **Authentication**: JSON Web Tokens (JWT) for stateless, secure session handling.
- **File Handling**: Multer for intercepting multipart/form-data PDF uploads.

### AI Microservice (Data Processing)
- **Framework**: Python with FastAPI for high-performance API endpoints.
- **PDF Extraction**: `pdfplumber` for highly accurate text parsing from documents.
- **Embeddings/Vectorization**: `sentence-transformers` (`all-MiniLM-L6-v2` model) to convert text chunks into semantic mathematical vectors.
- **Generative AI**: Meta's **Llama 3 (8B)** accessed via the lightning-fast Groq API for synthesizing the final answers.

---

## 3. System Workflow

The workflow of the application is divided into two primary pipelines: the **Ingestion Pipeline** (Teacher) and the **Retrieval Pipeline** (Student).

### A. Data Ingestion Pipeline (Teacher/Admin Workflow)
1. **Upload**: A Teacher logs into the Admin Dashboard and uploads a PDF (e.g., "DBMS Notes").
2. **Deduplication**: The Node.js backend calculates a SHA-256 hash of the file to ensure it hasn't been uploaded before.
3. **Storage**: The physical PDF is saved to an `uploads/` directory on the server so it can be viewed later.
4. **Extraction**: The PDF buffer is forwarded to the Python FastAPI microservice.
5. **Chunking**: Python extracts the text and splits it into logical, overlapping chunks to preserve context.
6. **Vectorization**: Each chunk is passed through the `MiniLM` model to generate a dense vector representation.
7. **Database Storage**: The chunks (and their vectors) are stored in the PostgreSQL database alongside the document's metadata (Title, Department, Semester).

### B. Data Retrieval Pipeline (Student Workflow)
1. **Query**: A Student logs into their dashboard and asks a natural language question (e.g., "Explain the ACID properties?").
2. **Vectorization**: The Node.js backend sends the question to the Python service to convert the query into a vector.
3. **Semantic Search**: The system performs a similarity search against the PostgreSQL database to find the chunks of text that mathematically match the query's intent (Cosine Similarity).
4. **Context Assembly**: The top 3 most relevant chunks are retrieved.
5. **Generation**: The retrieved chunks are injected into a prompt alongside the original question and sent to the Llama 3 LLM via Groq.
6. **Delivery**: The synthesized, highly accurate answer is streamed back to the Student's UI.

---

## 4. Project Roadmap

> [!TIP]
> The project is currently in the late stages of Phase 1, with core functionalities fully operational.

### ✅ Phase 1: Core Foundation (Current)
- [x] Set up Frontend (React) and Backend (Node + Python) microservices.
- [x] Implement JWT Authentication and Role-Based Access Control.
- [x] Build Document Upload and parsing pipeline.
- [x] Integrate SentenceTransformers for Semantic Search.
- [x] Integrate Groq (Llama 3) for Generative Answers.
- [x] Build interactive Admin Analytics Dashboard and clickable PDF viewer.
- [x] Implement isolated tab-sessions (`sessionStorage`).

### 🚀 Phase 2: Enhanced Learning Tools (Next)
- **Automated Quiz Generation**: Use Llama 3 to automatically generate multiple-choice quizzes based on specific uploaded PDFs to test student retention.
- **Citation Links**: Include clickable citations in the AI's answer that immediately jump to the exact page in the PDF where the information was found.
- **Search History**: Save student queries to their profile so they can review past concepts.
- **Cloud Storage Integration**: Migrate physical PDF storage from local server disks to AWS S3 or Cloudinary.

### 🌟 Phase 3: Scale & Collaboration (Future)
- **Peer-to-Peer Notes**: Allow students to upload their own notes and share them within their specific department or class groups.
- **OCR Integration**: Implement Tesseract or Vision models to extract text from handwritten notes or images.
- **Mobile Application**: Port the React frontend to React Native for dedicated iOS and Android applications.
