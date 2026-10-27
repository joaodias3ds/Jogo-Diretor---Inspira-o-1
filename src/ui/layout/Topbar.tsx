/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAppStore } from '@/app/useAppStore';
import { useGameStore } from '@/app/useGameStore';
import { Badge } from '@/ui/components/Badge';
import {
  Volume2,
  VolumeX,
  Settings,
  HelpCircle,
  Home,
  Tv,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Zap,
  Flame,
} from 'lucide-react';

export const Topbar: React.FC = () => {
  const {
    currentScreen,
    setScreen,
    openModal,
    isMuted,
    toggleMute,
    addToast,
  } = useAppStore();

  const {
    seasonConfig,
    time,
    cash,
    ibope,
    reputation,
    authority,
    triggerRandomEventAction,
    toggleGodMode,
    godMode,
  } = useGameStore();

  const isMenu = currentScreen === 'menu';

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between text-slate-200">
      {/* Brand & Mode */}
      <div className="flex items-center gap-3">
        {!isMenu && (
          <button
            onClick={() => setScreen('menu')}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Menu Principal"
          >
            <Home size={16} />
          </button>
        )}

        <div className="flex items-center gap-2">
          <Badge variant="live" pulse size="sm">
            NO AR
          </Badge>
          <div>
            <div className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>{seasonConfig.programName}</span>
              <span className="text-[10px] font-mono text-cyan-400 font-normal px-1 py-0.2 bg-cyan-950/60 rounded border border-cyan-800/40">
                TEMPORADA 1
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-wider">
              {seasonConfig.networkName}
            </div>
          </div>
        </div>
      </div>

      {/* Control Room Telemetry (when in game/dashboard) */}
      {!isMenu && (
        <div className="hidden md:flex items-center gap-4 text-xs font-mono">
          {/* Day / Phase */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <Calendar size={13} className="text-cyan-400" />
            <span>Sem {time.week} · Dia {time.day}</span>
            <span className="text-[10px] px-1 rounded bg-slate-800 text-cyan-300 uppercase">
              {time.phase}
            </span>
          </div>

          {/* IBOPE */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300" title="Audiência em tempo real">
            <Tv size={13} className="text-red-400" />
            <span className="text-slate-400">IBOPE:</span>
            <span className="text-white font-bold text-red-400">{ibope.toFixed(1)} pts</span>
          </div>

          {/* Caixa */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300" title="Caixa da Emissora">
            <DollarSign size={13} className="text-emerald-400" />
            <span className="text-slate-400">Caixa:</span>
            <span className="text-white font-bold text-emerald-400">
              R$ {cash.toLocaleString('pt-BR')}
            </span>
          </div>

          {/* Reputação */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300" title="Reputação do Programa">
            <TrendingUp size={13} className="text-amber-400" />
            <span className="text-slate-400">Reputação:</span>
            <span className="text-white font-bold text-amber-300">{reputation}%</span>
          </div>

          {/* Autoridade */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300" title="Poder de Intervenção">
            <ShieldCheck size={13} className="text-purple-400" />
            <span className="text-slate-400">Autoridade:</span>
            <span className="text-white font-bold text-purple-300">{authority} pts</span>
          </div>
        </div>
      )}

      {/* Action Utilities */}
      <div className="flex items-center gap-1.5">
        {!isMenu && (
          <>
            <button
              onClick={() => {
                const ev = triggerRandomEventAction();
                addToast('warning', `Plantão: ${ev.title}`, ev.headline);
              }}
              className="px-2 py-1 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-300 hover:bg-amber-900/60 text-xs font-mono font-bold flex items-center gap-1 transition-colors"
              title="Disparar Evento Aleatório (Conflito, Romance ou Desafio)"
            >
              <Flame size={13} className="text-amber-400" />
              <span className="hidden sm:inline">Evento</span>
            </button>

            <button
              onClick={toggleGodMode}
              className={`px-2 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-1 transition-colors ${
                godMode
                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title="Alternar Modo Diretor-Deus"
            >
              <Zap size={13} className={godMode ? 'text-rose-400' : 'text-slate-400'} />
              <span className="hidden sm:inline">{godMode ? 'Deus ON' : 'Deus'}</span>
            </button>
          </>
        )}

        <button
          onClick={toggleMute}
          className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title={isMuted ? 'Desmutar áudio' : 'Mutar áudio'}
        >
          {isMuted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} className="text-slate-300" />}
        </button>

        <button
          onClick={() => openModal('guide')}
          className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Manual do Diretor (GDD)"
        >
          <HelpCircle size={16} />
        </button>

        <button
          onClick={() => openModal('settings')}
          className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Configurações da Ilha"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
};
