import { Router } from 'express';
import multer from 'multer';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  recordDownload,
  recordView,
  deleteDocument,
  getDocumentSummary,
  askDocumentQuestion,
  cleanSampleDocsHandler,
} from '../controllers/documentController';
import { verifyToken, facultyOrAdmin } from '../middleware/authMiddleware';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
});

// Purge mock sample documents
router.post('/clean-samples', cleanSampleDocsHandler);

// Upload: Accessible to FACULTY and ADMIN
router.post('/upload', verifyToken, facultyOrAdmin, upload.single('file'), uploadDocument);

// Get documents with filters
router.get('/', getDocuments);

// Document AI Summary (Detailed academic study guide)
router.get('/:id/summary', getDocumentSummary);

// Document AI Question & Answer (Interactive student Q&A grounded in document)
router.post('/:id/ask', askDocumentQuestion);

// Get single document
router.get('/:id', getDocumentById);

// Track download & view
router.post('/:id/download', recordDownload);
router.post('/:id/view', recordView);

// Delete document: ADMIN or owner FACULTY
router.delete('/:id', verifyToken, deleteDocument);

export default router;
