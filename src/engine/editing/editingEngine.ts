/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BroadcastTake } from '@/engine/broadcast/broadcastTypes';
import { Participant } from '@/engine/housemates/types';
import { DailyEpisodePackage, EditingImpactResult, EditingNarrativeBias } from './editingTypes';

export interface AssembleEpisodeParams {
  day: number;
  week: number;
  title: string;
  narrativeBias: EditingNarrativeBias;
  selectedTakes: BroadcastTake[];
  targetParticipant?: Participant;
  currentIbope: number;
}

export function assembleDailyEpisode({
  day,
  week,
  title,
  narrativeBias,
  selectedTakes,
  targetParticipant,
  currentIbope,
}: AssembleEpisodeParams): EditingImpactResult {
  const totalDuration = selectedTakes.reduce((acc, t) => acc + t.durationSeconds, 0);
  const baseDramaRating = selectedTakes.length > 0
    ? selectedTakes.reduce((acc, t) => acc + t.dramaRating, 0) / selectedTakes.length
    : 3;

  // Base costs and risks
  let productionCost = 3500 + selectedTakes.length * 1200;
  let ethicalRisk = 5;
  let ibopeMultiplier = 1.0;
  let popularityShift = 0;
  let rejectionShift = 0;
  let reputationShift = 0;
  const viewerReactions: string[] = [];

  switch (narrativeBias) {
    case 'vilao':
      ethicalRisk = 45;
      ibopeMultiplier = 1.6;
      productionCost += 2000;
      popularityShift = -14;
      rejectionShift = +28;
      reputationShift = -2;
      viewerReactions.push('Público chocado com a frieza nas articulações!');
      viewerReactions.push('Subiu a hashtag #ForaFalso nos trending topics.');
      break;

    case 'vitima':
      ethicalRisk = 30;
      ibopeMultiplier = 1.45;
      productionCost += 1500;
      popularityShift = +22;
      rejectionShift = -12;
      reputationShift = +1;
      viewerReactions.push('Fãs emocionados organizam mutirões de acolhimento.');
      viewerReactions.push('Comentários de revolta contra os algozes da casa.');
      break;

    case 'romance':
      ethicalRisk = 10;
      ibopeMultiplier = 1.35;
      productionCost += 1000;
      popularityShift = +12;
      rejectionShift = -8;
      reputationShift = +2;
      viewerReactions.push('O público do sofá se apaixonou pela trilha sonora do casal!');
      viewerReactions.push('Edição de olhares e carícias viralizou no TikTok.');
      break;

    case 'hipocrisia':
      ethicalRisk = 65;
      ibopeMultiplier = 1.8;
      productionCost += 2500;
      popularityShift = -8;
      rejectionShift = +24;
      reputationShift = -4;
      viewerReactions.push('VT expôs contradição absurda com cortes rápidos do confessionário.');
      viewerReactions.push('Climão absoluto repercutindo nos portais de fofoca.');
      break;

    case 'comedia_pastel':
      ethicalRisk = 5;
      ibopeMultiplier = 1.25;
      productionCost += 800;
      popularityShift = +15;
      rejectionShift = -10;
      reputationShift = +3;
      viewerReactions.push('Risadas garantidas com os tropeços e piadas na piscina.');
      viewerReactions.push('Memes invadiram os grupos de WhatsApp.');
      break;

    case 'neutro':
    default:
      ethicalRisk = 0;
      ibopeMultiplier = 1.1;
      popularityShift = +2;
      rejectionShift = 0;
      reputationShift = +2;
      viewerReactions.push('Transmissão jornalística e transparente, sem manipulações.');
      break;
  }

  // Calculate actual IBOPE gain
  const baseGain = (baseDramaRating * 0.8) * ibopeMultiplier;
  const ibopeGain = parseFloat(Math.min(8.5, Math.max(1.2, baseGain)).toFixed(1));
  const actualIbope = parseFloat((currentIbope + ibopeGain).toFixed(1));

  const targetName = targetParticipant ? `${targetParticipant.name} (${targetParticipant.nickname})` : undefined;

  let summaryText = `Episódio Dia ${day} montado com ${selectedTakes.length} blocos sob o prisma "${narrativeBias.toUpperCase()}". `;
  if (targetName) {
    summaryText += `Foco narrativo centralizado em ${targetName}. `;
  }
  summaryText += `Audiência saltou para ${actualIbope} pts (+${ibopeGain} pts).`;

  const episode: DailyEpisodePackage = {
    id: `ep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    day,
    week,
    title: title || `Edição Diária - Dia ${day}`,
    narrativeBias,
    targetParticipantId: targetParticipant?.id,
    targetParticipantName: targetName,
    selectedTakes,
    totalDurationSeconds: totalDuration,
    productionCost,
    ethicalRisk,
    projectedIbopeBoost: ibopeGain,
    actualIbopeRecorded: actualIbope,
    summaryText,
    renderedAt: Date.now(),
  };

  return {
    episode,
    ibopeGain,
    reputationChange: reputationShift,
    cashCost: productionCost,
    targetPopularityShift: popularityShift,
    targetRejectionShift: rejectionShift,
    viewerReactions,
  };
}
