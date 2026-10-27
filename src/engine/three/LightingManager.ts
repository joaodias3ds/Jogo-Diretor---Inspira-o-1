/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { DayPhase } from '@/engine/time/gameClock';
import { LightingPhaseConfig } from './types';

export const LIGHTING_PHASES: Record<DayPhase, LightingPhaseConfig> = {
  Manhã: {
    sunPosition: [18, 14, 12],
    sunColor: 0xffedd5, // Warm morning gold
    sunIntensity: 1.6,
    skyColor: 0x93c5fd, // Clear soft sky
    groundColor: 0x1e293b,
    ambientIntensity: 0.65,
    fogColor: 0x1e293b,
    fogNear: 25,
    fogFar: 80,
    interiorLightsOn: true,
    partyLightsOn: false,
    nightVision: false,
  },
  Tarde: {
    sunPosition: [5, 22, -6],
    sunColor: 0xffffff, // Crisp daylight
    sunIntensity: 2.1,
    skyColor: 0x60a5fa,
    groundColor: 0x0f172a,
    ambientIntensity: 0.75,
    fogColor: 0x0f172a,
    fogNear: 30,
    fogFar: 95,
    interiorLightsOn: false,
    partyLightsOn: false,
    nightVision: false,
  },
  Noite: {
    sunPosition: [-12, 10, -18],
    sunColor: 0x818cf8, // Indigo twilight
    sunIntensity: 0.7,
    skyColor: 0x1e1b4b,
    groundColor: 0x020617,
    ambientIntensity: 0.45,
    fogColor: 0x020617,
    fogNear: 20,
    fogFar: 70,
    interiorLightsOn: true,
    partyLightsOn: true,
    nightVision: false,
  },
  Madrugada: {
    sunPosition: [-16, 6, 12],
    sunColor: 0x38bdf8, // Deep cyan moon
    sunIntensity: 0.35,
    skyColor: 0x030712,
    groundColor: 0x020617,
    ambientIntensity: 0.28,
    fogColor: 0x030712,
    fogNear: 15,
    fogFar: 60,
    interiorLightsOn: false,
    partyLightsOn: false,
    nightVision: true,
  },
};

export class LightingManager {
  public sunLight: THREE.DirectionalLight;
  public hemiLight: THREE.HemisphereLight;
  public roomSpotlights: THREE.SpotLight[] = [];
  public partyLights: THREE.PointLight[] = [];

  constructor(scene: THREE.Scene) {
    // 1. Sun / Directional Light with soft shadows
    this.sunLight = new THREE.DirectionalLight(0xffedd5, 1.6);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 80;
    const d = 26;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.sunLight.shadow.normalBias = 0.02;
    scene.add(this.sunLight);

    // 2. Hemisphere ambient fill (Sky vs Ground)
    this.hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.6);
    scene.add(this.hemiLight);

    // 3. Interior warm ceiling downlights for key rooms
    const spotPositions: [number, number, number, number][] = [
      [0, 5, 0, 0xfffbeb], // Sala
      [8.5, 4.5, -7, 0xfef3c7], // VIP
      [-8.5, 4.5, -7, 0xfde68a], // Xepa
      [0, 3.8, 13, 0xf43f5e], // Confessionário (Red dramatics)
      [-14, 4.5, 0, 0xe0e7ff], // Academia
      [-8.5, 4.2, 7, 0xfef3c7], // Quarto 1
      [8.5, 4.2, 7, 0x38bdf8], // Quarto 2
    ];

    spotPositions.forEach(([x, y, z, color]) => {
      const spot = new THREE.SpotLight(color, 2.2, 14, Math.PI / 3, 0.4, 1.2);
      spot.position.set(x, y, z);
      spot.target.position.set(x, 0, z);
      scene.add(spot);
      scene.add(spot.target);
      this.roomSpotlights.push(spot);
    });

    // 4. Party pool lights (Festa night mode)
    const partyColors = [0xec4899, 0x8b5cf6, 0x06b6d4, 0x10b981];
    partyColors.forEach((col, idx) => {
      const pLight = new THREE.PointLight(col, 1.8, 12, 1.5);
      const angle = (idx / partyColors.length) * Math.PI * 2;
      pLight.position.set(Math.cos(angle) * 6, 2.5, -18 + Math.sin(angle) * 3);
      scene.add(pLight);
      this.partyLights.push(pLight);
    });
  }

  public updatePhase(phase: DayPhase, scene: THREE.Scene): void {
    const cfg = LIGHTING_PHASES[phase] || LIGHTING_PHASES.Manhã;

    // Smooth sun update
    this.sunLight.position.set(cfg.sunPosition[0], cfg.sunPosition[1], cfg.sunPosition[2]);
    this.sunLight.color.setHex(cfg.sunColor);
    this.sunLight.intensity = cfg.sunIntensity;

    // Ambient
    this.hemiLight.color.setHex(cfg.skyColor);
    this.hemiLight.groundColor.setHex(cfg.groundColor);
    this.hemiLight.intensity = cfg.ambientIntensity;

    // Fog
    if (scene.fog && scene.fog instanceof THREE.Fog) {
      scene.fog.color.setHex(cfg.fogColor);
      scene.fog.near = cfg.fogNear;
      scene.fog.far = cfg.fogFar;
    }

    // Spotlights
    const spotIntensity = cfg.interiorLightsOn ? 2.2 : (cfg.nightVision ? 0.4 : 0.8);
    this.roomSpotlights.forEach((spot) => {
      spot.intensity = spotIntensity;
    });

    // Party lights
    this.partyLights.forEach((pl) => {
      pl.intensity = cfg.partyLightsOn ? 2.2 : 0;
    });
  }

  public tickPartyAnimation(elapsedTime: number): void {
    if (this.partyLights[0]?.intensity > 0) {
      this.partyLights.forEach((pl, idx) => {
        const offset = idx * 1.5;
        pl.intensity = 1.6 + Math.sin(elapsedTime * 3.5 + offset) * 0.9;
      });
    }
  }

  public dispose(): void {
    this.roomSpotlights.forEach((s) => s.dispose());
    this.partyLights.forEach((p) => p.dispose());
  }
}
