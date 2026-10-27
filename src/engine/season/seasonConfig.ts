/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RealityMode } from '@/config/theme';
import { DifficultyLevel, BALANCE } from '@/config/balance';

export interface SeasonConfig {
  id: string;
  programName: string;
  networkName: string;
  hostName: string;
  slogan: string;
  logoStyle: 'cyber' | 'rustic' | 'minimal' | 'pop';
  primaryColor: string;
  mode: RealityMode;
  castSize: number;
  durationWeeks: number;
  difficulty: DifficultyLevel;
  initialCash: number;
  prizePool: number;
  seed: string;
  rules: {
    hasVIPXepa: boolean;
    hasAngelImmunity: boolean;
    hasCastigoMonstro: boolean;
    hasBateVolta: boolean;
    hasMysteryPhone: boolean;
    publicVoteWeight: number; // 0.0 a 1.0
  };
}

export function createDefaultSeasonConfig(mode: RealityMode = 'house'): SeasonConfig {
  const isFarm = mode === 'farm';
  const isHybrid = mode === 'hybrid';

  return {
    id: `season-${Date.now()}`,
    programName: isFarm
      ? 'A Grande Fazenda'
      : isHybrid
      ? 'Multiverso do Reality'
      : 'Casa dos Famosos',
    networkName: 'Rede Astral de Televisão',
    hostName: isFarm ? 'Marcos Miel' : 'Tadeu Santiago',
    slogan: isFarm
      ? 'Onde a roça pega fogo e o bicho pega!'
      : 'O confinamento mais vigiado do planeta.',
    logoStyle: isFarm ? 'rustic' : isHybrid ? 'cyber' : 'pop',
    primaryColor: isFarm ? '#f59e0b' : isHybrid ? '#a855f7' : '#06b6d4',
    mode,
    castSize: BALANCE.housemates.defaultCount,
    durationWeeks: BALANCE.time.defaultSeasonWeeks,
    difficulty: 'normal',
    initialCash: BALANCE.director.initialCash,
    prizePool: 2500000,
    seed: `seed-${Math.random().toString(36).substring(2, 8)}`,
    rules: {
      hasVIPXepa: true,
      hasAngelImmunity: true,
      hasCastigoMonstro: true,
      hasBateVolta: true,
      hasMysteryPhone: true,
      publicVoteWeight: 0.8,
    },
  };
}
