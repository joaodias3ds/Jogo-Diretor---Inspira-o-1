/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { REALITY_MODES } from '../config/theme';
import { useAppStore } from '../app/useAppStore';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

console.log('--- Executando testes da Fase 0 (Fundação) ---');

// 1. Testa configurações dos formatos de reality
assert(REALITY_MODES.house.name === 'Casa Confinada', 'Nome do modo Casa');
assert(REALITY_MODES.farm.name === 'Fazenda Rural', 'Nome do modo Fazenda');
assert(REALITY_MODES.hybrid.name === 'Formato Híbrido', 'Nome do modo Híbrido');
assert(REALITY_MODES.farm.eliminationTitle === 'Roça', 'Termo de eliminação da fazenda');
assert(REALITY_MODES.house.eliminationTitle === 'Paredão', 'Termo de eliminação da casa');

// 2. Testa App Store inicial e métricas de Audiência e Orçamento
const state = useAppStore.getState();
assert(state.directorStats.authority === 100, 'Autoridade inicial deve ser 100');
assert(state.directorStats.reputation === 85, 'Reputação inicial deve ser 85');
assert(state.directorStats.ibope > 0, 'Audiência inicial deve ser positiva');
assert(state.directorStats.cash > 0, 'Orçamento inicial deve ser positivo');

// 3. Testa Ação Rápida: Iniciar Gravação
assert(!state.isRecording, 'Inicialmente não está gravando');
state.toggleRecording();
assert(useAppStore.getState().isRecording === true, 'Gravação foi iniciada');
state.toggleRecording();
assert(useAppStore.getState().isRecording === false, 'Gravação foi interrompida');

// 4. Testa Ação Rápida: Contratar Participante
const initialParticipants = useAppStore.getState().participantsCount;
const initialCash = useAppStore.getState().directorStats.cash;
const candidateMock = {
  id: 'test-cand',
  name: 'Participante Teste',
  nickname: 'Testinho',
  age: 25,
  profession: 'Ator',
  hometown: 'Rio de Janeiro',
  traits: ['Dramático'],
  cost: 10000,
  charisma: 80,
  temperament: 'Explosivo' as const,
  avatarColor: 'from-blue-500 to-indigo-600',
};

const hired = state.hireCandidate(candidateMock);
assert(hired === true, 'Contratação deve ter sucesso');
assert(useAppStore.getState().participantsCount === initialParticipants + 1, 'Contador de participantes incrementou');
assert(useAppStore.getState().directorStats.cash === initialCash - 10000, 'Orçamento foi descontado pelo custo do cachê');

console.log('✅ Todos os testes passaram com sucesso!');
