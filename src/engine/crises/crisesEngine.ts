/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CrisisCategory =
  | 'desistencia'
  | 'violencia'
  | 'vazamento'
  | 'boicote'
  | 'juridico'
  | 'tecnica'
  | 'animal';

export type CrisisSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface CrisisOption {
  id: string;
  label: string;
  description: string;
  cashCost: number;
  authorityCost: number;
  ibopeDelta: number;
  reputationDelta: number;
  castMoraleDelta: number;
  outcomeText: string;
}

export interface CrisisEvent {
  id: string;
  title: string;
  category: CrisisCategory;
  severity: CrisisSeverity;
  description: string;
  involvedParticipantNames?: string[];
  options: CrisisOption[];
  resolved: boolean;
  chosenOptionId?: string;
  createdAtDay: number;
}

export const CRISIS_CATALOG: Omit<CrisisEvent, 'id' | 'resolved' | 'chosenOptionId' | 'createdAtDay'>[] = [
  {
    title: 'Ameaça de Desistência no Botão',
    category: 'desistencia',
    severity: 'high',
    description:
      'Um dos participantes favoritos está em crise de ansiedade na frente do Botão de Desistência após briga na cozinha.',
    options: [
      {
        id: 'opt-psico',
        label: 'Chamar Psicóloga no Confessionário',
        description: 'Enviar a equipe de saúde mental para acalmar os ânimos com sigilo.',
        cashCost: 15000,
        authorityCost: 10,
        ibopeDelta: 0.5,
        reputationDelta: +5,
        castMoraleDelta: +10,
        outcomeText: 'A psicóloga conteve a crise. O participante desistiu de apertar o botão!',
      },
      {
        id: 'opt-provoke',
        label: 'Deixar a Tensão Subir ao Vivo',
        description: 'Transmitir a indecisão em câmera exclusiva para bater recorde de audiência.',
        cashCost: 0,
        authorityCost: 20,
        ibopeDelta: +3.8,
        reputationDelta: -8,
        castMoraleDelta: -15,
        outcomeText: 'A audiência explodiu nos minutos de tensão, mas a casa ficou com o clima pesado.',
      },
      {
        id: 'opt-cash',
        label: 'Prometer Bônus / Ação de Conforto',
        description: 'Liberar cooler especial com bebidas e petiscos para apaziguar os ânimos.',
        cashCost: 25000,
        authorityCost: 5,
        ibopeDelta: +1.0,
        reputationDelta: +2,
        castMoraleDelta: +15,
        outcomeText: 'O cooler acalmou o participante, que celebrou com os aliados na varanda.',
      },
    ],
  },
  {
    title: 'Quase Vias de Fato: Encostada de Narizes',
    category: 'violencia',
    severity: 'critical',
    description:
      'Discussão após a festa escalou para empurrão velado e encostada de rostos. A internet pede expulsão imediata.',
    options: [
      {
        id: 'opt-var-analise',
        label: 'Análise do VAR no Programa ao Vivo',
        description: 'Exibir a cena com ângulos múltiplos e dar advertência formal severa.',
        cashCost: 10000,
        authorityCost: 15,
        ibopeDelta: +4.2,
        reputationDelta: +4,
        castMoraleDelta: -5,
        outcomeText: 'O público aplaudiu a transparência da emissora. Advertência dada em rede nacional!',
      },
      {
        id: 'opt-expel',
        label: 'Expulsão Sumária Disciplinar',
        description: 'Cortar pela raiz para proteger a imagem e os patrocinadores do reality.',
        cashCost: 50000,
        authorityCost: 30,
        ibopeDelta: +2.0,
        reputationDelta: +12,
        castMoraleDelta: -10,
        outcomeText: 'Morador retirado da casa pela produção. Patrocinadores elogiaram a postura firme.',
      },
      {
        id: 'opt-abafar',
        label: 'Tratar como Discussão Natural',
        description: 'Minimizar nas chamadas e focar na fofoca gerada entre os grupos.',
        cashCost: 0,
        authorityCost: 10,
        ibopeDelta: +2.5,
        reputationDelta: -15,
        castMoraleDelta: +5,
        outcomeText: 'Críticas pesadas nos portais de notícias acusando a produção de passar pano.',
      },
    ],
  },
  {
    title: 'Vazamento de Áudio no Microfone da Produção',
    category: 'vazamento',
    severity: 'medium',
    description:
      'Um técnico da mesa de corte esqueceu o microfone de ordens aberto e um comentário irônico sobre a prova vazou no Pay-Per-View.',
    options: [
      {
        id: 'opt-statement',
        label: 'Nota Oficial de Esclarecimento',
        description: 'Publicar nota técnica admitindo a falha e suspendendo o operador temporariamente.',
        cashCost: 8000,
        authorityCost: 10,
        ibopeDelta: +0.2,
        reputationDelta: +3,
        castMoraleDelta: 0,
        outcomeText: 'A nota oficial desarmou os boatos nas redes sociais rapidamente.',
      },
      {
        id: 'opt-joke',
        label: 'Tadeu Faz Piada no Bloco de Abertura',
        description: 'Transformar o erro em meme com o carisma do apresentador no estúdio.',
        cashCost: 0,
        authorityCost: 5,
        ibopeDelta: +1.5,
        reputationDelta: +5,
        castMoraleDelta: 0,
        outcomeText: 'A audiência adorou o bom humor do apresentador e o assunto virou trending topic positivo!',
      },
    ],
  },
  {
    title: 'Boicote Ameaçado por Patrocinador Master',
    category: 'boicote',
    severity: 'high',
    description:
      'A Cervejaria Estrela Pura não gostou de fala polêmica sobre seu produto durante a madrugada e exige reparação.',
    options: [
      {
        id: 'opt-brand-party',
        label: 'Festa Temática Exclusiva da Marca',
        description: 'Investir em uma super cenografia valorizando a marca e seus produtos.',
        cashCost: 65000,
        authorityCost: 10,
        ibopeDelta: +1.2,
        reputationDelta: +6,
        castMoraleDelta: +10,
        outcomeText: 'O patrocinador ficou encantado com a super festa e renovou o contrato!',
      },
      {
        id: 'opt-merchan-apresentador',
        label: 'Apresentador Faz Merchandising de Reparação',
        description: 'Fazer o apresentador abrir o bloco tomando o produto com entusiasmo.',
        cashCost: 20000,
        authorityCost: 15,
        ibopeDelta: -0.4,
        reputationDelta: +2,
        castMoraleDelta: 0,
        outcomeText: 'O cliente se deu por satisfeito com a citação do apresentador no horário nobre.',
      },
    ],
  },
  {
    title: 'Fuga da Vaca Mimosa / Pane no Curral (Modo Fazenda)',
    category: 'animal',
    severity: 'medium',
    description:
      'A porteira do curral ficou destravada pelos peões e a vaca Mimosa foi passear perto da piscina da Sede.',
    options: [
      {
        id: 'opt-vet',
        label: 'Acionar Equipe de Veterinários e Peões',
        description: 'Conduzir o animal com segurança e cuidado zootécnico.',
        cashCost: 12000,
        authorityCost: 5,
        ibopeDelta: +2.8,
        reputationDelta: +8,
        castMoraleDelta: +5,
        outcomeText: 'Cena hilária dos peões correndo atrás da Mimosa. A internet encheu de memes fofos!',
      },
      {
        id: 'opt-punish',
        label: 'Soar a Sirene: Punição de 48h Sem Água Quente',
        description: 'Aplicar o regulamento da Fazenda por descuido com os animais.',
        cashCost: 0,
        authorityCost: 20,
        ibopeDelta: +3.0,
        reputationDelta: -2,
        castMoraleDelta: -20,
        outcomeText: 'A sirene acordou a casa! Briga generalizada na sala culpando o encarregado da baia.',
      },
    ],
  },
];

export function generateRandomCrisis(day: number): CrisisEvent {
  const index = Math.floor(Math.random() * CRISIS_CATALOG.length);
  const template = CRISIS_CATALOG[index];
  return {
    ...template,
    id: `crisis-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    resolved: false,
    createdAtDay: day,
  };
}
