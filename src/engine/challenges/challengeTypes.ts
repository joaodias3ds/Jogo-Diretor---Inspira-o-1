/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompetitionSkills } from '@/engine/housemates/types';

export type ChallengeType =
  | 'lider'           // Prova do Líder
  | 'anjo'            // Prova do Anjo (com Castigo do Monstro)
  | 'bate-volta'      // Bate-e-Volta (escapar do paredão)
  | 'comida-xepa'     // Prova da Comida (VIP vs Xepa)
  | 'resistencia'     // Prova de Resistência Extrema
  | 'sincerao';       // Jogo da Discórdia / Sincerão

export type ChallengeCategory = 'fisica' | 'resistencia' | 'logica' | 'sorte' | 'agilidade' | 'social';

export interface ChallengeRoundLog {
  round: number;
  description: string;
  eliminatedParticipants: string[];
  standoutParticipants: string[];
  directorInterventionApplied?: string;
}

export interface ChallengeDefinition {
  id: string;
  title: string;
  type: ChallengeType;
  category: ChallengeCategory;
  primarySkill: keyof CompetitionSkills;
  description: string;
  roundsCount: number;
  productionCost: number;
  audienceBonus: number;
  sponsorName?: string;
  riskOfInjury: number; // 0 a 100
}

export interface ChallengeExecutionResult {
  challenge: ChallengeDefinition;
  winnerId: string;
  winnerNickname: string;
  finalists: string[];
  logs: ChallengeRoundLog[];
  audienceGained: number;
  authoritySpent: number;
  monstroAssignedIds?: string[]; // IDs de quem tomou o castigo do monstro
}

export interface DirectorTweakOption {
  id: string;
  title: string;
  authorityCost: number;
  description: string;
  effect: 'favor-candidate' | 'double-tension' | 'speed-up' | 'surprise-twist';
  targetParticipantId?: string;
}
