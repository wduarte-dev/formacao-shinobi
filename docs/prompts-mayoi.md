# Mayoi — lotes completos (gerado por tools/sprites/gen_prompts_lotes.py)

Ordem e anexos: **A1** ← `docs/refs/elenco_ref.png` → **A2** ← A1 → **B1** ← A2 → **B2** ← B1 → **C** ← B2 → **D** ← qualquer sheet (só paleta). Salvar em `tools/sprites/src/mayoi/`.

## LOTE A1
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 4 rows and EXACTLY 8 columns, a fixed grid of identical cells, LANDSCAPE image. Do NOT add, remove, merge or skip rows. The image has 4 rows, not more.
2. ONE animation per row. A row contains ONLY its own animation. NEVER put a frame of another animation in a leftover cell of a row.
3. Use EXACTLY the number of frames listed for each row, starting at column 1. The remaining cells of that row stay EMPTY flat green (no sprite, no fragment, no smear).
4. Every frame is fully opaque and complete. NO ghost, translucent, half-faded, duplicated or cropped frames. Nothing touches or crosses the cell edge.
5. The character is IDENTICAL in every frame: same design, colors, proportions, pixel scale and outline. Faces RIGHT (side or three-quarter view). Pose and position inside the cell are FREE: the body may lean, slide, float, jump or shift anywhere in the cell, as long as it stays fully inside it.
6. No green on the character, outfit, outline or glow (the background is green). Nothing turquoise, aqua, teal or greenish.
7. No border, no grid lines, no drop shadow, no ground, no extra text except the label.
8. No big effects. Only small glows or thin element lines near the body. Effect colors: slate gray, dusty violet, lilac, pale lilac, a little warm paper-lantern amber, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "MAYOI - LOTE A1" on a thin dark strip above the grid.

Attached image shows SEVERAL different characters of the same game (the style roster): it is a STYLE and PROPORTION reference ONLY. Copy ONLY the shared pixel-art style, outline weight, pixel scale and body proportions (realistic athletic young adults, about 6.5 heads tall, SMALL head, long legs, serious grounded look). Do NOT copy any of their faces, hair, clothes or colors. Do NOT redraw any of them: the new character must look clearly different from all of them.

CHARACTER (original ninja, pixel art, dark 1px outline, max 16 colors, realistic athletic young-adult proportions, about 6.5 heads tall, SMALL head, long legs, serious grounded look like the attached reference, NOT chibi, NOT cute, NOT big-headed): MAYOI, a young mist ninja. Gray-blue hair that covers one eye. A long lilac scarf. Slate-violet outfit with moth-wing patterns on the sleeves, dark pants and boots. A short cane in the right hand with a small glowing paper lantern hanging from its tip, clearly visible in every frame. A few ghostly pale moths fluttering around her. Quiet, mysterious, slightly sleepy expression.

ROWS:
Row 1: IDLE, 6 frames: she sways slowly like drifting mist, scarf floating, the lantern swings softly, a moth lands on her shoulder and takes off (cells 7 to 8 EMPTY).
Row 2: WALK, 8 frames, walking cycle to the right, full 8 columns.
Row 3: DASH, 8 frames, fast low glide forward, body leaning, a few moths trailing behind, full 8 columns.
Row 4: BASIC ATTACK "Bengala e Mariposas", 7 frames: she steps in, swings the cane in a wide arc, a few small pale moths burst out from the lantern at the hit, follow-through, returns to stance (cell 8 EMPTY).
```

## LOTE A2
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 4 rows and EXACTLY 8 columns, a fixed grid of identical cells, LANDSCAPE image. Do NOT add, remove, merge or skip rows. The image has 4 rows, not more.
2. ONE animation per row. A row contains ONLY its own animation. NEVER put a frame of another animation in a leftover cell of a row.
3. Use EXACTLY the number of frames listed for each row, starting at column 1. The remaining cells of that row stay EMPTY flat green (no sprite, no fragment, no smear).
4. Every frame is fully opaque and complete. NO ghost, translucent, half-faded, duplicated or cropped frames. Nothing touches or crosses the cell edge.
5. The character is IDENTICAL in every frame: same design, colors, proportions, pixel scale and outline. Faces RIGHT (side or three-quarter view). Pose and position inside the cell are FREE: the body may lean, slide, float, jump or shift anywhere in the cell, as long as it stays fully inside it.
6. No green on the character, outfit, outline or glow (the background is green). Nothing turquoise, aqua, teal or greenish.
7. No border, no grid lines, no drop shadow, no ground, no extra text except the label.
8. No big effects. Only small glows or thin element lines near the body. Effect colors: slate gray, dusty violet, lilac, pale lilac, a little warm paper-lantern amber, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "MAYOI - LOTE A2" on a thin dark strip above the grid.

Attached image is the ABSOLUTE source of truth for the character (Mayoi): copy exactly the gray-blue hair covering one eye, long lilac scarf, slate-violet outfit with moth-wing patterns on the sleeves, the short cane with the small paper lantern, dark pants and boots, face, realistic athletic proportions (about 6.5 heads tall, SMALL head, long legs) and pixel scale. Do NOT redesign or recolor. Do NOT make the head bigger.

ROWS:
Row 1: STRONG ATTACK "Onda de Nevoa", 7 frames: she stays in place, raises the cane, plants it on the ground, then sweeps it forward pushing a low wave of mist ahead of her (only a SMALL thin mist line near the cane), follow-through, recovers (cell 8 EMPTY).
Row 2: GUARD, 4 frames: she pulls the scarf and cane across her body, a few moths gather in front of her, holds, relaxes (cells 5 to 8 EMPTY).
Row 3: HURT, 3 frames: hit from the front, head snaps back, hair swings, body recoils, steps back and recovers (cells 4 to 8 EMPTY).
Row 4: DODGE, 8 frames: her body bursts into a flock of pale moths that scatters, and the moths gather again a short step back and re-form into her, lands in stance (full 8 columns).
```

## LOTE B1
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 3 rows and EXACTLY 8 columns, a fixed grid of identical cells, LANDSCAPE image. Do NOT add, remove, merge or skip rows. The image has 3 rows, not more.
2. ONE animation per row. A row contains ONLY its own animation. NEVER put a frame of another animation in a leftover cell of a row.
3. Use EXACTLY the number of frames listed for each row, starting at column 1. The remaining cells of that row stay EMPTY flat green (no sprite, no fragment, no smear).
4. Every frame is fully opaque and complete. NO ghost, translucent, half-faded, duplicated or cropped frames. Nothing touches or crosses the cell edge.
5. The character is IDENTICAL in every frame: same design, colors, proportions, pixel scale and outline. Faces RIGHT (side or three-quarter view). Pose and position inside the cell are FREE: the body may lean, slide, float, jump or shift anywhere in the cell, as long as it stays fully inside it.
6. No green on the character, outfit, outline or glow (the background is green). Nothing turquoise, aqua, teal or greenish.
7. No border, no grid lines, no drop shadow, no ground, no extra text except the label.
8. No big effects. Only small glows or thin element lines near the body. Effect colors: slate gray, dusty violet, lilac, pale lilac, a little warm paper-lantern amber, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "MAYOI - LOTE B1" on a thin dark strip above the grid.

Attached image is the ABSOLUTE source of truth for the character (Mayoi): copy exactly the gray-blue hair covering one eye, long lilac scarf, slate-violet outfit with moth-wing patterns on the sleeves, the short cane with the small paper lantern, dark pants and boots, face, realistic athletic proportions (about 6.5 heads tall, SMALL head, long legs) and pixel scale. Do NOT redesign or recolor. Do NOT make the head bigger.

ROWS:
Row 1: HAND SEALS, 6 frames: she holds the cane in one hand and makes slow seals with the other, the lantern glows brighter, a thin mist gathers around her feet (cells 7 to 8 EMPTY).
Row 2: RELEASE JUTSU "Noite de Nevoa", 8 frames: she raises the lantern high, it flares, she sweeps the cane in a slow circle and mist pours out around her feet, follow-through, arm lowered. Only SMALL mist wisps near the body, the big night fog comes later (full 8 columns).
Row 3: BUFF, 6 frames: she closes her eyes, moths spiral up around her body in a soft ring of lilac and pale light, she opens her eyes and returns to stance (cells 7 to 8 EMPTY).
```

## LOTE B2
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 3 rows and EXACTLY 8 columns, a fixed grid of identical cells, LANDSCAPE image. Do NOT add, remove, merge or skip rows. The image has 3 rows, not more.
2. ONE animation per row. A row contains ONLY its own animation. NEVER put a frame of another animation in a leftover cell of a row.
3. Use EXACTLY the number of frames listed for each row, starting at column 1. The remaining cells of that row stay EMPTY flat green (no sprite, no fragment, no smear).
4. Every frame is fully opaque and complete. NO ghost, translucent, half-faded, duplicated or cropped frames. Nothing touches or crosses the cell edge.
5. The character is IDENTICAL in every frame: same design, colors, proportions, pixel scale and outline. Faces RIGHT (side or three-quarter view). Pose and position inside the cell are FREE: the body may lean, slide, float, jump or shift anywhere in the cell, as long as it stays fully inside it.
6. No green on the character, outfit, outline or glow (the background is green). Nothing turquoise, aqua, teal or greenish.
7. No border, no grid lines, no drop shadow, no ground, no extra text except the label.
8. No big effects. Only small glows or thin element lines near the body. Effect colors: slate gray, dusty violet, lilac, pale lilac, a little warm paper-lantern amber, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "MAYOI - LOTE B2" on a thin dark strip above the grid.

Attached image is the ABSOLUTE source of truth for the character (Mayoi): copy exactly the gray-blue hair covering one eye, long lilac scarf, slate-violet outfit with moth-wing patterns on the sleeves, the short cane with the small paper lantern, dark pants and boots, face, realistic athletic proportions (about 6.5 heads tall, SMALL head, long legs) and pixel scale. Do NOT redesign or recolor. Do NOT make the head bigger.

ROWS:
Row 1: STUNNED, 4 frames: dazed, swaying, head drooping, the lantern flickers and dims, a few moths circle her head (cells 5 to 8 EMPTY).
Row 2: VICTORY, 6 frames: she tilts her head and gives a small sleepy smile, the lantern glows warm, moths flutter up around her, she tucks the cane under her arm (cells 7 to 8 EMPTY).
Row 3: DEFEAT, 8 frames: hit, drops to her knees, the lantern dims, collapses forward and lies still, a single moth rests on her (full 8 columns).
```

## LOTE C
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 4 rows and EXACTLY 8 columns, a fixed grid of identical cells, LANDSCAPE image. Do NOT add, remove, merge or skip rows. The image has 4 rows, not more.
2. ONE animation per row. A row contains ONLY its own animation. NEVER put a frame of another animation in a leftover cell of a row.
3. Use EXACTLY the number of frames listed for each row, starting at column 1. The remaining cells of that row stay EMPTY flat green (no sprite, no fragment, no smear).
4. Every frame is fully opaque and complete. NO ghost, translucent, half-faded, duplicated or cropped frames. Nothing touches or crosses the cell edge.
5. The character is IDENTICAL in every frame: same design, colors, proportions, pixel scale and outline. Faces RIGHT (side or three-quarter view). Pose and position inside the cell are FREE: the body may lean, slide, float, jump or shift anywhere in the cell, as long as it stays fully inside it.
6. No green on the character, outfit, outline or glow (the background is green). Nothing turquoise, aqua, teal or greenish.
7. No border, no grid lines, no drop shadow, no ground, no extra text except the label.
8. No big effects. Only small glows or thin element lines near the body. Effect colors: slate gray, dusty violet, lilac, pale lilac, a little warm paper-lantern amber, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "MAYOI - LOTE C" on a thin dark strip above the grid.

Attached image is the ABSOLUTE source of truth for the character (Mayoi): copy exactly the gray-blue hair covering one eye, long lilac scarf, slate-violet outfit with moth-wing patterns on the sleeves, the short cane with the small paper lantern, dark pants and boots, face, realistic athletic proportions (about 6.5 heads tall, SMALL head, long legs) and pixel scale. Do NOT redesign or recolor. Do NOT make the head bigger.

ROWS:
Row 1: KNOCKED BACK (repelled), 8 frames: hit by a heavy blow, flung backwards off her feet, body leaning back and sliding away, scarf flying, ending in a hard skid (full 8 columns).
Row 2: LAUNCHED, 8 frames: thrown up into the air by a blow from below, body rising and rotating, peaks at the top, starts to hang in the air (full 8 columns).
Row 3: KNOCKED DOWN, 8 frames: falls and lies FLAT on the ground, body horizontal and parallel to the ground (never vertical), bounces once, then lies still, then slowly starts to get back up (full 8 columns).
Row 4: CHASE "Tempestade de Mariposas", 8 frames: she stays in place, raises the lantern and spreads her arms, a swarm of moths pours out of the lantern and sleeves and surges forward, she holds the pose, lowers her arms and returns to stance (full 8 columns).
```

## LOTE D
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 6 rows and EXACTLY 6 columns, a fixed grid of identical LANDSCAPE cells. Do NOT add, remove, merge or skip rows. The image has 6 rows, not more.
2. ONE effect per row. A row contains ONLY its own effect, never a frame of another effect.
3. Use EXACTLY 6 frames in every row, using all 6 columns.
4. Every frame is fully opaque and complete, nothing touches or crosses the cell edge.
5. NO character, NO person, NO body in any cell. The attached image is only a color and style reference: do NOT draw the character.
6. Effects must be BIG and dramatic, filling most of the cell, much larger than a person. Same style and scale across the frames of a row. Effects travel LEFT to RIGHT.
7. Colors: slate gray, dusty violet, lilac, pale lilac, a little warm paper-lantern amber only, dark 1px outline, max 16 colors. NO green anywhere. Nothing turquoise, aqua, teal or greenish. No border, no grid lines, no shadows, no text except the label.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient.
LABEL: top-left corner only, small plain white pixel text "MAYOI - LOTE D" on a thin dark strip above the grid.

ROWS (each one effect, 6 frames):
Row 1: MOTH SWARM: a dense swarm of pale moths flying from left to right in a loose stream, wings flapping, trailing glow.
Row 2: MIST CLOUD: a big soft cloud of mist that dissolves into moths and re-forms, growing then fading.
Row 3: MIST WAVE (strong attack): a low wide wave of mist rolling forward from left to right with curling wisps.
Row 4: IMPACT: a sharp pale lilac and white hit burst with radial spikes and a few moths.
Row 5: AURA RING: a ring of swirling mist and small moths around an EMPTY space the size of a body, rising upward.
Row 6: SMALL FLASH: a quick small flash of lilac and amber light with a few sparks, used for the lantern.
```

