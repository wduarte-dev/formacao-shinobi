"""Apaga legendas que a IA escreveu dentro das células (texto branco + faixa escura) na faixa de cima de cada linha.
Uso: python3 clean_labels.py <pasta_src_ninja> <saida> arq1.png:linhas arq2.png:linhas ...
Ex.: python3 clean_labels.py src/poko src/poko/clean B1.png:3 B2.png:3 C.png:4"""
import sys, os
import numpy as np
from PIL import Image
src, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
for spec in sys.argv[3:]:
    f, rows = spec.split(':'); rows = int(rows)
    a = np.array(Image.open(os.path.join(src, f)).convert('RGB')).astype(int)
    H = a.shape[0]; bh = H / rows; g = a.copy()
    r_, g_, b_ = a[..., 0], a[..., 1], a[..., 2]
    white = (np.minimum(np.minimum(r_, g_), b_) >= 215)
    dark_green = (g_ >= r_) & (g_ >= b_) & (g_ < 120)
    for i in range(rows):
        y0, y1 = int(i * bh), int(i * bh + bh * .13)
        m = (white | dark_green)[y0:y1]
        sub = g[y0:y1]; sub[m] = (0, 255, 0)
    Image.fromarray(g.astype('uint8')).save(os.path.join(out, f)); print('limpo', f)
