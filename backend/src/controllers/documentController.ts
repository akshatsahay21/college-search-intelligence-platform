import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import axios from 'axios';
import FormData from 'form-data';

const prisma = new PrismaClient();
const PYTHON_SERVICE_URL = 'http://localhost:8000/api/extract';

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, type, department, semester } = req.body;

    // 1. Deduplication using SHA-256
    const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    const existingDoc = await prisma.document.findUnique({ where: { fileHash: hash } });
    if (existingDoc) {
      return res.status(409).json({ error: 'Document already exists in the system', document: existingDoc });
    }

    // 2. Forward PDF to Python AI Microservice
    const formData = new FormData();
    formData.append('file', file.buffer, file.originalname);

    console.log("Sending PDF to Python AI Service for extraction...");
    const pythonResponse = await axios.post(PYTHON_SERVICE_URL, formData, {
      headers: { ...formData.getHeaders() },
    });

    const { chunks } = pythonResponse.data;

    // 3. Save Document Metadata to PostgreSQL
    const newDoc = await prisma.document.create({
      data: {
        title,
        type,
        department,
        semester: semester ? parseInt(semester) : null,
        fileHash: hash,
      }
    });

    // Save physical PDF
    const uploadPath = path.join(__dirname, '../../uploads', `${newDoc.id}.pdf`);
    fs.writeFileSync(uploadPath, file.buffer);

    // 4. Save Chunks (Vectors will be added via raw SQL)
    for (const chunk of chunks) {
      await prisma.documentChunk.create({
        data: {
          documentId: newDoc.id,
          content: chunk.content,
          pageNumber: chunk.page_number,
        }
      });
    }

    res.status(201).json({ message: 'Document extracted and saved successfully!', document: newDoc });

  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
