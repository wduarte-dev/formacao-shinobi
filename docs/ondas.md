# Plano de ondas

Regra: "próxima onda" (ou só "próximo") = executar a primeira ⬜ da seção **Pendências**. Uma por vez. Antes: avisar modelo/esforço e esperar; perguntas clicáveis. Depois: teste automático + prints, commit, marcar ✅, atualizar docs.
Teste: `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tools/test_battle.py . /tmp/shots N` (N de 0 a 4; cada missão usa a porta 8765+N, então dá pra rodar as 5 em paralelo; se faltar: `pip install playwright==1.63.0`). Esperado: o time base vence 1–3 e perde 4–5, sem erro além da fonte do Google.

## Pendências (lista única)
- ⬜ **Ninjas desproporcionais:** o `size` já existe (`N[id].size`: `mkSpr`, `--h` da barra, alcance do `dashTo`; Poko usa 1.2). Falta: ninja novo gigante/baixinho gerado já na proporção, e o `portrait` levar o `size` em conta (o retrato do Poko corta a asa).
- ⬜ **Idle gerado da Mizuha e do Iwao:** hoje é respiração em código (`breathe: "first"`). Prompts prontos em `docs/prompts-idle-mizuha-iwao.md`; aguardando ele gerar `src/<ninja>/I.png`.
- ⬜ **Balancear o escudo do Iwao** se ainda arrastar a luta: agora não acumula, dura 2 rodadas e custa 30 (missão 2: 12 rodadas, missão 4: 15 no teste). Ajustar `shield` (2.5) ou `shR` se precisar.
- ⬜ **Opcional — ícones de jutsu desenhados:** sheet com 8 ícones (prompt em `docs/refs/icones_jutsu_prompt.txt`), mais legível que o recorte do efeito (`fxIcon`).
- ⬜ **Opcional — cenário em camadas** (céu/fundo/frente separados) pra parallax.

Regra de sprite que vale pra todo ninja novo (ref de idle etc.): `docs/prompts-sprites.md`, seção "Fluxo de entrega".

## Ideias em aberto (não pedidas)
Níveis, recrutamento, chefes, invocações, "planos" de campo por elemento (só a Mayoi tem), ninja de Distorção/Espaço (segurado), animação de ambiente nos menus.

## Feitas
- ✅ **0a — pipeline de sprites:** `tools/sprites/shinobi_atlas.py` + configs. Lição: no lote C, o `ref` de escala tem que ser frame reto.
- ✅ **0m — migração:** saiu do artefato do claude.ai pra este repo; `index.html` dividido em `css/` + módulos `js/`.
- ✅ **0b — mudanças gerais** (`docs/observacoes.md`): cena isolada em jutsu **e** perseguição (`sceneOn/sceneAdd/sceneOff`, perseguidores acumulam, fundo só clareia quando todos voltaram); hover verde + vida exata; clique marca em azul (só jutsus de alvo único/fileira do jogador vão nele); esquiva por ninja (`dodge`, `evade`; regras em `docs/ninjas.md`); tempo próprio por animação (`animMs`/`hitAt`/`fxWait`).
- ✅ **1 — molde antigo:** Mizuha, Iwao e Raiden no registro `V2`; log minimizável.
- ✅ **2 — template v2:** Mayoi (substituiu o Kuro), Fuuka e Hiyori. Campo Noite de Névoa (`fieldA`, `setField`/`clearField`, overlay `#fog`), Tufão dissipa o campo, Rajada Leve em área com esquiva por alvo, perseguição à distância (`chase.ranged`).
- ✅ **Kaen v2:** atlas de 12 colunas (`config/kaen.json`, lotes A1…E), perseguição aérea `rise`→`meteor`→`landing` (salta, mergulha e os dois descem juntos). A anim `chase` do lote C ficou de reserva.
- ✅ **Efeitos do lote D:** `FXA`/`FXUSE`/`FXMOVE` + `fxSpr`/`fxAt`/`fxShot` em `js/fx.js`; todo efeito se mexe; faísca de impacto; aura no selo; projétil desenhado; barra de jutsus estilo NO (ícone animado + retratinho).
- ✅ **Desempenho:** sem drop-shadow nos efeitos, névoa por `transform`, teto de partículas/efeitos, **modo leve** (save `lite`), hit-stop curto que não congela efeitos. Golpes de vários socos (`hits`). Onda da Mizuha brota aos poucos com 25% de Tsunami.
- ✅ **3 — Doku:** atlas + fx, básico Arremesso de Frascos (2 hits, veneno 1 rodada), esquiva 5%.
- ✅ **4 — Poko + size + desbloqueio:** `size` 1.2, `LOCK={poko:2}` (vence a missão 3 → entra em `own`), **Modo dev** libera todos, jutsu `stun:'all'`.
- ✅ **Cenários IA + ambiente:** `bg/sakura|santuario|noite|floresta|cinzas.png` (uma por missão; prompts em `docs/prompts-cenarios.md`) e `js/ambient.js` (tabela `AMB`: pétalas, chuva+relâmpago, neve, vagalumes, cinzas+brasas; respeita pausa e modo leve). Menus usam o `sakura.png`.
- ✅ **Acabamento (21/11/2026):**
  - **Golpe Forte** (`strong` em `N`): toda 3ª ação sem jutsu o básico vira ele (anim `strong`). Fuuka Corte Giratório (D), Mayoi Onda de Névoa (à distância), Hiyori Toque Congelante (paralisa), Doku Agulhas (veneno 2 rodadas), Poko **Estridulação** (à distância, R). Kaen, Mizuha, Raiden e Iwao não têm Forte.
  - **Perseguições com salto** (`chase.mv`): Esmagar (Iwao) salta e despenca no alvo (`slam`); Redemoinho, Pilar de Gelo e Ceifa Relâmpago sobem junto com o lançado (`rise`).
  - **Janela pra armar jutsu:** sem Auto, quando é a vez de um ninja com jutsu disponível o botão pulsa ~1s antes do golpe.
  - **Escudo do Iwao** não acumula e expira em 2 rodadas (`shR`), custo 30.
  - Bug: o +15% do campo pro básico de Gelo nunca valia com golpes de vários hits (agora vale).
  - Limpeza: restos do sprite antigo (`ANIM0`, rotação CSS do caído, ramos mortos do `portrait`, `config/kaen_e.json`, `bg/vila.png`), galeria com rótulos certos, texto do resultado legível, docs consolidados.
