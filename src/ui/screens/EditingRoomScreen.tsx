/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/app/useGameStore';
import { useAppStore } from '@/app/useAppStore';
import { useBroadcastStore } from '@/engine/broadcast/broadcastStore';
import { Card } from '@/ui/components/Card';
import { Button } from '@/ui/components/Button';
import { Badge } from '@/ui/components/Badge';
import { BroadcastTake } from '@/engine/broadcast/broadcastTypes';
import { soundFx } from '@/audio/audioManager';
import {
  Film,
  Sparkles,
  AlertTriangle,
  Play,
  Square,
  CheckCircle2,
  Tv,
  Layers,
  Flame,
  Heart,
  Eye,
  Smile,
  Music,
  Volume2,
  Sliders,
  Scissors,
  Check,
  TrendingUp,
  Clock,
  Radio,
} from 'lucide-react';

export type EditingNarrativeBias = 'vilao' | 'vitima' | 'comedia' | 'romance' | 'fogo-no-parquinho';

interface AudioTrackFx {
  id: string;
  name: string;
  category: 'sfx' | 'music';
  duration: string;
  description: string;
}

const AVAILABLE_SFX: AudioTrackFx[] = [
  { id: 'sfx-1', name: '🔔 Sino da Discórdia (Tensão Máxima)', category: 'sfx', duration: '0:03', description: 'Impacto sonoro agudo usado em acusações no Sincerão' },
  { id: 'sfx-2', name: '🍳 Panelaço e Batida Metálica', category: 'sfx', duration: '0:04', description: 'Efeito clássico de briga na cozinha por comida da Xepa' },
  { id: 'sfx-3', name: '🎻 Violino Triste da Sofrência', category: 'sfx', duration: '0:08', description: 'Realça a melancolia de participantes isolados ou chorando' },
  { id: 'sfx-4', name: '🥁 Batidão de Suspense Subgrave', category: 'sfx', duration: '0:06', description: 'Eleva a pulsação do público antes de uma revelação' },
  { id: 'sfx-5', name: '😂 Risada de Deboche & Meme', category: 'sfx', duration: '0:03', description: 'Perfeito para cortes cômicos e gafes de confinamento' },
];

const AVAILABLE_MUSIC: AudioTrackFx[] = [
  { id: 'mus-1', name: 'Orquestra de Confronto Épico', category: 'music', duration: '0:45', description: 'Trilha pesada de suspense para vilões e confrontos verbais' },
  { id: 'mus-2', name: 'Acústico Melancólico de Despedida', category: 'music', duration: '0:40', description: 'Violão suave para arcos de superação e injustiça' },
  { id: 'mus-3', name: 'Funk Acelerado do Paredão', category: 'music', duration: '0:35', description: 'Batida eletrizante para dinâmicas de votação rápida' },
  { id: 'mus-4', name: 'Jazz Cômico Pastelão', category: 'music', duration: '0:30', description: 'Ritmo descontraído para cortes de trapalhadas e preguiça' },
];

export const EditingRoomScreen: React.FC = () => {
  const { cast, time, cash, ibope, saveGame } = useGameStore();
  const { addToast } = useAppStore();
  const { recordedTakes, tickIbope } = useBroadcastStore();

  const [selectedNarrativeBias, setSelectedNarrativeBias] = useState<EditingNarrativeBias>('vilao');
  const [selectedTargetId, setSelectedTargetId] = useState<string>(cast[0]?.id || '');
  const [selectedTakeIds, setSelectedTakeIds] = useState<string[]>([]);
  const [selectedSfxId, setSelectedSfxId] = useState<string>('sfx-1');
  const [selectedMusicId, setSelectedMusicId] = useState<string>('mus-1');
  const [selectedLowerThird, setSelectedLowerThird] = useState<string>('🚨 EXCLUSIVO: Conspiração de Votos Revelada!');
  const [selectedVisualFilter, setSelectedVisualFilter] = useState<'normal' | 'noir' | 'nightvision' | 'warm'>('normal');

  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewTimecode, setPreviewTimecode] = useState('00:00:00:00');
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderedSuccess, setRenderedSuccess] = useState(false);

  // Se não houver takes gravados ainda, fornece blocos da casa
  const availableTakes: BroadcastTake[] = recordedTakes.length > 0
    ? recordedTakes
    : [
        {
          id: 'take-mock-01',
          timestamp: '14:22:10',
          timecode: '01:14:22:04',
          roomId: 'cozinha-vip',
          cameraName: 'Cozinha VIP',
          narrativeTag: 'treta',
          title: 'Discussão ácida sobre a divisão da comida e louça suja',
          durationSeconds: 45,
          dramaRating: 5,
          ibopeImpact: 2.1,
        },
        {
          id: 'take-mock-02',
          timestamp: '16:05:30',
          timecode: '01:16:05:12',
          roomId: 'quarto-selva',
          cameraName: 'Quarto Selva',
          narrativeTag: 'estrategia',
          title: 'Articulação de votos em sussurros debaixo do edredom',
          durationSeconds: 60,
          dramaRating: 4,
          ibopeImpact: 1.8,
        },
        {
          id: 'take-mock-03',
          timestamp: '18:40:00',
          timecode: '01:18:40:08',
          roomId: 'piscina-jardim',
          cameraName: 'Piscina & Jardim',
          narrativeTag: 'romance',
          title: 'Carícias e troca de confidências na hidro',
          durationSeconds: 50,
          dramaRating: 3,
          ibopeImpact: 1.4,
        },
        {
          id: 'take-mock-04',
          timestamp: '20:15:20',
          timecode: '01:20:15:24',
          roomId: 'confessionario',
          cameraName: 'Confessionário',
          narrativeTag: 'emocao',
          title: 'Desabafo em lágrimas sobre a perseguição na casa',
          durationSeconds: 40,
          dramaRating: 4,
          ibopeImpact: 1.6,
        },
      ];

  const targetParticipant = cast.find((p) => p.id === selectedTargetId) || cast[0];

  const toggleTakeSelection = (id: string) => {
    soundFx.playClick();
    setSelectedTakeIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSelectAllTakes = () => {
    soundFx.playClick();
    if (selectedTakeIds.length === availableTakes.length) {
      setSelectedTakeIds([]);
    } else {
      setSelectedTakeIds(availableTakes.map((t) => t.id));
    }
  };

  // Cálculo de projeção da edição
  const selectedCount = selectedTakeIds.length || 1;
  let projectedIbopeBoost = 0;
  let targetPopularityDelta = 0;
  let targetRejectionDelta = 0;
  let conarRiskLevel: 'Baixo' | 'Médio' | 'Alto' = 'Baixo';

  switch (selectedNarrativeBias) {
    case 'vilao':
      projectedIbopeBoost = parseFloat((selectedCount * 0.9 + 1.2).toFixed(1));
      targetPopularityDelta = -12;
      targetRejectionDelta = +18;
      conarRiskLevel = 'Médio';
      break;
    case 'vitima':
      projectedIbopeBoost = parseFloat((selectedCount * 0.7 + 0.9).toFixed(1));
      targetPopularityDelta = +16;
      targetRejectionDelta = -10;
      conarRiskLevel = 'Baixo';
      break;
    case 'comedia':
      projectedIbopeBoost = parseFloat((selectedCount * 0.5 + 0.6).toFixed(1));
      targetPopularityDelta = +6;
      targetRejectionDelta = -2;
      conarRiskLevel = 'Baixo';
      break;
    case 'romance':
      projectedIbopeBoost = parseFloat((selectedCount * 0.6 + 0.8).toFixed(1));
      targetPopularityDelta = +8;
      targetRejectionDelta = -4;
      conarRiskLevel = 'Baixo';
      break;
    case 'fogo-no-parquinho':
      projectedIbopeBoost = parseFloat((selectedCount * 1.3 + 1.8).toFixed(1));
      targetPopularityDelta = -6;
      targetRejectionDelta = +12;
      conarRiskLevel = 'Alto';
      break;
  }

  const handlePlayPreview = () => {
    soundFx.playClick();
    setIsPlayingPreview(!isPlayingPreview);
  };

  const handleRenderAndBroadcast = () => {
    soundFx.playOnAirChime();
    setIsRendering(true);
    setRenderProgress(0);

    const interval = setInterval(() => {
      setRenderProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRendering(false);
          setRenderedSuccess(true);
          tickIbope(projectedIbopeBoost);
          addToast(
            'success',
            'BLOCO EDITADO EXIBIDO NO HORÁRIO NOBRE!',
            `Audiência disparou +${projectedIbopeBoost} pts no IBOPE! O público reagiu intensamente à narrativa de ${selectedNarrativeBias.toUpperCase()}.`
          );
          return 100;
        }
        return prev + 25;
      });
    }, 280);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
      {/* 1. Header da Ilha de Edição Audiovisual */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs font-mono">
            <span className="text-amber-400 font-bold tracking-wider">PÓS-PRODUÇÃO & BROADCAST</span>
            <span className="text-slate-600">·</span>
            <span className="text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              ILHA DE EDIÇÃO NÃO-LINEAR (NLE)
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-purple-300 font-mono">TC: 01:28:44:12</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Scissors className="text-amber-400" size={28} />
            Ilha de Edição Multitrack & Narrativas
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Crie o resumo diário do programa. Combine takes de vídeo gravados, efeitos sonoros (panelaço, violino triste), trilhas sonoras dramáticas e escolha o viés editorial que manipulará a percepção do público.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="md"
            leftIcon={<Layers size={15} />}
            onClick={handleSelectAllTakes}
          >
            {selectedTakeIds.length === availableTakes.length ? 'Desmarcar Todos' : 'Selecionar Todos os Takes'}
          </Button>

          <Button
            variant="on-air"
            size="md"
            leftIcon={<Radio size={16} />}
            isLoading={isRendering}
            onClick={handleRenderAndBroadcast}
          >
            Renderizar & Exibir no Bloco do Programa
          </Button>
        </div>
      </div>

      {/* 2. Monitor de Preview ao Vivo & Painel de Impacto */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monitor de Vídeo NLE (2 Colunas) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl aspect-video flex flex-col justify-between p-4">
            {/* Header do Monitor */}
            <div className="flex items-center justify-between text-xs font-mono z-10">
              <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-md border border-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />
                <span className="text-red-400 font-bold">PREVIEW NLE</span>
                <span className="text-slate-400">|</span>
                <span className="text-cyan-400">1080p60 · REC 709</span>
              </div>
              <div className="bg-slate-900/80 backdrop-blur px-3 py-1 rounded-md border border-slate-700 text-amber-400 font-bold tracking-wider">
                01:15:32:08
              </div>
            </div>

            {/* Simulação Visual do Corte com Filtro Ativo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`w-full h-full flex flex-col items-center justify-center p-6 text-center ${
                  selectedVisualFilter === 'noir'
                    ? 'grayscale contrast-125 bg-slate-950'
                    : selectedVisualFilter === 'nightvision'
                    ? 'bg-emerald-950/70 text-emerald-300'
                    : selectedVisualFilter === 'warm'
                    ? 'bg-amber-950/40 text-amber-200'
                    : 'bg-gradient-to-t from-slate-950 via-slate-900 to-slate-950'
                }`}
              >
                <div className="text-4xl mb-2">🎬</div>
                <h4 className="text-lg font-black text-white tracking-wide uppercase">
                  {targetParticipant ? targetParticipant.nickname : 'Participante'}: Arco de {selectedNarrativeBias.toUpperCase()}
                </h4>
                <p className="text-xs text-slate-400 max-w-md mt-1">
                  Takes selecionados: {selectedTakeIds.length} clips montados · Efeito: {AVAILABLE_SFX.find((s) => s.id === selectedSfxId)?.name}
                </p>
              </div>
            </div>

            {/* GC Lower-Third Sobreposto no Pé do Monitor */}
            <div className="z-10 mt-auto bg-gradient-to-r from-red-600 via-rose-700 to-amber-600 text-white p-2.5 rounded-xl shadow-lg border border-white/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-black/40 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  AO VIVO
                </span>
                <span className="font-bold text-xs sm:text-sm tracking-tight">
                  {selectedLowerThird}
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/80 hidden sm:inline">
                REDE ASTRAL HD
              </span>
            </div>
          </div>

          {/* Barra de Controles de Playback & Filtros Visuais */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-2">
              <Button
                variant={isPlayingPreview ? 'danger' : 'primary'}
                size="sm"
                onClick={handlePlayPreview}
                leftIcon={isPlayingPreview ? <Square size={13} /> : <Play size={13} />}
              >
                {isPlayingPreview ? 'Pausar' : 'Play Preview'}
              </Button>
              <span className="text-xs font-mono text-slate-400 pl-2">
                Áudio VU: <strong className="text-emerald-400">-6 dB (Normalizado)</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-slate-400">Filtro de Imagem:</span>
              {(['normal', 'noir', 'nightvision', 'warm'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedVisualFilter(filter)}
                  className={`px-2 py-1 rounded transition-colors ${
                    selectedVisualFilter === filter
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-950'
                  }`}
                >
                  {filter === 'normal' ? 'HD' : filter === 'noir' ? 'Drama P&B' : filter === 'nightvision' ? 'Visão Noturna' : 'Quente'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projeção de Audiência & Risco Editorial (1 Coluna) */}
        <div className="space-y-4">
          <Card glow="amber">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400 uppercase font-bold flex items-center gap-1.5">
                <TrendingUp size={15} /> Projeção da Edição
              </span>
              <Badge variant="live" size="sm">IBOPE ESTIMADO</Badge>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-emerald-400">+{projectedIbopeBoost}</span>
              <span className="text-xs text-slate-400 font-mono">pts de Audiência</span>
            </div>

            <div className="space-y-3 mt-4 pt-3 border-t border-slate-800/80 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Alvo Central:</span>
                <strong className="text-white">{targetParticipant?.nickname}</strong>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Impacto em Popularidade:</span>
                <strong className={targetPopularityDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {targetPopularityDelta >= 0 ? `+${targetPopularityDelta}%` : `${targetPopularityDelta}%`}
                </strong>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Impacto em Rejeição:</span>
                <strong className={targetRejectionDelta <= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {targetRejectionDelta >= 0 ? `+${targetRejectionDelta}%` : `${targetRejectionDelta}%`}
                </strong>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Risco CONAR / Jurídico:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    conarRiskLevel === 'Alto'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800/40'
                      : conarRiskLevel === 'Médio'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                  }`}
                >
                  {conarRiskLevel}
                </span>
              </div>
            </div>

            {isRendering && (
              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="flex justify-between text-xs font-mono text-cyan-400 mb-1">
                  <span>Renderizando Pacote...</span>
                  <span>{renderProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full transition-all duration-300"
                    style={{ width: `${renderProgress}%` }}
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Seleção do Participante Alvo */}
          <Card glow="none">
            <span className="text-xs font-mono text-slate-400 uppercase font-bold block mb-2">
              Escolher Protagonista / Vilão do Bloco:
            </span>
            <select
              value={selectedTargetId}
              onChange={(e) => setSelectedTargetId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {cast.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nickname} ({p.name}) · Carisma: {p.charisma ?? 70} · Controvérsia: {p.controversy ?? 50}
                </option>
              ))}
            </select>
          </Card>
        </div>
      </div>

      {/* 3. Seleção de Narrativa & Trilha Multitrack */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Viés 1: Vilão */}
        <div
          onClick={() => setSelectedNarrativeBias('vilao')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedNarrativeBias === 'vilao'
              ? 'bg-rose-950/40 border-rose-500 shadow-lg'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Flame className="text-rose-400" size={18} />
            <h4 className="font-bold text-sm text-white">Edição de Vilão</h4>
          </div>
          <p className="text-[11px] text-slate-400">
            Cortes secos nas caras de deboche, trilha sombria e foco nas falas mais ácidas.
          </p>
        </div>

        {/* Viés 2: Vítima */}
        <div
          onClick={() => setSelectedNarrativeBias('vitima')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedNarrativeBias === 'vitima'
              ? 'bg-cyan-950/40 border-cyan-500 shadow-lg'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Heart className="text-cyan-400" size={18} />
            <h4 className="font-bold text-sm text-white">Edição de Vítima</h4>
          </div>
          <p className="text-[11px] text-slate-400">
            Foco no isolamento, lágrimas em close, desabafos e acordes tristes de violino.
          </p>
        </div>

        {/* Viés 3: Comédia */}
        <div
          onClick={() => setSelectedNarrativeBias('comedia')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedNarrativeBias === 'comedia'
              ? 'bg-amber-950/40 border-amber-500 shadow-lg'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Smile className="text-amber-400" size={18} />
            <h4 className="font-bold text-sm text-white">Corte Cômico / Meme</h4>
          </div>
          <p className="text-[11px] text-slate-400">
            Efeitos de sonoplastia pastelão, pausas dramáticas com risada e ritmo descontraído.
          </p>
        </div>

        {/* Viés 4: Fogo no Parquinho */}
        <div
          onClick={() => setSelectedNarrativeBias('fogo-no-parquinho')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedNarrativeBias === 'fogo-no-parquinho'
              ? 'bg-purple-950/40 border-purple-500 shadow-lg'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="text-purple-400" size={18} />
            <h4 className="font-bold text-sm text-white">Fogo no Parquinho</h4>
          </div>
          <p className="text-[11px] text-slate-400">
            Exposição total de estratégias contrárias, cruzando conversas de quartos rivais.
          </p>
        </div>
      </div>

      {/* 4. Timeline Multitrack (Trilhas de Takes, Efeitos e Letreiros) */}
      <div className="space-y-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Layers className="text-cyan-400" size={18} />
          Timeline de Montagem Multitrack
        </h3>

        {/* Pista 1: Takes de Vídeo */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-cyan-300">
              <Film size={14} /> PISTA V1: Takes de Câmeras Gravados ({availableTakes.length} disponíveis)
            </span>
            <span>{selectedTakeIds.length} selecionados</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {availableTakes.map((take) => {
              const isSelected = selectedTakeIds.includes(take.id);
              return (
                <div
                  key={take.id}
                  onClick={() => toggleTakeSelection(take.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 opacity-80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="text-cyan-400 font-bold">{take.cameraName}</span>
                      <span className="text-slate-400">{take.durationSeconds}s</span>
                    </div>
                    <h5 className="font-semibold text-xs text-white line-clamp-2">{take.title}</h5>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-800">
                    <span className="text-amber-400 font-bold">+{take.ibopeImpact} IBOPE</span>
                    <span className={isSelected ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                      {isSelected ? '✓ INCLUSO' : '+ ADICIONAR'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pista 2: Efeitos Sonoros / Foley */}
        <div className="space-y-2 pt-3 border-t border-slate-800">
          <span className="flex items-center gap-1.5 font-bold text-amber-300 text-xs font-mono">
            <Volume2 size={14} /> PISTA A1: Sonoplastia & Foley de Reality Show
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {AVAILABLE_SFX.map((sfx) => (
              <button
                key={sfx.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedSfxId(sfx.id);
                }}
                className={`p-2 rounded-lg text-left border text-xs transition-all ${
                  selectedSfxId === sfx.id
                    ? 'bg-amber-950/40 border-amber-500 text-amber-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-[11px] truncate">{sfx.name}</div>
                <div className="text-[10px] text-slate-500 font-mono">{sfx.duration}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Pista 3: GC / Lower-Thirds */}
        <div className="space-y-2 pt-3 border-t border-slate-800">
          <span className="flex items-center gap-1.5 font-bold text-rose-300 text-xs font-mono">
            <Tv size={14} /> PISTA G1: GC & Letreiros de Impacto na Tela
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              '🚨 EXCLUSIVO: Conspiração de Votos Revelada!',
              '🔥 SINCERÃO: Clima Ferve e Brother Perde a Paciência',
              '😭 DESABAFO: Lágrimas e Desespero no Edredom',
              '👀 FLAGRA: Traição Acertada na Madrugada',
              '👑 LIDERANÇA: Novo Líder Define Alvos da Semana',
            ].map((gc, idx) => (
              <button
                key={idx}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedLowerThird(gc);
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                  selectedLowerThird === gc
                    ? 'bg-rose-950/40 border-rose-500 text-rose-200 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {gc}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
