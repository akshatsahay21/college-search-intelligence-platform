import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IPosting {
  chunkId: mongoose.Types.ObjectId;
  documentId: mongoose.Types.ObjectId;
  termFrequency: number;
  docLength: number;
  pageNumber: number;
}

export interface IInvertedIndex extends MongooseDocument {
  term: string;
  documentFrequency: number;
  postings: IPosting[];
  updatedAt: Date;
}

const PostingSchema = new Schema<IPosting>(
  {
    chunkId: { type: Schema.Types.ObjectId, ref: 'DocumentChunk', required: true },
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
    termFrequency: { type: Number, required: true },
    docLength: { type: Number, required: true },
    pageNumber: { type: Number, required: true },
  },
  { _id: false }
);

const InvertedIndexSchema = new Schema<IInvertedIndex>(
  {
    term: { type: String, required: true, unique: true, index: true },
    documentFrequency: { type: Number, default: 0 },
    postings: [PostingSchema],
  },
  { timestamps: true }
);

export const InvertedIndex = mongoose.model<IInvertedIndex>('InvertedIndex', InvertedIndexSchema);

