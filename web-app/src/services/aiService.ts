import Anthropic from '@anthropic-ai/sdk';
import type { Currency } from '../types';

export interface ParsedTransaction {
  amount: number | null;
  currency: Currency | null;
  description: string;
  location: string | null;
  suggestedCategory: string | null;
  date: string | null; // YYYY-MM-DD format
  time: string | null; // HH:MM format
  confidence: number;
}

// Initialize Anthropic client
const getAnthropicClient = () => {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('Anthropic API key not found. AI parsing will not work.');
    return null;
  }
  return new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true, // For demo purposes - in production, use a backend
  });
};

export const parseWithAI = async (
  text: string,
  userCategories: Array<{ id: string; name: string; icon?: string }>
): Promise<ParsedTransaction> => {
  const client = getAnthropicClient();

  if (!client) {
    throw new Error('Anthropic API key not configured');
  }

  try {
    // Build category list for the prompt
    const categoriesList = userCategories
      .map((cat, idx) => `${idx + 1}. ${cat.name} (id: ${cat.id})`)
      .join('\n');

    // Get today's date for context
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTime = today.toTimeString().slice(0, 5); // HH:MM

    const prompt = `You are a transaction parsing assistant. Parse the following transaction text and extract structured data.

Transaction text: "${text}"
Current date: ${todayStr}
Current time: ${currentTime}

Available categories:
${categoriesList}

Parse the text and respond with ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "amount": <number or null>,
  "currency": "USD" or "CNY" or null,
  "description": "<main description without amount/currency/location/time>",
  "location": "<location if mentioned, otherwise null>",
  "date": "<YYYY-MM-DD format if date mentioned, otherwise null>",
  "time": "<HH:MM format if time mentioned, otherwise null>",
  "suggestedCategoryId": "<category id from list above that best matches, or null>",
  "confidence": <number between 0 and 1>
}

Rules:
- Extract the numeric amount (e.g., "45", "45.50")
- Detect currency from symbols ($, ¥), codes (USD, CNY), or words (dollars, yuan, 元, RMB)
- Default to CNY if currency is ambiguous or Chinese text is present
- Extract location from patterns like "at X", "@ X", "in X"
- Extract date from patterns like "yesterday", "today", "tomorrow", "on Monday", "Oct 15", "10/15"
- Extract time from patterns like "at 3pm", "14:30", "3:30 PM", "noon", "morning", "evening"
- If date/time mentioned, parse and return in specified formats
- If no date/time mentioned, return null (will default to current)
- Clean description by removing amount, currency, location, date, and time markers
- Match to the best category based on keywords and context
- Set confidence based on how clear the parsing was (0.9 = very clear, 0.5 = ambiguous)

Examples:
Input: "Coffee 45 CNY at Starbucks at 9am"
Output: {"amount": 45, "currency": "CNY", "description": "Coffee", "location": "Starbucks", "date": null, "time": "09:00", "suggestedCategoryId": "<food-category-id>", "confidence": 0.95}

Input: "Uber ride $25 yesterday at 6pm"
Output: {"amount": 25, "currency": "USD", "description": "Uber ride", "location": null, "date": "<yesterday's date>", "time": "18:00", "suggestedCategoryId": "<transport-category-id>", "confidence": 0.9}

Input: "星巴克咖啡 45 元 下午3点"
Output: {"amount": 45, "currency": "CNY", "description": "星巴克咖啡", "location": null, "date": null, "time": "15:00", "suggestedCategoryId": "<food-category-id>", "confidence": 0.95}

Input: "Lunch 80 yuan at 12:30"
Output: {"amount": 80, "currency": "CNY", "description": "Lunch", "location": null, "date": null, "time": "12:30", "suggestedCategoryId": "<food-category-id>", "confidence": 0.9}

Now parse the transaction text provided above.`;

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract the text content
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse the JSON response
    const parsed = JSON.parse(content.text);

    // Map to our interface
    return {
      amount: parsed.amount,
      currency: parsed.currency,
      description: parsed.description || text,
      location: parsed.location,
      date: parsed.date,
      time: parsed.time,
      suggestedCategory: parsed.suggestedCategoryId,
      confidence: parsed.confidence || 0.5,
    };
  } catch (error) {
    console.error('Error parsing with AI:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to parse with AI'
    );
  }
};

// Check if API is configured
export const isAIConfigured = (): boolean => {
  return !!import.meta.env.VITE_ANTHROPIC_API_KEY;
};
