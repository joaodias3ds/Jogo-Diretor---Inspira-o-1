/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BroadcastTake, NarrativeTag } from '@/engine/broadcast/broadcastTypes';

export type EditingNarrativeBias =
  | 'neutro'         // Edição documental imparcial (risco zero, audiência moderada)
  | 'vilao'          // Pintar participante como vilão manipulador (+audiência, +rejeição do alvo)
  | 'vitima'         // Pintar participante como perseguido/coitadinho (+empatia, +fandom)
  | 'romance'        // Foco no casal / shipp (+público família/sofá, +carisma)
  | 'hipocrisia'     // Expor contradições e jogo duplo (+pico de treta no Twitter, viraliza)
  | 'comedia_pastel' // Alívio cômico / memes (+leveza, reduz estresse geral);

export interface EpisodeTakeSelection {
  takeId: string;
  targetParticipantId?: string;
  order: number;
}

export interface DailyEpisodePackage {
  id: string;
  day: number;
  week: number;
  title: string;
  narrativeBias: EditingNarrativeBias;
  targetParticipantId?: string;
  targetParticipantName?: string;
  selectedTakes: BroadcastTake[];
  totalDurationSeconds: number;
  productionCost: number;
  ethicalRisk: number; // 0 a 100
  projectedIbopeBoost: number;
  actualIbopeRecorded: number;
  summaryText: string;
  renderedAt: number;
}

export interface EditingImpactResult {
  episode: DailyEpisodePackage;
  ibopeGain: number;
  reputationChange: number;
  cashCost: number;
  targetPopularityShift: number;
  targetRejectionShift: number;
  viewerReactions: string[];
}
