/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Dexie, { Table } from 'dexie';
import { SeasonConfig } from '@/engine/season/seasonConfig';
import { Participant } from '@/engine/housemates/types';
import { TimeState } from '@/engine/time/gameClock';

export interface SavedSeasonRecord {
  id: string;
  config: SeasonConfig;
  time: TimeState;
  cash: number;
  ibope: number;
  reputation: number;
  authority: number;
  createdAt: number;
  updatedAt: number;
}

export interface SavedHousemateRecord {
  id: string;
  seasonId: string;
  data: Participant;
}

export interface SaveSlotRecord {
  slotId: string;
  seasonId: string;
  title: string;
  summary: string;
  timestamp: number;
}

export class RealityDirectorDB extends Dexie {
  seasons!: Table<SavedSeasonRecord, string>;
  housemates!: Table<SavedHousemateRecord, string>;
  saveSlots!: Table<SaveSlotRecord, string>;

  constructor() {
    super('RealityDirectorDB');
    this.version(1).stores({
      seasons: 'id, config.programName, config.mode, time.day, time.week, updatedAt',
      housemates: 'id, seasonId, data.name, data.nickname, data.isEliminated',
      saveSlots: 'slotId, seasonId, timestamp',
    });
  }
}

export const db = new RealityDirectorDB();
