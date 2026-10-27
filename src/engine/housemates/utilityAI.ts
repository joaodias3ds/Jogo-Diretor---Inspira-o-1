/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Participant, RealityRoomId } from './types';
import { DayPhase } from '@/config/balance';

export interface ActionDefinition {
  id: string;
  name: string;
  room: RealityRoomId;
  baseDialogue: string[];
  calculateUtility: (p: Participant, phase: DayPhase) => number;
  applyEffects: (p: Participant) => Partial<Participant>;
}

export const HOUSE_ACTIONS: ActionDefinition[] = [
  // 1. DORMIR
  {
    id: 'dormir',
    name: 'Dormindo profundamente',
    room: 'quarto-oceano',
    baseDialogue: [
      'Zzz... nem o toque de acordar vai me tirar dessa cama.',
      'Sonhando que ganhei o carro na prova de resistência...',
      'Apaguei. Essa semana está sugando minha alma.',
    ],
    calculateUtility: (p, phase) => {
      let score = (p.needs.sleep / 100) * 50 + (100 - p.states.energy) * 0.4;
      if (phase === 'Madrugada') score += 40;
      if (phase === 'Tarde' && p.temperament === 'Planta') score += 20;
      if (p.isCastigo) score -= 15; // Castigo impede sono tranquilo
      return score;
    },
    applyEffects: (p) => {
      const newSleep = Math.max(0, p.needs.sleep - 35);
      const newEnergy = Math.min(100, p.states.energy + 30);
      const newStress = Math.max(5, p.states.stress - 15);
      return {
        currentActivity: 'Dormindo debaixo do edredom',
        needs: { ...p.needs, sleep: newSleep, comfort: Math.min(100, p.needs.comfort + 10) },
        states: { ...p.states, energy: newEnergy, stress: newStress },
        stats: { ...p.stats, stamina: newEnergy, sleep: newSleep },
      };
    },
  },

  // 2. COMER
  {
    id: 'comer',
    name: 'Preparando e comendo refeição',
    room: 'cozinha-vip',
    baseDialogue: [
      'Gente, quem foi que pegou meu iogurte com nome?!',
      'Cozinhar com amor é o que me mantém são aqui dentro.',
      'Essa rabada da Xepa vai demorar três horas pra amaciar...',
      'Tem que racionar a goiabada senão acaba antes da quarta.',
    ],
    calculateUtility: (p) => {
      let score = (p.needs.hunger / 100) * 65;
      if (p.isVIP) score += 10;
      if (p.traits.includes('Bom de Prato') || p.traits.includes('Sem Paciência')) score += 15;
      return score;
    },
    applyEffects: (p) => {
      const newHunger = Math.max(0, p.needs.hunger - 50);
      const newMood = Math.min(100, p.states.mood + (p.isVIP ? 12 : 5));
      return {
        currentActivity: p.isVIP ? 'Almoçando fartamente na Cozinha VIP' : 'Cozinhando feijão na Xepa',
        currentRoom: p.isVIP ? 'cozinha-vip' : 'cozinha-xepa',
        needs: { ...p.needs, hunger: newHunger },
        states: { ...p.states, mood: newMood },
        stats: { ...p.stats, hunger: newHunger, mood: newMood },
      };
    },
  },

  // 3. TOMAR BANHO / HIGIENE
  {
    id: 'banho',
    name: 'Tomando banho e se arrumando',
    room: 'quarto-selva',
    baseDialogue: [
      'Tomar banho de água fria na Xepa é teste de sobrevivência!',
      'Passando meu melhor perfume, hoje tem festa!',
      'Secando o cabelo no espelho gigante da sala.',
    ],
    calculateUtility: (p) => {
      return (100 - p.needs.hygiene) * 0.8 + (p.bigFive.conscientiousness / 100) * 15;
    },
    applyEffects: (p) => {
      const newHygiene = 100;
      const newComfort = Math.min(100, p.needs.comfort + 15);
      return {
        currentActivity: 'Tomando banho com água morna e se perfumando',
        needs: { ...p.needs, hygiene: newHygiene, comfort: newComfort },
        stats: { ...p.stats, hygiene: newHygiene },
      };
    },
  },

  // 4. TREINAR NA ACADEMIA
  {
    id: 'treinar',
    name: 'Puxando ferro na academia',
    room: 'academia',
    baseDialogue: [
      'Treino pago! Quem quer ficar na final não pode fraquejar!',
      'Descarregando o estresse dessa casa na esteira.',
      'Bora, mais cinco repetições! Foco no líder!',
    ],
    calculateUtility: (p, phase) => {
      if (phase === 'Madrugada') return 5;
      return (
        (p.skills.strength / 100) * 30 +
        (p.states.stress / 100) * 25 +
        (p.states.energy > 40 ? 20 : -30)
      );
    },
    applyEffects: (p) => {
      const newEnergy = Math.max(10, p.states.energy - 18);
      const newStress = Math.max(5, p.states.stress - 20);
      const newPopularity = Math.min(100, p.stats.popularity + 1);
      return {
        currentActivity: 'Treinando pesado na esteira e halteres da academia',
        currentRoom: 'academia',
        states: { ...p.states, energy: newEnergy, stress: newStress },
        stats: { ...p.stats, stamina: newEnergy, popularity: newPopularity },
      };
    },
  },

  // 5. CONVERSAR / SOCIALIZAR
  {
    id: 'conversar',
    name: 'Batendo papo e resenhando',
    room: 'piscina-jardim',
    baseDialogue: [
      'Gente, lá fora eu tenho uma vida tão simples, nem acredito que tô aqui.',
      'Se eu voltar desse paredão, vou pular pelado na piscina!',
      'A gente precisa se blindar, o outro quarto tá com a faca nos dentes.',
      'Você é a pessoa mais verdadeira que encontrei nessa casa.',
    ],
    calculateUtility: (p) => {
      return (
        (100 - p.needs.social) * 0.5 +
        (p.bigFive.extraversion / 100) * 35 +
        (p.states.mood > 40 ? 15 : -10)
      );
    },
    applyEffects: (p) => {
      const newSocial = Math.min(100, p.needs.social + 25);
      const newFun = Math.min(100, p.needs.fun + 15);
      return {
        currentActivity: 'Conversando e dando risadas na beira da piscina',
        currentRoom: 'piscina-jardim',
        needs: { ...p.needs, social: newSocial, fun: newFun },
        stats: { ...p.stats, social: newSocial },
      };
    },
  },

  // 6. FOFOCAR E CONSPIRAR VOTOS
  {
    id: 'fofocar',
    name: 'Conspirando votos às escondidas',
    room: 'quarto-lider',
    baseDialogue: [
      'Olha, não queria falar, mas o fulano tá jogando dos dois lados.',
      'Se a gente fechar quatro votos no domingo, ele vai direto pra roça.',
      'Ele se faz de coitadinho na sala, mas na despensa fala mal de geral.',
      'Abaixa o tom! Tem câmera apontada bem pro nosso edredom.',
    ],
    calculateUtility: (p) => {
      let score = (p.strategy.boldness / 100) * 30 + (p.bigFive.neuroticism / 100) * 20;
      if (p.temperament === 'Fofoqueiro' || p.temperament === 'Estrategista') score += 30;
      if (p.isLeader) score += 20;
      return score;
    },
    applyEffects: (p) => {
      const newStress = Math.min(100, p.states.stress + 5);
      const popDelta = Math.random() > 0.4 ? 2 : -1;
      return {
        currentActivity: 'Cochichando estratégias e alvos de paredão no Quarto do Líder',
        currentRoom: 'quarto-lider',
        states: { ...p.states, stress: newStress },
        stats: { ...p.stats, popularity: Math.max(5, Math.min(100, p.stats.popularity + popDelta)) },
      };
    },
  },

  // 7. DISCUTIR / CONFRONTAR
  {
    id: 'discutir',
    name: 'Discutindo e cobrando coerência',
    room: 'cozinha-vip',
    baseDialogue: [
      'Você é falso, dissimulado e não sustenta o que fala na minha cara!',
      'Grita mais alto! Quero que o Brasil inteiro ouça sua podridão!',
      'Não coloca meu nome na sua boca podre!',
      'Quer palco? Vai no circo, não vem querer crescer pra cima de mim!',
    ],
    calculateUtility: (p) => {
      let score = (p.states.stress / 100) * 40 + (100 - p.bigFive.agreeableness) * 0.4;
      if (p.temperament === 'Explosivo') score += 35;
      if (p.isNominated) score += 15;
      if (p.isCastigo) score += 20;
      return score;
    },
    applyEffects: (p) => {
      const newStress = Math.min(100, p.states.stress + 25);
      const newMood = Math.max(5, p.states.mood - 20);
      const popChange = Math.random() > 0.45 ? 4 : -5;
      return {
        currentActivity: 'Bate-boca tenso no centro da sala aos gritos',
        currentRoom: 'sala-estar',
        states: { ...p.states, stress: newStress, mood: newMood },
        stats: { ...p.stats, mood: newMood, popularity: Math.max(5, Math.min(100, p.stats.popularity + popChange)) },
      };
    },
  },

  // 8. DESABAFAR NO CONFESSIONÁRIO
  {
    id: 'confessionario',
    name: 'Desabafando no Confessionário',
    room: 'confessionario',
    baseDialogue: [
      'Diretor, sinceramente? Tá difícil conviver com essa falsidade toda.',
      'Tô com uma saudade sufocante dos meus filhos e da minha mãe...',
      'Eu vim pra jogar, mas não esperava ser tão apunhalado pelas costas.',
      'Prometo pra quem tá me assistindo que não vou arredar o pé daqui!',
    ],
    calculateUtility: (p) => {
      return (p.needs.homesickness / 100) * 45 + (p.states.stress / 100) * 35;
    },
    applyEffects: (p) => {
      const newHomesick = Math.max(10, p.needs.homesickness - 30);
      const newStress = Math.max(10, p.states.stress - 25);
      const newPopularity = Math.min(100, p.stats.popularity + 2);
      return {
        currentActivity: 'No Confessionário chorando e desabafando com a câmera',
        currentRoom: 'confessionario',
        needs: { ...p.needs, homesickness: newHomesick },
        states: { ...p.states, stress: newStress },
        stats: { ...p.stats, popularity: newPopularity },
      };
    },
  },
];

export function decideParticipantAction(
  participant: Participant,
  phase: DayPhase
): {
  action: ActionDefinition;
  dialogue: string;
  updatedParticipant: Participant;
} {
  if (participant.isEliminated) {
    return {
      action: HOUSE_ACTIONS[0],
      dialogue: 'Eliminado(a) do jogo.',
      updatedParticipant: participant,
    };
  }

  // Calcula utility para todas as ações
  let bestAction = HOUSE_ACTIONS[0];
  let highestScore = -Infinity;

  for (const act of HOUSE_ACTIONS) {
    const score = act.calculateUtility(participant, phase);
    // Adiciona uma leve variação humana de 5% de ruído
    const randomizedScore = score * (0.95 + Math.random() * 0.1);
    if (randomizedScore > highestScore) {
      highestScore = randomizedScore;
      bestAction = act;
    }
  }

  // Aplica os efeitos da ação escolhida
  const partialUpdates = bestAction.applyEffects(participant);
  const dialogueList = bestAction.baseDialogue;
  const chosenDialogue = dialogueList[Math.floor(Math.random() * dialogueList.length)];

  const updatedParticipant: Participant = {
    ...participant,
    ...partialUpdates,
    currentRoom: bestAction.room,
    currentDialogue: chosenDialogue,
    isPerformingAction: true,
  };

  return {
    action: bestAction,
    dialogue: chosenDialogue,
    updatedParticipant,
  };
}
