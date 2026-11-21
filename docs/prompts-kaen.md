# Prompts finais do Kaen — REGERAR no template v2 (corrige as manchas cinza do atlas antigo)

Por quê: as 18 animações antigas do `spr/kaen_atlas.png` têm manchas cinza escuras (atrás das pernas, perto da espada/cabeça), resto de fundo do molde antigo. Só o lote E (rise/meteor) está limpo. Cada prompt já pede "verde chapado preenchendo os vãos".
Ordem e anexos: **A1** (sem anexo; o visual vem da descrição) → **A2** (anexar A1) → **B1** (anexar A2) → **B2** (anexar B1) → **C** (anexar B2) → **D** (anexar qualquer sheet, só paleta).
Salvar em `tools/sprites/src/kaen/` como `A1, A2, B1, B2, C, E, D`. **Lote E novo** = perseguição inteira com a descida do chute até o chão (a atual fica parada no ar; o `chase` do C vira reserva). Depois: escrever `config/kaen.json` (A1 idle 6/walk 8/dash 8/attack 7 · A2 strong 7/guard 4/hurt 3/dodge 6 · B1 seals 6/jutsu 8/buff 6 · B2 stun 4/victory 6/defeat 8 · C knockback 8/launched 8/knockdown 8/chase 8) e trocar o `KANIM` do Kaen por entrada em `V2`.
Paleta: vermelho escuro, laranja, âmbar, amarelo claro, marrom brasa. Nada de verde/turquesa.

---
## LOTE A1 (4 linhas)
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 4 rows and EXACTLY 8 columns, a fixed grid of identical cells, LANDSCAPE image. Do NOT add, remove, merge or skip rows. The image has 4 rows, not more.
2. ONE animation per row. A row contains ONLY its own animation. NEVER put a frame of another animation in a leftover cell of a row.
3. Use EXACTLY the number of frames listed for each row, starting at column 1. The remaining cells of that row stay EMPTY flat green (no sprite, no fragment, no smear).
4. Every frame is fully opaque and complete. NO ghost, translucent, half-faded, duplicated or cropped frames. Nothing touches or crosses the cell edge.
5. The character is IDENTICAL in every frame: same design, colors, proportions, pixel scale and outline. Always facing RIGHT, side view. Feet on the same baseline in every cell, character centered.
6. No green on the character, outfit, outline or glow (the background is green). Nothing turquoise, aqua, teal or greenish.
7. No border, no grid lines, no drop shadow, no ground, no extra text except the label.
8. No big effects. Only small glows or thin element lines near the body. Effect colors: deep red, orange, amber, pale yellow, dark ember brown, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "KAEN - LOTE A1" on a thin dark strip above the grid.

CHARACTER (original ninja, pixel art, dark 1px outline, max 16 colors, about 3 heads tall): KAEN, a young fire ninja. Messy spiky red-orange hair. A long red scarf around the neck with a tail that flutters behind him. Black sleeveless tunic, a dark red sash tied at the waist, gray cloth wraps on both forearms, dark baggy pants, red leg wraps over dark boots. A katana in a black sheath on his back, the hilt clearly visible over his right shoulder, identical in every frame. Calm confident face.

ROWS:
Row 1: IDLE, 6 frames, relaxed but alert: one hand rests near the katana hilt over his shoulder, he rolls his shoulders and shifts his head slightly, the scarf tail flutters in a nonstop breeze. The body may sway, shift or slide a little, whatever feels natural for him (cells 7 to 8 EMPTY).
Row 2: WALK, 8 frames, walking cycle to the right, full 8 columns.
Row 3: DASH, 8 frames, fast low sprint forward, body leaning, a thin ember speed line at most, full 8 columns.
Row 4: BASIC ATTACK "Corte Ardente", 7 frames: draws the katana, winds up, slashes forward in a horizontal arc leaving a SMALL thin fire line along the blade, follow-through, sheathes, returns to stance (cell 8 EMPTY).
```

---
## LOTE A2 (4 linhas)
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 4 rows and EXACTLY 8 columns, a fixed grid of identical cells, LANDSCAPE image. Do NOT add, remove, merge or skip rows. The image has 4 rows, not more.
2. ONE animation per row. A row contains ONLY its own animation. NEVER put a frame of another animation in a leftover cell of a row.
3. Use EXACTLY the number of frames listed for each row, starting at column 1. The remaining cells of that row stay EMPTY flat green (no sprite, no fragment, no smear).
4. Every frame is fully opaque and complete. NO ghost, translucent, half-faded, duplicated or cropped frames. Nothing touches or crosses the cell edge.
5. The character is IDENTICAL in every frame: same design, colors, proportions, pixel scale and outline. Always facing RIGHT, side view. Feet on the same baseline in every cell, character centered.
6. No green on the character, outfit, outline or glow (the background is green). Nothing turquoise, aqua, teal or greenish.
7. No border, no grid lines, no drop shadow, no ground, no extra text except the label.
8. No big effects. Only small glows or thin element lines near the body. Effect colors: deep red, orange, amber, pale yellow, dark ember brown, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "KAEN - LOTE A2" on a thin dark strip above the grid.

CHARACTER (original ninja, pixel art, dark 1px outline, max 16 colors, about 3 heads tall): KAEN, a young fire ninja. Messy spiky red-orange hair. A long red scarf around the neck with a tail that flutters behind him. Black sleeveless tunic, a dark red sash tied at the waist, gray cloth wraps on both forearms, dark baggy pants, red leg wraps over dark boots. A katana in a black sheath on his back, the hilt clearly visible over his right shoulder, identical in every frame. Calm confident face.

Attached image is the ABSOLUTE source of truth for the character: copy exactly hair, outfit, colors, accessories, face, proportions and pixel scale. Do NOT redesign or recolor. The scarf, sash, forearm wraps and the katana on the back stay clearly visible and identical in every frame.

ROWS:
Row 1: STRONG ATTACK, 7 frames: crouches, charges, leaps forward and brings the katana down in a heavy overhead slash, holds the strike, recovers (cell 8 EMPTY).
Row 2: GUARD, 4 frames: crosses both forearms in front of the face, braces, holds, relaxes (cells 5 to 8 EMPTY).
Row 3: HURT, 3 frames: flinches back from a hit, head tilted, eyes shut, recovers a little (cells 4 to 8 EMPTY).
Row 4: DODGE, 6 frames: leans and hops backward in a quick light sidestep, scarf whipping, lands in a low balanced pose (cells 7 to 8 EMPTY).
```

---
## LOTE B1 (3 linhas)
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 3 rows and EXACTLY 8 columns, a fixed grid of identical cells, LANDSCAPE image. Do NOT add, remove, merge or skip rows. The image has 3 rows, not more.
2. ONE animation per row. A row contains ONLY its own animation. NEVER put a frame of another animation in a leftover cell of a row.
3. Use EXACTLY the number of frames listed for each row, starting at column 1. The remaining cells of that row stay EMPTY flat green (no sprite, no fragment, no smear).
4. Every frame is fully opaque and complete. NO ghost, translucent, half-faded, duplicated or cropped frames. Nothing touches or crosses the cell edge.
5. The character is IDENTICAL in every frame: same design, colors, proportions, pixel scale and outline. Always facing RIGHT, side view. Feet on the same baseline in every cell, character centered.
6. No green on the character, outfit, outline or glow (the background is green). Nothing turquoise, aqua, teal or greenish.
7. No border, no grid lines, no drop shadow, no ground, no extra text except the label.
8. No big effects. Only small glows or thin element lines near the body. Effect colors: deep red, orange, amber, pale yellow, dark ember brown, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "KAEN - LOTE B1" on a thin dark strip above the grid.

CHARACTER (original ninja, pixel art, dark 1px outline, max 16 colors, about 3 heads tall): KAEN, a young fire ninja. Messy spiky red-orange hair. A long red scarf around the neck with a tail that flutters behind him. Black sleeveless tunic, a dark red sash tied at the waist, gray cloth wraps on both forearms, dark baggy pants, red leg wraps over dark boots. A katana in a black sheath on his back, the hilt clearly visible over his right shoulder, identical in every frame. Calm confident face.

Attached image is the ABSOLUTE source of truth for the character: copy exactly hair, outfit, colors, accessories, face, proportions and pixel scale. Do NOT redesign or recolor. The scarf, sash, forearm wraps and the katana on the back stay clearly visible and identical in every frame.

ROWS:
Row 1: HAND SEALS, 6 frames: both hands form quick ninja seals in front of the chest, small orange sparks between the fingers, focused eyes (cells 7 to 8 EMPTY).
Row 2: RELEASE JUTSU "Dragao de Brasa", 8 frames: gathers fire in both hands, pulls back, then thrusts both palms forward to launch a dragon of embers, only SMALL flames near the hands, full 8 columns.
Row 3: BUFF, 6 frames: clenches both fists, a thin flame aura flickers around the body, scarf lifts, stands tall (cells 7 to 8 EMPTY).
```

---
## LOTE B2 (3 linhas)
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 3 rows and EXACTLY 8 columns, a fixed grid of identical cells, LANDSCAPE image. Do NOT add, remove, merge or skip rows. The image has 3 rows, not more.
2. ONE animation per row. A row contains ONLY its own animation. NEVER put a frame of another animation in a leftover cell of a row.
3. Use EXACTLY the number of frames listed for each row, starting at column 1. The remaining cells of that row stay EMPTY flat green (no sprite, no fragment, no smear).
4. Every frame is fully opaque and complete. NO ghost, translucent, half-faded, duplicated or cropped frames. Nothing touches or crosses the cell edge.
5. The character is IDENTICAL in every frame: same design, colors, proportions, pixel scale and outline. Always facing RIGHT, side view. Feet on the same baseline in every cell, character centered.
6. No green on the character, outfit, outline or glow (the background is green). Nothing turquoise, aqua, teal or greenish.
7. No border, no grid lines, no drop shadow, no ground, no extra text except the label.
8. No big effects. Only small glows or thin element lines near the body. Effect colors: deep red, orange, amber, pale yellow, dark ember brown, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "KAEN - LOTE B2" on a thin dark strip above the grid.

CHARACTER (original ninja, pixel art, dark 1px outline, max 16 colors, about 3 heads tall): KAEN, a young fire ninja. Messy spiky red-orange hair. A long red scarf around the neck with a tail that flutters behind him. Black sleeveless tunic, a dark red sash tied at the waist, gray cloth wraps on both forearms, dark baggy pants, red leg wraps over dark boots. A katana in a black sheath on his back, the hilt clearly visible over his right shoulder, identical in every frame. Calm confident face.

Attached image is the ABSOLUTE source of truth for the character: copy exactly hair, outfit, colors, accessories, face, proportions and pixel scale. Do NOT redesign or recolor. The scarf, sash, forearm wraps and the katana on the back stay clearly visible and identical in every frame.

ROWS:
Row 1: STUNNED, 4 frames: dizzy, swaying on his feet, head drooping, small orange stars circling the head (cells 5 to 8 EMPTY).
Row 2: VICTORY, 6 frames: plants a fist forward then raises it with a confident grin, scarf blowing, small ember sparkle (cells 7 to 8 EMPTY).
Row 3: DEFEAT, 8 frames: staggers, drops to his knees, slumps forward and finally lies FLAT on the ground, body horizontal and parallel to the ground (never vertical), last frames fully lying (full 8 columns).
```

---
## LOTE C (4 linhas)
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 4 rows and EXACTLY 8 columns, a fixed grid of identical cells, LANDSCAPE image. Do NOT add, remove, merge or skip rows. The image has 4 rows, not more.
2. ONE animation per row. A row contains ONLY its own animation. NEVER put a frame of another animation in a leftover cell of a row.
3. Use EXACTLY the number of frames listed for each row, starting at column 1. The remaining cells of that row stay EMPTY flat green (no sprite, no fragment, no smear).
4. Every frame is fully opaque and complete. NO ghost, translucent, half-faded, duplicated or cropped frames. Nothing touches or crosses the cell edge.
5. The character is IDENTICAL in every frame: same design, colors, proportions, pixel scale and outline. Always facing RIGHT, side view. Feet on the same baseline in every cell, character centered.
6. No green on the character, outfit, outline or glow (the background is green). Nothing turquoise, aqua, teal or greenish.
7. No border, no grid lines, no drop shadow, no ground, no extra text except the label.
8. No big effects. Only small glows or thin element lines near the body. Effect colors: deep red, orange, amber, pale yellow, dark ember brown, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "KAEN - LOTE C" on a thin dark strip above the grid.

CHARACTER (original ninja, pixel art, dark 1px outline, max 16 colors, about 3 heads tall): KAEN, a young fire ninja. Messy spiky red-orange hair. A long red scarf around the neck with a tail that flutters behind him. Black sleeveless tunic, a dark red sash tied at the waist, gray cloth wraps on both forearms, dark baggy pants, red leg wraps over dark boots. A katana in a black sheath on his back, the hilt clearly visible over his right shoulder, identical in every frame. Calm confident face.

Attached image is the ABSOLUTE source of truth for the character: copy exactly hair, outfit, colors, accessories, face, proportions and pixel scale. Do NOT redesign or recolor. The scarf, sash, forearm wraps and the katana on the back stay clearly visible and identical in every frame.

ROWS:
Row 1: KNOCKED BACK (repelled), 8 frames: hit from the front, body pushed backward, leaning back with arms out, sliding back off balance, ends upright but leaning (full 8 columns).
Row 2: LAUNCHED, 8 frames: thrown into the air, rises, tumbles at the top, body arched, begins to fall, arms flailing (full 8 columns).
Row 3: KNOCKED DOWN, 8 frames: falls from standing and lies FLAT on the ground, body horizontal and parallel to the ground (never vertical), stays flat in the last frames (full 8 columns).
Row 4: PURSUIT "Chute Meteoro", 8 frames: leaps high, flips in the air, dives DOWNWARD diagonally with one leg extended in a flying kick, the foot wrapped in a SMALL flame, impacts, lands crouched, rises (full 8 columns).
```

---
## LOTE E (3 linhas) — Chute Meteoro completo: sobe, desce e acerta no chão — anexar C (ou B2)
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 3 rows and EXACTLY 8 columns, a fixed grid of identical cells, LANDSCAPE image. Do NOT add, remove, merge or skip rows. The image has 3 rows, not more.
2. ONE animation per row. A row contains ONLY its own animation. NEVER put a frame of another animation in a leftover cell of a row.
3. Use EXACTLY the number of frames listed for each row, starting at column 1. The remaining cells of that row stay EMPTY flat green (no sprite, no fragment, no smear).
4. Every frame is fully opaque and complete. NO ghost, translucent, half-faded, duplicated or cropped frames. Nothing touches or crosses the cell edge.
5. The character is IDENTICAL in every frame: same design, colors, proportions, pixel scale and outline. Always facing RIGHT, side view. Feet on the same baseline in every cell, character centered.
6. No green on the character, outfit, outline or glow (the background is green). Nothing turquoise, aqua, teal or greenish.
7. No border, no grid lines, no drop shadow, no ground, no extra text except the label.
8. No big effects. Only small glows or thin element lines near the body. Effect colors: deep red, orange, amber, pale yellow, dark ember brown, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "KAEN - LOTE E" on a thin dark strip above the grid.

CHARACTER (original ninja, pixel art, dark 1px outline, max 16 colors, about 3 heads tall): KAEN, a young fire ninja. Messy spiky red-orange hair. A long red scarf around the neck with a tail that flutters behind him. Black sleeveless tunic, a dark red sash tied at the waist, gray cloth wraps on both forearms, dark baggy pants, red leg wraps over dark boots. A katana in a black sheath on his back, the hilt clearly visible over his right shoulder, identical in every frame. Calm confident face.

Attached image is the ABSOLUTE source of truth for the character: copy exactly hair, outfit, colors, accessories, face, proportions and pixel scale. Do NOT redesign or recolor. The scarf, sash, forearm wraps and the katana on the back stay clearly visible and identical in every frame.

ROWS:
Row 1: PURSUIT PART 1, LEAP: 8 frames: crouches, jumps straight up with great power, rises very high, flips and tumbles at the top of the jump, scarf trailing, body curled, ready to dive (full 8 columns). Show the height by the pose only, no ground.
Row 2: PURSUIT PART 2, METEOR DIVE: 8 frames: from the top he straightens into a diagonal dive, one leg extended forward in a FLYING KICK with the foot and shin wrapped in fire, falls fast and steeper each frame, the last 3 frames show the kick landing on an invisible target at ground level with a small flame burst at the foot (full 8 columns). Both feet end near the ground line.
Row 3: PURSUIT PART 3, LANDING: 6 frames: after the kick he lands in a deep crouch with one hand on the ground, small embers around the foot, holds, slowly rises and returns to a relaxed standing pose (cells 7 to 8 EMPTY).
Do not draw the enemy. Do not draw a ground line or shadow.
```

---
## LOTE D — efeitos 6x6
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 6 rows and EXACTLY 6 columns, a fixed grid of identical LANDSCAPE cells. Do NOT add, remove, merge or skip rows. The image has 6 rows, not more.
2. ONE effect per row. A row contains ONLY its own effect, never a frame of another effect.
3. Use EXACTLY 6 frames in every row, using all 6 columns.
4. Every frame is fully opaque and complete, nothing touches or crosses the cell edge.
5. NO character, NO person, NO body in any cell. The attached image is only a color and style reference: do NOT draw the character.
6. Effects must be BIG and dramatic, filling most of the cell, much larger than a person. Same style and scale across the frames of a row. Effects travel LEFT to RIGHT.
7. Colors: deep red, orange, amber, pale yellow, dark ember brown only, dark 1px outline, max 16 colors. NO green anywhere. Nothing turquoise, aqua, teal or greenish. No border, no grid lines, no shadows, no text except the label.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient.
LABEL: top-left corner only, small plain white pixel text "KAEN - LOTE D" on a thin dark strip above the grid.

ROWS (each one effect, 6 frames):
Row 1: FIRE CRESCENT: a large flaming crescent slash flying through the air from left to right, with a short ember trail.
Row 2: SLASH WAVE (basic attack): a wide arc of fire from a katana cut, sweeping, then breaking into sparks.
Row 3: EMBER DRAGON (jutsu): a huge dragon made of fire and embers, coiling and flying forward, jaws open, growing across the cell.
Row 4: METEOR TRAIL (pursuit): a diagonal comet of fire streaking downward with a shock ring at the tip, growing and fading.
Row 5: IMPACT: a sharp orange and pale yellow hit burst with radial spikes and a few sparks.
Row 6: AURA RING: a ring of swirling flames around an EMPTY space the size of a body, rising upward, with small sparks.
```
