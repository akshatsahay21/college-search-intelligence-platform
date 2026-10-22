const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

p.$queryRawUnsafe(`
  SELECT c."id" AS "chunkId", c."content", c."pageNumber",
    1 AS semantic_score,
    ts_rank(to_tsvector('english', c."content"), plainto_tsquery('english', 'rdcrcr')) AS keyword_score,
    1 AS hybrid_score,
    d."title", d."type", d."department", d."semester"
  FROM "DocumentChunk" c
  JOIN "Document" d ON c."documentId" = d."id"
  WHERE c."content" ILIKE '%rdcrcr%' OR to_tsvector('english', c."content") @@ plainto_tsquery('english', 'rdcrcr')
  LIMIT 10;
`)
  .then(d=>console.log('SUCCESS:', d))
  .catch(e=>console.log('ERROR:', e))
  .finally(()=>p.$disconnect());