#!/usr/bin/env python3
"""Prompts de REGERAÇÃO de anims com defeito (revisão de 22/11/2026, docs/revisao-sprites.md no repo de contexto).
Uso: python3 tools/sprites/gen_regera.py   -> escreve regera_<nome>_prompt.txt em ../formacao-shinobi-ctx/docs/refs (ou docs/refs).
A ref (idle 4x em fundo verde) de cada ninja vai anexada: regera_refs() gera os PNG a partir de spr/."""
import os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from gen_prompts_lotes import RULES, PROP, NINJAS
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CTX = os.path.join(R, '..', 'formacao-shinobi-ctx')
OUT = os.path.join(CTX if os.path.isdir(CTX) else R, 'docs', 'refs')
TRUTH = ("Attached image is the ABSOLUTE source of truth for the character ({N}): copy exactly {LOOK}, face, proportions and pixel scale. "
         "Do NOT redesign or recolor. COLOR LOCK: {LOCK} The character is IDENTICAL in every frame, same colors in every frame.\n")

J = {
 'kaen': dict(N='KAEN', pal='deep red, orange, amber, pale yellow, dark ember brown',
   look='the messy spiky deep-red hair, long red scarf, black sleeveless tunic, dark red sash, gray forearm wraps, dark baggy pants, red leg wraps, dark boots, katana in a black sheath on the back (hilt over the right shoulder)',
   lock='the hair is DEEP SATURATED RED (never orange-brown), the tunic and pants are BLACK / very dark gray (never brown), the scarf and sash dark red.'),
 'iwao': dict(N='IWAO', prop=PROP + ', bulky strong broad-shouldered build exactly like the attached image', pal='brown, tan, gray, dark stone, pale dust',
   look='the headband, spiky brown hair, face with scar, stone shoulder armor and stone gauntlets, dark olive-gray outfit, tan sash, wraps',
   lock='skin is TAN / olive (never pink or salmon), the outfit is DARK OLIVE-GRAY (never reddish brown), gauntlets and armor gray stone.'),
 'yugami': dict(N='YUGAMI', pal='deep navy blue, gold, white, pale cream',
   look='the navy hood pulled UP over the head (no hair visible), deep navy cloth mask over the lower face, dark navy tunic with gold trim, wide dark sash, dark gloves, short navy cloak with jagged hem, the slightly glitched look and the two small gold floating cubes',
   lock='THE HOOD STAYS UP AND THE MASK STAYS ON IN EVERY FRAME: no hair visible, no bare head, the face is only the eyes between hood and mask.'),
 'raiden': dict(N='RAIDEN', pal='pale yellow, gold, white, navy',
   look='the spiky silver-gray hair with a yellow streak, dark navy sleeveless gi with gold trim, gold sash, dark forearm wraps, dark pants and boots, and the lightning katana with a glowing pale-yellow blade',
   lock='silver hair with yellow streak, navy gi, gold sash. THE KATANA STAYS IN HIS HAND IN EVERY SINGLE FRAME, including the last frames of each row (never a bare-handed pose).'),
 'fuuka': dict(N='FUUKA', pal='silver, pale gray, soft pink, white',
   look='the silver-white hair in a high ponytail with pink streaks, dark maroon-black sleeveless outfit with a pink-red sash and flowing pink ribbons, dark forearm wraps, dark pants and boots, and the two silver ring blades (chakrams)',
   lock='keep the same hair, outfit and ring-blade colors in every frame and keep the SAME body height and scale in every frame.'),
 'mayoi': dict(N='MAYOI', pal=NINJAS['mayoi']['pal'], look=NINJAS['mayoi']['look'],
   lock='she carries exactly ONE paper lantern, held in her hand, in every frame (never a second lantern).'),
 'hiyori': dict(N='HIYORI', pal=NINJAS['hiyori']['pal'], look=NINJAS['hiyori']['look'],
   lock='keep the same body height and scale in every frame (she must not shrink or grow).'),
 'mizuha': dict(N='MIZUHA', pal='azure blue, bright sky blue, white, deep navy, pale blue',
   look='the long azure-blue high ponytail and flowing blue scarf, dark navy sleeveless top with a white wrap belt and a blue front panel, gray forearm wraps, dark navy pants, kunai pouches at the hip',
   lock='azure blue (never turquoise, aqua or teal), same outfit in every frame.'),
 'poko': dict(N='POKO', prop='the same tall slim insectoid mantis proportions and the same pixel scale as the attached image, NOT chibi, NOT cute', pal='yellow, orange, amber, cream, pale gold',
   look='the orange-brown praying-mantis body with the large pale-yellow translucent wings, long forelegs and slim legs, same art style and pixel scale',
   lock='NO text, NO letters, NO words anywhere in any cell (the only text allowed is the label strip).'),
}

def sheet(k, label, rows, rtxt):
    j = J[k]
    return (RULES.format(N=rows, PAL=j['pal'], NAME=j['N'], L=label) + "\n"
            + TRUTH.format(N=j['N'].title(), LOOK=j['look'], LOCK=j['lock']) + f"Proportions: {j.get('prop', PROP)}.\n\nROWS:\n" + rtxt + "\n")

P = {
 'kaen_E': sheet('kaen', 'E (REGERA)', 3,
"""Row 1: PURSUIT PART 1, LEAP: 8 frames: crouches, jumps straight up with great power, rises very high, flips and tumbles at the top of the jump, scarf trailing, body curled, ready to dive (full 8 columns). Show the height by the pose only, no ground.
Row 2: PURSUIT PART 2, METEOR DIVE: 8 frames: from the top he straightens into a diagonal dive, one leg extended forward in a FLYING KICK with the foot and shin wrapped in fire, falls fast and steeper each frame, the last 3 frames show the kick landing on an invisible target at ground level with a small flame burst at the foot (full 8 columns). Both feet end near the ground line.
Row 3: PURSUIT PART 3, LANDING: 6 frames: after the kick he lands in a deep crouch with one hand on the ground, small embers around the foot, holds, slowly rises and returns to a relaxed standing pose (cells 7 to 8 EMPTY).
Do not draw the enemy. Do not draw a ground line or shadow."""),
 'kaen_F': sheet('kaen', 'FORTE+SELOS (REGERA)', 2,
"""Row 1: STRONG ATTACK "Corte Pesado", 7 frames: frame 1 he reaches over his shoulder and DRAWS the katana from the sheath on his back, frames 2-3 he crouches and charges with the katana already in his hand held low, frame 4 leaps forward lifting the katana, frame 5 brings the katana down in a heavy overhead slash with a thin flame arc along the blade, frame 6 holds the strike, frame 7 recovers still holding the katana. THE KATANA IS VISIBLE IN HIS HAND IN EVERY FRAME FROM FRAME 2 ON (cell 8 EMPTY).
Row 2: HAND SEALS "Selos de Fogo", 8 frames, EVERY frame visibly different: frame 1 hands together at the chest, frame 2 a tiny spark between the fingers, frame 3 he rubs the palms and the spark grows, frame 4 the scarf starts to lift, frame 5 a small ring of embers forms around the hands, frame 6 the ring widens around the body, frame 7 eyes open with a fierce look and the embers rise, frame 8 he breathes out ready to cast. Only small embers near the body (full 8 columns)."""),
 'iwao_4': sheet('iwao', 'ATAQUE+FORTE+JUTSU+CHASE (REGERA)', 4,
"""Row 1: BASIC ATTACK, 6 frames: frame 1 PREPARATION (pulls the right stone gauntlet back with a twist of the torso, NOT already punching), frame 2 wind-up, frame 3 straight right punch, frame 4 left punch right after, frame 5 holds the hit, frame 6 recovers to stance. Small pebbles only (cells 7 to 8 EMPTY).
Row 2: STRONG ATTACK "Punho de Pedra", 7 frames: he plants his feet, pulls the right stone gauntlet back with a heavy twist of the torso, winds up, drives a huge straight punch forward with all his weight (a SMALL burst of pebbles at the fist), holds the hit, recovers, returns to stance. Only Iwao, only stone and dust, nothing else in the cell. Same skin tone and outfit colors as the attached image in every frame (cell 8 EMPTY).
Row 3: JUTSU "Muralha de Pedra", 4 frames: frame 1 he slams both gauntlets on the ground and a mound of rubble rises in front of him (the rubble has rounded edges and stays fully INSIDE the cell, never cut by the cell edge), frame 2 a huge hooded stone golem with glowing yellow eyes rises behind him, frame 3 the golem holds a big stone slab like a shield in front of the team, frame 4 the golem is gone and he returns to stance with a small mound of rubble (cells 5 to 8 EMPTY).
Row 4: CHASE "Esmagar", 8 frames: the same hooded stone golem appears behind him and mirrors his moves: frame 1 golem behind him raising both fists, frame 2 fists at the top, frame 3 starts the slam, frame 4 mid slam, frame 5 impact with a rubble burst, frame 6 dust and rubble settle, frame 7 golem STILL VISIBLE behind him (it must NOT disappear), frame 8 golem fades into stone dust and Iwao stands. The golem fists stay fully INSIDE the cell and never touch the cell edge (full 8 columns)."""),
 'yugami_chase': sheet('yugami', 'CHASE (REGERA)', 1,
"""Row 1: CHASE ATTACK "Passo Dimensional", 8 frames: HOODED AND MASKED THE WHOLE TIME. He blinks behind the target (a thin gold crack opens), delivers a quick two-hit strike from the new position, crack snaps shut. The navy hood stays pulled up over his head and the cloth mask stays over his face in all 8 frames, no hair visible (full 8 columns)."""),
 'raiden_AF': sheet('raiden', 'ATAQUE+FORTE (REGERA)', 2,
"""Row 1: BASIC ATTACK "Combo de Lamina", 8 frames: a fast two-slash combo with the lightning katana (pale-yellow blade, thin lightning lines near the blade only): slash 1, slash 2, a spinning follow-through, then he returns to the fighting stance STILL HOLDING THE KATANA in his hand in the last 3 frames (full 8 columns).
Row 2: STRONG ATTACK "Corte Trovao", 7 frames: crouches, dashes forward in a low lunge with the katana held back, a big upward-left slash with a bright pale-yellow arc, follow-through, recovers into a low kneeling stance STILL HOLDING THE KATANA in his hand (cell 8 EMPTY)."""),
 'kaen_selos': sheet('kaen', 'SELOS (REGERA)', 1,
"""Row 1: HAND SEALS "Selos de Fogo", 8 frames, EVERY frame visibly different: frame 1 hands together at the chest, frame 2 a tiny spark between the fingers, frame 3 he rubs the palms and the spark grows, frame 4 the scarf starts to lift, frame 5 a small ring of embers forms around the hands, frame 6 the ring widens around the body, frame 7 eyes open with a fierce look and the embers rise, frame 8 he breathes out ready to cast. Only small embers near the body (full 8 columns)."""),
 'iwao_3': sheet('iwao', 'ATAQUE+JUTSU+CHASE (REGERA)', 3,
"""Row 1: BASIC ATTACK, 6 frames: frame 1 PREPARATION (pulls the right stone gauntlet back with a twist of the torso, NOT already punching), frame 2 wind-up, frame 3 straight right punch, frame 4 left punch right after, frame 5 holds the hit, frame 6 recovers to stance. Small pebbles only (cells 7 to 8 EMPTY).
Row 2: JUTSU "Muralha de Pedra", 4 frames: frame 1 he slams both gauntlets on the ground and a mound of rubble rises in front of him (the rubble has rounded edges and stays fully INSIDE the cell, never cut by the cell edge), frame 2 a huge hooded stone golem with glowing yellow eyes rises behind him, frame 3 the golem holds a big stone slab like a shield in front of the team, frame 4 the golem is gone and he returns to stance with a small mound of rubble (cells 5 to 8 EMPTY).
Row 3: CHASE "Esmagar", 8 frames: the same hooded stone golem appears behind him and mirrors his moves: frame 1 golem behind him raising both fists, frame 2 fists at the top, frame 3 starts the slam, frame 4 mid slam, frame 5 impact with a rubble burst, frame 6 dust and rubble settle, frame 7 golem STILL VISIBLE behind him (it must NOT disappear), frame 8 golem fades into stone dust and Iwao stands. The golem fists stay fully INSIDE the cell and never touch the cell edge (full 8 columns)."""),
 'fuuka': sheet('fuuka', 'SELOS+JUTSU+CHASE (REGERA)', 3,
"""Row 1: HAND SEALS, 6 frames, EVERY frame visibly different: frame 1 hands together, frame 2 the rings start spinning slowly, frame 3 thin wind lines rise, frame 4 hair and ribbons lift, frame 5 the rings glow pale silver, frame 6 she is ready to cast (cells 7 to 8 EMPTY).
Row 2: RELEASE JUTSU "Tufao Cortante", 8 frames: she throws the rings forward and sweeps both arms in wide cuts, thin silver wind arcs near the body only. Her body stays in the SAME spot of the cell the whole time (no sliding sideways), and frame 8 returns to the same stance in the same position (full 8 columns).
Row 3: CHASE "Redemoinho", 8 frames: crouch, leap, a spinning kick with a thin wind ring around the leg, lands crouched, rises. Her body is the SAME height and scale as in the other rows (do not draw her bigger) (full 8 columns)."""),
 'poko': sheet('poko', 'SELOS+JUTSU (REGERA)', 2,
"""Row 1: HAND SEALS, 7 frames: it raises the forelegs, rubs them together like a cricket, tiny yellow sparks between the forelegs grow, the wings tremble, ends ready to cast. NO text anywhere (cell 8 EMPTY).
Row 2: RELEASE JUTSU "Zumbido Ensurdecedor", 8 frames: it spreads the wings wide and vibrates them (blurred wings), small thin yellow sound arcs only very close to the head, the body shakes with the buzz, then it relaxes. Do NOT draw big concentric rings or large sound waves (they are added later by the game). NO text anywhere (full 8 columns)."""),
 'mayoi': sheet('mayoi', 'FORTE+DANO (REGERA)', 2,
"""Row 1: STRONG ATTACK "Onda de Nevoa", 7 frames: she stays in place, raises the cane, plants it on the ground, then sweeps it forward pushing a low wave of mist ahead of her (only a SMALL thin mist line near the cane, fully inside the cell and never touching the cell edge), follow-through, recovers. She holds exactly ONE lantern in every frame (cell 8 EMPTY).
Row 2: HURT, 3 frames: hit from the front, head snaps back, hair swings, body recoils, steps back and recovers. No stray pixels, dots or specks anywhere outside her body (cells 4 to 8 EMPTY)."""),
 'hiyori': sheet('hiyori', 'ATAQUE+JUTSU (REGERA)', 2,
"""Row 1: BASIC ATTACK "Combo de Lamina de Gelo", 8 frames: a three-hit melee combo, each hit with a SMALL thin ice blade formed along her forearm: slash 1, slash 2, spinning slash 3, follow-through, returns to stance. Every ice trail stays fully INSIDE the cell and never touches or is cut by the cell edge (full 8 columns).
Row 2: RELEASE JUTSU "Prisao de Gelo", 6 frames: she thrusts both palms forward, a thin line of frost shoots out, she holds the pose with arms extended, follow-through, arms lowered. Only SMALL frost lines near the body. Her body keeps the SAME scale in all 6 frames (she must not shrink) (cells 7 to 8 EMPTY)."""),
 'mizuha': sheet('mizuha', 'SELOS+JUTSU (REGERA)', 2,
"""Row 1: HAND SEALS, 8 frames, EVERY frame visibly different: frame 1 hands together, frame 2 a thin water arc forms near the hands, frame 3 the arc grows, frame 4 droplets orbit the hands, frame 5 the ponytail and scarf lift, frame 6 a ring of small water drops circles the body, frame 7 she opens her eyes, frame 8 ready to cast (full 8 columns).
Row 2: RELEASE JUTSU, 7 frames: she thrusts both palms forward and a thin jet of water streams out, the jet must visibly change shape and flow in every frame (growing, rippling, splashing with droplets), ends with the palms lowered. Only SMALL water near the body and hands (cell 8 EMPTY)."""),
}

def regera_refs():
    sys.path.insert(0, os.path.join(R, 'tools'))
    from PIL import Image
    src = open(os.path.join(R, 'js/sprites.js'), encoding='utf8').read()
    for nid in ('kaen', 'raiden', 'yugami', 'iwao', 'fuuka', 'poko', 'mayoi', 'hiyori', 'mizuha'):
        m = re.search(r'\b' + nid + r':\{hd:.*?a:\{(.*?)\}\}', src); row = int(re.search(r'idle:\[(\d+),', m.group(1)).group(1))
        im = Image.open(os.path.join(R, 'spr', nid + '_atlas.png')).convert('RGBA').crop((0, row * 160, 192, row * 160 + 160))
        bg = Image.new('RGBA', im.size, (0, 255, 0, 255)); bg.alpha_composite(im)
        bg.resize((768, 640), Image.NEAREST).convert('RGB').save(os.path.join(OUT, f'{nid}_ref_regera.png'))

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for n, t in P.items(): open(os.path.join(OUT, f'regera_{n}_prompt.txt'), 'w').write(t)
    regera_refs(); print('ok ->', OUT, sorted(os.listdir(OUT))[-12:])
