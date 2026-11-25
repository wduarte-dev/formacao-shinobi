#!/usr/bin/env python3
"""Cola as linhas regeradas (out/<ninja>_regen_atlas.png, de regen_setup.py cut) no atlas ATUAL do ninja (spr/<ninja>_atlas.png)
e escreve em staging/: <ninja>_atlas.png (atlas novo, pronto pra copiar pra spr/) e <ninja>_v2.txt (linha nova do V2 pro js/sprites.js).
Uso (de dentro de tools/sprites/):  python3 merge_regen.py <ninja> [<ninja> ...]   |   sem args = todos os que têm out/*_regen_atlas.png
Mantém fps/loop/pingpong do V2 antigo (tempo já ajustado); só troca o nº de quadros. Se o nº mudou, remove `seq` da anim (índices velhos)."""
import json, os, re, sys
from PIL import Image
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.abspath(os.path.join(H, '..', '..'))
CW, CH = 192, 160
def v2_line(nid):
    for ln in open(f'{R}/js/sprites.js', encoding='utf8'):
        if re.match(rf'\s*{nid}:\{{hd:', ln): return ln.rstrip('\n')
    sys.exit(f'{nid} não está no V2')
def merge(nid):
    new = Image.open(f'{H}/out/{nid}_regen_atlas.png').convert('RGBA'); nj = json.load(open(f'{H}/out/{nid}_regen_atlas.json'))
    old = Image.open(f'{R}/spr/{nid}_atlas.png').convert('RGBA'); line = v2_line(nid)
    # O prefixo contém as dimensões e a âncora. As listas das animações são JSON,
    # inclusive quando têm uma sexta entrada com a sequência de quadros.
    prefix, body = line.split(',a:{', 1)
    decoder = json.JSONDecoder()
    entries = {}
    while True:
        key, value = body.split(':', 1)
        entries[key], end = decoder.raw_decode(value)
        tail = value[end:]
        if tail in ('}}', '}},'):
            break
        if not tail.startswith(','):
            raise ValueError(f'Entrada V2 inválida em {nid}/{key}')
        body = tail[1:]
    atlas = Image.new('RGBA', (max(old.width, new.width), old.height), (0, 0, 0, 0)); atlas.paste(old, (0, 0))
    rep = []
    for a in nj['anims']:
        nm = a['name']
        if nm not in entries: print(f'  ! {nm} não existe no V2 de {nid}: ignorado'); continue
        f = entries[nm]
        row, n_old = f[0], f[1]
        atlas.paste(Image.new('RGBA', (atlas.width, CH), (0, 0, 0, 0)), (0, row * CH))
        for c in range(a['n']):
            cell = new.crop((c * CW, a['row'] * CH, (c + 1) * CW, (a['row'] + 1) * CH)); atlas.paste(cell, (c * CW, row * CH))
        f[1] = a['n']
        if n_old != a['n'] and len(f) > 5: f = f[:5]   # seq antigo não vale mais
        entries[nm] = f; rep.append(f'{nm}: {n_old}->{a["n"]} quadros (fps {f[2]} mantido)')
    os.makedirs(f'{H}/staging', exist_ok=True); atlas.save(f'{H}/staging/{nid}_atlas.png', optimize=True)
    newa = ','.join(k + ':' + json.dumps(v, separators=(',', ':')) for k, v in entries.items())
    newline = prefix + ',a:{' + newa + tail
    open(f'{H}/staging/{nid}_v2.txt', 'w', encoding='utf8').write(newline + '\n'); print(nid, '|', '; '.join(rep))
for n in (sys.argv[1:] or sorted(f[:-len('_regen_atlas.png')] for f in os.listdir(f'{H}/out') if f.endswith('_regen_atlas.png'))): merge(n)
