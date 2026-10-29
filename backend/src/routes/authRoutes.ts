import { Router } from 'express';
import multer from 'multer';
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  uploadAvatar,
  seedDemoAccounts,
} from '../controllers/authController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max for photos
});

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);
router.post('/avatar', verifyToken, upload.single('avatar'), uploadAvatar);
router.post('/seed-demo', seedDemoAccounts);

export default router;
