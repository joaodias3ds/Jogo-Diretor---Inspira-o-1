/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Participant } from '@/engine/housemates/types';
import { generateAIDirectorDossier, generateAILiveSocialPost } from '@/engine/ai/geminiService';
import { Modal } from '@/ui/components/Modal';
import { Button } from '@/ui/components/Button';
import { Badge } from '@/ui/components/Badge';
import {
  Sparkles,
  Flame,
  TrendingUp,
  AlertTriangle,
  Heart,
  ThumbsDown,
  MessageSquare,
  Bot,
  CheckCircle,
  Eye,
  Shield,
  Award,
} from 'lucide-react';
import { soundFx } from '@/audio/audioManager';

interface ParticipantSocialDossierModalProps {
  participant: Participant | null;
  onClose: () => void;
  onPostGenerated?: (post: any) => void;
}

export const ParticipantSocialDossierModal: React.FC<ParticipantSocialDossierModalProps> = ({
  participant,
  onClose,
  onPostGenerated,
}) => {
  if (!participant) return null;

  const [isLoadingAiDossier, setIsLoadingAiDossier] = useState(false);
  const [aiDossier, setAiDossier] = useState<{
    narrativeAngle: string;
    publicPerception: string;
    directorRecommendation: string;
    audienceProjection: string;
    cancelRiskRating: 'Baixo' | 'Médio' | 'Crítico';
  } | null>(null);

  const [isLoadingAiPost, setIsLoadingAiPost] = useState(false);
  const [generatedAiPost, setGeneratedAiPost] = useState<any | null>(null);

  const char = participant.charisma ?? 70;
  const cont = participant.controversy ?? 50;
  const pop = participant.stats.popularity;
  const rej = participant.stats.rejection ?? Math.max(5, 100 - pop);

  const handleGenerateAiDossier = async () => {
    soundFx.playClick();
    setIsLoadingAiDossier(true);
    const result = await generateAIDirectorDossier(participant);
    setAiDossier(result);
    setIsLoadingAiDossier(false);
    soundFx.playOnAirChime();
  };

  const handleGenerateAiTweet = async () => {
    soundFx.playClick();
    setIsLoadingAiPost(true);
    const tweet = await generateAILiveSocialPost([participant]);
    setGeneratedAiPost(tweet);
    setIsLoadingAiPost(false);
    soundFx.playOnAirChime();
    if (onPostGenerated) {
      onPostGenerated(tweet);
    }
  };

  return (
    <Modal isOpen={!!participant} onClose={onClose} title="Dossiê de Redes Sociais & Análise IA">
      <div className="space-y-5 text-slate-100 max-h-[75vh] overflow-y-auto pr-1">
        {/* 1. Header do Perfil com Avatar e Archetype */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${participant.avatarColor} flex items-center justify-center font-black text-white text-xl shadow-lg border border-white/10 shrink-0`}
            >
              {participant.nickname.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{participant.nickname}</h3>
                <span className="text-xs text-slate-400">({participant.name})</span>
                <Badge variant="info" size="sm">
                  {participant.archetype || participant.temperament}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {participant.profession} · {participant.hometown}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40 font-bold">
                  Torcida: {participant.fandomName || `#Team${participant.nickname}`}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 uppercase block">Localização</span>
            <span className="text-xs font-bold text-emerald-400">
              📍 {participant.currentRoom.replace('-', ' ')}
            </span>
          </div>
        </div>

        {/* 2. Métricas Chave: Carisma vs Controvérsia */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-900/40">
            <div className="flex justify-between items-center text-xs font-mono mb-1">
              <span className="text-cyan-400 flex items-center gap-1 font-bold">
                <Sparkles size={12} /> Carisma do Participante
              </span>
              <strong className="text-white">{char}/100</strong>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${char}%` }} />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Fidelidade de público e apelo com patrocinadores
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-900/40">
            <div className="flex justify-between items-center text-xs font-mono mb-1">
              <span className="text-amber-400 flex items-center gap-1 font-bold">
                <Flame size={12} /> Índice de Controvérsia
              </span>
              <strong className="text-white">{cont}/100</strong>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-rose-600 h-full rounded-full" style={{ width: `${cont}%` }} />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Gera picos de audiência e atritos na convivência
            </span>
          </div>
        </div>

        {/* 3. Termômetro das Redes: Amor vs Rejeição vs Memômetro */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h4 className="text-xs font-mono uppercase font-bold text-slate-300 flex items-center gap-2">
            <TrendingUp size={14} className="text-purple-400" />
            Termômetro de Sentimento do Público
          </h4>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-emerald-400 flex items-center gap-1">
                  <Heart size={12} /> Favorabilidade / Simpatia
                </span>
                <strong className="text-emerald-400">{pop}%</strong>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pop}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-rose-400 flex items-center gap-1">
                  <ThumbsDown size={12} /> Rejeição Estimada no Paredão
                </span>
                <strong className="text-rose-400">{rej}%</strong>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${rej}%` }} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
            <span>Memômetro: <strong className="text-amber-400">🔥 9.4/10</strong></span>
            <span>Velocidade de Menções: <strong className="text-cyan-400">18.5k/hora</strong></span>
          </div>
        </div>

        {/* 4. Análise Executiva via Inteligência Artificial (Gemini) */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="text-cyan-400" size={18} />
              <h4 className="font-bold text-xs uppercase font-mono text-cyan-300">
                Análise Estratégica da Direção via IA (Gemini)
              </h4>
            </div>
            <Button
              variant="cyber"
              size="sm"
              onClick={handleGenerateAiDossier}
              isLoading={isLoadingAiDossier}
              leftIcon={<Sparkles size={13} />}
            >
              {aiDossier ? 'Recalcular Análise IA' : 'Gerar Análise Profunda IA'}
            </Button>
          </div>

          {aiDossier ? (
            <div className="space-y-2.5 pt-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold block mb-0.5">
                  Enquadramento Narrativo de Edição:
                </span>
                <p className="text-slate-200">{aiDossier.narrativeAngle}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="font-mono text-[10px] text-amber-400 uppercase font-bold block mb-0.5">
                  Percepção do Público nas Redes:
                </span>
                <p className="text-slate-200">{aiDossier.publicPerception}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold block mb-0.5">
                  Recomendação Confidencial da Direção:
                </span>
                <p className="text-slate-200">{aiDossier.directorRecommendation}</p>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/90 border border-slate-800 font-mono text-[11px]">
                <span className="text-purple-300">{aiDossier.audienceProjection}</span>
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    aiDossier.cancelRiskRating === 'Crítico'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800/40'
                      : aiDossier.cancelRiskRating === 'Médio'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                  }`}
                >
                  Risco de Cancelamento: {aiDossier.cancelRiskRating}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Clique acima para consultar a IA do Google Gemini. Ela avaliará o perfil do participante, arquétipo, índices de carisma/controvérsia e sugerirá a melhor linha editorial para a emissora.
            </p>
          )}
        </div>

        {/* 5. Geração de Post do Público ao Vivo via IA */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase font-bold text-slate-300 flex items-center gap-1.5">
              <MessageSquare size={14} className="text-cyan-400" />
              Reação ao Vivo das Redes (Gerador de Tweets com IA)
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerateAiTweet}
              isLoading={isLoadingAiPost}
            >
              Gerar Tweet com IA
            </Button>
          </div>

          {generatedAiPost && (
            <div className="p-3 rounded-xl bg-slate-950 border border-cyan-800/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <strong className="text-xs text-white">{generatedAiPost.authorName}</strong>
                  <span className="text-[11px] text-slate-400 font-mono">{generatedAiPost.authorHandle}</span>
                  {generatedAiPost.isVerified && (
                    <Badge variant="info" size="sm">✓ Verificado</Badge>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-200">{generatedAiPost.text}</p>
              <div className="flex gap-1.5 pt-1">
                {generatedAiPost.hashtags?.map((tag: string, i: number) => (
                  <span key={i} className="text-[10px] font-mono text-cyan-400">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
