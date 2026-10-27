/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { RandomEvent, RandomEventOption } from '@/engine/events/randomEventTypes';
import { useGameStore } from '@/app/useGameStore';
import { useAppStore } from '@/app/useAppStore';
import { soundFx } from '@/audio/audioManager';
import { speakRealityAnnouncement } from '@/audio/speechNarration';
import { Button } from '@/ui/components/Button';
import { Badge } from '@/ui/components/Badge';
import {
  Flame,
  Heart,
  Radio,
  Zap,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Award,
  Volume2,
  AlertTriangle,
} from 'lucide-react';

interface RandomEventModalProps {
  event: RandomEvent | null;
  onResolve: (option: RandomEventOption) => void;
  onDismiss: () => void;
}

export const RandomEventModal: React.FC<RandomEventModalProps> = ({
  event,
  onResolve,
  onDismiss,
}) => {
  if (!event) return null;

  useEffect(() => {
    soundFx.playWarning();
    // Tenta narrar a manchete via síntese de voz (Web Speech API)
    speakRealityAnnouncement(`Atenção! ${event.headline}`);
  }, [event.id]);

  const getCategoryIcon = () => {
    switch (event.category) {
      case 'conflito':
        return <Flame className="text-rose-500 animate-bounce" size={26} />;
      case 'romance':
        return <Heart className="text-pink-500 animate-pulse" size={26} />;
      case 'desafio_surpresa':
        return <Zap className="text-amber-400 animate-spin" size={26} />;
    }
  };

  const getCategoryTheme = () => {
    switch (event.category) {
      case 'conflito':
        return 'from-rose-950 via-slate-950 to-slate-900 border-rose-600/70 shadow-rose-950/50';
      case 'romance':
        return 'from-pink-950 via-slate-950 to-slate-900 border-pink-600/70 shadow-pink-950/50';
      case 'desafio_surpresa':
        return 'from-amber-950 via-slate-950 to-slate-900 border-amber-600/70 shadow-amber-950/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className={`relative w-full max-w-2xl rounded-2xl bg-gradient-to-b ${getCategoryTheme()} border-2 shadow-2xl p-6 space-y-5 text-slate-100 overflow-hidden`}
      >
        {/* Ticker Superior de Plantão */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping inline-block" />
            <Badge variant="danger" pulse size="md">
              PLANTÃO DO REALITY · EVENTO AO VIVO
            </Badge>
          </div>
          <span className="text-xs font-mono text-cyan-300 bg-slate-950/80 px-2.5 py-1 rounded border border-cyan-800/40">
            📍 {event.location}
          </span>
        </div>

        {/* Título & Headline */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            {getCategoryIcon()}
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {event.title}
            </h2>
          </div>
          <p className="text-sm sm:text-base font-bold text-amber-300 font-sans leading-snug">
            "{event.headline}"
          </p>
        </div>

        {/* Descrição dos Acontecimentos */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {event.description}
        </div>

        {/* Telemetria do Evento: IBOPE & Redes Sociais */}
        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
          <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-emerald-400" /> Audiência Estimada:
            </span>
            <strong className="text-emerald-400 font-bold">+{event.ibopeImpact} pts IBOPE</strong>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Radio size={14} className="text-purple-400" /> Engajamento nas Redes:
            </span>
            <strong className="text-purple-300 font-bold">+{event.socialBuzzScore.toLocaleString()} menções</strong>
          </div>
        </div>

        {/* Envolvidos */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Participantes Envolvidos:</span>
          {event.involvedParticipantNames.map((name, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-cyan-800/40 font-semibold"
            >
              {name}
            </span>
          ))}
        </div>

        {/* Escolhas de Intervenção da Direção */}
        <div className="space-y-2.5 pt-2 border-t border-white/10">
          <span className="text-xs font-mono uppercase font-bold text-white block">
            Como a Direção deve intervir agora?
          </span>

          <div className="space-y-2">
            {event.options.map((opt) => (
              <div
                key={opt.id}
                onClick={() => onResolve(opt)}
                className="p-3.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 group"
              >
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-cyan-300 transition-colors">
                    {opt.label}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{opt.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                  {opt.ibopeDelta !== 0 && (
                    <span className={opt.ibopeDelta > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                      {opt.ibopeDelta > 0 ? `+${opt.ibopeDelta}` : opt.ibopeDelta} IBOPE
                    </span>
                  )}
                  {opt.cashDelta !== 0 && (
                    <span className={opt.cashDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {opt.cashDelta > 0 ? `+R$ ${opt.cashDelta}` : `-R$ ${Math.abs(opt.cashDelta)}`}
                    </span>
                  )}
                  <Button variant="primary" size="sm">
                    Executar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
