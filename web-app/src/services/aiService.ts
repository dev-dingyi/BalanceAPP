import Anthropic from '@anthropic-ai/sdk';
import type { Currency } from '../types';

export interface ParsedTransaction {
  amount: number | null;
  currency: Currency | null;
  description: string;
  location: string | null;
  suggestedCategory: string | null;
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

    const prompt = `You are a transaction parsing assistant. Parse the following transaction text and extract structured data.

Transaction text: "${text}"

Available categories:
${categoriesList}

Parse the text and respond with ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "amount": <number or null>,
  "currency": "USD" or "CNY" or null,
  "description": "<main description without amount/currency/location>",
  "location": "<location if mentioned, otherwise null>",
  "suggestedCategoryId": "<category id from list above that best matches, or null>",
  "confidence": <number between 0 and 1>
}

Rules:
- Extract the numeric amount (e.g., "45", "45.50")
- Detect currency from symbols ($, ¥), codes (USD, CNY), or words (dollars, yuan, 元, RMB)
- Default to CNY if currency is ambiguous or Chinese text is present
- Extract location from patterns like "at X", "@ X", "in X"
- Clean description by removing amount, currency, and location markers
- Match to the best category based on keywords and context
- Set confidence based on how clear the parsing was (0.9 = very clear, 0.5 = ambiguous)

Examples:
Input: "Coffee 45 CNY at Starbucks"
Output: {"amount": 45, "currency": "CNY", "description": "Coffee", "location": "Starbucks", "suggestedCategoryId": "<food-category-id>", "confidence": 0.95}

Input: "Uber ride $25"
Output: {"amount": 25, "currency": "USD", "description": "Uber ride", "location": null, "suggestedCategoryId": "<transport-category-id>", "confidence": 0.9}

Input: "星巴克咖啡 45 元"
Output: {"amount": 45, "currency": "CNY", "description": "星巴克咖啡", "location": null, "suggestedCategoryId": "<food-category-id>", "confidence": 0.95}

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
