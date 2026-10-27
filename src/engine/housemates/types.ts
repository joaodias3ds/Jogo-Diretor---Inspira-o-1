/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TemperamentType =
  | 'Estrategista'
  | 'Explosivo'
  | 'Carismático'
  | 'Fofoqueiro'
  | 'Romântico'
  | 'Planta'
  | 'Leal'
  | 'Líder';

export type RealityRoomId =
  | 'cozinha-vip'
  | 'cozinha-xepa'
  | 'quarto-oceano'
  | 'quarto-selva'
  | 'quarto-lider'
  | 'piscina-jardim'
  | 'academia'
  | 'confessionario'
  | 'sala-estar'
  | 'baia-animais';

export interface BigFiveTraits {
  openness: number;         // Abertura a experiências (0-100)
  conscientiousness: number;// Conscienciosidade / Disciplina (0-100)
  extraversion: number;     // Extroversão / Sociabilidade (0-100)
  agreeableness: number;    // Amabilidade / Empatia (0-100)
  neuroticism: number;      // Neuroticismo / Instabilidade emocional (0-100)
}

export interface ParticipantNeeds {
  hunger: number;           // Fome (0-100) -> 100 = Faminto
  sleep: number;            // Sono / Cansaço (0-100) -> 100 = Exausto
  hygiene: number;          // Higiene (0-100) -> 100 = Limpo
  social: number;           // Satisfação social (0-100)
  fun: number;              // Diversão (0-100)
  comfort: number;          // Conforto físico (0-100)
  physicalHealth: number;   // Saúde física (0-100)
  emotionalHealth: number;  // Saúde emocional (0-100)
  homesickness: number;     // Saudade de casa / família (0-100)
}

export interface ParticipantStates {
  mood: number;             // Humor geral (0-100)
  stress: number;           // Estresse atual (0-100)
  energy: number;           // Energia física / Stamina (0-100)
  motivation: number;       // Motivação para o jogo (0-100)
  confidence: number;       // Autoconfiança (0-100)
}

export interface CompetitionSkills {
  strength: number;         // Força física
  endurance: number;        // Resistência em provas longas
  agility: number;          // Agilidade e reflexo
  memory: number;           // Memória
  logic: number;            // Raciocínio lógico e quebra-cabeças
  aim: number;              // Pontaria e precisão
  teamwork: number;         // Cooperação em equipe
  animalCare: number;       // Trato com animais (modo fazenda)
}

export interface MemoryEntry {
  id: string;
  day: number;
  description: string;
  intensity: number;        // 1 a 10
  sentiment: 'positive' | 'negative' | 'neutral';
  involvedParticipantNames?: string[];
}

export interface ParticipantStrategy {
  goal: 'vencer' | 'sobreviver' | 'proteger-aliados' | 'eliminar-rivais' | 'ganhar-seguidores';
  boldness: number;         // Ousadia (0-100)
  riskTolerance: number;    // Tolerância ao risco (0-100)
  targetRivalId?: string;
  trustedAllyIds: string[];
}

export interface StatDeltas {
  popularity: number;
  stamina: number;
  mood: number;
}

export interface Participant {
  id: string;
  name: string;
  nickname: string;
  age: number;
  profession: string;
  hometown: string;
  avatarColor: string;
  temperament: TemperamentType;
  traits: string[];
  
  // Atributos de Carisma e Controvérsia (Impacto Direto na Audiência e Redes)
  charisma?: number;        // Carisma (0-100) -> Fidelização, IBOPE base e aprovação (default: 70)
  controversy?: number;     // Controvérsia (0-100) -> Picos de audiência, tretas e viralização (default: 50)
  archetype?: string;       // Arquétipo narrativo (ex: "Vilão Calculista", "Planta Carismática", "Diva Barraqueira")
  weeklySalary?: number;    // Salário / Cachê semanal de permanência
  fandomName?: string;      // Nome da torcida organizada nas redes (ex: "#TropaDoGil", "#Camilers")

  // Modelos profundos da Fase 2
  bigFive: BigFiveTraits;
  needs: ParticipantNeeds;
  states: ParticipantStates;
  skills: CompetitionSkills;
  strategy: ParticipantStrategy;
  memories: MemoryEntry[];

  // Atributos de compatibilidade com Fase 0 & 1
  stats: {
    popularity: number;     // Aprovação do público (0-100)
    rejection?: number;      // Rejeição popular (0-100)
    stamina: number;        // Energia / Resistência (0-100)
    mood: number;           // Humor (0-100)
    hunger: number;
    sleep: number;
    hygiene: number;
    social: number;
    charisma?: number;
    controversy?: number;
  };
  deltas: StatDeltas;

  // Presença ao vivo e ações
  currentRoom: RealityRoomId;
  currentActivity: string;
  currentDialogue?: string;
  isPerformingAction: boolean;

  // Status de Jogo
  isLeader: boolean;        // Líder / Fazendeiro
  isImmune: boolean;        // Imunizado / Anjo
  isCastigo: boolean;       // No Monstro / Na Baia
  isVIP: boolean;           // VIP / Sede (ou Xepa / Baia)
  isNominated: boolean;     // Emparedado / Na Roça
  isEliminated: boolean;    // Eliminado do programa
  eliminationWeek?: number;
}
