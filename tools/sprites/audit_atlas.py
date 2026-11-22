# Auditoria automática de atlas (192x160 por célula): acha corte vertical/horizontal no corpo, sprite encostando na borda da célula,
# retângulo/risco solto e moldura. Uso: python3 tools/sprites/audit_atlas.py [spr/ninja_atlas.png ...]   (sem args: todos os spr/*_atlas.png)
# Gera prévia ampliada dos defeitos em /tmp/audit/<ninja>.png. Sai com código 1 se achar algo (dá pra usar antes de commitar).
import sys, glob, os, numpy as np
from PIL import Image
from scipy import ndimage as ndi
CW, CH = 192, 160

def audit_cell(cell):
    al = cell[..., 3] > 40
    if al.sum() < 30: return []
    out = []
    # 1) encostando na borda (corte do recorte)
    # 2) moldura / risco longo de ponta a ponta
    cs, rs = al.sum(0), al.sum(1)   # só conta se for linha ISOLADA (vizinhos bem mais vazios); corpo alto não é grade
    if any(cs[x] > CH * .6 and cs[max(0, x - 3)] < cs[x] * .5 and cs[min(CW - 1, x + 3)] < cs[x] * .5 for x in range(CW)) or \
       any(rs[y] > CW * .6 and rs[max(0, y - 3)] < rs[y] * .5 and rs[min(CH - 1, y + 3)] < rs[y] * .5 for y in range(CH)): out.append('!risco de grade/moldura')
    # 3) corte no corpo: coluna (ou linha) interior quase vazia entre duas bem preenchidas
    lab, n = ndi.label(al, structure=np.ones((3, 3)))
    area = ndi.sum(al, lab, range(1, n + 1)); m = int(np.argmax(area)); main = lab == (m + 1)
    my, mx = np.nonzero(main); bh = my.max() - my.min() + 1; bw = mx.max() - mx.min() + 1
    col = main.sum(0); row = main.sum(1)
    if main[:, 0].sum() > 14 or main[:, -1].sum() > 14:   # corpo cortado nas laterais (topo/base têm chama/pé, ignora)
         out.append('!corpo cortado pela borda da célula')
    for x in range(mx.min() + int(bw * .15), mx.max() - int(bw * .15)):
        l, r = col[max(0, x - 4)], col[min(CW - 1, x + 4)]
        if min(l, r) > bh * 0.45 and col[x] < 0.15 * min(l, r): out.append(f'!corte vertical x={x}'); break
    for y in range(my.min() + int(bh * .15), my.max() - int(bh * .15)):
        u, d = row[max(0, y - 4)], row[min(CH - 1, y + 4)]
        if min(u, d) > bw * 0.45 and row[y] < 0.15 * min(u, d): out.append(f'!corte horizontal y={y}'); break
    # 4) pedaço solto retangular, risco ou grande demais
    sl = ndi.find_objects(lab)
    for i in range(n):
        if i == m: continue
        yy, xx = sl[i]; h = yy.stop - yy.start; w = xx.stop - xx.start; a = area[i]
        if a < 12: continue
        fill = a / (h * w); gx = max(sl[m][1].start - xx.stop, xx.start - sl[m][1].stop, 0); gy = max(sl[m][0].start - yy.stop, yy.start - sl[m][0].stop, 0)
        lum = cell[lab == i + 1][:, :3].astype(int).mean()
        if fill > 0.85 and h >= 6 and w >= 6 and (lum < 60 or lum > 235): out.append(f'!retângulo solto {w}x{h}')
        elif min(h, w) <= 2 and max(h, w) >= 20 and fill > .95: out.append(f'risco solto {w}x{h}')
        elif a > 0.35 * area[m] and area[m] > 600 and max(gx, gy) > 1: out.append(f'!segundo corpo/duplicado solto ({int(a)}px)')
        elif a > 150 and max(gx, gy) > 6: out.append(f'pedaço grande solto ({int(a)}px a {max(gx, gy)}px)')
    return out

def edge_fragments(cell):
    # pedaço que NÃO é o corpo e encosta na borda da célula = resto da célula vizinha (ou efeito cortado): apaga
    al = cell[..., 3] > 0
    if not al.any(): return 0
    lab, n = ndi.label(al, structure=np.ones((3, 3)))
    if n < 2: return 0
    area = ndi.sum(al, lab, range(1, n + 1)); m = int(np.argmax(area)) + 1; k = 0; objs = ndi.find_objects(lab)
    for i in range(1, n + 1):
        if i == m: continue
        sl = objs[i - 1]
        if sl[0].start == 0 or sl[1].start == 0 or sl[0].stop == CH or sl[1].stop == CW: cell[lab == i] = 0; k += 1
    return k

def anim_rows(root):
    # lê js/sprites.js: ninja -> {linha: nome da anim}
    import re; t = open(os.path.join(root, 'js', 'sprites.js'), encoding='utf-8').read(); out = {}
    for m in re.finditer(r'^\s*(\w+):\{hd:.*?a:\{(.*?)\}\},?\s*$', t, re.M):
        out[m.group(1)] = {int(r): (n, int(f)) for n, r, f in re.findall(r'(\w+):\[(\d+),(\d+),', m.group(2))}
    return out

def run(path):
    a = np.array(Image.open(path).convert('RGBA')); H, W = a.shape[:2]; bad = []
    for r in range(H // CH):
        for c in range(W // CW):
            iss = audit_cell(a[r * CH:(r + 1) * CH, c * CW:(c + 1) * CW])
            if iss: bad.append((r, c, iss))
    name = os.path.basename(path).replace('_atlas.png', '')
    if bad:
        os.makedirs('/tmp/audit', exist_ok=True); cols = min(8, len(bad)); rows = (len(bad) + cols - 1) // cols
        sheet = Image.new('RGBA', (cols * CW * 2, rows * CH * 2), (60, 60, 70, 255)); im = Image.open(path).convert('RGBA')
        for k, (r, c, _) in enumerate(bad):
            t = im.crop((c * CW, r * CH, (c + 1) * CW, (r + 1) * CH)).resize((CW * 2, CH * 2), Image.NEAREST); sheet.alpha_composite(t, ((k % cols) * CW * 2, (k // cols) * CH * 2))
        sheet.save(f'/tmp/audit/{name}.png')
    print(f'{name}: {len(bad)} célula(s) suspeita(s)')
    for r, c, iss in bad: print(f'   linha {r} col {c}: {"; ".join(iss)}')
    return len(bad)

def fix(path, rows):
    # 1) apaga fragmentos de borda; 2) frames que continuam graves vão pra js/badframes.js (o jogo pula esses quadros)
    im = Image.open(path).convert('RGBA'); a = np.array(im); H, W = a.shape[:2]; frag = 0; bad = {}
    name = os.path.basename(path).replace('_atlas.png', '')
    for r in range(H // CH):
        for c in range(W // CW):
            frag += edge_fragments(a[r * CH:(r + 1) * CH, c * CW:(c + 1) * CW])
    Image.fromarray(a).save(path)
    for r in range(H // CH):
        for c in range(W // CW):
            iss = [x for x in audit_cell(a[r * CH:(r + 1) * CH, c * CW:(c + 1) * CW]) if x.startswith('!')]
            if iss and r in rows.get(name, {}) and c < rows[name][r][1]: bad.setdefault(rows[name][r][0], []).append(c)
    print(f'{name}: {frag} fragmento(s) de borda apagado(s); frames graves: {bad or "nenhum"}'); return name, bad

if __name__ == '__main__':
    if '--fix' in sys.argv:
        root = os.path.join(os.path.dirname(__file__), '..', '..'); rows = anim_rows(root); allbad = {}
        for f in [x for x in sys.argv[1:] if x != '--fix'] or sorted(glob.glob(os.path.join(root, 'spr', '*_atlas.png'))):
            n, b = fix(f, rows)
            if b: allbad[n] = b
        import json; man = os.path.join(os.path.dirname(__file__), 'badframes_manual.json')   # defeitos vistos a olho (ex.: 2 corpos colados) que o detector não pega
        for n, d in (json.load(open(man)) if os.path.exists(man) else {}).items():
            for an, fr in d.items(): allbad.setdefault(n, {}).setdefault(an, []); allbad[n][an] = sorted(set(allbad[n][an]) | set(fr))
        open(os.path.join(root, 'js', 'badframes.js'), 'w').write('// GERADO por tools/sprites/audit_atlas.py --fix: quadros com defeito (corpo cortado, corte, grade) que o jogo pula. Não editar à mão.\nconst BADF=' + __import__('json').dumps(allbad, separators=(',', ':')) + ';\n')
        sys.exit(0)
    fs = sys.argv[1:] or sorted(glob.glob(os.path.join(os.path.dirname(__file__), '..', '..', 'spr', '*_atlas.png')))
    sys.exit(1 if sum([run(f) for f in fs]) else 0)
