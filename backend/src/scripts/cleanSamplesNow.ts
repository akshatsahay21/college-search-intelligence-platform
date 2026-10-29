import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';

// Load .env explicitly from backend root
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { DocumentModel } from '../models/Document';
import { DocumentChunk } from '../models/DocumentChunk';
import { InvertedIndex } from '../models/InvertedIndex';

const run = async () => {
  const uri = process.env.MONGODB_URI;
  console.log('Connecting to MongoDB URI:', uri?.slice(0, 35) + '...');
  if (!uri) throw new Error('MONGODB_URI missing');
  await mongoose.connect(uri);

  const allDocs = await DocumentModel.find({});
  console.log(`Found ${allDocs.length} total documents in MongoDB:`);
  allDocs.forEach((d) => {
    console.log(`- ID: ${d._id} | Title: "${d.title}" | Uploader: "${d.uploaderName}" | FileId: "${d.fileId}"`);
  });

  // Delete all seeded mock documents (uploaded by Dr. Sarah Sharma or mock-file-id)
  const sampleTitles = [
    'DBMS Unit 3: Normalization, 3NF & Boyce-Codd Normal Form',
    'Operating Systems: Deadlock Handling & Bankers Algorithm',
    'End-Sem 2024 Question Paper: Database Management Systems',
    'BTech CSE Official Curriculum & Syllabus Regulation 2026',
    'Campus Placement 2026: Eligibility Criteria & Drive Schedule',
  ];

  const toDelete = await DocumentModel.find({
    $or: [
      { title: { $in: sampleTitles } },
      { fileId: 'mock-file-id' },
      { uploaderName: 'Dr. Sarah Sharma' },
    ],
  });

  console.log(`Deleting ${toDelete.length} mock sample documents...`);
  if (toDelete.length > 0) {
    const ids = toDelete.map((d) => d._id);
    await DocumentChunk.deleteMany({ documentId: { $in: ids } });
    await InvertedIndex.deleteMany({ documentId: { $in: ids } });
    await DocumentModel.deleteMany({ _id: { $in: ids } });
    console.log('✅ Successfully purged sample mock documents!');
  }

  const remaining = await DocumentModel.find({});
  console.log(`\nRemaining Authentic Documents in MongoDB (${remaining.length}):`);
  remaining.forEach((d) => {
    console.log(`* Title: "${d.title}" | Subject: "${d.subject}" | Uploader: "${d.uploaderName}"`);
  });

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
