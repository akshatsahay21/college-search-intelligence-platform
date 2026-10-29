import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { DocumentModel } from '../models/Document';
import { DocumentChunk } from '../models/DocumentChunk';
import { InvertedIndex } from '../models/InvertedIndex';
import { indexChunksInverted } from '../services/irService';
import { getEmbedding } from '../services/vectorService';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college_intelligence';

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected! Seeding initial college knowledge base with Student & Faculty records...');

    // Clear previous seed data
    await User.deleteMany({});
    await DocumentModel.deleteMany({});
    await DocumentChunk.deleteMany({});
    await InvertedIndex.deleteMany({});

    // 1. Create Default Users with full academic profiles
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    const studentUser = await User.create({
      name: 'Alex Johnson',
      email: 'student@college.edu',
      password,
      role: 'STUDENT',
      department: 'Computer Science & Engineering',
      semester: 6,
      rollNumber: '22CSE104',
      batch: '2023-2027',
      phoneNumber: '+91 98765 43210',
      bio: 'BTech CSE undergraduate focused on Information Retrieval, Operating Systems, and Distributed Computing.',
      quizzesTaken: 4,
      streakDays: 7,
      avatar: '',
    });

    const facultyUser = await User.create({
      name: 'Dr. Sarah Sharma',
      email: 'faculty@college.edu',
      password,
      role: 'FACULTY',
      department: 'Computer Science & Engineering',
      employeeId: 'FAC-CSE-042',
      designation: 'Associate Professor',
      specialization: 'Database Management Systems & High-Performance Storage',
      officeRoom: 'Academic Block B, Room 304',
      phoneNumber: '+91 98111 22334',
      bio: 'Over 12 years of research and teaching experience in Relational DBs, Query Optimization, and Information Retrieval.',
      avatar: '',
    });

    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@college.edu',
      password,
      role: 'ADMIN',
      department: 'Central IT & Systems',
      employeeId: 'SYS-ADMIN-001',
      designation: 'Chief Systems Administrator',
      officeRoom: 'Server Center, Ground Floor',
      phoneNumber: '+91 98000 11223',
      bio: 'Oversees campus search infrastructure, MongoDB clusters, and inverted index maintenance pipelines.',
      avatar: '',
    });

    console.log('✅ Users seeded: Student (Roll: 22CSE104), Faculty (ID: FAC-CSE-042), Admin (password: password123)');

    // 2. Sample Academic Documents & Chunks
    const sampleDocs = [
      {
        title: 'DBMS Unit 3: Normalization, 3NF & Boyce-Codd Normal Form',
        subject: 'Database Management Systems',
        type: 'NOTES',
        department: 'Computer Science & Engineering',
        semester: 5,
        academicYear: '2025-2026',
        description: 'Comprehensive lecture notes covering functional dependencies, candidate keys, 1NF, 2NF, 3NF, and BCNF with step-by-step decomposition examples.',
        chunks: [
          {
            pageNumber: 1,
            content: 'Functional Dependency (FD) is a constraint between two sets of attributes in a relational database. Given relation R, X -> Y holds if whenever two tuples agree on X, they must also agree on Y. Normalization minimizes data redundancy and eliminates update anomalies (insertion, deletion, and modification anomalies).',
          },
          {
            pageNumber: 2,
            content: 'Third Normal Form (3NF) requires relation R to be in 2NF, and for every non-trivial functional dependency X -> A, either X is a superkey of R, or A is a prime attribute (member of some candidate key). 3NF guarantees dependency preservation and lossless join decomposition.',
          },
          {
            pageNumber: 3,
            content: 'Boyce-Codd Normal Form (BCNF) is a stricter version of 3NF. A relation R is in BCNF if for every non-trivial functional dependency X -> A, X is strictly a superkey. Unlike 3NF, BCNF does not allow A to be a prime attribute if X is not a superkey.',
          },
        ],
      },
      {
        title: 'End-Sem 2024 Question Paper: Database Management Systems',
        subject: 'Database Management Systems',
        type: 'PYQ',
        department: 'Computer Science & Engineering',
        semester: 5,
        academicYear: '2024-2025',
        description: 'Official university end-semester examination question paper with questions on ACID properties, indexing, SQL queries, and normalization.',
        chunks: [
          {
            pageNumber: 1,
            content: 'Q1 (10 marks): Consider relation R(A, B, C, D, E) with FDs: A -> BC, CD -> E, B -> D, E -> A. Find all candidate keys of R. State whether R is in 3NF and BCNF with complete mathematical justification.',
          },
          {
            pageNumber: 2,
            content: 'Q2 (10 marks): Explain the ACID properties of database transactions. Contrast serializability with conflict serializability and construct a precedence graph for schedule S1.',
          },
        ],
      },
      {
        title: 'Operating Systems: Deadlock Handling & Bankers Algorithm',
        subject: 'Operating Systems',
        type: 'NOTES',
        department: 'Computer Science & Engineering',
        semester: 4,
        academicYear: '2025-2026',
        description: 'Detailed analysis of deadlock characterization, mutual exclusion, hold and wait, no preemption, circular wait, and deadlock avoidance via Dijkstra\'s Banker\'s Algorithm.',
        chunks: [
          {
            pageNumber: 1,
            content: 'A deadlock condition arises if four Coffman conditions hold simultaneously: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Deadlock prevention constrains resource requests to invalidate at least one of these conditions.',
          },
          {
            pageNumber: 2,
            content: 'Deadlock avoidance uses prior knowledge about maximum resource needs. The Bankers Algorithm evaluates resource allocation state by simulating safety check: a state is safe if there exists a safe sequence <P1, P2, ... Pn> such that for each Pi, the needed resources can be satisfied by current available plus held resources.',
          },
        ],
      },
      {
        title: 'Campus Placement 2026: Eligibility Criteria & Drive Schedule',
        subject: 'Training & Placement Cell',
        type: 'PLACEMENT',
        department: 'Computer Science & Engineering',
        semester: 7,
        academicYear: '2025-2026',
        description: 'Official notification from College Training and Placement Cell regarding eligibility criteria, CGPA cutoff (7.5+), no active backlogs, and technical interview syllabus for Tier 1 hiring.',
        chunks: [
          {
            pageNumber: 1,
            content: 'Eligibility Criteria for 2026 Placement Drive: All BTech CSE and IT students with CGPA >= 7.5 and no active backlogs are eligible for Day-1 companies. Technical rounds test Data Structures and Algorithms, System Design, Operating Systems, DBMS, and Object-Oriented Programming.',
          },
          {
            pageNumber: 2,
            content: 'Drive Schedule: Round 1 Online Coding Assessment commences on October 15, 2026. Round 2 Technical Interviews and HR Interviews scheduled from October 20 to October 25, 2026. Registered candidates must upload verified resumes to the placement portal.',
          },
        ],
      },
      {
        title: 'BTech CSE Official Curriculum & Syllabus Regulation 2026',
        subject: 'Academic Syllabus',
        type: 'SYLLABUS',
        department: 'Computer Science & Engineering',
        semester: 6,
        academicYear: '2025-2026',
        description: 'Official departmental syllabus detailing course outcomes, textbook references, lecture hours, and lab experiments for Semester 6.',
        chunks: [
          {
            pageNumber: 1,
            content: 'Semester 6 Core Courses: Compiler Design, Computer Networks, Machine Learning Foundations, Web Technologies, and Mini-Project Lab. Total credits: 24. Internal assessment accounts for 40% weightage, and university end-sem exam accounts for 60%.',
          },
        ],
      },
    ];

    let totalChunksIndexed = 0;

    for (const docData of sampleDocs) {
      const hash = `hash-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      const newDoc = await DocumentModel.create({
        title: docData.title,
        description: docData.description,
        fileUrl: `/uploads/sample-${docData.type.toLowerCase()}.pdf`,
        fileId: `file-${docData.type.toLowerCase()}`,
        fileHash: hash,
        originalName: `${docData.title}.pdf`,
        fileSize: 1024 * 350,
        type: docData.type as any,
        department: docData.department,
        semester: docData.semester,
        subject: docData.subject,
        academicYear: docData.academicYear,
        uploadedBy: facultyUser._id,
        uploaderName: facultyUser.name,
        uploaderRole: 'FACULTY',
        viewsCount: Math.floor(Math.random() * 45) + 10,
        downloadsCount: Math.floor(Math.random() * 20) + 5,
        totalChunks: docData.chunks.length,
      });

      const chunkDocs = [];
      for (let i = 0; i < docData.chunks.length; i++) {
        const c = docData.chunks[i];
        const vec = await getEmbedding(c.content);
        chunkDocs.push({
          documentId: newDoc._id,
          content: c.content,
          pageNumber: c.pageNumber,
          chunkIndex: i,
          vector: vec,
          tokenCount: c.content.split(/\s+/).length,
        });
      }

      const inserted = await DocumentChunk.insertMany(chunkDocs);

      const chunksForInverted = inserted.map((ic) => ({
        chunkId: ic._id as mongoose.Types.ObjectId,
        documentId: newDoc._id as mongoose.Types.ObjectId,
        content: ic.content,
        pageNumber: ic.pageNumber,
      }));
      await indexChunksInverted(chunksForInverted);
      totalChunksIndexed += inserted.length;
    }

    console.log(`🎉 Seed finished! Indexed ${sampleDocs.length} documents with ${totalChunksIndexed} chunks into Inverted Index & MongoDB!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err: any) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDatabase();
