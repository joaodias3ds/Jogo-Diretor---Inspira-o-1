/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Participant, TemperamentType } from '@/engine/housemates/types';
import { generateRandomParticipant } from '@/engine/housemates/participantGenerator';
import { Modal } from '@/ui/components/Modal';
import { Button } from '@/ui/components/Button';
import { soundFx } from '@/audio/audioManager';
import { Sparkles, Dices, Check, UserPlus } from 'lucide-react';

export interface ParticipantEditorModalProps {
  isOpen: boolean;
  participantToEdit?: Participant | null;
  onSave: (participant: Participant) => void;
  onClose: () => void;
}

export const ParticipantEditorModal: React.FC<ParticipantEditorModalProps> = ({
  isOpen,
  participantToEdit,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<Participant>(() =>
    participantToEdit || generateRandomParticipant()
  );

  if (!isOpen) return null;

  const handleRandomize = () => {
    soundFx.playCameraSwitch();
    const generated = generateRandomParticipant(formData.id);
    setFormData(generated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playOnAirChime();
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={participantToEdit ? 'Editar Participante' : 'Criar Novo Participante'}
      subtitle="Editor de elenco oficial: ajuste identidade, Big Five e temperamento"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Botão de Geração Aleatória Rápida */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div>
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Sparkles size={14} className="text-cyan-400" />
              <span>Gerador Procedural de Participante</span>
            </div>
            <p className="text-[11px] text-slate-400">Gere um participante brasileiro completo com 1 clique</p>
          </div>
          <Button
            type="button"
            variant="cyber"
            size="sm"
            leftIcon={<Dices size={14} />}
            onClick={handleRandomize}
          >
            Gerar Aleatório
          </Button>
        </div>

        {/* Campos de Identidade */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Nome Completo</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Apelido na Casa</label>
            <input
              type="text"
              required
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Profissão</label>
            <input
              type="text"
              required
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Cidade / Estado</label>
            <input
              type="text"
              required
              value={formData.hometown}
              onChange={(e) => setFormData({ ...formData, hometown: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Idade</label>
            <input
              type="number"
              min="18"
              max="75"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 25 })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Temperamento Predominante</label>
            <select
              value={formData.temperament}
              onChange={(e) => setFormData({ ...formData, temperament: e.target.value as TemperamentType })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
            >
              {['Carismático', 'Estrategista', 'Explosivo', 'Fofoqueiro', 'Romântico', 'Planta', 'Leal', 'Líder'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sliders do Big Five */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
          <div className="font-semibold text-white text-xs">Sliders de Personalidade (Big Five)</div>
          {[
            { key: 'openness', label: 'Abertura a Novidades' },
            { key: 'conscientiousness', label: 'Conscienciosidade / Disciplina' },
            { key: 'extraversion', label: 'Extroversão / Festa' },
            { key: 'agreeableness', label: 'Amabilidade / Empatia' },
            { key: 'neuroticism', label: 'Neuroticismo / Risco de Briga' },
          ].map((trait) => (
            <div key={trait.key} className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{trait.label}</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {formData.bigFive[trait.key as keyof typeof formData.bigFive]}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                value={formData.bigFive[trait.key as keyof typeof formData.bigFive]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bigFive: {
                      ...formData.bigFive,
                      [trait.key]: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
              />
            </div>
          ))}
        </div>

        {/* Rodapé de Ações */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="md" leftIcon={<Check size={16} />}>
            Salvar no Elenco
          </Button>
        </div>
      </form>
    </Modal>
  );
};
