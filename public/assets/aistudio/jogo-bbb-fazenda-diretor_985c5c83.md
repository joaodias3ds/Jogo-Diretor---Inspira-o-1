# PROMPT MESTRE — "DIRETOR DO REALITY" (mistura de Big Brother com A Fazenda)

> Uso pessoal / protótipo privado. Tudo fictício: nome do programa, emissora, apresentador e participantes são inventados. O jogador cria e edita os participantes no próprio jogo.

---

## 0. COMO USAR ESTE DOCUMENTO

Você é um engenheiro de jogos sênior, game designer e diretor de arte. Construa o jogo descrito abaixo **por fases (0 a 10)**. Regras de trabalho:

1. Execute **uma fase por vez**. Ao terminar, entregue: o que foi feito, como rodar, como testar e o que falta.
2. Não avance de fase sem que os **critérios de aceite** da fase atual estejam cumpridos.
3. Código em **TypeScript**, tipado, modular, comentado onde houver regra de negócio.
4. Todo o texto do jogo em **português do Brasil**.
5. Nenhum número "mágico": todo balanceamento fica em arquivos de configuração (`/src/config`).
6. Se faltar uma decisão, escolha o padrão mais sensato, registre em `DECISOES.md` e siga em frente.

---

## 1. VISÃO GERAL

**Conceito:** o jogador é o **DIRETOR DO PROGRAMA** de um reality show que pode ser de confinamento (estilo casa de vidro), de vida rural (estilo fazenda) ou híbrido. Ele não joga como participante: ele **comanda os bastidores**, cria provas, edita o que vai ao ar, controla a audiência, administra o orçamento, negocia com patrocinadores, administra crises e decide o rumo de cada temporada.

**Pilares:**
1. **Poder do diretor:** cada decisão muda o jogo, a audiência e a produção.
2. **Participantes vivos:** personalidades, relações e memória profundas, com falas geradas por IA.
3. **Audiência como placar:** o que vai ao ar importa tanto quanto o que acontece na casa.
4. **Apresentação moderna:** interface de streaming, limpa, escura, rápida e bonita.
5. **Rejogabilidade:** carreira com várias temporadas, editor de provas e cenários, modo diretor-deus.

**Plataforma:** web (navegador), desktop primeiro, responsivo para tablet.
**Visual:** moderno e limpo, estilo plataforma de streaming (tema escuro, vidro fosco, acentos de cor, tipografia forte, animações suaves).

---

## 2. STACK TÉCNICA

| Camada | Escolha |
|---|---|
| Base | Vite + React + TypeScript |
| Estado | Zustand (stores por domínio) + Immer |
| UI 2D | Tailwind CSS + Framer Motion + Radix UI (acessível) |
| Gráficos de dados | Recharts ou visx |
| 3D | Three.js via React Three Fiber + drei + postprocessing |
| Física/colisão simples | rapier (apenas onde precisar: provas) |
| Áudio | Howler.js (trilha e efeitos) + Web Speech API (narração sintetizada) |
| Persistência | IndexedDB via Dexie (local); camada de repositório pronta para trocar por nuvem (Neon/Supabase) depois |
| IA de texto | Gemini API via camada de serviço com **cache, fila, limite de custo e fallback offline** |
| Testes | Vitest (lógica de simulação) + Playwright (fluxos principais) |
| Empacotamento | PWA instalável (opcional na Fase 10) |

**Regra de ouro de arquitetura:** a **simulação é independente da interface**. O motor roda em `/src/engine` sem importar React nem Three. A UI apenas lê estado e dispara ações.

### Estrutura de pastas

```
/src
  /app            -> rotas, layout, providers
  /config         -> balanceamento, tabelas, constantes, traços, eventos base
  /engine         -> simulação pura (sem UI)
    /time         -> relógio, dias, semanas, fases do dia
    /housemates   -> modelo, necessidades, traços, relações, memória
    /social       -> alianças, rivalidades, romances, fofoca, conflitos
    /challenges   -> motor de provas e dinâmicas
    /voting       -> indicação, paredão, voto do público
    /audience     -> ibope, engajamento, popularidade, rejeição
    /editing      -> ilha de edição, seleção de cenas, pacote do dia
    /economy      -> orçamento, custos, receitas, patrocinadores
    /crises       -> eventos de crise e imprevistos
    /season       -> ciclo de temporada e carreira
  /ai             -> cliente Gemini, prompts, schemas, cache, fallback
    /audience-ai  -> plateia de IA: espectadores, torcidas, lotes de voto, auditoria
    /roles        -> papéis criativos (roteirista, apresentador, psicólogo, editor...)
    /commands     -> comandos em linguagem natural e cartões de aprovação
  /data           -> repositórios, Dexie, import/export, migrações
  /ui
    /director     -> telas 2D do diretor
    /live         -> programa ao vivo
    /social-media -> redes e imprensa simuladas
    /editor       -> editor de provas, cenários e participantes
    /components   -> design system
  /world3d        -> cenas 3D (casa, fazenda, arenas de prova)
  /audio          -> trilha, efeitos, narração
  /tests
/docs
  GDD.md  DECISOES.md  BALANCEAMENTO.md  PROMPTS_IA.md
```

---

## 3. REGRAS DE PERSONALIZAÇÃO (O JOGADOR ESCOLHE AO CRIAR O PROGRAMA)

Ao criar uma nova carreira/temporada, uma tela de criação em etapas permite configurar **tudo**:

1. **Identidade do programa:** nome, logo (gerador simples), cores, slogan, nome da emissora, nome do apresentador (fictício).
2. **Modo do reality:** **Casa** (confinamento), **Fazenda** (vida rural) ou **Híbrido** (casa com área rural, ou dois cenários com trocas entre eles).
3. **Escala:** número de participantes (padrão 20, intervalo 8 a 40), duração em semanas (padrão 12), número de grupos/times, regras de convivência.
4. **Elenco:** gerar aleatório, importar, ou criar/editar à mão no **Editor de Participantes**. Opção de misturar.
5. **Regras de jogo:** frequência de paredão, quem indica, peso do voto do público vs. intervenção do diretor, existência de líder/anjo/imunidade/castigo/roça/baia, repescagem, finalistas.
6. **Orçamento inicial e dificuldade:** Fácil, Normal, Difícil, ou **Modo Diretor-Deus** (sem limites de orçamento, controle total, sem game over).
7. **Cenário:** casa e/ou fazenda (variações visuais e de tamanho).
8. **Seed:** semente de aleatoriedade para repetir uma temporada.

Todas as escolhas viram um objeto `SeasonConfig` salvo e editável (parcialmente) durante a temporada.

---

## 4. SISTEMAS DO JOGO (ESPECIFICAÇÃO)

### 4.1 Tempo e ritmo
- Calendário em **dias**, cada dia dividido em fases: Manhã, Tarde, Noite, Madrugada.
- Semana típica (configurável): Seg–Qua convivência e dinâmicas, Qui prova do líder, Sex–Sáb festa/ações, Dom **programa ao vivo + paredão/eliminação**.
- Controles: pausar, 1x, 2x, 4x, "pular até o próximo evento importante".
- **Pausa automática por evento (estilo jogo clássico):** o tempo para sozinho em Prova do Líder, Prova do Anjo, formação do paredão, votação, Telefone Misterioso, reviravolta, crise grave e programa ao vivo. Configurável por evento (Sempre pausar / Avisar / Ignorar) e com **fila de eventos** para não perder nada ao acelerar.
- O diretor age em **janelas de decisão** (cartões de decisão) e também pode interferir a qualquer momento (com custo).

### 4.2 Participantes (simulação profunda)
Cada participante tem:

- **Identidade:** nome, apelido, idade, cidade, profissão, história de vida, aparência (editor visual), voz sintética.
- **Personalidade (Big Five + traços):** abertura, conscienciosidade, extroversão, amabilidade, neuroticismo; mais traços de jogo: estrategista, explosivo, carismático, dissimulado, leal, fofoqueiro, romântico, líder, preguiçoso, trabalhador, humorista, vitimista, etc.
- **Necessidades (0-100):** fome, sono, higiene, social, diversão, conforto, saúde física, saúde emocional, saudade.
- **Estados:** humor, estresse, energia, motivação, autoconfiança.
- **Estratégia:** objetivo atual (ficar, ganhar, proteger aliado, eliminar rival), nível de ousadia, tolerância a risco.
- **Relações com cada outro participante:** afinidade, confiança, respeito, atração, rivalidade, dívida de favor, histórico de eventos compartilhados.
- **Memória:** lista de eventos marcantes (briga, traição, ajuda, voto, fofoca ouvida) com peso e decaimento. A memória alimenta decisões e falas.
- **Popularidade e rejeição** junto ao público, separadas por **público segmentado** (jovem, família, torcida organizada, etc.).
- **Segredos:** informações que podem vazar e virar crise ou boa edição.
- **Skills de prova:** força, resistência, agilidade, memória, lógica, pontaria, equilíbrio, trabalho em equipe, tratamento de animais, culinária (útil no modo fazenda).

**Decisão por IA utilitária:** o motor escolhe ações por pontuação (utility AI) usando necessidades, personalidade, relações e estratégia. A IA de texto (Gemini) **só narra, dialoga e dá cor**; ela nunca decide o resultado mecânico.

### 4.3 Vida social
- Alianças e grupos com **líder, regras e coesão**, que podem rachar.
- Rivalidades, ciúmes, romances (com chance de crises), amizades, "panelinhas".
- **Fofoca:** informação circula com distorção. Distorcer vira crise.
- **Conflitos:** gatilhos por necessidade, ofensa, voto, traição, comida, divisão de tarefas. Escalam de climão a briga.
- **Conversas dinâmicas:** quartos, cozinha, piscina, confessionário, baia/curral, horta, fogueira.
- **Tarefas e rotina** (modo fazenda): cuidar de animais, plantar, cozinhar, limpeza, ordenha, com rodízio, "cuidador" da semana e penalidades por negligência.

### 4.4 Provas e dinâmicas (coração do papel de diretor)
Tipos: **Líder, Anjo/Imunidade, Castigo, Resistência, Bate-volta, Prova da comida, Prova de fazenda (baia/roça), Prova de equipe, Prova de memória/lógica, Prova mista 3D, Dinâmica social (jogo da discórdia, escolha secreta, votação cruzada)**.

Para cada prova o diretor define:
- tipo, regras, dificuldade, duração, prêmio, castigo, quem pode participar;
- cenário 3D (arena) e **temperatura de risco** (chance de acidente/lesão);
- **custo** de produção e **potencial de audiência** estimado;
- se tem **"mexida" dos bastidores** (alterar regra no meio, mudar prêmio, reviravolta).

Resolução: simulação por skills + sorte + estado emocional, com **câmera 3D ao vivo** do desenrolar (modo assistir) ou resolução rápida (pular).

**Editor de provas e cenários (Fase 8):** montar provas com blocos (obstáculo, quiz, equilíbrio, pontaria, resistência, cooperação), definir pontuação e salvar como modelo reutilizável.

### 4.5 Votação, paredão e voto do público
- Fluxo: indicações (líder, casa, sorteio, regras próprias) → **paredão** → votação.
- **O PÚBLICO QUE VOTA É A IA (Plateia de IA):** não existe fórmula fixa decidindo o resultado. Uma **plateia simulada por IA** vota de verdade (ver seção 5.1). Cada voto sai de um "espectador virtual" com perfil, gosto, humor e histórico, que **assistiu ao que o diretor levou ao ar** e justifica o voto em texto. O motor só aplica regras de integridade (quórum, limites, anti-viés), nunca escolhe o vencedor.
- Os números de popularidade e rejeição passam a ser **resultado da plateia**, não entrada de uma fórmula. Fórmula de apoio (só para fallback offline): `voto = f(popularidade, rejeição, carisma, exposição editada, polêmicas recentes, torcidas, sorte)`.
- **Intervenção do diretor** (custa **Autoridade**, não só dinheiro): imunidade surpresa, paredão falso, dobradinha, voto de minerva, anulação, repescagem, expulsão disciplinar.
- Resultado com **gráfico de porcentagem**, animação de revelação e reações da casa.

### 4.5B Dinâmicas oficiais de reality (catálogo do diretor)

Catálogo de dinâmicas clássicas, todas com **nomes fictícios** e regras configuráveis. O diretor decide **quando** soltar cada uma e como anunciar:

| Dinâmica (nome no jogo) | O que faz |
|---|---|
| **Imunidade do Líder e do Anjo** | Vencedor da prova fica imune; o líder indica direto ao paredão |
| **Mira do Líder** | O líder aponta alvos; o indicado final sai da "mira" |
| **Contragolpe** | Um emparedado ganha o poder de puxar mais alguém para o paredão |
| **Telefone Misterioso** (Big Fone) | Toca a qualquer hora; quem atende ganha imunidade e deve indicar pessoas, ou recebe outra consequência |
| **Botão Enigma** (botão misterioso) | Quem aperta ganha um poder secreto, revelado só na formação do paredão |
| **Bate-e-Volta** | Prova que salva um emparedado do paredão |
| **Paredão Falso** | O "eliminado" vai para o **quarto secreto** e assiste à casa por um tempo, voltando com vantagem de informação |
| **Paredão Duplo/Triplo/Quádruplo** | Várias vagas, com vagas extras por prova, voto da casa e reviravoltas |
| **Duelo de Risco** | Prova de alto risco com recompensa e castigo pesados |
| **Entrada de novos moradores** | Novos participantes escolhidos (ou votados pela plateia) chegam com informação do que o público pensa |
| **VIP/Xepa (ou Sede/Baia na fazenda)** | Divisão da casa por privilégios, com ração e conforto diferentes |
| **Votos com peso, votos secretos e voto aberto** | Regras de votação da casa que mudam a estratégia |
| **Poder de veto e troca** | Cartas de poder (anular, trocar, dobrar voto) |

**Regras do motor:**
- Cada dinâmica é um **módulo** com `condições de disparo`, `escolhas do diretor`, `escolhas dos participantes`, `efeitos` e `texto de anúncio` (apresentador por IA).
- O diretor monta a **semana-tipo** arrastando dinâmicas para o calendário e pode **forçar** ou **adiar** uma dinâmica (com custo de Autoridade).
- Dinâmicas se **combinam** (ex.: Contragolpe + Telefone Misterioso), com checagem automática de conflito de regras.
- O editor de provas e cenários (Fase 8) permite **criar novas dinâmicas** a partir de blocos.

### 4.5C Fantasy da Plateia (palpites e pontuação)

Camada de jogo social inspirada em jogos fantasy de reality: a **plateia de IA** não só vota, ela **joga**.

- **Montagem de grupo semanal:** os espectadores-núcleo escolhem um grupo de participantes favoritos por semana (mercado abre e fecha em dias definidos).
- **Pontuação** por desempenho real na casa: vencer prova do líder/anjo, ficar imune, escapar do paredão, vencer Bate-e-Volta, ganhar votos, momentos virais e bônus por permanência. Penalidades por eliminação e rejeição.
- **Palpites e enquetes:** quem vence a próxima prova, quem o líder indica, quem sai no paredão, quem atende o Telefone Misterioso. Acertar rende pontos.
- **Ligas e ranking:** ligas de torcidas (fandoms) e ranking geral da plateia; os melhores palpiteiros viram **influenciadores** com voz maior nas redes.
- **Efeito no jogo:** o grupo mais escolhido de um participante eleva sua **exposição e popularidade**; participantes muito palpitados atraem mais votos e mais ódio. O diretor **vê o mapa de palpites** e pode explorá-lo (ou ser surpreendido) ao decidir edição e dinâmicas.
- **Bolão do Diretor (opcional):** o jogador também palpita e ganha **pontos de reputação** por acertar o que a plateia vai fazer.
- **IA:** os espectadores justificam escolhas e palpites em texto, com personalidade própria.

### 4.6 Audiência e edição
- **Ibope (audiência ao vivo)** e **engajamento (streaming, 24h)**, com curvas por dia/horário.
- **Ilha de edição:** o diretor monta o **pacote do dia/semana** escolhendo cenas (geradas pelo motor a partir de eventos reais). Cada cena tem: personagem, tom (drama, humor, romance, tensão, afeto), intensidade, risco jurídico/ético, custo de exibição.
- Edição pode **valorizar, esconder ou distorcer** (distorcer eleva audiência e risco de crise e processo).
- **Segmentos do público** reagem de formas diferentes; o jogador vê um painel de satisfação por público.
- **Torcidas e fandoms** que surgem pelos participantes e movem votos e redes sociais.

### 4.7 Redes sociais e imprensa simuladas
- Rede social fictícia (feed de posts, comentários, memes, hashtags, trending topics).
- **Portais de fofoca e jornais** com manchetes **geradas pela IA** a partir do que foi ao ar.
- Cancelamento, campanhas de torcida, vazamentos, "stories" de familiares dos participantes.
- Reputação do programa (0-100) afeta patrocinadores, audiência e contratação de elenco.

### 4.8 Patrocinadores e ações de marca
- Cotas (master, ouro, prata, apoio), contratos com metas (ibope mínimo, menções, ações de marca, prova patrocinada).
- **Ações de marca:** prova patrocinada, merchan na casa, produto no mercado/cardápio, presente do patrocinador.
- Equilíbrio **dinheiro vs. credibilidade** (excesso de merchan cansa o público).
- Marcas **fictícias** geradas/configuráveis.

### 4.9 Orçamento e produção
- **Receitas:** cotas, venda de pacotes, bilheteria de eventos, premiações.
- **Custos:** equipe, cenografia, cachê de convidados, prêmios, ações de marca, segurança, advogado, médico, produção de provas, energia, comida e animais (modo fazenda).
- **Equipe contratável:** produtor, roteirista, editor, psicólogo, médico, veterinário (fazenda), segurança, assessor de imprensa, jurídico. Cada um dá bônus e consome verba.
- Relatórios financeiros semanais, balanço da temporada, **metas da emissora** (diretoria cobra resultado).

### 4.10 Crises e imprevistos
Catálogo de eventos (com gatilho, gravidade, opções do diretor e consequências): desistência, expulsão, agressão, lesão, problema de saúde, vazamento de segredo, polêmica externa, ação judicial, boicote de patrocinador, falha técnica, animal fugido/doente (fazenda), clima/pane, escândalo de edição, invasão/hackers, queda de audiência.
Cada crise tem **opções** (ignorar, abafar, afastar, indenizar, convocar a imprensa, expulsar), com custo e risco. **Gerenciamento de crise** é parte central do jogo.

### 4.11 Carreira (várias temporadas)
- Progressão de **emissora**: de canal pequeno a rede nacional, com mais verba e exigência.
- **Reputação do diretor**, prêmios, contratos, ofertas de outras emissoras.
- Legado: **Hall da Fama** (campeões, recordes, momentos), histórico por temporada, linha do tempo.
- Spin-offs desbloqueáveis (versões do formato com regras novas).
- Save automático e manual, múltiplos slots, import/export em arquivo.

### 4.12 Modo Diretor-Deus
Sem limite de dinheiro ou autoridade, sem game over, **painel de edição total** (alterar necessidades, relações, popularidade, eventos, clima, regras ao vivo). Ideal para brincar de cenários.

### 4.13 Replay e melhores momentos
Gravação de **eventos-chave** (não vídeo): o motor registra a linha do tempo e permite **re-renderizar a cena em 3D** (briga, prova, virada, eliminação). Montagem de "melhores momentos" da semana e da temporada.

---

## 5. IA DE TEXTO (GEMINI) — ESPECIFICAÇÃO

**Uso:** diálogos, monólogos de confessionário, narração do apresentador, manchetes, posts, comentários, cartas, resumos da semana, justificativas de voto, boatos.

**Arquitetura (`/src/ai`):**
- Serviço único `generateText(request)` com **schema JSON de saída validado** (Zod). Respostas inválidas são rejeitadas e refeitas ou substituídas por fallback.
- **Contexto enxuto:** envia só o necessário (personalidade resumida, estado, relação relevante, 3 a 5 memórias recentes, tom, restrições).
- **Cache** por hash do contexto; **fila** com limite de requisições por minuto; **orçamento de tokens** configurável.
- **Fallback offline:** banco de frases e templates por traço/situação, para o jogo nunca travar sem rede ou sem chave.
- **Chave da API:** informada pelo usuário nas configurações e guardada localmente. Nunca no código.
- **Regras de segurança de conteúdo:** nada de conteúdo sexual explícito, discurso de ódio, violência gráfica ou pessoas reais. Brigas, ciúmes e polêmicas são permitidos em tom de **TV aberta fictícia**.
- **Consistência:** a IA recebe a "ficha" do personagem e o histórico, e a resposta é salva na memória do participante para manter coerência.
- Documentar todos os prompts em `docs/PROMPTS_IA.md` (system prompt, exemplos, formato de saída).

**Prompts-base a criar:** fala de convivência, confessionário, discussão, reconciliação, fofoca, declaração de voto, reação ao paredão, narração do apresentador, manchete de portal, post de rede social, comentário de torcida, resumo do dia, carta/despedida.

---

### 5.1 PLATEIA DE IA (O PÚBLICO QUE VOTA)

**Conceito:** o público é um conjunto de **espectadores virtuais**, cada um simulado pela IA. Eles assistem ao "pacote do dia" montado pelo diretor, reagem, comentam, formam torcidas e **votam**.

**Estrutura:**
- **Espectadores-núcleo (50 a 300 perfis persistentes):** cada um tem nome, idade, região, profissão, valores, humor, gostos (drama, humor, romance, estratégia, justiça), vieses e **memória própria** dos participantes que acompanha. Eles evoluem ao longo da temporada.
- **Massa estatística:** cada espectador-núcleo representa um **grupo maior** (peso). O voto final é a soma ponderada, para escalar sem estourar custo de IA.
- **Torcidas e fandoms:** grupos que a IA forma e batiza (ex.: "Time do Injustiçado"), com líderes, hashtags, campanhas, bots e boicotes.
- **Eventos de opinião:** "virada de chave" quando uma cena viraliza, quando há fake news ou quando o diretor distorce a edição.

**Fluxo de votação:**
1. O motor entrega a cada lote de espectadores o **resumo da semana** (cenas exibidas, não o que foi escondido) e a ficha dos indicados.
2. A IA devolve, em **JSON validado**, o voto, a **justificativa curta**, a emoção e o grau de convicção.
3. O motor audita (soma, limites, detecção de resposta absurda ou viés repetido) e consolida os números.
4. A tela do paredão revela porcentagens, "vozes da plateia" (comentários reais gerados) e a **torcida que decidiu**.

**Regras de integridade:**
- A plateia só conhece o que **foi ao ar** (esconder cena = público desinformado; vazar depois = reviravolta).
- Seed e cache garantem **reprodutibilidade**; modo "transparente" mostra por que a plateia votou assim.
- Orçamento de IA: lotes por semana, com **amostragem inteligente** (a IA vota por amostra e o motor extrapola) e fallback offline.
- Anti-viés: verificação para a IA não favorecer sempre o mesmo perfil (testes automatizados com 100 temporadas).

### 5.2 IA CRIATIVA — PAPÉIS DA IA NO JOGO

A IA deixa de ser só "texto de apoio" e vira **motor criativo** em vários papéis, cada um com prompt, schema e limite próprios:

1. **Roteirista de Casa:** cria *arcos narrativos* (a vilã que esconde bondade, o casal improvável, a amizade que racha), propondo situações que o motor depois executa.
2. **Diretor de Elenco:** gera participantes completos (história, segredos, medos, vícios, contradições) a partir de uma frase do jogador.
3. **Criador de Provas:** inventa provas e dinâmicas novas (regras, cenário, pontuação, humor), convertendo em blocos do editor.
4. **Apresentador:** narra o programa ao vivo, faz entrevistas, provoca, improvisa reações a cada resultado, com bordões próprios.
5. **Psicólogo/Analista:** relatórios sobre cada participante (risco emocional, tendência de voto, quem vai surtar), com recomendação ao diretor.
6. **Editor-Chefe:** sugere o pacote do dia, ângulos de edição, manchetes e "teasers" para aumentar audiência, com aviso de risco.
7. **Imprensa e Redes:** colunistas, influenciadores, haters, fã-clubes, paródias, memes e matérias com tom e viés distintos.
8. **Plateia (5.1):** voto, comentários, torcidas.
9. **Participantes (diálogo livre):** falas, discussões, confissões, cartas e **respostas ao diretor**.
10. **Advogado/Jurídico e Assessor de Crise:** montam estratégias de crise e comunicados oficiais.
11. **Narrador de Memórias:** transforma o histórico em "documentário" da temporada, "melhores momentos" com texto de narração.
12. **Mestre de Eventos (Game Master):** injeta acontecimentos inesperados coerentes com o estado do jogo, calibrados pela dificuldade.

**Interação direta com a IA (o diferencial):**
- **Chat com o participante no Confessionário:** o diretor conversa em texto (ou voz) com o participante, que responde em personagem, mentindo, escondendo ou revelando conforme personalidade e confiança.
- **Reunião de Produção:** o diretor conversa com a equipe (roteirista, editor, psicólogo, advogado) como em um chat de trabalho e recebe pareceres divergentes.
- **"E se...?" (modo simulador de cenários):** pergunte livremente ("e se eu colocar os rivais na mesma prova?") e a IA prevê consequências prováveis antes de você decidir.
- **Comandos em linguagem natural:** "crie uma prova de culinária com sabotagem" ou "deixe o clima mais tenso nesta semana" viram ações do jogo, validadas pelo motor.
- **Personalização contínua:** o jogador define "tom do programa" (família, picante-leve, drama pesado, comédia) e a IA ajusta todo o texto.

**Guardas de criatividade:** a IA **propõe**, o motor **valida e executa**. Tudo gerado pela IA entra em um **cartão de aprovação** quando muda regras importantes. Conteúdo sexual explícito, ódio e violência gráfica ficam bloqueados.

---

## 5B. FUNÇÕES E INTERAÇÕES EXTRAS DO DIRETOR

**Controle de bastidores**
- **Escuta e ponto eletrônico:** soprar instruções a participantes, ao apresentador ou a convidados (custa Autoridade e risco de vazar).
- **Sala de Produção:** reuniões com equipe, escalas, folgas, burnout da equipe.
- **Casting e substituição:** substituir participante, convidar **entrada surpresa** (novos moradores, ex, parente, "gêmeo", celebridade fictícia).
- **Tarefas secretas:** missões privadas dadas a um participante (mentir, formar aliança, sabotar) com recompensa.
- **Segredos e cofres:** guardar, vender, vazar e usar segredos como arma narrativa.
- **Mudanças de regra ao vivo:** "ventilador" (mudar paredão, inverter imunidade, dobrar votos) com custo e rejeição.
- **Reviravoltas:** casa invertida, quarto secreto, casa dividida em duas, fazenda dividida em times, troca de cenário.
- **Carta, ligação e visita:** controlar o que cada um recebe da família, com impacto emocional.

**Eventos sociais**
- **Festas temáticas**, jantares, "dia de beleza", noite de talentos, karaokê, show de convidado, sessão de cinema.
- **Jogo da discórdia, sincerão, dinâmica de votos abertos, big fone e sessão de confissões.**
- **Cozinha e mercado (casa) / ração e colheita (fazenda):** economia de comida como fonte de conflito e estratégia.
- **Dinâmicas de equipe** com técnicos, capitães e escolhas de times.

**Participantes interativos**
- **Perguntas ao vivo** no estúdio: o diretor ou a IA entrevista o eliminado e a família.
- **Despedida personalizada:** cena de saída com depoimentos da casa.
- **Reencontro, reality-pós:** o que cada eliminado fez depois, com impacto na carreira da emissora.

**Meta-jogo**
- **Conquistas, desafios semanais do diretor, rankings pessoais**, árvore de habilidades do diretor (Carisma, Estratégia, Gestão, Criatividade, Jurídico, Mídia).
- **Árvore de upgrades da produção:** estúdio, câmeras, equipamentos, equipe, tecnologia de edição, IA mais poderosa.
- **Diário do Diretor:** registro automático (feito pela IA) da sua trajetória e decisões.

---

## 6. MUNDO 3D (CASA E FAZENDA)

- **Visão:** câmera livre + **câmeras fixas estilo reality** (cozinha, sala, quarto, piscina, confessionário, jardim, baia, horta, curral). Troca rápida entre câmeras, como a "ilha de câmeras" do diretor.
- **Estilo:** low-poly estilizado de alta qualidade (leve no navegador), iluminação moderna, sombras suaves, pós-processamento discreto, ciclo dia/noite e clima.
- **Personagens:** modelos modulares com editor de aparência, animações de caminhar, sentar, comer, dormir, conversar, discutir, comemorar, trabalhar (fazenda).
- **Casa:** sala, cozinha, quartos (com cenário configurável), banheiros, piscina, jardim, confessionário, sala secreta, quarto do líder, área da prova.
- **Fazenda:** sede, cozinha, baias, curral, horta, lago, estrada, arena de prova, fogueira. Animais ambientais e interativos.
- **Arenas de prova:** módulos reaproveitáveis (pista de obstáculos, tanque, equilíbrio, lama, arena de memória, estúdio de quiz).
- **Performance:** LOD, instancing, limite de personagens renderizados, modo qualidade Baixa/Média/Alta, meta de 60 FPS em PC comum.
- **Barra de necessidades e popularidade (estilo Sims):** ao clicar em um participante, abre um **painel flutuante** com barras de fome, sono, higiene, social, diversão, conforto, energia e humor, mais **popularidade e rejeição** com setas de tendência. Há também **indicadores sobre a cabeça** (ícone de humor/necessidade crítica) e uma **barra inferior global** com dia, hora, velocidade, audiência e caixa. Alertas de risco (ex.: "vai surtar", "vai desistir") acendem na barra.
- **Integração com a simulação:** o 3D **só representa** o estado do motor (posição, animação, fala em balão/legenda). O 3D não decide nada.

---

## 7. INTERFACE 2D DO DIRETOR (TELAS)

Design system próprio: tema escuro, vidro fosco, cartões, tipografia forte, ícones consistentes, microinterações, atalhos de teclado, suporte a tela cheia, acessibilidade (contraste, legendas, tamanho de fonte, daltonismo).

**Telas principais:**
1. **Menu inicial / Carreira:** continuar, nova temporada, hall da fama, editor, configurações.
2. **Criação do programa** (wizard de 8 etapas).
3. **Central do Diretor (dashboard):** audiência, caixa, reputação, autoridade, alertas, próximos eventos, atalhos.
4. **Sala de Controle (Ilha de Câmeras):** mosaico de câmeras ao vivo com indicadores de clima de cada ambiente, filtros (drama, romance, risco).
5. **Painel de Participantes:** fichas completas, gráficos de relação (grafo), memórias, popularidade, risco de eliminação, "temperatura" emocional.
6. **Mapa social:** grafo de alianças, rivalidades, romances.
7. **Estúdio de Provas:** criar, agendar e acompanhar provas.
8. **Ilha de Edição:** montar o pacote do dia, preview do impacto.
9. **Programa ao vivo:** estúdio virtual com apresentador, telão, votação, ibope em tempo real, reações.
10. **Paredão e Votação:** revelação animada, gráficos, intervenções, catálogo de dinâmicas (contragolpe, telefone misterioso etc.).
10B. **Fantasy e Palpites:** mapa de palpites da plateia, ranking de torcedores, ligas, Bolão do Diretor.
11. **Redes e Imprensa:** feed, trending, manchetes, gerenciamento de reputação.
12. **Patrocinadores e Finanças:** contratos, metas, fluxo de caixa, equipe.
13. **Central de Crises:** fila de crises com prazo de decisão.
14. **Replay e Melhores Momentos.**
15. **Hall da Fama e Estatísticas.**
16. **Editor de Participantes, Provas, Cenários e Eventos.**
17. **Configurações** (gráficos, áudio, IA, acessibilidade, backup).

---

## 8. ÁUDIO

- **Trilha dinâmica** por situação (calma, tensão, festa, paredão, final).
- **Efeitos:** ambiente de casa/fazenda, animais, interface, vinhetas de transição.
- **Narração por voz sintetizada** (Web Speech API) para apresentador e participantes, com vozes distintas por participante quando o navegador permitir; sempre com **legenda**.
- Mixer com volumes separados (trilha, efeitos, voz).

---

## 9. DADOS E PERSISTÊNCIA

- **IndexedDB (Dexie)** com tabelas: `seasons`, `housemates`, `relations`, `memories`, `events`, `challenges`, `votes`, `episodes`, `editPackages`, `sponsors`, `finance`, `posts`, `headlines`, `hallOfFame`, `settings`, `viewers` (espectadores da plateia), `fandoms`, `viewerVotes`, `secrets`, `arcs` (arcos narrativos), `aiCache`, `achievements`, `directorDiary`.
- **Repository pattern:** `ISeasonRepository` com implementação local; interface pronta para implementar a **versão nuvem (Neon/Supabase)** depois sem tocar no motor.
- **Migrações de versão** de save.
- **Exportar/importar** save em `.json` (compactado opcional).
- Autosave a cada fim de dia e a cada decisão importante.

---

## 10. FASES DE DESENVOLVIMENTO (ROTEIRO DE ENTREGA)

> Cada fase termina com build funcionando, README atualizado e testes dos sistemas novos.

### FASE 0 — Fundação
- Projeto Vite + React + TS, ESLint, Prettier, Vitest, alias de pastas.
- Design system base (tokens de cor, tipografia, botões, cartões, modais, toasts).
- Roteamento, layout principal, tema escuro, tela inicial vazia.
- `docs/GDD.md` e `docs/DECISOES.md` iniciais.
- **Aceite:** projeto roda, tela inicial bonita, testes passam.

### FASE 1 — Motor base e tempo
- Relógio do jogo, dias, fases do dia, calendário da semana.
- Estruturas de dados principais e stores (Zustand).
- `SeasonConfig` e wizard de criação (etapas 1-3 funcionais).
- Persistência local (Dexie) e save/load.
- **Aceite:** criar temporada, avançar dias, salvar e carregar.

### FASE 2 — Participantes e simulação de vida
- Modelo completo do participante, necessidades, estados, traços.
- Utility AI de ações (comer, dormir, conversar, treinar, tarefas, descansar).
- Gerador de elenco aleatório e **Editor de Participantes**.
- Painel de participantes.
- **Aceite:** 20 participantes vivendo dias de forma coerente, sem travar, com testes de balanceamento.

### FASE 3 — Relações, memória e conflitos
- Matriz de relações, memória com decaimento, alianças, rivalidades, romances, fofoca.
- Sistema de conflitos e reconciliação.
- Mapa social (grafo).
- **Aceite:** relações evoluem de forma plausível, eventos sociais surgem sozinhos.

### FASE 4 — Mundo 3D da casa
- Cena 3D da casa, câmeras fixas e livre, ciclo dia/noite.
- Personagens com animações básicas e movimento guiado pela simulação.
- Sala de Controle (mosaico de câmeras).
- **Aceite:** ver participantes agindo na casa em 3D, 60 FPS em qualidade Média.

### FASE 5 — Provas, líder, castigo e dinâmicas
- Motor de provas, tipos, resolução, Estúdio de Provas.
- Arenas 3D de prova e modo assistir/pular.
- Liderança, imunidade, castigo, anjo, bate-volta.
- **Aceite:** diretor cria e roda provas variadas com resultados coerentes e custos.

### FASE 6 — Votação, paredão e audiência (base com fallback)
- Indicações, paredão, intervenções do diretor, **fallback de voto por fórmula** (usado sem IA).
- **Catálogo de dinâmicas oficiais (4.5B)** como módulos: contragolpe, telefone misterioso, botão enigma, bate-e-volta, paredão falso/triplo, entrada de novos moradores.
- **Pausa automática por evento** e fila de eventos (4.1).
- **Barra de necessidades e popularidade** em painel flutuante e HUD (seção 6).
- Ibope e engajamento, segmentos de público, torcidas.
- **Programa ao vivo** (estúdio virtual, revelação animada).
- **Aceite:** uma semana completa do ciclo (convivência, prova, paredão, eliminação) com ibope.

### FASE 7 — Serviço de IA, Plateia de IA e edição
- Serviço de IA com schema, cache, fila, orçamento e fallback offline.
- **Plateia de IA (5.1):** espectadores-núcleo, massa ponderada, votação por lotes, justificativas, auditoria e anti-viés.
- **Fantasy da Plateia (4.5C):** grupos semanais, palpites, pontuação, ligas, ranking e Bolão do Diretor.
- Falas, confessionário, narração, resumos.
- **Ilha de Edição** com pacote do dia e impacto direto no que a plateia sabe e vota.
- **Aceite:** o voto do paredão sai da plateia de IA; o jogo funciona com e sem IA; textos coerentes com personalidade e memória.

### FASE 7B — IA criativa e interações com o diretor
- Papéis de IA do 5.2 (roteirista, diretor de elenco, criador de provas, psicólogo, editor-chefe, game master).
- **Chat no Confessionário**, **Reunião de Produção**, **"E se...?"** e **comandos em linguagem natural** com cartão de aprovação.
- Arcos narrativos, tarefas secretas, segredos e cofres, entradas surpresa.
- **Aceite:** o diretor consegue criar uma prova, um participante e um arco narrativo só conversando com a IA, e o motor valida e executa.

### FASE 8 — Redes, imprensa, patrocínio e economia
- Rede social fictícia alimentada pela **plateia de IA** (posts, torcidas, memes, cancelamento), portais, manchetes por IA, reputação.
- Funções extras do 5B: escuta/ponto eletrônico, festas e eventos sociais, árvore de upgrades, conquistas, diário do diretor.
- Patrocinadores, contratos, ações de marca, equipe, finanças, metas.
- **Central de Crises** com catálogo de eventos.
- **Editor de Provas, Cenários e Eventos.**
- **Aceite:** ciclo de dinheiro e reputação funcionando e balanceado.

### FASE 9 — Modo fazenda e modo híbrido
- Cenário 3D da fazenda, tarefas rurais, animais, baia/roça, clima.
- Regras específicas (cuidador, roça, fogueira, prova de fazenda).
- Modo híbrido com trocas entre cenários.
- **Aceite:** temporada completa possível nos três modos.

### FASE 10 — Carreira, replay, polimento e áudio
- Carreira com várias temporadas, emissora, hall da fama, estatísticas.
- Replay e melhores momentos, Modo Diretor-Deus.
- Trilha, efeitos e narração por voz.
- Performance, acessibilidade, PWA, backup, tutorial, balanceamento final.
- **Aceite:** jogo completo, estável, bonito e documentado.

---

## 11. REGRAS DE BALANCEAMENTO (DIRETRIZES)

- Nenhuma estratégia única deve vencer sempre (evitar "dinheiro infinito" e "edição sempre distorcida").
- Audiência alta com credibilidade baixa **cobra preço** depois (processo, boicote, queda).
- Participantes reagem à **injustiça percebida** (favorecimento óbvio gera revolta).
- Imprevisibilidade controlada: sorte influencia, mas as habilidades e relações pesam mais.
- Toda fórmula importante deve ter **teste unitário** com casos extremos.
- Fornecer **simulador de balanceamento**: roda 100 temporadas sem UI e mostra distribuição de campeões, audiência média, falências e crises.
- **Teste da plateia de IA:** com respostas simuladas (mock), verificar que nenhum perfil ou tipo de participante vence sempre, que o voto reage à edição e que o resultado é reproduzível pela seed.

---

## 12. REQUISITOS NÃO FUNCIONAIS

- **Desempenho:** simulação de um dia em menos de 200 ms com 40 participantes.
- **Estabilidade:** sem estados inválidos, com validação nos saves e recuperação segura.
- **Acessibilidade:** teclado completo, legendas, alto contraste, tamanho de fonte.
- **Qualidade:** TypeScript estrito, testes nos sistemas centrais, logs de eventos legíveis.
- **Privacidade:** dados locais, chave de API guardada apenas no navegador do usuário.
- **Conteúdo:** tudo fictício; sem conteúdo sexual explícito ou ofensivo; sem uso de pessoas, marcas ou programas reais.

---

## 13. ENTREGÁVEIS FINAIS

1. Código-fonte completo e organizado.
2. `README.md` com instalação, execução, controles e dicas.
3. `docs/GDD.md`, `docs/DECISOES.md`, `docs/BALANCEAMENTO.md`, `docs/PROMPTS_IA.md`.
4. Arquivo de exemplo de save e de elenco.
5. Guia rápido "como ser um bom diretor" (tutorial no jogo).

---

## 14. COMEÇAR AGORA

Inicie pela **FASE 0**. Ao concluir, apresente um resumo curto do que foi feito, como rodar e quais decisões você tomou, e **aguarde** o comando "próxima fase" antes de continuar.
