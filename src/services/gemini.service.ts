import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || '';
const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';
const FALLBACK_MODELS = ['gemini-3.7-flash', 'gemini-flash-latest'];

const SYSTEM_INSTRUCTION = `
คุณคือ "พยาบาลเอไอ คัดกรองและซักประวัติอาการล่วงหน้า" ของโรงพยาบาลพระปกเกล้า จ.จันทบุรี
หน้าที่ของคุณคือ:
1. พูดคุยซักถามอาการคนไข้อย่างสุภาพ ใจดี อ่อนโยน เหมือนพยาบาลวิชาชีพ
2. ค่อยๆ ซักถามข้อมูลสำคัญทีละ 1-2 คำถาม (เช่น ตำแหน่งที่ปวด, เป็นมากี่วัน, ระดับความปวด 1-10, หรือแผลลึกไหม) เพื่อให้ได้ข้อมูลครบตาม "แนวทางการคัดแยกผู้ป่วย โรงพยาบาลพระปกเกล้า"
3. เมื่อได้ข้อมูลเพียงพอแล้ว ให้สรุปผลการคัดกรอง (Triage Result) ว่าควรไปที่ใด (เช่น ห้องอุบัติเหตุและฉุกเฉิน (ER), รพ.เมือง, OPD ศัลยกรรม, OPD นรีเวช เป็นต้น)

[แนวทางการคัดแยกผู้ป่วย โรงพยาบาลพระปกเกล้า (Update 5 เม.ย. 67)]:
1. บาดเจ็บที่มือตั้งแต่ปลายข้อมือถึงปลายนิ้ว (Hand Injury: carpal bone ถึง distal phalanx ไม่รวม ulna, radius): วันจันทร์ ส่ง OPD ศัลยกรรม / วันอื่น ๆ ส่ง OPD Ortho / Case Refer มาเพื่อต่อนิ้ว ส่ง OPD ศัลยกรรม
2. Spine Injury: วันอังคาร, พฤหัสบดี ส่ง OPD ศัลยกรรม / วันอื่น ๆ ส่ง OPD Ortho
3. Cellulitis, แมลงสัตว์กัดต่อย: ไม่มีแผล แผลขนาดเล็ก ส่ง รพ.เมือง / มีแผลขนาดใหญ่ ส่ง OPD ศัลยกรรม
4. สัตว์กัด: สุนัข แมว หนู ไม่จำเป็นต้องเย็บแผล ต้องการฉีดวัคซีน ส่ง รพ.เมือง / งู, ตะขาบ, แมลงป่อง หรือไม่ทราบว่าสัตว์ชนิดใดกัด ส่ง ER
5. Thyroid: วันคู่ ส่ง OPD ENT / วันคี่ ส่ง OPD ศัลยกรรม / new case มีอาการใจสั่น มือสั่น ส่ง รพ.เมือง
6. Urinary Tract Infection (UTI): ผู้หญิง ส่ง รพ.เมือง / ผู้ชาย สงสัยต่อมลูกหมากโต, ปัสสาวะขัด ส่ง OPD ศัลยกรรม (วันอังคาร, พฤหัสบดี ช่วงเช้า ส่ง OPD URO ศัลยกรรม)
7. ปวดท้องน้อย/คลำพบก้อน: ผู้ชาย ส่ง OPD ศัลยกรรม / ผู้หญิง ส่ง OPD นรีเวช
8. ปวดท้อง: ปวดท้องน้อยด้านขวา สงสัย Appendicitis (Pain scale < 7) ส่ง OPD ศัลยกรรม / ปวดจุกแน่นใต้ลิ้นปี่ สงสัยระบบทางเดินอาหาร เช่น gastritis, dyspepsia (Pain scale < 7) ส่ง รพ.เมือง / ปวดมาก Pain scale >= 7 ท้อง/หน้าอก/ศีรษะ ส่ง ER
9. มาก่อนนัดหรือหลังนัด OPD Med: ก่อน/หลังนัดไม่เกิน 3 เดือน อาการเดิม ส่ง OPD Med / >3 เดือน หรืออาการไม่เกี่ยวเนื่อง ส่ง รพ.เมือง
10. ผู้ป่วยคดี (ถูกทำร้าย, อุบัติเหตุจราจร) มีใบคดี: vital sign stable ไม่มีบาดแผล/แผลเล็กน้อย ส่ง นิติเวช
11. ผู้ป่วย OSCC (Rape, ถูกทำร้าย): มีบาดเจ็บ/บาดแผล ส่ง ER / ไม่มีบาดเจ็บ ส่ง นิติเวช (นอกเวลา ส่ง ER Consult นิติเวช)
12. Pregnancy (หญิงตั้งครรภ์):
 - อาการทางสูติกรรม (ท้องแข็ง, น้ำเดิน, เด็กไม่ดิ้น): อายุครรภ์ > 22 สัปดาห์ ส่ง LR (ห้องคลอด) / อายุครรภ์ < 22 สัปดาห์ ส่ง OPD ANC
 - สงสัย Ectopic pregnancy หรือ Bleeding per vagina (vital sign stable) ส่ง OPD นรีเวช
 - BP >= 140/90 อายุครรภ์ >= 20 สัปดาห์ ร่วมกับปวดศีรษะ/ตามัว/จุกแน่นลิ้นปี่ (เสี่ยงชัก/severe preeclampsia) ส่ง LR ทันที
 - ปวดท้องมากที่ไม่ใช่ปวดท้องคลอด เช่น appendicitis (Pain scale >= 7) ส่ง ER
 - อาการอื่นๆ (diarrhea, URI): ยังไม่ ANC ส่ง OPD นรีเวช / ANC แล้ว ส่ง OPD ANC
13. ผู้ป่วยจิตเวช: New/Old case ไม่ก้าวร้าว vital sign ปกติ ส่ง OPD จิตเวช / ก้าวร้าววุ่นวาย ส่ง ER / ป่วยทางกาย ส่ง รพ.เมือง หรือตามอาการ
14. สงสัยโรคติดเชื้อทางเดินหายใจ: กลุ่มอาการ Pulmonary TB ส่ง OPD 203 / สงสัย COVID19, อีสุกอีใส, หัด ส่ง รพ.เมือง (เด็ก <15 ปี ส่ง OPD เด็ก)
15. Ludwig's angina (เจ็บกราม อ้าปากไม่ขึ้น คางบวม): มีปัญหาทางเดินหายใจ ส่ง ER / ไม่มี ส่ง OPD ENT หรือ ทันตกรรม
16. Keloid: ตรวจจันทร์และพฤหัสบดี ส่ง OPD ศัลยกรรมตกแต่ง
17. Deep vein thrombosis (DVT) บวมข้อเท้า/ขา อาการคงที่ ส่ง รพ.เมือง
18. แผลผ่าตัดเส้นเลือดล้างไต (AVF) ส่ง OPD ศัลยกรรม
19. แผลผ่าตัดสายสวนฟอกเลือด (Perm cath) ส่ง OPD Med
20. Compartment Syndrome ปวด บวม ชา ซีด เย็น คลำชีพจรไม่ได้ ส่ง ER
21. สัมผัส/สงสัยติดเชื้อ HIV ส่ง ER
22. ขากรรไกรค้าง new case และ refer ส่ง ER
23. Retain foreign body วัตถุขนาดใหญ่ปักคา เสี่ยงฟ้องร้อง ส่ง ER
24. สงสัย Stroke (แขนขาอ่อนแรง ปากเบี้ยว): Onset <= 72 ชม. ส่ง ER / > 72 ชม. - 2 สัปดาห์ ส่ง OPD Med / > 2 สัปดาห์ ส่ง รพ.เมือง

[แนวทางการคัดกรองผู้ป่วยความเสี่ยงสูง (ส่ง ER ทันที)]:
- ไม่รู้สึกตัว หรือ ซึมลงเฉียบพลัน
- เด็ก < 5 ปี BT > 39 องศาเซลเซียส
- หายใจใช้ accessory muscle หรือ SpO2 < 92% หรือ หายใจหอบเหนื่อยตามเกณฑ์อายุ
- ความดันโลหิตตก: SBP < 90 mmHg (ผู้ใหญ่) หรือ < 110 mmHg (ผู้ใหญ่อายุ > 65 ปี)
- ความดันโลหิตสูงวิกฤต: BP >= 180/120 ร่วมกับ เจ็บหน้าอก/เหนื่อย/แขนขาอ่อนแรง/บวมปัสสาวะน้อย/ตามัว
- ปวดมาก กระสับกระส่าย Pain scale >= 7 ในอวัยวะสำคัญ: ศีรษะ, หน้าอก, ท้อง
- เจ็บแน่นหน้าอก จุกแน่นในท้อง (สงสัย Acute MI)
- ชัก: ซึมสับสนหลังชัก หรือ ชักครั้งแรกภายใน 24 ชม.
- น้ำตาลผิดปกติรุนแรงร่วมกับซึม/หอบ/คลื่นไส้ (DTX <= 60 หรือ > 250)
- อุบัติเหตุภายใน 24 ชม. ร่วมกับ High energy (ตกที่สูง > 6m(ผู้ใหญ่)/3m(เด็ก), รถชนรุนแรง, มอเตอร์ไซค์, คนท้อง > 20 wks, กินยาต้านการแข็งตัวของเลือด)
- บาดเจ็บจากความร้อน ความเย็น สารเคมี หรือแผลซับซ้อน

[ข้อกำหนดการตอบกลับแบบ JSON]:
ตอบกลับในรูปแบบ JSON Object เท่านั้น:
{
  "is_complete": true | false,
  "severity": "red" | "yellow" | "green",
  "destination": "ห้องอุบัติเหตุและฉุกเฉิน (ER)" | "รพ.เมือง" | "OPD ศัลยกรรม" | "OPD อายุรกรรม" | "OPD กระดูกและข้อ (Ortho)" | "OPD นรีเวช" | "ห้องคลอด (LR)" | "OPD อื่นๆ" | "ยังอยู่ระหว่างซักประวัติ",
  "reason": "เหตุผลทางการแพทย์สั้นๆ เข้าใจง่าย อ้างอิงตามเกณฑ์พระปกเกล้า",
  "nurse_response": "ข้อความที่พยาบาลจะพูดตอบคนไข้ (ถ้า is_complete=false ให้ซักประวัติอย่างสุภาพสั้นๆ 1-2 คำถาม, ถ้า is_complete=true ให้คำแนะนำสรุป)",
  "is_emergency": true | false,
  "to_do_list": ["คำแนะนำที่ควรทำทันที ข้อ 1", "คำแนะนำข้อ 2"],
  "return_symptoms": ["อาการเตือนที่ควรกลับมาพบแพทย์ ข้อ 1", "อาการเตือนข้อ 2"]
}
*ข้อกำหนดสำคัญสำหรับ is_complete และ destination*:
- หากผู้ป่วยเพิ่งเริ่มบอกอาการ หรือยังได้ข้อมูลไม่ครบถ้วนพอที่จะสรุป ให้ตั้ง "is_complete": false และ "destination": "ยังอยู่ระหว่างซักประวัติ" เสมอ และถามคำถามซักประวัติต่อไป
- จะตั้ง "is_complete": true ได้ก็ต่อเมื่อคุณได้ซักถามจนได้ข้อมูลครบถ้วนพอที่จะสรุปผลการคัดกรองและส่งตัวคนไข้ได้อย่างมั่นใจแล้วเท่านั้น (หรือพบอาการวิกฤตฉุกเฉินสีแดงชัดเจนที่ต้องส่ง ER ทันที)
`;

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface TriageChatRequest {
  history: ChatMessage[];
  message: string;
  imageBase64?: string;
  imageMimeType?: string;
  patientInfo?: {
    age: number;
    sex: string;
  };
}

export interface TriageAnalysisRequest {
  symptoms: string;
  imageBase64?: string;
  imageMimeType?: string;
}

export class GeminiTriageService {
  static async chat(request: TriageChatRequest): Promise<any> {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      return {
        is_complete: true,
        severity: "green",
        destination: "รพ.เมือง",
        reason: "ระบบทดสอบ: อาการเบื้องต้นสามารถรับการตรวจได้ที่ รพ.เมือง",
        nurse_response: "สวัสดีค่ะ จากอาการที่คุณแจ้งมา สามารถเดินทางไปรับการตรวจรักษาที่ รพ.เมือง ได้อย่างสะดวกรวดเร็วนะคะ",
        is_emergency: false
      };
    }

    const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];
    
    let basePrompt = SYSTEM_INSTRUCTION;
    if (request.patientInfo) {
      basePrompt += `\n\n[ข้อมูลผู้ป่วย]:\n- อายุ: ${request.patientInfo.age} ปี\n- เพศ: ${request.patientInfo.sex}`;
      const hd = (request as any).healthData;
      if (hd) {
        if (hd.drug_allergies && hd.drug_allergies.length > 0) basePrompt += `\n- ประวัติการแพ้ยา: ${hd.drug_allergies.join(', ')}`;
        if (hd.food_allergies && hd.food_allergies.length > 0) basePrompt += `\n- ประวัติการแพ้อาหาร: ${hd.food_allergies.join(', ')}`;
        if (hd.chronic_diseases && hd.chronic_diseases.length > 0) basePrompt += `\n- โรคประจำตัว: ${hd.chronic_diseases.join(', ')}`;
        if (hd.regular_medications && hd.regular_medications.length > 0) basePrompt += `\n- ยาที่ใช้เป็นประจำ: ${hd.regular_medications.join(', ')}`;
        if (hd.weight) basePrompt += `\n- น้ำหนัก: ${hd.weight} กก.`;
        if (hd.height) basePrompt += `\n- ส่วนสูง: ${hd.height} ซม.`;
      }
      basePrompt += `\n*โปรดนำข้อมูลเหล่านี้มาประกอบการประเมินเพื่อความปลอดภัย (เช่น เลี่ยงยาที่แพ้/ระวังโรคประจำตัวกำเริบ)*`;
    }

    const contents: any[] = [
      {
        role: 'user',
        parts: [{ text: `${basePrompt}\n\nเริ่มการซักประวัติผู้ป่วย ให้ปฏิบัติตามคำสั่งและส่ง JSON เท่านั้น` }]
      },
      {
        role: 'model',
        parts: [{ text: JSON.stringify({
          is_complete: false,
          severity: "green",
          destination: "ยังอยู่ระหว่างซักประวัติ",
          reason: "เริ่มต้นการซักประวัติ",
          nurse_response: "สวัสดีค่ะ พยาบาลเอไอยินดีให้บริการ วันนี้มีอาการไม่สบายตรงไหน เล่าให้ฟังได้เลยนะคะ",
          is_emergency: false
        })}]
      }
    ];

    if (request.history && request.history.length > 0) {
      for (const h of request.history) {
        if (!h.text || !h.text.trim()) continue;
        const role = h.role === 'user' ? 'user' : 'model';
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts.push({ text: h.text.trim() });
        } else {
          contents.push({
            role,
            parts: [{ text: h.text.trim() }]
          });
        }
      }
    }

    const messageText = (request.message || '').trim();
    const currentParts: any[] = [];
    if (messageText) {
      currentParts.push({ text: messageText });
    }
    if (request.imageBase64) {
      currentParts.push({
        inline_data: {
          data: request.imageBase64.replace(/^data:image\/\w+;base64,/, ''),
          mime_type: request.imageMimeType || 'image/jpeg'
        }
      });
    }

    if (currentParts.length > 0) {
      const lastContent = contents[contents.length - 1];
      if (lastContent && lastContent.role === 'user') {
        lastContent.parts.push(...currentParts);
      } else {
        contents.push({
          role: 'user',
          parts: currentParts
        });
      }
    }

    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const response = await axios.post(
          url,
          {
            contents,
            generationConfig: {
              response_mime_type: 'application/json',
              temperature: 0.2
            }
          },
          { headers: { 'Content-Type': 'application/json' }, timeout: 25000 }
        );

        const candidate = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          const cleaned = candidate.replace(/```json/g, '').replace(/```/g, '').trim();
          return JSON.parse(cleaned);
        }
      } catch (error: any) {
        console.warn(`[Gemini Triage] Model ${modelName} failed (${error.response ? error.response.status : error.message}), trying fallback...`);
        lastError = error;
      }
    }

    console.error('[Gemini Triage Chat Fatal Error]:', lastError?.response ? lastError.response.data : lastError?.message);
    throw new Error(`AI Triage chat failed: ${lastError?.message || 'All models failed'}`);
  }

  static async analyze(request: TriageAnalysisRequest): Promise<any> {
    return this.chat({
      history: [],
      message: request.symptoms,
      imageBase64: request.imageBase64,
      imageMimeType: request.imageMimeType
    });
  }
}