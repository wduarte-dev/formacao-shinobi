#!/usr/bin/env python3
"""Sheets de efeito do dono (já desenhados NO PLANO do jogo) -> spr/gfx_*.webp (verde removido, 6 colunas x 4 linhas de células 256) e js/gfx-data.js (ponto de chão por linha).
Fontes em sprites_usados/gfx/ (aura = KIT_AURA, impacto = KIT_IMPACTO, destrocos = KIT_DESTROCOS). Rode: python3 tools/sprites/gfx_build.py"""
import json, os
import numpy as np
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = {'aura': 'KIT_AURA.png', 'impacto': 'KIT_IMPACTO.png', 'destrocos': 'KIT_DESTROCOS.png'}
def key(path):
    a = np.array(Image.open(path).convert('RGB')).astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    d = g - np.maximum(r, b)
    return np.dstack([r, np.where((d > 12) & (d <= 45), np.maximum(r, b), g), b, np.where(d > 45, 0, 255)]).astype(np.uint8)
anch = {}
for name, f in SRC.items():
    a = key(os.path.join(R, 'sprites_usados/gfx', f)); Image.fromarray(a, 'RGBA').save(os.path.join(R, f'spr/gfx_{name}.webp'), lossless=True, quality=100, method=6)
    rows = []
    for r in range(4):
        cy, bot = [], []
        for c in range(6):
            m = a[r * 256:(r + 1) * 256, c * 256:(c + 1) * 256, 3] > 0; ys, xs = np.where(m)
            if len(xs) < 40: continue
            w = xs.max() - xs.min() + 1; b = ys.max(); cy.append(b - .21 * w); bot.append(b)
        rows.append(round(float(np.median(cy)), 1) if cy else 170.0)
    anch[name] = rows
open(os.path.join(R, 'js/gfx-data.js'), 'w').write('// Gerado por tools/sprites/gfx_build.py: y do PONTO DE CHÃO (centro da elipse no plano) em cada linha das folhas gfx (células 256, x=128)\nconst GFXA=' + json.dumps(anch, separators=(',', ':')) + ';\n')
print(anch)
