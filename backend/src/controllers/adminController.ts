import { Request, Response } from 'express';
import { User } from '../models/User';
import { DocumentModel } from '../models/Document';
import { DocumentChunk } from '../models/DocumentChunk';
import { SearchHistory } from '../models/SearchHistory';
import { rebuildInvertedIndex } from '../services/irService';
import { AuthRequest } from '../middleware/authMiddleware';

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const studentCount = await User.countDocuments({ role: 'STUDENT' });
    const facultyCount = await User.countDocuments({ role: 'FACULTY' });
    const adminCount = await User.countDocuments({ role: 'ADMIN' });

    const totalDocs = await DocumentModel.countDocuments();
    const totalChunks = await DocumentChunk.countDocuments();
    const totalSearches = await SearchHistory.countDocuments();

    const recentUploads = await DocumentModel.find()
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(6);

    const popularDocs = await DocumentModel.find()
      .sort({ viewsCount: -1, downloadsCount: -1 })
      .limit(5);

    const recentSearches = await SearchHistory.find()
      .populate('userId', 'name role')
      .sort({ createdAt: -1 })
      .limit(8);

    // Distribution by document type
    const typeCounts = await DocumentModel.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    res.json({
      metrics: {
        totalUsers,
        studentCount,
        facultyCount,
        adminCount,
        totalDocs,
        totalChunks,
        totalSearches,
      },
      typeDistribution: typeCounts,
      recentUploads,
      popularDocs,
      recentSearches,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error fetching analytics: ' + error.message });
  }
};

export const getAllUsers = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error fetching users: ' + error.message });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.body;
    if (!['STUDENT', 'FACULTY', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    const updated = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User role updated successfully', user: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update user role: ' + error.message });
  }
};

export const triggerReindex = async (_req: AuthRequest, res: Response) => {
  try {
    const result = await rebuildInvertedIndex();
    res.json({
      message: 'Full Inverted Index rebuilt successfully from MongoDB chunks!',
      totalChunksIndexed: result.totalIndexed,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Re-indexing failed: ' + error.message });
  }
};
