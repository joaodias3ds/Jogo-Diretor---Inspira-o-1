/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGameStore } from '@/app/useGameStore';
import { useAppStore } from '@/app/useAppStore';
import { Participant } from '@/engine/housemates/types';
import {
  SocialPost,
  GossipHeadline,
  INITIAL_POSTS,
  INITIAL_HEADLINES,
  generateDynamicSocialFeed,
} from '@/engine/social-media/socialMediaEngine';
import { generateAILiveSocialPost } from '@/engine/ai/geminiService';
import { ParticipantSocialDossierModal } from '@/ui/screens/ParticipantSocialDossierModal';
import { Button } from '@/ui/components/Button';
import { Card } from '@/ui/components/Card';
import { Badge } from '@/ui/components/Badge';
import {
  MessageSquare,
  Repeat,
  Heart,
  Share2,
  TrendingUp,
  Flame,
  Award,
  Sparkles,
  ExternalLink,
  CheckCircle,
  Eye,
  Bot,
  Filter,
  Users,
} from 'lucide-react';
import { soundFx } from '@/audio/audioManager';

export const SocialMediaFeedScreen: React.FC = () => {
  const { ibope, conflicts, time, cast } = useGameStore();
  const { addToast } = useAppStore();

  const [posts, setPosts] = useState<SocialPost[]>(generateDynamicSocialFeed(ibope, conflicts.length));
  const [headlines, setHeadlines] = useState<GossipHeadline[]>(INITIAL_HEADLINES);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isGeneratingAiPost, setIsGeneratingAiPost] = useState(false);
  const [selectedParticipantForDossier, setSelectedParticipantForDossier] = useState<Participant | null>(null);

  const activeCast = cast.filter((p) => !p.isEliminated);

  const trendingTags = [
    { tag: '#BBB26', tweets: '184.5k tweets', rank: 1 },
    { tag: '#TretaNoAoVivo', tweets: '122.2k tweets', rank: 2 },
    { tag: '#FogoNoParquinho', tweets: '94.0k tweets', rank: 3 },
    { tag: '#CancelamentoTotal', tweets: '71.3k tweets', rank: 4 },
    { tag: '#SincerãoHistórico', tweets: '58.8k tweets', rank: 5 },
  ];

  const handleLikePost = (id: string) => {
    soundFx.playClick();
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  const handleRetweet = (id: string) => {
    soundFx.playClick();
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, retweets: p.retweets + 1 } : p))
    );
    addToast('info', 'Post Retweetado!', 'Engajamento nas redes aumentado.');
  };

  const handleGenerateAiTweet = async () => {
    soundFx.playClick();
    setIsGeneratingAiPost(true);
    try {
      const conflictNote = conflicts[0]?.description || 'discussão ácida na cozinha da xepa';
      const aiPost = await generateAILiveSocialPost(activeCast, conflictNote);

      const newSocialPost: SocialPost = {
        id: `ai-post-${Date.now()}`,
        authorName: aiPost.authorName,
        authorHandle: aiPost.authorHandle,
        authorAvatarBg: 'bg-purple-600',
        content: aiPost.text,
        timeAgo: 'Agora mesmo',
        likes: Math.floor(Math.random() * 2500 + 450),
        retweets: Math.floor(Math.random() * 850 + 120),
        hashtags: aiPost.hashtags,
        isVerified: aiPost.isVerified,
        sentiment: aiPost.sentiment,
      };

      setPosts((prev) => [newSocialPost, ...prev]);
      soundFx.playOnAirChime();
      addToast(
        'success',
        'Novo Tweet Gerado via IA (Gemini)!',
        `Reação orgânica adicionada ao feed: "${aiPost.text.substring(0, 50)}..."`
      );
    } catch {
      addToast('error', 'Falha ao Gerar Tweet', 'Erro na conexão com IA.');
    } finally {
      setIsGeneratingAiPost(false);
    }
  };

  const filteredPosts = selectedTag
    ? posts.filter((p) => p.hashtags.includes(selectedTag))
    : posts;

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
      {/* 1. Header do Feed 24h & Geração por IA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs font-mono">
            <span className="text-purple-400 font-bold tracking-wider">REDE SOCIAL VIRTUAL</span>
            <span className="text-slate-600">·</span>
            <Badge variant="live" pulse size="sm">24H AO VIVO</Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Flame className="text-purple-400" size={26} />
            Reality Buzz: Feed em Tempo Real & Análise de Fandoms
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitore o termômetro do sofá e do Twitter/X. Use IA (Gemini) para gerar posts hiper-realistas e inspecione dossiês profundos dos participantes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="cyber"
            size="md"
            onClick={handleGenerateAiTweet}
            isLoading={isGeneratingAiPost}
            leftIcon={<Bot size={16} />}
          >
            Gerar Post via IA (Gemini)
          </Button>
        </div>
      </div>

      {/* 2. Grid de Telemetria das Redes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card glow="amber">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-purple-400 uppercase font-bold flex items-center gap-1.5">
              <TrendingUp size={14} /> Velocidade Viral
            </span>
            <span className="text-emerald-400 font-bold">ALTA</span>
          </div>
          <div className="text-2xl font-black font-mono text-white mt-1">
            96.4k <span className="text-xs font-normal text-slate-400">menções/min</span>
          </div>
        </Card>

        <Card glow="cyan">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-cyan-400 uppercase font-bold flex items-center gap-1.5">
              <Heart size={14} /> Sentimento do Sofá
            </span>
            <span className="text-cyan-300 font-bold">58% Favorável</span>
          </div>
          <div className="text-2xl font-black font-mono text-cyan-300 mt-1">
            Amor & Torcida
          </div>
        </Card>

        <Card glow="amber">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-amber-400 uppercase font-bold flex items-center gap-1.5">
              <Flame size={14} /> Cancelômetro Ativo
            </span>
            <span className="text-amber-400 font-bold">MODERADO</span>
          </div>
          <div className="text-2xl font-black font-mono text-amber-300 mt-1">
            2 Alvos na Berlinda
          </div>
        </Card>
      </div>

      {/* 3. Bar de Acesso Rápido a Dossiês dos Participantes */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
        <span className="text-xs font-mono text-slate-400 uppercase font-bold flex items-center gap-1.5">
          <Users size={14} className="text-cyan-400" />
          Análise Profunda & Dossiê de Redes por Participante:
        </span>
        <div className="flex flex-wrap gap-2">
          {activeCast.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                soundFx.playClick();
                setSelectedParticipantForDossier(p);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 hover:border-cyan-500 text-xs text-slate-200 transition-colors"
            >
              <div
                className={`w-4 h-4 rounded-full bg-gradient-to-tr ${p.avatarColor} text-[8px] font-bold text-white flex items-center justify-center`}
              >
                {p.nickname.substring(0, 1)}
              </div>
              <span className="font-semibold">{p.nickname}</span>
              <span className="text-[10px] text-cyan-400 font-mono">({p.charisma ?? 70}c / {p.controversy ?? 50}t)</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Layout Dividido: Feed Principal (2 colunas) e Trending Topics (1 coluna) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna do Feed (2 Colunas) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Filtrando por:</span>
              {selectedTag ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-xs border border-purple-800">
                  {selectedTag}
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="hover:text-white ml-1 font-bold"
                  >
                    ×
                  </button>
                </span>
              ) : (
                <span className="text-xs font-mono text-slate-300">Todos os posts ao vivo</span>
              )}
            </div>
            <span className="text-xs font-mono text-slate-500">{filteredPosts.length} tweets</span>
          </div>

          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-purple-900/60 border border-purple-500/30 flex items-center justify-center text-sm font-bold text-purple-200">
                      {post.authorName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-sm font-bold text-white">{post.authorName}</strong>
                        {post.isVerified && (
                          <CheckCircle size={14} className="text-cyan-400 fill-cyan-400/20" />
                        )}
                        <span className="text-xs text-slate-400 font-mono">{post.authorHandle}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{post.timeAgo}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                      post.sentiment === 'positive'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                        : post.sentiment === 'negative'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800/40'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {post.sentiment}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{post.content}</p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {post.hashtags.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedTag(h)}
                      className="text-xs font-mono text-purple-400 hover:text-purple-300 hover:underline"
                    >
                      {h}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className="flex items-center gap-1.5 hover:text-rose-400 transition-colors"
                    >
                      <Heart size={14} className="hover:fill-rose-500/20" />
                      <span>{post.likes.toLocaleString()}</span>
                    </button>

                    <button
                      onClick={() => handleRetweet(post.id)}
                      className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                    >
                      <Repeat size={14} />
                      <span>{post.retweets.toLocaleString()}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      const mentioned = activeCast.find((p) =>
                        post.content.toLowerCase().includes(p.nickname.toLowerCase())
                      );
                      if (mentioned) {
                        setSelectedParticipantForDossier(mentioned);
                      } else {
                        setSelectedParticipantForDossier(activeCast[0] || null);
                      }
                    }}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
                  >
                    <Eye size={12} /> Dossiê do Participante
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna Direita: Trending Topics & Portais de Fofoca (1 Coluna) */}
        <div className="space-y-4">
          {/* Trending Topics */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <TrendingUp className="text-purple-400" size={16} />
              Assuntos Mais Comentados (Trending)
            </h3>
            <div className="space-y-2.5">
              {trendingTags.map((item) => (
                <div
                  key={item.tag}
                  onClick={() => setSelectedTag(item.tag)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 hover:bg-slate-950 border border-slate-800/80 cursor-pointer transition-colors"
                >
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono">#{item.rank} · No Brasil</span>
                    <h5 className="font-bold text-xs text-purple-300">{item.tag}</h5>
                    <span className="text-[10px] text-slate-400 font-mono">{item.tweets}</span>
                  </div>
                  <Flame size={14} className="text-purple-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Manchetes dos Portais de Notícia */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Award className="text-amber-400" size={16} />
              Manchetes dos Portais
            </h3>
            <div className="space-y-2">
              {headlines.map((hl) => (
                <div
                  key={hl.id}
                  className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-amber-400 font-bold">{hl.portalName}</span>
                    <span className="text-slate-500">{hl.publishedAgo}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200">{hl.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dossiê de Análise do Participante via IA */}
      <ParticipantSocialDossierModal
        participant={selectedParticipantForDossier}
        onClose={() => setSelectedParticipantForDossier(null)}
        onPostGenerated={(newTweet) => {
          setPosts((prev) => [
            {
              id: `ai-tweet-${Date.now()}`,
              authorName: newTweet.authorName,
              authorHandle: newTweet.authorHandle,
              authorAvatarBg: 'bg-purple-600',
              content: newTweet.text,
              timeAgo: 'Agora mesmo',
              likes: Math.floor(Math.random() * 1500 + 300),
              retweets: Math.floor(Math.random() * 450 + 80),
              hashtags: newTweet.hashtags,
              isVerified: newTweet.isVerified,
              sentiment: newTweet.sentiment,
            },
            ...prev,
          ]);
        }}
      />
    </div>
  );
};
