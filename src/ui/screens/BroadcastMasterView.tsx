/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/app/useGameStore';
import { useAppStore } from '@/app/useAppStore';
import { useBroadcastStore } from '@/engine/broadcast/broadcastStore';
import { House3DScene } from '@/engine/three/House3DScene';
import { CAMERA_PRESETS } from '@/engine/three/roomData';
import { NarrativeTag } from '@/engine/broadcast/broadcastTypes';
import { RealityRoomId } from '@/engine/housemates/types';
import {
  Radio,
  Video,
  Sliders,
  Scissors,
  Flame,
  Heart,
  Crown,
  Sparkles,
  Smile,
  Maximize2,
  Tv,
  Volume2,
  TrendingUp,
  Eye,
  Camera,
} from 'lucide-react';

export const BroadcastMasterView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<House3DScene | null>(null);

  const { cast, time, ibope, openParticipantDetail } = useGameStore();
  const { isRecording, toggleRecording, addToast } = useAppStore();
  const {
    pgmCameraId,
    pvwCameraId,
    tBarPosition,
    isAutoTransitioning,
    isOnAir,
    lowerThirdText,
    lowerThirdSubtext,
    showLowerThird,
    audioPeakL,
    audioPeakR,
    ibopeHistory,
    recordedTakes,
    selectPreviewCamera,
    cutToProgram,
    autoTransition,
    setTBarPosition,
    toggleLowerThird,
    recordNarrativeTake,
    tickAudioMeters,
    tickIbope,
  } = useBroadcastStore();

  const [scanlinesActive, setScanlinesActive] = useState(true);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new House3DScene(containerRef.current, (participantId) => {
      const p = cast.find((c) => c.id === participantId);
      if (p) openParticipantDetail(p);
    });
    sceneRef.current = scene;

    // Set initial camera to PGM
    scene.setCameraPreset(pgmCameraId);
    scene.syncCast(cast);
    scene.updateTimePhase(time.phase);

    // Audio & Ibope tick loop
    const interval = setInterval(() => {
      tickAudioMeters();
      // Tick IBOPE with slight random fluctuation
      const activePreset = CAMERA_PRESETS.find((c) => c.id === pgmCameraId);
      const isHighTensionRoom = activePreset?.roomId === 'cozinha-vip' || activePreset?.roomId === 'confessionario';
      tickIbope(ibope, isHighTensionRoom ? 0.3 : 0);
    }, 2000);

    return () => {
      clearInterval(interval);
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Sync camera when PGM changes
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setCameraPreset(pgmCameraId);
    }
  }, [pgmCameraId]);

  // Sync cast positions & status
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.syncCast(cast);
    }
  }, [cast]);

  // Sync day/night lighting
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateTimePhase(time.phase);
    }
  }, [time.phase]);

  const activePgmPreset = CAMERA_PRESETS.find((c) => c.id === pgmCameraId) || CAMERA_PRESETS[0];
  const activePvwPreset = CAMERA_PRESETS.find((c) => c.id === pvwCameraId) || CAMERA_PRESETS[1];

  const handleRecordTakeWithTag = (tag: NarrativeTag, title: string) => {
    const activeRoomId = activePgmPreset.roomId as RealityRoomId;
    const take = recordNarrativeTake(tag, title, activeRoomId, 4);
    addToast(
      'success',
      `Take Arquivado: [${tag.toUpperCase()}]`,
      `Gravado em ${activePgmPreset.name}. Impacto: +${take.ibopeImpact} no IBOPE!`
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* 1. Master Control Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="font-extrabold text-white text-sm tracking-wider uppercase">
              MASTER CONTROL ROOM (MCR)
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400 font-bold">60.0 FPS</span>
          <span className="text-slate-400">SMPTE 01:{new Date().getMinutes().toString().padStart(2, '0')}:{new Date().getSeconds().toString().padStart(2, '0')}:14</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400 uppercase font-bold">{time.phase}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScanlinesActive(!scanlinesActive)}
            className={`px-2 py-1 rounded text-[11px] border font-bold transition-colors ${
              scanlinesActive
                ? 'bg-cyan-950/70 border-cyan-800/60 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            Filtro CRT {scanlinesActive ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={toggleLowerThird}
            className={`px-2 py-1 rounded text-[11px] border font-bold transition-colors ${
              showLowerThird
                ? 'bg-amber-950/70 border-amber-800/60 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            GC Lower-Third {showLowerThird ? 'VISÍVEL' : 'OCULTO'}
          </button>
        </div>
      </div>

      {/* 2. Main Broadcast Monitor Viewport with 3D Three.js scene */}
      <div className="relative w-full aspect-[16/9] max-h-[580px] rounded-2xl bg-black border-2 border-slate-800 overflow-hidden shadow-2xl group">
        {/* Three.js Canvas Container */}
        <div ref={containerRef} className="w-full h-full cursor-crosshair" />

        {/* Optional Retro CRT Scanlines & Screen Tint */}
        {scanlinesActive && (
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0px, rgba(0,0,0,0.6) 1px, transparent 1px, transparent 2px)',
            }}
          />
        )}

        {/* HUD Overlay - Top Left: PGM / Live Status & REC */}
        <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
          <div className="px-2.5 py-1 rounded-md bg-red-600/90 text-white font-mono font-black text-xs tracking-widest flex items-center gap-1.5 shadow-lg border border-red-500">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            NO AR · PGM
          </div>
          {isRecording && (
            <div className="px-2.5 py-1 rounded-md bg-rose-950/90 border border-rose-500 text-rose-300 font-mono font-bold text-xs flex items-center gap-1 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              REC ATIVO
            </div>
          )}
          <div className="px-2.5 py-1 rounded-md bg-black/75 border border-white/10 text-slate-200 font-mono text-xs backdrop-blur-sm">
            {activePgmPreset.shortName}
          </div>
        </div>

        {/* HUD Overlay - Top Right: Real-time Telemetry & Switcher Camera Key */}
        <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-none">
          <div className="px-3 py-1 rounded-md bg-black/80 border border-white/10 text-slate-300 font-mono text-xs backdrop-blur-sm flex items-center gap-2">
            <Tv size={13} className="text-red-400" />
            <span>IBOPE: <strong className="text-white">{ibope.toFixed(1)} pts</strong></span>
          </div>
          <div className="px-3 py-1 rounded-md bg-black/80 border border-white/10 text-cyan-400 font-mono text-xs backdrop-blur-sm">
            1080p59.94
          </div>
        </div>

        {/* HUD Overlay - Bottom Left: Lower-Third (GC da Transmissão) */}
        {showLowerThird && (
          <div className="absolute bottom-4 left-4 max-w-lg pointer-events-none animate-in slide-in-from-bottom duration-300">
            <div className="bg-gradient-to-r from-red-600 via-red-700 to-slate-900 text-white px-3.5 py-1.5 rounded-t-lg font-mono font-bold text-xs uppercase tracking-wider shadow">
              {lowerThirdText}
            </div>
            <div className="bg-slate-950/95 border-l-4 border-red-500 border-y border-r border-slate-800 px-4 py-2 rounded-b-lg text-xs text-slate-200 shadow-xl backdrop-blur-sm">
              <p className="font-semibold">{lowerThirdSubtext}</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-1">
                <span>{activePgmPreset.name}</span>
                <span>·</span>
                <span>
                  {cast.filter((p) => p.currentRoom === activePgmPreset.roomId && !p.isEliminated).length} moradores no local
                </span>
              </div>
            </div>
          </div>
        )}

        {/* HUD Overlay - Bottom Right: Stereo VU Meters */}
        <div className="absolute bottom-4 right-4 bg-slate-950/90 border border-white/10 p-2.5 rounded-xl backdrop-blur-sm flex items-end gap-2.5 pointer-events-none shadow-xl">
          <div className="flex flex-col items-center gap-1 font-mono text-[9px] text-slate-400">
            <Volume2 size={12} className="text-cyan-400" />
            <span>AUDIO</span>
          </div>

          {/* Left Channel */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-2.5 h-16 bg-slate-900 rounded-sm overflow-hidden flex flex-col justify-end p-0.5 border border-slate-800">
              <div
                className="w-full rounded-xs transition-all duration-75"
                style={{
                  height: `${Math.max(5, Math.min(100, ((audioPeakL + 40) / 40) * 100))}%`,
                  backgroundColor: audioPeakL > -6 ? '#f43f5e' : audioPeakL > -14 ? '#facc15' : '#10b981',
                }}
              />
            </div>
            <span className="font-mono text-[9px] text-slate-400">L</span>
          </div>

          {/* Right Channel */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-2.5 h-16 bg-slate-900 rounded-sm overflow-hidden flex flex-col justify-end p-0.5 border border-slate-800">
              <div
                className="w-full rounded-xs transition-all duration-75"
                style={{
                  height: `${Math.max(5, Math.min(100, ((audioPeakR + 40) / 40) * 100))}%`,
                  backgroundColor: audioPeakR > -6 ? '#f43f5e' : audioPeakR > -14 ? '#facc15' : '#10b981',
                }}
              />
            </div>
            <span className="font-mono text-[9px] text-slate-400">R</span>
          </div>
        </div>

        {/* Instructions pill overlay */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] text-slate-300 font-sans pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
          Clique em qualquer participante 3D para abrir a Ficha Técnica
        </div>
      </div>

      {/* 3. Switcher Control Deck (Mesa de Corte Profissional) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl">
        {/* Left Column: Barramento de Câmeras (PGM & PVW) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-cyan-400" />
              <span className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                BARRAMENTO DE CÂMERAS DA CASA (8 ÂNGULOS AO VIVO)
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500" /> PGM (No Ar)
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> PVW (Próximo Corte)
              </span>
            </div>
          </div>

          {/* Grid de 8 Câmeras com status táteis */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CAMERA_PRESETS.map((preset) => {
              const isPgm = pgmCameraId === preset.id;
              const isPvw = pvwCameraId === preset.id;
              const occupants = cast.filter((p) => p.currentRoom === preset.roomId && !p.isEliminated).length;

              return (
                <button
                  key={preset.id}
                  onClick={() => selectPreviewCamera(preset.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    isPgm
                      ? 'bg-red-950/80 border-red-500 shadow-lg ring-1 ring-red-500/50'
                      : isPvw
                      ? 'bg-emerald-950/80 border-emerald-500 shadow-lg ring-1 ring-emerald-500/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span className="font-bold text-white">{preset.shortName}</span>
                    {isPgm ? (
                      <span className="px-1.5 py-0.2 rounded bg-red-600 text-white font-extrabold text-[9px]">
                        PGM
                      </span>
                    ) : isPvw ? (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white font-extrabold text-[9px]">
                        PVW
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[9px]">DISP</span>
                    )}
                  </div>

                  <div className="text-xs font-semibold text-slate-200 truncate my-0.5">
                    {preset.name.split('·')[1]?.trim() || preset.name}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1 pt-1 border-t border-slate-800/80">
                    <span className="text-cyan-400">{occupants} morad.</span>
                    <span>{occupants > 2 ? '🔥 Movimentado' : '🌿 Calmo'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Corte, Transição & T-Bar */}
        <div className="lg:col-span-4 flex flex-col justify-between p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>CONTROLE DE TRANSIÇÃO</span>
              <span className="text-cyan-400 font-bold">{tBarPosition}%</span>
            </div>

            {/* T-Bar Slider visual */}
            <div className="relative py-2">
              <input
                type="range"
                min="0"
                max="100"
                value={tBarPosition}
                onChange={(e) => setTBarPosition(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                <span>0% PGM</span>
                <span>DISSOLVE</span>
                <span>100% PVW</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: CUT & AUTO */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={cutToProgram}
              className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-mono font-black text-sm tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-1.5"
            >
              <Scissors size={16} />
              CUT (CORTE)
            </button>

            <button
              onClick={() => autoTransition(700)}
              disabled={isAutoTransitioning}
              className={`py-3 px-4 rounded-xl font-mono font-bold text-sm tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-1.5 ${
                isAutoTransitioning
                  ? 'bg-amber-600 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white'
              }`}
            >
              <Sliders size={16} />
              AUTO (MIX)
            </button>
          </div>

          {/* Gravador Rápido de Tags Narrativas */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
              CLASSIFICAR TAKE AO VIVO (TAGGING)
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleRecordTakeWithTag('treta', 'Discussão acalorada na casa')}
                className="py-1 px-1.5 rounded-lg bg-rose-950/70 border border-rose-800/60 hover:bg-rose-900 text-rose-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <Flame size={12} /> Treta
              </button>
              <button
                onClick={() => handleRecordTakeWithTag('romance', 'Olhares e carinho sob as cobertas')}
                className="py-1 px-1.5 rounded-lg bg-pink-950/70 border border-pink-800/60 hover:bg-pink-900 text-pink-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <Heart size={12} /> Romance
              </button>
              <button
                onClick={() => handleRecordTakeWithTag('vilao', 'Plano frio para derrubar aliado')}
                className="py-1 px-1.5 rounded-lg bg-purple-950/70 border border-purple-800/60 hover:bg-purple-900 text-purple-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <Crown size={12} /> Vilania
              </button>
              <button
                onClick={() => handleRecordTakeWithTag('estrategia', 'Mapeando contagem de votos do paredão')}
                className="py-1 px-1.5 rounded-lg bg-blue-950/70 border border-blue-800/60 hover:bg-blue-900 text-blue-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <Sliders size={12} /> Estratégia
              </button>
              <button
                onClick={() => handleRecordTakeWithTag('comedia', 'Tropeço e risadas na cozinha')}
                className="py-1 px-1.5 rounded-lg bg-amber-950/70 border border-amber-800/60 hover:bg-amber-900 text-amber-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <Smile size={12} /> Comédia
              </button>
              <button
                onClick={() => handleRecordTakeWithTag('emocao', 'Lágrimas e saudades da família')}
                className="py-1 px-1.5 rounded-lg bg-cyan-950/70 border border-cyan-800/60 hover:bg-cyan-900 text-cyan-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <Sparkles size={12} /> Emoção
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Real-time IBOPE Telemetry strip */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <TrendingUp size={18} className="text-red-400 shrink-0" />
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              <span>Audiência em Tempo Real: {ibope.toFixed(1)} pontos</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/40">
                Liderança Isolada (Share 48%)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Cortar para a câmera de maior atrito eleva o pico do IBOPE. Gravando momentos dramáticos alimenta o programa do dia.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleRecording}
            className={`px-3 py-1.5 rounded-lg font-mono font-bold text-xs flex items-center gap-1.5 transition-colors ${
              isRecording
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
            }`}
          >
            <Radio size={14} className={isRecording ? 'animate-pulse' : ''} />
            {isRecording ? 'Parar Gravação Geral' : 'Gravar Programa 24h'}
          </button>
        </div>
      </div>
    </div>
  );
};
