/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DirectorCareerProfile, HallOfFameEntry, SeasonHistorySummary } from './careerTypes';
import { Participant } from '@/engine/housemates/types';

export const INITIAL_HALL_OF_FAME: HallOfFameEntry[] = [
  {
    id: 'hof-1',
    seasonId: 'season-pilot',
    seasonNumber: 1,
    programName: 'Casa dos Famosos',
    participantId: 'hm-1',
    participantName: 'Gilmar Oliveira',
    nickname: 'Gil do Pagode',
    avatarColor: 'from-amber-500 to-orange-600',
    profession: 'Músico & Compositor',
    title: 'Campeão Invicto & Rei da Alegria',
    recordStat: '88.6% dos votos na Grande Final · Carisma 92/100',
    fandomName: '#TropaDoGil',
    peakIbope: 46.2,
    finalRank: 1,
    legacyRating: 98,
  },
  {
    id: 'hof-2',
    seasonId: 'season-pilot',
    seasonNumber: 1,
    programName: 'Casa dos Famosos',
    participantId: 'hm-2',
    participantName: 'Dra. Camila Vasconcelos',
    nickname: 'Dra. Camila',
    avatarColor: 'from-blue-600 to-indigo-700',
    profession: 'Advogada Criminalista',
    title: 'A Maior Estrategista & Mente Implacável',
    recordStat: 'Venceu 5 Provas do Líder consecutivas · Controvérsia 82/100',
    fandomName: '#Camilers',
    peakIbope: 48.9,
    finalRank: 2,
    legacyRating: 95,
  },
  {
    id: 'hof-3',
    seasonId: 'season-classic',
    seasonNumber: 0,
    programName: 'A Fazenda Rural',
    participantId: 'hm-legend-3',
    participantName: 'Valéria Rios',
    nickname: 'Valéria do Barro',
    avatarColor: 'from-emerald-600 to-green-700',
    profession: 'Empresária Agropecuária',
    title: 'Mito da Roça & Sobrevivente de 7 Eliminações',
    recordStat: 'Eliminou 7 rivais seguidos na berlinda rural',
    fandomName: '#FuraçãoValéria',
    peakIbope: 44.1,
    finalRank: 1,
    legacyRating: 92,
  },
];

export const INITIAL_CAREER_PROFILE: DirectorCareerProfile = {
  directorName: 'Diretor Geral Astral',
  networkReputation: 88,
  totalSeasonsCompleted: 2,
  totalCareerProfit: 4500000,
  highestAudienceEver: 48.9,
  hallOfFame: INITIAL_HALL_OF_FAME,
  seasonsHistory: [
    {
      seasonNumber: 1,
      programName: 'Casa dos Famosos: Temporada de Estreia',
      networkName: 'Rede Astral de Televisão',
      mode: 'house',
      winnerName: 'Gilmar Oliveira',
      winnerNickname: 'Gil do Pagode',
      runnerUpName: 'Dra. Camila Vasconcelos',
      averageIbope: 31.4,
      peakIbope: 48.9,
      totalRevenue: 2800000,
      totalCrisesFaced: 4,
      totalEpisodesBroadcast: 84,
      highlightMoments: [
        'A treta épica da água gelada no quarto selva',
        'Recorde histórico de votos na eliminação de domingo (82 milhões de votos)',
        'O beijo surpresa na hidromassagem que parou a internet',
      ],
    },
  ],
  trophies: [
    {
      id: 'trophy-first-season',
      title: 'Estreia de Ouro',
      description: 'Concluiu a primeira temporada sem ser demitido pela emissora.',
      unlocked: true,
      unlockedAt: 'Semana 12',
    },
    {
      id: 'trophy-40-ibope',
      title: 'Pico de Horário Nobre (40+ pts)',
      description: 'Alcançou mais de 40 pontos de IBOPE no programa ao vivo.',
      unlocked: true,
      unlockedAt: 'Semana 8',
    },
    {
      id: 'trophy-million-sponsor',
      title: 'Magnata da TV',
      description: 'Acumulou mais de R$ 1.000.000 em saldo de produção.',
      unlocked: false,
    },
    {
      id: 'trophy-big-fone-chaos',
      title: 'Caos no Jardim',
      description: 'Disparou o Big Fone com mais de 200.000 menções nas redes.',
      unlocked: false,
    },
    {
      id: 'trophy-god-mode',
      title: 'Diretor Supremo',
      description: 'Assumiu o controle divino no Modo Diretor-Deus.',
      unlocked: false,
    },
  ],
  godModeEnabled: false,
};

export function completeSeasonAndArchive(
  profile: DirectorCareerProfile,
  winner: Participant,
  runnerUp: Participant,
  seasonNumber: number,
  averageIbope: number,
  peakIbope: number,
  totalProfit: number
): DirectorCareerProfile {
  const newHofEntry: HallOfFameEntry = {
    id: `hof-${Date.now()}`,
    seasonId: `season-${seasonNumber}`,
    seasonNumber,
    programName: `Diretor do Reality: Temp ${seasonNumber}`,
    participantId: winner.id,
    participantName: winner.name,
    nickname: winner.nickname,
    avatarColor: winner.avatarColor,
    profession: winner.profession,
    title: `Campeão da Temporada ${seasonNumber}`,
    recordStat: `${winner.stats.popularity}% aprovação · Carisma ${winner.charisma ?? 75}/100`,
    fandomName: winner.fandomName || `#Team${winner.nickname}`,
    peakIbope,
    finalRank: 1,
    legacyRating: Math.round(((winner.charisma ?? 75) + winner.stats.popularity) / 2),
  };

  const newSeasonSummary: SeasonHistorySummary = {
    seasonNumber,
    programName: `Temporada ${seasonNumber}`,
    networkName: 'Rede Astral de Televisão',
    mode: 'house',
    winnerName: winner.name,
    winnerNickname: winner.nickname,
    runnerUpName: runnerUp.name,
    averageIbope,
    peakIbope,
    totalRevenue: totalProfit,
    totalCrisesFaced: 3,
    totalEpisodesBroadcast: 84,
    highlightMoments: [
      `Consagração de ${winner.nickname} com o prêmio milionário`,
      `Duelo épico de popularidade na final contra ${runnerUp.nickname}`,
      `Pico de audiência de ${peakIbope.toFixed(1)} pontos ao vivo`,
    ],
  };

  return {
    ...profile,
    totalSeasonsCompleted: profile.totalSeasonsCompleted + 1,
    totalCareerProfit: profile.totalCareerProfit + totalProfit,
    highestAudienceEver: Math.max(profile.highestAudienceEver, peakIbope),
    hallOfFame: [newHofEntry, ...profile.hallOfFame],
    seasonsHistory: [newSeasonSummary, ...profile.seasonsHistory],
  };
}
