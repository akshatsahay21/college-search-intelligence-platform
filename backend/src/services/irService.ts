import mongoose from 'mongoose';
import { InvertedIndex } from '../models/InvertedIndex';
import { DocumentChunk } from '../models/DocumentChunk';

// Standard English stop words
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing',
  'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t',
  'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers',
  'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in',
  'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my',
  'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours',
  'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should',
  'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them',
  'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d',
  'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where',
  'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would',
  'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

/**
 * Lightweight algorithmic stemmer (Porter-inspired)
 */
export const stemWord = (word: string): string => {
  let w = word.toLowerCase();
  if (w.length < 3) return w;

  // Step 1: Plurals and past tense
  if (w.endsWith('sses')) w = w.slice(0, -2);
  else if (w.endsWith('ies')) w = w.slice(0, -2);
  else if (w.endsWith('ss')) {}
  else if (w.endsWith('s')) w = w.slice(0, -1);

  if (w.endsWith('eed')) {
    if (w.length > 4) w = w.slice(0, -1);
  } else if (w.endsWith('ing')) {
    if (w.length > 5) w = w.slice(0, -3);
  } else if (w.endsWith('ed')) {
    if (w.length > 4) w = w.slice(0, -2);
  }

  // Step 2: Common suffixes in academic documents
  if (w.endsWith('ational')) w = w.slice(0, -5) + 'e';
  else if (w.endsWith('tional')) w = w.slice(0, -4);
  else if (w.endsWith('ization') || w.endsWith('isation')) w = w.slice(0, -5);
  else if (w.endsWith('ation')) w = w.slice(0, -3);
  else if (w.endsWith('alism')) w = w.slice(0, -3);
  else if (w.endsWith('ment')) w = w.slice(0, -4);
  else if (w.endsWith('able')) w = w.slice(0, -4);
  else if (w.endsWith('ible')) w = w.slice(0, -4);

  return w;
};

/**
 * Full text preprocessing pipeline:
 * Document -> Text -> Tokenization -> Normalization -> Stop-word Removal -> Stemming
 */
export const preprocessText = (text: string): string[] => {
  if (!text) return [];

  // Match words, alphanumeric sequences
  const rawTokens = text.toLowerCase().match(/\b[a-z0-9_]{2,}\b/g) || [];

  const processed: string[] = [];
  for (const token of rawTokens) {
    if (!STOP_WORDS.has(token) && !/^\d+$/.test(token)) {
      const stemmed = stemWord(token);
      if (stemmed.length > 1) {
        processed.push(stemmed);
      }
    }
  }
  return processed;
};

/**
 * Index a list of chunks into the InvertedIndex collection
 */
export const indexChunksInverted = async (
  chunks: Array<{
    chunkId: mongoose.Types.ObjectId;
    documentId: mongoose.Types.ObjectId;
    content: string;
    pageNumber: number;
  }>
): Promise<void> => {
  const termMap = new Map<
    string,
    Array<{
      chunkId: mongoose.Types.ObjectId;
      documentId: mongoose.Types.ObjectId;
      termFrequency: number;
      docLength: number;
      pageNumber: number;
    }>
  >();

  for (const chunk of chunks) {
    const tokens = preprocessText(chunk.content);
    const docLength = tokens.length;
    const freqMap = new Map<string, number>();

    for (const t of tokens) {
      freqMap.set(t, (freqMap.get(t) || 0) + 1);
    }

    for (const [term, freq] of freqMap.entries()) {
      if (!termMap.has(term)) {
        termMap.set(term, []);
      }
      termMap.get(term)!.push({
        chunkId: chunk.chunkId,
        documentId: chunk.documentId,
        termFrequency: freq,
        docLength,
        pageNumber: chunk.pageNumber,
      });
    }
  }

  // Bulk update MongoDB InvertedIndex
  const bulkOps = [];
  for (const [term, postings] of termMap.entries()) {
    bulkOps.push({
      updateOne: {
        filter: { term },
        update: {
          $push: { postings: { $each: postings } },
          $inc: { documentFrequency: postings.length },
        },
        upsert: true,
      },
    });
  }

  if (bulkOps.length > 0) {
    await InvertedIndex.bulkWrite(bulkOps);
  }
};

export interface BM25Result {
  chunkId: string;
  documentId: string;
  pageNumber: number;
  bm25Score: number;
  matchedTerms: string[];
}

/**
 * Search candidate chunks using custom BM25 ranking algorithm
 */
export const searchBM25 = async (
  query: string,
  limit: number = 20,
  k1: number = 1.5,
  b: number = 0.75
): Promise<BM25Result[]> => {
  const queryTokens = preprocessText(query);
  if (queryTokens.length === 0) return [];

  // 1. Get total number of chunks (N) and calculate avgdl
  const totalChunks = await DocumentChunk.countDocuments();
  if (totalChunks === 0) return [];

  // Estimate or calculate average document length
  const avgdl = 120; // Default average chunk word count

  // 2. Fetch inverted index entries for all query tokens
  const indexEntries = await InvertedIndex.find({
    term: { $in: queryTokens },
  }).lean();

  const chunkScores = new Map<
    string,
    {
      documentId: string;
      pageNumber: number;
      score: number;
      matchedTerms: Set<string>;
    }
  >();

  for (const entry of indexEntries) {
    const term = entry.term;
    const n_t = entry.documentFrequency || entry.postings.length;

    // Standard Robertson-Spärck Jones IDF
    const idf = Math.max(
      0.01,
      Math.log((totalChunks - n_t + 0.5) / (n_t + 0.5) + 1.0)
    );

    for (const posting of entry.postings) {
      const chunkIdStr = posting.chunkId.toString();
      const f = posting.termFrequency;
      const docLen = posting.docLength || avgdl;

      // BM25 term saturation formula
      const numerator = f * (k1 + 1);
      const denominator = f + k1 * (1 - b + b * (docLen / avgdl));
      const termScore = idf * (numerator / denominator);

      if (!chunkScores.has(chunkIdStr)) {
        chunkScores.set(chunkIdStr, {
          documentId: posting.documentId.toString(),
          pageNumber: posting.pageNumber,
          score: 0,
          matchedTerms: new Set(),
        });
      }

      const current = chunkScores.get(chunkIdStr)!;
      current.score += termScore;
      current.matchedTerms.add(term);
    }
  }

  // Convert to array and sort descending by score
  const results: BM25Result[] = Array.from(chunkScores.entries()).map(
    ([chunkId, data]) => ({
      chunkId,
      documentId: data.documentId,
      pageNumber: data.pageNumber,
      bm25Score: data.score,
      matchedTerms: Array.from(data.matchedTerms),
    })
  );

  results.sort((a, b) => b.bm25Score - a.bm25Score);
  return results.slice(0, limit);
};

/**
 * Re-index all chunks in the entire database (Admin triggered)
 */
export const rebuildInvertedIndex = async (): Promise<{ totalIndexed: number }> => {
  await InvertedIndex.deleteMany({});
  const allChunks = await DocumentChunk.find({}).lean();

  const formatted = allChunks.map((c) => ({
    chunkId: c._id as mongoose.Types.ObjectId,
    documentId: c.documentId as mongoose.Types.ObjectId,
    content: c.content,
    pageNumber: c.pageNumber,
  }));

  // Chunk batch size for indexing
  const batchSize = 100;
  for (let i = 0; i < formatted.length; i += batchSize) {
    const batch = formatted.slice(i, i + batchSize);
    await indexChunksInverted(batch);
  }

  return { totalIndexed: allChunks.length };
};

