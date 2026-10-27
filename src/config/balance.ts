/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const BALANCE = {
  time: {
    phasesPerDay: ['Manhã', 'Tarde', 'Noite', 'Madrugada'] as const,
    daysPerWeek: 7,
    defaultSeasonWeeks: 12,
    tickIntervalMs: {
      paused: 0,
      normal: 3000,
      fast: 1500,
      ultra: 600,
    },
  },
  director: {
    initialCash: 250000,
    initialIbope: 28.0,
    initialReputation: 85,
    initialAuthority: 100,
    minIbope: 8.0,
    maxIbope: 55.0,
    dailyOperatingCost: 8500,
  },
  housemates: {
    defaultCount: 20,
    minCount: 8,
    maxCount: 40,
    statDecay: {
      staminaConsumptionPerPhase: 6,
      staminaRestRecovery: 18,
      moodFluctuationVariance: 8,
      popularityDriftVariance: 4,
    },
    criticalThresholds: {
      lowStamina: 20,
      lowMood: 25,
      highPopularity: 75,
      highRejection: 65,
    },
  },
  difficultyModifiers: {
    easy: {
      cashMultiplier: 1.5,
      ibopeBonus: 4.0,
      operatingCostMultiplier: 0.75,
    },
    normal: {
      cashMultiplier: 1.0,
      ibopeBonus: 0.0,
      operatingCostMultiplier: 1.0,
    },
    hard: {
      cashMultiplier: 0.65,
      ibopeBonus: -3.0,
      operatingCostMultiplier: 1.35,
    },
    godMode: {
      cashMultiplier: 999,
      ibopeBonus: 15.0,
      operatingCostMultiplier: 0.0,
    },
  },
} as const;

export type DayPhase = (typeof BALANCE.time.phasesPerDay)[number];
export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'godMode';
