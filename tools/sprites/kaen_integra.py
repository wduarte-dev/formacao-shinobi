#!/usr/bin/env python3
"""Monta o atlas COMPLETO do Kaen (spr/kaen_atlas.png) e reescreve a linha do Kaen em js/sprites.js (V2): idle, walk/dash, pulo (hop), entrada, jutsu, Chute Meteoro
(rise/meteor/landing), lote 'outros' (guard, selos, voo, caído, defeat, victory). Layout: 16 colunas x 25 linhas = 3072x4000 (cabe no limite de 4096 das GPUs fracas).
attack/strong ficam em branco aqui e são preenchidos pelo kaen_golpes.py (que lê o V2 novo).
Ordem: python3 tools/sprites/kaen_lote.py && python3 tools/sprites/kaen_integra.py && python3 tools/sprites/kaen_golpes.py && python3 tools/sprites/kaen_dragao_build.py"""
import json, math, re
from pathlib import Path
from PIL import Image

from atlas_registry import AX, AY, CH, CW
from kaen_lote import OUT, R

ROOT = Path(R)
COLS = 16
S = 108 / 203      # escala comum (corpo 108 px sobre os 203 do quadro 0 do ataque)
STANCE = 117       # altura da pose de luta em px (idle: 220 nativo x S)
# anim do atlas: (lote, poses, fps, loop, pingpong, escala|'ref0'|'ref5', chão)  chão: g=1º quadro, m=maior base, f=por quadro, o=fixo do lote outros
SRC = {
    'idle':      ('idle', range(48), 20, 1, 0, S, 'g'),
    'walk':      ('walk', range(25), 10, 1, 0, S, 'g'),
    'hop':       ('pulo', range(3), 16, 0, 0, 'ref0', 'g'),
    'entrada':   ('entrada', range(6), 8, 0, 0, 'ref5', 'm'),
    'guard':     ('outros', [0], 8, 0, 0, S, 'o'),
    'seals':     ('outros', [1], 12, 0, 0, S, 'o'),
    'jutsu':     ('jutsu', range(40), 24, 0, 0, S, 'g'),
    'rise':      ('meteoro', range(0, 6), 12, 0, 0, S, 'f'),
    'meteor':    ('meteoro', range(6, 10), 12, 0, 0, S, 'f'),
    'landing':   ('meteoro', range(12, 20), 12, 0, 0, S, 'f'),
    'victory':   ('outros', range(11, 16), 8, 1, 1, S, 'o'),
    'defeat':    ('outros', range(6, 11), 8, 0, 0, S, 'o'),
    'knockback': ('outros', [2, 3], 10, 0, 0, S, 'o'),
    'launched':  ('outros', [2, 3], 10, 0, 0, S, 'o'),
    'knockdown': ('outros', [4, 5], 8, 0, 0, S, 'o'),
}
GOLPES = {'attack': (32, 40), 'strong': (40, 36)}   # quadros, fps (preenchidos por kaen_golpes.py)
ALIAS_ROW = {'knockback': 'launched'}               # mesmas poses, mesma linha


def layout():
    rows, r = {}, 0
    for name in [*SRC, *GOLPES]:
        if name in ALIAS_ROW: continue
        rows[name] = r
        n = len(list(SRC[name][1])) if name in SRC else GOLPES[name][0]
        r += math.ceil(n / COLS)
    for a, b in ALIAS_ROW.items(): rows[a] = rows[b]
    return rows, r


def main():
    rows, nrows = layout()
    atlas = Image.new('RGBA', (COLS * CW, nrows * CH))
    lotes = {}
    for name, (lote, poses, fps, loop, pp, scale, foot) in SRC.items():
        if name in ALIAS_ROW: continue
        if lote not in lotes: lotes[lote] = (json.loads((Path(OUT) / f'{lote}.json').read_text()), Image.open(Path(OUT) / f'{lote}.png'))
        info, sheet = lotes[lote]; size, scols, q = info['cell'], info['cols'], info['quadros']; poses = list(poses)
        if scale == 'ref0': scale = STANCE / (q[0]['b'] - q[0]['t'])
        elif scale == 'ref5': scale = .96 * STANCE / (q[5]['b'] - q[5]['t'])
        ground = {'g': q[poses[0]]['b'] + 1, 'm': max(g['b'] for g in q) + 1, 'o': 421, 'f': None}[foot]
        for i, p in enumerate(poses):
            g = q[p]; assert not g['corta'], f'{name}: pose {p} corta'
            x, y = (p % scols) * size, (p // scols) * size
            ax = (g['l'] + g['r']) // 2 if (g['r'] - g['l']) * scale > 110 else size // 2
            gy = g['b'] + 1 if foot == 'f' else ground
            fr = sheet.crop((x, y, x + size, y + size)).transform((CW, CH), Image.Transform.AFFINE, (1 / scale, 0, ax - AX / scale, 0, 1 / scale, gy - AY / scale), Image.Resampling.NEAREST)
            l, t, r, b = fr.getbbox(); assert min(l, t, CW - r, CH - b) >= 1, f'{name}: pose {p} encosta na borda ({l},{t},{r},{b})'
            atlas.paste(fr, ((i % COLS) * CW, (rows[name] + i // COLS) * CH))
    atlas.save(ROOT / 'spr/kaen_atlas.png')
    n = lambda k: len(list(SRC[k][1]))
    a = {k: f'[{rows[k]},{n(k)},{SRC[k][2]},{SRC[k][3]},{SRC[k][4]}]' for k in SRC}
    a['walk'] = a['walk']; a['dash'] = f'[{rows["walk"]},25,14,1,0]'
    a['attack'] = f'[{rows["attack"]},{GOLPES["attack"][0]},{GOLPES["attack"][1]},0,0]'; a['strong'] = f'[{rows["strong"]},{GOLPES["strong"][0]},{GOLPES["strong"][1]},0,0]'
    a['guard'] = f'[{rows["guard"]},1,8,0,0,[0,0,0,0]]'; a['hurt'] = f'[{rows["guard"]},1,10,0,0,[0,0,0]]'
    a['seals'] = f'[{rows["seals"]},1,12,0,0,[0,0,0,0,0,0,0,0]]'; a['buff'] = f'[{rows["seals"]},1,10,0,0,[0,0,0,0,0]]'
    a['dodge'] = f'[{rows["hop"]},3,16,0,0]'; a['stun'] = f'[{rows["idle"]},48,8,1,0]'; a['chase'] = f'[{rows["rise"]},6,12,0,0]'
    order = ['idle', 'walk', 'dash', 'hop', 'entrada', 'attack', 'strong', 'guard', 'hurt', 'dodge', 'seals', 'jutsu', 'buff', 'stun', 'victory', 'defeat', 'knockback', 'launched', 'knockdown', 'chase', 'rise', 'meteor', 'landing']
    line = f" kaen:{{hd:[95,48],W:{COLS * CW},H:{nrows * CH},a:{{" + ','.join(f'{k}:{a[k]}' for k in order) + '}},\n'
    p = ROOT / 'js/sprites.js'; s = p.read_text(); new = re.sub(r" kaen:\{hd.*?\n", lambda m: line, s, count=1); assert new != s or line in s
    p.write_text(new); print(f'atlas {atlas.size} ({nrows} linhas); V2 do Kaen atualizado')


if __name__ == '__main__':
    main()
