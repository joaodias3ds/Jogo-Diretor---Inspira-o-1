/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Participant } from '@/engine/housemates/types';
import { Card } from '@/ui/components/Card';
import { Button } from '@/ui/components/Button';
import { Badge } from '@/ui/components/Badge';
import { ParticipantSocialDossierModal } from '@/ui/screens/ParticipantSocialDossierModal';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Battery,
  BatteryCharging,
  Smile,
  Frown,
  Meh,
  Crown,
  Shield,
  Skull,
  Star,
  Flame,
  Coffee,
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  Radio,
  Video,
  Eye,
  MessageSquare,
  Volume2,
  Tv,
} from 'lucide-react';
import { soundFx } from '@/audio/audioManager';

export interface ParticipantListProps {
  participants: Participant[];
  onSimulateTick?: () => void;
  onSelectParticipant?: (participant: Participant) => void;
  onToggleVIP?: (id: string) => void;
  onSendToConfession?: (id: string) => void;
  isRecording?: boolean;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({
  participants,
  onSimulateTick,
  onSelectParticipant,
  onToggleVIP,
  onSendToConfession,
  isRecording = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'vip' | 'xepa' | 'nominated' | 'leaders'>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'charisma' | 'controversy' | 'stamina' | 'mood' | 'name'>('popularity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activePipParticipant, setActivePipParticipant] = useState<Participant | null>(null);
  const [socialDossierTarget, setSocialDossierTarget] = useState<Participant | null>(null);

  // Filtragem
  const filtered = participants.filter((p) => {
    if (p.isEliminated) return false;
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.archetype && p.archetype.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchSearch) return false;

    if (statusFilter === 'vip') return p.isVIP;
    if (statusFilter === 'xepa') return !p.isVIP;
    if (statusFilter === 'nominated') return p.isNominated;
    if (statusFilter === 'leaders') return p.isLeader || p.isImmune;
    return true;
  });

  // Ordenação
  const sorted = [...filtered].sort((a, b) => {
    let diff = 0;
    if (sortBy === 'popularity') diff = b.stats.popularity - a.stats.popularity;
    else if (sortBy === 'charisma') diff = (b.charisma ?? 70) - (a.charisma ?? 70);
    else if (sortBy === 'controversy') diff = (b.controversy ?? 50) - (a.controversy ?? 50);
    else if (sortBy === 'stamina') diff = b.stats.stamina - a.stats.stamina;
    else if (sortBy === 'mood') diff = b.stats.mood - a.stats.mood;
    else if (sortBy === 'name') diff = a.name.localeCompare(b.name);

    return sortOrder === 'desc' ? diff : -diff;
  });

  const getDeltaBadge = (delta: number) => {
    if (delta > 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-emerald-400 font-bold">
          <TrendingUp size={11} />+{delta}
        </span>
      );
    }
    if (delta < 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-rose-400 font-bold">
          <TrendingDown size={11} />
          {delta}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-[10px] font-mono text-slate-500">
        <Minus size={11} /> 0
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* 1. Barra de Controles e Filtros Rápidos */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-lg">
        {/* Busca e Filtros Rápidos */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[200px] max-w-xs flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nome, arquétipo ou profissão..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1 text-xs">
            {[
              { id: 'all', label: `Todos (${participants.filter((p) => !p.isEliminated).length})` },
              { id: 'vip', label: 'VIP' },
              { id: 'xepa', label: 'Xepa' },
              { id: 'nominated', label: 'Berlinda' },
              { id: 'leaders', label: 'Líder / Imune' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  soundFx.playClick();
                  setStatusFilter(f.id as typeof statusFilter);
                }}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === f.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ordenação e Ação de Simulação */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300">
            <ArrowUpDown size={12} className="text-slate-400" />
            <span className="text-[11px] text-slate-500 hidden sm:inline">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                soundFx.playClick();
                setSortBy(e.target.value as typeof sortBy);
              }}
              className="bg-transparent border-none text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="popularity" className="bg-slate-900">Popularidade</option>
              <option value="charisma" className="bg-slate-900">Carisma</option>
              <option value="controversy" className="bg-slate-900">Controvérsia</option>
              <option value="stamina" className="bg-slate-900">Energia (Stamina)</option>
              <option value="mood" className="bg-slate-900">Humor</option>
              <option value="name" className="bg-slate-900">Nome</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="text-cyan-400 font-mono text-[10px] uppercase font-bold hover:underline ml-1"
            >
              {sortOrder}
            </button>
          </div>

          {onSimulateTick && (
            <Button
              variant="cyber"
              size="sm"
              leftIcon={<Sparkles size={13} />}
              onClick={() => {
                soundFx.playClick();
                onSimulateTick();
              }}
            >
              Simular Flutuações
            </Button>
          )}
        </div>
      </div>

      {/* 2. Grid de Cards dos Participantes (Moderno, Apresentável & com Vida Orgânica) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((p) => {
          const char = p.charisma ?? 70;
          const cont = p.controversy ?? 50;
          return (
            <div
              key={p.id}
              className="p-4 rounded-2xl bg-gradient-to-b from-slate-900/95 to-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-xl flex flex-col justify-between space-y-3.5 relative group"
            >
              {/* Topo: Avatar, Nome, Status VIP/Xepa e Arquétipo */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${p.avatarColor} flex items-center justify-center font-black text-white text-lg shadow-lg border border-white/10 shrink-0 relative`}
                  >
                    {p.nickname.substring(0, 2).toUpperCase()}
                    {p.isVIP && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 border border-slate-900 flex items-center justify-center text-[10px] text-slate-950 font-black">
                        ★
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-base text-white">{p.nickname}</h4>
                      {p.isVIP ? (
                        <Badge variant="warning" size="sm">VIP</Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">XEPA</Badge>
                      )}
                      {p.isLeader && <Badge variant="warning" size="sm">LÍDER</Badge>}
                      {p.isImmune && <Badge variant="success" size="sm">IMUNE</Badge>}
                      {p.isNominated && <Badge variant="danger" pulse size="sm">NO PAREDÃO</Badge>}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{p.name} · {p.age} anos</p>
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded-md border border-cyan-800/40 inline-block mt-1 font-semibold">
                      {p.archetype || p.temperament}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vida ao Vivo no Reality: Localização e Atividade Dinâmica */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    📍 {p.currentRoom.replace('-', ' ').toUpperCase()}
                  </span>
                  <span className="text-slate-500 text-[10px]">Rotina Ao Vivo</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  {p.currentActivity || 'Conversando e articulando o jogo'}
                </p>

                {/* Balão de Fala Autêntica do Participante */}
                {p.currentDialogue && (
                  <div className="p-2 rounded-lg bg-slate-900 border border-cyan-900/30 text-[11px] italic text-cyan-200/90 flex items-start gap-1.5">
                    <MessageSquare size={13} className="text-cyan-400 shrink-0 mt-0.5" />
                    <span>"{p.currentDialogue}"</span>
                  </div>
                )}
              </div>

              {/* Barras Modernas: Carisma & Controvérsia */}
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className="text-cyan-400 flex items-center gap-1 font-semibold">
                      <Sparkles size={11} /> Carisma:
                    </span>
                    <strong className="text-white">{char}/100</strong>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${char}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className="text-amber-400 flex items-center gap-1 font-semibold">
                      <Flame size={11} /> Controvérsia:
                    </span>
                    <strong className="text-white">{cont}/100</strong>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-rose-600 h-full rounded-full" style={{ width: `${cont}%` }} />
                  </div>
                </div>
              </div>

              {/* Popularidade, Stamina e Humor */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-[11px] font-mono text-center">
                <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Aprovação</span>
                  <strong className="text-emerald-400 font-bold">{p.stats.popularity}%</strong>
                </div>
                <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Stamina</span>
                  <strong className="text-amber-300 font-bold">{p.stats.stamina}%</strong>
                </div>
                <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Humor</span>
                  <strong className="text-cyan-400 font-bold">{p.stats.mood}%</strong>
                </div>
              </div>

              {/* Botões de Ação Rápida da Direção */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    soundFx.playCameraSwitch();
                    setActivePipParticipant(p);
                  }}
                  leftIcon={<Video size={13} className="text-cyan-400" />}
                >
                  Espiar PiP
                </Button>

                <Button
                  variant="cyber"
                  size="sm"
                  onClick={() => {
                    soundFx.playClick();
                    setSocialDossierTarget(p);
                  }}
                  leftIcon={<Sparkles size={13} />}
                >
                  Dossiê IA
                </Button>

                {onToggleVIP && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      soundFx.playClick();
                      onToggleVIP(p.id);
                    }}
                  >
                    {p.isVIP ? 'Mover p/ Xepa' : 'Mover p/ VIP'}
                  </Button>
                )}

                {onSendToConfession && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      soundFx.playClick();
                      onSendToConfession(p.id);
                    }}
                  >
                    Confessionário
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Quadrado Pequeno de Câmera Ampliada (PiP Modal) */}
      {activePipParticipant && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-6 duration-300">
          <div className="w-80 rounded-2xl bg-slate-950 border-2 border-cyan-500 shadow-2xl overflow-hidden p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                <span className="text-red-400 font-bold">CAM AO VIVO</span>
                <span className="text-slate-400">|</span>
                <span className="text-cyan-300 font-bold">{activePipParticipant.nickname}</span>
              </div>
              <button
                onClick={() => setActivePipParticipant(null)}
                className="text-slate-400 hover:text-white font-bold text-sm px-1"
              >
                ×
              </button>
            </div>

            {/* Viewport do PiP */}
            <div className="relative aspect-video rounded-xl bg-black border border-slate-800 overflow-hidden flex flex-col justify-between p-2.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 z-10">
                <span>📍 {activePipParticipant.currentRoom.replace('-', ' ').toUpperCase()}</span>
                <span className="text-amber-400 font-bold">REC ● HD</span>
              </div>

              <div className="text-center z-10 my-auto">
                <div className="text-2xl mb-1">📹</div>
                <p className="text-xs text-white font-semibold">{activePipParticipant.currentActivity}</p>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 z-10 border-t border-slate-800 pt-1">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Volume2 size={11} /> Áudio VU: -4dB
                </span>
                <span className="text-cyan-300">Carisma: {activePipParticipant.charisma ?? 70}</span>
              </div>
            </div>

            {activePipParticipant.currentDialogue && (
              <p className="text-[11px] text-slate-300 italic bg-slate-900 p-2 rounded-lg border border-slate-800">
                "{activePipParticipant.currentDialogue}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* Dossiê de Redes Sociais & IA */}
      <ParticipantSocialDossierModal
        participant={socialDossierTarget}
        onClose={() => setSocialDossierTarget(null)}
      />
    </div>
  );
};
