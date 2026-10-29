import Groq from 'groq-sdk';
import { HybridResultItem } from './hybridRanker';

const apiKey = process.env.GROQ_API_KEY;
export let groq: Groq | null = null;

if (apiKey && apiKey.trim().length > 5 && !apiKey.includes('your_groq_api_key')) {
  groq = new Groq({ apiKey });
}

export interface Citation {
  documentId: string;
  documentTitle: string;
  pageNumber: number;
  snippet: string;
  fileUrl: string;
}

export interface RAGResponse {
  answer: string;
  citations: Citation[];
  modelUsed: string;
  isGrounded: boolean;
}

export const generateRAGAnswer = async (
  query: string,
  topChunks: HybridResultItem[]
): Promise<RAGResponse> => {
  if (topChunks.length === 0) {
    return {
      answer: "No relevant documents found in the college knowledge base for your question. Try searching with different terms or selecting another department filter.",
      citations: [],
      modelUsed: 'none',
      isGrounded: false,
    };
  }

  // Build context and citations
  const citations: Citation[] = topChunks.slice(0, 4).map((c) => ({
    documentId: c.documentId,
    documentTitle: c.documentTitle,
    pageNumber: c.pageNumber,
    snippet: c.content.slice(0, 200) + '...',
    fileUrl: c.fileUrl,
  }));

  const contextText = topChunks
    .slice(0, 4)
    .map(
      (c, idx) =>
        `[Source ${idx + 1}]: "${c.documentTitle}" (Page ${c.pageNumber}, Subject: ${c.subject})\nContent: ${c.content}`
    )
    .join('\n\n');

  if (groq) {
    try {
      const systemPrompt = `You are an intelligent, helpful academic assistant for college students.
Your duty is to answer student questions STRICTLY based on the provided college document excerpts.
Rules:
1. ONLY use information explicitly stated in the context excerpts below.
2. If the context does not contain enough information to answer completely, clearly state what is missing.
3. Cite your sources using [Source X: Document Name, Page Y] inline in your explanation.
4. Keep the tone academic, clear, structured, and easy to study from (bullet points, clear headings).
5. Never hallucinate facts outside the provided college material.

Retrieved Context Excerpts:
${contextText}`;

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
        model: 'qwen/qwen3.8-27b',
        temperature: 0.2,
        max_tokens: 800,
      });

      const rawAnswer = completion.choices[0]?.message?.content || '';
      return {
        answer: rawAnswer,
        citations,
        modelUsed: 'Qwen 3.8 27B (via Groq)',
        isGrounded: true,
      };
    } catch (error: any) {
      console.warn('⚠️ Groq API call failed, falling back to local synthesizer:', error.message);
    }
  }

  // Offline / Fallback Synthesizer when Groq key is not configured
  const topDoc = topChunks[0];
  const summarySnippet = topChunks
    .slice(0, 3)
    .map((c, i) => `• **${c.documentTitle}** (Page ${c.pageNumber}): ${c.content.slice(0, 280)}...`)
    .join('\n\n');

  const fallbackAnswer = `### Grounded Academic Synthesis for: "${query}"

Based on the highest ranking college document (**${topDoc.documentTitle}**, Page ${topDoc.pageNumber}):

${summarySnippet}

*(Note: Connect your GROQ_API_KEY in \`.env\` to enable live Llama 3.1 real-time conversational generation. Direct source grounding from ${topChunks.length} retrieved passages is active).*`;

  return {
    answer: fallbackAnswer,
    citations,
    modelUsed: 'Local Grounded Synthesizer (Fallback)',
    isGrounded: true,
  };
};

