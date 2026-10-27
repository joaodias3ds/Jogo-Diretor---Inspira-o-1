/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Participant } from '@/engine/housemates/types';
import { DailyEpisodePackage } from '@/engine/editing/editingTypes';
import { ParedaoNominee, ParedaoResult, VoteDistributionItem } from '@/engine/voting/votingTypes';
import {
  CoreViewerProfile,
  DirectorBolaoBet,
  FandomGroup,
  FantasySquad,
  ViewerDemographicSegment,
  ViewerVoteBatch,
} from './viewerTypes';

export const INITIAL_CORE_VIEWERS: CoreViewerProfile[] = [
  {
    id: 'view-01',
    name: 'Dona Neide Silva',
    age: 58,
    city: 'Campinas, SP',
    segment: 'sofa_familia',
    weight: 185000,
    watchedBiasAwareness: 20,
    memory: ['Não gosta de quem fala palavrão na cozinha', 'Torce por amizades verdadeiras'],
  },
  {
    id: 'view-02',
    name: 'Enzo Gabriel (Tuiteiro)',
    age: 22,
    city: 'Belo Horizonte, MG',
    segment: 'jovem_twitter',
    weight: 210000,
    watchedBiasAwareness: 75,
    memory: ['Subiu tag contra planta no primeiro dia', 'Quer exposed de hipocrisia'],
  },
  {
    id: 'view-03',
    name: 'Dr. Roberto Meireles',
    age: 44,
    city: 'Porto Alegre, RS',
    segment: 'estrategista',
    weight: 140000,
    watchedBiasAwareness: 85,
    memory: ['Analisa porcentagens de prova', 'Prefere jogadores calculistas que jogam limpo'],
  },
  {
    id: 'view-04',
    name: 'Camila Alencar',
    age: 27,
    city: 'Salvador, BA',
    segment: 'romantica',
    weight: 165000,
    watchedBiasAwareness: 35,
    memory: ['Chora com reconciliações', 'Ama casais improváveis na piscina'],
  },
  {
    id: 'view-05',
    name: 'Felipe "Caos" Mendes',
    age: 31,
    city: 'Rio de Janeiro, RJ',
    segment: 'hater_caos',
    weight: 195000,
    watchedBiasAwareness: 90,
    memory: ['Torce pela briga da comida', 'Vota sempre no participante mais soberbo'],
  },
  {
    id: 'view-06',
    name: 'Professora Marisa',
    age: 52,
    city: 'Fortaleza, CE',
    segment: 'sofa_familia',
    weight: 170000,
    watchedBiasAwareness: 30,
    memory: ['Adora o café da manhã dos confinados', 'Defende os mais velhos da casa'],
  },
  {
    id: 'view-07',
    name: 'Lucas K-Popper',
    age: 19,
    city: 'Curitiba, PR',
    segment: 'jovem_twitter',
    weight: 240000,
    watchedBiasAwareness: 80,
    memory: ['Faz mutirão de 48 horas sem dormir', 'Odeia quem faz jogo duplo'],
  },
  {
    id: 'view-08',
    name: 'Beatriz Designer',
    age: 29,
    city: 'São Paulo, SP',
    segment: 'estrategista',
    weight: 155000,
    watchedBiasAwareness: 70,
    memory: ['Observa leitura de jogo no Sincerão', 'Não tolera quem sabota aliados'],
  },
];

/**
 * Cria Fandoms com nomes autênticos para os participantes em evidência
 */
export function createDynamicFandoms(cast: Participant[]): FandomGroup[] {
  const prominent = [...cast]
    .filter((p) => !p.isEliminated)
    .sort((a, b) => b.stats.popularity - a.stats.popularity)
    .slice(0, 5);

  const adjectives = ['Furiosos', 'Leais', 'Supremos', 'Blindados', 'Imbatíveis'];
  const sentiments: ('amoroso' | 'vingativo' | 'defensivo' | 'estrategico')[] = [
    'amoroso',
    'defensivo',
    'vingativo',
    'estrategico',
  ];

  return prominent.map((p, idx) => ({
    id: `fan-${p.id}`,
    name: `Tropa dos ${p.nickname} ${adjectives[idx % adjectives.length]}`,
    targetParticipantId: p.id,
    targetNickname: p.nickname,
    leaderName: `@Central${p.nickname}Oficial`,
    hashtag: `#${p.nickname}Campeao`,
    activeMembersCount: Math.floor(p.stats.popularity * 25000) + 120000,
    mutiraoIntensity: Math.min(10, Math.floor(p.stats.popularity / 10)),
    sentiment: sentiments[idx % sentiments.length],
  }));
}

/**
 * Simulação de Votação da Plateia de IA:
 * Cada perfil avalia os emparedados levando em consideração o que assistiu na Edição Diária
 */
export function simulateAIAudienceVoting({
  viewers = INITIAL_CORE_VIEWERS,
  nominees,
  cast,
  latestEpisode,
}: {
  viewers?: CoreViewerProfile[];
  nominees: ParedaoNominee[];
  cast: Participant[];
  latestEpisode?: DailyEpisodePackage;
}): {
  result: ParedaoResult;
  viewerBatches: ViewerVoteBatch[];
  auditedIntegrityReport: string;
} {
  const activeNominees = nominees.filter((n) => !n.savedByBateVolta);
  if (activeNominees.length === 0) {
    throw new Error('Sem emparedados ativos.');
  }

  const rawVotesTally: Record<string, number> = {};
  const viewerBatches: ViewerVoteBatch[] = [];

  activeNominees.forEach((n) => {
    rawVotesTally[n.participantId] = 0;
  });

  // Cada perfil de espectador-núcleo escolhe em quem votar para ELIMINAR
  viewers.forEach((viewer) => {
    let highestRejection = -Infinity;
    let chosenTarget = activeNominees[0];
    let justification = '';

    activeNominees.forEach((nominee) => {
      const p = cast.find((c) => c.id === nominee.participantId);
      if (!p) return;

      let rejectionScore = 100 - p.stats.popularity + (p.stats.rejection || 20) * 1.5;

      // Influência da Ilha de Edição
      if (latestEpisode && latestEpisode.targetParticipantId === nominee.participantId) {
        if (latestEpisode.narrativeBias === 'vilao') rejectionScore += 35;
        if (latestEpisode.narrativeBias === 'hipocrisia') rejectionScore += 30;
        if (latestEpisode.narrativeBias === 'vitima') rejectionScore -= 40; // O público protege a vítima!
        if (latestEpisode.narrativeBias === 'romance') rejectionScore -= 20;
      }

      // Vieses por segmento
      if (viewer.segment === 'sofa_familia' && p.traits.includes('explosivo')) {
        rejectionScore += 25;
      }
      if (viewer.segment === 'jovem_twitter' && p.traits.includes('dissimulado')) {
        rejectionScore += 30;
      }
      if (viewer.segment === 'estrategista' && p.traits.includes('preguicoso')) {
        rejectionScore += 20;
      }
      if (viewer.segment === 'hater_caos' && p.stats.popularity > 70) {
        rejectionScore += 40; // Gosta de derrubar o favorito para gerar entretenimento
      }

      if (rejectionScore > highestRejection) {
        highestRejection = rejectionScore;
        chosenTarget = nominee;
      }
    });

    // Justificativas autênticas em texto de acordo com o segmento
    switch (viewer.segment) {
      case 'sofa_familia':
        justification = `Não gostei das grosserias de ${chosenTarget.nickname} na cozinha. Falta de educação com os outros moradores.`;
        break;
      case 'jovem_twitter':
        justification = `VT de hoje expôs que ${chosenTarget.nickname} é falso(a) e leva e traz fofoca no quarto. Cancelamento merecido!`;
        break;
      case 'estrategista':
        justification = `Leitura de jogo fraca. ${chosenTarget.nickname} não se posiciona nas provas e apenas sabota aliados.`;
        break;
      case 'romantica':
        justification = `Atrapalhou o casal da edição e foi grosseiro(a) no almoço do anjo. Não merece continuar.`;
        break;
      case 'hater_caos':
      default:
        justification = `${chosenTarget.nickname} está muito confiante de que não sai. Quero ver o tombo da soberba ao vivo!`;
        break;
    }

    const conviction = highestRejection > 90 ? 'fanatica' : highestRejection > 60 ? 'alta' : 'media';
    viewerBatches.push({
      viewerId: viewer.id,
      viewerName: viewer.name,
      segment: viewer.segment,
      votedTargetId: chosenTarget.participantId,
      votedTargetNickname: chosenTarget.nickname,
      justification,
      convictionLevel: conviction,
    });

    // Multiplica pelo peso representativo demográfico
    rawVotesTally[chosenTarget.participantId] += viewer.weight;
  });

  const totalVotesCount = Object.values(rawVotesTally).reduce((a, b) => a + b, 0);

  const distribution: VoteDistributionItem[] = activeNominees.map((n) => {
    const raw = rawVotesTally[n.participantId] || 1;
    const percentage = parseFloat(((raw / totalVotesCount) * 100).toFixed(2));
    return {
      participantId: n.participantId,
      nickname: n.nickname,
      rawVotes: raw,
      percentage,
      fandomName: `Torcida de ${n.nickname}`,
      fandomEngagement: Math.floor(percentage * 1.2),
      isEliminated: false,
    };
  });

  distribution.sort((a, b) => b.percentage - a.percentage);
  distribution[0].isEliminated = true;

  const eliminated = distribution[0];
  const speech = `"A decisão foi tomada com o voto de mais de ${(totalVotesCount / 1000000).toFixed(1)} milhões de brasileiros. A plateia julgou cada atitude, cada silêncio e cada momento de fraqueza. Quem deixa o reality hoje... com ${eliminated.percentage}% dos votos... é você, ${eliminated.nickname}!"`;

  const integrityReport = `Auditoria Anti-Viés: ${viewers.length} núcleos demográficos computados. Distribuição proporcional coerente com histórico de cenas transmitidas.`;

  const result: ParedaoResult = {
    week: 1,
    totalVotesCount,
    eliminatedParticipantId: eliminated.participantId,
    eliminatedNickname: eliminated.nickname,
    eliminatedPercentage: eliminated.percentage,
    distribution,
    presenterSpeech: speech,
    isFakeElimination: false,
    houseReactionSummary: `O anúncio de eliminação gerou perplexidade. As torcidas nos sofás e nas redes reagiram intensamente ao resultado auditado.`,
    resolvedAt: Date.now(),
  };

  return {
    result,
    viewerBatches,
    auditedIntegrityReport: integrityReport,
  };
}

/**
 * Fantasy da Plateia: calcula pontuação da semana
 */
export function calculateFantasySquadScore(
  squad: FantasySquad,
  cast: Participant[],
  liderId?: string,
  anjoId?: string,
  eliminatedId?: string
): FantasySquad {
  let score = 0;

  squad.squadParticipantIds.forEach((id) => {
    const p = cast.find((c) => c.id === id);
    if (!p) return;

    if (id === liderId) score += 20; // Venceu Líder
    if (id === anjoId) score += 15;  // Venceu Anjo
    if (id === eliminatedId) score -= 30; // Eliminado
    if (!p.isEliminated) score += 10; // Bônus permanência
    if (p.isVIP) score += 5;          // VIP
    score += Math.floor(p.stats.popularity / 10);
  });

  return {
    ...squad,
    totalScore: squad.totalScore + score,
  };
}

/**
 * Bolão do Diretor: Liquida aposta do jogador e concede autoridade/reputação
 */
export function settleDirectorBolao(
  bet: DirectorBolaoBet,
  actualLiderId?: string,
  actualEliminatedId?: string
): { updatedBet: DirectorBolaoBet; authorityDiff: number; reputationDiff: number; message: string } {
  let correctHits = 0;
  if (bet.predictedWinnerLiderId && bet.predictedWinnerLiderId === actualLiderId) {
    correctHits += 1;
  }
  if (bet.predictedEliminatedId && bet.predictedEliminatedId === actualEliminatedId) {
    correctHits += 1;
  }

  const won = correctHits > 0;
  const authorityDiff = won ? bet.stakeAuthority * correctHits : -bet.stakeAuthority;
  const reputationDiff = won ? 5 * correctHits : -2;

  const updatedBet: DirectorBolaoBet = {
    ...bet,
    settled: true,
    won,
    rewardReputation: reputationDiff,
  };

  const message = won
    ? `Parabéns Diretor! Seu palpite no Bolão foi certeiro (+${authorityDiff} Autoridade, +${reputationDiff}% Reputação)!`
    : `O palpite do Bolão não se concretizou (-${bet.stakeAuthority} Autoridade). O público surpreendeu a direção!`;

  return { updatedBet, authorityDiff, reputationDiff, message };
}
