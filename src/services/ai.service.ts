import axios from 'axios';

const AI_FOR_THAI_API_KEY = process.env.AIFORTHAI_API_KEY || 'H89DBryUcOTzZsNUOyLytPFnZq8a5QRD';

export class AiForThaiService {
  static async textToSpeech(text: string, speaker: string = 'nana'): Promise<Buffer> {
    try {
      console.log(`[AI For Thai] Requesting TTS for: "${text}" with speaker: ${speaker}`);
      const ttsResponse = await axios.post(
        'https://api.aiforthai.in.th/vaja',
        { text, speaker },
        {
          headers: {
            'Apikey': AI_FOR_THAI_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      const audioUrl = ttsResponse.data?.audio_url;
      if (!audioUrl) {
        throw new Error('No audio_url returned from AI For Thai Vaja API');
      }

      console.log(`[AI For Thai] Downloading audio from: ${audioUrl}`);
      const audioResponse = await axios.get(audioUrl, {
        responseType: 'arraybuffer',
        headers: {
          'Apikey': AI_FOR_THAI_API_KEY
        }
      });

      return Buffer.from(audioResponse.data);
    } catch (error: any) {
      console.error('[AI For Thai] TTS Error:', error.message);
      throw error;
    }
  }
}