/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ChallengeBlockType =
  | 'obstacle'
  | 'quiz'
  | 'balance'
  | 'endurance'
  | 'slime'
  | 'memory'
  | 'farm_milking';

export interface ChallengeBlock {
  id: string;
  type: ChallengeBlockType;
  title: string;
  description: string;
  cost: number;
  physicalIntensity: number; // 1-10
  mentalIntensity: number; // 1-10
  injuryRisk: number; // 0-100%
  audiencePotential: number; // 1-10
  icon: string;
}

export interface CustomChallengeBlueprint {
  id: string;
  title: string;
  type: 'lider' | 'anjo' | 'imunidade' | 'resistencia' | 'bate_volta' | 'fazendeiro';
  targetAudienceTone: 'family' | 'chaos' | 'athletic' | 'intellectual';
  blocks: ChallengeBlock[];
  totalCost: number;
  totalDurationMinutes: number;
  calculatedDifficulty: number;
  calculatedAudienceBoost: number;
  calculatedInjuryRisk: number;
}

export const AVAILABLE_CHALLENGE_BLOCKS: ChallengeBlock[] = [
  {
    id: 'blk-obstacle',
    type: 'obstacle',
    title: 'Circuito de Obstáculos com Rede e Lama',
    description: 'Pistas inclinadas, rastejamento sob redes e poço de lama cenográfica.',
    cost: 35000,
    physicalIntensity: 8,
    mentalIntensity: 2,
    injuryRisk: 12,
    audiencePotential: 7.5,
    icon: 'Activity',
  },
  {
    id: 'blk-quiz',
    type: 'quiz',
    title: 'Bancada de Quiz Eletrônico com Botão Rápido',
    description: 'Perguntas de conhecimentos gerais, raciocínio rápido e pegadinhas.',
    cost: 15000,
    physicalIntensity: 1,
    mentalIntensity: 9,
    injuryRisk: 1,
    audiencePotential: 6.0,
    icon: 'HelpCircle',
  },
  {
    id: 'blk-balance',
    type: 'balance',
    title: 'Prancha de Equilíbrio com Pêndulos Giratórios',
    description: 'Plataforma estreita suspensa com obstáculos cenográficos em movimento.',
    cost: 28000,
    physicalIntensity: 6,
    mentalIntensity: 7,
    injuryRisk: 8,
    audiencePotential: 8.0,
    icon: 'Maximize2',
  },
  {
    id: 'blk-endurance',
    type: 'endurance',
    title: 'Gaiola Giratória de Resistência Extrema',
    description: 'Participantes ficam em pé girando sob chuva artificial e vento gelado.',
    cost: 50000,
    physicalIntensity: 10,
    mentalIntensity: 9,
    injuryRisk: 18,
    audiencePotential: 9.5,
    icon: 'Flame',
  },
  {
    id: 'blk-slime',
    type: 'slime',
    title: 'Tanque Gigante de Gosma Colorida',
    description: 'Quem erra a resposta cai no tanque de meleca verde neon fluorescente.',
    cost: 22000,
    physicalIntensity: 3,
    mentalIntensity: 4,
    injuryRisk: 3,
    audiencePotential: 8.5,
    icon: 'Sparkles',
  },
  {
    id: 'blk-memory',
    type: 'memory',
    title: 'Painel Gigante de Memória Luminosa',
    description: 'Memorizar sequências rápidas de luzes e sons no estilo Genius.',
    cost: 20000,
    physicalIntensity: 2,
    mentalIntensity: 8,
    injuryRisk: 1,
    audiencePotential: 6.5,
    icon: 'Layers',
  },
  {
    id: 'blk-farm-milking',
    type: 'farm_milking',
    title: 'Duelo Rural de Ordenha Mecânica e Feno',
    description: 'Prova temática da fazenda enchendo baldes de leite cenográfico e fardos de feno.',
    cost: 30000,
    physicalIntensity: 7,
    mentalIntensity: 5,
    injuryRisk: 5,
    audiencePotential: 7.8,
    icon: 'Tv',
  },
];

/**
 * Calculates aggregated statistics for a custom challenge blueprint.
 */
export function compileChallengeBlueprint(
  title: string,
  type: CustomChallengeBlueprint['type'],
  targetTone: CustomChallengeBlueprint['targetAudienceTone'],
  selectedBlocks: ChallengeBlock[]
): CustomChallengeBlueprint {
  const totalCost = selectedBlocks.reduce((acc, b) => acc + b.cost, 10000); // base production cost 10k
  const avgPhysical =
    selectedBlocks.length > 0
      ? selectedBlocks.reduce((acc, b) => acc + b.physicalIntensity, 0) / selectedBlocks.length
      : 1;
  const avgMental =
    selectedBlocks.length > 0
      ? selectedBlocks.reduce((acc, b) => acc + b.mentalIntensity, 0) / selectedBlocks.length
      : 1;
  const avgAudience =
    selectedBlocks.length > 0
      ? selectedBlocks.reduce((acc, b) => acc + b.audiencePotential, 0) / selectedBlocks.length
      : 5;
  const maxInjury =
    selectedBlocks.length > 0
      ? Math.max(...selectedBlocks.map((b) => b.injuryRisk))
      : 0;

  const calculatedDifficulty = parseFloat(((avgPhysical + avgMental) / 2).toFixed(1));
  const calculatedAudienceBoost = parseFloat((avgAudience * 0.45).toFixed(1));

  return {
    id: `custom-chal-${Date.now()}`,
    title: title.trim() || 'Super Prova do Diretor',
    type,
    targetAudienceTone: targetTone,
    blocks: selectedBlocks,
    totalCost,
    totalDurationMinutes: 15 + selectedBlocks.length * 10,
    calculatedDifficulty,
    calculatedAudienceBoost,
    calculatedInjuryRisk: maxInjury,
  };
}
