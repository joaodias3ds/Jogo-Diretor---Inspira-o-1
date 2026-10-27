/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Participant } from '@/engine/housemates/types';

// Gemini API Key loaded from environment variable (VITE_GEMINI_API_KEY)
const GEMINI_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
  '';

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

/**
 * Base call to Gemini with timeout and error protection
 */
async function callGemini(prompt: string, maxOutputTokens = 350): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);

    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[Gemini API] HTTP ${response.status}: Falling back to heuristic generator.`);
      return null;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? text.trim() : null;
  } catch (err) {
    console.warn('[Gemini API] Call error or timeout, utilizing heuristic generator:', err);
    return null;
  }
}

/**
 * Generates an authentic reality show live social media post via Gemini
 */
export async function generateAILiveSocialPost(
  housemates: Participant[],
  recentEvent?: string
): Promise<{ authorName: string; authorHandle: string; text: string; hashtags: string[]; isVerified: boolean; sentiment: 'positive' | 'negative' | 'neutral' }> {
  const p1 = housemates[Math.floor(Math.random() * housemates.length)];
  const p2 = housemates.filter((p) => p.id !== p1?.id)[0] || p1;

  const prompt = `Você é um comentarista frenético e viciado em reality show brasileiro (como BBB e A Fazenda) nas redes sociais (Twitter/X).
Gere APENAS um tweet curto (máximo 160 caracteres), muito autêntico em português do Brasil com gírias de reality (tipo 'fogo no parquinho', 'planta', 'craque do jogo', 'cancelado', 'diva', 'protagonista', 'sincerão').
Participante em foco: ${p1?.nickname || 'Participante'} (${p1?.archetype || p1?.temperament || 'Estrategista'}).
Outro participante citado: ${p2?.nickname || 'Rival'}.
Contexto recente: ${recentEvent || 'discussão ácida na cozinha sobre comida e votos'}.

Responda em formato JSON estrito:
{
  "authorName": "Nome do Perfil",
  "authorHandle": "@arroba",
  "text": "conteúdo do tweet",
  "hashtags": ["#Tag1", "#Tag2"],
  "sentiment": "positive" ou "negative" ou "neutral"
}`;

  const geminiResult = await callGemini(prompt, 200);

  if (geminiResult) {
    try {
      const cleanJson = geminiResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        authorName: parsed.authorName || parsed.author || 'Espiadinha 24h',
        authorHandle: parsed.authorHandle || parsed.handle || '@espiadinha_oficial',
        text: parsed.text || `Gente, o ${p1.nickname} tá servindo muito entretenimento hoje! #BBB26`,
        hashtags: parsed.hashtags || ['#RealityShow', `#Team${p1.nickname}`],
        isVerified: Math.random() > 0.4,
        sentiment: parsed.sentiment || 'positive',
      };
    } catch {
      // JSON parse fallback
    }
  }

  // Heuristic Brazilian Reality Social Generator
  const fallbackTemplates = [
    {
      authorName: 'Choquei no Sofá',
      authorHandle: '@choqueisofa',
      text: `GRAVE: ${p1?.nickname} acabou de peitar ${p2?.nickname} na frente de todo mundo! O clima ficou pesadíssimo na casa! 🔥🍿`,
      hashtags: ['#TretaNoAoVivo', `#Fora${p2?.nickname}`, '#FogoNoParquinho'],
      isVerified: true,
      sentiment: 'negative' as const,
    },
    {
      authorName: 'Central Reality 24h',
      authorHandle: '@centralreality24',
      text: `Análise: O ${p1?.nickname} é o maior jogador da temporada até aqui. Estratégia impecável, carisma lá em cima! Craque do jogo.`,
      hashtags: [`#Team${p1?.nickname}`, '#Protagonista', '#BBB26'],
      isVerified: true,
      sentiment: 'positive' as const,
    },
    {
      authorName: 'Comentarista da Madrugada',
      authorHandle: '@madrugadareality',
      text: `A cara que o ${p2?.nickname} fez quando o ${p1?.nickname} falou verdades na cara dele virou meme imediato kkkkk não aguento!`,
      hashtags: ['#Sincerão', '#MemeDoDia', '#Humor'],
      isVerified: false,
      sentiment: 'neutral' as const,
    },
    {
      authorName: 'Doutores do Reality',
      authorHandle: '@doutoresdoreality',
      text: `Cancelômetro disparou! O público não tá engolindo a postura de soberba do ${p2?.nickname}. Se cair no paredão sai com 85%+!`,
      hashtags: ['#Cancelado', '#VencedorDefinido', '#Roça'],
      isVerified: true,
      sentiment: 'negative' as const,
    },
  ];

  const chosen = fallbackTemplates[Math.floor(Math.random() * fallbackTemplates.length)];
  return { ...chosen, isVerified: true };
}

/**
 * Generates an in-depth Director Dossier & Narrative Strategy via Gemini
 */
export async function generateAIDirectorDossier(participant: Participant): Promise<{
  narrativeAngle: string;
  publicPerception: string;
  directorRecommendation: string;
  audienceProjection: string;
  cancelRiskRating: 'Baixo' | 'Médio' | 'Crítico';
}> {
  const prompt = `Você é o Diretor-Geral sênior de um Reality Show de televisão líder de audiência no Brasil (como Boninho no BBB ou Rodrigo Carelli na Fazenda).
Faça um relatório confidencial executivo para a equipe de direção sobre o seguinte confinado:
Nome: ${participant.name} ("${participant.nickname}")
Profissão: ${participant.profession}
Arquétipo: ${participant.archetype || participant.temperament}
Carisma: ${participant.charisma ?? 70}/100
Controvérsia: ${participant.controversy ?? 50}/100
Popularidade Atual: ${participant.stats.popularity}%
Humor: ${participant.stats.mood}/100

Gere um parecer executivo em JSON estrito com as seguintes chaves:
{
  "narrativeAngle": "Qual o melhor enquadramento de edição para a emissora adotar com ele(a)",
  "publicPerception": "Como o público das redes e do sofá enxerga o jogador agora",
  "directorRecommendation": "Conselho prático para a direção de corte (proteger, jogar na fogueira, dar mais tempo de tela)",
  "audienceProjection": "Como a permanência dele afeta o IBOPE nas próximas semanas",
  "cancelRiskRating": "Baixo" ou "Médio" ou "Crítico"
}`;

  const geminiResult = await callGemini(prompt, 380);

  if (geminiResult) {
    try {
      const cleanJson = geminiResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        narrativeAngle: parsed.narrativeAngle || 'Construir arco de redenção ou antagonismo forte.',
        publicPerception: parsed.publicPerception || 'Figura que divide opiniões intensamente entre o sofá e o Twitter.',
        directorRecommendation: parsed.directorRecommendation || 'Aumentar cortes nas conversas noturnas e manter no radar do Sincerão.',
        audienceProjection: parsed.audienceProjection || 'Capacidade de gerar picos de +3.5 pontos de IBOPE se envolvido em conflito direto.',
        cancelRiskRating: parsed.cancelRiskRating || (participant.controversy && participant.controversy > 75 ? 'Crítico' : 'Médio'),
      };
    } catch {
      // JSON parse fallback
    }
  }

  // Heuristic Dossier Generator
  const controversy = participant.controversy ?? 50;
  const charisma = participant.charisma ?? 70;

  let angle = 'Arco de Protagonista Carismático com grande simpatia no sofá.';
  let perception = 'Favorito das tias do sofá e adorado pelas torcidas familiares.';
  let rec = 'Dar tempo de tela nobre e explorar momentos leves no almoço do anjo.';
  let proj = 'Retenção sólida de audiência e atrativo forte para patrocinadores premium.';
  let risk: 'Baixo' | 'Médio' | 'Crítico' = 'Baixo';

  if (controversy >= 70) {
    angle = 'Antagonista Necessário da Temporada (Vilão de Entretenimento).';
    perception = 'Alvo de forte ranço nas redes, mas gera o maior engajamento por minuto do programa.';
    rec = 'Não aliviar na edição: expor as conspirações no resumo diário para ferver a votação.';
    proj = 'Garante picos de 32+ pontos no ao vivo às terças/quintas quando está na berlinda.';
    risk = controversy >= 85 ? 'Crítico' : 'Médio';
  } else if (charisma < 55) {
    angle = 'Planta em Risco de Poda Imediata.';
    perception = 'Público reclama de apatia e falta de posicionamento nos jogos da discórdia.';
    rec = 'Pressionar no Sincerão com perguntas diretas para forçar um posicionamento ou acelerar saída.';
    proj = 'Audiência morna se permanecer até a reta final; convém indicar à berlinda.';
    risk = 'Baixo';
  }

  return {
    narrativeAngle: angle,
    publicPerception: perception,
    directorRecommendation: rec,
    audienceProjection: proj,
    cancelRiskRating: risk,
  };
}
