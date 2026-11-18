/**
 * @file ModalDrawer.tsx
 * @description Accessible slide-over drawer / modal dialog with focus trap & ARIA attributes.
 */

import * as Dialog from '@radix-ui/react-dialog';
import React from 'react';

export interface ModalDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly description?: string;
  readonly children: React.ReactNode;
  readonly mode?: 'drawer' | 'modal';
}

/**
 * Slide-over drawer and dialog overlay implementing accessible focus traps.
 */
export function ModalDrawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  mode = 'drawer',
}: ModalDrawerProps): React.JSX.Element {
  const contentPlacement =
    mode === 'drawer'
      ? 'fixed right-0 top-0 bottom-0 w-full max-w-lg shadow-2xl overflow-y-auto border-l border-stone-300 dark:border-stone-800'
      : 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md shadow-2xl rounded-2xl border border-stone-300 dark:border-stone-800';

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-xs transition-opacity animate-in fade-in" />
        <Dialog.Content
          className={`z-50 bg-[#FAF6EE] dark:bg-[#1A1D23] text-stone-900 dark:text-stone-100 p-6 ${contentPlacement}`}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <Dialog.Title className="text-lg font-bold font-serif">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-200 dark:text-stone-400 dark:hover:text-stone-100 dark:hover:bg-stone-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5341]"
              >
                ✕
              </button>
            </Dialog.Close>
          </div>
          <div className="mt-2">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
