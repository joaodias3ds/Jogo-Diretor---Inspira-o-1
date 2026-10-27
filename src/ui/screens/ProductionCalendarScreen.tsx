/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGameStore } from '@/app/useGameStore';
import { useAppStore } from '@/app/useAppStore';
import { Card } from '@/ui/components/Card';
import { Button } from '@/ui/components/Button';
import { Badge } from '@/ui/components/Badge';
import {
  FULL_SEASON_ROADMAP,
  PRODUCTION_STRATEGY_OPTIONS,
  getSeasonMilestoneSummary,
  calculateEventProductionCost,
  calculateEventExpectedIbope,
} from '@/engine/calendar/productionCalendarEngine';
import {
  SeasonTimelineEvent,
  EventCategory,
  ProductionFocus,
} from '@/engine/calendar/productionCalendarTypes';
import { WEEKLY_SCHEDULE, DAYS_OF_WEEK, DayOfWeek, DayPhase } from '@/engine/time/gameClock';
import { soundFx } from '@/audio/audioManager';
import { speakRealityAnnouncement } from '@/audio/speechNarration';
import {
  Calendar as CalendarIcon,
  Trophy,
  Flame,
  Radio,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  DollarSign,
  ChevronRight,
  Filter,
  Sliders,
  Tv,
  Eye,
  Megaphone,
  Layers,
  Pause,
  Play,
  Zap,
} from 'lucide-react';

export const ProductionCalendarScreen: React.FC = () => {
  const { time, ibope, cash, advancePhase, triggerRandomEventAction } = useGameStore();
  const { addToast } = useAppStore();

  const [viewMode, setViewMode] = useState<'timeline' | 'weekly-grid' | 'planner'>('timeline');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [selectedEvent, setSelectedEvent] = useState<SeasonTimelineEvent | null>(null);
  const [eventsState, setEventsState] = useState<SeasonTimelineEvent[]>(FULL_SEASON_ROADMAP);

  const milestoneSummary = getSeasonMilestoneSummary(time, eventsState);

  // Filter events
  const filteredEvents = eventsState.filter((ev) => {
    if (selectedCategory === 'all') return true;
    return ev.category === selectedCategory;
  });

  const getCategoryColor = (cat: EventCategory) => {
    switch (cat) {
      case 'challenge':
        return {
          bg: 'bg-amber-950/60 border-amber-800/60 text-amber-300',
          badge: 'warning' as const,
          icon: <Trophy size={14} className="text-amber-400" />,
          label: 'Prova & Liderança',
        };
      case 'eviction':
        return {
          bg: 'bg-rose-950/60 border-rose-800/60 text-rose-300',
          badge: 'danger' as const,
          icon: <Radio size={14} className="text-rose-400" />,
          label: 'Paredão & Eliminação',
        };
      case 'plot_twist':
        return {
          bg: 'bg-purple-950/60 border-purple-800/60 text-purple-300',
          badge: 'purple' as const,
          icon: <Sparkles size={14} className="text-purple-400" />,
          label: 'Plot-Twist & Big Fone',
        };
      case 'party':
        return {
          bg: 'bg-cyan-950/60 border-cyan-800/60 text-cyan-300',
          badge: 'info' as const,
          icon: <Flame size={14} className="text-cyan-400" />,
          label: 'Festa & Convivência',
        };
      case 'special_broadcast':
        return {
          bg: 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300',
          badge: 'success' as const,
          icon: <Tv size={14} className="text-emerald-400" />,
          label: 'Transmissão Especial',
        };
    }
  };

  const handleApplyStrategy = (eventId: string, strategyId: ProductionFocus) => {
    const strategy = PRODUCTION_STRATEGY_OPTIONS.find((s) => s.id === strategyId);
    if (!strategy) return;

    if (strategy.cost > cash) {
      addToast('error', 'Orçamento Insuficiente', `Você precisa de R$ ${strategy.cost.toLocaleString('pt-BR')} para esta estratégia.`);
      return;
    }

    setEventsState((prev) =>
      prev.map((ev) => {
        if (ev.id === eventId) {
          return {
            ...ev,
            appliedStrategy: strategyId,
          };
        }
        return ev;
      })
    );

    soundFx.playOnAirChime();
    speakRealityAnnouncement(`Estratégia de produção atualizada para ${strategy.label}`);

    addToast(
      'success',
      'Estratégia Confirmada',
      `Evento planejado com ${strategy.label}. Projeção de IBOPE +${strategy.ibopeBonus} pts.`
    );
  };

  const handleToggleAutoPause = (eventId: string) => {
    setEventsState((prev) =>
      prev.map((ev) => {
        if (ev.id === eventId) {
          const next = !ev.autoPause;
          addToast('info', 'Auto-Pausa Atualizada', next ? 'O relógio pausará ao vivo neste evento.' : 'Transmissão contínua programada.');
          return { ...ev, autoPause: next };
        }
        return ev;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Header com Telemetria do Cronograma */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              <CalendarIcon size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Cronograma Geral de Produção & Linha do Tempo</span>
                <Badge variant="live" pulse size="sm">
                  MASTER SCHEDULE
                </Badge>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Planejamento estratégico de 12 semanas: Provas, Paredões ao vivo e Plot-Twists
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'timeline'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock size={13} />
            <span>Timeline 12 Semanas</span>
          </button>

          <button
            onClick={() => setViewMode('weekly-grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'weekly-grid'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers size={13} />
            <span>Grade Semanal 24h</span>
          </button>

          <button
            onClick={() => setViewMode('planner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'planner'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders size={13} />
            <span>Pautas do Diretor</span>
          </button>
        </div>
      </div>

      {/* 2. Destaques de Alto Impacto (Upcoming Milestones Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Progresso do Confinamento */}
        <Card glow="cyan">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>TEMPORADA</span>
            <span className="text-cyan-400 font-bold">DIA {time.day} DE 84</span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-white">Semana {time.week}</span>
              <span className="text-xs text-slate-400 font-mono">{milestoneSummary.daysRemaining} dias restantes</span>
            </div>
            {/* Barra de Progresso */}
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden border border-slate-700/60">
              <div
                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (time.day / 84) * 100)}%` }}
              />
            </div>
            <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>Fase: {time.phase}</span>
              <span>{time.dayOfWeek}</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Próximo Paredão */}
        <Card glow="red">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <Radio size={12} /> PRÓXIMO PAREDÃO
            </span>
            <span className="text-slate-500">AO VIVO</span>
          </div>
          <div className="mt-2">
            <div className="text-sm font-bold text-white truncate">
              {milestoneSummary.nextEvictionEvent?.title || 'Grande Final em Breve'}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1">
              {milestoneSummary.nextEvictionEvent
                ? `Dia ${milestoneSummary.nextEvictionEvent.day} (${milestoneSummary.nextEvictionEvent.dayOfWeek}) · ${milestoneSummary.nextEvictionEvent.phase}`
                : 'Paredões da temporada concluídos'}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Meta Audiência:</span>
              <span className="text-rose-400 font-bold">
                {milestoneSummary.nextEvictionEvent?.expectedIbope.min ?? 30}.0+ pts
              </span>
            </div>
          </div>
        </Card>

        {/* Card 3: Próxima Prova */}
        <Card glow="amber">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Trophy size={12} /> PRÓXIMA PROVA
            </span>
            <span className="text-slate-500">DISPUTA</span>
          </div>
          <div className="mt-2">
            <div className="text-sm font-bold text-white truncate">
              {milestoneSummary.nextChallengeEvent?.title || 'Fase Final'}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1">
              {milestoneSummary.nextChallengeEvent
                ? `Dia ${milestoneSummary.nextChallengeEvent.day} (${milestoneSummary.nextChallengeEvent.dayOfWeek}) · ${milestoneSummary.nextChallengeEvent.phase}`
                : 'Última liderança já definida'}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Prêmio:</span>
              <span className="text-amber-300 truncate max-w-[140px]" title={milestoneSummary.nextChallengeEvent?.sponsorPrize}>
                {milestoneSummary.nextChallengeEvent?.sponsorPrize || 'Liderança + Imunidade'}
              </span>
            </div>
          </div>
        </Card>

        {/* Card 4: Próximo Plot-Twist */}
        <Card glow="none">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-purple-400 font-bold flex items-center gap-1">
              <Sparkles size={12} /> PRÓXIMO PLOT-TWIST
            </span>
            <span className="text-cyan-400 animate-pulse font-bold">REVIRAVOLTA</span>
          </div>
          <div className="mt-2">
            <div className="text-sm font-bold text-white truncate">
              {milestoneSummary.nextPlotTwistEvent?.title || 'Reta Decisiva'}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1">
              {milestoneSummary.nextPlotTwistEvent
                ? `Dia ${milestoneSummary.nextPlotTwistEvent.day} (${milestoneSummary.nextPlotTwistEvent.dayOfWeek})`
                : 'Dinâmicas surpresas concluídas'}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Impacto IBOPE:</span>
              <span className="text-purple-300 font-bold">
                +{milestoneSummary.nextPlotTwistEvent?.expectedIbope.baseBoost || 5.0} pts
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. MODO 1: TIMELINE DE 12 SEMANAS */}
      {viewMode === 'timeline' && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-cyan-400" />
              <span className="text-xs font-mono font-bold text-slate-300">Filtrar por Categoria:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'all', label: 'Todas as Pautas' },
                  { id: 'eviction', label: 'Paredões & Ao Vivo' },
                  { id: 'challenge', label: 'Provas & Líder' },
                  { id: 'plot_twist', label: 'Plot-Twists & Dinâmicas' },
                  { id: 'party', label: 'Festas' },
                  { id: 'special_broadcast', label: 'Especiais' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id as typeof selectedCategory)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                    selectedCategory === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lista Cronológica de Eventos da Temporada */}
          <div className="space-y-3">
            {filteredEvents.map((ev) => {
              const catConfig = getCategoryColor(ev.category);
              const isPast = ev.day < time.day;
              const isToday = ev.day === time.day;
              const isUpcoming = ev.day > time.day;
              const strategy = PRODUCTION_STRATEGY_OPTIONS.find((s) => s.id === ev.appliedStrategy);

              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className={`group cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
                    isToday
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500'
                      : isPast
                      ? 'bg-slate-900/40 border-slate-800/80 opacity-60 hover:opacity-100'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Data, Semana & Categoria */}
                    <div className="flex items-start md:items-center gap-3">
                      {/* Marcador de Data */}
                      <div className="flex flex-col items-center justify-center min-w-[70px] p-2 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
                        <span className="text-[10px] text-slate-400 uppercase">SEM {ev.week}</span>
                        <span className={`text-base font-black ${isToday ? 'text-cyan-400' : 'text-white'}`}>
                          DIA {ev.day}
                        </span>
                        <span className="text-[9px] text-slate-500 uppercase">{ev.phase}</span>
                      </div>

                      {/* Título & Descrição */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border flex items-center gap-1 ${catConfig.bg}`}>
                            {catConfig.icon}
                            {catConfig.label}
                          </span>

                          {ev.importance === 'critical' && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[9px] font-mono font-bold uppercase">
                              Pauta Crítica
                            </span>
                          )}

                          {isToday && (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[9px] font-mono font-bold uppercase animate-pulse">
                              ● HOJE AO VIVO
                            </span>
                          )}

                          {isPast && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-mono">
                              ✓ Realizado
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                          <span>{ev.title}</span>
                          <ChevronRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">{ev.description}</p>
                      </div>
                    </div>

                    {/* Telemetria de Produção & Estratégia Aplicada */}
                    <div className="flex flex-wrap md:flex-col items-end gap-1.5 font-mono text-xs text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">Projeção IBOPE:</span>
                        <span className="text-cyan-400 font-bold">
                          {calculateEventExpectedIbope(ev, ibope, strategy || PRODUCTION_STRATEGY_OPTIONS[0])} pts
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>Custo Base:</span>
                        <span className="text-emerald-400 font-bold">
                          R$ {calculateEventProductionCost(ev, strategy || PRODUCTION_STRATEGY_OPTIONS[0]).toLocaleString('pt-BR')}
                        </span>
                      </div>

                      {strategy && strategy.id !== 'default' && (
                        <div className="mt-1 px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/60 text-purple-300 text-[10px]">
                          Estratégia: {strategy.label}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. MODO 2: GRADE SEMANAL 24H (MASTER BROADCAST) */}
      {viewMode === 'weekly-grid' && (
        <Card glow="cyan">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio size={16} className="text-cyan-400" />
                <span>Grade Semanal de Programação (Rotina 24 Horas)</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Padrão broadcast de exibição da TV aberta e pay-per-view contínuo
              </p>
            </div>
            <div className="text-xs font-mono text-cyan-400 px-2 py-1 rounded bg-cyan-950 border border-cyan-800">
              Semana {time.week} em curso
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {DAYS_OF_WEEK.map((dayName, idx) => {
              const isToday = time.dayOfWeek === dayName;
              const dayEvents = WEEKLY_SCHEDULE.filter((sch) => sch.dayOfWeek === dayName);

              return (
                <div
                  key={dayName}
                  className={`p-3 rounded-xl border flex flex-col justify-between ${
                    isToday
                      ? 'bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-500/50'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-800 mb-2">
                      <span className={`font-bold ${isToday ? 'text-cyan-300' : 'text-slate-300'}`}>
                        {dayName.replace('-feira', '')}
                      </span>
                      {isToday && (
                        <span className="px-1 py-0.2 rounded bg-cyan-900 text-cyan-200 text-[9px] uppercase font-bold">
                          HOJE
                        </span>
                      )}
                    </div>

                    {/* Fases do dia */}
                    <div className="space-y-2">
                      {(['Manhã', 'Tarde', 'Noite', 'Madrugada'] as DayPhase[]).map((phase) => {
                        const scheduled = dayEvents.find((e) => e.phase === phase);
                        const isCurrentPhase = isToday && time.phase === phase;

                        return (
                          <div
                            key={phase}
                            className={`p-2 rounded-lg text-left text-[11px] font-mono transition-colors ${
                              isCurrentPhase
                                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50'
                                : scheduled
                                ? 'bg-slate-950/80 text-slate-300 border border-slate-800/80'
                                : 'bg-slate-950/30 text-slate-500 border border-slate-900'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[9px] text-slate-400 mb-0.5">
                              <span>{phase}</span>
                              {scheduled && (
                                <span className={scheduled.isAutoPause ? 'text-amber-400' : 'text-slate-500'}>
                                  {scheduled.isAutoPause ? '⏸ Ao Vivo' : '▶'}
                                </span>
                              )}
                            </div>
                            <div className="font-semibold text-white truncate">
                              {scheduled ? scheduled.title : 'Convivência Livre'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 5. MODO 3: PAUTAS DO DIRETOR (PLANEJAMENTO ESTRATÉGICO) */}
      {viewMode === 'planner' && (
        <div className="space-y-4">
          <Card glow="none">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders size={16} className="text-purple-400" />
                  <span>Central de Pautas & Preparação Técnica do Diretor</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Selecione os próximos grandes eventos para turbinar com estratégias especiais de transmissão
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eventsState
                .filter((ev) => ev.day >= time.day)
                .slice(0, 6)
                .map((ev) => {
                  const currentStrategy =
                    PRODUCTION_STRATEGY_OPTIONS.find((s) => s.id === ev.appliedStrategy) ||
                    PRODUCTION_STRATEGY_OPTIONS[0];

                  return (
                    <div
                      key={ev.id}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono mb-1">
                          <span className="text-cyan-400 font-bold">Semana {ev.week} · Dia {ev.day}</span>
                          <span className="text-slate-400 uppercase">{ev.phase}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{ev.title}</h4>
                        <p className="text-xs text-slate-400 mt-1">{ev.subtitle}</p>
                      </div>

                      {/* Escolha de Estratégia */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <label className="text-[11px] font-mono text-slate-400 block">
                          Estratégia de Transmissão:
                        </label>
                        <select
                          value={ev.appliedStrategy || 'default'}
                          onChange={(e) => handleApplyStrategy(ev.id, e.target.value as ProductionFocus)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                        >
                          {PRODUCTION_STRATEGY_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label} ({opt.cost > 0 ? `+R$ ${opt.cost.toLocaleString('pt-BR')}` : 'Custo Normal'})
                            </option>
                          ))}
                        </select>
                        <p className="text-[11px] text-purple-300 font-mono">{currentStrategy.description}</p>
                      </div>

                      {/* Botões de Ação Rápida */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono">
                        <button
                          onClick={() => handleToggleAutoPause(ev.id)}
                          className={`flex items-center gap-1 text-[11px] ${
                            ev.autoPause ? 'text-amber-400' : 'text-slate-500'
                          }`}
                        >
                          {ev.autoPause ? <Pause size={12} /> : <Play size={12} />}
                          <span>{ev.autoPause ? 'Auto-pausa Ativa' : 'Transmissão Contínua'}</span>
                        </button>

                        <button
                          onClick={() => setSelectedEvent(ev)}
                          className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                        >
                          <span>Detalhes</span>
                          <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>
      )}

      {/* 6. MODAL DE DETALHES & PLANEJAMENTO DO EVENTO */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative text-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${getCategoryColor(selectedEvent.category).bg}`}>
                  {getCategoryColor(selectedEvent.category).icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getCategoryColor(selectedEvent.category).badge} size="sm">
                      {getCategoryColor(selectedEvent.category).label}
                    </Badge>
                    <span className="text-xs font-mono text-cyan-400">
                      Semana {selectedEvent.week} · Dia {selectedEvent.day} ({selectedEvent.dayOfWeek}) · {selectedEvent.phase}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1">{selectedEvent.title}</h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Conteúdo */}
            <div className="py-4 space-y-4">
              <div>
                <h4 className="text-xs font-mono text-slate-400 uppercase">Sinopse de Produção</h4>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed">{selectedEvent.description}</p>
              </div>

              {selectedEvent.sponsorPrize && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-center gap-3">
                  <Trophy size={18} className="text-amber-400" />
                  <div>
                    <div className="text-[10px] font-mono text-amber-400 uppercase">Prêmio do Patrocinador</div>
                    <div className="text-xs font-bold text-white">{selectedEvent.sponsorPrize}</div>
                  </div>
                </div>
              )}

              {/* Projeção de Métricas */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
                <div>
                  <span className="text-slate-400">Audiência Esperada:</span>
                  <div className="text-base font-bold text-cyan-400">
                    {selectedEvent.expectedIbope.min}.0 - {selectedEvent.expectedIbope.max}.0 pts
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Custo Base de Montagem:</span>
                  <div className="text-base font-bold text-emerald-400">
                    R$ {selectedEvent.baseCost.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>

              {/* Seleção de Estratégia de Produção */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono text-slate-400 uppercase">Configurar Estratégia do Diretor:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRODUCTION_STRATEGY_OPTIONS.map((strat) => {
                    const isSelected = (selectedEvent.appliedStrategy || 'default') === strat.id;

                    return (
                      <button
                        key={strat.id}
                        onClick={() => handleApplyStrategy(selectedEvent.id, strat.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-cyan-950/60 border-cyan-500 ring-1 ring-cyan-500'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-white">
                          <span>{strat.label}</span>
                          {strat.cost > 0 ? (
                            <span className="text-[10px] text-emerald-400 font-mono">
                              +R$ {strat.cost.toLocaleString('pt-BR')}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">Padrão</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-tight">{strat.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <Button
                variant={selectedEvent.autoPause ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleToggleAutoPause(selectedEvent.id)}
              >
                {selectedEvent.autoPause ? '⏸ Auto-pausa Ativa' : '▶ Transmissão Contínua'}
              </Button>

              <Button variant="secondary" size="sm" onClick={() => setSelectedEvent(null)}>
                Fechar Detalhes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
