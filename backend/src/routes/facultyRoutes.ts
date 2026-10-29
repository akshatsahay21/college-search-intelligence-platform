import { Router } from 'express';
import { getFacultyDashboard } from '../controllers/facultyController';
import { verifyToken, facultyOrAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/dashboard', verifyToken, facultyOrAdmin, getFacultyDashboard);

export default router;

