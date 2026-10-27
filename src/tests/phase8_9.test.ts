/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  INITIAL_SPONSORS,
  INITIAL_STAFF,
  INITIAL_UPGRADES,
  calculateWeeklyFinance,
} from '../engine/economy/economyEngine.ts';

import {
  CRISIS_CATALOG,
  generateRandomCrisis,
} from '../engine/crises/crisesEngine.ts';

import {
  generateDynamicSocialFeed,
  INITIAL_POSTS,
  INITIAL_HEADLINES,
} from '../engine/social-media/socialMediaEngine.ts';

import {
  AVAILABLE_CHALLENGE_BLOCKS,
  compileChallengeBlueprint,
} from '../engine/challenges/challengeEditor.ts';

import {
  createInitialFarmState,
  simulateFarmDayTick,
} from '../engine/farm/farmEngine.ts';

import {
  createInitialHybridState,
  executeIntercambio,
} from '../engine/hybrid/hybridEngine.ts';

import { INITIAL_CAST } from '../engine/housemates/defaultCast.ts';

describe('Fase 8: Economia, Patrocinadores, Upgrades e Central de Crises', () => {
  it('calcula o balanço financeiro semanal considerando cotas assinadas e folha de equipe', () => {
    const finances = calculateWeeklyFinance(INITIAL_SPONSORS, INITIAL_STAFF, 28.5);

    assert.ok(finances.sponsorRevenue > 0, 'Receita de patrocínio deve ser positiva');
    assert.ok(finances.staffPayroll > 0, 'Folha de pagamento da equipe deve ser positiva');
    assert.strictEqual(typeof finances.netWeekly, 'number');
    assert.ok(finances.activeSponsorsCount >= 2, 'Pelo menos 2 patrocinadores assinados inicialmente');
  });

  it('aplica penalidade na receita de patrocínio quando o IBOPE está abaixo do mínimo exigido', () => {
    const normalFinance = calculateWeeklyFinance(INITIAL_SPONSORS, INITIAL_STAFF, 30.0);
    const lowIbopeFinance = calculateWeeklyFinance(INITIAL_SPONSORS, INITIAL_STAFF, 12.0);

    assert.ok(
      lowIbopeFinance.sponsorRevenue < normalFinance.sponsorRevenue,
      'Receita com Ibope baixo deve ser penalizada contratualmente'
    );
  });

  it('catálogo de crises contém opções com custos, autoridade e textos de desfecho válidos', () => {
    assert.ok(CRISIS_CATALOG.length >= 5, 'Deve conter pelo menos 5 categorias de crises catalogadas');

    for (const crisis of CRISIS_CATALOG) {
      assert.ok(crisis.title.length > 5, 'Título da crise deve ser descritivo');
      assert.ok(crisis.options.length >= 2, 'Cada crise deve ter pelo menos 2 opções de decisão executiva');

      for (const opt of crisis.options) {
        assert.ok(opt.label.length > 3);
        assert.strictEqual(typeof opt.cashCost, 'number');
        assert.strictEqual(typeof opt.authorityCost, 'number');
        assert.strictEqual(typeof opt.ibopeDelta, 'number');
        assert.ok(opt.outcomeText.length > 10, 'Deve ter desfecho detalhado');
      }
    }
  });

  it('gerador aleatório de crises instancia eventos com ID e dia de criação', () => {
    const crisis = generateRandomCrisis(5);
    assert.ok(crisis.id.startsWith('crisis-'));
    assert.strictEqual(crisis.createdAtDay, 5);
    assert.strictEqual(crisis.resolved, false);
  });

  it('redes sociais e manchetes geram feeds com hashtags, volume de menções e relevância', () => {
    const feed = generateDynamicSocialFeed(32.4, 3);
    assert.ok(feed.length >= INITIAL_POSTS.length + 1);

    const firstPost = feed[0];
    assert.ok(firstPost.content.includes('32.4'));
    assert.ok(firstPost.likes > 0);
    assert.ok(INITIAL_HEADLINES.length >= 3);
    assert.ok(INITIAL_HEADLINES.every((h) => h.impactScore > 0));
  });

  it('editor de provas calcula dinamicamente custo, dificuldade e potencial de audiência', () => {
    const obstacle = AVAILABLE_CHALLENGE_BLOCKS.find((b) => b.type === 'obstacle')!;
    const endurance = AVAILABLE_CHALLENGE_BLOCKS.find((b) => b.type === 'endurance')!;

    const blueprint = compileChallengeBlueprint(
      'Super Prova de Resistência Radical',
      'resistencia',
      'athletic',
      [obstacle, endurance]
    );

    assert.strictEqual(blueprint.blocks.length, 2);
    assert.ok(blueprint.totalCost >= obstacle.cost + endurance.cost);
    assert.ok(blueprint.calculatedDifficulty >= 7.0, 'Dificuldade calculada deve ser alta');
    assert.ok(blueprint.calculatedAudienceBoost >= 3.0, 'Potencial de audiência deve ser relevante');
    assert.ok(blueprint.calculatedInjuryRisk > 0);
  });
});

describe('Fase 9: Modo Fazenda (Vida Rural) e Modo Híbrido', () => {
  it('inicializa o estado da fazenda com 4 espécies de animais, tarefas e estoque de insumos', () => {
    const farm = createInitialFarmState();

    assert.strictEqual(farm.animals.length, 4);
    assert.ok(farm.animals.some((a) => a.species === 'cow'));
    assert.ok(farm.animals.some((a) => a.species === 'chickens'));
    assert.ok(farm.animals.some((a) => a.species === 'horse'));
    assert.ok(farm.animals.some((a) => a.species === 'sheep'));

    assert.ok(farm.chores.length >= 4, 'Deve conter tarefas diárias com turnos definidos');
    assert.strictEqual(farm.collectivePunishmentActive, false);
    assert.ok(farm.milkStockLiters > 0);
    assert.ok(farm.eggsStock > 0);
  });

  it('simulação do dia rural atualiza clima, produção e monitora negligência de animais', () => {
    const farm = createInitialFarmState();
    const result = simulateFarmDayTick(farm);

    assert.ok(result.updatedState.weather);
    assert.ok(result.updatedState.milkStockLiters >= farm.milkStockLiters);
    assert.ok(result.updatedState.eggsStock >= farm.eggsStock);
    assert.strictEqual(result.updatedState.animals.length, 4);
  });

  it('modo híbrido divide o elenco entre Mansão e Fazenda e executa intercâmbio com histórico', () => {
    const hybrid = createInitialHybridState(INITIAL_CAST);

    assert.ok(hybrid.mansionParticipantIds.length > 0);
    assert.ok(hybrid.farmParticipantIds.length > 0);
    assert.strictEqual(
      hybrid.mansionParticipantIds.length + hybrid.farmParticipantIds.length,
      INITIAL_CAST.length
    );

    const firstMansionId = hybrid.mansionParticipantIds[0];
    const participant = INITIAL_CAST.find((p) => p.id === firstMansionId)!;

    const updatedHybrid = executeIntercambio(
      hybrid,
      participant,
      'farm_ranch',
      3,
      'Intercâmbio Surpresa da Direção'
    );

    assert.ok(!updatedHybrid.mansionParticipantIds.includes(participant.id));
    assert.ok(updatedHybrid.farmParticipantIds.includes(participant.id));
    assert.strictEqual(updatedHybrid.transfersHistory.length, 1);
    assert.strictEqual(updatedHybrid.transfersHistory[0].participantId, participant.id);
  });
});
