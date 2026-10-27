# PROMPT DE VISUAL — "DIRETOR DO REALITY"

> Este documento cobre **somente o visual** do jogo: direção de arte, design system, telas 2D, mundo 3D, motion/efeitos e prompts para gerar imagens com IA. Regras de jogo, simulação e IA de texto estão no `jogo-bbb-fazenda-diretor.md`. Tudo fictício, sem marcas, logos ou pessoas reais.

---

## 0. COMO USAR

Você é um **diretor de arte + designer de produto + artista técnico 3D** sênior. Implemente o visual por fases (V0 a V7, seção 11). Em cada fase entregue: o que foi feito, capturas/descrição das telas, como rodar o style guide e o que falta.

Regras fixas:
1. O visual é **100% dirigido por tokens** (cores, tipografia, espaçamento, movimento). Nada de cor ou medida solta no código.
2. O jogo precisa **trocar de tema por temporada** sem reescrever componentes (seção 2).
3. **Hierarquia antes de enfeite:** o diretor toma decisões o tempo todo; o visual deve deixar claro o que é importante, o que é urgente e o que é só informação.
4. Qualidade alvo: parece **produto de estúdio profissional**, não projeto amador. Se estiver "bonito mas confuso", refaça.
5. Desempenho é parte do visual: 60 FPS em PC comum, efeitos com versão "baixa qualidade".

---

## 1. DIREÇÃO DE ARTE

### 1.1 Conceito: "MASTER CONTROL"
O jogador está na **sala de controle de um estúdio de TV do futuro**. Tudo na interface lembra **ilha de edição, switcher de câmeras, telão de estúdio e painel de transmissão**: grades de monitores, indicadores "AO VIVO", luzes de tally, medidores, linhas de timecode, gráficos animados, lower thirds.

**Palavras-guia:** futurista, broadcast, preciso, luminoso, controlado, premium, dramático.
**Evitar:** aparência de planilha/ERP, cores chapadas sem profundidade, excesso de neon cansativo, estética de cassino, infantil.

### 1.2 Dualidade de tom
- **Interface (2D):** fria, tecnológica, controlada (o "poder do diretor").
- **Mundo (3D):** quente, humano, orgânico (a "vida da casa/fazenda").
O contraste entre a **moldura fria** e o **conteúdo quente** é a assinatura visual do jogo: os monitores mostram a vida real dentro de uma moldura de estúdio.

### 1.3 Sensação por momento
| Momento | Sensação visual |
|---|---|
| Dia a dia / gestão | Calmo, organizado, azul-ciano frio, muito respiro |
| Prova | Energia, contraste, cores saturadas, movimento |
| Formação de paredão | Tensão, escuro, vermelho/âmbar pulsando, foco central |
| Programa ao vivo | Brilho de palco, dourado/branco, telão, partículas |
| Crise | Alerta, vermelho, vibração controlada, prioridade total |
| Eliminação | Silêncio visual, depois revelação cinematográfica |
| Final | Épico, dourado, confete, câmera lenta |

---

## 2. SISTEMA DE TEMAS POR TEMPORADA

Cada temporada tem uma **identidade visual própria** (cores, logo, vinheta, texturas de cenário). O motor visual lê um objeto `SeasonTheme`.

### 2.1 Estrutura do tema
```json
{
  "id": "temporada-aurora",
  "name": "Aurora",
  "mode": "dark",
  "colors": {
    "bg":        { "0": "#070A12", "1": "#0C111D", "2": "#121A2B", "3": "#1A2438" },
    "text":      { "primary": "#EAF1FF", "secondary": "#9FB0D0", "muted": "#64748F" },
    "accent":    { "primary": "#3DDCFF", "secondary": "#7C5CFF", "highlight": "#FFC857" },
    "semantic":  { "live": "#FF3B4E", "success": "#2EE6A6", "warning": "#FFB020", "danger": "#FF4D6D", "info": "#4DA3FF" },
    "glow":      { "primary": "rgba(61,220,255,.35)", "live": "rgba(255,59,78,.45)" }
  },
  "gradients": {
    "hero":  "linear-gradient(135deg,#3DDCFF 0%,#7C5CFF 60%,#FF4DA6 100%)",
    "stage": "radial-gradient(60% 80% at 50% 0%, rgba(124,92,255,.35), transparent 70%)"
  },
  "world": {
    "skyTint": "#9CC7FF",
    "houseAccentMaterial": "warm-wood-teal",
    "farmAccentMaterial": "straw-terracotta",
    "lightingPreset": "golden-hour"
  },
  "logoVariant": "aurora",
  "stingerVariant": "aurora"
}
```

### 2.2 Temas de exemplo (entregar pelo menos 6)
1. **Aurora** — ciano + violeta + magenta, noite de estúdio futurista (padrão).
2. **Brasa** — vermelho profundo + âmbar, drama e tensão.
3. **Savana** — dourado + terracota + verde-oliva, ideal para fazenda.
4. **Oceano** — azul-petróleo + turquesa + coral, leve e luminoso.
5. **Solar** — modo claro: branco quente + laranja + azul-marinho.
6. **Noir Gold** — preto + dourado, edição "gala"/final.

### 2.3 Regras dos temas
- Todo tema passa em **contraste WCAG AA** (texto principal ≥ 4.5:1) — validar com script.
- Tema define também **luz do cenário 3D** (cor do sol, hora dourada, ambiente) e **variante de logo e vinheta**.
- **Gerador de tema por IA:** o jogador descreve ("fazenda no pôr do sol, vibe tropical") e a IA devolve um `SeasonTheme` **validado por schema e contraste**, com prévia antes de aplicar.
- Troca de tema com **transição suave** (cross-fade de tokens em 600 ms).
- Tema por **modo** (Casa/Fazenda/Híbrido) é *camada extra*: mantém a identidade da temporada, ajustando materiais do mundo.

---

## 3. DESIGN SYSTEM

### 3.1 Tipografia
- **Display (títulos, números grandes, vinhetas):** sans geométrica condensada/expandida de peso alto (ex.: *Sora*, *Space Grotesk*, *Unbounded*, *Barlow Condensed*), caixa alta em rótulos.
- **Interface (texto):** sans legível (ex.: *Inter*, *Manrope*).
- **Dados/Timecode/Medidores:** mono de dígitos tabulares (ex.: *JetBrains Mono*, *IBM Plex Mono*) com `font-variant-numeric: tabular-nums`.
- Escala (px): 11 · 12 · 14 · 16 · 20 · 24 · 32 · 48 · 72 · 120 (hero/final). Altura de linha 1.2 em display, 1.5 em texto.
- Rótulos de seção: caixa alta, espaçamento de letra `+0.08em`, tamanho 11–12, cor secundária.

### 3.2 Cores e superfícies
- **Camadas de fundo** (bg0 a bg3): quanto mais "alto" o elemento, mais claro e com mais brilho de borda.
- **Vidro fosco:** `background: rgba(255,255,255,.04)`, `backdrop-filter: blur(16px) saturate(140%)`, borda `1px solid rgba(255,255,255,.08)`, brilho interno superior `inset 0 1px 0 rgba(255,255,255,.08)`.
- **Glow de acento:** sombra colorida suave (`0 0 24px var(--glow-primary)`) usada com **parcimônia** (só em elementos ativos/importantes).
- **Cores semânticas** com significado fixo: vermelho = AO VIVO/crítico, verde = ok/ganho, âmbar = atenção, azul = informação, dourado = destaque/prêmio.
- **Cor por participante:** paleta de 24 cores distintas, usada em avatares, grafo social, gráficos e anéis de seleção. Validar para daltonismo.

### 3.3 Grid, espaçamento e forma
- Grid base **8 px**; espaçamentos 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64.
- Layout desktop em **12 colunas**, gutters 24 px; tela cheia 16:9 com **safe area** de 48 px.
- Raios: 6 (chips), 12 (cartões), 20 (painéis), 999 (pílulas).
- **Cantos "cortados" tecnológicos** (chanfro de 8 px) em cabeçalhos e botões primários, como marca de identidade.
- Linhas finas de 1 px, **marcas de registro** (`+` nos cantos de painéis), réguas e ticks em medidores.
- Elevação por brilho e blur, **não por sombra preta pesada**.

### 3.4 Iconografia
- Conjunto único, traço de 1.75 px, cantos levemente arredondados, 24 px base (16 e 32 auxiliares).
- Ícones de domínio a criar: câmera, microfone, tally, líder, anjo, imunidade, paredão, telefone, botão, quarto secreto, contragolpe, prova, troféu, coração/romance, fofoca, aliança, rivalidade, segredo, cofre, patrocínio, dinheiro, autoridade, crise, edição, ibope, fantasy/palpite, animal, colheita, fogueira.
- Estados: normal, hover, ativo (preenchido + glow), desabilitado.

### 3.5 Componentes (todos com estados e animações)
Botões (primário chanfrado, secundário vidro, fantasma, perigo, ícone), cartões (vidro, destaque, com "tally"), painéis com cabeçalho e marcas de registro, abas, chips e tags, badges (AO VIVO pulsante), medidores (barra, arco, termômetro, VU meter), gráficos (linha, barra, área, radar, donut, grafo de rede), tabelas densas, listas virtualizadas, tooltips ricos, modais e gavetas, toasts e alertas, cartões de decisão, linha do tempo com timecode, calendário semanal, sliders, toggles, seletor de cor/tema, avatar com anel de status, **lower third**, **ticker** de notícias, barra de progresso de evento, esqueletos de carregamento, tela vazia ilustrada.

### 3.6 Estados e feedback
- Hover: elevação de brilho + deslocamento de 1–2 px. Foco: anel duplo acessível. Pressionado: leve compressão.
- Carregando: esqueleto com "varredura" luminosa.
- Sucesso/erro: pulso de cor + ícone + som (sincronia com áudio).
- **Densidade configurável:** Confortável / Compacta (o diretor vê muita informação).

---

## 4. TELAS 2D (LAYOUT E ESTILO)

Todas as telas compartilham a **moldura de estúdio**: barra superior (logo da temporada, AO VIVO, relógio com dia/fase, caixa, audiência, autoridade, reputação), **barra lateral** de navegação por ícones, **barra inferior** de controle de tempo (pausa, 1x/2x/4x, pular) e **ticker** de eventos.

### 4.1 Wireframe base (desktop 16:9)
```
┌────────────────────────────────────────────────────────────────────┐
│ ◉ LOGO  ● AO VIVO  Dia 23 · Noite     R$ caixa  ▲ibope  ⚑autor.  ⚙ │  ← barra superior
├────┬───────────────────────────────────────────────┬───────────────┤
│ ▣  │                                               │  PAINEL DE    │
│ ◈  │              ÁREA PRINCIPAL                   │  CONTEXTO     │
│ ☰  │      (mosaico de câmeras / dashboard)         │  (ficha,      │
│ ✦  │                                               │   alertas,    │
│ ⚠  │                                               │   decisões)   │
├────┴───────────────────────────────────────────────┴───────────────┤
│ ⏸ ▶ ▶▶ ⏭   ━━━━●━━━━━━  Semana 4 · Prova do Líder em 02:10  ▮ticker │  ← controle de tempo
└────────────────────────────────────────────────────────────────────┘
```

### 4.2 Tela a tela
1. **Menu inicial:** cena 3D da casa/fazenda ao fundo com câmera em movimento lento, logo da temporada grande, menu em vidro à esquerda, carrossel de temporadas salvas com capa (retrato de campeão + logo).
2. **Criação do programa (wizard):** 8 etapas em trilho horizontal; **prévia ao vivo** do tema, do logo e do cenário no lado direito; seletor de modo (Casa/Fazenda/Híbrido) com cartões grandes e animação de ambiente.
3. **Central do Diretor (dashboard):** grade modular de cartões: curva de audiência (área com gradiente), caixa, reputação, autoridade (medidor em arco), alertas de crise, próximos eventos (linha do tempo), top 5 em risco, melhores cenas do dia. Cartões arrastáveis e redimensionáveis.
4. **Sala de Controle (Ilha de Câmeras):** mosaico 3×3 de monitores com **moldura de CRT/OLED**, luz de tally (vermelho = no ar, verde = preview), rótulo da câmera, mini-medidor de "temperatura" do ambiente; clique expande para câmera principal com preview/programa lado a lado, como um switcher.
5. **Painel de Participantes:** grade de **cartões de elenco** (retrato, nome, anel colorido, barras de necessidade, popularidade/rejeição, tendência, selo de papel: líder/anjo/paredão/VIP). Filtros e ordenação. Ficha completa em gaveta lateral.
6. **Ficha do Participante:** retrato grande 3D ao vivo (turntable), abas (Perfil, Relações, Memórias, Segredos, Estratégia, Histórico, Análise da IA), gráfico radar de personalidade, linha do tempo de eventos.
7. **Mapa Social:** grafo de rede em tela cheia com fundo de "radar", nós com retratos, arestas coloridas (aliança, rivalidade, romance), clusters com halo, zoom e filtros, tooltip rico.
8. **Estúdio de Provas:** mesa de produção — calendário à esquerda, biblioteca de provas em cartões com miniatura 3D, **canvas de montagem** por blocos ao centro, simulador de impacto (custo, risco, audiência) à direita.
9. **Ilha de Edição:** **linha do tempo de NLE** (estilo editor de vídeo): trilhas de cenas com miniaturas, arrastar para o pacote do dia, medidor de "impacto no público" por segmento, prévia no monitor.
10. **Programa ao Vivo:** **estúdio virtual** — palco em 3D, telão com gráficos, apresentador, painel de ibope em tempo real, enquetes, lower thirds, câmera dinâmica, reações da plateia em mosaico.
11. **Paredão e Votação:** tela dramática (ver seção 7.3). Gráfico de porcentagem em barras horizontais gigantes, retratos grandes, "vozes da plateia" em comentários flutuando.
12. **Fantasy e Palpites:** mapa de calor de palpites sobre os participantes, ranking de torcedores com pódio, ligas, cartões de enquete.
13. **Redes e Imprensa:** feed de rede social **fictícia** (visual próprio, não copiar apps reais), trending topics animados, portais de notícia com manchetes grandes, painel de reputação.
14. **Patrocinadores e Finanças:** cartões de marca fictícia com contrato e meta, gráfico de fluxo de caixa, árvore de equipe, **balanço** em tabela densa.
15. **Central de Crises:** fila vertical de cartões de alerta com **contagem regressiva** circular, gravidade por cor e vibração sutil; ao abrir, tela de decisão com opções e custo/risco.
16. **Replay e Melhores Momentos:** player com linha do tempo de eventos-chave, marcadores coloridos por tipo, câmera 3D re-renderizada, botão "Montar highlights".
17. **Hall da Fama:** galeria de **estátuas/troféus 3D**, campeões com retrato e frase, recordes em placar, linha do tempo de temporadas.
18. **Editores (Participantes, Provas, Cenários, Eventos):** layout de ferramenta profissional com painéis acopláveis, pré-visualização 3D central, propriedades à direita.
19. **Configurações:** abas com prévia imediata (qualidade 3D, tema, acessibilidade, áudio, IA).

### 4.3 Cartões de decisão do diretor
Cartão com **título grande**, ilustração/ícone, 2 a 4 opções em botões com **custo** (dinheiro, autoridade) e **risco** (chips coloridos), temporizador opcional e prévia do impacto ("audiência ▲▲ · crise ▲"). Entrada com animação de "carta" deslizando.

### 4.4 Responsividade
- Desktop primeiro (1920×1080, 1440×900, 1366×768). Tablet: sem barra lateral fixa, painéis em gavetas. Texto mínimo 12 px.
- Modo tela cheia "Broadcast": esconde o ruído e mostra só câmera + gráficos.

---

## 5. HUD DO MUNDO 3D (SOBRE A CENA)

- **Painel do participante (estilo Sims, flutuante):** ancorado ao personagem com **linha de conexão** fina; barras de fome, sono, higiene, social, diversão, conforto, energia, humor; popularidade e rejeição com setas; retrato circular com anel de cor; botões rápidos (conversar, observar, soprar no ponto, chamar ao confessionário).
- **Indicadores sobre a cabeça:** ícone pequeno de humor/necessidade crítica, balão de fala com legenda (fala por IA), anel de seleção no chão com a cor do participante.
- **Etiquetas de papel** em 3D: coroa/halo do líder, asa do anjo, escudo de imune, marca do paredão.
- **Barra inferior global:** dia, hora, velocidade, audiência, caixa, câmera atual, qualidade.
- **Modo "foco":** desfoque do fundo e destaque do personagem quando uma cena importante ocorre.
- **Legendas** estilo TV na parte inferior (nome do falante em cor própria).
- Todos os elementos do HUD escalam com a distância da câmera e nunca tampam a ação.

---

## 6. MUNDO 3D

### 6.1 Direção: semi-realista estilizado
Proporções humanas reais, **formas simplificadas**, materiais PBR suaves (pouco ruído de textura), **iluminação cinematográfica** e cor controlada. Não é fotorrealismo: é "produção de TV renderizada com carinho", legível de longe e bonita de perto.

### 6.2 Personagens
> **O detalhamento completo (rosto, olhos, pele, cabelo, corpo, mãos, roupas, marcas, estados, animação, editor, IA por texto e testes) está em `jogo-bbb-fazenda-personagens.md` e prevalece sobre esta seção.** O resumo abaixo é só referência rápida.

- Modelo modular único (corpo, rosto, cabelo, roupas, acessórios) com **editor de aparência**: tom de pele (paleta ampla), formato de rosto, olhos, sobrancelhas, nariz, boca, cabelo (estilos e cores), barba, maquiagem, tatuagens, óculos, altura e porte físico (vários biotipos).
- **Diversidade real** de corpos, idades, etnias e estilos; sem padronização de "modelo".
- Rosto com **blendshapes** para ~20 expressões (neutro, riso, choro, raiva, ciúme, vergonha, tédio, surpresa, deboche, cansaço…) e **lip-sync básico** por fonemas simplificados com a voz sintetizada.
- Animações: andar, correr, sentar, deitar, dormir, comer, beber, conversar (gestos por traço de personalidade), discutir, abraçar, dançar, comemorar, chorar, trabalhar (fazenda), cuidar de animais, provas (equilíbrio, arrastar, escalar, nadar, atirar).
- **Roupas** por contexto (casa, festa, prova, fazenda) e pela estação/tema; uniformes de prova por equipe com cor.
- Cabelo e roupa com simulação leve (secundária) apenas em qualidade Alta.

### 6.3 Casa (cenário)
- Arquitetura **contemporânea de alto padrão**, pé-direito alto, madeira, concreto polido, vidro, plantas, texturas quentes.
- Ambientes: sala (central, grande), cozinha, **quartos temáticos** (cada um com identidade de cor e cama diferente), banheiros, piscina e jardim, **confessionário** (luz teatral e fundo escuro), quarto do líder, **sala secreta/quarto branco**, área de provas, **mercado/despensa**.
- Detalhes que contam história: bagunça gerada pela simulação (louça suja, roupa no chão), decoração por tema da temporada, painel de LED com o logo.
- **Câmeras fixas visíveis** em locais coerentes (domos, hastes), com luz de tally.

### 6.4 Fazenda (cenário)
- Sede rústica-moderna, varanda, **baias, curral, galinheiro, chiqueiro, horta, pomar, lago, estrada de terra, fogueira, celeiro, mata ao fundo**.
- Vegetação com **vento**, grama instanciada, poeira, lama, água com reflexo, animais animados (cavalo, vaca, galinha, porco, cachorro).
- Estados visuais: **sujeira acumulada**, colheita crescendo, animais com fome/doentes.
- Estações e clima: sol forte, chuva, neblina da manhã, noite com lua e luzeiros.

### 6.5 Híbrido
Duas áreas conectadas com **transição de cenário** cinematográfica (travelling/corte), ou casa com área rural anexa. A paleta de materiais mistura madeira/concreto com palha/terra.

### 6.6 Arenas de prova
Módulos reaproveitáveis com **identidade de palco de game show**: iluminação colorida, tablado, luzes de LED, telões, arquibancada simulada. Tipos: pista de obstáculos, tanque d'água, travessia de equilíbrio, arena de lama, parede de escalada, estúdio de quiz, arena de memória (painéis luminosos), jogo de resistência (plataformas), cozinha de prova, baia de prova. Cada arena tem **luz-chave, contraluz e fumaça/partículas** próprias.

### 6.7 Estúdio do programa ao vivo
Palco com **telão curvo em LED**, escada de entrada, plateia em arquibancadas (instanciada), pódio do apresentador, **gráficos 3D flutuantes** do ibope, câmera robótica que se move (grua, dolly, panorâmica), luzes móveis (moving heads) que reagem ao ritmo da cena. O visual do estúdio **segue o tema da temporada**.

### 6.8 Iluminação e atmosfera
- Ciclo dia/noite com 6 presets: amanhecer, manhã, tarde, **hora dourada**, noite, madrugada.
- **Iluminação global aproximada:** lightmaps/probes + luz direcional + preenchimento de céu; **sombras suaves** em cascata.
- Luzes práticas (abajures, LED de piscina, fogueira, neon do tema) com bloom suave.
- Névoa volumétrica leve em ambientes noturnos e arenas.
- Cor de grade por **momento dramático** (frio na gestão, quente em afeto, avermelhado em tensão).

### 6.9 Câmeras e enquadramento
- **Câmeras de reality:** posições fixas, lentes largas, leve granulação e vinheta nas câmeras "de vigilância", com **timestamp** e marca de tally.
- **Câmera cinematográfica:** profundidade de campo, desfoque de movimento sutil, enquadramento por regra dos terços, cortes automáticos "de diretor" nos momentos de drama.
- **Câmera livre** do jogador com limites suaves, atalhos de salto entre ambientes e **modo foto** (para capturas e capas).
- Efeito "**lente de câmera de TV**" opcional: aberração cromática leve, bloom, leve vinheta.

### 6.10 Pós-processamento
Tone mapping filmico, bloom suave, SSAO, DOF seletivo, vinheta, correção de cor por tema, **grão leve**, anti-aliasing (SMAA/TAA). Cada efeito com chave de liga/desliga por qualidade.

### 6.11 Materiais e texturas
- PBR enxuto (cor, rugosidade, normal; metal só onde necessário), texturas em **atlas** e com compressão (KTX2/Basis).
- Biblioteca: madeira clara/escura, concreto, mármore, vidro, tecido, couro, palha, terra, grama, pedra, água, metal escovado, LED emissivo.
- Variantes por tema (troca de cor/emissivo sem trocar geometria).

### 6.12 Performance visual
- Orçamento: personagens ~25k triângulos (LOD0), cenário ~1,5M triângulos visíveis, ≤ 600 draw calls em qualidade Média.
- **LOD, instancing (grama, plateia, folhagem), occlusion culling, atlas, streaming por ambiente.**
- Qualidades: **Baixa** (sem sombras suaves/pós), **Média** (padrão), **Alta** (volumétrico, DOF, cabelo/roupa secundários), **Ultra** (opcional).
- Mostrar **medidor de FPS** nas configurações e sugerir qualidade automaticamente.

---

## 7. MOTION E EFEITOS

### 7.1 Princípios
- **Rápido e com propósito:** 120–200 ms (microinterações), 250–400 ms (painéis), 600–1200 ms (cenas), até 6 s (revelações dramáticas).
- Curvas: `cubic-bezier(.2,.8,.2,1)` (entrada), `cubic-bezier(.4,0,1,1)` (saída), **mola** para cartões e botões.
- **Coreografia:** elementos entram em cascata (stagger 40–60 ms), nunca todos ao mesmo tempo.
- Respeitar `prefers-reduced-motion`: trocar movimento por fade e remover shake/paralaxe.
- Animação **comunica estado** (nada puramente decorativo).

### 7.2 Microinterações
Botões com brilho que varre; números com **contagem animada** (rolling digits); barras que preenchem com easing; cartões que "viram" ao selecionar; ícones com pulso quando há novidade; badge AO VIVO pulsante; cursor com "mira" de câmera no mosaico; confete de pixels em conquistas.

### 7.3 Sequências cinematográficas

**Revelação do paredão (obrigatória, ~25–40 s):**
1. Corte para escuro; som grave. Os retratos dos indicados entram lado a lado, com **luz de spot** vindo de cima.
2. Apresentador em lower third; contagem de "votos computados" com **barra de carregamento** tensa.
3. Gráficos de porcentagem crescem em **disputa**, com ultrapassagens e vibração.
4. **Congelamento** (hold) de 1–2 s antes do resultado; luz do eliminado apaga e a do salvo acende (dourada).
5. Reação: close dos dois (expressão 3D), comentários da plateia flutuando, **reação da casa** em mosaico.
6. Saída do eliminado: câmera acompanha até a porta/estrada, vinheta de despedida com retrato e frase.
- Variantes: **paredão triplo** (3 colunas), **contragolpe** (corda/ligação puxando um retrato), **paredão falso** (corte para quarto secreto), **Telefone Misterioso** (tela vibra, toque e ícone gigante).

**Abertura do programa ao vivo:** vinheta do tema (logo explodindo em partículas), travelling pelo estúdio, apresentador entra, telão acende em sequência.
**Início de prova:** contagem 3-2-1 com números gigantes, luzes do palco, cor da equipe em varredura.
**Final da temporada:** pódio 3D, chuva de confete e papel dourado, câmera em órbita no campeão, créditos com retratos.
**Crise:** tela treme levemente, vinheta vermelha pulsa, painel de crise sobe com som de alerta.
**Troca de temporada/tema:** transição de cor + logo animada.

### 7.4 Transições de tela
- Navegação interna: *crossfade + deslocamento de 12 px* (200 ms).
- Entrada em tela cheia (câmera, ao vivo, paredão): **zoom-through** a partir do monitor clicado.
- Troca de ambiente 3D: corte cinematográfico com **wipe** do tema (barra luminosa).

### 7.5 Efeitos visuais
Partículas (confete, faíscas, poeira, vaga-lumes, chuva), **glitch controlado** em corte de câmera, **scanlines e granulação** leves nos monitores, **bokeh** de fundo em menus, god rays no estúdio, reflexos no chão do palco, **desfoque de movimento** em transições rápidas, distorção de calor no fogo.

---

## 8. ACESSIBILIDADE VISUAL
- Contraste mínimo AA em todos os temas; **modo alto contraste** dedicado.
- Paleta **segura para daltonismo** (tritanopia/deuteranopia/protanopia) com forma/ícone **além** da cor (nunca só cor).
- Tamanho de fonte ajustável (90–150%); espaçamento de linhas ajustável.
- **Reduzir movimento**, reduzir flashes (limite de 3 flashes/s), opção de desativar shake, grão e glitch.
- Legendas sempre disponíveis, com fundo e tamanho configuráveis.
- Foco de teclado sempre visível; alvos de clique ≥ 40×40 px.

---

## 9. PROMPTS PARA GERAR IMAGENS COM IA

> Use para criar **arte conceitual, logos, ícones, texturas, retratos, fundos e capas**. Gere em alta resolução, revise manualmente e **nunca** use nomes, logos, rostos ou marcas reais.

### 9.1 Guia de estilo (cole no início de todo prompt)
```
STYLE: futuristic broadcast control-room aesthetic, premium TV studio design,
dark navy base, glassmorphism panels, thin luminous lines, subtle neon accents
(cyan, violet, magenta, amber), cinematic lighting, clean modern typography,
high contrast, ultra-detailed, crisp, professional product design.
For human/world art: semi-realistic stylized 3D render, soft PBR materials,
cinematic warm key light with cool rim light, shallow depth of field.
```
**Negative prompt (todos):** `text artifacts, watermark, logo of real brand, real person, celebrity, distorted hands, extra fingers, low resolution, blurry, oversaturated, cluttered, stock photo look, cartoon clipart`.

### 9.2 Consistência
- Fixar **seed**, proporção e paleta por temporada; usar **imagem de referência de estilo** da capa da temporada em todos os prompts seguintes.
- Nomear cada asset com o padrão da seção 10; manter um `assets/prompts.json` com o prompt, seed, modelo e data de cada imagem.
- Gerar **4 variações**, escolher 1, e refinar por *inpainting*.

### 9.3 Lista de assets e prompts-modelo

**Logo do programa (por temporada)**
```
[STYLE] Logo concept for a Brazilian reality TV show called "{NOME}",
bold geometric wordmark with a stylized eye/lens symbol, luminous gradient
{COR1} to {COR2}, on a dark background, vector style, centered, minimal, iconic.
```
**Vinheta / keyart da temporada**
```
[STYLE] Epic key art for a reality show season "{NOME}", a modern glass house
and a rustic farm side by side under {HORARIO} sky, searchlight beams, silhouettes
of diverse people, cinematic wide shot 16:9, dramatic atmosphere, {PALETA}.
```
**Ícones (set)**
```
[STYLE] Icon set, 24px grid, 1.75px line, rounded corners, luminous cyan stroke on
dark, set of 12 icons: camera, telephone, button, crown, wing, shield, secret room,
trophy, heart, megaphone, lock, tractor. Consistent, flat, no gradients.
```
**Retratos de participantes (gerados a partir de descrição do editor)**
```
[STYLE] Semi-realistic stylized 3D portrait, {IDADE} year-old {DESCRIÇÃO FÍSICA},
{EXPRESSÃO}, wearing {ROUPA}, soft studio lighting, dark gradient background with
{COR DO PARTICIPANTE} rim light, shoulders-up, 4:5, no text.
```
**Fundos de menu e telas**
```
[STYLE] Abstract broadcast background, curved LED wall with soft gradients,
volumetric light, bokeh, wide 16:9, very dark, low contrast center for UI overlay.
```
**Texturas (tileable)**
```
Seamless tileable texture, {MATERIAL: warm oak wood | polished concrete | straw | red clay |
brushed metal | fabric}, top-down, even lighting, 2048x2048, PBR albedo, no seams, no text.
```
**Capas e thumbnails de provas**
```
[STYLE] Game show challenge key art: {TIPO DE PROVA: mud obstacle course | balance beam over
water | memory panel arena | cooking battle}, dramatic colored stage lights, dynamic angle,
16:9, no text.
```
**Selos de dinâmica (Telefone Misterioso, Botão Enigma, Contragolpe…)**
```
[STYLE] Emblem/badge illustration for the dynamic "{NOME}", central symbol {SÍMBOLO},
hex frame, glowing edges, dark background, 1:1, clean vector look.
```
**Fundos do estúdio ao vivo, telões e lower thirds**
```
[STYLE] Futuristic TV studio set with curved LED wall, glossy stage floor reflections,
spot lights, smoke, empty audience seats, wide shot, {PALETA DA TEMPORADA}.
```
**Estátuas/troféus do Hall da Fama**
```
[STYLE] Product render of a gold trophy shaped like {SÍMBOLO DA TEMPORADA}, on a dark pedestal,
spot lighting, reflections, centered, 1:1, premium.
```

### 9.4 Geração por IA **dentro do jogo**
- Retratos e capas gerados sob demanda a partir do **Editor de Participantes** e do **Gerador de Tema**, sempre com **prévia e aprovação**, cache local e limites de custo.
- Todo prompt in-game é montado por template (seção 9.3) + dados do participante/tema, passando pelo **filtro de segurança** (sem pessoas reais, sem marcas, sem conteúdo explícito).

---

## 10. ESTRUTURA DE ASSETS E CONVENÇÕES

```
/assets
  /themes        -> aurora.json, brasa.json, savana.json, ...
  /fonts
  /icons         -> svg/ (24px), sprite.svg
  /ui            -> frames, cantos chanfrados, texturas de vidro, ruído/grão
  /images
    /keyart      -> {tema}/keyart-16x9.webp, logo.svg
    /portraits   -> {seasonId}/{participantId}.webp
    /backgrounds
    /challenges  -> thumbs 16:9
    /badges
  /textures      -> {material}_albedo|normal|rough.ktx2
  /models        -> .glb (draco/meshopt), /characters, /house, /farm, /arenas, /studio
  /animations    -> .glb com clips (idle, walk, talk, ...)
  /vfx           -> sprites, flipbooks, shaders (.glsl)
  /prompts.json  -> registro de prompts de imagens geradas por IA
```
- Nomes em `kebab-case`; versões `v01`, `v02`.
- Imagens em **WebP/AVIF**, 3D em **GLB com Draco/Meshopt**, texturas **KTX2**.
- **Style guide interativo** (Storybook ou rota `/style-guide`) mostrando tokens, componentes, estados, temas e testes de contraste.

---

## 11. FASES DO VISUAL (ROTEIRO)

### V0 — Fundação visual
Tokens (CSS variables + Tailwind), tipografia, grid, vidro fosco, chanfros, ícones base, modo claro/escuro, **style guide** funcionando, 2 temas (Aurora e Solar).
**Aceite:** style guide navegável, contraste AA validado por script.

### V1 — Componentes e moldura de estúdio
Todos os componentes da seção 3.5, **moldura de estúdio** (barra superior, lateral, controle de tempo, ticker), cartões de decisão, lower third, medidores e gráficos.
**Aceite:** montar uma tela de teste com todos os componentes sem inconsistências.

### V2 — Telas principais
Menu, wizard, Central do Diretor, Painel/Ficha de Participantes, Mapa Social.
**Aceite:** fluxo "criar temporada → ver dashboard → abrir ficha" com visual final.

### V3 — Mundo 3D: casa e personagens
Casa completa, iluminação e ciclo dia/noite, câmeras, personagens com editor de aparência, expressões, animações base, HUD 3D estilo Sims.
**Aceite:** 20 personagens vivendo na casa a 60 FPS em Média, HUD legível.

### V4 — Sala de Controle, provas e estúdio
Mosaico de câmeras com tally, arenas de prova, estúdio ao vivo, telão e gráficos 3D.
**Aceite:** assistir uma prova e o programa ao vivo com visual de produção de TV.

### V5 — Motion e sequências
Todas as microinterações, transições, **revelação do paredão (e variantes)**, abertura, final, crise, partículas e glitch.
**Aceite:** sequência do paredão fecha em 25–40 s com impacto dramático e opção de pular.

### V6 — Fazenda, híbrido e temas por temporada
Cenário da fazenda completo (estações e clima), transições híbridas, 6 temas, **gerador de tema por IA**, geração de retratos/logos in-game com prévia.
**Aceite:** trocar de tema/temporada muda interface, luz do mundo, logo e vinheta sem recarregar.

### V7 — Polimento e acessibilidade
Níveis de qualidade, desempenho, alto contraste, daltonismo, reduzir movimento, densidade, tela cheia "Broadcast", ajustes finais, **auditoria visual completa**.
**Aceite:** checklist da seção 12 aprovada.

---

## 12. CHECKLIST DE QUALIDADE VISUAL

- [ ] Todas as cores, fontes e espaçamentos vêm de tokens.
- [ ] Todo tema passa em contraste AA.
- [ ] Nenhuma tela tem mais de **3 níveis de hierarquia** competindo.
- [ ] Ações perigosas/custosas sempre mostram custo e risco.
- [ ] Todo estado (hover, foco, carregando, vazio, erro, desabilitado) está desenhado.
- [ ] Animações respeitam "reduzir movimento".
- [ ] 60 FPS em qualidade Média com 20 personagens e HUD ligado.
- [ ] Cenas 3D legíveis sem HUD e bonitas em modo foto.
- [ ] Nada de marca, logo, rosto ou nome real em qualquer asset.
- [ ] Style guide cobre 100% dos componentes.

---

## 13. COMEÇAR AGORA

Inicie pela **V0**. Ao concluir, apresente um resumo curto, como abrir o style guide e as decisões tomadas. **Aguarde** o comando "próxima fase" antes de continuar.
