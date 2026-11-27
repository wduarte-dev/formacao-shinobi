#!/usr/bin/env python3
"""Sheets de efeito do dono (já desenhados NO PLANO do jogo) -> spr/gfx_*.webp (verde removido, 6 colunas x 4 linhas de células 256) e js/gfx-data.js (ponto de chão por linha).
Fontes em sprites_usados/gfx/ (aura = KIT_AURA, impacto = KIT_IMPACTO, destrocos = KIT_DESTROCOS). Rode: python3 tools/sprites/gfx_build.py"""
import json, os
import numpy as np
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = {'aura': 'KIT_AURA.png', 'impacto': 'KIT_IMPACTO.png', 'destrocos': 'KIT_DESTROCOS.png', 'fogo': 'KIT_FOGO_CHAO.png', 'bola': 'KIT_BOLA_DE_FOGO.png'}
def key(path):
    a = np.array(Image.open(path).convert('RGB')).astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    d = g - np.maximum(r, b)
    return np.dstack([r, np.where((d > 12) & (d <= 45), np.maximum(r, b), g), b, np.where(d > 45, 0, 255)]).astype(np.uint8)
anch = {}; anchx = {}
for name, f in SRC.items():
    a = key(os.path.join(R, 'sprites_usados/gfx', f)); Image.fromarray(a, 'RGBA').save(os.path.join(R, f'spr/gfx_{name}.webp'), lossless=True, quality=100, method=6)
    rows, cols = [], []
    for r in range(4):
        cy, bot, cx = [], [], []
        for c in range(6):
            m = a[r * 256:(r + 1) * 256, c * 256:(c + 1) * 256, 3] > 0; ys, xs = np.where(m)
            if len(xs) < 40: continue
            w = xs.max() - xs.min() + 1; h = ys.max() - ys.min() + 1; b = ys.max()
            if name == 'bola' and r == 0: cx.append(xs.max() - .22 * w); cy.append((ys.min() + ys.max()) / 2)        # cometa apontando pra direita: âncora na CABEÇA
            elif name == 'bola' and r == 2: cx.append((xs.min() + xs.max()) / 2); cy.append(b - .28 * h)               # bola caindo: cabeça embaixo
            elif name == 'bola': cx.append((xs.min() + xs.max()) / 2); cy.append((ys.min() + ys.max()) / 2)           # divisão e sombra: centro
            else: cx.append(128); cy.append(b - .21 * w)                                                              # ponto de chão = centro da elipse
        rows.append(round(float(np.median(cy)), 1) if cy else 170.0); cols.append(round(float(np.median(cx)), 1) if cx else 128.0)
    anchx[name] = cols
    anch[name] = rows
open(os.path.join(R, 'js/gfx-data.js'), 'w').write('// Gerado por tools/sprites/gfx_build.py: y do PONTO DE CHÃO (centro da elipse no plano) em cada linha das folhas gfx (células 256, x=128)\nconst GFXA=' + json.dumps(anch, separators=(',', ':')) + ';\nconst GFXX=' + json.dumps(anchx, separators=(',', ':')) + ';   // x do ponto (128 = centro; a bola de fogo ancora na cabeça)\n')
print(anch)
