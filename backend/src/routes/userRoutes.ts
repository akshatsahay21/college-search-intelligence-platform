import { Router } from 'express';
import { getDashboard } from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();
router.get('/dashboard', protect as any, getDashboard as any);

export default router;
