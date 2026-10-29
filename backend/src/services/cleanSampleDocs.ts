import { DocumentModel } from '../models/Document';
import { DocumentChunk } from '../models/DocumentChunk';
import { InvertedIndex } from '../models/InvertedIndex';

export const cleanSampleDocuments = async () => {
  try {
    const sampleTitles = [
      'DBMS Unit 3: Normalization, 3NF & Boyce-Codd Normal Form',
      'Operating Systems: Deadlock Handling & Bankers Algorithm',
      'End-Sem 2024 Question Paper: Database Management Systems',
      'BTech CSE Official Curriculum & Syllabus Regulation 2026',
      'Campus Placement 2026: Eligibility Criteria & Drive Schedule',
    ];

    const sampleDocs = await DocumentModel.find({
      $or: [
        { title: { $in: sampleTitles } },
        { fileId: 'mock-file-id' },
      ],
    });

    if (sampleDocs.length > 0) {
      console.log(`🧹 Removing ${sampleDocs.length} mock/sample seeded documents from MongoDB...`);
      const sampleDocIds = sampleDocs.map((d) => d._id);

      await DocumentChunk.deleteMany({ documentId: { $in: sampleDocIds } });
      await InvertedIndex.deleteMany({ documentId: { $in: sampleDocIds } });
      await DocumentModel.deleteMany({ _id: { $in: sampleDocIds } });

      console.log('✅ Mock sample documents successfully deleted. Only authentic faculty uploads remain.');
      return sampleDocs.length;
    }
    return 0;
  } catch (err: any) {
    console.warn('⚠️ cleanSampleDocuments notice:', err.message);
    return 0;
  }
};

