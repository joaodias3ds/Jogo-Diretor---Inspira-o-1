/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGameStore } from '@/app/useGameStore';
import { useAppStore } from '@/app/useAppStore';
import { useBroadcastStore } from '@/engine/broadcast/broadcastStore';
import { Card } from '@/ui/components/Card';
import { Button } from '@/ui/components/Button';
import { Badge } from '@/ui/components/Badge';
import {
  formParedao,
  executeBateVolta,
  calculateParedaoVotes,
} from '@/engine/voting/votingEngine';
import { simulateAIAudienceVoting } from '@/engine/ai-audience/aiViewerEngine';
import { ParedaoFormationState, ParedaoResult, VoteDistributionItem } from '@/engine/voting/votingTypes';
import { ViewerVoteBatch } from '@/engine/ai-audience/viewerTypes';
import { soundFx } from '@/audio/audioManager';
import {
  Vote,
  Tv,
  Users,
  Flame,
  ShieldAlert,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Play,
  UserX,
  Volume2,
  HelpCircle,
  Radio,
  Zap,
} from 'lucide-react';

export const LiveShowParedaoScreen: React.FC = () => {
  const { cast, relationMatrix, time, authority, ibope, saveGame } = useGameStore();
  const { addToast } = useAppStore();
  const { tickIbope } = useBroadcastStore();

  const [formation, setFormation] = useState<ParedaoFormationState | null>(null);
  const [result, setResult] = useState<ParedaoResult | null>(null);
  const [viewerBatches, setViewerBatches] = useState<ViewerVoteBatch[]>([]);
  const [isSimulatingVoting, setIsSimulatingVoting] = useState(false);
  const [showSpeech, setShowSpeech] = useState(false);
  const [useAIAudience, setUseAIAudience] = useState(true);

  // 1. Iniciar Formação de Paredão
  const handleStartFormation = () => {
    soundFx.playOnAirChime();
    const activeCast = cast.filter((p) => !p.isEliminated);
    const lider = activeCast[0]; // Líder atual da casa

    const newFormation = formParedao({
      week: time.week,
      cast: activeCast,
      liderId: lider?.id,
      immuneIds: [],
      relationMatrix,
      includeContragolpe: true,
      isParedaoFalso: false,
    });

    setFormation(newFormation);
    setResult(null);
    setShowSpeech(false);

    addToast(
      'warning',
      'Paredão Formado ao Vivo!',
      `Indicações do Líder, Votação da Casa e Contragolpe computadas.`
    );
  };

  // 2. Executar Prova Bate-e-Volta
  const handleBateVolta = () => {
    if (!formation) return;
    soundFx.playCameraSwitch();

    const outcome = executeBateVolta(formation, cast);
    setFormation({
      ...formation,
      nominees: outcome.updatedNominees,
    });

    if (outcome.savedNickname) {
      soundFx.playOnAirChime();
      addToast(
        'success',
        'Bate-e-Volta Concluído!',
        outcome.log
      );
    } else {
      addToast('info', 'Bate-e-Volta', outcome.log);
    }
  };

  // 3. Intervenção do Diretor: Paredão Falso
  const handleToggleParedaoFalso = () => {
    if (!formation) return;
    if (authority < 25) {
      addToast('error', 'Autoridade Insuficiente', 'Necessário 25 pontos de Autoridade.');
      return;
    }

    soundFx.playWarning();
    useGameStore.setState((state) => ({ authority: state.authority - 25 }));
    setFormation({
      ...formation,
      isParedaoFalso: !formation.isParedaoFalso,
      directorInterventionsApplied: [
        ...formation.directorInterventionsApplied,
        'Paredão transformado em PAREDÃO FALSO com Quarto Secreto',
      ],
    });

    addToast(
      'warning',
      'Intervenção do Diretor (-25 Autoridade)',
      'Este paredão agora é FALSO! O eliminado irá para o Quarto Secreto com telas exclusivas.'
    );
  };

  // 4. Abrir Votação Popular (Plateia de IA ou Fórmula)
  const handleRunVoting = () => {
    if (!formation) return;
    setIsSimulatingVoting(true);
    soundFx.playOnAirChime();

    setTimeout(() => {
      let finalResult: ParedaoResult;

      if (useAIAudience) {
        const aiOutcome = simulateAIAudienceVoting({
          nominees: formation.nominees,
          cast,
        });
        finalResult = aiOutcome.result;
        setViewerBatches(aiOutcome.viewerBatches);
      } else {
        finalResult = calculateParedaoVotes(formation.nominees, cast);
      }

      if (formation.isParedaoFalso) {
        finalResult.isFakeElimination = true;
        finalResult.presenterSpeech = `"Atenção casa! A decisão foi tomada. Quem sai hoje do jogo para o Quarto Secreto... é você, ${finalResult.eliminatedNickname}!"`;
      }

      setResult(finalResult);
      setIsSimulatingVoting(false);
      setShowSpeech(true);

      // Atualiza IBOPE com pico de audiência ao vivo
      tickIbope(ibope, 4.2);

      // Marca o participante como eliminado (se não for paredão falso)
      if (!formation.isParedaoFalso) {
        useGameStore.setState((state) => ({
          cast: state.cast.map((p) =>
            p.id === finalResult.eliminatedParticipantId ? { ...p, isEliminated: true } : p
          ),
          authority: Math.min(100, state.authority + 10),
        }));
      }

      addToast(
        'success',
        'Votação Encerrada!',
        `${(finalResult.totalVotesCount / 1000000).toFixed(1)}M de votos computados. ${finalResult.eliminatedNickname} foi ${formation.isParedaoFalso ? 'enviado(a) ao Quarto Secreto' : 'eliminado(a)'}!`
      );
    }, 700);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header do Show ao Vivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="live" pulse size="sm">DOMINGO AO VIVO</Badge>
            <span className="text-xs font-mono text-cyan-400">PROGRAMA DE ELIMINAÇÃO</span>
          </div>
          <h2 className="text-xl font-black text-white">Noite de Paredão & Votação Popular</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Comandado pelo apresentador <strong>Tadeu Santiago</strong>. Formação completa com Líder, Casa, Contragolpe e Bate-e-Volta.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!formation ? (
            <Button
              variant="on-air"
              size="md"
              leftIcon={<Vote size={16} />}
              onClick={handleStartFormation}
            >
              Iniciar Formação de Paredão
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Zap size={14} />}
                onClick={handleBateVolta}
              >
                Disputar Bate-e-Volta
              </Button>
              <Button
                variant="danger"
                size="md"
                leftIcon={<Play size={16} />}
                isLoading={isSimulatingVoting}
                onClick={handleRunVoting}
              >
                Abrir Votação Popular
              </Button>
            </div>
          )}
        </div>
      </div>

      {!formation ? (
        <Card className="text-center py-12 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-950/60 border border-red-800/40 text-red-400 flex items-center justify-center">
            <Vote size={28} />
          </div>
          <h3 className="text-base font-bold text-white">Nenhum Paredão Ativo no Momento</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Clique no botão acima para iniciar o ritual de formação do paredão: o Líder indicará um alvo, a casa votará no confessionário e o mais votado terá direito a contragolpe.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1 e 2: Berlinda dos Emparedados */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Users size={16} className="text-cyan-400" />
                <span>Emparedados da Semana ({formation.nominees.length})</span>
              </h3>
              <div className="flex items-center gap-2 text-xs font-mono">
                <button
                  onClick={() => setUseAIAudience(!useAIAudience)}
                  className={`px-2 py-0.5 rounded border transition-all ${
                    useAIAudience
                      ? 'bg-cyan-950/60 border-cyan-800 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {useAIAudience ? 'Plateia de IA: ATIVA' : 'Voto Fórmula: ATIVA'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {formation.nominees.map((nominee) => {
                const isSaved = nominee.savedByBateVolta;
                const p = cast.find((c) => c.id === nominee.participantId);

                return (
                  <div
                    key={nominee.participantId}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      isSaved
                        ? 'border-emerald-800/40 bg-emerald-950/20 opacity-60'
                        : 'border-red-800/60 bg-red-950/20 shadow-lg'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                        <span className="text-red-400 font-bold uppercase">{nominee.nominatedBy}</span>
                        {isSaved && (
                          <Badge variant="success" size="sm">SALVO NO BATE-E-VOLTA</Badge>
                        )}
                      </div>
                      <h4 className="text-base font-black text-white">{nominee.nickname}</h4>
                      <p className="text-[11px] text-slate-300 mt-1">{nominee.reason}</p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                      <span>Pop: {p?.stats.popularity || 50}%</span>
                      <span>Rej: {p?.stats.rejection || 20}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Intervenções do Diretor */}
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={16} className="text-purple-400" />
                  <h4 className="font-bold text-white text-xs">Poderes e Intervenções do Diretor</h4>
                </div>
                <span className="text-xs font-mono text-purple-300">
                  Autoridade Disponível: <strong>{authority} pts</strong>
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={formation.isParedaoFalso ? 'danger' : 'ghost'}
                  size="sm"
                  onClick={handleToggleParedaoFalso}
                >
                  {formation.isParedaoFalso ? '★ Paredão Falso Ativado' : 'Transformar em Paredão Falso (-25 Aut)'}
                </Button>
              </div>
            </Card>

            {/* Votação da Casa detalhada */}
            <Card className="space-y-2">
              <h4 className="font-bold text-white text-xs mb-2">Registro de Votos no Confessionário</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {formation.houseVotes.map((v, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono">
                    <div className="flex items-center justify-between text-slate-300 font-bold">
                      <span className="text-cyan-400">{v.voterNickname}</span>
                      <span className="text-red-400">→ Votou em {v.targetNickname}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 italic">{v.justification}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Coluna 3: Resultado da Votação Popular & Discurso */}
          <div className="space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Tv size={16} className="text-red-400" />
              <span>Placar de Votação Popular</span>
            </h3>

            {result ? (
              <div className="space-y-4">
                <Card glow="red" className="space-y-4 bg-slate-950/90 border-red-800/60">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-mono text-slate-400">TOTAL DE VOTOS</span>
                    <span className="text-sm font-bold font-mono text-white">
                      {(result.totalVotesCount / 1000000).toFixed(1)} Milhões
                    </span>
                  </div>

                  {/* Barras de Porcentagem */}
                  <div className="space-y-3">
                    {result.distribution.map((dist) => (
                      <div key={dist.participantId} className="space-y-1 font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <span className={dist.isEliminated ? 'text-red-400 font-bold' : 'text-slate-300'}>
                            {dist.nickname} {dist.isEliminated && '(ELIMINADO)'}
                          </span>
                          <span className="text-white font-bold">{dist.percentage}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              dist.isEliminated ? 'bg-red-500' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${dist.percentage}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>{dist.fandomName}</span>
                          <span>{dist.rawVotes.toLocaleString('pt-BR')} votos</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Discurso do Apresentador */}
                  {showSpeech && (
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold font-mono">
                        <Volume2 size={14} />
                        <span>DISCURSO DE TADEU SANTIAGO</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed italic">
                        {result.presenterSpeech}
                      </p>
                    </div>
                  )}
                </Card>

                {/* Justificativas da Plateia de IA */}
                {viewerBatches.length > 0 && (
                  <Card className="space-y-2">
                    <h4 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                      <Sparkles size={13} className="text-cyan-400" />
                      <span>Vozes Auditadas da Plateia de IA</span>
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {viewerBatches.map((b, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-slate-900/40 border border-slate-800 text-[11px] font-mono">
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="text-slate-200 font-bold">{b.viewerName}</span>
                            <span className="text-red-400">Votou p/ sair: {b.votedTargetNickname}</span>
                          </div>
                          <p className="text-slate-400 mt-1 italic leading-tight">"{b.justification}"</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="text-center py-8 text-xs text-slate-400 font-mono">
                Aguardando abertura de votação pelo diretor...
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
