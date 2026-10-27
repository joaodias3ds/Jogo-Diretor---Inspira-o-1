/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StaffMember, StudioPayrollSummary, StaffLevel } from './staffTypes';

export const INITIAL_STAFF: StaffMember[] = [
  // --- PELA FRENTE DAS CÂMERAS ---
  {
    id: 'staff-host-1',
    name: 'Tadeu Santiago',
    roleTitle: 'Apresentador Titular',
    department: 'front_of_camera',
    avatar: '🎤',
    level: 'Senior',
    weeklySalary: 35000,
    upgradeCost: 50000,
    hired: true,
    perks: ['Discursos Poéticos no Paredão (+15% IBOPE)', 'Alta credibilidade com marcas premium'],
    description: 'Comandante carismático do horário nobre, especialista em manter o suspense e a emoção na revelação dos votos.',
    statBonus: {
      ibopeMultiplier: 1.15,
      reputationBonus: 10,
    },
  },
  {
    id: 'staff-panelist-1',
    name: 'Beto Calouro & Diva da Web',
    roleTitle: 'Comentaristas da Central do Reality',
    department: 'front_of_camera',
    avatar: '📺',
    level: 'Pleno',
    weeklySalary: 14000,
    upgradeCost: 25000,
    hired: true,
    perks: ['Humor Ácido & Memes no Twitter (+20% Engajamento Viral)', 'Resumos descontraídos'],
    description: 'Bancada diária de análise com humor, cortes para o TikTok e interação ao vivo com as torcidas.',
    statBonus: {
      dramaChanceBonus: 0.1,
      ibopeMultiplier: 1.05,
    },
  },
  {
    id: 'staff-reporter-1',
    name: 'Fernanda Lins',
    roleTitle: 'Repórter de Rua & Flash Ao Vivo',
    department: 'front_of_camera',
    avatar: '🎙️',
    level: 'Junior',
    weeklySalary: 8500,
    upgradeCost: 15000,
    hired: false,
    perks: ['Entrevistas com familiares e torcidas na porta do estúdio (+10% Votação Popular)'],
    description: 'Repórter incansável cobrindo o termômetro do público nos pontos mais movimentados do país.',
    statBonus: {
      ibopeMultiplier: 1.06,
    },
  },
  {
    id: 'staff-dummy-1',
    name: 'Chefe dos Dummies',
    roleTitle: 'Mascote & Supervisor de Arena',
    department: 'front_of_camera',
    avatar: '🎭',
    level: 'Pleno',
    weeklySalary: 7200,
    upgradeCost: 12000,
    hired: true,
    perks: ['Organização e fiscalização das Provas do Líder (-30% Erros de Montagem)', 'Iconografia viral'],
    description: 'Figura icônica mascarada que conduz os participantes nos labirintos e provas com rigor absoluto.',
    statBonus: {
      challengeSpeedBonus: 0.2,
    },
  },

  // --- POR TRÁS DAS CÂMERAS ---
  {
    id: 'staff-photo-1',
    name: 'Claudio Mantovani',
    roleTitle: 'Diretor de Fotografia & Iluminação',
    department: 'behind_the_scenes',
    avatar: '🎥',
    level: 'Senior',
    weeklySalary: 18500,
    upgradeCost: 30000,
    hired: true,
    perks: ['Enquadramento Cinematográfico 4K (+12% Retenção Visual)', 'Correção de cor ao vivo'],
    description: 'Mestre da luz e das lentes robóticas, garantindo planos dramáticos em close-up nas lágrimas e confrontos.',
    statBonus: {
      ibopeMultiplier: 1.12,
      editingBonus: 0.15,
    },
  },
  {
    id: 'staff-writer-1',
    name: 'Mariana Rocha',
    roleTitle: 'Roteirista Chefe de Dinâmicas & Tretas',
    department: 'behind_the_scenes',
    avatar: '✍️',
    level: 'Senior',
    weeklySalary: 22000,
    upgradeCost: 38000,
    hired: true,
    perks: ['Criação de Sincerões Explosivos (+25% Tretas Construtivas)', 'Perguntas venenosas'],
    description: 'Mente estratégica que elabora as dinâmicas de discórdia mais desconfortáveis e reveladoras da televisão brasileira.',
    statBonus: {
      dramaChanceBonus: 0.25,
      ibopeMultiplier: 1.08,
    },
  },
  {
    id: 'staff-psych-1',
    name: 'Dra. Helena Gusmão',
    roleTitle: 'Psicóloga de Confinamento',
    department: 'behind_the_scenes',
    avatar: '🧠',
    level: 'Senior',
    weeklySalary: 19500,
    upgradeCost: 32000,
    hired: true,
    perks: ['Atendimento emergencial no Confessionário (-50% Risco de Desistência/Botão)', 'Estabilização de humor'],
    description: 'Profissional gabaritada que avalia a saúde mental dos confinados e previne colapsos emocionais e desistências em massa.',
    statBonus: {
      crisisResistanceBonus: 0.5,
    },
  },
  {
    id: 'staff-security-1',
    name: 'Capitão Valdir',
    roleTitle: 'Chefe de Segurança Tática',
    department: 'behind_the_scenes',
    avatar: '🛡️',
    level: 'Pleno',
    weeklySalary: 12500,
    upgradeCost: 20000,
    hired: true,
    perks: ['Intervenção Imediata contra Invasões ou Agressões Físicas (-60% Risco de Cancelamento Jurídico)'],
    description: 'Comanda a equipe de prontidão nos bastidores para intervir em segundos caso qualquer limite físico seja rompido.',
    statBonus: {
      crisisResistanceBonus: 0.6,
    },
  },
  {
    id: 'staff-editor-1',
    name: 'Rodrigo "Cutter" Paz',
    roleTitle: 'Editor-Chefe da Ilha de Edição',
    department: 'behind_the_scenes',
    avatar: '✂️',
    level: 'Senior',
    weeklySalary: 21000,
    upgradeCost: 35000,
    hired: true,
    perks: ['Montagem Ágil & Sonorização Épica (+30% Pontuação em Programas Editados)', 'Sincronização de trilhas'],
    description: 'Especialista em construir narrativas de vilão e mocinho com ritmo eletrizante para o bloco nobre do programa.',
    statBonus: {
      editingBonus: 0.3,
      ibopeMultiplier: 1.07,
    },
  },
  {
    id: 'staff-vet-1',
    name: 'Dr. Roberto Agro',
    roleTitle: 'Veterinário & Zootecnista Chefe',
    department: 'behind_the_scenes',
    avatar: '🐴',
    level: 'Pleno',
    weeklySalary: 11000,
    upgradeCost: 18000,
    hired: false,
    perks: ['Cuidado Clínico com Cavalos, Vacas e Ovelhas da Fazenda (+35% Sanidade Rural e Zero Multas)'],
    description: 'Essencial para temporadas no campo. Garante o bem-estar animal, orienta o fazendeiro e evita processos do Ministério Público.',
    statBonus: {
      farmAnimalHealthBonus: 0.35,
      reputationBonus: 5,
    },
  },
];

export function calculateStudioPayroll(staff: StaffMember[]): StudioPayrollSummary {
  const hiredStaff = staff.filter((s) => s.hired);
  return {
    totalStaffHired: hiredStaff.length,
    totalWeeklyPayroll: hiredStaff.reduce((acc, s) => acc + s.weeklySalary, 0),
    activeBuffsCount: hiredStaff.reduce((acc, s) => acc + s.perks.length, 0),
    frontCameraCount: hiredStaff.filter((s) => s.department === 'front_of_camera').length,
    behindCameraCount: hiredStaff.filter((s) => s.department === 'behind_the_scenes').length,
  };
}

export function promoteStaffLevel(currentLevel: StaffLevel): StaffLevel {
  switch (currentLevel) {
    case 'Junior':
      return 'Pleno';
    case 'Pleno':
      return 'Senior';
    case 'Senior':
      return 'Estrela';
    case 'Estrela':
      return 'Estrela';
  }
}
