import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export type DocumentType = 'PYQ' | 'NOTES' | 'SYLLABUS' | 'NOTICE' | 'PLACEMENT' | 'ASSIGNMENT' | 'OTHER';

export interface IDocument extends MongooseDocument {
  title: string;
  description?: string;
  fileUrl: string;
  fileId: string;
  fileHash: string;
  originalName: string;
  fileSize: number;
  type: DocumentType;
  department: string;
  semester?: number;
  subject: string;
  academicYear: string;
  uploadedBy: mongoose.Types.ObjectId;
  uploaderName?: string;
  uploaderRole: string;
  viewsCount: number;
  downloadsCount: number;
  totalChunks: number;
  aiSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
    fileUrl: { type: String, required: true },
    fileId: { type: String, required: true },
    fileHash: { type: String, required: true, unique: true, index: true },
    originalName: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    type: {
      type: String,
      enum: ['PYQ', 'NOTES', 'SYLLABUS', 'NOTICE', 'PLACEMENT', 'ASSIGNMENT', 'OTHER'],
      default: 'NOTES',
      required: true,
      index: true,
    },
    department: { type: String, required: true, index: true },
    semester: { type: Number, index: true },
    subject: { type: String, required: true, index: true },
    academicYear: { type: String, default: '2026', index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploaderName: { type: String },
    uploaderRole: { type: String, default: 'FACULTY' },
    viewsCount: { type: Number, default: 0 },
    downloadsCount: { type: Number, default: 0 },
    totalChunks: { type: Number, default: 0 },
    aiSummary: { type: String },
  },
  { timestamps: true }
);

// Compound text index for MongoDB standard text search fallback
DocumentSchema.index({ title: 'text', description: 'text', subject: 'text', department: 'text' });

export const DocumentModel = mongoose.model<IDocument>('Document', DocumentSchema);

