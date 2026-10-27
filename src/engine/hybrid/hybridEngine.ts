/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Participant } from '@/engine/housemates/types';

export type HouseLocation = 'mansion' | 'farm_ranch';

export interface HybridTransferLog {
  id: string;
  day: number;
  participantId: string;
  participantName: string;
  fromLocation: HouseLocation;
  toLocation: HouseLocation;
  reason: string;
}

export interface HybridState {
  mansionParticipantIds: string[];
  farmParticipantIds: string[];
  transfersHistory: HybridTransferLog[];
  currentMainFocus: HouseLocation;
}

export function createInitialHybridState(cast: Participant[]): HybridState {
  const half = Math.ceil(cast.length / 2);
  const mansionParticipantIds = cast.slice(0, half).map((p) => p.id);
  const farmParticipantIds = cast.slice(half).map((p) => p.id);

  return {
    mansionParticipantIds,
    farmParticipantIds,
    transfersHistory: [],
    currentMainFocus: 'mansion',
  };
}

/**
 * Transfers a participant from one location to another (e.g. VIP exchange).
 */
export function executeIntercambio(
  state: HybridState,
  participant: Participant,
  toLocation: HouseLocation,
  day: number,
  reason: string = 'Intercâmbio Surpresa da Direção'
): HybridState {
  const isFromMansion = state.mansionParticipantIds.includes(participant.id);
  const fromLocation: HouseLocation = isFromMansion ? 'mansion' : 'farm_ranch';

  if (fromLocation === toLocation) return state;

  const nextMansionIds =
    toLocation === 'mansion'
      ? [...state.mansionParticipantIds, participant.id]
      : state.mansionParticipantIds.filter((id) => id !== participant.id);

  const nextFarmIds =
    toLocation === 'farm_ranch'
      ? [...state.farmParticipantIds, participant.id]
      : state.farmParticipantIds.filter((id) => id !== participant.id);

  const log: HybridTransferLog = {
    id: `transfer-${Date.now()}`,
    day,
    participantId: participant.id,
    participantName: participant.name,
    fromLocation,
    toLocation,
    reason,
  };

  return {
    ...state,
    mansionParticipantIds: nextMansionIds,
    farmParticipantIds: nextFarmIds,
    transfersHistory: [log, ...state.transfersHistory],
  };
}
