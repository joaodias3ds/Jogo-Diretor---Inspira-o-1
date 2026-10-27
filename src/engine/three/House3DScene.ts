/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { REALITY_ROOMS, CAMERA_PRESETS } from './roomData';
import { LightingManager } from './LightingManager';
import { Character3DManager } from './Character3DManager';
import { Participant } from '@/engine/housemates/types';
import { DayPhase } from '@/engine/time/gameClock';
import { CameraPreset } from './types';

export class House3DScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public lightingManager: LightingManager;
  public characterManager: Character3DManager;

  private clock = new THREE.Clock();
  private animationFrameId = 0;
  private isDestroyed = false;

  // Active camera transition
  private currentCameraTarget = new THREE.Vector3(0, 1.2, 0);
  private targetCameraPos = new THREE.Vector3(6.5, 4.2, 4.5);
  private targetLookAt = new THREE.Vector3(0, 1.2, 0);
  private activePreset: CameraPreset = CAMERA_PRESETS[0];

  // Procedural animated meshes
  private waterMesh: THREE.Mesh | null = null;
  private tvScreenMesh: THREE.Mesh | null = null;
  private tvCanvas: HTMLCanvasElement | null = null;
  private tvTexture: THREE.CanvasTexture | null = null;

  // Interaction
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();

  constructor(private container: HTMLDivElement, private onSelectParticipant?: (id: string) => void) {
    // 1. Scene setup with soft horizon fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x090b10);
    this.scene.fog = new THREE.Fog(0x090b10, 25, 80);

    // 2. Camera setup
    const aspect = container.clientWidth / Math.max(container.clientHeight, 1);
    this.camera = new THREE.PerspectiveCamera(52, aspect, 0.1, 150);
    this.camera.position.set(6.5, 4.2, 4.5);
    this.camera.lookAt(0, 1.2, 0);

    // 3. High performance WebGLRenderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 4. Lighting & Character sub-systems
    this.lightingManager = new LightingManager(this.scene);
    this.characterManager = new Character3DManager(this.scene);

    // 5. Build Architectural Environment
    this.buildHouseGeometry();

    // 6. Bind events
    this.bindEvents();

    // 7. Start Render Loop
    this.tick = this.tick.bind(this);
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  private buildHouseGeometry(): void {
    // Foundation Ground
    const groundGeo = new THREE.PlaneGeometry(120, 120);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x05070c,
      roughness: 0.95,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Build each reality room
    Object.values(REALITY_ROOMS).forEach((room) => {
      // Room floor with boundary border
      const floorGeo = new THREE.BoxGeometry(room.width, 0.1, room.depth);
      const floorMat = new THREE.MeshStandardMaterial({
        color: room.floorColor,
        roughness: room.floorType === 'tile' ? 0.2 : room.floorType === 'rubber' ? 0.9 : 0.6,
        metalness: room.floorType === 'tile' ? 0.3 : 0.1,
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.position.set(room.x, 0.05, room.z);
      floor.receiveShadow = true;
      this.scene.add(floor);

      // Low stylized perimeter walls for camera visibility
      const wallH = 2.8;
      const wallThick = 0.2;
      const wallMat = new THREE.MeshStandardMaterial({
        color: room.wallColor,
        roughness: 0.7,
        metalness: 0.1,
      });

      // Back wall
      const backWallGeo = new THREE.BoxGeometry(room.width, wallH, wallThick);
      const backWall = new THREE.Mesh(backWallGeo, wallMat);
      backWall.position.set(room.x, wallH / 2, room.z + room.depth / 2);
      backWall.castShadow = true;
      backWall.receiveShadow = true;
      this.scene.add(backWall);

      // Side wall
      const sideWallGeo = new THREE.BoxGeometry(wallThick, wallH, room.depth);
      const sideWall = new THREE.Mesh(sideWallGeo, wallMat);
      sideWall.position.set(room.x + room.width / 2, wallH / 2, room.z);
      sideWall.castShadow = true;
      sideWall.receiveShadow = true;
      this.scene.add(sideWall);
    });

    // Dedicated Furniture & Assets
    this.buildLivingRoomProps();
    this.buildKitchenVIPProps();
    this.buildKitchenXepaProps();
    this.buildPoolGardenProps();
    this.buildConfessionRoomProps();
    this.buildGymProps();
    this.buildBedroomProps();
  }

  private buildLivingRoomProps(): void {
    const salaGroup = new THREE.Group();
    salaGroup.position.set(0, 0, 0);

    // Large U-shaped Modular Sofa (camurça cinza)
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.7 });

    // Main back section
    const backSection = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.55, 1.2), sofaMat);
    backSection.position.set(0, 0.3, 2.2);
    backSection.castShadow = true;
    salaGroup.add(backSection);

    // Left wing
    const leftWing = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.55, 3.8), sofaMat);
    leftWing.position.set(-2.6, 0.3, 0.4);
    leftWing.castShadow = true;
    salaGroup.add(leftWing);

    // Right wing
    const rightWing = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.55, 3.8), sofaMat);
    rightWing.position.set(2.6, 0.3, 0.4);
    rightWing.castShadow = true;
    salaGroup.add(rightWing);

    // Soft cushions
    for (let i = -2; i <= 2; i++) {
      const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.16, 0.8), seatMat);
      cushion.position.set(i * 1.1, 0.65, 2.1);
      salaGroup.add(cushion);
    }

    // Glass Coffee Table
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.8 });
    const coffeeTable = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.35, 24), tableMat);
    coffeeTable.position.set(0, 0.2, 0.3);
    coffeeTable.castShadow = true;
    salaGroup.add(coffeeTable);

    // Giant Wall OLED TV with procedural broadcast canvas
    this.tvCanvas = document.createElement('canvas');
    this.tvCanvas.width = 512;
    this.tvCanvas.height = 288;
    this.tvTexture = new THREE.CanvasTexture(this.tvCanvas);
    this.tvTexture.colorSpace = THREE.SRGBColorSpace;

    const tvGeo = new THREE.BoxGeometry(4.2, 2.3, 0.1);
    const tvFrameMat = new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 0.9, roughness: 0.2 });
    const tvScreenMat = new THREE.MeshBasicMaterial({ map: this.tvTexture });
    const tvFrame = new THREE.Mesh(tvGeo, [tvFrameMat, tvFrameMat, tvFrameMat, tvFrameMat, tvScreenMat, tvFrameMat]);
    tvFrame.position.set(0, 2.2, -4.8);
    this.tvScreenMesh = tvFrame;
    salaGroup.add(tvFrame);

    this.scene.add(salaGroup);
  }

  private buildKitchenVIPProps(): void {
    const vip = REALITY_ROOMS['cozinha-vip'];
    const group = new THREE.Group();
    group.position.set(vip.x, 0, vip.z);

    // Golden Marble Island
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.2, metalness: 0.3 });
    const island = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.05, 1.8), marbleMat);
    island.position.set(0, 0.52, 0);
    island.castShadow = true;
    island.receiveShadow = true;
    group.add(island);

    // Stainless Refrigerator (Double door)
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.25, metalness: 0.85 });
    const fridge = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.4, 1.1), steelMat);
    fridge.position.set(2.8, 1.2, 2.6);
    fridge.castShadow = true;
    group.add(fridge);

    // High bar stools
    const stoolMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 });
    for (let i = -1.5; i <= 1.5; i += 1.5) {
      const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.75, 16), stoolMat);
      stool.position.set(i, 0.38, -1.3);
      stool.castShadow = true;
      group.add(stool);
    }

    this.scene.add(group);
  }

  private buildKitchenXepaProps(): void {
    const xepa = REALITY_ROOMS['cozinha-xepa'];
    const group = new THREE.Group();
    group.position.set(xepa.x, 0, xepa.z);

    // Rustic Wood Table
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x573a21, roughness: 0.85, metalness: 0.05 });
    const table = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.95, 1.8), woodMat);
    table.position.set(0, 0.48, 0);
    table.castShadow = true;
    group.add(table);

    // Wooden benches
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x45250e, roughness: 0.9 });
    const bench1 = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.48, 0.5), benchMat);
    bench1.position.set(0, 0.24, -1.3);
    group.add(bench1);

    const bench2 = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.48, 0.5), benchMat);
    bench2.position.set(0, 0.24, 1.3);
    group.add(bench2);

    this.scene.add(group);
  }

  private buildPoolGardenProps(): void {
    const garden = REALITY_ROOMS['piscina-jardim'];
    const group = new THREE.Group();
    group.position.set(garden.x, 0, garden.z);

    // Pool Basin
    const basinMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.2 });
    const basin = new THREE.Mesh(new THREE.BoxGeometry(11, 0.4, 6.5), basinMat);
    basin.position.set(0, 0.1, 0);
    basin.receiveShadow = true;
    group.add(basin);

    // Animated Translucent Water Surface
    const waterGeo = new THREE.PlaneGeometry(10.6, 6.1, 32, 32);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.15,
      metalness: 0.6,
      transparent: true,
      opacity: 0.82,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, 0.28, 0);
    this.waterMesh = water;
    group.add(water);

    // Sun Loungers (Espreguiçadeiras)
    const loungerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    for (let i = -3.5; i <= 3.5; i += 2.2) {
      const lounger = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 1.8), loungerMat);
      lounger.position.set(i, 0.18, 4.2);
      lounger.castShadow = true;
      group.add(lounger);
    }

    // High Garden Perimeter Privacy Wall
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const wall = new THREE.Mesh(new THREE.BoxGeometry(24, 3.8, 0.3), fenceMat);
    wall.position.set(0, 1.9, -6.5);
    wall.castShadow = true;
    group.add(wall);

    this.scene.add(group);
  }

  private buildConfessionRoomProps(): void {
    const conf = REALITY_ROOMS['confessionario'];
    const group = new THREE.Group();
    group.position.set(conf.x, 0, conf.z);

    // Iconic Red Armchair
    const velvetRedMat = new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.6, metalness: 0.1 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.25, metalness: 0.85 });

    // Seat base
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 1.1), velvetRedMat);
    seat.position.set(0, 0.35, 0);
    seat.castShadow = true;
    group.add(seat);

    // Curved High Backrest
    const backrest = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.5, 0.3), velvetRedMat);
    backrest.position.set(0, 1.1, -0.45);
    backrest.castShadow = true;
    group.add(backrest);

    // Gold Trim Base
    const goldBase = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.1, 24), goldMat);
    goldBase.position.set(0, 0.05, 0);
    group.add(goldBase);

    // Spotlight Cone Light Accent
    const redLight = new THREE.PointLight(0xf43f5e, 2.5, 6, 1.5);
    redLight.position.set(0, 2.8, 0.2);
    group.add(redLight);

    this.scene.add(group);
  }

  private buildGymProps(): void {
    const gym = REALITY_ROOMS['academia'];
    const group = new THREE.Group();
    group.position.set(gym.x, 0, gym.z);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.3, metalness: 0.7 });
    const padMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });

    // Treadmills (Esteiras)
    for (let i = -1.2; i <= 1.2; i += 2.4) {
      const treadmill = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.25, 2.1), padMat);
      treadmill.position.set(i, 0.15, 0.6);
      treadmill.castShadow = true;
      group.add(treadmill);

      const consolePost = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.1, 0.1), metalMat);
      consolePost.position.set(i, 0.7, -0.3);
      group.add(consolePost);
    }

    // Dumbbell Rack
    const rack = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 0.6), metalMat);
    rack.position.set(0, 0.45, -2.6);
    rack.castShadow = true;
    group.add(rack);

    this.scene.add(group);
  }

  private buildBedroomProps(): void {
    // Quarto Selva Beds
    const selva = REALITY_ROOMS['quarto-selva'];
    const selvaGroup = new THREE.Group();
    selvaGroup.position.set(selva.x, 0, selva.z);
    const selvaBedMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });

    [-2.2, 2.2].forEach((x) => {
      const bed = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.55, 2.4), selvaBedMat);
      bed.position.set(x, 0.3, 0);
      bed.castShadow = true;
      selvaGroup.add(bed);
    });
    this.scene.add(selvaGroup);

    // Quarto Oceano Beds
    const oceano = REALITY_ROOMS['quarto-oceano'];
    const oceanoGroup = new THREE.Group();
    oceanoGroup.position.set(oceano.x, 0, oceano.z);
    const oceanoBedMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6 });

    [-2.2, 2.2].forEach((x) => {
      const bed = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.55, 2.4), oceanoBedMat);
      bed.position.set(x, 0.3, 0);
      bed.castShadow = true;
      oceanoGroup.add(bed);
    });
    this.scene.add(oceanoGroup);
  }

  public setCameraPreset(presetId: string): void {
    const preset = CAMERA_PRESETS.find((p) => p.id === presetId) || CAMERA_PRESETS[0];
    this.activePreset = preset;
    this.targetCameraPos.set(...preset.position);
    this.targetLookAt.set(...preset.target);
    this.camera.fov = preset.fov;
    this.camera.updateProjectionMatrix();
  }

  public syncCast(cast: Participant[]): void {
    this.characterManager.syncCast(cast);
  }

  public updateTimePhase(phase: DayPhase): void {
    this.lightingManager.updatePhase(phase, this.scene);
  }

  private updateTVCanvas(elapsed: number): void {
    if (!this.tvCanvas || !this.tvTexture) return;
    const ctx = this.tvCanvas.getContext('2d')!;

    // Animated broadcast test pattern
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 288);

    // Broadcast color bars
    const bars = ['#ffffff', '#facc15', '#06b6d4', '#10b981', '#f43f5e', '#2563eb', '#000000'];
    const barW = 512 / bars.length;
    bars.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(i * barW, 0, barW, 190);
    });

    // Lower third ticker
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 190, 512, 98);

    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('● AO VIVO', 20, 230);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('DIRETOR DO REALITY · EDIÇÃO 24H', 150, 230);

    // Clock
    const timecode = `SMPTE ${Math.floor(elapsed % 60).toString().padStart(2, '0')}:${Math.floor((elapsed * 30) % 30).toString().padStart(2, '0')}`;
    ctx.fillStyle = '#38bdf8';
    ctx.font = '16px monospace';
    ctx.fillText(timecode, 20, 265);

    this.tvTexture.needsUpdate = true;
  }

  private tick(): void {
    if (this.isDestroyed) return;

    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    // 1. Smooth Camera Damping to target
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, this.targetCameraPos.x, 4, delta);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, this.targetCameraPos.y, 4, delta);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, this.targetCameraPos.z, 4, delta);

    this.currentCameraTarget.x = THREE.MathUtils.damp(this.currentCameraTarget.x, this.targetLookAt.x, 5, delta);
    this.currentCameraTarget.y = THREE.MathUtils.damp(this.currentCameraTarget.y, this.targetLookAt.y, 5, delta);
    this.currentCameraTarget.z = THREE.MathUtils.damp(this.currentCameraTarget.z, this.targetLookAt.z, 5, delta);
    this.camera.lookAt(this.currentCameraTarget);

    // 2. Water surface wave simulation
    if (this.waterMesh) {
      const pos = this.waterMesh.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i);
        const v = pos.getY(i);
        const z = Math.sin(u * 1.5 + elapsed * 2.8) * 0.04 + Math.cos(v * 1.5 + elapsed * 2.2) * 0.04;
        pos.setZ(i, z);
      }
      pos.needsUpdate = true;
    }

    // 3. Update TV screen
    if (Math.floor(elapsed * 10) % 2 === 0) {
      this.updateTVCanvas(elapsed);
    }

    // 4. Update Party lights and character animations
    this.lightingManager.tickPartyAnimation(elapsed);
    this.characterManager.update(delta, elapsed);

    // 5. Render frame
    this.renderer.render(this.scene, this.camera);

    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  private bindEvents(): void {
    const handleResize = () => {
      if (!this.container || this.isDestroyed) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      this.camera.aspect = width / Math.max(height, 1);
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    const handleClick = (e: MouseEvent) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.pointer, this.camera);
      const participantId = this.characterManager.getIntersectedParticipantId(this.raycaster);
      if (participantId && this.onSelectParticipant) {
        this.onSelectParticipant(participantId);
      }
    };

    this.renderer.domElement.addEventListener('click', handleClick);
  }

  public dispose(): void {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animationFrameId);
    this.characterManager.dispose();
    this.lightingManager.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
