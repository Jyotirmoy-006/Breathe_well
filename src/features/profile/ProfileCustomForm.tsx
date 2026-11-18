/**
 * @file ProfileCustomForm.tsx
 * @description Accessible form controls for granular household demographic and dwelling adjustments.
 */

import React from 'react';

import type {
  BudgetTier,
  CommuteMode,
  CookingFuel,
  HeatingMethod,
  HomeType,
  UserProfile,
} from '../../domain/profile/types';

interface CustomFormProps {
  readonly profile: UserProfile;
  readonly onChange: (updated: UserProfile) => void;
}

function renderToggle(
  id: string,
  label: string,
  checked: boolean,
  onToggle: (checked: boolean) => void,
): React.JSX.Element {
  return (
    <label
      htmlFor={id}
      className="min-h-[44px] flex items-center justify-between gap-3 p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 cursor-pointer"
    >
      <span className="text-xs sm:text-sm font-medium">{label}</span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          onToggle(e.target.checked);
        }}
        className="h-5 w-5 rounded border-stone-300 text-[#1A5341] accent-[#1A5341] dark:accent-[#2DD4BF]"
      />
    </label>
  );
}

interface SelectFieldConfig {
  readonly id: string;
  readonly label: string;
  readonly value: string | number;
}

function renderSelect(
  field: SelectFieldConfig,
  options: readonly { readonly val: string | number; readonly text: string }[],
  onSelect: (val: string) => void,
): React.JSX.Element {
  return (
    <div>
      <label
        htmlFor={field.id}
        className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1"
      >
        {field.label}
      </label>
      <select
        id={field.id}
        value={field.value}
        onChange={(e) => {
          onSelect(e.target.value);
        }}
        className="w-full min-h-[44px] rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs sm:text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
      >
        {options.map((opt) => (
          <option key={opt.val} value={opt.val}>
            {opt.text}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Granular adjustment form allowing exact tuning of family lifestyle profile.
 */
export function ProfileCustomForm({ profile, onChange }: CustomFormProps): React.JSX.Element {
  return (
    <div className="space-y-4 pt-3 border-t border-stone-200 dark:border-stone-800">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
        {renderToggle('profile-children', '👶 Children (<= 12y)', profile.children, (children) => {
          onChange({ ...profile, children });
        })}
        {renderToggle('profile-elderly', '👴 Elderly (>= 60y)', profile.elderly, (elderly) => {
          onChange({ ...profile, elderly });
        })}
        {renderToggle(
          'profile-sensitive',
          '🫁 Sensitive health',
          profile.sensitiveGroup,
          (sensitiveGroup) => {
            onChange({ ...profile, sensitiveGroup });
          },
        )}
        {renderToggle(
          'profile-purifier',
          '💨 HEPA Purifier',
          profile.hasAirPurifier,
          (hasAirPurifier) => {
            onChange({ ...profile, hasAirPurifier });
          },
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {renderSelect(
          { id: 'profile-size', label: 'Household Size', value: profile.householdSize },
          [
            { val: 1, text: '1 member' },
            { val: 2, text: '2 members' },
            { val: 4, text: '4 members' },
            { val: 6, text: '6 members' },
          ],
          (v) => {
            onChange({ ...profile, householdSize: Number(v) });
          },
        )}

        {renderSelect(
          { id: 'profile-commute', label: 'Daily Commute', value: profile.commuteMode },
          [
            { val: 'metro_bus', text: 'Metro / Public Bus' },
            { val: 'walk_cycle', text: 'Walk / Bicycle' },
            { val: 'two_wheeler', text: 'Two-Wheeler' },
            { val: 'car_ac', text: 'Car with AC' },
            { val: 'wfh', text: 'Work from Home' },
          ],
          (v) => {
            onChange({ ...profile, commuteMode: v as CommuteMode });
          },
        )}

        {renderSelect(
          { id: 'profile-home', label: 'Home Type', value: profile.homeType },
          [
            { val: 'apartment', text: 'Apartment' },
            { val: 'independent', text: 'Independent house' },
            { val: 'hostel', text: 'Hostel / Dorm' },
          ],
          (v) => {
            onChange({ ...profile, homeType: v as HomeType });
          },
        )}

        {renderSelect(
          { id: 'profile-fuel', label: 'Cooking Fuel', value: profile.cookingFuel },
          [
            { val: 'lpg_induction', text: 'LPG / Gas' },
            { val: 'electric', text: 'Electric / Induction' },
            { val: 'biomass_coal', text: 'Biomass / Chulha' },
          ],
          (v) => {
            onChange({ ...profile, cookingFuel: v as CookingFuel });
          },
        )}

        {renderSelect(
          { id: 'profile-heating', label: 'Winter Heating', value: profile.heatingMethod },
          [
            { val: 'electric_heater', text: 'Electric Heater' },
            { val: 'none', text: 'No Space Heating' },
            { val: 'wood_angithi', text: 'Wood / Coal Angithi' },
          ],
          (v) => {
            onChange({ ...profile, heatingMethod: v as HeatingMethod });
          },
        )}

        {renderSelect(
          { id: 'profile-budget', label: 'Budget Tier', value: profile.budget },
          [
            { val: 'free', text: 'Free (Zero-cost)' },
            { val: 'low', text: 'Low (Affordable)' },
            { val: 'flexible', text: 'Flexible (Appliances)' },
          ],
          (v) => {
            onChange({ ...profile, budget: v as BudgetTier });
          },
        )}
      </div>
    </div>
  );
}
