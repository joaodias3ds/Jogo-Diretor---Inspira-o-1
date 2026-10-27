/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Participant } from '../housemates/types';
import { RelationMap, updateRelation } from './relationMatrix';
import { AllianceGroup, SocialConflict, GossipItem, ConflictCause, ConflictSeverity } from './socialTypes';

const DRAMATIC_ARGUMENTS: Record<ConflictCause, { desc: string; lines: string[] }> = {
  comida: {
    desc: 'Bate-boca acalorado por causa de comida racionada e leite condensado sumido da despensa',
    lines: [
      'Quem comeu a última banana da fruteira sem avisar?!',
      'Eu trabalhei na cozinha o dia todo, você não tem vergonha na cara?!',
      'Você é egoísta, só pensa no seu estômago e na sua estética!',
    ],
  },
  voto: {
    desc: 'Confronto direto na sala sobre traição de votos acordados no quarto',
    lines: [
      'Você jurou pela sua família que não votava em mim!',
      'Isso é um jogo de convivência, não vim aqui pra passar a mão na sua cabeça!',
      'Falso! O Brasil tá vendo a sua máscara caindo ao vivo!',
    ],
  },
  tarefas: {
    desc: 'Briga ruidosa por causa de louça acumulada na pia e sujeira no banheiro',
    lines: [
      'Você deixou a privada suja e a pia cheia de prato engordurado!',
      'Não sou seu empregado, folgado! Vai lavar o que você usou!',
      'Falta de respeito coletivo! Na casa da sua mãe você faz isso?!',
    ],
  },
  fofoca: {
    desc: 'Climão explosivo após revelação de que fofocas foram levadas para o quarto rival',
    lines: [
      'Leva e traz! Fica lambendo os pés do líder e falando mal pelas costas!',
      'Sustenta o que você disse na piscina! Fala agora na minha cara!',
      'Não tenho medo de você e nem do seu fã-clube inventado!',
    ],
  },
  ciumes: {
    desc: 'Discussão no jardim por ciúmes de flerte na festa e alianças cruzadas',
    lines: [
      'Você passou a festa inteira cochichando no ouvido do meu rival!',
      'Eu sou solteiro e jogo sozinho, não te devo satisfação nenhuma!',
      'Você se faz de sonso, mas adora provocar discórdia!',
    ],
  },
  ofensa: {
    desc: 'Troca de acusações pesadas na sala com dedo na cara e gritos',
    lines: [
      'Você é uma pessoa podre, sem escrúpulos e manipuladora!',
      'Grita mais! Quero ver você gritar no ao vivo no domingo!',
      'Abaixa a mão da minha cara senão a produção vai ter que entrar aqui!',
    ],
  },
  injustica: {
    desc: 'Revolta coletiva por privilégios percebidos na divisão do VIP e da Xepa',
    lines: [
      'Sempre os mesmos escolhidos pro banquete, enquanto a gente passa fome!',
      'Vocês não têm empatia com quem tá no osso há três semanas!',
      'A soberba precede a queda, guarde minhas palavras!',
    ],
  },
};

export const INITIAL_ALLIANCES: AllianceGroup[] = [
  {
    id: 'grp-oceano',
    name: 'Quarto Oceano (G-4)',
    badgeColor: 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300',
    leaderId: 'hm-2', // Dra. Camila
    memberIds: ['hm-2', 'hm-9', 'hm-16', 'hm-18'],
    cohesion: 88,
    rivalGroupId: 'grp-selva',
    rulesDescription: 'Votos unificados contra o Quarto Selva; lealdade absoluta até o Top 10.',
    isBroken: false,
  },
  {
    id: 'grp-selva',
    name: 'Quarto Selva & Tretas',
    badgeColor: 'border-rose-500/50 bg-rose-950/40 text-rose-300',
    leaderId: 'hm-3', // Bruninha Raio
    memberIds: ['hm-3', 'hm-14', 'hm-19'],
    cohesion: 76,
    rivalGroupId: 'grp-oceano',
    rulesDescription: 'Proteção mútua, tiro porrada e bomba nas dinâmicas da discórdia.',
    isBroken: false,
  },
  {
    id: 'grp-pagode',
    name: 'Tropa do Pagode & Resenha',
    badgeColor: 'border-amber-500/50 bg-amber-950/40 text-amber-300',
    leaderId: 'hm-1', // Gil do Pagode
    memberIds: ['hm-1', 'hm-8', 'hm-13', 'hm-15'],
    cohesion: 92,
    rulesDescription: 'Inimigos do fim, paz e amor; votam conforme o coração de cada um.',
    isBroken: false,
  },
  {
    id: 'grp-agro',
    name: 'Aliança do Campo & Cozinha',
    badgeColor: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300',
    leaderId: 'hm-7', // Cauã do Agro
    memberIds: ['hm-7', 'hm-4', 'hm-6', 'hm-20'],
    cohesion: 84,
    rulesDescription: 'Trabalho na roça e comida boa; controle da despensa e paz comunitária.',
    isBroken: false,
  },
];

export function simulateSocialTick(
  cast: Participant[],
  relationMatrix: RelationMap,
  alliances: AllianceGroup[],
  day: number,
  phase: string
): {
  updatedMatrix: RelationMap;
  updatedAlliances: AllianceGroup[];
  newConflicts: SocialConflict[];
  newGossips: GossipItem[];
  updatedCast: Participant[];
} {
  let matrix = { ...relationMatrix };
  let currentAlliances = [...alliances];
  const newConflicts: SocialConflict[] = [];
  const newGossips: GossipItem[] = [];

  // Agrupa participantes por cômodo
  const roomGroups: Record<string, Participant[]> = {};
  for (const p of cast) {
    if (p.isEliminated) continue;
    if (!roomGroups[p.currentRoom]) roomGroups[p.currentRoom] = [];
    roomGroups[p.currentRoom].push(p);
  }

  // 1. Interações entre moradores no mesmo cômodo
  for (const [roomId, occupants] of Object.entries(roomGroups)) {
    if (occupants.length < 2) continue;

    for (let i = 0; i < occupants.length; i++) {
      for (let j = i + 1; j < occupants.length; j++) {
        const pA = occupants[i];
        const pB = occupants[j];

        const relAB = matrix[pA.id]?.[pB.id];
        const currentAffinity = relAB ? relAB.affinity : 0;

        // CHANCE DE CONFLITO: Baixa afinidade + estresse elevado
        if (currentAffinity < -10 && (pA.states.stress > 60 || pB.states.stress > 60)) {
          const causes: ConflictCause[] = ['comida', 'voto', 'tarefas', 'fofoca', 'ofensa'];
          const cause = causes[Math.floor(Math.random() * causes.length)];
          const argumentData = DRAMATIC_ARGUMENTS[cause];

          const severity: ConflictSeverity =
            pA.states.stress > 80 && pB.states.stress > 80
              ? 'barraco'
              : pA.states.stress > 65
              ? 'discussao'
              : 'climão';

          const conflict: SocialConflict = {
            id: `conf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            day,
            phase,
            sourceParticipantId: pA.id,
            targetParticipantId: pB.id,
            cause,
            severity,
            description: `${pA.nickname} e ${pB.nickname} protagonizaram um(a) ${severity} em pleno(a) ${roomId}: ${argumentData.desc}.`,
            dialogueExchange: argumentData.lines,
            resolved: false,
            timestamp: Date.now(),
          };

          newConflicts.push(conflict);

          // Piora a relação
          matrix = updateRelation(matrix, pA.id, pB.id, {
            affinity: -18,
            trust: -20,
            rivalry: 25,
          }, `Briga explosiva sobre ${cause}.`);

          matrix = updateRelation(matrix, pB.id, pA.id, {
            affinity: -18,
            trust: -20,
            rivalry: 25,
          }, `Briga explosiva sobre ${cause}.`);
        }
        // CHANCE DE APROXIMAÇÃO / AMIZADE / FLERTE
        else if (currentAffinity >= 0 && (pA.states.mood > 50 || pB.states.mood > 50)) {
          const affinityBoost = Math.floor(Math.random() * 4 + 2);
          const trustBoost = Math.floor(Math.random() * 3 + 1);

          matrix = updateRelation(matrix, pA.id, pB.id, {
            affinity: affinityBoost,
            trust: trustBoost,
          });
          matrix = updateRelation(matrix, pB.id, pA.id, {
            affinity: affinityBoost,
            trust: trustBoost,
          });

          // Flerte romântico
          if (pA.temperament === 'Romântico' || pB.temperament === 'Romântico') {
            matrix = updateRelation(matrix, pA.id, pB.id, { attraction: 5 });
            matrix = updateRelation(matrix, pB.id, pA.id, { attraction: 5 });
          }
        }

        // FOFOCA AUTÔNOMA
        if (pA.temperament === 'Fofoqueiro' && Math.random() > 0.6) {
          const otherHousemates = cast.filter((c) => c.id !== pA.id && c.id !== pB.id && !c.isEliminated);
          if (otherHousemates.length > 0) {
            const target = otherHousemates[Math.floor(Math.random() * otherHousemates.length)];
            const gossip: GossipItem = {
              id: `gsp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              originParticipantId: pA.id,
              targetParticipantId: target.id,
              topic: `Comportamento de ${target.nickname}`,
              originalFact: `${target.nickname} combinou votos no edredom`,
              distortedRumor: `${target.nickname} está jurando lealdade falsa e quer trair o grupo todo!`,
              distortionLevel: Math.floor(Math.random() * 35 + 20),
              knowersIds: [pA.id, pB.id],
              hasLeaked: Math.random() > 0.7,
              day,
            };
            newGossips.push(gossip);
          }
        }
      }
    }
  }

  // 2. Coesão de Alianças e Detecção de Rachas
  currentAlliances = currentAlliances.map((alliance) => {
    if (alliance.isBroken) return alliance;

    // Calcula afinidade média interna entre membros
    let totalAffinity = 0;
    let pairs = 0;
    for (const m1 of alliance.memberIds) {
      for (const m2 of alliance.memberIds) {
        if (m1 === m2) continue;
        const rel = matrix[m1]?.[m2];
        if (rel) {
          totalAffinity += rel.affinity;
          pairs++;
        }
      }
    }

    const avgAffinity = pairs > 0 ? totalAffinity / pairs : 50;
    const newCohesion = Math.max(0, Math.min(100, Math.round(avgAffinity * 0.7 + 30)));
    const isBroken = newCohesion < 25;

    return {
      ...alliance,
      cohesion: newCohesion,
      isBroken,
    };
  });

  // 3. Decaimento de Memórias nos Participantes (Fading gradual)
  const updatedCast = cast.map((p) => {
    const decayedMemories = p.memories
      .map((m) => ({
        ...m,
        intensity: Math.max(1, m.intensity - (day - m.day > 2 ? 1 : 0)),
      }))
      .filter((m) => m.intensity > 1);

    return {
      ...p,
      memories: decayedMemories,
    };
  });

  return {
    updatedMatrix: matrix,
    updatedAlliances: currentAlliances,
    newConflicts,
    newGossips,
    updatedCast,
  };
}
