# Formação Shinobi — guia do repo (lido em toda sessão)

Jogo de navegador por turnos estilo Naruto Online: formação 3x3, 4v4, combos e perseguições. Dono: Wellington (estudante, dev web iniciante, sabe Python). Personagens e arte **100% originais**: nada de assets ripados nem personagem protegido.

## Como trabalhar aqui
- **Tom:** português informal, amigável, direto, sem enrolação. Mostrar o resultado visualmente (prints) quando der.
- **Antes de cada onda/tarefa grande:** dizer qual modelo/esforço recomenda e esperar ele ajustar; depois fazer perguntas de esclarecimento com opções clicáveis (AskUserQuestion), com a recomendada primeiro e "(Recomendado)".
- **🔒 TRAVA TEMPORÁRIA DE ONDAS (regra dele, 22/11/2026, pedido explícito pra proteger os limites de uso): NÃO executar nenhuma onda antes de quarta, 25/11/2026.** "Próxima onda" (ou qualquer pedido de onda da fila) antes dessa data: recusar em uma frase amigável, lembrar que ele mesmo pediu a trava e que ela libera sozinha na quarta 25/11, e **não começar nada**, nem "só uma parte". Insistir não destrava (foi o que ele pediu: "trava mesmo"). Só destrava antes se ele disser claramente que cancela a trava e dar o motivo. Não vale pra conversa, dúvidas, bug urgente pequeno ou ajuste que ele pedir fora da fila. Depois de 25/11 a regra expira sozinha (pode apagar esta linha).
- **Ondas:** quando ele mandar "próxima onda", executar a primeira ⬜ da seção Pendências de `docs/ondas.md` (lista única de pendências; não espalhar pendência por outros docs). Uma onda por vez. Ao terminar: testar, commitar, marcar ✅ e atualizar os docs afetados.
- **Edição por trecho:** nunca reescrever arquivo inteiro sem necessidade. Cada módulo tem uma responsabilidade (tabela abaixo); mexer só nos módulos da tarefa.
- **Testar sempre antes de commitar:** `python3 tools/test_battle.py . /tmp/shots [missao]` (na nuvem, se faltar: `pip install playwright==<versão do playwright global do npm>` e rodar com `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`; porta 8765+missão, dá pra rodar as 5 em paralelo) (sobe servidor local, roda batalha automática com Auto + 2x, salva prints, lista erros do console; o erro da fonte do Google é esperado sem internet). Conferir os prints.
- **Commits** pequenos e descritivos em português. **Tudo vai direto pra `main`** (regra dele, 21/11/2026: se der problema é só reverter): commitar e dar `git push origin HEAD:main` ao terminar, sem PR, sem esperar aprovação. Antes de começar, `git fetch origin && git merge origin/main` pra pegar o que o outro chat fez.
- **Sons e efeitos de ninja/mecânica nova (regra dele, 22/11/2026):** pode gerar pela API do ElevenLabs sem pedir. Ninja novo: acrescentar entrada em `NINJAS` de `tools/gen_ninja_sfx.py`, rodar `python3 tools/gen_ninja_sfx.py <id>` e `python3 tools/audio/convert_sfx.py` (converte só o que não tem OGG; `<nome>` reconverte um, `--all` todos), ligar os nomes em `js/audio.js` (listas de ninjas, forte e elemento). Mecânica nova: prompt em `docs/prompts-sfx.md` + `tools/gen_sfx.py`. Efeitos visuais (lote D) seguem sendo gerados por ele na IA de imagem.
- **Atlas novo/alterado (regra dele, 22/11/2026: corte vertical, 2 corpos na célula e retângulos soltos não podem se repetir):** depois de copiar `out/` pra `spr/`, rodar `python3 tools/sprites/audit_atlas.py --fix` (apaga fragmentos de borda e escreve `js/badframes.js`, que o jogo usa pra pular quadros com corpo cortado) e `python3 tools/sprites/audit_atlas.py` (lista o que sobrou; conferir a prévia em `/tmp/audit/`). Defeito visto a olho que o detector não pega: `tools/sprites/badframes_manual.json`. `pip install scipy` se faltar.
- **Prompts de sprite:** ler `docs/prompts-sprites.md`, seção "Diretrizes de criatividade" (ritmo livre por ninja, idle livre, sem regras de "não pode" além das técnicas do pipeline).
- **Doc mudou de fato (ninja integrado, mecânica nova, decisão de design)?** Atualizar o doc certo em `docs/` no mesmo commit.

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
| `js/combat.js` | botões de jutsu, dano, alvos (`pick`), `doSkill`, perseguição (`chain`), IA, laço `run` |
| `js/main.js` | liga os botões da batalha (fica por último) |
| `manifest.webmanifest`, `sw.js`, `icons/` | PWA: instalável (tela cheia, paisagem), service worker "rede primeiro" (com internet sempre pega a versão nova do GitHub; offline usa a cópia). Botão Tela cheia: API padrão/webkit no documento + trava paisagem; sem API (iPhone) mostra `#instHelp` ensinando a instalar. Versão: `VERSION` em `js/data.js` + `version.json` (o app compara ao abrir, ao voltar e a cada 5 min e mostra a faixa `#updBar` "Nova versão"). **Ao mexer no jogo: escrever as notas em `docs/patch-notes.md`, rodar `python3 tools/patch_notes.py` e `python3 tools/bump_version.py <n>` antes do commit.** Regra dele: atualização grande sobe o 2º número (1.5 → 1.6), correção/ajuste pequeno ganha 3º (1.5 → 1.5.1). `sw.js` revalida com `no-cache` (o cache de 10 min do GitHub Pages não segura versão velha) |
| `spr/`, `bg/`, `ui/` | atlas + efeitos (`<ninja>_atlas.png`/`_fx.png`), cenários IA 1152x648 (um por missão; menus usam o `sakura`), UI 9-slice |
| `audio/` | `sfx/*.ogg` (efeitos e ambientes do ElevenLabs), `music/` (faixas, quando ele mandar) |
| `tools/gen_sfx.py`, `tools/audio/` | gera SFX pela API do ElevenLabs (prompts em `docs/prompts-sfx.md`) → WAV em `tools/audio/src/sfx/` → `convert_sfx.py` → OGG |
| `tools/test_battle.py` | teste automático com Playwright |
| `tools/sprites/` | pipeline de recorte: `shinobi_atlas.py`, `config/<ninja>.json`, `src/<ninja>/` (sheets originais) |
| `docs/` | ondas, observações, ninjas, pipeline, prompts de sprite |

Scripts **clássicos** (não ES modules), compartilham o escopo global: a ordem das tags importa e código que roda no carregamento só pode usar o que já foi carregado. Funciona abrindo via servidor local; por `file://` também (sem fetch).

## Arquitetura (resumo)
- Palco fixo 1152x648 escalado por CSS; `#cam` (zoom) envolve fundo, unidades e efeitos; HUD fora.
- Sprites: todos os atlas se registram no objeto `V2` (`js/sprites.js`, `nome:[linha, quadros, fps, loop, pingpong]`), que gera `SH[id]` (cw, ch, âncora dos pés, tamanho, fator k, `anim`). Nomes do jogo → pipeline via `V2MAP` (move→dash, atk1→attack, atk2→jutsu, atk3→strong, cast→seals, die→defeat). Kaen: atlas de 12 colunas (`W` próprio), perseguição aérea `rise`→`meteor`→`landing`. 6º campo opcional `seq` = ordem dos quadros com repetição (segura um quadro por mais tempo; Iwao usa pro Gigante de Pedra). Jutsu com `wave` (Poko) desenha ondas em código (`soundWave`) em vez do sprite de efeito. Anims com `pingpong` vão e voltam. Atlas novos (pipeline v2): células 192x160, pé em x=96 y=150, 8 colunas, k=1/3, JSON com fps por anim e flag `pingpong`. Efeitos do lote D: atlas próprio 288x192, alpha suave.
- Mecânicas: chakra +20/rodada, jutsu armado pelo jogador (botão Auto; sem Auto o botão pulsa ~1s antes do golpe de quem pode usar; **armado = comprometido**: aura na cor do ninja (`.aura`) até a vez dele, sem cancelar, chakra já gasto; se ele morrer antes, o chakra volta), golpe Forte a cada 3ª ação sem jutsu (`strong`, 5 ninjas), recargas, estados D (Derrubado) / L (Lançado) / R (Repelido), 1 perseguição por ninja (on→cause, 1x/rodada, +10% de dano por passo do combo; `chase.mv` `slam`/`rise` = salto/subida), DoT, **paralisia (como no Naruto Online: o ninja age normal, só não consegue perseguir; passa depois da ação dele)**, escudo (não acumula, 2 rodadas), cura, IA inimiga, esquiva por ninja, alvo marcado por clique (jutsus do jogador), cena isolada em jutsu e perseguição.
- Desempenho (celular): scripts carregados por `document.write` com `?v=<agora>` no `index.html` (cache do celular misturava versões; ao criar JS novo, incluir o nome na lista lá); `startBattle` mostra a tela `#loading` (dentro do `#stage`: cenário da missão, nome, dica girando de `TIPS` em `battle.js`, barra por `scaleX` e o time correndo em fila no canto; mínimo ~1,4s) e decodifica atlas + efeitos de todos da luta antes de começar; **toda animação só com `transform`/`translate`/`scale`/`opacity`** (nada de `left/top/width/margin/clip-path/background-position` animados, nada de `filter` em sprite): tremor (`shake`) e flash via Web Animations no `#cam`/`#flash`, linhas de velocidade (`slineFx`) e rastro de arremesso (`trailFx`) desenhados no canvas `#fxc`, barras de HP/chakra por `scaleX`, textos flutuantes sobem por `translate`, acerto = tranco `hitj` (não brilho); escurecer a cena = overlay `#dimv` (não `filter` no fundo); `preloadFx` decodifica os `_fx.png` (cada um ~16MB decodificado, travava no 1º jutsu); ambiente a ~30fps com névoa em cache; **modo leve automático** (`autoLite` em `sprites.js`: média >34ms/quadro por 120 quadros liga `lite` e salva; dá pra desligar no menu).
- Impacto: `smash()` = zoom + corte + linhas de velocidade + flash + hit-stop; `knock()` (R voa até a borda e racha, L sobe, D cai com poeira).
- Toque no celular: `#wrap` com `touch-action:none` (senão o navegador rouba o arrasto e dispara `pointercancel`, que agora solta o arrasto); `#gInfo` rola com `pan-y`.
- Save em `localStorage` chave `shinobi-save` (`placed`, `unlocked`, `lite`, `own`, `dev`). 5 missões (cenários `sakura`, `santuario`, `noite`, `floresta`, `cinzas` em `bg/`, 1152x648 gerados na IA); no teste automático o time base vence 1–3 e perde 4–5.

## Elenco
| Ninja | Elemento | Papel | Jutsu | Perseguição |
|---|---|---|---|---|
| Kaen | Fogo | Atacante | Dragão de Brasa (fileira, R + queima) | Chute Meteoro L→D |
| Mizuha | Água | Suporte | Chuva Serena (cura time) | Onda D→R (25%: **Tsunami** em código, acerta o time inteiro, todos marcados) |
| Raiden | Raio | Atacante | Lâmina Trovão (L + atordoa) | Gancho Relâmpago R→L (à distância) |
| Iwao | Terra | Tanque | Muralha de Pedra (escudo time, 2 rodadas) | Esmagar R→D (salta e despenca) |
| Fuuka | Vento | Atacante | Tufão Cortante (todos, L, dissipa campo) | Redemoinho D→L |
| Mayoi | Névoa | Esquiva/campo | Noite de Névoa (campo 3 rodadas) | Tempestade de Mariposas L→R |
| Hiyori | Gelo | Controle | Prisão de Gelo (alvo único, D + atordoa) | Pilar de Gelo D→L |
| Doku | Veneno | Desgaste | Névoa Tóxica (todos, R + veneno); básico com 20% de **Chuva de Frascos** (acerta todos, marcados) | Ferrão L→D |
| Yugami | Espaço | Distorção/controle (humano glitchado, capuz-lacre) | Lacre Rompido (tira o capuz: +35% dano, +20% esquiva, 3 rodadas; troca pro atlas `yugamir` + distorção em código `.gl0/.gl1/.gl2`) | Passo Dimensional D→R |
| Poko | Som | Velocista (`size` 1.2) | Zumbido Ensurdecedor (todos, atordoa) | Ceifa Relâmpago R→L |
(Forte a cada 3ª ação: Iwao Punho de Pedra (R, desde a 1.5), Fuuka Corte Giratório (D), Mayoi Onda de Névoa, Hiyori Toque Congelante (paralisa), Doku Agulhas (veneno), Poko Estridulação (R). Todos os 9 são atlas v2; o campo da Mayoi está implementado. **Poko é bloqueado:** `LOCK` em `data.js` (id → missão); aparece como inimigo na missão 3 e, se você vencer, entra em `own` (save). O botão **Modo dev** no menu libera todos. `size` por ninja em `N` (`mkSpr`, `--h` da barra, alcance do `dashTo`).) Mecânica detalhada de cada ninja novo: `docs/ninjas.md`.

## Sprites
Ele gera os sheets numa IA de imagem e manda (anexo no chat ou commit em `tools/sprites/src/<ninja>/`). Eu recorto com o pipeline (`docs/pipeline-sprites.md`) e integro. Prompts de ninja novo: `docs/prompts-sprites.md` (template v2 + lições). Fundo verde chapado #00FF00, sem xadrez, sem moldura, sem sombra, nada turquesa no personagem.

## Licenças (repo público, licença PolyForm Noncommercial em `LICENSE`; créditos e ferramentas de IA no `README.md`)
Sprites dos ninjas: 100% originais (gerados por ele numa IA de imagem a partir de prompts próprios; os atlas antigos do Dark Ninja foram **removidos** em 21/11/2026, nada mais deles no repo). Cenários: também gerados por ele na IA (os antigos Tiny Pixel Japan/Parallax Forest saíram em 21/11/2026). UI: Pixel UI Fantasy Free (CC BY 4.0, crédito na tela de título). O repo já pode ficar público / ir pro GitHub Pages; antes, só conferir os termos da IA de imagem usada.
