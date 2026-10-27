/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGameStore } from '@/app/useGameStore';
import { useAppStore } from '@/app/useAppStore';
import { Participant } from '@/engine/housemates/types';
import { Card } from '@/ui/components/Card';
import { Button } from '@/ui/components/Button';
import { Badge } from '@/ui/components/Badge';
import {
  Users,
  Flame,
  Sparkles,
  UserPlus,
  UserMinus,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Award,
  Crown,
  Shield,
  Search,
  Filter,
  Eye,
  CheckCircle,
  HelpCircle,
  DollarSign,
  Radio,
} from 'lucide-react';
import { soundFx } from '@/audio/audioManager';

export const RosterManagementScreen: React.FC = () => {
  const {
    cast,
    reserveBench,
    cash,
    ibope,
    authority,
    hireHousemateFromBench,
    fireHousemateByDirector,
    substituteHousemateWithReserve,
    openParticipantDetail,
    toggleVIP,
  } = useGameStore();

  const { addToast } = useAppStore();

  const [activeTab, setActiveTab] = useState<'active' | 'bench'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForSub, setSelectedForSub] = useState<Participant | null>(null);
  const [targetReserveForSub, setTargetReserveForSub] = useState<Participant | null>(null);
  const [evictConfirmTarget, setEvictConfirmTarget] = useState<Participant | null>(null);
  const [evictionReason, setEvictionReason] = useState('Decisão Editorial da Direção para Ferver a Temporada');

  const activeCast = cast.filter((p) => !p.isEliminated);

  // Telemetria de Carisma e Controvérsia da Temporada
  const avgCharisma = activeCast.length > 0
    ? Math.round(activeCast.reduce((acc, p) => acc + (p.charisma ?? 70), 0) / activeCast.length)
    : 70;

  const avgControversy = activeCast.length > 0
    ? Math.round(activeCast.reduce((acc, p) => acc + (p.controversy ?? 50), 0) / activeCast.length)
    : 50;

  const projectedAudience = parseFloat((ibope + (avgCharisma * 0.08) + (avgControversy * 0.06)).toFixed(1));

  // Filtragem
  const filteredActive = activeCast.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.archetype && p.archetype.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredBench = reserveBench.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.archetype && p.archetype.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleHireFromBench = (candidate: Participant) => {
    const cost = (candidate.weeklySalary || 12000) * 2;
    if (cash < cost) {
      addToast('error', 'Orçamento Insuficiente', `Necessário R$ ${cost.toLocaleString('pt-BR')} para contratar.`);
      return;
    }
    const ok = hireHousemateFromBench(candidate.id);
    if (ok) {
      addToast(
        'success',
        'Novo Confinado na Casa!',
        `${candidate.name} ("${candidate.nickname}") assinou e já entrou no reality! Audiência subiu!`
      );
    }
  };

  const handleConfirmEvict = () => {
    if (!evictConfirmTarget) return;
    fireHousemateByDirector(evictConfirmTarget.id, evictionReason);
    addToast(
      'warning',
      'EXPULSÃO / DESQUALIFICAÇÃO!',
      `A Direção retirou ${evictConfirmTarget.nickname} do programa (${evictionReason}). A internet está em polvorosa!`
    );
    setEvictConfirmTarget(null);
  };

  const handleConfirmSubstitution = () => {
    if (!selectedForSub || !targetReserveForSub) return;
    const ok = substituteHousemateWithReserve(selectedForSub.id, targetReserveForSub.id);
    if (ok) {
      addToast(
        'success',
        'Substituição Concluída!',
        `${selectedForSub.nickname} deu lugar a ${targetReserveForSub.nickname} da Casa de Vidro!`
      );
      setSelectedForSub(null);
      setTargetReserveForSub(null);
    } else {
      addToast('error', 'Falha na Substituição', 'Saldo insuficiente ou participante indisponível.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
      {/* 1. Header & Telemetria de Carisma e Controvérsia */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs font-mono">
            <span className="text-cyan-400 font-bold tracking-wider">DIREÇÃO DE CASTING</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
              ESCALA DO ELENCO
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="text-cyan-400" size={28} />
            Escala de Participantes & Mecânica de Impacto
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Gerencie o elenco ativo da temporada. Contrate revelações, demita participantes sem engajamento ou substitua moradores por suplentes da Casa de Vidro.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'active' ? 'primary' : 'ghost'}
            size="md"
            onClick={() => setActiveTab('active')}
          >
            Confinados Ativos ({activeCast.length})
          </Button>
          <Button
            variant={activeTab === 'bench' ? 'primary' : 'ghost'}
            size="md"
            onClick={() => setActiveTab('bench')}
            leftIcon={<Sparkles size={15} />}
          >
            Casa de Vidro & Reservas ({reserveBench.length})
          </Button>
        </div>
      </div>

      {/* 2. Grid de Telemetria de Audiência (Carisma vs Controvérsia) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Carisma */}
        <Card glow="cyan">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-400 uppercase font-bold flex items-center gap-1.5">
              <Sparkles size={15} /> Carisma Médio do Elenco
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              +{(avgCharisma * 0.08).toFixed(1)} IBOPE Base
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white">{avgCharisma}</span>
            <span className="text-xs text-slate-400 font-mono">/ 100 pts</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${avgCharisma}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Carisma alto fideliza o público do sofá, melhora a imagem com patrocinadores e retém a audiência média.
          </p>
        </Card>

        {/* Card Controvérsia */}
        <Card glow="amber">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-amber-400 uppercase font-bold flex items-center gap-1.5">
              <Flame size={15} /> Controvérsia do Elenco
            </span>
            <span className="text-xs font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
              +{(avgControversy * 0.06).toFixed(1)} Pico Ao Vivo
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white">{avgControversy}</span>
            <span className="text-xs text-slate-400 font-mono">/ 100 pts</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div
              className="bg-gradient-to-r from-amber-500 to-rose-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${avgControversy}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Controvérsia gera tretas, velocidade viral no Twitter e picos gigantescos de audiência às terças-feiras.
          </p>
        </Card>

        {/* Audiência Projetada */}
        <Card glow="none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-purple-400 uppercase font-bold flex items-center gap-1.5">
              <TrendingUp size={15} /> Audiência Projetada
            </span>
            <Badge variant="live" size="sm">POTENCIAL</Badge>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-purple-300">{projectedAudience}</span>
            <span className="text-xs text-slate-400 font-mono">pts IBOPE</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2 font-mono">
            <span>Ao Vivo Atual: {ibope.toFixed(1)} pts</span>
            <span className="text-cyan-400">Pico Esperado: {(projectedAudience + 3.2).toFixed(1)}</span>
          </div>
        </Card>

        {/* Recursos da Direção */}
        <Card glow="none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 uppercase font-bold flex items-center gap-1.5">
              <DollarSign size={15} /> Caixa para Contratos
            </span>
            <span className="text-xs font-mono text-slate-400">Autoridade: {authority}%</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-emerald-400">
              R$ {cash.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2 font-mono">
            <span>Vagas Ocupadas: {activeCast.length}</span>
            <span className="text-amber-400">Reservas Prontos: {reserveBench.length}</span>
          </div>
        </Card>
      </div>

      {/* 3. Barra de Busca e Filtro */}
      <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nome, apelido ou arquétipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono hidden sm:block">
          Mostrando {activeTab === 'active' ? filteredActive.length : filteredBench.length} participantes
        </div>
      </div>

      {/* 4. Lista do Elenco Ativo */}
      {activeTab === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActive.map((p) => {
            const char = p.charisma ?? 70;
            const cont = p.controversy ?? 50;
            return (
              <div
                key={p.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 relative group"
              >
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${p.avatarColor} flex items-center justify-center font-bold text-white text-base shadow-md border border-white/10 shrink-0`}
                    >
                      {p.nickname.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-sm text-white">{p.nickname}</h4>
                        {p.isVIP ? (
                          <Badge variant="warning" size="sm">VIP</Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">XEPA</Badge>
                        )}
                        {p.isLeader && <Badge variant="warning" size="sm">LÍDER</Badge>}
                        {p.isImmune && <Badge variant="success" size="sm">IMUNE</Badge>}
                        {p.isNominated && <Badge variant="danger" pulse size="sm">BERLINDA</Badge>}
                      </div>
                      <p className="text-[11px] text-slate-400">{p.name} · {p.age} anos</p>
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/30 inline-block mt-0.5">
                        {p.archetype || p.temperament}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Barras de Carisma e Controvérsia */}
                <div className="space-y-2 pt-1 border-t border-slate-800/80">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="text-cyan-400 flex items-center gap-1">
                        <Sparkles size={11} /> Carisma:
                      </span>
                      <strong className="text-white">{char}/100</strong>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-500 h-full rounded-full"
                        style={{ width: `${char}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="text-amber-400 flex items-center gap-1">
                        <Flame size={11} /> Controvérsia:
                      </span>
                      <strong className="text-white">{cont}/100</strong>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-rose-600 h-full rounded-full"
                        style={{ width: `${cont}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Popularidade & Local Atual */}
                <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-800/80 pt-2">
                  <span>Aprovação: <strong className="text-emerald-400">{p.stats.popularity}%</strong></span>
                  <span className="text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    📍 {p.currentRoom.replace('-', ' ')}
                  </span>
                </div>

                {/* Ações da Direção */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openParticipantDetail(p)}
                    leftIcon={<Eye size={13} />}
                  >
                    Dossiê
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      toggleVIP(p.id);
                      addToast('info', 'Status Atualizado', `${p.nickname} foi movido para o ${!p.isVIP ? 'VIP' : 'Xepa'}.`);
                    }}
                  >
                    {p.isVIP ? 'Mover p/ Xepa' : 'Mover p/ VIP'}
                  </Button>

                  <Button
                    variant="cyber"
                    size="sm"
                    onClick={() => setSelectedForSub(p)}
                    leftIcon={<RefreshCw size={13} />}
                  >
                    Substituir
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setEvictConfirmTarget(p)}
                    leftIcon={<UserMinus size={13} />}
                  >
                    Expulsar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Lista de Reservas & Casa de Vidro */}
      {activeTab === 'bench' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBench.map((cand) => {
            const char = cand.charisma ?? 75;
            const cont = cand.controversy ?? 60;
            const cost = (cand.weeklySalary || 12000) * 2;
            return (
              <div
                key={cand.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-cyan-900/30 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-3 relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cand.avatarColor} flex items-center justify-center font-bold text-white text-base shadow-md border border-white/10 shrink-0`}
                    >
                      {cand.nickname.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-white">{cand.nickname}</h4>
                        <Badge variant="info" size="sm">CASA DE VIDRO</Badge>
                      </div>
                      <p className="text-[11px] text-slate-400">{cand.name} · {cand.age} anos</p>
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/30 inline-block mt-0.5">
                        {cand.archetype}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-1 border-t border-slate-800/80">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="text-cyan-400">Carisma:</span>
                      <strong className="text-white">{char}/100</strong>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${char}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="text-amber-400">Controvérsia:</span>
                      <strong className="text-white">{cont}/100</strong>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-500 to-rose-600 h-full rounded-full" style={{ width: `${cont}%` }} />
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 font-mono flex items-center justify-between border-t border-slate-800/80 pt-2">
                  <span>Cachê de Entrada:</span>
                  <strong className="text-emerald-400">R$ {cost.toLocaleString('pt-BR')}</strong>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleHireFromBench(cand)}
                  leftIcon={<UserPlus size={14} />}
                  className="w-full mt-1"
                >
                  Contratar para a Casa (Entrada Imediata)
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Substituição */}
      {selectedForSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <RefreshCw className="text-cyan-400" size={20} />
              Substituir Participante: {selectedForSub.nickname}
            </h3>
            <p className="text-xs text-slate-400">
              Escolha um suplente da Casa de Vidro para assumir a vaga imediatamente. O participante original irá para a quarentena externa.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {reserveBench.map((res) => (
                <div
                  key={res.id}
                  onClick={() => setTargetReserveForSub(res)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    targetReserveForSub?.id === res.id
                      ? 'bg-cyan-950/40 border-cyan-500'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <h5 className="font-bold text-xs text-white">{res.nickname} ({res.name})</h5>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Carisma: {res.charisma}/100 · Controvérsia: {res.controversy}/100
                    </p>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">R$ 15.000 taxa</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setSelectedForSub(null)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!targetReserveForSub}
                onClick={handleConfirmSubstitution}
              >
                Confirmar Substituição
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Expulsão / Demissão */}
      {evictConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-red-800/60 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
              <AlertTriangle size={22} />
              Expulsão por Decisão da Direção
            </h3>
            <p className="text-xs text-slate-300">
              Você está prestes a desqualificar <strong>{evictConfirmTarget.name} ("{evictConfirmTarget.nickname}")</strong> do reality. Essa decisão causará impacto brutal nas redes e gastará 5 pts de autoridade.
            </p>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Motivo Oficial:</label>
              <select
                value={evictionReason}
                onChange={(e) => setEvictionReason(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
              >
                <option value="Agressão Verbal e Quebra Gravíssima das Regras">Agressão Verbal e Quebra Gravíssima das Regras</option>
                <option value="Desistência Acertada nos Bastidores">Desistência Acertada nos Bastidores</option>
                <option value="Intervenção Editorial para Agitar a Audiência">Intervenção Editorial para Agitar a Audiência</option>
                <option value="Violação de Cláusula Médica/Sanitária">Violação de Cláusula Médica/Sanitária</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setEvictConfirmTarget(null)}>
                Voltar
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmEvict}>
                Confirmar Expulsão
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
