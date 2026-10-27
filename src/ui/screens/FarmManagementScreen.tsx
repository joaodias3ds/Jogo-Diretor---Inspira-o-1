/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGameStore } from '@/app/useGameStore';
import { useAppStore } from '@/app/useAppStore';
import {
  FarmState,
  createInitialFarmState,
  simulateFarmDayTick,
} from '@/engine/farm/farmEngine';
import {
  Tractor,
  AlertTriangle,
  Sun,
  CloudRain,
  Snowflake,
  ShieldAlert,
  Users,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRightLeft,
  Flame,
  Award,
} from 'lucide-react';

export const FarmManagementScreen: React.FC = () => {
  const { cast, time, seasonConfig } = useGameStore();
  const { addToast } = useAppStore();

  const [farmState, setFarmState] = useState<FarmState>(createInitialFarmState());
  const [selectedChoreId, setSelectedChoreId] = useState<string | null>(null);

  // Weather icons
  const renderWeatherIcon = () => {
    switch (farmState.weather) {
      case 'tempestade_lama':
        return <CloudRain className="text-blue-400" size={18} />;
      case 'frio_geada':
        return <Snowflake className="text-cyan-300" size={18} />;
      default:
        return <Sun className="text-amber-400" size={18} />;
    }
  };

  const handleAssignChore = (choreId: string, participantId: string) => {
    const participant = cast.find((p) => p.id === participantId);
    if (!participant) return;

    setFarmState((prev) => ({
      ...prev,
      chores: prev.chores.map((c) =>
        c.id === choreId
          ? {
              ...c,
              assignedParticipantId: participant.id,
              assignedParticipantName: participant.name,
              completedToday: true,
            }
          : c
      ),
      animals: prev.animals.map((an) =>
        an.species === prev.chores.find((c) => c.id === choreId)?.targetSpecies
          ? {
              ...an,
              assignedParticipantId: participant.id,
              assignedParticipantName: participant.name,
              health: Math.min(100, an.health + 4),
            }
          : an
      ),
    }));

    addToast(
      'success',
      'Tarefa Designada!',
      `${participant.name} foi encarregado da tarefa pelo Fazendeiro.`
    );
  };

  const handleToggleBaia = (participantId: string) => {
    const participant = cast.find((p) => p.id === participantId);
    if (!participant) return;

    const isInBaia = farmState.baiaParticipantIds.includes(participantId);
    let nextBaia: string[];

    if (isInBaia) {
      nextBaia = farmState.baiaParticipantIds.filter((id) => id !== participantId);
      addToast('info', 'Saiu da Baia', `${participant.name} subiu para a Sede.`);
    } else {
      if (farmState.baiaParticipantIds.length >= 4) {
        addToast('warning', 'Baia Lotada', 'A baia suporta no máximo 4 participantes.');
        return;
      }
      nextBaia = [...farmState.baiaParticipantIds, participantId];
      addToast('warning', 'Confinado na Baia', `${participant.name} dormirá no estábulo com água fria!`);
    }

    setFarmState((prev) => ({ ...prev, baiaParticipantIds: nextBaia }));
  };

  const handleTriggerSirenPunishment = () => {
    setFarmState((prev) => ({
      ...prev,
      collectivePunishmentActive: true,
      activePunishmentMessage:
        'SIRENE DA ROÇA TOCADA PELO DIRETOR: 48h sem água quente e sem gás na cozinha!',
    }));
    addToast('error', 'Sirene da Roça Acionada!', 'Punição coletiva aplicada a todos os peões da Fazenda.');
  };

  const handleSimulateRuralTick = () => {
    const { updatedState, events } = simulateFarmDayTick(farmState);
    setFarmState(updatedState);
    if (events.length > 0) {
      addToast('warning', 'Acontecimentos no Campo', events[0]);
    } else {
      addToast('success', 'Manejo Rural Concluído', 'Os animais foram tratados e o clima mudou.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Tractor size={24} />
            </span>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                A Fazenda: Trato dos Animais, Baia & Roça Rural
              </h2>
              <p className="text-xs text-slate-400">
                Modo Rural Ativo • Temporada: {seasonConfig.programName} • Dia {time.day} ({time.phase})
              </p>
            </div>
          </div>
        </div>

        {/* Quick Weather & Farm Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs">
            {renderWeatherIcon()}
            <span className="text-slate-300 font-medium capitalize">
              Clima: {farmState.weather.replace('_', ' ')}
            </span>
          </div>

          <button
            onClick={handleSimulateRuralTick}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shadow-md"
          >
            <Clock size={14} /> Simular Rotina Rural
          </button>

          <button
            onClick={handleTriggerSirenPunishment}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/40 flex items-center gap-1.5"
          >
            <ShieldAlert size={14} /> Soar Sirene da Roça
          </button>
        </div>
      </div>

      {/* COLLECTIVE PUNISHMENT BANNER (IF ACTIVE) */}
      {farmState.collectivePunishmentActive && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-300 uppercase tracking-wide">
                Punição Coletiva em Andamento na Sede
              </h4>
              <p className="text-xs text-rose-200">{farmState.activePunishmentMessage}</p>
            </div>
          </div>
          <button
            onClick={() =>
              setFarmState((prev) => ({
                ...prev,
                collectivePunishmentActive: false,
                activePunishmentMessage: null,
              }))
            }
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold"
          >
            Revogar Punição
          </button>
        </div>
      )}

      {/* 1. LIVESTOCK ANIMALS ROW */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Sparkles size={16} /> Animais da Fazenda & Saúde Agropecuária
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {farmState.animals.map((an) => (
            <div
              key={an.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-4 shadow-xl space-y-3 hover:border-amber-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white">{an.name}</h4>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    an.health > 70
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  Saúde: {an.health}%
                </span>
              </div>

              <p className="text-[11px] text-slate-400">{an.statusNotes}</p>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Felicidade:</span>
                  <span className="font-semibold text-amber-300">{an.happiness}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Produção Diária:</span>
                  <span className="font-semibold text-emerald-400">
                    {an.currentProduction} {an.productionName}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Cuidador Atual:</span>
                  <span className="font-bold text-cyan-300">
                    {an.assignedParticipantName || 'Nenhum peão'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. CHORES & TASKS ASSIGNMENT (FAZENDEIRO DECREE) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <CheckCircle className="text-emerald-400" size={17} />
              Obrigações Rurais & Escala de Trabalho do Fazendeiro
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Estoque de Alimentos: {farmState.milkStockLiters}L Leite • {farmState.eggsStock} Ovos
            </span>
          </div>

          <div className="space-y-3">
            {farmState.chores.map((chore) => (
              <div
                key={chore.id}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                    <h4 className="text-xs font-bold text-white">{chore.title}</h4>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      Turno: {chore.period}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      chore.completedToday
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {chore.completedToday ? 'Concluída Hoje' : 'Pendente de Trato'}
                  </span>
                </div>

                <p className="text-xs text-slate-300">{chore.description}</p>
                <p className="text-[11px] text-rose-300 font-mono">
                  🚨 <strong>Se esquecer:</strong> {chore.punishmentIfNeglected}
                </p>

                {/* Assignment selector */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-700/40">
                  <span className="text-xs text-slate-400">Designar Peão:</span>
                  <select
                    value={chore.assignedParticipantId || ''}
                    onChange={(e) => handleAssignChore(chore.id, e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="">Selecione um participante...</option>
                    {cast.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {farmState.baiaParticipantIds.includes(p.id) ? '(Baia)' : '(Sede)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. BAIA VS SEDE ROSTER (1 col) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <Users size={16} /> A Baia dos Punidos ({farmState.baiaParticipantIds.length} / 4)
            </h3>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
              Água Fria & Estábulo
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Moradores da Baia não podem dormir na Sede, usam baldes para banho e ficam mais vulneráveis à
            Roça Rural.
          </p>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {cast.map((p) => {
              const inBaia = farmState.baiaParticipantIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    inBaia
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                      : 'bg-slate-800/40 border-slate-700/40 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white">{p.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {inBaia ? 'Confinado na Baia' : 'Acomodado na Sede'}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleBaia(p.id)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                      inBaia
                        ? 'bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {inBaia ? 'Subir p/ Sede' : 'Mandar p/ Baia'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
