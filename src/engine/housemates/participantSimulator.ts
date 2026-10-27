/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Participant } from './types';
import { DayPhase } from '@/config/balance';
import { decideParticipantAction } from './utilityAI';

export function simulateParticipantTick(
  participant: Participant,
  phase: DayPhase,
  isRecordingActive: boolean = false
): Participant {
  if (participant.isEliminated) {
    return participant;
  }

  const prevPopularity = participant.stats.popularity;
  const prevStamina = participant.stats.stamina;
  const prevMood = participant.stats.mood;

  // 1. Executa a decisão autônoma via Utility AI
  const { updatedParticipant } = decideParticipantAction(participant, phase);

  // 2. Moduladores de ambiente e intervenção do diretor
  let popDelta = updatedParticipant.stats.popularity - prevPopularity;
  let staminaDelta = updatedParticipant.stats.stamina - prevStamina;
  let moodDelta = updatedParticipant.stats.mood - prevMood;

  if (isRecordingActive) {
    // Gravação ativa intensifica ganhos ou perdas de popularidade perante os telespectadores
    popDelta = Math.round(popDelta * 1.6);
  }

  // 3. Atualiza os deltas computados para exibição visual
  return {
    ...updatedParticipant,
    deltas: {
      popularity: popDelta,
      stamina: staminaDelta,
      mood: moodDelta,
    },
    states: {
      ...updatedParticipant.states,
      energy: updatedParticipant.stats.stamina,
      mood: updatedParticipant.stats.mood,
    },
  };
}

export function simulateCastTick(
  cast: Participant[],
  phase: DayPhase,
  isRecordingActive: boolean = false
): Participant[] {
  return cast.map((p) => simulateParticipantTick(p, phase, isRecordingActive));
}
