/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Participant } from '../housemates/types';
import { RelationshipData, RelationshipType } from './socialTypes';

export type RelationMap = Record<string, Record<string, RelationshipData>>;

export function getRelationKey(idA: string, idB: string): string {
  return `${idA}->${idB}`;
}

export function determineRelationshipType(
  affinity: number,
  trust: number,
  attraction: number,
  rivalry: number
): RelationshipType {
  if (attraction >= 65 && affinity > 20) return 'romance';
  if (rivalry >= 60 || affinity <= -40) return 'rival';
  if (affinity <= -15) return 'desafeto';
  if (affinity >= 50 && trust >= 50) return 'aliado';
  if (affinity >= 30) return 'amigo';
  return 'neutro';
}

export function createInitialRelationMatrix(cast: Participant[]): RelationMap {
  const map: RelationMap = {};

  for (const pA of cast) {
    map[pA.id] = {};
    for (const pB of cast) {
      if (pA.id === pB.id) continue;

      // Afinidade inicial baseada em traços e semelhanças
      let initialAffinity = 0;
      let initialTrust = 40;
      let initialRespect = 50;
      let initialAttraction = 0;
      let initialRivalry = 10;

      // Bônus se forem da mesma região
      if (pA.hometown.split('-')[1]?.trim() === pB.hometown.split('-')[1]?.trim()) {
        initialAffinity += 15;
      }

      // Temperamentos compatíveis
      if (
        (pA.temperament === 'Carismático' && pB.temperament === 'Carismático') ||
        (pA.temperament === 'Leal' && pB.temperament === 'Leal')
      ) {
        initialAffinity += 20;
        initialTrust += 20;
      }

      // Conflito natural: Explosivo vs Explosivo ou Estrategista vs Estrategista
      if (pA.temperament === 'Explosivo' && pB.temperament === 'Explosivo') {
        initialAffinity -= 20;
        initialRivalry += 35;
      }
      if (pA.temperament === 'Estrategista' && pB.temperament === 'Estrategista') {
        initialRespect += 25;
        initialRivalry += 20;
      }

      // Amabilidade eleva afinidade mútua
      const avgAgreeableness = (pA.bigFive.agreeableness + pB.bigFive.agreeableness) / 2;
      initialAffinity += Math.round((avgAgreeableness - 50) * 0.4);

      // Flertes em potencial (se tiverem traço romântico ou alta extroversão)
      if (
        (pA.temperament === 'Romântico' || pB.temperament === 'Romântico') &&
        Math.abs(pA.age - pB.age) <= 10
      ) {
        initialAttraction = Math.floor(Math.random() * 45 + 35);
      }

      // Clamping de valores
      initialAffinity = Math.max(-100, Math.min(100, initialAffinity));
      initialTrust = Math.max(0, Math.min(100, initialTrust));
      initialRespect = Math.max(0, Math.min(100, initialRespect));
      initialAttraction = Math.max(0, Math.min(100, initialAttraction));
      initialRivalry = Math.max(0, Math.min(100, initialRivalry));

      const type = determineRelationshipType(
        initialAffinity,
        initialTrust,
        initialAttraction,
        initialRivalry
      );

      map[pA.id][pB.id] = {
        sourceId: pA.id,
        targetId: pB.id,
        affinity: initialAffinity,
        trust: initialTrust,
        respect: initialRespect,
        attraction: initialAttraction,
        rivalry: initialRivalry,
        favorDebt: 0,
        type,
        historySummary: 'Primeiras impressões no confinamento.',
      };
    }
  }

  return map;
}

export function updateRelation(
  matrix: RelationMap,
  sourceId: string,
  targetId: string,
  deltas: {
    affinity?: number;
    trust?: number;
    respect?: number;
    attraction?: number;
    rivalry?: number;
  },
  newSummary?: string
): RelationMap {
  const currentSource = matrix[sourceId] || {};
  const currentRel = currentSource[targetId] || {
    sourceId,
    targetId,
    affinity: 0,
    trust: 40,
    respect: 50,
    attraction: 0,
    rivalry: 10,
    favorDebt: 0,
    type: 'neutro' as RelationshipType,
    historySummary: 'Início de convivência.',
  };

  const newAffinity = Math.max(-100, Math.min(100, currentRel.affinity + (deltas.affinity || 0)));
  const newTrust = Math.max(0, Math.min(100, currentRel.trust + (deltas.trust || 0)));
  const newRespect = Math.max(0, Math.min(100, currentRel.respect + (deltas.respect || 0)));
  const newAttraction = Math.max(0, Math.min(100, currentRel.attraction + (deltas.attraction || 0)));
  const newRivalry = Math.max(0, Math.min(100, currentRel.rivalry + (deltas.rivalry || 0)));

  const newType = determineRelationshipType(newAffinity, newTrust, newAttraction, newRivalry);

  return {
    ...matrix,
    [sourceId]: {
      ...matrix[sourceId],
      [targetId]: {
        ...currentRel,
        affinity: newAffinity,
        trust: newTrust,
        respect: newRespect,
        attraction: newAttraction,
        rivalry: newRivalry,
        type: newType,
        historySummary: newSummary || currentRel.historySummary,
      },
    },
  };
}
