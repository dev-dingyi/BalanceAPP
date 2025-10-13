import { createWorker, type Worker } from 'tesseract.js';
import Anthropic from '@anthropic-ai/sdk';

export interface ReceiptData {
  merchant?: string;
  total?: number;
  currency?: string;
  date?: string;
  time?: string;
  items?: Array<{
    name: string;
    price: number;
  }>;
  rawText: string;
}

export interface ParsedReceipt {
  amount: number;
  currency: 'USD' | 'CNY';
  description: string;
  date: Date;
  time: string;
  location?: string;
  categoryId?: string;
  confidence: number;
}

/**
 * OCR Service using Tesseract.js
 */
class OCRService {
  private worker: Worker | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize Tesseract worker
   */
  async initialize(): Promise<void> {
    if (this.worker) return;

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        console.log('Initializing Tesseract OCR...');
        this.worker = await createWorker('eng+chi_sim', 1, {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          },
        });
        console.log('Tesseract OCR initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Tesseract:', error);
        this.worker = null;
        this.initPromise = null;
        throw error;
      }
    })();

    return this.initPromise;
  }

  /**
   * Extract text from image using OCR
   */
  async extractText(imageFile: File | Blob | string): Promise<string> {
    await this.initialize();

    if (!this.worker) {
      throw new Error('OCR worker not initialized');
    }

    try {
      console.log('Starting OCR text extraction...');
      const result = await this.worker.recognize(imageFile);
      console.log('OCR completed. Confidence:', result.data.confidence);
      return result.data.text;
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  /**
   * Parse receipt text using Claude AI
   */
  async parseReceiptWithAI(
    text: string,
    userCategories: Array<{ id: string; name: string }>
  ): Promise<ParsedReceipt> {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    const categoryList = userCategories.map((c) => `- ${c.name} (id: ${c.id})`).join('\n');

    const prompt = `You are a receipt parsing assistant. Extract transaction information from the following receipt text.

Receipt Text:
${text}

Available Categories:
${categoryList}

Extract the following information:
1. Total amount (required)
2. Currency (USD or CNY)
3. Merchant/store name
4. Date (if available)
5. Time (if available)
6. Best matching category from the list above

Rules:
- Look for keywords like "TOTAL", "总计", "小计", "合计" to find the total amount
- Detect currency from symbols ($ = USD, ¥/元 = CNY) or context
- If no date/time found, use current date/time
- Choose the most appropriate category based on merchant name and context
- Provide a confidence score (0-100) based on text quality

Return ONLY a valid JSON object with this structure:
{
  "amount": 45.50,
  "currency": "CNY",
  "description": "Store Name - Item",
  "date": "2025-10-12",
  "time": "14:30",
  "location": "Store Name",
  "categoryId": "category-id-here",
  "confidence": 85
}`;

    try {
      const message = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Extract JSON from response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Claude response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate and transform
      return {
        amount: parseFloat(parsed.amount),
        currency: parsed.currency === 'CNY' ? 'CNY' : 'USD',
        description: parsed.description || 'Receipt',
        date: parsed.date ? new Date(parsed.date) : new Date(),
        time: parsed.time || new Date().toTimeString().slice(0, 5),
        location: parsed.location,
        categoryId: parsed.categoryId,
        confidence: parsed.confidence || 50,
      };
    } catch (error) {
      console.error('Claude AI parsing failed:', error);
      throw new Error('Failed to parse receipt with AI');
    }
  }

  /**
   * Basic regex-based receipt parsing (fallback)
   */
  parseReceiptBasic(text: string): ReceiptData {
    const lines = text.split('\n').filter((line) => line.trim());

    // Try to find total amount
    let total: number | undefined;
    let currency: string | undefined;

    // Look for common total patterns
    const totalPatterns = [
      /total[:\s]*[\$¥]?\s*(\d+\.?\d*)/i,
      /总计[:\s]*[\$¥]?\s*(\d+\.?\d*)/i,
      /合计[:\s]*[\$¥]?\s*(\d+\.?\d*)/i,
      /[\$¥]\s*(\d+\.?\d*)\s*total/i,
    ];

    for (const pattern of totalPatterns) {
      for (const line of lines) {
        const match = line.match(pattern);
        if (match) {
          total = parseFloat(match[1]);
          // Detect currency from context
          if (line.includes('¥') || line.includes('元') || line.includes('CNY')) {
            currency = 'CNY';
          } else if (line.includes('$') || line.includes('USD')) {
            currency = 'USD';
          }
          break;
        }
      }
      if (total !== undefined) break;
    }

    // Try to find merchant name (usually in first few lines)
    const merchant = lines.slice(0, 3).find((line) => line.length > 3 && line.length < 50);

    // Try to find date
    const datePattern = /(\d{4}[-/]\d{2}[-/]\d{2})|(\d{2}[-/]\d{2}[-/]\d{4})/;
    const dateLine = lines.find((line) => datePattern.test(line));
    const dateMatch = dateLine?.match(datePattern);
    const date = dateMatch ? dateMatch[0] : undefined;

    // Try to find time
    const timePattern = /(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)/i;
    const timeLine = lines.find((line) => timePattern.test(line));
    const timeMatch = timeLine?.match(timePattern);
    const time = timeMatch ? timeMatch[0] : undefined;

    return {
      merchant,
      total,
      currency,
      date,
      time,
      rawText: text,
    };
  }

  /**
   * Full receipt scanning workflow: OCR + AI parsing
   */
  async scanReceipt(
    imageFile: File | Blob,
    userCategories: Array<{ id: string; name: string }>
  ): Promise<ParsedReceipt> {
    // Step 1: Extract text using OCR
    const text = await this.extractText(imageFile);

    if (!text.trim()) {
      throw new Error('No text found in image. Please ensure the receipt is clear and well-lit.');
    }

    // Step 2: Parse with AI if available, otherwise use basic parsing
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

    if (apiKey) {
      try {
        console.log('Parsing receipt with Claude AI...');
        return await this.parseReceiptWithAI(text, userCategories);
      } catch (error) {
        console.warn('AI parsing failed, falling back to basic parsing:', error);
      }
    }

    // Fallback to basic parsing
    console.log('Using basic receipt parsing...');
    const basicData = this.parseReceiptBasic(text);

    if (!basicData.total) {
      throw new Error('Could not detect total amount. Please enter manually.');
    }

    return {
      amount: basicData.total,
      currency: basicData.currency === 'CNY' ? 'CNY' : 'USD',
      description: basicData.merchant || 'Receipt',
      date: basicData.date ? new Date(basicData.date) : new Date(),
      time: basicData.time || new Date().toTimeString().slice(0, 5),
      location: basicData.merchant,
      categoryId: undefined,
      confidence: 50,
    };
  }

  /**
   * Cleanup resources
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.initPromise = null;
    }
  }
}

// Export singleton instance
export const ocrService = new OCRService();

// Check if OCR is supported
export const isOCRSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Worker' in window;
};

// Check if AI parsing is available
export const isAIParsingAvailable = (): boolean => {
  return !!import.meta.env.VITE_ANTHROPIC_API_KEY;
};
