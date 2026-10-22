import { Router } from 'express';
import { generateQuiz } from '../controllers/quizController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();
router.post('/generate', protect as any, generateQuiz as any);

export default router;
