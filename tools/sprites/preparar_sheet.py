#!/usr/bin/env python3
"""Preparar sheet: UM comando (ou vigiando uma pasta) que pega o sheet gerado pela IA e entrega pronto pro Bitmapflow.
  python3 preparar_sheet.py ~/Downloads/KAEN_WALK.png            # um arquivo
  python3 preparar_sheet.py --watch ~/Downloads                   # fica vigiando: todo sheet novo é preparado sozinho
Faz: acha a grade e cada pose sozinho -> escolhe a âncora pelo NOME do arquivo -> alinha (sem reduzir nem reamostrar) -> escolhe o
tamanho da célula -> grava, em <pasta do arquivo>/sprites_prontos/:  <nome>_aligned.png, <nome>_aligned.gif e <nome>_bitmapflow.txt.
Presets pelo nome (minúsculas, qualquer parte do nome):
  walk, andar, run, corr, dash         -> âncora torso, chão por pose   (o corpo fica parado, os pés andam)
  hop, pulo, jump, salto, entry, entrada, land, queda, trip, rasteira, knock -> âncora torso, chão GLOBAL (a pose no ar fica acima do chão)
  qualquer outro (idle...)             -> âncora pés, chão por pose
Dá pra forçar com --anchor feet|torso, --ground each|global, --cell N, --ms N (duração de cada quadro no GIF, padrão 100).
Nunca altera o original. Precisa de Pillow, numpy e scipy. Depende de align_sheet.py (mesma pasta)."""
import sys, os, time, argparse
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import align_sheet as al

PRESETS = [(('walk', 'andar', 'run', 'corr', 'dash'), ('torso', 'each')),
           (('hop', 'pulo', 'jump', 'salto', 'entry', 'entrada', 'land', 'queda', 'trip', 'rasteira', 'knock'), ('torso', 'global'))]

def preset_for(name):
    n = name.lower()
    for keys, val in PRESETS:
        if any(k in n for k in keys): return val
    return ('feet', 'each')

def body_sizes(A, boxes):
    hs, ws = [], []
    for row in boxes:
        for (x0, x1, y0, y1) in row:
            m = al.fg_mask(A[y0:y1, x0:x1])
            if m.any():
                ys, xs = np.nonzero(m); hs.append(ys.max() - ys.min() + 1); ws.append(xs.max() - xs.min() + 1)
    return max(hs), max(ws)

def prepare(path, outdir=None, anchor=None, ground=None, cell=None, ms=100):
    stem = os.path.splitext(os.path.basename(path))[0]; outdir = outdir or os.path.join(os.path.dirname(os.path.abspath(path)), 'sprites_prontos')
    os.makedirs(outdir, exist_ok=True)
    im = Image.open(path)
    if im.mode in ('RGBA', 'LA', 'P') and 'A' in im.getbands():
        print(f'AVISO ({stem}): a imagem tem transparência; o script espera o fundo verde (#00FF00). Pulei.'); return None
    A = np.asarray(im.convert('RGB')); H, W = A.shape[:2]
    boxes = al.auto_boxes(A)
    if not boxes: print(f'AVISO ({stem}): não achei nenhum personagem.'); return None
    pa, pg = preset_for(stem); anchor = anchor or pa; ground = ground or pg
    h, w = body_sizes(A, boxes)
    cell = cell or int(-(-max(h * 1.3, w * 1.15) // 32) * 32)               # ~1,3x a altura (ou 1,15x a largura), múltiplo de 32
    out, info = al.align(A, boxes, cell, anchor, ground)
    png = os.path.join(outdir, stem + '_aligned.png'); Image.fromarray(out).save(png)
    # GIF: quadros na ordem de leitura, UMA paleta pro GIF inteiro (as cores não mudam de quadro pra quadro)
    pal = Image.fromarray(out).quantize(256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    frames = [Image.fromarray(out[r * cell:(r + 1) * cell, c * cell:(c + 1) * cell]).quantize(palette=pal, dither=Image.Dither.NONE) for (r, c) in info['order']]
    gif = os.path.join(outdir, stem + '_aligned.gif'); frames[0].save(gif, save_all=True, append_images=frames[1:], duration=ms, loop=0, optimize=False)
    n, C, R = info['poses'], info['cols'], info['rows']; chk = Image.open(gif); chk_n = getattr(chk, 'n_frames', 1)
    txt = os.path.join(outdir, stem + '_bitmapflow.txt')
    with open(txt, 'w') as f:
        f.write(f"{stem}: {n} poses em {C} colunas x {R} linhas (achadas sozinho). Âncora {anchor}, chão {ground}, célula {cell}x{cell}.\n"
                f"Altura do corpo {min(info['heights'])} a {max(info['heights'])} px.\n\n"
                f"BITMAPFLOW, importando o _aligned.png: Frame count {n} | Frames per row {C} | Width {cell} | Height {cell} | Offset 0 | Margin 0\n"
                f"(ou arraste o _aligned.gif, que traz os {chk_n} quadros e não pede essas medidas; não testei no Bitmapflow)\n\n"
                f"Painel que ficou bom: Inbetweens 1, Loop seamlessly (só se o ciclo fecha na 1ª pose), DenseRLOF, grid step 6, forward backward 1, post processing ligado,\n"
                f"variational refinement desligado, Pixel art mode ligado. fps de entrada = metade do fps de saída desejado (com 1 inbetween). Ex.: {n} poses, entrada 5 -> saída 10 -> {n*2} quadros, {n*2/10:.1f} s.\n")
    for wmsg in info['warn']: print(f'AVISO ({stem}):', wmsg)
    print(f"OK {stem}: {n} poses ({C}x{R}), âncora {anchor}/{ground}, célula {cell}, corpo {min(info['heights'])}-{max(info['heights'])} px, GIF com {chk_n} quadros -> {outdir}")
    return dict(poses=n, gif_frames=chk_n, cell=cell, cols=C, rows=R, anchor=anchor, ground=ground, out=outdir)

def watch(folder, existing=False, **kw):
    folder = os.path.expanduser(folder); seen = {}
    if not existing:                                                            # por padrão IGNORA o que já está na pasta e só prepara o que chegar depois
        for fn in os.listdir(folder):
            p = os.path.join(folder, fn)
            if os.path.isfile(p): st = os.stat(p); seen[fn] = (st.st_mtime, st.st_size)
    print(f'vigiando {folder} (Ctrl+C pra parar), {"incluindo o que já está lá" if existing else "só arquivos NOVOS"}. Saídas em {folder}/sprites_prontos/')
    while True:
        for fn in sorted(os.listdir(folder)):
            p = os.path.join(folder, fn); stem, ext = os.path.splitext(fn)
            if ext.lower() not in ('.png', '.webp', '.jpg', '.jpeg') or stem.endswith('_aligned') or not os.path.isfile(p): continue
            st = os.stat(p); key = (st.st_mtime, st.st_size)
            if seen.get(fn) == key: continue
            time.sleep(1.0)
            if os.stat(p).st_size != st.st_size: continue                    # ainda baixando
            seen[fn] = key
            try: prepare(p, **kw)
            except Exception as e: print(f'ERRO em {fn}: {e}')
        time.sleep(2)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter); ap.add_argument('files', nargs='*'); ap.add_argument('--watch'); ap.add_argument('--tudo', action='store_true', help='com --watch: prepara também os arquivos que JÁ estão na pasta')
    ap.add_argument('--out'); ap.add_argument('--anchor', choices=['feet', 'torso']); ap.add_argument('--ground', choices=['each', 'global']); ap.add_argument('--cell', type=int); ap.add_argument('--ms', type=int, default=100)
    a = ap.parse_args(); kw = dict(outdir=a.out, anchor=a.anchor, ground=a.ground, cell=a.cell, ms=a.ms)
    if a.watch: watch(a.watch, existing=a.tudo, **kw)
    elif a.files:
        for f in a.files: prepare(os.path.expanduser(f), **kw)
    else: ap.print_help()
