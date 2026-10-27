/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAppStore } from '@/app/useAppStore';
import { Button } from '@/ui/components/Button';
import { Badge } from '@/ui/components/Badge';
import { REALITY_MODES } from '@/config/theme';
import {
  Play,
  Tv,
  Settings,
  HelpCircle,
  Users,
  Award,
  Sparkles,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';

export const MainMenuScreen: React.FC = () => {
  const { setScreen, openModal, addToast } = useAppStore();

  const handleNewSeason = () => {
    setScreen('wizard');
  };

  const handleContinue = () => {
    addToast('success', 'Temporada Carregada', 'Bem-vindo de volta à sala de controle!');
    setScreen('dashboard');
  };

  return (
    <div className="relative min-h-[calc(100vh-53px)] flex flex-col justify-between p-6 sm:p-12 overflow-hidden bg-radial from-slate-900 via-slate-950 to-[#07090e]">
      {/* Background ambient grid and light beams */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[250px] bg-red-600/10 blur-[110px] rounded-full pointer-events-none" />

      {/* Header lockup */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="live" pulse size="md">
            TRANSMISSÃO AO VIVO
          </Badge>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest hidden sm:inline">
            PRODUÇÃO & BASTIDORES
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<HelpCircle size={15} />}
            onClick={() => openModal('guide')}
          >
            Manual
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Settings size={15} />}
            onClick={() => openModal('settings')}
          >
            Ajustes
          </Button>
        </div>
      </div>

      {/* Centerpiece Hero */}
      <div className="relative z-10 max-w-3xl mx-auto my-auto text-center py-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 text-xs font-mono mb-4">
          <Radio size={13} className="text-cyan-400 animate-pulse" />
          <span>SIMULADOR ESTRATÉGICO DE REALITY SHOW</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-3 drop-shadow-md">
          DIRETOR DO <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-rose-400">REALITY</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto mb-8 font-light leading-relaxed">
          Assuma a cadeira mais cobiçada da televisão. Crie provas, comande dinâmicas,
          edite os takes do dia, manipule a audiência e gerencie os participantes mais explosivos do Brasil.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto mb-10">
          <Button
            variant="on-air"
            size="lg"
            className="w-full sm:w-auto"
            leftIcon={<Play size={18} />}
            onClick={handleNewSeason}
          >
            Iniciar Nova Temporada
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto"
            leftIcon={<Tv size={18} />}
            onClick={handleContinue}
          >
            Central do Diretor
          </Button>
        </div>

        {/* Reality Format Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-2xl mx-auto">
          {Object.values(REALITY_MODES).map((mode) => (
            <div
              key={mode.id}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer group"
              onClick={() => {
                addToast('info', `Formato: ${mode.name}`, mode.tagline);
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {mode.name}
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${mode.badgeColor}`}>
                  {mode.eliminationTitle}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {mode.tagline}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer bar */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-900 text-xs text-slate-500 font-mono">
        <div>FASE 0 — FUNDAÇÃO E ARQUITETURA CONCLUÍDA</div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <span className="text-slate-400">Pressione ESC para fechar janelas</span>
          <span>·</span>
          <span>Rede Astral v1.0</span>
        </div>
      </div>
    </div>
  );
};
