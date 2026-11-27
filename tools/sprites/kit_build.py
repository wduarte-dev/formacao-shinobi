#!/usr/bin/env python3
"""Kit de efeitos reutilizáveis -> spr/kit_fx.webp (anel de choque, setas de buff, estrelas tontas, poeira) e spr/kit_brilho.webp
(faísca radial, anel, partículas, brilho de 4 pontas): fundo verde removido; 6 colunas x 4 linhas de células 256. O jogo tinge (js/kit.js)."""
import os
import numpy as np
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
def key(path):
    a = np.array(Image.open(path).convert('RGB')).astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    d = g - np.maximum(r, b)
    return np.dstack([r, np.where((d > 12) & (d <= 45), np.maximum(r, b), g), b, np.where(d > 45, 0, 255)]).astype(np.uint8)
for src, dst in (('kit_teste.png', 'kit_fx.webp'), ('kit1_brilhos.png', 'kit_brilho.webp'), ('kitB_status.png', 'kit_status.webp')):
    Image.fromarray(key(os.path.join(R, 'sprites_usados/kit_efeitos', src)), 'RGBA').save(os.path.join(R, 'spr', dst), lossless=True, quality=100, method=6); print(dst)
