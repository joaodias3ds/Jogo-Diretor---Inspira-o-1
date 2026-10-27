/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAppStore } from '@/app/useAppStore';
import { Card } from '@/ui/components/Card';
import { Button } from '@/ui/components/Button';
import { Badge } from '@/ui/components/Badge';
import { Tabs } from '@/ui/components/Tabs';
import {
  Tv,
  Users,
  Video,
  Award,
  Film,
  Flame,
  MessageSquare,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export const DashboardScreen: React.FC = () => {
  const { directorStats, updateStats, addToast, setScreen } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');

  const advancePhase = () => {
    const phases: Array<'Manhã' | 'Tarde' | 'Noite' | 'Ao Vivo'> = [
      'Manhã',
      'Tarde',
      'Noite',
      'Ao Vivo',
    ];
    const currentIndex = phases.indexOf(directorStats.phase);
    const nextIndex = (currentIndex + 1) % phases.length;
    const nextPhase = phases[nextIndex];
    let nextDay = directorStats.day;
    let nextWeek = directorStats.week;

    if (nextIndex === 0) {
      nextDay += 1;
      if (nextDay % 7 === 1) {
        nextWeek += 1;
      }
    }

    const ibopeDelta = (Math.random() * 2.5 - 1.0).toFixed(1);
    const newIbope = Math.max(12, Math.min(48, directorStats.ibope + parseFloat(ibopeDelta)));

    updateStats({
      phase: nextPhase,
      day: nextDay,
      week: nextWeek,
      ibope: newIbope,
    });

    addToast(
      'info',
      `Fase Avançada: ${nextPhase}`,
      `Dia ${nextDay} (Semana ${nextWeek}). Ibope atual: ${newIbope.toFixed(1)} pts.`
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              SALA DE CONTROLE PRINCIPAL
            </span>
            <Badge variant="live" pulse size="sm">
              AO VIVO
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {directorStats.programName}
          </h1>
          <p className="text-xs text-slate-400">
            Apresentador: <span className="text-slate-200 font-medium">{directorStats.hostName}</span> · Emissora: <span className="text-slate-200 font-medium">{directorStats.networkName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setScreen('menu')}
          >
            Menu Principal
          </Button>

          <Button
            variant="on-air"
            size="md"
            leftIcon={<Play size={16} />}
            onClick={advancePhase}
          >
            Avançar Fase ({directorStats.phase})
          </Button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/40 text-red-400">
            <Tv size={22} />
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase">Audiência (IBOPE)</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white">
              {directorStats.ibope.toFixed(1)} <span className="text-xs text-slate-400">pts</span>
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <span>↑ +1.4 pts vs semana passada</span>
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
            <DollarSign size={22} />
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase">Caixa da Emissora</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white">
              R$ {(directorStats.cash / 1000).toFixed(0)}k
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Cotas master quitadas</div>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800/40 text-amber-400">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase">Reputação Pública</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white">
              {directorStats.reputation}%
            </div>
            <div className="text-[10px] text-cyan-400 mt-0.5">Boa credibilidade</div>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-400">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase">Autoridade do Diretor</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white">
              {directorStats.authority} <span className="text-xs text-slate-400">pts</span>
            </div>
            <div className="text-[10px] text-purple-300 mt-0.5">Pronto para intervenções</div>
          </div>
        </Card>
      </div>

      {/* Navigation Modules Tabs */}
      <Tabs
        tabs={[
          { id: 'overview', label: 'Central Geral', icon: <Sparkles size={14} /> },
          { id: 'cameras', label: 'Ilha de Câmeras', icon: <Video size={14} />, badge: 9 },
          { id: 'housemates', label: 'Participantes', icon: <Users size={14} />, badge: 20 },
          { id: 'challenges', label: 'Estúdio de Provas', icon: <Award size={14} /> },
          { id: 'editing', label: 'Ilha de Edição', icon: <Film size={14} /> },
          { id: 'voting', label: 'Paredão / Votação', icon: <Flame size={14} /> },
          { id: 'social', label: 'Redes & Imprensa', icon: <MessageSquare size={14} /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Main Content Area based on Tab */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Status do Dia e Próximos Eventos */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <div className="font-bold text-white text-base">Fila de Eventos da Produção</div>
                  <Badge variant="info">SEMANA {directorStats.week}</Badge>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 shrink-0">
                      <Video size={16} />
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="font-semibold text-white">Clima Tenso na Cozinha VIP</div>
                      <p className="text-slate-400 mt-0.5">
                        Discussão por comida entre dois grupos rivais. Câmeras 2 e 4 captando áudio nítido.
                      </p>
                    </div>
                    <Badge variant="warning">Drama Alto</Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-950 text-amber-400 shrink-0">
                      <Award size={16} />
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="font-semibold text-white">Montagem da Prova do Líder</div>
                      <p className="text-slate-400 mt-0.5">
                        Arena 3D com circuito de equilíbrio e resistência. Previsão de exibição ao vivo quinta-feira.
                      </p>
                    </div>
                    <Badge variant="neutral">Em Preparo</Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-red-950 text-red-400 shrink-0">
                      <AlertTriangle size={16} />
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="font-semibold text-white">Alerta de Crise: Rompimento de Aliança</div>
                      <p className="text-slate-400 mt-0.5">
                        O grupo do Quarto Oceano desconfia de um infiltrado. Risco de fofoca vazar no confessionário.
                      </p>
                    </div>
                    <Badge variant="danger">Crise Potencial</Badge>
                  </div>
                </div>
              </Card>

              {/* Botões Rápidos de Intervenção do Diretor */}
              <Card>
                <div className="font-bold text-white text-base mb-3 flex items-center justify-between">
                  <span>Mesa de Intervenções Rápidas do Diretor</span>
                  <span className="text-xs font-mono text-purple-400">Gasta Autoridade</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <Button
                    variant="cyber"
                    size="sm"
                    onClick={() => addToast('warning', 'Big Fone Tocou!', 'O telefone misterioso começou a tocar na sala principal!')}
                  >
                    Tocar Big Fone
                  </Button>
                  <Button
                    variant="cyber"
                    size="sm"
                    onClick={() => addToast('info', 'Festa Liberada', 'Música alta e drinks enviados para a área da piscina!')}
                  >
                    Liberar Cooler / Festa
                  </Button>
                  <Button
                    variant="cyber"
                    size="sm"
                    onClick={() => addToast('error', 'Punição Geral', 'Falta grave! Toda a casa perde 500 estalecas de comida.')}
                  >
                    Aplicar Punição Geral
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right 1 Col: Status da Emissora & Fase Atual */}
            <div className="space-y-4">
              <Card>
                <div className="font-bold text-white text-base mb-3">Status da Temporada</div>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Total de Confinados</span>
                    <span className="font-mono font-bold text-white">20 moradores</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Eliminados até agora</span>
                    <span className="font-mono font-bold text-white">0</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Meta de Ibope da Diretoria</span>
                    <span className="font-mono font-bold text-cyan-400">25.0 pts (Atingida!)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Prêmio Final</span>
                    <span className="font-mono font-bold text-emerald-400">R$ 2.500.000</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Patrocinadores Ativos</span>
                    <span className="font-mono font-bold text-amber-300">4 Cotas Master</span>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="font-bold text-white text-base mb-2">Roadmap das Fases</div>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle size={14} />
                    <span>Fase 0: Fundação e Arquitetura [OK]</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-3.5 h-3.5 rounded-full border border-cyan-400 inline-block" />
                    <span>Fase 1: Motor de Tempo, Stores & Dexie</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-700 inline-block" />
                    <span>Fase 2: Participantes e Utility AI</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-700 inline-block" />
                    <span>Fase 3: Relações, Fofocas e Conflitos</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-700 inline-block" />
                    <span>Fase 4: Mundo 3D da Casa e Câmeras</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab !== 'overview' && (
          <Card className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 mx-auto flex items-center justify-center">
              <Tv size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Módulo em Preparação</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Este módulo de produção será conectado conforme avançamos nas próximas fases de desenvolvimento do motor.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveTab('overview')}
            >
              Voltar à Central Geral
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};
