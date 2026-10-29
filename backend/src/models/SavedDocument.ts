import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface ISavedDocument extends MongooseDocument {
  userId: mongoose.Types.ObjectId;
  documentId: mongoose.Types.ObjectId;
  savedAt: Date;
}

const SavedDocumentSchema = new Schema<ISavedDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
  },
  { timestamps: { createdAt: 'savedAt', updatedAt: false } }
);

SavedDocumentSchema.index({ userId: 1, documentId: 1 }, { unique: true });

export const SavedDocument = mongoose.model<ISavedDocument>('SavedDocument', SavedDocumentSchema);

