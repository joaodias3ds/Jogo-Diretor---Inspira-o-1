/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DayPhase, BALANCE } from '@/config/balance';

export type { DayPhase };

export type DayOfWeek =
  | 'Segunda-feira'
  | 'Terça-feira'
  | 'Quarta-feira'
  | 'Quinta-feira'
  | 'Sexta-feira'
  | 'Sábado'
  | 'Domingo';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
];

export interface ScheduledEvent {
  dayOfWeek: DayOfWeek;
  phase: DayPhase;
  title: string;
  description: string;
  isAutoPause: boolean;
  category: 'dinamica' | 'prova' | 'festa' | 'eliminacao' | 'rotina';
}

export const WEEKLY_SCHEDULE: ScheduledEvent[] = [
  {
    dayOfWeek: 'Segunda-feira',
    phase: 'Noite',
    title: 'Jogo da Discórdia & Sincerão',
    description: 'Dinâmica de apontamento ao vivo na sala para colocar lenha na fogueira.',
    isAutoPause: true,
    category: 'dinamica',
  },
  {
    dayOfWeek: 'Terça-feira',
    phase: 'Noite',
    title: 'Noite de Convivência & Fofoca',
    description: 'Grupos conspirando votos após a turbulência do jogo da discórdia.',
    isAutoPause: false,
    category: 'rotina',
  },
  {
    dayOfWeek: 'Quarta-feira',
    phase: 'Noite',
    title: 'Festa de Esquenta & Ação de Marca',
    description: 'Patrocinador master traz produtos e cooler para a área da piscina.',
    isAutoPause: false,
    category: 'festa',
  },
  {
    dayOfWeek: 'Quinta-feira',
    phase: 'Noite',
    title: 'Prova do Líder / Fazendeiro',
    description: 'Disputa de resistência, mira ou lógica valendo a coroa e imunidade.',
    isAutoPause: true,
    category: 'prova',
  },
  {
    dayOfWeek: 'Sexta-feira',
    phase: 'Tarde',
    title: 'Prova do Anjo / Lampião & Mercado',
    description: 'Sorteio do Anjo, Castigo do Monstro e compras tensas do VIP e Xepa.',
    isAutoPause: true,
    category: 'prova',
  },
  {
    dayOfWeek: 'Sábado',
    phase: 'Madrugada',
    title: 'Grande Festa Temática',
    description: 'Bebidas liberadas, flertes, atritos no pós-festa e vigilância dobrada.',
    isAutoPause: false,
    category: 'festa',
  },
  {
    dayOfWeek: 'Domingo',
    phase: 'Noite',
    title: 'Programa ao Vivo: Formação de Paredão',
    description: 'Indicação do Líder, votação da casa no confessionário, contragolpe e Bate-e-Volta.',
    isAutoPause: true,
    category: 'eliminacao',
  },
];

export interface TimeState {
  day: number;
  week: number;
  phase: DayPhase;
  dayOfWeek: DayOfWeek;
  speed: 0 | 1 | 2 | 4;
  isPaused: boolean;
  totalTicks: number;
}

export function createInitialTimeState(): TimeState {
  return {
    day: 1,
    week: 1,
    phase: 'Manhã',
    dayOfWeek: 'Segunda-feira',
    speed: 1,
    isPaused: false,
    totalTicks: 0,
  };
}

export function advanceTimePhase(currentTime: TimeState): {
  nextTime: TimeState;
  dayAdvanced: boolean;
  weekAdvanced: boolean;
  scheduledEvent?: ScheduledEvent;
} {
  const phases = BALANCE.time.phasesPerDay;
  const currentPhaseIndex = phases.indexOf(currentTime.phase);
  const nextPhaseIndex = (currentPhaseIndex + 1) % phases.length;
  const nextPhase = phases[nextPhaseIndex];

  let nextDay = currentTime.day;
  let nextWeek = currentTime.week;
  let dayAdvanced = false;
  let weekAdvanced = false;

  if (nextPhaseIndex === 0) {
    nextDay += 1;
    dayAdvanced = true;
    if ((nextDay - 1) % BALANCE.time.daysPerWeek === 0) {
      nextWeek += 1;
      weekAdvanced = true;
    }
  }

  const dayOfWeekIndex = (nextDay - 1) % 7;
  const nextDayOfWeek = DAYS_OF_WEEK[dayOfWeekIndex];

  const scheduledEvent = WEEKLY_SCHEDULE.find(
    (ev) => ev.dayOfWeek === nextDayOfWeek && ev.phase === nextPhase
  );

  const shouldAutoPause = scheduledEvent ? scheduledEvent.isAutoPause : false;

  return {
    nextTime: {
      day: nextDay,
      week: nextWeek,
      phase: nextPhase,
      dayOfWeek: nextDayOfWeek,
      speed: shouldAutoPause ? 0 : currentTime.speed,
      isPaused: shouldAutoPause ? true : currentTime.isPaused,
      totalTicks: currentTime.totalTicks + 1,
    },
    dayAdvanced,
    weekAdvanced,
    scheduledEvent,
  };
}
