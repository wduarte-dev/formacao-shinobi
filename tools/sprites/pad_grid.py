#!/usr/bin/env python3
"""Ajusta um sheet pra medidas que DIVIDEM certinho na grade (largura divisível por colunas, altura por linhas), sem mexer em nenhum pixel
do personagem: só acrescenta fundo (a cor do canto) à direita e embaixo. Assim o Bitmapflow recorta células inteiras e o personagem não "desliza".
Uso: python3 pad_grid.py sheet.png <colunas> <linhas>      Saída: <sheet>_grid.png + os números pra tela de importação do Bitmapflow."""
import sys, os
from PIL import Image
if len(sys.argv) != 4: raise SystemExit(__doc__)
src, cols, rows = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
im = Image.open(src).convert("RGB"); W, H = im.size
nw, nh = -(-W // cols) * cols, -(-H // rows) * rows
bg = im.getpixel((2, H // 2))
out = Image.new("RGB", (nw, nh), bg); out.paste(im, (0, 0))
dst = os.path.splitext(src)[0] + "_grid.png"; out.save(dst)
print(f"{W}x{H} -> {nw}x{nh} (acrescentou {nw-W}px à direita e {nh-H}px embaixo)\nsalvo em {dst}\n"
      f"BITMAPFLOW: Frame count {cols*rows} | Frames per row {cols} | Width {nw//cols} | Height {nh//rows} | Offset 0 | Margin 0")
