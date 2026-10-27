# Registro de Decisões de Arquitetura e Design (DECISOES.md)

## Decisão 001 — Separação Estrita de Engine e UI (Fase 0)
- **Status:** Aprovado.
- **Contexto:** O projeto simula vida artificial (20 a 40 participantes com utility AI, relações e memórias) e precisa ser testável sem renderizar DOM ou Three.js.
- **Decisão:** A pasta `/src/engine` não importa nada de `react`, `react-dom`, `@react-three/fiber` ou `three`. O motor expõe classes e funções puras que recebem e retornam estado imutável ou eventos de simulação.

## Decisão 002 — Gerenciamento de Estado com Zustand (Fase 0)
- **Status:** Aprovado.
- **Contexto:** Precisamos de reatividade rápida na UI, controle de modais/telas, desacoplamento e fácil persistência com IndexedDB.
- **Decisão:** Lojas Zustand por domínio (`useAppStore` para telas e navegação, `useGameStore` para estado da temporada/tempo, `useAudioStore`, etc.).

## Decisão 003 — Design System "Control Room / Broadcast Dark" (Fase 0)
- **Status:** Aprovado.
- **Contexto:** A estética do jogo deve evocar uma central de comando de TV moderna com botões táteis, monitores de vídeo, scanlines discretas e tema escuro de alta legibilidade.
- **Decisão:** Paleta escura com base Slate/Navy (#090b10, #0f141f, #161d2c), acentos em Vermelho Gravação ("On Air" #ef4444), Ambar Atenção (#f59e0b) e Ciano Técnico (#06b6d4). Fontes: Plus Jakarta Sans para leitura confortável e JetBrains Mono para códigos, números de audiência e telemetria.

## Decisão 004 — Estrutura de Modos de Reality (Fase 0)
- **Status:** Aprovado.
- **Contexto:** O usuário pode escolher entre Casa (BBB), Fazenda (A Fazenda) ou Híbrido.
- **Decisão:** Configuração unificada via `SeasonConfig` com termos adaptáveis (ex: "Paredão" na Casa vs "Roça" na Fazenda, "Líder" vs "Fazendeiro", "VIP/Xepa" vs "Sede/Baia").

## Decisão 005 — Motor de Tempo Discreto por Fases e Auto-Pausa (Fase 1)
- **Status:** Aprovado.
- **Contexto:** Reality shows possuem momentos de convivência contínua e eventos críticos (Provas, Paredões, Sincerão).
- **Decisão:** Cada dia é dividido em 4 fases (`Manhã`, `Tarde`, `Noite`, `Madrugada`). Eventos chave agendados (`WEEKLY_SCHEDULE`) acionam auto-pausa imediata para intervenção do jogador.

## Decisão 006 — Simulação de Atributos dos Participantes (Fase 1)
- **Status:** Aprovado.
- **Contexto:** O elenco precisa demonstrar vida autônoma e flutuação de energia, popularidade e humor ao longo do tempo.
- **Decisão:** Função pura `simulateCastTick()` calcula desgaste físico, recuperação no sono da madrugada, atritos de convivência, e deltas visuais (↑ / ↓) para a interface `ParticipantList`.

## Decisão 007 — Persistência com Dexie e Repository Pattern (Fase 1)
- **Status:** Aprovado.
- **Contexto:** O jogo precisa salvar temporadas no navegador do jogador de forma resiliente e permitir exportação/importação.
- **Decisão:** IndexedDB implementado via Dexie sob a interface `ISeasonRepository`. Garante autosave a cada avanço de fase e save manual explícito.

## Decisão 008 — Modelo Psicológico e Biológico Profundo de Participantes (Fase 2)
- **Status:** Aprovado.
- **Contexto:** Participantes precisam de traços psicológicos multidimensionais para reações orgânicas na convivência e nas provas.
- **Decisão:** Implementação de Big Five (Abertura, Conscienciosidade, Extroversão, Amabilidade, Neuroticismo), 9 necessidades fisiológicas/emocionais (fome, sono, higiene, social, diversão, conforto, saúde física, saúde emocional, saudade de casa) e skills de competição.

## Decisão 009 — Utility AI Desacoplada para Ações e Falas (Fase 2)
- **Status:** Aprovado.
- **Contexto:** A inteligência utilitária deve rodar rápido no motor TypeScript sem depender de chamadas síncronas de rede ou LLM.
- **Decisão:** `utilityAI.ts` calcula utilidade matemática para ações (dormir, comer, banho, academia, resenha, fofoca, discutir, confessionário) e seleciona falas brasileiras autênticas por temperamento.

## Decisão 010 — Monitoramento Compacto em Picture-in-Picture (PiP) (Fase 2)
- **Status:** Aprovado.
- **Contexto:** O diretor de TV precisa monitorar cômodos específicos sem cobrir todo o dashboard da ilha de produção.
- **Decisão:** Janela flutuante Picture-in-Picture (`CameraPipModal`) com scanlines CRT, visão noturna infravermelha, VU meter de decibéis de áudio e lista de ocupantes em tempo real.

## Decisão 011 — Matriz Direcionada de Relações e Classificação Dinâmica (Fase 3)
- **Status:** Aprovado.
- **Contexto:** Cada relação na casa é assimétrica (A pode ter atração por B sem que B retribua, ou A pode considerar B rival enquanto B o considera neutro).
- **Decisão:** A matriz de relações armazena dados orientados `sourceId -> targetId` com 6 dimensões (`affinity`: -100..100, `trust`: 0..100, `respect`: 0..100, `attraction`: 0..100, `rivalry`: 0..100, `favorDebt`: -100..100) e classifica dinamicamente o status em `aliado`, `rival`, `amigo`, `romance`, `desafeto` ou `neutro`.

## Decisão 012 — Simulação Orgânica de Conflitos e Coesão de Alianças (Fase 3)
- **Status:** Aprovado.
- **Contexto:** Conflitos e rachas de grupo precisam surgir autonomamente a partir do estresse, convivência em cômodos e compatibilidade de traços, sem scripts engessados.
- **Decisão:** `simulateSocialTick()` agrupa moradores por cômodo; se moradores com afinidade negativa acumularem estresse (>60%), eclodem eventos de conflito (`climão`, `discussão`, `barraco`) com temas realistas de reality (comida, voto, tarefas, fofoca). Alianças sofrem decaimento de coesão quando a média interna de afinidade cai, rachando (`isBroken: true`) quando coesão < 25%.

## Decisão 013 — Mapa Social e Constelação Interativa na UI do Diretor (Fase 3)
- **Status:** Aprovado.
- **Contexto:** O jogador como diretor precisa inspecionar visualmente a teia de alianças e tensões da casa para planejar provas, dinâmicas e edição.
- **Decisão:** `SocialMapScreen` fornece navegação por nó selecionável com badges de grupo, filtros rápidos (Alianças, Rivalidades, Romances), medidor de coesão das alianças com alerta de racha, feed de tretas e ticker de fofocas ativas.

## Decisão 014 — Mundo 3D da Casa Procedural e Câmeras Reality (Fase 4)
- **Status:** Aprovado.
- **Contexto:** O jogador precisa visualizar os participantes agindo em 3D em tempo real na casa, com iluminação que acompanha o ciclo do dia (manhã, tarde, noite de festa, madrugada com visão noturna) a 60 FPS, sem depender de assets externos frágeis ou downloads que possam falhar.
- **Decisão:** Criação de `House3DScene.ts` e `Character3DManager.ts` em Three.js. Todos os 8 cômodos (Sala com sofá em U e TV gigante OLED animada via canvas, Cozinha VIP com mármore, Cozinha Xepa rústica, Quartos Selva e Oceano, Piscina com shader de ondas na água, Confessionário com poltrona escarlate e Academia com esteiras e halteres) são gerados proceduralmente com geometrias compostas (3-12 partes), sombras suaves PCF e materiais PBR. Presets de 8 câmeras CFTV de reality show com transição amortecida por `THREE.MathUtils.damp`.

## Decisão 015 — Motor de Provas, Líder, Anjo e Castigo do Monstro (Fase 5)
- **Status:** Aprovado.
- **Contexto:** O diretor comanda provas de resistência, agilidade, lógica e sorte, e deve poder interferir nos bastidores ("Mexida do Diretor") utilizando pontos de Autoridade.
- **Decisão:** `challengeEngine.ts` simula competições em rodadas usando skills do competidor, estamina e estresse. Na Prova do Anjo, o vencedor automaticamente define o Castigo do Monstro aplicando severa perda de estamina e pico de estresse nos 2 maiores rivais (calculados pela menor afinidade na matriz de relações). No Bate-e-Volta, o emparedado vencedor escapa da votação.

## Decisão 016 — Mesa de Switcher Broadcast Profissional e IBOPE Dinâmico (Fase 5 e UI Overhaul)
- **Status:** Aprovado.
- **Contexto:** A interface anterior foi avaliada como vaga e estranha pelo usuário. Era necessário recriar a atmosfera de uma verdadeira Master Control Room (MCR) de emissora de televisão aberta.
- **Decisão:** Implementação de `BroadcastMasterView.tsx` e `broadcastStore.ts`:
  1. Monitor ao vivo com viewport 3D Three.js, timecode SMPTE digital, tally "NO AR (PGM)", scanlines CRT opcionais e GC Lower-Third animado com manchetes da casa.
  2. Mesa de switcher com barramento de 8 câmeras com botões táteis LED (vermelho no ar, verde preview), botões CUT e AUTO com mix dissolve e controle de T-Bar.
  3. VU meters de decibéis de áudio estéreo com leds dinâmicos.
  4. Tagger de takes em tempo real com tags narrativas (Treta, Romance, Vilão, Estratégia, Comédia, Emoção).
  5. Gráfico dinâmico de IBOPE com curva minuto-a-minuto reagindo a picos de atrito e eventos da casa.

## Decisão 017 — Telemetria de Audiência com Recharts e Formação de Paredão ao Vivo (Fase 6)
- **Status:** Aprovado.
- **Contexto:** Visualização em tempo real da curva de audiência (IBOPE) e share da emissora, formação completa de paredão com catálogo de dinâmicas oficiais (indicação soberana do líder, votação da casa no confessionário com justificativas, contragolpe e prova bate-e-volta salvando participante da berlinda).
- **Decisão:**
  1. Componente `AudienceTrendChart.tsx` em Recharts estilizado como osciloscópio broadcast de controle mestre, com linhas neon ciano (IBOPE) e âmbar (Share %), linha de referência com a meta dos patrocinadores (25.0 pts) e tooltip dark glassmorphic com dados por horário.
  2. Motor de votação `votingEngine.ts` que simula votação secreta da casa baseada na matriz de relações e alianças, computa o contragolpe do mais votado, realiza a disputa de Bate-e-Volta e calcula o resultado popular simulando dezenas de milhões de votos com discurso de eliminação dramático por Tadeu Santiago.
  3. Intervenção do diretor utilizando pontos de Autoridade (ex: transformar em Paredão Falso com Quarto Secreto).

## Decisão 018 — Ilha de Edição Narrativa, Plateia de IA e Fantasy Game (Fase 7)
- **Status:** Aprovado.
- **Contexto:** O que vai ao ar na edição do programa diário é a única coisa que a audiência e o público assistem. A edição pode moldar narrativas, transformar participantes em vilões ou vítimas, gerar risco jurídico e influenciar os votos da plateia virtual de IA.
- **Decisão:**
  1. `editingEngine.ts` e `EditingRoomScreen.tsx`: montagem de pacotes diários a partir de takes gravados das câmeras, seleção de ângulo editorial do diretor ("Pintar como Vilão", "Narrativa de Vítima", "Expor Hipocrisia", "Foco no Casal", "Memes/Comédia", "Neutro"), cálculo de risco ético/jurídico, custo de produção e impacto direto na popularidade e rejeição do participante em destaque.
  2. `aiViewerEngine.ts` e `LiveShowParedaoScreen.tsx`: Plateia de IA dividida em núcleos demográficos persistentes (Sofá/Família, Jovem/Twitter, Estrategista, Romântica, Hater/Caos) que emitem votos auditados com justificativas textuais coerentes com a edição exibida e ponderação em massa para dezenas de milhões de votos.
  3. `FantasyAudienceScreen.tsx`: Fandoms com hashtags e intensidade de mutirões, pontuação semanal de escalação (Fantasy Squads) e "Bolão do Diretor" onde o jogador aposta pontos de Autoridade nos resultados e ganha bônus de Reputação.

## Decisão 019 — Control Room Broadcast, Economia, Patrocinadores e Central de Crises (Fase 8)
- **Status:** Aprovado.
- **Contexto:** Acompanhamento em tempo real de 'Live Viewership', 'Social Media Buzz' e 'Ad Revenue' em painel com elementos glass-card; motor econômico com contratos de cotas (Master, Ouro, Prata, Apoio), contratação de equipe especializada, árvore de upgrades técnicos da produção, diário do diretor, conquistas, central de crises e editor de provas.
- **Decisão:**
  1. Componente `src/components/ControlRoom.tsx` implementado com glass-cards estilizados (`backdrop-blur-xl`, `bg-slate-900/60`, bordas com glow neon), rastreando Live Viewership (IBOPE em tempo real, 4.2M telespectadores, share %), Social Media Buzz (menções/minuto, sentimento positivo/neutro/hate, hashtags em alta) e Ad Revenue (cotas vendidas, receita bruta em milhões de reais, satisfação dos patrocinadores).
  2. `economyEngine.ts` e `EconomySponsorsScreen.tsx`: cálculo de balanço financeiro semanal, penalidade automática de receita quando o IBOPE cai abaixo do contrato, folha de pagamento de equipe de produção (Produtor, Psicólogo, Editor-Chefe, Jurídico, Assessor, Veterinário) e árvore de upgrades de estúdio (Câmeras 4K HDR, Suíte de IA, Ponto Eletrônico Ultrassônico, Servidores CDN).
  3. `crisesEngine.ts` e `CrisesScreen.tsx`: sala de guerra com catálogo de crises críticas (Desistência, Encostada de Narizes / Quase Vias de Fato, Vazamento de Áudio no Microfone Aberto, Boicote de Patrocinador Master, Notificações Judiciais e Pane Técnica) com opções executivas balanceadas em custos financeiros, autoridade e impacto na imagem da atração.
  4. `socialMediaEngine.ts` e `SocialMediaFeedScreen.tsx`: feed simulado de rede social em tempo real com trending topics do Brasil, torcidas organizadas, memes e portais de fofoca ("Choquei do Reality", "Leo Bastidores", "Notícias da TV").
  5. `challengeEditor.ts` e `ChallengeEditorScreen.tsx`: montagem de provas customizadas em blocos modulares (Circuito de Obstáculos, Quiz Eletrônico, Prancha de Equilíbrio, Gaiola Giratória de Resistência Extrema, Tanque de Gosma, Painel de Memória e Duelo Rural), calculando automaticamente a dificuldade, risco de lesão, custo e potencial de audiência.

## Decisão 020 — Modo Fazenda (Vida Rural), Manejo Agropecuário, Baia, Roça e Modo Híbrido (Fase 9)
- **Status:** Aprovado.
- **Contexto:** Implementação completa da ambientação rural e do formato misto, permitindo temporadas com animais, tarefas diárias, decretos do Fazendeiro da Semana, dormitório de castigo na Baia, fogueira de eliminação e intercâmbio entre cenários no modo Híbrido.
- **Decisão:**
  1. `farmEngine.ts` e `FarmManagementScreen.tsx`:
     - 4 espécies de animais com telemetria de saúde, felicidade e produção (Vaca Mimosa com litros de leite, Galinheiro das Poedeiras com ovos caipiras, Cavalo Crioulo Trovão e Rebanho de Ovelhas).
     - Escala de tarefas obrigatórias com turnos (Manhã, Tarde, Noite) designadas pelo Fazendeiro aos peões.
     - Sistema de negligência com Sirene da Roça e Punições Coletivas automáticas (ex: 48h sem água encanada e sem carne na despensa).
     - Gestão da Baia dos Punidos (até 4 participantes confinados no estábulo com banho frio de balde e sem privilégios da Sede).
     - Simulador de clima rural (Ensolarado, Tempestade com Lama, Noite com Geada e Céu Aberto) afetando o ânimo e a saúde do elenco.
  2. `hybridEngine.ts`: suporte a reality show híbrido, dividindo o elenco entre A Mansão Urbana e A Fazenda da Mata, com registro e execução de intercâmbio de moradores entre os ambientes.


## Decisão 021 — Escala de Participantes com Carisma e Controvérsia
- **Status:** Aprovado.
- **Contexto:** O jogador precisava de controle editorial pleno sobre o casting da temporada: contratar novos participantes da Casa de Vidro, demitir/expulsar moradores e substituir jogadores com impacto direto na audiência.
- **Decisão:** Implementação de `RosterManagementScreen` com métricas explícitas de **Carisma** (0-100, fidelização, IBOPE base, relação com marcas) e **Controvérsia** (0-100, picos no ao vivo, atrito e velocidade viral). Adição de ações de substituição com reserva e expulsão sumária com repercussão nas redes.

## Decisão 022 — Integração Gemini AI & Dossiê Social de Participantes
- **Status:** Aprovado.
- **Contexto:** Geração dinâmica de posts hiper-realistas para o feed social 24h e pareceres estratégicos confidenciais da direção para cada participante.
- **Decisão:** `src/engine/ai/geminiService.ts` conecta com o endpoint `gemini-flash-latest` utilizando a chave de API fornecida e fallback heurístico de alta fidelidade para garantir funcionamento contínuo e tolerância a falhas ou rate limits. `ParticipantSocialDossierModal` exibe memômetro, cancelômetro, polarização e recomendações de corte.

## Decisão 023 — Gestão de Equipe Frente e Trás das Câmeras (Staff Engine)
- **Status:** Aprovado.
- **Contexto:** O diretor de TV precisa gerenciar sua produção tanto na frente das câmeras quanto nos bastidores técnicos.
- **Decisão:** `StaffManagementScreen` segrega talentos de vídeo (Apresentador Titular, Comentaristas da Central, Repórter de Rua, Chefe dos Dummies) e equipe de apoio (Diretor de Fotografia, Roteirista de Tretas, Psicóloga de Confinamento, Segurança Tático, Editor-Chefe, Veterinário). Cada membro concede bônus passivos escaláveis por níveis (Júnior a Estrela) e folha salarial semanal.

## Decisão 024 — Ilha de Edição Multitrack Audiovisual
- **Status:** Aprovado.
- **Contexto:** A pós-produção precisava ser rica, audiovisual e interativa, simulando um software de edição não-linear (NLE) de televisão.
- **Decisão:** `EditingRoomScreen` conta com timeline de 3 pistas (Vídeo/Takes gravados, Efeitos Sonoros/Foley como Sino da Discórdia e Panelaço, GC Lower-Thirds), seletor de viés narrativo (Vilão, Vítima, Comédia, Fogo no Parquinho), filtros visuais (Noir, Visão Noturna, HD) e projeção de impacto de IBOPE e CONAR antes de renderizar para o horário nobre.
