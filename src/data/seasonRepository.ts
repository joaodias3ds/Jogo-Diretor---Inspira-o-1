/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db, SavedSeasonRecord } from './db';
import { SeasonConfig } from '@/engine/season/seasonConfig';
import { Participant } from '@/engine/housemates/types';
import { TimeState } from '@/engine/time/gameClock';

export interface SeasonSaveData {
  season: SavedSeasonRecord;
  cast: Participant[];
}

export interface ISeasonRepository {
  createSeason(
    config: SeasonConfig,
    initialTime: TimeState,
    initialStats: { cash: number; ibope: number; reputation: number; authority: number },
    cast: Participant[]
  ): Promise<string>;

  saveSeasonState(
    seasonId: string,
    time: TimeState,
    stats: { cash: number; ibope: number; reputation: number; authority: number },
    cast: Participant[]
  ): Promise<void>;

  loadSeason(seasonId: string): Promise<SeasonSaveData | null>;

  listSavedSeasons(): Promise<SavedSeasonRecord[]>;

  deleteSeason(seasonId: string): Promise<void>;

  exportSeasonJson(seasonId: string): Promise<string>;

  importSeasonJson(jsonStr: string): Promise<string>;
}

export class DexieSeasonRepository implements ISeasonRepository {
  async createSeason(
    config: SeasonConfig,
    initialTime: TimeState,
    initialStats: { cash: number; ibope: number; reputation: number; authority: number },
    cast: Participant[]
  ): Promise<string> {
    const now = Date.now();
    const record: SavedSeasonRecord = {
      id: config.id,
      config,
      time: initialTime,
      cash: initialStats.cash,
      ibope: initialStats.ibope,
      reputation: initialStats.reputation,
      authority: initialStats.authority,
      createdAt: now,
      updatedAt: now,
    };

    await db.seasons.put(record);

    // Salva participantes vinculados à temporada
    const housemateRecords = cast.map((p) => ({
      id: `${config.id}_${p.id}`,
      seasonId: config.id,
      data: p,
    }));

    await db.housemates.bulkPut(housemateRecords);
    return config.id;
  }

  async saveSeasonState(
    seasonId: string,
    time: TimeState,
    stats: { cash: number; ibope: number; reputation: number; authority: number },
    cast: Participant[]
  ): Promise<void> {
    const existing = await db.seasons.get(seasonId);
    if (!existing) {
      throw new Error(`Temporada com id ${seasonId} não encontrada para salvar.`);
    }

    const updated: SavedSeasonRecord = {
      ...existing,
      time,
      cash: stats.cash,
      ibope: stats.ibope,
      reputation: stats.reputation,
      authority: stats.authority,
      updatedAt: Date.now(),
    };

    await db.seasons.put(updated);

    // Atualiza os participantes no banco
    const housemateRecords = cast.map((p) => ({
      id: `${seasonId}_${p.id}`,
      seasonId,
      data: p,
    }));
    await db.housemates.bulkPut(housemateRecords);
  }

  async loadSeason(seasonId: string): Promise<SeasonSaveData | null> {
    const season = await db.seasons.get(seasonId);
    if (!season) return null;

    const housemateRecords = await db.housemates
      .where('seasonId')
      .equals(seasonId)
      .toArray();

    const cast = housemateRecords.map((r) => r.data);
    return { season, cast };
  }

  async listSavedSeasons(): Promise<SavedSeasonRecord[]> {
    return await db.seasons.orderBy('updatedAt').reverse().toArray();
  }

  async deleteSeason(seasonId: string): Promise<void> {
    await db.seasons.delete(seasonId);
    await db.housemates.where('seasonId').equals(seasonId).delete();
  }

  async exportSeasonJson(seasonId: string): Promise<string> {
    const data = await this.loadSeason(seasonId);
    if (!data) throw new Error('Temporada não encontrada.');
    return JSON.stringify(data, null, 2);
  }

  async importSeasonJson(jsonStr: string): Promise<string> {
    const data: SeasonSaveData = JSON.parse(jsonStr);
    if (!data.season || !data.cast) {
      throw new Error('Arquivo de save inválido.');
    }
    await db.seasons.put(data.season);
    const housemateRecords = data.cast.map((p) => ({
      id: `${data.season.id}_${p.id}`,
      seasonId: data.season.id,
      data: p,
    }));
    await db.housemates.bulkPut(housemateRecords);
    return data.season.id;
  }
}

export const seasonRepository = new DexieSeasonRepository();
