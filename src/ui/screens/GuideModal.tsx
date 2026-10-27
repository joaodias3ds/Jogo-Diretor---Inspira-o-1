/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Modal } from '@/ui/components/Modal';
import { Button } from '@/ui/components/Button';
import { useAppStore } from '@/app/useAppStore';
import { Tabs } from '@/ui/components/Tabs';
import { BookOpen, Tv, Users, Award, ShieldAlert, Sparkles } from 'lucide-react';

export const GuideModal: React.FC = () => {
  const { activeModal, closeModal } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');

  if (activeModal !== 'guide') return null;

  return (
    <Modal
      isOpen={true}
      onClose={closeModal}
      title="Manual do Diretor de Reality"
      subtitle="Guia oficial de bastidores, regras de audiência e controle de participantes"
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs sm:text-sm text-slate-300">
        <Tabs
          tabs={[
            { id: 'overview', label: 'Visão Geral', icon: <BookOpen size={14} /> },
            { id: 'phases', label: 'Ciclo Semanal', icon: <Tv size={14} /> },
            { id: 'housemates', label: 'Participantes', icon: <Users size={14} /> },
            { id: 'director', label: 'Poderes & Crises', icon: <ShieldAlert size={14} /> },
            { id: 'modes', label: 'Formatos', icon: <Award size={14} /> },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 leading-relaxed">
          {activeTab === 'overview' && (
            <>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-cyan-400" />
                Bem-vindo à Cadeira do Diretor Geral!
              </h3>
              <p>
                No <strong>Diretor do Reality</strong>, você não joga como participante: você comanda
                toda a engrenagem do programa mais vigiado do país.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-semibold text-cyan-300 mb-1">1. IBOPE & Audiência</div>
                  <p className="text-xs text-slate-400">
                    O que vai ao ar na Ilha de Edição define os índices de audiência e a reação dos patrocinadores.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-semibold text-emerald-300 mb-1">2. Caixa & Finanças</div>
                  <p className="text-xs text-slate-400">
                    Equipe, cenografia, cachês e prêmios custam dinheiro. Venda cotas e mantenha o show lucrativo.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-semibold text-amber-300 mb-1">3. Reputação</div>
                  <p className="text-xs text-slate-400">
                    Manipulações excessivas ou escândalos mancham a credibilidade do programa e afastam marcas.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-semibold text-purple-300 mb-1">4. Autoridade</div>
                  <p className="text-xs text-slate-400">
                    Seu capital moral para impor dinâmicas duras, expulsões, paredões falsos e tocar o Big Fone.
                  </p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'phases' && (
            <>
              <h3 className="text-base font-bold text-white">Cronograma da Semana do Reality</h3>
              <ul className="space-y-2 text-xs">
                <li className="flex items-start gap-2">
                  <span className="font-mono text-cyan-400 font-bold shrink-0">SEG–QUA:</span>
                  <span>Convivência, formação de panelinhas, intrigas, Jogo da Discórdia e dinâmicas de quarto.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-amber-400 font-bold shrink-0">QUINTA:</span>
                  <span><strong>Prova do Líder / Fazendeiro:</strong> prova de resistência, lógica, força ou sorte. O vencedor indica direto ao paredão e ganha imunidade.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-emerald-400 font-bold shrink-0">SEXTA:</span>
                  <span><strong>Prova do Anjo / Lampião:</strong> poder de imunizar aliado e dar o temido Castigo do Monstro. Mercado e controle de comida (VIP/Xepa).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-purple-400 font-bold shrink-0">SÁBADO:</span>
                  <span><strong>Grande Festa Temática:</strong> álcool liberado, flertes, brigas de madrugada e ação de patrocinador master.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-red-400 font-bold shrink-0">DOMINGO:</span>
                  <span><strong>Programa ao Vivo & Paredão:</strong> votação tensa da casa, contragolpe, prova Bate-e-Volta e eliminação com discurso do apresentador.</span>
                </li>
              </ul>
            </>
          )}

          {activeTab === 'housemates' && (
            <>
              <h3 className="text-base font-bold text-white">Vida Artificial dos Participantes</h3>
              <p>
                Cada morador é um agente autônomo com inteligência de utilidade (Utility AI).
                Eles agem com base em:
              </p>
              <div className="space-y-1.5 text-xs text-slate-400">
                <div>• <strong>Necessidades Fisiológicas:</strong> Sono, fome, higiene, diversão, energia e conforto.</div>
                <div>• <strong>Personalidade Big Five:</strong> Abertura, Conscienciosidade, Extroversão, Amabilidade e Neuroticismo.</div>
                <div>• <strong>Traços Estratégicos:</strong> Líder nato, Fofoqueiro, Planta, Explosivo, Leal, Dissimulado ou Romântico.</div>
                <div>• <strong>Memória Episódica:</strong> Guardam mágoas de votos, desavenças em festas e favores recebidos.</div>
              </div>
            </>
          )}

          {activeTab === 'director' && (
            <>
              <h3 className="text-base font-bold text-white">Intervenções e Gerenciamento de Crises</h3>
              <p>
                Quando a casa está monótona, o diretor tem botões de choque:
              </p>
              <div className="space-y-1.5 text-xs text-slate-400">
                <div>• <strong>Telefone Misterioso (Big Fone):</strong> Toca a qualquer instante com ordens secretas.</div>
                <div>• <strong>Paredão Falso & Quarto Secreto:</strong> O eliminado assiste tudo às escondidas e volta triunfante.</div>
                <div>• <strong>Entrada de Novos Moradores (Casa de Vidro):</strong> Chacoalha o jogo com fofocas de fora.</div>
                <div>• <strong>Crises Inesperadas:</strong> Agressões, desistências, panes elétricas e processos judiciais exigem resposta rápida.</div>
              </div>
            </>
          )}

          {activeTab === 'modes' && (
            <>
              <h3 className="text-base font-bold text-white">Os Três Formatos Disponíveis</h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-cyan-400 font-bold">1. Confinamento Urbano (Casa):</span> Mansão tecnológica, quarto do líder privativo, confessionário e paredão semanal.
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-amber-400 font-bold">2. Vida Rural (Fazenda):</span> Sede rústica, baias com animais, ordenha matinal, punições coletivas e eliminação na roça.
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-purple-400 font-bold">3. Formato Híbrido:</span> Dois grupos divididos entre luxo e campo, disputando território e trocas dramáticas de participantes.
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={closeModal}>
            Entendido, Diretor!
          </Button>
        </div>
      </div>
    </Modal>
  );
};
