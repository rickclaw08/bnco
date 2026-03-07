/**
 * ClawOps Scanner - GEO Query Generator
 * Generates natural language queries for AI visibility testing
 */

import { openaiClient, OPENAI_GEO_MODEL } from '../lib/openaiClient';
import { logger } from '../lib/logger';
import { getIndustryQueries } from './industryClassifier';

export interface GeneratedQuery {
  query: string;
  intent: 'discovery' | 'comparison' | 'specific' | 'recommendation';
}

/**
 * Generate queries using industry templates + AI augmentation
 */
export async function generateGEOQueries(args: {
  businessName: string;
  businessType: string;
  city: string;
  category: string;
  count?: number;
}): Promise<GeneratedQuery[]> {
  const { businessName, businessType, city, category, count = 8 } = args;

  // Start with industry template queries
  const templateQueries = getIndustryQueries(category, businessType, city);
  const queries: GeneratedQuery[] = templateQueries.map(q => ({
    query: q,
    intent: 'discovery' as const,
  }));

  // Add AI-generated queries for more variety
  try {
    const response = await openaiClient.chat.completions.create({
      model: OPENAI_GEO_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You generate realistic search queries people would ask AI assistants (ChatGPT, Perplexity, Google AI Overview) to find local businesses. Return only a JSON array of strings. No explanations.',
        },
        {
          role: 'user',
          content: `Generate ${Math.max(3, count - templateQueries.length)} unique search queries someone might ask an AI assistant to find a ${businessType} in ${city}. Include discovery, comparison, and recommendation intents. Business context: "${businessName}" is a ${businessType} in ${city}.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || '[]';
    const parsed = JSON.parse(content.replace(/```json?\n?/g, '').replace(/```/g, '').trim());

    if (Array.isArray(parsed)) {
      for (const q of parsed) {
        const queryStr = typeof q === 'string' ? q : q?.query;
        if (queryStr && typeof queryStr === 'string') {
          queries.push({
            query: queryStr,
            intent: queryStr.toLowerCase().includes('best') ? 'recommendation'
              : queryStr.toLowerCase().includes('vs') || queryStr.toLowerCase().includes('compare') ? 'comparison'
              : 'discovery',
          });
        }
      }
    }
  } catch (error: any) {
    logger.warn('[GEO QueryGen] AI generation failed, using templates only', { error: error.message });
  }

  return queries.slice(0, count);
}
