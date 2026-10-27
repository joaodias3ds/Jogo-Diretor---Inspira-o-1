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
  createDynamicFandoms,
  settleDirectorBolao,
} from '@/engine/ai-audience/aiViewerEngine';
import { DirectorBolaoBet, FandomGroup } from '@/engine/ai-audience/viewerTypes';
import { soundFx } from '@/audio/audioManager';
import {
  Trophy,
  Users,
  Flame,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  DollarSign,
  Award,
} from 'lucide-react';

export const FantasyAudienceScreen: React.FC = () => {
  const { cast, time, authority, reputation, saveGame } = useGameStore();
  const { addToast } = useAppStore();

  const [activeFandoms] = useState<FandomGroup[]>(() => createDynamicFandoms(cast));
  const [selectedLeaderBet, setSelectedLeaderBet] = useState<string>(cast[0]?.id || '');
  const [selectedEliminatedBet, setSelectedEliminatedBet] = useState<string>(cast[1]?.id || '');
  const [stakeAuthority, setStakeAuthority] = useState<number>(15);
  const [activeBet, setActiveBet] = useState<DirectorBolaoBet | null>(null);

  const handlePlaceBolaoBet = () => {
    if (authority < stakeAuthority) {
      addToast('error', 'Autoridade Insuficiente', `Você precisa de ${stakeAuthority} pts de Autoridade.`);
      return;
    }

    soundFx.playOnAirChime();
    useGameStore.setState((state) => ({ authority: state.authority - stakeAuthority }));

    const newBet: DirectorBolaoBet = {
      week: time.week,
      predictedWinnerLiderId: selectedLeaderBet,
      predictedEliminatedId: selectedEliminatedBet,
      stakeAuthority,
      settled: false,
      won: false,
      rewardReputation: 0,
    };

    setActiveBet(newBet);
    addToast(
      'success',
      'Palpite do Bolão Registrado!',
      `Apostados ${stakeAuthority} pts de Autoridade nas previsões da semana ${time.week}.`
    );
  };

  const handleSimulateSettlement = () => {
    if (!activeBet) return;
    soundFx.playOnAirChime();

    // Simula resolução do bolão usando o primeiro participante ativo
    const actualLeader = cast.find((p) => !p.isEliminated);
    const actualEliminated = cast.find((p) => p.isEliminated) || cast[cast.length - 1];

    const { updatedBet, authorityDiff, reputationDiff, message } = settleDirectorBolao(
      activeBet,
      actualLeader?.id,
      actualEliminated?.id
    );

    setActiveBet(updatedBet);

    useGameStore.setState((state) => ({
      authority: Math.min(100, Math.max(0, state.authority + authorityDiff)),
      reputation: Math.min(100, Math.max(0, state.reputation + reputationDiff)),
    }));

    addToast(updatedBet.won ? 'success' : 'warning', 'Resultado do Bolão', message);
  };

  return (
    <div className="space-y-6">
      {/* Header Fantasy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="info" size="sm">FANTASY GAME & BOLÃO</Badge>
            <span className="text-xs font-mono text-slate-400">FASE 7 (4.5C)</span>
          </div>
          <h2 className="text-xl font-black text-white">Ligas de Fandoms & Bolão do Diretor</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            A plateia de IA não só assiste e vota: ela monta times semanais e compete em ligas de torcidas organizadas.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-cyan-950/40 px-3 py-1.5 rounded-lg border border-cyan-800/40">
          <span>Reputação do Diretor: <strong>{reputation}%</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 & 2: Torcidas e Fandoms em Alta */}
        <div className="space-y-4 lg:col-span-2">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Flame size={16} className="text-amber-400" />
            <span>Fandoms e Torcidas em Destaque no Brasil</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeFandoms.map((fandom) => (
              <Card key={fandom.id} className="space-y-3 bg-slate-950/60 border-slate-800/80">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{fandom.name}</h4>
                    <span className="text-xs font-mono text-cyan-400">{fandom.hashtag}</span>
                  </div>
                  <Badge variant={fandom.sentiment === 'amoroso' ? 'success' : 'warning'} size="sm">
                    {fandom.sentiment.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-t border-slate-800/80 pt-2 text-slate-400">
                  <div>
                    <div>MEMBROS ATIVOS:</div>
                    <div className="text-white font-bold">{fandom.activeMembersCount.toLocaleString('pt-BR')}</div>
                  </div>
                  <div>
                    <div>PODER DE MUTIRÃO:</div>
                    <div className="text-amber-400 font-bold">{fandom.mutiraoIntensity}/10</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Coluna 3: Bolão do Diretor */}
        <div className="space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Trophy size={16} className="text-cyan-400" />
            <span>Bolão da Produção</span>
          </h3>

          <Card glow="cyan" className="space-y-4 bg-slate-950/80">
            <p className="text-xs text-slate-300 leading-relaxed">
              Arrisque seus pontos de Autoridade palpando o que o público e a casa vão fazer. Acertos aumentam sua reputação diante da emissora!
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Quem vence a Prova do Líder?</label>
                <select
                  value={selectedLeaderBet}
                  onChange={(e) => setSelectedLeaderBet(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                >
                  {cast.filter((p) => !p.isEliminated).map((p) => (
                    <option key={p.id} value={p.id}>{p.nickname}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Quem será eliminado no Paredão?</label>
                <select
                  value={selectedEliminatedBet}
                  onChange={(e) => setSelectedEliminatedBet(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                >
                  {cast.filter((p) => !p.isEliminated).map((p) => (
                    <option key={p.id} value={p.id}>{p.nickname}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Aposta de Autoridade: {stakeAuthority} pts</label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={stakeAuthority}
                  onChange={(e) => setStakeAuthority(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {!activeBet ? (
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={handlePlaceBolaoBet}
                >
                  Registrar Aposta no Bolão
                </Button>
              ) : (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-300">
                    Palpite ativo para Semana {activeBet.week}! Stake: {activeBet.stakeAuthority} pts.
                  </div>
                  {!activeBet.settled && (
                    <Button
                      variant="cyber"
                      size="sm"
                      className="w-full"
                      onClick={handleSimulateSettlement}
                    >
                      Apurar Resultados do Bolão
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
