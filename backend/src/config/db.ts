import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college_intelligence';
  try {
    await mongoose.connect(uri);
    const sanitized = uri.includes('@') ? uri.split('@')[1] : uri;
    console.log(`✅ MongoDB Connected successfully to: ${sanitized}`);
  } catch (error: any) {
    console.error('❌ MongoDB Connection Error:', error.message);
  }
};

