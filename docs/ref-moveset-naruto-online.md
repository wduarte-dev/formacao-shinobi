

==================== README.md ====================

# Kits de ninjas — referência de mecânica (Naruto Online)

⚠️ **Material PRIVADO.** Tem nomes e skills de personagens protegidos, só como referência de mecânica. **Não pode ir pro repo público** (`formacao-shinobi`); o lugar é o repo de contexto privado (`formacao-shinobi-ctx/docs/kits-no/`). No jogo nosso tudo continua original.

## Fonte e limites
- **Fonte:** 27 prints de ficha de ninja do jogo (versão em português; servidor e build **não informados**), enviados pelo Wellington em 21–22/11/2026: 22 numa pasta do Drive e 5 no chat. São **20 personagens / 27 kits** (alguns têm várias versões: 4 de um, 3 de outro, 2 de dois).
- **Como li:** leitura de imagem + OCR. O texto das skills é copiado do jogo; onde o OCR bagunçou caixas vizinhas (principalmente qual caixa é "Comum" e qual é "Perseguição"), marquei **[P]**.
- **Legenda:** **[C]** = [CERTO] (lido claro no print) · **[P]** = [PROVÁVEL] (OCR confuso ou inferido do texto) · **[N]** = [NÃO SEI] (não aparece no print). Estimativa = escrito "estimativa".
- **Em TODOS os kits:** o **dano em % do ataque é [N]** (o print só mostra nº de hits), e a **animação é [N]** (print é estático; ver `docs/referencia-no.md` §8 pro padrão do vídeo). Valores por nível/estrela: só existem os atributos-base em `docs/referencia-no.md` §17.
- **Sinergia** (seção 7 de cada kit) é **inferida por mim a partir do texto do kit** [P], não de guia de time.

## Glossário das etiquetas da ficha
| Etiqueta | Significado |
|---|---|
| **Esotérico** | o jutsu (custo de chakra + recarga). **Comum** = básico. **Perseguição** = follow-up. **Passivo** = automático |
| **Instantânea** [C, explicado por ele] | o Esotérico sai **na hora que clica**, independente de quem age, sem gastar a ação do ninja. Sem a etiqueta, só sai na vez dele **no lugar do Comum** |
| **Init N** [N] | aparece em alguns Esotéricos (Init 1; só um com Init 2). Provavelmente prioridade entre instantâneas, **não confirmado** |
| **1º / 2º** (ao lado dos hits de uma Perseguição) [P] | prioridade quando mais de uma pode disparar. O OCR às vezes leu "1º" como "10" |
| **Nx/rodada** | limite de usos por rodada (100x = sem limite prático) |
| **Combo N** | a skill dá N hits seguidos (soma no contador); "**Ativa com combo N**" = só dispara quando o contador do time chega a N (10, 20 ou 30) |
| **Persegue X → causa Y** | gatilho por estado do alvo (Flutuação, Voo, Queda, Repelimento) e o estado que ela deixa |
| **Plano** | campo com buff/efeito por rodadas; relançar encerra e dispara um efeito |

## Arquivos
- `tabelas.md` — tabelas mestras: esotéricos, comuns, perseguições, grafo de estados, Planos, gatilhos de combo, passivas, status.
- `uchiha.md` — Sasuke (4 versões), Itachi (2), Shisui, Madara (2).
- `naruto-jinchuuriki.md` — Naruto (3), Killer B, Roshi, Yugito.
- `suporte-controle.md` — Sakura, Karin, Hashirama, Kurenai, Hinata, Gaara.
- `taijutsu-esquiva.md` — Rock Lee, Neji, Asuma, Zabuza, Kisame, Hidan.
Mecânicas gerais (estados, status, ordem de ação, combo, elemental, atributos): `docs/referencia-no.md`.

## O que os 27 kits ensinam (resumo)
1. **Todo kit tem 5 slots:** Esotérico, Comum, Perseguição (0 a 3) e Passivos (0 a 2). Kits com buracos (sem perseguição, só 1 passivo) parecem ser versões de 1–2★ [P].
2. **O Comum é "N hits com chance de Combo de N"** e já deixa o ninja num estado de posição: ele **abre** a cadeia. Quase todo Comum causa Flutuação, Voo, Repelimento ou Queda.
3. **Perseguição por estado é uma tabela de conversão** (X → Y). Nenhum kit persegue Voo e deixa Voo; Queda quase sempre vira Voo ou Flutuação; Voo vira Queda ou Flutuação. Ver grafo em `tabelas.md`.
4. **Perseguição por combo** ("ativa com combo 10/20/30") é a "finalizadora em área": 1–2 hits, 2–4 alvos, quase sempre aplica um status (Chamas, Veneno, Imobilidade).
5. **Status quase sempre vêm dentro de perseguições** (Paralisia, Selamento, Cegueira, Confusão, Imobilidade, Chamas): a perseguição é o veículo do controle.
6. **Plano** existe em 4 kits (+ 3 que "quebram o Plano"): dois dão **+40% Ataque/Ninjutsu aos ninjas do mesmo elemento**; um dá **+100 chakra por turno**; relançar encerra e solta dano em todos + Queda.
7. **Passivas se repetem por arquétipo:** cura antes da ação (2x/rodada), revive (30% em 2 rodadas ou 10% na hora), escala com vida baixa, esquiva de perseguição, clones, imunidades (a status, a combo, a estados de posição), escudo de abertura, chakra (+20 ao grupo, 1% de ataque por ponto de chakra).
8. **Imunidade a estados de posição** (Flutuação, Voo, Repelimento, Queda) existe em 3 kits (Kisame, Madara-Fundador, Gaara): é o contra-jogo da cadeia.
9. **Custo de chakra: 20 (maioria), 40, 60.** Recarga: 2–4. Alguns zeram custo/recarga sob condição (chakra > 70).
10. **Dano "garantido"** (ignora esquiva) e **crítico garantido** aparecem como tempero de skills fortes.

## O QUE FALTOU
| Lacuna | Onde achar |
|---|---|
| **% de dano** de cada skill (multiplicador) | detalhe numérico da skill no jogo (se existir), ou simulador de combos de sites de dados do jogo; pedir print da tela de "Detalhes" de uma skill |
| **Animações** de cada ult (câmera, fundo, ordem dos golpes) | vídeos curtos de 1 ult por vez (o padrão geral já está no §8 de `referencia-no.md`) |
| Significado de **Init N** e de **1º/2º/4º** nas perseguições | experimento no jogo: trocar a ordem e olhar o Combo máximo; ou guia de combos do jogo |
| **CD/chakra** que o OCR perdeu (Rock Lee e Killer B sem custo visível; Madara-Edo sem CD claro) | print mais recortado dessas skills |
| **Passivas ausentes** nos kits de Karin (só 1), Sasuke clássico (0), Naruto-Rasengan (sem perseguição) | confirmar se são kits de 1–2★ |
| Qual caixa é Comum/Perseguição no **Itachi-Susano'o** | print melhor desse kit |
| **Valores por estrela/despertar** | tela de Despertar de skill (não enviada) |
| **Contador:** reset por rodada vs sequência | já respondido por fonte web (§18 de `referencia-no.md`): zera por cadeia; ainda não visto no jogo |


==================== geral.md ====================

# Mecânicas gerais aprendidas (resumo do que reunimos nesta conversa)

Origem: vídeos descritos por IA, prints do jogo (PT) e textos de guia colados do web. **[print]** = visto na tela do jogo; **[web]** = texto de guia/IA com busca (não conferido); **[ele]** = o Wellington explicou; **[inferido]** = minha dedução.

## Estados de posição (os 4) [print]
**Flutuação, Voo (flutuação alta), Queda, Repelimento.** Não duram rodadas: são a **janela do combo**, só habilitam a próxima perseguição. Quem "persegue X" dispara quando o alvo está em X e deixa Y. O Repelimento faz o alvo dar dano na fileira/coluna de trás. Imunidade a estados de posição existe (armaduras) e é o contra-jogo da cadeia. Cada perseguição tem limite por rodada (1, às vezes 2).

## Ordem e turno
- **Movimento 1–4** por ninja, mostrado como "1º/2º/3º/4º ação" na tela de formação (frente→trás, cima→baixo, ajustável à mão); a rodada **alterna os times** (Mov. 1 de um, Mov. 1 do outro…); desempate pelo atributo **1º Ataque** [print + web].
- **Esotérico Instantâneo** [ele]: sai **na hora que clica**, independente de quem age, sem gastar a ação do ninja; o **não instantâneo** só sai na vez dele **no lugar do Comum**. Dois cliques juntos: vence o 1º Ataque maior [web].
- **Chakra:** começa em 20, **+20 por rodada**; custos 20/40/60; recarga 2–4; há teto (algumas skills reduzem o limite a 60) [print].
- Tela de formação mostra o **Combo máximo** da montagem = melhor cadeia possível entre todas as combinações de perseguição [ele].

## Combo e contador
- Comum = "N hits com chance de Combo de N" (3, 4, 5, 7 ou 10), já deixa um estado de posição. Cada skill soma **os hits escritos nela** ao contador; o contador pertence à **cadeia** (zera quando acaba) [print+web]. O que zera por rodada é o limite de disparos da perseguição [web].
- **Gatilhos "ativa com combo N" (10/20/30)** [print]: o contador do **time** chega a N em tempo real, o ninja entra sozinho e os hits dele somam (10+4=14). Dois no mesmo N: entra primeiro o de movimento mais alto [web]. Perseguição por estado usa prioridade **1º/2º** [print].
- A **ordem** muda: quem inicia, a prioridade de perseguição e o gasto do limite por rodada [web].

## Status (texto do jogo) [print]
Paralisia (sem Perseguição, 2 rod.) · Selamento (sem Esotérica, 3 rod.) · Chamas (sem cura + dano no fim da rodada, 1 ou 3 rod.) · Imobilidade (não age, 1 rod.) · Cegueira (sem Comum, 1 rod.) · Sono (não age; sai com dano de Taijutsu) · Confusão (sem Esotérica/Perseguição/Comum em área; Comum de alvo único ataca aliado; 1–2 rod.) · Veneno (3% da vida máx./rodada, até 4 níveis, 3 rod.) · Marca (−30% Def/Res, 2 rod.) · Supressão de Imunidade · Interrupção (cancela jutsu em cast) · Violência (buff exclusivo). **Cada status desliga um slot da ficha** (Selamento→Esotérico, Cegueira→Comum, Paralisia→Perseguição, Imobilidade→tudo). [web] Há versões "irremovíveis/não imunizáveis" de quase todos, anti-cura, anti-buff, dano % da vida; a cura limpa numa ordem fixa (controle leve → Confusão → dano contínuo → marcadores).

## Plano (campo) [print + ele]
Jutsu que cria um **Plano** (muda o cenário e dá buff por N rodadas); **relançar encerra** e solta um efeito; alguns jutsus **quebram o Plano e o Campo** existentes; alguns ultimates só valem **dentro** do Plano e, se o Plano acabar antes, tem que criar de novo. Exemplos: +40% Atq/Nin para ninjas do mesmo elemento; +100 chakra/turno ao grupo; ninguém recupera chakra acima do inicial; ninguém lança Esotérico por 1 rodada.

## Elemental e atributos
- **Ciclo [web + vídeo]:** Fogo > Vento > Raio > Terra > Água > Fogo (cada um fraco contra quem o vence). **No dado [print]:** cada ninja tem **resistência −20 no elemento que vence o dele**; o resto 0. Texto "X counters Y" e número em azul no vídeo.
- **Atributos [print]:** Vida, Ataque físico, Defesa física, Ataque ninja (Ninjutsu), Defesa ninja (Resistência); **base de nível 1 + crescimento por nível bem maior que a base** (ex.: Vida 129 +1038/nível; Ataque 83 +777; Defesa 57 +539); tanque tem Vida:Ataque ≈ 3 contra ≈ 1,4 no atacante; **Taxa de Combo base 20%**. [web] Crítico, Dano crítico, Combo, Controle (aplicar/resistir status), Esquiva, Penetração, Dano/Resistência elemental, Redução de dano, Regeneração; fórmula de dano **não oficial**.
- **Tags de sinergia [print]:** elemento, sexo, aldeia, linhagem (Kekkei Genkai), usuário de espada/jutsu secreto, organização, clã, atributo de olho; passivas tipo "ninjas da Folha +20%" e "Jinchuuriki" leem essas tags.
- **Estrelas [web]:** 1–5★; kit completo (5 slots) em 3★; Despertar de skill em 3★/4★; 4★/5★ de raros dão usos extras, imunidades, mais alvos ou menos recarga.

## Feedback visual (vídeo + prints)
Contador "N Hit" na lateral (troca de lado conforme quem ataca), "MORE THAN 10 COMBO", "N Chase!" subindo por elo, **cut-in diagonal** com retrato e nome do golpe (~1 s; jutsu inteiro 2,5–3,5 s), banner **OUTCOME** no golpe final com hit-stop e clarão branco, pilha lateral de badges (ícone + nome, 1,5–2 s), cores de número (amarelo normal, azul vantagem elemental, vermelho crítico, verde cura), texto "Resistance", "Leech N". Ritmo: rodada ~18–23 s; elo de perseguição ~1–1,5 s; básico ~1,5–2 s; clones nas células vazias com HP próprio; botão **Auto Combo**.

## Fora de escopo por ora [ele]
Talentos (do personagem principal), pets/invocações de jogador, ninja assistente.


==================== tabelas.md ====================

# Tabelas mestras (27 kits)

Fonte e legenda: ver `README.md`. Tudo lido de prints do jogo (PT). **[P]** = OCR confuso. Dano % = [N] em tudo. "Inst." = Instantânea. "?" = não apareceu no print.

## 1. Esotéricos
| Ninja (versão) | Chakra | CD | Inst. | Alvo | Efeito |
|---|---|---|---|---|---|
| Naruto (Rasengan) | 20 | 2 | ? | 1 selecionado | Dano Nin/Tai + Repelimento (5 hits); o repelido dá dano à fileira de trás. Init 1 |
| Naruto (Modo Sennin) | 40 | 2 | sim | inimigos + selecionado | Dano de Vento, **Combo 10**, Repelimento no selecionado. Init 1 |
| Naruto (Seis Caminhos) | 40 | 2 | sim | até 9 | Dano, Combo 3, **Interrupção**, Queda no selecionado; depois ganha **Violência** (1 rodada). Init 1 |
| Sasuke (Shippuden) | 20 | 3 | ? | **Plano**; relançar: até 4 | Plano: +40% Atq/Nin dos ninjas Raio; relançar: dano de Raio a até 4 + Queda |
| Sasuke (Susano'o) | 40 | 2 | sim | todos os inimigos | **Dano garantido** a todos; Repelimento no selecionado; 75% de chance de 1,5x crítico [P: nome da skill cortado]. Init 1 |
| Sasuke (Marca da Maldição) | 40 | 2 | sim | até 4 | Dano Nin + Queda no selecionado. Init 1 |
| Sasuke (clássico) | 40 | 2 | ? | até 4 | Dano Nin (bola de fogo) |
| Sakura | 20 | 4 | sim | time aliado | **Cura** (30% do Ninjutsu) em todos + remove todos os status negativos |
| Rock Lee | ? | 3 | sim | si | 2 Comuns no turno; +15% de crítico por 1 turno; 2x/rodada |
| Neji | 20 | 2 | sim | 1 | Dano Tai + **Selamento** (3 rodadas); 3 hits; prioridade 1º |
| Roshi | 40 | 3 | sim | até 9 | **Quebra o Plano e Campo**; dano Fogo+Terra; Queda no selecionado. Init 1 |
| Madara (Reanimado) | 40 | 2 [P] | sim | até 12 | Dano, Combo 3, Queda no selecionado; depois ganha Violência (1 rodada) |
| Madara (Fundador) | 60 | 2 | sim | até 9 | Dano + Chamas, Queda no selecionado; +1 Comum extra se houver outro Uchiha. Init 1 |
| Hashirama | 40 | 3 | sim | até 12 | **Quebra o Plano e Campo**; dano Água+Terra, Combo 3, Interrupção, Queda. Init 1 |
| Karin | 20 | 3 | sim | ≥4 | Dano Nin de Fogo + **Veneno** |
| Zabuza | 20 | 3 | sim | até 9 **de ambos os lados** (não-Água) | **Cegueira** 1 rodada. Init 1 |
| Kisame | 20 | 3 | sim | **Plano** 1 rodada | Plano "Prisão de Água": 3 tubarões (30% da vida do Kisame) que fazem Comum; causa Interrupção; **ninguém lança Esotérico** |
| Shisui | 40 | 3 | sim | até 6 | Dano + Interrupção a até 6 + Repelimento no selecionado [P]. Init 2 |
| Itachi (Tsukuyomi) | 20 | 4 | ? | **Plano** | Plano: **+100 chakra por turno** ao grupo + mais chance de clone; relançar encerra. 2x/rodada |
| Itachi (Susano'o) | 20 | 4 (após 2 usos seguidos) | sim | 1 | Dano Nin + **Confusão** (2 rodadas) |
| Hidan | 20 | 3 | não | selecionado + os com Marca | Dano = maior valor entre Vida e Ataque (só se estiver ferido); imune a Interrupção. Init 1 |
| Killer B | ? | 2 | sim | 1 aliado | Dá **1 ataque extra por rodada** a um companheiro; ele fica imune a Interrupção 2 rodadas |
| Asuma | 20 | 3 | sim | 1 | Dano Nin + Queda; **chakra acima de 70 = sem custo e sem recarga**. Init 1 |
| Yugito | 20 | 2 | sim | grupo inimigo + selecionado | Dano de Fogo + Chamas no grupo; Voo no selecionado. Init 1 |
| Hinata | 20 | 3 | sim | si | +Esquiva por 1 rodada; se estiver na 1ª coluna, **os Comuns inimigos vão nela** (taunt) |
| Gaara | 20 | 3 | ? | **Plano**; relançar: todos | Plano: +40% Atq/Nin dos ninjas Vento; relançar: dano Nin a todos + Queda |
| Kurenai | 20 | ? | sim | 1 | Supressão de Imunidade a status negativos + Imobilidade; **limite de chakra do alvo cai a 60** até o fim da rodada seguinte |

## 2. Comuns (básicos)
| Ninja | Hits | Combo | Causa | Alvo / extra |
|---|---|---|---|---|
| Naruto (Rasengan) | 3 | chance | Flutuação | 1 à frente; com clones vivos vira **dano garantido** + Flutuação (5 hits) |
| Naruto (Sennin) | 3 | — | Flutuação | substitui o Comum enquanto há clone; ataca junto com os clones |
| Naruto (Seis Caminhos) | — | Combo 5 [P] | — | **3 inimigos**; chance de reduzir a própria recarga em 1 |
| Sasuke (todas) | 3 | chance | Flutuação | 1 à frente |
| Sakura | 3 | chance | Repelimento | 1 à frente |
| Rock Lee | 5 | Combo 5 | Voo | 1 à frente |
| Neji | 4 | chance | Voo | 1 à frente |
| Roshi | 4 | Combo 4 | Flutuação | 1 à frente |
| Madara (2 versões) | 2 | — | Queda | **linha à frente**, dano garantido, grande chance de Queda |
| Hashirama | 3 | — | Flutuação | 1 à frente, grande chance |
| Karin | 3 | Combo 3 | Voo | 1 à frente |
| Zabuza | 3 | Combo 3 | Flutuação | 1 à frente |
| Kisame | — | **Combo 10** | Repelimento | 1 à frente, grande chance |
| Shisui | 2 | Combo 3 | Chamas + Repelimento | **coluna frontal** inteira |
| Itachi (Tsukuyomi) | 5 | Combo 5 | **Sono** + Voo | 1 à frente |
| Hidan | 3 | Combo 3 | **Marca** + Repelimento | 1 à frente |
| Killer B | 7 | Combo 7 | Queda | 1 à frente |
| Asuma | 3 | Combo 3 | Repelimento | 1 à frente |
| Yugito | — | **Combo 10** | — | 1 à frente, grande chance |
| Hinata | 3 | Combo 3 | Queda | 1 à frente |
| Gaara | 3 | — | Voo | 1 à frente + escudo de 30% da Resistência |
| Kurenai | 3 [P] | — | **Sono** | 1–3 inimigos |

## 3. Perseguições
| Ninja | Gatilho | Causa | Hits | Prior. | Obs |
|---|---|---|---|---|---|
| Naruto (Sennin) | Repelimento | Queda | 1 | — | |
| Naruto (Seis Caminhos) | Queda | Repelimento + Imobilidade | 1 | 2º [P] | **dispersa Escudos e buffs** do alvo |
| Sasuke (Shippuden) | Flutuação | Repelimento | 2 | — | |
| Sasuke (Shippuden) | Voo | Flutuação + **Paralisia** | **10** | 1º | skill de "Combo 10" |
| Sasuke (Shippuden) | **combo 10** | Chamas | 1 | 2º | até 2 aleatórios |
| Sasuke (Susano'o) | Flutuação | Voo + Chamas (3 rod.) | 5 | 1º | |
| Sasuke (Susano'o) | **combo 10** | dano de Fogo | 1 | — | até 2; **crítico garantido** |
| Sasuke (Marca/clássico) | **combo 10** | dano Nin | 2 | — | 2 aleatórios |
| Sasuke (Marca/clássico) | Flutuação | Repelimento | 1 | — | o repelido dá dano à fileira de trás |
| Sakura | Repelimento | Voo | 1 | — | |
| Rock Lee | Voo | Queda + Chamas | 1 | 1º | |
| Neji | Queda | Voo | 2 | — | |
| Roshi | **combo 30** | Chamas | 1 | 1º [P] | dano Fogo+Terra a 4 |
| Madara (Reanimado) | Queda | Flutuação + Imobilidade | 1 | 2º [P] | **absorve até 100 de chakra** |
| Madara (Fundador) | Queda | Voo + Chamas (3 rod.) | 1 | — | **crítico garantido** |
| Hashirama | Queda | Flutuação + Imobilidade | 1 | 1º | absorve até 100 de chakra |
| Hashirama | **combo 30** | Imobilidade | 1 | 1º | dano Terra+Água a 2 |
| Karin | Queda | Voo | 1 | — | |
| Karin | **combo 10** | Veneno | 2 | 1º [P] | 2 inimigos |
| Zabuza | Flutuação | Repelimento | 3 | — | repelido dá dano à coluna de trás |
| Kisame | **combo 20** | dano | 1 | — | até 4; absorve até 20 de chakra |
| Shisui | Repelimento | Flutuação + Chamas | 2 | 1º | **2x/rodada**; reduz o próprio CD em 1; Interrupção a até 6 |
| Shisui | **combo 30** | Chamas | 1 | 1º [P] | 4 inimigos |
| Kurenai | Queda | Repelimento + Confusão | 1 | 4º [P] | repelido dá dano à coluna de trás |
| Itachi (Tsukuyomi) | Voo | Flutuação + Chamas (3 rod.) + Combo 10 | — | 2º | |
| Itachi (Susano'o) | Voo | Flutuação + Chamas (3 rod.) | 10 | — | [P: qual caixa é a perseguição] |
| Itachi (Susano'o) | Repelimento | Flutuação | 2 | — | **crítico garantido** |
| Hidan | Voo | Repelimento + Combo 10 | — | 1º [P] | |
| Killer B | Queda | Voo + **Paralisia** | 2 | 1º | |
| Asuma | Repelimento | Queda + **Cegueira** | 1 | 1º | |
| Yugito | **combo 20** | dano + Combo 5 | — | 1º | 4 inimigos |
| Hinata | Queda | Queda | 1 | — | |
| Hinata | Repelimento | Queda + **Selamento** | 1 | 1º | |
| Gaara | Voo | Queda | 1 | — | |

## 4. Grafo de estados (gatilho → o que a perseguição deixa)
| Gatilho \ Deixa | Flutuação | Voo | Queda | Repelimento |
|---|---|---|---|---|
| **Flutuação** | — | Sasuke-Susano'o | — | Sasuke ×3, Zabuza |
| **Voo** | Itachi ×2 | — | Lee, Gaara | Hidan |
| **Queda** | Madara-Reanim., Hashirama | Neji, Karin, Madara-Fund., Killer B | Hinata | Naruto-6C, Kurenai |
| **Repelimento** | Shisui, Itachi-S | Sakura | Naruto-Sennin, Asuma, Hinata | — |
- Ninguém persegue X e deixa X **exceto Hinata (Queda→Queda)**.
- **Exemplo de cadeia** (inferida, [P]): Comum que deixa Flutuação → Sasuke (Flut.→Repel.) → Sakura (Repel.→Voo) → Lee (Voo→Queda) → Neji/Karin (Queda→Voo) → Gaara (Voo→Queda)… Cada ninja só entra 1x por rodada, então o tamanho da cadeia é limitado pelo time (4 ninjas) e pelas invocações/clones.

## 5. Planos / Campos
| Quem | Efeito do Plano | Duração | Ao relançar |
|---|---|---|---|
| Sasuke (Shippuden) | +40% Ataque e Ninjutsu dos ninjas **Raio** do time | não informada | dano de Raio a até 4 + Queda |
| Gaara | +40% Ataque e Ninjutsu dos ninjas **Vento** do time | não informada | dano Nin a todos + Queda |
| Itachi (Tsukuyomi) | +100 chakra ao grupo por turno; +chance de clone | até relançar | encerra o Plano |
| Madara (Reanimado) | ninguém recupera chakra acima do inicial | 2 rodadas; lança sozinho nas rodadas **1, 5, 9**; dispersa Escudos e buffs dos dois lados; +20% Def/Res dele a cada dispersão | — |
| Kisame | Prisão de Água: Interrupção; ninguém lança Esotérico; 3 tubarões | 1 rodada | — |
| Roshi, Hashirama, (Madara-Fund.?) | "**Quebra o Plano e Campo existentes**" | instantâneo | — |

## 6. Gatilhos de combo (quem "ativa com combo N")
- **10:** Sasuke (3 versões), Karin.
- **20:** Kisame, Yugito.
- **30:** Roshi, Hashirama, Shisui.
- **Comuns com "Combo N":** 3 (muitos), 4 (Roshi), 5 (Lee, Itachi, Naruto-6C), 7 (Killer B), **10** (Kisame, Yugito).
- Esotérico que soma hits em área: "Combo 3 a até 12 inimigos" (Madara-Reanim., Hashirama): até ~36 hits num jutsu só [P].

## 7. Passivas por categoria
| Categoria | Quem | Detalhe |
|---|---|---|
| Cura antes da ação | Sakura, Karin, Hashirama, Yugito | 2x/rodada; menor vida (Sakura); remove status negativo (Karin, Hashirama até 6 aliados); 15–20% do Ninjutsu |
| Revive | Lee (10%, 1x/combate), Hidan (2 rodadas depois, 30%), Yugito (idem 30%) | |
| Escala com vida baixa | Naruto-Rasengan (+Def/Res), Lee (+0,6% combo por 1%), Hidan (+Ataque), Hinata (+1,5% Def/Res por 1%) | |
| Esquiva | Sakura, Neji (20% + contra-dano), Shisui (de perseguição), Naruto-6C (ataques esotéricos/comuns/perseguições, 1x/rodada), Itachi | |
| Clones/invocação | Naruto (3 clones; Sennin: 1 por Comum com 60% da vida), Zabuza (clone d'água), Kisame (3 tubarões) | os clones têm "habilidades ligadas" (o Comum deles) |
| Imunidades | Madara-Reanim. (status + dano puro Nin), Madara-Fund. (4 estados + dano puro Tai), Sasuke-Susano'o (Combo + dano puro Nin), Itachi (status; Susano'o: + Combo), Kisame/Gaara (4 estados), Naruto-6C/Killer B (status) | |
| Escudo de abertura | Gaara (20% Res, time inteiro), Killer B (40% Res + buff +30% Atq/Nin em até 9 Jinchuuriki, 3 rodadas) | |
| Chakra | Asuma (+20 ao grupo; +1% Atq/Combo por ponto extra), Kisame (+1% Atq/Nin por chakra; +20 chakra e 10% vida ao morrer aliado, 3x/rodada), Naruto-Sennin (+20 chakra/rodada), Madara-Fund. (+40 chakra ao usar Esotérico) | |
| Nova ação | Zabuza (ao matar com Comum), Killer B (ataque extra a aliado) | |
| Taunt/redirect | Neji (na linha de frente, atrai Comuns de alvo único), Hinata (1ª coluna, Esotérico) | |
| Reação ao dano | Roshi (Def/Nin sobem e o inimigo recebe Chamas), Sasuke-Marca (+Ninjutsu e Resistência), Kurenai (45% de Confusão no atacante) | |
| Reflexão | Kurenai | o 1º status negativo de um aliado é transmitido a um inimigo |
| Aliança | Madara-Fund. | +20% Atq/Nin dos ninjas da Folha |

## 8. Status e quem aplica
| Status | Texto no jogo | Quem aplica |
|---|---|---|
| Paralisia (2 rod.) | não lança Perseguição | Sasuke-Shipp., Killer B |
| Selamento (3 rod.) | não lança Esotérica | Neji, Hinata |
| Chamas (1 ou 3 rod.) | não é curado + dano no fim da rodada | Sasuke, Lee, Roshi, Shisui, Itachi, Madara, Asuma(?), Yugito, Hidan(não) |
| Imobilidade (1 rod.) | não age | Madara-R., Hashirama, Naruto-6C, Kurenai |
| Cegueira (1 rod.) | sem Ataque Comum | Zabuza, Asuma |
| Sono (1 rod.) | não age; sai com dano de Taijutsu | Itachi, Kurenai |
| Confusão (1–2 rod.) | sem Esotérica/Perseguição/Comum em área; Comum de alvo único bate nos aliados | Itachi-S., Kurenai |
| Veneno (3 rod.) | 3% da vida máx./rodada, acumula até 4 níveis | Karin |
| Marca (2 rod.) | −30% Defesa/Resistência | Hidan |
| Supressão de Imunidade | perde a imunidade a status negativos | Kurenai |
| Interrupção | cancela o jutsu em cast | Naruto-6C, Hashirama, Shisui, Kisame (Plano) |
| Violência (1 rod., exclusivo) | +45% chance de Combo e 25% de cura ao atacar (Naruto-6C); 10% de cura + imune a Perseguição (Madara-R.) | Naruto-6C, Madara-R. |


==================== uchiha.md ====================

# Kits — Uchiha (Sasuke ×4, Itachi ×2, Shisui, Madara ×2)

Fonte: prints do jogo (PT), ver `README.md`. **Dano % = [N]** e **animação = [N]** em todos. Seção 7 (sinergia) é inferência minha [P].

---
## Sasuke [Shippuden] — Raio (Relâmpago)  *(print do chat)*
**1) Ficha:** Raio · atacante em área com buff de time (Plano) [P] · posição: meio/trás (estimativa) · prioriza Ninjutsu e Combo [P].
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| Estilo Relâmpago · Kirin | Esotérico (Nin) | Plano; relançar: até 4 | Plano: +40% Atq e Ninjutsu dos ninjas Raio. Relançar: dano de Raio a até 4 + **Queda** no selecionado | 20 / CD 3 | C |
| Lâmina de Chidori | Comum (Tai+Nin) | 1 à frente | 3 hits (chance), Flutuação | — | C |
| Estilo Fogo · Técnica de Fogo (nome cortado) | Perseguição | 1 | 2 hits; persegue **Flutuação → Repelimento** | — | C |
| Lança de Chidori | Perseguição | 1 | **Combo 10**; persegue **Voo → Flutuação + Paralisia** (10 hits); prioridade **1º** | — | C |
| Estilo Fogo · Grande Dragão de Fogo | Perseguição | até 2 aleatórios | **ativa com combo 10**; 1 hit; **Chamas**; prioridade **2º** | — | C |
**3) Plano:** Kirin é Plano: buff **+40% Ataque e Ninjutsu** a ninjas com o atributo Raio; duração [N]; **relançar** solta dano de Raio a até 4 inimigos + Queda no alvo (não diz se encerra o Plano [P]). Instantâneo? **[N]** (sem etiqueta). Efeito visual [N].
**4) Ult:** o próprio Kirin (20 chakra, CD 3). Condição: ter chakra e recarga. Dano com Plano ativo: é a 2ª metade da skill [C].
**5) Contador:** **2 perseguições por contador/estado**: o Dragão de Fogo dispara quando o time chega a 10 hits; a Lança de Chidori já vale 10 hits e deixa Paralisia. Reset: ver `referencia-no.md` §18.
**6) Perseguição:** 3 perseguições (Flutuação→Repelimento, Voo→Flutuação+Paralisia, combo10); prioridade 1º/2º define quem vai primeiro quando o contador chega em 10. Limite/rodada [N].
**7) Sinergia [P]:** com ninjas Raio (o Plano dá +40%); a Paralisia (2 rodadas) trava perseguição inimiga e protege a própria cadeia; conflita com Vento inimigo (Vento vence Raio).

---
## Sasuke [Susano'o] — Raio  *(Drive: sasuke susano.png)*
**1) Ficha:** Raio · atacante de nuke + imune a Combo/Ninjutsu puro [P] · posição: frente/meio (estimativa: é tanque ofensivo por causa da imunidade).
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| (nome cortado) | Esotérico, **Instantânea** | **todos** | **Dano garantido** a todos; Repelimento no selecionado; 75% de chance de **1,5x de crítico**; Init 1 | 40 / CD 2 | C (nome N) |
| Lâmina de Chidori | Comum (Raio, 3 hits) | 1 à frente | chance de 3 hits + Flutuação | — | C |
| Susano'o: Golpe | Perseguição | até 2 | **ativa com combo 10**; dano de Fogo; **crítico garantido**; 1 hit | — | C |
| Enton Kagutsuchi | Perseguição | 1 | persegue **Flutuação → Voo + Chamas (3 rodadas)**; 5 hits; prioridade 1º | — | C |
| Imponência. Susano'o | Passivo | si | **Imunidade a Combo** e a **dano de Ninjutsu puro** | — | C |
**3) Plano:** não tem. **4) Ult:** Esotérico instantâneo em todos, dano garantido (ignora esquiva). **5) Contador:** 1 gatilho combo 10 (Golpe). **6) Perseguição:** 2; Chamas dura 3 rodadas aqui (não pode ser curado + dano no fim da rodada). **7) Sinergia [P]:** conflita com o próprio contador do inimigo (imune a combos); bom contra times de cura (Chamas bloqueia cura).

---
## Sasuke [Marca da Maldição] — Raio  *(Drive)*
**1) Ficha:** Raio · atacante que escala ao apanhar [P] · meio (estimativa).
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| Lamento do Chidori | Esotérico, **Inst.** | até 4 | dano Nin; **Queda** no selecionado; Init 1; 1 hit | 40 / CD 2 | C |
| Ataque Taijutsu | Comum | 1 à frente | 3 hits (chance) + Flutuação | — | C |
| Estilo Fogo · Fênix de Fogo · Investida | Perseguição | 2 aleatórios | **ativa com combo 10**; 2 hits; dano Nin | — | C |
| Rajada do Anjo Caído | Perseguição | 1 | persegue **Flutuação → Repelimento**; 1 hit; o repelido dá dano à **fileira de trás** | — | C |
| Marca da Maldição | Passivo | si | ao sofrer dano: **+Ninjutsu e +Resistência** | — | C |
**3) Plano:** não. **4) Ult:** Lamento do Chidori (instantâneo, até 4). **5) Contador:** combo 10. **6) Perseguição:** 2 (uma por estado, uma por combo). **7) Sinergia [P]:** aguenta bem time de dano em área (a passiva cresce com dano recebido). Na tela havia botão **"Auto Combo"** e "Configurações" (IA de combo automático) [C que existe; função N].

---
## Sasuke [clássico] — Fogo  *(Drive: sasuke naruto classico.png)*
**Kit incompleto (sem passivas)** [P: versão de baixa estrela].
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| Estilo Fogo · Grande Bola de Fogo | Esotérico | até 4 | dano Nin (1 hit) | 40 / CD 2 | C |
| Ataque Taijutsu | Comum | 1 | 3 hits (chance) + Flutuação | — | C |
| Fênix de Fogo · Investida | Perseguição | 2 aleatórios | ativa com combo 10; 2 hits | — | C |
| Rajada de Leões | Perseguição | 1 | persegue Flutuação → Repelimento; dano à fileira de trás | — | C |
Seções 3, 4, 5: sem Plano; Esotérico não instantâneo [P]; 1 gatilho de combo 10. **7) Sinergia [P]:** é o "kit base" do mesmo ninja: as versões melhores só **acrescentam passivas, Plano ou imunidades**.

---
## Itachi [versão Tsukuyomi] — Fogo/Ilusão  *(Drive: 20-46)*
**1) Ficha:** Ilusão/Fogo · suporte de chakra + esquiva [P] · fundo/meio (estimativa).
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| Tsukuyomi | Esotérico | **Plano** | cria o **Plano Tsukuyomi**: no início de cada turno o grupo ganha **+100 chakra** e aumenta a chance do Clone do Corvo; **relançar encerra o Plano** | 20 / CD 4; **2x/rodada** | C |
| Dança do Corvo | Comum (5 hits) | 1 à frente | causa **Sono** (+ chance de Combo 5 e Voo); prioridade 1º | — | C |
| Amaterasu | Perseguição (Fogo) | 1 | persegue **Voo → Flutuação + Combo 10 + Chamas (3 rodadas)**; prioridade 2º | — | C |
| Jutsu de Clonagem do Corvo | Passivo | si | +Esquiva; 2x/rodada | — | C |
| Ilusão Demoníaca: Mudança do Espelho do Céu e da Terra | Passivo | si | **imune a qualquer status negativo** | — | C |
**3) Plano (a mecânica mais importante aqui):** Tsukuyomi = **+100 chakra/turno ao grupo** (praticamente liga o Esotérico de todos), relançar desliga. Duração além disso: [N]. Efeito visual: [N] (tela vermelha/ilusão em jogo real, não vista). Instantâneo? [N].
**4) Ult:** Tsukuyomi. **5) Contador:** Amaterasu soma "Combo 10" ao contador. **6) Perseguição:** só Voo→Flutuação+Chamas (a cadeia pega alguém que outro ninja lançou ao ar). **7) Sinergia [P]:** com times de Esotéricos caros (60 chakra) e controle; o Sono (sai com dano físico) conflita com times de Tai.

---
## Itachi [Susano'o] — Fogo  *(Drive: 20-498)*
**[P] O OCR misturou caixas:** os textos de Amaterasu e Espada de Totsuka estão colados; a atribuição Comum/Perseguição abaixo é a mais provável.
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| Kotoamatsukami | Esotérico, **Inst.** | 1 | dano Nin + **Confusão (2 rodadas)**; **após 2 lançamentos seguidos o CD vira 4** | 20 / CD 4 (após 2 usos) | C/P |
| Amaterasu | Comum? (Fogo, Combo 10) | **coluna** à frente | **dano garantido**; grande chance de Repelimento; se matar, o alvo **não pode reviver** | — | P |
| Susano'o: Espada de Totsuka | Perseguição? (2 hits) | 1 | persegue **Voo → Flutuação + 10 hits + Chamas (3 rodadas)** | — | P |
| Yasaka Magatama | Perseguição (Fogo, 2 hits) | 1 | persegue **Repelimento → Flutuação**; **crítico garantido** | — | C |
| Susano'o: Espelho de Yata | Passivo | si | **imune a Combo e a status negativos** | — | C |
**3) Plano:** não. **4) Ult:** Kotoamatsukami (controle, não nuke). **5) Contador:** Amaterasu/chase dão Combo 10. **6) Perseguição:** 2 (Voo e Repelimento). **7) Sinergia [P]:** Confusão (Comum de alvo único ataca aliado) conflita com time de AoE; anti-reviver combina com quem enfrenta revive (Hidan, Lee, Yugito).

---
## Shisui [Kimono] — Fogo  *(Drive: 20-51)*
**1) Ficha:** Fogo · ofensivo de cadeia + esquiva de perseguição [P] · frente/meio (estimativa).
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| Raio Duplo | Esotérico, **Inst.** | até 6 | dano; **Interrupção** a até 6; Repelimento no selecionado; **Init 2** | 40 / CD 3 | C/P |
| Chamas de Lâminas Saltantes | Comum (Fogo, 2 hits, Combo 3) | **coluna frontal** | Chamas + grande chance de Repelimento | — | C |
| Espada do Vendaval | Perseguição | 1 | persegue **Repelimento → Flutuação + Chamas**; **reduz o próprio CD em 1**; **2x/rodada**; prioridade 1º; 2 hits | — | C |
| Flor de Fênix | Perseguição (Fogo) | 4 | **ativa com combo 30**; 1 hit; Chamas | — | C |
| Jutsu de Teletransporte | Passivo, 4x/rodada | si | grande chance de **esquivar de Perseguição**; cada perseguição lançada: **+0,5% Velocidade (até 50×) e +12% Ninjutsu** | — | C |
**3) Plano:** não. **4) Ult:** Raio Duplo (Init 2 é o único Init diferente de 1) **[N: o que Init 2 muda]**. **5) Contador:** combo 30 (Flor de Fênix). **6) Perseguição:** a mais "viva" do grupo: 2x/rodada + reduz CD + escala. **7) Sinergia [P]:** quem deixa o alvo em Repelimento (Sakura, Naruto-Sennin, Asuma Comum) abre a perseguição dele; conflita com Paralisia inimiga.

---
## Madara [Reanimado] — Terra/Madeira  *(Drive: 20-47_1)*
**1) Ficha:** Terra/Madeira · tanque de campo [P] · frente.
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| Corpo Completo: Susano'o | Esotérico, **Inst.** | até 12 | dano + **Combo 3** a até 12; **Queda** no selecionado; depois ganha **Violência** (1 rodada) | 40 / CD 2 [P] | C |
| Susano'o: Lâmina Cortante | Comum (2 hits) | **linha** à frente | **dano garantido**; grande chance de Queda | — | C |
| Jutsu do Dragão de Madeira | Perseguição | 1 | persegue **Queda → Flutuação + Imobilidade**; **absorve até 100 de chakra**; 1 hit; prioridade 2º [P] | — | C |
| Nascimento da Floresta Florida | Passivo/Plano (2x/rodada) | ambos os lados | **Plano nas rodadas 1, 5 e 9**: dispersa **Escudos e Status positivos de ambos os lados**; cada dispersão: **+20% Defesa e Resistência**; efeito do Plano: **ninguém recupera chakra acima do inicial por 2 rodadas** | — | C |
| Vida: Corpo | Passivo | si | **imune a qualquer status negativo e a dano puramente Ninjutsu** | — | C |
| Violência (buff exclusivo) | Status | si | 10% de chance de se curar ao atacar + **imunidade a Perseguição** (1 rodada) | — | C |
**3) Plano:** automático, calendário fixo (1, 5, 9), 2 rodadas de bloqueio de chakra; efeito visual [N]. **4) Ult:** Corpo Completo (instantâneo, 12 alvos, ~36 hits possíveis [P]). **5) Contador:** ele soma Combo 3 por alvo; não tem gatilho "ativa com combo". **6) Perseguição:** 1 (Queda), com roubo de chakra. **7) Sinergia [P]:** contra times que dependem de buff/escudo e de chakra (Tsukuyomi, Kirin).

---
## Madara [Fundador da Aldeia da Folha] — Fogo  *(Drive: 20-41)*
**1) Ficha:** Fogo · atacante de Susano'o, buff de aldeia e imunidade de cadeia [P] · frente/meio.
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| Susano'o: Dança das Espadas Ardentes | Esotérico, **Inst.** | até 9 | dano + **Chamas**; Queda no selecionado; **+1 Comum extra se houver outro Uchiha**; Init 1 | **60** / CD 2 | C |
| Susano'o: Lâmina Curva | Comum (Fogo, 2 hits) | **linha** à frente | dano garantido; grande chance de Queda | — | C |
| Yasaka Magatama | Perseguição | 1 | persegue **Queda → Voo + Chamas (3 rodadas)**; **crítico garantido**; 1 hit | — | C |
| Aliança da Folha | Passivo | time | **+20% Ataque e Ninjutsu** dos ninjas da Folha; ao lançar o Esotérico: **+40 chakra** | — | C |
| Susano'o: Armadura | Passivo | si | **imune a Flutuação, Voo, Repelimento, Queda** e a **dano puramente Taijutsu** | — | C |
**3) Plano:** não. **4) Ult:** o de 60 chakra é o mais caro visto entre os 27. **5) Contador:** nenhum. **6) Perseguição:** 1 (Queda). **7) Sinergia [P]:** time de Folha/Uchiha (buff +20% e Comum extra); conflita com Sono/Confusão do inimigo (não tem imunidade a status aqui).


==================== naruto-jinchuuriki.md ====================

# Kits — Naruto (×3), Killer B, Roshi, Yugito

Fonte: prints do jogo (PT), ver `README.md`. **Dano % = [N]**, **animação = [N]**. Seção 7 = inferência minha [P].

---
## Naruto [Rasengan] — Vento  *(print do chat)*
**Kit sem Perseguição** [P: versão de baixa estrela ou kit sem chase].
**1) Ficha:** Vento · atacante de clones [P] · frente/meio (estimativa) · prioriza Defesa/Resistência (passiva Firmeza) e Ninjutsu [P].
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| Rasengan | Esotérico (Tai+Nin), **5 hits** | 1 selecionado | dano Nin/Tai + **Repelimento**; o repelido dá dano à **fileira de trás**; Init 1 | 20 / CD 2 | C |
| Ataque Taijutsu | Comum | 1 à frente | chance de 3 hits + Flutuação | — | C |
| Técnica dos Múltiplos Clones das Sombras | Passivo | time | no início do combate: **3 Clones** com atributos baseados nos dele | — | C |
| Rajada de Clones das Sombras | Passivo (5 hits) | 1 à frente | **com os clones vivos, o Comum vira Dano Garantido + Flutuação** | — | C |
| Firmeza | Passivo | si | quanto menor a Vida, **maiores Defesa e Resistência** | — | C |
**3) Plano:** não. **4) Ult:** Rasengan (20 chakra, sem etiqueta Instantânea: sai na vez dele no lugar do Comum). **5) Contador:** nenhum. **6) Perseguição:** nenhuma. **7) Sinergia [P]:** é o "dono dos clones": os clones ocupam células vazias e absorvem golpe; combina com ninjas que dão Flutuação/Repelimento depois.

---
## Naruto [Modo Sennin] — Vento  *(Drive: 20-47)*
**1) Ficha:** Vento · atacante de clones + economia de chakra [P] · frente/meio.
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| Estilo Vento Verdadeiro: Rasenshuriken | Esotérico, **Inst.**, **Combo 10** | inimigos + selecionado | dano de Vento, **Combo de 10**, Repelimento no selecionado; Init 1 | 40 / CD 2 | C |
| Rasengan: Abater | Perseguição (Vento, Nin, 1 hit) | 1 | persegue **Repelimento → Queda** | — | C |
| Clone das Sombras Senjutsu | Passivo | time | **no início e a cada Comum**: 1 Clone com **60% da vida**; os clones têm o "Ataque Normal" (habilidades ligadas) | — | C |
| Chakra Senjutsu | Passivo | si | **+20 chakra a cada rodada antes da ação** (some ao +20 padrão: 40/rodada) | — | C |
| Arte Eremita: Rasenrengan | Passivo (3 hits, Vento) | 1 | **substitui o Comum enquanto há clone**; ataca junto com os clones; se acerta, Flutuação | — | C |
**3) Plano:** não. **4) Ult:** Rasenshuriken (soma 10 hits ao contador). **5) Contador:** esotérico dá 10 hits sozinho (alimenta os "ativa com combo 10" do time). **6) Perseguição:** 1 (Repelimento→Queda). **7) Sinergia [P]:** alimenta o contador de quem ativa em 10 (Sasuke, Karin); Vento vence Raio.

---
## Naruto [Sábio dos Seis Caminhos] — Vento  *(Drive: 20-49_1)*
**1) Ficha:** Vento · atacante/controle com imunidade e esquiva [P] · frente/meio.
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| Seis Caminhos: Rasen Shuriken Gigante | Esotérico, **Inst.**, Combo 3 | até 9 | dano, **Combo 3**, **Interrupção**, Queda no selecionado; depois ganha **Violência** (1 rodada); Init 1 | 40 / CD 2 | C |
| Rasengan Planetário | Comum (Combo 5) | **3 inimigos** | chance de Combo 5 e **reduz a própria recarga em 1** | — | C/P |
| Esfera da Busca da Verdade | Perseguição (1 hit) | 1 | persegue **Queda → Repelimento + Imobilidade**; **dispersa todos os Escudos e Status positivos** do alvo | — | C |
| Jutsu de Teletransporte Dourado | Passivo | si | **extremamente provável de esquivar** de esotéricos, comuns ou perseguições; 1x/rodada | — | C |
| Força dos Seis Caminhos | Passivo | si | **imune a qualquer status negativo** | — | C |
| Violência (buff exclusivo) | Status | si | **+45% de chance de Combo** e 25% de curar ao atacar com Ninjutsu; 1 rodada | — | C |
**3) Plano:** não (mas o esotérico "quebra"? não diz). **4) Ult:** 9 alvos + Interrupção (cancela jutsu em cast). **5) Contador:** Comum e Esotérico dão Combo 3/5. **6) Perseguição:** 1, remove escudo/buff do alvo (anti-tanque). **7) Sinergia [P]:** contra times de escudo (Gaara, Killer B); combo alto alimenta combos de 20/30.

---
## Killer B [Com Sete Espadas] — Raio  *(Drive: 20-44_1)*
**1) Ficha:** Raio · buffer de Jinchuuriki + atacante de combo [P] · meio.
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| (nome cortado) | Esotérico, **Inst.** | 1 aliado | dá **1 ataque extra por rodada** ao aliado (não acumula); ele fica **imune a Interrupção por 2 rodadas** | ? / CD 2 | C (chakra N) |
| Dança das 7 Lâminas | Comum (**7 hits**, Combo 7) | 1 à frente | chance de **Queda** | — | C |
| Lariat | Perseguição (Raio, 2 hits) | 1 | persegue **Queda → Voo + Paralisia**; prioridade 1º | — | C |
| Mestre da Transformação Bijuu | Passivo | até 9 Jinchuuriki | no início: **escudo de 40% da Resistência** + **+30% Ataque e Ninjutsu** por 3 rodadas | — | C |
| Chakra do Bijuu: Guerra | Passivo | si | antes de cada movimento **recupera % do Ninjutsu em vida**; **imune a status negativos** | — | C |
**3) Plano:** não. **4) Ult:** o esotérico é utilitário (extra ação). **5) Contador:** Comum soma 7 hits. **6) Perseguição:** 1 (Queda), deixa Paralisia (trava a perseguição inimiga). **7) Sinergia [P]:** com Roshi e Yugito (também "Jinchuuriki" e "Chakra do Bijuu: Guerra"); a tag "Jinchuuriki" é o que o buff procura.

---
## Roshi [Jinchuuriki da Quatro Caudas] — Fogo/Terra  *(Drive: 20-48_1)*
**1) Ficha:** Fogo+Terra · tanque ofensivo que "quebra Plano" [P] · frente.
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| Grande Erupção Flamejante | Esotérico, **Inst.** | até 9 | **quebra o Plano e Campo existentes**; dano de Fogo e Terra; **Queda** no selecionado; Init 1 | 40 / CD 3 | C |
| Ataque Taijutsu | Comum (Fogo, 4 hits, Combo 4) | 1 à frente | chance de Combo 4 + Flutuação | — | C |
| Jutsu Rochas Escaldantes | Perseguição (Fogo, 1 hit) | 4 | **ativa com combo 30**; dano Fogo+Terra + **Chamas**; prioridade 1º [P] | — | C |
| Armadura Incandescente | Passivo | si | ao receber dano Tai: **Defesa e Ninjutsu sobem** e **o atacante recebe Chamas** | — | C |
| Chakra do Bijuu: Guerra | Passivo | si | recupera % do Ninjutsu em vida antes de cada movimento; **imune a status negativos** | — | C |
**3) Plano:** não cria, **destrói** (ult). **4) Ult:** 9 alvos, derruba Plano inimigo (Kirin, Tsukuyomi, Gaara). **5) Contador:** gatilho 30 (finalizadora). **6) Perseguição:** só por combo, nada por estado. **7) Sinergia [P]:** contra Planos inimigos; combina com os que somam muitos hits (Madara-R., Hashirama).

---
## Yugito [Jinchuuriki das Duas Caudas] — Fogo  *(Drive: 20-43)*
**1) Ficha:** Fogo · atacante em grupo com revive + cura [P] · frente/meio.
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| Tigela de Fogo do Gato | Esotérico, **Inst.** | grupo inimigo | dano de Fogo + **Chamas** a todos; **Voo** ao selecionado; Init 1 | 20 / CD 2 | C |
| Fogo do Gato | Comum (Fogo, **Combo 10**) | 1 à frente | grande chance de Combo 10 | — | C |
| Ataque Surpresa da Garra | Perseguição (Combo 5) | 4 | **ativa com combo 20**; dano + Combo 5; prioridade 1º | — | C |
| Nove Vidas | Passivo | si | **revive 2 rodadas depois com 30% da vida** | — | C |
| Chakra do Bijuu: Auto-cura | Passivo, 2x/rodada | si | recupera **15% do Ninjutsu em vida** antes de cada ação | — | C |
**3) Plano:** não. **4) Ult:** barato (20), instantâneo, Chamas em todos (bloqueia cura inimiga). **5) Contador:** Comum dá 10 hits sozinho; chase ativa em 20 e soma 5. **6) Perseguição:** só combo (sem estado). **7) Sinergia [P]:** com Jinchuuriki (Killer B dá buff); o Comum de Combo 10 liga o contador do time.


==================== suporte-controle.md ====================

# Kits — Sakura, Karin, Hashirama, Kurenai, Hinata, Gaara

Fonte: prints do jogo (PT), ver `README.md`. **Dano % = [N]**, **animação = [N]**. Seção 7 = inferência minha [P].

---
## Sakura [Shippuden] — Suporte/cura  *(print do chat)*
**1) Ficha:** (elemento não aparece) · **suporte de cura** · posição: trás (estimativa) · prioriza Ninjutsu (a cura escala com Ninjutsu) e Esquiva [C].
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| Técnica da Cura Regenerativa | Esotérico (Nin), **Inst.** | time aliado | **cura com base em 30% do Ninjutsu** em todos + **remove todos os status negativos** | 20 / CD 4 | C |
| Ataque Taijutsu | Comum (3 hits) | 1 à frente | chance de 3 hits + **Repelimento** | — | C |
| Impacto da Flor de Cerejeira | Perseguição (1 hit) | 1 | persegue **Repelimento → Voo** | — | C |
| Técnica da Palma Mística Veloz | Passivo, **2x/rodada** | aliado de **menor vida** | **antes de qualquer ação**, cura o ninja com a menor vida (a "passiva de cura" que o Wellington descreveu) | — | C |
| Técnica de Substituição | Passivo | si | **+taxa de esquiva** e chance de esquivar de ataques | — | C |
**3) Plano:** não. **4) Ult:** a cura em área; **instantânea** (você clica e ela sai na hora, mesmo fora da vez dela). **5) Contador:** nenhum. **6) Perseguição:** 1 (Repelimento→Voo); a Comum **deixa** Repelimento, então ela abre e fecha a própria cadeia [P]. **7) Sinergia [P]:** com times de Chamas inimigos (Chamas bloqueia cura!) ela perde valor; combina com tanques e com tudo.

---
## Karin — Fogo/suporte  *(Drive: 20-44_2)*
**Kit com 1 passiva só no print** [P: pode haver outra escondida].
**1) Ficha:** Fogo · suporte de cura + veneno [P] · trás.
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| Grande Spray de Perfume | Esotérico (Fogo), **Inst.** | ≥4 | dano Nin de Fogo + **Veneno** | 20 / CD 3 | C |
| Ataque Taijutsu | Comum (3 hits, Combo 3) | 1 à frente | chance de Combo 3 + **Voo** | — | C |
| Voadora | Perseguição (1 hit) | 1 | persegue **Queda → Voo** | — | C |
| Spray de Perfume | Perseguição (2 hits) | 2 | **ativa com combo 10**; **Veneno**; prioridade 1º [P] | — | C |
| Jutsu Eremita Punhos Velozes | Passivo, **2x/rodada** | ≥1 aliado | **cura antes de cada ação** e **dispersa 1 status negativo** do alvo | — | C |
**3) Plano:** não. **4) Ult:** AoE de veneno (3% da vida máx./rodada, acumula até 4 níveis). **5) Contador:** gatilho 10 (Veneno). **6) Perseguição:** 2 (estado + combo). **7) Sinergia [P]:** com quem dá Queda; o Veneno acumula com várias fontes (Veneno é "remove com cura": time com limpador anula).

---
## Hashirama [Reanimado] — Terra/Água, suporte/controle  *(Drive: 20-48)*
**1) Ficha:** Terra+Água · controle + cura de limpeza · frente/meio.
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| Arte Sábia: Mil Mãos Verdadeiras | Esotérico, **Inst.**, Combo 3 | até 12 | **quebra o Plano e Campo**; dano Água+Terra, **Combo 3**, **Interrupção**; **Queda** no selecionado; Init 1 | 40 / CD 3 | C |
| Ataque Taijutsu | Comum (3 hits) | 1 à frente | grande chance de Flutuação | — | C |
| Portão Divino | Perseguição (1 hit) | 2 | **ativa com combo 30**; dano Terra+Água + **Imobilidade**; prioridade 1º | — | C |
| Jutsu do Dragão de Madeira | Perseguição (1 hit) | 1 | persegue **Queda → Flutuação + Imobilidade**; **absorve até 100 de chakra**; prioridade 1º | — | C |
| Cura sem Selo | Passivo, **2x/rodada** | até 6 aliados | **antes da ação: +20% do Ninjutsu em vida e dispersa os status negativos** de até 6 aliados | — | C |
**3) Plano:** destrói (como Roshi). **4) Ult:** 12 alvos, Interrupção. **5) Contador:** gatilho 30 (Imobilidade em 2). **6) Perseguição:** 2 (estado + combo). **7) Sinergia [P]:** com Madara-R. (mesma perseguição de Madeira: só um dos dois a usa por cadeia).

---
## Kurenai [Roupa de Verão] — Ilusão/controle  *(Drive: 20-49)*
**1) Ficha:** Ilusão · **controle e anti-imunidade** · trás. **[P]** o OCR bagunçou os números de prioridade (aparece "4º" na perseguição).
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| Ilusão Demoníaca: Galhos da Restrição Fatal | Esotérico, **Inst.** | 1 | **Supressão de Imunidade a status negativos** + **Imobilidade**; **limite de chakra do alvo cai para 60** até o fim da rodada seguinte | 20 / CD ? | C |
| Ilusão Demoníaca: Visão do Inferno | Comum (3 hits) | 1–3 | dano + **Sono** | — | C/P |
| Ilusão Demoníaca: Nevoeiro | Perseguição (1 hit) | 1 | persegue **Queda → Repelimento + Confusão**; o repelido dá dano à coluna de trás | — | C |
| Ilusão Demoníaca: Reflexão | Passivo, "ativa com status negativo" | aliados | **o 1º status negativo que um aliado recebe é transmitido a um inimigo** | — | C |
| Charme do Verão | Passivo | si | quando atacada, **45% de causar Confusão no atacante** | — | C |
**3) Plano:** não. **4) Ult:** Galhos (controle). **5) Contador:** nenhum. **6) Perseguição:** 1 (Queda→Repelimento+Confusão). **7) Sinergia [P]:** é o contra-jogo de quem tem imunidade a status (Madara, Itachi, Naruto-6C, Killer B): Supressão de Imunidade abre a porta para Imobilidade/Selamento dos outros.

---
## Hinata [Shippuden] — Taijutsu, controle/tanque  *(Drive: 20-40)*
**1) Ficha:** (elemento não aparece) · tanque de esquiva + Selamento · **1ª coluna** (frente).
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| Oito Trigramas 64 Golpes de Defesa | Esotérico, **Inst.** | si | **+Esquiva**; na 1ª coluna, **os Comuns inimigos são direcionados a ela** (taunt); 1 rodada | 20 / CD 3 | C |
| Ataque Taijutsu | Comum (3 hits, Combo 3) | 1 à frente | chance de **Queda** | — | C |
| Punho dos Leões Gêmeos | Perseguição (1 hit) | 1 | persegue **Queda → Queda** | — | C |
| Palma de Ponto Selado | Perseguição (1 hit) | 1 | persegue **Repelimento → Queda + Selamento**; prioridade 1º | — | C |
| Vontade de Ferro | Passivo | si | **+1,5% Defesa e Resistência** por 1% de vida perdido | — | C |
**3) Plano:** não. **4) Ult:** controle defensivo, instantâneo. **5) Contador:** nenhum. **6) Perseguição:** 2 por estado; Selamento (3 rodadas) tranca o Esotérico inimigo. **7) Sinergia [P]:** com quem deixa Repelimento (Sakura, Asuma Comum); o taunt vale mais com cura (Sakura).

---
## Gaara [Shippuden] — Vento/Areia, tanque de escudo  *(Drive: 20-39)*
**1) Ficha:** Vento · tanque de escudo e Plano de buff · frente.
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| Inferno de Areia | Esotérico | **Plano**; relançar: todos | Plano: **+40% Ataque e Ninjutsu** dos ninjas **Vento**; relançar: dano Nin a **todos** + **Queda** no selecionado | 20 / CD 3 | C |
| Chuva de Areia | Comum (Vento, 3 hits) | 1 à frente | chance de **Voo** + **escudo de 30% da Resistência** | — | C |
| Enterro de Areia | Perseguição (Vento, 1 hit) | 1 | persegue **Voo → Queda** | — | C |
| Guardião do País do Vento | Passivo, 50x/rodada | time | no início: **escudo de 20% da Resistência** em todos | — | C |
| Armadura | Passivo | si | **imune a Flutuação, Voo, Repelimento e Queda** | — | C |
**3) Plano:** Plano de elemento (como Kirin). **4) Ult:** relançar o Plano. **5) Contador:** nenhum. **6) Perseguição:** 1 (Voo→Queda). **7) Sinergia [P]:** com time Vento (Naruto, Asuma, Fuuka-like); Vento vence Raio, fraco contra Fogo.


==================== taijutsu-esquiva.md ====================

# Kits — Rock Lee, Neji, Asuma, Zabuza, Kisame, Hidan

Fonte: prints do jogo (PT), ver `README.md`. **Dano % = [N]**, **animação = [N]**. Seção 7 = inferência minha [P].

---
## Rock Lee [Shippuden] — Taijutsu  *(print do chat)*
**1) Ficha:** Taijutsu puro · atacante de combo que escala com vida baixa [P] · frente · prioriza Combo/Crítico/Ataque.
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| Oito Portões Internos | Esotérico (Tai), **Inst.**, **2x/rodada** | si | **2 Ataques Comuns no turno** e **+15% de crítico por 1 turno** | **sem custo visível** / CD 3 | C (custo N) |
| Ataque Taijutsu | Comum (**5 hits**, Combo 5) | 1 à frente | chance de Combo de 5 + **Voo** | — | C |
| Lótus Primária | Perseguição (Tai+Nin, 1 hit) | 1 | persegue **Voo → Queda + Chamas**; prioridade 1º | — | C |
| Determinação | Passivo | si | **revive na hora com 10% da vida, 1x por combate** | — | C |
| Despertar da Morte | Passivo | si | **+0,6% de chance de Combo por 1% de vida perdido** | — | C |
**3) Plano:** não. **4) Ult:** não é nuke, é "dobra o Comum". **5) Contador:** o Comum de 5 hits + chance de combo cresce quando ele está ferido: é o **motor do contador do time**. **6) Perseguição:** 1 (Voo→Queda+Chamas). **7) Sinergia [P]:** com os que ativam em combo 10/20/30; com quem abre Voo (Neji, Karin, Itachi).

---
## Neji [Shippuden] — Taijutsu, esquiva/controle  *(print do chat)*
**1) Ficha:** Taijutsu · esquiva + Selamento + taunt · **frente** (a Provocação só vale na linha de frente) · prioriza Esquiva.
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| Palma de Selamento | Esotérico (Tai), **Inst.**, 3 hits | 1 | dano Tai + **Selamento (3 rodadas)**; prioridade 1º | 20 / CD 2 | C |
| Ataque Taijutsu | Comum (4 hits) | 1 à frente | chance de 4 hits + **Voo** | — | C |
| Palma de Vácuo · Golpe do Colapso Celestial | Perseguição (2 hits) | 1 | persegue **Queda → Voo** | — | C |
| Palma Giratória | Passivo, 100x/rodada | si | **20% de esquivar de Comuns**; ao esquivar, **contra-dano** no atacante | — | C |
| Provocação | Passivo, 100x/rodada | si | no início: **+Esquiva (1 rodada)**; na **linha de frente**, vira **alvo de todos os Comuns de alvo único** inimigos | — | C |
**3) Plano:** não. **4) Ult:** Selamento barato. **5) Contador:** nenhum. **6) Perseguição:** 1. **7) Sinergia [P]:** com cura (Sakura/Hashirama); o taunt protege o time e a esquiva reduz dano, mas a Confusão/Cegueira do inimigo o atrapalha.

---
## Asuma — Vento  *(Drive: 20-44)*
**1) Ficha:** Vento + Fogo · atacante de chakra [P] · frente/meio.
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| Andorinha Voadora | Esotérico (Vento), **Inst.** | 1 | dano Nin + **Queda**; **se o chakra > 70: não gasta chakra e não tem recarga**; Init 1 | 20 / CD 3 | C |
| Ataque Taijutsu | Comum (Vento, 3 hits, Combo 3) | 1 à frente | chance de **Repelimento** | — | C |
| Estilo Fogo: Cinza Ardente | Perseguição (Fogo, 1 hit) | 1 | persegue **Repelimento → Queda + Cegueira**; prioridade 1º | — | C |
| Espada de Chakra | Passivo | si | com ≥20 de chakra, **+1% Ataque e Combo por ponto extra** | — | C |
| Coragem | Passivo | time | **no início: +20 chakra ao grupo** | — | C |
**3) Plano:** não. **4) Ult:** barato; vira grátis com 70+ chakra. **5) Contador:** chakra→combo (ele converte excedente de chakra em chance de combo). **6) Perseguição:** 1 (Repelimento→Queda+Cegueira). **7) Sinergia [P]:** com Itachi-Tsukuyomi (+100 chakra/turno) e Kisame (chakra→dano): times "chakra".

---
## Zabuza — Água/Névoa  *(Drive: 20-45_1)*
**1) Ficha:** Água · controle em área com clone [P] · frente/meio.
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| Jutsu da Névoa | Esotérico, **Inst.** | até 9 **de ambos os lados** | **Cegueira (1 rodada)** em quem **não for de Água** (aliados incluídos!); Init 1 | 20 / CD 3 | C |
| Ataque Taijutsu | Comum (3 hits, Combo 3) | 1 à frente | chance de **Flutuação** | — | C |
| Estilo Água: Dragão da Água | Perseguição (3 hits) | 1 | persegue **Flutuação → Repelimento**; o repelido dá dano à **coluna de trás** | — | C |
| Jutsu Clone de Água | Passivo | si | **no início: 1 clone de água** (atributos baseados nos dele) com Comum próprio | — | C |
| Sede de Sangue | Passivo, 100x/rodada | si | **se matar com um Comum, ganha nova ação** logo depois | — | C |
**3) Plano:** a Névoa funciona como um campo de 1 rodada (visual [N]). **4) Ult:** Cegueira em massa (corta o Comum inimigo). **5) Contador:** nenhum. **6) Perseguição:** 1, 3 hits (a perseguição mais longa de todas por estado). **7) Sinergia [P]:** time **100% Água** (a Cegueira poupa Água); conflita com times de Comum.

---
## Kisame [Síntese Pele de Tubarão] — Água  *(Drive: 20-51_1)*
**1) Ficha:** Água · tanque imune a posição + economia de chakra [P] · frente.
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| Jutsu do Tubarão Dançante | Esotérico, **Inst.** | **Plano** (1 rodada) | cria o Plano **Prisão de Água**: **3 tubarões com 30% da vida** (fazem Comum); **Interrupção**; **ninguém lança Esotérico** enquanto durar | 20 / CD 3 | C |
| Ataque Surpresa com Presa | Comum (**Combo 10**) | 1 à frente | grande chance de Combo 10 + **Repelimento** | — | C |
| Cinco Tubarões Famintos | Perseguição (1 hit) | 4 | **ativa com combo 20**; dano + **absorve até 20 de chakra** | — | C |
| Transformação Síntese Pele de Tubarão | Passivo | si | **imune a Flutuação, Voo, Repelimento, Queda**; **+1% Ataque e Ninjutsu por ponto de chakra** | — | C |
| Caça | Passivo, 100x/rodada | si | **cada vez que um aliado morre: +20 chakra e +10% de vida** (máx. 3x/rodada) | — | C |
**3) Plano (1 rodada):** é um **"silêncio de Esotérico"** para todo mundo, inclusive o próprio time; duração curta (1 rodada). **4) Ult:** o Plano (instantâneo). **5) Contador:** o Comum dá 10 hits; a perseguição entra em 20. **6) Perseguição:** só por combo. **7) Sinergia [P]:** anula Planos inimigos de quem depende de Esotérico (Sasuke-Kirin, Itachi); contra quem usa combo posicional ele é imune.

---
## Hidan — Maldição/Marca  *(Drive: 20-45)*
**1) Ficha:** (elemento não aparece) · atacante de vida baixa + imortal [P] · frente.
| Nome | Tipo | Alvo | Efeitos | Chakra / CD | Conf |
|---|---|---|---|---|---|
| Sangue Possessão da Morte | Esotérico (**não** instantâneo) | selecionado + os com Marca | **se estiver ferido**: dano baseado no **maior valor entre Vida e Ataque**; **imune a Interrupção**; Init 1 | 20 / CD 3 | C |
| Punição por Sinal | Comum (3 hits, Combo 3) | 1 à frente | causa **Marca** (−30% Def/Res, 2 rodadas) + chance de Combo 3 + **Repelimento**; prioridade 1º | — | C/P |
| Dardos | Perseguição (Combo 10) | 1 | persegue **Voo → Repelimento + Combo 10** | — | C/P |
| Crueldade | Passivo | si | **quanto menor a vida, maior o Ataque** | — | C |
| Corpo Imortal | Passivo | si | **ressuscita 2 rodadas depois da morte com 30% da vida** | — | C |
**3) Plano:** não. **4) Ult:** só vale ferido; depende de Marca aplicada (combo Comum→Esotérico). **5) Contador:** Perseguição "Combo 10" soma 10 hits. **6) Perseguição:** 1 (Voo→Repelimento). **7) Sinergia [P]:** com quem abre Voo; contra tanques (Marca reduz Defesa/Resistência −30%).
