# Idle novo da Mizuha e do Iwao (1 linha, 8 colunas, anexar o sheet A atual de cada um)

Objetivo: trocar o idle atual (respiração em código) por um idle gerado, com personalidade própria. Livre: o corpo pode se mover, deslizar, mudar de pose.
Salvar como `tools/sprites/src/mizuha/I.png` e `tools/sprites/src/iwao/I.png`. Anexo: `A.jpg` do ninja (referência do personagem).
Integração: no config, a sheet `I` entra PRIMEIRA com `{"file":"I.png","rows":1,"cols":8,"anims":[{"name":"idle","anchor":"cell","fps":8}]}` e a anim `idle` sai da sheet A (`A` começa em `walk`). Isso desloca as linhas do atlas: regerar a linha do ninja no `V2` de `js/sprites.js`. Voltar o `breathe: "first"` do idle nos configs (tirar).

---
## MIZUHA - LOTE I
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 1 row and EXACTLY 8 columns, a fixed grid of identical cells, LANDSCAPE image. Do NOT add, remove, merge or skip cells.
2. ONE animation only: IDLE, using ALL 8 cells in order, a smooth loop (frame 8 flows back into frame 1).
3. Every frame is fully opaque and complete. NO ghost, translucent, half-faded, duplicated or cropped frames. Nothing touches or crosses the cell edge.
4. The character is IDENTICAL in every frame: same design, colors, proportions, pixel scale and outline. Faces RIGHT (side or three-quarter view). Pose and position inside the cell are FREE: the body may lean, slide, float, jump or shift anywhere in the cell, as long as it stays fully inside it.
5. No green on the character, outfit, outline or glow. Nothing turquoise, aqua, teal or greenish (her water effects use deep navy, royal blue and pale ice-blue only).
6. No border, no grid lines, no drop shadow, no ground, no extra text except the label.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient, also filling every gap between body parts.
LABEL: top-left corner only, small plain white pixel text "MIZUHA - LOTE I" on a thin dark strip above the grid.

Attached image is the ABSOLUTE source of truth for the character (Mizuha): copy exactly hair, outfit, colors, accessories, face, proportions and pixel scale. Do NOT redesign or recolor.

IDLE (8 frames), personality "flowing water, gentle and playful": she moves like a stream: her whole body sways softly in a slow wave, weight rolling from one foot to the other, ponytail and scarf flowing behind her, and over her open palm a small bubble of water floats up, wobbles and gets caught again. Calm, soft smile. Small water droplets only.
```

---
## IWAO - LOTE I
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 1 row and EXACTLY 8 columns, a fixed grid of identical cells, LANDSCAPE image. Do NOT add, remove, merge or skip cells.
2. ONE animation only: IDLE, using ALL 8 cells in order, a smooth loop (frame 8 flows back into frame 1).
3. Every frame is fully opaque and complete. NO ghost, translucent, half-faded, duplicated or cropped frames. Nothing touches or crosses the cell edge.
4. The character is IDENTICAL in every frame: same design, colors, proportions, pixel scale and outline. Faces RIGHT (side or three-quarter view). Pose and position inside the cell are FREE: the body may lean, slide, float, jump or shift anywhere in the cell, as long as it stays fully inside it.
5. No green on the character, outfit, outline or glow. Nothing turquoise, aqua, teal or greenish (earth effects use brown, tan and gray only).
6. No border, no grid lines, no drop shadow, no ground, no extra text except the label.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient, also filling every gap between body parts.
LABEL: top-left corner only, small plain white pixel text "IWAO - LOTE I" on a thin dark strip above the grid.

Attached image is the ABSOLUTE source of truth for the character (Iwao): copy exactly headband, face, armor and stone gauntlets, outfit, colors, proportions and pixel scale. Do NOT redesign or recolor.

IDLE (8 frames), personality "heavy, patient mountain": he stands solid and slow, a deep chest breath, then he slams one stone fist into the open palm of the other hand (a few small pebbles hop off the gauntlets), flexes the shoulders, rolls his neck, and settles back to the start. Heavy, deliberate, a little bored. Small pebbles only.
```
