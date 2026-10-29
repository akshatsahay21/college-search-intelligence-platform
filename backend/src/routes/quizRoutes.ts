import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { generateQuiz } from '../controllers/quizController';
import { AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'college_super_secret_jwt_key_2026_genz_platform';

const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');
  if (authHeader) {
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    try {
      req.user = jwt.verify(token, JWT_SECRET) as any;
    } catch {
      // Ignore
    }
  }
  next();
};

router.post('/generate', optionalAuth, generateQuiz);

export default router;
