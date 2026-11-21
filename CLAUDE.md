# Formação Shinobi — guia do repo (lido em toda sessão)

Jogo de navegador por turnos estilo Naruto Online: formação 3x3, 4v4, combos e perseguições. Dono: Wellington (estudante, dev web iniciante, sabe Python). Personagens e arte **100% originais**: nada de assets ripados nem personagem protegido.

## Como trabalhar aqui
- **Tom:** português informal, amigável, direto, sem enrolação. Mostrar o resultado visualmente (prints) quando der.
- **Antes de cada onda/tarefa grande:** dizer qual modelo/esforço recomenda e esperar ele ajustar; depois fazer perguntas de esclarecimento com opções clicáveis (AskUserQuestion), com a recomendada primeiro e "(Recomendado)".
- **Ondas:** quando ele mandar "próxima onda", executar a primeira ⬜ de `docs/ondas.md`. Uma onda por vez. Ao terminar: testar, commitar, marcar ✅ e atualizar os docs afetados.
- **Edição por trecho:** nunca reescrever arquivo inteiro sem necessidade. Cada módulo tem uma responsabilidade (tabela abaixo); mexer só nos módulos da tarefa.
- **Testar sempre antes de commitar:** `python3 tools/test_battle.py . /tmp/shots [missao]` (na nuvem, se faltar: `pip install playwright==<versão do playwright global do npm>` e rodar com `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`) (sobe servidor local, roda batalha automática com Auto + 2x, salva prints, lista erros do console; o erro da fonte do Google é esperado sem internet). Conferir os prints.
- **Commits** pequenos e descritivos em português. **Tudo vai direto pra `main`** (regra dele, 21/11/2026: se der problema é só reverter): commitar e dar `git push origin HEAD:main` ao terminar, sem PR, sem esperar aprovação. Antes de começar, `git fetch origin && git merge origin/main` pra pegar o que o outro chat fez.
- **Prompts de sprite:** ler `docs/prompts-sprites.md`, seção "Diretrizes de criatividade" (ritmo livre por ninja, idle livre, sem regras de "não pode" além das técnicas do pipeline).
- **Doc mudou de fato (ninja integrado, mecânica nova, decisão de design)?** Atualizar o doc certo em `docs/` no mesmo commit.

## Estrutura
| Caminho | O que tem |
|---|---|
| `index.html` | só o markup das telas + `<script>` na ordem certa |
| `css/style.css` | todo o visual (caminhos de imagem com `../`) |
| `js/data.js` | estados D/L/R, tipos de alvo, ninjas (`N`), missões (`FOES`), save |
| `js/sprites.js` | registro de atlas (`SH`, `ANIM0`, `KANIM`), `an_of`, `stAnim`, atores, laço `tick` |
| `js/audio.js` | som sintetizado (WebAudio) e música |
| `js/screens.js` | telas: título, hub, formação (arrastar), mapa, galeria |
| `js/state.js` | estado da batalha, `pos`/`cur`, `sleep`/`gate` |
| `js/fx.js` | partículas em canvas, paletas por elemento |
| `js/battle.js` | `startBattle`, HUD (`upd`), texto flutuante, log, `setState` |
| `js/cine.js` | câmera (`zoomTo`), `smash`/`knock`, `cine`/`endCine` (cena de jutsu), `dashTo`, `shoot` |
| `js/combat.js` | botões de jutsu, dano, alvos (`pick`), `doSkill`, perseguição (`chain`), IA, laço `run` |
| `js/main.js` | liga os botões da batalha (fica por último) |
| `spr/`, `bg/`, `ui/` | atlas, cenários 384x216, UI 9-slice |
| `tools/test_battle.py` | teste automático com Playwright |
| `tools/sprites/` | pipeline de recorte: `shinobi_atlas.py`, `config/<ninja>.json`, `src/<ninja>/` (sheets originais) |
| `docs/` | ondas, observações, ninjas, pipeline, prompts de sprite |

Scripts **clássicos** (não ES modules), compartilham o escopo global: a ordem das tags importa e código que roda no carregamento só pode usar o que já foi carregado. Funciona abrindo via servidor local; por `file://` também (sem fetch).

## Arquitetura (resumo)
- Palco fixo 1152x648 escalado por CSS; `#cam` (zoom) envolve fundo, unidades e efeitos; HUD fora.
- Sprites: atlas em grade + tabela `[linha, colIni, frames, loop, fps, next]`. `SH[id]` = cw, ch, âncora dos pés, tamanho, fator k, `anim` próprio. Atlas v2 se registram no objeto `V2` (`js/sprites.js`); Kaen ainda usa `KANIM` (atlas de 10 colunas, com `rise`/`meteor` da perseguição aérea). Anims com `pingpong` vão e voltam. Atlas novos (pipeline v2): células 192x160, pé em x=96 y=150, 8 colunas, k=1/3, JSON com fps por anim e flag `pingpong`. Efeitos do lote D: atlas próprio 288x192, alpha suave.
- Mecânicas: chakra +20/rodada, jutsu armado pelo jogador (botão Auto), recargas, estados D (Derrubado) / L (Lançado) / R (Repelido), 1 perseguição por ninja (on→cause, 1x/rodada, +10% de dano por passo do combo), DoT, atordoar, escudo, cura, IA inimiga, esquiva por ninja, alvo marcado por clique (jutsus do jogador), cena isolada em jutsu e perseguição.
- Impacto: `smash()` = zoom + corte + linhas de velocidade + flash + hit-stop; `knock()` (R voa até a borda e racha, L sobe, D cai com poeira).
- Save em `localStorage` chave `shinobi-save`. 5 missões; no teste automático o time base vence 1–3 e perde 4–5.

## Elenco
| Ninja | Elemento | Papel | Jutsu | Perseguição |
|---|---|---|---|---|
| Kaen | Fogo | Atacante | Dragão de Brasa (fileira, R + queima) | Chute Meteoro L→D |
| Mizuha | Água | Suporte | Chuva Serena (cura time) | Onda D→R |
| Raiden | Raio | Atacante | Lâmina Trovão (L + atordoa) | Gancho Relâmpago R→L (à distância) |
| Iwao | Terra | Tanque | Muralha de Pedra (escudo time) | Esmagar R→D |
| Fuuka | Vento | Atacante | Tufão Cortante (todos, L, dissipa campo) | Redemoinho D→L |
| Mayoi | Névoa | Esquiva/campo | Noite de Névoa (campo 3 rodadas) | Tempestade de Mariposas L→R |
| Hiyori | Gelo | Controle | Prisão de Gelo (alvo único, D + atordoa) | Pilar de Gelo D→L |
| Doku | Veneno | Desgaste | Névoa Tóxica (todos, R + veneno) | Ferrão L→D |
(No código o Mayoi ainda aparece como `kuro`, sprite antigo, até a Onda 2. Fuuka, Hiyori, Kuro e Doku ainda usam os sprites antigos 96x64.) Mecânica detalhada de cada ninja novo: `docs/ninjas.md`.

## Sprites
Ele gera os sheets numa IA de imagem e manda (anexo no chat ou commit em `tools/sprites/src/<ninja>/`). Eu recorto com o pipeline (`docs/pipeline-sprites.md`) e integro. Prompts de ninja novo: `docs/prompts-sprites.md` (template v2 + lições). Fundo verde chapado #00FF00, sem xadrez, sem moldura, sem sombra, nada turquesa no personagem.

## Licenças (repo é PRIVADO por causa disso)
Dark Ninja (atlas antigos em `spr/*.png` 96x64: livre, **sem redistribuir**), DarkForest (CC0), Tiny Pixel Japan (uso livre, sem revender), Pixel UI Fantasy Free (CC BY 4.0, crédito já na tela de título). Só tornar o repo público / ligar o GitHub Pages depois que os atlas do Dark Ninja saírem.
