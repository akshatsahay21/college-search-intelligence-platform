# College Search and Intelligence Platform

An AI-powered college knowledge platform that lets administrators upload academic PDFs and lets students search those documents with semantic retrieval and generated answers grounded in the uploaded material.

## Features

- Student and admin authentication with JWT-based access control
- PDF upload and document deduplication
- PDF text extraction, chunking, and embedding generation
- Keyword and semantic document search
- Groq-powered answers and quiz generation
- Admin analytics and document management
- PostgreSQL storage with Prisma and pgvector support

## Architecture

- `frontend/`: React, Vite, TypeScript, Tailwind CSS, React Router, Framer Motion, and Lucide React
- `backend/`: Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT, Multer, and Groq SDK
- `ai-service/`: FastAPI service using `pdfplumber` and `sentence-transformers` for PDF processing and embeddings
- `docker-compose.yml`: Local PostgreSQL with the pgvector image

The frontend calls the backend. The backend handles authentication, persistence, uploads, search, and Groq requests. The backend calls the AI service for document extraction and query embeddings.

## Environment Variables

Keep real environment files local and never commit them.

1. Copy `.env.example` to `.env` and set the Docker database password.
2. Copy `backend/.env.example` to `backend/.env`.
3. Set `DATABASE_URL`, `GROQ_API_KEY`, `JWT_SECRET`, and `PORT` in `backend/.env`.

The backend requires a PostgreSQL `DATABASE_URL`. `GROQ_API_KEY` is required for generated answers and quizzes. `JWT_SECRET` must be a strong, private value used to sign authentication tokens.

## Local Setup

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Install and prepare the backend

```bash
cd backend
npm ci
npx prisma generate
npx prisma db push
npm run dev
```

The backend listens on the port configured by `PORT`.

### 3. Start the AI service

Create or activate a Python virtual environment for `ai-service`, install the dependencies required by the imports in `ai-service/app`, and start the FastAPI application with Uvicorn from the project environment. The embedding model downloads the first time it is used.

The backend expects the AI service at `http://localhost:8000`.

### 4. Start the frontend

```bash
cd frontend
npm ci
npm run dev
```

Open the local URL printed by Vite.

## Development Workflow

Run each service in its own terminal during local development. Keep generated files, local databases, uploads, virtual environments, and credentials out of Git. Update the relevant documentation when configuration or service behavior changes.

## Team Git Workflow

Use `main` as the shared integration branch and create one feature branch per task.

1. Pull the latest `main`.
2. Create a branch named `feature/<feature-name>`.
3. Make and test your changes.
4. Commit the changes with a clear message.
5. Push the feature branch.
6. Open a Pull Request against `main`.
7. Request review and address feedback.
8. Merge into `main` after approval and passing checks.

Do not commit `.env` files, API keys, passwords, tokens, private keys, or generated dependency directories.

## Project Documentation

- [Design](DESIGN.md)
- [Project details](project_details.md)
- [Project roadmap](project_roadmap.md)
- [Presentation](presentation.pdf)
