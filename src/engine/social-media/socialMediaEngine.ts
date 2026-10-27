/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SocialPost {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatarBg: string;
  isVerified?: boolean;
  content: string;
  hashtags: string[];
  likes: number;
  retweets: number;
  timeAgo: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface GossipHeadline {
  id: string;
  portalName: string;
  portalBadgeColor: string;
  title: string;
  subtitle: string;
  views: number;
  publishedAgo: string;
  impactScore: number;
}

export const INITIAL_POSTS: SocialPost[] = [
  {
    id: 'post-1',
    authorName: 'Central de Fofoca 👁️',
    authorHandle: '@centralrealitybr',
    authorAvatarBg: 'bg-cyan-600',
    isVerified: true,
    content:
      '🚨 URGENTE: O clima pesou na cozinha! Teve indireta sobre quem comeu mais pão na Xepa e o Líder já prometeu que não perdoa no Paredão de domingo! #BBB26 #TretaNoQuarto',
    hashtags: ['#BBB26', '#TretaNoQuarto'],
    likes: 42100,
    retweets: 8900,
    timeAgo: 'há 12 min',
    sentiment: 'negative',
  },
  {
    id: 'post-2',
    authorName: 'Fandom dos Cactos 🌵',
    authorHandle: '@fandomoficial',
    authorAvatarBg: 'bg-emerald-600',
    isVerified: false,
    content:
      'Gente, nosso protegido foi o único que lavou a louça toda hoje de manhã enquanto os outros tavam roncando! Merece imunidade eterna! 👑✨ #FicaGuilherme #MutiraoFirme',
    hashtags: ['#FicaGuilherme', '#MutiraoFirme'],
    likes: 67300,
    retweets: 15400,
    timeAgo: 'há 24 min',
    sentiment: 'positive',
  },
  {
    id: 'post-3',
    authorName: 'Tadeu Irônico',
    authorHandle: '@tadeuironico',
    authorAvatarBg: 'bg-purple-600',
    isVerified: true,
    content:
      'A cara do Boninho vendo os participantes jurando que tão arrasando na estratégia sendo que a internet inteira já sacou o jogo kkkkkkkk cinema puro! 🍿🎥',
    hashtags: ['#BBB26', '#CinemaPuro'],
    likes: 31200,
    retweets: 5200,
    timeAgo: 'há 45 min',
    sentiment: 'neutral',
  },
  {
    id: 'post-4',
    authorName: 'Cancelômetro ⚡',
    authorHandle: '@cancelometro_tv',
    authorAvatarBg: 'bg-rose-600',
    isVerified: false,
    content:
      'ALERTA DE CANCELAMENTO: Taxa de rejeição do grupo da varanda acabou de bater 78% na nossa enquete com 500 mil votos! Se bater no Paredão, sai de limousine! 📉 #ParedaoBBB',
    hashtags: ['#ParedaoBBB'],
    likes: 89400,
    retweets: 19800,
    timeAgo: 'há 1h',
    sentiment: 'negative',
  },
];

export const INITIAL_HEADLINES: GossipHeadline[] = [
  {
    id: 'head-1',
    portalName: 'Choquei do Reality',
    portalBadgeColor: 'bg-amber-500 text-black',
    title: 'Madrugada de gritaria e alianças quebradas faz Ibope do reality bater pico de 35 pontos!',
    subtitle: 'Direção do programa precisou intervir com aviso sonoro após troca de acusações na sala.',
    views: 1420000,
    publishedAgo: 'há 35 min',
    impactScore: 95,
  },
  {
    id: 'head-2',
    portalName: 'Notícias da TV',
    portalBadgeColor: 'bg-blue-600 text-white',
    title: 'Comercial milionário e cotas esgotadas: emissora fatura alto com temporada histórica',
    subtitle: 'Marcas comemoram alta retenção de público no horário nobre e engajamento recorde na internet.',
    views: 890000,
    publishedAgo: 'há 2h',
    impactScore: 88,
  },
  {
    id: 'head-3',
    portalName: 'Leo Bastidores',
    portalBadgeColor: 'bg-rose-600 text-white',
    title: 'Exclusivo: Participante ameaça apertar botão de desistência após veto da Prova do Líder',
    subtitle: 'Equipe de psicólogos e direção geral atuam nos bastidores para reverter o pedido.',
    views: 2100000,
    publishedAgo: 'há 4h',
    impactScore: 98,
  },
];

export function generateDynamicSocialFeed(currentIbope: number, conflictsCount: number): SocialPost[] {
  const dynamicTag = conflictsCount > 0 ? '#TretaDoDia' : '#PazNaCasa';
  const dynamicPosts: SocialPost[] = [
    {
      id: `post-gen-${Date.now()}`,
      authorName: 'Radar dos Famosos',
      authorHandle: '@radardosfamosos',
      authorAvatarBg: 'bg-indigo-600',
      isVerified: true,
      content: `O IBOPE está marcando ${currentIbope.toFixed(1)} pontos ao vivo! O diretor tá entregando puro entretenimento nessa temporada! 🔥 ${dynamicTag} #AudienciaRecorde`,
      hashtags: [dynamicTag, '#AudienciaRecorde'],
      likes: Math.round(currentIbope * 2100),
      retweets: Math.round(currentIbope * 450),
      timeAgo: 'agora mesmo',
      sentiment: 'positive',
    },
    ...INITIAL_POSTS,
  ];
  return dynamicPosts;
}
