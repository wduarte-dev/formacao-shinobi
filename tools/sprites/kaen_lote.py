#!/usr/bin/env python3
"""Preparo EM LOTE das animações do Kaen (e de qualquer ninja regerado com Bitmapflow). Sem abrir imagem por imagem.
  python3 tools/sprites/kaen_lote.py [pasta]            # pasta padrão: sprites_usados/kaen_regen (ou sprites_novos)
Entrada: <pasta>/KAEN_<anim>_<poses>.png (sheet cru da IA) e KAEN_<anim>_<poses>_aligned.gif (saída do Bitmapflow, quadros
completos com fundo verde; se tiver o mesmo nº de quadros que poses, é a animação sem interpolação).
Saída em tools/sprites/out/kaen_lote/: <anim>.png (grade RGBA, 8 colunas, verde removido), <anim>.json (n, célula, fps, multiplicador,
geometria por quadro: caixa do corpo e ponta direita) e STATUS.md (o que existe, o que falta, quadros cortados na borda/vazios).
Quem usa: golpe_teste.py (página de teste por receita), integração no atlas (qualquer assistente)."""
import os, sys, json, re, shutil, subprocess
import numpy as np
from PIL import Image, ImageSequence

R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(R, 'tools', 'sprites', 'out', 'kaen_lote')
COLS = 8
PRECISA = {'idle': 'ciclo (25 poses)', 'walk': 'OPCIONAL: pulo/entrada substituem (25 poses)', 'pulo': '3 poses', 'entrada': '6 poses', 'ataque': '16 poses',
           'forte': '20 poses', 'jutsu': '20 poses (selos 1-14, liberação 15-20)', 'outros': '16 poses (guard, selos, voo, caído, defeat, victory)'}
EFEITOS_FALTANDO = []   # dragão chegou em 27/11 (ver dragao_lote.py)


def key(rgb):
    a = rgb.astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    d = g - np.maximum(r, b)
    alpha = np.where(d > 45, 0, 255).astype(np.uint8)
    g2 = np.where((d > 12) & (d <= 45), np.maximum(r, b), g)
    return np.dstack([r, g2, b, alpha]).astype(np.uint8)


def frames_do_gif(path):
    return [np.array(f.convert('RGB')) for f in ImageSequence.Iterator(Image.open(path))], Image.open(path).info.get('duration', 100)


def geo(rgba, cell):
    ys, xs = np.where(rgba[..., 3] > 0)
    if len(xs) < 50: return None
    xr = int(xs.max()); sel = xs >= xr - 8
    return dict(l=int(xs.min()), r=xr, t=int(ys.min()), b=int(ys.max()), ty=int(ys[sel].mean()),
                corta=bool(xs.min() <= 1 or ys.min() <= 1 or xr >= cell - 2 or ys.max() >= cell - 2))


def frames_do_png(png, anim):
    """Sem Bitmapflow: alinha do sheet CRU com preparar_sheet.py e aumenta a célula até nenhum corpo tocar a borda."""
    work = os.path.join(OUT, '_work', anim); shutil.rmtree(work, ignore_errors=True); os.makedirs(work)
    dst = os.path.join(work, f'KAEN_{anim}.png'); shutil.copy(png, dst)
    cell = None
    for tent in [None, 384, 448, 512]:
        cmd = [sys.executable, os.path.join(R, 'tools', 'sprites', 'preparar_sheet.py'), dst] + (['--cell', str(tent)] if tent else [])
        out = subprocess.run(cmd, capture_output=True, text=True).stdout
        m = re.search(r'\((\d+)x(\d+)\).*?célula (\d+)', out)
        if not m: continue
        cols, rows, cell = int(m.group(1)), int(m.group(2)), int(m.group(3))
        sheet = np.array(Image.open(os.path.join(work, 'sprites_prontos', f'KAEN_{anim}_aligned.png')).convert('RGB'))
        fr = [sheet[(i // cols) * cell:(i // cols + 1) * cell, (i % cols) * cell:(i % cols + 1) * cell] for i in range(cols * rows)]
        if not any((g := geo(key(f), cell)) and g['corta'] for f in fr): break
    return fr, 100


def processa(png, gif, anim, poses):
    fr, dur = frames_do_gif(gif) if gif else ([None] * poses, 100)
    if len(fr) == poses: fr, dur = frames_do_png(png, anim)   # sem Bitmapflow: usa o sheet cru realinhado (o GIF de prévia pode cortar poses largas)
    n = len(fr); cell = fr[0].shape[0]
    rows = -(-n // COLS)
    grade = np.zeros((rows * cell, COLS * cell, 4), np.uint8)
    gs = []
    for i, f in enumerate(fr):
        k = key(f); r, c = divmod(i, COLS)
        grade[r * cell:(r + 1) * cell, c * cell:(c + 1) * cell] = k
        gs.append(geo(k, cell))
    Image.fromarray(grade, 'RGBA').save(os.path.join(OUT, f'{anim}.png'))
    info = dict(anim=anim, poses=poses, n=n, cell=cell, cols=COLS, fps=round(1000 / dur, 2), mult=round(n / poses, 2),
                bitmapflow=n > poses, quadros=gs)
    json.dump(info, open(os.path.join(OUT, f'{anim}.json'), 'w'))
    return info


def main():
    base = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('-') else None
    cands = [base] if base else [os.path.join(R, 'sprites_novos'), os.path.join(R, 'sprites_usados', 'kaen_regen')]
    os.makedirs(OUT, exist_ok=True)
    achados = {}
    for d in cands:
        if not os.path.isdir(d): continue
        for f in sorted(os.listdir(d)):
            m = re.fullmatch(r'KAEN_([a-z]+)_(\d+)_aligned\.gif', f)
            if m: achados[m.group(1)] = (os.path.join(d, f.replace('_aligned.gif', '.png')), os.path.join(d, f), int(m.group(2)))
            m = re.fullmatch(r'KAEN_([a-z]+)_(\d+)\.png', f)   # só o sheet cru (sem GIF): vale pra animação sem Bitmapflow
            if m and m.group(1) not in achados: achados[m.group(1)] = (os.path.join(d, f), None, int(m.group(2)))
    linhas = ['# Kaen em lote: status', '', '| animação | esperado | poses | quadros | Bitmapflow | fps | célula | cortados na borda | vazios |', '|---|---|---|---|---|---|---|---|---|']
    for a, esperado in PRECISA.items():
        if a not in achados:
            linhas.append(f'| {a} | {esperado} | — | — | — | — | — | — | **FALTA** (nomear `KAEN_{a}_<poses>.png` + `_aligned.gif`) |'); continue
        png, gif, poses = achados[a]
        i = processa(png, gif, a, poses)
        corta = [k for k, g in enumerate(i['quadros']) if g and g['corta']]; vazio = [k for k, g in enumerate(i['quadros']) if g is None]
        linhas.append(f"| {a} | {esperado} | {poses} | {i['n']} | {'sim x' + str(i['mult']) if i['bitmapflow'] else 'não'} | {i['fps']} | {i['cell']} | "
                      f"{corta[:8] or 'nenhum'} | {vazio or 'nenhum'} |")
    linhas += ['', '**Efeitos que faltam:** ' + ', '.join(EFEITOS_FALTANDO), '']
    open(os.path.join(OUT, 'STATUS.md'), 'w', encoding='utf8').write('\n'.join(linhas))
    print('\n'.join(linhas))


if __name__ == '__main__':
    main()
