#!/usr/bin/env python3
"""Integra no atlas do Kaen TODAS as animações regeneradas que não são golpes: idle, walk/dash, pulo (hop), entrada,
jutsu, Chute Meteoro (rise/meteor/landing) e o lote 'outros' (guard, selos, voo, caído, defeat, victory).
Ordem: python3 tools/sprites/kaen_lote.py  &&  python3 tools/sprites/kaen_integra.py
Os golpes (attack/strong) vêm de kaen_golpes.py e ficam como estão. Imprime o trecho de V2 pra js/sprites.js."""
import json
from pathlib import Path
from PIL import Image

from atlas_registry import AX, AY, CH, CW
from kaen_lote import OUT, R

ROOT = Path(R)
COLS = 12
ROWS = 33          # linhas 0-27 existentes (golpes nas 21-27) + 28-32 novas
S = 108 / 203      # escala comum dos lotes que vieram na mesma escala (golpes, idle, jutsu, outros...)
STANCE = 117       # altura da pose de luta/em pé em px (idle: 220 nativo x S)
FOOT = 'g'         # chão fixo (b do primeiro quadro); 'f' = chão por quadro
# nome do atlas: (lote, poses, linha, fps, loop, pingpong, escala|None, chão, centrar_largas)
SPEC = {
    'idle':      ('idle', range(50), 0, 20, 1, 0, S, 'g'),
    'hop':       ('pulo', range(3), 4, 16, 0, 0, 'ref0', 'g'),
    'rise':      ('meteoro', range(0, 6), 6, 12, 0, 0, S, 'f'),
    'meteor':    ('meteoro', range(6, 10), 9, 12, 0, 0, S, 'f'),
    'landing':   ('meteoro', range(12, 20), 32, 12, 0, 0, S, 'f'),
    'walk':      ('walk', range(25), 17, 10, 1, 0, S, 'g'),
    'entrada':   ('entrada', range(6), 20, 10, 0, 0, 'ref5', 'm'),
    'jutsu':     ('jutsu', range(40), 28, 24, 0, 0, S, 'g'),
    'guard':     ('outros', [0], 5, 8, 0, 0, S, 'o'),
    'seals':     ('outros', [1], 8, 12, 0, 0, S, 'o'),
    'launched':  ('outros', [2, 3], 15, 10, 0, 0, S, 'o'),
    'knockback': ('outros', [2, 3], 14, 10, 0, 0, S, 'o'),
    'knockdown': ('outros', [4, 5], 16, 8, 0, 0, S, 'o'),
    'defeat':    ('outros', range(6, 11), 13, 8, 0, 0, S, 'o'),
    'victory':   ('outros', range(11, 16), 12, 8, 1, 1, S, 'o'),
}
CLEAR_ROWS = [7, 10, 11, 0, 1, 2, 3, 4, 6, 9, 17, 18, 19, 20, 28, 29, 30, 31, 32, 5, 8, 12, 13, 14, 15, 16]


def main():
    path = ROOT / 'spr/kaen_atlas.png'
    old = Image.open(path).convert('RGBA')
    atlas = Image.new('RGBA', (COLS * CW, ROWS * CH))
    atlas.paste(old, (0, 0))
    for r in CLEAR_ROWS:
        atlas.paste(Image.new('RGBA', (COLS * CW, CH)), (0, r * CH))
    lotes = {}
    for name, (lote, poses, row, fps, loop, pp, scale, foot) in SPEC.items():
        if lote not in lotes:
            lotes[lote] = (json.loads((Path(OUT) / f'{lote}.json').read_text()), Image.open(Path(OUT) / f'{lote}.png'))
        info, sheet = lotes[lote]
        size, scols = info['cell'], info['cols']
        q = info['quadros']
        poses = list(poses)
        if scale == 'ref0':
            scale = STANCE / (q[0]['b'] - q[0]['t'])
        elif scale == 'ref5':
            scale = .96 * STANCE / (q[5]['b'] - q[5]['t'])
        ground = q[poses[0]]['b'] + 1 if foot == 'g' else None
        if foot == 'm':
            ground = max(g['b'] for g in q) + 1
        if foot == 'o':
            ground = 421
        assert row + (len(poses) - 1) // COLS < ROWS
        for i, p in enumerate(poses):
            g = q[p]
            assert not g['corta'], f'{name}: pose {p} corta'
            x, y = (p % scols) * size, (p // scols) * size
            ax = (g['l'] + g['r']) // 2 if (g['r'] - g['l']) * scale > 110 else size // 2
            gy = g['b'] + 1 if foot == 'f' else ground
            fr = sheet.crop((x, y, x + size, y + size)).transform(
                (CW, CH), Image.Transform.AFFINE, (1 / scale, 0, ax - AX / scale, 0, 1 / scale, gy - AY / scale),
                Image.Resampling.NEAREST)
            l, t, r, b = fr.getbbox()
            assert min(l, t, CW - r, CH - b) >= 1, f'{name}: pose {p} encosta na borda ({l},{t},{r},{b})'
            atlas.paste(fr, ((i % COLS) * CW, (row + i // COLS) * CH))
    atlas.save(path)
    print(f'atlas {atlas.size}  -> V2 H:{ROWS * CH}')
    for name, (lote, poses, row, fps, loop, pp, *_r) in SPEC.items():
        print(f'{name}:[{row},{len(list(poses))},{fps},{loop},{pp}]', end=',')
    print()


if __name__ == '__main__':
    main()
