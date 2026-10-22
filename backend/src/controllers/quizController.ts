import { Request, Response } from 'express';
import Groq from 'groq-sdk';
import { PrismaClient } from '@prisma/client';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const prisma = new PrismaClient();

export const generateQuiz = async (req: Request, res: Response) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    // Fetch context related to the topic
    const chunks = await prisma.documentChunk.findMany({
      where: { content: { contains: topic, mode: 'insensitive' } },
      take: 5
    });

    const context = chunks.map(c => c.content).join('\n');

    const prompt = `You are a strict college professor. Create a 3-question Multiple Choice Quiz about "${topic}". Use the following context if helpful: ${context}. 
    Return ONLY a raw JSON array of objects. Do not include markdown formatting like \`\`\`json.
    Format: [{"question": "...", "options": ["A", "B", "C", "D"], "answer": "A"}]`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
      temperature: 0.3,
    });

    let quizJson = completion.choices[0]?.message?.content || '[]';
    // Clean up markdown formatting just in case
    quizJson = quizJson.replace(/```json/g, '').replace(/```/g, '').trim();

    res.json(JSON.parse(quizJson));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
};
