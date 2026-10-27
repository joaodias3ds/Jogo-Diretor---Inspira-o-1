/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ViewerDemographicSegment =
  | 'sofa_familia'     // Valoriza lealdade, respeito, emoção e romance
  | 'jovem_twitter'    // Valoriza treta, cancelamento, ironia e posicionamento
  | 'estrategista'     // Valoriza cálculo de votos, lógica e liderança
  | 'romantica'        // Foco em shipps e afinidade
  | 'hater_caos';      // Vota para eliminar os mais soberbos e quer ver o circo pegar fogo

export interface CoreViewerProfile {
  id: string;
  name: string;
  age: number;
  city: string;
  segment: ViewerDemographicSegment;
  weight: number; // Peso estatístico (ex: 1 perfil = 150.000 espectadores reais)
  favoriteParticipantId?: string;
  rivalParticipantId?: string;
  watchedBiasAwareness: number; // 0-100 (percepção de manipulação da edição)
  memory: string[];
}

export interface ViewerVoteBatch {
  viewerId: string;
  viewerName: string;
  segment: ViewerDemographicSegment;
  votedTargetId: string;
  votedTargetNickname: string;
  justification: string;
  convictionLevel: 'baixa' | 'media' | 'alta' | 'fanatica';
}

export interface FandomGroup {
  id: string;
  name: string;
  targetParticipantId: string;
  targetNickname: string;
  leaderName: string;
  hashtag: string;
  activeMembersCount: number;
  mutiraoIntensity: number; // 1 a 10
  sentiment: 'amoroso' | 'vingativo' | 'defensivo' | 'estrategico';
}

export interface FantasySquad {
  viewerId: string;
  viewerName: string;
  squadParticipantIds: string[];
  totalScore: number;
  rank: number;
}

export interface FantasyPrediction {
  id: string;
  type: 'lider_winner' | 'anjo_winner' | 'eliminated_paredao' | 'big_fone_answer';
  predictedParticipantId: string;
  isCorrect?: boolean;
  pointsAwarded?: number;
}

export interface DirectorBolaoBet {
  week: number;
  predictedWinnerLiderId?: string;
  predictedEliminatedId?: string;
  stakeAuthority: number;
  settled: boolean;
  won: boolean;
  rewardReputation: number;
}
