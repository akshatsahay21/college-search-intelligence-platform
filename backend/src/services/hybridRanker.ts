import { BM25Result } from './irService';
import { VectorSearchResult } from './vectorService';
import { DocumentModel } from '../models/Document';
import { DocumentChunk } from '../models/DocumentChunk';

export interface HybridRankingWeights {
  bm25Weight?: number;        // Default 0.45 (from PDF Section 4)
  semanticWeight?: number;    // Default 0.35 (from PDF Section 4)
  popularityWeight?: number;  // Default 0.10 (from PDF Section 4)
  freshnessWeight?: number;   // Default 0.10 (from PDF Section 4)
}

export interface HybridResultItem {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  documentType: string;
  department: string;
  semester?: number;
  subject: string;
  academicYear: string;
  fileUrl: string;
  pageNumber: number;
  content: string;
  bm25Score: number;
  semanticScore: number;
  popularityScore: number;
  freshnessScore: number;
  finalScore: number;
  matchType: 'hybrid' | 'bm25' | 'semantic';
  matchedTerms: string[];
}

/**
 * Min-max normalizes an array of scores into [0, 1] range
 */
const normalizeScores = (scores: number[]): number[] => {
  if (scores.length === 0) return [];
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  if (max === min) return scores.map(() => 1.0);
  return scores.map((s) => (s - min) / (max - min));
};

/**
 * Custom Hybrid Ranking implementation as defined in Project Documentation (Module 4)
 */
export const rankHybrid = async (
  bm25Results: BM25Result[],
  vectorResults: VectorSearchResult[],
  weights: HybridRankingWeights = {},
  filters?: {
    department?: string;
    semester?: number;
    subject?: string;
    type?: string;
  },
  limit: number = 10
): Promise<HybridResultItem[]> => {
  const wBM25 = weights.bm25Weight ?? 0.45;
  const wSem = weights.semanticWeight ?? 0.35;
  const wPop = weights.popularityWeight ?? 0.10;
  const wFresh = weights.freshnessWeight ?? 0.10;

  // Union of all candidate chunk IDs
  const chunkMap = new Map<
    string,
    {
      documentId: string;
      pageNumber: number;
      rawBM25: number;
      rawSem: number;
      matchedTerms: string[];
    }
  >();

  for (const b of bm25Results) {
    chunkMap.set(b.chunkId, {
      documentId: b.documentId,
      pageNumber: b.pageNumber,
      rawBM25: b.bm25Score,
      rawSem: 0,
      matchedTerms: b.matchedTerms,
    });
  }

  for (const v of vectorResults) {
    if (chunkMap.has(v.chunkId)) {
      chunkMap.get(v.chunkId)!.rawSem = v.similarity;
    } else {
      chunkMap.set(v.chunkId, {
        documentId: v.documentId,
        pageNumber: v.pageNumber,
        rawBM25: 0,
        rawSem: v.similarity,
        matchedTerms: [],
      });
    }
  }

  const chunkEntries = Array.from(chunkMap.entries());
  if (chunkEntries.length === 0) return [];

  // Normalize BM25 and Semantic scores to [0, 1]
  const normBM25 = normalizeScores(chunkEntries.map(([_, v]) => v.rawBM25));
  const normSem = normalizeScores(chunkEntries.map(([_, v]) => v.rawSem));

  // Collect unique document IDs and fetch their metadata
  const docIds = Array.from(new Set(chunkEntries.map(([_, v]) => v.documentId)));
  const docs = await DocumentModel.find({ _id: { $in: docIds } }).lean();
  const docMap = new Map(docs.map((d) => [(d._id as any).toString(), d]));

  // Also fetch chunk contents
  const chunkIds = chunkEntries.map(([id]) => id);
  const chunksData = await DocumentChunk.find(
    { _id: { $in: chunkIds } },
    { _id: 1, content: 1 }
  ).lean();
  const contentMap = new Map(chunksData.map((c) => [(c._id as any).toString(), c.content]));

  const now = Date.now();
  const oneYearMs = 365 * 24 * 60 * 60 * 1000;

  const candidates: HybridResultItem[] = [];

  for (let i = 0; i < chunkEntries.length; i++) {
    const [chunkId, raw] = chunkEntries[i];
    const doc = docMap.get(raw.documentId);
    if (!doc) continue;

    // Apply metadata filters if provided
    if (filters?.department && doc.department.toLowerCase() !== filters.department.toLowerCase()) {
      continue;
    }
    if (filters?.semester && doc.semester && doc.semester !== Number(filters.semester)) {
      continue;
    }
    if (filters?.type && doc.type.toLowerCase() !== filters.type.toLowerCase()) {
      continue;
    }
    if (filters?.subject && !doc.subject.toLowerCase().includes(filters.subject.toLowerCase())) {
      continue;
    }

    const sBM25 = normBM25[i];
    const sSem = normSem[i];

    // Popularity score: based on views and downloads
    const popularity = Math.min(1.0, ((doc.viewsCount || 0) + (doc.downloadsCount || 0) * 2) / 100);

    // Freshness score: decay over time
    const ageMs = Math.max(0, now - new Date(doc.createdAt).getTime());
    const freshness = Math.max(0, 1.0 - ageMs / oneYearMs);

    // Starting scoring model from Section 4 of PDF:
    // Final Score = 0.45 * TF-IDF + 0.35 * Semantic Similarity + 0.10 * Popularity + 0.10 * Freshness
    const finalScore =
      wBM25 * sBM25 +
      wSem * sSem +
      wPop * popularity +
      wFresh * freshness;

    let matchType: 'hybrid' | 'bm25' | 'semantic' = 'hybrid';
    if (sBM25 > 0.1 && sSem < 0.1) matchType = 'bm25';
    else if (sSem > 0.1 && sBM25 < 0.1) matchType = 'semantic';

    candidates.push({
      chunkId,
      documentId: raw.documentId,
      documentTitle: doc.title,
      documentType: doc.type,
      department: doc.department,
      semester: doc.semester,
      subject: doc.subject,
      academicYear: doc.academicYear,
      fileUrl: doc.fileUrl,
      pageNumber: raw.pageNumber,
      content: contentMap.get(chunkId) || '',
      bm25Score: Number(sBM25.toFixed(4)),
      semanticScore: Number(sSem.toFixed(4)),
      popularityScore: Number(popularity.toFixed(4)),
      freshnessScore: Number(freshness.toFixed(4)),
      finalScore: Number(finalScore.toFixed(4)),
      matchType,
      matchedTerms: raw.matchedTerms,
    });
  }

  candidates.sort((a, b) => b.finalScore - a.finalScore);
  return candidates.slice(0, limit);
};

