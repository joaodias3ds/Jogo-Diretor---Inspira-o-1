/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { ToastItem, ToastType } from '@/ui/components/Toast';
import { soundFx } from '@/audio/audioManager';

export type ScreenId =
  | 'menu'
  | 'wizard'
  | 'dashboard'
  | 'cameras'
  | 'housemates'
  | 'social-map'
  | 'challenges'
  | 'editing'
  | 'live-show'
  | 'voting'
  | 'fantasy'
  | 'social-feed'
  | 'finances'
  | 'crises'
  | 'editor'
  | 'hall-of-fame';

export type ModalId = 'settings' | 'guide' | 'about' | 'season-summary' | 'hire-participant' | null;

interface DirectorStats {
  cash: number;
  ibope: number;
  reputation: number;
  authority: number;
  day: number;
  week: number;
  phase: 'Manhã' | 'Tarde' | 'Noite' | 'Ao Vivo';
  programName: string;
  networkName: string;
  hostName: string;
}

export interface Candidate {
  id: string;
  name: string;
  nickname: string;
  age: number;
  profession: string;
  hometown: string;
  traits: string[];
  cost: number;
  charisma: number;
  temperament: 'Calmo' | 'Estrategista' | 'Explosivo' | 'Fofoqueiro' | 'Romântico';
  avatarColor: string;
}

interface AppState {
  currentScreen: ScreenId;
  activeModal: ModalId;
  toasts: ToastItem[];
  directorStats: DirectorStats;
  isMuted: boolean;
  volume: number;
  soundFxEnabled: boolean;
  activeSeasonId: string | null;
  isRecording: boolean;
  recordedTakesCount: number;
  participantsCount: number;
  hiredParticipants: Candidate[];

  // Actions
  setScreen: (screen: ScreenId) => void;
  openModal: (modal: ModalId) => void;
  closeModal: () => void;
  addToast: (type: ToastType, title: string, message?: string) => void;
  dismissToast: (id: string) => void;
  toggleMute: () => void;
  setVolume: (vol: number) => void;
  updateStats: (partial: Partial<DirectorStats>) => void;
  toggleRecording: () => void;
  hireCandidate: (candidate: Candidate) => boolean;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentScreen: 'dashboard',
  activeModal: null,
  toasts: [],
  directorStats: {
    cash: 250000,
    ibope: 28.4,
    reputation: 85,
    authority: 100,
    day: 1,
    week: 1,
    phase: 'Manhã',
    programName: 'Diretor do Reality',
    networkName: 'Rede Astral de Televisão',
    hostName: 'Tadeu Santiago',
  },
  isMuted: false,
  volume: 0.6,
  soundFxEnabled: true,
  activeSeasonId: null,
  isRecording: false,
  recordedTakesCount: 14,
  participantsCount: 20,
  hiredParticipants: [],

  setScreen: (screen: ScreenId) => {
    soundFx.playCameraSwitch();
    set({ currentScreen: screen });
  },

  openModal: (modal: ModalId) => {
    soundFx.playClick();
    set({ activeModal: modal });
  },

  closeModal: () => {
    set({ activeModal: null });
  },

  addToast: (type: ToastType, title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastItem = { id, type, title, message };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    setTimeout(() => {
      get().dismissToast(id);
    }, 4500);
  },

  dismissToast: (id: string) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  toggleMute: () => {
    const nextMute = !get().isMuted;
    soundFx.setMuted(nextMute);
    set({ isMuted: nextMute });
  },

  setVolume: (vol: number) => {
    soundFx.setVolume(vol);
    set({ volume: vol });
  },

  updateStats: (partial: Partial<DirectorStats>) => {
    set((state) => ({
      directorStats: { ...state.directorStats, ...partial },
    }));
  },

  toggleRecording: () => {
    const willRecord = !get().isRecording;
    if (willRecord) {
      soundFx.playOnAirChime();
      const nextTakes = get().recordedTakesCount + 1;
      const ibopeBoost = parseFloat((Math.random() * 0.8 + 0.4).toFixed(1));
      const currentStats = get().directorStats;

      set({
        isRecording: true,
        recordedTakesCount: nextTakes,
        directorStats: {
          ...currentStats,
          ibope: Math.min(50, currentStats.ibope + ibopeBoost),
        },
      });

      get().addToast(
        'warning',
        'Gravação Iniciada (REC)',
        `Câmeras da casa gravando em alta definição. Audiência subiu +${ibopeBoost} pts!`
      );
    } else {
      soundFx.playCameraSwitch();
      set({ isRecording: false });
      get().addToast(
        'info',
        'Gravação Finalizada',
        'Novo take arquivado com sucesso na Ilha de Edição.'
      );
    }
  },

  hireCandidate: (candidate: Candidate) => {
    const currentCash = get().directorStats.cash;
    if (currentCash < candidate.cost) {
      soundFx.playWarning();
      get().addToast(
        'error',
        'Orçamento Insuficiente',
        `Você precisa de R$ ${candidate.cost.toLocaleString('pt-BR')} para contratar este participante.`
      );
      return false;
    }

    soundFx.playOnAirChime();
    const currentStats = get().directorStats;
    const newCash = currentStats.cash - candidate.cost;
    const charismaBonus = parseFloat((candidate.charisma / 25).toFixed(1));
    const newIbope = Math.min(50, currentStats.ibope + charismaBonus);

    set((state) => ({
      participantsCount: state.participantsCount + 1,
      hiredParticipants: [...state.hiredParticipants, candidate],
      directorStats: {
        ...currentStats,
        cash: newCash,
        ibope: newIbope,
        authority: Math.min(100, currentStats.authority + 5),
      },
      activeModal: null,
    }));

    get().addToast(
      'success',
      'Participante Contratado!',
      `${candidate.name} ("${candidate.nickname}") assinou contrato! Audiência em alta (+${charismaBonus} pts).`
    );

    return true;
  },
}));
