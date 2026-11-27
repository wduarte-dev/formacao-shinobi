#!/usr/bin/env python3
"""Alinha os quadros de um sheet e remonta numa grade de células inteiras (medidas divisíveis), pra o personagem não deslizar
(Bitmapflow, GIF, jogo). NUNCA altera o arquivo de entrada: grava <nome>_aligned.png.
Uso:  python3 align_sheet.py sheet.png [colunas linhas] [--cell 400] [--anchor feet|torso] [--ground each|global] [--margin 28]
  - SEM colunas/linhas: acha cada pose sozinho (projeção dos espaços vazios entre linhas e colunas); funciona com células vazias.
  - COM colunas e linhas: divide o sheet em células iguais (modo validado nos sheets do Kaen).
Âncora: feet (padrão) = centro dos pés, pra idle/pés plantados; torso = mediana do x do peito, pra walk/corrida no lugar (o corpo fica parado, os pés andam).
Chão: each = a sola de cada pose vai pro chão; global = UM chão por linha (pulo/queda: a pose no ar continua acima do chão).
Só MOVE pixels (copia o corpo com 2 px de folga); não reduz nem reamostra. Imprime a variação antes/depois e os números do Bitmapflow."""
import sys, os, argparse
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

def fg_mask(rgb):
    x = rgb.astype(int); ge = x[..., 1] - np.maximum(x[..., 0], x[..., 2]); m = ndi.binary_opening(ge < 38)
    lab, n = ndi.label(m, structure=np.ones((3, 3)))
    if n: m = np.isin(lab, [i + 1 for i, a in enumerate(ndi.sum(m, lab, range(1, n + 1))) if a >= 60])
    return m

def _runs(v, mingap, minlen):
    idx = np.nonzero(v)[0]
    if not len(idx): return []
    out = [[idx[0], idx[0]]]
    for i in idx[1:]:
        if i - out[-1][1] <= mingap: out[-1][1] = i
        else: out.append([i, i])
    return [(a, b) for a, b in out if b - a + 1 >= minlen]

def grid_boxes(W, H, cols, rows):
    """células iguais: lista de linhas, cada uma com caixas (x0, x1, y0, y1), x1/y1 exclusivos"""
    return [[(int(round(c * W / cols)), int(round((c + 1) * W / cols)), int(round(r * H / rows)), int(round((r + 1) * H / rows))) for c in range(cols)] for r in range(rows)]

def auto_boxes(A):
    """acha as poses: faixas horizontais (linhas) e, dentro de cada uma, faixas verticais (colunas); caixas folgadas até o meio do vazio"""
    H, W = A.shape[:2]; m = fg_mask(A); rows = []
    rb = _runs(m.any(1), int(H * 0.004), int(H * 0.04))
    for k, (y0, y1) in enumerate(rb):
        top = 0 if k == 0 else (rb[k - 1][1] + y0) // 2; bot = H if k == len(rb) - 1 else (y1 + rb[k + 1][0]) // 2
        cb = _runs(m[y0:y1 + 1].any(0), int(W * 0.004), int(W * 0.02)); row = []
        for j, (x0, x1) in enumerate(cb):
            left = 0 if j == 0 else (cb[j - 1][1] + x0) // 2; right = W if j == len(cb) - 1 else (x1 + cb[j + 1][0]) // 2
            row.append((left, right, top, bot))
        rows.append(row)
    return rows

def _anchor(m, anchor):
    ys, xs = np.nonzero(m); top, bot = ys.min(), ys.max()
    if anchor == 'torso':
        h = bot - top + 1; sel = (ys >= top + 0.25 * h) & (ys <= top + 0.55 * h); fx = int(round(np.median(xs[sel])))
    else:
        band = ys >= bot - max(3, int(0.06 * (bot - top + 1))); fx = int(round(xs[band].mean()))
    return fx, top, bot, xs.min(), xs.max()

def align(A, rows_boxes, cell=400, anchor='feet', ground='each', margin=28):
    """devolve (imagem alinhada, info). A = array RGB do sheet original."""
    bg = np.median(A[:30, :30].reshape(-1, 3), axis=0).astype(np.uint8)
    R = len(rows_boxes); C = max(len(r) for r in rows_boxes); out = np.empty((cell * R, cell * C, 3), np.uint8); out[:] = bg
    info = dict(before=[], warn=[], heights=[], widths=[], poses=0, rows=R, cols=C, order=[])
    for r, row in enumerate(rows_boxes):
        gref = 0
        if ground == 'global':
            sole = []
            for (x0, x1, y0, y1) in row:
                ys = np.nonzero(fg_mask(A[y0:y1, x0:x1]).any(1))[0]
                if len(ys): sole.append(y0 + ys.max())
            gref = max(sole) if sole else 0
        for c, (x0, x1, y0, y1) in enumerate(row):
            cellimg = A[y0:y1, x0:x1]; m = fg_mask(cellimg)
            if not m.any(): info['warn'].append(f'célula {r+1},{c+1} sem personagem'); continue
            fx, top, bot, xmin, xmax = _anchor(m, anchor); info['poses'] += 1; info['order'].append((r, c))
            info['heights'].append(bot - top + 1); info['widths'].append(xmax - xmin + 1)
            info['before'].append((fx - (x1 - x0) / 2, bot - (y1 - y0)))   # relativo à caixa da pose
            target_sole = r * cell + cell - margin - ((gref - (y0 + bot)) if ground == 'global' else 0)
            dm = ndi.binary_dilation(m, iterations=2); yy, xx = np.nonzero(dm)
            ox, oy = c * cell + cell // 2 - fx, target_sole - bot
            ty, tx = yy + oy, xx + ox; ok = (ty >= r * cell) & (ty < (r + 1) * cell) & (tx >= c * cell) & (tx < (c + 1) * cell)
            if not ok.all(): info['warn'].append(f'pose {sum(len(q) for q in rows_boxes[:r]) + c + 1} passa da célula de {cell}px; use --cell maior')
            out[ty[ok], tx[ok]] = cellimg[yy[ok], xx[ok]]
    return out, info

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('sheet'); ap.add_argument('cols', type=int, nargs='?'); ap.add_argument('rows', type=int, nargs='?')
    ap.add_argument('--anchor', choices=['feet', 'torso'], default='feet'); ap.add_argument('--ground', choices=['each', 'global'], default='each')
    ap.add_argument('--cell', type=int, default=400); ap.add_argument('--margin', type=int, default=28); a = ap.parse_args()
    A = np.asarray(Image.open(a.sheet).convert('RGB')); H, W = A.shape[:2]
    boxes = grid_boxes(W, H, a.cols, a.rows) if a.cols and a.rows else auto_boxes(A)
    out, info = align(A, boxes, a.cell, a.anchor, a.ground, a.margin)
    for w in info['warn']: print('AVISO:', w)
    dst = os.path.splitext(a.sheet)[0] + '_aligned.png'; Image.fromarray(out).save(dst)
    b = np.array(info['before'], float)
    print(f"{W}x{H} -> {out.shape[1]}x{out.shape[0]}  (células {a.cell}x{a.cell}, {info['cols']}x{info['rows']}, {info['poses']} poses, {'grade informada' if a.cols and a.rows else 'poses achadas sozinho'})")
    print(f"altura do corpo {min(info['heights'])} a {max(info['heights'])} px | âncora ({a.anchor}) ANTES: x varia {b[:,0].max()-b[:,0].min():.0f}px, y varia {b[:,1].max()-b[:,1].min():.0f}px | DEPOIS: x 0px e " + ('y 0px' if a.ground == 'each' else 'y preservado (chão global)'))
    print(f"salvo em {dst}\nBITMAPFLOW: Frame count {info['poses']} | Frames per row {info['cols']} | Width {a.cell} | Height {a.cell} | Offset 0 | Margin 0")

if __name__ == '__main__': main()
