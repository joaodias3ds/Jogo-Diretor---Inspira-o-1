/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { Participant, RealityRoomId } from '@/engine/housemates/types';
import { REALITY_ROOMS } from './roomData';

export interface CharacterMeshNode {
  participantId: string;
  group: THREE.Group;
  head: THREE.Mesh;
  body: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  nametagSprite: THREE.Sprite;
  currentRoom: RealityRoomId;
  targetPos: THREE.Vector3;
  currentPos: THREE.Vector3;
  isMoving: boolean;
  walkCycle: number;
  sitting: boolean;
  baseColor: number;
}

/**
 * Procedural nametag texture generator on HTML5 Canvas
 */
function createNametagCanvasTexture(nickname: string, isVIP: boolean, isLeader: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 72;
  const ctx = canvas.getContext('2d')!;

  // Background card
  ctx.fillStyle = isVIP ? 'rgba(217, 119, 6, 0.88)' : 'rgba(15, 23, 42, 0.88)';
  ctx.strokeStyle = isLeader ? '#facc15' : isVIP ? '#fde68a' : '#38bdf8';
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.roundRect(4, 4, 248, 64, 12);
  ctx.fill();
  ctx.stroke();

  // Name text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(nickname.toUpperCase(), 128, 30);

  // Status badge subtext
  ctx.fillStyle = isLeader ? '#fef08a' : isVIP ? '#fed7aa' : '#bae6fd';
  ctx.font = 'bold 16px sans-serif';
  const tag = isLeader ? '★ LÍDER' : isVIP ? 'VIP' : 'XEPA';
  ctx.fillText(tag, 128, 54);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export class Character3DManager {
  public characters = new Map<string, CharacterMeshNode>();
  private sharedHeadGeo = new THREE.SphereGeometry(0.24, 16, 14);
  private sharedHairGeo = new THREE.BoxGeometry(0.5, 0.16, 0.5);
  private sharedTorsoGeo = new THREE.BoxGeometry(0.48, 0.65, 0.32);
  private sharedLimbGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.55, 10);
  private sharedPantsGeo = new THREE.BoxGeometry(0.46, 0.65, 0.3);

  constructor(private scene: THREE.Scene) {}

  public syncCast(cast: Participant[]): void {
    const activeParticipants = cast.filter((p) => !p.isEliminated);
    const activeIds = new Set(activeParticipants.map((p) => p.id));

    // Remove eliminated
    for (const [id, node] of this.characters.entries()) {
      if (!activeIds.has(id)) {
        this.scene.remove(node.group);
        node.nametagSprite.material.dispose();
        this.characters.delete(id);
      }
    }

    // Add or update active participants
    activeParticipants.forEach((p, idx) => {
      let node = this.characters.get(p.id);
      if (!node) {
        node = this.createCharacterModel(p, idx);
        this.characters.set(p.id, node);
        this.scene.add(node.group);
      } else {
        // Check if room changed
        if (node.currentRoom !== p.currentRoom) {
          node.currentRoom = p.currentRoom;
          const room = REALITY_ROOMS[p.currentRoom] || REALITY_ROOMS['sala-estar'];
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * (Math.min(room.width, room.depth) * 0.35);
          node.targetPos.set(room.x + Math.cos(angle) * dist, 0, room.z + Math.sin(angle) * dist);
          node.isMoving = true;
        }
      }
    });
  }

  private createCharacterModel(p: Participant, index: number): CharacterMeshNode {
    const group = new THREE.Group();
    group.name = `character-${p.id}`;

    // Color derivation from avatarColor
    let baseHex = 0x06b6d4;
    if (p.avatarColor.includes('rose') || p.avatarColor.includes('red')) baseHex = 0xf43f5e;
    else if (p.avatarColor.includes('amber') || p.avatarColor.includes('yellow')) baseHex = 0xf59e0b;
    else if (p.avatarColor.includes('emerald') || p.avatarColor.includes('green')) baseHex = 0x10b981;
    else if (p.avatarColor.includes('purple') || p.avatarColor.includes('violet')) baseHex = 0x8b5cf6;
    else if (p.avatarColor.includes('indigo') || p.avatarColor.includes('blue')) baseHex = 0x3b82f6;

    // Materials with varied roughness and metalness
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xfbcfe8,
      roughness: 0.8,
      metalness: 0.05,
    });
    const shirtMat = new THREE.MeshStandardMaterial({
      color: p.isVIP ? 0xd97706 : baseHex,
      roughness: 0.5,
      metalness: 0.15,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: index % 3 === 0 ? 0x1e1b4b : index % 3 === 1 ? 0x451a03 : 0x713f12,
      roughness: 0.9,
    });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
    });
    const shoeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
      metalness: 0.2,
    });

    // Torso (center pivot)
    const body = new THREE.Mesh(this.sharedTorsoGeo, shirtMat);
    body.position.y = 1.05;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Head
    const head = new THREE.Mesh(this.sharedHeadGeo, skinMat);
    head.position.y = 1.62;
    head.castShadow = true;
    group.add(head);

    // Hair cap
    const hair = new THREE.Mesh(this.sharedHairGeo, hairMat);
    hair.position.y = 1.78;
    head.add(hair);

    // Arms
    const leftArm = new THREE.Mesh(this.sharedLimbGeo, shirtMat);
    leftArm.position.set(-0.34, 1.05, 0);
    leftArm.castShadow = true;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(this.sharedLimbGeo, shirtMat);
    rightArm.position.set(0.34, 1.05, 0);
    rightArm.castShadow = true;
    group.add(rightArm);

    // Legs
    const leftLeg = new THREE.Mesh(this.sharedLimbGeo, pantsMat);
    leftLeg.position.set(-0.15, 0.45, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(this.sharedLimbGeo, pantsMat);
    rightLeg.position.set(0.15, 0.45, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    // Shoes
    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.26), shoeMat);
    leftShoe.position.set(-0.15, 0.08, 0.04);
    group.add(leftShoe);

    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.26), shoeMat);
    rightShoe.position.set(0.15, 0.08, 0.04);
    group.add(rightShoe);

    // Contact shadow beneath feet
    const shadowGeo = new THREE.PlaneGeometry(0.8, 0.8);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    group.add(shadow);

    // Nametag Sprite
    const nametagTex = createNametagCanvasTexture(p.nickname, p.isVIP, p.isLeader);
    const spriteMat = new THREE.SpriteMaterial({ map: nametagTex, transparent: true });
    const nametagSprite = new THREE.Sprite(spriteMat);
    nametagSprite.position.y = 2.15;
    nametagSprite.scale.set(1.4, 0.4, 1);
    group.add(nametagSprite);

    // Initial placement in room
    const room = REALITY_ROOMS[p.currentRoom] || REALITY_ROOMS['sala-estar'];
    const angle = (index / 20) * Math.PI * 2;
    const dist = (index % 4) * 0.9 + 0.8;
    const startX = room.x + Math.cos(angle) * dist;
    const startZ = room.z + Math.sin(angle) * dist;

    group.position.set(startX, 0, startZ);
    group.userData = { participantId: p.id };

    return {
      participantId: p.id,
      group,
      head,
      body,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      nametagSprite,
      currentRoom: p.currentRoom,
      targetPos: new THREE.Vector3(startX, 0, startZ),
      currentPos: new THREE.Vector3(startX, 0, startZ),
      isMoving: false,
      walkCycle: Math.random() * Math.PI * 2,
      sitting: false,
      baseColor: baseHex,
    };
  }

  public update(delta: number, elapsedTime: number): void {
    for (const node of this.characters.values()) {
      node.walkCycle += delta * 6;

      if (node.isMoving) {
        // Move towards target
        const dir = new THREE.Vector3().subVectors(node.targetPos, node.group.position);
        dir.y = 0;
        const dist = dir.length();

        if (dist > 0.15) {
          dir.normalize();
          node.group.position.addScaledVector(dir, delta * 2.2);
          node.group.rotation.y = Math.atan2(dir.x, dir.z);

          // Walking limb swings
          const swing = Math.sin(node.walkCycle) * 0.45;
          node.leftArm.rotation.x = swing;
          node.rightArm.rotation.x = -swing;
          node.leftLeg.rotation.x = -swing;
          node.rightLeg.rotation.x = swing;

          // Bobbing
          node.group.position.y = Math.abs(Math.sin(node.walkCycle * 2)) * 0.08;
        } else {
          node.isMoving = false;
          node.leftArm.rotation.x = 0;
          node.rightArm.rotation.x = 0;
          node.leftLeg.rotation.x = 0;
          node.rightLeg.rotation.x = 0;
          node.group.position.y = 0;
        }
      } else {
        // Idle breathing and slight gesture
        const breath = Math.sin(elapsedTime * 2 + node.group.position.x) * 0.03;
        node.body.scale.set(1 + breath * 0.5, 1 + breath, 1 + breath * 0.5);
        node.head.rotation.y = Math.sin(elapsedTime * 1.2 + node.group.position.z) * 0.15;
      }
    }
  }

  public getIntersectedParticipantId(raycaster: THREE.Raycaster): string | null {
    const meshes: THREE.Object3D[] = [];
    for (const node of this.characters.values()) {
      meshes.push(node.body);
      meshes.push(node.head);
    }

    const hits = raycaster.intersectObjects(meshes, false);
    if (hits.length > 0) {
      let current: THREE.Object3D | null = hits[0].object;
      while (current && !current.userData.participantId) {
        current = current.parent;
      }
      return current?.userData.participantId || null;
    }
    return null;
  }

  public dispose(): void {
    for (const node of this.characters.values()) {
      this.scene.remove(node.group);
      node.nametagSprite.material.dispose();
    }
    this.characters.clear();
    this.sharedHeadGeo.dispose();
    this.sharedHairGeo.dispose();
    this.sharedTorsoGeo.dispose();
    this.sharedLimbGeo.dispose();
    this.sharedPantsGeo.dispose();
  }
}
