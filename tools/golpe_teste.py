#!/usr/bin/env python3
"""Gera a página de teste de golpes a partir de uma RECEITA (JSON) e confere truncamento sozinho. Sem escrever HTML à mão.
  python3 tools/sprites/kaen_lote.py                       # 1º: prepara os quadros (gera tools/sprites/out/kaen_lote/<anim>.png/.json)
  python3 tools/golpe_teste.py tools/receitas/kaen_golpes.json [--sem-verificar]
Saída: tools/sprites/out/golpes/<receita>/index.html (+ imagens ao lado). Abrir por servidor local ou publicar como Artifact.
Receita: {"titulo", "alvo":"iwao", "golpes":[{"nome","anim","fps","corpo_px","contatos":[{"pose","hitstop"(ms),"dano","dano_vida"(s),
 "dano_dx","flinch"(px),"squash"(bool),"efeitos":[{"folha":"kitC","linha":0,"inicio"(s, relativo ao contato),"fps","pal","ancora":"ponta|corpo|alvo",
 "dx","dy","esc","rot","sx","sy"}]}]}]}.  Paletas: fire, steel, earth, blue (PALS no template). Folhas: kit1, kit_teste (=kitT), kitA, kitB, kitC.
Verificação: efeito fora do palco 480x300, quadro do sprite tocando a borda da célula, números de dano que se sobrepõem no tempo e no espaço."""
import os, sys, json, math, shutil
import numpy as np
from PIL import Image

R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
LOTE = os.path.join(R, 'tools', 'sprites', 'out', 'kaen_lote')
KIT = os.path.join(R, 'tools', 'sprites', 'src', 'kit')
SHEETS = {'kit1': 'kit1_brilhos.png', 'kitT': 'kit_teste.png', 'kit_teste': 'kit_teste.png', 'kitA': 'kitA_poeira.png',
          'kitB': 'kitB_status.png', 'kitC': 'kitC_golpes.png'}
W, H, GY, KX, EX = 480, 300, 250, 190, 300


def key(path):
    a = np.array(Image.open(path).convert('RGB')).astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    d = g - np.maximum(r, b)
    return np.dstack([r, np.where((d > 12) & (d <= 45), np.maximum(r, b), g), b, np.where(d > 45, 0, 255)]).astype(np.uint8)


def bbox_fx(rgba, linha, col):
    c = rgba[linha * 256:(linha + 1) * 256, col * 256:(col + 1) * 256, 3] > 0
    ys, xs = np.where(c)
    return (xs.min(), ys.min(), xs.max(), ys.max()) if len(xs) else None


def main():
    if len(sys.argv) < 2: sys.exit(__doc__)
    rec = json.load(open(sys.argv[1], encoding='utf8')); verificar = '--sem-verificar' not in sys.argv
    nome = os.path.splitext(os.path.basename(sys.argv[1]))[0]
    out = os.path.join(R, 'tools', 'sprites', 'out', 'golpes', nome); os.makedirs(out, exist_ok=True)
    keyed, avisos, dados = {}, [], []
    for g in rec['golpes']:
        info = json.load(open(os.path.join(LOTE, g['anim'] + '.json')))
        shutil.copy(os.path.join(LOTE, g['anim'] + '.png'), os.path.join(out, f"anim_{g['anim']}.png"))
        q = info['quadros']; b0 = q[0]; s = g.get('corpo_px', 108) / (b0['b'] - b0['t']); cell = info['cell']; mult = info['mult']
        fps = g.get('fps', info['fps'])
        for k, qd in enumerate(q):
            if qd is None: avisos.append(f"{g['anim']}: quadro {k} vazio")
            elif qd['corta']: avisos.append(f"{g['anim']}: quadro {k} toca a borda da célula (corpo cortado)")
        cts = []
        for c in g['contatos']:
            f = int(round(c['pose'] * mult)); qd = q[min(f, len(q) - 1)]
            ponta = [KX + (qd['r'] - cell / 2) * s, GY - (b0['b'] - qd['ty']) * s]
            cts.append(dict(c, frame=f, ponta=ponta))
            for e in c['efeitos']:
                fl = e['folha']
                if fl not in keyed:
                    keyed[fl] = key(os.path.join(KIT, SHEETS[fl])); Image.fromarray(keyed[fl], 'RGBA').save(os.path.join(out, f'fx_{fl}.png'))
                if verificar:
                    an = {'ponta': ponta, 'corpo': [KX, GY], 'alvo': [EX, GY - 70]}[e.get('ancora', 'ponta')]
                    cx, cy = an[0] + e.get('dx', 0), an[1] + e.get('dy', 0); esc = e['esc']
                    for col in range(6):
                        bb = bbox_fx(keyed[fl], e['linha'], col)
                        if not bb: continue
                        pts = [((x - 128) * esc * e.get('sx', 1), (y - 128) * esc * e.get('sy', 1)) for x in (bb[0], bb[2]) for y in (bb[1], bb[3])]
                        ca, sa = math.cos(e.get('rot', 0)), math.sin(e.get('rot', 0))
                        xs = [cx + x * ca - y * sa for x, y in pts]; ys = [cy + x * sa + y * ca for x, y in pts]
                        if min(xs) < 2 or max(xs) > W - 2 or min(ys) < 2 or max(ys) > H - 2:
                            avisos.append(f"{g['nome']}: efeito {fl} linha {e['linha']} quadro {col} sai do palco ({min(xs):.0f}..{max(xs):.0f}, {min(ys):.0f}..{max(ys):.0f})")
                            break
        if verificar:   # números de dano
            for i in range(len(cts) - 1):
                a, b = cts[i], cts[i + 1]
                dt = (b['frame'] - a['frame']) / fps
                if dt < a.get('dano_vida', .9) and abs(a.get('dano_dx', 0) - b.get('dano_dx', 0)) < 40:
                    avisos.append(f"{g['nome']}: números de dano dos contatos {i + 1} e {i + 2} se sobrepõem (afaste dano_dx ou reduza dano_vida)")
        dados.append(dict(nome=g['nome'], anim=g['anim'], n=info['n'], cell=cell, cols=info['cols'], fps=fps, s=s, foot=b0['b'], contatos=cts))
    shutil.copy(os.path.join(R, 'spr', rec.get('alvo', 'iwao') + '_atlas.png'), os.path.join(out, 'alvo.png'))
    tpl = open(os.path.join(os.path.dirname(__file__), 'golpe_teste_modelo.html'), encoding='utf8').read()
    html = tpl.replace('__DATA__', json.dumps(dict(titulo=rec.get('titulo', 'Golpes'), golpes=dados, folhas=sorted(keyed))))
    open(os.path.join(out, 'index.html'), 'w', encoding='utf8').write(html)
    print('página:', os.path.join(out, 'index.html'))
    print('VERIFICAÇÃO:', 'ok, nada truncado nem sobreposto' if not avisos else '')
    for a in avisos: print(' -', a)
    sys.exit(1 if avisos else 0)


if __name__ == '__main__':
    main()
