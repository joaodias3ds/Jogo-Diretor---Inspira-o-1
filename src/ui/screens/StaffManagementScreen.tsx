/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGameStore } from '@/app/useGameStore';
import { useAppStore } from '@/app/useAppStore';
import { Card } from '@/ui/components/Card';
import { Button } from '@/ui/components/Button';
import { Badge } from '@/ui/components/Badge';
import { calculateStudioPayroll } from '@/engine/staff/staffEngine';
import { StaffDepartment, StaffMember } from '@/engine/staff/staffTypes';
import {
  Briefcase,
  Tv,
  Film,
  Award,
  Sparkles,
  TrendingUp,
  DollarSign,
  UserPlus,
  UserCheck,
  UserX,
  Shield,
  HeartHandshake,
  CheckCircle,
} from 'lucide-react';

export const StaffManagementScreen: React.FC = () => {
  const { staffMembers, cash, hireStaffMember, fireStaffMember, promoteStaffMember } = useGameStore();
  const { addToast } = useAppStore();

  const [activeDept, setActiveDept] = useState<StaffDepartment>('front_of_camera');

  const payroll = calculateStudioPayroll(staffMembers);
  const filteredStaff = staffMembers.filter((s) => s.department === activeDept);

  const handleHire = (member: StaffMember) => {
    if (cash < member.weeklySalary) {
      addToast('error', 'Orçamento Insuficiente', `Você precisa de R$ ${member.weeklySalary.toLocaleString('pt-BR')} para contratar.`);
      return;
    }
    const ok = hireStaffMember(member.id);
    if (ok) {
      addToast('success', 'Funcionário Contratado!', `${member.name} agora faz parte da produção como ${member.roleTitle}.`);
    }
  };

  const handleFire = (member: StaffMember) => {
    fireStaffMember(member.id);
    addToast('info', 'Contrato Rescindido', `${member.name} foi desligado(a) da produção do reality.`);
  };

  const handlePromote = (member: StaffMember) => {
    if (cash < member.upgradeCost) {
      addToast('error', 'Orçamento Insuficiente', `Custo de promoção: R$ ${member.upgradeCost.toLocaleString('pt-BR')}.`);
      return;
    }
    const ok = promoteStaffMember(member.id);
    if (ok) {
      addToast('success', 'Promoção Concedida!', `${member.name} subiu de nível profissional! Bônus aprimorados.`);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
      {/* 1. Header do Estúdio & Gestão de Equipe */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950/40 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs font-mono">
            <span className="text-purple-400 font-bold tracking-wider">DIREÇÃO DE PRODUÇÃO & RECURSOS HUMANOS</span>
            <span className="text-slate-600">·</span>
            <span className="text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              EQUIPE TÉCNICA E TALENTOS
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Briefcase className="text-purple-400" size={28} />
            Gestão da Equipe do Reality Show
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Monte sua equipe de estrelas na frente das câmeras (apresentadores, comentaristas e repórteres) e bastidores de elite (fotografia, roteiro de treta, psicólogos e seguranças táticos).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeDept === 'front_of_camera' ? 'primary' : 'ghost'}
            size="md"
            onClick={() => setActiveDept('front_of_camera')}
            leftIcon={<Tv size={15} />}
          >
            Frente das Câmeras ({payroll.frontCameraCount})
          </Button>
          <Button
            variant={activeDept === 'behind_the_scenes' ? 'primary' : 'ghost'}
            size="md"
            onClick={() => setActiveDept('behind_the_scenes')}
            leftIcon={<Film size={15} />}
          >
            Trás das Câmeras ({payroll.behindCameraCount})
          </Button>
        </div>
      </div>

      {/* 2. Grid de Telemetria de Produção */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card glow="cyan">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-400 uppercase font-bold flex items-center gap-1.5">
              <UserCheck size={15} /> Profissionais Contratados
            </span>
            <Badge variant="info" size="sm">{payroll.totalStaffHired} / {staffMembers.length}</Badge>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white">{payroll.totalStaffHired}</span>
            <span className="text-xs text-slate-400 font-mono">membros ativos</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Equipe completa reduz erros de transmissão e potencializa o dinamismo do confinamento.
          </p>
        </Card>

        <Card glow="amber">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-purple-400 uppercase font-bold flex items-center gap-1.5">
              <DollarSign size={15} /> Folha Salarial Semanal
            </span>
            <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
              Custo Fixo
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-purple-300">
              R$ {payroll.totalWeeklyPayroll.toLocaleString('pt-BR')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Valores descontados semanalmente do orçamento geral da emissora.
          </p>
        </Card>

        <Card glow="cyan">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 uppercase font-bold flex items-center gap-1.5">
              <Sparkles size={15} /> Bônus de Produção Ativos
            </span>
            <Badge variant="success" size="sm">POTÊNCIA MÁXIMA</Badge>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-emerald-400">{payroll.activeBuffsCount}</span>
            <span className="text-xs text-slate-400 font-mono">vantagens</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Impactos em IBOPE ao vivo, prevenção de crises, agilidade de provas e memes nas redes.
          </p>
        </Card>

        <Card glow="none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-amber-400 uppercase font-bold flex items-center gap-1.5">
              <DollarSign size={15} /> Orçamento Disponível
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-emerald-400">
              R$ {cash.toLocaleString('pt-BR')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Use a receita de patrocinadores para contratar e promover estrelas da emissora.
          </p>
        </Card>
      </div>

      {/* 3. Cards da Equipe Filtrada */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredStaff.map((member) => {
          const isHired = member.hired;
          return (
            <div
              key={member.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                isHired
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/60 border-slate-900 opacity-80 hover:opacity-100'
              }`}
            >
              {/* Topo do Card */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl shadow-lg shrink-0">
                    {member.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-white">{member.name}</h4>
                      <Badge
                        variant={
                          member.level === 'Estrela'
                            ? 'live'
                            : member.level === 'Senior'
                            ? 'warning'
                            : member.level === 'Pleno'
                            ? 'info'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        Nível {member.level}
                      </Badge>
                    </div>
                    <p className="text-xs font-mono text-cyan-400 font-semibold">{member.roleTitle}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{member.description}</p>
                  </div>
                </div>

                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
                    isHired
                      ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/40'
                      : 'text-slate-500 bg-slate-900 border border-slate-800'
                  }`}
                >
                  {isHired ? 'NO AR' : 'VAGO'}
                </span>
              </div>

              {/* Bônus e Benefícios */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Bônus e Vantagens Especiais:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {member.perks.map((perk, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-mono text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-700/80 flex items-center gap-1"
                    >
                      <Sparkles size={11} className="text-amber-400 shrink-0" />
                      {perk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Custo & Ações */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <div className="font-mono text-xs">
                  <span className="text-slate-400">Salário: </span>
                  <strong className="text-emerald-400 font-bold">
                    R$ {member.weeklySalary.toLocaleString('pt-BR')}/sem
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  {isHired ? (
                    <>
                      {member.level !== 'Estrela' && (
                        <Button
                          variant="cyber"
                          size="sm"
                          onClick={() => handlePromote(member)}
                          title={`Custo: R$ ${member.upgradeCost.toLocaleString('pt-BR')}`}
                        >
                          Promover (R$ {member.upgradeCost.toLocaleString('pt-BR')})
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleFire(member)}
                        leftIcon={<UserX size={13} />}
                      >
                        Demitir
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleHire(member)}
                      leftIcon={<UserPlus size={14} />}
                    >
                      Contratar Funcionário
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
