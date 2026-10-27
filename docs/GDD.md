# Game Design Document (GDD) — Diretor do Reality

## 1. Visão Geral do Jogo
- **Título Provisório:** Diretor do Reality
- **Gênero:** Gerenciador de Reality Show / Simulador Estratégico de Bastidores / Vida Artificial (Utility AI)
- **Plataforma:** Web (Desktop First, responsivo para tablet)
- **Idioma:** Português do Brasil (PT-BR)
- **Inspiração:** Mistura de dinâmicas de confinamento (estilo Big Brother Brasil) e vida rural (estilo A Fazenda), com o jogador assumindo exclusivamente a cadeira do Diretor Geral da Atração (estilo "Boninho / Carelli").

## 2. Pilares de Design
1. **O Poder dos Bastidores:** Cada decisão de prova, punição, dinâmica, edição do dia e manipulação de narrativa altera o jogo na casa e na recepção popular.
2. **Participantes Vivos e Autônomos:** Não são peões mecânicos; possuem personalidades (Big Five + traços), necessidades fisiológicas e psicológicas (0-100), matriz de afinidades dinâmicas e memórias de fatos marcantes.
3. **Plateia de IA & Audiência como Placar:** A votação e o ibope reagem ao que foi levado ao ar pelo diretor. A plateia virtual possui segmentos com opiniões contrastantes.
4. **Interface Control Room / Streaming:** Estilo limpo, sombrio e futurista, com mosaicos de câmeras, monitores de áudio, gráficos de audiência e telemetria dos participantes.
5. **Rejogabilidade & Carreira:** Várias temporadas, desafios de emissora, reputação e modo Diretor-Deus.

## 3. Modos de Reality Show
- **Casa (Confinamento Urbano):** Mansão fechada, piscina, confessionário, quarto do líder, VIP vs Xepa, festas temáticas.
- **Fazenda (Vida Rural):** Sede, baias, curral, trato com animais, ordenha, horta, eliminação na fogueira (Roça).
- **Híbrido:** Integração dos dois mundos, quartos isolados, intercâmbios e dinâmicas duplas.

## 4. O Papel do Diretor
- **Economia:** Administra Caixa da Emissora ($), Ibope (pontos), Reputação (0-100) e Autoridade (pontos para intervenções drásticas).
- **Programação Semanal:**
  - Seg-Qua: Convivência, Alianças, Jogo da Discórdia, Duelo.
  - Qui: Prova do Líder / Fazendeiro.
  - Sex: Prova do Anjo / Imunidade / Compras e Ração.
  - Sáb: Grande Festa / Ação de Patrocinador.
  - Dom: Programa ao Vivo, Formação de Paredão / Roça e Eliminação.
- **Ilha de Edição:** Seleção de takes e montagem do pacote diário levado ao ar (enfatizar romances, queimar vilões, dramatizar brigas).

## 5. Arquitetura Modular
- **Engine Pura (`/src/engine`):** Totalmente desacoplada da interface e de renderizadores (independente de React e Three.js), permitindo testes rápidos de balanceamento e simulação em batch.
- **Camada de UI (`/src/ui`):** Componentes React, stores Zustand, Tailwind CSS v4, Motion e Lucide icons.
- **Camada 3D (`/src/world3d`):** Representação visual da casa e fazenda, câmeras de vigilância e arenas de prova.
