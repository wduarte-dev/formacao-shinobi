# Prompts de sprite — template v2 + lições

Ler antes de escrever prompt de ninja novo. Exemplos completos e aprovados (Hiyori, Fuuka) estão no Project "GAME" do claude.ai.

## Regras de entrega
- **Entregar o texto FINAL de cada lote**, com nº de linhas, letra e nome preenchidos (nada de placeholder: a IA lê literal).
- **Máx. 4 linhas por sheet.** Lotes: A1 (idle 6, andar 8, investida 8, básico 7), A2 (forte 7, defesa 4, dano 3, esquiva 6), B1 (selos 6, liberar jutsu 8, buff 6), B2 (atordoado 4, vitória 6, derrota 8), C (repelido 8, lançado 8, derrubado 8, perseguição 8), D (efeitos 6x6).
- Anexos: A1 nenhum · A2←A1 · B1←A2 · B2←B1 · C←B2 · D←qualquer (só paleta). Errou contagem de linhas → regerar.
- Efeito grande só no D. Derrubado: "lies FLAT on the ground, body horizontal and parallel to the ground (never vertical)".
- Cores: nada turquesa/teal/aqua no personagem nem nos efeitos (o chroma key come). Usar "Nothing turquoise, aqua, teal or greenish".

## Bloco rígido v2 (início de A1, A2, B1, B2, C)
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY <N> rows and EXACTLY 8 columns, a fixed grid of identical cells, LANDSCAPE image. Do NOT add, remove, merge or skip rows. The image has <N> rows, not more.
2. ONE animation per row. A row contains ONLY its own animation. NEVER put a frame of another animation in a leftover cell of a row.
3. Use EXACTLY the number of frames listed for each row, starting at column 1. The remaining cells of that row stay EMPTY flat green (no sprite, no fragment, no smear).
4. Every frame is fully opaque and complete. NO ghost, translucent, half-faded, duplicated or cropped frames. Nothing touches or crosses the cell edge.
5. The character is IDENTICAL in every frame: same design, colors, proportions, pixel scale and outline. Always facing RIGHT, side view. Feet on the same baseline in every cell, character centered.
6. No green on the character, outfit, outline or glow (the background is green). Nothing turquoise, aqua, teal or greenish.
7. No border, no grid lines, no drop shadow, no ground, no extra text except the label.
8. No big effects. Only small glows or thin element lines near the body. Effect colors: <paleta>, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient.
LABEL: top-left corner only, small plain white pixel text "<NOME> - LOTE <X>" on a thin dark strip above the grid.
```
Depois: descrição do personagem (original, `Dark 1px outline, max 16 colors`, acessórios "clearly visible", onde fica cada peça), linhas numeradas com frames e "(cells X to 8 EMPTY)", e nos lotes com anexo: `Attached image is the ABSOLUTE source of truth for the character: copy exactly hair, outfit, colors, accessories, face, proportions and pixel scale. Do NOT redesign or recolor.`

## Bloco do lote D
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 6 rows and EXACTLY 6 columns, a fixed grid of identical LANDSCAPE cells. Do NOT add, remove, merge or skip rows. The image has 6 rows, not more.
2. ONE effect per row. A row contains ONLY its own effect, never a frame of another effect.
3. Use EXACTLY 6 frames in every row, using all 6 columns.
4. Every frame is fully opaque and complete, nothing touches or crosses the cell edge.
5. NO character, NO person, NO body in any cell. The attached image is only a color and style reference: do NOT draw the character.
6. Effects must be BIG and dramatic, filling most of the cell, much larger than a person. Same style and scale across the frames of a row. Effects travel LEFT to RIGHT.
7. Colors: <paleta> only, dark 1px outline, max 16 colors. NO green anywhere. Nothing turquoise, aqua, teal or greenish. No border, no grid lines, no shadows, no text except the label.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient.
LABEL: top-left corner only, small plain white pixel text "<NOME> - LOTE D" on a thin dark strip above the grid.
```
Linhas típicas: 1 projétil/lâmina, 2 onda do básico, 3 efeito do jutsu, 4 efeito da perseguição, 5 impacto, 6 aura em anel ao redor de espaço vazio do tamanho de um corpo.

## Lições (resumo)
1. Prompt pronto, sem placeholder. 2. Repetir contagem + "EMPTY". 3. Máx. 4 linhas (6 linhas → retrato e contagens erradas). 5. "No big effects" funciona nos A–C. 6. Frase do derrubado funciona. 7. Errou linhas → regerar. 8. Autoavaliação da IA gratuita é genérica; 2ª imagem alucinada → descartar. 9. Idle/repelido quase parados e buff sutil: resolver em código. 10. Anexar o sheet anterior mantém o personagem; escala varia (normalizar no recorte). 11. D sai ~3:2, franja verde → despill. 12. Turquesa some no key; usar marinho/azul-gelo. 13. Frames fantasma: descartar no recorte, só regerar se faltar frame. 14. Grade visível em IA de baixa resolução: o pipeline apaga. 15. Acessório pequeno some em movimento: descrever "identical in every frame". 16. D pode vir com 8 colunas: usar os 7 primeiros. 17. Rótulo com caractere quebrado: só descartar. 18. Mais frames por linha (10) é ok e fica mais fluido: usar `cols_out` no config. 19. Lote só de pulo/aéreo: alinhar pelo pé (`anchor: feet`); a altura no ar vem do código.

## Fluxo de entrega pro Wellington (decidido 21/11/2026)
Em todo lote **A** (sem anexo no fluxo normal) mandar **1 imagem de referência + o prompt pronto** (arquivos em `docs/refs/`: `<ninja>_ref.png` = frame de idle do atlas em fundo verde 4x, `<ninja>_esquiva_prompt.txt`). Ele gera, e depois anexa os gerados nos lotes seguintes.
