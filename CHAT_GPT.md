# CHAT_GPT.md — briefing pro 2º assistente (continuar o trabalho quando o limite do Claude acabar)

Você (ChatGPT) assume o papel que o Claude Code vem fazendo neste repo. **Primeiro leia `CLAUDE.md` (raiz), que é a fonte de verdade das regras**, depois `docs/ondas.md` (pendências), `docs/ninjas.md` (fichas), `docs/fluidez.md` e `docs/prompts-sprites.md`. Este arquivo é o resumo + o estado atual. **Se você mexer em algo, atualize a seção "Estado atual" no fim deste arquivo no mesmo commit** (é a passagem de bastão nos dois sentidos).

## Quem é o dono e como falar
- **Wellington**: estudante, dev web iniciante (sabe Python), analítico, odeia enrolação. Português do Brasil, informal, amigável, direto (gírias naturais: "mano", "véi", "tlgd", "KKKK", sem forçar). Opinião própria, sem concordar só pra agradar. Mostrar resultado visual (prints) quando der.
- Perguntas de decisão: oferecer **opções curtas com a recomendada primeiro**. Antes de tarefa grande, dizer qual esforço/modelo recomenda.
- **Edição por trecho**: nunca reescrever arquivo/doc inteiro sem necessidade; mexer só nos módulos da tarefa.
- Personagens e arte **100% originais** (nada ripado, nada de personagem protegido; referências como Naruto Online/Rock Lee/Ay são só inspiração de mecânica/atitude, nunca de visual).

## O jogo
Navegador, por turnos, estilo Naruto Online: formação 3x3, 4v4, combos e perseguições, 5 missões. Stack: HTML/CSS/JS puro (scripts clássicos, sem módulos/bundler), palco fixo 1152x648. Jogável por servidor local ou `file://`. Mapa de arquivos e arquitetura: tabela em `CLAUDE.md`. Resumo:
- `js/data.js` (ninjas `N`, missões `FOES`, `LOCK`), `js/sprites.js` (atlas `V2`, `FACE`), `js/fx.js` (efeitos `FXA/FXUSE/FXMOVE`), `js/combat.js` (dano, perseguição `chain`, IA, laço `run`), `js/cine.js` (câmera, hit-stop, `cine`), `js/audio.js` (monta listas de som a partir de `N`), `js/battle.js`, `js/screens.js`, `js/main.js`.
- Mecânicas: chakra por rodada, jutsu armado, golpe Forte a cada 3ª ação, estados D/L/R, 1 perseguição por ninja por rodada (+10% por passo do combo), DoT, paralisia (age normal, só não persegue), escudo (barra branca), triângulo elemental (+25%/−20%), esquiva por ninja.
- **Desempenho no celular importa**: animar só com `transform/opacity`, nada de `filter` em sprite; modo leve automático.

## Regras de trabalho do repo (resumo; detalhes no CLAUDE.md)
- Testar antes de commitar: `python3 tools/test_battle.py . /tmp/shots [missão]` (Playwright; o erro da fonte do Google é esperado). Conferir os prints.
- Commits pequenos, em português. **Tudo direto na `main`** (`git fetch origin && git merge origin/main` antes; `git push origin HEAD:main`; sem PR). Se der problema, reverte.
- Mexeu no jogo: notas em `docs/patch-notes.md` → `python3 tools/patch_notes.py` → `python3 tools/bump_version.py <n>` (grande sobe o 2º número, pequeno o 3º).
- Doc mudou de fato (ninja, mecânica, decisão)? Atualiza o doc certo em `docs/` no mesmo commit. Pendência vive só em `docs/ondas.md`.
- "Próxima onda" = primeira ⬜ da seção Pendências de `docs/ondas.md`, uma por vez. (A trava de ondas expirou em 25/11/2026.)
- Animação/jutsu/perseguição/efeito: ler `docs/fluidez.md` (impacto no quadro do contato, sem tempo morto, alvos marcados, todo sprite tem complemento em código). Conferir com `tools/qa_anim.py`.
- Atlas novo: depois de copiar pra `spr/`, `python3 tools/sprites/audit_atlas.py --fix` e conferir. Retrato: medir `FACE` (`python3 tools/new_ninja.py face <id>`), conferir num contact sheet.
- Sons: ElevenLabs (`tools/gen_ninja_sfx.py`, `tools/audio/convert_sfx.py`). A chave NUNCA vai pro repo; sem chave, deixe os `.txt` de prompt prontos e avise o dono.

## Ninja novo: fluxo pronto
`tools/skills/ninja-novo-shinobi/SKILL.md` + `python3 tools/new_ninja.py config|snippets|face|checklist <id>`. Prompts dos lotes de sprite: `python3 tools/sprites/gen_prompts_lotes.py <id>` (entrada em `NINJAS` do script). **Ação premium de 18 quadros** (lotes `A1B` básico 3x6 e `CH` perseguição 3x6): `docs/prompts-sprites.md`.

## Se você não tiver acesso ao repo/terminal (só chat)
Peça ao dono os arquivos de que precisa (ele sobe pelo GitHub). Entregue **patches por trecho** (arquivo, onde entra, trecho antigo → novo) e comandos pra ele rodar, nunca o arquivo inteiro. Você não substitui o teste automático: diga claramente o que não conseguiu rodar.

---
## Estado atual (atualizar a cada passagem de bastão)
**Última atualização: 24/11/2026 (Codex).**

### Keshin — integrado na versão 1.8
- Jogável na Formação e com sequências de ataque e perseguição na Galeria. Atlas de 22 linhas e efeitos em `spr/`. Ficha e números em `docs/ninjas.md`.
- `castInstants` processa a fila manual entre ações e o Auto na abertura da rodada. Aura Relâmpago custa chakra e vida perfurante, mantém a ação normal e dá 4/5/6 golpes com +20% de dano.
- Bomba Dinamite encadeia salto, queda e pouso (L→D). O último básico lança e ativa o fluxo existente de perseguições.
- Os scripts têm prompts próprios do Keshin. Sem chave ElevenLabs no ambiente, a versão usa os efeitos de áudio genéricos e o som de raio para a Aura. Quando os OGGs estiverem em `audio/sfx/`, tirar `customSfx:false` da ficha.

### Decisão nova de regra do jogo (ainda NÃO implementada)
**Curva de chakra por rodada para os dois times**: +20, +20, +40, +40, +60, +60, +80… (sobe 20 a cada 2 rodadas), **teto 100**. Hoje é +20 fixo em `js/combat.js` . Rebalancear as 5 missões com `test_battle.py` e atualizar a dica em `js/battle.js` (`TIPS`).

### Fila de ondas (ver `docs/ondas.md`)
Feitas: 1 Escudo, 2 Triângulo elemental. Pendentes: 3 Status novos, 4 Ordem por Movimento, 5 Jutsu Instantâneo (base em uso com o Keshin), 6 Perseguição por combo, 7 Plano geral, 8 Passivas, 9 Missão secreta do Yugami. Ideias anotadas: dano perfurante e contundente.

### Ferramentas e contas
- Gemini: texto grátis e visão (`tools/qa_gemini.py`); imagem não. ElevenLabs: SFX e vozes. **Plano Plus do ChatGPT não inclui API** (a API da OpenAI é cobrada à parte). Dono gera os sprites na IA de imagem dele e sobe em `sprites_novos/` ou `tools/sprites/src/<ninja>/`.
