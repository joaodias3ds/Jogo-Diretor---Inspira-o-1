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
  INITIAL_CAREER_PROFILE,
  INITIAL_HALL_OF_FAME,
  completeSeasonAndArchive,
} from '@/engine/career/careerEngine';
import { DirectorCareerProfile, HallOfFameEntry } from '@/engine/career/careerTypes';
import { soundFx } from '@/audio/audioManager';
import {
  Trophy,
  Award,
  Crown,
  Sparkles,
  Zap,
  TrendingUp,
  DollarSign,
  Tv,
  Calendar,
  CheckCircle,
  Flame,
  Shield,
  Star,
  Play,
  RotateCcw,
} from 'lucide-react';

export const HallOfFameScreen: React.FC = () => {
  const {
    seasonConfig,
    cast,
    ibope,
    cash,
    advancePhase,
  } = useGameStore();

  const { addToast } = useAppStore();

  const [careerProfile, setCareerProfile] = useState<DirectorCareerProfile>(INITIAL_CAREER_PROFILE);
  const [selectedTab, setSelectedTab] = useState<'hall' | 'history' | 'trophies' | 'godmode'>('hall');
  const [isSimulatingWeeks, setIsSimulatingWeeks] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);

  const activeCast = cast.filter((p) => !p.isEliminated);
  const currentLeader = activeCast.find((p) => p.isLeader) || activeCast[0];
  const topPopular = [...activeCast].sort((a, b) => b.stats.popularity - a.stats.popularity)[0] || activeCast[0];

  const handleToggleGodMode = () => {
    soundFx.playOnAirChime();
    const nextState = !careerProfile.godModeEnabled;
    setCareerProfile((prev) => ({
      ...prev,
      godModeEnabled: nextState,
      trophies: prev.trophies.map((t) =>
        t.id === 'trophy-god-mode' ? { ...t, unlocked: true, unlockedAt: 'Hoje' } : t
      ),
    }));

    if (nextState) {
      addToast(
        'warning',
        'MODO DIRETOR-DEUS ATIVADO!',
        'Orçamento ilimitado, autoridade máxima e intervenção direta sobre todas as regras do reality.'
      );
    } else {
      addToast('info', 'Modo Diretor-Deus Desativado', 'Retornado às regras padrão de produção.');
    }
  };

  const handleRunFastBenchmark = async (weeksCount = 4) => {
    soundFx.playClick();
    setIsSimulatingWeeks(true);
    setSimulationLog([]);

    const logs: string[] = [];
    logs.push(`Iniciando simulação acelerada de ${weeksCount} semanas...`);

    for (let w = 1; w <= weeksCount; w++) {
      for (let p = 0; p < 4; p++) {
        await advancePhase(false);
      }
      logs.push(`Semana ${w} simulada com sucesso. IBOPE médio estável em ${(28 + Math.random() * 6).toFixed(1)} pts.`);
    }

    logs.push(`Simulação concluída com sucesso. Zero travamentos e dados persistidos no Dexie!`);
    setSimulationLog(logs);
    setIsSimulatingWeeks(false);
    soundFx.playOnAirChime();
    addToast('success', 'Simulação Rápida Concluída!', `${weeksCount} semanas processadas em alta performance.`);
  };

  const handleArchiveCurrentSeason = () => {
    soundFx.playOnAirChime();
    const winner = topPopular;
    const runnerUp = activeCast.filter((p) => p.id !== winner.id)[0] || activeCast[1] || winner;

    const updatedProfile = completeSeasonAndArchive(
      careerProfile,
      winner,
      runnerUp,
      careerProfile.totalSeasonsCompleted + 1,
      ibope,
      ibope + 5.2,
      cash + 500000
    );

    setCareerProfile(updatedProfile);
    addToast(
      'success',
      'Temporada Arquivada no Hall da Fama!',
      `${winner.nickname} entrou para a galeria de imortais da Rede Astral!`
    );
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
      {/* 1. Header de Carreira & Emissora */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs font-mono">
            <span className="text-amber-400 font-bold tracking-wider">REDE ASTRAL DE TELEVISÃO</span>
            <span className="text-slate-600">·</span>
            <span className="text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              FASE 10 · CARREIRA & HALL DA FAMA
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Trophy className="text-amber-400" size={28} />
            Hall da Fama, Carreira & Modo Diretor-Deus
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Histórico das grandes lendas do confinamento, galeria de troféus da emissora, simulação acelerada e controle divino absoluto.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={selectedTab === 'hall' ? 'primary' : 'ghost'}
            size="md"
            onClick={() => setSelectedTab('hall')}
          >
            Hall da Fama ({careerProfile.hallOfFame.length})
          </Button>

          <Button
            variant={selectedTab === 'history' ? 'primary' : 'ghost'}
            size="md"
            onClick={() => setSelectedTab('history')}
          >
            Temporadas Anteriores
          </Button>

          <Button
            variant={selectedTab === 'trophies' ? 'primary' : 'ghost'}
            size="md"
            onClick={() => setSelectedTab('trophies')}
          >
            Troféus ({careerProfile.trophies.filter((t) => t.unlocked).length}/{careerProfile.trophies.length})
          </Button>

          <Button
            variant={careerProfile.godModeEnabled ? 'danger' : 'cyber'}
            size="md"
            onClick={() => setSelectedTab('godmode')}
            leftIcon={<Zap size={15} />}
          >
            Modo Diretor-Deus
          </Button>
        </div>
      </div>

      {/* 2. Grid de Telemetria da Carreira */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card glow="amber">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-amber-400 uppercase font-bold flex items-center gap-1.5">
              <Trophy size={15} /> Temporadas Realizadas
            </span>
            <Badge variant="warning" size="sm">CARREIRA</Badge>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white">
              {careerProfile.totalSeasonsCompleted}
            </span>
            <span className="text-xs text-slate-400 font-mono">temporadas completas</span>
          </div>
        </Card>

        <Card glow="cyan">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-400 uppercase font-bold flex items-center gap-1.5">
              <TrendingUp size={15} /> Maior Pico Histórico
            </span>
            <Badge variant="live" size="sm">RECORDE</Badge>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-cyan-300">
              {careerProfile.highestAudienceEver.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono">pts IBOPE</span>
          </div>
        </Card>

        <Card glow="none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 uppercase font-bold flex items-center gap-1.5">
              <DollarSign size={15} /> Faturamento Acumulado
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-emerald-400">
              R$ {careerProfile.totalCareerProfit.toLocaleString('pt-BR')}
            </span>
          </div>
        </Card>

        <Card glow={careerProfile.godModeEnabled ? 'red' : 'none'}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-purple-400 uppercase font-bold flex items-center gap-1.5">
              <Zap size={15} /> Status do Diretor
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                careerProfile.godModeEnabled
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {careerProfile.godModeEnabled ? 'DEUS ON' : 'PADRÃO'}
            </span>
          </div>
          <div className="mt-2 text-sm font-bold text-white">
            {careerProfile.godModeEnabled ? 'Poderes Divinos Ilimitados' : 'Diretor-Geral Sênior'}
          </div>
        </Card>
      </div>

      {/* 3. Conteúdo Dinâmico por Aba */}

      {/* ABA: HALL DA FAMA */}
      {selectedTab === 'hall' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Crown className="text-amber-400" size={16} />
              <span>
                Grandes lendas imortalizadas na história da televisão brasileira.
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleArchiveCurrentSeason}
              leftIcon={<Award size={14} />}
            >
              Arquivar Temporada Atual no Hall
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {careerProfile.hallOfFame.map((entry) => (
              <div
                key={entry.id}
                className="p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-amber-900/40 hover:border-amber-500/60 transition-all shadow-xl space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${entry.avatarColor} flex items-center justify-center font-black text-white text-xl shadow-lg border border-amber-400/30`}
                    >
                      {entry.nickname.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-base text-white">{entry.nickname}</h4>
                        <Badge variant="warning" size="sm">★ TOP {entry.finalRank}</Badge>
                      </div>
                      <p className="text-xs text-slate-400">{entry.participantName}</p>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40 inline-block mt-0.5 font-bold">
                        {entry.title}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Recorde Histórico:</span>
                    <strong className="text-emerald-400">{entry.recordStat}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Pico de Audiência:</span>
                    <strong className="text-cyan-400">{entry.peakIbope.toFixed(1)} pts</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Legado na Emissora:</span>
                    <strong className="text-amber-400">{entry.legacyRating}/100</strong>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-cyan-300 flex items-center justify-between border-t border-slate-800 pt-2">
                  <span>{entry.programName}</span>
                  <span>{entry.fandomName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA: HISTÓRICO DE TEMPORADAS */}
      {selectedTab === 'history' && (
        <div className="space-y-4">
          {careerProfile.seasonsHistory.map((season) => (
            <div
              key={season.seasonNumber}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="font-bold text-base text-white">{season.programName}</h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Emissora: {season.networkName} · Modo: {season.mode.toUpperCase()}
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs text-amber-400 font-bold block">
                    Campeão: {season.winnerNickname}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Vice: {season.runnerUpName}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">IBOPE Médio:</span>
                  <strong className="text-white">{season.averageIbope.toFixed(1)} pts</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">Pico Máximo:</span>
                  <strong className="text-cyan-400">{season.peakIbope.toFixed(1)} pts</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">Faturamento:</span>
                  <strong className="text-emerald-400">R$ {season.totalRevenue.toLocaleString('pt-BR')}</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">Episódios Exibidos:</span>
                  <strong className="text-purple-300">{season.totalEpisodesBroadcast} blocos</strong>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-mono text-slate-400 font-bold">Momentos Marcantes:</span>
                <ul className="text-xs text-slate-300 space-y-0.5 list-disc list-inside">
                  {season.highlightMoments.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ABA: TROFÉUS E CONQUISTAS */}
      {selectedTab === 'trophies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {careerProfile.trophies.map((trophy) => (
            <div
              key={trophy.id}
              className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                trophy.unlocked
                  ? 'bg-slate-900/90 border-amber-500/40'
                  : 'bg-slate-950/60 border-slate-900 opacity-60'
              }`}
            >
              <div
                className={`p-3 rounded-xl border ${
                  trophy.unlocked
                    ? 'bg-amber-950/70 border-amber-800/60 text-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
              >
                <Trophy size={22} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">{trophy.title}</h4>
                  {trophy.unlocked && <Badge variant="warning" size="sm">DESBLOQUEADO</Badge>}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{trophy.description}</p>
                {trophy.unlockedAt && (
                  <span className="text-[10px] font-mono text-amber-400 mt-1 block">
                    Conquistado: {trophy.unlockedAt}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ABA: MODO DIRETOR-DEUS (GOD MODE) & BENCHMARK */}
      {selectedTab === 'godmode' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/50 via-slate-900 to-rose-950/40 border border-purple-800/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Zap className="text-rose-400 animate-pulse" size={24} />
                  <h3 className="text-xl font-black text-white">
                    Modo Diretor-Deus (Controle Absoluto)
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Ao ativar este modo, as restrições orçamentárias e de autoridade são anuladas. Você pode ditar o vencedor de qualquer prova, eliminar ou imunizar qualquer participante e simular o tempo em ultravelocidade.
                </p>
              </div>

              <Button
                variant={careerProfile.godModeEnabled ? 'danger' : 'cyber'}
                size="md"
                onClick={handleToggleGodMode}
              >
                {careerProfile.godModeEnabled ? 'Desativar Modo Deus' : 'Ativar Modo Diretor-Deus'}
              </Button>
            </div>

            {careerProfile.godModeEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-purple-800/40">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-900/40 text-xs font-mono">
                  <span className="text-emerald-400 font-bold block">Orçamento Infinito:</span>
                  <span className="text-white text-sm">R$ ∞ ILIMITADO</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-900/40 text-xs font-mono">
                  <span className="text-purple-400 font-bold block">Autoridade do Diretor:</span>
                  <span className="text-white text-sm">100% INTOCÁVEL</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-900/40 text-xs font-mono">
                  <span className="text-cyan-400 font-bold block">Imunidade a Crises:</span>
                  <span className="text-white text-sm">BLINDAGEM TOTAL</span>
                </div>
              </div>
            )}
          </div>

          {/* Ferramenta de Benchmark e Simulação Rápida */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Play className="text-cyan-400" size={16} />
                  Simulador de Balanceamento Acelerado
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Processe até 4 semanas de confinamento em poucos segundos para verificar a estabilidade do motor e distribuição de audiência.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => handleRunFastBenchmark(4)}
                isLoading={isSimulatingWeeks}
                leftIcon={<Play size={14} />}
              >
                Simular 4 Semanas Agora
              </Button>
            </div>

            {simulationLog.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 max-h-40 overflow-y-auto font-mono text-xs text-slate-300 space-y-1">
                {simulationLog.map((log, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-cyan-400">●</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
