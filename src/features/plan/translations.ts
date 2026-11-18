/**
 * @file translations.ts
 * @description Curated localized UI strings for English, Hindi (हिन्दी), and Bengali (বাংলা).
 */

import type { PlanLocale, PlanTabId } from './types';

export interface PlanTranslation {
  readonly title: string;
  readonly medicalWarning: string;
  readonly tabs: Record<PlanTabId, string>;
  readonly whyThisMatters: string;
  readonly evidenceSource: string;
  readonly includeInImpact: string;
  readonly timeBlocks: Record<string, string>;
}

export const PLAN_TRANSLATIONS: Record<PlanLocale, PlanTranslation> = {
  en: {
    title: 'Your personalized air protection plan',
    medicalWarning:
      'If experiencing breathing difficulty or chest discomfort, seek medical care immediately.',
    tabs: {
      routine: 'Routine',
      home: 'Home air',
      swaps: 'Swaps',
      community: 'Community',
    },
    whyThisMatters: 'Why this matters',
    evidenceSource: 'Evidence source',
    includeInImpact: 'Include in impact simulation',
    timeBlocks: {
      morning: 'Morning (06:00 - 09:00)',
      commute: 'Commute hours',
      midday: 'Midday (11:00 - 15:00)',
      evening: 'Evening (16:00 - 19:30)',
      night: 'Night (20:00 - 06:00)',
      all_day: 'All day',
    },
  },
  hi: {
    title: 'आपकी व्यक्तिगत वायु सुरक्षा योजना',
    medicalWarning: 'यदि सांस लेने में कठिनाई या सीने में तकलीफ महसूस हो, तो तुरंत चिकित्सकीय सहायता लें।',
    tabs: {
      routine: 'दैनिक दिनचर्या',
      home: 'घरेलू हवा',
      swaps: 'टिकाऊ विकल्प',
      community: 'सामुदायिक पहल',
    },
    whyThisMatters: 'यह क्यों जरूरी है',
    evidenceSource: 'प्रमाण स्रोत',
    includeInImpact: 'प्रभाव गणना में शामिल करें',
    timeBlocks: {
      morning: 'सुबह (06:00 - 09:00)',
      commute: 'यात्रा का समय',
      midday: 'दोपहर (11:00 - 15:00)',
      evening: 'शाम (16:00 - 19:30)',
      night: 'रात (20:00 - 06:00)',
      all_day: 'पूरे दिन',
    },
  },
  bn: {
    title: 'আপনার ব্যক্তিগত বায়ু সুরক্ষা পরিকল্পনা',
    medicalWarning: 'শ্বাসকষ্ট বা বুকে অস্বস্তি অনুভব করলে অবিলম্বে চিকিৎসকের পরামর্শ নিন।',
    tabs: {
      routine: 'দৈনন্দিন রুটিন',
      home: 'ঘরের বাতাস',
      swaps: 'বিকল্প ব্যবস্থা',
      community: 'সামাজিক উদ্যোগ',
    },
    whyThisMatters: 'এটি কেন গুরুত্বপূর্ণ',
    evidenceSource: 'তথ্যের উৎস',
    includeInImpact: 'প্রভাব হিসেবে যোগ করুন',
    timeBlocks: {
      morning: 'সকাল (০৬:০০ - ০৯:০০)',
      commute: 'যাতায়াতের সময়',
      midday: 'দুপুর (১১:০০ - ১৫:০০)',
      evening: 'সন্ধ্যা (১৬:০০ - ১৯:৩০)',
      night: 'রাত (২০:০০ - ০৬:০০)',
      all_day: 'সারাদিন',
    },
  },
};
