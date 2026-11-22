#!/usr/bin/env python3
"""Gera docs/prompts-<ninja>.md com os lotes A1..D. Uso: python3 tools/sprites/gen_prompts_lotes.py <ninja>
Ninja novo = nova entrada em NINJAS. Dinâmica dos lotes: docs/prompts-sprites.md."""
import sys, os
RULES = """STRICT RULES (highest priority, never break):
1. LAYOUT: the image has EXACTLY {N} rows and EXACTLY 8 columns, a fixed grid of identical cells, LANDSCAPE image. Do NOT add, remove, merge or skip rows. The image has {N} rows, not more.
2. ONE animation per row. A row contains ONLY its own animation. NEVER put a frame of another animation in a leftover cell of a row.
3. Use EXACTLY the number of frames listed for each row, starting at column 1. The remaining cells of that row stay EMPTY flat green (no sprite, no fragment, no smear).
4. Every frame is fully opaque and complete. NO ghost, translucent, half-faded, duplicated or cropped frames. Nothing touches or crosses the cell edge.
5. The character is IDENTICAL in every frame: same design, colors, proportions, pixel scale and outline. Faces RIGHT (side or three-quarter view). Pose and position inside the cell are FREE: the body may lean, slide, float, jump or shift anywhere in the cell, as long as it stays fully inside it.
6. No green on the character, outfit, outline or glow (the background is green). Nothing turquoise, aqua, teal or greenish.
7. No border, no grid lines, no drop shadow, no ground, no extra text except the label.
8. No big effects. Only small glows or thin element lines near the body. Effect colors: {PAL}, NEVER a color outside the palette.
BACKGROUND: solid flat pure green #00FF00 everywhere, no checkerboard, no gradient. The green must be perfectly flat and also fill every gap between the legs, arms and body (no gray or dark patches anywhere around the character).
LABEL: top-left corner only, small plain white pixel text "{NAME} - LOTE {L}" on a thin dark strip above the grid.
"""
REF = ("Attached image shows SEVERAL different characters of the same game (the style roster): it is a STYLE and PROPORTION reference ONLY. Copy ONLY the shared pixel-art style, outline weight, pixel scale and body proportions (realistic athletic young adults, about 6.5 heads tall, SMALL head, long legs, serious grounded look). Do NOT copy any of their faces, hair, clothes or colors. Do NOT redraw any of them: the new character must look clearly different from all of them.\n")
PROP = "realistic athletic young-adult proportions, about 6.5 heads tall, SMALL head, long legs, serious grounded look like the attached reference, NOT chibi, NOT cute, NOT big-headed"
TRUTH = "Attached image is the ABSOLUTE source of truth for the character ({NAME}): copy exactly {LOOK}, face, realistic athletic proportions (about 6.5 heads tall, SMALL head, long legs) and pixel scale. Do NOT redesign or recolor. Do NOT make the head bigger.\n"
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
}
def build(k):
    n = NINJAS[k]; P = n["pal"]; N = n["name"]
    def lot(rows, L, ref):
        return RULES.format(N=rows[0], PAL=P, NAME=N, L=L) + "\n" + (REF if ref else TRUTH.format(NAME=N.title(), LOOK=n["look"])) + "\nROWS:\n" + rows[1] + "\n"
    out = {}
    out["A1"] = RULES.format(N=4, PAL=P, NAME=N, L="A1") + "\n" + REF + f"\nCHARACTER (original ninja, pixel art, dark 1px outline, max 16 colors, {PROP}): {n['char']}\n\nROWS:\n{n['A1']}\n"
    out["A2"] = lot((4, n["A2"]), "A2", False); out["B1"] = lot((3, n["B1"]), "B1", False)
    out["B2"] = lot((3, n["B2"]), "B2", False); out["C"] = lot((4, n["C"]), "C", False)
    out["D"] = DBLOCK.format(PAL=P, NAME=N) + n["D"] + "\n"
    return out
if __name__ == "__main__":
    k = sys.argv[1]; P = build(k)
    head = (f"# {k.title()} — lotes completos (gerado por tools/sprites/gen_prompts_lotes.py)\n\nOrdem e anexos: **A1** ← `docs/refs/elenco_ref.png` → **A2** ← A1 → **B1** ← A2 → **B2** ← B1 → **C** ← B2 → **D** ← qualquer sheet (só paleta). Salvar em `tools/sprites/src/{k}/`.\n\n")
    open(f"docs/prompts-{k}.md", "w").write(head + "".join(f"## LOTE {a}\n```\n{t}```\n\n" for a, t in P.items()))
    d = os.environ.get("OUT")
    if d:
        os.makedirs(d, exist_ok=True)
        for a, t in P.items(): open(f"{d}/{k}_{a}.txt", "w").write(t)
