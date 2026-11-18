/**
 * @file not-found.tsx
 * @description Branded 404 Not Found page for the Next.js App Router.
 */

import Link from 'next/link';

/**
 * Not-found page shown when a route segment cannot be matched.
 */
export default function NotFoundPage() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-6 p-8"
    >
      <div className="max-w-md text-center">
        <p className="mb-2 font-mono text-sm uppercase tracking-widest text-muted-foreground">
          404
        </p>
        <h1 className="mb-4 font-display text-4xl font-bold">Page not found</h1>
        <p className="mb-8 text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="rounded-md bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
