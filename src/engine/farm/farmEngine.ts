/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FarmAnimal {
  id: string;
  name: string;
  species: 'cow' | 'chickens' | 'horse' | 'sheep';
  health: number; // 0 to 100
  happiness: number; // 0 to 100
  productionName: string;
  dailyProductionAmount: number; // e.g. 15 liters of milk, 12 eggs
  currentProduction: number;
  assignedParticipantId: string | null;
  assignedParticipantName?: string;
  statusNotes: string;
}

export interface FarmChore {
  id: string;
  title: string;
  targetSpecies: 'cow' | 'chickens' | 'horse' | 'sheep' | 'garden';
  period: 'Manhã' | 'Tarde' | 'Noite';
  assignedParticipantId: string | null;
  assignedParticipantName: string | null;
  completedToday: boolean;
  neglectRisk: number; // 0 to 100
  description: string;
  punishmentIfNeglected: string;
}

export type FarmWeather = 'ensolarado' | 'tempestade_lama' | 'frio_geada' | 'ceu_aberto';

export interface FarmState {
  fazendeiroId: string | null;
  fazendeiroName: string | null;
  baiaParticipantIds: string[]; // Confinados na Baia (dormem com animais, sem água quente)
  animals: FarmAnimal[];
  chores: FarmChore[];
  weather: FarmWeather;
  collectivePunishmentActive: boolean;
  activePunishmentMessage: string | null;
  eggsStock: number;
  milkStockLiters: number;
  vegetablesStockKg: number;
}

export const INITIAL_ANIMALS: FarmAnimal[] = [
  {
    id: 'an-mimosa',
    name: 'Mimosa (Vaca Holandesa)',
    species: 'cow',
    health: 95,
    happiness: 90,
    productionName: 'Litros de Leite Fresco',
    dailyProductionAmount: 20,
    currentProduction: 18,
    assignedParticipantId: null,
    statusNotes: 'Alimentada com feno fresco e sal mineral. Pronta para ordenha.',
  },
  {
    id: 'an-galinhas',
    name: 'Galinheiro das Poedeiras (30 galinhas)',
    species: 'chickens',
    health: 92,
    happiness: 88,
    productionName: 'Ovos Caipiras',
    dailyProductionAmount: 24,
    currentProduction: 22,
    assignedParticipantId: null,
    statusNotes: 'Galinhas ciscando no terreiro. Ração reposta.',
  },
  {
    id: 'an-trovao',
    name: 'Trovão (Cavalo Crioulo)',
    species: 'horse',
    health: 98,
    happiness: 92,
    productionName: 'Passeio & Tração Rural',
    dailyProductionAmount: 1,
    currentProduction: 1,
    assignedParticipantId: null,
    statusNotes: 'Baia com serragem limpa. Exige escovação diária da crina.',
  },
  {
    id: 'an-ovelhas',
    name: 'Rebanho de Ovelhas (8 ovelhas)',
    species: 'sheep',
    health: 89,
    happiness: 85,
    productionName: 'Pastagem & Manejo',
    dailyProductionAmount: 5,
    currentProduction: 4,
    assignedParticipantId: null,
    statusNotes: 'Pastando tranquilamente no cercado inferior.',
  },
];

export const INITIAL_CHORES: FarmChore[] = [
  {
    id: 'chore-milking',
    title: 'Ordenha Matinal da Vaca Mimosa',
    targetSpecies: 'cow',
    period: 'Manhã',
    assignedParticipantId: null,
    assignedParticipantName: null,
    completedToday: true,
    neglectRisk: 5,
    description: 'Acordar às 06:00, higienizar as tetas da vaca e tirar 2 baldes cheios de leite.',
    punishmentIfNeglected: '48 horas sem leite e sem manteiga na despensa',
  },
  {
    id: 'chore-chickens',
    title: 'Trato do Galinheiro & Coleta de Ovos',
    targetSpecies: 'chickens',
    period: 'Manhã',
    assignedParticipantId: null,
    assignedParticipantName: null,
    completedToday: false,
    neglectRisk: 15,
    description: 'Trocar a água dos bebedouros, espalhar milho e recolher ovos dos ninhos.',
    punishmentIfNeglected: 'Sem ovos e sem pão na sede por 2 dias',
  },
  {
    id: 'chore-horse-baia',
    title: 'Limpeza da Baia dos Cavalos & Troca de Palha',
    targetSpecies: 'horse',
    period: 'Tarde',
    assignedParticipantId: null,
    assignedParticipantName: null,
    completedToday: false,
    neglectRisk: 25,
    description: 'Retirar esterco, trocar a serragem e escovar os cavalos.',
    punishmentIfNeglected: 'Corte de água encanada: todos tomam banho de balde',
  },
  {
    id: 'chore-garden',
    title: 'Rega da Horta & Colheita de Hortaliças',
    targetSpecies: 'garden',
    period: 'Tarde',
    assignedParticipantId: null,
    assignedParticipantName: null,
    completedToday: true,
    neglectRisk: 10,
    description: 'Irrigar canteiros de alface, tomate e cheiro-verde.',
    punishmentIfNeglected: 'Fim do café da manhã reforçado',
  },
];

export function createInitialFarmState(): FarmState {
  return {
    fazendeiroId: null,
    fazendeiroName: null,
    baiaParticipantIds: [],
    animals: INITIAL_ANIMALS,
    chores: INITIAL_CHORES,
    weather: 'ensolarado',
    collectivePunishmentActive: false,
    activePunishmentMessage: null,
    eggsStock: 48,
    milkStockLiters: 35,
    vegetablesStockKg: 20,
  };
}

/**
 * Simulates daily farm lifecycle tick:
 * Updates animals happiness, chore completion, weather and collective punishments.
 */
export function simulateFarmDayTick(state: FarmState): {
  updatedState: FarmState;
  events: string[];
} {
  const events: string[] = [];
  const weathers: FarmWeather[] = ['ensolarado', 'tempestade_lama', 'frio_geada', 'ceu_aberto'];
  const nextWeather = weathers[Math.floor(Math.random() * weathers.length)];

  // Animals tick
  let anyAnimalNeglected = false;
  const updatedAnimals = state.animals.map((an) => {
    // If not assigned or chore ignored, health drops
    const isNeglected = !an.assignedParticipantId && Math.random() < 0.35;
    const healthDelta = isNeglected ? -8 : +2;
    const happinessDelta = nextWeather === 'tempestade_lama' ? -5 : +3;

    const newHealth = Math.max(20, Math.min(100, an.health + healthDelta));
    const newHappiness = Math.max(20, Math.min(100, an.happiness + happinessDelta));

    if (newHealth < 50) {
      anyAnimalNeglected = true;
      events.push(`⚠️ ${an.name} está com saúde baixa e precisa de cuidados imediatos!`);
    }

    return {
      ...an,
      health: newHealth,
      happiness: newHappiness,
    };
  });

  // Collective punishment check
  let collectivePunishmentActive = state.collectivePunishmentActive;
  let activePunishmentMessage = state.activePunishmentMessage;

  if (anyAnimalNeglected && !collectivePunishmentActive) {
    collectivePunishmentActive = true;
    activePunishmentMessage = 'SIRENE DA ROÇA: 48 horas sem água encanada devido a negligência com os animais!';
    events.push(`🚨 SIRENE TOCOU NA SEDE: Punição Coletiva aplicada pelo Diretor!`);
  } else if (!anyAnimalNeglected && collectivePunishmentActive && Math.random() > 0.5) {
    collectivePunishmentActive = false;
    activePunishmentMessage = null;
    events.push(`✅ Punição Coletiva encerrada. A água quente voltou à Sede da Fazenda.`);
  }

  return {
    updatedState: {
      ...state,
      animals: updatedAnimals,
      weather: nextWeather,
      collectivePunishmentActive,
      activePunishmentMessage,
      milkStockLiters: state.milkStockLiters + 18,
      eggsStock: state.eggsStock + 20,
    },
    events,
  };
}
