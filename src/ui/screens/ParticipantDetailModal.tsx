/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Participant } from '@/engine/housemates/types';
import { Modal } from '@/ui/components/Modal';
import { Button } from '@/ui/components/Button';
import { Badge } from '@/ui/components/Badge';
import { Tabs } from '@/ui/components/Tabs';
import { soundFx } from '@/audio/audioManager';
import {
  Flame,
  Battery,
  Smile,
  Shield,
  Crown,
  MapPin,
  Briefcase,
  Heart,
  Brain,
  Zap,
  Coffee,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  Award,
  Users,
} from 'lucide-react';

export interface ParticipantDetailModalProps {
  participant: Participant | null;
  onClose: () => void;
  onToggleVIP: (id: string) => void;
  onSendToConfession: (id: string) => void;
  onActionCommand?: (id: string, command: string) => void;
}

export const ParticipantDetailModal: React.FC<ParticipantDetailModalProps> = ({
  participant,
  onClose,
  onToggleVIP,
  onSendToConfession,
  onActionCommand,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'bigfive' | 'skills' | 'strategy'>('status');

  if (!participant) return null;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>{participant.name}</span>
          <span className="text-cyan-400 font-mono text-sm font-normal">
            ("{participant.nickname}")
          </span>
        </div>
      }
      subtitle={`${participant.profession} · ${participant.hometown} · ${participant.age} anos`}
      maxWidth="2xl"
    >
      <div className="space-y-5 text-slate-200">
        {/* Banner do Morador com Ação Ao Vivo */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${participant.avatarColor} flex items-center justify-center text-white font-extrabold text-xl shadow-xl shrink-0 ring-4 ${
              participant.isLeader
                ? 'ring-amber-400'
                : participant.isNominated
                ? 'ring-rose-500 animate-pulse'
                : 'ring-white/10'
            }`}
          >
            {participant.nickname.slice(0, 2).toUpperCase()}
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-1">
              <Badge variant="purple" size="sm">
                {participant.temperament}
              </Badge>
              {participant.isLeader && <Badge variant="warning" size="sm">LÍDER</Badge>}
              {participant.isImmune && !participant.isLeader && <Badge variant="info" size="sm">IMUNIZADO</Badge>}
              {participant.isNominated && <Badge variant="danger" pulse size="sm">PAREDÃO</Badge>}
              {participant.isVIP ? (
                <Badge variant="info" size="sm">VIP</Badge>
              ) : (
                <Badge variant="neutral" size="sm">XEPA</Badge>
              )}
            </div>

            {/* Ação ao vivo sendo executada */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-white">
                  {participant.currentActivity}
                </div>
                {participant.currentDialogue && (
                  <p className="text-cyan-300 italic text-[11px] mt-0.5">
                    "{participant.currentDialogue}"
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Abas de Informações Profundas */}
        <Tabs
          tabs={[
            { id: 'status', label: 'Necessidades & Estados', icon: <Heart size={14} /> },
            { id: 'bigfive', label: 'Personalidade Big Five', icon: <Brain size={14} /> },
            { id: 'skills', label: 'Skills de Prova', icon: <Zap size={14} /> },
            { id: 'strategy', label: 'Estratégia & Memória', icon: <Sparkles size={14} /> },
          ]}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as typeof activeTab)}
        />

        {/* 1. NECESSIDADES BIOLÓGICAS E PSICOLÓGICAS */}
        {activeTab === 'status' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { label: 'Fome', value: participant.needs.hunger, color: 'from-amber-500 to-orange-500', isBadHigh: true },
                { label: 'Sono / Cansaço', value: participant.needs.sleep, color: 'from-blue-500 to-indigo-500', isBadHigh: true },
                { label: 'Higiene Corporal', value: participant.needs.hygiene, color: 'from-cyan-400 to-teal-500', isBadHigh: false },
                { label: 'Satisfação Social', value: participant.needs.social, color: 'from-purple-400 to-pink-500', isBadHigh: false },
                { label: 'Diversão & Lazer', value: participant.needs.fun, color: 'from-emerald-400 to-green-500', isBadHigh: false },
                { label: 'Conforto Físico', value: participant.needs.comfort, color: 'from-sky-400 to-blue-500', isBadHigh: false },
                { label: 'Saúde Física', value: participant.needs.physicalHealth, color: 'from-green-500 to-emerald-600', isBadHigh: false },
                { label: 'Saúde Emocional', value: participant.needs.emotionalHealth, color: 'from-rose-400 to-pink-600', isBadHigh: false },
                { label: 'Saudade de Casa', value: participant.needs.homesickness, color: 'from-violet-500 to-purple-700', isBadHigh: true },
              ].map((need) => (
                <div key={need.label} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">{need.label}</span>
                    <span className="font-mono font-bold text-white">{need.value}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${need.color} transition-all duration-300`}
                      style={{ width: `${Math.min(100, Math.max(0, need.value))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Estados de Humor e Estresse */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="text-slate-500 text-[10px] uppercase font-mono">Estresse</div>
                <div className="font-mono font-bold text-rose-400 text-sm mt-0.5">{participant.states.stress}%</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px] uppercase font-mono">Motivação</div>
                <div className="font-mono font-bold text-cyan-400 text-sm mt-0.5">{participant.states.motivation}%</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px] uppercase font-mono">Autoconfiança</div>
                <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">{participant.states.confidence}%</div>
              </div>
            </div>
          </div>
        )}

        {/* 2. PERSONALIDADE BIG FIVE */}
        {activeTab === 'bigfive' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              O modelo Big Five determina a propensão psicológica do participante a entrar em brigas, formar alianças e reagir à pressão do confinamento.
            </p>

            <div className="space-y-3">
              {[
                { name: 'Abertura a Novas Ideias (Openness)', value: participant.bigFive.openness, desc: 'Criatividade e curiosidade por estratégias não convencionais.' },
                { name: 'Conscienciosidade (Conscientiousness)', value: participant.bigFive.conscientiousness, desc: 'Disciplina com comida, limpeza e foco nas regras.' },
                { name: 'Extroversão (Extraversion)', value: participant.bigFive.extraversion, desc: 'Energia social, vontade de aparecer nas câmeras e festas.' },
                { name: 'Amabilidade (Agreeableness)', value: participant.bigFive.agreeableness, desc: 'Empatia e tolerância a atritos; valores baixos geram brigas.' },
                { name: 'Neuroticismo (Neuroticism)', value: participant.bigFive.neuroticism, desc: 'Instabilidade emocional, desconfiança e risco de surto.' },
              ].map((b5) => (
                <div key={b5.name} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{b5.name}</span>
                    <span className="font-mono font-bold text-cyan-400">{b5.value}/100</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{b5.desc}</p>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                      style={{ width: `${b5.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. SKILLS DE PROVA */}
        {activeTab === 'skills' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            {[
              { skill: 'Força Física', val: participant.skills.strength },
              { skill: 'Resistência', val: participant.skills.endurance },
              { skill: 'Agilidade', val: participant.skills.agility },
              { skill: 'Memória', val: participant.skills.memory },
              { skill: 'Lógica', val: participant.skills.logic },
              { skill: 'Pontaria / Mira', val: participant.skills.aim },
              { skill: 'Trabalho em Equipe', val: participant.skills.teamwork },
              { skill: 'Trato Rural (Bichos)', val: participant.skills.animalCare },
            ].map((s) => (
              <div key={s.skill} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-1">
                <div className="text-slate-400 text-[11px] font-medium">{s.skill}</div>
                <div className="font-mono text-lg font-bold text-cyan-300">{s.val}</div>
                <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-cyan-400" style={{ width: `${s.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. ESTRATÉGIA E MEMÓRIAS */}
        {activeTab === 'strategy' && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-sm">Objetivo Declarado no Jogo</h4>
              <p className="text-slate-300">
                Meta Principal: <strong className="text-cyan-400 uppercase">{participant.strategy.goal.replace('-', ' ')}</strong>
              </p>
              <div className="flex gap-4 text-slate-400 font-mono text-[11px] pt-1">
                <span>Ousadia: <strong className="text-white">{participant.strategy.boldness}%</strong></span>
                <span>Tolerância a Risco: <strong className="text-white">{participant.strategy.riskTolerance}%</strong></span>
              </div>
            </div>

            {/* Memórias Marcantes Recentes */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm">Diário e Memórias Episódicas</h4>
              {participant.memories.length > 0 ? (
                <div className="space-y-1.5">
                  {participant.memories.map((m) => (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center justify-between"
                    >
                      <span className="text-slate-300">Dia {m.day}: {m.description}</span>
                      <span className="text-[10px] font-mono text-slate-500">Intensidade {m.intensity}/10</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                  Nenhum trauma ou feito marcante registrado nas últimas 24 horas.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Comandos Rápidos do Diretor */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onToggleVIP(participant.id);
                soundFx.playClick();
              }}
            >
              {participant.isVIP ? 'Mover p/ Xepa' : 'Mover p/ VIP'}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onSendToConfession(participant.id);
                soundFx.playClick();
              }}
            >
              Chamar no Confessionário
            </Button>
          </div>

          <Button variant="ghost" size="sm" onClick={onClose}>
            Fechar Ficha
          </Button>
        </div>
      </div>
    </Modal>
  );
};
