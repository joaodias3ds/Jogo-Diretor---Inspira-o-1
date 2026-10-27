/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RelationshipType =
  | 'aliado'
  | 'rival'
  | 'amigo'
  | 'romance'
  | 'neutro'
  | 'desafeto';

export interface RelationshipData {
  sourceId: string;
  targetId: string;
  affinity: number;       // -100 (Ódio mortal) a +100 (Amor/Lealdade cega)
  trust: number;          // 0 a 100 (Confiança em jogo)
  respect: number;        // 0 a 100 (Respeito intelectual/estratégico)
  attraction: number;     // 0 a 100 (Interesse amoroso/sexual)
  rivalry: number;        // 0 a 100 (Desejo de eliminar)
  favorDebt: number;      // -100 a +100 (Dívida de favor)
  type: RelationshipType;
  historySummary: string;
}

export type ConflictCause =
  | 'comida'
  | 'voto'
  | 'tarefas'
  | 'fofoca'
  | 'ciumes'
  | 'ofensa'
  | 'injustica';

export type ConflictSeverity = 'climão' | 'discussao' | 'barraco' | 'quase-agressao';

export interface SocialConflict {
  id: string;
  day: number;
  phase: string;
  sourceParticipantId: string;
  targetParticipantId: string;
  cause: ConflictCause;
  severity: ConflictSeverity;
  description: string;
  dialogueExchange: string[];
  resolved: boolean;
  resolutionNote?: string;
  timestamp: number;
}

export interface AllianceGroup {
  id: string;
  name: string;
  badgeColor: string;
  leaderId: string;
  memberIds: string[];
  cohesion: number;       // 0 a 100 (União do grupo; <35 gera racha)
  rivalGroupId?: string;
  rulesDescription: string;
  isBroken: boolean;
}

export interface GossipItem {
  id: string;
  originParticipantId: string;
  targetParticipantId: string;
  topic: string;
  originalFact: string;
  distortedRumor: string;
  distortionLevel: number; // 0 a 100%
  knowersIds: string[];
  hasLeaked: boolean;
  day: number;
}
