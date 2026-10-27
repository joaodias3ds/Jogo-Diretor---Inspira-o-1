/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { BroadcastState, BroadcastTake, IbopeHistoryPoint, NarrativeTag } from './broadcastTypes';
import { soundFx } from '@/audio/audioManager';
import { RealityRoomId } from '@/engine/housemates/types';
import { REALITY_ROOMS, CAMERA_PRESETS } from '@/engine/three/roomData';

interface BroadcastStoreActions {
  selectPreviewCamera: (camId: string) => void;
  cutToProgram: () => void;
  autoTransition: (durationMs?: number) => void;
  setTBarPosition: (val: number) => void;
  setLowerThird: (title: string, subtitle?: string, show?: boolean) => void;
  toggleLowerThird: () => void;
  recordNarrativeTake: (
    tag: NarrativeTag,
    title: string,
    roomId: RealityRoomId,
    dramaRating?: number
  ) => BroadcastTake;
  tickIbope: (currentIbope: number, tensionBoost?: number) => void;
  tickAudioMeters: () => void;
}

const INITIAL_IBOPE_HISTORY: IbopeHistoryPoint[] = [
  { time: '21:00', ibope: 26.2, share: 44 },
  { time: '21:05', ibope: 27.5, share: 46 },
  { time: '21:10', ibope: 28.1, share: 47 },
  { time: '21:15', ibope: 29.4, share: 49, eventLabel: 'Corte p/ Cozinha VIP' },
  { time: '21:20', ibope: 28.8, share: 48 },
  { time: '21:25', ibope: 30.5, share: 51, eventLabel: 'Discussão ao Vivo' },
];

export const useBroadcastStore = create<BroadcastState & BroadcastStoreActions>((set, get) => ({
  pgmCameraId: 'cam-01',
  pvwCameraId: 'cam-02',
  tBarPosition: 0,
  isAutoTransitioning: false,
  isOnAir: true,
  isStreaming: true,
  lowerThirdText: 'AO VIVO NA CASA',
  lowerThirdSubtext: 'Convivência dos moradores sob vigilância 24 horas',
  showLowerThird: true,
  audioPeakL: -12,
  audioPeakR: -10,
  ibopeHistory: INITIAL_IBOPE_HISTORY,
  recordedTakes: [],
  dailyShowPackagesCount: 0,

  selectPreviewCamera: (camId: string) => {
    soundFx.playClick();
    set({ pvwCameraId: camId });
  },

  cutToProgram: () => {
    const { pvwCameraId, pgmCameraId } = get();
    soundFx.playCameraSwitch();

    // Instant CUT swaps Preview into Program
    set({
      pgmCameraId: pvwCameraId,
      pvwCameraId: pgmCameraId,
      tBarPosition: 0,
    });
  },

  autoTransition: (durationMs: number = 600) => {
    const { isAutoTransitioning, pvwCameraId, pgmCameraId } = get();
    if (isAutoTransitioning) return;

    soundFx.playClick();
    set({ isAutoTransitioning: true });

    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      set({ tBarPosition: Math.round(progress * 100) });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Complete transition: swap PGM and PVW
        soundFx.playCameraSwitch();
        set({
          pgmCameraId: pvwCameraId,
          pvwCameraId: pgmCameraId,
          tBarPosition: 0,
          isAutoTransitioning: false,
        });
      }
    };

    requestAnimationFrame(animate);
  },

  setTBarPosition: (val: number) => {
    set({ tBarPosition: Math.max(0, Math.min(100, val)) });
  },

  setLowerThird: (title: string, subtitle: string = '', show: boolean = true) => {
    set({
      lowerThirdText: title,
      lowerThirdSubtext: subtitle,
      showLowerThird: show,
    });
  },

  toggleLowerThird: () => {
    soundFx.playClick();
    set((state) => ({ showLowerThird: !state.showLowerThird }));
  },

  recordNarrativeTake: (
    tag: NarrativeTag,
    title: string,
    roomId: RealityRoomId,
    dramaRating: number = 4
  ) => {
    soundFx.playOnAirChime();
    const roomName = REALITY_ROOMS[roomId]?.name || 'Casa';
    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR');
    const timecode = `01:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}:${Math.floor(Math.random() * 30).toString().padStart(2, '0')}`;
    const ibopeImpact = parseFloat((Math.random() * 1.6 + 0.6).toFixed(1));

    const newTake: BroadcastTake = {
      id: `take-${Date.now()}`,
      timestamp: timeStr,
      timecode,
      roomId,
      cameraName: roomName,
      narrativeTag: tag,
      title,
      durationSeconds: Math.floor(Math.random() * 45) + 30,
      dramaRating,
      ibopeImpact,
    };

    set((state) => ({
      recordedTakes: [newTake, ...state.recordedTakes],
      dailyShowPackagesCount: state.dailyShowPackagesCount + 1,
    }));

    return newTake;
  },

  tickIbope: (currentIbope: number, tensionBoost: number = 0) => {
    const history = get().ibopeHistory;
    const now = new Date();
    const timeLabel = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newIbope = parseFloat((currentIbope + tensionBoost).toFixed(1));
    const newShare = Math.min(65, Math.round(newIbope * 1.65));

    const newPoint: IbopeHistoryPoint = {
      time: timeLabel,
      ibope: newIbope,
      share: newShare,
      eventLabel: tensionBoost > 1.0 ? 'Pico de Audiência' : undefined,
    };

    const trimmed = [...history.slice(-14), newPoint];
    set({ ibopeHistory: trimmed });
  },

  tickAudioMeters: () => {
    // Audio VU meters bouncing procedurally between -32 dB and -4 dB
    const randL = -18 + (Math.random() * 14 - 7);
    const randR = -18 + (Math.random() * 14 - 7);
    set({
      audioPeakL: Math.round(randL),
      audioPeakR: Math.round(randR),
    });
  },
}));
