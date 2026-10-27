/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { INITIAL_CAST } from '../engine/housemates/defaultCast';
import { decideParticipantAction, HOUSE_ACTIONS } from '../engine/housemates/utilityAI';
import { generateRandomParticipant, generateCustomCast } from '../engine/housemates/participantGenerator';
import { simulateCastTick } from '../engine/housemates/participantSimulator';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

console.log('--- Executando testes da Fase 2 (Participantes e Utility AI) ---');

// 1. Testes de Decisão por Utility AI
const testParticipant = { ...INITIAL_CAST[0] };

// Caso A: Participante com sono extremo (100) e energia baixa (5) deve priorizar dormir
const sleepyParticipant = {
  ...testParticipant,
  needs: { ...testParticipant.needs, sleep: 100, hunger: 10 },
  states: { ...testParticipant.states, energy: 5 },
};
const decisionSleep = decideParticipantAction(sleepyParticipant, 'Noite');
assert(decisionSleep.action.id === 'dormir', 'Participante com sono extremo deve escolher dormir');
assert(decisionSleep.dialogue.length > 0, 'Deve gerar fala contextual de sono');

// Caso B: Participante faminto deve priorizar comer
const hungryParticipant = {
  ...testParticipant,
  needs: { ...testParticipant.needs, hunger: 100, sleep: 10 },
  states: { ...testParticipant.states, energy: 80 },
};
const decisionEat = decideParticipantAction(hungryParticipant, 'Tarde');
assert(decisionEat.action.id === 'comer', 'Participante com fome extrema deve escolher comer');

// Caso C: Participante explosivo com alto estresse deve discutir
const stressedExplosive = {
  ...INITIAL_CAST[2], // Bruninha Raio (Explosivo)
  states: { ...INITIAL_CAST[2].states, stress: 95 },
  needs: { ...INITIAL_CAST[2].needs, hunger: 20, sleep: 20 },
};
const decisionFight = decideParticipantAction(stressedExplosive, 'Tarde');
assert(
  decisionFight.action.id === 'discutir' || decisionFight.action.id === 'treinar',
  'Participante explosivo com alto estresse deve descarregar em discussão ou treino pesado'
);

// 2. Testes do Gerador Procedural de Participantes
const randomP = generateRandomParticipant();
assert(randomP.name.length > 3, 'Nome gerado deve ser válido');
assert(randomP.nickname.length > 1, 'Apelido gerado deve ser válido');
assert(randomP.age >= 18 && randomP.age <= 75, 'Idade deve estar no intervalo permitido');
assert(randomP.bigFive.openness >= 0 && randomP.bigFive.openness <= 100, 'Big Five Openness válido');
assert(randomP.skills.strength >= 0 && randomP.skills.strength <= 100, 'Skill Força válida');
assert(randomP.traits.length === 3, 'Deve gerar exatamente 3 traços');

const customCast = generateCustomCast(20);
assert(customCast.length === 20, 'Gerador em lote deve gerar 20 participantes');

// 3. Teste de Balanceamento e Estabilidade de Longo Prazo (7 dias = 28 fases completas)
console.log('Simulando 20 participantes vivendo 7 dias consecutivos na casa...');
let livingCast = [...INITIAL_CAST];
const phases = ['Manhã', 'Tarde', 'Noite', 'Madrugada'] as const;

for (let day = 1; day <= 7; day++) {
  for (const phase of phases) {
    livingCast = simulateCastTick(livingCast, phase, false);
    for (const p of livingCast) {
      assert(!isNaN(p.stats.popularity), `Popularidade de ${p.name} não pode ser NaN`);
      assert(!isNaN(p.stats.stamina), `Stamina de ${p.name} não pode ser NaN`);
      assert(!isNaN(p.stats.mood), `Humor de ${p.name} não pode ser NaN`);
      assert(p.stats.popularity >= 0 && p.stats.popularity <= 100, `Popularidade de ${p.name} fora dos limites [0, 100]`);
      assert(p.stats.stamina >= 0 && p.stats.stamina <= 100, `Stamina de ${p.name} fora dos limites [0, 100]`);
      assert(p.stats.mood >= 0 && p.stats.mood <= 100, `Humor de ${p.name} fora dos limites [0, 100]`);
      assert(p.currentActivity.length > 0, `Atividade de ${p.name} deve ser preenchida`);
    }
  }
}

console.log('✅ Todos os testes da Fase 2 (Utility AI e Balanceamento de 7 Dias) passaram com sucesso!');
