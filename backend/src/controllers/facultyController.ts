import { Response } from 'express';
import mongoose from 'mongoose';
import { DocumentModel } from '../models/Document';
import { AuthRequest } from '../middleware/authMiddleware';

export const getFacultyDashboard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const facultyId = new mongoose.Types.ObjectId(req.user.id);

    const myDocs = await DocumentModel.find({ uploadedBy: facultyId }).sort({ createdAt: -1 });

    const totalUploaded = myDocs.length;
    const totalViews = myDocs.reduce((acc, doc) => acc + (doc.viewsCount || 0), 0);
    const totalDownloads = myDocs.reduce((acc, doc) => acc + (doc.downloadsCount || 0), 0);

    // Fetch department wide documents for reference
    const departmentDocs = await DocumentModel.find({
      department: req.user.department || 'Computer Science & Engineering',
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      facultyStats: {
        totalUploaded,
        totalViews,
        totalDownloads,
      },
      myDocuments: myDocs,
      departmentDocuments: departmentDocs,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

