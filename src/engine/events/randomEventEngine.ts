/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Participant } from '@/engine/housemates/types';
import { RandomEvent, RandomEventCategory, RandomEventOption } from './randomEventTypes';

export function generateRandomEvent(
  cast: Participant[],
  forcedCategory?: RandomEventCategory
): RandomEvent {
  const activeCast = cast.filter((p) => !p.isEliminated);
  const p1 = activeCast[Math.floor(Math.random() * activeCast.length)] || cast[0];
  const remaining = activeCast.filter((p) => p.id !== p1.id);
  const p2 = remaining[Math.floor(Math.random() * remaining.length)] || p1;
  const p3 = remaining.filter((p) => p.id !== p2.id)[0] || p1;

  const categories: RandomEventCategory[] = ['conflito', 'romance', 'desafio_surpresa'];
  const category = forcedCategory || categories[Math.floor(Math.random() * categories.length)];

  if (category === 'conflito') {
    const conflictTemplates = [
      {
        title: '🔥 Guerra da Comida: O Escândalo do Leite Condensado',
        headline: `GRAVE: ${p1.nickname} acusa ${p2.nickname} de esconder comida na Xepa!`,
        description: `${p1.nickname} pegou ${p2.nickname} comendo o último pote de leite condensado escondido atrás da despensa. A discussão explodiu e a casa inteira correu para a cozinha!`,
        location: 'Cozinha da Xepa',
        ibopeImpact: 2.8,
        socialBuzzScore: 145000,
        options: [
          {
            id: 'opt-close-conflito',
            label: 'Corte em Close no Horário Nobre (+Audiência Máxima)',
            description: 'Explora o bate-boca com repetição em câmera lenta e sonoplastia de panelaço.',
            ibopeDelta: +3.2,
            cashDelta: +15000,
            authorityDelta: -2,
            reputationDelta: -3,
            socialBuzzText: '#GuerraDoLeiteCondensado atinge topo dos Trending Topics mundiais!',
            actionLog: `Direção colocou as câmeras 1 e 2 no confronto entre ${p1.nickname} e ${p2.nickname}. Audiência disparou!`,
          },
          {
            id: 'opt-pacificar-conflito',
            label: 'Punição Coletiva de Estalecas / Alerta da Direção',
            description: 'Voz do Diretor intervém na casa: -500 estalecas para todo mundo por desrespeito às regras.',
            ibopeDelta: +1.4,
            cashDelta: -5000,
            authorityDelta: +5,
            reputationDelta: +4,
            socialBuzzText: 'Público elogia a autoridade da direção contra o caos na casa.',
            actionLog: `A Direção aplicou punição de estalecas geral. Os ânimos esfriaram temporariamente.`,
          },
          {
            id: 'opt-alimentar-conflito',
            label: 'Jogo da Discórdia Relâmpago na Sala',
            description: 'O apresentador entra ao vivo agora para obrigar os dois a debaterem na frente do Brasil.',
            ibopeDelta: +4.0,
            cashDelta: +25000,
            authorityDelta: +3,
            reputationDelta: -5,
            socialBuzzText: 'Recorde absoluto de menções: a internet pede eliminação dupla!',
            actionLog: `Entrada ao vivo surpresa do apresentador! O confronto virou o ponto alto da semana.`,
          },
        ],
      },
      {
        title: '⚡ Conspiração Revelada: Fofoca de Quarto Flagrada',
        headline: `FLAGRA: ${p1.nickname} escuta plano secreto de votos de ${p2.nickname}!`,
        description: `${p1.nickname} fingiu dormir debaixo do edredom enquanto ${p2.nickname} e aliados montavam a estratégia para emparedar o grupo rival. A bomba estourou na piscina!`,
        location: 'Quarto Selva / Varanda',
        ibopeImpact: 2.5,
        socialBuzzScore: 120000,
        options: [
          {
            id: 'opt-revelar-vt',
            label: 'Exibir o VT com Áudio Amplificado no Pay-Per-View',
            description: 'Liberar as gravações noturnas com legendas destacadas em amarelo na tela.',
            ibopeDelta: +2.8,
            cashDelta: +10000,
            authorityDelta: 0,
            reputationDelta: +2,
            socialBuzzText: 'Fãs gravam o trecho e criam cortes virais no TikTok com 5 milhões de views.',
            actionLog: `Áudio com legendas exibido para os assinantes. O grupo de ${p1.nickname} já sabe de tudo!`,
          },
          {
            id: 'opt-abafar',
            label: 'Guardar Segredo Exclusivo para o Domingo',
            description: 'Segurar o material para explodir no bloco de votação ao vivo.',
            ibopeDelta: +1.8,
            cashDelta: 0,
            authorityDelta: +2,
            reputationDelta: 0,
            socialBuzzText: 'Expectativa absurda para o programa de domingo à noite.',
            actionLog: `Material retido para a edição do domingo de paredão.`,
          },
        ],
      },
    ];
    const picked = conflictTemplates[Math.floor(Math.random() * conflictTemplates.length)];
    return {
      id: `event-${Date.now()}`,
      category: 'conflito',
      title: picked.title,
      headline: picked.headline,
      description: picked.description,
      location: picked.location,
      involvedParticipantIds: [p1.id, p2.id],
      involvedParticipantNames: [p1.nickname, p2.nickname],
      ibopeImpact: picked.ibopeImpact,
      socialBuzzScore: picked.socialBuzzScore,
      options: picked.options,
      timestamp: 'Agora Mesmo',
    };
  }

  if (category === 'romance') {
    const romanceTemplates = [
      {
        title: '❤️ Clima Quente no Edredom: O Primeiro Beijo da Casa',
        headline: `AMOR NO AR: ${p1.nickname} e ${p2.nickname} se beijam na madrugada!`,
        description: `Após a última festa com coolers liberados, ${p1.nickname} e ${p2.nickname} dividiram a mesma cama e trocaram beijos apaixonados sob movimentação intensa do edredom.`,
        location: 'Quarto do Líder / Oceano',
        ibopeImpact: 2.4,
        socialBuzzScore: 180000,
        options: [
          {
            id: 'opt-shippar',
            label: 'Campanha Oficial de Casal nas Redes ("Shipper")',
            description: 'A emissora lança hashtag oficial do casal e coloca trilha sonora romântica nos VTs.',
            ibopeDelta: +2.6,
            cashDelta: +20000,
            authorityDelta: 0,
            reputationDelta: +5,
            socialBuzzText: 'Fandoms se unem e hashtag do casal passa de 1 milhão de tweets!',
            actionLog: `O casal ${p1.nickname} e ${p2.nickname} foi oficializado na edição. O sofá amou!`,
          },
          {
            id: 'opt-ciumes',
            label: 'Explorar Ciúmes de Rivais e Ex-Casais',
            description: 'Cortar para as reações de descontentamento de outros moradores da casa.',
            ibopeDelta: +3.0,
            cashDelta: +15000,
            authorityDelta: -1,
            reputationDelta: -2,
            socialBuzzText: 'Debate frenético sobre triângulo amoroso e traição de amizades!',
            actionLog: `Foco total nos olhares de ciúmes e indiretas na cozinha.`,
          },
          {
            id: 'opt-discreto',
            label: 'Tratar com Naturalidade e Respeito',
            description: 'Manter a discrição sem forçar o romance na narrativa central.',
            ibopeDelta: +1.0,
            cashDelta: +5000,
            authorityDelta: +3,
            reputationDelta: +6,
            socialBuzzText: 'Público elogia a emissora por não ser sensacionalista.',
            actionLog: `Romance coberto com sobriedade no resumo matinal.`,
          },
        ],
      },
      {
        title: '💔 DR Romântica e Crise de Ciúmes na Piscina',
        headline: `DESENTENDIMENTO: ${p1.nickname} chora após cobrança de ${p2.nickname}!`,
        description: `${p2.nickname} não gostou de ver ${p1.nickname} conversando em tom íntimo com ${p3.nickname} durante a madrugada e disparou duras cobranças ao lado da piscina.`,
        location: 'Borda da Piscina',
        ibopeImpact: 2.1,
        socialBuzzScore: 110000,
        options: [
          {
            id: 'opt-vitima-dr',
            label: 'Vitimização na Edição (Arco de Superação)',
            description: 'Exibir lágrimas em primeiro plano com trilha acústica.',
            ibopeDelta: +2.2,
            cashDelta: +12000,
            authorityDelta: 0,
            reputationDelta: +2,
            socialBuzzText: 'Torcida se mobiliza para proteger o participante no próximo paredão!',
            actionLog: `A DR foi exibida com foco na dor de ${p1.nickname}.`,
          },
          {
            id: 'opt-cortar-clima',
            label: 'Mandar Cooler de Bebidas para Relaxar o Clima',
            description: 'Enviar aperitivos para a hidromassagem e desanuviar os ânimos.',
            ibopeDelta: +1.2,
            cashDelta: -8000,
            authorityDelta: +1,
            reputationDelta: +3,
            socialBuzzText: 'Clima descontraído volta a reinar na área externa.',
            actionLog: `Cooler entregue pelos dummies. A crise foi contornada em risadas.`,
          },
        ],
      },
    ];
    const picked = romanceTemplates[Math.floor(Math.random() * romanceTemplates.length)];
    return {
      id: `event-${Date.now()}`,
      category: 'romance',
      title: picked.title,
      headline: picked.headline,
      description: picked.description,
      location: picked.location,
      involvedParticipantIds: [p1.id, p2.id],
      involvedParticipantNames: [p1.nickname, p2.nickname],
      ibopeImpact: picked.ibopeImpact,
      socialBuzzScore: picked.socialBuzzScore,
      options: picked.options,
      timestamp: 'Agora Mesmo',
    };
  }

  // Categoria: Desafio Surpresa / Dinâmica Relâmpago
  const surpriseTemplates = [
    {
      title: '☎️ O Big Fone Tocou! Corrida Desesperada no Jardim',
      headline: `URGENTE: ${p1.nickname} atendeu ao temido Big Fone da casa!`,
      description: `O alarme ensurdecedor disparou no meio da tarde. Em disparada épica, ${p1.nickname} pulou por cima do sofá da varanda e atendeu ao telefone! A mensagem da Direção deve ser executada imediatamente.`,
      location: 'Jardim / Big Fone',
      ibopeImpact: 3.5,
      socialBuzzScore: 240000,
      options: [
        {
          id: 'opt-emparedar-rival',
          label: 'Ordem: Indicar um Rival Direto ao Paredão!',
          description: `${p1.nickname} precisa colocar a pulseira vermelha em alguém na frente de todos.`,
          ibopeDelta: +4.2,
          cashDelta: +30000,
          authorityDelta: +4,
          reputationDelta: +3,
          socialBuzzText: 'Choque total na casa! A internet vibra com a reviravolta no jogo.',
          actionLog: `${p1.nickname} atendeu ao Big Fone e indicou ${p2.nickname} direto ao Paredão!`,
        },
        {
          id: 'opt-imunidade-surpresa',
          label: 'Ordem: Autoimunidade Secreta!',
          description: `${p1.nickname} ganha imunidade surpresa e não pode ser votado esta semana.`,
          ibopeDelta: +2.5,
          cashDelta: +15000,
          authorityDelta: +2,
          reputationDelta: +4,
          socialBuzzText: 'Estratégias de todos os quartos destruídas com a imunidade repentina!',
          actionLog: `${p1.nickname} garantiu a imunidade da semana ao atender o Big Fone.`,
        },
        {
          id: 'opt-quarto-branco',
          label: 'Ordem: Quarto Branco Imediato com 2 Rivais!',
          description: `${p1.nickname} e ${p2.nickname} são levados para o temido quarto branco até um desistir no botão.`,
          ibopeDelta: +5.0,
          cashDelta: +45000,
          authorityDelta: +5,
          reputationDelta: -4,
          socialBuzzText: 'HISTÓRICO: Quarto branco reaberto! Servidores de streaming quase caem.',
          actionLog: `Quarto Branco ativado para ${p1.nickname} e ${p2.nickname}! Audiência no teto histórico.`,
        },
      ],
    },
    {
      title: '📦 A Caixa Misteriosa: Dilema de R$ 50.000 ou Baia/Monstro',
      headline: `DINÂMICA RELÂMPAGO: ${p1.nickname} arrisca abrir a Caixa do Enigma!`,
      description: `Uma caixa preta com contagem regressiva foi deixada no centro da sala pelos Dummies. ${p1.nickname} aceitou o desafio de abri-la diante dos olhares aflitos dos companheiros.`,
      location: 'Sala de Estar',
      ibopeImpact: 2.7,
      socialBuzzScore: 160000,
      options: [
        {
          id: 'opt-premio-monstro',
          label: 'Consequência: R$ 30.000 no bolso mas 3 dias no Monstro!',
          description: 'Leva dinheiro para casa mas perde o conforto e vira alvo de votos.',
          ibopeDelta: +3.0,
          cashDelta: -30000,
          authorityDelta: +2,
          reputationDelta: +3,
          socialBuzzText: 'Dilema clássico de reality! O público debate se valeu a pena a ganância.',
          actionLog: `${p1.nickname} embolsou R$ 30k e foi direto vestir o castigo do monstro.`,
        },
        {
          id: 'opt-veto-prova',
          label: 'Consequência: Veto na Próxima Prova do Líder!',
          description: 'Perde o direito de disputar a liderança da semana.',
          ibopeDelta: +2.1,
          cashDelta: 0,
          authorityDelta: +3,
          reputationDelta: +1,
          socialBuzzText: 'Torcida chora o azar de perder a chance de liderança.',
          actionLog: `${p1.nickname} foi vetado da próxima Prova do Líder pela Caixa Misteriosa.`,
        },
      ],
    },
  ];
  const picked = surpriseTemplates[Math.floor(Math.random() * surpriseTemplates.length)];
  return {
    id: `event-${Date.now()}`,
    category: 'desafio_surpresa',
    title: picked.title,
    headline: picked.headline,
    description: picked.description,
    location: picked.location,
    involvedParticipantIds: [p1.id, p2.id],
    involvedParticipantNames: [p1.nickname, p2.nickname],
    ibopeImpact: picked.ibopeImpact,
    socialBuzzScore: picked.socialBuzzScore,
    options: picked.options,
    timestamp: 'Agora Mesmo',
  };
}
