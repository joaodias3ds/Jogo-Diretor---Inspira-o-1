/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';

import { INITIAL_CAST } from '../engine/housemates/defaultCast';
import {
  createInitialRelationMatrix,
  determineRelationshipType,
  updateRelation,
  getRelationKey,
} from '../engine/social/relationMatrix';
import {
  simulateSocialTick,
  INITIAL_ALLIANCES,
} from '../engine/social/socialSimulator';
import { AllianceGroup } from '../engine/social/socialTypes';

describe('Fase 3 — Motor Social, Relações, Alianças e Conflitos', () => {
  it('deve gerar a matriz completa de relações iniciais para todos os pares do elenco', () => {
    const cast = INITIAL_CAST.slice(0, 10);
    const matrix = createInitialRelationMatrix(cast);

    assert.strictEqual(Object.keys(matrix).length, 10, 'A matriz deve conter todos os 10 participantes como fontes');

    for (const pA of cast) {
      const targets = matrix[pA.id];
      assert.ok(targets, `Participante ${pA.id} deve ter mapa de alvos`);
      assert.strictEqual(
        Object.keys(targets).length,
        9,
        `Participante ${pA.id} deve ter relação com todos os outros 9 participantes`
      );

      for (const pB of cast) {
        if (pA.id === pB.id) continue;
        const rel = targets[pB.id];
        assert.ok(rel, `Relação ${pA.id} -> ${pB.id} deve existir`);
        assert.strictEqual(rel.sourceId, pA.id);
        assert.strictEqual(rel.targetId, pB.id);
        assert.ok(rel.affinity >= -100 && rel.affinity <= 100, 'Afinidade deve estar entre -100 e 100');
        assert.ok(rel.trust >= 0 && rel.trust <= 100, 'Confiança deve estar entre 0 e 100');
        assert.ok(rel.rivalry >= 0 && rel.rivalry <= 100, 'Rivalidade deve estar entre 0 e 100');
        assert.ok(
          ['aliado', 'rival', 'amigo', 'romance', 'neutro', 'desafeto'].includes(rel.type),
          'Tipo de relação deve ser válido'
        );
      }
    }
  });

  it('deve classificar os tipos de relacionamento conforme métricas psicológicas', () => {
    // Romance
    assert.strictEqual(determineRelationshipType(40, 50, 75, 5), 'romance');
    // Rival
    assert.strictEqual(determineRelationshipType(-50, 10, 0, 70), 'rival');
    // Desafeto
    assert.strictEqual(determineRelationshipType(-25, 20, 0, 30), 'desafeto');
    // Aliado
    assert.strictEqual(determineRelationshipType(60, 60, 10, 5), 'aliado');
    // Amigo
    assert.strictEqual(determineRelationshipType(35, 40, 0, 10), 'amigo');
    // Neutro
    assert.strictEqual(determineRelationshipType(5, 40, 0, 10), 'neutro');
  });

  it('deve atualizar relações aplicando deltas e clamping corretos', () => {
    const cast = INITIAL_CAST.slice(0, 4);
    let matrix = createInitialRelationMatrix(cast);

    const idA = cast[0].id;
    const idB = cast[1].id;

    // Aumenta afinidade e lealdade
    matrix = updateRelation(matrix, idA, idB, {
      affinity: 40,
      trust: 30,
      rivalry: -10,
    }, 'Aliança selada no quarto');

    const updated = matrix[idA][idB];
    assert.ok(updated.affinity >= 30, 'Afinidade deve ter subido consideravelmente');
    assert.ok(updated.trust >= 50, 'Confiança deve ter aumentado');
    assert.strictEqual(updated.historySummary, 'Aliança selada no quarto');

    // Clamping superior
    matrix = updateRelation(matrix, idA, idB, { affinity: 200 });
    assert.strictEqual(matrix[idA][idB].affinity, 100, 'Afinidade máxima não deve passar de 100');

    // Clamping inferior
    matrix = updateRelation(matrix, idA, idB, { affinity: -300 });
    assert.strictEqual(matrix[idA][idB].affinity, -100, 'Afinidade mínima não deve ser menor que -100');
  });

  it('deve disparar conflitos autônomos quando moradores estressados dividem o mesmo cômodo', () => {
    const cast = [
      {
        ...INITIAL_CAST[0],
        id: 'hm-test-1',
        currentRoom: 'cozinha-vip' as const,
        states: { ...INITIAL_CAST[0].states, stress: 85 },
      },
      {
        ...INITIAL_CAST[1],
        id: 'hm-test-2',
        currentRoom: 'cozinha-vip' as const,
        states: { ...INITIAL_CAST[1].states, stress: 90 },
      },
    ];

    let matrix = createInitialRelationMatrix(cast);
    // Configura afinidade negativa
    matrix[cast[0].id][cast[1].id].affinity = -30;
    matrix[cast[1].id][cast[0].id].affinity = -30;

    const result = simulateSocialTick(cast, matrix, INITIAL_ALLIANCES, 3, 'Noite');

    assert.ok(result.newConflicts.length >= 1, 'Deve ter gerado pelo menos um conflito na cozinha');
    const conflict = result.newConflicts[0];
    assert.ok(['barraco', 'discussao', 'climão'].includes(conflict.severity));
    assert.ok(conflict.dialogueExchange.length > 0, 'Conflito deve conter linhas de diálogo dramáticas');
    assert.strictEqual(conflict.resolved, false, 'Novo conflito inicia não resolvido');

    // Relação deve ter piorado
    const postMatrix = result.updatedMatrix;
    assert.ok(
      postMatrix[cast[0].id][cast[1].id].affinity < -30,
      'Afinidade deve cair ainda mais após barraco'
    );
  });

  it('deve calcular a coesão das alianças e detectar racha de grupo', () => {
    const cast = INITIAL_CAST.slice(0, 4);
    let matrix = createInitialRelationMatrix(cast);

    const alliance: AllianceGroup = {
      id: 'grp-test',
      name: 'Grupo Teste',
      badgeColor: 'border-cyan-500',
      leaderId: cast[0].id,
      memberIds: [cast[0].id, cast[1].id, cast[2].id],
      cohesion: 80,
      rulesDescription: 'Proteção mútua',
      isBroken: false,
    };

    // Cenário 1: Alta afinidade mantém coesão alta
    for (const m1 of alliance.memberIds) {
      for (const m2 of alliance.memberIds) {
        if (m1 !== m2) {
          matrix[m1][m2].affinity = 70;
        }
      }
    }

    let result = simulateSocialTick(cast, matrix, [alliance], 1, 'Tarde');
    assert.ok(result.updatedAlliances[0].cohesion >= 70, 'Coesão deve permanecer alta com afinidade positiva');
    assert.strictEqual(result.updatedAlliances[0].isBroken, false, 'Aliança não deve estar rachada');

    // Cenário 2: Destruição da afinidade gera racha no grupo
    for (const m1 of alliance.memberIds) {
      for (const m2 of alliance.memberIds) {
        if (m1 !== m2) {
          matrix[m1][m2].affinity = -50;
        }
      }
    }

    result = simulateSocialTick(cast, matrix, [alliance], 1, 'Noite');
    assert.ok(result.updatedAlliances[0].cohesion < 25, 'Coesão deve desabar com afinidade negativa');
    assert.strictEqual(result.updatedAlliances[0].isBroken, true, 'Aliança deve rachar com coesão crítica');
  });

  it('deve aplicar decaimento gradual às memórias episódicas antigas', () => {
    const testParticipant = {
      ...INITIAL_CAST[0],
      memories: [
        {
          id: 'mem-recent',
          day: 5,
          sentiment: 'negative' as const,
          description: 'Discussão recente na cozinha',
          involvedParticipantNames: ['Camila'],
          intensity: 8,
        },
        {
          id: 'mem-old',
          day: 1,
          sentiment: 'neutral' as const,
          description: 'Conversa no primeiro dia',
          involvedParticipantNames: ['Bruninha'],
          intensity: 2,
        },
      ],
    };

    const matrix = createInitialRelationMatrix([testParticipant]);
    const result = simulateSocialTick([testParticipant], matrix, [], 5, 'Noite');

    const updatedP = result.updatedCast[0];
    const recentMem = updatedP.memories.find((m) => m.id === 'mem-recent');
    assert.ok(recentMem, 'Memória recente não deve sumir');

    // Memória antiga com intensidade 2 decai para 1 e é podada (< 2)
    const oldMem = updatedP.memories.find((m) => m.id === 'mem-old');
    assert.strictEqual(oldMem, undefined, 'Memória fraca antiga deve sofrer decaimento e ser esquecida');
  });
});
