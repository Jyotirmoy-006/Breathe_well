/**
 * @file chatComponent.test.tsx
 * @description Unit tests for PlanFollowUpChat and SuggestedQuestions components.
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { generatePlan } from '../../../src/domain/planner/engine';
import { PROFILE_PRESETS } from '../../../src/domain/profile/presets';
import { createPm25UgM3 } from '../../../src/domain/types';
import { PlanFollowUpChat } from '../../../src/features/chat/PlanFollowUpChat';
import {
  SuggestedQuestions,
  SUGGESTED_QUESTIONS,
} from '../../../src/features/chat/SuggestedQuestions';

describe('SuggestedQuestions', () => {
  it('renders all suggested question chips and triggers onSelect on click', () => {
    const handleSelect = vi.fn();
    render(<SuggestedQuestions onSelect={handleSelect} />);

    expect(screen.getByRole('group', { name: /suggested questions/i })).toBeInTheDocument();
    const firstChip = screen.getByText(SUGGESTED_QUESTIONS[0]!);
    expect(firstChip).toBeInTheDocument();

    fireEvent.click(firstChip);
    expect(handleSelect).toHaveBeenCalledWith(SUGGESTED_QUESTIONS[0]);
  });
});

describe('PlanFollowUpChat', () => {
  const originalFetch = globalThis.fetch;
  const mockProfile = PROFILE_PRESETS[0]!.profile;
  const testPlan = generatePlan(mockProfile, createPm25UgM3(280));

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('renders drawer header, input field, and disabled ask button initially', () => {
    render(<PlanFollowUpChat plan={testPlan} />);

    expect(screen.getByRole('region', { name: /action plan assistant q&a/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /have a question about your plan\?/i }),
    ).toBeInTheDocument();

    const askButton = screen.getByRole('button', { name: /^ask$/i });
    expect(askButton).toBeDisabled();
  });

  it('enables ask button when input length >= 2', () => {
    render(<PlanFollowUpChat plan={testPlan} />);

    const input = screen.getByPlaceholderText(/ask a question about your routine/i);
    fireEvent.change(input, { target: { value: 'How to clean filter?' } });

    const askButton = screen.getByRole('button', { name: /^ask$/i });
    expect(askButton).toBeEnabled();
  });

  it('streams response and updates aria-live region when asking a question', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('Keep outdoor'));
        controller.enqueue(encoder.encode(' activity low.'));
        controller.close();
      },
    });

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(stream, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      }),
    );

    render(<PlanFollowUpChat plan={testPlan} />);

    const input = screen.getByPlaceholderText(/ask a question about your routine/i);
    fireEvent.change(input, { target: { value: 'Is it safe to play outside?' } });

    const askButton = screen.getByRole('button', { name: /^ask$/i });
    fireEvent.click(askButton);

    await waitFor(() => {
      const statusArea = screen.getByRole('status');
      expect(statusArea).toHaveAttribute('aria-live', 'polite');
      expect(statusArea).toHaveTextContent(/Keep outdoor activity low\./);
    });
  });

  it('renders error alert when API call fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'Rate limit' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    render(<PlanFollowUpChat plan={testPlan} />);

    const firstChip = screen.getByText(SUGGESTED_QUESTIONS[0]!);
    fireEvent.click(firstChip);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/Rate limit exceeded/i);
    });
  });

  it('handles generic non-429 API errors properly', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
      }),
    );

    render(<PlanFollowUpChat plan={testPlan} />);
    const firstChip = screen.getByText(SUGGESTED_QUESTIONS[0]!);
    fireEvent.click(firstChip);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/failed to query assistant/i);
    });
  });
});
