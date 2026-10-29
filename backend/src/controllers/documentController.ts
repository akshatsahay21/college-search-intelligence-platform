import { Request, Response } from 'express';
import crypto from 'crypto';
import axios from 'axios';
import FormData from 'form-data';
import mongoose from 'mongoose';
import { DocumentModel, DocumentType } from '../models/Document';
import { DocumentChunk } from '../models/DocumentChunk';
import { uploadFile } from '../config/imagekit';
import { indexChunksInverted } from '../services/irService';
import { getEmbedding } from '../services/vectorService';
import { groq } from '../services/ragService';
import { cleanSampleDocuments } from '../services/cleanSampleDocs';
import { AuthRequest } from '../middleware/authMiddleware';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded. Please attach a valid PDF document.' });
    }

    const {
      title,
      description,
      type,
      department,
      semester,
      subject,
      academicYear,
    } = req.body;

    if (!title || !department || !subject) {
      return res.status(400).json({ error: 'Title, department, and subject are required fields.' });
    }

    // 1. Deduplication using SHA-256
    const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');
    const existingDoc = await DocumentModel.findOne({ fileHash: hash });
    if (existingDoc) {
      return res.status(409).json({
        error: `Document already exists in the system under title "${existingDoc.title}".`,
        document: existingDoc,
      });
    }

    // 2. Upload file via ImageKit.io (with local fallback)
    const uploadResult = await uploadFile(file.buffer, file.originalname);

    // 3. Extract text, chunk, and embed
    let extractedChunks: Array<{ content: string; page_number: number; embedding?: number[] }> = [];

    try {
      const formData = new FormData();
      formData.append('file', file.buffer, { filename: file.originalname, contentType: file.mimetype });

      const pyRes = await axios.post(`${PYTHON_SERVICE_URL}/api/extract`, formData, {
        headers: { ...formData.getHeaders() },
        timeout: 20000,
      });

      if (pyRes.data && Array.isArray(pyRes.data.chunks)) {
        extractedChunks = pyRes.data.chunks;
      }
    } catch (pyErr: any) {
      console.warn('⚠️ Python AI service extract failed or offline:', pyErr.message);
      // Native Node.js PDF parsing with PDFParse
      try {
        const { PDFParse } = require('pdf-parse');
        const parser = new PDFParse({ data: file.buffer });
        await parser.load();
        const textResult = await parser.getText();
        const fullText = textResult?.text || '';

        if (fullText.trim().length > 50) {
          const paragraphs = fullText.split(/\n\s*\n/).filter((p: string) => p.trim().length > 20);
          let currentChunk = '';
          let currentPage = 1;
          for (const para of paragraphs) {
            if (currentChunk.length + para.length > 1200) {
              extractedChunks.push({
                content: currentChunk.trim(),
                page_number: currentPage,
              });
              currentChunk = para + '\n\n';
              currentPage++;
            } else {
              currentChunk += para + '\n\n';
            }
          }
          if (currentChunk.trim().length > 0) {
            extractedChunks.push({
              content: currentChunk.trim(),
              page_number: currentPage,
            });
          }
        }
      } catch (parseErr: any) {
        console.warn('Native PDFParse failed:', parseErr.message);
      }

      if (extractedChunks.length === 0) {
        const baseText = `${title}. ${description || ''}. Subject: ${subject}, Department: ${department}, Semester: ${semester || 'All'}. Academic Year: ${academicYear || '2026'}.`;
        extractedChunks = [
          {
            content: baseText,
            page_number: 1,
          },
        ];
      }
    }

    // 4. Save Document in MongoDB
    const newDoc = await DocumentModel.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      fileUrl: uploadResult.fileUrl,
      fileId: uploadResult.fileId,
      fileHash: hash,
      originalName: file.originalname,
      fileSize: file.size,
      type: (type as DocumentType) || 'NOTES',
      department: department.trim(),
      semester: semester ? Number(semester) : undefined,
      subject: subject.trim(),
      academicYear: academicYear || '2026',
      uploadedBy: req.user ? new mongoose.Types.ObjectId(req.user.id) : new mongoose.Types.ObjectId(),
      uploaderName: req.user?.name || 'Faculty Member',
      uploaderRole: req.user?.role || 'FACULTY',
      totalChunks: extractedChunks.length,
    });

    // 5. Store chunks in MongoDB & calculate vectors if needed
    const chunkDocsToInsert = [];
    for (let i = 0; i < extractedChunks.length; i++) {
      const c = extractedChunks[i];
      let vec = c.embedding;
      if (!vec || vec.length === 0) {
        vec = await getEmbedding(c.content);
      }
      chunkDocsToInsert.push({
        documentId: newDoc._id,
        content: c.content,
        pageNumber: c.page_number || 1,
        chunkIndex: i,
        vector: vec,
        tokenCount: c.content.split(/\s+/).length,
      });
    }

    const insertedChunks = await DocumentChunk.insertMany(chunkDocsToInsert);

    // 6. Index into Inverted Index (Module 2 of PDF)
    const chunksForInverted = insertedChunks.map((ic) => ({
      chunkId: ic._id as mongoose.Types.ObjectId,
      documentId: newDoc._id as mongoose.Types.ObjectId,
      content: ic.content,
      pageNumber: ic.pageNumber,
    }));
    await indexChunksInverted(chunksForInverted);

    res.status(201).json({
      message: 'Document uploaded, vectorized, and indexed into Core IR engine successfully!',
      document: newDoc,
      storage: uploadResult.isImageKit ? 'ImageKit.io CDN' : 'Local Disk Storage',
      totalChunks: insertedChunks.length,
    });
  } catch (error: any) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Server error processing document: ' + error.message });
  }
};

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const { department, semester, subject, type, search, sort = 'desc' } = req.query;

    const filter: any = {
      fileId: { $ne: 'mock-file-id' },
      title: {
        $nin: [
          'DBMS Unit 3: Normalization, 3NF & Boyce-Codd Normal Form',
          'Operating Systems: Deadlock Handling & Bankers Algorithm',
          'End-Sem 2024 Question Paper: Database Management Systems',
          'BTech CSE Official Curriculum & Syllabus Regulation 2026',
          'Campus Placement 2026: Eligibility Criteria & Drive Schedule',
        ],
      },
    };
    if (department && department !== 'All') filter.department = department;
    if (semester && semester !== 'All') filter.semester = Number(semester);
    if (subject && subject !== 'All') filter.subject = new RegExp(subject as string, 'i');
    if (type && type !== 'All') filter.type = type;
    if (search) {
      filter.$and = [
        {
          $or: [
            { title: new RegExp(search as string, 'i') },
            { subject: new RegExp(search as string, 'i') },
            { description: new RegExp(search as string, 'i') },
          ],
        },
      ];
    }

    const docs = await DocumentModel.find(filter)
      .populate('uploadedBy', 'name email role designation')
      .sort({ createdAt: sort === 'asc' ? 1 : -1 })
      .limit(50);

    res.json({ count: docs.length, documents: docs });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error fetching documents: ' + error.message });
  }
};

export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const doc = await DocumentModel.findById(req.params.id).populate(
      'uploadedBy',
      'name email role designation'
    );
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Increment view count
    doc.viewsCount = (doc.viewsCount || 0) + 1;
    await doc.save();

    // Fetch chunks for preview
    const chunks = await DocumentChunk.find({ documentId: doc._id }).limit(10);

    res.json({ document: doc, previewChunks: chunks });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error fetching document: ' + error.message });
  }
};

export const recordDownload = async (req: Request, res: Response) => {
  try {
    const doc = await DocumentModel.findById(req.params.id);
    if (doc) {
      doc.downloadsCount = (doc.downloadsCount || 0) + 1;
      doc.viewsCount = (doc.viewsCount || 0) + 1;
      await doc.save();
      return res.json({ success: true, downloads: doc.downloadsCount, views: doc.viewsCount });
    }
    res.status(404).json({ error: 'Document not found' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to record download' });
  }
};

export const recordView = async (req: Request, res: Response) => {
  try {
    const doc = await DocumentModel.findById(req.params.id);
    if (doc) {
      doc.viewsCount = (doc.viewsCount || 0) + 1;
      await doc.save();
      return res.json({ success: true, views: doc.viewsCount });
    }
    res.status(404).json({ error: 'Document not found' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to record view' });
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const doc = await DocumentModel.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Admin can delete any; Faculty can only delete their own uploads
    if (
      req.user?.role !== 'ADMIN' &&
      doc.uploadedBy.toString() !== req.user?.id
    ) {
      return res.status(403).json({ error: 'Unauthorized to delete this document.' });
    }

    await DocumentChunk.deleteMany({ documentId: doc._id });
    await DocumentModel.findByIdAndDelete(doc._id);

    res.json({ message: 'Document and associated chunks deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error deleting document' });
  }
};

export const cleanSampleDocsHandler = async (_req: Request, res: Response) => {
  try {
    const count = await cleanSampleDocuments();
    res.json({ message: `Purged ${count} sample mock documents. Only authentic faculty uploads remain.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDocumentSummary = async (req: Request, res: Response) => {
  try {
    const doc = await DocumentModel.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Increment views count whenever summary is requested
    doc.viewsCount = (doc.viewsCount || 0) + 1;
    await doc.save();

    // If summary is already cached and sufficiently detailed, return it
    if (doc.aiSummary && doc.aiSummary.length > 800) {
      return res.json({
        summary: doc.aiSummary,
        document: doc,
        isCached: true,
      });
    }

    // Fetch all chunks for this document
    const chunks = await DocumentChunk.find({ documentId: doc._id }).sort({
      pageNumber: 1,
      chunkIndex: 1,
    });

    // Combine text from chunks (up to 25 chunks)
    const combinedContent = chunks
      .slice(0, 25)
      .map((c) => `[Page ${c.pageNumber}]:\n${c.content}`)
      .join('\n\n');

    let summary = '';

    if (groq && combinedContent.length > 20) {
      try {
        const prompt = `You are an elite academic professor and university author.
Generate a comprehensive, highly thorough, multi-page (at least 1500-2000 words) academic study guide and detailed course textbook chapter for this university document:
Document Title: "${doc.title}"
Subject: "${doc.subject}"
Department: "${doc.department}" (Semester ${doc.semester || 'All'})
Uploaded by: "${doc.uploaderName || 'Faculty Member'}"

Complete Course Document Content:
${combinedContent.slice(0, 16000)}

STRUCTURE YOUR STUDY GUIDE EXTENSIVELY IN CLEAN MARKDOWN:

# 📑 Complete Academic Study Guide & Master Review: ${doc.title}

## 🏛️ Executive Summary & Curricular Scope
(Explain the broad academic context, objectives, role in curriculum, and who this study guide is designed for)

## 📌 Module 1: Comprehensive Conceptual Breakdown
(Provide exhaustive explanations of all core principles, definitions, laws, and background theories mentioned in the slides/notes)

## 🧮 Module 2: Methodologies, Mathematical Formulations & Mechanisms
(Thoroughly detail all measurement approaches, mathematical formulas, equations, components, and procedures)

## ⚖️ Module 3: Key Distinctions, Comparative Analysis & Real-World Case Studies
(Contrast critical concepts, adjustments, historical timelines, and real-world industrial or economic applications)

## 📝 Module 4: Step-by-Step Worked Problems / Practical Exercises
(Provide realistic worked numerical calculations or technical walkthroughs demonstrating how to apply these concepts with full steps)

## 🎯 Module 5: High-Yield Exam Questions & Model Solutions
(Provide at least 5 typical semester examination questions with comprehensive high-scoring model answers)

## 💡 Key Takeaways & Formula Cheat Sheet
(A quick bulleted revision list of every single formula and golden rule for fast revision)`;

        const completion = await groq.chat.completions.create({
          model: 'qwen/qwen3.8-27b',
          messages: [
            { role: 'system', content: 'You are an expert university professor creating an exhaustive, detailed, multi-page study guide.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.25,
          max_tokens: 3500,
        });

        summary = completion.choices[0]?.message?.content || '';
      } catch (err: any) {
        console.warn('⚠️ Groq summary generation failed, using fallback:', err.message);
      }
    }

    if (!summary) {
      summary = `# 📑 Executive Academic Overview: ${doc.title}

**Subject:** ${doc.subject} • **Department:** ${doc.department} • **Semester:** ${doc.semester || 'All'}

This course material was uploaded by **${doc.uploaderName || 'Faculty Member'}**. It provides verified lecture slides and core academic insights for students preparing for examinations.

## 🎯 Core Concepts & Topics Covered
${chunks.map((c) => `• **Page ${c.pageNumber}:** ${c.content.slice(0, 200)}...`).join('\n\n')}

## 💡 High-Yield Exam Takeaways
- Review all definitions and core formulas outlined in the sections above.
- Understand the practical applications of ${doc.subject} in relation to university semester criteria.`;
    }

    // Cache the summary in MongoDB
    doc.aiSummary = summary;
    await doc.save();

    res.json({
      summary,
      document: doc,
      totalPages: chunks.length,
      isCached: false,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate document summary: ' + error.message });
  }
};

export const askDocumentQuestion = async (req: Request, res: Response) => {
  try {
    const { question, history } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const doc = await DocumentModel.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Increment views count whenever summary is requested
    doc.viewsCount = (doc.viewsCount || 0) + 1;
    await doc.save();

    // Fetch chunks for this document
    const chunks = await DocumentChunk.find({ documentId: doc._id }).sort({ pageNumber: 1 });
    if (chunks.length === 0) {
      return res.json({
        answer: 'This document does not contain text passages to answer from.',
        citations: [],
      });
    }

    // Simple keyword / term matching to pick the top relevant chunks for the question
    const qWords = question.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2);
    const scoredChunks = chunks.map((c) => {
      let score = 0;
      const cLower = c.content.toLowerCase();
      qWords.forEach((w: string) => {
        if (cLower.includes(w)) score += 1;
      });
      return { chunk: c, score };
    });

    scoredChunks.sort((a, b) => b.score - a.score);
    const topChunks = scoredChunks.slice(0, 5).map((sc) => sc.chunk);

    const contextText = topChunks
      .map((c) => `[Source Page ${c.pageNumber}]:\n${c.content}`)
      .join('\n\n');

    const citations = topChunks.map((c) => ({
      pageNumber: c.pageNumber,
      snippet: c.content.slice(0, 200) + '...',
    }));

    let answer = '';

    if (groq) {
      try {
        const systemPrompt = `You are an expert AI academic tutor assisting a student who is studying this specific college document:
Document Title: "${doc.title}"
Subject: "${doc.subject}"
Department: "${doc.department}"
Faculty Uploader: "${doc.uploaderName || 'Faculty'}"

RULES:
1. Answer the student's question accurately, thoroughly, and strictly based on the provided document excerpts below.
2. Explicitly cite the page number(s) (e.g. [Page X]) in your explanation.
3. If the student asks for examples, derivations, or practice problems, ground them in the concepts from this document.
4. Format your answer with clean Markdown, bold key terms, and bullet points.

Document Passages:
${contextText}`;

        const messages: any[] = [{ role: 'system', content: systemPrompt }];

        if (Array.isArray(history)) {
          history.slice(-4).forEach((h: any) => {
            if (h.role && h.content) messages.push({ role: h.role, content: h.content });
          });
        }

        messages.push({ role: 'user', content: question });

        const completion = await groq.chat.completions.create({
          model: 'qwen/qwen3.8-27b',
          messages,
          temperature: 0.2,
          max_tokens: 1200,
        });

        answer = completion.choices[0]?.message?.content || '';
      } catch (err: any) {
        console.warn('⚠️ Groq Q&A failed, falling back to local extractor:', err.message);
      }
    }

    if (!answer) {
      answer = `### Academic Answer for "${question}"
Based on **${doc.title}** (Page ${topChunks[0]?.pageNumber || 1}):

${topChunks[0]?.content || 'No specific match found in document.'}

*(Referenced directly from uploaded faculty notes)*`;
    }

    res.json({
      answer,
      citations,
      documentTitle: doc.title,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to answer question: ' + error.message });
  }
};
