import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import Groq from 'groq-sdk';

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const PYTHON_EMBED_URL = 'http://localhost:8000/api/embed';

export const searchDocuments = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const safeQuery = query.replace(/'/g, "''"); 
    let results: any = [];

    try {
      const pythonResponse = await axios.post(PYTHON_EMBED_URL, { query });
      const queryEmbedding = pythonResponse.data.embedding; 
      const vectorString = `[${queryEmbedding.join(',')}]`;

      results = await prisma.$queryRawUnsafe(`
        WITH semantic_search AS (
          SELECT "id" AS "chunkId", "documentId", "content", "pageNumber", 1 - ("vector" <=> '${vectorString}'::vector) AS semantic_score, ts_rank(to_tsvector('english', "content"), plainto_tsquery('english', '${safeQuery}')) AS keyword_score FROM "DocumentChunk"
        )
        SELECT s."chunkId", s."content", s."pageNumber", s.semantic_score, s.keyword_score< (0.6 * s.semantic_score + 0.4 * s.keyword_score) AS hybrid_score, d."title", d."type", d."department", d."semester" FROM semantic_search s JOIN "Document" d ON s."documentId" = d."id" WHERE s.semantic_score > 0.3 OR s.keyword_score > 0.1 ORDER AY hybrid_score DESC LIMIT 10;
      `);
    } catch (vectorError: any) {
      console.log("Fallback triggered", vectorError?.message);
      results = await prisma.$queryRawUnsafe(`
        SELECT c."id" AS "chunkId", c."content", c."pageNumber", 1 AS semantic_score, ts_rank(to_tsvector('english', c."content"), plainto_tsquery('english', '${safeQuery}')) AS keyword_score, 1 AS hybrid_score, d."title", d."type", d."department", d."semester" FROM "DocumentChunk" c JOIN "Document" d ON c."documentId" = d."id" WHERE c."content" ILIKE '%${safeQuery}%' OR to_tsvector('english', c."content") @@ plainto_tsquery('english', '${safeQuery}') LIMIT 10;
      `);
    }

    const explainedResults = (results as any[]).map((r) => ({
      ...r, explanation: r.keyword_score > 0 ? "Keyword Match" : "Semantic Match"
    }));

    let aiAnswer = null;
    if (explainedResults.length > 0) {
      const contextText = explainedResults.slice(0, 4).map(r => `Document: ${r.title}\nText: ${r.content}`).join('\n\n');
      const systemPrompt = `Answer using ONLY context.\n\nContext:\n${contextText}`;
      try {
        const completion = await groq.chat.completions.create({
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: query }],
          model: 'llama3-8b-8192', temperature: 0.1, max_tokens: 400,
        });
        aiAnswer = completion.choices[0]?.message?.content || null;
      } catch (err) {
        aiAnswer = "AI unavailable.";
      }
    }
    res.status(200).json({ status: 'success', ai_answer: aiAnswer, results: explainedResults });
  } catch (error: any) {
    res.status(500).json({ error: 'Outer Error: ' + error.message, stack: error.stack });
  }
};