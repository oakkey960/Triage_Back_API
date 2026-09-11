import { Router } from 'express';
import { generateSpeech } from '../controllers/ai.controller';

const router = Router();

router.post('/tts', generateSpeech);

export default router;
