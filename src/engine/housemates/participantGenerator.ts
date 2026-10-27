/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Participant, TemperamentType, RealityRoomId } from './types';

const FIRST_NAMES = [
  'Lucas', 'Matheus', 'Gabriel', 'Rodrigo', 'Thiago', 'Felipe', 'Bruno', 'Caio', 'Danilo', 'Igor',
  'Larissa', 'Mariana', 'Camila', 'Beatriz', 'Juliana', 'Amanda', 'Fernanda', 'Aline', 'Natália', 'Isabela',
  'João', 'Pedro', 'Rafael', 'Diego', 'Vinicius', 'Renan', 'Marcelo', 'Leonardo', 'Guilherme', 'Gustavo',
  'Yasmin', 'Rafaela', 'Caroline', 'Thais', 'Sabrina', 'Bianca', 'Priscila', 'Débora', 'Talita', 'Renata'
];

const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
  'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa',
  'Rocha', 'Dias', 'Nascimento', 'Andrade', 'Moreira', 'Nunes', 'Marques', 'Machado', 'Mendes', 'Freitas'
];

const PROFESSIONS = [
  'Personal Trainer & Atleta', 'Advogado(a) Trabalhista', 'Influenciador(a) Digital', 'Médico(a) Residente',
  'DJ & Produtor Musical', 'Chef de Cozinha & Padeiro', 'Vendedor(a) do Comércio', 'Modelo Fotográfico',
  'Engenheiro(a) Civil', 'Professor(a) de Dança', 'Barman & Mixologista', 'Empresário(a) de Moda',
  'Cantor(a) Sertanejo', 'Tatuador(a) & Artista', 'Nutricionista Esportiva', 'Agrônomo(a) de Campo',
  'Policial Militar / Civil', 'Ator / Atriz de Teatro', 'Veterinário(a) de Grandes Animais', 'Comerciante da Feira'
];

const HOMETOWNS = [
  'São Paulo - SP', 'Rio de Janeiro - RJ', 'Salvador - BA', 'Belo Horizonte - MG', 'Fortaleza - CE',
  'Curitiba - PR', 'Recife - PE', 'Porto Alegre - RS', 'Goiânia - GO', 'Brasília - DF',
  'Belém - PA', 'Manaus - AM', 'Vitória - ES', 'Florianópolis - SC', 'Natal - RN',
  'Cuiabá - MT', 'Campo Grande - MS', 'Maceió - AL', 'João Pessoa - PB', 'São Luís - MA'
];

const TEMPERAMENTS: TemperamentType[] = [
  'Estrategista', 'Explosivo', 'Carismático', 'Fofoqueiro', 'Romântico', 'Planta', 'Leal', 'Líder'
];

const TRAIT_POOL = [
  'Competitivo', 'Pavio Curto', 'Vaidoso', 'Leal ao Grupo', 'Calculista', 'Sem Filtro',
  'Bom de Garfo', 'Inimigo do Fim', 'Dorminhoco', 'Pacificador', 'Emotivo', 'Espalhafatoso',
  'Focado', 'Rústico', 'Observador', 'Vingativo', 'Coração Grande', 'Disciplinado', 'Didático', 'Sedutor'
];

const AVATAR_GRADIENTS = [
  'from-pink-500 to-rose-600',
  'from-purple-500 to-indigo-600',
  'from-cyan-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-600 to-red-700',
  'from-teal-500 to-emerald-600',
  'from-violet-600 to-purple-800',
  'from-yellow-500 to-amber-600',
  'from-sky-500 to-cyan-600',
];

export function generateRandomParticipant(customId?: string): Participant {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const name = `${firstName} ${lastName}`;
  const nickname = firstName.length > 5 ? firstName.slice(0, 4) + 'inho' : firstName;
  const age = Math.floor(Math.random() * 32 + 20); // 20 a 52 anos
  const profession = PROFESSIONS[Math.floor(Math.random() * PROFESSIONS.length)];
  const hometown = HOMETOWNS[Math.floor(Math.random() * HOMETOWNS.length)];
  const temperament = TEMPERAMENTS[Math.floor(Math.random() * TEMPERAMENTS.length)];
  const avatarColor = AVATAR_GRADIENTS[Math.floor(Math.random() * AVATAR_GRADIENTS.length)];

  // Escolhe 3 traços aleatórios
  const shuffledTraits = [...TRAIT_POOL].sort(() => 0.5 - Math.random());
  const traits = shuffledTraits.slice(0, 3);

  // Big Five com leve correlação com o temperamento
  const bigFive = {
    openness: Math.floor(Math.random() * 50 + 40),
    conscientiousness: Math.floor(Math.random() * 50 + 40),
    extraversion: temperament === 'Carismático' || temperament === 'Explosivo' ? Math.floor(Math.random() * 25 + 75) : Math.floor(Math.random() * 60 + 30),
    agreeableness: temperament === 'Explosivo' ? Math.floor(Math.random() * 30 + 20) : Math.floor(Math.random() * 50 + 45),
    neuroticism: temperament === 'Explosivo' ? Math.floor(Math.random() * 35 + 65) : Math.floor(Math.random() * 50 + 25),
  };

  const initialStamina = Math.floor(Math.random() * 30 + 65);
  const initialMood = Math.floor(Math.random() * 35 + 60);
  const initialPopularity = Math.floor(Math.random() * 35 + 45);

  const rooms: RealityRoomId[] = [
    'cozinha-vip', 'quarto-oceano', 'quarto-selva', 'piscina-jardim', 'academia', 'sala-estar'
  ];

  return {
    id: customId || `hm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name,
    nickname,
    age,
    profession,
    hometown,
    avatarColor,
    temperament,
    traits,
    bigFive,
    needs: {
      hunger: Math.floor(Math.random() * 30 + 15),
      sleep: Math.floor(Math.random() * 35 + 15),
      hygiene: Math.floor(Math.random() * 20 + 75),
      social: Math.floor(Math.random() * 30 + 60),
      fun: Math.floor(Math.random() * 40 + 50),
      comfort: Math.floor(Math.random() * 30 + 60),
      physicalHealth: Math.floor(Math.random() * 25 + 75),
      emotionalHealth: Math.floor(Math.random() * 35 + 60),
      homesickness: Math.floor(Math.random() * 40 + 20),
    },
    states: {
      mood: initialMood,
      stress: Math.floor(Math.random() * 35 + 15),
      energy: initialStamina,
      motivation: Math.floor(Math.random() * 25 + 75),
      confidence: Math.floor(Math.random() * 30 + 65),
    },
    skills: {
      strength: Math.floor(Math.random() * 45 + 50),
      endurance: Math.floor(Math.random() * 45 + 50),
      agility: Math.floor(Math.random() * 45 + 50),
      memory: Math.floor(Math.random() * 45 + 50),
      logic: Math.floor(Math.random() * 45 + 50),
      aim: Math.floor(Math.random() * 45 + 50),
      teamwork: Math.floor(Math.random() * 40 + 55),
      animalCare: Math.floor(Math.random() * 50 + 40),
    },
    strategy: {
      goal: Math.random() > 0.5 ? 'vencer' : 'ganhar-seguidores',
      boldness: Math.floor(Math.random() * 40 + 50),
      riskTolerance: Math.floor(Math.random() * 45 + 45),
      trustedAllyIds: [],
    },
    memories: [],
    stats: {
      popularity: initialPopularity,
      stamina: initialStamina,
      mood: initialMood,
      hunger: 20,
      sleep: 20,
      hygiene: 85,
      social: 75,
    },
    deltas: { popularity: 0, stamina: 0, mood: 0 },
    currentRoom: rooms[Math.floor(Math.random() * rooms.length)],
    currentActivity: 'Conversando no jardim sobre as primeiras impressões da casa',
    currentDialogue: 'Vim pra viver isso intensamente e não me arrependo de nada!',
    isPerformingAction: true,
    isLeader: false,
    isImmune: false,
    isCastigo: false,
    isVIP: Math.random() > 0.5,
    isNominated: false,
    isEliminated: false,
  };
}

export function generateCustomCast(count: number = 20): Participant[] {
  return Array.from({ length: count }, (_, idx) => generateRandomParticipant(`hm-${idx + 1}`));
}
