import { Request, Response } from 'express';
import { GeminiTriageService } from '../services/gemini.service';
import { AppTriageHistory } from '../models/app_triage_history';

export const analyzeSymptoms = async (req: Request, res: Response) => {
  try {
    const { symptoms, imageBase64, imageMimeType } = req.body;

    if (!symptoms && !imageBase64) {
      return res.status(400).json({ error: 'Symptoms text or image is required' });
    }

    const result = await GeminiTriageService.analyze({
      symptoms,
      imageBase64,
      imageMimeType
    });

    res.json({
      status: 'success',
      data: result
    });
  } catch (error: any) {
    console.error('Analyze error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal Server Error'
    });
  }
};

export const chatTriage = async (req: Request, res: Response) => {
  try {
    const { message, history, imageBase64, imageMimeType, location, caregiverContext } = req.body;

    if (!message && !imageBase64) {
      return res.status(400).json({ error: 'Message or image is required' });
    }

    const result = await GeminiTriageService.chat({
      message,
      history: history || [],
      imageBase64,
      imageMimeType,
      patientInfo: undefined,
      healthData: null,
      caregiverContext
    } as any);

    // Save to database anonymously
    if (result.is_complete) {
      try {
        await AppTriageHistory.create({
          citizencardno: 'anonymous',
          chief_complaint: message || history?.[0]?.text || 'ประเมินจากภาพ/เสียง',
          severity: result.severity,
          destination: result.destination,
          reason: result.reason,
          nurse_response: result.nurse_response,
          is_emergency: result.is_emergency,
          latitude: location?.lat || null,
          longitude: location?.lng || null,
          image_data: imageBase64 ? Buffer.from(imageBase64, 'base64') : null,
          image_mime_type: imageMimeType || null
        });
      } catch (err) {
        console.error('Failed to save triage history:', err);
      }
    }

    res.json({
      status: 'success',
      data: result
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal Server Error'
    });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const { cid } = req.params;
    if (!cid) {
      return res.status(400).json({ error: 'CID is required' });
    }
    const history = await AppTriageHistory.findAll({
      where: { citizencardno: cid },
      order: [['createdAt', 'DESC']]
    });
    res.json({ status: 'success', data: history });
  } catch (error: any) {
    console.error('getHistory error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getAdminCases = async (req: Request, res: Response) => {
  try {
    const cases = await AppTriageHistory.findAll({
      order: [['createdAt', 'DESC']]
    });

    const enrichedCases = cases.map((c: any) => {
      const caseData = c.toJSON();
      if (caseData.image_data) {
        caseData.imageBase64 = Buffer.from(caseData.image_data).toString('base64');
        delete caseData.image_data; // Don't send the raw buffer
      }
      return {
        ...caseData,
        user: null // No user data anymore
      };
    });

    res.json({ status: 'success', data: enrichedCases });
  } catch (error: any) {
    console.error('getAdminCases error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
