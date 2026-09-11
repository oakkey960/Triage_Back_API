import { Request, Response } from 'express';
import { AiForThaiService } from '../services/ai.service';

export const generateSpeech = async (req: Request, res: Response) => {
  try {
    const { text, speaker } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const audioBuffer = await AiForThaiService.textToSpeech(text, speaker);
    
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Disposition', 'inline; filename="nurse.wav"');
    res.send(audioBuffer);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate speech' });
  }
};
