/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Participant, RealityRoomId } from '@/engine/housemates/types';
import { Button } from '@/ui/components/Button';
import { Badge } from '@/ui/components/Badge';
import { soundFx } from '@/audio/audioManager';
import {
  X,
  Volume2,
  Video,
  Radio,
  Eye,
  Maximize2,
  Users,
  Mic,
  Sparkles,
} from 'lucide-react';

export interface CameraPipData {
  camId: string;
  name: string;
  roomId: RealityRoomId;
  roomTitle: string;
}

export interface CameraPipModalProps {
  camera: CameraPipData | null;
  participants: Participant[];
  isRecording: boolean;
  onClose: () => void;
  onToggleRecording: () => void;
}

export const CameraPipModal: React.FC<CameraPipModalProps> = ({
  camera,
  participants,
  isRecording,
  onClose,
  onToggleRecording,
}) => {
  const [nightVision, setNightVision] = useState(false);
  const [audioGain, setAudioGain] = useState(78);

  if (!camera) return null;

  // Participantes que estão atualmente neste cômodo
  const occupants = participants.filter((p) => p.currentRoom === camera.roomId && !p.isEliminated);

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl bg-slate-950/95 border-2 border-cyan-500/50 shadow-2xl shadow-black/80 overflow-hidden text-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Topo da Câmera estilo TV Broadcast */}
      <div className="px-3.5 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={isRecording ? 'danger' : 'live'} pulse size="sm">
            {camera.camId}
          </Badge>
          <span className="font-bold text-white text-xs font-mono truncate max-w-[170px]">
            {camera.roomTitle}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              soundFx.playClick();
              setNightVision(!nightVision);
            }}
            className={`p-1 rounded text-xs transition-colors ${
              nightVision
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Alternar Visão Noturna (Infravermelho)"
          >
            <Eye size={14} />
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
            title="Fechar Câmera PiP"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Monitor Visual de Vídeo com Efeito Broadcast */}
      <div
        className={`relative h-44 w-full flex flex-col justify-between p-3 overflow-hidden ${
          nightVision
            ? 'bg-emerald-950/90 text-emerald-300'
            : 'bg-gradient-to-b from-slate-900 to-slate-950 text-slate-200'
        }`}
      >
        {/* Scanlines overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] pointer-events-none opacity-60" />

        {/* Header HUD dentro do vídeo */}
        <div className="relative z-10 flex items-center justify-between text-[10px] font-mono">
          <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded backdrop-blur">
            <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-emerald-400'}`} />
            {isRecording ? 'REC 1080p · 60fps' : 'LIVE FEED'}
          </span>
          <span className="bg-black/60 px-1.5 py-0.5 rounded text-slate-400">
            {occupants.length} MORADORES
          </span>
        </div>

        {/* Participantes no Cômodo / Ação ao Vivo */}
        <div className="relative z-10 my-auto text-center space-y-1">
          {occupants.length > 0 ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-center -space-x-2">
                {occupants.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className={`w-7 h-7 rounded-full bg-gradient-to-br ${p.avatarColor} border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-white shadow`}
                    title={`${p.name} ("${p.nickname}")`}
                  >
                    {p.nickname.slice(0, 1)}
                  </div>
                ))}
              </div>
              <div className="text-xs font-semibold text-white drop-shadow">
                {occupants.map((p) => p.nickname).join(', ')}
              </div>
              <div className="text-[11px] text-cyan-300 italic px-2 max-w-xs mx-auto truncate bg-black/50 py-0.5 rounded">
                "{occupants[0].currentDialogue || occupants[0].currentActivity}"
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 font-mono py-2">
              [Cômodo vazio no momento. Câmera em vigília silenciosa.]
            </div>
          )}
        </div>

        {/* Rodapé do Vídeo com medidor de VU áudio */}
        <div className="relative z-10 flex items-center justify-between text-[10px] font-mono pt-1 border-t border-white/10">
          <div className="flex items-center gap-1.5">
            <Mic size={12} className="text-cyan-400" />
            <div className="flex items-center gap-0.5">
              {[4, 8, 12, 10, 14, 7, 11, 13, 9, 6].map((h, idx) => (
                <span
                  key={idx}
                  className={`w-1 rounded-sm ${
                    idx > 7 ? 'bg-red-500' : idx > 5 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ height: `${occupants.length > 0 ? h : 3}px` }}
                />
              ))}
            </div>
          </div>
          <span className="text-slate-400">{occupants.length > 0 ? '-14 dB' : '-48 dB'}</span>
        </div>
      </div>

      {/* Ações Rápidas no Rodapé do PiP */}
      <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
        <Button
          variant={isRecording ? 'danger' : 'on-air'}
          size="sm"
          className="flex-1 text-[11px] py-1 h-7"
          leftIcon={<Radio size={13} />}
          onClick={onToggleRecording}
        >
          {isRecording ? 'Interromper REC' : 'Gravar Este Cômodo'}
        </Button>

        <button
          onClick={() => {
            soundFx.playCameraSwitch();
            onClose();
          }}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
        >
          Minimizar
        </button>
      </div>
    </div>
  );
};
