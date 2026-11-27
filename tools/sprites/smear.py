#!/usr/bin/env python3
"""Smear por código em quadros de um sheet (grade de colunas iguais, fundo verde). NUNCA altera o sheet de entrada: grava outro arquivo.
Uso: python3 tools/sprites/smear.py <sheet.png> <saida.png> [--rows 3] [--cols 8] [--frame linha,coluna,tecnica,nivel ...]
  linha/coluna começam em 1. tecnica: skew (inclina o corpo a partir dos pés), bend (curva, mais no topo), multiplos (cópias sólidas atrás).
  nivel: 1, 2 ou 3. Sem --frame usa o padrão do Zigzaggy A1 (SMEAR do prompt, só o dash: q2 e q6).
Tudo é pixel duro (sem suavizar). O quadro novo tem que caber na célula: se as cópias passarem da borda, o conjunto é empurrado pra dentro."""
import sys, argparse
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
PAD = 70
DEFAULT = [(3, 2, 'multiplos', 2), (3, 6, 'multiplos', 2)]   # só o run: idle e walk foram reprovados pelo dono (26/11)

def fg_mask(rgb):
    x = rgb.astype(int); ge = x[..., 1] - np.maximum(x[..., 0], x[..., 2]); m = ndi.binary_opening(ge < 38, iterations=1)
    lab, n = ndi.label(m, structure=np.ones((3, 3)))
    if n:
        ar = ndi.sum(m, lab, range(1, n + 1)); m = np.isin(lab, [i + 1 for i, a in enumerate(ar) if a >= 25])
    return m

def shift_rows(rgb, mk, shifts):
    h, w = mk.shape; o = np.zeros_like(rgb); om = np.zeros_like(mk)
    for y in range(h):
        s = int(shifts[y])
        if s > 0: o[y, s:] = rgb[y, :w - s]; om[y, s:] = mk[y, :w - s]
        elif s < 0: o[y, :w + s] = rgb[y, -s:]; om[y, :w + s] = mk[y, -s:]
        else: o[y] = rgb[y]; om[y] = mk[y]
    return o, om

def layers_for(tec, lv, rgb, mk, cellw):
    ys = np.nonzero(mk.any(1))[0]; feet, h = ys.max(), ys.max() - ys.min() + 1; y = np.arange(mk.shape[0])
    if tec == 'skew':
        k = [0.12, 0.24, 0.38][lv - 1]; return [shift_rows(rgb, mk, np.round(np.clip(k * (feet - y), 0, None)))]
    if tec == 'bend':
        K = [0.10, 0.20, 0.32][lv - 1]; t = np.clip((feet - y) / h, 0, None); return [shift_rows(rgb, mk, np.round(K * h * t ** 2))]
    if tec == 'multiplos':
        xs = np.nonzero(mk.any(0))[0]; step = min(16, ((cellw - 12) - (xs.max() - xs.min() + 1)) // lv)   # espaço que sobra na célula
        if step < 4:
            print('AVISO: o corpo já ocupa a célula toda, múltiplos não cabem; quadro mantido'); return [(rgb, mk)]
        L = []
        for i in range(lv, 0, -1):
            o, om = shift_rows(rgb, mk, np.full(mk.shape[0], -step * i)); L.append(((o * (1 - 0.22 * i)).astype(np.uint8), om))
        return L + [(rgb, mk)]
    raise SystemExit('tecnica desconhecida: ' + tec)

def apply(sheet, rows, cols, specs):
    A = np.asarray(sheet.convert('RGB')).copy(); H, W = A.shape[:2]; cw, rh = W / cols, H / rows
    for (r, c, tec, lv) in specs:
        x0, x1, y0, y1 = int(round((c - 1) * cw)), int(round(c * cw)), int(round((r - 1) * rh)), int(round(r * rh))
        cell = A[y0:y1, x0:x1].copy(); mk = fg_mask(cell)
        gm = np.median(cell[~ndi.binary_dilation(mk, iterations=3)].reshape(-1, 3), axis=0).astype(np.uint8)
        base = cell.copy(); base[ndi.binary_dilation(mk, iterations=2)] = gm
        rgbp = np.pad(cell, ((0, 0), (PAD, PAD), (0, 0))); mkp = np.pad(mk, ((0, 0), (PAD, PAD)))
        L = layers_for(tec, lv, rgbp, mkp, cell.shape[1])
        union = np.zeros_like(mkp)
        for _, m in L: union |= m
        xs = np.nonzero(union.any(0))[0]; lo, hi = PAD + 6, PAD + cell.shape[1] - 6; dx = 0
        if xs.min() < lo: dx = lo - xs.min()
        elif xs.max() > hi: dx = hi - xs.max()
        canvas = np.pad(base, ((0, 0), (PAD, PAD), (0, 0)), mode='edge')
        for rgb, m in L:
            if dx: rgb, m = shift_rows(rgb, m, np.full(m.shape[0], dx))
            canvas[m] = rgb[m]
        A[y0:y1, x0:x1] = canvas[:, PAD:PAD + cell.shape[1]]
    return Image.fromarray(A)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('sheet'); ap.add_argument('out'); ap.add_argument('--rows', type=int, default=3); ap.add_argument('--cols', type=int, default=8)
    ap.add_argument('--frame', action='append'); a = ap.parse_args()
    specs = [(int(f.split(',')[0]), int(f.split(',')[1]), f.split(',')[2], int(f.split(',')[3])) for f in a.frame] if a.frame else DEFAULT
    if a.out == a.sheet: raise SystemExit('a saída não pode ser o sheet de entrada (o original fica intacto)')
    apply(Image.open(a.sheet), a.rows, a.cols, specs).save(a.out); print('ok', specs)
