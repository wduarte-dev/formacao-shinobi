#!/usr/bin/env python3
"""Formação Shinobi — pipeline de recorte parametrizado por ninja.

Uso (rodar de dentro de tools/sprites/):
  python3 shinobi_atlas.py config/<ninja>.json [--src DIR] [--out DIR] [--no-fx]

Lê os sheets (fundo verde chapado, grade N linhas x M colunas, 1 animação por linha),
gera:
  out/<ninja>_atlas.png  (células 192x160, pés em x=96 y=150, 8 colunas por linha)
  out/<ninja>_atlas.json (tabela de animações: linha, frames, fps, loop, pingpong)
  out/<ninja>_fx.png / _fx.json  (lote D, células próprias, alpha suave)
  out/<ninja>_preview.png / _fx_preview.png  (conferência visual)
Detalhes e ajustes manuais: docs/pipeline-sprites.md
"""
import json, os, argparse
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

CW, CH, AX, BASE, COLS = 192, 160, 96, 150, 8

# padrões por nome de animação (o config pode sobrescrever qualquer campo)
#   anchor: 'feet' = alinha pelo pé de cada frame | 'cell' = mantém o deslocamento dentro da célula
#   air: frames fora do chão (baseline vem do sheet, não da mediana da linha)
#   ref: linha boa pra medir a altura do boneco (normalização de escala entre sheets)
DEF = {
 'idle':     dict(fps=6,  loop=1, ref=1, breathe='auto', pingpong=1),
 'walk':     dict(fps=10, loop=1, ref=1),
 'dash':     dict(fps=14, loop=1, anchor='cell'),
 'attack':   dict(fps=12, loop=0),
 'strong':   dict(fps=12, loop=0, anchor='cell'),
 'guard':    dict(fps=8,  loop=0, ref=1),
 'hurt':     dict(fps=10, loop=0),
 'dodge':    dict(fps=12, loop=0, anchor='cell', air=1),
 'seals':    dict(fps=12, loop=0, ref=1),
 'jutsu':    dict(fps=12, loop=0),
 'buff':     dict(fps=10, loop=0, ref=1),
 'stun':     dict(fps=8,  loop=1, ref=1),
 'victory':  dict(fps=8,  loop=1),
 'defeat':   dict(fps=8,  loop=0, anchor='cell'),
 'knockback':dict(fps=10, loop=0, anchor='cell'),
 'launched': dict(fps=10, loop=0, anchor='cell', air=1),
 'knockdown':dict(fps=8,  loop=0, anchor='cell'),
 'chase':    dict(fps=12, loop=0, anchor='cell', air=1),
}

# ---------------------------------------------------------------- chroma key
def green_excess(a):
    return a[..., 1] - np.maximum(a[..., 0], a[..., 2])

def remove_grid_lines(bgish, keep):
    """Linhas de grade: colunas/linhas finas quase inteiras 'frente'. Retorna keep limpo."""
    for axis in (0, 1):
        frac = keep.mean(axis=axis)
        pad = np.pad(frac, 6, mode='edge')
        neigh = np.minimum(pad[:-12], pad[12:])
        lines = np.nonzero((frac > 0.6) & (frac - neigh > 0.35))[0]
        for i in lines:
            if axis == 0: keep[:, i] = False
            else: keep[i, :] = False
    return keep

def key_hard(a, cfg):
    """Máscara dura do personagem: tudo que puxa pro verde é fundo."""
    k = green_excess(a)
    t = cfg.get('key_t', 38)
    bgm = k > 100
    G = np.median(a[bgm], axis=0) if bgm.sum() > 100 else np.array([0, 255, 0], np.float32)
    # fundo = puxa pro verde E perto do verde do próprio sheet (brilho menta/turquesa claro fica)
    near = (a[..., 0] - G[0] < 70) & (a[..., 2] - G[2] < 70)
    fg = ~((k >= t) & near)
    fg = remove_grid_lines(None, fg)
    fg = ndi.binary_opening(fg, structure=np.ones((2, 2)))
    return fg

def key_soft(a, cfg):
    """Alpha suave p/ efeitos: separa a mistura com o verde (unmix) e devolve (rgb, alpha)."""
    k = np.clip(green_excess(a), 0, None)
    bgm = k > 90
    G = np.median(a[bgm], axis=0) if bgm.sum() > 100 else np.array([0, 255, 0], float)
    kbg = max(1.0, float(np.median(k[bgm])) if bgm.sum() > 100 else 255.0)
    al = np.clip(1.0 - k / (kbg * 0.92), 0, 1)
    al[al < 0.06] = 0
    keep = al > 0.25
    keep = remove_grid_lines(None, keep.copy())
    lines = (al > 0.25) & ~keep & (k > 25)
    al[lines] = 0
    A = np.maximum(al, 1e-3)[..., None]
    F = (a - (1 - A) * G[None, None, :]) / A
    F = np.clip(F, 0, 255)
    F[..., 1] = np.minimum(F[..., 1], np.maximum(F[..., 0], F[..., 2]) + 6)  # despill
    return F, al

def despill(rgb):
    out = rgb.copy()
    m = np.maximum(out[..., 0], out[..., 2])
    out[..., 1] = np.minimum(out[..., 1], m)
    return out

def teal_fix(rgb, mask):
    """Puxa turquesa/ciano-esverdeado pra azul-gelo (verde passa a ficar abaixo do azul)."""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    t = mask & (g > r + 25) & (b > r + 25) & (g > b * 0.9)
    rgb[..., 1] = np.where(t, np.minimum(g, b * 0.84), g)
    return rgb

# ---------------------------------------------------------------- grade
def cuts_1d(proj, n, start, stop, slack=0.22):
    """n células entre start e stop: corta no mínimo da projeção perto da divisão uniforme."""
    L = stop - start; edges = [start]
    for j in range(1, n):
        c = start + L * j / n; w = int(L / n * slack)
        lo, hi = int(c - w), int(c + w)
        seg = proj[lo:hi]
        z = np.nonzero(seg == seg.min())[0]
        best = z[np.argmin(np.abs(z - (c - lo)))]
        edges.append(lo + int(best))
    edges.append(stop)
    return edges

def erase_label(fg, H, W):
    lab, k = ndi.label(fg, structure=np.ones((3, 3)))
    for i, sl in enumerate(ndi.find_objects(lab), 1):
        # rótulo curto no canto OU faixa escura da largura toda no topo
        if sl[0].stop < H * 0.03 and sl[1].stop < W * 0.5:   # texto do rótulo solto no topo (faixa verde-escura)
            fg[lab == i] = False; continue
        if sl[0].start <= 2 and sl[0].stop < H * 0.07 and (sl[1].stop < W * 0.5 or sl[1].stop - sl[1].start > W * 0.9):
            fg[lab == i] = False
    return fg

# ---------------------------------------------------------------- frames de um sheet
class Sheet:
    def __init__(s, path, sc, ncfg):
        s.path = path; s.sc = sc
        s.a = np.array(Image.open(path).convert('RGB')).astype(np.float32)
        s.H, s.W = s.a.shape[:2]
        fg = key_hard(s.a, ncfg)
        fg = erase_label(fg, s.H, s.W)
        s.fg = fg
        s.rgb = despill(s.a)
        if ncfg.get('teal_fix'): s.rgb = teal_fix(s.rgb, fg)
        rows, cols = sc['rows'], sc.get('cols', 8)
        s.redges = cuts_1d(fg.sum(1), rows, 0, s.H)
        s.lab, _ = ndi.label(fg, structure=np.ones((3, 3)))
        s.objs = ndi.find_objects(s.lab)
        s.rows = []
        for r in range(rows):
            y0, y1 = s.redges[r], s.redges[r + 1]
            band = fg[y0:y1]
            cedges = cuts_1d(band.sum(0), cols, 0, s.W)
            s.rows.append(dict(y0=y0, y1=y1, cedges=cedges, cells=[[] for _ in range(cols)]))
        minarea = ncfg.get('speck', 14) * (s.W / 1536) ** 2
        for i, sl in enumerate(s.objs, 1):
            if sl is None: continue
            m = s.lab[sl] == i; area = int(m.sum())
            if area < minarea: continue
            ys, xs = np.nonzero(m); cy = ys.mean() + sl[0].start; cx = xs.mean() + sl[1].start
            r = min(rows - 1, max(0, np.searchsorted(s.redges, cy, 'right') - 1))
            R = s.rows[r]; c = min(cols - 1, max(0, np.searchsorted(R['cedges'], cx, 'right') - 1))
            R['cells'][c].append(dict(i=i, area=area, bb=(sl[1].start, sl[0].start, sl[1].stop, sl[0].stop)))
        s.frames = [s._row_frames(r) for r in range(rows)]

    def _row_frames(s, r):
        R = s.rows[r]; out = []
        cellw = s.W / len(R['cells'])
        for c, comps in enumerate(R['cells']):
            if not comps: continue
            comps.sort(key=lambda o: -o['area'])
            body = comps[0]
            parts = [body]
            for o in comps[1:]:
                bb, b2 = o['bb'], body['bb']
                dx = max(b2[0] - bb[2], bb[0] - b2[2], 0); dy = max(b2[1] - bb[3], bb[1] - b2[3], 0)
                if (dx * dx + dy * dy) ** .5 < cellw * 0.28 or o['area'] > body['area'] * 0.25:
                    parts.append(o)
            out.append(dict(col=c, body=body, parts=parts,
                            cx_cell=(R['cedges'][c] + R['cedges'][c + 1]) / 2,
                            area=sum(p['area'] for p in parts)))
        # sobras/frames fantasma: frame muito menor que a mediana da linha
        if out:
            med = np.median([f['body']['area'] for f in out])
            keep = [f for f in out if f['body']['area'] >= med * s.sc.get('ghost', 0.35)]
            s.dropped = getattr(s, 'dropped', []) + [(r, f['col']) for f in out if f not in keep]
            out = keep
        for f in out:
            ys, xs = s.mask_xy(f['body'])
            f['bottom'] = ys.max() + 1; f['top'] = ys.min(); f['h'] = f['bottom'] - f['top']
            f['w'] = xs.max() - xs.min() + 1
            low = ys >= f['bottom'] - max(3, int(f['h'] * 0.10))
            f['feet_x'] = xs[low].mean() if f['h'] >= f['w'] * 0.9 else (xs.min() + xs.max()) / 2
        return out

    def mask_xy(s, o):
        x0, y0, x1, y1 = o['bb']
        ys, xs = np.nonzero(s.lab[y0:y1, x0:x1] == o['i'])
        return ys + y0, xs + x0

    def frame_mask(s, f):
        x0 = min(p['bb'][0] for p in f['parts']); y0 = min(p['bb'][1] for p in f['parts'])
        x1 = max(p['bb'][2] for p in f['parts']); y1 = max(p['bb'][3] for p in f['parts'])
        m = np.isin(s.lab[y0:y1, x0:x1], [p['i'] for p in f['parts']])
        return m, (x0, y0, x1, y1)

# ---------------------------------------------------------------- resize / montagem
def resize_rgba(rgb, al, scale, hard=True):
    h, w = al.shape
    nw, nh = max(1, round(w * scale)), max(1, round(h * scale))
    pm = np.dstack([rgb * al[..., None], al * 255]).astype(np.float32)
    ch = [np.array(Image.fromarray(pm[..., i]).resize((nw, nh), Image.LANCZOS)) for i in range(4)]
    r = np.stack(ch, -1)
    A = np.clip(r[..., 3] / 255, 0, 1)
    rgbn = np.where(A[..., None] > 0.01, r[..., :3] / np.maximum(A[..., None], 0.01), 0)
    out = np.zeros((nh, nw, 4), np.uint8)
    out[..., :3] = np.clip(rgbn, 0, 255)
    out[..., 3] = (A > 0.5) * 255 if hard else np.clip(A * 255, 0, 255)
    if scale > 1.05:   # ampliado: devolve um pouco de nitidez
        from PIL import ImageFilter
        im = Image.fromarray(out, 'RGBA')
        rgbs = im.convert('RGB').filter(ImageFilter.UnsharpMask(1.2, 90, 2))
        out = np.array(Image.merge('RGBA', (*rgbs.split(), im.split()[3])))
    return out

def breathe(img, peak=3):
    """Respiração: metade de cima sobe 'peak' px; pés parados."""
    a = np.array(img); al = a[..., 3] > 0
    ys = np.nonzero(al.any(1))[0]
    if len(ys) == 0: return lambda d: img
    top, bot = ys.min(), ys.max()
    waist = int(top + (bot - top) * 0.55); blend = max(4, int((bot - top) * 0.12))
    def shifted(d):
        out = np.zeros_like(a)
        for y in range(a.shape[0]):
            if y < waist - blend: dy = d
            elif y < waist: dy = d * (waist - y) / blend
            else: dy = 0
            sy = int(round(y + dy))
            if 0 <= sy < a.shape[0]: out[y] = a[sy]
        return Image.fromarray(out, 'RGBA')
    return shifted

def is_static(frames):
    if len(frames) < 2: return True
    arrs = [np.array(f)[..., 3] > 0 for f in frames]
    diffs = [(arrs[i] ^ arrs[0]).sum() / max(1, arrs[0].sum()) for i in range(1, len(arrs))]
    return max(diffs) < 0.06

# ---------------------------------------------------------------- pipeline do personagem
def build_character(cfg, src):
    body_h = cfg.get('body_h', 115)
    anims = []; log = []
    for sc in cfg['sheets']:
        S = Sheet(os.path.join(src, sc['file']), sc, cfg)
        specs = []
        for a in sc['anims']:
            a = {'name': a} if isinstance(a, str) else dict(a)
            d = dict(DEF.get(a['name'], dict(fps=10, loop=0))); d.update(a); specs.append(d)
        if len(specs) != len(S.frames):
            log.append(f"!! {sc['file']}: {len(S.frames)} linhas detectadas vs {len(specs)} animações no config")
        # escala do sheet: altura do boneco nas linhas de referência
        refh = []
        for r, sp in enumerate(specs):
            if r >= len(S.frames): break
            fr = S.frames[r]
            if sc.get('ref'):
                if sp['name'] in sc['ref']: refh += [f['h'] for f in fr]
                for item in sc['ref']:
                    if ':' in item and item.split(':')[0] == sp['name']:
                        idx = [int(i) for i in item.split(':')[1].split(',')]
                        refh += [fr[i]['h'] for i in idx if i < len(fr)]
            elif sp.get('ref'):
                refh += [f['h'] for f in fr if f['h'] > f['w']]
        if not refh:
            allh = [f['h'] for r, fr in enumerate(S.frames) if r < len(specs) and not specs[r].get('air') for f in fr if f['h'] > f['w']]
            refh = [np.percentile(allh, 85)] if allh else [body_h]
        ref = float(np.median(refh)); scale = body_h / ref * sc.get('scale_mul', 1.0)
        offs = []
        for r, sp in enumerate(specs):
            if r < len(S.frames) and not sp.get('air') and S.frames[r]:
                R = S.rows[r]; offs.append(np.median([f['bottom'] for f in S.frames[r]]) - R['y0'])
        sheet_off = float(np.median(offs)) if offs else None
        log.append(f"{sc['file']}: {S.W}x{S.H}, linhas {[len(fr) for fr in S.frames]}, altura ref {ref:.0f}px -> escala {scale:.3f}"
                   + (f", descartados {S.dropped}" if getattr(S, 'dropped', None) else ''))
        for r, sp in enumerate(specs):
            if r >= len(S.frames): continue
            fr = S.frames[r]; R = S.rows[r]
            if sp.get('drop'): fr = [f for i, f in enumerate(fr) if i not in sp['drop']]
            if sp.get('use'): fr = [fr[i] for i in sp['use'] if i < len(fr)]
            if sp.get('frames') and len(fr) != sp['frames']:
                log.append(f"  ! {sp['name']}: {len(fr)} frames (esperado {sp['frames']})")
            if not fr: continue
            if sp.get('air'):
                baseline = float(max(f['bottom'] for f in fr)) if len(fr) > 1 else \
                    R['y0'] + (sheet_off if sheet_off is not None else (R['y1'] - R['y0']) * 0.9)
            else:
                baseline = float(np.median([f['bottom'] for f in fr]))
            snap = (R['y1'] - R['y0']) * 0.025
            f0 = fr[0]; off0 = f0['feet_x'] - f0['cx_cell']
            imgs = []; clipped = []
            for ci, f in enumerate(fr):
                m, (x0, y0, x1, y1) = S.frame_mask(f)
                rgb = S.rgb[y0:y1, x0:x1]
                spr = resize_rgba(rgb, m.astype(np.float32), scale)
                ax_src = f['cx_cell'] + off0 if sp.get('anchor', 'feet') == 'cell' else f['feet_x']
                ref_y = f['bottom'] if abs(f['bottom'] - baseline) <= snap else baseline
                px = int(round(AX - (ax_src - x0) * scale)); py = int(round(BASE - (ref_y - y0) * scale))
                cv = Image.new('RGBA', (CW, CH), (0, 0, 0, 0)); sp_im = Image.fromarray(spr, 'RGBA')
                cv.paste(sp_im, (px, py), sp_im)
                if px < 0 or py < 0 or px + spr.shape[1] > CW or py + spr.shape[0] > CH: clipped.append(ci)
                imgs.append(cv)
            if (sp.get('breathe') == 'auto' and is_static(imgs)) or sp.get('breathe') in (True, 'first'):
                n = max(len(imgs), 6); bp = cfg.get('breathe_px', 3)
                wave = [int(round((1 - np.cos(2 * np.pi * i / n)) / 2 * bp)) for i in range(n)]
                base_imgs = imgs[:1] if sp.get('breathe') == 'first' else imgs; imgs = []
                for i in range(n):
                    b = base_imgs[i % len(base_imgs)]
                    imgs.append(breathe(b)(wave[i]) if wave[i] else b)
                sp['pingpong'] = 0
                log.append(f"  {sp['name']}: parado -> respiração aplicada ({wave})")
            if len(imgs) > COLS:
                log.append(f"  ! {sp['name']}: {len(imgs)} frames, cortado em {COLS}"); imgs = imgs[:COLS]
            anims.append(dict(name=sp['name'], imgs=imgs, fps=sp['fps'], loop=sp['loop'],
                              pingpong=sp.get('pingpong', 0), clipped=clipped))
            log.append(f"  {sp['name']:10s} {len(imgs)} frames" + (f"  clip={clipped}" if clipped else ''))
    return anims, log

def save_character(name, anims, out):
    atlas = Image.new('RGBA', (COLS * CW, len(anims) * CH), (0, 0, 0, 0)); table = []
    for r, an in enumerate(anims):
        for c, im in enumerate(an['imgs']): atlas.paste(im, (c * CW, r * CH))
        table.append(dict(name=an['name'], row=r, col=0, n=len(an['imgs']), fps=an['fps'],
                          loop=an['loop'], pingpong=an['pingpong']))
    atlas.save(f'{out}/{name}_atlas.png', optimize=True)
    json.dump(dict(cw=CW, ch=CH, ax=AX, base=BASE, cols=COLS, w=atlas.width, h=atlas.height, anims=table),
              open(f'{out}/{name}_atlas.json', 'w'), indent=1)
    L = 90
    pv = Image.new('RGBA', (L + atlas.width, atlas.height), (34, 36, 44, 255)); d = ImageDraw.Draw(pv)
    for r in range(len(anims)):
        for c in range(COLS):
            x, y = L + c * CW, r * CH
            d.rectangle([x, y, x + CW - 1, y + CH - 1], fill=(44, 47, 58, 255) if (r + c) % 2 else (38, 40, 50, 255))
            d.line([x, y + BASE, x + CW, y + BASE], fill=(90, 200, 120, 255))
            d.line([x + AX, y + BASE - 6, x + AX, y + BASE + 6], fill=(230, 90, 90, 255))
        d.text((4, r * CH + 6), anims[r]['name'], fill=(255, 255, 255, 255))
        d.text((4, r * CH + 20), f"{len(anims[r]['imgs'])}f {anims[r]['fps']}fps", fill=(170, 170, 190, 255))
    pv.alpha_composite(atlas, (L, 0))
    pv.convert('RGB').save(f'{out}/{name}_preview.png')

# ---------------------------------------------------------------- lote D (efeitos)
def build_fx(cfg, src, out, name):
    fc = cfg['fx']; FW, FH = fc.get('cw', 288), fc.get('ch', 192)
    a = np.array(Image.open(os.path.join(src, fc['file'])).convert('RGB')).astype(np.float32)
    H, W = a.shape[:2]
    F, al = key_soft(a, cfg)
    # faixa escura do rótulo no topo: apaga as linhas de cima até a primeira linha majoritariamente verde
    gm = (a[:, :, 1] > 170) & (a[:, :, 0] < 120) & (a[:, :, 2] < 120)
    top = next((y for y in range(int(H * 0.08)) if gm[y].mean() > 0.6), 0)
    if top: al[:top + 2] = 0
    hard = al > 0.3
    hard = erase_label(hard, H, W)
    lbl = (al > 0.3) & ~hard
    al[ndi.binary_dilation(lbl, iterations=2)] = 0
    rows, cols = fc['rows'], fc.get('cols', 6); use = fc.get('use_cols', cols)
    redges = cuts_1d((al > 0.3).sum(1), rows, 0, H)
    names = fc.get('names', [f'fx{i}' for i in range(rows)])
    atlas = Image.new('RGBA', (COLS * FW, rows * FH), (0, 0, 0, 0)); table = []
    for r in range(rows):
        y0, y1 = redges[r], redges[r + 1]
        cedges = cuts_1d((al[y0:y1] > 0.3).sum(0), cols, 0, W)
        cw = W / cols; chh = y1 - y0
        s = min(FW / cw, FH / chh) * fc.get('scale_mul', 0.96)
        n = 0
        for c in range(min(use, cols)):
            x0, x1 = cedges[c], cedges[c + 1]
            sub_al = al[y0:y1, x0:x1].copy()
            if sub_al.max() < 0.3: continue
            lb, k = ndi.label(sub_al > 0.15)
            if k:
                areas = ndi.sum(np.ones_like(sub_al), lb, range(1, k + 1))
                small = np.isin(lb, np.nonzero(areas < 6)[0] + 1); sub_al[small] = 0
            spr = resize_rgba(F[y0:y1, x0:x1], sub_al, s, hard=False)
            im = Image.fromarray(spr, 'RGBA')
            px = int(round((FW - im.width) / 2)); py = int(round((FH - im.height) / 2))
            atlas.paste(im, (n * FW + px, r * FH + py), im); n += 1
        table.append(dict(name=names[r], row=r, n=n, fps=fc.get('fps', 12)))
    atlas.save(f'{out}/{name}_fx.png', optimize=True)
    json.dump(dict(cw=FW, ch=FH, cols=COLS, w=atlas.width, h=atlas.height, fx=table), open(f'{out}/{name}_fx.json', 'w'), indent=1)
    pv = Image.new('RGBA', atlas.size, (30, 32, 40, 255)); d = ImageDraw.Draw(pv)
    for r in range(rows):
        for c in range(COLS):
            d.rectangle([c * FW, r * FH, c * FW + FW - 1, r * FH + FH - 1], outline=(60, 64, 78, 255))
        d.text((4, r * FH + 4), names[r], fill=(255, 255, 255, 255))
    pv.alpha_composite(atlas); pv.convert('RGB').save(f'{out}/{name}_fx_preview.png')
    return [f"fx {fc['file']}: {rows} linhas, frames {[t['n'] for t in table]}, célula {FW}x{FH}"]

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('config'); ap.add_argument('--src'); ap.add_argument('--out', default='out')
    ap.add_argument('--no-fx', action='store_true')
    a = ap.parse_args()
    cfg = json.load(open(a.config)); name = cfg['name']
    global COLS; COLS = cfg.get('cols_out', COLS)   # colunas do atlas de saída (padrão 8; mais = anims mais longas)
    src = a.src or os.path.join('src', name); os.makedirs(a.out, exist_ok=True)
    anims, log = build_character(cfg, src)
    save_character(name, anims, a.out)
    if cfg.get('fx') and not a.no_fx: log += build_fx(cfg, src, a.out, name)
    print('\n'.join(log))

if __name__ == '__main__':
    main()
