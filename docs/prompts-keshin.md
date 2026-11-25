# Keshin — lotes completos (gerado por tools/sprites/gen_prompts_lotes.py)

Ordem e anexos: **A1** ← `docs/refs/elenco_ref.png` → **A1B** (básico em 18 quadros, 3 golpes de 6) ← A1 → **A2** ← A1 → **B1** ← A2 → **B2** ← B1 → **C** ← B2 → **CH** (perseguição, 18 quadros) ← C → **D** ← qualquer sheet (só paleta). Salvar em `tools/sprites/src/keshin/`.

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
8. No big effects. Only small glows or thin element lines near the body. Effect colors: burnt orange, warm gold, white, charcoal, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "KESHIN - LOTE A1" on a thin dark strip above the grid.

Attached image shows SEVERAL different characters of the same game (the style roster): it is a STYLE and PROPORTION reference ONLY. Copy ONLY the shared pixel-art style, outline weight, pixel scale and body proportions (realistic athletic young adults, about 6.5 heads tall, SMALL head, long legs, serious grounded look). Do NOT copy any of their faces, hair, clothes or colors. Do NOT redraw any of them: the new character must look clearly different from all of them.

CHARACTER (original ninja, pixel art, dark 1px outline, max 16 colors, realistic athletic young-adult proportions, about 6.5 heads tall, SMALL head, long legs, serious grounded look like the attached reference, NOT chibi, NOT cute, NOT big-headed): KESHIN, a young martial-arts ninja, a charismatic show-off hero type who fights with bare fists and feet only. Tall, lean and very muscular but fast-looking. Tall spiky dark-brown hair with a swept-up front tuft, tan skin, a wide confident grin, bright eager eyes (normal eyebrows, nothing exaggerated). Open sleeveless charcoal vest over a bare chest, a white bandage across the waist, thick burnt-orange wraps covering both fists and forearms, loose charcoal pants tied at the ankles with orange wraps, dark sandals. No weapon. Nothing turquoise, aqua, teal or greenish anywhere.

ROWS:
Row 1: IDLE, 6 frames: a lively fighting guard, he bounces on the balls of his feet, fists raised, rolls his shoulders, flashes a confident grin and gives a small beckoning 'come on' gesture with one hand (cells 7 to 8 EMPTY).
Row 2: WALK, 8 frames, a confident springy walking cycle to the right, shoulders relaxed, full 8 columns.
Row 3: DASH, 8 frames: fast low sprint forward, body leaning hard, fists back, a thin warm-orange speed line at most, full 8 columns.
Row 4: BASIC ATTACK "Combo Relampago", 8 frames, a fast three-hit bare-handed combo, each hit a clearly DIFFERENT move: frames 1-2 a straight punch with the lead fist, frames 3-4 a high roundhouse kick, frames 5-6 a rising elbow or uppercut that lifts the target, frame 7 follow-through, frame 8 back to the fighting guard. Only small orange motion lines near the limbs (full 8 columns).
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
8. No big effects. Only small glows or thin element lines near the body. Effect colors: burnt orange, warm gold, white, charcoal, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "KESHIN - LOTE A2" on a thin dark strip above the grid.

Attached image is the ABSOLUTE source of truth for the character (Keshin): copy exactly the tall spiky dark-brown hair with a swept-up front tuft, wide confident grin, tan skin, open sleeveless charcoal vest over a bare chest, burnt-orange wraps on both fists and forearms, loose charcoal pants tied at the ankles with orange wraps, dark sandals, face, realistic athletic proportions (about 6.5 heads tall, SMALL head, long legs) and pixel scale. Do NOT redesign or recolor. Do NOT make the head bigger.

ROWS:
Row 1: STRONG ATTACK "Soco Dinamite", 7 frames: he plants his feet, pulls one fist far back with a loud grin turning into a grimace, steps in and drives a huge straight punch forward with his whole body, holds the extended pose, a small orange burst at the fist only, pulls back, returns to the fighting guard (cell 8 EMPTY).
Row 2: GUARD, 4 frames: he crosses both wrapped forearms in front of his face and braces his legs wide, holds, relaxes with a small grin (cells 5 to 8 EMPTY).
Row 3: HURT, 3 frames: hit from the front, head snaps back, body recoils, steps back, grits his teeth and recovers (cells 4 to 8 EMPTY).
Row 4: DODGE, 6 frames: a quick springy sidestep and backward hop, hair and wraps trailing, lands bouncing on the balls of his feet in guard (cells 7 to 8 EMPTY).
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
8. No big effects. Only small glows or thin element lines near the body. Effect colors: burnt orange, warm gold, white, charcoal, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "KESHIN - LOTE B1" on a thin dark strip above the grid.

Attached image is the ABSOLUTE source of truth for the character (Keshin): copy exactly the tall spiky dark-brown hair with a swept-up front tuft, wide confident grin, tan skin, open sleeveless charcoal vest over a bare chest, burnt-orange wraps on both fists and forearms, loose charcoal pants tied at the ankles with orange wraps, dark sandals, face, realistic athletic proportions (about 6.5 heads tall, SMALL head, long legs) and pixel scale. Do NOT redesign or recolor. Do NOT make the head bigger.

ROWS:
Row 1: HAND SEALS, 6 frames: he brings both fists together in front of his chest, then claps and rubs them, takes a deep breath and tenses his whole body, a few small orange sparks gather around his fists, a fired-up grin (cells 7 to 8 EMPTY).
Row 2: RELEASE JUTSU "Aura Relampago", 8 frames: he crouches and roars, a warm gold and orange aura bursts out of his whole body and flames upward, his hair stands even higher, he rises with fists clenched, holds a heroic pose. Only a SMALL aura hugging the body, the big aura comes later (full 8 columns).
Row 3: BUFF, 6 frames: an orange and gold glow pulses around his body, he flexes, bounces in guard with the aura flickering, gives a thumbs-up with a huge grin (cells 7 to 8 EMPTY).
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
8. No big effects. Only small glows or thin element lines near the body. Effect colors: burnt orange, warm gold, white, charcoal, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "KESHIN - LOTE B2" on a thin dark strip above the grid.

Attached image is the ABSOLUTE source of truth for the character (Keshin): copy exactly the tall spiky dark-brown hair with a swept-up front tuft, wide confident grin, tan skin, open sleeveless charcoal vest over a bare chest, burnt-orange wraps on both fists and forearms, loose charcoal pants tied at the ankles with orange wraps, dark sandals, face, realistic athletic proportions (about 6.5 heads tall, SMALL head, long legs) and pixel scale. Do NOT redesign or recolor. Do NOT make the head bigger.

ROWS:
Row 1: STUNNED, 4 frames: dazed, swaying on his feet, arms hanging loose, head drooping, small gold stars circling the head (cells 5 to 8 EMPTY).
Row 2: VICTORY, 6 frames: he spins, strikes a heroic pose with one fist raised to the sky, a huge confident grin, flashes a thumbs-up, a tiny gold sparkle (cells 7 to 8 EMPTY).
Row 3: DEFEAT, 8 frames: hit, staggers, drops to his knees still trying to stand, a last proud smile, collapses forward and lies still on the ground (full 8 columns).
```

## LOTE C
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 3 rows and EXACTLY 8 columns, a fixed grid of identical cells, LANDSCAPE image. Do NOT add, remove, merge or skip rows. The image has 3 rows, not more.
2. ONE animation per row. A row contains ONLY its own animation. NEVER put a frame of another animation in a leftover cell of a row.
3. Use EXACTLY the number of frames listed for each row, starting at column 1. The remaining cells of that row stay EMPTY flat green (no sprite, no fragment, no smear).
4. Every frame is fully opaque and complete. NO ghost, translucent, half-faded, duplicated or cropped frames. Nothing touches or crosses the cell edge.
5. The character is IDENTICAL in every frame: same design, colors, proportions, pixel scale and outline. Faces RIGHT (side or three-quarter view). Pose and position inside the cell are FREE: the body may lean, slide, float, jump or shift anywhere in the cell, as long as it stays fully inside it.
6. No green on the character, outfit, outline or glow (the background is green). Nothing turquoise, aqua, teal or greenish.
7. No border, no grid lines, no drop shadow, no ground, no extra text except the label.
8. No big effects. Only small glows or thin element lines near the body. Effect colors: burnt orange, warm gold, white, charcoal, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "KESHIN - LOTE C" on a thin dark strip above the grid.

Attached image is the ABSOLUTE source of truth for the character (Keshin): copy exactly the tall spiky dark-brown hair with a swept-up front tuft, wide confident grin, tan skin, open sleeveless charcoal vest over a bare chest, burnt-orange wraps on both fists and forearms, loose charcoal pants tied at the ankles with orange wraps, dark sandals, face, realistic athletic proportions (about 6.5 heads tall, SMALL head, long legs) and pixel scale. Do NOT redesign or recolor. Do NOT make the head bigger.

ROWS:
Row 1: KNOCKED BACK (repelled), 8 frames: hit by a heavy blow, flung backwards off his feet, body leaning back and sliding away, ending in a hard skid (full 8 columns).
Row 2: LAUNCHED, 8 frames: thrown up into the air by a blow from below, body rising and rotating, peaks at the top, starts to hang in the air (full 8 columns).
Row 3: KNOCKED DOWN, 8 frames: falls and lies FLAT on the ground, body horizontal and parallel to the ground (never vertical), bounces once, then lies still, then slowly starts to get back up (full 8 columns).
```

## LOTE A1B
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 3 rows and EXACTLY 8 columns, a fixed grid of identical cells, LANDSCAPE image. Do NOT add, remove, merge or skip rows. The image has 3 rows, not more.
2. ONE animation per row. A row contains ONLY its own animation. NEVER put a frame of another animation in a leftover cell of a row.
3. Use EXACTLY the number of frames listed for each row, starting at column 1. The remaining cells of that row stay EMPTY flat green (no sprite, no fragment, no smear).
4. Every frame is fully opaque and complete. NO ghost, translucent, half-faded, duplicated or cropped frames. Nothing touches or crosses the cell edge.
5. The character is IDENTICAL in every frame: same design, colors, proportions, pixel scale and outline. Faces RIGHT (side or three-quarter view). Pose and position inside the cell are FREE: the body may lean, slide, float, jump or shift anywhere in the cell, as long as it stays fully inside it.
6. No green on the character, outfit, outline or glow (the background is green). Nothing turquoise, aqua, teal or greenish.
7. No border, no grid lines, no drop shadow, no ground, no extra text except the label.
8. No big effects. Only small glows or thin element lines near the body. Effect colors: burnt orange, warm gold, white, charcoal, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "KESHIN - LOTE A1B" on a thin dark strip above the grid.

Attached image is the ABSOLUTE source of truth for the character (Keshin): copy exactly the tall spiky dark-brown hair with a swept-up front tuft, wide confident grin, tan skin, open sleeveless charcoal vest over a bare chest, burnt-orange wraps on both fists and forearms, loose charcoal pants tied at the ankles with orange wraps, dark sandals, face, realistic athletic proportions (about 6.5 heads tall, SMALL head, long legs) and pixel scale. Do NOT redesign or recolor. Do NOT make the head bigger.

ROWS:
Row 1: BASIC HIT 1 "Soco Relampago", 6 frames, starts and ends in the same fighting guard. Frame 1 ANTICIPATION: weight shifts back, lead fist drawn back, cocky grin. Frame 2 deep wind-up, body coiled. Frame 3 SMEAR: the punch in mid-flight drawn as ONE opaque flat streak shape in burnt orange and white along the arm (not translucent). Frame 4 CONTACT: arm fully extended, the strongest pose of the hit, body stretched forward. Frame 5 follow-through. Frame 6 pulls back into the fighting guard (cells 7 to 8 EMPTY).
Row 2: BASIC HIT 2 "Chute Relampago", 6 frames, starts and ends in the same fighting guard. Frame 1 ANTICIPATION: he leans back and lifts the knee. Frame 2 the leg chambered, body twisting. Frame 3 SMEAR: the roundhouse kick in mid-swing drawn as ONE opaque flat curved streak of burnt orange and white along the leg (not translucent). Frame 4 CONTACT: leg fully extended high, the strongest pose of the hit. Frame 5 follow-through, spinning on the standing foot. Frame 6 lands back in the fighting guard (cells 7 to 8 EMPTY).
Row 3: BASIC HIT 3 "Subida Relampago", 6 frames, the heaviest hit of the combo, starts in the fighting guard and ends in a small hero stance. Frame 1 ANTICIPATION: deep crouch, fist low by the knee. Frame 2 full coil, eyes locked forward. Frame 3 SMEAR: a rising uppercut drawn as ONE opaque flat upward arc of burnt orange, gold and white (not translucent), his feet leaving the ground. Frame 4 CONTACT: fist at the highest point, body fully stretched upward, the strongest pose of the whole combo. Frame 5 hangs in the air with the follow-through. Frame 6 lands in a confident stance, fist raised (cells 7 to 8 EMPTY).
```

## LOTE CH
```
STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 3 rows and EXACTLY 8 columns, a fixed grid of identical cells, LANDSCAPE image. Do NOT add, remove, merge or skip rows. The image has 3 rows, not more.
2. ONE animation per row. A row contains ONLY its own animation. NEVER put a frame of another animation in a leftover cell of a row.
3. Use EXACTLY the number of frames listed for each row, starting at column 1. The remaining cells of that row stay EMPTY flat green (no sprite, no fragment, no smear).
4. Every frame is fully opaque and complete. NO ghost, translucent, half-faded, duplicated or cropped frames. Nothing touches or crosses the cell edge.
5. The character is IDENTICAL in every frame: same design, colors, proportions, pixel scale and outline. Faces RIGHT (side or three-quarter view). Pose and position inside the cell are FREE: the body may lean, slide, float, jump or shift anywhere in the cell, as long as it stays fully inside it.
6. No green on the character, outfit, outline or glow (the background is green). Nothing turquoise, aqua, teal or greenish.
7. No border, no grid lines, no drop shadow, no ground, no extra text except the label.
8. No big effects. Only small glows or thin element lines near the body. Effect colors: burnt orange, warm gold, white, charcoal, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "KESHIN - LOTE CH" on a thin dark strip above the grid.

Attached image is the ABSOLUTE source of truth for the character (Keshin): copy exactly the tall spiky dark-brown hair with a swept-up front tuft, wide confident grin, tan skin, open sleeveless charcoal vest over a bare chest, burnt-orange wraps on both fists and forearms, loose charcoal pants tied at the ankles with orange wraps, dark sandals, face, realistic athletic proportions (about 6.5 heads tall, SMALL head, long legs) and pixel scale. Do NOT redesign or recolor. Do NOT make the head bigger.

ROWS:
Row 1: CHASE "Bomba Dinamite" part 1 (leap and grab), 6 frames, no enemy drawn, his arms close around an empty space at the end. Frame 1 deep crouch. Frame 2 spring, legs pushing off. Frame 3 rising fast, body stretched. Frame 4 apex of the jump, arms reaching up. Frame 5 grabs the invisible target at the waist, arms wrapped. Frame 6 holds it, starting to flip (cells 7 to 8 EMPTY).
Row 2: CHASE part 2 (spin and slam), 6 frames, no enemy drawn. Frame 1 flipping over, body inverted. Frame 2 spinning, head down. Frame 3 SMEAR: the spin drawn as ONE opaque flat curved streak of burnt orange and white around the body (not translucent). Frame 4 diving diagonally downward, head first, arms still wrapped. Frame 5 CONTACT: the slam into the ground, the strongest pose of the whole action. Frame 6 body stays down for the hit, small orange motion lines only (cells 7 to 8 EMPTY).
Row 3: CHASE part 3 (landing), 6 frames, no enemy drawn. Frame 1 lands crouched with fists on the ground. Frame 2 holds the crouch, a heavy breath. Frame 3 starts rising, arms loosening. Frame 4 stands, shaking out his wrists. Frame 5 small hero stance, confident grin. Frame 6 back to the fighting guard (cells 7 to 8 EMPTY).
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
7. Colors: burnt orange, warm gold, white, charcoal only, dark 1px outline, max 16 colors. NO green anywhere. Nothing turquoise, aqua, teal or greenish. No border, no grid lines, no shadows, no text except the label.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient.
LABEL: top-left corner only, small plain white pixel text "KESHIN - LOTE D" on a thin dark strip above the grid.

ROWS (each one effect, 6 frames):
Row 1: SHOCK PUNCH: a crescent-shaped wave of compressed air and orange sparks flying through the air from left to right, with a short gold trail.
Row 2: COMBO BURSTS (basic attack): three quick impact bursts in a row, a straight-punch shock ring, a kick arc and a rising uppercut streak, each with orange and white sparks.
Row 3: LIGHTNING AURA (jutsu): a huge roaring aura of gold and orange flames and light streaks swirling upward around an EMPTY body-sized space, growing, flaring, then steadying.
Row 4: DYNAMITE SLAM (pursuit): a massive ground impact: a crater of broken stone, a big orange shock ring and flying rubble, growing then fading.
Row 5: IMPACT: a sharp orange and white hit burst with radial spikes and a few gold sparks.
Row 6: AURA RING: a ring of swirling gold and orange flames around an EMPTY space the size of a body, rising upward.
```

