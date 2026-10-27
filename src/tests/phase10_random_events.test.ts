/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { useGameStore } from '../app/useGameStore.ts';
import { generateRandomEvent } from '../engine/events/randomEventEngine.ts';
import { INITIAL_CAREER_PROFILE, completeSeasonAndArchive } from '../engine/career/careerEngine.ts';

describe('Sistema de Eventos Aleatórios & Fase 10 (Carreira e Hall da Fama)', () => {
  it('1. Gera eventos aleatórios dinâmicos para cada categoria', () => {
    const store = useGameStore.getState();
    const cast = store.cast;

    const conflito = generateRandomEvent(cast, 'conflito');
    assert.equal(conflito.category, 'conflito', 'Deve ser categoria conflito');
    assert(conflito.title.length > 0, 'Deve ter título');
    assert(conflito.headline.length > 0, 'Deve ter manchete');
    assert(conflito.options.length >= 2, 'Deve ter ao menos 2 opções de decisão da direção');
    assert(conflito.ibopeImpact > 0, 'Impacto de IBOPE deve ser positivo');

    const romance = generateRandomEvent(cast, 'romance');
    assert.equal(romance.category, 'romance', 'Deve ser categoria romance');
    assert(romance.options.length >= 2, 'Romance deve ter opções');

    const surpresa = generateRandomEvent(cast, 'desafio_surpresa');
    assert.equal(surpresa.category, 'desafio_surpresa', 'Deve ser categoria desafio surpresa');
    assert(surpresa.options.length >= 2, 'Desafio deve ter opções');
  });

  it('2. Dispara e resolve evento aleatório no useGameStore', () => {
    const store = useGameStore.getState();
    const initialIbope = store.ibope;

    // Dispara evento
    const ev = store.triggerRandomEventAction('conflito');
    assert(ev !== null, 'Evento deve ser retornado');
    assert(useGameStore.getState().activeRandomEvent !== null, 'activeRandomEvent deve estar preenchido');

    // Executa opção 0
    const chosenOption = ev.options[0];
    store.resolveRandomEventAction(chosenOption.id);

    const updated = useGameStore.getState();
    assert.equal(updated.activeRandomEvent, null, 'activeRandomEvent deve ser limpo após resolução');
    assert(updated.ibope !== initialIbope, 'IBOPE deve ter sofrido alteração pela decisão');
  });

  it('3. Valida ativação e desativação do Modo Diretor-Deus', () => {
    const store = useGameStore.getState();
    assert.equal(store.godMode, false, 'Modo Deus deve começar desativado');

    store.toggleGodMode();
    assert.equal(useGameStore.getState().godMode, true, 'Modo Deus ativado');
    assert(useGameStore.getState().cash >= 999999999, 'Orçamento deve ser infinito');
    assert.equal(useGameStore.getState().authority, 100, 'Autoridade deve ser 100%');

    store.toggleGodMode();
    assert.equal(useGameStore.getState().godMode, false, 'Modo Deus desativado');
  });

  it('4. Arquiva temporada e registra entrada no Hall da Fama', () => {
    const store = useGameStore.getState();
    const winner = store.cast[0];
    const runnerUp = store.cast[1];

    const updatedProfile = completeSeasonAndArchive(
      INITIAL_CAREER_PROFILE,
      winner,
      runnerUp,
      3,
      34.5,
      49.8,
      1200000
    );

    assert(updatedProfile.totalSeasonsCompleted === INITIAL_CAREER_PROFILE.totalSeasonsCompleted + 1, 'Total de temporadas incrementado');
    assert(updatedProfile.hallOfFame.length === INITIAL_CAREER_PROFILE.hallOfFame.length + 1, 'Entrada adicionada ao Hall da Fama');
    assert.equal(updatedProfile.hallOfFame[0].nickname, winner.nickname, 'Campeão registrado no topo do Hall');
    assert(updatedProfile.seasonsHistory.length === INITIAL_CAREER_PROFILE.seasonsHistory.length + 1, 'Histórico registrado');
  });
});
