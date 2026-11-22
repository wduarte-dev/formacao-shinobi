#!/usr/bin/env python3
"""docs/patch-notes.md -> js/patch.js (lista PATCH que a tela Novidades do menu mostra). Uso: python3 tools/patch_notes.py"""
import re, json, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
md = open(f"{R}/docs/patch-notes.md").read()
out = []
for blk in re.split(r"^## ", md, flags=re.M)[1:]:
    head, *lines = blk.strip().split("\n")
    parts = [p.strip() for p in head.split("·")]
    items = [re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", re.sub(r"`(.+?)`", r"\1", l[2:].strip())) for l in lines if l.startswith("- ")]
    out.append({"v": parts[0], "d": parts[1] if len(parts) > 1 else "", "t": parts[2] if len(parts) > 2 else "", "i": items})
open(f"{R}/js/patch.js", "w").write("// GERADO por tools/patch_notes.py a partir de docs/patch-notes.md. Não editar à mão.\n\"use strict\";\nconst PATCH=" + json.dumps(out, ensure_ascii=False) + ";\n")
print(len(out), "versões ->", "js/patch.js")
