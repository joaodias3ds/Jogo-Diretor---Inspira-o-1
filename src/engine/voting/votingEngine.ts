/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Participant } from '@/engine/housemates/types';
import { RelationMap } from '@/engine/social/relationMatrix';
import {
  HouseVoteEntry,
  ParedaoFormationState,
  ParedaoNominee,
  ParedaoResult,
  RealityDynamicType,
  VoteDistributionItem,
} from './votingTypes';
import { EditingNarrativeBias } from '@/engine/editing/editingTypes';

/**
 * Simula a votação da casa no confessionário ou em voto aberto
 */
export function simulateHouseVoting(
  cast: Participant[],
  relationMatrix: RelationMap,
  immuneIds: string[],
  isVotoAberto: boolean = false
): { votes: HouseVoteEntry[]; tally: Record<string, number> } {
  const activeHousemates = cast.filter((p) => !p.isEliminated);
  const eligibleTargets = activeHousemates.filter((p) => !immuneIds.includes(p.id));
  const tally: Record<string, number> = {};
  const votes: HouseVoteEntry[] = [];

  activeHousemates.forEach((voter) => {
    // Escolhe o alvo elegível com menor afinidade ou maior rivalidade
    let worstScore = Infinity;
    let chosenTarget = eligibleTargets[0];

    eligibleTargets.forEach((target) => {
      if (target.id === voter.id) return;
      const rel = relationMatrix[voter.id]?.[target.id] || { affinity: 0, rivalry: 10, trust: 40, respect: 50, attraction: 0, history: [] };
      const score = rel.affinity - rel.rivalry * 1.5;

      if (score < worstScore) {
        worstScore = score;
        chosenTarget = target;
      }
    });

    if (chosenTarget && chosenTarget.id !== voter.id) {
      tally[chosenTarget.id] = (tally[chosenTarget.id] || 0) + 1;

      const justifications = [
        `"Meu voto hoje é por questão de convivência e falta de empatia no dia a dia."`,
        `"Sinto que não joga limpo e se esconde atrás de outros moradores."`,
        `"Tivemos uma rusga recente e sinto que sou o alvo principal dessa pessoa."`,
        `"Puro critério estratégico para proteger meus aliados de grupo."`,
        `"Acho que se vitimiza demais para as câmeras e não ajuda nas tarefas coletivas."`,
      ];
      const justification = justifications[Math.floor(Math.random() * justifications.length)];

      votes.push({
        voterId: voter.id,
        voterNickname: voter.nickname,
        targetId: chosenTarget.id,
        targetNickname: chosenTarget.nickname,
        justification: isVotoAberto ? `[VOTO ABERTO] ${justification}` : justification,
      });
    }
  });

  return { votes, tally };
}

/**
 * Monta o Paredão com base no líder, votação da casa e dinâmicas
 */
export function formParedao({
  week,
  cast,
  liderId,
  anjoId,
  monstroIds,
  immuneIds,
  relationMatrix,
  includeContragolpe = true,
  isParedaoFalso = false,
}: {
  week: number;
  cast: Participant[];
  liderId?: string;
  anjoId?: string;
  monstroIds?: string[];
  immuneIds: string[];
  relationMatrix: RelationMap;
  includeContragolpe?: boolean;
  isParedaoFalso?: boolean;
}): ParedaoFormationState {
  const activeHousemates = cast.filter((p) => !p.isEliminated);
  const totalImmune = [...new Set([...immuneIds, ...(liderId ? [liderId] : [])])];

  // 1. Indicação do Líder
  let liderPick: Participant | undefined;
  if (liderId) {
    const lider = cast.find((p) => p.id === liderId);
    const eligibleForLider = activeHousemates.filter((p) => !totalImmune.includes(p.id));

    let lowestAffinity = Infinity;
    eligibleForLider.forEach((candidate) => {
      const rel = relationMatrix[liderId]?.[candidate.id] || { affinity: 0, rivalry: 10, trust: 40, respect: 50, attraction: 0, history: [] };
      const score = rel.affinity - rel.rivalry * 2;
      if (score < lowestAffinity) {
        lowestAffinity = score;
        liderPick = candidate;
      }
    });
  }

  // Se não houver líder definido, escolhe o mais rivalizado geral
  if (!liderPick) {
    liderPick = activeHousemates.find((p) => !totalImmune.includes(p.id));
  }

  const nominees: ParedaoNominee[] = [];
  if (liderPick) {
    nominees.push({
      participantId: liderPick.id,
      name: liderPick.name,
      nickname: liderPick.nickname,
      reason: 'Indicado direto pelo Líder da semana (sem Bate-e-Volta)',
      nominatedBy: 'lider',
    });
  }

  // 2. Votação da Casa
  const houseImmune = [...totalImmune, ...(liderPick ? [liderPick.id] : [])];
  const { votes, tally } = simulateHouseVoting(cast, relationMatrix, houseImmune);

  let mostVotedId: string | null = null;
  let maxVotes = -1;
  Object.entries(tally).forEach(([targetId, count]) => {
    if (count > maxVotes) {
      maxVotes = count;
      mostVotedId = targetId;
    }
  });

  const housePick = cast.find((p) => p.id === mostVotedId);
  if (housePick) {
    nominees.push({
      participantId: housePick.id,
      name: housePick.name,
      nickname: housePick.nickname,
      reason: `Mais votado pela casa (${maxVotes} votos no Confessionário)`,
      nominatedBy: 'casa',
      votesCount: maxVotes,
    });
  }

  // 3. Contragolpe (O mais votado da casa puxa um rival)
  if (includeContragolpe && housePick) {
    const alreadyNominated = nominees.map((n) => n.participantId);
    const eligibleForContragolpe = activeHousemates.filter(
      (p) => !totalImmune.includes(p.id) && !alreadyNominated.includes(p.id)
    );

    let lowestRel = Infinity;
    let contragolpePick = eligibleForContragolpe[0];

    eligibleForContragolpe.forEach((cand) => {
      const rel = relationMatrix[housePick.id]?.[cand.id] || { affinity: 0, rivalry: 10, trust: 40, respect: 50, attraction: 0, history: [] };
      const score = rel.affinity - rel.rivalry * 2;
      if (score < lowestRel) {
        lowestRel = score;
        contragolpePick = cand;
      }
    });

    if (contragolpePick) {
      nominees.push({
        participantId: contragolpePick.id,
        name: contragolpePick.name,
        nickname: contragolpePick.nickname,
        reason: `Puxado no Contragolpe por ${housePick.nickname}`,
        nominatedBy: 'contragolpe',
      });
    }
  }

  const activeDynamics: RealityDynamicType[] = ['lider_indicacao', 'casa_confessionario'];
  if (includeContragolpe) activeDynamics.push('contragolpe');
  if (isParedaoFalso) activeDynamics.push('paredao_falso');

  return {
    week,
    isFormed: true,
    liderId,
    anjoId,
    monstroIds,
    immuneParticipantIds: totalImmune,
    houseVotes: votes,
    nominees,
    isParedaoFalso,
    activeDynamics,
    directorInterventionsApplied: [],
  };
}

/**
 * Executa a Prova Bate-e-Volta entre os indicados elegíveis (exceto o indicado do líder)
 */
export function executeBateVolta(
  formation: ParedaoFormationState,
  cast: Participant[]
): {
  savedParticipantId?: string;
  savedNickname?: string;
  updatedNominees: ParedaoNominee[];
  log: string;
} {
  const eligible = formation.nominees.filter((n) => n.nominatedBy !== 'lider');
  if (eligible.length < 2) {
    return {
      updatedNominees: formation.nominees,
      log: 'Participantes insuficientes para disputa de Bate-e-Volta.',
    };
  }

  // Sorte e skill de lógica determinam o vencedor da salvação
  let bestScore = -1;
  let winner = eligible[0];

  eligible.forEach((nominee) => {
    const p = cast.find((c) => c.id === nominee.participantId);
    const skillScore = p ? p.skills.logic * 0.4 + p.skills.agility * 0.3 : 15;
    const luckScore = Math.random() * 40;
    const total = skillScore + luckScore;

    if (total > bestScore) {
      bestScore = total;
      winner = nominee;
    }
  });

  const updatedNominees = formation.nominees.map((n) =>
    n.participantId === winner.participantId ? { ...n, savedByBateVolta: true } : n
  );

  return {
    savedParticipantId: winner.participantId,
    savedNickname: winner.nickname,
    updatedNominees,
    log: `Parabéns! ${winner.nickname} venceu a Prova Bate-e-Volta e escapou da berlinda ao vivo!`,
  };
}

/**
 * Fallback de Voto Popular por Fórmula:
 * Voto simulado com milhões de votos baseado em popularidade, rejeição, edição e torcidas
 */
export function calculateParedaoVotes(
  activeNominees: ParedaoNominee[],
  cast: Participant[],
  narrativeBias?: EditingNarrativeBias,
  targetEditedId?: string
): ParedaoResult {
  const filtered = activeNominees.filter((n) => !n.savedByBateVolta);
  if (filtered.length === 0) {
    throw new Error('Não há emparedados ativos para votação.');
  }

  // Total de votos na casa de dezenas de milhões (estilo Big Brother recordista)
  const baseMultiplier = Math.floor(Math.random() * 35000000) + 40000000; // 40M a 75M votos
  const scores: { nominee: ParedaoNominee; score: number; fandom: string; engagement: number }[] = [];

  const fandomNames = [
    'Tropa dos Leais',
    'Cactos Furiosos',
    'Legião da Pipoca',
    'Fandom Caos & Glória',
    'Time Estratégia',
    'Vitimistas Unidos',
  ];

  filtered.forEach((nominee, idx) => {
    const p = cast.find((c) => c.id === nominee.participantId);
    const pop = p?.stats.popularity || 50;
    const rej = p?.stats.rejection || 20;
    const charisma = p?.traits.includes('carismatico') ? 15 : 0;
    const estresse = p?.states?.stress || 30;

    // Fórmula do voto para ELIMINAR (quanto maior o score de rejeição, mais votos para sair):
    // Rejeição direta + estresse + baixa popularidade + influência da edição
    let rejectionWeight = (100 - pop) * 1.4 + rej * 1.8 + estresse * 0.4 - charisma;

    // Se a edição focou em pintá-lo como vilão ou hipócrita, a rejeição dispara!
    if (targetEditedId === nominee.participantId) {
      if (narrativeBias === 'vilao') rejectionWeight *= 1.45;
      if (narrativeBias === 'hipocrisia') rejectionWeight *= 1.35;
      if (narrativeBias === 'vitima') rejectionWeight *= 0.65; // Salvo pelo público!
      if (narrativeBias === 'romance') rejectionWeight *= 0.8;
    }

    const fandomEngagement = Math.floor(pop * 1.5 + Math.random() * 20);
    const fandomName = fandomNames[idx % fandomNames.length];

    scores.push({
      nominee,
      score: Math.max(5, rejectionWeight),
      fandom: fandomName,
      engagement: fandomEngagement,
    });
  });

  const totalScore = scores.reduce((acc, s) => acc + s.score, 0);
  let totalDistributedVotes = 0;

  const distribution: VoteDistributionItem[] = scores.map((s, index) => {
    const percentage = parseFloat(((s.score / totalScore) * 100).toFixed(2));
    const isLast = index === scores.length - 1;

    let rawVotes: number;
    if (isLast) {
      rawVotes = baseMultiplier - totalDistributedVotes;
    } else {
      rawVotes = Math.round((percentage / 100) * baseMultiplier);
      totalDistributedVotes += rawVotes;
    }

    return {
      participantId: s.nominee.participantId,
      nickname: s.nominee.nickname,
      rawVotes,
      percentage,
      fandomName: s.fandom,
      fandomEngagement: s.engagement,
      isEliminated: false,
    };
  });

  // Ordena por maior porcentagem (o mais votado é eliminado)
  distribution.sort((a, b) => b.percentage - a.percentage);
  distribution[0].isEliminated = true;

  const eliminated = distribution[0];
  const speech = generatePresenterSpeech(eliminated, distribution.slice(1));

  return {
    week: 1,
    totalVotesCount: baseMultiplier,
    eliminatedParticipantId: eliminated.participantId,
    eliminatedNickname: eliminated.nickname,
    eliminatedPercentage: eliminated.percentage,
    distribution,
    presenterSpeech: speech,
    isFakeElimination: false,
    houseReactionSummary: `A casa ficou atordoada com o anúncio. Os aliados de ${eliminated.nickname} caíram no choro enquanto os rivais comemoraram discretamente.`,
    resolvedAt: Date.now(),
  };
}

/**
 * Gera o monólogo de eliminação característico da TV aberta brasileira
 */
export function generatePresenterSpeech(
  eliminated: VoteDistributionItem,
  contenders: VoteDistributionItem[],
  isFake: boolean = false
): string {
  const contenderNames = contenders.map((c) => c.nickname).join(' e ');

  if (isFake) {
    return `"Atenção casa... Hoje não se trata de sair do jogo para sempre. O público julgou a coragem, as alianças e a verdade de vocês. Quem deixa a casa hoje... mas vai direto para o Quarto Secreto... é você, ${eliminated.nickname}!"`;
  }

  const intros = [
    `"Quando vocês entraram por aquela porta, prometeram não fugir dos embates. Disseram que o medo do julgamento alheio ficaria do lado de fora. Só que o confinamento é uma lente de aumento impiedosa.`,
    `"Viver sob o olhar atento de milhões de pessoas exige coerência. Cada palavra dita na fogueira, cada silêncio na cozinha tem peso na hora em que o público abre a votação.`,
    `"Vocês três (ou dois) construíram histórias fortes nesta temporada. Houve afeto, mas também houve cálculo. E no final das contas, quem decide não é a convicção de vocês lá dentro, é o coração de quem assiste aqui fora.`,
  ];

  const middle = intros[Math.floor(Math.random() * intros.length)];

  return `${middle} ${contenderNames}, vocês continuam no jogo. Quem sai hoje com ${eliminated.percentage}% dos votos... é você, ${eliminated.nickname}!"`;
}
