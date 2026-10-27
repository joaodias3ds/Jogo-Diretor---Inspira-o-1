/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Participant } from '@/engine/housemates/types';
import { RelationMap } from '@/engine/social/relationMatrix';
import { AllianceGroup, SocialConflict, GossipItem } from '@/engine/social/socialTypes';
import { Card } from '@/ui/components/Card';
import { Button } from '@/ui/components/Button';
import { Badge } from '@/ui/components/Badge';
import { soundFx } from '@/audio/audioManager';
import {
  Users,
  Flame,
  Heart,
  Shield,
  AlertTriangle,
  Sparkles,
  Swords,
  Radio,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';

export interface SocialMapScreenProps {
  cast: Participant[];
  relationMatrix: RelationMap;
  alliances: AllianceGroup[];
  conflicts: SocialConflict[];
  gossips: GossipItem[];
  onSelectParticipant: (participant: Participant) => void;
}

export const SocialMapScreen: React.FC<SocialMapScreenProps> = ({
  cast,
  relationMatrix,
  alliances,
  conflicts,
  gossips,
  onSelectParticipant,
}) => {
  const [selectedId, setSelectedId] = useState<string>(cast[0]?.id || 'hm-1');
  const [filterType, setFilterType] = useState<'all' | 'alliances' | 'rivalries' | 'romances'>('all');

  const selectedParticipant = cast.find((p) => p.id === selectedId) || cast[0];
  const activeHousemates = cast.filter((p) => !p.isEliminated);

  // Calcula conexões do participante selecionado
  const connections = activeHousemates
    .filter((p) => p.id !== selectedId)
    .map((target) => {
      const rel = relationMatrix[selectedId]?.[target.id];
      return {
        target,
        affinity: rel ? rel.affinity : 0,
        trust: rel ? rel.trust : 40,
        attraction: rel ? rel.attraction : 0,
        rivalry: rel ? rel.rivalry : 10,
        type: rel ? rel.type : 'neutro',
        summary: rel ? rel.historySummary : 'Convivência recente.',
      };
    });

  // Filtra as conexões pela aba
  const filteredConnections = connections.filter((conn) => {
    if (filterType === 'alliances') return conn.affinity >= 30;
    if (filterType === 'rivalries') return conn.affinity <= -15 || conn.rivalry >= 50;
    if (filterType === 'romances') return conn.attraction >= 40;
    return true;
  });

  // Aliança do participante selecionado
  const participantAlliance = alliances.find((a) => a.memberIds.includes(selectedId));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner do Mapa Social */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
              TELEMETRIA SOCIAL & RELAÇÕES (FASE 3)
            </span>
            <Badge variant="purple" size="sm">
              GRAFO DINÂMICO
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Mapa de Alianças, Rivalidades & Romances
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize a teia invisível de afinidades, rachas de grupo e fofocas que movem as indicações de paredão.
          </p>
        </div>

        {/* Filtros de Conexões */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          {[
            { id: 'all', label: 'Todos os Laços' },
            { id: 'alliances', label: 'Alianças / Amizades', icon: <Shield size={12} className="text-emerald-400" /> },
            { id: 'rivalries', label: 'Rivalidades & Tretas', icon: <Swords size={12} className="text-rose-400" /> },
            { id: 'romances', label: 'Flertes & Paixões', icon: <Heart size={12} className="text-pink-400" /> },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                soundFx.playClick();
                setFilterType(f.id as typeof filterType);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterType === f.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.icon}
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid Principal: Seletor de Participantes (Grafo de Nós) & Painel do Selecionado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 & 2: Constelação Social Interativa */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-purple-400" />
                <h3 className="font-bold text-white text-base">Navegador da Casa Confinada</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Clique para inspecionar laços</span>
            </div>

            {/* Grid dos Moradores como Nós do Grafo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              {activeHousemates.map((p) => {
                const isCurrent = p.id === selectedId;
                const alliance = alliances.find((a) => a.memberIds.includes(p.id));

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedId(p.id);
                    }}
                    className={`relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center text-center ${
                      isCurrent
                        ? 'border-purple-400 bg-purple-950/40 shadow-xl shadow-purple-950/40 ring-2 ring-purple-400/50'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.avatarColor} flex items-center justify-center text-white font-extrabold text-sm shadow mb-1.5`}
                    >
                      {p.nickname.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="font-bold text-white text-xs truncate max-w-full">
                      {p.nickname}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate max-w-full">
                      {alliance ? alliance.name.split(' ')[0] : 'Solo'}
                    </div>

                    {p.isLeader && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-slate-950" title="Líder" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Painel de Relações do Morador Selecionado */}
            <div className="mt-6 pt-5 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">
                    Laços Sociais de <span className="text-purple-300 font-mono">"{selectedParticipant.nickname}"</span>
                  </h4>
                  <span className="text-xs text-slate-500 font-mono">({filteredConnections.length} conexões)</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectParticipant(selectedParticipant)}
                >
                  Abrir Ficha Completa →
                </Button>
              </div>

              {/* Lista das Relações Filtradas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {filteredConnections.map((conn) => {
                  const isAlly = conn.affinity >= 30;
                  const isRival = conn.affinity <= -15 || conn.rivalry >= 50;
                  const isRomance = conn.attraction >= 40;

                  return (
                    <div
                      key={conn.target.id}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${conn.target.avatarColor} flex items-center justify-center text-white font-bold text-xs shrink-0`}
                        >
                          {conn.target.nickname.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate flex items-center gap-1.5">
                            <span>{conn.target.nickname}</span>
                            {isRomance ? (
                              <Heart size={12} className="text-pink-400 shrink-0" />
                            ) : isRival ? (
                              <Swords size={12} className="text-rose-400 shrink-0" />
                            ) : isAlly ? (
                              <Shield size={12} className="text-emerald-400 shrink-0" />
                            ) : null}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">{conn.summary}</p>
                        </div>
                      </div>

                      {/* Medidor de Afinidade */}
                      <div className="flex flex-col items-end shrink-0">
                        <span
                          className={`font-mono font-bold text-xs ${
                            conn.affinity > 0
                              ? 'text-emerald-400'
                              : conn.affinity < 0
                              ? 'text-rose-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {conn.affinity > 0 ? `+${conn.affinity}` : conn.affinity}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Afinidade</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Coluna 3: Alianças Oficiais e Feed de Conflitos / Fofocas */}
        <div className="space-y-4">
          {/* Grupos e Alianças Ativas */}
          <Card>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Shield size={16} className="text-cyan-400" />
                <span>Grupos & Alianças</span>
              </h3>
              <Badge variant="neutral" size="sm">{alliances.length} GRUPOS</Badge>
            </div>

            <div className="space-y-3">
              {alliances.map((group) => {
                const isMember = group.memberIds.includes(selectedId);
                const isDangerCohesion = group.cohesion < 35;

                return (
                  <div
                    key={group.id}
                    className={`p-3 rounded-xl border transition-all ${group.badgeColor} ${
                      isMember ? 'ring-2 ring-purple-400/60' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-white text-xs">{group.name}</span>
                      <span className="font-mono text-[10px] font-bold">
                        {group.cohesion}% Coesão
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 mb-2 leading-tight">
                      {group.rulesDescription}
                    </p>

                    <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isDangerCohesion
                            ? 'bg-rose-500 animate-pulse'
                            : 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                        }`}
                        style={{ width: `${group.cohesion}%` }}
                      />
                    </div>

                    {isDangerCohesion && (
                      <div className="flex items-center gap-1 text-[10px] text-rose-300 font-mono">
                        <AlertTriangle size={11} />
                        <span>Risco crítico de racha e traição!</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Últimos Conflitos e Tretas */}
          <Card>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Flame size={16} className="text-rose-400" />
                <span>Registro de Conflitos</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">{conflicts.length} eventos</span>
            </div>

            {conflicts.length > 0 ? (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 text-xs">
                {conflicts.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <Badge variant="danger" size="sm" className="uppercase">
                        {c.severity} · {c.cause}
                      </Badge>
                      <span className="text-slate-500">Dia {c.day} ({c.phase})</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-tight">{c.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic p-3 text-center bg-slate-950/40 rounded-xl border border-slate-800">
                Nenhuma briga violenta registrada recentemente. Clima ameno na casa.
              </p>
            )}
          </Card>

          {/* Fofocas Ativas na Casa */}
          {gossips.length > 0 && (
            <Card className="border-amber-500/20 bg-amber-950/10">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs mb-2">
                <Radio size={14} className="animate-pulse" />
                <span>Fofoca Circulando nos Bastidores</span>
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <div className="font-semibold text-white">"{gossips[0].topic}"</div>
                <p className="text-[11px] text-amber-200/90 italic">
                  "{gossips[0].distortedRumor}"
                </p>
                <div className="text-[10px] font-mono text-amber-400 mt-1">
                  Nível de Distorção: {gossips[0].distortionLevel}%
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
