import { Router } from 'express';
import { searchDocuments } from '../controllers/searchController';

const router = Router();

router.get('/', searchDocuments as any);

export default router;
