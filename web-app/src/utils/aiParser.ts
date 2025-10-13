import type { Currency } from '../types';
import { parseWithAI, isAIConfigured } from '../services/aiService';

export interface ParsedTransaction {
  amount: number | null;
  currency: Currency | null;
  description: string;
  location: string | null;
  suggestedCategory: string | null;
  confidence: number;
}

// Main parsing function - tries AI first, falls back to regex
export const parseTransactionTextAsync = async (
  text: string,
  userCategories: Array<{ id: string; name: string }>
): Promise<ParsedTransaction> => {
  // Try AI parsing if configured
  if (isAIConfigured()) {
    try {
      console.log('Using Claude AI for parsing...');
      const result = await parseWithAI(text, userCategories);
      console.log('AI parsing result:', result);
      return result;
    } catch (error) {
      console.warn('AI parsing failed, falling back to regex:', error);
      // Fall back to regex parser
      return parseTransactionText(text, userCategories);
    }
  }

  // Use regex parser if AI is not configured
  console.log('Using regex parser (AI not configured)');
  return parseTransactionText(text, userCategories);
};

// Simple regex-based parser (fallback when AI is unavailable)
export const parseTransactionText = (text: string, userCategories: Array<{ id: string; name: string }>): ParsedTransaction => {
  const result: ParsedTransaction = {
    amount: null,
    currency: null,
    description: '',
    location: null,
    suggestedCategory: null,
    confidence: 0,
  };

  // Normalize text
  const normalizedText = text.trim();

  if (!normalizedText) {
    return result;
  }

  // Extract amount and currency
  // Patterns: "45 CNY", "45CNY", "$45", "¥45", "45 dollars", "45 yuan", "45元"
  const amountPatterns = [
    // Symbol before number: $45, ¥45
    /[¥$]\s*(\d+(?:\.\d{1,2})?)/i,
    // Number then currency code: 45 CNY, 45 USD, 45cny
    /(\d+(?:\.\d{1,2})?)\s*(CNY|USD|RMB|¥|元|dollars?|yuan)/i,
    // Just number at start or end: "45 coffee", "coffee 45"
    /^(\d+(?:\.\d{1,2})?)\s+/,
    /\s+(\d+(?:\.\d{1,2})?)$/,
  ];

  let amountMatch = null;
  let currencyHint = '';

  for (const pattern of amountPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      amountMatch = match[1];
      currencyHint = match[2] || match[0];
      break;
    }
  }

  if (amountMatch) {
    result.amount = parseFloat(amountMatch);
    result.confidence = 0.7;

    // Determine currency from hint
    const currencyLower = currencyHint.toLowerCase();
    if (currencyLower.includes('cny') || currencyLower.includes('rmb') ||
        currencyLower.includes('¥') || currencyLower.includes('元') ||
        currencyLower.includes('yuan')) {
      result.currency = 'CNY';
      result.confidence = 0.9;
    } else if (currencyLower.includes('usd') || currencyLower.includes('$') ||
               currencyLower.includes('dollar')) {
      result.currency = 'USD';
      result.confidence = 0.9;
    } else {
      // Default to CNY if no clear currency indicator
      result.currency = 'CNY';
      result.confidence = 0.6;
    }
  }

  // Extract location (look for "at", "in", "@" patterns)
  const locationPatterns = [
    /\s+(?:at|@)\s+([^,]+?)(?:\s*,|$)/i,
    /\s+in\s+([^,]+?)(?:\s*,|$)/i,
  ];

  for (const pattern of locationPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      result.location = match[1].trim();
      break;
    }
  }

  // Extract description (everything minus amount, currency, and location markers)
  let description = normalizedText
    // Remove amount and currency
    .replace(/[¥$]\s*\d+(?:\.\d{1,2})?/gi, '')
    .replace(/\d+(?:\.\d{1,2})?\s*(CNY|USD|RMB|¥|元|dollars?|yuan)/gi, '')
    .replace(/^\d+(?:\.\d{1,2})?\s+/, '')
    .replace(/\s+\d+(?:\.\d{1,2})?$/, '')
    // Remove location markers
    .replace(/\s+(?:at|@|in)\s+[^,]+/gi, '')
    .trim();

  // Clean up extra spaces
  description = description.replace(/\s+/g, ' ').trim();

  result.description = description || normalizedText;

  // Suggest category based on keywords
  result.suggestedCategory = suggestCategory(result.description, result.location, userCategories);
  if (result.suggestedCategory) {
    result.confidence = Math.max(result.confidence, 0.8);
  }

  return result;
};

// Category suggestion based on keywords
const suggestCategory = (
  description: string,
  location: string | null,
  userCategories: Array<{ id: string; name: string }>
): string | null => {
  const text = `${description} ${location || ''}`.toLowerCase();

  // Common keywords for each category
  const categoryKeywords: Record<string, string[]> = {
    food: ['coffee', 'restaurant', 'lunch', 'dinner', 'breakfast', 'food', 'cafe', 'starbucks', 'mcdonald', 'pizza', 'burger', 'sushi', 'meal', '咖啡', '餐厅', '午餐', '晚餐', '早餐', '食物'],
    transport: ['uber', 'taxi', 'bus', 'train', 'metro', 'subway', 'gas', 'fuel', 'parking', 'ride', 'lyft', 'didi', '出租车', '地铁', '公交', '加油', '停车'],
    shopping: ['amazon', 'store', 'shop', 'mall', 'clothes', 'shirt', 'shoes', 'purchase', 'buy', 'bought', '商店', '购物', '衣服', '鞋子'],
    entertainment: ['movie', 'cinema', 'game', 'concert', 'ticket', 'netflix', 'spotify', 'theater', 'show', '电影', '游戏', '演出', '票'],
    groceries: ['grocery', 'supermarket', 'walmart', 'costco', 'safeway', 'vegetables', 'fruits', 'market', '超市', '菜市场', '水果', '蔬菜'],
    health: ['doctor', 'hospital', 'pharmacy', 'medicine', 'clinic', 'dental', 'medical', 'gym', 'fitness', '医院', '药店', '健身'],
    utilities: ['electricity', 'water', 'internet', 'phone', 'bill', 'rent', '电费', '水费', '网费', '房租'],
    education: ['book', 'course', 'class', 'tuition', 'school', 'university', 'education', '书', '课程', '学费', '学校'],
  };

  // Try to match user's custom categories first
  for (const category of userCategories) {
    const categoryNameLower = category.name.toLowerCase();
    if (text.includes(categoryNameLower)) {
      return category.id;
    }
  }

  // Fall back to keyword matching
  for (const [categoryType, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        // Find matching user category by name
        const matchingCategory = userCategories.find(c =>
          c.name.toLowerCase().includes(categoryType) ||
          c.name.toLowerCase().includes(keyword)
        );
        if (matchingCategory) {
          return matchingCategory.id;
        }
      }
    }
  }

  return null;
};

// Example usage strings for guidance
export const examplePrompts = [
  'Coffee 45 CNY at Starbucks',
  'Uber ride $25 to downtown',
  'Lunch 80 yuan at Pizza Hut',
  'Grocery shopping 150 CNY',
  'Movie ticket $15 at AMC',
  'Gas 200 CNY at Shell',
  'Netflix subscription $14.99',
  '星巴克咖啡 45 元',
  '出租车 30 元 去机场',
];

// Test the parser with example input
export const testParser = () => {
  const testCategories = [
    { id: '1', name: 'Food & Dining' },
    { id: '2', name: 'Transportation' },
    { id: '3', name: 'Shopping' },
  ];

  console.log('Testing AI Parser:');
  console.log('==================');

  examplePrompts.forEach(prompt => {
    const result = parseTransactionText(prompt, testCategories);
    console.log(`Input: "${prompt}"`);
    console.log(`Parsed:`, result);
    console.log('---');
  });
};
