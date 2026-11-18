'use client';

/**
 * @file error.tsx
 * @description Global error boundary for the Next.js App Router.
 * Renders a branded fallback UI when an unexpected error is thrown.
 */

import { useEffect } from 'react';

interface ErrorPageProps {
  /** The error that was thrown. */
  error: Error & { digest?: string };
  /** Callback to retry rendering the failed segment. */
  reset: () => void;
}

/**
 * Client-side error boundary page.
 * Displayed when an unhandled error occurs in a route segment.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Error reporting would go here in future phases
    // Using no-op to satisfy exhaustive-deps without console
  }, [error]);

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-6 p-8"
    >
      <div className="max-w-md text-center">
        <h1 className="mb-2 font-display text-4xl font-bold">Something went wrong</h1>
        <p className="mb-6 text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        {error.digest !== undefined && (
          <p className="mb-4 font-mono text-sm text-muted-foreground">Error ID: {error.digest}</p>
        )}
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
