/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Modal } from '@/ui/components/Modal';
import { Button } from '@/ui/components/Button';
import { Badge } from '@/ui/components/Badge';
import { soundFx } from '@/audio/audioManager';
import { speakRealityAnnouncement } from '@/audio/speechNarration';
import {
  Film,
  Play,
  Square,
  Sparkles,
  Trophy,
  Flame,
  Heart,
  Award,
  Radio,
  Tv,
} from 'lucide-react';

interface SeasonReplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  programName: string;
  winnerName: string;
  winnerNickname: string;
}

export const SeasonReplayModal: React.FC<SeasonReplayModalProps> = ({
  isOpen,
  onClose,
  programName,
  winnerName,
  winnerNickname,
}) => {
  const [isPlayingReel, setIsPlayingReel] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const timelineEvents = [
    {
      week: 'Semana 1',
      title: 'Abertura Histórica & Primeiras Alianças',
      desc: 'Os 20 moradores cruzaram a porta principal sob aplausos e definiram os primeiros quartos.',
      tag: 'Abertura',
      badgeColor: 'info' as const,
    },
    {
      week: 'Semana 3',
      title: 'O Escândalo da Cozinha & Guerra do Leite Condensado',
      desc: 'Bate-boca icônico que dividiu a casa em dois grupos irreconciliáveis.',
      tag: 'Treta Máxima',
      badgeColor: 'danger' as const,
    },
    {
      week: 'Semana 6',
      title: 'Romance no Edredom & Declaração na Piscina',
      desc: 'A formação do casal mais shippado das redes sociais com 2 milhões de tweets.',
      tag: 'Romance',
      badgeColor: 'live' as const,
    },
    {
      week: 'Semana 9',
      title: 'O Big Fone que Virou o Jogo de Cabeça pra Baixo',
      desc: 'Corrida desesperada no jardim e indicação surpresa que derrubou os favoritos.',
      tag: 'Reviravolta',
      badgeColor: 'warning' as const,
    },
    {
      week: 'Semana 12',
      title: 'A Grande Final: Coroação e Chuva de Prata',
      desc: `${winnerNickname} é consagrado campeão com recorde de votação popular!`,
      tag: 'Campeão',
      badgeColor: 'success' as const,
    },
  ];

  const handleStartReplay = () => {
    soundFx.playOnAirChime();
    setIsPlayingReel(true);
    setActiveStep(0);
    speakRealityAnnouncement(`Apresentamos agora os melhores momentos da temporada de ${programName}!`);

    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= timelineEvents.length - 1) {
          clearInterval(interval);
          setIsPlayingReel(false);
          speakRealityAnnouncement(`E o grande vencedor da história foi ${winnerNickname}!`);
          return prev;
        }
        return prev + 1;
      });
    }, 2500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Replay & Melhores Momentos da Temporada">
      <div className="space-y-5 text-slate-100 max-h-[75vh] overflow-y-auto pr-1">
        {/* Monitor de Vídeo VT */}
        <div className="relative aspect-video rounded-2xl bg-black border border-slate-800 overflow-hidden flex flex-col justify-between p-4 shadow-2xl">
          <div className="flex items-center justify-between text-xs font-mono z-10">
            <span className="bg-red-950/80 text-red-400 border border-red-800 px-2 py-0.5 rounded font-bold">
              VT DE ENCERRAMENTO · MELHORES MOMENTOS
            </span>
            <span className="text-amber-400 font-bold">TC: 02:40:15:00</span>
          </div>

          <div className="text-center my-auto z-10 space-y-1">
            <div className="text-4xl mb-2 animate-bounce">🎬</div>
            <h3 className="text-lg font-black text-white uppercase tracking-wider">
              {timelineEvents[activeStep]?.title}
            </h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              {timelineEvents[activeStep]?.desc}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-cyan-300 z-10 border-t border-slate-800 pt-2">
            <span>Fase: {timelineEvents[activeStep]?.week}</span>
            <span>{programName} Especial de Fim de Temporada</span>
          </div>
        </div>

        {/* Botão de Controle */}
        <div className="flex items-center justify-between">
          <Button
            variant={isPlayingReel ? 'danger' : 'on-air'}
            size="md"
            onClick={handleStartReplay}
            leftIcon={isPlayingReel ? <Square size={14} /> : <Play size={14} />}
          >
            {isPlayingReel ? 'Parar VT' : 'Assistir VT com Narração'}
          </Button>

          <span className="text-xs font-mono text-slate-400">
            Passo {activeStep + 1} de {timelineEvents.length}
          </span>
        </div>

        {/* Linha do Tempo dos Momentos Épicos */}
        <div className="space-y-2.5 pt-2 border-t border-slate-800">
          <h4 className="font-bold text-xs font-mono uppercase text-slate-400">
            Linha do Tempo dos Fatos Mais Marcantes:
          </h4>
          <div className="space-y-2">
            {timelineEvents.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  activeStep === idx
                    ? 'bg-amber-950/40 border-amber-500 shadow-md'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-cyan-400 font-bold">{item.week}</span>
                    <h5 className="font-bold text-xs text-white">{item.title}</h5>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                </div>
                <Badge variant={item.badgeColor} size="sm">
                  {item.tag}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
