import { Router } from 'express';
import multer from 'multer';
import { uploadDocument } from '../controllers/documentController';
import { verifyToken, adminOnly } from '../middleware/authMiddleware';

const router = Router();
// Use memory storage so we can buffer the file and send it directly to Python
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', verifyToken, adminOnly, upload.single('file'), uploadDocument as any);

export default router;