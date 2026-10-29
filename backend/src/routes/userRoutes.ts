import { Router } from 'express';
import {
  getDashboard,
  toggleSaveDocument,
  clearSearchHistory,
} from '../controllers/userController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/dashboard', verifyToken, getDashboard);
router.post('/save', verifyToken, toggleSaveDocument);
router.delete('/history', verifyToken, clearSearchHistory);

export default router;
