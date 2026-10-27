/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/app/useGameStore';
import { useAppStore } from '@/app/useAppStore';
import { useBroadcastStore } from '@/engine/broadcast/broadcastStore';
import {
  Tv,
  TrendingUp,
  DollarSign,
  Radio,
  Flame,
  Users,
  Video,
  Volume2,
  AlertTriangle,
  Sparkles,
  Share2,
  Eye,
  Activity,
  Zap,
  Clock,
  ShieldAlert,
  Award,
  ChevronRight,
  Maximize2,
  Layers,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';

export const ControlRoom: React.FC = () => {
  const {
    cash,
    ibope,
    reputation,
    authority,
    time,
    cast,
    seasonConfig,
    conflicts,
  } = useGameStore();

  const { isRecording, toggleRecording, addToast } = useAppStore();
  const { pgmCameraId, pvwCameraId, cutToProgram, selectPreviewCamera, audioPeakL } = useBroadcastStore();

  // Simulated live telemetry velocity
  const [liveViewers, setLiveViewers] = useState<number>(4180000);
  const [socialVelocity, setSocialVelocity] = useState<number>(76400);
  const [adRevenueTotal, setAdRevenueTotal] = useState<number>(14850000);
  const [commercialsRun, setCommercialsRun] = useState<number>(18);
  const [sentiment, setSentiment] = useState({ positive: 48, neutral: 34, negative: 18 });
  const [activeTrending, setActiveTrending] = useState<string[]>([
    '#BBB26',
    '#TretaNaMadrugada',
    '#FicaGuilherme',
    '#ParedaoRelampago',
    '#CarelliVsBoninho',
  ]);

  // Dynamic simulation sync
  useEffect(() => {
    // Live viewers based on IBOPE: ~125k viewers per IBOPE point in metro
    const calculatedViewers = Math.round(ibope * 128500 + (Math.random() * 80000 - 40000));
    setLiveViewers(calculatedViewers);

    // Social velocity reacts to conflicts and IBOPE
    const conflictMultiplier = conflicts.length > 0 ? 1.5 : 1.0;
    const velocity = Math.round(ibope * 2300 * conflictMultiplier + (Math.random() * 6000 - 3000));
    setSocialVelocity(velocity);

    // Revenue scales with week and IBOPE
    const baseRevenue = 12000000 + time.day * 450000 + ibope * 75000;
    setAdRevenueTotal(baseRevenue);
  }, [ibope, conflicts.length, time.day]);

  // Quick Director Interventions
  const handleTriggerCommercial = () => {
    setCommercialsRun((prev) => prev + 1);
    setAdRevenueTotal((prev) => prev + 185000);
    addToast('success', 'Intervalo Comercial Exibido!', '+R$ 185.000 em faturamento de cotas!');
  };

  const handleBoostSocialTeaser = () => {
    setSocialVelocity((prev) => prev + 25000);
    setSentiment((prev) => ({
      positive: Math.min(80, prev.positive + 5),
      neutral: Math.max(10, prev.neutral - 2),
      negative: Math.max(5, prev.negative - 3),
    }));
    addToast('info', 'Teaser Viral Publicado!', 'Engajamento no X/Twitter subiu em +25k menções/min.');
  };

  const handleWhisperEarbud = () => {
    addToast('warning', 'Ponto Eletrônico Acionado', 'Apresentador alertado para esquentar o clima da casa!');
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Tv className="text-cyan-400" size={26} />
              Control Room & Master Control
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/40 uppercase tracking-wider">
              ON AIR
            </span>
            {isRecording && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span> REC ACTIVE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {seasonConfig.networkName} • {seasonConfig.programName} • Dia {time.day} ({time.phase}) • Sem. {time.week}
          </p>
        </div>

        {/* Quick Topbar Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={toggleRecording}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
              isRecording
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Video size={14} />
            {isRecording ? 'Parar Gravação' : 'Gravar Master Feed'}
          </button>
          <button
            onClick={handleTriggerCommercial}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white flex items-center gap-1.5 shadow-md"
          >
            <DollarSign size={14} />
            Rodar Intervalo (+R$ 185k)
          </button>
          <button
            onClick={handleBoostSocialTeaser}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 shadow-md"
          >
            <Zap size={14} />
            Soltar Teaser Viral
          </button>
        </div>
      </div>

      {/* KEY METRICS ROW — 3 MAIN GLASS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Live Viewership Glass Card */}
        <div className="relative group overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-cyan-950/20 backdrop-blur-xl p-5 shadow-2xl transition-all duration-300 hover:border-cyan-400/50 hover:shadow-cyan-950/30">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Eye size={15} /> Live Viewership
            </span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
              Tempo Real
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-2">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {ibope.toFixed(1)}{' '}
              <span className="text-sm font-medium text-slate-400">pts IBOPE</span>
            </div>
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              <TrendingUp size={13} /> +{(ibope * 0.08).toFixed(1)}%
            </div>
          </div>

          <div className="space-y-2 mt-4 pt-4 border-t border-slate-800/80 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">Audiência Concorrente:</span>
              <span className="font-semibold text-white">{(liveViewers / 1000000).toFixed(2)}M pessoas</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">Share da Televisão:</span>
              <span className="font-semibold text-cyan-300">58.4% dos aparelhos</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">Pico da Transmissão:</span>
              <span className="font-semibold text-amber-300">{((ibope + 3.4) * 1.3).toFixed(1)} pts (Prova)</span>
            </div>
          </div>

          {/* Mini audience progress visual */}
          <div className="mt-4 pt-2">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Metas da Emissora (25 pts)</span>
              <span className="text-cyan-400 font-semibold">{Math.min(100, Math.round((ibope / 40) * 100))}% da capacidade</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (ibope / 40) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 2. Social Media Buzz Glass Card */}
        <div className="relative group overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-purple-950/20 backdrop-blur-xl p-5 shadow-2xl transition-all duration-300 hover:border-purple-400/50 hover:shadow-purple-950/30">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Flame size={15} /> Social Media Buzz
            </span>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
              Trending #1 Brasil
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-2">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {(socialVelocity / 1000).toFixed(1)}k{' '}
              <span className="text-sm font-medium text-slate-400">tweets/min</span>
            </div>
            <div className="text-xs font-semibold text-purple-300 flex items-center gap-0.5">
              <Activity size={13} /> Alta Viralidade
            </div>
          </div>

          {/* Sentiment Meter */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">Sentimento da Rede:</span>
              <span className="text-[11px] font-medium text-purple-200">
                {sentiment.positive}% Positivo • {sentiment.negative}% Treta/Hate
              </span>
            </div>
            <div className="w-full flex h-2 rounded-full overflow-hidden bg-slate-800">
              <div style={{ width: `${sentiment.positive}%` }} className="bg-emerald-500 transition-all"></div>
              <div style={{ width: `${sentiment.neutral}%` }} className="bg-slate-400 transition-all"></div>
              <div style={{ width: `${sentiment.negative}%` }} className="bg-rose-500 transition-all"></div>
            </div>

            {/* Trending tags list */}
            <div className="pt-2 flex flex-wrap gap-1.5">
              {activeTrending.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-slate-800/90 text-slate-300 rounded-md text-[10px] font-mono border border-slate-700/60 hover:text-cyan-300 cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Ad Revenue Glass Card */}
        <div className="relative group overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-amber-950/20 backdrop-blur-xl p-5 shadow-2xl transition-all duration-300 hover:border-amber-400/50 hover:shadow-amber-950/30">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <DollarSign size={15} /> Ad Revenue & Cotas
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
              Meta Batida
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-2">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              R$ {(adRevenueTotal / 1000000).toFixed(2)}M
            </div>
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              +14.2% YoY
            </div>
          </div>

          <div className="space-y-2 mt-4 pt-4 border-t border-slate-800/80 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">Breaks Comerciais Vendidos:</span>
              <span className="font-semibold text-white">{commercialsRun} / 24 breaks</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">Satisfação dos Patrocinadores:</span>
              <span className="font-semibold text-amber-300">96.8% (Excelente)</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">Saldo Livre de Produção:</span>
              <span className="font-semibold text-emerald-400">R$ {cash.toLocaleString('pt-BR')}</span>
            </div>
          </div>

          <div className="mt-4 pt-2">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Cotas Master Preenchidas</span>
              <span className="text-amber-400 font-semibold">4 / 4 Master (100%)</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-1.5 rounded-full w-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: BROADCAST MONITOR + DIREÇÃO AO VIVO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* PROGRAM MONITOR FEED (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Video className="text-cyan-400" size={18} />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Master Switcher Program Feed — {pgmCameraId.toUpperCase()}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <Volume2 size={14} className="text-emerald-400" />
                <span className="font-mono text-emerald-400 font-semibold">
                  {audioPeakL.toFixed(0)} dB
                </span>
              </div>
              <button
                onClick={cutToProgram}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                CUT PGM
              </button>
            </div>
          </div>

          {/* Video Mock Screen */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center group">
            {/* Ambient simulated CCTV room */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-90"></div>
            
            {/* Scanlines effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-30"></div>

            {/* Live Camera Info Overlays */}
            <div className="absolute top-3 left-3 flex items-center gap-2 text-xs font-mono bg-black/60 backdrop-blur-md px-3 py-1 rounded-md border border-white/10">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-white font-bold">PGM FEED • {pgmCameraId.toUpperCase()}</span>
              <span className="text-slate-400">|</span>
              <span className="text-cyan-400">1080p60 NDI</span>
            </div>

            <div className="absolute top-3 right-3 flex items-center gap-2 text-xs font-mono bg-black/60 backdrop-blur-md px-3 py-1 rounded-md border border-white/10">
              <span className="text-slate-300">IBOPE:</span>
              <span className="text-amber-400 font-bold">{ibope.toFixed(1)}</span>
            </div>

            {/* Central live status display */}
            <div className="text-center z-10 space-y-2 p-6">
              <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-1">
                <Radio size={32} className="animate-pulse" />
              </div>
              <h4 className="text-lg font-bold text-white tracking-wide">
                Transmissão da Casa em Alta Resolução
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {cast.length} participantes ativos no confinamento. O motor de inteligência artificial
                está monitorando conversas, humor e potenciais atritos na casa.
              </p>
            </div>

            {/* Lower switcher status bar */}
            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-xs font-mono bg-black/70 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-slate-400">Preview: <strong className="text-amber-400">{pvwCameraId.toUpperCase()}</strong></span>
                <span className="text-slate-400">Modo: <strong className="text-cyan-300">Automático por Microfone</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Tretas Ativas:</span>
                <span className={`font-bold px-2 py-0.5 rounded ${conflicts.length > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'}`}>
                  {conflicts.length}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Camera Selectors */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-2">
            {['cam-01', 'cam-02', 'cam-03', 'cam-04', 'cam-05', 'cam-06', 'cam-07', 'cam-08'].map((camId, idx) => {
              const isPgm = camId === pgmCameraId;
              const isPvw = camId === pvwCameraId;
              return (
                <button
                  key={camId}
                  onClick={() => selectPreviewCamera(camId)}
                  className={`py-2 px-1 rounded-lg text-xs font-mono flex flex-col items-center justify-center gap-0.5 border transition-all ${
                    isPgm
                      ? 'bg-red-600/30 border-red-500 text-red-300 font-bold shadow-lg shadow-red-950/40'
                      : isPvw
                      ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="text-[10px] opacity-75">CAM</span>
                  <span>0{idx + 1}</span>
                  {isPgm && <span className="text-[9px] text-red-400 font-bold">PGM</span>}
                  {isPvw && !isPgm && <span className="text-[9px] text-amber-400 font-bold">PVW</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* DIRECTOR INTERVENTIONS & ALERT FEED (1 col) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="text-amber-400" size={17} />
                Painel do Diretor de Transmissão
              </h3>
              <span className="text-xs text-slate-400 font-mono">Autoridade: {authority}%</span>
            </div>

            <div className="space-y-3 mt-4">
              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/40 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Radio size={14} /> Ponto Eletrônico
                  </span>
                  <span className="text-[10px] text-slate-400">Sem Custo</span>
                </div>
                <p className="text-[11px] text-slate-300 mb-2.5">
                  Dê ordens no ouvido do apresentador para pressionar emparedados ou cortar conversa fiada.
                </p>
                <button
                  onClick={handleWhisperEarbud}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-medium transition-colors"
                >
                  Soprar no Ponto
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/40 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Sparkles size={14} /> Flash ao Vivo na TV
                  </span>
                  <span className="text-[10px] text-purple-400 font-semibold">+2.5 IBOPE</span>
                </div>
                <p className="text-[11px] text-slate-300 mb-2.5">
                  Interrompa a programação normal da emissora com plantão urgente da casa.
                </p>
                <button
                  onClick={() => addToast('info', 'Plantão Urgente no Ar!', 'Plantão de 3 minutos elevou a audiência!')}
                  className="w-full py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 rounded-lg text-xs font-medium transition-colors"
                >
                  Entrar com Plantão
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/40 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <DollarSign size={14} /> Ação de Merchandising
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">+R$ 220k</span>
                </div>
                <p className="text-[11px] text-slate-300 mb-2.5">
                  Coloque um carrinho de produtos patrocinados na despensa para os participantes provarem.
                </p>
                <button
                  onClick={() => addToast('success', 'Ação Patrocinada Ativada', 'Moradores correndo para a despensa! +R$ 220.000')}
                  className="w-full py-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40 rounded-lg text-xs font-medium transition-colors"
                >
                  Ativar Merchandising
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Reputação da Emissora:</span>
            <span className="font-semibold text-emerald-400">{reputation}/100</span>
          </div>
        </div>
      </div>
    </div>
  );
};
