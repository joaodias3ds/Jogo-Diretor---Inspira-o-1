/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAppStore } from '@/app/useAppStore';
import { useGameStore } from '@/app/useGameStore';
import { useBroadcastStore } from '@/engine/broadcast/broadcastStore';
import { Card } from '@/ui/components/Card';
import { Button } from '@/ui/components/Button';
import { Badge } from '@/ui/components/Badge';
import { Tabs } from '@/ui/components/Tabs';
import { ParticipantList } from '@/ui/components/ParticipantList';
import { CameraPipModal } from '@/ui/screens/CameraPipModal';
import { ParticipantDetailModal } from '@/ui/screens/ParticipantDetailModal';
import { ParticipantEditorModal } from '@/ui/screens/ParticipantEditorModal';
import { SocialMapScreen } from '@/ui/screens/SocialMapScreen';
import { BroadcastMasterView } from '@/ui/screens/BroadcastMasterView';
import { ChallengeStudioScreen } from '@/ui/screens/ChallengeStudioScreen';
import { EditingRoomScreen } from '@/ui/screens/EditingRoomScreen';
import { LiveShowParedaoScreen } from '@/ui/screens/LiveShowParedaoScreen';
import { FantasyAudienceScreen } from '@/ui/screens/FantasyAudienceScreen';
import { AudienceTrendChart } from '@/ui/components/AudienceTrendChart';
import { ControlRoom } from '@/components/ControlRoom';
import { EconomySponsorsScreen } from '@/ui/screens/EconomySponsorsScreen';
import { CrisesScreen } from '@/ui/screens/CrisesScreen';
import { SocialMediaFeedScreen } from '@/ui/screens/SocialMediaFeedScreen';
import { ChallengeEditorScreen } from '@/ui/screens/ChallengeEditorScreen';
import { FarmManagementScreen } from '@/ui/screens/FarmManagementScreen';
import { RosterManagementScreen } from '@/ui/screens/RosterManagementScreen';
import { StaffManagementScreen } from '@/ui/screens/StaffManagementScreen';
import { HallOfFameScreen } from '@/ui/screens/HallOfFameScreen';
import { SeasonReplayModal } from '@/ui/screens/SeasonReplayModal';
import { WEEKLY_SCHEDULE } from '@/engine/time/gameClock';
import {
  Briefcase,
  UserCheck,
  Tv,
  DollarSign,
  Radio,
  UserPlus,
  Video,
  Play,
  Square,
  TrendingUp,
  ShieldCheck,
  Users,
  Flame,
  Award,
  Sparkles,
  Clock,
  Save,
  CheckCircle,
  Calendar,
  PlusCircle,
  Trophy,
  Film,
  Vote,
  Tractor,
  Layers,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    isRecording,
    recordedTakesCount,
    hiredParticipants,
    toggleRecording,
    openModal,
    addToast,
  } = useAppStore();

  const {
    seasonConfig,
    time,
    cast,
    cash,
    ibope,
    reputation,
    authority,
    relationMatrix,
    alliances,
    conflicts,
    gossips,
    advancePhase: engineAdvancePhase,
    saveGame,
    isSaving,
    toggleVIP,
    sendToConfession,
    simulateConvivenciaTick,
    selectedParticipantForDetail,
    activeCameraPip,
    isEditorOpen,
    editingParticipant,
    openParticipantDetail,
    closeParticipantDetail,
    closeCameraPip,
    openEditor,
    closeEditor,
    addOrUpdateParticipant,
    triggerRandomEventAction,
    toggleGodMode,
    godMode,
  } = useGameStore();

  const { ibopeHistory } = useBroadcastStore();

  const [activeTab, setActiveTab] = useState<
    | 'control-room'
    | 'switcher'
    | 'roster'
    | 'staff'
    | 'hall-of-fame'
    | 'challenges'
    | 'editing'
    | 'paredao'
    | 'fantasy'
    | 'economy'
    | 'crises'
    | 'social-feed'
    | 'editor-provas'
    | 'farm'
    | 'cast'
    | 'social'
    | 'schedule'
  >('control-room');
  const [showChartSection, setShowChartSection] = useState(true);
  const [isReplayModalOpen, setIsReplayModalOpen] = useState(false);

  const handleAdvancePhase = async () => {
    const result = await engineAdvancePhase(isRecording);
    if (result.event) {
      addToast(
        'warning',
        `Evento: ${result.event.title}`,
        result.event.description
      );
    } else {
      addToast(
        'info',
        `Fase Avançada: ${time.phase}`,
        `Semana ${time.week} · Dia ${time.day} (${time.dayOfWeek}). IBOPE: ${ibope.toFixed(1)} pts.`
      );
    }
  };

  const handleManualSave = async () => {
    try {
      await saveGame();
      addToast('success', 'Temporada Salva', 'Todos os dados foram sincronizados no IndexedDB (Dexie).');
    } catch {
      addToast('error', 'Erro ao Salvar', 'Falha ao persistir no IndexedDB.');
    }
  };

  const activeHousemates = cast.filter((p) => !p.isEliminated);
  const activeConflicts = conflicts.filter((c) => !c.resolved);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Header do Reality & Mesa de Controle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap text-xs font-mono">
            <span className="font-bold text-cyan-400 tracking-wider">
              CENTRAL DE TRANSMISSÃO
            </span>
            <span className="text-slate-600">·</span>
            <Badge variant="live" pulse size="sm">
              AO VIVO NO AR
            </Badge>
            {isRecording && (
              <Badge variant="danger" pulse size="sm">
                GRAVAÇÃO REC
              </Badge>
            )}
            <span className="text-slate-600">·</span>
            <span className="text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-cyan-800/40">
              {time.dayOfWeek} · Sem {time.week} · Dia {time.day}
            </span>
            <span className="text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40 uppercase">
              {time.phase}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>{seasonConfig.programName}</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-slate-800/80 border border-slate-700 font-normal text-slate-300">
              {seasonConfig.mode === 'farm' ? 'Modo Fazenda' : seasonConfig.mode === 'hybrid' ? 'Modo Híbrido' : 'Modo Confinamento'}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Emissora: <span className="text-slate-200">{seasonConfig.networkName}</span> · Apresentador: <span className="text-slate-200">{seasonConfig.hostName}</span>
          </p>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={isRecording ? 'danger' : 'on-air'}
            size="md"
            leftIcon={isRecording ? <Square size={16} /> : <Radio size={16} />}
            onClick={toggleRecording}
            className="shadow-md"
          >
            {isRecording ? 'Parar Gravação (REC)' : 'Iniciar Gravação'}
          </Button>

          <Button
            variant="cyber"
            size="md"
            leftIcon={<Flame size={15} />}
            onClick={() => {
              const ev = triggerRandomEventAction();
              addToast('warning', `Plantão da Direção: ${ev.title}`, ev.headline);
            }}
            title="Dispara um conflito, romance ou desafio surpresa ao vivo"
          >
            ⚡ Evento Surpresa
          </Button>

          <Button
            variant="ghost"
            size="md"
            leftIcon={<Film size={15} />}
            onClick={() => setIsReplayModalOpen(true)}
            title="Assista ao VT de melhores momentos e encerramento"
          >
            🎬 VT da Temporada
          </Button>

          <Button
            variant={godMode ? 'danger' : 'ghost'}
            size="md"
            onClick={toggleGodMode}
            title="Alterna o Modo Diretor-Deus com orçamento infinito e controle total"
          >
            {godMode ? '👑 Deus ON' : '👑 Modo Deus'}
          </Button>

          <Button
            variant="primary"
            size="md"
            leftIcon={<UserPlus size={16} />}
            onClick={() => openModal('hire-participant')}
          >
            Contratar Morador
          </Button>

          <Button
            variant="secondary"
            size="md"
            leftIcon={<Play size={15} />}
            onClick={handleAdvancePhase}
            title="Avança a fase do dia na casa e recalcula as decisões da inteligência artificial"
          >
            Avançar Fase ({time.phase})
          </Button>

          <Button
            variant="ghost"
            size="md"
            leftIcon={<Save size={15} />}
            isLoading={isSaving}
            onClick={handleManualSave}
            title="Salva o estado atual da temporada no IndexedDB"
          >
            Salvar
          </Button>
        </div>
      </div>

      {/* 2. Grid de Telemetria e Métricas em Tempo Real */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Métrica 1: Audiência (IBOPE) */}
        <Card glow={isRecording ? 'red' : 'cyan'}>
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-red-950/70 border border-red-800/40 text-red-400">
              <Tv size={22} />
            </div>
            <div className="flex flex-col items-end font-mono">
              <span className="text-[10px] text-slate-400">STATUS AUDIÊNCIA</span>
              <span className={`text-[10px] font-bold ${isRecording ? 'text-red-400' : 'text-cyan-400'}`}>
                {isRecording ? '● PICO AO VIVO' : 'NO AR'}
              </span>
            </div>
          </div>

          <div className="mt-3">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Audiência Atual (IBOPE)
            </div>
            <div className="text-3xl font-black font-mono text-white mt-0.5 flex items-baseline gap-1.5">
              <span>{ibope.toFixed(1)}</span>
              <span className="text-xs font-normal text-slate-400">pontos</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between border-t border-slate-800/80 pt-2 font-mono">
              <span>Meta: 25.0 pts</span>
              <button
                onClick={() => setShowChartSection(!showChartSection)}
                className="text-cyan-400 hover:text-cyan-300 underline font-bold"
              >
                {showChartSection ? 'Ver Menos ▲' : 'Ver Gráfico ▼'}
              </button>
            </div>
          </div>
        </Card>

        {/* Métrica 2: Orçamento */}
        <Card glow="none">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800/40 text-emerald-400">
              <DollarSign size={22} />
            </div>
            <div className="flex flex-col items-end font-mono">
              <span className="text-[10px] text-slate-400">FLUXO DE CAIXA</span>
              <span className="text-[10px] font-bold text-emerald-400">SUPERÁVIT</span>
            </div>
          </div>

          <div className="mt-3">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Orçamento em Caixa
            </div>
            <div className="text-3xl font-black font-mono text-emerald-400 mt-0.5">
              R$ {cash.toLocaleString('pt-BR')}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between border-t border-slate-800/80 pt-2 font-mono">
              <span>Custo Diário: R$ 8.500</span>
              <span className="text-cyan-400">4 Patrocinadores</span>
            </div>
          </div>
        </Card>

        {/* Métrica 3: Moradores Confinados */}
        <Card glow="none">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-800/40 text-cyan-400">
              <Users size={22} />
            </div>
            <button
              onClick={() => setActiveTab('cast')}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 hover:underline"
            >
              Ver Elenco →
            </button>
          </div>

          <div className="mt-3">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Moradores Ativos
            </div>
            <div className="text-3xl font-black font-mono text-white mt-0.5 flex items-baseline gap-2">
              <span>{activeHousemates.length}</span>
              <span className="text-xs font-normal text-slate-400">confinados</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between border-t border-slate-800/80 pt-2 font-mono">
              <span>VIP: {cast.filter((p) => p.isVIP).length}</span>
              <span className="text-amber-300">Xepa: {cast.filter((p) => !p.isVIP).length}</span>
            </div>
          </div>
        </Card>

        {/* Métrica 4: Autoridade & Produção */}
        <Card glow="none">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-purple-950/70 border border-purple-800/40 text-purple-400">
              <ShieldCheck size={22} />
            </div>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40 font-bold">
              {authority} PTS
            </span>
          </div>

          <div className="mt-3">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Takes Gravados
            </div>
            <div className="text-3xl font-black font-mono text-purple-300 mt-0.5 flex items-baseline gap-2">
              <span>{recordedTakesCount}</span>
              <span className="text-xs font-normal text-slate-400">na ilha</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between border-t border-slate-800/80 pt-2 font-mono">
              <span>Reputação: {reputation}%</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle size={11} /> Dexie OK
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* 2.5 Gráfico de Linha Recharts: Tendência de Audiência ao Vivo & Episódios */}
      {showChartSection && (
        <AudienceTrendChart
          history={ibopeHistory}
          currentIbope={ibope}
          targetIbope={25.0}
        />
      )}

      {/* 3. Navegação Principal em Abas */}
      <Tabs
        tabs={[
          {
            id: 'control-room',
            label: 'Control Room & IBOPE',
            icon: <Tv size={14} />,
          },
          {
            id: 'roster',
            label: 'Escala de Participantes',
            icon: <Users size={14} />,
            badge: `${activeHousemates.length} confinados`,
          },
          {
            id: 'staff',
            label: 'Equipe & Produção',
            icon: <Briefcase size={14} />,
          },
          {
            id: 'hall-of-fame',
            label: 'Carreira & Hall da Fama (Fase 10)',
            icon: <Trophy size={14} />,
          },
          {
            id: 'switcher',
            label: 'Mesa de Corte & 3D',
            icon: <Video size={14} />,
          },
          {
            id: 'economy',
            label: 'Patrocínio & Economia (Fase 8)',
            icon: <DollarSign size={14} />,
          },
          {
            id: 'crises',
            label: 'Central de Crises (Fase 8)',
            icon: <AlertTriangle size={14} />,
          },
          {
            id: 'social-feed',
            label: 'Redes & Fofoca (Fase 8)',
            icon: <MessageSquare size={14} />,
          },
          {
            id: 'editor-provas',
            label: 'Editor de Provas (Fase 8)',
            icon: <Layers size={14} />,
          },
          {
            id: 'farm',
            label: 'A Fazenda & Roça (Fase 9)',
            icon: <Tractor size={14} />,
          },
          {
            id: 'challenges',
            label: 'Provas & Líder',
            icon: <Trophy size={14} />,
          },
          {
            id: 'editing',
            label: 'Ilha de Edição',
            icon: <Film size={14} />,
            badge: recordedTakesCount > 0 ? `${recordedTakesCount} takes` : undefined,
          },
          {
            id: 'paredao',
            label: 'Paredão ao Vivo',
            icon: <Vote size={14} />,
          },
          {
            id: 'fantasy',
            label: 'Plateia & Fantasy',
            icon: <Users size={14} />,
          },
          {
            id: 'cast',
            label: 'Elenco & Telemetria',
            icon: <Users size={14} />,
            badge: activeHousemates.length,
          },
          {
            id: 'social',
            label: 'Mapa Social',
            icon: <Flame size={14} />,
            badge: activeConflicts.length > 0 ? `${activeConflicts.length} tretas` : undefined,
          },
          {
            id: 'schedule',
            label: 'Calendário',
            icon: <Calendar size={14} />,
          },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as typeof activeTab)}
      />

      {/* 4. Conteúdo Dinâmico por Aba */}

      {/* ABA: Control Room & Métricas Chave (Live Viewership, Social Media Buzz, Ad Revenue) */}
      {activeTab === 'control-room' && <ControlRoom />}

      {/* ABA: Escala de Participantes (Contratar, Demitir, Substituir, Carisma & Controvérsia) */}
      {activeTab === 'roster' && <RosterManagementScreen />}

      {/* ABA: Gestão de Equipe & Produção (Talentos e Bastidores) */}
      {activeTab === 'staff' && <StaffManagementScreen />}

      {/* ABA: Carreira, Hall da Fama e Modo Diretor-Deus (Fase 10) */}
      {activeTab === 'hall-of-fame' && <HallOfFameScreen />}

      {/* ABA: Mesa de Corte Switcher ao Vivo & 3D da Casa (Fase 4 + Fase 5) */}
      {activeTab === 'switcher' && <BroadcastMasterView />}

      {/* ABA: Patrocínios, Finanças & Upgrades de Tecnologia (Fase 8) */}
      {activeTab === 'economy' && <EconomySponsorsScreen />}

      {/* ABA: Central de Gerenciamento de Crises (Fase 8) */}
      {activeTab === 'crises' && <CrisesScreen />}

      {/* ABA: Redes Sociais, Trending Topics & Portais de Fofoca (Fase 8) */}
      {activeTab === 'social-feed' && <SocialMediaFeedScreen />}

      {/* ABA: Editor de Provas & Cenários Dinâmicos (Fase 8) */}
      {activeTab === 'editor-provas' && <ChallengeEditorScreen />}

      {/* ABA: Modo Fazenda, Manejo Rural, Baia & Roça (Fase 9) */}
      {activeTab === 'farm' && <FarmManagementScreen />}

      {/* ABA: Estúdio de Provas, Líder, Anjo com Monstro e Bate-e-Volta (Fase 5) */}
      {activeTab === 'challenges' && <ChallengeStudioScreen />}

      {/* ABA: Ilha de Edição (Fase 6 e 7) */}
      {activeTab === 'editing' && <EditingRoomScreen />}

      {/* ABA: Paredão ao Vivo & Eliminação (Fase 6 e 7) */}
      {activeTab === 'paredao' && <LiveShowParedaoScreen />}

      {/* ABA: Plateia de IA, Fandoms & Fantasy Game (Fase 7) */}
      {activeTab === 'fantasy' && <FantasyAudienceScreen />}

      {/* ABA 6: Elenco & Telemetria */}
      {activeTab === 'cast' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Sparkles size={16} className="text-cyan-400 shrink-0" />
              <span>
                Monitoramento completo dos {cast.length} participantes. Clique em qualquer morador para abrir a <strong>Ficha Profunda</strong> com Big Five, necessidades (0-100) e ações ao vivo.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle size={14} />}
                onClick={() => openEditor(null)}
              >
                Criar Participante
              </Button>
              <Button
                variant="cyber"
                size="sm"
                onClick={() => {
                  simulateConvivenciaTick(isRecording);
                  addToast('info', 'Simulação Concluída', 'Novas flutuações e decisões da Utility AI computadas.');
                }}
              >
                Simular Decisões
              </Button>
            </div>
          </div>

          <ParticipantList
            participants={cast}
            isRecording={isRecording}
            onSelectParticipant={(p) => openParticipantDetail(p)}
            onSimulateTick={() => {
              simulateConvivenciaTick(isRecording);
              addToast('info', 'Flutuações Simuladas', 'Status do elenco recalculados com sucesso.');
            }}
            onToggleVIP={(id) => {
              toggleVIP(id);
              const p = cast.find((c) => c.id === id);
              if (p) {
                addToast(
                  'warning',
                  'Troca de Grupo',
                  `${p.nickname} foi movido(a) para ${!p.isVIP ? 'o VIP' : 'a Xepa'}!`
                );
              }
            }}
            onSendToConfession={(id) => {
              sendToConfession(id);
              const p = cast.find((c) => c.id === id);
              if (p) {
                addToast(
                  'info',
                  'Confessionário Ativado',
                  `${p.nickname} está desabafando e gerando conteúdo no confessionário!`
                );
              }
            }}
          />
        </div>
      )}

      {/* ABA 7: Mapa Social & Tretas (Fase 3) */}
      {activeTab === 'social' && (
        <SocialMapScreen
          cast={cast}
          relationMatrix={relationMatrix}
          alliances={alliances}
          conflicts={conflicts}
          gossips={gossips}
          onSelectParticipant={(p) => openParticipantDetail(p)}
        />
      )}

      {/* ABA 8: Calendário & Cronograma */}
      {activeTab === 'schedule' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base">Calendário Semanal da Atração</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                A simulação avança pelas fases do dia e pausa automaticamente em grandes eventos como Prova do Líder e Paredão.
              </p>
            </div>
            <Badge variant="info">SEMANA {time.week} DE {seasonConfig.durationWeeks}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {WEEKLY_SCHEDULE.map((sch) => {
              const isToday = sch.dayOfWeek === time.dayOfWeek;
              return (
                <div
                  key={`${sch.dayOfWeek}-${sch.phase}`}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                    isToday
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-lg ring-1 ring-cyan-400/50'
                      : 'border-slate-800 bg-slate-950/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                      <span className={isToday ? 'text-cyan-300 font-bold' : ''}>{sch.dayOfWeek}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 uppercase text-[9px]">
                        {sch.phase}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-xs mb-1">{sch.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-tight">{sch.description}</p>
                  </div>

                  <div className="pt-2 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                    <span className={sch.isAutoPause ? 'text-amber-400' : 'text-slate-500'}>
                      {sch.isAutoPause ? '⏸ Auto-pausa' : '▶ Contínuo'}
                    </span>
                    {isToday && (
                      <span className="text-cyan-400 font-bold uppercase tracking-wider">HOJE</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Modais Globais */}
      <CameraPipModal
        camera={activeCameraPip}
        participants={cast}
        isRecording={isRecording}
        onClose={closeCameraPip}
        onToggleRecording={toggleRecording}
      />

      <ParticipantDetailModal
        participant={selectedParticipantForDetail}
        onClose={closeParticipantDetail}
        onToggleVIP={(id) => {
          toggleVIP(id);
          const p = cast.find((c) => c.id === id);
          if (p) {
            addToast('warning', 'Troca de Grupo', `${p.nickname} foi movido(a) para ${!p.isVIP ? 'o VIP' : 'a Xepa'}!`);
          }
        }}
        onSendToConfession={(id) => {
          sendToConfession(id);
          const p = cast.find((c) => c.id === id);
          if (p) {
            addToast('info', 'Confessionário Ativado', `${p.nickname} foi chamado para desabafo no Confessionário!`);
          }
        }}
      />

      <ParticipantEditorModal
        isOpen={isEditorOpen}
        participantToEdit={editingParticipant}
        onClose={closeEditor}
        onSave={(p) => {
          addOrUpdateParticipant(p);
          addToast('success', 'Participante Salvo', `${p.name} ("${p.nickname}") salvo com sucesso no elenco!`);
        }}
      />

      <SeasonReplayModal
        isOpen={isReplayModalOpen}
        onClose={() => setIsReplayModalOpen(false)}
        programName={seasonConfig.programName}
        winnerName={cast[0]?.name || 'Campeão'}
        winnerNickname={cast[0]?.nickname || 'Campeão'}
      />
    </div>
  );
};
