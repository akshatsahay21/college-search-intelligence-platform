import { Router } from 'express';
import {
  getAnalytics,
  getAllUsers,
  updateUserRole,
  triggerReindex,
} from '../controllers/adminController';
import { verifyToken, adminOnly } from '../middleware/authMiddleware';

const router = Router();

router.get('/analytics', verifyToken, adminOnly, getAnalytics);
router.get('/users', verifyToken, adminOnly, getAllUsers);
router.put('/user-role', verifyToken, adminOnly, updateUserRole);
router.post('/reindex', verifyToken, adminOnly, triggerReindex);

export default router;
