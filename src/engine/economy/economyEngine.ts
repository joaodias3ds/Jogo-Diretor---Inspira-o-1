/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SponsorTier = 'master' | 'ouro' | 'prata' | 'apoio';

export interface SponsorContract {
  id: string;
  brandName: string;
  category: 'beverages' | 'tech' | 'cosmetics' | 'retail' | 'auto' | 'food';
  tier: SponsorTier;
  weeklyRevenue: number;
  minimumIbope: number;
  satisfaction: number; // 0 to 100
  brandActionsDone: number;
  targetBrandActions: number;
  signed: boolean;
  bonusEffect: string;
}

export type StaffRole =
  | 'produtor'
  | 'roteirista'
  | 'editor'
  | 'psicologo'
  | 'medico'
  | 'veterinario'
  | 'seguranca'
  | 'juridico'
  | 'assessor';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  roleTitle: string;
  salaryPerWeek: number;
  hired: boolean;
  level: number;
  bonusDescription: string;
  specialty: string;
}

export type UpgradeCategory = 'studio' | 'editing' | 'cameras' | 'director_powers';

export interface ProductionUpgrade {
  id: string;
  title: string;
  category: UpgradeCategory;
  description: string;
  level: number;
  maxLevel: number;
  baseCost: number;
  multiplier: number;
  currentBenefit: string;
}

export interface DirectorAchievement {
  id: string;
  title: string;
  description: string;
  reputationReward: number;
  cashReward: number;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  icon: string;
}

export interface DirectorDiaryEntry {
  id: string;
  day: number;
  week: number;
  title: string;
  summary: string;
  tone: 'triumphant' | 'dramatic' | 'chaotic' | 'profitable';
  timestamp: number;
}

export const INITIAL_SPONSORS: SponsorContract[] = [
  {
    id: 'sp-estrela',
    brandName: 'Cervejaria Estrela Pura',
    category: 'beverages',
    tier: 'master',
    weeklyRevenue: 450000,
    minimumIbope: 26.0,
    satisfaction: 92,
    brandActionsDone: 2,
    targetBrandActions: 4,
    signed: true,
    bonusEffect: '+25% de audiência nas Festas de Sábado',
  },
  {
    id: 'sp-superapp',
    brandName: 'SuperApp PagTudo',
    category: 'tech',
    tier: 'master',
    weeklyRevenue: 420000,
    minimumIbope: 25.0,
    satisfaction: 95,
    brandActionsDone: 1,
    targetBrandActions: 3,
    signed: true,
    bonusEffect: 'Votação do público gera +R$ 50k extras por milhão de votos',
  },
  {
    id: 'sp-aurora',
    brandName: 'Cosméticos Aurora Glow',
    category: 'cosmetics',
    tier: 'ouro',
    weeklyRevenue: 280000,
    minimumIbope: 22.0,
    satisfaction: 88,
    brandActionsDone: 1,
    targetBrandActions: 2,
    signed: true,
    bonusEffect: 'Dia de Beleza aumenta o carisma dos moradores em +10%',
  },
  {
    id: 'sp-agroforte',
    brandName: 'Rações AgroForte',
    category: 'retail',
    tier: 'prata',
    weeklyRevenue: 190000,
    minimumIbope: 18.0,
    satisfaction: 90,
    brandActionsDone: 0,
    targetBrandActions: 2,
    signed: false,
    bonusEffect: 'Saúde e produtividade dos animais da fazenda +20%',
  },
  {
    id: 'sp-veloz',
    brandName: 'Turbo Motors Brasil',
    category: 'auto',
    tier: 'prata',
    weeklyRevenue: 210000,
    minimumIbope: 24.0,
    satisfaction: 85,
    brandActionsDone: 0,
    targetBrandActions: 1,
    signed: false,
    bonusEffect: 'Prova do Líder com carro 0km rende +4.0 pontos de Ibope',
  },
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'st-carlos',
    name: 'Carlos Albuquerque',
    role: 'produtor',
    roleTitle: 'Produtor Executivo',
    salaryPerWeek: 35000,
    hired: true,
    level: 2,
    bonusDescription: 'Reduz custos de montagem de provas em 15%',
    specialty: 'Logística de estúdio & cenografia rápida',
  },
  {
    id: 'st-bianca',
    name: 'Dra. Bianca Vasconcelos',
    role: 'psicologo',
    roleTitle: 'Psicóloga da Casa',
    salaryPerWeek: 28000,
    hired: true,
    level: 1,
    bonusDescription: 'Reduz risco de surto emocional e desistência em 35%',
    specialty: 'Atendimento sigiloso no confessionário',
  },
  {
    id: 'st-julio',
    name: 'Júlio Prado',
    role: 'editor',
    roleTitle: 'Editor-Chefe de Conteúdo',
    salaryPerWeek: 42000,
    hired: true,
    level: 2,
    bonusDescription: 'Aumenta impacto dramático do pacote diário em +20%',
    specialty: 'Narrativas de herói vs vilão e teasers de treta',
  },
  {
    id: 'st-rodrigo',
    name: 'Dr. Rodrigo Mansur',
    role: 'juridico',
    roleTitle: 'Diretor Jurídico',
    salaryPerWeek: 38000,
    hired: false,
    level: 1,
    bonusDescription: 'Protege contra 75% dos processos e multas de emissora',
    specialty: 'Notificações judiciais e blindagem contratual',
  },
  {
    id: 'st-aline',
    name: 'Aline Guimarães',
    role: 'assessor',
    roleTitle: 'Assessora de Imprensa & Redes',
    salaryPerWeek: 25000,
    hired: false,
    level: 1,
    bonusDescription: 'Acelera contenção de cancelamento e gera matérias positivas',
    specialty: 'Gestão de portais de fofoca e trending topics',
  },
  {
    id: 'st-marcelo',
    name: 'Dr. Marcelo Antunes',
    role: 'veterinario',
    roleTitle: 'Veterinário Rural Chefe',
    salaryPerWeek: 26000,
    hired: false,
    level: 1,
    bonusDescription: 'Garante saúde dos animais e evita punição de baia na Fazenda',
    specialty: 'Bovinos, equinos e manejo sanitário',
  },
];

export const INITIAL_UPGRADES: ProductionUpgrade[] = [
  {
    id: 'up-4k-cameras',
    title: 'Câmeras 4K HDR Robóticas',
    category: 'cameras',
    description: 'Instalação de sensores de cinema e zoom óptico 40x em todos os cômodos.',
    level: 1,
    maxLevel: 4,
    baseCost: 150000,
    multiplier: 1.8,
    currentBenefit: '+1.5 IBOPE base em transmissões ao vivo',
  },
  {
    id: 'up-ai-editing',
    title: 'Suíte de Corte com Inteligência Artificial',
    category: 'editing',
    description: 'Reconhecimento facial instantâneo e detecção automática de brigas.',
    level: 1,
    maxLevel: 3,
    baseCost: 120000,
    multiplier: 2.0,
    currentBenefit: 'Gera 2 takes extras por dia na Ilha de Edição',
  },
  {
    id: 'up-earbud-pro',
    title: 'Ponto Eletrônico Ultrassônico',
    category: 'director_powers',
    description: 'Comunicação criptografada e direta com o apresentador sem vazamento.',
    level: 0,
    maxLevel: 2,
    baseCost: 80000,
    multiplier: 2.2,
    currentBenefit: 'Intervenções de ponto não custam Autoridade',
  },
  {
    id: 'up-streaming-infra',
    title: 'Cluster de Servidores CDN de Alta Concorrência',
    category: 'studio',
    description: 'Suporta milhões de acessos simultâneos sem queda de frame rate.',
    level: 1,
    maxLevel: 4,
    baseCost: 200000,
    multiplier: 1.7,
    currentBenefit: '+30% de receita publicitária nos streams 24 horas',
  },
];

export const INITIAL_ACHIEVEMENTS: DirectorAchievement[] = [
  {
    id: 'ach-ibope-king',
    title: 'Rei do IBOPE',
    description: 'Alcance mais de 35 pontos de audiência no programa ao vivo.',
    reputationReward: 10,
    cashReward: 250000,
    unlocked: false,
    progress: 28,
    maxProgress: 35,
    icon: 'Tv',
  },
  {
    id: 'ach-tycoon',
    title: 'Magnata da Televisão',
    description: 'Acumule mais de R$ 1.000.000 no caixa da produção.',
    reputationReward: 15,
    cashReward: 500000,
    unlocked: false,
    progress: 250000,
    maxProgress: 1000000,
    icon: 'DollarSign',
  },
  {
    id: 'ach-peace-keeper',
    title: 'Domador de Feras',
    description: 'Resolva 3 crises graves sem perder reputação da emissora.',
    reputationReward: 12,
    cashReward: 150000,
    unlocked: false,
    progress: 0,
    maxProgress: 3,
    icon: 'ShieldAlert',
  },
  {
    id: 'ach-viral-phenom',
    title: 'Fenômeno da Internet',
    description: 'Gere um momento com mais de 80.000 tweets por minuto.',
    reputationReward: 8,
    cashReward: 100000,
    unlocked: false,
    progress: 45000,
    maxProgress: 80000,
    icon: 'Flame',
  },
];

/**
 * Calculates weekly financial balance sheet (Revenues vs Costs).
 */
export function calculateWeeklyFinance(
  sponsors: SponsorContract[],
  staff: StaffMember[],
  currentIbope: number
) {
  const activeSponsors = sponsors.filter((s) => s.signed);
  const sponsorRevenue = activeSponsors.reduce((acc, s) => {
    // If ibope is below minimum, penalty applies
    const penalty = currentIbope < s.minimumIbope ? 0.75 : 1.0;
    return acc + s.weeklyRevenue * penalty;
  }, 0);

  const hiredStaff = staff.filter((s) => s.hired);
  const staffPayroll = hiredStaff.reduce((acc, s) => acc + s.salaryPerWeek, 0);

  const baseOperatingCost = 85000;
  const netWeekly = sponsorRevenue - staffPayroll - baseOperatingCost;

  return {
    sponsorRevenue,
    staffPayroll,
    baseOperatingCost,
    netWeekly,
    activeSponsorsCount: activeSponsors.length,
    hiredStaffCount: hiredStaff.length,
  };
}
