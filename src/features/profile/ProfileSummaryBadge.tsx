/**
 * @file ProfileSummaryBadge.tsx
 * @description Dynamic live summary badge bar displaying active household profile parameters.
 */

import React from 'react';

import { Badge } from '../../components/ui/Badge';
import type { UserProfile } from '../../domain/profile/types';

interface SummaryBadgeProps {
  readonly profile: UserProfile;
  readonly className?: string | undefined;
}

const COMMUTE_LABELS: Record<string, string> = {
  metro_bus: 'Metro / Bus',
  walk_cycle: 'Walk / Cycle',
  two_wheeler: 'Two-Wheeler',
  car_ac: 'Car (AC)',
  wfh: 'Work from Home',
};

const HOME_LABELS: Record<string, string> = {
  apartment: 'Apartment',
  independent: 'Independent house',
  hostel: 'Hostel / Dorm',
};

interface SummaryItem {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly variant: 'Good' | 'Moderate' | 'accent' | 'neutral';
}

function appendHealthFlags(items: SummaryItem[], profile: UserProfile): void {
  if (profile.children) {
    items.push({ id: 'children', label: 'Children', icon: '👶', variant: 'accent' });
  }
  if (profile.elderly) {
    items.push({ id: 'elderly', label: 'Elderly', icon: '👴', variant: 'accent' });
  }
  if (profile.sensitiveGroup) {
    items.push({ id: 'sensitive', label: 'Sensitive health', icon: '🫁', variant: 'Moderate' });
  }
}

function computeSummaryItems(profile: UserProfile): readonly SummaryItem[] {
  const items: SummaryItem[] = [
    {
      id: 'size',
      label: `${String(profile.householdSize)} member${profile.householdSize > 1 ? 's' : ''}`,
      icon: '👥',
      variant: 'neutral',
    },
  ];
  appendHealthFlags(items, profile);
  items.push(
    {
      id: 'commute',
      label: COMMUTE_LABELS[profile.commuteMode] ?? profile.commuteMode,
      icon: '🚲',
      variant: 'neutral',
    },
    {
      id: 'home',
      label: HOME_LABELS[profile.homeType] ?? profile.homeType,
      icon: '🏠',
      variant: 'neutral',
    },
    {
      id: 'purifier',
      label: profile.hasAirPurifier ? 'HEPA Purifier' : 'No Purifier',
      icon: '💨',
      variant: profile.hasAirPurifier ? 'Good' : 'neutral',
    },
  );
  return items;
}

/**
 * Summary badge strip showing live household attributes.
 */
export function ProfileSummaryBadge({
  profile,
  className = '',
}: SummaryBadgeProps): React.JSX.Element {
  const items = computeSummaryItems(profile);

  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/50 ${className}`}
    >
      <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 mr-1">
        Current Profile:
      </span>
      {items.map((item) => (
        <Badge key={item.id} variant={item.variant} size="sm" icon={item.icon}>
          {item.label}
        </Badge>
      ))}
      <Badge variant="outline" size="sm">
        Budget: {profile.budget}
      </Badge>
    </div>
  );
}
