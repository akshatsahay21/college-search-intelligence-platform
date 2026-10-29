import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN';

export interface IUser extends MongooseDocument {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  avatar?: string;
  bio?: string;
  phoneNumber?: string;

  // Student specific details
  rollNumber?: string;
  semester?: number;
  batch?: string; // e.g. "2023-2027"
  quizzesTaken?: number;
  streakDays?: number;

  // Faculty specific details
  employeeId?: string;
  designation?: string; // e.g. Assistant Professor, Associate Professor, HOD
  specialization?: string; // e.g. Database Systems, Machine Learning
  officeRoom?: string; // e.g. Block C, Room 402

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['STUDENT', 'FACULTY', 'ADMIN'],
      default: 'STUDENT',
      required: true,
      index: true,
    },
    department: { type: String, default: 'Computer Science & Engineering', index: true },
    avatar: { type: String },
    bio: { type: String },
    phoneNumber: { type: String },

    // Student fields
    rollNumber: { type: String, trim: true, index: true },
    semester: { type: Number, min: 1, max: 8, index: true },
    batch: { type: String, default: '2023-2027' },
    quizzesTaken: { type: Number, default: 0 },
    streakDays: { type: Number, default: 1 },

    // Faculty fields
    employeeId: { type: String, trim: true, index: true },
    designation: { type: String, default: 'Assistant Professor' },
    specialization: { type: String },
    officeRoom: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
