/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createInitialTimeState, advanceTimePhase } from '../engine/time/gameClock';
import { INITIAL_CAST } from '../engine/housemates/defaultCast';
import { simulateParticipantTick, simulateCastTick } from '../engine/housemates/participantSimulator';
import { createDefaultSeasonConfig } from '../engine/season/seasonConfig';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

console.log('--- Executando testes da Fase 1 (Motor Base, Tempo e Participantes) ---');

// 1. Testes do Relógio e Calendário
const time0 = createInitialTimeState();
assert(time0.day === 1, 'Dia inicial deve ser 1');
assert(time0.week === 1, 'Semana inicial deve ser 1');
assert(time0.phase === 'Manhã', 'Fase inicial deve ser Manhã');
assert(time0.dayOfWeek === 'Segunda-feira', 'Dia da semana inicial deve ser Segunda');

// Avança Manhã -> Tarde
const tick1 = advanceTimePhase(time0);
assert(tick1.nextTime.phase === 'Tarde', 'Próxima fase deve ser Tarde');
assert(tick1.nextTime.day === 1, 'Ainda deve ser dia 1');

// Avança Tarde -> Noite (Segunda à Noite tem Jogo da Discórdia com Auto-Pausa)
const tick2 = advanceTimePhase(tick1.nextTime);
assert(tick2.nextTime.phase === 'Noite', 'Próxima fase deve ser Noite');
assert(tick2.scheduledEvent !== undefined, 'Deve ter evento agendado na Segunda à Noite');
assert(Boolean(tick2.scheduledEvent?.title.includes('Discórdia')), 'Evento deve ser Jogo da Discórdia');
assert(tick2.nextTime.isPaused === true, 'Auto-pausa deve ser ativada no evento chave');

// Avança Noite -> Madrugada
const tick3 = advanceTimePhase(tick2.nextTime);
assert(tick3.nextTime.phase === 'Madrugada', 'Fase deve ser Madrugada');

// Avança Madrugada -> Manhã (Muda o dia de 1 para 2)
const tick4 = advanceTimePhase(tick3.nextTime);
assert(tick4.nextTime.phase === 'Manhã', 'Fase volta para Manhã');
assert(tick4.nextTime.day === 2, 'Dia deve avançar para 2');
assert(tick4.nextTime.dayOfWeek === 'Terça-feira', 'Dia da semana deve ser Terça-feira');

// 2. Testes da Simulação de Participantes e Atributos (Popularidade, Stamina, Mood)
assert(INITIAL_CAST.length === 20, 'Elenco padrão deve ter 20 participantes');

const p = INITIAL_CAST[0]; // Gil do Pagode
const simulatedDay = simulateParticipantTick(p, 'Tarde', false);
assert(simulatedDay.stats.popularity > 0, 'Popularidade deve ser maior que zero');
assert(simulatedDay.stats.stamina > 0, 'Stamina deve ser maior que zero');
assert(simulatedDay.stats.mood > 0, 'Humor deve ser maior que zero');
assert(typeof simulatedDay.deltas.popularity === 'number', 'Delta de popularidade calculado');
assert(typeof simulatedDay.deltas.stamina === 'number', 'Delta de stamina calculado');
assert(typeof simulatedDay.deltas.mood === 'number', 'Delta de humor calculado');

// Teste de recuperação de stamina na Madrugada
const exhaustedP = {
  ...p,
  stats: { ...p.stats, stamina: 30, sleep: 80 },
};
const restedP = simulateParticipantTick(exhaustedP, 'Madrugada', false);
assert(restedP.stats.stamina > exhaustedP.stats.stamina, 'Stamina deve recuperar durante a Madrugada');

// Simulação em lote de todo o elenco
const simulatedCast = simulateCastTick(INITIAL_CAST, 'Manhã', true);
assert(simulatedCast.length === 20, 'Todos os 20 participantes devem ser simulados');

// 3. Testes do SeasonConfig
const houseConfig = createDefaultSeasonConfig('house');
assert(houseConfig.mode === 'house', 'Configuração modo Casa');
assert(houseConfig.initialCash === 250000, 'Orçamento inicial padrão');

const farmConfig = createDefaultSeasonConfig('farm');
assert(farmConfig.mode === 'farm', 'Configuração modo Fazenda');
assert(farmConfig.programName.includes('Fazenda'), 'Nome contextual da fazenda');

console.log('✅ Todos os testes da Fase 1 passaram com sucesso!');
