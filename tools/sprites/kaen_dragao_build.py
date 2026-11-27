#!/usr/bin/env python3
"""Prepara os assets do Dragão de Brasa do Kaen pro motor: peças em spr/kaen_dragao/*.png (fundo verde removido) e js/kaen-dragao-data.js
(geometria das peças e ponta das mãos). Ordem: python3 tools/sprites/dragao_lote.py && python3 tools/sprites/kaen_dragao_build.py
Mesma geometria do tools/jutsu_teste.py (referência aprovada pelo dono)."""
import json, os, sys, shutil
import numpy as np
from PIL import Image

R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DRG = os.path.join(R, 'tools/sprites/out/dragao')
DST = os.path.join(R, 'spr/kaen_dragao')


def key(path):
    a = np.array(Image.open(path).convert('RGB')).astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    d = g - np.maximum(r, b)
    return np.dstack([r, np.where((d > 12) & (d <= 45), np.maximum(r, b), g), b, np.where(d > 45, 0, 255)]).astype(np.uint8)


def media(info, nome, lado, campo):
    v = [q[lado][campo] for q in info[nome]['quadros'] if not q['vazio'] and q.get(lado)]
    return sum(v) / len(v)


def main():
    d = json.load(open(os.path.join(DRG, 'dragao.json')))
    os.makedirs(DST, exist_ok=True)
    for p in d: Image.open(os.path.join(DRG, p + '.png')).save(os.path.join(DST, p + '.webp'), lossless=True, quality=100, method=6)
    srcs = os.path.join(R, 'sprites_usados')
    for src, dst in ((f'{srcs}/dragao_kaen/dragao_frente.png', 'frente.webp'), (f'{srcs}/dragao_kaen/fogo_invocacao.png', 'invoc.webp'),
                     (f'{srcs}/kit_efeitos/kitA_poeira.png', 'kitA.webp')):
        Image.fromarray(key(src), 'RGBA').save(os.path.join(DST, dst), lossless=True, quality=100, method=6)
    pecas = {}
    for n in ('cabeca', 'corpo', 'cauda'):
        qs = d[n]['quadros']
        pecas[n] = dict(l=sum(q['l'] for q in qs) / 6, r=sum(q['r'] for q in qs) / 6,
                        cyL=media(d, n, 'L', 'centro') if n != 'cauda' else None, cyR=media(d, n, 'R', 'centro') if n != 'cabeca' else None,
                        espL=media(d, n, 'L', 'esp') if n != 'cauda' else None, espR=media(d, n, 'R', 'esp') if n != 'cabeca' else None)
    # ponta das mãos: borda direita do quadro de liberação (jutsu, quadro 28 do atlas) em relação aos pés (x=96), na altura de 60% do corpo
    sys.path.insert(0, os.path.dirname(__file__)); from atlas_registry import registry   # linha/colunas do jutsu vêm do V2 (não fixas)
    spec = registry(open(os.path.join(R, 'js/sprites.js')).read())['kaen']; jut = spec.animations['jutsu']
    atlas = Image.open(os.path.join(R, 'spr/kaen_atlas.png')).convert('RGBA')
    f = 28; box = atlas.crop(((f % spec.columns) * 192, (jut.row + f // spec.columns) * 160, (f % spec.columns) * 192 + 192, (jut.row + f // spec.columns) * 160 + 160)).getbbox()
    ponta = [box[2] - 96, -0.6 * 108]
    open(os.path.join(R, 'js/kaen-dragao-data.js'), 'w').write(
        '// Gerado por tools/sprites/kaen_dragao_build.py (geometria das peças do Dragão de Brasa e ponta das mãos do Kaen)\n'
        'const KDG=' + json.dumps(dict(pecas=pecas, ponta=ponta), separators=(',', ':')) + ';\n')
    print('ok', len(d), 'peças; ponta', ponta)


if __name__ == '__main__':
    main()
