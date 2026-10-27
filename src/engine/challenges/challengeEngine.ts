/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Participant } from '@/engine/housemates/types';
import { RelationMap } from '@/engine/social/relationMatrix';
import {
  ChallengeDefinition,
  ChallengeExecutionResult,
  ChallengeRoundLog,
  DirectorTweakOption,
} from './challengeTypes';

export const DEFAULT_CHALLENGES_CATALOG: ChallengeDefinition[] = [
  {
    id: 'lider-resistencia-carro',
    title: 'Prova do Líder: Resistência no Carro',
    type: 'lider',
    category: 'resistencia',
    primarySkill: 'endurance',
    description: 'Participantes ficam em pé sobre uma plataforma giratória segurando uma barra sob jatos d’água e vento.',
    roundsCount: 4,
    productionCost: 18000,
    audienceBonus: 4.8,
    sponsorName: 'Automóveis Astral',
    riskOfInjury: 15,
  },
  {
    id: 'lider-labirinto-tempo',
    title: 'Prova do Líder: O Grande Labirinto',
    type: 'lider',
    category: 'agilidade',
    primarySkill: 'agility',
    description: 'Circuito com obstáculos de espuma, túneis estreitos e coleta de cards patrocinados contra o cronômetro.',
    roundsCount: 3,
    productionCost: 14000,
    audienceBonus: 3.5,
    sponsorName: 'Tênis TurboRun',
    riskOfInjury: 10,
  },
  {
    id: 'anjo-tiro-ao-alvo',
    title: 'Prova do Anjo: Precisão & Monstro',
    type: 'anjo',
    category: 'fisica',
    primarySkill: 'aim',
    description: 'Disparar catapultas em painéis numéricos gigantes. Vencedor ganha colar da imunidade e define o Castigo do Monstro.',
    roundsCount: 3,
    productionCost: 11000,
    audienceBonus: 3.2,
    sponsorName: 'Colchões Realce',
    riskOfInjury: 5,
  },
  {
    id: 'bate-volta-roleta',
    title: 'Bate-e-Volta: Roleta dos Emparedados',
    type: 'bate-volta',
    category: 'sorte',
    primarySkill: 'logic',
    description: 'Emparedados escolhem caixas secretas numeradas. Apenas uma contém a chave dourada que liberta do paredão.',
    roundsCount: 3,
    productionCost: 8000,
    audienceBonus: 4.5,
    riskOfInjury: 0,
  },
  {
    id: 'sincerao-flechadas',
    title: 'Sincerão ao Vivo: Jogo da Discórdia',
    type: 'sincerao',
    category: 'social',
    primarySkill: 'teamwork',
    description: 'Participantes devem colar placas na testa dos rivais: "Falso", "Traidor", "Planta" e "Insuportável". Tensão ao vivo.',
    roundsCount: 2,
    productionCost: 5000,
    audienceBonus: 5.5,
    riskOfInjury: 0,
  },
  {
    id: 'comida-xepa-vip',
    title: 'Prova da Comida: Mercado & Moela',
    type: 'comida-xepa',
    category: 'logica',
    primarySkill: 'memory',
    description: 'Quiz acelerado sobre itens da despensa. Quem errar é rebaixado à Xepa sem direito a carne ou doces.',
    roundsCount: 3,
    productionCost: 9000,
    audienceBonus: 2.8,
    sponsorName: 'Supermercados Pão Dourado',
    riskOfInjury: 0,
  },
];

export const DIRECTOR_TWEAKS: DirectorTweakOption[] = [
  {
    id: 'tweak-boost-favorite',
    title: 'Interferência Sutil: Vento Favorável',
    authorityCost: 15,
    description: 'Dá vantagem na pontaria ou tempo extra para o participante com maior carisma.',
    effect: 'favor-candidate',
  },
  {
    id: 'tweak-double-tension',
    title: 'Pressão Máxima: Dobrar Dificuldade',
    authorityCost: 10,
    description: 'Acelera a prova com cronômetro reduzido pela metade gerando mais erros e desespero.',
    effect: 'double-tension',
  },
  {
    id: 'tweak-surprise-twist',
    title: 'Reviravolta dos Bastidores: Rodada Bônus',
    authorityCost: 20,
    description: 'Insere uma regra surpresa revelada pelo apresentador que muda os finalistas.',
    effect: 'surprise-twist',
  },
];

/**
 * Simulates a full challenge with round-by-round elimination
 */
export function executeChallenge(
  challenge: ChallengeDefinition,
  eligibleCast: Participant[],
  relationMatrix: RelationMap,
  activeTweak?: DirectorTweakOption
): ChallengeExecutionResult {
  let contenders = [...eligibleCast.filter((p) => !p.isEliminated)];
  if (contenders.length === 0) {
    throw new Error('Nenhum participante elegível para a prova.');
  }

  const logs: ChallengeRoundLog[] = [];
  const rounds = challenge.roundsCount;

  for (let r = 1; r <= rounds; r++) {
    // Score each contender in this round
    const scored = contenders.map((p) => {
      const skillVal = p.skills[challenge.primarySkill] || 50;
      const staminaFactor = (p.stats.stamina || 70) / 100;
      const moodFactor = (p.stats.mood || 70) / 100;
      const luck = Math.random() * 30;

      let score = skillVal * 0.45 + staminaFactor * 25 + moodFactor * 15 + luck;

      // Apply director intervention if chosen
      if (activeTweak?.effect === 'favor-candidate' && p.stats.popularity > 65) {
        score += 25; // boost favorite
      } else if (activeTweak?.effect === 'double-tension') {
        score -= (p.states.stress / 100) * 20; // high stress hurts more
      }

      return { participant: p, score };
    });

    // Sort descending by performance
    scored.sort((a, b) => b.score - a.score);

    // If final round, pick winner
    if (r === rounds || contenders.length <= 2) {
      const winner = scored[0].participant;
      const eliminated = scored.slice(1).map((s) => s.participant.nickname);
      logs.push({
        round: r,
        description: `Grande Final: ${winner.nickname} supera os concorrentes com performance impecável e vence ${challenge.title}!`,
        eliminatedParticipants: eliminated,
        standoutParticipants: [winner.nickname],
        directorInterventionApplied: activeTweak?.title,
      });
      contenders = [winner];
      break;
    }

    // Eliminate bottom half
    const cutoff = Math.max(2, Math.ceil(contenders.length * 0.5));
    const surviving = scored.slice(0, cutoff).map((s) => s.participant);
    const eliminated = scored.slice(cutoff).map((s) => s.participant.nickname);
    const topPerformer = scored[0].participant.nickname;

    logs.push({
      round: r,
      description: `Rodada ${r}: ${topPerformer} se destaca na liderança da disputa. ${eliminated.length} participantes eliminados.`,
      eliminatedParticipants: eliminated,
      standoutParticipants: [topPerformer],
      directorInterventionApplied: r === 1 ? activeTweak?.title : undefined,
    });

    contenders = surviving;
  }

  const winner = contenders[0];

  // If Anjo challenge, assign Castigo do Monstro to 2 worst rivals of winner
  let monstroAssignedIds: string[] | undefined;
  if (challenge.type === 'anjo') {
    const winnerRelations = relationMatrix[winner.id] || {};
    const otherParticipants = eligibleCast.filter((p) => p.id !== winner.id && !p.isEliminated);

    otherParticipants.sort((a, b) => {
      const affA = winnerRelations[a.id]?.affinity ?? 50;
      const affB = winnerRelations[b.id]?.affinity ?? 50;
      return affA - affB; // lowest affinity first
    });

    const monsterVictims = otherParticipants.slice(0, 2);
    monstroAssignedIds = monsterVictims.map((v) => v.id);

    logs.push({
      round: rounds + 1,
      description: `CASTIGO DO MONSTRO: O Anjo ${winner.nickname} colocou no Monstro: ${monsterVictims.map((m) => m.nickname).join(' e ')}!`,
      eliminatedParticipants: [],
      standoutParticipants: monsterVictims.map((m) => m.nickname),
    });
  }

  const audienceGained = parseFloat((challenge.audienceBonus + (activeTweak ? 0.8 : 0)).toFixed(1));
  const authoritySpent = activeTweak?.authorityCost || 0;

  return {
    challenge,
    winnerId: winner.id,
    winnerNickname: winner.nickname,
    finalists: eligibleCast.slice(0, 3).map((p) => p.nickname),
    logs,
    audienceGained,
    authoritySpent,
    monstroAssignedIds,
  };
}
