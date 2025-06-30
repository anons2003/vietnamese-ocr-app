import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyBwrtV75DPyLGPnswoBwL_UxQ8uuvNbsEc');

export interface GeminiEnhancementOptions {
  language: string;
  context?: string;
  preserveFormatting?: boolean;
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  /**
   * Enhance OCR text using Gemini AI
   * Corrects spelling, grammar, and improves readability
   */
  async enhanceOCRText(
    ocrText: string, 
    options: GeminiEnhancementOptions = { language: 'vie' }
  ): Promise<string> {
    if (!ocrText || ocrText.trim().length === 0) {
      return ocrText;
    }

    try {
      const prompt = this.buildEnhancementPrompt(ocrText, options);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const enhancedText = response.text();

      // Return enhanced text, fallback to original if enhancement fails
      return enhancedText.trim() || ocrText;
    } catch (error) {
      console.error('Gemini enhancement error:', error);
      // Return original text if enhancement fails
      return ocrText;
    }
  }

  /**
   * Build enhancement prompt based on language and context
   */
  private buildEnhancementPrompt(text: string, options: GeminiEnhancementOptions): string {
    const { language, context, preserveFormatting } = options;
    
    let prompt = '';

    if (language === 'vie') {
      prompt = `
Bạn là một chuyên gia xử lý văn bản tiếng Việt. Hãy cải thiện văn bản OCR sau đây:

NHIỆM VỤ:
1. Sửa lỗi chính tả và dấu thanh tiếng Việt
2. Sửa lỗi ngữ pháp và cấu trúc câu
3. Cải thiện độ rõ ràng và tự nhiên của văn bản
4. Giữ nguyên ý nghĩa gốc
${preserveFormatting ? '5. Giữ nguyên định dạng (xuống dòng, khoảng cách)' : '5. Tối ưu định dạng cho dễ đọc'}
${context ? `6. Ngữ cảnh: ${context}` : ''}

VĂN BẢN GỐC:
${text}

VĂN BẢN ĐÃ CẢI THIỆN:`;
    } else {
      prompt = `
You are a text processing expert. Please improve the following OCR text:

TASKS:
1. Fix spelling and grammar errors
2. Improve sentence structure and clarity
3. Make the text more natural and readable
4. Preserve the original meaning
${preserveFormatting ? '5. Preserve original formatting (line breaks, spacing)' : '5. Optimize formatting for readability'}
${context ? `6. Context: ${context}` : ''}

ORIGINAL TEXT:
${text}

IMPROVED TEXT:`;
    }

    return prompt;
  }

  /**
   * Analyze text content and suggest context
   */
  async analyzeTextContext(text: string): Promise<string> {
    if (!text || text.trim().length < 20) {
      return '';
    }

    try {
      const prompt = `
Analyze this text and identify its type/context in one short phrase (e.g., "business document", "academic paper", "personal letter", "technical manual", "news article", "recipe", "invoice", etc.):

Text: ${text.substring(0, 200)}...

Context:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Context analysis error:', error);
      return '';
    }
  }

  /**
   * Smart text formatting for different document types
   */
  async smartFormat(text: string, documentType?: string): Promise<string> {
    if (!text || text.trim().length === 0) {
      return text;
    }

    try {
      const prompt = `
Format this text appropriately for a ${documentType || 'general document'}. 
Improve paragraph structure, add proper spacing, and organize content logically.
Keep the original content but make it well-formatted and professional.

Original text:
${text}

Formatted text:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim() || text;
    } catch (error) {
      console.error('Smart formatting error:', error);
      return text;
    }
  }

  /**
   * Extract and structure key information from text
   */
  async extractKeyInfo(text: string): Promise<{
    summary: string;
    keyPoints: string[];
    entities: string[];
  }> {
    if (!text || text.trim().length < 50) {
      return {
        summary: text,
        keyPoints: [],
        entities: []
      };
    }

    try {
      const prompt = `
Analyze this text and extract:
1. A brief summary (1-2 sentences)
2. Key points (3-5 bullet points)
3. Important entities (names, dates, numbers, locations)

Format as JSON:
{
  "summary": "...",
  "keyPoints": ["...", "..."],
  "entities": ["...", "..."]
}

Text: ${text}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const jsonText = response.text().trim();
      
      try {
        return JSON.parse(jsonText);
      } catch {
        return {
          summary: text.substring(0, 100) + '...',
          keyPoints: [],
          entities: []
        };
      }
    } catch (error) {
      console.error('Key info extraction error:', error);
      return {
        summary: text.substring(0, 100) + '...',
        keyPoints: [],
        entities: []
      };
    }
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
