/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGameStore } from '@/app/useGameStore';
import { useAppStore } from '@/app/useAppStore';
import {
  SponsorContract,
  StaffMember,
  ProductionUpgrade,
  DirectorAchievement,
  INITIAL_SPONSORS,
  INITIAL_STAFF,
  INITIAL_UPGRADES,
  INITIAL_ACHIEVEMENTS,
  calculateWeeklyFinance,
} from '@/engine/economy/economyEngine';
import {
  DollarSign,
  Briefcase,
  Award,
  Zap,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  Users,
  ChevronRight,
  BookOpen,
  Lock,
  Sparkles,
} from 'lucide-react';

export const EconomySponsorsScreen: React.FC = () => {
  const { cash, ibope, reputation, authority, time } = useGameStore();
  const { addToast } = useAppStore();

  const [activeTab, setActiveTab] = useState<'sponsors' | 'staff' | 'upgrades' | 'achievements'>('sponsors');
  const [sponsors, setSponsors] = useState<SponsorContract[]>(INITIAL_SPONSORS);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [upgrades, setUpgrades] = useState<ProductionUpgrade[]>(INITIAL_UPGRADES);
  const [achievements, setAchievements] = useState<DirectorAchievement[]>(INITIAL_ACHIEVEMENTS);

  const finances = calculateWeeklyFinance(sponsors, staff, ibope);

  const handleSignSponsor = (id: string) => {
    setSponsors((prev) =>
      prev.map((s) => (s.id === id ? { ...s, signed: true, brandActionsDone: 1 } : s))
    );
    const sponsor = sponsors.find((s) => s.id === id);
    addToast(
      'success',
      'Contrato Assinado!',
      `Cota fechada com ${sponsor?.brandName} (+R$ ${sponsor?.weeklyRevenue.toLocaleString('pt-BR')}/semana).`
    );
  };

  const handlePerformBrandAction = (id: string) => {
    setSponsors((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              brandActionsDone: Math.min(s.targetBrandActions, s.brandActionsDone + 1),
              satisfaction: Math.min(100, s.satisfaction + 5),
            }
          : s
      )
    );
    addToast('info', 'Ação de Marca Concluída!', 'Satisfação do patrocinador aumentou em +5%.');
  };

  const handleToggleHire = (id: string) => {
    setStaff((prev) =>
      prev.map((st) => {
        if (st.id === id) {
          const nextHired = !st.hired;
          if (nextHired) {
            addToast('success', 'Profissional Contratado!', `${st.name} (${st.roleTitle}) integrado à equipe.`);
          } else {
            addToast('warning', 'Contrato Rescindido', `${st.name} desligado da produção.`);
          }
          return { ...st, hired: nextHired };
        }
        return st;
      })
    );
  };

  const handleUpgrade = (id: string) => {
    const item = upgrades.find((u) => u.id === id);
    if (!item) return;

    const currentCost = Math.round(item.baseCost * Math.pow(item.multiplier, item.level - 1));
    if (cash < currentCost) {
      addToast('error', 'Caixa Insuficiente', `Você precisa de R$ ${currentCost.toLocaleString('pt-BR')}.`);
      return;
    }

    // Deduct cash from store
    useGameStore.setState((state) => ({ cash: Math.max(0, state.cash - currentCost) }));

    setUpgrades((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, level: u.level + 1 } : u
      )
    );
    addToast('success', 'Upgrade Realizado!', `${item.title} evoluído para o Nível ${item.level + 1}!`);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <DollarSign className="text-emerald-400" size={26} />
            Patrocínios, Finanças & Tecnologia da Produção
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestão de cotas de publicidade, contratação de profissionais e melhorias técnicas do estúdio.
          </p>
        </div>

        {/* Global Finance Snapshot */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Saldo em Caixa</div>
            <div className="text-lg font-mono font-bold text-emerald-400">
              R$ {cash.toLocaleString('pt-BR')}
            </div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Balanço Semanal</div>
            <div className={`text-lg font-mono font-bold ${finances.netWeekly >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
              {finances.netWeekly >= 0 ? '+' : ''}R$ {finances.netWeekly.toLocaleString('pt-BR')}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-slate-800 gap-2 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sponsors')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'sponsors'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase size={15} /> Patrocinadores & Cotas ({sponsors.filter((s) => s.signed).length})
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'staff'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users size={15} /> Equipe de Produção ({staff.filter((s) => s.hired).length})
        </button>
        <button
          onClick={() => setActiveTab('upgrades')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'upgrades'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap size={15} /> Upgrades de Estúdio ({upgrades.length})
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'achievements'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award size={15} /> Conquistas do Diretor
        </button>
      </div>

      {/* TAB 1: SPONSORS */}
      {activeTab === 'sponsors' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sponsors.map((sp) => {
              const tierBadgeColor =
                sp.tier === 'master'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : sp.tier === 'ouro'
                  ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                  : 'bg-slate-700/40 text-slate-300 border-slate-600/40';

              return (
                <div
                  key={sp.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${tierBadgeColor}`}>
                        Cota {sp.tier}
                      </span>
                      {sp.signed ? (
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                          <CheckCircle size={13} /> Contrato Ativo
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">Proposta Aberta</span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white mb-1">{sp.brandName}</h3>
                    <p className="text-xs text-slate-300 mb-3">{sp.bonusEffect}</p>

                    <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Receita Semanal:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          R$ {sp.weeklyRevenue.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ibope Mínimo Exigido:</span>
                        <span className="font-mono text-cyan-300">{sp.minimumIbope.toFixed(1)} pts</span>
                      </div>
                      {sp.signed && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Satisfação da Marca:</span>
                            <span className="font-bold text-amber-400">{sp.satisfaction}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Ações Realizadas:</span>
                            <span className="font-semibold text-white">
                              {sp.brandActionsDone} / {sp.targetBrandActions}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    {sp.signed ? (
                      <button
                        onClick={() => handlePerformBrandAction(sp.id)}
                        disabled={sp.brandActionsDone >= sp.targetBrandActions}
                        className="w-full py-2 bg-emerald-600/30 hover:bg-emerald-600/50 disabled:opacity-40 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Sparkles size={14} /> Fazer Ação de Merchandising
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSignSponsor(sp.id)}
                        className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all"
                      >
                        Assinar Contrato de Cota
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: STAFF */}
      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((st) => (
            <div
              key={st.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-cyan-500/30 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    {st.roleTitle}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Nível {st.level}</span>
                </div>

                <h3 className="text-base font-bold text-white mb-0.5">{st.name}</h3>
                <p className="text-xs text-slate-400 mb-3">{st.specialty}</p>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Salário Semanal:</span>
                    <span className="font-mono text-amber-400 font-bold">
                      R$ {st.salaryPerWeek.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="text-[11px] text-cyan-200 pt-1">
                    <strong>Bônus:</strong> {st.bonusDescription}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleToggleHire(st.id)}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                  st.hired
                    ? 'bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/40'
                }`}
              >
                {st.hired ? 'Demitir / Rescindir' : 'Contratar para a Temporada'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: UPGRADES */}
      {activeTab === 'upgrades' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upgrades.map((up) => {
            const cost = Math.round(up.baseCost * Math.pow(up.multiplier, up.level - 1));
            const isMax = up.level >= up.maxLevel;

            return (
              <div
                key={up.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-purple-500/30 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                      Categoria: {up.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      Nível {up.level} / {up.maxLevel}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{up.title}</h3>
                  <p className="text-xs text-slate-400 mb-3">{up.description}</p>

                  <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200">
                    <strong>Efeito Ativo:</strong> {up.currentBenefit}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-400">
                    Custo Próximo Nível:{' '}
                    <strong className="text-emerald-400 font-mono">
                      {isMax ? 'MÁXIMO' : `R$ ${cost.toLocaleString('pt-BR')}`}
                    </strong>
                  </span>
                  <button
                    onClick={() => handleUpgrade(up.id)}
                    disabled={isMax || cash < cost}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    {isMax ? 'Nível Máximo' : 'Evoluir Upgrade'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: ACHIEVEMENTS */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl flex items-start gap-4"
            >
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Award size={24} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{ach.title}</h4>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    +R$ {ach.cashReward.toLocaleString('pt-BR')}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{ach.description}</p>
                <div className="pt-2">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Progresso</span>
                    <span>
                      {ach.progress} / {ach.maxProgress}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-400 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, (ach.progress / ach.maxProgress) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
