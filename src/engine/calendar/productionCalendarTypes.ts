/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DayOfWeek, DayPhase } from '@/engine/time/gameClock';

export type EventCategory =
  | 'challenge'
  | 'eviction'
  | 'plot_twist'
  | 'party'
  | 'special_broadcast';

export type ProductionFocus =
  | 'default'
  | 'vt_hype'
  | 'stage_effects'
  | 'sponsor_blitz'
  | 'conflict_fuel'
  | 'safety';

export interface ProductionStrategyOption {
  id: ProductionFocus;
  label: string;
  description: string;
  cost: number;
  ibopeBonus: number;
  reputationBonus: number;
  cashReward?: number;
}

export interface SeasonTimelineEvent {
  id: string;
  week: number;
  day: number;
  dayOfWeek: DayOfWeek;
  phase: DayPhase;
  category: EventCategory;
  title: string;
  subtitle: string;
  description: string;
  importance: 'normal' | 'high' | 'critical';
  expectedIbope: {
    min: number;
    max: number;
    baseBoost: number;
  };
  baseCost: number;
  sponsorPrize?: string;
  appliedStrategy?: ProductionFocus;
  autoPause: boolean;
  resolved: boolean;
}

export interface SeasonMilestoneSummary {
  totalWeeks: number;
  totalDays: number;
  currentDay: number;
  currentWeek: number;
  daysRemaining: number;
  nextEvictionEvent?: SeasonTimelineEvent;
  nextChallengeEvent?: SeasonTimelineEvent;
  nextPlotTwistEvent?: SeasonTimelineEvent;
  completedEventsCount: number;
  upcomingEventsCount: number;
}
