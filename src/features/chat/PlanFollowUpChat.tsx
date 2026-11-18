/**
 * @file PlanFollowUpChat.tsx
 * @description Accessible grounded follow-up Q&A component under Section 04 Your Plan.
 * Provides suggested questions chips, streaming text display, and accessible aria-live status.
 */

'use client';

import React, { useState } from 'react';

import type { ActionPlan } from '../../domain/planner/types';

import { SuggestedQuestions } from './SuggestedQuestions';

/** Properties accepted by the PlanFollowUpChat component. */
export interface PlanFollowUpChatProps {
  readonly plan: ActionPlan;
  readonly aqiSummary?:
    | {
        readonly currentPm25?: number | undefined;
        readonly category?: string | undefined;
      }
    | undefined;
  readonly className?: string | undefined;
}

interface StreamPayload {
  question: string;
  planContext: Record<string, unknown>;
  aqiSummary: Record<string, unknown>;
}

async function readStreamToState(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onChunk: (text: string) => void,
): Promise<void> {
  const decoder = new TextDecoder();
  let accumulated = '';
  let finished = false;

  while (!finished) {
    const chunk = await reader.read();
    finished = chunk.done;
    if (chunk.value) {
      accumulated += decoder.decode(chunk.value, { stream: !finished });
      onChunk(accumulated);
    }
  }
}

function parseApiError(res: Response): Error {
  if (res.status === 429) {
    return new Error('Rate limit exceeded.');
  }
  return new Error('Failed to query assistant.');
}

function resolveErrorMessage(errCall: unknown): string {
  if (errCall instanceof Error) {
    return errCall.message;
  }
  return 'An unexpected error occurred.';
}

/**
 * Accessible grounded chat Q&A drawer for inquiring about the generated action plan.
 */
export function PlanFollowUpChat(props: PlanFollowUpChatProps): React.JSX.Element {
  const { plan, aqiSummary, className = '' } = props;
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (userQuery: string): Promise<void> => {
    const trimmed = userQuery.trim();
    if (trimmed.length < 2 || isStreaming) return;

    setIsStreaming(true);
    setResponse('');
    setError(null);

    const fallbackSummary = { category: plan.aqiCategory, currentPm25: plan.currentPm25 };
    const payload: StreamPayload = {
      question: trimmed,
      planContext: { aqiCategory: plan.aqiCategory, currentPm25: plan.currentPm25 },
      aqiSummary: aqiSummary ?? fallbackSummary,
    };

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok || !res.body) {
        throw parseApiError(res);
      }
      await readStreamToState(res.body.getReader(), setResponse);
    } catch (errCall) {
      setError(resolveErrorMessage(errCall));
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div
      role="region"
      aria-label="Action Plan Assistant Q&A"
      className={`border border-stone-300 dark:border-stone-800 rounded-lg p-5 bg-stone-50/70 dark:bg-stone-900/60 shadow-sm space-y-4 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full bg-[#1A5341] dark:bg-[#2DD4BF]"
            aria-hidden="true"
          />
          <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">
            Have a question about your plan?
          </h3>
        </div>
        <span className="text-xs font-mono text-stone-600 dark:text-stone-400 bg-stone-200/60 dark:bg-stone-800 px-2 py-0.5 rounded">
          CPCB & Plan Grounded
        </span>
      </div>

      <SuggestedQuestions
        disabled={isStreaming}
        onSelect={(q) => {
          setQuestion(q);
          void handleSubmit(q);
        }}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit(question);
        }}
        className="flex gap-2"
      >
        <label htmlFor="chat-query-input" className="sr-only">
          Ask a question about your winter smog plan
        </label>
        <input
          id="chat-query-input"
          type="text"
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
          }}
          disabled={isStreaming}
          minLength={2}
          maxLength={300}
          placeholder="Ask a question about your routine, domestic filters, or timing..."
          className="flex-1 px-3.5 py-2 text-sm rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1A5341] dark:focus:ring-[#2DD4BF] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isStreaming || question.trim().length < 2}
          className="px-4 py-2 text-sm font-medium rounded-md bg-[#1A5341] dark:bg-[#2DD4BF] text-white dark:text-stone-950 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {isStreaming ? 'Streaming…' : 'Ask'}
        </button>
      </form>

      {error && (
        <div
          role="alert"
          className="p-3 text-xs rounded bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-900"
        >
          {error}
        </div>
      )}

      {(response || isStreaming) && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 rounded-md border border-[#1A5341]/20 dark:border-[#2DD4BF]/20 bg-white/80 dark:bg-stone-800/80 text-sm leading-relaxed text-stone-800 dark:text-stone-200"
        >
          <div className="flex items-center gap-2 mb-2 text-xs font-mono text-[#1A5341] dark:text-[#2DD4BF]">
            <span className="font-semibold">Assistant Response:</span>
            {isStreaming && <span className="animate-pulse">● generating…</span>}
          </div>
          <p className="whitespace-pre-line">{response}</p>
        </div>
      )}

      <p className="text-[11px] text-stone-600 dark:text-stone-400 italic">
        Deterministic guardrail active: SaafSaans cannot prescribe drugs or provide clinical
        diagnoses.
      </p>
    </div>
  );
}
