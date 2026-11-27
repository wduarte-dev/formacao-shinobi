#!/usr/bin/env python3
"""Gera a página de teste de um JUTSU com criatura/projétil em peças (ex.: dragão do Kaen) a partir de uma receita JSON.
  python3 tools/sprites/kaen_lote.py && python3 tools/sprites/dragao_lote.py       # 1º: prepara quadros e peças
  python3 tools/jutsu_teste.py tools/receitas/kaen_jutsu_dragao.json
Saída: tools/sprites/out/jutsus/<receita>/index.html (+ imagens). Publicar como Artifact ou abrir por servidor local.
Mostra: ninja parado no SELO MONTADO (regra do dono) -> executa -> criatura em peças sai das mãos, cruza a fileira de alvos, bate, se
desintegra peça por peça; alvos reagem e queimam. Receita: {"titulo","anim","fps","pose_armado","pose_liberacao","alvos","dragao":{"escala","voo","x_fim","segmentos","pal"}}"""
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


def media(info, nome, lado, campo):
    v = [q[lado][campo] for q in info[nome]['quadros'] if not q['vazio'] and q.get(lado)]
    return sum(v) / len(v)


def main():
    if len(sys.argv) < 2: sys.exit(__doc__)
    rec = json.load(open(sys.argv[1], encoding='utf8'))
    nome = os.path.splitext(os.path.basename(sys.argv[1]))[0]
    out = os.path.join(R, 'tools', 'sprites', 'out', 'jutsus', nome); os.makedirs(out, exist_ok=True)
    k = json.load(open(os.path.join(LOTE, rec['anim'] + '.json'))); d = json.load(open(os.path.join(DRG, 'dragao.json')))
    shutil.copy(os.path.join(LOTE, rec['anim'] + '.png'), os.path.join(out, 'kaen.png'))
    for p in d: shutil.copy(os.path.join(DRG, p + '.png'), os.path.join(out, f'p_{p}.png'))
    for fl, f in (('kitA', 'kitA_poeira.png'), ('kitC', 'kitC_golpes.png')):
        Image.fromarray(key(os.path.join(KIT, f)), 'RGBA').save(os.path.join(out, f'fx_{fl}.png'))
    arq = [os.path.join(R, 'sprites_novos'), os.path.join(R, 'sprites_usados', 'dragao_kaen')]
    for nome_arq, dst in (('dragao_frente.png', 'frente.png'), ('fogo_invocacao.png', 'invoc.png')):   # cut-in de frente + sheet de invocação
        f = next((os.path.join(d2, nome_arq) for d2 in arq if os.path.exists(os.path.join(d2, nome_arq))), None)
        if f: Image.fromarray(key(f), 'RGBA').save(os.path.join(out, dst))
        else: print('AVISO: falta', nome_arq)
    shutil.copy(os.path.join(R, 'spr', 'iwao_atlas.png'), os.path.join(out, 'alvo.png'))
    q = k['quadros']; b0 = q[0]; s = 108 / (b0['b'] - b0['t']); mult = k['mult']
    fa, fr = int(round(rec['pose_armado'] * mult)), int(round(rec['pose_liberacao'] * mult))
    pr = q[min(fr + 2, len(q) - 1)]
    ponta = [KX + (pr['r'] - k['cell'] / 2) * s, GY - 0.6 * 108]   # mãos na altura do peito (60% do corpo); o 'ty' medido pegava o quadril
    pecas = {}
    for n in ('cabeca', 'corpo', 'cauda'):
        L, Rr = media(d, n, 'L', 'x') if n != 'cauda' else None, media(d, n, 'R', 'x') if n != 'cabeca' else None
        pecas[n] = dict(l=sum(q2['l'] for q2 in d[n]['quadros']) / 6, r=sum(q2['r'] for q2 in d[n]['quadros']) / 6,
                        cyL=media(d, n, 'L', 'centro') if n != 'cauda' else None, cyR=media(d, n, 'R', 'centro') if n != 'cabeca' else None,
                        espL=media(d, n, 'L', 'esp') if n != 'cauda' else None, espR=media(d, n, 'R', 'esp') if n != 'cabeca' else None)
    dados = dict(titulo=rec['titulo'], nome_jutsu=rec.get('nome_jutsu', rec['titulo']), top=b0['t'], fps=rec['fps'], n=k['n'], cell=k['cell'], cols=k['cols'], s=s, foot=b0['b'], armado=fa, liberacao=fr, ponta=ponta,
                 alvos=rec.get('alvos', 3), dragao=rec['dragao'], pecas=pecas, kx=KX, gy=GY)
    tpl = open(os.path.join(os.path.dirname(__file__), 'jutsu_teste_modelo.html'), encoding='utf8').read()
    open(os.path.join(out, 'index.html'), 'w', encoding='utf8').write(tpl.replace('__DATA__', json.dumps(dados)))
    print('página:', os.path.join(out, 'index.html'))


if __name__ == '__main__':
    main()
