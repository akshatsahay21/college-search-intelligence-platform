import axios from 'axios';
import { DocumentChunk } from '../models/DocumentChunk';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

let isPythonServiceOffline = false;
let lastOfflineCheck = 0;
const RETRY_INTERVAL_MS = 20000; // Retry checking Python service every 20s

/**
 * Computes cosine similarity between two numerical vectors
 */
export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(vecA.length, vecB.length);

  for (let i = 0; i < len; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Fast deterministic fallback embedding (384-dimensional sparse hashing)
 * Ensures the platform and seeding always work instantly even without Python running
 */
const generateFallbackEmbedding = (text: string): number[] => {
  const fallback = new Array(384).fill(0);
  const words = text.toLowerCase().split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = (hash << 5) - hash + word.charCodeAt(c);
      hash |= 0;
    }
    const idx = Math.abs(hash) % 384;
    fallback[idx] += 1;
  }
  const norm = Math.sqrt(fallback.reduce((acc, val) => acc + val * val, 0)) || 1;
  return fallback.map((v) => v / norm);
};

/**
 * Generate embedding for a text query or chunk
 */
export const getEmbedding = async (text: string): Promise<number[]> => {
  const now = Date.now();

  // If we recently found Python service offline, skip probe to keep operations fast
  if (isPythonServiceOffline && now - lastOfflineCheck < RETRY_INTERVAL_MS) {
    return generateFallbackEmbedding(text);
  }

  try {
    const response = await axios.post(
      `${PYTHON_SERVICE_URL}/api/embed`,
      { query: text },
      { timeout: 1200 }
    );
    if (response.data && response.data.embedding) {
      isPythonServiceOffline = false;
      return response.data.embedding;
    }
  } catch (err: any) {
    if (!isPythonServiceOffline) {
      console.log('ℹ️ Python AI service (port 8000) not detected. Using built-in fast fallback embedder.');
    }
    isPythonServiceOffline = true;
    lastOfflineCheck = now;
  }

  return generateFallbackEmbedding(text);
};

export interface VectorSearchResult {
  chunkId: string;
  documentId: string;
  pageNumber: number;
  similarity: number;
}

/**
 * Search top-K chunks via vector cosine similarity
 */
export const searchVectors = async (
  queryVector: number[],
  limit: number = 20,
  candidateChunkIds?: string[]
): Promise<VectorSearchResult[]> => {
  const query: any = {};
  if (candidateChunkIds && candidateChunkIds.length > 0) {
    query._id = { $in: candidateChunkIds };
  }

  const chunks = await DocumentChunk.find(query, {
    _id: 1,
    documentId: 1,
    pageNumber: 1,
    vector: 1,
  }).lean();

  const scored: VectorSearchResult[] = [];

  for (const chunk of chunks) {
    if (chunk.vector && chunk.vector.length > 0) {
      const sim = cosineSimilarity(queryVector, chunk.vector);
      if (sim > 0.05) {
        scored.push({
          chunkId: (chunk._id as any).toString(),
          documentId: (chunk.documentId as any).toString(),
          pageNumber: chunk.pageNumber,
          similarity: sim,
        });
      }
    }
  }

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, limit);
};
