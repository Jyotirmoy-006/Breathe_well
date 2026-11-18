/**
 * @file types.ts
 * @description Types for the printable 1-page emergency Family Air Plan cheat-sheet.
 */

import type { AqiCategory } from '../../domain/aqi/constants';

export interface FamilyPlanPrintData {
  readonly locationName: string;
  readonly aqi: number;
  readonly cpcbCategory: AqiCategory;
  readonly pm25: number;
  readonly generatedDate: string;
}

export interface PrintFamilyPlanProps {
  readonly data: FamilyPlanPrintData;
  readonly className?: string | undefined;
}
