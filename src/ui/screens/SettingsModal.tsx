/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Modal } from '@/ui/components/Modal';
import { Button } from '@/ui/components/Button';
import { useAppStore } from '@/app/useAppStore';
import { Volume2, Sliders, Sparkles, Key, Check } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { activeModal, closeModal, isMuted, toggleMute, volume, setVolume, addToast } =
    useAppStore();

  const [geminiKey, setGeminiKey] = useState('');
  const [useOfflineFallback, setUseOfflineFallback] = useState(true);

  if (activeModal !== 'settings') return null;

  const handleSave = () => {
    addToast('success', 'Configurações Atualizadas', 'Parâmetros da central de produção foram salvos.');
    closeModal();
  };

  return (
    <Modal
      isOpen={true}
      onClose={closeModal}
      title="Configurações da Central de Produção"
      subtitle="Parâmetros técnicos da ilha de comando, áudio e conexões de IA"
      maxWidth="lg"
    >
      <div className="space-y-5 text-sm">
        {/* Áudio & Efeitos */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-2 font-semibold text-white mb-3">
            <Volume2 size={16} className="text-cyan-400" />
            <span>Mixer de Áudio da Central</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Volume Geral dos Efeitos</span>
              <span className="font-mono text-cyan-400 text-xs">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400 text-xs">Mudo Geral</span>
              <button
                onClick={toggleMute}
                className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                  isMuted
                    ? 'bg-red-950/60 text-red-300 border-red-800/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {isMuted ? 'Mutado' : 'Ativo'}
              </button>
            </div>
          </div>
        </div>

        {/* Integração de IA (Gemini) */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-2 font-semibold text-white mb-2">
            <Sparkles size={16} className="text-purple-400" />
            <span>Motor Criativo de IA (Gemini API)</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            O jogo possui banco de frases offline e suporte integrado para gerar falas, matérias de fofoca e reações da plateia em tempo real.
          </p>

          <div className="space-y-2">
            <label className="text-xs text-slate-300 flex items-center gap-1.5">
              <Key size={13} className="text-slate-400" />
              <span>Chave de API Gemini (opcional / privada local)</span>
            </label>
            <input
              type="password"
              placeholder="AIzaSy... (ou deixe vazio para usar o fallback offline)"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80">
            <div>
              <div className="text-xs font-medium text-slate-300">Modo de Fallback Inteligente</div>
              <div className="text-[11px] text-slate-400">Garante que o jogo continue funcionando sem rede</div>
            </div>
            <button
              onClick={() => setUseOfflineFallback(!useOfflineFallback)}
              className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                useOfflineFallback
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {useOfflineFallback ? 'Ligado' : 'Desligado'}
            </button>
          </div>
        </div>

        {/* Gráficos e Desempenho */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-2 font-semibold text-white mb-2">
            <Sliders size={16} className="text-amber-400" />
            <span>Qualidade e Simulação</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['Alta (60 FPS)', 'Balanceada', 'Performance'].map((perf, idx) => (
              <div
                key={perf}
                className={`p-2.5 rounded-lg border text-center text-xs cursor-pointer transition-colors ${
                  idx === 0
                    ? 'border-cyan-500/50 bg-cyan-950/30 text-cyan-300 font-semibold'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-300'
                }`}
              >
                {perf}
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={closeModal}>
            Cancelar
          </Button>
          <Button variant="primary" leftIcon={<Check size={16} />} onClick={handleSave}>
            Salvar Preferências
          </Button>
        </div>
      </div>
    </Modal>
  );
};
