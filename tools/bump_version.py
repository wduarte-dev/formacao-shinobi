#!/usr/bin/env python3
"""Sobe a versão do jogo: escreve version.json (o que o app compara na rede) e VERSION em js/data.js (a que está rodando).
Uso: python3 tools/bump_version.py 1.2   -> depois commitar e dar push na main; quem tem o app aberto vê a faixa "Nova versão"."""
import sys, re, json, datetime, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
v = sys.argv[1]; d = datetime.date.today().strftime("%d/%m/%Y")
open(f"{R}/version.json", "w").write(json.dumps({"v": v, "d": d}) + "\n")
p = f"{R}/js/data.js"; s = open(p).read()
s = re.sub(r"const VERSION=\{v:'[^']*',d:'[^']*'\};", f"const VERSION={{v:'{v}',d:'{d}'}};", s)
open(p, "w").write(s); print("versão", v, d)
