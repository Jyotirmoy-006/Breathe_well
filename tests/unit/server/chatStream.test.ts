/**
 * @file chatStream.test.ts
 * @description Unit tests for streamChatResponse and createTextStream.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createTextStream, streamChatResponse } from '@/server/ai/chatStream';
import { env } from '@/server/env';

const mockGenerateContentStream = vi.fn();

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContentStream: mockGenerateContentStream,
      };
    },
  };
});

async function readStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = '';
  let done = false;
  while (!done) {
    const chunk = await reader.read();
    done = chunk.done;
    if (chunk.value) {
      result += decoder.decode(chunk.value, { stream: !done });
    }
  }
  return result;
}

describe('chatStream', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('createTextStream produces readable bytes matching input text', async () => {
    const stream = createTextStream('Hello SaafSaans');
    const text = await readStream(stream);
    expect(text).toBe('Hello SaafSaans');
  });

  it('streamChatResponse blocks medical advice queries deterministically', async () => {
    const stream = await streamChatResponse({
      question: 'Can you prescribe steroids or inhaler dosage?',
    });
    const text = await readStream(stream);
    expect(text).toContain('not a medical doctor');
  });

  it('streamChatResponse uses fallback answer when GEMINI_API_KEY is unset', async () => {
    const originalKey = env.GEMINI_API_KEY;
    env.GEMINI_API_KEY = undefined;

    const stream = await streamChatResponse({
      question: 'Is it safe for my child to play outdoors?',
      aqiSummary: { category: 'Severe' },
    });
    const text = await readStream(stream);
    expect(text).toContain('outdoor physical exertion for children should be strictly avoided');

    env.GEMINI_API_KEY = originalKey;
  });

  it('streamChatResponse invokes Gemini streaming when API key is set', async () => {
    const originalKey = env.GEMINI_API_KEY;
    env.GEMINI_API_KEY = 'test-key-mock';

    mockGenerateContentStream.mockResolvedValueOnce([
      { text: 'Ventilate ' },
      { text: 'during midday.' },
    ]);

    const stream = await streamChatResponse({
      question: 'When to ventilate?',
      aqiSummary: { category: 'Moderate' },
    });
    const text = await readStream(stream);
    expect(text).toBe('Ventilate during midday.');

    env.GEMINI_API_KEY = originalKey;
  });

  it('falls back safely when Gemini stream throws an exception', async () => {
    const originalKey = env.GEMINI_API_KEY;
    env.GEMINI_API_KEY = 'test-key-mock';

    mockGenerateContentStream.mockRejectedValueOnce(new Error('API quota exceeded'));

    const stream = await streamChatResponse({
      question: 'How do I clean my filter?',
      aqiSummary: { category: 'Severe' },
    });
    const text = await readStream(stream);
    expect(text).toContain('Corsi-Rosenthal box');

    env.GEMINI_API_KEY = originalKey;
  });
});
