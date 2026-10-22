import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const savedDocs = await prisma.savedDocument.findMany({
      where: { userId },
      include: { document: true }
    });

    const searchHistory = await prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json({ savedDocs, searchHistory });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
