import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface IQuiz extends MongooseDocument {
  topic: string;
  department?: string;
  semester?: number;
  subject?: string;
  documentId?: mongoose.Types.ObjectId;
  questions: IQuestion[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    answer: { type: String, required: true },
    explanation: { type: String },
  },
  { _id: false }
);

const QuizSchema = new Schema<IQuiz>(
  {
    topic: { type: String, required: true },
    department: { type: String },
    semester: { type: Number },
    subject: { type: String },
    documentId: { type: Schema.Types.ObjectId, ref: 'Document' },
    questions: [QuestionSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Quiz = mongoose.model<IQuiz>('Quiz', QuizSchema);

