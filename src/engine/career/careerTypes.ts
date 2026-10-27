/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HallOfFameEntry {
  id: string;
  seasonId: string;
  seasonNumber: number;
  programName: string;
  participantId: string;
  participantName: string;
  nickname: string;
  avatarColor: string;
  profession: string;
  title: string;           // ex: "Grande Campeão Histórico", "O Maior Vilão de Todos os Tempos", "Mito do Sincerão"
  recordStat: string;      // ex: "92.4% dos votos na Final", "Venceu 6 Provas do Líder", "Protagonizou 14 Tretas"
  fandomName: string;
  peakIbope: number;
  finalRank: number;
  legacyRating: number;    // 0 a 100
}

export interface SeasonHistorySummary {
  seasonNumber: number;
  programName: string;
  networkName: string;
  mode: 'house' | 'farm' | 'hybrid';
  winnerName: string;
  winnerNickname: string;
  runnerUpName: string;
  averageIbope: number;
  peakIbope: number;
  totalRevenue: number;
  totalCrisesFaced: number;
  totalEpisodesBroadcast: number;
  highlightMoments: string[];
}

export interface DirectorCareerProfile {
  directorName: string;
  networkReputation: number;
  totalSeasonsCompleted: number;
  totalCareerProfit: number;
  highestAudienceEver: number;
  hallOfFame: HallOfFameEntry[];
  seasonsHistory: SeasonHistorySummary[];
  trophies: {
    id: string;
    title: string;
    description: string;
    unlocked: boolean;
    unlockedAt?: string;
  }[];
  godModeEnabled: boolean;
}
