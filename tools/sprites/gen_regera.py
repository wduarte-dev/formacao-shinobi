#!/usr/bin/env python3
"""Prompts de REGERAÇÃO de anims com defeito (revisão de 22/11/2026, docs/revisao-sprites.md no repo de contexto).
Uso: python3 tools/sprites/gen_regera.py   -> escreve regera_<nome>_prompt.txt em ../formacao-shinobi-ctx/docs/refs (ou docs/refs).
A ref (idle 4x em fundo verde) de cada ninja vai anexada: regera_refs() gera os PNG a partir de spr/."""
import os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from gen_prompts_lotes import RULES, PROP
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CTX = os.path.join(R, '..', 'formacao-shinobi-ctx')
OUT = os.path.join(CTX if os.path.isdir(CTX) else R, 'docs', 'refs')
TRUTH = ("Attached image is the ABSOLUTE source of truth for the character ({N}): copy exactly {LOOK}, face, proportions and pixel scale. "
         "Do NOT redesign or recolor. COLOR LOCK: {LOCK} The character is IDENTICAL in every frame, same colors in every frame.\n")

J = {
 'kaen': dict(N='KAEN', pal='deep red, orange, amber, pale yellow, dark ember brown',
   look='the messy spiky deep-red hair, long red scarf, black sleeveless tunic, dark red sash, gray forearm wraps, dark baggy pants, red leg wraps, dark boots, katana in a black sheath on the back (hilt over the right shoulder)',
   lock='the hair is DEEP SATURATED RED (never orange-brown), the tunic and pants are BLACK / very dark gray (never brown), the scarf and sash dark red.'),
 'iwao': dict(N='IWAO', pal='brown, tan, gray, dark stone, pale dust',
   look='the headband, spiky brown hair, face with scar, stone shoulder armor and stone gauntlets, dark olive-gray outfit, tan sash, wraps',
   lock='skin is TAN / olive (never pink or salmon), the outfit is DARK OLIVE-GRAY (never reddish brown), gauntlets and armor gray stone.'),
 'yugami': dict(N='YUGAMI', pal='deep navy blue, gold, white, pale cream',
   look='the navy hood pulled UP over the head (no hair visible), deep navy cloth mask over the lower face, dark navy tunic with gold trim, wide dark sash, dark gloves, short navy cloak with jagged hem, the slightly glitched look and the two small gold floating cubes',
   lock='THE HOOD STAYS UP AND THE MASK STAYS ON IN EVERY FRAME: no hair visible, no bare head, the face is only the eyes between hood and mask.'),
 'raiden': dict(N='RAIDEN', pal='pale yellow, gold, white, navy',
   look='the spiky silver-gray hair with a yellow streak, dark navy sleeveless gi with gold trim, gold sash, dark forearm wraps, dark pants and boots, and the lightning katana with a glowing pale-yellow blade',
   lock='silver hair with yellow streak, navy gi, gold sash. THE KATANA STAYS IN HIS HAND IN EVERY SINGLE FRAME, including the last frames of each row (never a bare-handed pose).'),
}

def sheet(k, label, rows, rtxt):
    j = J[k]
    return (RULES.format(N=rows, PAL=j['pal'], NAME=j['N'], L=label) + "\n"
            + TRUTH.format(N=j['N'].title(), LOOK=j['look'], LOCK=j['lock']) + f"Proportions: {PROP}.\n\nROWS:\n" + rtxt + "\n")

P = {
 'kaen_E': sheet('kaen', 'E (REGERA)', 3,
"""Row 1: PURSUIT PART 1, LEAP: 8 frames: crouches, jumps straight up with great power, rises very high, flips and tumbles at the top of the jump, scarf trailing, body curled, ready to dive (full 8 columns). Show the height by the pose only, no ground.
Row 2: PURSUIT PART 2, METEOR DIVE: 8 frames: from the top he straightens into a diagonal dive, one leg extended forward in a FLYING KICK with the foot and shin wrapped in fire, falls fast and steeper each frame, the last 3 frames show the kick landing on an invisible target at ground level with a small flame burst at the foot (full 8 columns). Both feet end near the ground line.
Row 3: PURSUIT PART 3, LANDING: 6 frames: after the kick he lands in a deep crouch with one hand on the ground, small embers around the foot, holds, slowly rises and returns to a relaxed standing pose (cells 7 to 8 EMPTY).
Do not draw the enemy. Do not draw a ground line or shadow."""),
 'kaen_forte': sheet('kaen', 'FORTE (REGERA)', 1,
"""Row 1: STRONG ATTACK "Corte Pesado", 7 frames: frame 1 he reaches over his shoulder and DRAWS the katana from the sheath on his back, frames 2-3 he crouches and charges with the katana already in his hand held low, frame 4 leaps forward lifting the katana, frame 5 brings the katana down in a heavy overhead slash with a thin flame arc along the blade, frame 6 holds the strike, frame 7 recovers still holding the katana. THE KATANA IS VISIBLE IN HIS HAND IN EVERY FRAME FROM FRAME 2 ON (cell 8 EMPTY)."""),
 'iwao_forte': sheet('iwao', 'FORTE (REGERA)', 1,
"""Row 1: STRONG ATTACK "Punho de Pedra", 7 frames: he plants his feet, pulls the right stone gauntlet back with a heavy twist of the torso, winds up, drives a huge straight punch forward with all his weight (a SMALL burst of pebbles at the fist), holds the hit, recovers, returns to stance. Only Iwao, only stone and dust, nothing else in the cell. Same skin tone and outfit colors as the attached image in every frame (cell 8 EMPTY)."""),
 'yugami_chase': sheet('yugami', 'CHASE (REGERA)', 1,
"""Row 1: CHASE ATTACK "Passo Dimensional", 8 frames: HOODED AND MASKED THE WHOLE TIME. He blinks behind the target (a thin gold crack opens), delivers a quick two-hit strike from the new position, crack snaps shut. The navy hood stays pulled up over his head and the cloth mask stays over his face in all 8 frames, no hair visible (full 8 columns)."""),
 'raiden_AF': sheet('raiden', 'ATAQUE+FORTE (REGERA)', 2,
"""Row 1: BASIC ATTACK "Combo de Lamina", 8 frames: a fast two-slash combo with the lightning katana (pale-yellow blade, thin lightning lines near the blade only): slash 1, slash 2, a spinning follow-through, then he returns to the fighting stance STILL HOLDING THE KATANA in his hand in the last 3 frames (full 8 columns).
Row 2: STRONG ATTACK "Corte Trovao", 7 frames: crouches, dashes forward in a low lunge with the katana held back, a big upward-left slash with a bright pale-yellow arc, follow-through, recovers into a low kneeling stance STILL HOLDING THE KATANA in his hand (cell 8 EMPTY)."""),
}

def regera_refs():
    sys.path.insert(0, os.path.join(R, 'tools'))
    from PIL import Image
    src = open(os.path.join(R, 'js/sprites.js'), encoding='utf8').read()
    for nid in ('kaen', 'raiden', 'yugami', 'iwao'):
        m = re.search(r'\b' + nid + r':\{hd:.*?a:\{(.*?)\}\}', src); row = int(re.search(r'idle:\[(\d+),', m.group(1)).group(1))
        im = Image.open(os.path.join(R, 'spr', nid + '_atlas.png')).convert('RGBA').crop((0, row * 160, 192, row * 160 + 160))
        bg = Image.new('RGBA', im.size, (0, 255, 0, 255)); bg.alpha_composite(im)
        bg.resize((768, 640), Image.NEAREST).convert('RGB').save(os.path.join(OUT, f'{nid}_ref_regera.png'))

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for n, t in P.items(): open(os.path.join(OUT, f'regera_{n}_prompt.txt'), 'w').write(t)
    regera_refs(); print('ok ->', OUT, sorted(os.listdir(OUT))[-12:])
