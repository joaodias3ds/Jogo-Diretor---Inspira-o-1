/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RealityRoomId } from '@/engine/housemates/types';

export interface RoomBoundary {
  id: RealityRoomId;
  name: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  wallColor: number;
  floorColor: number;
  floorType: 'wood' | 'tile' | 'carpet' | 'grass' | 'rubber' | 'velvet';
  description: string;
}

export interface CameraPreset {
  id: string;
  roomId: RealityRoomId;
  name: string;
  shortName: string;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  description: string;
  isCCTV: boolean;
}

export interface LightingPhaseConfig {
  sunPosition: [number, number, number];
  sunColor: number;
  sunIntensity: number;
  skyColor: number;
  groundColor: number;
  ambientIntensity: number;
  fogColor: number;
  fogNear: number;
  fogFar: number;
  interiorLightsOn: boolean;
  partyLightsOn: boolean;
  nightVision: boolean;
}
