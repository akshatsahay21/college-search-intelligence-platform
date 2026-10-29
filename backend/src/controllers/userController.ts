import { Response } from 'express';
import mongoose from 'mongoose';
import { SavedDocument } from '../models/SavedDocument';
import { SearchHistory } from '../models/SearchHistory';
import { DocumentModel } from '../models/Document';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const userProfile = await User.findById(userId);

    // 1. Get saved documents
    const saved = await SavedDocument.find({ userId })
      .populate('documentId')
      .sort({ savedAt: -1 });

    // 2. Get user search history
    const history = await SearchHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // 3. Get ALL recent Faculty Course Materials uploaded across departments (excluding mock sample docs)
    const mockExclusion = {
      fileId: { $ne: 'mock-file-id' },
      title: {
        $nin: [
          'DBMS Unit 3: Normalization, 3NF & Boyce-Codd Normal Form',
          'Operating Systems: Deadlock Handling & Bankers Algorithm',
          'End-Sem 2024 Question Paper: Database Management Systems',
          'BTech CSE Official Curriculum & Syllabus Regulation 2026',
          'Campus Placement 2026: Eligibility Criteria & Drive Schedule',
        ],
      },
    };

    const allFacultyUploads = await DocumentModel.find(mockExclusion)
      .populate('uploadedBy', 'name email designation department')
      .sort({ createdAt: -1 })
      .limit(30);

    // 4. Get Recommended documents matching student department / semester
    const filter: any = { ...mockExclusion };
    if (userProfile?.department) filter.department = userProfile.department;
    if (userProfile?.semester) filter.semester = userProfile.semester;

    let recommendations = await DocumentModel.find(filter)
      .sort({ viewsCount: -1, createdAt: -1 })
      .limit(8);

    if (!recommendations || recommendations.length === 0) {
      recommendations = await DocumentModel.find({
        ...mockExclusion,
        ...(userProfile?.department ? { department: userProfile.department } : {}),
      })
        .sort({ createdAt: -1 })
        .limit(8);
    }

    res.json({
      savedDocs: saved.map((s) => s.documentId).filter(Boolean),
      searchHistory: history,
      facultyUploads: allFacultyUploads,
      recommendations,
      userProfile,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

export const toggleSaveDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId } = req.body;
    if (!req.user || !documentId) {
      return res.status(400).json({ error: 'Document ID required' });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const docId = new mongoose.Types.ObjectId(documentId);

    const existing = await SavedDocument.findOne({ userId, documentId: docId });
    if (existing) {
      await SavedDocument.findByIdAndDelete(existing._id);
      return res.json({ message: 'Document removed from saved library', saved: false });
    } else {
      await SavedDocument.create({ userId, documentId: docId });
      return res.json({ message: 'Document saved to library', saved: true });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

export const clearSearchHistory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = new mongoose.Types.ObjectId(req.user.id);
    await SearchHistory.deleteMany({ userId });
    res.json({ message: 'Search history cleared' });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};
