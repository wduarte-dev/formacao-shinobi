#!/usr/bin/env python3
"""Recorta as PEÇAS GRANDES do dragão do Kazan (1 linha, N colunas, fora do atlas 192x160).

  python3 tools/sprites/slice_strip.py <sheet.png> <colunas> <saida_sem_extensao> [--pad 4] [--attach left] [--label-h 40]
  ex.: python3 tools/sprites/slice_strip.py sprites_novos/KAZAN_DR1.png 2 spr/kazan_dragon_head --attach left

- Fundo verde #00FF00 vira alpha (mesmo key do pipeline: key_hard + despill); tira o rótulo do topo (--label-h px).
- Divide em N colunas iguais, faz corte JUSTO por quadro e junta numa tira horizontal (todos os quadros com o mesmo w x h,
  o conteúdo ancorado no CENTRO da célula comum) -> <saida>.png
- <saida>.json: n, fw, fh, e por quadro: bbox no sheet, e (com --attach left|right) o ponto de encaixe (x,y) na célula da tira:
  centro vertical dos pixels opacos na borda esquerda/direita do quadro (é onde o corpo do dragão se emenda).
Peças: DR1 cabeça (2 col, --attach left), DR2 corpo (4 col, --attach left e right devem dar o mesmo y), DR3 cauda (2 col, --attach left),
DR4 erupção (6 col), DR5 cut-in (1 col)."""
import sys, os, json, argparse
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shinobi_atlas import key_hard, despill, green_fix
from scipy import ndimage as ndi


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('sheet'); ap.add_argument('cols', type=int); ap.add_argument('out')
    ap.add_argument('--pad', type=int, default=4); ap.add_argument('--attach', choices=['left', 'right'])
    ap.add_argument('--label-h', type=int, default=40); ap.add_argument('--no-green-fix', action='store_true')
    a = ap.parse_args()
    img = np.array(Image.open(a.sheet).convert('RGB')).astype(np.float32)
    H, W = img.shape[:2]
    fg = key_hard(img, {})
    fg[:a.label_h, :] = False
    # restos finos do rótulo/grade (linha horizontal comprida e baixa): fora
    lab, n = ndi.label(fg, structure=np.ones((3, 3)))
    for i, sl in enumerate(ndi.find_objects(lab), 1):
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        if h <= 10 and w >= 60 and w / h >= 8: fg[sl][lab[sl] == i] = False
    rgb = despill(img)
    if not a.no_green_fix: rgb = green_fix(rgb, fg)   # faíscas/placas esverdeadas (deriva da IA) voltam pra laranja
    rgb = rgb.astype(np.uint8)
    rgba = np.dstack([rgb, (fg * 255).astype(np.uint8)])
    cw = W / a.cols; frames = []
    for c in range(a.cols):
        x0, x1 = int(round(c * cw)), int(round((c + 1) * cw))
        m = fg[:, x0:x1]
        ys, xs = np.nonzero(m)
        if len(ys) == 0: raise SystemExit(f'quadro {c} vazio')
        bx0, bx1, by0, by1 = int(xs.min()), int(xs.max()) + 1, int(ys.min()), int(ys.max()) + 1
        frames.append((x0, bx0, bx1, by0, by1))
    fw = max(f[2] - f[1] for f in frames) + 2 * a.pad; fh = max(f[4] - f[3] for f in frames) + 2 * a.pad
    strip = Image.new('RGBA', (fw * a.cols, fh), (0, 0, 0, 0)); meta = []
    for c, (x0, bx0, bx1, by0, by1) in enumerate(frames):
        crop = Image.fromarray(rgba[by0:by1, x0 + bx0:x0 + bx1])
        ox = c * fw + (fw - crop.width) // 2; oy = (fh - crop.height) // 2
        strip.paste(crop, (ox, oy))
        d = dict(src=[int(x0 + bx0), int(by0), int(x0 + bx1), int(by1)], at=[int(ox - c * fw), int(oy)])
        if a.attach:
            colx = 0 if a.attach == 'left' else crop.width - 1
            col = np.array(crop)[:, max(0, colx - 2):colx + 3 if a.attach == 'left' else crop.width, 3] > 128
            yy = np.nonzero(col.any(axis=1))[0]
            d['attach'] = [int(ox - c * fw + (0 if a.attach == 'left' else crop.width)), int(oy + (yy.min() + yy.max()) / 2)] if len(yy) else None
            d['attach_thickness'] = int(yy.max() - yy.min() + 1) if len(yy) else 0
        meta.append(d)
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    strip.save(a.out + '.png')
    json.dump(dict(n=a.cols, fw=fw, fh=fh, frames=meta), open(a.out + '.json', 'w'), indent=1)
    print(f'{a.out}.png  {a.cols} quadros de {fw}x{fh}' + (f'  encaixe y={[m["attach"][1] if m["attach"] else None for m in meta]} espessura={[m["attach_thickness"] for m in meta]}' if a.attach else ''))


if __name__ == '__main__':
    main()
