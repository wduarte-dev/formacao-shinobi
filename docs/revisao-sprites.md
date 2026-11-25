# Revisão dos sprites de ataque (Claude + Gemini) — 22/11/2026

Revisão geral das animações de ataque (`attack`, `strong`, `seals`, `jutsu`, `chase`, e `rise`/`meteor`/`landing` do Kaen) dos 11 atlas da época (sem o Keshin), mais 3 lutas gravadas com `tools/qa_anim.py`. Pedido dele: registrar o que a dupla achou. **A pendência que sai daqui está em `docs/ondas.md` (Demais pendências); este arquivo é o registro dos achados.** Quadros contados a partir de 1, da esquerda pra direita. Gravidade: **grave** = qualquer jogador percebe; **médio** = percebe olhando; **leve** = polimento.

## Já corrigido
- ✅ **Iwao, Golpe de Pedra** (1.5.4): dava dois socos mas só um impacto; agora `hits:[.25,.58]`. Regra nova em `docs/fluidez.md` (item 7).
- ✅ **Iwao, Muralha de Pedra** (1.5.4): gigante ficava ~2 s travado e sumia de uma vez; agora encurta a espera e se desfaz (`GHOST` em `sprites.js` + `stoneCrumble` em `fx.js`). Regra em `docs/fluidez.md` (item 8).
- ✅ **Tsunami da Mizuha** (1.5.5): passava por trás dos personagens; alvos agora z 55, abaixo do `#fxc`.

## Aberto — defeitos nos quadros
| Ninja | Anim | Quadro | Defeito | Grav. | Quem viu |
| --- | --- | --- | --- | --- | --- |
| Poko | seals, jutsu | 1-2 | Texto em inglês da IA dentro do sprite ("SEALS", "...JUTSU", "DEAFENING BUZZ"), cinza-escuro no canto de cima. O `clean_labels.py` deixou passar. | grave | Claude |
| Kaen | rise, meteor, landing | todos | Outra paleta: cabelo laranja-marrom e roupa marrom, contra vermelho e preto do resto. Parece outro personagem no meio da perseguição. | grave | Claude |
| Iwao | strong | todos | Pele rosada e roupa marrom-avermelhada, diferente das outras anims. Pisca de cor no Punho de Pedra. | grave | Claude |
| Yugami (capuz) | seals, jutsu, chase | todos | Essas linhas mostram ele sem capuz (iguais ao `yugamir`). No jutsu faz sentido; na perseguição ele aparece sem lacre antes da hora. | grave | Claude |
| Iwao | chase | 7 | O golem some num quadro e volta no 8: pisca. | médio | Claude |
| Iwao | jutsu | 1, 4 | O monte de pedra tem a borda esquerda reta, cortada pela célula. | médio | Claude |
| Iwao | chase | 4 | Punho do golem encostado na borda direita: corte vertical. | médio | Gemini |
| Mayoi | strong | 5 | Segunda lanterna solta na borda esquerda e névoa cortada reta. | médio | Claude |
| Hiyori | attack | 5 | Rastro da lâmina termina reto na borda direita. | médio | Claude + Gemini |
| Raiden | attack, strong | 6 / 7 | A espada some na volta do golpe (attack 6 vira soco sem arma; strong 7 ajoelhado sem espada). | médio | Claude |
| Kaen | strong | 1-4 | Sem katana na mão até o quadro 5, quando ela surge em cima da cabeça. | leve | Claude |
| Iwao | attack | 1 | Já começa com o soco esticado (igual ao quadro 5): sem preparação. | leve | Claude |
| Fuuka | chase | todos | Desenhada ~15% maior que nas outras anims: cresce ao perseguir. | leve | Claude |
| Fuuka | jutsu | 5-8 | Corpo escorrega ~40 px pra direita na célula e volta de uma vez no quadro 8. | leve | Claude |
| Hiyori | jutsu | 5-6 | Encolhe um pouco (escala) no fim. | leve | Claude |
| Mayoi | hurt | 3 | Pontinho ciano solto no canto de baixo. | leve | Gemini (teste do dia 22) |
| Kaen, Fuuka, Mizuha | seals / jutsu | vários | Quadros quase idênticos (Kaen seals 1-3 e 7-8, Fuuka seals 1-6, Mizuha jutsu 2-7): leem como imagem parada. | leve | Claude |
| Poko | jutsu | 5-8 | Anéis desenhados no sprite, sendo que o jutsu já usa ondas em código (`soundWave`): pode duplicar; o anel do quadro 8 flutua solto. | leve | Claude |
| Poko, Mayoi, Yugami (e outros simples sem `hits`) | attack | — | Ataque simples sem `hits` em `data.js` = um impacto só. **Conferir se o sprite tem mais de um golpe** (regra 7 da fluidez). | a conferir | Claude |

Sem defeito relevante: Mizuha (attack, strong), Raiden (jutsu, chase), Doku (todas), Mayoi (attack, jutsu, chase), Hiyori (strong, chase).

## Aberto — fluidez (medido pelo `qa_anim`, limite 450 ms)
- **Iwao, Muralha de Pedra:** ~1,9 s parado (tratado na 1.5.4; sobra ~1,2 s do gigante parado antes de se desfazer, dá pra dar vida em código).
- **Kaen, subida → Chute Meteoro:** 600 ms entre `rise` e `meteor`; `rise` tem 5 quadros em pé antes de sair do chão e termina em pé (quadros 10-12). Pular quadros pela sequência (`seq`).
- Ok/falso alarme: abertura de todo jutsu (~910 ms, cut-in de propósito); onda da Mizuha (~700 ms, desenhada em código, a ferramenta não vê o canvas); queda de alvo Lançado (460-630 ms, tem movimento); "ATRASO" de 790 ms em combo juntava elos de ataques diferentes.
- **Ferramenta:** `qa_anim` deveria registrar eventos de canvas (`waveFx`, `stoneWall`) e separar os elos do combo pra parar de dar esses falsos alarmes.

## O que dá pra fazer sem arte nova
1. **Poko:** apagar o texto das linhas seals e jutsu (área transparente) e ajustar o `clean_labels.py` pra pegar texto escuro e fino.
2. **Iwao chase 7, Iwao jutsu 1/4, Mayoi strong 5, Hiyori attack 5:** `badframes_manual.json` (pular o quadro) ou limpar à mão a lanterna duplicada e as bordas retas.
3. **Kaen rise:** pular os quadros 1-5 e 10-12 via `seq`.
4. **Fuuka jutsu e chase, Hiyori jutsu:** corrigir escorregão e escala no recorte (âncora do pé por quadro em `tools/sprites/config/<ninja>.json`).

## Precisa regerar na IA (ele)
1. **Kaen rise, meteor e landing** com a paleta do resto (cabelo vermelho, roupa preta). O defeito mais visível.
2. **Iwao strong** com as cores das outras anims.
3. **Yugami (capuz) chase** com o capuz (seals e jutsu podem ficar sem, o jutsu é tirar o capuz).
4. **Raiden attack/strong** com a espada na mão até o fim; **Kaen strong** com a katana desde o quadro 1.
5. Polimento: dar movimento aos selos (Kaen, Fuuka) e ao jato da Mizuha.

## O Gemini nessa revisão (`tools/qa_gemini.py`)
Marcou 22 das 57 animações: **2 defeitos reais** (punho do golem cortado, rastro da Hiyori), 11 coisas de propósito lidas como erro (cubinhos de glitch do Yugami, golem nos selos do Iwao, frasco do Doku), 9 falsos positivos ("fundo verde" no Kaen e no Poko: zero pixel verde; raio "cortado" no Raiden; quadro "duplicado"). **Não viu nenhum dos 4 graves**, nem o texto escrito no Poko. Motivo provável: olha uma animação por vez, então não compara cor e escala com as outras do mesmo ninja, e não sabe o que é design. Uso: rede extra pra borda cortada/pixel solto, sempre conferido. **Hipótese a testar** (não testada): mandar a prancha inteira do ninja numa chamada com perguntas sim/não ("tem texto?", "a cor muda entre as linhas?") e uma ficha curta do ninja.

## Como foi feito (pra repetir)
1. Prancha por ninja com todas as anims de ataque e o número de cada quadro (Pillow, atlas 192x160 sobre fundo cinza, ampliada). 2. `python3 tools/qa_gemini.py atlas spr/<ninja>_atlas.png --anims attack,strong,seals,jutsu,chase`. 3. `tools/qa_anim.py` em 3 lutas cobrindo os 10 ninjas. 4. Conferir cada suspeito na imagem ampliada (contar pixels, ex.: verde) antes de registrar.
