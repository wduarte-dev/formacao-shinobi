#!/usr/bin/env python3
"""Preparo em lote do dragão do jutsu (molde branco + desintegração + fogo do elemento + impacto de brasa) e CONFERÊNCIA DAS EMENDAS.
  python3 tools/sprites/dragao_lote.py [pasta]     # padrão: sprites_novos, depois sprites_usados/dragao_kaen
Entrada: dragao_molde.png, dragao_desintegra.png, dragao_fogo.png, dragao_impacto.png (4 linhas x 6 colunas, células 256, fundo verde).
Saída em tools/sprites/out/dragao/: <sheet>_L<linha>.png (tira RGBA de 6 quadros) + dragao.json (por peça: caixa, bordas esquerda/direita
com topo, base, centro e espessura) + STATUS.md com a tabela de emendas (cabeça↔corpo, corpo↔corpo, corpo↔cauda, faixa de fogo) e quadros
tocando a borda sem ser corte previsto.  O código usa esses números pra alinhar as peças (offset vertical) e escalar a espessura."""
import os, sys, json
import numpy as np
from PIL import Image

R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(R, 'tools', 'sprites', 'out', 'dragao')
CELL = 256
# (sheet, linha) -> (nome, borda de emenda esperada: 'L', 'R', 'LR' ou '')
PECAS = {('dragao_molde', 0): ('cabeca', 'L'), ('dragao_molde', 1): ('corpo', 'LR'), ('dragao_molde', 2): ('cauda', 'R'),
         ('dragao_molde', 3): ('cabeca_desintegra', 'L'), ('dragao_desintegra', 0): ('corpo_desintegra', 'LR'),
         ('dragao_desintegra', 1): ('cauda_desintegra', 'R'), ('dragao_desintegra', 2): ('impacto_chao', ''), ('dragao_desintegra', 3): ('fragmentos', ''),
         ('dragao_fogo', 0): ('fogo_crista', ''), ('dragao_fogo', 1): ('fogo_corpo', 'LR'), ('dragao_fogo', 2): ('fogo_cauda', 'R'),
         ('dragao_fogo', 3): ('brasas', ''), ('dragao_impacto', 0): ('impacto_brasa', ''), ('dragao_impacto', 1): ('queima_loop', ''),
         ('dragao_impacto', 2): ('chuva_brasa', ''), ('dragao_impacto', 3): ('fogo_chao', '')}


def key(path):
    a = np.array(Image.open(path).convert('RGB')).astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    d = g - np.maximum(r, b)
    return np.dstack([r, np.where((d > 12) & (d <= 45), np.maximum(r, b), g), b, np.where(d > 45, 0, 255)]).astype(np.uint8)


def borda(m, lado):
    ys, xs = np.where(m)
    if len(xs) < 30: return None
    sel = xs <= xs.min() + 2 if lado == 'L' else xs >= xs.max() - 2
    yy = ys[sel]
    return dict(x=int(xs.min() if lado == 'L' else xs.max()), topo=int(yy.min()), base=int(yy.max()), centro=round(float((yy.min() + yy.max()) / 2), 1), esp=int(yy.max() - yy.min() + 1))


def main():
    base = sys.argv[1] if len(sys.argv) > 1 else None
    cands = [base] if base else [os.path.join(R, 'sprites_novos'), os.path.join(R, 'sprites_usados', 'dragao_kaen')]
    os.makedirs(OUT, exist_ok=True); info = {}; linhas = ['# Dragão em lote: status', '']
    for sh in sorted({k[0] for k in PECAS}):
        f = next((os.path.join(d, sh + '.png') for d in cands if os.path.exists(os.path.join(d, sh + '.png'))), None)
        if not f: linhas.append(f'- **FALTA** `{sh}.png`'); continue
        a = key(f)
        for (s2, ln), (nome, emendas) in PECAS.items():
            if s2 != sh: continue
            Image.fromarray(a[ln * CELL:(ln + 1) * CELL], 'RGBA').save(os.path.join(OUT, f'{nome}.png'))
            qs = []
            for c in range(6):
                m = a[ln * CELL:(ln + 1) * CELL, c * CELL:(c + 1) * CELL, 3] > 0
                ys, xs = np.where(m)
                q = dict(vazio=len(xs) < 30)
                if not q['vazio']:
                    q.update(l=int(xs.min()), r=int(xs.max()), t=int(ys.min()), b=int(ys.max()))
                    q['L'] = borda(m, 'L'); q['R'] = borda(m, 'R')
                    q['borda_inesperada'] = bool(((q['t'] <= 1) or (q['b'] >= CELL - 2) or ('L' not in emendas and q['l'] <= 1) or ('R' not in emendas and q['r'] >= CELL - 2)))
                qs.append(q)
            info[nome] = dict(sheet=sh, linha=ln, emendas=emendas, quadros=qs)
    json.dump(info, open(os.path.join(OUT, 'dragao.json'), 'w'))

    def med(nome, lado, campo):
        v = [q[lado][campo] for q in info[nome]['quadros'] if not q['vazio'] and q.get(lado)] if nome in info else []
        return (round(sum(v) / len(v), 1), min(v), max(v)) if v else None
    linhas += ['## Emendas (média, mín, máx em px; célula 256)', '', '| emenda | espessura A | espessura B | centro A | centro B | diferença de espessura | diferença de centro |', '|---|---|---|---|---|---|---|']
    pares = [('cabeça (pescoço, esq) ↔ corpo (dir)', ('cabeca', 'L'), ('corpo', 'R')), ('corpo (esq) ↔ corpo (dir)', ('corpo', 'L'), ('corpo', 'R')),
             ('cauda (base, dir) ↔ corpo (esq)', ('cauda', 'R'), ('corpo', 'L')), ('fogo corpo (esq) ↔ fogo corpo (dir)', ('fogo_corpo', 'L'), ('fogo_corpo', 'R'))]
    for rot, (na, la), (nb, lb) in pares:
        ea, eb, ca, cb = med(na, la, 'esp'), med(nb, lb, 'esp'), med(na, la, 'centro'), med(nb, lb, 'centro')
        if not (ea and eb): linhas.append(f'| {rot} | — | — | — | — | — | — |'); continue
        linhas.append(f'| {rot} | {ea[0]} ({ea[1]}–{ea[2]}) | {eb[0]} ({eb[1]}–{eb[2]}) | {ca[0]} | {cb[0]} | {abs(ea[0] - eb[0]):.1f} px ({abs(ea[0] - eb[0]) / max(ea[0], eb[0]) * 100:.0f}%) | {abs(ca[0] - cb[0]):.1f} px |')
    linhas += ['', '## Quadros com problema', '']
    ruins = [(n, i) for n, d in info.items() for i, q in enumerate(d['quadros']) if q['vazio'] or q.get('borda_inesperada')]
    linhas += [f'- {n}: quadro {i + 1} ' + ('vazio' if info[n]['quadros'][i]['vazio'] else 'toca a borda sem ser corte previsto') for n, i in ruins] or ['- nenhum']
    open(os.path.join(OUT, 'STATUS.md'), 'w', encoding='utf8').write('\n'.join(linhas)); print('\n'.join(linhas))


if __name__ == '__main__':
    main()
