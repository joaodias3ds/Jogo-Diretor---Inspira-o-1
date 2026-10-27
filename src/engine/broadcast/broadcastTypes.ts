/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RealityRoomId } from '@/engine/housemates/types';

export type NarrativeTag =
  | 'treta'       // Briga / Conflito acalorado
  | 'romance'     // Clima de casal / flerte
  | 'vilao'       // Articulação maquiavélica de votos
  | 'estrategia'  // Alianças e cálculo de jogo
  | 'comedia'     // Mico / Risadas / Situação hilária
  | 'emocao';     // Choro / Desabafo íntimo

export interface BroadcastTake {
  id: string;
  timestamp: string;
  timecode: string;
  roomId: RealityRoomId;
  cameraName: string;
  narrativeTag: NarrativeTag;
  title: string;
  durationSeconds: number;
  dramaRating: number; // 1 a 5 estrelas
  ibopeImpact: number; // Ex: +1.4 pts
}

export interface IbopeHistoryPoint {
  time: string;
  ibope: number;
  share: number;
  eventLabel?: string;
}

export interface BroadcastState {
  pgmCameraId: string;       // Câmera NO AR (Programa / PGM)
  pvwCameraId: string;       // Câmera de PRÉVIA (Preview / PVW)
  tBarPosition: number;      // 0 a 100% de transição
  isAutoTransitioning: boolean;
  isOnAir: boolean;
  isStreaming: boolean;
  lowerThirdText: string;
  lowerThirdSubtext: string;
  showLowerThird: boolean;
  audioPeakL: number;        // VU Meter dB (-60 a 0)
  audioPeakR: number;
  ibopeHistory: IbopeHistoryPoint[];
  recordedTakes: BroadcastTake[];
  dailyShowPackagesCount: number;
}
