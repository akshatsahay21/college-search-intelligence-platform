import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    if ((req as any).user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized as admin' });
    }

    const totalUsers = await prisma.user.count();
    const totalDocs = await prisma.document.count();
    const totalSearches = await prisma.searchHistory.count();

    const recentUploads = await prisma.document.findMany({
      orderBy: { uploadedAt: 'desc' },
      take: 5
    });

    res.json({ totalUsers, totalDocs, totalSearches, recentUploads });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching analytics' });
  }
};


export const getAllUsers = async (req: Request, res: Response) => {
  try {
    if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: 'Not authorized' });
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true }, orderBy: { createdAt: 'desc' } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllDocuments = async (req: Request, res: Response) => {
  try {
    if ((req as any).user.role !== 'ADMIN') return res.status(403).json({ error: 'Not authorized' });
    const docs = await prisma.document.findMany({ orderBy: { uploadedAt: 'desc' } });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
