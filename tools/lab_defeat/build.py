#!/usr/bin/env python3
"""Gera tools/lab_defeat/index.html: lab cego de derrota do Kaen (queda atual x retirada).

Tira de 12 quadros extraídos de spr/kaen_atlas.png (célula 192x160, pé em x=96,y=150):
  0-4  = defeat atual (linha 15, 5 quadros, 8 fps)
  5-10 = entrada (linha 5, 6 quadros), usada ao contrário na retirada
  11   = hurt (linha 6, coluna 0), segurado antes da retirada
Uso: python3 tools/lab_defeat/build.py   (precisa de Pillow)
"""
import base64, io, pathlib
from PIL import Image

RAIZ = pathlib.Path(__file__).resolve().parents[2]
ATLAS = RAIZ / "spr" / "kaen_atlas.png"
PASTA = pathlib.Path(__file__).resolve().parent
CW, CH = 192, 160
QUADROS = [(15, c) for c in range(5)] + [(5, c) for c in range(6)] + [(6, 0)]

def tira():
    atlas = Image.open(ATLAS).convert("RGBA")
    out = Image.new("RGBA", (CW * len(QUADROS), CH), (0, 0, 0, 0))
    for i, (linha, col) in enumerate(QUADROS):
        out.paste(atlas.crop((col * CW, linha * CH, col * CW + CW, linha * CH + CH)), (i * CW, 0))
    buf = io.BytesIO(); out.save(buf, format="PNG", optimize=True)
    return base64.b64encode(buf.getvalue()).decode("ascii")

if __name__ == "__main__":
    html = (PASTA / "template.html").read_text(encoding="utf-8").replace("__STRIP__", tira())
    (PASTA / "index.html").write_text(html, encoding="utf-8")
    print("ok", (PASTA / "index.html").stat().st_size // 1024, "KB")
