# Formação Shinobi — guia curto do repo (público)

Jogo de navegador por turnos estilo Naruto Online: formação 3x3, 4v4, combos e perseguições. Personagens e arte originais.

## ⚠️ Contexto completo é PRIVADO
As instruções de trabalho completas, as pendências (`ondas`), as fichas, os prompts e o briefing do 2º assistente ficam no repo **privado** `wduarte-dev/formacao-shinobi-ctx` (não neste). **Antes de qualquer tarefa:**
1. Se não existir `../formacao-shinobi-ctx`, anexar o repo (`add_repo` em `wduarte-dev/formacao-shinobi-ctx`, acesso push) e clonar (`git clone --depth 1 https://github.com/wduarte-dev/formacao-shinobi-ctx ../formacao-shinobi-ctx`).
2. Ler o `CLAUDE.md` de lá (regras completas, tom, fluxo de ondas, commits, testes) e a seção "Estado atual" do `CHAT_GPT.md` de lá. Na raiz do repo de contexto: `CLAUDE.md`, `CHAT_GPT.md`, `docs/`.
3. Ao terminar: atualizar "Estado atual" e os docs **no repo de contexto** (commit + push lá), e o código aqui (`git push origin HEAD:main`).
**🧊 CONGELAMENTO ATÉ A v1.0 (regra do dono, 28/11/2026, passa na frente das regras de commit/versão):** a `main` (jogo no ar) fica **parada na 1.20** + checklist "???" (`LOCK` em todos menos o Kaen; ninja refeito no estilo novo → sai do `LOCK`). Todo trabalho vai na branch **`dev-v1`** (`git push origin HEAD:dev-v1`), com CI. **Sem patch notes, sem `bump_version`, sem publicar versão** até a v1.0 (aí mescla tudo na main de uma vez). **Foco SÓ em motor e lógica**; sprite, cenário, HUD, efeito e som ficam pro remaster no final (não propor nem gastar token nisso).
**⭐ Regra prioritária (do dono): dinâmica de aprovação** — antes de mexer, perguntas cirúrgicas pra ele (opções clicáveis); design visual vira prompt de imagem pra ele gerar e decidir; depois de implementar, testar, inspecionar o próprio print atrás de defeito e mandar print + "aprovado?"; só fecha com o aprovado dele. Detalhes no `CLAUDE.md` do repo de contexto.
Regras que valem sempre aqui: testar com `python3 tools/prova.py` (luta inteira + impressão digital; mexeu na regra de propósito: `--grava`) e `python3 tools/qa_diff.py` antes de commitar; commits pequenos em português (até a v1.0: na `dev-v1`, ver congelamento acima; depois volta direto na `main` com notas em `docs/patch-notes.md` + `python3 tools/patch_notes.py` + `python3 tools/bump_version.py <n>`). Nunca colocar chaves de API no repo. Se não conseguir acessar o repo de contexto, **pare e avise o dono** em vez de adivinhar as regras.
Sprites novos: o dono gera os sheets e coloca em `sprites_novos/` (só o que ainda não foi processado; depois de usar, `python3 tools/sprites/arquivar_usados.py` move pra `sprites_usados/<grupo>/` com nome claro); o Claude recorta quando ele avisar (prompts de lote vão no chat, gerados por `tools/sprites/gen_prompts_lotes.py`).
Ferramentas que escrevem doc (`gen_prompts_lotes.py`, `new_ninja.py`) usam `../formacao-shinobi-ctx/docs/` quando existe.

## Estrutura
| Caminho | O que tem |
|---|---|
| `index.html` | só o markup das telas + `<script>` na ordem certa |
| `css/style.css` | todo o visual (caminhos de imagem com `../`) |
| `js/data.js` | estados D/L/R, tipos de alvo, ninjas (`N`, inclusive efeitos de campo `fieldFx` e bônus `uDmg`/`uDodge`), missões (`FOES`), save |
| `js/patch.js` | GERADO por `tools/patch_notes.py` de `docs/patch-notes.md`: lista `PATCH` da tela **Novidades** (botão no menu, pisca quando há versão não vista) |
| `js/sprites.js` | registro de atlas (`V2` → `SH`/`SPR`), `an_of`, `stAnim`, `portrait`, atores, laço `tick` |
| `js/audio.js` | sons gravados (`audio/sfx/*.ogg`, `sfx.<evento>`), ambiente por cenário e música (`MUSF`); sintetizado (`SYN`/`musTick`) como reserva. Fluxo e tabela de eventos: `docs/audio.md` |
| `js/screens.js` | telas: título, hub, formação (arrastar), mapa, galeria |
| `js/state.js` | estado da batalha, `pos`/`cur`, `sleep`/`gate` |
| `js/fx.js` | partículas em canvas, paletas por elemento, efeitos desenhados do lote D (`FXA`/`FXUSE`/`FXMOVE`); continuação em código dos efeitos (`fxCont`: brota do chão, rastro, respingo), assinatura por elemento no jutsu (`jutsuFx`, `healRain`, `stoneWall`) e o **Tsunami desenhado** (`tsunamiFx`/`drawWave`, lista `WAVES`) |
| `js/ambient.js` | vida nos cenários: partículas, névoa, brilho e relâmpago por `foe.bg` (tabela `AMB`), canvas `#ambb` (atrás) e `#ambf` (frente) |
| `js/battle.js` | `startBattle`, HUD (`upd`), texto flutuante, log, `setState` |
| `js/cine.js` | câmera (`zoomTo`), `hitstop`, `smash`/`knock`, `cine`/`endCine` (cena de jutsu), `dashTo`, `shoot` |
| `js/regra.js` | **regra de combate pura** (sem DOM, som nem `sleep`): emissor `BUS` (`on`/`off`/`emit`), triângulo elemental, `damageRoll`, `landHit`, `hurt`. Anuncia `acao`, `dano`, `substitui`, `estado`, `persegue`, `rodada`; a apresentação (`combat.js`), a prova e os testes escutam. **Cópia da tela (1.19.4):** `vista(u)`/`mostra(u)`/`mostraChakra()` anunciam `unidade`/`chakra` (e o `dano` leva `e.v`); a HUD (`upd`) e a barra de jutsus (`drawJ`) desenham SÓ por `u.v`/`vChakra`, nunca pela unidade da regra (o teste em Node barra; a prova confere no fim da luta). Mudou estado que aparece na HUD? Chame `mostra(u)`. Teste em Node: `node tools/test_regra.js` |
| `js/combat.js` | botões de jutsu, apresentação do dano (ouvinte do `dano`), alvos (`pick`), `doSkill`, perseguição (`chain`), IA, laço `run` |
| `js/kaen-dragao.js` (+ `kaen-dragao-data.js`) | jutsu Dragão de Brasa do Kaen inteiro num canvas `#kdc`: cut-in em faixa, dragão em peças, travessia, queda gigante na malha inimiga, desintegração. Assets WebP em `spr/kaen_dragao/` (`tools/sprites/kaen_dragao_build.py`); decodifica e tinge tudo no carregamento (`kdLoad`/`kdWarm`) |
| `js/kit.js` | kit de efeitos reutilizáveis (`spr/kit_fx.webp`, `kit_brilho.webp`, canvas `#kfx`): estrelas do atordoado (`kitStars`), buff (`kitBuff`), **camada de impacto** (`impactFx`, só golpes pesados/jutsus) e **sockets** de ancoragem (`sockOf(u,'head'/'chest'/'hand'/'feet')`, vindos do `FACE`) |
| `beta/` | canal beta: `beta/index.html` é GERADO por `python3 tools/build_beta.py` (mesmo motor, save `beta-shinobi*`, sem PWA); `beta/beta.js` dirige uma luta real em que o Kaen mostra cada golpe com APROVADO/NÃO APROVADO e resumo em prompt (`tools/test_beta.py`); `beta/kaen.html` = panorama das animações (`tools/kaen_panorama.py`) |
| `js/main.js` | liga os botões da batalha (fica por último) |
| `manifest.webmanifest`, `sw.js`, `icons/` | PWA: instalável (tela cheia, paisagem), service worker "rede primeiro" (com internet sempre pega a versão nova do GitHub; offline usa a cópia). Botão Tela cheia: API padrão/webkit no documento + trava paisagem; sem API (iPhone) mostra `#instHelp` ensinando a instalar. Versão: `VERSION` em `js/data.js` + `version.json` (o app compara ao abrir, ao voltar e a cada 5 min e mostra a faixa `#updBar` "Nova versão"). **Ao mexer no jogo: escrever as notas em `docs/patch-notes.md`, rodar `python3 tools/patch_notes.py` e `python3 tools/bump_version.py <n>` antes do commit.** Regra dele: atualização grande sobe o 2º número (1.5 → 1.6), correção/ajuste pequeno ganha 3º (1.5 → 1.5.1). `sw.js` revalida com `no-cache` (o cache de 10 min do GitHub Pages não segura versão velha) |
| `spr/`, `bg/`, `ui/` | atlas + efeitos (`<ninja>_atlas.png`/`_fx.png`), cenários IA 1152x648 (um por missão; menus usam o `sakura`), UI 9-slice |
| `audio/` | `sfx/*.ogg` (efeitos e ambientes do ElevenLabs), `music/` (faixas, quando ele mandar) |
| `tools/gen_sfx.py`, `tools/audio/` | gera SFX pela API do ElevenLabs (prompts em `docs/prompts-sfx.md`) → WAV em `tools/audio/src/sfx/` → `convert_sfx.py` → OGG |
| `tools/test_battle.py` | teste automático com Playwright (uma missão do mapa) |
| `js/prova.js`, `tools/prova.py` | **Campo de Provas**: missão-laboratório (modo criativo, tudo manipulável) + impressão digital da luta (hash dos eventos da regra, mesma semente = mesma luta em qualquer velocidade). Rede de segurança do combate; substitui as 5 missões no CI. Mudou o combate de propósito: `--grava`. Ver `tools/README.md` |
| `tools/qa_gemini.py` | 2ª opinião por visão (Gemini): `strip` (tiras do `qa_anim`), `atlas` (uma chamada por animação), `scene`. Devolve só SUSPEITOS; conferir o quadro antes de agir. Gera `/tmp/gem/gemini.txt` |
| `tools/sprites/` | pipeline de recorte: `shinobi_atlas.py`, `config/<ninja>.json`, `src/<ninja>/` (sheets originais) |
| `docs/` | ondas, observações, ninjas, pipeline, prompts de sprite |

Scripts **clássicos** (não ES modules), compartilham o escopo global: a ordem das tags importa e código que roda no carregamento só pode usar o que já foi carregado. Funciona abrindo via servidor local; por `file://` também (sem fetch).

Jutsu instantâneo: colocar `instant:true` no jutsu em `js/data.js` (também vale para `recast`). O combate reserva chakra ao armar, lança entre ações e aplica a recarga no lançamento. O efeito recebe o jutsu selecionado em `doSkill` e a vez normal do ninja continua na fila de turnos. Regressões: `python3 tools/test_jutsu.py`.

## Arquitetura (resumo)
- Palco fixo 1152x648 escalado por CSS; `#cam` (zoom) envolve fundo, unidades e efeitos; HUD fora.
- Sprites: todos os atlas se registram no objeto `V2` (`js/sprites.js`, `nome:[linha, quadros, fps, loop, pingpong]`), que gera `SH[id]` (cw, ch, âncora dos pés, tamanho, fator k, `anim`). Nomes do jogo → pipeline via `V2MAP` (move→dash, atk1→attack, atk2→jutsu, atk3→strong, cast→seals, die→defeat). Kaen: atlas de 12 colunas (`W` próprio), perseguição aérea `rise`→`meteor`→`landing`. 6º campo opcional `seq` = ordem dos quadros com repetição (segura um quadro por mais tempo; Iwao usa pro Gigante de Pedra). Jutsu com `wave` (Poko) desenha ondas em código (`soundWave`) em vez do sprite de efeito. Anims com `pingpong` vão e voltam. Atlas novos (pipeline v2): células 192x160, pé em x=96 y=150, 8 colunas, k=1/3, JSON com fps por anim e flag `pingpong`. Efeitos do lote D: atlas próprio 288x192, alpha suave.
- Mecânicas: **curva de chakra** (1.20: começa em 0 e a rodada 1 já dá +20; ganho 20, 20, 40, 40, 60… = `chakraGain` em `regra.js`, teto 100), jutsu armado pelo jogador (botão Auto; sem Auto o botão pulsa ~1s antes do golpe de quem pode usar; **armado = comprometido**: aura na cor do ninja (`.aura`) até a vez dele, sem cancelar, chakra já gasto; se ele morrer antes, o chakra volta), jutsu `instant` executado entre ações (Auto na abertura da rodada), golpe Forte a cada 3ª ação sem jutsu (`strong`, 5 ninjas), recargas, estados D (Derrubado) / L (Lançado, rasteira: anim `trip` quando o sprite chegar, senão pose de Derrubado) / V (Voo, o antigo Lançado) / R (Repelido), perseguição por estado (on→cause, 1x/rodada, +10% de dano por passo do combo) e **perseguição por combo** (`combo` em `N`: dispara 1x/rodada logo após a ação em que o 'N Hit' do time chega a `at` (hoje 10/12/15/18), ordem das casas, cascata, paralisado não dispara; `star` = só Modo dev até existir estrela; `use:'volley'` = Bola de Fogo do Kazan; regressões em `tools/test_combo.py`; `chase.mv` `slam`/`rise` = salto/subida), DoT, **paralisia (como no Naruto Online: o ninja age normal, só não consegue perseguir; passa depois da ação dele)**, escudo (não acumula, 2 rodadas), cura, IA inimiga, esquiva por ninja, alvo marcado por clique (jutsus do jogador), cena isolada em jutsu e perseguição.
- Desempenho (celular): scripts carregados por `document.write` com `?v=<agora>` no `index.html` (cache do celular misturava versões; ao criar JS novo, incluir o nome na lista lá); `startBattle` mostra a tela `#loading` (dentro do `#stage`: cenário da missão, nome, dica girando de `TIPS` em `battle.js`, barra por `scaleX` e o time correndo em fila no canto; mínimo ~1,4s) e decodifica atlas + efeitos de todos da luta antes de começar; **toda animação só com `transform`/`translate`/`scale`/`opacity`** (nada de `left/top/width/margin/clip-path/background-position` animados, nada de `filter` em sprite): tremor (`shake`) e flash via Web Animations no `#cam`/`#flash`, linhas de velocidade (`slineFx`) e rastro de arremesso (`trailFx`) desenhados no canvas `#fxc`, barras de HP/chakra por `scaleX`, textos flutuantes sobem por `translate`, acerto = tranco `hitj` (não brilho); escurecer a cena = overlay `#dimv` (não `filter` no fundo); `preloadFx` decodifica os `_fx.png` (cada um ~16MB decodificado, travava no 1º jutsu); ambiente a ~30fps com névoa em cache; **modo leve automático** (`autoLite` em `sprites.js`: média >34ms/quadro por 120 quadros liga `lite` e salva; dá pra desligar no menu).
- Impacto: `smash()` = zoom + corte + linhas de velocidade + flash + hit-stop; `knock()` (R voa até a borda e racha, V (Voo) sobe alto, L (Lançado, rasteira) sai do chão baixo, D cai com poeira).
- Toque no celular: `#wrap` com `touch-action:none` (senão o navegador rouba o arrasto e dispara `pointercancel`, que agora solta o arrasto); `#gInfo` rola com `pan-y`.
- Save em `localStorage` chave `shinobi-save` (`placed`, `unlocked`, `lite`, `own`, `dev`). 5 missões (cenários `sakura`, `santuario`, `noite`, `floresta`, `cinzas` em `bg/`, 1152x648 gerados na IA); no teste automático o time base vence 1–3 e perde 4–5.

## Elenco
| Ninja | Elemento | Papel | Jutsu | Perseguição |
|---|---|---|---|---|
| Kaen | Fogo | Atacante | Dragão de Brasa (fileira, R + queima) | Chute Meteoro V→D |
| Mizuha | Água | Suporte | Chuva Serena (cura time) | Onda D→R (25%: **Tsunami** em código, acerta o time inteiro, todos marcados) |
| Raiden | Raio | Atacante | Lâmina Trovão (V + atordoa) | Gancho Relâmpago R→V (à distância) |
| Iwao | Terra | Tanque | Muralha de Pedra (escudo time, 2 rodadas) | Esmagar R→D (salta e despenca) |
| Fuuka | Vento | Atacante | Tufão Cortante (todos, V, dissipa campo) | Redemoinho D→V |
| Mayoi | Névoa | Esquiva/campo | Noite de Névoa (campo 3 rodadas) | Tempestade de Mariposas V→R |
| Hiyori | Gelo | Controle | Prisão de Gelo (alvo único, D + atordoa) | Pilar de Gelo D→V |
| Doku | Veneno | Desgaste | Névoa Tóxica (todos, R + veneno); básico com 20% de **Chuva de Frascos** (acerta todos, marcados) | Ferrão V→D |
| Yugami | Espaço | Distorção/controle (humano glitchado, capuz-lacre) | Lacre Rompido (tira o capuz: +35% dano, +20% esquiva, 3 rodadas; troca pro atlas `yugamir` + distorção em código `.gl0/.gl1/.gl2`) | Passo Dimensional D→R |
| Poko | Som | Velocista (`size` 1.2) | Zumbido Ensurdecedor (todos, atordoa) | Ceifa Relâmpago R→V |
| Keshin | Neutro | Atacante de combos | Aura Relâmpago (instantânea, custo em vida e golpes extras) | Bomba Dinamite V→D |

(Forte a cada 3ª ação: Iwao Punho de Pedra (R, desde a 1.5), Fuuka Corte Giratório (D), Mayoi Onda de Névoa, Hiyori Toque Congelante (paralisa), Doku Agulhas (veneno), Poko Estridulação (R). Todos usam atlas v2; o campo da Mayoi está implementado. **Poko é bloqueado:** `LOCK` em `data.js` (id → missão); aparece como inimigo na missão 3 e, se você vencer, entra em `own` (save). O botão **Modo dev** no menu libera todos. `size` por ninja em `N` (`mkSpr`, `--h` da barra, alcance do `dashTo`).) Mecânica detalhada de cada ninja novo: `docs/ninjas.md`.

