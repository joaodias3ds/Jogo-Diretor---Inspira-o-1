/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGameStore } from '@/app/useGameStore';
import { useAppStore } from '@/app/useAppStore';
import {
  ChallengeBlock,
  CustomChallengeBlueprint,
  AVAILABLE_CHALLENGE_BLOCKS,
  compileChallengeBlueprint,
} from '@/engine/challenges/challengeEditor';
import {
  Trophy,
  Plus,
  Trash2,
  Sparkles,
  HelpCircle,
  Activity,
  Flame,
  Layers,
  Save,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';

export const ChallengeEditorScreen: React.FC = () => {
  const { cash } = useGameStore();
  const { addToast } = useAppStore();

  const [title, setTitle] = useState('Grande Duelo de Resistência e Raciocínio');
  const [type, setType] = useState<CustomChallengeBlueprint['type']>('lider');
  const [targetTone, setTargetTone] = useState<CustomChallengeBlueprint['targetAudienceTone']>('chaos');
  const [selectedBlocks, setSelectedBlocks] = useState<ChallengeBlock[]>([
    AVAILABLE_CHALLENGE_BLOCKS[0], // Obstacle
    AVAILABLE_CHALLENGE_BLOCKS[3], // Endurance
  ]);

  const compiled = compileChallengeBlueprint(title, type, targetTone, selectedBlocks);

  const handleAddBlock = (block: ChallengeBlock) => {
    if (selectedBlocks.length >= 5) {
      addToast('warning', 'Limite de Blocos', 'Uma prova suporta no máximo 5 blocos dinâmicos.');
      return;
    }
    setSelectedBlocks((prev) => [...prev, block]);
    addToast('info', 'Bloco Adicionado', `${block.title} inserido no circuito da prova.`);
  };

  const handleRemoveBlock = (index: number) => {
    setSelectedBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveChallenge = () => {
    if (selectedBlocks.length === 0) {
      addToast('error', 'Prova Vazia', 'Adicione pelo menos 1 bloco para salvar a prova.');
      return;
    }
    if (cash < compiled.totalCost) {
      addToast('error', 'Caixa Insuficiente', `Você precisa de R$ ${compiled.totalCost.toLocaleString('pt-BR')}.`);
      return;
    }

    // Deduct cost
    useGameStore.setState((state) => ({ cash: Math.max(0, state.cash - compiled.totalCost) }));
    addToast(
      'success',
      'Prova Montada com Sucesso!',
      `"${compiled.title}" foi salva e está pronta para ir ao ar no Estúdio!`
    );
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Trophy className="text-amber-400" size={26} />
            Editor de Provas & Dinâmicas de Cenário
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Monte dinâmicas personalizadas combinando blocos modulares de esforço físico, raciocínio, sorte e humilhação cenográfica.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedBlocks([])}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw size={14} /> Limpar Circuito
          </button>
          <button
            onClick={handleSaveChallenge}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-amber-950/40 transition-all"
          >
            <Save size={15} /> Salvar & Produzir Prova
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT & CENTER: BUILDER & SETTINGS (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Challenge Meta Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Configurações Gerais da Prova
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Nome da Prova</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  placeholder="Ex: Prova da Gosma com Resistência"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Tipo de Dinâmica</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="lider">Prova do Líder</option>
                  <option value="anjo">Prova do Anjo</option>
                  <option value="bate_volta">Bate-e-Volta</option>
                  <option value="resistencia">Resistência Extrema</option>
                  <option value="fazendeiro">Prova do Fazendeiro (Rural)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Circuit Assembly Line (Dropzone) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Layers size={16} /> Sequência do Circuito Montado ({selectedBlocks.length} / 5 blocos)
              </h3>
              <span className="text-xs text-slate-400 font-mono">Duração: {compiled.totalDurationMinutes} min</span>
            </div>

            {selectedBlocks.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-400">
                  Nenhum bloco adicionado ainda. Escolha os módulos na lista abaixo para compor o percurso.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedBlocks.map((block, idx) => (
                  <div
                    key={`${block.id}-${idx}`}
                    className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-lg bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center border border-amber-500/30">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{block.title}</h4>
                        <p className="text-[11px] text-slate-400">{block.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[11px] font-mono text-emerald-400">
                        R$ {block.cost.toLocaleString('pt-BR')}
                      </span>
                      <button
                        onClick={() => handleRemoveBlock(idx)}
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Blocks Library */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Plus size={16} /> Catálogo de Blocos Disponíveis para o Estúdio
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AVAILABLE_CHALLENGE_BLOCKS.map((blk) => (
                <div
                  key={blk.id}
                  className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-2 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {blk.title}
                      </h4>
                      <span className="text-[10px] font-mono text-emerald-400">
                        R$ {blk.cost.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">{blk.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <div className="flex gap-2 text-[10px] text-slate-400">
                      <span>Físico: <strong>{blk.physicalIntensity}/10</strong></span>
                      <span>Mental: <strong>{blk.mentalIntensity}/10</strong></span>
                    </div>
                    <button
                      onClick={() => handleAddBlock(blk)}
                      className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <Plus size={12} /> Adicionar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: REAL-TIME TELEMETRY & STATS ESTIMATION (1 col) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-amber-950/20 backdrop-blur-xl p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <Sparkles size={16} /> Estimativa de Impacto do Diretor
            </h3>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Custo Total de Produção:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  R$ {compiled.totalCost.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Dificuldade Estimada:</span>
                <span className="font-bold text-amber-400">{compiled.calculatedDifficulty} / 10</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Potencial de Audiência:</span>
                <span className="font-bold text-cyan-400">+{compiled.calculatedAudienceBoost} IBOPE</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Risco de Lesão/Fadiga:</span>
                <span className="font-bold text-rose-400">{compiled.calculatedInjuryRisk}%</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-[11px] text-slate-300 leading-relaxed">
              💡 <strong>Dica da Produção:</strong> Provas que misturam esforço físico com quiz ou tanque de gosma
              mantêm a atenção da família e geram memes instantâneos no X/Twitter.
            </div>

            <button
              onClick={handleSaveChallenge}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Save size={15} /> Concluir Montagem da Prova
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
