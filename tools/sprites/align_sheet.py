#!/usr/bin/env python3
"""Alinha os quadros de um sheet (grade colunas x linhas) pelos PÉS e remonta numa grade de células inteiras (medidas divisíveis),
pra o personagem não deslizar no chão (Bitmapflow, GIF, jogo). Não mexe no arquivo de entrada: grava <nome>_aligned.png.
Uso: python3 align_sheet.py sheet.png <colunas> <linhas> [--cell 400] [--margin 28]
Âncora (--anchor feet, padrão): o centro dos pés (média do x das linhas mais baixas do corpo) vai pro meio da célula; a sola vai pra `margin` px da borda de baixo.
Cada pose é achada por componentes conexos dentro da sua célula aproximada (divisão igual do sheet), então funciona mesmo que a IA tenha
posicionado o personagem fora do centro. Imprime a variação de posição antes/depois e os números da importação do Bitmapflow."""
import sys, os, argparse
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

def fg_mask(rgb):
    x = rgb.astype(int); ge = x[..., 1] - np.maximum(x[..., 0], x[..., 2]); m = ndi.binary_opening(ge < 38)
    lab, n = ndi.label(m, structure=np.ones((3, 3)))
    if n: m = np.isin(lab, [i + 1 for i, a in enumerate(ndi.sum(m, lab, range(1, n + 1))) if a >= 60])
    return m

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('sheet'); ap.add_argument('cols', type=int); ap.add_argument('rows', type=int)
    ap.add_argument('--anchor', choices=['feet','torso'], default='feet', help='feet = idle/pés plantados; torso = walk/corrida no lugar (o corpo fica parado, os pés é que andam)')
    ap.add_argument('--cell', type=int, default=400); ap.add_argument('--margin', type=int, default=28); a = ap.parse_args()
    im = Image.open(a.sheet).convert('RGB'); A = np.asarray(im); H, W = A.shape[:2]
    bg = np.median(A[:30, :30].reshape(-1, 3), axis=0).astype(np.uint8)
    cw, ch = a.cell, a.cell; out = np.empty((ch * a.rows, cw * a.cols, 3), np.uint8); out[:] = bg
    before, after = [], []
    for r in range(a.rows):
        for c in range(a.cols):
            x0, x1, y0, y1 = int(round(c * W / a.cols)), int(round((c + 1) * W / a.cols)), int(round(r * H / a.rows)), int(round((r + 1) * H / a.rows))
            cell = A[y0:y1, x0:x1]; m = fg_mask(cell); ys, xs = np.nonzero(m)
            if not len(ys): print(f'AVISO: célula {r+1},{c+1} sem personagem'); continue
            top, bot = ys.min(), ys.max()
            if a.anchor == 'torso':                                           # mediana do x do peito (robusta a braços e pernas): o corpo não desliza
                h_ = bot - top + 1; sel = (ys >= top + 0.25 * h_) & (ys <= top + 0.55 * h_); fx = int(round(np.median(xs[sel])))
            else:
                band = ys >= bot - max(3, int(0.06 * (bot - top + 1))); fx = int(round(xs[band].mean()))                                  # centro dos pés (x), no sistema da célula original
            before.append((fx - (x1 - x0) / 2, (bot) - (y1 - y0)))             # onde os pés caem em relação ao centro/base da célula
            dm = ndi.binary_dilation(m, iterations=2)                          # copia o corpo com 2 px de folga (bordas intactas)
            yy, xx = np.nonzero(dm); ox, oy = c * cw + cw // 2 - fx, r * ch + ch - a.margin - bot
            ty, tx = yy + oy, xx + ox; ok = (ty >= r * ch) & (ty < (r + 1) * ch) & (tx >= c * cw) & (tx < (c + 1) * cw)
            if not ok.all(): print(f'AVISO: pose {r*a.cols+c+1} passa da célula {a.cell}px; use --cell maior')
            out[ty[ok], tx[ok]] = cell[yy[ok], xx[ok]]; after.append((0.0, 0.0))
    b = np.array(before); dst = os.path.splitext(a.sheet)[0] + '_aligned.png'; Image.fromarray(out).save(dst)
    print(f'{W}x{H} -> {out.shape[1]}x{out.shape[0]}  (células {cw}x{ch}, {a.cols}x{a.rows})')
    print(f'deslize da âncora ({a.anchor}) ANTES: x varia {b[:,0].max()-b[:,0].min():.0f}px, y varia {b[:,1].max()-b[:,1].min():.0f}px | DEPOIS: 0px e 0px')
    print(f'salvo em {dst}\nBITMAPFLOW: Frame count {a.cols*a.rows} | Frames per row {a.cols} | Width {cw} | Height {ch} | Offset 0 | Margin 0')

if __name__ == '__main__': main()
