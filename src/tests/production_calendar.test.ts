/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  FULL_SEASON_ROADMAP,
  PRODUCTION_STRATEGY_OPTIONS,
  getSeasonMilestoneSummary,
  calculateEventProductionCost,
  calculateEventExpectedIbope,
} from '../engine/calendar/productionCalendarEngine';
import { createInitialTimeState } from '../engine/time/gameClock';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

console.log('--- Executando testes: Production Calendar & Season Timeline ---');

// 1. Testa presença dos eventos do cronograma de 12 semanas
assert(FULL_SEASON_ROADMAP.length >= 15, 'Deve conter pelo menos 15 marcos épicos');

const categories = new Set(FULL_SEASON_ROADMAP.map((e) => e.category));
assert(categories.has('challenge'), 'Deve ter categoria Provas');
assert(categories.has('eviction'), 'Deve ter categoria Paredão/Eliminação');
assert(categories.has('plot_twist'), 'Deve ter categoria Plot-Twists');
assert(categories.has('party'), 'Deve ter categoria Festas');
assert(categories.has('special_broadcast'), 'Deve ter categoria Transmissões Especiais');

// 2. Testa resumo de marcos e telemetria da temporada
const time = createInitialTimeState();
const summary = getSeasonMilestoneSummary(time, FULL_SEASON_ROADMAP);

assert(summary.totalWeeks === 12, 'Total de semanas deve ser 12');
assert(summary.totalDays === 84, 'Total de dias deve ser 84');
assert(summary.currentDay === 1, 'Dia atual deve ser 1');
assert(summary.daysRemaining === 83, 'Dias restantes devem ser 83');
assert(summary.nextEvictionEvent !== undefined, 'Próximo paredão deve estar agendado');
assert(summary.nextChallengeEvent !== undefined, 'Próxima prova deve estar agendada');
assert(summary.nextPlotTwistEvent !== undefined, 'Próximo plot twist deve estar agendado');

// 3. Testa cálculos de estratégia de produção
const event = FULL_SEASON_ROADMAP[0];
const vtStrategy = PRODUCTION_STRATEGY_OPTIONS.find((s) => s.id === 'vt_hype')!;
const defaultStrategy = PRODUCTION_STRATEGY_OPTIONS.find((s) => s.id === 'default')!;

const defaultCost = calculateEventProductionCost(event, defaultStrategy);
const vtCost = calculateEventProductionCost(event, vtStrategy);
assert(vtCost === defaultCost + vtStrategy.cost, 'Custo de VT deve ser somado corretamente');

const baseIbope = 25.0;
const defaultIbope = calculateEventExpectedIbope(event, baseIbope, defaultStrategy);
const vtIbope = calculateEventExpectedIbope(event, baseIbope, vtStrategy);
assert(vtIbope > defaultIbope, 'IBOPE com estratégia deve ser maior que padrão');

console.log('--- Testes de Cronograma & Timeline concluídos com sucesso! ---');
