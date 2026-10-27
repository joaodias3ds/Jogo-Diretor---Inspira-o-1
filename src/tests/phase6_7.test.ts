/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { INITIAL_CAST } from '../engine/housemates/defaultCast';
import { createInitialRelationMatrix } from '../engine/social/relationMatrix';
import { assembleDailyEpisode } from '../engine/editing/editingEngine';
import {
  formParedao,
  executeBateVolta,
  calculateParedaoVotes,
  simulateHouseVoting,
} from '../engine/voting/votingEngine';
import {
  simulateAIAudienceVoting,
  calculateFantasySquadScore,
  settleDirectorBolao,
  INITIAL_CORE_VIEWERS,
  createDynamicFandoms,
} from '../engine/ai-audience/aiViewerEngine';
import { BroadcastTake } from '../engine/broadcast/broadcastTypes';
import { FantasySquad, DirectorBolaoBet } from '../engine/ai-audience/viewerTypes';

describe('Fase 6: Ilha de Edição e Narrativa do Diretor', () => {
  const dummyTakes: BroadcastTake[] = [
    {
      id: 'take-1',
      timestamp: '14:00',
      timecode: '01:14:00:00',
      roomId: 'cozinha-vip',
      cameraName: 'Cozinha VIP',
      narrativeTag: 'treta',
      title: 'Discussão sobre comida',
      durationSeconds: 45,
      dramaRating: 5,
      ibopeImpact: 1.5,
    },
    {
      id: 'take-2',
      timestamp: '16:00',
      timecode: '01:16:00:00',
      roomId: 'sala-estar',
      cameraName: 'Sala de Estar',
      narrativeTag: 'estrategia',
      title: 'Aliança no sofá',
      durationSeconds: 60,
      dramaRating: 4,
      ibopeImpact: 1.2,
    },
  ];

  it('monta o pacote do episódio diário e aplica o bônus de audiência e custo', () => {
    const target = INITIAL_CAST[0];
    const outcome = assembleDailyEpisode({
      day: 3,
      week: 1,
      title: 'Edição de Terça',
      narrativeBias: 'vilao',
      selectedTakes: dummyTakes,
      targetParticipant: target,
      currentIbope: 28.0,
    });

    assert.ok(outcome.episode.id, 'Episódio deve ter ID único');
    assert.strictEqual(outcome.episode.narrativeBias, 'vilao');
    assert.ok(outcome.ibopeGain > 0, 'Ganho de IBOPE deve ser positivo');
    assert.ok(outcome.cashCost > 0, 'Custo de produção deve ser computado');
    assert.ok(outcome.targetRejectionShift > 0, 'Narrativa de vilão deve elevar rejeição do alvo');
    assert.ok(outcome.viewerReactions.length > 0, 'Devem existir reações do público');
  });

  it('narrativa de vítima aumenta a popularidade e reduz a rejeição do alvo', () => {
    const target = INITIAL_CAST[1];
    const outcome = assembleDailyEpisode({
      day: 4,
      week: 1,
      title: 'Edição Especial de Comoção',
      narrativeBias: 'vitima',
      selectedTakes: dummyTakes,
      targetParticipant: target,
      currentIbope: 28.0,
    });

    assert.ok(outcome.targetPopularityShift > 0, 'Narrativa de vítima eleva popularidade');
    assert.ok(outcome.targetRejectionShift < 0, 'Narrativa de vítima reduz rejeição');
  });
});

describe('Fase 6: Formação do Paredão, Votação e Bate-e-Volta', () => {
  const relationMatrix = createInitialRelationMatrix(INITIAL_CAST);

  it('simula a votação da casa no confessionário elegendo o mais rivalizado', () => {
    const immuneIds = [INITIAL_CAST[0].id];
    const { votes, tally } = simulateHouseVoting(INITIAL_CAST, relationMatrix, immuneIds);

    assert.ok(votes.length > 0, 'Devem existir votos computados');
    assert.ok(Object.keys(tally).length > 0, 'Tally deve conter contagem de votos');
    assert.ok(!tally[immuneIds[0]], 'Participante imune não pode receber votos');
  });

  it('monta a formação do paredão com indicação do líder e contragolpe', () => {
    const lider = INITIAL_CAST[0];
    const formation = formParedao({
      week: 1,
      cast: INITIAL_CAST,
      liderId: lider.id,
      immuneIds: [],
      relationMatrix,
      includeContragolpe: true,
    });

    assert.strictEqual(formation.isFormed, true);
    assert.ok(formation.nominees.length >= 2, 'Paredão deve conter ao menos 2 indicados');
    const liderNominee = formation.nominees.find((n) => n.nominatedBy === 'lider');
    assert.ok(liderNominee, 'Deve existir um indicado pelo Líder');
    assert.notStrictEqual(liderNominee?.participantId, lider.id, 'Líder não pode indicar a si mesmo');
  });

  it('prova Bate-e-Volta salva um emparedado da casa e preserva o indicado do líder', () => {
    const lider = INITIAL_CAST[0];
    const formation = formParedao({
      week: 1,
      cast: INITIAL_CAST,
      liderId: lider.id,
      immuneIds: [],
      relationMatrix,
      includeContragolpe: true,
    });

    const result = executeBateVolta(formation, INITIAL_CAST);
    assert.ok(result.savedParticipantId, 'Deve existir participante salvo no Bate-e-Volta');

    const savedNominee = result.updatedNominees.find((n) => n.participantId === result.savedParticipantId);
    assert.strictEqual(savedNominee?.savedByBateVolta, true);
    assert.notStrictEqual(savedNominee?.nominatedBy, 'lider', 'Indicado do Líder não pode disputar/ser salvo no Bate-e-Volta');
  });

  it('fallback de votação por fórmula calcula milhões de votos e gera discurso de Tadeu', () => {
    const lider = INITIAL_CAST[0];
    const formation = formParedao({
      week: 1,
      cast: INITIAL_CAST,
      liderId: lider.id,
      immuneIds: [],
      relationMatrix,
      includeContragolpe: true,
    });

    const result = calculateParedaoVotes(formation.nominees, INITIAL_CAST);
    assert.ok(result.totalVotesCount >= 10000000, 'Total de votos deve ultrapassar 10 milhões');
    assert.strictEqual(result.distribution.length, formation.nominees.length);

    const sumPercentage = result.distribution.reduce((acc, d) => acc + d.percentage, 0);
    assert.ok(Math.abs(sumPercentage - 100) < 0.2, `Soma das porcentagens deve ser ~100% (atual: ${sumPercentage})`);

    assert.ok(result.eliminatedNickname, 'Deve existir eliminado');
    assert.ok(result.presenterSpeech.includes(result.eliminatedNickname), 'Discurso de Tadeu deve conter o nome do eliminado');
  });
});

describe('Fase 7: Plateia de IA, Fandoms e Fantasy Game', () => {
  it('plateia de IA emite votos auditados por segmento com justificativas e pesos demográficos', () => {
    const relationMatrix = createInitialRelationMatrix(INITIAL_CAST);
    const formation = formParedao({
      week: 1,
      cast: INITIAL_CAST,
      liderId: INITIAL_CAST[0].id,
      immuneIds: [],
      relationMatrix,
      includeContragolpe: true,
    });

    const aiVoting = simulateAIAudienceVoting({
      viewers: INITIAL_CORE_VIEWERS,
      nominees: formation.nominees,
      cast: INITIAL_CAST,
    });

    assert.ok(aiVoting.viewerBatches.length > 0, 'Devem existir lotes de voto da plateia de IA');
    assert.ok(aiVoting.result.totalVotesCount > 500000, 'Votos ponderados devem escalar');
    assert.ok(aiVoting.result.eliminatedNickname, 'Plateia de IA deve definir eliminado');

    const firstBatch = aiVoting.viewerBatches[0];
    assert.ok(firstBatch.justification.length > 5, 'Justificativa do espectador deve ser textual');
    assert.ok(firstBatch.segment, 'Deve conter segmento demográfico');
  });

  it('cria fandoms dinâmicos com membros e intensidade de mutirão', () => {
    const fandoms = createDynamicFandoms(INITIAL_CAST);
    assert.ok(fandoms.length >= 3, 'Devem existir fandoms ativos');
    assert.ok(fandoms[0].hashtag.startsWith('#'), 'Fandom deve ter hashtag oficial');
    assert.ok(fandoms[0].activeMembersCount > 10000, 'Fandom deve possuir milhares de membros');
  });

  it('calcula pontuação do fantasy squad e liquida o bolão do diretor', () => {
    const squad: FantasySquad = {
      viewerId: 'user-01',
      viewerName: 'Torcedor Fiel',
      squadParticipantIds: [INITIAL_CAST[0].id, INITIAL_CAST[1].id, INITIAL_CAST[2].id],
      totalScore: 50,
      rank: 1,
    };

    const updatedSquad = calculateFantasySquadScore(
      squad,
      INITIAL_CAST,
      INITIAL_CAST[0].id, // Líder
      INITIAL_CAST[1].id  // Anjo
    );

    assert.ok(updatedSquad.totalScore > 50, 'Pontuação do fantasy deve aumentar com líder e anjo no time');

    // Bolão do Diretor
    const bet: DirectorBolaoBet = {
      week: 1,
      predictedWinnerLiderId: INITIAL_CAST[0].id,
      predictedEliminatedId: INITIAL_CAST[3].id,
      stakeAuthority: 20,
      settled: false,
      won: false,
      rewardReputation: 0,
    };

    const settlement = settleDirectorBolao(bet, INITIAL_CAST[0].id, INITIAL_CAST[3].id);
    assert.strictEqual(settlement.updatedBet.settled, true);
    assert.strictEqual(settlement.updatedBet.won, true);
    assert.ok(settlement.authorityDiff > 0, 'Acerto no bolão deve conceder autoridade');
  });
});
