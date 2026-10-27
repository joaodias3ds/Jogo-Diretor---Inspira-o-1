/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const THEME = {
  colors: {
    bgDark: '#090b10',
    panelBg: 'rgba(15, 20, 31, 0.85)',
    cardBg: 'rgba(22, 29, 44, 0.7)',
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    borderHover: 'rgba(255, 255, 255, 0.2)',
    onAirRed: '#ef4444',
    liveOrange: '#f97316',
    amberWarning: '#f59e0b',
    cyanAccent: '#06b6d4',
    emeraldSuccess: '#10b981',
    purpleAccent: '#a855f7',
  },
  typography: {
    fontSans: "'Plus Jakarta Sans', system-ui, sans-serif",
    fontMono: "'JetBrains Mono', monospace",
  },
} as const;

export type RealityMode = 'house' | 'farm' | 'hybrid';

export interface GameModeInfo {
  id: RealityMode;
  name: string;
  tagline: string;
  description: string;
  locationName: string;
  leaderTitle: string;
  eliminationTitle: string;
  immunityTitle: string;
  castigoTitle: string;
  badgeColor: string;
}

export const REALITY_MODES: Record<RealityMode, GameModeInfo> = {
  house: {
    id: 'house',
    name: 'Casa Confinada',
    tagline: 'O clássico confinamento urbano sob holofotes',
    description: 'Mansão com piscina, academia, confessionário e quartos divididos. Foco em relações intensas, brigas de convivência, festas e alianças de quarto.',
    locationName: 'Mansão dos Sonhos',
    leaderTitle: 'Líder da Semana',
    eliminationTitle: 'Paredão',
    immunityTitle: 'Anjo',
    castigoTitle: 'Monstro',
    badgeColor: 'border-cyan-500/30 text-cyan-400 bg-cyan-950/40',
  },
  farm: {
    id: 'farm',
    name: 'Fazenda Rural',
    tagline: 'Sobrevivência, trato com animais e clima de campo',
    description: 'Sede rústica, baias com animais (cavalos, vacas, porcos, galinhas) e fogueira de votação. Falha nas tarefas do campo rende punições coletivas para a sede toda.',
    locationName: 'Sede da Fazenda',
    leaderTitle: 'Fazendeiro Chefe',
    eliminationTitle: 'Roça',
    immunityTitle: 'Guardião do Lampião',
    castigoTitle: 'Baia dos Bichos',
    badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-950/40',
  },
  hybrid: {
    id: 'hybrid',
    name: 'Formato Híbrido',
    tagline: 'Mansão de Vidro interligada ao campo',
    description: 'Dois ambientes simultâneos com trocas de moradores, desafios cruzados e dinâmicas que misturam o luxo urbano com a rotina pesada da roça.',
    locationName: 'Complexo Multiverso',
    leaderTitle: 'Diretor Supremo',
    eliminationTitle: 'Berlinda',
    immunityTitle: 'Amuleto de Ouro',
    castigoTitle: 'Exílio',
    badgeColor: 'border-purple-500/30 text-purple-400 bg-purple-950/40',
  },
};
