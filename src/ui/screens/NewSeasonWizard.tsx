/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGameStore } from '@/app/useGameStore';
import { useAppStore } from '@/app/useAppStore';
import { SeasonConfig, createDefaultSeasonConfig } from '@/engine/season/seasonConfig';
import { RealityMode, REALITY_MODES } from '@/config/theme';
import { DifficultyLevel } from '@/config/balance';
import { Card } from '@/ui/components/Card';
import { Button } from '@/ui/components/Button';
import { Badge } from '@/ui/components/Badge';
import { soundFx } from '@/audio/audioManager';
import {
  Tv,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Award,
  Shield,
  DollarSign,
  Users,
  Calendar,
  Flame,
  Crown,
} from 'lucide-react';

export interface NewSeasonWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const NewSeasonWizard: React.FC<NewSeasonWizardProps> = ({
  onComplete,
  onCancel,
}) => {
  const { initSeason } = useGameStore();
  const { addToast } = useAppStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mode, setMode] = useState<RealityMode>('house');

  const [config, setConfig] = useState<SeasonConfig>(() =>
    createDefaultSeasonConfig('house')
  );

  const handleModeChange = (newMode: RealityMode) => {
    soundFx.playClick();
    setMode(newMode);
    const newDefaults = createDefaultSeasonConfig(newMode);
    setConfig((prev) => ({
      ...prev,
      mode: newMode,
      programName: newDefaults.programName,
      hostName: newDefaults.hostName,
      slogan: newDefaults.slogan,
      primaryColor: newDefaults.primaryColor,
    }));
  };

  const handleFinish = async () => {
    soundFx.playOnAirChime();
    try {
      await initSeason(config);
      addToast(
        'success',
        'Temporada Criada com Sucesso!',
        `"${config.programName}" está no ar! Boa sorte na direção da emissora.`
      );
      onComplete();
    } catch {
      addToast('error', 'Erro ao Salvar', 'Não foi possível salvar a temporada localmente.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Header com Progresso das 3 Etapas */}
      <div className="text-center mb-8">
        <Badge variant="live" pulse size="sm" className="mb-2">
          FASE 1 — PRODUÇÃO & CASTING
        </Badge>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Criar Nova Temporada de Reality Show
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg mx-auto">
          Configure a identidade da atração, o formato de confinamento e o balanço financeiro antes de ligar os holofotes.
        </p>

        {/* Marcador das 3 etapas */}
        <div className="flex items-center justify-center gap-3 mt-6">
          {[
            { num: 1, title: 'Identidade' },
            { num: 2, title: 'Formato & Cenário' },
            { num: 3, title: 'Regras & Dificuldade' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                  step === s.num
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                    : step > s.num
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}
              >
                {step > s.num ? <Check size={14} /> : s.num}
              </div>
              <span
                className={`text-xs hidden sm:inline ${
                  step === s.num ? 'text-white font-bold' : 'text-slate-500'
                }`}
              >
                {s.title}
              </span>
              {s.num < 3 && <span className="text-slate-700 hidden sm:inline">———</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Conteúdo da Etapa */}
      <Card className="p-6 sm:p-8 bg-slate-950/80 border-slate-800 shadow-2xl">
        {/* ETAPA 1: Identidade */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Tv size={20} className="text-cyan-400" />
                Etapa 1: Identidade da Atração & Emissora
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Defina como seu reality show será reconhecido pelo público brasileiro e pela imprensa.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Nome do Programa</label>
                <input
                  type="text"
                  value={config.programName}
                  onChange={(e) => setConfig({ ...config, programName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Emissora de Televisão</label>
                <input
                  type="text"
                  value={config.networkName}
                  onChange={(e) => setConfig({ ...config, networkName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Apresentador(a) Principal</label>
                <input
                  type="text"
                  value={config.hostName}
                  onChange={(e) => setConfig({ ...config, hostName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Slogan de Transmissão</label>
                <input
                  type="text"
                  value={config.slogan}
                  onChange={(e) => setConfig({ ...config, slogan: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Estilo Visual do Logo */}
            <div className="space-y-2 pt-2">
              <label className="font-semibold text-slate-300 text-xs">Estilo da Marca / Logo</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'pop', label: 'Pop & Moderno', desc: 'Cores vibrantes de TV aberta' },
                  { id: 'cyber', label: 'Cyber Control', desc: 'Estética neon de streaming' },
                  { id: 'rustic', label: 'Rústico Campo', desc: 'Madeira e tons de terra' },
                  { id: 'minimal', label: 'Minimalista', desc: 'Visual escuro e elegante' },
                ].map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      soundFx.playClick();
                      setConfig({ ...config, logoStyle: s.id as typeof config.logoStyle });
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      config.logoStyle === s.id
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-white mb-0.5">{s.label}</div>
                    <div className="text-[10px] text-slate-400 leading-tight">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 2: Formato e Cenário */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Crown size={20} className="text-amber-400" />
                Etapa 2: Formato do Reality Show & Cenário
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Escolha a dinâmica de confinamento e a arena principal do programa.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.values(REALITY_MODES).map((m) => {
                const isSelected = mode === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => handleModeChange(m.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-xl shadow-cyan-950/40 ring-2 ring-cyan-400/30'
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-white text-base">{m.name}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${m.badgeColor}`}>
                          {m.eliminationTitle}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">{m.description}</p>
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                      <div>Liderança: <strong className="text-slate-200">{m.leaderTitle}</strong></div>
                      <div>Eliminação: <strong className="text-rose-400">{m.eliminationTitle}</strong></div>
                      <div>Castigo: <strong className="text-amber-300">{m.castigoTitle}</strong></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ETAPA 3: Regras, Dificuldade e Orçamento */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Award size={20} className="text-emerald-400" />
                Etapa 3: Regras, Duração e Dificuldade
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Equilibre o orçamento inicial com a exigência da diretoria da emissora.
              </p>
            </div>

            {/* Nível de Dificuldade */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-300 text-xs">Nível de Dificuldade</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'easy', label: 'Fácil', cash: 'R$ 375k', desc: 'Custos mais baixos e bônus de IBOPE' },
                  { id: 'normal', label: 'Normal', cash: 'R$ 250k', desc: 'A experiência clássica de diretor' },
                  { id: 'hard', label: 'Difícil', cash: 'R$ 160k', desc: 'Diretoria impaciente e custos pesados' },
                  { id: 'godMode', label: 'Diretor-Deus', cash: 'Sem Limite', desc: 'Dinheiro ilimitado, sem game over' },
                ].map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      soundFx.playClick();
                      const mult = d.id === 'easy' ? 375000 : d.id === 'hard' ? 160000 : d.id === 'godMode' ? 9999999 : 250000;
                      setConfig({ ...config, difficulty: d.id as DifficultyLevel, initialCash: mult });
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      config.difficulty === d.id
                        ? 'border-emerald-400 bg-emerald-950/40 text-emerald-200'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-white">{d.label}</div>
                    <div className="font-mono text-emerald-400 text-[11px] my-0.5">{d.cash}</div>
                    <div className="text-[10px] text-slate-500 leading-tight">{d.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Escala e Duração */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <label className="text-slate-300 flex items-center gap-1.5 font-semibold">
                  <Users size={14} className="text-cyan-400" />
                  <span>Elenco Inicial (Confinados)</span>
                </label>
                <div className="text-lg font-mono font-bold text-white">20 Participantes</div>
                <p className="text-[11px] text-slate-500">
                  Elenco diversificado pronto com médicos, atletas, músicos e influencers.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <label className="text-slate-300 flex items-center gap-1.5 font-semibold">
                  <Calendar size={14} className="text-purple-400" />
                  <span>Duração da Temporada</span>
                </label>
                <div className="text-lg font-mono font-bold text-white">{config.durationWeeks} Semanas</div>
                <p className="text-[11px] text-slate-500">
                  Total de 84 dias de transmissão ininterrupta 24 horas.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <label className="text-slate-300 flex items-center gap-1.5 font-semibold">
                  <DollarSign size={14} className="text-emerald-400" />
                  <span>Prêmio Final do Campeão</span>
                </label>
                <div className="text-lg font-mono font-bold text-emerald-400">R$ 2.500.000</div>
                <p className="text-[11px] text-slate-500">
                  Garantido pela cota master dos patrocinadores.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rodapé de Navegação do Wizard */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-800">
          {step > 1 ? (
            <Button
              variant="ghost"
              size="md"
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => {
                soundFx.playClick();
                setStep((prev) => (prev - 1) as 1 | 2);
              }}
            >
              Voltar
            </Button>
          ) : (
            <Button variant="ghost" size="md" onClick={onCancel}>
              Cancelar
            </Button>
          )}

          {step < 3 ? (
            <Button
              variant="primary"
              size="md"
              rightIcon={<ArrowRight size={16} />}
              onClick={() => {
                soundFx.playClick();
                setStep((prev) => (prev + 1) as 2 | 3);
              }}
            >
              Próxima Etapa
            </Button>
          ) : (
            <Button
              variant="on-air"
              size="lg"
              leftIcon={<Check size={18} />}
              onClick={handleFinish}
            >
              Estrear Programa (Entrar no Ar)
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
