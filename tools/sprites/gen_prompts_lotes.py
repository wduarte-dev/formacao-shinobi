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
5. The character is IDENTICAL in every frame: same design, colors, proportions, pixel scale and outline. Faces RIGHT (side or three-quarter view). Pose and position inside the cell are FREE: the body may lean, slide, float, jump or shift anywhere in the cell, as long as it stays fully inside it. Accessories and every worn or held item (if any) keep the SAME size, shape and count in EVERY frame (nothing shrinks, disappears, duplicates or changes shape between frames; a motion smear is an EXTRA drawn next to the full object, never a replacement for it).
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
LOCKS = ("ANATOMICAL LOCK: every frame keeps exactly two arms, two hands and two legs with coherent joints and limb connections; natural occlusion is allowed but hidden limbs stay anatomically consistent; no missing, fused, disconnected or extra body parts, and the hands always clearly hold the items they hold.\n"
         "TEMPORAL COHERENCE: all frames are the SAME persistent character at different moments of ONE animation, not separate illustrations: coherent anatomy, clothing, accessories, proportions and secondary motion (cape/coat/hair follow the body) between consecutive frames, and every frame has a clear function in the motion (no near-identical or filler frames).\n"
         "CELL ISOLATION: treat each cell as its own canvas with a safe margin of at least 10% empty on every side; character, clothing, items and effects stay inside it, the scale is identical in all cells, and there is visible empty green space between neighbouring frames.\n")
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
 "utsushi": dict(name="UTSUSHI", pal="storm gray, charcoal, off-white fur, sand ochre, pale gray-blue wind lines",
  look="the dark storm-gray hooded parka with a thick off-white fur trim around the hood pulled up over his head, pale sand-blond messy hair strands escaping from under the hood, pale skin, calm half-shadowed silver-gray eyes, a thin mysterious smile, a muted sand-ochre shirt under the open parka, dark charcoal loose pants, dark boots, and sand-ochre cloth wraps around both hands and wrists, with NO weapon",
  char="UTSUSHI, a young mysterious wind ninja. Lean and slightly hunched, he stands in a SLUMPED fighting posture: shoulders dropped, head tilted low, arms hanging loose and relaxed in front of his body, knees slightly bent, as if he were about to explode into motion at any moment. A dark storm-gray parka with a thick off-white fur trim around the hood; the HOOD IS PULLED UP over his head, with messy pale sand-blond hair strands escaping at the front and sides, and the hood shadows the upper part of his face; calm silver-gray eyes and a thin mysterious smile. The parka is worn open over a muted sand-ochre shirt, loose dark charcoal pants and dark boots. Sand-ochre cloth wraps around both hands and wrists. NO weapon of any kind: he fights with fists, palms and kicks, and his wind is only a small effect near the body. Colors only storm gray, charcoal, off-white, sand ochre and pale gray-blue wind lines. Nothing turquoise, aqua or teal anywhere.",
  STYLEPOSE="a slumped fighting posture, shoulders dropped, head tilted low under the fur hood, arms hanging loose in front, a thin mysterious smile",
  A1="""Row 1: IDLE, 6 frames: the slumped fighting posture, he sways slowly, the fur trim of the hood ruffles in a faint breeze, his loose hands flex, he lifts his head a little and a sand-blond strand flutters, then settles back into the slump (cells 7 to 8 EMPTY).
Row 2: WALK, 8 frames, a slow, loose, slightly dragging walking cycle to the right, still hunched, arms hanging and swinging lightly, full 8 columns.
Row 3: DASH, 8 frames: a very low fast forward dash, body almost horizontal, the parka tails and hood fur streaming behind him, a few thin pale gray-blue wind lines at most, full 8 columns.""",
  A1B="""Row 1: BASIC HIT 1 "Soco Torto", 6 frames, starts and ends in the slumped stance. Frame 1 ANTICIPATION: he sinks lower, the right fist drawn back. Frame 2 body coiled. Frame 3 SMEAR: the punch in mid-flight drawn as ONE opaque flat streak shape in pale gray-blue and off-white along the arm (not translucent). Frame 4 CONTACT: the right arm fully extended in a twisting hook, the strongest pose of the hit. Frame 5 follow-through. Frame 6 back to the slump (cells 7 to 8 EMPTY).
Row 2: BASIC HIT 2 "Chute Rasteiro", 6 frames, starts and ends in the same stance. Frame 1 ANTICIPATION: he leans on one leg, the other leg drawn back. Frame 2 body twisting low. Frame 3 SMEAR: a low sweeping kick drawn as ONE opaque flat curved streak of pale gray-blue and off-white (not translucent). Frame 4 CONTACT: the leg fully extended in a low sweep, the strongest pose of the hit. Frame 5 follow-through spin. Frame 6 back to the slump (cells 7 to 8 EMPTY).
Row 3: BASIC HIT 3 "Palma do Vendaval", the heaviest hit of the combo, 6 frames, starts in the stance and ends in a cocky slump. Frame 1 ANTICIPATION: he crouches, one open palm drawn back by his hip. Frame 2 full coil. Frame 3 SMEAR: an upward palm strike drawn as ONE opaque flat arc of pale gray-blue, off-white and a little sand ochre (not translucent). Frame 4 CONTACT: the open palm thrust forward and up at full extension, the strongest pose of the whole combo. Frame 5 follow-through, the hood fur flying. Frame 6 he settles into the slump again with a thin smile (cells 7 to 8 EMPTY).""",
  A2="""Row 1: STRONG ATTACK "Rajada Torta", 7 frames: he sinks low, both hands gather at his hip, he steps in and thrusts both palms forward in one heavy push, a small burst of pale gray-blue wind lines at the palms, holds the pose with the hood fur blown back, relaxes into the slump (cell 8 EMPTY).
Row 2: GUARD, 4 frames: he crosses both forearms in front of his face, hood low, braces, holds, relaxes with a thin smile (cells 5 to 8 EMPTY).
Row 3: HURT, 3 frames: hit from the front, head snaps back, the hood slips a little, body recoils, steps back and recovers (cells 4 to 8 EMPTY).
Row 4: DODGE, 6 frames: a loose sideways lean away from the hit, his body blurs into a small gust of dust and pale wind at his feet, he reappears one step back in the slump and gives a small shrug (cells 7 to 8 EMPTY).""",
  B1="""Row 1: HAND SEALS, 6 frames, EVERY frame visibly different: he slowly lifts his hands from the slump, the fingers cross into a loose seal, thin pale gray-blue wind lines swirl at his feet, the fur trim of the hood ruffles, a sand-blond strand lifts, he tilts his head with a mysterious smile (cells 7 to 8 EMPTY).
Row 2: RELEASE JUTSU "Legiao de Ventos", 8 frames: he crouches and sweeps one hand along the ground, a ring of swirling dust and pale wind ripples spreads from his hand, thin gusts rise around him, he stands up and spreads both arms with a quiet smile as the wind settles. Only SMALL gusts and dust near the body, NO other characters and no clones are drawn (the game adds them) (full 8 columns).
Row 3: BUFF, 6 frames: a thin ring of pale gray-blue wind wraps around his body, the hood fur and parka tails flutter, his eyes narrow under the hood, he rolls his shoulders and settles into the slump (cells 7 to 8 EMPTY).""",
  B2="""Row 1: STUNNED, 4 frames: dazed and wobbling, arms dangling, the hood askew over his face, head hanging, a few small pale gray stars circling his head (cells 5 to 8 EMPTY).
Row 2: VICTORY, 6 frames: he straightens slowly from the slump, tugs the hood lower over his eyes with one hand, gives a mysterious smile and a slow shrug as a gust ruffles the fur (cells 7 to 8 EMPTY).
Row 3: DEFEAT, 8 frames: hit, he staggers, still smiling thinly, falls to his knees, the hood slips back a little, collapses forward and lies still on the ground (full 8 columns).""",
  C="""Row 1: KNOCKED BACK (repelled), 8 frames: hit by a heavy blow, flung backwards off his feet, body leaning back and sliding away, the hood fur flying, ending in a hard skid (full 8 columns).
Row 2: LAUNCHED, 8 frames: thrown up into the air by a blow from below, body rising and rotating, peaks at the top, starts to hang in the air (full 8 columns).
Row 3: KNOCKED DOWN, 8 frames: falls and %s, bounces once, then lies still, then slowly starts to get back up (full 8 columns)."""%DOWN,
  CH="""Row 1: CHASE "Rajada Fantasma" part 1 (vanish and reappear), 6 frames, no enemy drawn. Frame 1 he sinks into the slump, hands loose. Frame 2 his body starts to blur into a gust of dust and pale wind. Frame 3 almost gone, only the hood and a swirl of wind. Frame 4 he bursts out of the gust into the air. Frame 5 rising, one leg drawn back. Frame 6 at the top, body coiled (cells 7 to 8 EMPTY).
Row 2: CHASE part 2 (the dive kick), 6 frames, no enemy drawn. Frame 1 he drops down head-first, one leg cocked. Frame 2 wind-up. Frame 3 SMEAR: a huge diving kick drawn as ONE opaque flat curved streak of pale gray-blue and off-white (not translucent). Frame 4 CONTACT: the leg at full extension in a diagonal dive kick, the strongest pose of the whole action. Frame 5 follow-through. Frame 6 the momentum carries him past (cells 7 to 8 EMPTY).
Row 3: CHASE part 3 (landing), 6 frames, no enemy drawn. Frame 1 lands low in a crouch, one hand on the ground. Frame 2 holds the crouch, dust swirling. Frame 3 rises slowly. Frame 4 rolls his shoulders. Frame 5 straightens with a thin smile. Frame 6 back to the slumped stance (cells 7 to 8 EMPTY).""",
  D="""Row 1: WIND CRESCENT: a thin crescent-shaped gust of pale gray-blue and off-white wind flying through the air from left to right with a short trailing swirl.
Row 2: WIND STRIKES (basic attack): three quick short wind-slash arcs in a row, pale gray-blue and off-white with small sand-ochre dust specks.
Row 3: WIND SUMMON (jutsu): a ring of swirling dust and pale gray-blue wind ripples spreading on the ground, thin gusts and small leaves rising, growing then settling, centered on an EMPTY body-sized space.
Row 4: AMBUSH (pursuit): a huge spiral of pale gray-blue and off-white wind with crossing slash lines, growing then fading.
Row 5: IMPACT: a sharp off-white and pale gray-blue hit burst with radial spikes and a few sand-ochre sparks.
Row 6: AURA RING: a ring of swirling pale gray-blue wind and small dust wisps around an EMPTY space the size of a body, rising upward.""",
  CLINTRO="Attached image is the ABSOLUTE source of truth for the character's design, proportions and pixel scale (Utsushi). Draw HIM again in WIND CLONE FORM: exactly the same body, slumped pose style, fur-trimmed hood and parka, but the whole figure is a flat pale gray-white silhouette made of wind, with thin storm-gray outline highlights, a few off-white details (the fur trim) and two small glowing off-white eyes. Fully opaque, no transparency, NO other colors. It must clearly read as a ghostly wind copy of the same ninja.\n",
  CL="""Row 1: CLONE IDLE, 6 frames: the same slumped stance as the original, swaying slowly, the fur trim fluttering, a slow breath (cells 7 to 8 EMPTY).
Row 2: CLONE ATTACK, 6 frames: a fast single punch: anticipation, coil, SMEAR (one opaque flat pale streak), contact, follow-through, back to the slump (cells 7 to 8 EMPTY).
Row 3: CLONE HURT, 3 frames: hit from the front, head snaps back, body recoils, recovers (cells 4 to 8 EMPTY).
Row 4: CLONE VANISH, 8 frames: the clone cracks and breaks into swirling gusts of pale wind and small dust wisps, the figure unravels into a spiral, frame 7 only small wisps, frame 8 a few tiny wisps left (full 8 columns)."""),
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
 # KAZAN (25/11/2026, design aprovado no STYLE, animações fechadas por perguntas): ferreiro SENTADO de cabeça de caldeirão; sem C, sem CH, sem Forte, sem dodge, sem buff (imune a perseguição; escudo de lava e dragão saem em código/peças).
 "kazan": dict(name="KAZAN", colors="up to 32 colors", styleref=True, pal="ember orange, molten gold, red-orange, charcoal, dark iron gray, stone brown, tan, a little cream",
  look="the round dark iron cauldron-pot for a HEAD (a small iron ring handle on its side, a living flame and a wisp of smoke rising from its open top, two glowing orange eyes in a dark face slot, NO hair and NO visible face), a sleeveless dark charcoal tunic with a burnt-orange cross sash and a red-orange cloth tail hanging from the shoulder, tan skin, tan bandage wraps on both forearms and hands, a brown leather belt with a small buckle, a ragged burnt-orange apron over charcoal pants, brown strapped leather boots, SEATED on a squat stone-brick stool beside a big dark stone-gray anvil (a glowing lava crack in its base and a cream cloth banner with a flame emblem hanging on its side), holding a huge hammer with a brown wooden handle and a glowing cracked lava-block head",
  char="KAZAN, a young blacksmith ninja who is always SEATED and never stands up while fighting. His HEAD is a round dark iron cauldron-pot with a small iron ring handle on the side and an open top where a living flame burns (a wisp of smoke above it); his face is a dark slot with two glowing orange eyes, no hair, no skin visible on the head. Stocky body, tan skin, sleeveless dark charcoal tunic with a burnt-orange cross sash and a red-orange cloth tail hanging from one shoulder, tan bandage wraps on both forearms and hands, a brown leather belt with a small buckle, a ragged burnt-orange apron over charcoal pants, brown strapped leather boots. He sits on a squat stone-brick stool. Beside him (to his right as he faces right) stands a big dark stone-gray anvil with a glowing lava crack in its base and a cream cloth banner with a flame emblem hanging on its side (the anvil is in the sitting frames; the rows below say when it is NOT drawn). A huge hammer with a brown wooden handle and a glowing cracked lava-block head. Colors only ember orange, molten gold, red-orange, charcoal, dark iron gray, stone brown, tan and a little cream. Nothing turquoise, aqua, teal or greenish anywhere.",
  STYLEPOSE="seated on the stone-brick stool beside the anvil, the huge lava hammer resting on his shoulder, one forearm on his knee, the flame in the cauldron head flickering, a lazy relaxed posture",
  A1="""Row 1: IDLE, 6 frames, lazy and relaxed, seated at the anvil, the huge hammer resting on his shoulder. Frame 1 the flame in the cauldron head flickers. Frame 2 he FANS the flame: one bandaged hand held right next to the open top of the cauldron head, palm toward the flame, the flame bending away from the hand, a few small sparks flying off (NOT a wave). Frame 3 the flame on the cauldron head visibly SWELLS to about twice its normal height and sways to one side with a bigger wisp of smoke, the body as in frame 1. Frame 4 he lowers the hammer and taps its head lazily against his knee. Frame 5 a spark pops out of the cauldron. Frame 6 the hammer goes back on his shoulder and the flame settles (cells 7 to 8 EMPTY).
Row 2: WALK (battle entrance), 8 frames: he RUNS to the right at a brisk pace carrying the stone stool in one hand at his hip (the SAME squat rectangular stone-brick stool he sits on in the STYLE image: flat top, clearly visible rough brick blocks in 2-3 rows, NOT a sack, NOT a round boulder, NOT a barrel), the flame of his cauldron head streaming back behind him, the red-orange cloth tail flying, full running cycle. EXCEPTION for this row only: NO anvil, NO hammer and NO banner are drawn (the game spawns them later); only the character and the stool he carries, same stool design in every frame (full 8 columns).
Row 3: DASH (ritual before every attack), 8 frames, seated at the anvil, ONE continuous motion with no going back. Frame 1 hammer resting on his shoulder. Frame 2 he takes the hammer off his shoulder and holds it upright in front of him with both hands. Frame 3 he lifts it, the hammer head forward and tilted just above the rim of the open cauldron on his head (never above the top of the cell). Frame 4 the hammer head is DIPPED INTO the open top of the cauldron, hidden inside the mouth, the cauldron flame flaring up around it. Frame 5 the flame surges and WRAPS the hammer head completely, a big burst of fire and embers around the cauldron top. Frame 6 he pulls the hammer out: the lava block head is now white-hot gold, blazing, with flames trailing off it. Frame 7 he rests the blazing hammer ready in front of the anvil, sparks and embers flying. Frame 8 a strong ready guard with the hammer beside the anvil (full 8 columns).
Row 4: SIT (battle intro), 8 frames. Frame 1 he RUNS to the right carrying the stone-brick stool in one hand at his hip (same stool as the walk row). Frame 2 he skids to a stop with a thump of dust. Frame 3 he sets the stool on the ground. Frame 4 he sits down on it heavily, the cauldron flame bouncing, NO hammer drawn. Frame 5 he leans down and reaches toward the ground with one empty open hand, NO hammer drawn (the game spawns the hammer on the ground). Frame 6 he holds a hammer upright by the handle, its glowing lava head resting on the ground next to the stool. Frames 7 and 8 he rests the hammer on his shoulder in the lazy idle pose. EXCEPTION for this row only: NO anvil and NO banner are drawn (the game spawns them) (full 8 columns).""",
  A1B="""Row 1: BASIC PHASE 1 "Derramar", 6 frames, seated at the anvil, starting in the lazy idle with the hammer on his shoulder. Frame 1 the hammer rests, the head begins to tilt forward. Frame 2 the cauldron head tilts further over the anvil. Frame 3 a thin stream of glowing molten lava pours from the rim of the cauldron down onto the anvil face. Frame 4 the pour at its heaviest, a glowing pool of lava on the anvil face, the flame leaning forward. Frame 5 the head tilts back upright. Frame 6 he grips the hammer with both hands and starts to lift it (cells 7 to 8 EMPTY).
Row 2: BASIC PHASE 2 "Martelada", 6 frames, seated, the pool of lava on the anvil face. Frame 1 hammer raised up with both hands, the hammer head fully inside the cell (angle it back and lower the raise if needed, never touching the top edge). Frame 2 body coiled, hammer high but still fully inside the cell, eyes blazing. Frame 3 SMEAR: the downward swing drawn as ONE opaque flat arc streak in molten gold, ember orange and white (not translucent). Frame 4 CONTACT: the hammer slams onto the lava pool on the anvil, lava splashing in sparks, the strongest pose of the whole action, a small tongue of flame bursting upward from the anvil. Frame 5 follow-through, hammer pressed on the anvil, embers flying. Frame 6 the hammer lifts slightly, the flame rising (cells 7 to 8 EMPTY).
Row 3: BASIC PHASE 3 "Chama", 6 frames, seated, NO flame projectile drawn (the game adds the flames). Frame 1 he swings the hammer forward along the top of the anvil as if batting a ball away to the right. Frame 2 the strongest pose: arm fully extended, hammer pointing forward to the right, a flash of sparks only at the hammer head. Frame 3 holds the pose, embers trailing. Frame 4 he pulls the hammer back. Frame 5 settles on the stool, the cauldron flame bouncing. Frame 6 back to the lazy idle with the hammer on his shoulder (cells 7 to 8 EMPTY).""",
  A2="""Row 1: GUARD "Escudo de Lava", 4 frames, seated, the hammer leaning against the anvil in every frame so both hands are free: a very quick reaction (the game adds the rock). Frame 1 he snaps both hands up in front of him, palms up. Frame 2 he heaves his arms upward as if lifting a heavy slab, the cauldron flame flaring, body braced on the stool. Frame 3 holds the lifted pose, arms fully extended up and forward. Frame 4 lowers his hands and relaxes. NO rock or slab drawn (cells 5 to 8 EMPTY).
Row 2: HURT, 3 frames: hit from the front, the cauldron head snaps back and the flame stutters, he is shoved back on the stool, grips the hammer and recovers (cells 4 to 8 EMPTY).""",
  B1="""Row 1: HAND SEALS, 6 frames, EVERY frame visibly different, seated: he lays the hammer across his knees, claps both bandaged hands together, rubs the palms and a glowing thread of lava heat stretches between them, his fingers cross into a seal, the cauldron flame leans forward, he grabs the hammer again (cells 7 to 8 EMPTY).
Row 2: RELEASE JUTSU "Plano da Forja", 8 frames, seated: he grabs the rim of the cauldron head with both hands, slowly tilts it far forward, a thick overflow of glowing lava pours from the cauldron down to the ground in front of him in a heavy stream, he holds the tilt as the pour grows, tilts the head back upright, the flame rises tall, he settles with a smug posture. Only the pouring stream and a few small drips are drawn, the big wave of lava comes later (full 8 columns).
Row 3: COUNTER "Bola de Fogo", 6 frames, seated, hammer on his shoulder at the start. Frame 1 he reaches up with both hands and scoops a glowing glob of lava from the open top of the cauldron head. Frame 2 he tosses the glob of lava upward, a small glowing blob clearly in the air above him. Frame 3 he grabs the hammer with both hands and winds up (hammer and glob always fully inside the cell, never touching the top edge). Frame 4 CONTACT: the hammer swings up and smashes the glob in mid-air, a flash of sparks, the strongest pose of the action. Frame 5 follow-through, sparks and embers raining. Frame 6 back to the lazy idle with the hammer on his shoulder (cells 7 to 8 EMPTY).""",
  B2="""Row 1: STUNNED, 4 frames: dazed, slumped on the stool, the cauldron head wobbling on the neck, the flame flickering weakly, the hammer head resting on the ground, small gold stars circling the head (cells 5 to 8 EMPTY).
Row 2: VICTORY, 6 frames: seated, he raises the hammer overhead in triumph, the flame of the cauldron head explodes upward into a tall roaring column of fire, his shoulders shake with a low laugh, embers rain around; the raised hammer and the column of fire stay fully inside the cell, never touching the top edge, so draw him a little lower and the fire shorter if needed (cells 7 to 8 EMPTY).
Row 3: DEFEAT, 8 frames: he takes a heavy hit, the flame in the cauldron head stutters, the flame goes out and only smoke curls up, the cauldron head slips off the neck and rolls away along the ground, the headless body slumps back on the stool and the hammer slides from his hand (full 8 columns). The cauldron head stays in the cell, rolling and finally lying still.""",
  D="""Row 1: FLAME SHOT: a blazing ball of fire with a thick flame tail, flying through the air from left to right, ember orange and molten gold.
Row 2: LAVA POUR: a thick stream of glowing molten lava pouring down and splashing on the ground, droplets flying, growing then thinning.
Row 3: LAVA WAVE (jutsu): a low wide wave of molten lava rolling along the ground from left to right, crusted with dark rock, flame licking the crest, embers rising.
Row 4: BIG FIREBALL (counter): a huge blazing fireball of orange and molten gold flames with a dark core, flying from left to right, growing.
Row 5: IMPACT: a sharp orange, gold and white hit burst with radial spikes and a few lava droplets.
Row 6: AURA RING: a ring of swirling embers and small sparks around an EMPTY space the size of a body, rising upward.
EVERY row: the 6 frames are 6 clearly different stages of the effect (start, build-up, peak, peak variation, decay, fade), never a repeated frame, and every frame stays fully inside its cell with a margin.""",
  # Dragão de lava (ult): PEÇAS GRANDES, uma imagem por peça, 1 linha com poucos quadros enormes (o código monta e anima o dragão inteiro)
  DR={
   "DR1": """STRICT RULES: LANDSCAPE image with EXACTLY 1 row and EXACTLY 2 columns, two huge frames of identical size, each frame fills at least 85% of its cell, nothing touches the cell edge. Solid flat pure green #00FF00 background, no checkerboard, no gradient, no border, no grid lines, no shadow, no text except the label. No green, turquoise or teal on the dragon. Fully opaque, no ghosting.
ART STYLE: pixel art for a 2D game with a dark 1px outline, up to 32 colors, hard-edged pixel clusters, flat cel shading, no soft gradients, no smooth painting.
SUBJECT: the HEAD of a giant LAVA DRAGON seen in pure side view FACING RIGHT, drawn HUGE (much bigger than any ninja). A long serpentine eastern-style dragon: obsidian-black scales with glowing ember-orange magma cracks between them, two long curved obsidian horns swept back, small spiked crest, golden slit eyes, a magma glow inside the throat, smoldering ember sparks. The neck ends on the LEFT edge of the frame as a clean wide round stump of thickness exactly 40% of the cell height, centered vertically, so a body segment can be attached there; nothing else touches the left edge.
Frame 1: mouth CLOSED, jaws shut, menacing. Frame 2: mouth WIDE OPEN roaring, rows of fangs, a molten-gold glow and flames inside the throat, horns and crest the same size and position as frame 1.
Colors only: obsidian black, charcoal, dark steel gray, ember orange, molten gold, a little white-hot yellow. Same dragon design in both frames.
LABEL: top-left corner only, small plain white pixel text "KAZAN - DRAGAO CABECA" on a thin dark strip above the grid.
""",
   "DR2": """STRICT RULES: LANDSCAPE image with EXACTLY 1 row and EXACTLY 4 columns, four frames of identical size, each frame fills the full width of its cell with the body piece entering exactly at the LEFT edge and leaving exactly at the RIGHT edge. Solid flat pure green #00FF00 background, no checkerboard, no gradient, no border, no grid lines, no shadow, no text except the label. No green, turquoise or teal on the dragon. Fully opaque, no ghosting.
ART STYLE: pixel art for a 2D game with a dark 1px outline, up to 32 colors, hard-edged pixel clusters, flat cel shading, no soft gradients.
SUBJECT: a straight BODY SEGMENT of the same giant LAVA DRAGON (obsidian-black scales, glowing ember-orange magma cracks between the scales, a row of small obsidian spikes along the top), seen in pure side view, a horizontal tube of thickness exactly 40% of the cell height, centered vertically, crossing the whole cell from the left edge to the right edge at the SAME height and thickness on both edges so the frames can be joined end to end and tile seamlessly. Below the belly a paler dark-gray scale band.
The 4 frames are the SAME segment pulsing: the magma cracks glow dim, brighter, brightest, then dim again (only the glow changes, the shape and the scale pattern stay identical), with a few tiny embers floating off the top.
Colors only: obsidian black, charcoal, dark steel gray, ember orange, molten gold, a little white-hot yellow.
LABEL: top-left corner only, small plain white pixel text "KAZAN - DRAGAO CORPO" on a thin dark strip above the grid.
""",
   "DR3": """STRICT RULES: LANDSCAPE image with EXACTLY 1 row and EXACTLY 2 columns, two huge frames of identical size, each frame fills at least 85% of its cell, nothing touches the cell edge except the tail stump on the LEFT edge. Solid flat pure green #00FF00 background, no checkerboard, no gradient, no border, no grid lines, no shadow, no text except the label. No green, turquoise or teal on the dragon. Fully opaque, no ghosting.
ART STYLE: pixel art for a 2D game with a dark 1px outline, up to 32 colors, hard-edged pixel clusters, flat cel shading, no soft gradients.
SUBJECT: the TAIL of the same giant LAVA DRAGON (obsidian-black scales, glowing ember-orange magma cracks, small obsidian spikes along the top) in pure side view pointing RIGHT. It starts on the LEFT edge as a clean round stump of thickness exactly 40% of the cell height, centered vertically (to attach to a body segment), then tapers to a thin tip ending in a blade of flame made of molten gold and ember orange.
Frame 1: the tail nearly straight with a slight wave. Frame 2: the tail whipped into a strong S-curve, the flame blade flaring brighter. Same design and scale in both frames.
Colors only: obsidian black, charcoal, dark steel gray, ember orange, molten gold, a little white-hot yellow.
LABEL: top-left corner only, small plain white pixel text "KAZAN - DRAGAO CAUDA" on a thin dark strip above the grid.
""",
   "DR4": """STRICT RULES: LANDSCAPE image with EXACTLY 1 row and EXACTLY 6 columns, six frames of identical size, each effect fills most of its cell, nothing touches the cell edge. NO dragon, NO character, NO person in any cell. Solid flat pure green #00FF00 background, no checkerboard, no gradient, no border, no grid lines, no shadow, no text except the label. No green, turquoise or teal anywhere. Fully opaque, no ghosting.
ART STYLE: pixel art for a 2D game with a dark 1px outline, up to 32 colors, hard-edged pixel clusters, flat cel shading, no soft gradients.
SUBJECT: a LAVA ERUPTION used where the dragon bursts out of the ground and where it lands: a column of molten lava and flame shooting up from a flat base at the bottom of the cell, with flying chunks of black rock, ember sparks and dripping molten gold. Frame 1 a small crack glowing on the ground, frame 2 lava starts to spurt, frame 3 a big eruption column, frame 4 the peak with the widest spray of rock and lava, frame 5 it falls and splashes outward, frame 6 only small drips, embers and a dying glow.
Colors only: ember orange, molten gold, white-hot yellow, charcoal, obsidian black, dark steel gray.
LABEL: top-left corner only, small plain white pixel text "KAZAN - ERUPCAO" on a thin dark strip above the grid.
"""}),
}

# ---- MODO LINHA (25/11/2026): UMA animação por imagem (1 linha), em vez de sheets de 3-6 linhas ----
ROWMAP = [('A1', ['idle', 'walk', 'dash']), ('A1B', ['attack1', 'attack2', 'attack3']), ('A2', ['strong', 'guard', 'hurt', 'dodge']),
          ('B1', ['seals', 'jutsu', 'buff']), ('B2', ['stun', 'victory', 'defeat']), ('C', ['knockback', 'launched', 'knockdown']),
          ('CH', ['chase1', 'chase2', 'chase3']), ('U', ['ult1', 'ult2', 'fireball']), ('CL', ['clone_idle', 'clone_attack', 'clone_hurt', 'clone_vanish']),
          ('D', ['fx_proj', 'fx_hit', 'fx_jutsu', 'fx_chase', 'fx_impact', 'fx_aura'])]
def _colors(n, t):
    """Ninja com chave `colors` (ex.: Kazan) troca o limite padrão de 16 cores pelo dele (decidido 25/11/2026)."""
    c = n.get("colors")
    return t.replace("max 16 colors per character", c + " per character").replace("max 16 colors", c) if c else t
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
                t = RULES.format(N=1, PAL=P, NAME=N, L=a.upper()) + "\n" + ROWREF.format(NAME=N.title()) + PIXEL + LOCKS + "\n" + n["CLINTRO"] + f"Proportions: {PROP}.\n\nROWS:\n" + r1 + "\n"
            else:
                t = RULES.format(N=1, PAL=P, NAME=N, L=a.upper()) + "\n" + ROWREF.format(NAME=N.title()) + PIXEL + LOCKS + "\n" + TRUTH.format(NAME=N.title(), LOOK=n["look"]) + f"Proportions: {PROP}.\n\nROWS:\n" + r1 + "\n"
            out.append((a, _colors(n, t)))
    return out

def build(k):
    n = NINJAS[k]; P = n["pal"]; N = n["name"]
    def lot(rows, L, ref):
        return RULES.format(N=rows[0], PAL=P, NAME=N, L=L) + "\n" + (REF if ref else TRUTH.format(NAME=N.title(), LOOK=n["look"])) + PIXEL + LOCKS + "\nROWS:\n" + rows[1] + "\n"
    out = {}
    out["A1"] = RULES.format(N=n["A1"].count("\nRow ")+1, PAL=P, NAME=N, L="A1") + "\n" + REF + "\n" + PIXEL + LOCKS + f"\nCHARACTER (original ninja, pixel art, dark 1px outline, max 16 colors, {PROP}): {n['char']}\n\nROWS:\n{n['A1']}\n"
    out["STYLE"] = STYLE_RULES.format(PAL=P, NAME=N) + "\n" + REF + "\n" + PIXEL + f"\nCHARACTER (original ninja, pixel art, dark 1px outline, max 16 colors, {PROP}): {n['char']}\n\nPOSE: one standing idle pose: {n.get('STYLEPOSE', 'a relaxed idle stance that shows his personality')}.\n"
    if n.get("styleref"): out["A1"] = out["A1"].replace("\nCHARACTER (original", STYLEREF.format(NAME=N.title(), LOOK=n["look"]) + "\nCHARACTER (original", 1)
    cr = lambda t: t.count("\nRow ")+1   # nº de linhas do lote, contado do texto
    out["A2"] = lot((cr(n["A2"]), n["A2"]), "A2", False); out["B1"] = lot((cr(n["B1"]), n["B1"]), "B1", False)
    out["B2"] = lot((cr(n["B2"]), n["B2"]), "B2", False)
    if "C" in n: out["C"] = lot((cr(n["C"]), n["C"]), "C", False)
    if "A1B" in n: out["A1B"] = lot((cr(n["A1B"]), n["A1B"]), "A1B", False)
    if "CH" in n: out["CH"] = lot((3, n["CH"]), "CH", False)
    if "CL" in n: out["CL"] = RULES.format(N=4, PAL=P, NAME=N, L="CL") + "\n" + n["CLINTRO"] + PIXEL + LOCKS + "\nROWS:\n" + n["CL"] + "\n"
    if "U" in n: out["U"] = lot((3, n["U"]), "U", False)
    out["D"] = PIXEL + "\n" + DBLOCK.format(PAL=P, NAME=N) + n["D"] + "\n"
    out.update(n.get("DR", {}))   # peças grandes do dragão (1 imagem por peça, texto pronto)
    return {a: _colors(n, t) for a, t in out.items()}
def one_row(k, lote, idx):
    """Prompt de UMA linha de um lote (regra do dono 25/11/2026: gerar linha a linha, a anterior serve de ref da próxima)."""
    t = build(k)[lote]
    rows = [l for l in t.split("\n") if l.startswith("Row ")]
    r = rows[idx - 1]
    head, tail = t.split("\nROWS:\n")
    import re
    n_old = len(rows)
    head = head.replace(f"EXACTLY {n_old} rows", "EXACTLY 1 row").replace(f"The image has {n_old} rows, not more.", "The image has 1 row, not more.")
    head = head.replace(f'LOTE {lote}"', f'LOTE {lote} L{idx}"')
    return head + "\nROWS:\n" + re.sub(r"^Row \d+:", "Row 1:", r) + "\n"
if __name__ == "__main__" and len(sys.argv) == 4:
    print(one_row(sys.argv[1], sys.argv[2], int(sys.argv[3]))); sys.exit()
if __name__ == "__main__":
    k = sys.argv[1]; P = build(k)
    head = (f"# {k.title()} — lotes completos (gerado por tools/sprites/gen_prompts_lotes.py)\n\nOrdem e anexos: **A1** ← `docs/refs/elenco_ref.png` → **A2** ← A1 → **B1** ← A2 → **B2** ← B1 → **C** ← B2 → **D** ← qualquer sheet (só paleta). Salvar em `tools/sprites/src/{k}/`.\n\n")
    open(os.path.join(DOCS, f"prompts-{k}.md"), "w").write(head + "".join(f"## LOTE {a}\n```\n{t}```\n\n" for a, t in P.items()))
    d = os.environ.get("OUT")
    if d:
        os.makedirs(d, exist_ok=True)
        for a, t in P.items(): open(f"{d}/{k}_{a}.txt", "w").write(t)
