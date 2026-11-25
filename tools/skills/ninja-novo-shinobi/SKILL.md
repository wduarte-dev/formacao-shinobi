---
name: ninja-novo-shinobi
description: Integrar um ninja novo no Formação Shinobi do começo ao fim (prompts dos sheets, recorte, atlas, código, sons, teste, release) usando os scripts do repo pra não gastar token reconstruindo o fluxo. Usar quando o Wellington mandar sprites/sheets de um ninja novo ou pedir prompts/ficha de ninja novo. Não usar pra mexer em ninja já integrado.
---

# Ninja novo — fluxo curto (Formação Shinobi)

Tudo mecânico está em script. Não reescreva na mão o que um comando já gera. Regras do repo: `CLAUDE.md` (público, curto) e, no repo PRIVADO de contexto (`../formacao-shinobi-ctx`): `CLAUDE.md` completo, `docs/prompts-sprites.md`, `docs/fluidez.md`, `docs/ninjas.md`, `docs/ondas.md`.

## 1. Ficha e prompts
1. Decidir com ele (AskUserQuestion): elemento, papel, jutsu, perseguição, personalidade. Registrar a ficha em `docs/ninjas.md` e a pendência em `docs/ondas.md`.
2. Nova entrada em `NINJAS` de `tools/sprites/gen_prompts_lotes.py` (modelo: `keshin`). **Ação premium = 18 quadros** (lotes `A1B` básico 3x6 e `CH` perseguição 3x6; chaves opcionais `A1B`/`CH`; o `C` fica com 3 linhas).
3. `python3 tools/sprites/gen_prompts_lotes.py <id>` (entrada em `NINJAS`; escreve `docs/prompts-<id>.md`; `build()` devolve os textos) e **mandar os prompts de cada lote COLADOS NO CHAT** (o dono gera sozinho e salva em `sprites_novos/<NINJA>_<LOTE>.png`; ele não consegue copiar `.txt`). Anexos: A1←elenco_ref (atualizada, com os oficiais), A1B←A1, A2←A1, B1←A2, B2←B1, C←B2, CH←C, CL←A1, D←A1. Recortar só quando ele avisar. (O fluxo com fila do ChatGPT foi encerrado em 25/11/2026.)

## 2. Recorte
1. `python3 tools/new_ninja.py config <id> --premium` (sem `--premium` = template antigo de 4 linhas) → escreve `tools/sprites/config/<id>.json`.
2. Sheets em `tools/sprites/src/<id>/` → `cd tools/sprites && python3 shinobi_atlas.py config/<id>.json`. Conferir `out/<id>_preview.png` (chão y=150, x=96). Ajustes: `ref` do lote C (frame reto), `scale_mul`, `use/drop`, `erase`, `color_ref`, `outline` (ver `docs/pipeline-sprites.md`). `pip install numpy pillow scipy` se faltar.
3. Copiar `out/<id>_atlas.png` e `_fx.png` pra `spr/`; rodar `python3 tools/sprites/audit_atlas.py --fix` e `python3 tools/sprites/audit_atlas.py` (conferir `/tmp/audit/`). Defeito visto a olho: `tools/sprites/badframes_manual.json`.

## 3. Código
`python3 tools/new_ninja.py snippets <id>` imprime as linhas prontas pra colar:
- `V2` (js/sprites.js; ajustar `hd`), `FXA`/`FXUSE`/`FXMOVE` (js/fx.js), `N` (js/data.js; `hits` = fração do contato de cada golpe; ver regra 7 de `docs/fluidez.md`).
- `python3 tools/new_ninja.py face <id> [idle|cast]` mede o `FACE` (js/sprites.js). **Sempre** conferir o retrato num contact sheet (cut-in e círculo) antes de commitar.
- Ação premium: `attack/attackB/attackC` alternam no básico (o `hits` do N cobre os 3 contatos); a perseguição `chase1..3` toca em sequência (fase 1 salto/agarrão, 2 giro/queda, 3 pouso). Se o motor ainda não alterna/encadeia, é código novo em `js/combat.js`/`js/cine.js`.
- Complemento em código de cada efeito (`fxCont`, `jutsuFx`), regra de 22/11.
- Ninja bloqueado? `LOCK` em data.js. Sem ele, entra no elenco.

## 4. Sons
Entrada em `NINJAS` de `tools/gen_ninja_sfx.py` → `python3 tools/gen_ninja_sfx.py <id>` → `python3 tools/audio/convert_sfx.py`. `js/audio.js` monta as listas a partir de `N` (não ligar à mão). Jutsu: `tools/gen_jutsu_sfx.py`.

## 5. Fechar
1. `python3 tools/new_ninja.py checklist <id>` (o que falta).
2. `python3 tools/test_battle.py . /tmp/shots` + conferir prints; fluidez: `tools/qa_anim.py` (ler `docs/fluidez.md`).
3. Notas em `docs/patch-notes.md` → `python3 tools/patch_notes.py` → `python3 tools/bump_version.py <n>` (grande: 2º número; pequeno: 3º).
4. Docs afetados no mesmo commit. `git fetch origin && git merge origin/main`; commit em português; `git push origin HEAD:main`.

## Armadilhas já vistas
- Prompt de proporção: nunca "chibi"; sempre o trecho padrão (6,5 cabeças). Nada turquesa no personagem.
- Smear dos sprites: forma opaca (translúcido vira "quadro fantasma" e é descartado).
- Quadro de contato "segurado" sai do código (`seq` + hit-stop), não do sprite.
- Atlas novo: `audit_atlas.py --fix` é obrigatório; sem `FACE` o retrato corta a cabeça.
