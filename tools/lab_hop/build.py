#!/usr/bin/env python3
"""Gera tools/lab_hop/index.html: laboratório cego de hop (sprite x código) do Kaen.

Lê os quadros direto de spr/kaen_atlas.png (célula 192x160, pé em x=96,y=150),
monta uma tira de 7 quadros (0-3 = idle da linha 0, 4-6 = hop da linha 4),
embute em base64 no template.html e grava index.html.

Uso: python3 tools/lab_hop/build.py   (precisa de Pillow)
"""
import base64
import io
import pathlib

from PIL import Image

RAIZ = pathlib.Path(__file__).resolve().parents[2]
ATLAS = RAIZ / "spr" / "kaen_atlas.png"
TEMPLATE = pathlib.Path(__file__).with_name("template.html")
SAIDA = pathlib.Path(__file__).with_name("index.html")

CW, CH = 192, 160
# (linha, coluna) de cada quadro da tira
QUADROS = [(0, 0), (0, 1), (0, 2), (0, 3), (4, 0), (4, 1), (4, 2)]


def tira():
    atlas = Image.open(ATLAS).convert("RGBA")
    out = Image.new("RGBA", (CW * len(QUADROS), CH), (0, 0, 0, 0))
    for i, (linha, col) in enumerate(QUADROS):
        cel = atlas.crop((col * CW, linha * CH, col * CW + CW, linha * CH + CH))
        out.paste(cel, (i * CW, 0))
    buf = io.BytesIO()
    out.save(buf, format="PNG", optimize=True)
    return base64.b64encode(buf.getvalue()).decode("ascii")


def main():
    html = TEMPLATE.read_text(encoding="utf-8").replace("__STRIP__", tira())
    SAIDA.write_text(html, encoding="utf-8")
    print(f"ok: {SAIDA} ({SAIDA.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
