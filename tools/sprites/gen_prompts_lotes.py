#!/usr/bin/env python3
"""Gera docs/prompts-<ninja>.md com os lotes A1..D. Uso: python3 tools/sprites/gen_prompts_lotes.py <ninja>
Ninja novo = nova entrada em NINJAS. Dinâmica dos lotes: docs/prompts-sprites.md."""
import sys, os
_ctx = os.path.join(os.path.dirname(__file__), "..", "..", "..", "formacao-shinobi-ctx", "docs")
DOCS = _ctx if os.path.isdir(_ctx) else "docs"   # docs de contexto ficam no repo privado quando ele existe ao lado
RULES = """STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY {N} rows and EXACTLY 8 columns, a fixed grid of identical cells, LANDSCAPE image. Do NOT add, remove, merge or skip rows. The image has {N} rows, not more.
2. ONE animation per row. A row contains ONLY its own animation. NEVER put a frame of another animation in a leftover cell of a row.
3. Use EXACTLY the number of frames listed for each row, starting at column 1. The remaining cells of that row stay EMPTY flat green (no sprite, no fragment, no smear).
4. Every frame is fully opaque and complete. NO ghost, translucent, half-faded, duplicated or cropped frames. Nothing touches or crosses the cell edge.
5. The character is IDENTICAL in every frame: same design, colors, proportions, pixel scale and outline. Faces RIGHT (side or three-quarter view). Pose and position inside the cell are FREE: the body may lean, slide, float, jump or shift anywhere in the cell, as long as it stays fully inside it. Weapons, accessories and every held or worn item keep the SAME length, size, shape, count and hand in EVERY frame (a blade never shrinks or turns into only a hilt; a motion smear is an EXTRA drawn next to the full weapon, never a replacement for it).
6. No green on the character, outfit, outline or glow (the background is green). Nothing turquoise, aqua, teal or greenish.
7. No border, no grid lines, no drop shadow, no ground, no extra text except the label.
8. No big effects. Only small glows or thin element lines near the body. Effect colors: {PAL}, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "{NAME} - LOTE {L}" on a thin dark strip above the grid.
"""
REF = ("Attached image shows SEVERAL different characters of the same game (the style roster): it is a STYLE and PROPORTION reference ONLY. Copy ONLY the shared pixel-art style, outline weight, pixel scale and body proportions (realistic athletic young adults, about 6.5 heads tall, SMALL head, long legs, serious grounded look). Do NOT copy any of their faces, hair, clothes or colors. Do NOT redraw any of them: the new character must look clearly different from all of them.\n")
PROP = "realistic athletic young-adult proportions, about 6.5 heads tall, SMALL head, long legs, serious grounded look like the attached reference, NOT chibi, NOT cute, NOT big-headed"
TRUTH = "Attached image is the ABSOLUTE source of truth for the character ({NAME}): copy exactly {LOOK}, face, realistic athletic proportions (about 6.5 heads tall, SMALL head, long legs) and pixel scale. Do NOT redesign or recolor. Do NOT make the head bigger.\n"
PIXEL = ("ART STYLE (mandatory, highest priority): this is true PIXEL ART for a 2D game, exactly like the characters in the attached style roster image: "
         "visible hard-edged pixel clusters, a dark 1px outline, max 16 colors per character, flat cel shading, small game-sprite scale. "
         "It is NOT a smooth digital illustration, NOT anime key art, NOT painted, NOT 3D, NO soft gradients, NO smooth anti-aliased lines, NO large detailed drawing.\n")
ROWREF = ("Two images are attached. FIRST image = the PIXEL-ART STYLE ROSTER (several other characters of the same game): copy ONLY its pixel-art style, outline weight, pixel scale and body proportions, NEVER their faces, hair, clothes or colors. "
          "SECOND image = the APPROVED DESIGN of the new character ({NAME}): the ABSOLUTE source of truth for who he is.\n")
STYLE_RULES = """STRICT RULES (highest priority, never break):
1. The image contains EXACTLY ONE character, shown ONCE, in ONE single standing idle pose, FULL BODY visible, centered. NO grid, NO rows, NO columns, NO other frames, NO other characters, NO second pose, NO turnaround. LANDSCAPE image.
2. The character faces RIGHT (side or three-quarter view). Nothing touches or crosses the image edge. Fully opaque, NO ghost or translucent parts.
3. No green on the character, outfit, outline or glow (the background is green). Nothing turquoise, aqua, teal or greenish.
4. No border, no drop shadow, no ground, no extra text except the label.
5. No big effects. Effect colors: {PAL}, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient.
LABEL: top-left corner only, small plain white pixel text "{NAME} - STYLE" on a thin dark strip.
"""
STYLEREF = "\nSecond attached image is the APPROVED design of the new character ({NAME}): it is the ABSOLUTE source of truth for his face, hair, outfit, colors, accessories, proportions and pixel scale. Copy exactly {LOOK}. Do NOT redesign or recolor. The first attached image is only the style roster (style, scale and proportions).\n"
DOWN = "lies FLAT on the ground, body horizontal and parallel to the ground (never vertical)"
DBLOCK = """STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY 6 rows and EXACTLY 6 columns, a fixed grid of identical LANDSCAPE cells. Do NOT add, remove, merge or skip rows. The image has 6 rows, not more.
2. ONE effect per row. A row contains ONLY its own effect, never a frame of another effect.
3. Use EXACTLY 6 frames in every row, using all 6 columns.
4. Every frame is fully opaque and complete, nothing touches or crosses the cell edge.
5. NO character, NO person, NO body in any cell. The attached image is only a color and style reference: do NOT draw the character.
6. Effects must be BIG and dramatic, filling most of the cell, much larger than a person. Same style and scale across the frames of a row. Effects travel LEFT to RIGHT.
7. Colors: {PAL} only, dark 1px outline, max 16 colors. NO green anywhere. Nothing turquoise, aqua, teal or greenish. No border, no grid lines, no shadows, no text except the label.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient.
LABEL: top-left corner only, small plain white pixel text "{NAME} - LOTE D" on a thin dark strip above the grid.

ROWS (each one effect, 6 frames):
"""
NINJAS = {
 "utsushi": dict(name="UTSUSHI", pal="ink black, charcoal, ash gray, bone white, pale amber",
  look="the charcoal knit cap with a cream-white trim pulled low over one side, messy short jet-black hair, dark circles under half-lidded eyes, thin lopsided smirk, thin abstract ink-black tattoo lines on both forearms and the backs of the hands, long charcoal coat worn open with rolled sleeves over a bone-white shirt, loose dark pants, dark boots, and the two short black daggers with bone-white guards and pale-amber wrapped grips held in reverse grip",
  char="UTSUSHI, a young shadow ninja with a calm, sarcastic, lazy-confident attitude. Tall and lean, a relaxed slouching posture, dark circles under half-lidded eyes and a thin lopsided smirk. A dark charcoal knit cap with a cream-white trim pulled low over one side of his head, over messy short jet-black hair. Thin abstract ink-black tattoo lines (only lines and patterns, NO letters, NO text) on both forearms and the backs of both hands. A long charcoal coat worn open, sleeves rolled up to the elbows, with a bone-white shirt underneath, loose dark pants and dark boots. Two SHORT black daggers (each about the length of his forearm) with bone-white guards and pale-amber wrapped grips, ALWAYS held in his hands in reverse grip (blades pointing back along the forearms) in EVERY frame: never sheathed, never dropped, never larger or smaller, always exactly two. Colors only ink black, charcoal, ash gray, bone white and a small touch of pale amber on the grip wraps. Nothing turquoise, aqua or teal anywhere.",
  STYLEPOSE="a lazy slouch, both short daggers held in reverse grip at his sides, head slightly tilted, a thin smirk",
  A1="""Row 1: IDLE, 6 frames: a lazy slouch, both daggers in reverse grip at his sides, he taps the flat of one dagger against his forearm, tilts his head with a smirk, gives a small shrug, slowly breathes, the cap brim shifting slightly (cells 7 to 8 EMPTY).
Row 2: WALK, 8 frames, an unhurried slouching stride to the right, both daggers in reverse grip swinging loosely at his sides, full 8 columns.
Row 3: DASH, 8 frames: a fast low forward run, body leaning hard, both daggers held back behind him in reverse grip, coat tails flying, a few thin ink-black wisps at most, full 8 columns.""",
  A1B="""Row 1: BASIC HIT 1 "Corte Preguicoso", 6 frames, starts and ends in the same slouching stance. Frame 1 ANTICIPATION: a lazy half-turn, the right dagger drawn back, smirk. Frame 2 body coiled. Frame 3 SMEAR: a quick horizontal slash drawn as ONE opaque flat streak shape in ash gray and bone white along the dagger (not translucent). Frame 4 CONTACT: the right arm fully extended at the end of the slash, the strongest pose of the hit. Frame 5 follow-through. Frame 6 back to the stance (cells 7 to 8 EMPTY).
Row 2: BASIC HIT 2 "Subida Preguicosa", 6 frames, starts and ends in the same stance. Frame 1 ANTICIPATION: he steps in with the left dagger held low behind him. Frame 2 body twisting. Frame 3 SMEAR: a rising backhand slash drawn as ONE opaque flat curved streak of ash gray and bone white (not translucent). Frame 4 CONTACT: the left arm at full extension rising diagonally, the strongest pose of the hit. Frame 5 follow-through, the cap brim flicking. Frame 6 back to the stance (cells 7 to 8 EMPTY).
Row 3: BASIC HIT 3 "Cruz Preguicosa", the heaviest hit of the combo, 6 frames, starts in the stance and ends in a cocky pose. Frame 1 ANTICIPATION: he crouches and crosses both daggers low. Frame 2 full coil. Frame 3 SMEAR: he springs forward and the two slashes are drawn as ONE opaque flat X-shaped streak of ash gray, bone white and a little pale amber (not translucent). Frame 4 CONTACT: both daggers crossing in a big X slash, the strongest pose of the whole combo. Frame 5 follow-through. Frame 6 he lands in a relaxed stance with a wide smirk (cells 7 to 8 EMPTY).""",
  A2="""Row 1: STRONG ATTACK "Cruz Rasante", 7 frames: he plants his feet, crosses both daggers over his chest, steps in and sweeps both daggers outward in one huge wide X-shaped cut with the whole body turning, a thin ink-black line trailing each dagger, holds the cut, relaxes back to the stance (cell 8 EMPTY).
Row 2: GUARD, 4 frames: he crosses both daggers in an X in front of his face and braces, holds, relaxes with a smirk (cells 5 to 8 EMPTY).
Row 3: HURT, 3 frames: hit from the front, head snaps back, the cap brim shifts, body recoils, steps back and recovers (cells 4 to 8 EMPTY).
Row 4: DODGE, 6 frames: a lazy sideways lean away from the hit, his body blurs into a small puff of ash-gray smoke at his feet, he reappears one step back in a relaxed pose and gives a small shrug (cells 7 to 8 EMPTY).""",
  B1="""Row 1: HAND SEALS, 6 frames, EVERY frame visibly different: he crosses both daggers in front of his chest like a seal, a thin ring of ink-black ripples spreads from his feet, his shadow on the ground stretches, the cap brim lifts a little, he opens both hands (daggers still held) and tilts his head with a smirk (cells 7 to 8 EMPTY).
Row 2: RELEASE JUTSU "Legiao de Sombras", 8 frames: he crouches and slams both fists (daggers in hand) on the ground, ink-black ripples spread in rings from his hands, thin dark tendrils rise around him, he stands up with a lazy grin and spreads both arms like a magician finishing a trick. Only SMALL ripples and mist near the body, NO other characters and no clones are drawn (the game adds them) (full 8 columns).
Row 3: BUFF, 6 frames: a thin ring of dark mist wraps around his body, his eyes narrow, he spins both daggers once in his hands and settles into the stance with a grin (cells 7 to 8 EMPTY).""",
  B2="""Row 1: STUNNED, 4 frames: dazed and wobbling, the daggers drooping in his hands toward the ground, the cap askew, head hanging, a few small ash-gray stars circling his head (cells 5 to 8 EMPTY).
Row 2: VICTORY, 6 frames: he spins both daggers in his hands, tips the cap with a dagger's pommel, gives a smug smirk and a slow shrug (cells 7 to 8 EMPTY).
Row 3: DEFEAT, 8 frames: hit, he staggers, still smirking, falls to his knees, laughs weakly, collapses forward and lies still on the ground, the daggers still in his hands (full 8 columns).""",
  C="""Row 1: KNOCKED BACK (repelled), 8 frames: hit by a heavy blow, flung backwards off his feet, body leaning back and sliding away, daggers still in his hands, ending in a hard skid (full 8 columns).
Row 2: LAUNCHED, 8 frames: thrown up into the air by a blow from below, body rising and rotating, peaks at the top, starts to hang in the air, daggers still in his hands (full 8 columns).
Row 3: KNOCKED DOWN, 8 frames: falls and %s, bounces once, then lies still, then slowly starts to get back up, daggers still in his hands (full 8 columns)."""%DOWN,
  CH="""Row 1: CHASE "Emboscada" part 1 (vanish and reappear), 6 frames, no enemy drawn. Frame 1 he crouches, daggers ready. Frame 2 he sinks into his own shadow on the ground with a puff of ash-gray smoke. Frame 3 almost gone, only the cap and a wisp of smoke. Frame 4 he bursts out of the shadow into the air. Frame 5 rising, both daggers drawn back. Frame 6 at the top, body coiled (cells 7 to 8 EMPTY).
Row 2: CHASE part 2 (the double slash), 6 frames, no enemy drawn. Frame 1 he drops down, both daggers wide. Frame 2 wind-up. Frame 3 SMEAR: a huge sweeping double slash drawn as ONE opaque flat curved streak of ash gray and bone white (not translucent). Frame 4 CONTACT: both daggers sweeping through at full extension, the strongest pose of the whole action. Frame 5 follow-through. Frame 6 the momentum carries him past (cells 7 to 8 EMPTY).
Row 3: CHASE part 3 (landing), 6 frames, no enemy drawn. Frame 1 lands low in a crouch. Frame 2 holds the crouch, the daggers trailing. Frame 3 rises. Frame 4 flicks both daggers back into reverse grip. Frame 5 straightens with a smirk. Frame 6 back to the lazy slouching stance (cells 7 to 8 EMPTY).""",
  D="""Row 1: SHADOW KUNAI: a small spinning black kunai with a bone-white edge flying through the air from left to right with a short ink-black trail.
Row 2: SLASH ARCS (basic attack): three quick short slash arcs in a row, ash gray and bone white with small ink-black sparks and a touch of pale amber.
Row 3: SHADOW SUMMON (jutsu): ink-black ripples spreading on the ground in rings and thin dark tendrils and smoke rising, growing then settling, centered on an EMPTY body-sized space.
Row 4: AMBUSH (pursuit): a huge crossing X of ash-gray and bone-white slashes with dark tendrils whipping out, growing then fading.
Row 5: IMPACT: a sharp bone-white and ink-black hit burst with radial spikes and a few ash-gray sparks.
Row 6: AURA RING: a ring of swirling dark mist and ash-gray wisps around an EMPTY space the size of a body, rising upward.""",
  CLINTRO="Attached image is the ABSOLUTE source of truth for the character's design, proportions and pixel scale (Utsushi). Draw HIM again in SHADOW CLONE FORM: exactly the same body, pose style, cap, coat, tattoos and the two short daggers in reverse grip, but the whole figure is a flat ink-black silhouette with thin ash-gray outline highlights, a few bone-white details (the cap trim and the dagger guards) and two small glowing bone-white eyes. Fully opaque, no transparency, NO other colors. It must clearly read as a dark copy of the same ninja.\n",
  CL="""Row 1: CLONE IDLE, 6 frames: the same lazy slouch as the original with both daggers in reverse grip, tapping one dagger on the forearm, a slow breath (cells 7 to 8 EMPTY).
Row 2: CLONE ATTACK, 6 frames: a fast single horizontal slash with one dagger: anticipation, coil, SMEAR (one opaque flat ash-gray streak), contact, follow-through, back to the stance (cells 7 to 8 EMPTY).
Row 3: CLONE HURT, 3 frames: hit from the front, head snaps back, body recoils, recovers (cells 4 to 8 EMPTY).
Row 4: CLONE VANISH, 8 frames: the clone cracks like ink, breaks into ink drops and ash-gray smoke, the figure collapses into swirling dark smoke, frame 7 only small wisps, frame 8 a few tiny wisps left (full 8 columns)."""),
 "keshin": dict(name="KESHIN", pal="burnt orange, warm gold, white, charcoal",
  look="the tall spiky dark-brown hair with a swept-up front tuft, wide confident grin, tan skin, open sleeveless charcoal vest over a bare chest, burnt-orange wraps on both fists and forearms, loose charcoal pants tied at the ankles with orange wraps, dark sandals",
  char="KESHIN, a young martial-arts ninja, a charismatic show-off hero type who fights with bare fists and feet only. Tall, lean and very muscular but fast-looking. Tall spiky dark-brown hair with a swept-up front tuft, tan skin, a wide confident grin, bright eager eyes (normal eyebrows, nothing exaggerated). Open sleeveless charcoal vest over a bare chest, a white bandage across the waist, thick burnt-orange wraps covering both fists and forearms, loose charcoal pants tied at the ankles with orange wraps, dark sandals. No weapon. Nothing turquoise, aqua, teal or greenish anywhere.",
  A1="""Row 1: IDLE, 6 frames: a lively fighting guard, he bounces on the balls of his feet, fists raised, rolls his shoulders, flashes a confident grin and gives a small beckoning 'come on' gesture with one hand (cells 7 to 8 EMPTY).
Row 2: WALK, 8 frames, a confident springy walking cycle to the right, shoulders relaxed, full 8 columns.
Row 3: DASH, 8 frames: fast low sprint forward, body leaning hard, fists back, a thin warm-orange speed line at most, full 8 columns.
Row 4: BASIC ATTACK "Combo Relampago", 8 frames, a fast three-hit bare-handed combo, each hit a clearly DIFFERENT move: frames 1-2 a straight punch with the lead fist, frames 3-4 a high roundhouse kick, frames 5-6 a rising elbow or uppercut that lifts the target, frame 7 follow-through, frame 8 back to the fighting guard. Only small orange motion lines near the limbs (full 8 columns).""",
  A2="""Row 1: STRONG ATTACK "Soco Dinamite", 7 frames: he plants his feet, pulls one fist far back with a loud grin turning into a grimace, steps in and drives a huge straight punch forward with his whole body, holds the extended pose, a small orange burst at the fist only, pulls back, returns to the fighting guard (cell 8 EMPTY).
Row 2: GUARD, 4 frames: he crosses both wrapped forearms in front of his face and braces his legs wide, holds, relaxes with a small grin (cells 5 to 8 EMPTY).
Row 3: HURT, 3 frames: hit from the front, head snaps back, body recoils, steps back, grits his teeth and recovers (cells 4 to 8 EMPTY).
Row 4: DODGE, 6 frames: a quick springy sidestep and backward hop, hair and wraps trailing, lands bouncing on the balls of his feet in guard (cells 7 to 8 EMPTY).""",
  B1="""Row 1: HAND SEALS, 6 frames: he brings both fists together in front of his chest, then claps and rubs them, takes a deep breath and tenses his whole body, a few small orange sparks gather around his fists, a fired-up grin (cells 7 to 8 EMPTY).
Row 2: RELEASE JUTSU "Aura Relampago", 8 frames: he crouches and roars, a warm gold and orange aura bursts out of his whole body and flames upward, his hair stands even higher, he rises with fists clenched, holds a heroic pose. Only a SMALL aura hugging the body, the big aura comes later (full 8 columns).
Row 3: BUFF, 6 frames: an orange and gold glow pulses around his body, he flexes, bounces in guard with the aura flickering, gives a thumbs-up with a huge grin (cells 7 to 8 EMPTY).""",
  B2="""Row 1: STUNNED, 4 frames: dazed, swaying on his feet, arms hanging loose, head drooping, small gold stars circling the head (cells 5 to 8 EMPTY).
Row 2: VICTORY, 6 frames: he spins, strikes a heroic pose with one fist raised to the sky, a huge confident grin, flashes a thumbs-up, a tiny gold sparkle (cells 7 to 8 EMPTY).
Row 3: DEFEAT, 8 frames: hit, staggers, drops to his knees still trying to stand, a last proud smile, collapses forward and lies still on the ground (full 8 columns).""",
  C="""Row 1: KNOCKED BACK (repelled), 8 frames: hit by a heavy blow, flung backwards off his feet, body leaning back and sliding away, ending in a hard skid (full 8 columns).
Row 2: LAUNCHED, 8 frames: thrown up into the air by a blow from below, body rising and rotating, peaks at the top, starts to hang in the air (full 8 columns).
Row 3: KNOCKED DOWN, 8 frames: falls and %s, bounces once, then lies still, then slowly starts to get back up (full 8 columns)."""%DOWN,
  A1B="""Row 1: BASIC HIT 1 "Soco Relampago", 6 frames, starts and ends in the same fighting guard. Frame 1 ANTICIPATION: weight shifts back, lead fist drawn back, cocky grin. Frame 2 deep wind-up, body coiled. Frame 3 SMEAR: the punch in mid-flight drawn as ONE opaque flat streak shape in burnt orange and white along the arm (not translucent). Frame 4 CONTACT: arm fully extended, the strongest pose of the hit, body stretched forward. Frame 5 follow-through. Frame 6 pulls back into the fighting guard (cells 7 to 8 EMPTY).
Row 2: BASIC HIT 2 "Chute Relampago", 6 frames, starts and ends in the same fighting guard. Frame 1 ANTICIPATION: he leans back and lifts the knee. Frame 2 the leg chambered, body twisting. Frame 3 SMEAR: the roundhouse kick in mid-swing drawn as ONE opaque flat curved streak of burnt orange and white along the leg (not translucent). Frame 4 CONTACT: leg fully extended high, the strongest pose of the hit. Frame 5 follow-through, spinning on the standing foot. Frame 6 lands back in the fighting guard (cells 7 to 8 EMPTY).
Row 3: BASIC HIT 3 "Subida Relampago", 6 frames, the heaviest hit of the combo, starts in the fighting guard and ends in a small hero stance. Frame 1 ANTICIPATION: deep crouch, fist low by the knee. Frame 2 full coil, eyes locked forward. Frame 3 SMEAR: a rising uppercut drawn as ONE opaque flat upward arc of burnt orange, gold and white (not translucent), his feet leaving the ground. Frame 4 CONTACT: fist at the highest point, body fully stretched upward, the strongest pose of the whole combo. Frame 5 hangs in the air with the follow-through. Frame 6 lands in a confident stance, fist raised (cells 7 to 8 EMPTY).""",
  CH="""Row 1: CHASE "Bomba Dinamite" part 1 (leap and grab), 6 frames, no enemy drawn, his arms close around an empty space at the end. Frame 1 deep crouch. Frame 2 spring, legs pushing off. Frame 3 rising fast, body stretched. Frame 4 apex of the jump, arms reaching up. Frame 5 grabs the invisible target at the waist, arms wrapped. Frame 6 holds it, starting to flip (cells 7 to 8 EMPTY).
Row 2: CHASE part 2 (spin and slam), 6 frames, no enemy drawn. Frame 1 flipping over, body inverted. Frame 2 spinning, head down. Frame 3 SMEAR: the spin drawn as ONE opaque flat curved streak of burnt orange and white around the body (not translucent). Frame 4 diving diagonally downward, head first, arms still wrapped. Frame 5 CONTACT: the slam into the ground, the strongest pose of the whole action. Frame 6 body stays down for the hit, small orange motion lines only (cells 7 to 8 EMPTY).
Row 3: CHASE part 3 (landing), 6 frames, no enemy drawn. Frame 1 lands crouched with fists on the ground. Frame 2 holds the crouch, a heavy breath. Frame 3 starts rising, arms loosening. Frame 4 stands, shaking out his wrists. Frame 5 small hero stance, confident grin. Frame 6 back to the fighting guard (cells 7 to 8 EMPTY).""",
  D="""Row 1: SHOCK PUNCH: a crescent-shaped wave of compressed air and orange sparks flying through the air from left to right, with a short gold trail.
Row 2: COMBO BURSTS (basic attack): three quick impact bursts in a row, a straight-punch shock ring, a kick arc and a rising uppercut streak, each with orange and white sparks.
Row 3: LIGHTNING AURA (jutsu): a huge roaring aura of gold and orange flames and light streaks swirling upward around an EMPTY body-sized space, growing, flaring, then steadying.
Row 4: DYNAMITE SLAM (pursuit): a massive ground impact: a crater of broken stone, a big orange shock ring and flying rubble, growing then fading.
Row 5: IMPACT: a sharp orange and white hit burst with radial spikes and a few gold sparks.
Row 6: AURA RING: a ring of swirling gold and orange flames around an EMPTY space the size of a body, rising upward."""),
 "hiyori": dict(name="HIYORI", pal="ice blue, white, deep navy, pale silver",
  look="the long ice-blue hair, snowflake hairpin, short white kimono with deep navy trim, navy obi, white wrapped sleeves, dark boots",
  char="HIYORI, a young ice ninja. Long straight ice-blue hair down to the waist, a snowflake hairpin clearly visible. Short white kimono with deep navy trim, a deep navy obi, white wrapped arm sleeves, dark boots. No weapon in hand (ice blades only appear in attacks). Calm, cold, composed expression. Nothing turquoise, aqua or teal anywhere: the ice is pale sky blue and white only.",
  A1="""Row 1: IDLE, 6 frames: composed and still, hair drifting slowly as if in cold air, tiny snow crystals near her hands, a slow breath (cells 7 to 8 EMPTY).
Row 2: WALK, 8 frames, walking cycle to the right, full 8 columns.
Row 3: DASH, 8 frames, fast low sprint forward, body leaning, a thin pale-blue speed line at most, full 8 columns.
Row 4: BASIC ATTACK "Combo de Lamina de Gelo", 8 frames: a three-hit melee combo, each hit with a SMALL thin ice blade formed along her forearm: slash 1, slash 2, spinning slash 3, follow-through, returns to stance, full 8 columns.""",
  A2="""Row 1: STRONG ATTACK "Toque Congelante", 7 frames: she steps in close, winds up, presses a glowing frost palm hard forward into the target, a small burst of ice crystals at the hand, holds, recovers (cell 8 EMPTY).
Row 2: GUARD, 4 frames: she crosses her forearms in front of her face and braces, a thin pale frost sheen, holds, relaxes (cells 5 to 8 EMPTY).
Row 3: HURT, 3 frames: hit from the front, head snaps back, body recoils, steps back and recovers (cells 4 to 8 EMPTY).
Row 4: DODGE, 6 frames: a quick light sidestep and backward hop, hair streaming, a few frost sparkles trailing, lands in stance (cells 7 to 8 EMPTY).""",
  B1="""Row 1: HAND SEALS, 6 frames: she performs fast hand seals in front of her chest, cold mist and tiny snowflakes gather around her hands (cells 7 to 8 EMPTY).
Row 2: RELEASE JUTSU "Prisao de Gelo", 8 frames: she thrusts both palms forward, a thin line of frost shoots out, she holds the pose with arms extended, follow-through, arms lowered. Only SMALL frost lines near the body, the big ice prison comes later (full 8 columns).
Row 3: BUFF, 6 frames: she raises her hands, a soft ring of pale blue and white snow sparkles rises around her body, she exhales and returns to stance (cells 7 to 8 EMPTY).""",
  B2="""Row 1: STUNNED, 4 frames: frozen and dazed, stiff posture, shivering, head drooping, a thin frost sheen on her body, a few tiny snow sparkles (cells 5 to 8 EMPTY).
Row 2: VICTORY, 6 frames: she brushes frost off her sleeve, flips her long hair back, strikes a calm composed pose with a faint smile (cells 7 to 8 EMPTY).
Row 3: DEFEAT, 8 frames: hit, drops to her knees, the snowflake hairpin glints, collapses forward and lies still on the ground (full 8 columns).""",
  C="""Row 1: KNOCKED BACK (repelled), 8 frames: hit by a heavy blow, flung backwards off her feet, body leaning back and sliding away, ending in a hard skid (full 8 columns).
Row 2: LAUNCHED, 8 frames: thrown up into the air by a blow from below, body rising and rotating, peaks at the top, starts to hang in the air (full 8 columns).
Row 3: KNOCKED DOWN, 8 frames: falls and %s, bounces once, then lies still, then slowly starts to get back up (full 8 columns).
Row 4: CHASE "Pilar de Gelo", 8 frames: she steps in low, then drives a rising open-palm strike straight upward, body stretching up on her toes, then lowers her arm and returns to stance (full 8 columns)."""%DOWN,
  D="""Row 1: ICE BLADE: a long thin spinning blade of ice flying through the air from left to right with trailing frost.
Row 2: CRESCENTS (basic attack): three curved crescent ice slashes sweeping forward one after another, shards flying.
Row 3: ICE PRISON (jutsu): a big block of ice crystal forming around an empty body-sized space, spikes growing inward, a frosty burst at the end.
Row 4: ICE PILLAR (pursuit): a tall jagged pillar of ice erupting upward from the ground, shards flying, then shattering.
Row 5: IMPACT: a sharp white and pale blue hit burst with radial spikes and a few ice shards.
Row 6: AURA RING: a ring of swirling snow and small ice crystals around an EMPTY space the size of a body, rising upward."""),
 "mayoi": dict(name="MAYOI", pal="slate gray, dusty violet, lilac, pale lilac, a little warm paper-lantern amber",
  look="the gray-blue hair covering one eye, long lilac scarf, slate-violet outfit with moth-wing patterns on the sleeves, the short cane with the small paper lantern, dark pants and boots",
  char="MAYOI, a young mist ninja. Gray-blue hair that covers one eye. A long lilac scarf. Slate-violet outfit with moth-wing patterns on the sleeves, dark pants and boots. A short cane in the right hand with a small glowing paper lantern hanging from its tip, clearly visible in every frame. A few ghostly pale moths fluttering around her. Quiet, mysterious, slightly sleepy expression.",
  A1="""Row 1: IDLE, 6 frames: she sways slowly like drifting mist, scarf floating, the lantern swings softly, a moth lands on her shoulder and takes off (cells 7 to 8 EMPTY).
Row 2: WALK, 8 frames, walking cycle to the right, full 8 columns.
Row 3: DASH, 8 frames, fast low glide forward, body leaning, a few moths trailing behind, full 8 columns.
Row 4: BASIC ATTACK "Bengala e Mariposas", 7 frames: she steps in, swings the cane in a wide arc, a few small pale moths burst out from the lantern at the hit, follow-through, returns to stance (cell 8 EMPTY).""",
  A2="""Row 1: STRONG ATTACK "Onda de Nevoa", 7 frames: she stays in place, raises the cane, plants it on the ground, then sweeps it forward pushing a low wave of mist ahead of her (only a SMALL thin mist line near the cane), follow-through, recovers (cell 8 EMPTY).
Row 2: GUARD, 4 frames: she pulls the scarf and cane across her body, a few moths gather in front of her, holds, relaxes (cells 5 to 8 EMPTY).
Row 3: HURT, 3 frames: hit from the front, head snaps back, hair swings, body recoils, steps back and recovers (cells 4 to 8 EMPTY).
Row 4: DODGE, 8 frames: her body bursts into a flock of pale moths that scatters, and the moths gather again a short step back and re-form into her, lands in stance (full 8 columns).""",
  B1="""Row 1: HAND SEALS, 6 frames: she holds the cane in one hand and makes slow seals with the other, the lantern glows brighter, a thin mist gathers around her feet (cells 7 to 8 EMPTY).
Row 2: RELEASE JUTSU "Noite de Nevoa", 8 frames: she raises the lantern high, it flares, she sweeps the cane in a slow circle and mist pours out around her feet, follow-through, arm lowered. Only SMALL mist wisps near the body, the big night fog comes later (full 8 columns).
Row 3: BUFF, 6 frames: she closes her eyes, moths spiral up around her body in a soft ring of lilac and pale light, she opens her eyes and returns to stance (cells 7 to 8 EMPTY).""",
  B2="""Row 1: STUNNED, 4 frames: dazed, swaying, head drooping, the lantern flickers and dims, a few moths circle her head (cells 5 to 8 EMPTY).
Row 2: VICTORY, 6 frames: she tilts her head and gives a small sleepy smile, the lantern glows warm, moths flutter up around her, she tucks the cane under her arm (cells 7 to 8 EMPTY).
Row 3: DEFEAT, 8 frames: hit, drops to her knees, the lantern dims, collapses forward and lies still, a single moth rests on her (full 8 columns).""",
  C="""Row 1: KNOCKED BACK (repelled), 8 frames: hit by a heavy blow, flung backwards off her feet, body leaning back and sliding away, scarf flying, ending in a hard skid (full 8 columns).
Row 2: LAUNCHED, 8 frames: thrown up into the air by a blow from below, body rising and rotating, peaks at the top, starts to hang in the air (full 8 columns).
Row 3: KNOCKED DOWN, 8 frames: falls and %s, bounces once, then lies still, then slowly starts to get back up (full 8 columns).
Row 4: CHASE "Tempestade de Mariposas", 8 frames: she stays in place, raises the lantern and spreads her arms, a swarm of moths pours out of the lantern and sleeves and surges forward, she holds the pose, lowers her arms and returns to stance (full 8 columns)."""%DOWN,
  D="""Row 1: MOTH SWARM: a dense swarm of pale moths flying from left to right in a loose stream, wings flapping, trailing glow.
Row 2: MIST CLOUD: a big soft cloud of mist that dissolves into moths and re-forms, growing then fading.
Row 3: MIST WAVE (strong attack): a low wide wave of mist rolling forward from left to right with curling wisps.
Row 4: IMPACT: a sharp pale lilac and white hit burst with radial spikes and a few moths.
Row 5: AURA RING: a ring of swirling mist and small moths around an EMPTY space the size of a body, rising upward.
Row 6: SMALL FLASH: a quick small flash of lilac and amber light with a few sparks, used for the lantern."""),
 "doku": dict(name="DOKU", pal="deep plum, violet, magenta, pale lilac, tiny amber accents",
  look="the short messy black hair, short deep-plum hood pulled back, charcoal cloth mask, charcoal tunic with plum trim, wide dark belt, the leather bandolier with 5 glowing violet vials, brown leather gloves, the needle case on the right forearm, dark pants and boots",
  char="DOKU, a young apothecary ninja. Short messy black hair. A short deep-plum hood pulled back on his shoulders. A charcoal-gray cloth mask covering nose and mouth. Charcoal tunic with deep-plum trim and a wide dark belt. A leather bandolier crossing his chest from left shoulder to right hip, holding 5 small glass vials filled with glowing violet liquid, clearly visible in every frame. Brown leather gloves, dark pants, dark boots. A small flat needle case strapped to his right forearm, clearly visible. No weapon in hand unless the row says so. Nothing green: the poison is VIOLET.",
  A1="""Row 1: IDLE, 6 frames: relaxed but wary, he checks a vial against the light, the vials sway, he rolls his shoulders (cells 7 to 8 EMPTY).
Row 2: WALK, 8 frames, walking cycle to the right, full 8 columns.
Row 3: DASH, 8 frames, fast low sprint forward, body leaning, a thin violet speed line at most, full 8 columns.
Row 4: BASIC ATTACK, 7 frames: he reaches to the bandolier, pulls a vial, winds up, THROWS the vial forward with a side-arm throw, follow-through, returns to stance. The vial leaves the hand in frame 5 and is gone afterwards (cell 8 EMPTY).""",
  A2="""Row 1: STRONG ATTACK "Agulhas", 7 frames: he slides the needle case open, pulls 3 long thin needles between his fingers, crouches, LUNGES forward and stabs with the needles in a fast thrust, holds the thrust, pulls back, returns to stance (cell 8 EMPTY).
Row 2: GUARD, 4 frames: crosses both forearms in front of the face, braces, holds, relaxes (cells 5 to 8 EMPTY).
Row 3: HURT, 3 frames: flinches back from a hit, head tilted, eyes shut, recovers a little (cells 4 to 8 EMPTY).
Row 4: DODGE, 6 frames: leans and hops backward in a quick light sidestep, vials swinging, lands in a low balanced pose (cells 7 to 8 EMPTY).""",
  B1="""Row 1: HAND SEALS, 6 frames: both hands form quick ninja seals in front of the chest, small violet sparks between the fingers, concentrated eyes above the mask (cells 7 to 8 EMPTY).
Row 2: RELEASE JUTSU "Nevoa Toxica", 8 frames: he rips the cork off a vial, raises it overhead, crushes it, violet toxic mist pours out around his hands and he spreads both arms wide releasing it. Only SMALL mist near the body, the big cloud comes later (full 8 columns).
Row 3: BUFF, 6 frames: he clenches both fists, a thin violet and magenta aura flickers around the body, vials glow brighter, stands tall (cells 7 to 8 EMPTY).""",
  B2="""Row 1: STUNNED, 4 frames: dizzy, swaying on his feet, head drooping, small plum stars circling the head (cells 5 to 8 EMPTY).
Row 2: VICTORY, 6 frames: holds one glowing vial up with a confident smirk visible in the eyes, raises it, tilts it, small violet sparkle, fist pump (cells 7 to 8 EMPTY).
Row 3: DEFEAT, 8 frames: staggers, drops to his knees, a vial slips and cracks, slumps forward and finally %s, last frame fully lying (full 8 columns)."""%DOWN,
  C="""Row 1: KNOCKED BACK (repelled), 8 frames: hit from the front, body pushed backward, leaning back with arms out, sliding back with feet off balance, ends upright but leaning (full 8 columns).
Row 2: LAUNCHED, 8 frames: thrown into the air, rises, tumbles at the top, body arched, begins to fall, arms flailing (full 8 columns).
Row 3: KNOCKED DOWN, 8 frames: falls from standing and %s, stays flat in the last frames (full 8 columns).
Row 4: CHASE "Ferrao", 8 frames: he leaps high above, flips and dives DOWNWARD head-first-diagonal with one huge needle held in both hands pointing down, stabs downward, a small violet burst on impact, lands crouched (full 8 columns). The big needle stays near the body."""%DOWN,
  D="""Row 1: THROWN VIAL: a glass vial of glowing violet liquid spinning through the air from left to right, with a short violet trail.
Row 2: VIAL BURST (basic attack): the vial shatters on impact, glass shards fly, a violet liquid splash blooms and drips away.
Row 3: TOXIC MIST (jutsu): a huge swirling cloud of violet and magenta poison gas with pale lilac wisps and small bubbles, expanding to fill the whole cell, growing then thinning.
Row 4: STINGER (pursuit): a gigantic needle of violet energy plunging diagonally downward with a magenta shock ring at the tip, growing and fading.
Row 5: IMPACT: a sharp violet and pale lilac hit burst with radial spikes and a few droplets.
Row 6: AURA RING: a ring of swirling violet and magenta poison vapor around an EMPTY space the size of a body, rising upward, with small bubbles."""),
}

# ---- MODO LINHA (25/11/2026): UMA animação por imagem (1 linha), em vez de sheets de 3-6 linhas ----
ROWMAP = [('A1', ['idle', 'walk', 'dash']), ('A1B', ['attack1', 'attack2', 'attack3']), ('A2', ['strong', 'guard', 'hurt', 'dodge']),
          ('B1', ['seals', 'jutsu', 'buff']), ('B2', ['stun', 'victory', 'defeat']), ('C', ['knockback', 'launched', 'knockdown']),
          ('CH', ['chase1', 'chase2', 'chase3']), ('CL', ['clone_idle', 'clone_attack', 'clone_hurt', 'clone_vanish']),
          ('D', ['fx_proj', 'fx_hit', 'fx_jutsu', 'fx_chase', 'fx_impact', 'fx_aura'])]
def row_prompts(k):
    """Lista de (anim, texto do prompt de UMA linha). Usa os mesmos textos dos lotes (n[lote]), uma linha por prompt."""
    import re
    n = NINJAS[k]; P = n["pal"]; N = n["name"]; out = []
    for lote, anims in ROWMAP:
        if lote not in n: continue
        rws = [l for l in n[lote].split("\n") if l.startswith("Row ")]
        for a, rw in zip(anims, rws):
            r1 = re.sub(r"^Row \d+:", "Row 1:", rw)
            if lote == "D":
                t = PIXEL + "\n" + DBLOCK.format(PAL=P, NAME=N).replace("EXACTLY 6 rows and EXACTLY 6 columns", "EXACTLY 1 row and EXACTLY 6 columns").replace("The image has 6 rows, not more.", "The image has 1 row, not more.").replace("LOTE D", a.upper()).replace("ROWS (each one effect, 6 frames):", "ROW (one effect, 6 frames):") + r1 + "\n"
            elif lote == "CL":
                t = RULES.format(N=1, PAL=P, NAME=N, L=a.upper()) + "\n" + ROWREF.format(NAME=N.title()) + PIXEL + "\n" + n["CLINTRO"] + f"Proportions: {PROP}.\n\nROWS:\n" + r1 + "\n"
            else:
                t = RULES.format(N=1, PAL=P, NAME=N, L=a.upper()) + "\n" + ROWREF.format(NAME=N.title()) + PIXEL + "\n" + TRUTH.format(NAME=N.title(), LOOK=n["look"]) + f"Proportions: {PROP}.\n\nROWS:\n" + r1 + "\n"
            out.append((a, t))
    return out

def build(k):
    n = NINJAS[k]; P = n["pal"]; N = n["name"]
    def lot(rows, L, ref):
        return RULES.format(N=rows[0], PAL=P, NAME=N, L=L) + "\n" + (REF if ref else TRUTH.format(NAME=N.title(), LOOK=n["look"])) + "\nROWS:\n" + rows[1] + "\n"
    out = {}
    out["A1"] = RULES.format(N=n["A1"].count("\nRow ")+1, PAL=P, NAME=N, L="A1") + "\n" + REF + f"\nCHARACTER (original ninja, pixel art, dark 1px outline, max 16 colors, {PROP}): {n['char']}\n\nROWS:\n{n['A1']}\n"
    out["STYLE"] = STYLE_RULES.format(PAL=P, NAME=N) + "\n" + REF + "\n" + PIXEL + f"\nCHARACTER (original ninja, pixel art, dark 1px outline, max 16 colors, {PROP}): {n['char']}\n\nPOSE: one standing idle pose: {n.get('STYLEPOSE', 'a relaxed idle stance that shows his personality')}.\n"
    if n.get("styleref"): out["A1"] = out["A1"].replace("\nCHARACTER (original", STYLEREF.format(NAME=N.title(), LOOK=n["look"]) + "\nCHARACTER (original", 1)
    out["A2"] = lot((4, n["A2"]), "A2", False); out["B1"] = lot((3, n["B1"]), "B1", False)
    out["B2"] = lot((3, n["B2"]), "B2", False); out["C"] = lot((n["C"].count("\nRow ")+1, n["C"]), "C", False)
    if "A1B" in n: out["A1B"] = lot((3, n["A1B"]), "A1B", False)
    if "CH" in n: out["CH"] = lot((3, n["CH"]), "CH", False)
    if "CL" in n: out["CL"] = RULES.format(N=4, PAL=P, NAME=N, L="CL") + "\n" + n["CLINTRO"] + "\nROWS:\n" + n["CL"] + "\n"
    out["D"] = DBLOCK.format(PAL=P, NAME=N) + n["D"] + "\n"
    return out
if __name__ == "__main__":
    k = sys.argv[1]; P = build(k)
    head = (f"# {k.title()} — lotes completos (gerado por tools/sprites/gen_prompts_lotes.py)\n\nOrdem e anexos: **A1** ← `docs/refs/elenco_ref.png` → **A2** ← A1 → **B1** ← A2 → **B2** ← B1 → **C** ← B2 → **D** ← qualquer sheet (só paleta). Salvar em `tools/sprites/src/{k}/`.\n\n")
    open(os.path.join(DOCS, f"prompts-{k}.md"), "w").write(head + "".join(f"## LOTE {a}\n```\n{t}```\n\n" for a, t in P.items()))
    d = os.environ.get("OUT")
    if d:
        os.makedirs(d, exist_ok=True)
        for a, t in P.items(): open(f"{d}/{k}_{a}.txt", "w").write(t)
