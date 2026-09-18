import { GoogleGenerativeAI } from '@google/genai';

/**
 * Tool: Calculator
 * Safely evaluates a mathematical expression.
 * Only allows numbers, spaces, and the following operators: + - * / ( ) . %
 */
export function calculator(expression: string): string {
  // Remove any whitespace
  const cleaned = expression.trim();

  // Allow only digits, spaces, and the specified operators
  const allowedCharsRegex = /^[0-9+\-*/().\s%]+$/;
  if (!allowedCharsRegex.test(cleaned)) {
    throw new Error('Invalid characters in expression');
  }

  try {
    // Using eval is dangerous, but we have sanitized the input.
    // We'll use Function constructor to avoid using eval directly.
    // Note: This is still risky if the expression contains something like `constructor`.
    // However, our regex prevents letters and other dangerous characters.
    // We'll also avoid using any built-in objects by wrapping in a function that returns the result.
    const result = Function(`'use strict'; return (${cleaned});`)();
    if (typeof result === 'number') {
      return result.toString();
    } else {
      throw new Error('Expression did not evaluate to a number');
    }
  } catch (err) {
    throw new Error(`Error evaluating expression: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Tool: Web Search
 * Uses Google Custom Search API to search the web.
 * Requires environment variables: GOOGLE_CUSTOM_SEARCH_API_KEY and GOOGLE_CUSTOM_SEARCH_CX.
 */
export async function webSearch(query: string): Promise<string> {
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_CUSTOM_SEARCH_CX;

  if (!apiKey || !cx) {
    throw new Error('Web search API credentials are not configured.');
  }

  const url = new URL('https://www.googleapis.com/customsearch/v1');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('cx', cx);
  url.searchParams.set('q', query);
  url.searchParams.set('num', '3'); // Get top 3 results

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Web search failed with status ${response.status}`);
    }
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return 'No results found.';
    }

    // Return a summary of the top result
    const first = data.items[0];
    return `${first.title}: ${first.snippet}`;
  } catch (err) {
    throw new Error(`Error performing web search: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Tool definitions for the Google Gen AI SDK.
 * These are used to declare the tools to the model.
 */
export const toolDefinitions = [
  {
    name: 'calculator',
    description: 'Evaluates a mathematical expression and returns the result.',
    parameters: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: 'The mathematical expression to evaluate.',
        },
      },
      required: ['expression'],
    },
  },
  {
    name: 'webSearch',
    description: 'Searches the web for a given query and returns a summary of the top results.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query.',
        },
      },
      required: ['query'],
    },
  },
];

/**
 * Map of tool names to their implementations.
 */
export const toolExecutor = {
  calculator,
  webSearch,
};