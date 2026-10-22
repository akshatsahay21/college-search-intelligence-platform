import { Router } from 'express';
import { getAnalytics, getAllUsers, getAllDocuments } from '../controllers/adminController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();
router.get('/analytics', protect as any, getAnalytics as any);
router.get('/users', protect as any, getAllUsers as any);
router.get('/documents', protect as any, getAllDocuments as any);

export default router;
