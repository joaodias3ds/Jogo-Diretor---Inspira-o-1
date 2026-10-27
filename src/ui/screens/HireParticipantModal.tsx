/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Modal } from '@/ui/components/Modal';
import { Button } from '@/ui/components/Button';
import { Badge } from '@/ui/components/Badge';
import { useAppStore, Candidate } from '@/app/useAppStore';
import { UserPlus, Sparkles, DollarSign, Award, Flame, Check } from 'lucide-react';

const CASTING_CANDIDATES: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Valentina Ferrari',
    nickname: 'Val',
    age: 26,
    profession: 'Influenciadora de Moda',
    hometown: 'São Paulo - SP',
    traits: ['Vaidosa', 'Sem Filtro', 'Competitiva'],
    cost: 35000,
    charisma: 88,
    temperament: 'Explosivo',
    avatarColor: 'from-pink-500 to-rose-600',
  },
  {
    id: 'cand-2',
    name: 'Rodrigo Brandão',
    nickname: 'Diguinho',
    age: 32,
    profession: 'Personal Trainer & Modelo',
    hometown: 'Belo Horizonte - MG',
    traits: ['Focado', 'Sedutor', 'Líder Nato'],
    cost: 42000,
    charisma: 84,
    temperament: 'Romântico',
    avatarColor: 'from-amber-500 to-orange-600',
  },
  {
    id: 'cand-3',
    name: 'Dona Marlene de Souza',
    nickname: 'Tia Marlene',
    age: 58,
    profession: 'Cozinheira & Comerciante',
    hometown: 'Salvador - BA',
    traits: ['Carismática', 'Fofoqueira do Bem', 'Sem Paciência'],
    cost: 25000,
    charisma: 95,
    temperament: 'Fofoqueiro',
    avatarColor: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'cand-4',
    name: 'Lucas "Cyber" Albuquerque',
    nickname: 'Cyber',
    age: 23,
    profession: 'Gamer & Estrategista',
    hometown: 'Curitiba - PR',
    traits: ['Mente Fria', 'Calculista', 'Noite em Claro'],
    cost: 30000,
    charisma: 76,
    temperament: 'Estrategista',
    avatarColor: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'cand-5',
    name: 'Bia Campolina',
    nickname: 'Bia Raiz',
    age: 29,
    profession: 'Médica Veterinária & Peoa',
    hometown: 'Goiânia - GO',
    traits: ['Trabalhadora', 'Raçuda', 'Pavio Curto'],
    cost: 38000,
    charisma: 90,
    temperament: 'Explosivo',
    avatarColor: 'from-purple-500 to-indigo-600',
  },
];

export const HireParticipantModal: React.FC = () => {
  const { activeModal, closeModal, directorStats, hireCandidate } = useAppStore();
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    CASTING_CANDIDATES[0]
  );

  if (activeModal !== 'hire-participant') return null;

  return (
    <Modal
      isOpen={true}
      onClose={closeModal}
      title="Casting & Contratação de Participante"
      subtitle="Selecione um novo participante para agitar a casa e alavancar a audiência"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Orçamento atual do Diretor */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-emerald-400" />
            <span className="text-slate-300">Orçamento Disponível em Caixa:</span>
          </div>
          <span className="font-mono font-bold text-emerald-400 text-sm">
            R$ {directorStats.cash.toLocaleString('pt-BR')}
          </span>
        </div>

        {/* Lista de Candidatos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {CASTING_CANDIDATES.map((candidate) => {
            const isSelected = selectedCandidate?.id === candidate.id;
            const canAfford = directorStats.cash >= candidate.cost;

            return (
              <div
                key={candidate.id}
                onClick={() => setSelectedCandidate(candidate)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/30 shadow-lg shadow-cyan-950/40'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start gap-3 mb-2.5">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${candidate.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0`}
                    >
                      {candidate.nickname.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-white text-sm truncate">
                          {candidate.name}
                        </h4>
                        <span className="text-[10px] font-mono text-cyan-300 bg-slate-900 px-1 rounded border border-slate-800 shrink-0">
                          {candidate.age} anos
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{candidate.profession}</p>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{candidate.hometown}</p>
                    </div>
                  </div>

                  {/* Traits */}
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {candidate.traits.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                      >
                        {t}
                      </span>
                    ))}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/40 text-purple-300 font-semibold">
                      {candidate.temperament}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Flame size={13} className="text-rose-400" />
                    <span>Carisma: <strong className="text-white font-mono">{candidate.charisma}%</strong></span>
                  </div>
                  <div className={`font-mono font-bold ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}>
                    R$ {candidate.cost.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé com botão de Contratação */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={closeModal}>
            Cancelar
          </Button>

          {selectedCandidate && (
            <Button
              variant="primary"
              size="md"
              leftIcon={<UserPlus size={16} />}
              disabled={directorStats.cash < selectedCandidate.cost}
              onClick={() => hireCandidate(selectedCandidate)}
            >
              Contratar {selectedCandidate.nickname} por R$ {selectedCandidate.cost.toLocaleString('pt-BR')}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
