import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { cleanSampleDocuments } from './services/cleanSampleDocs';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

import documentRoutes from './routes/documentRoutes';
import searchRoutes from './routes/searchRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import facultyRoutes from './routes/facultyRoutes';
import quizRoutes from './routes/quizRoutes';

// Middlewares
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static uploads folder (for local storage fallback or direct previews)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/search', searchRoutes);

// Root Health & Metadata Endpoint
app.get('/', (_req, res) => {
  res.json({
    status: 'online',
    platform: 'AI-Powered Intelligent College Search & Knowledge Platform',
    version: '2.0.0-mongodb',
    rolesSupported: ['STUDENT', 'FACULTY', 'ADMIN'],
    cdn: process.env.IMAGEKIT_PUBLIC_KEY ? 'ImageKit.io' : 'Local Disk',
    endpoints: {
      auth: '/api/auth',
      search: '/api/search',
      documents: '/api/documents',
      faculty: '/api/faculty',
      admin: '/api/admin',
      user: '/api/user',
      quiz: '/api/quiz',
    },
  });
});

// Start Server & Connect MongoDB
app.listen(port, async () => {
  console.log(`🚀 College Search Platform API running on port ${port}`);
  await connectDB();
  await cleanSampleDocuments();
});

export default app;
