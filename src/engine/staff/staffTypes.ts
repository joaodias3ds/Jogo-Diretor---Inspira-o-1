/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StaffDepartment = 'behind_the_scenes' | 'front_of_camera';
export type StaffLevel = 'Junior' | 'Pleno' | 'Senior' | 'Estrela';

export interface StaffMember {
  id: string;
  name: string;
  roleTitle: string;
  department: StaffDepartment;
  avatar: string;
  level: StaffLevel;
  weeklySalary: number;
  upgradeCost: number;
  hired: boolean;
  perks: string[];
  description: string;
  statBonus: {
    ibopeMultiplier?: number;      // ex: 1.10 (+10% IBOPE no Ao Vivo)
    dramaChanceBonus?: number;     // ex: +15% de chance de gerar conflitos
    crisisResistanceBonus?: number;// ex: -40% de chance de crise fugir do controle
    editingBonus?: number;         // ex: +25% de pontuação nos blocos editados
    reputationBonus?: number;      // ex: +5 reputação com patrocinadores
    challengeSpeedBonus?: number;  // ex: +20% agilidade de montagem de provas
    farmAnimalHealthBonus?: number;// ex: +30% saúde animal e imunidade a multas
  };
}

export interface StudioPayrollSummary {
  totalStaffHired: number;
  totalWeeklyPayroll: number;
  activeBuffsCount: number;
  frontCameraCount: number;
  behindCameraCount: number;
}
