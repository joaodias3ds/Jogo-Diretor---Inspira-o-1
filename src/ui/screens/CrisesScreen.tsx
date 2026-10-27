/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGameStore } from '@/app/useGameStore';
import { useAppStore } from '@/app/useAppStore';
import {
  CrisisEvent,
  CrisisOption,
  generateRandomCrisis,
} from '@/engine/crises/crisesEngine';
import {
  AlertTriangle,
  ShieldAlert,
  Flame,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  DollarSign,
  Radio,
  Clock,
  Sparkles,
} from 'lucide-react';

export const CrisesScreen: React.FC = () => {
  const { cash, ibope, reputation, authority, time } = useGameStore();
  const { addToast } = useAppStore();

  const [activeCrises, setActiveCrises] = useState<CrisisEvent[]>([
    generateRandomCrisis(time.day),
  ]);
  const [resolvedCrises, setResolvedCrises] = useState<CrisisEvent[]>([]);

  const handleResolveOption = (crisisId: string, option: CrisisOption) => {
    // Check resources
    if (cash < option.cashCost) {
      addToast('error', 'Saldo Insuficiente', `Essa opção exige R$ ${option.cashCost.toLocaleString('pt-BR')}.`);
      return;
    }
    if (authority < option.authorityCost) {
      addToast('error', 'Autoridade Insuficiente', `Essa opção exige ${option.authorityCost} pontos de autoridade.`);
      return;
    }

    // Apply store updates
    useGameStore.setState((state) => ({
      cash: Math.max(0, state.cash - option.cashCost),
      authority: Math.max(0, state.authority - option.authorityCost),
      ibope: Math.max(10, Math.min(50, state.ibope + option.ibopeDelta)),
      reputation: Math.max(0, Math.min(100, state.reputation + option.reputationDelta)),
    }));

    const crisis = activeCrises.find((c) => c.id === crisisId);
    if (crisis) {
      const resolved = { ...crisis, resolved: true, chosenOptionId: option.id };
      setActiveCrises((prev) => prev.filter((c) => c.id !== crisisId));
      setResolvedCrises((prev) => [resolved, ...prev]);
    }

    addToast('success', 'Crise Resolvida pelo Diretor!', option.outcomeText);
  };

  const handleTriggerSimulatedCrisis = () => {
    const newCrisis = generateRandomCrisis(time.day);
    setActiveCrises((prev) => [newCrisis, ...prev]);
    addToast('warning', 'Nova Crise Emergente!', `${newCrisis.title} exige intervenção da diretoria!`);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="text-rose-500" size={26} />
            Central de Gerenciamento de Crises
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sala de guerra da diretoria. Tome decisões executivas rápidas para conter escândalos e proteger o programa.
          </p>
        </div>

        <button
          onClick={handleTriggerSimulatedCrisis}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2 shadow-lg shadow-rose-950/40 transition-all self-start md:self-auto"
        >
          <Flame size={15} /> Simular Alerta de Crise
        </button>
      </div>

      {/* ACTIVE CRISES LIST */}
      <div className="space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
          <AlertTriangle size={16} /> Crises Ativas Requerendo Decisão ({activeCrises.length})
        </h3>

        {activeCrises.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-slate-800 text-center space-y-2">
            <CheckCircle className="mx-auto text-emerald-400" size={32} />
            <h4 className="text-sm font-bold text-white">Nenhuma Crise Aberta no Momento</h4>
            <p className="text-xs text-slate-400">
              A produção está sob controle. Continue transmitindo e monitorando os participantes.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeCrises.map((crisis) => (
              <div
                key={crisis.id}
                className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-rose-950/20 backdrop-blur-xl p-5 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      Gravidade: {crisis.severity}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Categoria: {crisis.category} • Dia {crisis.createdAtDay}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white mb-1">{crisis.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{crisis.description}</p>
                </div>

                {/* Director Choice Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                  {crisis.options.map((option) => (
                    <div
                      key={option.id}
                      className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-4 flex flex-col justify-between space-y-3 hover:border-cyan-500/50 transition-all group"
                    >
                      <div>
                        <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {option.label}
                        </h5>
                        <p className="text-[11px] text-slate-400 mt-1">{option.description}</p>

                        <div className="mt-3 pt-2 border-t border-slate-700/50 space-y-1 text-[10px] font-mono">
                          {option.cashCost > 0 && (
                            <div className="flex justify-between text-rose-300">
                              <span>Custo Financeiro:</span>
                              <strong>-R$ {option.cashCost.toLocaleString('pt-BR')}</strong>
                            </div>
                          )}
                          {option.authorityCost > 0 && (
                            <div className="flex justify-between text-amber-300">
                              <span>Custo Autoridade:</span>
                              <strong>-{option.authorityCost} pts</strong>
                            </div>
                          )}
                          <div className="flex justify-between text-cyan-300">
                            <span>Impacto no IBOPE:</span>
                            <strong>
                              {option.ibopeDelta >= 0 ? '+' : ''}
                              {option.ibopeDelta.toFixed(1)} pts
                            </strong>
                          </div>
                          <div className="flex justify-between text-emerald-300">
                            <span>Reputação da Emissora:</span>
                            <strong>
                              {option.reputationDelta >= 0 ? '+' : ''}
                              {option.reputationDelta} pts
                            </strong>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleResolveOption(crisis.id, option)}
                        className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
                      >
                        Executar Decisão
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RESOLVED CRISES HISTORY */}
      {resolvedCrises.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <CheckCircle size={14} className="text-emerald-400" /> Histórico de Crises Contidas na Temporada
          </h3>
          <div className="space-y-2">
            {resolvedCrises.map((rc) => (
              <div
                key={rc.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-white">{rc.title}</span>
                  <span className="text-slate-400 text-[11px] ml-2">Dia {rc.createdAtDay}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Resolvida
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
