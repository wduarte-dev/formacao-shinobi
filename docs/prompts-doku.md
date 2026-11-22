# Doku — lotes completos (gerado por tools/sprites/gen_prompts_lotes.py)

Ordem e anexos: **A1** ← `docs/refs/elenco_ref.png` → **A2** ← A1 → **B1** ← A2 → **B2** ← B1 → **C** ← B2 → **D** ← qualquer sheet (só paleta). Salvar em `tools/sprites/src/doku/`.

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
8. No big effects. Only small glows or thin element lines near the body. Effect colors: deep plum, violet, magenta, pale lilac, tiny amber accents, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "DOKU - LOTE A1" on a thin dark strip above the grid.

Attached image shows SEVERAL different characters of the same game (the style roster): it is a STYLE and PROPORTION reference ONLY. Copy ONLY the shared pixel-art style, outline weight, pixel scale and body proportions (realistic athletic young adults, about 6.5 heads tall, SMALL head, long legs, serious grounded look). Do NOT copy any of their faces, hair, clothes or colors. Do NOT redraw any of them: the new character must look clearly different from all of them.

CHARACTER (original ninja, pixel art, dark 1px outline, max 16 colors, realistic athletic young-adult proportions, about 6.5 heads tall, SMALL head, long legs, serious grounded look like the attached reference, NOT chibi, NOT cute, NOT big-headed): DOKU, a young apothecary ninja. Short messy black hair. A short deep-plum hood pulled back on his shoulders. A charcoal-gray cloth mask covering nose and mouth. Charcoal tunic with deep-plum trim and a wide dark belt. A leather bandolier crossing his chest from left shoulder to right hip, holding 5 small glass vials filled with glowing violet liquid, clearly visible in every frame. Brown leather gloves, dark pants, dark boots. A small flat needle case strapped to his right forearm, clearly visible. No weapon in hand unless the row says so. Nothing green: the poison is VIOLET.

ROWS:
Row 1: IDLE, 6 frames: relaxed but wary, he checks a vial against the light, the vials sway, he rolls his shoulders (cells 7 to 8 EMPTY).
Row 2: WALK, 8 frames, walking cycle to the right, full 8 columns.
Row 3: DASH, 8 frames, fast low sprint forward, body leaning, a thin violet speed line at most, full 8 columns.
Row 4: BASIC ATTACK, 7 frames: he reaches to the bandolier, pulls a vial, winds up, THROWS the vial forward with a side-arm throw, follow-through, returns to stance. The vial leaves the hand in frame 5 and is gone afterwards (cell 8 EMPTY).
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
8. No big effects. Only small glows or thin element lines near the body. Effect colors: deep plum, violet, magenta, pale lilac, tiny amber accents, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "DOKU - LOTE A2" on a thin dark strip above the grid.

Attached image is the ABSOLUTE source of truth for the character (Doku): copy exactly the short messy black hair, short deep-plum hood pulled back, charcoal cloth mask, charcoal tunic with plum trim, wide dark belt, the leather bandolier with 5 glowing violet vials, brown leather gloves, the needle case on the right forearm, dark pants and boots, face, realistic athletic proportions (about 6.5 heads tall, SMALL head, long legs) and pixel scale. Do NOT redesign or recolor. Do NOT make the head bigger.

ROWS:
Row 1: STRONG ATTACK "Agulhas", 7 frames: he slides the needle case open, pulls 3 long thin needles between his fingers, crouches, LUNGES forward and stabs with the needles in a fast thrust, holds the thrust, pulls back, returns to stance (cell 8 EMPTY).
Row 2: GUARD, 4 frames: crosses both forearms in front of the face, braces, holds, relaxes (cells 5 to 8 EMPTY).
Row 3: HURT, 3 frames: flinches back from a hit, head tilted, eyes shut, recovers a little (cells 4 to 8 EMPTY).
Row 4: DODGE, 6 frames: leans and hops backward in a quick light sidestep, vials swinging, lands in a low balanced pose (cells 7 to 8 EMPTY).
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
8. No big effects. Only small glows or thin element lines near the body. Effect colors: deep plum, violet, magenta, pale lilac, tiny amber accents, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "DOKU - LOTE B1" on a thin dark strip above the grid.

Attached image is the ABSOLUTE source of truth for the character (Doku): copy exactly the short messy black hair, short deep-plum hood pulled back, charcoal cloth mask, charcoal tunic with plum trim, wide dark belt, the leather bandolier with 5 glowing violet vials, brown leather gloves, the needle case on the right forearm, dark pants and boots, face, realistic athletic proportions (about 6.5 heads tall, SMALL head, long legs) and pixel scale. Do NOT redesign or recolor. Do NOT make the head bigger.

ROWS:
Row 1: HAND SEALS, 6 frames: both hands form quick ninja seals in front of the chest, small violet sparks between the fingers, concentrated eyes above the mask (cells 7 to 8 EMPTY).
Row 2: RELEASE JUTSU "Nevoa Toxica", 8 frames: he rips the cork off a vial, raises it overhead, crushes it, violet toxic mist pours out around his hands and he spreads both arms wide releasing it. Only SMALL mist near the body, the big cloud comes later (full 8 columns).
Row 3: BUFF, 6 frames: he clenches both fists, a thin violet and magenta aura flickers around the body, vials glow brighter, stands tall (cells 7 to 8 EMPTY).
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
8. No big effects. Only small glows or thin element lines near the body. Effect colors: deep plum, violet, magenta, pale lilac, tiny amber accents, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "DOKU - LOTE B2" on a thin dark strip above the grid.

Attached image is the ABSOLUTE source of truth for the character (Doku): copy exactly the short messy black hair, short deep-plum hood pulled back, charcoal cloth mask, charcoal tunic with plum trim, wide dark belt, the leather bandolier with 5 glowing violet vials, brown leather gloves, the needle case on the right forearm, dark pants and boots, face, realistic athletic proportions (about 6.5 heads tall, SMALL head, long legs) and pixel scale. Do NOT redesign or recolor. Do NOT make the head bigger.

ROWS:
Row 1: STUNNED, 4 frames: dizzy, swaying on his feet, head drooping, small plum stars circling the head (cells 5 to 8 EMPTY).
Row 2: VICTORY, 6 frames: holds one glowing vial up with a confident smirk visible in the eyes, raises it, tilts it, small violet sparkle, fist pump (cells 7 to 8 EMPTY).
Row 3: DEFEAT, 8 frames: staggers, drops to his knees, a vial slips and cracks, slumps forward and finally lies FLAT on the ground, body horizontal and parallel to the ground (never vertical), last frame fully lying (full 8 columns).
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
8. No big effects. Only small glows or thin element lines near the body. Effect colors: deep plum, violet, magenta, pale lilac, tiny amber accents, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "DOKU - LOTE C" on a thin dark strip above the grid.

Attached image is the ABSOLUTE source of truth for the character (Doku): copy exactly the short messy black hair, short deep-plum hood pulled back, charcoal cloth mask, charcoal tunic with plum trim, wide dark belt, the leather bandolier with 5 glowing violet vials, brown leather gloves, the needle case on the right forearm, dark pants and boots, face, realistic athletic proportions (about 6.5 heads tall, SMALL head, long legs) and pixel scale. Do NOT redesign or recolor. Do NOT make the head bigger.

ROWS:
Row 1: KNOCKED BACK (repelled), 8 frames: hit from the front, body pushed backward, leaning back with arms out, sliding back with feet off balance, ends upright but leaning (full 8 columns).
Row 2: LAUNCHED, 8 frames: thrown into the air, rises, tumbles at the top, body arched, begins to fall, arms flailing (full 8 columns).
Row 3: KNOCKED DOWN, 8 frames: falls from standing and lies FLAT on the ground, body horizontal and parallel to the ground (never vertical), stays flat in the last frames (full 8 columns).
Row 4: CHASE "Ferrao", 8 frames: he leaps high above, flips and dives DOWNWARD head-first-diagonal with one huge needle held in both hands pointing down, stabs downward, a small violet burst on impact, lands crouched (full 8 columns). The big needle stays near the body.
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
7. Colors: deep plum, violet, magenta, pale lilac, tiny amber accents only, dark 1px outline, max 16 colors. NO green anywhere. Nothing turquoise, aqua, teal or greenish. No border, no grid lines, no shadows, no text except the label.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient.
LABEL: top-left corner only, small plain white pixel text "DOKU - LOTE D" on a thin dark strip above the grid.

ROWS (each one effect, 6 frames):
Row 1: THROWN VIAL: a glass vial of glowing violet liquid spinning through the air from left to right, with a short violet trail.
Row 2: VIAL BURST (basic attack): the vial shatters on impact, glass shards fly, a violet liquid splash blooms and drips away.
Row 3: TOXIC MIST (jutsu): a huge swirling cloud of violet and magenta poison gas with pale lilac wisps and small bubbles, expanding to fill the whole cell, growing then thinning.
Row 4: STINGER (pursuit): a gigantic needle of violet energy plunging diagonally downward with a magenta shock ring at the tip, growing and fading.
Row 5: IMPACT: a sharp violet and pale lilac hit burst with radial spikes and a few droplets.
Row 6: AURA RING: a ring of swirling violet and magenta poison vapor around an EMPTY space the size of a body, rising upward, with small bubbles.
```

