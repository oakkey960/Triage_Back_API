import { Router } from 'express';
import { analyzeSymptoms, chatTriage, getHistory, getAdminCases } from '../controllers/triage.controller';

const router = Router();

router.post('/analyze', analyzeSymptoms);
router.post('/chat', chatTriage);
router.get('/history/:cid', getHistory);
router.get('/admin/cases', getAdminCases);

export default router;