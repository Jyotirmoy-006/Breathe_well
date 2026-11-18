/**
 * @file whatIfPanel.test.tsx
 * @description Unit tests for ImpactSection action toggles, live meter calculations, and explanation drawer.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { getAllActions } from '../../../src/domain/catalog/actions';
import { ImpactSection } from '../../../src/features/impact/ImpactSection';

function ImpactSectionHarness() {
  const allActions = getAllActions();
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <ImpactSection
      allActions={allActions}
      selectedActionIds={selectedIds}
      onToggleAction={toggle}
      onSelectAll={() => {
        setSelectedIds(new Set(allActions.map((a) => a.id)));
      }}
      onDeselectAll={() => {
        setSelectedIds(new Set());
      }}
    />
  );
}

describe('ImpactSection', () => {
  it('renders section 05 and initial zero baseline state', () => {
    render(<ImpactSectionHarness />);
    expect(screen.getByRole('heading', { name: /your impact/i })).toBeInTheDocument();
    expect(screen.getByText('0% - 0%')).toBeInTheDocument();
    expect(screen.getByText('0 active actions')).toBeInTheDocument();
  });

  it('updates live meter when an action is checked', () => {
    render(<ImpactSectionHarness />);

    const firstCheckbox = screen.getAllByRole('checkbox')[0] as HTMLInputElement;
    expect(firstCheckbox).not.toBeChecked();

    fireEvent.click(firstCheckbox);
    expect(firstCheckbox).toBeChecked();
    expect(screen.getByText('1 active action')).toBeInTheDocument();
    expect(screen.queryByText('0% - 0%')).not.toBeInTheDocument();
  });

  it('selects and deselects all actions using convenience buttons', () => {
    render(<ImpactSectionHarness />);

    const selectAllBtn = screen.getByRole('button', { name: /select all/i });
    fireEvent.click(selectAllBtn);

    expect(screen.queryByText('0 active actions')).not.toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText('0 active actions')).toBeInTheDocument();
  });

  it('opens and closes the model explanation slide-over drawer', () => {
    render(<ImpactSectionHarness />);

    const explainBtn = screen.getByRole('button', { name: /how we estimate this/i });
    fireEvent.click(explainBtn);

    expect(screen.getByText(/multiplicative non-double-counting formula/i)).toBeInTheDocument();
    expect(screen.getByText(/85% physical exposure ceiling/i)).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /close dialog/i });
    fireEvent.click(closeBtn);

    expect(
      screen.queryByText(/multiplicative non-double-counting formula/i),
    ).not.toBeInTheDocument();
  });
});
