/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RealityDynamicType =
  | 'lider_indicacao'      // Indicação soberana do líder
  | 'casa_confessionario'  // Votação secreta no confessionário
  | 'casa_aberta'          // Votação aberta na sala (dedo na cara)
  | 'contragolpe'          // Emparedado puxa outro
  | 'telefone_misterioso'  // Big Fone toca
  | 'botao_enigma'         // Poder surpresa
  | 'bate_e_volta'         // Prova salva 1 emparedado
  | 'paredao_falso';       // Quarto secreto com mordomias

export interface ParedaoNominee {
  participantId: string;
  name: string;
  nickname: string;
  reason: string;
  nominatedBy: 'lider' | 'casa' | 'contragolpe' | 'big_fone' | 'dinamica';
  votesCount?: number;
  isImmune?: boolean;
  savedByBateVolta?: boolean;
}

export interface HouseVoteEntry {
  voterId: string;
  voterNickname: string;
  targetId: string;
  targetNickname: string;
  justification: string;
}

export interface ParedaoFormationState {
  week: number;
  isFormed: boolean;
  liderId?: string;
  anjoId?: string;
  monstroIds?: string[];
  immuneParticipantIds: string[];
  houseVotes: HouseVoteEntry[];
  nominees: ParedaoNominee[];
  isParedaoFalso: boolean;
  activeDynamics: RealityDynamicType[];
  directorInterventionsApplied: string[];
}

export interface VoteDistributionItem {
  participantId: string;
  nickname: string;
  rawVotes: number;
  percentage: number; // Ex: 54.32%
  fandomName: string;
  fandomEngagement: number; // Mutirões ativos
  isEliminated: boolean;
}

export interface ParedaoResult {
  week: number;
  totalVotesCount: number;
  eliminatedParticipantId: string;
  eliminatedNickname: string;
  eliminatedPercentage: number;
  distribution: VoteDistributionItem[];
  presenterSpeech: string;
  isFakeElimination: boolean;
  houseReactionSummary: string;
  resolvedAt: number;
}
