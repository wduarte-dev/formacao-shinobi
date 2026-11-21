# Plano de ondas

Regra: "próxima onda" = executar a primeira ⬜. Uma por vez. Antes: avisar modelo/esforço e esperar; perguntas clicáveis. Depois: teste automático + prints, commit, marcar ✅ aqui, atualizar docs.

- ✅ **0a — pipeline de sprites (21/11/2026):** `tools/sprites/shinobi_atlas.py` + configs validados de Hiyori, Fuuka e Mizuha. Lição: no lote C, o `ref` de escala tem que ser frame reto.
- ✅ **0m — migração (21/11/2026):** saiu do artefato do claude.ai pra este repo, `index.html` dividido em `css/` + 10 módulos `js/` sem mudar comportamento (batalha automática idêntica, prints conferidos). Artefato antigo (slug `c75c4170-e6c8-431e-969c-0e25e5d3a372`) virou legado.
- ✅ **0b — mudanças gerais do jogo (21/11/2026)** (`docs/observacoes.md`, itens 5, 7, 8, 9 + esquiva). Feito: `sceneOn/sceneAdd/sceneOff` em `js/cine.js`, hover/marca em `js/battle.js` (`.hb` = caixa de clique só cabeça/tronco), `pick` respeita `mark`, esquiva com `evade`, tempos via `animMs`/`hitAt`/`fxWait`. Decisões extras: perseguição **acumula** quem já participou; fileira não é desviável; kuro já tem dodge 15. Decisões dele (21/11/2026):
  - **Cena isolada** (só conjurador + afetados, fundo bem mais escuro do início ao fim; todos voltam e o fundo clareia quando conjurador e alvos voltam à posição) vale pra **jutsu E perseguição**.
  - **Hover no inimigo:** destaque verde + vida em número (restante/total) enquanto o mouse estiver em cima.
  - **Clique no inimigo:** marca em azul até clicar de novo. **Só jutsus** usam o alvo marcado; jutsus com restrição (mais fraco, todos) ignoram; básico segue a regra normal.
  - **Esquiva (`dodge`) por ninja:** alguns ficam com 0. Desviável: básico, forte, jutsu de alvo único. Não desviável: jutsu de "todos", DoT, cura, perseguição já em andamento. Esquiva = anim `dodge` (ou fallback em código), sem número, sem texto "ESQUIVOU", não muda estado; se era parte de combo, o combo para. Valores base: Mayoi 15, Hiyori 10, Fuuka 8, resto 0 (ajustar).
  - **Tempo próprio por animação:** sem duração fixa por ação; esperar a anim/efeito terminar (atlas novos trazem fps por anim e `pingpong`).
- ⬜ **1 — molde antigo:** corrigir o **Kaen** (caído vertical → horizontal, fundo cinza → transparente, perseguição aérea fraca) e integrar **Mizuha** (config pronto), **Iwao** e **Raiden** (escrever os configs; sheets em `tools/sprites/src/`). Raiden: 4 arquivos com nome genérico, provavelmente lotes A–D, identificar pelo conteúdo. Iwao: frames largos com Guardião de Pedra (cuidar de clipping, talvez `scale_mul`).
- ⬜ **2 — template v2:** integrar **Mayoi, Fuuka e Hiyori** seguindo a seção "Mecânica" de cada um em `docs/ninjas.md` (pré-definida, sem perguntar de novo). Fuuka e Hiyori têm config; Mayoi: escrever o config (`src/mayoi/A..D.png`, molde antigo de 8 linhas no A). Campo/"plano" da Mayoi entra aqui.
- ⬜ **Depois:** Doku (gerar sheets A1–D com o template v2 + lições 12 a 17, mecânica a definir em `docs/ninjas.md`, depois integrar).

## Ideias em aberto (não pedidas)
Ninjas mais legíveis no campo, ícones de jutsu e retratos, parallax, cenários gerados na IA no estilo dos sprites novos (os atuais destoam), níveis, recrutamento, chefes, invocações, "planos" de campo por elemento, ninja de Distorção/Espaço (segurado).
