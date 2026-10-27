/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RandomEventCategory = 'conflito' | 'romance' | 'desafio_surpresa';

export interface RandomEventOption {
  id: string;
  label: string;
  description: string;
  ibopeDelta: number;
  cashDelta: number;
  authorityDelta: number;
  reputationDelta: number;
  socialBuzzText: string;
  actionLog: string;
}

export interface RandomEvent {
  id: string;
  category: RandomEventCategory;
  title: string;
  headline: string;
  description: string;
  location: string;
  involvedParticipantIds: string[];
  involvedParticipantNames: string[];
  ibopeImpact: number;
  socialBuzzScore: number;
  options: RandomEventOption[];
  timestamp: string;
  resolvedOptionId?: string;
}
