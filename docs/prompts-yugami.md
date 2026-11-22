# Prompts finais do Yugami (ninja de Distorção/Espaço) — colar cada bloco inteiro na IA de imagem
> Nome provisório (distorção em japonês). Paleta: azul-marinho, dourado, branco, creme. Visual: humano glitchado (corpo fatiado e deslocado, um corpo só, sem cópias). **Nada de verde/turquesa.** Tamanho normal (`size` 1.0). Mecânica sugerida: jutsu "Troca de Espaço" (troca de lugar na formação), perseguição "Passo Dimensional" por teleporte. Decidir ao integrar.
**Ref de idle:** `docs/refs/kaen_ref.png` = frame de idle **já existente** (Kaen, ampliado 4x, fundo verde chapado). Nada gerado. Vai **só no A1**, como referência de estilo/escala (o A1 avisa pra não copiar o design dela). A2←A1, B1←A2, B2←B1, C←B2, D←qualquer sheet (só paleta). Salvar em `tools/sprites/src/yugami/` como `A1, A2, B1, B2, C, D`. Errou contagem de linhas → regerar.

---
## LOTE A1 (4 linhas) — anexo: `kaen_ref.png`
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 4 rows and EXACTLY 8 columns, a fixed grid of identical cells, LANDSCAPE image. Do NOT add, remove, merge or skip rows. The image has 4 rows, not more.
2. ONE animation per row. A row contains ONLY its own animation. NEVER put a frame of another animation in a leftover cell of a row.
3. Use EXACTLY the number of frames listed for each row, starting at column 1. The remaining cells of that row stay EMPTY flat green (no sprite, no fragment, no smear).
4. Every frame is fully opaque and complete. NO ghost, translucent, half-faded, duplicated or cropped frames. Nothing touches or crosses the cell edge.
5. The character is IDENTICAL in every frame: same design, colors, proportions, pixel scale and outline. Faces RIGHT (side or three-quarter view). Pose and position inside the cell are FREE: the body may lean, slide, float, jump, glitch-teleport or shift anywhere in the cell, as long as it stays fully inside it. The glitch is ONLY horizontal slices shifted sideways inside one opaque body: no copies, no afterimages.
6. No green on the character, outfit, outline or glow (the background is green). Nothing turquoise, aqua, teal or greenish.
7. No border, no grid lines, no drop shadow, no ground, no extra text except the label.
8. No big effects. Only small glows, tiny gold pixel specks or thin gold glitch lines near the body. Effect colors: deep navy blue, gold, white, pale cream, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "YUGAMI - LOTE A1" on a thin dark strip above the grid.

CHARACTER (original ninja, pixel art, dark 1px outline, max 16 colors, chibi-ish proportions, about 3 heads tall): YUGAMI, a young GLITCHED ninja whose body is warped by broken space. Messy jet-black hair. Lower face covered by a deep navy-blue cloth mask. Dark navy tunic with gold trim, a wide dark sash, dark gloves, dark pants, dark boots, and a short navy cloak with a jagged cut hem. GLITCH LOOK (always the same in every frame): the body is cut into 2 or 3 horizontal slices that are shifted sideways by 2 to 4 pixels, like a broken screen, with a few thin gold and white pixel lines and tiny square pixel specks hanging off the edges. It is still ONE single opaque body, never duplicated, never translucent, never ghosted. On his chest, a small square gold glitch core that stays clearly visible. Two small floating gold pixel cubes beside his shoulders. Calm, slightly mischievous face.

Attached image is ONLY a reference for pixel-art STYLE, outline weight, canvas scale and cell size (a different ninja). Do NOT copy its red hair, scarf, katana, colors or outfit. Draw the NEW character described below, at the same pixel scale and level of detail.

ROWS:
Row 1: IDLE, 6 frames, free and alive: floats a few pixels off the ground, cloak strips dtearing, gold cubes orbiting slowly, tear pulsing (cells 7 to 8 EMPTY).
Row 2: WALK, 8 frames, calm walk to the right, torn cloak swaying, full 8 columns.
Row 3: DASH, 8 frames, fast forward blink-dash: leans, body stretches slightly, thin gold crack lines behind him, full 8 columns.
Row 4: BASIC ATTACK, 7 frames: SPATIAL SLASH. Draws a hand across the air, a thin gold crack opens in front of him, his other hand strikes through it, snaps shut, returns to stance (cell 8 EMPTY).
```

---
## LOTE A2 (4 linhas) — anexo: sheet A1
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 4 rows and EXACTLY 8 columns, a fixed grid of identical cells, LANDSCAPE image. Do NOT add, remove, merge or skip rows. The image has 4 rows, not more.
2. ONE animation per row. A row contains ONLY its own animation. NEVER put a frame of another animation in a leftover cell of a row.
3. Use EXACTLY the number of frames listed for each row, starting at column 1. The remaining cells of that row stay EMPTY flat green (no sprite, no fragment, no smear).
4. Every frame is fully opaque and complete. NO ghost, translucent, half-faded, duplicated or cropped frames. Nothing touches or crosses the cell edge.
5. The character is IDENTICAL in every frame: same design, colors, proportions, pixel scale and outline. Faces RIGHT (side or three-quarter view). Pose and position inside the cell are FREE: the body may lean, slide, float, jump, glitch-teleport or shift anywhere in the cell, as long as it stays fully inside it.
6. No green on the character, outfit, outline or glow (the background is green). Nothing turquoise, aqua, teal or greenish.
7. No border, no grid lines, no drop shadow, no ground, no extra text except the label.
8. No big effects. Only small glows, tiny gold pixel specks or thin gold glitch lines near the body. Effect colors: deep navy blue, gold, white, pale cream, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "YUGAMI - LOTE A2" on a thin dark strip above the grid.

CHARACTER (original ninja, pixel art, dark 1px outline, max 16 colors, chibi-ish proportions, about 3 heads tall): YUGAMI, a young GLITCHED ninja whose body is warped by broken space. Messy jet-black hair. Lower face covered by a deep navy-blue cloth mask. Dark navy tunic with gold trim, a wide dark sash, dark gloves, dark pants, dark boots, and a short navy cloak with a jagged cut hem. GLITCH LOOK (always the same in every frame): the body is cut into 2 or 3 horizontal slices that are shifted sideways by 2 to 4 pixels, like a broken screen, with a few thin gold and white pixel lines and tiny square pixel specks hanging off the edges. It is still ONE single opaque body, never duplicated, never translucent, never ghosted. On his chest, a small square gold glitch core that stays clearly visible. Two small floating gold pixel cubes beside his shoulders. Calm, slightly mischievous face.

Attached image is the ABSOLUTE source of truth for the character: copy exactly hair, outfit, colors, accessories, face, proportions and pixel scale. Do NOT redesign or recolor. The glitch slices, the gold chest core and the two floating gold cubes stay clearly visible and identical in every frame.

ROWS:
Row 1: STRONG ATTACK, 7 frames: DOUBLE RIFT. He opens two small tears, one beside him and one near the target, punches into one and the fist comes out of the other with a heavy hit, tears close (cell 8 EMPTY).
Row 2: GUARD, 4 frames: crosses his arms, the cloak wraps around him, tiny tear flickers on the chest (full 4 frames, cells 5 to 8 EMPTY).
Row 3: HURT, 3 frames: flinches back, body jitters, gold crack lines flash on the cloak (cells 4 to 8 EMPTY).
Row 4: DODGE, 6 frames: blinks out of the way by folding space, a quick sideways step back, shape slightly squashed mid-warp, then reappears (cells 7 to 8 EMPTY).
```

---
## LOTE B1 (3 linhas) — anexo: sheet A2
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 3 rows and EXACTLY 8 columns, a fixed grid of identical cells, LANDSCAPE image. Do NOT add, remove, merge or skip rows. The image has 3 rows, not more.
2. ONE animation per row. A row contains ONLY its own animation. NEVER put a frame of another animation in a leftover cell of a row.
3. Use EXACTLY the number of frames listed for each row, starting at column 1. The remaining cells of that row stay EMPTY flat green (no sprite, no fragment, no smear).
4. Every frame is fully opaque and complete. NO ghost, translucent, half-faded, duplicated or cropped frames. Nothing touches or crosses the cell edge.
5. The character is IDENTICAL in every frame: same design, colors, proportions, pixel scale and outline. Faces RIGHT (side or three-quarter view). Pose and position inside the cell are FREE: the body may lean, slide, float, jump, glitch-teleport or shift anywhere in the cell, as long as it stays fully inside it.
6. No green on the character, outfit, outline or glow (the background is green). Nothing turquoise, aqua, teal or greenish.
7. No border, no grid lines, no drop shadow, no ground, no extra text except the label.
8. No big effects. Only small glows, tiny gold pixel specks or thin gold glitch lines near the body. Effect colors: deep navy blue, gold, white, pale cream, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "YUGAMI - LOTE B1" on a thin dark strip above the grid.

CHARACTER (original ninja, pixel art, dark 1px outline, max 16 colors, chibi-ish proportions, about 3 heads tall): YUGAMI, a young GLITCHED ninja whose body is warped by broken space. Messy jet-black hair. Lower face covered by a deep navy-blue cloth mask. Dark navy tunic with gold trim, a wide dark sash, dark gloves, dark pants, dark boots, and a short navy cloak with a jagged cut hem. GLITCH LOOK (always the same in every frame): the body is cut into 2 or 3 horizontal slices that are shifted sideways by 2 to 4 pixels, like a broken screen, with a few thin gold and white pixel lines and tiny square pixel specks hanging off the edges. It is still ONE single opaque body, never duplicated, never translucent, never ghosted. On his chest, a small square gold glitch core that stays clearly visible. Two small floating gold pixel cubes beside his shoulders. Calm, slightly mischievous face.

Attached image is the ABSOLUTE source of truth for the character: copy exactly hair, outfit, colors, accessories, face, proportions and pixel scale. Do NOT redesign or recolor. The glitch slices, the gold chest core and the two floating gold cubes stay clearly visible and identical in every frame.

ROWS:
Row 1: HAND SEALS, 6 frames: both hands form quick seals in front of the chest, small gold sparks between the fingers, the chest glitch core widens (cells 7 to 8 EMPTY).
Row 2: RELEASE JUTSU "Troca de Espaco", 8 frames: claps both hands, a small gold ring spreads around him, he thrusts one palm forward and the air bends, only SMALL rings and cracks near the hands, full 8 columns.
Row 3: BUFF, 6 frames: closes his fists, a thin navy-and-gold aura flickers around the body, gold cubes spin faster, cloak lifts (cells 7 to 8 EMPTY).
```

---
## LOTE B2 (3 linhas) — anexo: sheet B1
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 3 rows and EXACTLY 8 columns, a fixed grid of identical cells, LANDSCAPE image. Do NOT add, remove, merge or skip rows. The image has 3 rows, not more.
2. ONE animation per row. A row contains ONLY its own animation. NEVER put a frame of another animation in a leftover cell of a row.
3. Use EXACTLY the number of frames listed for each row, starting at column 1. The remaining cells of that row stay EMPTY flat green (no sprite, no fragment, no smear).
4. Every frame is fully opaque and complete. NO ghost, translucent, half-faded, duplicated or cropped frames. Nothing touches or crosses the cell edge.
5. The character is IDENTICAL in every frame: same design, colors, proportions, pixel scale and outline. Faces RIGHT (side or three-quarter view). Pose and position inside the cell are FREE: the body may lean, slide, float, jump, glitch-teleport or shift anywhere in the cell, as long as it stays fully inside it.
6. No green on the character, outfit, outline or glow (the background is green). Nothing turquoise, aqua, teal or greenish.
7. No border, no grid lines, no drop shadow, no ground, no extra text except the label.
8. No big effects. Only small glows, tiny gold pixel specks or thin gold glitch lines near the body. Effect colors: deep navy blue, gold, white, pale cream, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "YUGAMI - LOTE B2" on a thin dark strip above the grid.

CHARACTER (original ninja, pixel art, dark 1px outline, max 16 colors, chibi-ish proportions, about 3 heads tall): YUGAMI, a young GLITCHED ninja whose body is warped by broken space. Messy jet-black hair. Lower face covered by a deep navy-blue cloth mask. Dark navy tunic with gold trim, a wide dark sash, dark gloves, dark pants, dark boots, and a short navy cloak with a jagged cut hem. GLITCH LOOK (always the same in every frame): the body is cut into 2 or 3 horizontal slices that are shifted sideways by 2 to 4 pixels, like a broken screen, with a few thin gold and white pixel lines and tiny square pixel specks hanging off the edges. It is still ONE single opaque body, never duplicated, never translucent, never ghosted. On his chest, a small square gold glitch core that stays clearly visible. Two small floating gold pixel cubes beside his shoulders. Calm, slightly mischievous face.

Attached image is the ABSOLUTE source of truth for the character: copy exactly hair, outfit, colors, accessories, face, proportions and pixel scale. Do NOT redesign or recolor. The glitch slices, the gold chest core and the two floating gold cubes stay clearly visible and identical in every frame.

ROWS:
Row 1: STUN, 4 frames: dazed, wobbling in place, gold cubes scattered and dim, small stars circling the head (cells 5 to 8 EMPTY).
Row 2: VICTORY, 6 frames: cocky pose, spins the gold cubes on one finger, small smile under the mask (cells 7 to 8 EMPTY).
Row 3: DEFEAT, 8 frames: the glitch core on the chest flickers and shrinks, his body slowly fades-out of focus but stays opaque, kneels, collapses face-down, full 8 columns.
```

---
## LOTE C (4 linhas) — anexo: sheet B2
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 4 rows and EXACTLY 8 columns, a fixed grid of identical cells, LANDSCAPE image. Do NOT add, remove, merge or skip rows. The image has 4 rows, not more.
2. ONE animation per row. A row contains ONLY its own animation. NEVER put a frame of another animation in a leftover cell of a row.
3. Use EXACTLY the number of frames listed for each row, starting at column 1. The remaining cells of that row stay EMPTY flat green (no sprite, no fragment, no smear).
4. Every frame is fully opaque and complete. NO ghost, translucent, half-faded, duplicated or cropped frames. Nothing touches or crosses the cell edge.
5. The character is IDENTICAL in every frame: same design, colors, proportions, pixel scale and outline. Faces RIGHT (side or three-quarter view). Pose and position inside the cell are FREE: the body may lean, slide, float, jump, glitch-teleport or shift anywhere in the cell, as long as it stays fully inside it.
6. No green on the character, outfit, outline or glow (the background is green). Nothing turquoise, aqua, teal or greenish.
7. No border, no grid lines, no drop shadow, no ground, no extra text except the label.
8. No big effects. Only small glows, tiny gold pixel specks or thin gold glitch lines near the body. Effect colors: deep navy blue, gold, white, pale cream, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "YUGAMI - LOTE C" on a thin dark strip above the grid.

CHARACTER (original ninja, pixel art, dark 1px outline, max 16 colors, chibi-ish proportions, about 3 heads tall): YUGAMI, a young GLITCHED ninja whose body is warped by broken space. Messy jet-black hair. Lower face covered by a deep navy-blue cloth mask. Dark navy tunic with gold trim, a wide dark sash, dark gloves, dark pants, dark boots, and a short navy cloak with a jagged cut hem. GLITCH LOOK (always the same in every frame): the body is cut into 2 or 3 horizontal slices that are shifted sideways by 2 to 4 pixels, like a broken screen, with a few thin gold and white pixel lines and tiny square pixel specks hanging off the edges. It is still ONE single opaque body, never duplicated, never translucent, never ghosted. On his chest, a small square gold glitch core that stays clearly visible. Two small floating gold pixel cubes beside his shoulders. Calm, slightly mischievous face.

Attached image is the ABSOLUTE source of truth for the character: copy exactly hair, outfit, colors, accessories, face, proportions and pixel scale. Do NOT redesign or recolor. The glitch slices, the gold chest core and the two floating gold cubes stay clearly visible and identical in every frame.

ROWS:
Row 1: KNOCKBACK (repelled), 8 frames: hit from the front, flies backward through the air, cloak whipping, arms out (full 8 columns).
Row 2: LAUNCHED, 8 frames: thrown upward, tumbling in the air, gold cubes trailing, then peak of the arc (full 8 columns).
Row 3: KNOCKDOWN, 8 frames: falls and lies FLAT on the ground, body horizontal and parallel to the ground (never vertical), tries to move, goes still (full 8 columns).
Row 4: CHASE ATTACK "Passo Dimensional", 8 frames: blinks behind the target (a thin gold crack opens), delivers a quick two-hit strike from the new position, crack snaps shut (full 8 columns).
```

---
## LOTE D (6x6, efeitos) — anexo: qualquer sheet (só paleta)
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 6 rows and EXACTLY 6 columns, a fixed grid of identical LANDSCAPE cells. Do NOT add, remove, merge or skip rows. The image has 6 rows, not more.
2. ONE effect per row. A row contains ONLY its own effect, never a frame of another effect.
3. Use EXACTLY 6 frames in every row, using all 6 columns.
4. Every frame is fully opaque and complete, nothing touches or crosses the cell edge.
5. NO character, NO person, NO body in any cell. The attached image is only a color and style reference: do NOT draw the character.
6. Effects must be BIG and dramatic, filling most of the cell, much larger than a person. Same style and scale across the frames of a row. Effects travel LEFT to RIGHT.
7. Colors: deep navy blue, gold, white, pale cream only, dark 1px outline, max 16 colors. NO green anywhere. Nothing turquoise, aqua, teal or greenish. No border, no grid lines, no shadows, no text except the label.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient.
LABEL: top-left corner only, small plain white pixel text "YUGAMI - LOTE D" on a thin dark strip above the grid.

ROWS:
Row 1: PROJECTILE, a spinning gold-edged shard of torn space flying right.
Row 2: BASIC WAVE, a thin gold crack that opens in the air and snaps shut with white light sparks.
Row 3: JUTSU "Troca de Espaco", two large gold rings opening on the ground/air, stars sucked into a swirl, then a flash.
Row 4: CHASE EFFECT, a vertical tear tearing open, a burst of navy shards flying out, tear closing.
Row 5: IMPACT, a big starburst with gold crack lines radiating from the center.
Row 6: AURA, a glowing navy-and-gold ring of stars around an EMPTY space the size of a body, pulsing.
```
