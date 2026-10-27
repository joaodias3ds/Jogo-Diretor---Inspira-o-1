/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGameStore } from '@/app/useGameStore';
import { useAppStore } from '@/app/useAppStore';
import {
  DEFAULT_CHALLENGES_CATALOG,
  DIRECTOR_TWEAKS,
  executeChallenge,
} from '@/engine/challenges/challengeEngine';
import {
  ChallengeDefinition,
  ChallengeExecutionResult,
  DirectorTweakOption,
} from '@/engine/challenges/challengeTypes';
import {
  Trophy,
  Zap,
  Shield,
  Flame,
  Award,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Users,
  CheckCircle,
  Skull,
  Crown,
} from 'lucide-react';

export const ChallengeStudioScreen: React.FC = () => {
  const { cast, relationMatrix, cash, authority, advancePhase } = useGameStore();
  const { addToast: addAppToast } = useAppStore();

  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeDefinition>(
    DEFAULT_CHALLENGES_CATALOG[0]
  );
  const [selectedTweak, setSelectedTweak] = useState<DirectorTweakOption | undefined>(undefined);
  const [executionResult, setExecutionResult] = useState<ChallengeExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const eligibleCast = cast.filter((p) => !p.isEliminated);

  const handleStartChallenge = () => {
    // Validate budget
    if (cash < selectedChallenge.productionCost) {
      addAppToast(
        'error',
        'Orçamento Insuficiente',
        `Você precisa de R$ ${selectedChallenge.productionCost.toLocaleString('pt-BR')} para produzir esta prova.`
      );
      return;
    }

    // Validate authority if tweak selected
    if (selectedTweak && authority < selectedTweak.authorityCost) {
      addAppToast(
        'error',
        'Autoridade Insuficiente',
        `Você precisa de ${selectedTweak.authorityCost} pontos de Autoridade para interferir nos bastidores.`
      );
      return;
    }

    setIsRunning(true);
    setExecutionResult(null);

    setTimeout(() => {
      try {
        const result = executeChallenge(
          selectedChallenge,
          eligibleCast,
          relationMatrix,
          selectedTweak
        );
        setExecutionResult(result);

        // Update winner and penalties in store
        const winner = cast.find((p) => p.id === result.winnerId);
        if (winner) {
          // If Leader
          if (selectedChallenge.type === 'lider') {
            useGameStore.setState((state) => ({
              cast: state.cast.map((p) => ({
                ...p,
                isLeader: p.id === winner.id,
                isVIP: p.id === winner.id ? true : p.isVIP,
              })),
              cash: Math.max(0, state.cash - selectedChallenge.productionCost),
              authority: Math.max(0, state.authority - (selectedTweak?.authorityCost || 0)),
              ibope: Math.min(50, state.ibope + result.audienceGained),
            }));

            addAppToast(
              'success',
              `Novo Líder: ${winner.nickname}!`,
              `Conquistou a coroa, imunidade e o Quarto do Líder! Audiência subiu +${result.audienceGained} pts.`
            );
          } else if (selectedChallenge.type === 'anjo') {
            // Winner gets angel immunity, victims get Monster penalty
            const monsterIds = result.monstroAssignedIds || [];
            useGameStore.setState((state) => ({
              cast: state.cast.map((p) => {
                if (p.id === winner.id) {
                  return { ...p, isImmune: true };
                }
                if (monsterIds.includes(p.id)) {
                  return {
                    ...p,
                    isCastigo: true,
                    stats: {
                      ...p.stats,
                      stamina: Math.max(10, p.stats.stamina - 25),
                      mood: Math.max(10, p.stats.mood - 20),
                    },
                    states: {
                      ...p.states,
                      stress: Math.min(100, p.states.stress + 30),
                    },
                  };
                }
                return p;
              }),
              cash: Math.max(0, state.cash - selectedChallenge.productionCost),
              authority: Math.max(0, state.authority - (selectedTweak?.authorityCost || 0)),
              ibope: Math.min(50, state.ibope + result.audienceGained),
            }));

            addAppToast(
              'warning',
              `Anjo e Castigo do Monstro!`,
              `${winner.nickname} venceu o Anjo e castigou seus rivais no Monstro!`
            );
          } else if (selectedChallenge.type === 'bate-volta') {
            // Winner escapes nomination
            useGameStore.setState((state) => ({
              cast: state.cast.map((p) =>
                p.id === winner.id ? { ...p, isNominated: false } : p
              ),
              cash: Math.max(0, state.cash - selectedChallenge.productionCost),
              ibope: Math.min(50, state.ibope + result.audienceGained),
            }));

            addAppToast(
              'success',
              `Bate-e-Volta: ${winner.nickname} Salvo!`,
              `Escapou do paredão no último segundo e continua na disputa!`
            );
          } else {
            // General challenge reward
            useGameStore.setState((state) => ({
              cash: Math.max(0, state.cash - selectedChallenge.productionCost),
              ibope: Math.min(50, state.ibope + result.audienceGained),
            }));
          }
        }
      } catch (err) {
        addAppToast('error', 'Falha na Prova', 'Não foi possível rodar a prova.');
      } finally {
        setIsRunning(false);
      }
    }, 700);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={18} className="text-amber-400" />
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              ESTÚDIO DE PROVAS & DINÂMICAS OFICIAIS (FASE 5)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Arena de Competições do Diretor
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Agende e simule provas do Líder, Anjo com Castigo do Monstro, Bate-e-Volta e Sincerão. Interfira nos bastidores com pontos de Autoridade.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            <span className="text-slate-500">Caixa: </span>
            <strong className="text-emerald-400">R$ {cash.toLocaleString('pt-BR')}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            <span className="text-slate-500">Autoridade: </span>
            <strong className="text-purple-300">{authority} pts</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Catálogo de Provas */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider">
            1. SELECIONE O TIPO DE PROVA
          </h3>

          <div className="space-y-2.5">
            {DEFAULT_CHALLENGES_CATALOG.map((challenge) => {
              const isSelected = selectedChallenge.id === challenge.id;
              return (
                <div
                  key={challenge.id}
                  onClick={() => {
                    setSelectedChallenge(challenge);
                    setExecutionResult(null);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500 shadow-lg ring-1 ring-amber-500/50'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      {challenge.type === 'lider' && <Crown size={14} className="text-amber-400" />}
                      {challenge.type === 'anjo' && <Shield size={14} className="text-cyan-400" />}
                      {challenge.type === 'bate-volta' && <Zap size={14} className="text-emerald-400" />}
                      {challenge.type === 'sincerao' && <Flame size={14} className="text-rose-400" />}
                      {challenge.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-amber-300 uppercase">
                      {challenge.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                    {challenge.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2.5 pt-2 border-t border-slate-800/80">
                    <span>Custo: R$ {challenge.productionCost.toLocaleString('pt-BR')}</span>
                    <span className="text-emerald-400 font-bold">+{challenge.audienceBonus} IBOPE</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Configuração & Execução */}
        <div className="lg:col-span-7 space-y-4">
          {/* Card Detalhes da Prova Selecionada */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                2. PARÂMETROS & RECOMPENSAS
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {eligibleCast.length} participantes elegíveis
              </span>
            </div>

            <h4 className="text-lg font-bold text-white">{selectedChallenge.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedChallenge.description}</p>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">HABILIDADE-CHAVE</span>
                <span className="font-bold text-cyan-300 uppercase">{selectedChallenge.primarySkill}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">RODADAS</span>
                <span className="font-bold text-white">{selectedChallenge.roundsCount} etapas</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">PATROCÍNIO</span>
                <span className="font-bold text-amber-300 truncate block">
                  {selectedChallenge.sponsorName || 'Patrocínio Master'}
                </span>
              </div>
            </div>

            {/* Mexida do Diretor nos Bastidores */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] font-mono text-purple-300 font-bold uppercase tracking-wider block mb-2">
                MEXIDA NOS BASTIDORES (INTERVENÇÃO DO DIRETOR)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {DIRECTOR_TWEAKS.map((tweak) => {
                  const isTweakSelected = selectedTweak?.id === tweak.id;
                  return (
                    <button
                      key={tweak.id}
                      onClick={() =>
                        setSelectedTweak(isTweakSelected ? undefined : tweak)
                      }
                      className={`p-2 rounded-lg border text-left transition-all ${
                        isTweakSelected
                          ? 'bg-purple-950/80 border-purple-500 ring-1 ring-purple-500/50'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-white leading-tight">
                        {tweak.title.split(':')[0]}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-1 line-clamp-2">
                        {tweak.description}
                      </div>
                      <div className="text-[9px] font-mono text-purple-300 mt-1.5 font-bold">
                        Custa {tweak.authorityCost} Autoridade
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botão de Disparo */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                Custo de Produção: <strong>R$ {selectedChallenge.productionCost.toLocaleString('pt-BR')}</strong>
              </span>

              <button
                onClick={handleStartChallenge}
                disabled={isRunning}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
              >
                {isRunning ? (
                  <>
                    <RotateCcw size={14} className="animate-spin" />
                    Simulando Disputa na Arena...
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    Iniciar e Transmitir Prova
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Resultado da Prova */}
          {executionResult && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 to-amber-950/30 border border-amber-500/40 space-y-3 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={16} />
                  RESULTADO OFICIAL DA COMPETIÇÃO
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  +{executionResult.audienceGained} IBOPE
                </span>
              </div>

              {/* Vencedor */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-950/60 border border-amber-500/50">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow">
                  ★
                </div>
                <div>
                  <div className="text-xs font-mono text-amber-300 uppercase font-bold">
                    GRANDE CAMPEÃO(Ã)
                  </div>
                  <div className="text-base font-black text-white">
                    {executionResult.winnerNickname}
                  </div>
                  <div className="text-xs text-slate-300">
                    Venceu {executionResult.challenge.title} com pontuação máxima de habilidades!
                  </div>
                </div>
              </div>

              {/* Castigo do Monstro se aplicável */}
              {executionResult.monstroAssignedIds && executionResult.monstroAssignedIds.length > 0 && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-600/50 flex items-center gap-3">
                  <Skull size={24} className="text-rose-400 shrink-0" />
                  <div>
                    <div className="text-xs font-mono text-rose-300 uppercase font-bold">
                      CASTIGO DO MONSTRO ATRIBUÍDO
                    </div>
                    <div className="text-xs text-slate-200">
                      O Anjo {executionResult.winnerNickname} colocou no Monstro seus maiores rivais:{' '}
                      <strong className="text-rose-300">
                        {cast
                          .filter((p) => executionResult.monstroAssignedIds?.includes(p.id))
                          .map((p) => p.nickname)
                          .join(' e ')}
                      </strong>. Perda de estamina (-25) e explosão de estresse (+30).
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline de Rodadas */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  DESENROLAR DA PROVA (LOGS DE RODADA)
                </span>
                {executionResult.logs.map((log) => (
                  <div
                    key={log.round}
                    className="p-2 rounded bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                  >
                    <span className="text-[10px] font-mono text-cyan-400 bg-slate-950 px-1 py-0.2 rounded border border-cyan-800/40 shrink-0">
                      R{log.round}
                    </span>
                    <span className="leading-tight">{log.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
