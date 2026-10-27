# PROMPT DE PERSONAGENS — "DIRETOR DO REALITY"

> Capítulo dedicado ao **visual dos personagens** (participantes, apresentador, convidados, equipe). Complementa `jogo-bbb-fazenda-visual.md` e, em caso de conflito sobre personagens, **este documento prevalece**. Tudo fictício: nenhum personagem pode copiar rosto, nome, marca ou aparência de pessoa real.

---

## 0. COMO USAR

Você é um **character artist sênior + artista técnico (rigging/shaders) + designer de UX de editor**. Construa o sistema de personagens por fases (C0 a C8, seção 15). Em cada fase entregue: o que foi feito, imagens/descrição de testes, como abrir o editor e o que falta.

Regras fixas:
1. **Uma base, infinitas pessoas:** um único corpo/cabeça base com *morph targets* (blendshapes) e materiais parametrizados gera todo o elenco.
2. **Tudo é parâmetro** e vive no `CharacterSpec` (JSON, seção 12). Nada de personagem "hardcoded".
3. **Detalhe onde o olho vai:** rosto, olhos, mãos e cabelo recebem o maior orçamento; o resto é eficiente.
4. **Legível de longe e bonito de perto:** o personagem precisa ser reconhecível na câmera de vigilância, no HUD e no retrato.
5. **Diversidade real e respeitosa**, sem caricatura e sem estereótipo.
6. **Pele suave e estilizada** (decisão do projeto): acabamento limpo de render de TV, sem poros marcados.

---

## 1. DIREÇÃO DE ARTE DO PERSONAGEM

**Conceito: "gente de verdade, polida pela TV".** Proporções humanas reais, formas simplificadas, pele macia e luminosa, olhos expressivos, cabelo com volume e brilho, roupas com caimento convincente.

| Regra | Definição |
|---|---|
| Proporção | Adulto de **7,5 cabeças** em média (variável por biotipo e idade) |
| Silhueta | Cada personagem reconhecível só pela silhueta (cabelo, ombros, postura) |
| Formas | Volumes suaves, transições limpas, sem exagero de "boneco" |
| Pele | Subsurface leve, brilho suave, **sem poros**; imperfeições só como marcas deliberadas (sardas, pintas, manchas, cicatrizes) |
| Olhos | O ponto mais detalhado do rosto (reflexo, umidade, íris com profundidade) |
| Cor | Saturação controlada; pele sempre com subtom (quente/frio/neutro/oliva) |
| Luz | Testado com 6 setups (estúdio, noite quente, câmera de vigilância, palco, sol forte, contraluz) |

**Faixa etária:** 18 a 80 anos (slider contínuo). **Altura:** 1,45 m a 2,05 m. **Peso/porte:** do muito magro ao corpulento, com musculatura independente.

---

## 2. PIPELINE TÉCNICO

### 2.1 Base modular única
- **Malha base** de corpo inteiro (cabeça, tronco, braços, mãos, pernas, pés) em **topologia limpa** para animação (loops em olhos, boca, ombros, cotovelos, joelhos).
- **Morph targets (blendshapes):** morfologia do corpo (~60), do rosto (~120), idade e peso; mais **~60 de expressão** (seção 5.4).
- **Rig humanoide** compatível com bibliotecas de animação (esqueleto de ~65 ossos + ossos faciais e de dedos), **retargeting** para qualquer personagem gerado.
- **Exportação/uso:** GLB com compressão Draco/Meshopt; texturas KTX2; carregamento por demanda no navegador (Three.js/R3F).
- **Troca de roupas e cabelo:** peças separadas, **ajustadas ao corpo por morphs próprios** (cada peça traz os mesmos blendshapes de corpo para acompanhar o personagem) e *skinning* ao mesmo esqueleto.

### 2.2 Níveis de detalhe (LOD)
| LOD | Uso | Triângulos (corpo+cabelo+roupa) | Ossos faciais ativos |
|---|---|---|---|
| LOD0 | Retrato, ficha, close, estúdio | até **28 k** | todos |
| LOD1 | Câmera média, casa | ~**14 k** | reduzidos |
| LOD2 | Câmera distante, mosaico | ~**6 k** | só mandíbula/olhos |
| LOD3 | Multidão/plateia | ~**1,5 k** (instanciado) | nenhum |

### 2.3 Texturas e materiais
- **Atlas de 2048²** (LOD0) por personagem, com corpo (albedo + normal suave + máscara de região), roupas em atlas próprio por peça.
- **Máscaras por região** (rosto, lábios, olhos, mãos, corpo) para aplicar **rubor, suor, sujeira, tatuagem e maquiagem** por *decals* e shader, sem trocar textura base.
- **Shader de pele (parametrizado):** `tom base + subtom + rubor + luminosidade + oleosidade + sardas/pintas + vitiligo/manchas + sol (marca de biquíni/bronzeado) + sujeira + suor + molhado`.
- Orçamento: personagem completo ≤ **6 materiais**, ≤ **8 MB** de textura em memória (Média).

### 2.4 Orçamento de cena
- 20 personagens visíveis em LOD1/LOD2 a **60 FPS** em PC comum; **limite de LOD0 simultâneos: 3**.
- *Instancing* para plateia e figurantes, *impostors* para distância máxima.

---

## 3. CORPO: BIOTIPOS E PROPORÇÕES

### 3.1 Estrutura de sliders do corpo (0 a 100, com centro neutro em 50)
**Escala geral:** altura, massa geral, comprimento do tronco, comprimento das pernas, comprimento dos braços.
**Morfologia (espectro contínuo):** *masculino ↔ feminino* (um eixo de **tendência de estrutura corporal**, independente de identidade de gênero) e *magro ↔ corpulento*.
**Tronco:** largura dos ombros, caixa torácica, peitoral, busto/volume do peito, cintura, abdômen, costas, curvatura da coluna (postura), largura do quadril, glúteos.
**Braços:** circunferência de braço, antebraço, definição de bíceps/tríceps, tamanho das mãos.
**Pernas:** coxa, panturrilha, joelhos, tornozelos, tamanho dos pés, arco do pé.
**Pescoço:** comprimento, espessura, trapézio.
**Gordura e músculo independentes:** `massa magra` e `gordura` separadas (permite atlético, "forte" e "magro definido", "gordinho", "musculoso com barriga" etc.), e **distribuição de gordura** (abdominal, quadril, coxa, braços, rosto).
**Postura:** ombros caídos/retos, cabeça projetada, coluna (cifose/lordose leve), pés para dentro/fora, quadril inclinado.
**Idade:** afeta gordura, firmeza, ombros, postura, pele e cabelo (seção 4.6).

### 3.2 Biotipos prontos (presets, todos ajustáveis)
Esguio, atlético, nadador, halterofilista, lutador, dançarino, curvilíneo, ampulheta, pera, maçã, retangular, triângulo invertido, robusto, corpulento forte, plus size, baixo e compacto, alto e magro, idoso ativo, idoso frágil, adolescente tardio (18–20), adulto jovem, meia-idade, maduro.

### 3.3 Mãos e pés (atenção especial)
- **Mãos de alta qualidade (as mais visíveis em close):** 5 dedos com articulações marcadas, unhas com forma (curta, longa, quadrada, amendoada, redonda, stiletto leve), esmalte e nail art, comprimento, cutículas suaves, veias sutis opcionais, calos (fazenda), manchas de sol, anéis.
- **Poses de mão** (biblioteca): relaxada, apontando, punho, aberta, segurando copo/prato/talheres/celular de cena/ferramentas, gesticulando (15 variações), cruzada, na cintura, no bolso, abraçando.
- **Pés:** formato, dedos, calcanhar, **pés sujos (fazenda)**, esmalte, marcas de chinelo.

### 3.4 Variações e acessibilidade (representação respeitosa)
Opções de **traços reais da população**, aplicáveis como parâmetros: óculos de grau, aparelho auditivo/implante, **prótese** (braço/perna), **cadeira de rodas e bengala/muleta** (com animação e interação com o cenário), nanismo e acondroplasia (com proporção própria), **vitiligo, albinismo, hiperpigmentação**, estrabismo leve, fenda labial reparada (cicatriz), **cabelo ralo/calvície/alopecia**, queimaduras antigas, estrias, celulite, marcas de acne, pés chatos. Sempre com dignidade, nunca como piada ou "vilão".

---

## 4. ROSTO

### 4.1 Estrutura geral (sliders de 0 a 100)
- **Crânio e silhueta:** largura, altura, profundidade, formato (oval, redondo, quadrado, retangular, coração, diamante, triangular).
- **Testa:** altura, largura, inclinação, projeção das arcadas.
- **Têmporas e maçãs do rosto:** projeção, altura, largura.
- **Bochechas:** volume, "covinha", sulco nasolabial (profundidade).
- **Mandíbula e queixo:** largura da mandíbula, ângulo, projeção do queixo, queixo bipartido/covinha, papada.
- **Orelhas:** tamanho, ângulo (aba), lóbulo (solto/preso), formato.
- **Pescoço e pomo de adão:** presença conforme estrutura.

### 4.2 Olhos (o mais caprichado)
**Forma (morph):** tamanho, largura, altura de abertura, distância entre os olhos, inclinação (canto externo para cima/baixo), profundidade (fundo/saltado), **dobra palpebral** (mono, dupla, encoberta, aparente), pálpebra superior e inferior, bolsas e olheiras, cílios (comprimento, densidade, curvatura).
**Globo ocular (shader próprio, fiel e bonito):**
- **Esclera:** tom (branco, levemente amarelada, avermelhada se cansado), veias sutis, sombra de pálpebra.
- **Íris:** diâmetro, **cor base + cor secundária (anel/halo)**, padrão (fibras radiais, manchas), **anel límbico** escuro, paleta (castanho claro/médio/escuro, mel, verde, azul, cinza, âmbar, heterocromia leve).
- **Pupila:** dilata/contrai com luz e emoção (parâmetro dinâmico), tamanho base.
- **Córnea:** camada refrativa com **reflexo (catchlight)** coerente com a luz da cena, **umidade** (brilho nas bordas e linha de lágrima).
- **Sombreamento:** *ambient occlusion* do canto e da pálpebra sobre o globo.
- **Movimento:** sacadas, *look-at* com atraso natural, convergência, **piscar** (frequência por estado emocional), olhar para o interlocutor/tela/objeto.
**Sobrancelhas:** posição, espessura, arco, ângulo, densidade, cor (independente do cabelo), falhas, tipos (retas, arqueadas, "bem desenhadas", finas, naturais, grossas), movimento expressivo.

### 4.3 Nariz, boca, dentes
- **Nariz:** comprimento, ponte (altura/largura), ponta (arredondada/fina/larga/arrebitada), asas, narinas, projeção, desvio leve, perfil.
- **Boca:** largura, altura dos lábios (superior/inferior, separados), **arco do cupido**, comissuras (para cima/baixo), filtro labial, definição do contorno, cor e brilho dos lábios (natural, gloss, batom).
- **Dentes e língua:** alinhamento, tamanho, cor (de branco a levemente amarelado), espaçamento (diastema), **aparelho ortodôntico**, dente faltando, canino; língua visível na fala e em gestos.
- **Pele ao redor:** sulcos e **linhas de expressão que aparecem só com movimento** (testa, pés de galinha, nasolabial), mais marcadas com a idade.

### 4.4 Tons e características de pele (sem poros)
- **Tom (24 tons base)** de muito claro a muito escuro, mais **subtom** (rosado, dourado, oliva, neutro, azulado) e **luminosidade**.
- **Camadas parametrizáveis:** rubor (bochechas, nariz, orelhas, colo), olheiras, lábios mais escuros/claros, **sardas** (densidade, tamanho, região), **pintas** (posição manual), **manchas** (melasma), **vitiligo** (padrão e extensão), **marca de sol/bronzeado** (marca de biquíni/regata/camisa), acne leve, estrias, cicatrizes, veias aparentes leves, sombra de barba, brilho (oleosidade) e **textura suave** (cetim).
- **Maquiagem (camada):** base, sombra, delineador, cílios, blush, batom, contorno, unhas, **estilos prontos** (natural, festa, drama, palco) e editor livre.
- **Teste de tons:** o editor mostra a pele sob **6 iluminações** para garantir que tons escuros não percam detalhe e tons claros não estourem.

### 4.5 Expressões e emoção (ARKit-compatível + extras)
- **Blendshapes base:** conjunto de ~52 *action units* (olhos, sobrancelhas, bochechas, nariz, boca, mandíbula, língua).
- **Extras específicos de reality (~10):** sorriso falso (assimétrico), olhar de lado, olho que "revira", lábio mordido, nariz franzido de nojo, queixo tremendo, lágrima a ponto de cair, **sorriso de deboche**, cara de choro engolido, sobrancelha única arqueada.
- **Expressões prontas (30+):** neutro, riso solto, sorriso, sorriso tímido, gargalhada, choro, choro contido, soluço, raiva, fúria, desprezo, ciúme, inveja, vergonha, constrangimento, tédio, cansaço, surpresa, susto, medo, nojo, alívio, orgulho, saudade, culpa, tristeza, preocupação, malícia, deboche, confiança, dúvida, concentração, esforço de prova, dor, euforia.
- **Intensidade 0–100** e **mistura de duas emoções** (ex.: riso nervoso = alegria + medo).
- **Microexpressões** (50–120 ms) disparadas pela simulação (ex.: ouviu uma fofoca → flash de surpresa/alegria maliciosa).
- **Linguagem do rosto por personalidade:** extrovertido (mais amplitude), reservado (microexpressões sutis), dissimulado (sorriso que não chega aos olhos), explosivo (picos rápidos).
- **Lip-sync:** ~15 *visemes* mapeados à voz sintetizada, **com coarticulação** e suavização, ajuste de **intensidade por emoção** (gritar, sussurrar, chorar falando).
- **Sistema de respiração e piscar** sempre ativos (camada aditiva), inclusive em personagens parados.

### 4.6 Idade no rosto e no corpo
Slider contínuo **18 → 80**: suavização do volume, descida de bochecha e sobrancelha, **linhas de expressão** progressivas, olheiras/bolsas, papada, **cabelo grisalho** (raiz e mechas), diminuição de volume de lábios, postura, pigmentação (manchas senis), mãos com veias e manchas, perda de densidade capilar. Também **rejuvenescimento** para participantes jovens (18–22).

---

## 5. CABELO E PELOS

### 5.1 Tipos de fio (classificação)
Liso (1A–1C), ondulado (2A–2C), cacheado (3A–3C), **crespo/coily (4A–4C)**, misto, com volume, fino a grosso (espessura), baixa a alta densidade, ralo, com entradas, calvície masculina padrão, **alopecia** e cabelo muito curto.

### 5.2 Estilos prontos (50+, cada um com variações de comprimento/volume)
**Curtos:** raspado, buzz, militar, curtinho feminino (pixie), chanel curto, corte baixo degradê (*fade*), undercut, topete, moicano, **black power curto**, corte natural curto.
**Médios:** bob, long bob, shaggy, repicado, franjão, ondulado médio, **cacheado médio (cachos definidos)**, crespo médio com volume, **topete cacheado**.
**Longos:** liso longo, ondulado longo, **cacheado longo**, crespo longo, em camadas, com franja cortina, **degradê longo**.
**Penteados:** rabo de cavalo (alto/baixo), maria-chiquinha, **coque (alto, baixo, "bagunçado")**, coque samurai, **tranças** (nagô/embutidas, box braids, tranças soltas, tranças em coroa, trança lateral, trança única), **twist**, **dreads** (curtos, longos), **bantu knots**, afro puff, **cabelo preso para prova** (touca, lenço, boné, faixa), trança de lado, cabelo molhado/penteado para trás.
**Barba e pelos faciais:** barba por fazer (3 níveis), barba curta, barba cheia, barba longa, cavanhaque, bigode (fino, grosso, "de lado"), costeletas, barba desenhada, cavanhaque tipo "pera", queixo liso. **Pelos corporais:** braços, pernas, peito, axilas, com densidade por região (e opção sem).
**Sobrancelhas e cílios** independentes do cabelo.

### 5.3 Cor e acabamento
- **Cor natural:** preto, castanhos (escuro, médio, claro), loiros (escuro a platinado), ruivos (acobreado a ruivo vivo), cinza e branco.
- **Tintura:** cores vivas (azul, rosa, verde, roxo, vermelho), **mechas**, **luzes**, **ombré**, *balayage*, **raiz crescida**, descoloração, tons de fantasia por tema.
- **Brilho/reflexo:** brilho anisotrópico (faixa de luz), **frizz**, volume, ondulação, *flyaways* (fios soltos leves), umidade (cabelo molhado escurece e gruda), sujeira/poeira (fazenda), gel/cera.

### 5.4 Técnica
- **Hair cards** + shader anisotrópico (Kajiya-Kay/Marschner simplificado) para estilos longos/cacheados; **malha escultural** (sólida) para raspados, *fades*, tranças justas e dreads.
- **Física leve** (ossos secundários) em rabo, tranças longas, cabelo solto, barba longa (apenas LOD0/1, qualidade Alta).
- **Contagem:** cabelo ≤ **9 k triângulos** em LOD0; texturas de máscara de fio, raiz-ponta, ID e opacidade.
- **Crescimento ao longo da temporada:** o cabelo e a barba **crescem** com o tempo (mais volume, raiz aparece, barba cresce). O diretor pode contratar cabeleireiro/barbeiro para **mudar o visual** (evento de transformação).

---

## 6. ROUPAS, ACESSÓRIOS E MARCAS NA PELE

### 6.1 Sistema de camadas
`roupa íntima/base` → `camada 1 (camiseta, regata, blusa, vestido)` → `camada 2 (calça, short, saia)` → `camada 3 (jaqueta, moletom, casaco, colete)` → `calçado` → `acessórios`. Cada peça tem **cor, estampa, tecido, caimento, tamanho** e **versão por biotipo** (via morphs).

### 6.2 Guarda-roupa por situação
| Situação | Peças |
|---|---|
| **Dia a dia na casa** | camisetas, regatas, moletom, bermuda, legging, jeans, vestido leve, chinelo |
| **Dormir** | pijama, camisola, moletom, meias |
| **Piscina/sol** | maiô, biquíni, sunga, short de banho, saída de praia, boné, óculos de sol |
| **Festa** | vestido de festa, terno, conjunto social, macacão, salto/sapato, acessórios elaborados |
| **Prova** | uniforme de prova por equipe (cor), roupa de esporte, colete, capacete, joelheiras |
| **Fazenda** | botas, camisa xadrez/jeans, chapéu de palha, avental, macacão, luvas, perneiras |
| **Confessionário** | roupa do dia, close com iluminação teatral |
| **Programa ao vivo (eliminados/entrevistas)** | look de gala por tema da temporada |
| **Apresentador** | **guarda-roupa próprio** (ternos, vestidos, looks de temporada) |

### 6.3 Estilos por personalidade (sugestão automática, editável)
Esportivo, casual relaxado, elegante clássico, moderno urbano, boho, romântico, alternativo/rock, rural/country, minimalista, extravagante/glam, nerd/colorido. A IA sugere o guarda-roupa conforme personalidade, profissão e história de vida.

### 6.4 Tecidos e materiais
Algodão, jeans, linho, seda/cetim, couro, lã, moletom, lycra, renda, tule, veludo, nylon, borracha, palha. Shader com **brilho, rugosidade, trama, transparência e amassados**, **cor por camada**, **estampas** (liso, listras, xadrez, floral, poá, geométrico, tie-dye, frases genéricas sem marca).
**Estados dinâmicos da roupa:** molhada (escurece e gruda), suada (marcas), suja (lama, poeira, comida), amassada, rasgada (prova/briga), **manchas de comida**, rastro de grama/barro, desbotamento ao longo da temporada.

### 6.5 Acessórios
**Cabeça:** bonés (reto, curvo, trucker), chapéus (palha, feltro), bandana, lenço, faixa, tiara, touca, fones. **Rosto:** óculos de grau (10 formatos), óculos de sol, lentes, **piercings** (nariz, sobrancelha, lábio, orelha, língua), *brincos* (argola, pérola, ponto de luz, longo), **aparelho dentário**. **Pescoço/tronco:** colares, correntes, gargantilhas, lenço, gravata, gravata-borboleta, cachecol, suspensório, cinto. **Mãos/pulsos:** anéis, pulseiras, relógios (analógico/digital), luvas. **Outros:** bolsa, mochila, crachá do programa, **microfone de lapela** (nos momentos de gravação), **tornozeleira**.
Marcas genéricas apenas; **sem logos reais**.

### 6.6 Tatuagens, cicatrizes e marcas
- **Tatuagens (decals editáveis):** posição (braço, antebraço, costas, peito, perna, tornozelo, pescoço, mão), **estilos** (tribal geométrico, floral, minimalista, fine line, aquarela, realismo, letras/frases), tamanho, rotação, opacidade, cor (preto, colorido, desbotado), **envelhecimento** (desbotar com sol e tempo), importação de imagem própria (com filtro de segurança).
- **Cicatrizes:** cirurgia, corte, queimadura, pequenas marcas de infância, estrias, hematomas, arranhões, **marcas de prova** (roxos, esfolados) que aparecem após eventos e cicatrizam com o tempo.
- **Marcas de sol e bronzeado:** acompanham piscina/fazenda ao longo da temporada.
- **Maquiagem e unhas** (seção 4.4 e 3.3).

---

## 7. ESTADOS VISUAIS DINÂMICOS (SIMULAÇÃO → APARÊNCIA)

A simulação alimenta o visual. Cada estado muda **rosto, corpo, pele, cabelo e roupa**:

| Estado da simulação | Efeito visual |
|---|---|
| Fome alta | rosto levemente abatido, postura caída, olhar para a cozinha, estômago "roncando" (animação) |
| Sono/cansaço | olheiras, pálpebras pesadas, piscar lento, bocejo, postura curvada, olhos avermelhados |
| Estresse | testa franzida, mandíbula travada, ombros tensos, microexpressões, respiração curta |
| Raiva | rosto vermelho (rubor), sobrancelhas baixas, narinas dilatadas, gestos largos |
| Tristeza/choro | olhos vermelhos e inchados, lágrimas, nariz escorrendo, cabeça baixa |
| Alegria/euforia | olhos brilhantes, bochechas altas, postura aberta, gestos amplos |
| Vergonha | rubor intenso, olhar desviado, mão no rosto |
| Doença | palidez, olheiras, suor frio, tosse, andar lento |
| Ressaca/after party | rosto inchado, olhos vermelhos, cabelo bagunçado, roupa amassada |
| Higiene baixa | cabelo oleoso, suor, brilho na pele, odor visual (partícula leve) |
| Higiene alta/recém-banho | cabelo molhado/arrumado, pele luminosa |
| Exercício/prova | suor, respiração pesada, peito subindo, cabelo grudado |
| Lama/sujeira | camadas de sujeira por região (pés, joelhos, mãos, rosto) |
| Sol forte | rubor, queimadura leve, suor, marca de bronzeado |
| Frio | arrepio, ombros encolhidos, nariz vermelho, respiração visível |
| Atração/romance | olhar mais longo, sorriso suave, rubor leve, pupila levemente dilatada |
| Mentindo/dissimulando | microexpressão de controle, olhar desviado, toque no rosto |

Cada estado tem **intensidade** (0–100) e **decaimento** (o suor seca, o choro passa). Estados se **combinam** (cansado + estressado + com fome) com prioridade e limite para não virar "caricatura".

---

## 8. ANIMAÇÃO E LINGUAGEM CORPORAL

### 8.1 Rig e técnica
- Esqueleto humanoide com **IK** (pés, mãos, olhar, cabeça), **ossos de dedo individuais**, ossos faciais, ossos secundários (cabelo, roupa solta), **pose de corpo por morph de postura**.
- **Retargeting automático** para qualquer biotipo (altura, braços, pernas).
- **Camadas:** base (locomoção/ação) + **aditiva** (respiração, olhar, gestos de fala, tremor, tensão) + **facial** + **reação** (susto, vergonha, riso).

### 8.2 Biblioteca de clips (mínimo 150)
**Locomoção:** parado (6 variações por humor), andar (normal, cansado, animado, furioso, tímido, sorrateiro), correr, subir/descer, **abaixar**, sentar/levantar, deitar/levantar, virar, esperar.
**Rotina:** comer (4), beber, cozinhar, lavar louça, tomar banho (silhueta), escovar dentes, arrumar cabelo, maquiar, vestir/trocar de roupa, **dormir (6 posições)**, ler, usar caderno/celular de cena, treinar (flexão, agachamento, alongar), dançar (10), cantar, tocar violão/pandeiro, jogar cartas/jogos de mesa.
**Social:** conversar (por postura e personalidade), ouvir, concordar/discordar, **sussurrar**, rir (5), chorar (4), abraçar (sincronizado), consolar, **discutir (6 níveis)**, empurrar (leve) *(sem violência gráfica)*, apontar, ignorar, **cutucar**, comemorar, bater palma, dar as mãos, brindar, flertar.
**Fazenda:** alimentar animais, ordenhar, carregar balde/saco/feno, plantar, colher, varrer, tratar cavalo, lidar com galinhas, acender fogueira, cortar lenha *(simplificada)*, limpar baia.
**Provas:** equilibrar, escalar, nadar, arrastar, puxar corda, atirar, memorizar (olhar e apontar), resistir (segurar posição), cair, levantar, comemorar vitória, lamentar derrota.
**Estúdio:** entrar no palco, receber resultado (alívio/queda), ser eliminado (andar até a saída), entrevista (sentado, em pé), cumprimentar a plateia.
**Apresentador:** abertura, anúncio dramático, pausa de suspense, olhar para a câmera, gestos de revelação, entrevista, despedida.

### 8.3 Linguagem corporal por personalidade (camada aditiva)
Extrovertido (gestos amplos, ocupa espaço), introvertido (braços junto ao corpo, olhar baixo), líder (ombros abertos, passo firme), dissimulado (gestos "fechados", sorriso controlado), nervoso (mexe nas mãos, rói unha, perna balançando), vaidoso (arruma cabelo, olha reflexo), preguiçoso (arrasta os pés, desaba no sofá), explosivo (gestos bruscos), carinhoso (toca o outro com frequência).

### 8.4 Interação espacial
- **Proxêmica:** distância entre personagens varia por relação (intimidade, amizade, rivalidade). Orientação do corpo para quem importa.
- **Olhar:** *look-at* coerente com a conversa, contato visual intermitente.
- **Contato:** abraços, mãos nos ombros e toques **com IK** sem atravessar corpos.
- **Interação com objetos:** sentar em cadeiras/sofás de qualquer biotipo (ajuste), segurar utensílios, abrir portas, cuidar de animais.

---

## 9. APRESENTADOR, EQUIPE E CONVIDADOS

- **Apresentador (fictício):** personagem de **alto detalhe sempre em LOD0** no estúdio, guarda-roupa de temporada, gestos próprios, voz sintetizada própria, **bordões** definidos pela IA.
- **Equipe de produção:** variações de figurino (camisetas do programa, fones, crachás), aparecem em bastidores e nas provas.
- **Convidados e familiares:** gerados pelo mesmo editor, com **parentesco visual** (traços compartilhados com o participante, via "herança" de morphs com variação).
- **Plateia:** instanciada, variada por cor/roupa/gênero/idade/estilo, **reage** (palmas, vaias, silêncio) por animações em lote.

---

## 10. EDITOR DE PERSONAGEM (UX)

### 10.1 Layout
```
┌──────────────────────────────────────────────────────────────────┐
│ ◀ Voltar   Nome do participante   [🎲 Aleatório] [✨ Descrever com IA] │
├───────────────┬──────────────────────────────┬───────────────────┤
│ CATEGORIAS    │      PREVIEW 3D (turntable)  │  PAINEL DE SLIDERS│
│ ▸ Geral       │   zoom no rosto/corpo/mãos   │  (da categoria)   │
│ ▸ Corpo       │   luz: estúdio/noite/palco   │  valores + reset  │
│ ▸ Rosto       │   poses e expressões         │  travar ✔         │
│ ▸ Olhos       │   fundo neutro/tema          │  presets          │
│ ▸ Pele        │                              │                   │
│ ▸ Cabelo      │  [retrato 4:5] [corpo todo]  │                   │
│ ▸ Pelos       │  [comparar com versão salva] │                   │
│ ▸ Roupas      │                              │                   │
│ ▸ Acessórios  │                              │                   │
│ ▸ Marcas      │                              │                   │
│ ▸ Voz         │                              │                   │
├───────────────┴──────────────────────────────┴───────────────────┤
│ Desfazer ↶  Refazer ↷   Salvar preset   Exportar JSON   Aplicar ✔ │
└──────────────────────────────────────────────────────────────────┘
```
### 10.2 Recursos
- **Câmera inteligente:** ao mexer em olhos, a câmera faz zoom nos olhos; em mãos, nas mãos; em cabelo, na cabeça.
- **Pré-visualização de expressão e pose** em qualquer momento, com **teste de fala** (lip-sync).
- **Travar partes** (travar rosto e randomizar o resto), **herança** (misturar dois personagens em uma proporção) e **gêmeos/irmãos** (variação controlada).
- **Comparar** antes/depois, **histórico** de versões, desfazer ilimitado.
- **Teste de iluminação** (6 presets) e **teste de distância** (como aparece no LOD2 do mosaico).
- **Presets por categoria** (rostos, penteados, tatuagens, looks) com miniaturas.
- **Importar/exportar** `CharacterSpec` em JSON; **biblioteca** de personagens salvos; **elenco em lote** (gerar 20 de uma vez, com regras de diversidade).
- **Validador:** aponta problemas (rosto muito igual a outro, contraste de cor fraco no HUD, peça atravessando o corpo).

### 10.3 Criação por IA a partir de texto
Entrada: *"Mulher de 27 anos, professora de educação física do interior de Goiás, pele morena clara com sardas, cabelo cacheado volumoso castanho com mechas douradas, sorriso largo, corpo atlético, estilo esportivo, tatuagem pequena de flor no tornozelo"*.
Fluxo: **IA → `CharacterSpec` JSON validado por schema → prévia 3D → ajustes manuais → aprovação**. A IA também sugere **personalidade, voz, guarda-roupa e estilo de animação** coerentes.
**Guardas:** não aceitar nome/aparência de pessoa real ("parecido com [celebridade]"), nem conteúdo sexualizado/ofensivo; **menores de 18 anos são bloqueados** (o jogo é só para adultos).

---

## 11. RETRATOS E MATERIAL 2D DERIVADO DO 3D

- **Estúdio de retratos** automático (câmera 85 mm, luz de 3 pontos, fundo gradiente do tema) que gera: **retrato 4:5** (ficha), **avatar circular** (HUD/grafo), **busto** (paredão), **corpo inteiro** (cartão de elenco), **close dos olhos** (capa de crise) e **expressões-chave** (alegria, choro, raiva, surpresa) para **telas e redes sociais**.
- **Spritesheet de reações** (emojis personalizados do participante) para a rede social fictícia.
- Cache por versão do `CharacterSpec`; **regerar** quando o visual muda (corte de cabelo, tatuagem, emagrecimento).
- **Foto de elenco** (modo foto) com poses e fundo do tema para as **capas** e **Hall da Fama**.

---

## 12. `CharacterSpec` (SCHEMA)

```json
{
  "id": "hm_0042",
  "name": "Nome Fictício",
  "age": 27,
  "bodyBase": { "height_cm": 168, "frame": 42, "leanMass": 62, "fat": 38,
    "shoulders": 48, "ribcage": 46, "waist": 40, "hips": 58, "glutes": 60,
    "thighs": 56, "calves": 52, "arms": 50, "legsLength": 55, "torsoLength": 48,
    "posture": { "shoulders": 52, "spine": 50, "head": 48, "pelvis": 52 } },
  "face": { "shape": "oval", "forehead": 48, "cheekbones": 56, "cheeks": 52, "jaw": 44, "chin": 46,
    "ears": { "size": 48, "tilt": 45, "lobe": "free" } },
  "eyes": { "size": 56, "width": 52, "tilt": 54, "depth": 50, "lidFold": "double",
    "iris": { "base": "#6B4226", "ring": "#C89B55", "size": 52, "pattern": "radial" },
    "sclera": { "tint": 8, "veins": 6 }, "lashes": { "length": 60, "density": 70 },
    "brows": { "shape": "arched", "thickness": 55, "color": "#3B2417", "angle": 52 } },
  "nose": { "bridge": 50, "tip": "round", "width": 48, "length": 46 },
  "mouth": { "width": 56, "upperLip": 48, "lowerLip": 58, "cupidBow": 60, "corners": 55, "lipColor": "#B2575E", "gloss": 25 },
  "teeth": { "alignment": 82, "tone": 20, "braces": false },
  "skin": { "tone": 9, "undertone": "golden", "luminosity": 60, "blush": 40,
    "freckles": { "density": 55, "region": ["nose","cheeks","shoulders"], "size": 35 },
    "moles": [{ "pos": [0.31, 0.62, 0.05], "size": 8 }], "vitiligo": null,
    "sunMarks": [{ "type": "swimsuit", "intensity": 40 }], "shine": 30 },
  "hair": { "style": "curly_long_layers", "type": "3B", "length": 64, "volume": 78, "density": 70,
    "color": { "base": "#4A2E1B", "highlights": "#C8A36A", "highlightAmount": 35, "roots": 0, "gray": 0 },
    "frizz": 40, "fringe": "curtain", "physics": true },
  "facialHair": null,
  "bodyHair": { "arms": 20, "legs": 15 },
  "makeup": { "style": "natural", "layers": [] },
  "nails": { "shape": "almond", "length": 30, "polish": { "color": "#D96C6C", "finish": "gloss" } },
  "tattoos": [{ "design": "flower_fineline", "zone": "ankle_right", "size": 18, "opacity": 85, "aging": 10 }],
  "scars": [],
  "accessories": [{ "slot": "ear", "item": "hoop_small" }],
  "wardrobe": { "style": "sporty", "outfits": { "home": "...", "pool": "...", "party": "...", "trial": "...", "farm": "..." } },
  "voice": { "pitch": 58, "speed": 52, "timbre": "warm", "accent": "goiano" },
  "traitsAnimation": { "gestureAmplitude": 70, "posture": "open", "fidget": 25 }
}
```
Todos os campos têm **faixa, padrão, validação (Zod)** e **migração de versão** do schema.

---

## 13. TESTES E CONTROLE DE QUALIDADE

### 13.1 Testes obrigatórios
1. **Lineup de 24 personagens** muito diferentes (idades, biotipos, tons, cabelos) lado a lado em luz de estúdio: **todos devem parecer pessoas distintas e bonitas**, sem "cara de clone".
2. **Teste de tons de pele** sob 6 luzes (nenhum perde detalhe nem estoura).
3. **Folha de expressões:** as 30+ expressões em 6 personagens (sem dentes atravessando lábio, sem olho "morto", sem boca quebrada).
4. **Teste de olhos:** reflexo coerente, pupila reage à luz, olhar acompanha alvo sem "vesgar".
5. **Teste de mãos:** 15 poses sem dedos deformados ou atravessando objetos.
6. **Teste de cabelo:** 20 estilos em 3 luzes, em movimento, molhado e sujo, sem atravessar ombros/roupa.
7. **Teste de roupa:** cada peça em 8 biotipos extremos sem "rasgar" a malha ou atravessar o corpo.
8. **Teste de animação:** 20 clips em 6 biotipos, sem pés escorregando ou mãos atravessando corpo.
9. **Teste de desempenho:** 20 personagens a 60 FPS (Média), 3 em LOD0.
10. **Teste de estados:** os 17 estados da seção 7 aplicados em combinação, sem exagero.
11. **Teste de legibilidade:** personagem identificável no mosaico de câmeras (LOD2) e no HUD.

### 13.2 Checklist por parte
- [ ] **Rosto:** simétrico o suficiente, sem "vale da estranheza", todos os sliders estáveis nos extremos.
- [ ] **Olhos:** reflexo, umidade, pupila dinâmica, sem esclera "chapada".
- [ ] **Boca:** lábios com volume, dentes naturais, lip-sync limpo.
- [ ] **Pele:** tom correto em toda luz, transição suave entre regiões, marcas bem integradas.
- [ ] **Cabelo:** volume, brilho, raiz natural, sem "capacete".
- [ ] **Corpo:** proporção crível em todos os biotipos, articulações sem colapsar.
- [ ] **Mãos:** dedos, unhas e juntas bonitos em close.
- [ ] **Roupas:** caimento, tecido e estampa corretos; sem atravessar o corpo.
- [ ] **Marcas:** tatuagens e cicatrizes sem distorção, ao envelhecer ficam naturais.
- [ ] **Acessibilidade e diversidade:** representação digna, sem caricatura.

---

## 14. PROMPTS DE IA PARA ARTE DE REFERÊNCIA DE PERSONAGEM

> Para *concept art*, folhas de referência e retratos 2D. Seguir o guia de estilo e o *negative prompt* de `jogo-bbb-fazenda-visual.md` (seção 9). **Nunca** pedir "parecido com" pessoa real.

**Folha de personagem (turnaround)**
```
[STYLE] Character turnaround sheet, stylized semi-realistic 3D render, adult {IDADE}, {DESCRIÇÃO},
neutral A-pose, front/side/back views, even studio lighting, soft smooth skin, plain gray background, no text.
```
**Folha de expressões**
```
[STYLE] Expression sheet of the same character, 12 expressions in a grid: joy, laughter, crying, anger,
jealousy, shame, boredom, surprise, fear, disgust, smugness, determination. Smooth stylized skin,
consistent face, soft studio light, no text.
```
**Referência de cabelo**
```
[STYLE] Hair reference, {TIPO: 3B curly | 4A coily | wavy | straight | braids | locs}, {COMPRIMENTO}, {COR}, 
front, side and back views, soft light with natural shine, plain background, no face emphasis.
```
**Referência de look/roupa**
```
[STYLE] Fashion lookbook of an outfit for {SITUAÇÃO: pool party | farm chores | gala night | trial uniform},
{ESTILO}, full-body, flat background, fabric details, no brand logos, no text.
```
**Retrato final**
```
[STYLE] Portrait 4:5, stylized semi-realistic 3D, adult {IDADE}, {DESCRIÇÃO}, {EXPRESSÃO},
dark gradient background with {COR} rim light, smooth luminous skin, detailed eyes with catchlight, no text.
```

---

## 15. FASES DE PERSONAGEM

### C0 — Fundação do sistema
Malha base, rig, morphs de corpo e rosto, esqueleto de animação, `CharacterSpec` v1, carregamento GLB, LOD0/1/2.
**Aceite:** base com 20 sliders de corpo e 20 de rosto funcionando sem artefato.

### C1 — Rosto e olhos
Todos os sliders do rosto, shader de olhos, sobrancelhas, nariz/boca/dentes, 52 blendshapes ARKit.
**Aceite:** folha de expressões e teste de olhos aprovados.

### C2 — Pele e marcas
Shader de pele (24 tons e subtons), rubor, sardas, pintas, vitiligo, manchas, marcas de sol, maquiagem, tatuagens e cicatrizes (decals).
**Aceite:** teste de tons sob 6 luzes aprovado.

### C3 — Cabelo e pelos
Hair cards + malhas escultóricas, 50+ estilos, cor/mechas/raiz, barba, sobrancelhas, física leve, crescimento ao longo do tempo.
**Aceite:** teste de cabelo (20 estilos) aprovado.

### C4 — Corpo, mãos e biotipos
Todos os sliders do corpo, presets de biotipo, mãos e pés detalhados, variações de acessibilidade.
**Aceite:** lineup de 24 personagens e teste de mãos aprovados.

### C5 — Roupas e acessórios
Sistema de camadas, ajuste por morph, guarda-roupa por situação, tecidos, estados dinâmicos, acessórios.
**Aceite:** teste de roupa em 8 biotipos extremos aprovado.

### C6 — Animação e linguagem corporal
Rig final, 150+ clips, camadas aditivas, lip-sync, olhar, respiração, proxêmica, interação com objetos.
**Aceite:** teste de animação em 6 biotipos aprovado.

### C7 — Editor e IA por texto
Editor completo (10.1/10.2), `CharacterSpec` por IA com validação e prévia, herança e elenco em lote, estúdio de retratos.
**Aceite:** criar um personagem **só descrevendo em texto** e ajustar manualmente até aprovar.

### C8 — Estados dinâmicos, polimento e desempenho
Integração com a simulação (seção 7), testes completos (13), otimização de LOD/atlas/materiais, ajustes finais.
**Aceite:** checklist 13.2 100% marcada e 20 personagens a 60 FPS.

---

## 16. COMEÇAR AGORA

Inicie pela **C0**. Ao concluir, apresente um resumo curto, como abrir o editor/teste e as decisões tomadas. **Aguarde** o comando "próxima fase" antes de continuar.
