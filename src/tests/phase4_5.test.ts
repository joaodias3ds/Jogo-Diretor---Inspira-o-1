/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { REALITY_ROOMS, CAMERA_PRESETS } from '../engine/three/roomData';
import { LIGHTING_PHASES } from '../engine/three/LightingManager';
import {
  DEFAULT_CHALLENGES_CATALOG,
  DIRECTOR_TWEAKS,
  executeChallenge,
} from '../engine/challenges/challengeEngine';
import { INITIAL_CAST } from '../engine/housemates/defaultCast';
import { createInitialRelationMatrix } from '../engine/social/relationMatrix';
import { useBroadcastStore } from '../engine/broadcast/broadcastStore';

describe('Fase 4: Mundo 3D da Casa & Câmeras', () => {
  it('todas as 8 salas do reality possuem coordenadas, dimensões e pisos válidos', () => {
    const requiredRooms = [
      'sala-estar',
      'cozinha-vip',
      'cozinha-xepa',
      'quarto-selva',
      'quarto-oceano',
      'piscina-jardim',
      'confessionario',
      'academia',
    ] as const;

    requiredRooms.forEach((roomId) => {
      const room = REALITY_ROOMS[roomId];
      assert.ok(room, `Sala ${roomId} deve existir`);
      assert.ok(room.width > 0, `Largura da sala ${roomId} deve ser > 0`);
      assert.ok(room.depth > 0, `Profundidade da sala ${roomId} deve ser > 0`);
      assert.ok(typeof room.floorColor === 'number', `Cor de piso deve ser válida`);
    });
  });

  it('presets de câmeras cobrem os ambientes principais com FOV e alvos válidos', () => {
    assert.ok(CAMERA_PRESETS.length >= 8, 'Devem existir no mínimo 8 câmeras de reality');

    CAMERA_PRESETS.forEach((cam) => {
      assert.ok(cam.id, 'Câmera deve possuir ID');
      assert.ok(cam.position.length === 3, 'Posição da câmera deve ser [x, y, z]');
      assert.ok(cam.target.length === 3, 'Target da câmera deve ser [x, y, z]');
      assert.ok(cam.fov >= 35 && cam.fov <= 75, 'FOV deve estar no intervalo broadcast [35, 75]');
    });
  });

  it('iluminação é configurada para todas as 4 fases do dia (Manhã, Tarde, Noite, Madrugada)', () => {
    const phases = ['Manhã', 'Tarde', 'Noite', 'Madrugada'] as const;

    phases.forEach((phase) => {
      const cfg = LIGHTING_PHASES[phase];
      assert.ok(cfg, `Configuração de luz para ${phase} deve existir`);
      assert.ok(cfg.sunIntensity > 0, 'Intensidade solar deve ser > 0');
      assert.ok(cfg.sunPosition.length === 3, 'Posição do sol deve ter 3 coordenadas');
      if (phase === 'Noite') {
        assert.strictEqual(cfg.partyLightsOn, true, 'Luzes de festa devem estar ativas à noite');
      }
      if (phase === 'Madrugada') {
        assert.strictEqual(cfg.nightVision, true, 'Visão noturna deve estar ativa de madrugada');
      }
    });
  });
});

describe('Fase 5: Provas, Dinâmicas e Mesa de Corte do Diretor', () => {
  it('executa Prova do Líder e determina um único campeão com logs de rodadas', () => {
    const liderChallenge = DEFAULT_CHALLENGES_CATALOG.find((c) => c.type === 'lider')!;
    assert.ok(liderChallenge, 'Prova do Líder deve estar no catálogo');

    const relationMatrix = createInitialRelationMatrix(INITIAL_CAST);
    const result = executeChallenge(liderChallenge, INITIAL_CAST, relationMatrix);

    assert.ok(result.winnerId, 'Prova deve gerar um vencedor');
    assert.ok(result.winnerNickname, 'Vencedor deve ter apelido');
    assert.ok(result.logs.length >= 2, 'Devem existir múltiplos logs de rodadas');
    assert.ok(result.audienceGained > 0, 'Prova deve somar audiência');
  });

  it('executa Prova do Anjo e atribui o Castigo do Monstro aos rivais com menor afinidade', () => {
    const anjoChallenge = DEFAULT_CHALLENGES_CATALOG.find((c) => c.type === 'anjo')!;
    assert.ok(anjoChallenge, 'Prova do Anjo deve existir');

    const relationMatrix = createInitialRelationMatrix(INITIAL_CAST);
    const result = executeChallenge(anjoChallenge, INITIAL_CAST, relationMatrix);

    assert.ok(result.winnerId, 'Prova do Anjo deve ter vencedor');
    assert.ok(result.monstroAssignedIds, 'Anjo deve apontar castigados do monstro');
    assert.strictEqual(result.monstroAssignedIds?.length, 2, 'Monstro deve castigar 2 participantes');
    assert.ok(!result.monstroAssignedIds?.includes(result.winnerId), 'Vencedor não entra no monstro');
  });

  it('intervenção do diretor (mexida nos bastidores) consome autoridade e aplica efeito', () => {
    const challenge = DEFAULT_CHALLENGES_CATALOG[0];
    const tweak = DIRECTOR_TWEAKS[0];
    const relationMatrix = createInitialRelationMatrix(INITIAL_CAST);

    const result = executeChallenge(challenge, INITIAL_CAST, relationMatrix, tweak);
    assert.strictEqual(result.authoritySpent, tweak.authorityCost, 'Deve debitar custo de autoridade');
  });

  it('mesa de switcher executa corte (CUT), transição e gravação de takes narrativos', () => {
    const store = useBroadcastStore.getState();
    const initialPgm = store.pgmCameraId;
    const initialPvw = store.pvwCameraId;

    // Executa corte
    store.cutToProgram();
    const afterCutState = useBroadcastStore.getState();
    assert.strictEqual(afterCutState.pgmCameraId, initialPvw, 'Corte deve colocar PVW no ar');
    assert.strictEqual(afterCutState.pvwCameraId, initialPgm, 'Corte deve mover PGM anterior para PVW');

    // Grava take com tag narrativa
    const take = store.recordNarrativeTake('treta', 'Gritos na sala', 'sala-estar', 5);
    assert.ok(take.id, 'Take gravado deve ter ID');
    assert.strictEqual(take.narrativeTag, 'treta');
    assert.ok(take.timecode.startsWith('01:'), 'Timecode deve estar no formato SMPTE');
    assert.ok(take.ibopeImpact > 0, 'Impacto no IBOPE deve ser positivo');

    const updatedTakes = useBroadcastStore.getState().recordedTakes;
    assert.ok(updatedTakes.length > 0, 'Take deve ser adicionado ao histórico');
  });
});
