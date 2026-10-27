/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { useGameStore } from '../app/useGameStore.ts';
import { RESERVE_BENCH } from '../engine/housemates/reserveCandidates.ts';
import { INITIAL_STAFF, calculateStudioPayroll, promoteStaffLevel } from '../engine/staff/staffEngine.ts';
import { generateAIDirectorDossier, generateAILiveSocialPost } from '../engine/ai/geminiService.ts';

describe('Escala de Participantes, Staff & IA Reality', () => {
  it('1. Valida Carisma e Controvérsia nos reservas da Casa de Vidro', () => {
    assert(RESERVE_BENCH.length >= 4, 'Banco de reservas deve ter ao menos 4 candidatos');
    for (const cand of RESERVE_BENCH) {
      assert(cand.charisma !== undefined && cand.charisma >= 0 && cand.charisma <= 100, 'Carisma deve estar entre 0 e 100');
      assert(cand.controversy !== undefined && cand.controversy >= 0 && cand.controversy <= 100, 'Controvérsia deve estar entre 0 e 100');
      assert(cand.archetype && cand.archetype.length > 0, 'Participante deve ter arquétipo definido');
    }
  });

  it('2. Testa contratação de candidato da Casa de Vidro no useGameStore', () => {
    const store = useGameStore.getState();
    const candidateToHire = store.reserveBench[0];
    const initialCastLength = store.cast.length;
    const initialBenchLength = store.reserveBench.length;

    const ok = store.hireHousemateFromBench(candidateToHire.id);
    assert(ok === true, 'Contratação do reserva deve ter sucesso');

    const updated = useGameStore.getState();
    assert(updated.cast.length === initialCastLength + 1, 'Elenco deve aumentar em 1');
    assert(updated.reserveBench.length === initialBenchLength - 1, 'Reserva deve sair do banco');
    assert(updated.cast[0].id === candidateToHire.id, 'Novo confinado deve estar no topo do elenco');
  });

  it('3. Testa expulsão / demissão editorial pela Direção', () => {
    const store = useGameStore.getState();
    const target = store.cast[0];

    store.fireHousemateByDirector(target.id, 'Decisão Editorial');
    const updated = useGameStore.getState();
    const expelled = updated.cast.find((p) => p.id === target.id);

    assert(expelled?.isEliminated === true, 'Participante deve estar marcado como eliminado');
  });

  it('4. Testa substituição de participante por suplente', () => {
    const store = useGameStore.getState();
    const activeTarget = store.cast.find((p) => !p.isEliminated);
    const reserveCandidate = store.reserveBench[0];

    assert(activeTarget !== undefined, 'Deve haver participante ativo');
    assert(reserveCandidate !== undefined, 'Deve haver reserva disponível');

    const ok = store.substituteHousemateWithReserve(activeTarget.id, reserveCandidate.id);
    assert(ok === true, 'Substituição deve ter sucesso');

    const updated = useGameStore.getState();
    const oldParticipant = updated.cast.find((p) => p.id === activeTarget.id);
    assert(oldParticipant?.isEliminated === true, 'Participante substituído deve estar eliminado da casa');
    assert(updated.cast.some((p) => p.id === reserveCandidate.id), 'Suplente deve estar no elenco ativo');
  });

  it('5. Valida Equipe Técnica e Talentos (Staff Engine)', () => {
    const payroll = calculateStudioPayroll(INITIAL_STAFF);
    assert(payroll.totalStaffHired > 0, 'Deve haver funcionários contratados inicialmente');
    assert(payroll.frontCameraCount > 0, 'Deve ter talentos na frente das câmeras');
    assert(payroll.behindCameraCount > 0, 'Deve ter equipe atrás das câmeras');
    assert(payroll.totalWeeklyPayroll > 0, 'Folha salarial deve ser positiva');

    // Promoção de nível
    const promoted = promoteStaffLevel('Junior');
    assert.equal(promoted, 'Pleno', 'Junior deve ser promovido a Pleno');
  });

  it('6. Testa serviço de IA Gemini com fallback resiliente', async () => {
    const store = useGameStore.getState();
    const housemate = store.cast[0];

    const dossier = await generateAIDirectorDossier(housemate);
    assert(dossier.narrativeAngle.length > 0, 'Dossiê deve conter ângulo narrativo');
    assert(dossier.directorRecommendation.length > 0, 'Dossiê deve conter recomendação da direção');
    assert(['Baixo', 'Médio', 'Crítico'].includes(dossier.cancelRiskRating), 'Risco deve ser Baixo, Médio ou Crítico');

    const post = await generateAILiveSocialPost(store.cast);
    assert(post.authorName.length > 0, 'Tweet deve ter nome de autor');
    assert(post.authorHandle.startsWith('@'), 'Arroba deve começar com @');
    assert(post.text.length > 0, 'Texto do tweet não pode ser vazio');
  });
});
