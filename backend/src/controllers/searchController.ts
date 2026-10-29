import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { searchBM25 } from '../services/irService';
import { getEmbedding, searchVectors } from '../services/vectorService';
import { rankHybrid, HybridRankingWeights } from '../services/hybridRanker';
import { generateRAGAnswer } from '../services/ragService';
import { SearchHistory } from '../models/SearchHistory';
import { InvertedIndex } from '../models/InvertedIndex';
import { DocumentModel } from '../models/Document';
import { AuthRequest } from '../middleware/authMiddleware';

export const searchDocuments = async (req: AuthRequest, res: Response) => {
  const startTime = Date.now();
  try {
    const query = (req.query.q as string) || '';
    const mode = ((req.query.mode as string) || 'hybrid').toLowerCase();
    const department = req.query.department as string;
    const semester = req.query.semester ? Number(req.query.semester) : undefined;
    const subject = req.query.subject as string;
    const type = req.query.type as string;
    const askAI = req.query.askAI !== 'false';

    // Tunable weights from query or defaults
    const weights: HybridRankingWeights = {
      bm25Weight: req.query.w_bm25 ? parseFloat(req.query.w_bm25 as string) : 0.45,
      semanticWeight: req.query.w_sem ? parseFloat(req.query.w_sem as string) : 0.35,
      popularityWeight: req.query.w_pop ? parseFloat(req.query.w_pop as string) : 0.10,
      freshnessWeight: req.query.w_fresh ? parseFloat(req.query.w_fresh as string) : 0.10,
    };

    if (!query.trim()) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const filters = {
      department: department !== 'All' ? department : undefined,
      semester: !isNaN(Number(semester)) ? semester : undefined,
      subject: subject !== 'All' ? subject : undefined,
      type: type !== 'All' ? type : undefined,
    };

    // 1. Classical Information Retrieval: BM25
    let bm25Results: any[] = [];
    if (mode === 'hybrid' || mode === 'bm25') {
      bm25Results = await searchBM25(query, 25);
    }

    // 2. Modern Semantic Retrieval: Vector Embedding + Cosine Similarity
    let vectorResults: any[] = [];
    if (mode === 'hybrid' || mode === 'semantic') {
      const queryVec = await getEmbedding(query);
      vectorResults = await searchVectors(queryVec, 25);
    }

    // 3. Custom Hybrid Ranking (Module 4)
    let rankedResults = await rankHybrid(bm25Results, vectorResults, weights, filters, 12);

    const sampleTitles = [
      'DBMS Unit 3: Normalization, 3NF & Boyce-Codd Normal Form',
      'Operating Systems: Deadlock Handling & Bankers Algorithm',
      'End-Sem 2024 Question Paper: Database Management Systems',
      'BTech CSE Official Curriculum & Syllabus Regulation 2026',
      'Campus Placement 2026: Eligibility Criteria & Drive Schedule',
    ];
    rankedResults = rankedResults.filter((r) => !sampleTitles.includes(r.documentTitle));

    // Fallback to title/subject regex if no chunks matched yet
    if (rankedResults.length === 0) {
      const fallbackDocs = await DocumentModel.find({
        $or: [
          { title: new RegExp(query, 'i') },
          { subject: new RegExp(query, 'i') },
          { description: new RegExp(query, 'i') },
        ],
      }).limit(5).lean();

      rankedResults = fallbackDocs.map((doc) => ({
        chunkId: (doc._id as any).toString(),
        documentId: (doc._id as any).toString(),
        documentTitle: doc.title,
        documentType: doc.type,
        department: doc.department,
        semester: doc.semester,
        subject: doc.subject,
        academicYear: doc.academicYear,
        fileUrl: doc.fileUrl,
        pageNumber: 1,
        content: doc.description || doc.title,
        bm25Score: 0.5,
        semanticScore: 0.5,
        popularityScore: 0.5,
        freshnessScore: 0.8,
        finalScore: 0.65,
        matchType: 'hybrid',
        matchedTerms: [query],
      }));
    }

    // 4. Grounded GenAI / RAG Synthesis (Module 5)
    let ragData = null;
    if (askAI && rankedResults.length > 0) {
      ragData = await generateRAGAnswer(query, rankedResults);
    }

    const latencyMs = Date.now() - startTime;

    // 5. Track Search History if authenticated
    if (req.user?.id) {
      try {
        await SearchHistory.create({
          userId: new mongoose.Types.ObjectId(req.user.id),
          query,
          searchType: mode as any,
          filters,
          resultsCount: rankedResults.length,
          aiGenerated: !!ragData,
        });
      } catch (histErr) {
        // Non-blocking history error
      }
    }

    res.json({
      status: 'success',
      query,
      searchMode: mode,
      weightsUsed: weights,
      latencyMs,
      totalResults: rankedResults.length,
      ai_answer: ragData?.answer || null,
      ai_citations: ragData?.citations || [],
      modelUsed: ragData?.modelUsed || null,
      results: rankedResults,
    });
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed: ' + error.message });
  }
};

/**
 * Autocomplete / Query Suggestions Endpoint (Module 7)
 */
export const getAutocompleteSuggestions = async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string) || '';
    if (!q || q.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const cleanQ = q.trim().toLowerCase();

    // 1. Find matching terms in InvertedIndex
    const indexMatches = await InvertedIndex.find(
      { term: new RegExp(`^${cleanQ}`, 'i') },
      { term: 1, documentFrequency: 1 }
    )
      .sort({ documentFrequency: -1 })
      .limit(5)
      .lean();

    // 2. Find matching Document titles
    const docMatches = await DocumentModel.find(
      { title: new RegExp(cleanQ, 'i') },
      { title: 1, subject: 1, type: 1 }
    )
      .limit(4)
      .lean();

    const suggestions = [
      ...indexMatches.map((im) => ({
        text: im.term,
        type: 'keyword',
        detail: `${im.documentFrequency} occurrences`,
      })),
      ...docMatches.map((dm) => ({
        text: dm.title,
        type: 'document',
        detail: `${dm.type} • ${dm.subject}`,
      })),
    ];

    res.json({ suggestions });
  } catch (error: any) {
    res.status(500).json({ error: 'Autocomplete error: ' + error.message });
  }
};
