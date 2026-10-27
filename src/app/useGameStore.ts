/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { SeasonConfig, createDefaultSeasonConfig } from '@/engine/season/seasonConfig';
import { TimeState, createInitialTimeState, advanceTimePhase, ScheduledEvent } from '@/engine/time/gameClock';
import { Participant } from '@/engine/housemates/types';
import { INITIAL_CAST } from '@/engine/housemates/defaultCast';
import { simulateCastTick } from '@/engine/housemates/participantSimulator';
import { seasonRepository } from '@/data/seasonRepository';
import { soundFx } from '@/audio/audioManager';
import { BALANCE } from '@/config/balance';

import { CameraPipData } from '@/ui/screens/CameraPipModal';
import { RelationMap, createInitialRelationMatrix } from '@/engine/social/relationMatrix';
import { AllianceGroup, SocialConflict, GossipItem } from '@/engine/social/socialTypes';
import { INITIAL_ALLIANCES, simulateSocialTick } from '@/engine/social/socialSimulator';
import { StaffMember } from '@/engine/staff/staffTypes';
import { INITIAL_STAFF, promoteStaffLevel } from '@/engine/staff/staffEngine';
import { RESERVE_BENCH } from '@/engine/housemates/reserveCandidates';
import { RandomEvent, RandomEventCategory, RandomEventOption } from '@/engine/events/randomEventTypes';
import { generateRandomEvent } from '@/engine/events/randomEventEngine';

interface GameStoreState {
  // Season & Time
  seasonConfig: SeasonConfig;
  time: TimeState;
  cast: Participant[];
  currentEvent: ScheduledEvent | null;
  isSaving: boolean;
  lastSavedAt: number | null;

  // Fase 3: Vida Social & Conflitos
  relationMatrix: RelationMap;
  alliances: AllianceGroup[];
  conflicts: SocialConflict[];
  gossips: GossipItem[];

  // Modais de detalhe e PiP
  selectedParticipantForDetail: Participant | null;
  activeCameraPip: CameraPipData | null;
  isEditorOpen: boolean;
  editingParticipant: Participant | null;

  // Direção & Equipe (Staff) & Escala de Participantes (Roster)
  staffMembers: import('@/engine/staff/staffTypes').StaffMember[];
  reserveBench: Participant[];

  // Eventos Aleatórios Dinâmicos & Modo Deus
  activeRandomEvent: RandomEvent | null;
  godMode: boolean;

  // Director resources
  cash: number;
  ibope: number;
  reputation: number;
  authority: number;

  // Actions
  triggerRandomEventAction: (category?: RandomEventCategory) => RandomEvent;
  resolveRandomEventAction: (optionId: string) => void;
  dismissRandomEventAction: () => void;
  toggleGodMode: () => void;
  initSeason: (config: SeasonConfig, customCast?: Participant[]) => Promise<string>;
  advancePhase: (isRecording?: boolean) => Promise<{ event?: ScheduledEvent }>;
  setSpeed: (speed: 0 | 1 | 2 | 4) => void;
  togglePause: () => void;
  toggleVIP: (participantId: string) => void;
  sendToConfession: (participantId: string) => void;
  simulateConvivenciaTick: (isRecording?: boolean) => void;
  resolveConflict: (conflictId: string, note?: string) => void;
  saveGame: () => Promise<void>;
  loadGame: (seasonId: string) => Promise<boolean>;

  // Roster Actions (Escala de Participantes)
  hireHousemateFromBench: (candidateId: string) => boolean;
  fireHousemateByDirector: (id: string, reason: string) => void;
  substituteHousemateWithReserve: (activeId: string, reserveId: string) => boolean;

  // Staff Actions (Equipe da Emissora)
  hireStaffMember: (id: string) => boolean;
  fireStaffMember: (id: string) => void;
  promoteStaffMember: (id: string) => boolean;

  openParticipantDetail: (participant: Participant) => void;
  closeParticipantDetail: () => void;
  openCameraPip: (camera: CameraPipData) => void;
  closeCameraPip: () => void;
  openEditor: (participant?: Participant | null) => void;
  closeEditor: () => void;
  addOrUpdateParticipant: (participant: Participant) => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  seasonConfig: createDefaultSeasonConfig('house'),
  time: createInitialTimeState(),
  cast: INITIAL_CAST,
  currentEvent: null,
  isSaving: false,
  lastSavedAt: null,

  // Fase 3: Vida Social & Conflitos
  relationMatrix: createInitialRelationMatrix(INITIAL_CAST),
  alliances: INITIAL_ALLIANCES,
  conflicts: [],
  gossips: [],

  selectedParticipantForDetail: null,
  activeCameraPip: null,
  isEditorOpen: false,
  editingParticipant: null,

  staffMembers: INITIAL_STAFF,
  reserveBench: RESERVE_BENCH,
  activeRandomEvent: null,
  godMode: false,

  cash: BALANCE.director.initialCash,
  ibope: BALANCE.director.initialIbope,
  reputation: BALANCE.director.initialReputation,
  authority: BALANCE.director.initialAuthority,

  initSeason: async (config: SeasonConfig, customCast?: Participant[]) => {
    const time = createInitialTimeState();
    const cast = customCast || INITIAL_CAST;
    const initialStats = {
      cash: config.initialCash,
      ibope: BALANCE.director.initialIbope,
      reputation: BALANCE.director.initialReputation,
      authority: BALANCE.director.initialAuthority,
    };

    set({
      seasonConfig: config,
      time,
      cast,
      relationMatrix: createInitialRelationMatrix(cast),
      alliances: INITIAL_ALLIANCES,
      conflicts: [],
      gossips: [],
      currentEvent: null,
      cash: initialStats.cash,
      ibope: initialStats.ibope,
      reputation: initialStats.reputation,
      authority: initialStats.authority,
    });

    try {
      const seasonId = await seasonRepository.createSeason(config, time, initialStats, cast);
      set({ lastSavedAt: Date.now() });
      return seasonId;
    } catch (err) {
      console.warn('Persistência offline:', err);
      return config.id;
    }
  },

  advancePhase: async (isRecording: boolean = false) => {
    const { time, cast, ibope, cash, seasonConfig, relationMatrix, alliances, conflicts, gossips } = get();
    soundFx.playCameraSwitch();

    // 1. Avança o relógio
    const { nextTime, dayAdvanced, scheduledEvent } = advanceTimePhase(time);

    // 2. Simula os participantes na nova fase (Utility AI)
    const baseUpdatedCast = simulateCastTick(cast, nextTime.phase, isRecording);

    // 3. Simula dinâmicas sociais (relações, alianças, tretas, fofocas e decaimento de memórias)
    const socialTick = simulateSocialTick(
      baseUpdatedCast,
      relationMatrix,
      alliances,
      nextTime.day,
      nextTime.phase
    );

    // 4. Ajuste de IBOPE e custos diários
    let nextIbope = ibope;
    let nextCash = cash;

    const ibopeShift = parseFloat((Math.random() * 2.4 - 1.0).toFixed(1));
    nextIbope = Math.max(BALANCE.director.minIbope, Math.min(BALANCE.director.maxIbope, ibope + ibopeShift));

    if (dayAdvanced) {
      nextCash = Math.max(0, cash - BALANCE.director.dailyOperatingCost);
    }

    if (scheduledEvent?.isAutoPause) {
      soundFx.playOnAirChime();
    }

    const updatedConflicts = [...socialTick.newConflicts, ...conflicts].slice(0, 30);
    const updatedGossips = [...socialTick.newGossips, ...gossips].slice(0, 20);

    // Disparo dinâmico de evento aleatório (conflito, romance ou desafio surpresa)
    let dynamicRandomEvent = get().activeRandomEvent;
    if (Math.random() < 0.38 && !dynamicRandomEvent) {
      dynamicRandomEvent = generateRandomEvent(socialTick.updatedCast);
    }

    set({
      time: nextTime,
      cast: socialTick.updatedCast,
      relationMatrix: socialTick.updatedMatrix,
      alliances: socialTick.updatedAlliances,
      conflicts: updatedConflicts,
      gossips: updatedGossips,
      currentEvent: scheduledEvent || null,
      activeRandomEvent: dynamicRandomEvent,
      ibope: nextIbope,
      cash: nextCash,
    });

    // 5. Autosave assíncrono no Dexie
    try {
      await seasonRepository.saveSeasonState(
        seasonConfig.id,
        nextTime,
        {
          cash: nextCash,
          ibope: nextIbope,
          reputation: get().reputation,
          authority: get().authority,
        },
        socialTick.updatedCast
      );
      set({ lastSavedAt: Date.now() });
    } catch (err) {
      console.warn('Autosave skipped:', err);
    }

    return { event: scheduledEvent };
  },

  setSpeed: (speed) => {
    soundFx.playClick();
    set((state) => ({
      time: { ...state.time, speed, isPaused: speed === 0 },
    }));
  },

  togglePause: () => {
    soundFx.playClick();
    set((state) => {
      const isPaused = !state.time.isPaused;
      return {
        time: {
          ...state.time,
          isPaused,
          speed: isPaused ? 0 : 1,
        },
      };
    });
  },

  toggleVIP: (participantId: string) => {
    soundFx.playClick();
    set((state) => ({
      cast: state.cast.map((p) => {
        if (p.id === participantId) {
          const isVIP = !p.isVIP;
          return {
            ...p,
            isVIP,
            deltas: {
              ...p.deltas,
              mood: isVIP ? 5 : -5,
            },
            stats: {
              ...p.stats,
              mood: Math.max(5, Math.min(100, p.stats.mood + (isVIP ? 5 : -5))),
            },
          };
        }
        return p;
      }),
    }));
  },

  sendToConfession: (participantId: string) => {
    soundFx.playCameraSwitch();
    set((state) => ({
      cast: state.cast.map((p) => {
        if (p.id === participantId) {
          return {
            ...p,
            currentActivity: 'No Confessionário desabafando com o Diretor',
            deltas: {
              ...p.deltas,
              popularity: p.deltas.popularity + 2,
            },
            stats: {
              ...p.stats,
              popularity: Math.min(100, p.stats.popularity + 2),
            },
          };
        }
        return p;
      }),
    }));
  },

  simulateConvivenciaTick: (isRecording: boolean = false) => {
    soundFx.playClick();
    set((state) => {
      const updated = simulateCastTick(state.cast, state.time.phase, isRecording);
      const socialTick = simulateSocialTick(
        updated,
        state.relationMatrix,
        state.alliances,
        state.time.day,
        state.time.phase
      );
      return {
        cast: socialTick.updatedCast,
        relationMatrix: socialTick.updatedMatrix,
        alliances: socialTick.updatedAlliances,
        conflicts: [...socialTick.newConflicts, ...state.conflicts].slice(0, 30),
        gossips: [...socialTick.newGossips, ...state.gossips].slice(0, 20),
      };
    });
  },

  resolveConflict: (conflictId: string, note?: string) => {
    soundFx.playOnAirChime();
    set((state) => ({
      conflicts: state.conflicts.map((c) =>
        c.id === conflictId
          ? { ...c, resolved: true, resolutionNote: note || 'Mediação da produção concluída.' }
          : c
      ),
    }));
  },

  saveGame: async () => {
    soundFx.playOnAirChime();
    set({ isSaving: true });
    try {
      const { seasonConfig, time, cash, ibope, reputation, authority, cast } = get();
      await seasonRepository.saveSeasonState(
        seasonConfig.id,
        time,
        { cash, ibope, reputation, authority },
        cast
      );
      set({ isSaving: false, lastSavedAt: Date.now() });
    } catch (err) {
      set({ isSaving: false });
      throw err;
    }
  },

  loadGame: async (seasonId: string) => {
    soundFx.playCameraSwitch();
    try {
      const data = await seasonRepository.loadSeason(seasonId);
      if (!data) return false;

      set({
        seasonConfig: data.season.config,
        time: data.season.time,
        cash: data.season.cash,
        ibope: data.season.ibope,
        reputation: data.season.reputation,
        authority: data.season.authority,
        cast: data.cast.length > 0 ? data.cast : INITIAL_CAST,
        lastSavedAt: data.season.updatedAt,
      });
      return true;
    } catch {
      return false;
    }
  },

  openParticipantDetail: (participant: Participant) => {
    soundFx.playCameraSwitch();
    set({ selectedParticipantForDetail: participant });
  },

  closeParticipantDetail: () => {
    soundFx.playClick();
    set({ selectedParticipantForDetail: null });
  },

  openCameraPip: (camera: CameraPipData) => {
    soundFx.playCameraSwitch();
    set({ activeCameraPip: camera });
  },

  closeCameraPip: () => {
    soundFx.playClick();
    set({ activeCameraPip: null });
  },

  hireHousemateFromBench: (candidateId: string) => {
    const { reserveBench, cash, cast, ibope } = get();
    const candidate = reserveBench.find((c) => c.id === candidateId);
    if (!candidate) return false;

    const cacheCost = (candidate.weeklySalary || 12000) * 2;
    if (cash < cacheCost) {
      soundFx.playWarning();
      return false;
    }

    soundFx.playOnAirChime();
    const charisma = candidate.charisma ?? 70;
    const controversy = candidate.controversy ?? 50;
    const ibopeBonus = parseFloat(((charisma * 0.02) + (controversy * 0.015)).toFixed(1));

    set({
      cash: cash - cacheCost,
      ibope: Math.min(55, ibope + ibopeBonus),
      cast: [candidate, ...cast],
      reserveBench: reserveBench.filter((c) => c.id !== candidateId),
    });
    return true;
  },

  fireHousemateByDirector: (id: string, reason: string) => {
    soundFx.playWarning();
    const { cast, ibope, authority, conflicts } = get();
    const target = cast.find((p) => p.id === id);
    if (!target) return;

    const updatedCast = cast.map((p) =>
      p.id === id ? { ...p, isEliminated: true, eliminationWeek: 1 } : p
    );

    // Efeito na audiência: se o participante era polêmico, a expulsão gera pico de audiência imediato!
    const controversy = target.controversy ?? 50;
    const buzzIbope = controversy >= 70 ? 2.5 : 0.8;

    set({
      cast: updatedCast,
      ibope: Math.min(55, ibope + buzzIbope),
      authority: Math.max(10, authority - 5), // Decisão pesada da direção gasta autoridade
    });
  },

  substituteHousemateWithReserve: (activeId: string, reserveId: string) => {
    const { cast, reserveBench, cash, ibope } = get();
    const active = cast.find((p) => p.id === activeId);
    const reserve = reserveBench.find((r) => r.id === reserveId);
    if (!active || !reserve) return false;

    const subCost = 15000;
    if (cash < subCost) {
      soundFx.playWarning();
      return false;
    }

    soundFx.playOnAirChime();
    // Marca o ativo como eliminado / substituído
    const updatedCast = cast.map((p) =>
      p.id === activeId ? { ...p, isEliminated: true } : p
    );

    // Adiciona o reserva ao elenco ativo
    const finalCast = [reserve, ...updatedCast];
    const newReserveBench = [
      ...reserveBench.filter((r) => r.id !== reserveId),
      { ...active, isEliminated: false, id: `quarantine-${active.id}` },
    ];

    set({
      cash: cash - subCost,
      ibope: Math.min(55, ibope + 1.8), // A entrada de um substituto dá um choque de interesse
      cast: finalCast,
      reserveBench: newReserveBench,
    });
    return true;
  },

  hireStaffMember: (id: string) => {
    const { staffMembers, cash, authority } = get();
    const member = staffMembers.find((s) => s.id === id);
    if (!member || member.hired) return false;

    if (cash < member.weeklySalary) {
      soundFx.playWarning();
      return false;
    }

    soundFx.playOnAirChime();
    set({
      cash: cash - member.weeklySalary,
      staffMembers: staffMembers.map((s) => (s.id === id ? { ...s, hired: true } : s)),
      authority: Math.min(100, authority + 4),
    });
    return true;
  },

  fireStaffMember: (id: string) => {
    soundFx.playClick();
    const { staffMembers } = get();
    set({
      staffMembers: staffMembers.map((s) => (s.id === id ? { ...s, hired: false } : s)),
    });
  },

  promoteStaffMember: (id: string) => {
    const { staffMembers, cash } = get();
    const member = staffMembers.find((s) => s.id === id);
    if (!member || !member.hired || member.level === 'Estrela') return false;

    if (cash < member.upgradeCost) {
      soundFx.playWarning();
      return false;
    }

    soundFx.playOnAirChime();
    const nextLevel = promoteStaffLevel(member.level);
    set({
      cash: cash - member.upgradeCost,
      staffMembers: staffMembers.map((s) =>
        s.id === id
          ? {
              ...s,
              level: nextLevel,
              weeklySalary: Math.round(s.weeklySalary * 1.3),
              upgradeCost: Math.round(s.upgradeCost * 1.5),
            }
          : s
      ),
    });
    return true;
  },

  triggerRandomEventAction: (category?: RandomEventCategory) => {
    const { cast } = get();
    const event = generateRandomEvent(cast, category);
    soundFx.playOnAirChime();
    set({ activeRandomEvent: event });
    return event;
  },

  resolveRandomEventAction: (optionId: string) => {
    const { activeRandomEvent, cash, ibope, authority, reputation, godMode } = get();
    if (!activeRandomEvent) return;

    const chosenOption = activeRandomEvent.options.find((o) => o.id === optionId) || activeRandomEvent.options[0];
    soundFx.playClick();

    const newCash = godMode ? cash : Math.max(0, cash + chosenOption.cashDelta);
    const newIbope = Math.min(55, Math.max(8, ibope + chosenOption.ibopeDelta));
    const newAuthority = godMode ? 100 : Math.min(100, Math.max(10, authority + chosenOption.authorityDelta));
    const newReputation = Math.min(100, Math.max(10, reputation + chosenOption.reputationDelta));

    set({
      activeRandomEvent: null,
      cash: newCash,
      ibope: newIbope,
      authority: newAuthority,
      reputation: newReputation,
    });
  },

  dismissRandomEventAction: () => {
    soundFx.playClick();
    set({ activeRandomEvent: null });
  },

  toggleGodMode: () => {
    soundFx.playOnAirChime();
    const next = !get().godMode;
    set({
      godMode: next,
      cash: next ? 999999999 : 250000,
      authority: 100,
      reputation: 100,
    });
  },

  openEditor: (participant: Participant | null = null) => {
    soundFx.playClick();
    set({ isEditorOpen: true, editingParticipant: participant });
  },

  closeEditor: () => {
    soundFx.playClick();
    set({ isEditorOpen: false, editingParticipant: null });
  },

  addOrUpdateParticipant: (participant: Participant) => {
    soundFx.playOnAirChime();
    set((state) => {
      const exists = state.cast.some((p) => p.id === participant.id);
      let updatedCast: Participant[];
      if (exists) {
        updatedCast = state.cast.map((p) => (p.id === participant.id ? participant : p));
      } else {
        updatedCast = [participant, ...state.cast];
      }
      return { cast: updatedCast, isEditorOpen: false, editingParticipant: null };
    });
  },
}));
