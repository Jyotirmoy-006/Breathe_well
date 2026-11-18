/**
 * @file profileBuilder.test.tsx
 * @description Unit tests for ProfileSection preset selection, custom toggles, and live summary badges.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { PROFILE_PRESETS } from '../../../src/domain/profile/presets';
import type { UserProfile } from '../../../src/domain/profile/types';
import { ProfileSection } from '../../../src/features/profile/ProfileSection';

function ProfileSectionHarness({ initialProfile }: { initialProfile: UserProfile }) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  return <ProfileSection profile={profile} onProfileChange={setProfile} />;
}

describe('ProfileSection', () => {
  const baseProfile = PROFILE_PRESETS[0]?.profile ?? {
    householdSize: 4,
    children: true,
    elderly: false,
    sensitiveGroup: true,
    homeType: 'apartment',
    commuteMode: 'car_ac',
    cookingFuel: 'lpg_induction',
    heatingMethod: 'electric_heater',
    hasAirPurifier: false,
    budget: 'flexible',
  };

  it('renders section heading 03 and all 4 quick presets', () => {
    render(<ProfileSection profile={baseProfile} onProfileChange={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /your household/i })).toBeInTheDocument();
    expect(screen.getByText('Family with kids')).toBeInTheDocument();
    expect(screen.getByText('Elderly at home')).toBeInTheDocument();
    expect(screen.getByText('Daily commuter')).toBeInTheDocument();
    expect(screen.getByText('Hostel student')).toBeInTheDocument();
  });

  it('updates profile when clicking a preset button', () => {
    const handleProfileChange = vi.fn();
    render(<ProfileSection profile={baseProfile} onProfileChange={handleProfileChange} />);

    const studentPresetBtn = screen.getByText('Hostel student');
    fireEvent.click(studentPresetBtn);

    const studentPreset = PROFILE_PRESETS.find((p) => p.id === 'hostel-student');
    expect(handleProfileChange).toHaveBeenCalledWith(studentPreset?.profile);
  });

  it('expands custom adjustments form and toggles checkboxes', () => {
    render(<ProfileSectionHarness initialProfile={baseProfile} />);

    const customizeBtn = screen.getByRole('button', { name: /customize details/i });
    fireEvent.click(customizeBtn);

    const purifierCheckbox = screen.getByLabelText(/hepa purifier/i) as HTMLInputElement;
    expect(purifierCheckbox.checked).toBe(false);

    fireEvent.click(purifierCheckbox);
    expect(purifierCheckbox.checked).toBe(true);
    expect(screen.getByText('HEPA Purifier')).toBeInTheDocument();
  });

  it('updates household size and commute mode dropdowns', () => {
    render(<ProfileSectionHarness initialProfile={baseProfile} />);

    fireEvent.click(screen.getByRole('button', { name: /customize details/i }));

    const sizeSelect = screen.getByLabelText(/household size/i);
    fireEvent.change(sizeSelect, { target: { value: '2' } });
    expect(screen.getAllByText('2 members').length).toBeGreaterThanOrEqual(1);

    const commuteSelect = screen.getByLabelText(/daily commute/i);
    fireEvent.change(commuteSelect, { target: { value: 'walk_cycle' } });
    expect(screen.getByText('Walk / Cycle')).toBeInTheDocument();
  });
});
