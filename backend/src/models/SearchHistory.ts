import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface ISearchHistory extends MongooseDocument {
  userId: mongoose.Types.ObjectId;
  query: string;
  searchType: 'hybrid' | 'bm25' | 'semantic';
  filters?: {
    department?: string;
    semester?: number;
    subject?: string;
    type?: string;
  };
  resultsCount: number;
  aiGenerated: boolean;
  createdAt: Date;
}

const SearchHistorySchema = new Schema<ISearchHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    query: { type: String, required: true },
    searchType: { type: String, enum: ['hybrid', 'bm25', 'semantic'], default: 'hybrid' },
    filters: {
      department: String,
      semester: Number,
      subject: String,
      type: String,
    },
    resultsCount: { type: Number, default: 0 },
    aiGenerated: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const SearchHistory = mongoose.model<ISearchHistory>('SearchHistory', SearchHistorySchema);

