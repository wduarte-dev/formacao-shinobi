#!/usr/bin/env python3
"""Gera a página de teste de uma PERSEGUIÇÃO aérea (ex.: Chute Meteoro do Kaen: o alvo está no ar, o ninja salta, mergulha, chuta, o alvo
despenca e o ninja pousa) a partir de uma receita JSON. Mostra posições (código) + poses (sprite) + efeitos (kit e fogo).
  python3 tools/sprites/kaen_lote.py                         # 1º: prepara os quadros (out/kaen_lote/<anim>.png/.json)
  python3 tools/sprites/dragao_lote.py                       # (fogo e brasas vêm das peças do dragão)
  python3 tools/perseg_teste.py tools/receitas/kaen_meteoro.json
Saída: tools/sprites/out/perseg/<receita>/index.html (+ imagens). Receita: {"titulo","anim","fps","pose_contato","pose_pouso","alvo_x","alvo_alt"}.
Contato = pose do chute estendido; pouso = pose do impacto no chão. O deslocamento horizontal e a altura do salto são código (keyframes por pose)."""
import os, sys, json, shutil
import numpy as np
from PIL import Image

R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
LOTE = os.path.join(R, 'tools', 'sprites', 'out', 'kaen_lote')
DRG = os.path.join(R, 'tools', 'sprites', 'out', 'dragao')
KIT = os.path.join(R, 'tools', 'sprites', 'src', 'kit')
KX, GY = 70, 250


def key(path):
    a = np.array(Image.open(path).convert('RGB')).astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    d = g - np.maximum(r, b)
    return np.dstack([r, np.where((d > 12) & (d <= 45), np.maximum(r, b), g), b, np.where(d > 45, 0, 255)]).astype(np.uint8)


def main():
    if len(sys.argv) < 2: sys.exit(__doc__)
    rec = json.load(open(sys.argv[1], encoding='utf8'))
    nome = os.path.splitext(os.path.basename(sys.argv[1]))[0]
    out = os.path.join(R, 'tools', 'sprites', 'out', 'perseg', nome); os.makedirs(out, exist_ok=True)
    k = json.load(open(os.path.join(LOTE, rec['anim'] + '.json')))
    shutil.copy(os.path.join(LOTE, rec['anim'] + '.png'), os.path.join(out, 'kaen.png'))
    for p in ('fogo_cauda', 'brasas', 'impacto_brasa', 'fragmentos', 'fogo_chao'):
        shutil.copy(os.path.join(DRG, p + '.png'), os.path.join(out, f'p_{p}.png'))
    for fl, f in (('kitA', 'kitA_poeira.png'), ('kitC', 'kitC_golpes.png')):
        Image.fromarray(key(os.path.join(KIT, f)), 'RGBA').save(os.path.join(out, f'fx_{fl}.png'))
    shutil.copy(os.path.join(R, 'spr', 'iwao_atlas.png'), os.path.join(out, 'alvo.png'))
    q = k['quadros']; b0 = q[0]; s = 108 / (b0['b'] - b0['t'])
    pc = q[rec['pose_contato'] - 1]
    ponta = [(pc['r'] - k['cell'] / 2) * s, (b0['b'] - pc['ty']) * s]   # ponta do pé no contato, relativa ao centro/chão do ninja
    dados = dict(titulo=rec['titulo'], fps=rec['fps'], n=k['n'], cell=k['cell'], cols=k['cols'], s=s, foot=b0['b'], contato=rec['pose_contato'],
                 pouso=rec['pose_pouso'], alvoX=rec.get('alvo_x', 340), alvoAlt=rec.get('alvo_alt', 70), ponta=ponta, kx=KX, gy=GY)
    tpl = open(os.path.join(os.path.dirname(__file__), 'perseg_teste_modelo.html'), encoding='utf8').read()
    open(os.path.join(out, 'index.html'), 'w', encoding='utf8').write(tpl.replace('__DATA__', json.dumps(dados)))
    print('página:', os.path.join(out, 'index.html'))


if __name__ == '__main__':
    main()
