"""Confere os retratos redondos (ficha 52px, combos 30/38px) de todo o elenco: acha a cabeça no PNG (head_points do
qa_retratos), mede onde ela cai no círculo como o jogo desenha e acusa os fora de enquadramento. Gera prancha.
Uso: python3 tools/qa_retratos_mini.py [--out pasta]   (sai com código 1 se algum retrato estiver fora)"""
import argparse, sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from PIL import Image
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(Path(__file__).resolve().parent))
from qa_retratos import head_points, QuietHandler

ROOT = Path(__file__).resolve().parents[1]
ap = argparse.ArgumentParser(); ap.add_argument('--out', default='/tmp/retratos_mini'); a = ap.parse_args()
out = Path(a.out); out.mkdir(parents=True, exist_ok=True)

BUILD = """() => {
  const ids=[...IDS,'mestre'], box=document.createElement('div'); box.id='qaR';
  box.style.cssText='position:fixed;left:0;top:0;z-index:9999;background:#2a1a0e;display:grid;grid-template-columns:repeat(7,150px);gap:6px;padding:6px';
  document.body.appendChild(box); const res=[];
  for(const id of ids){ const cell=document.createElement('div'); cell.style.cssText='display:flex;gap:6px;align-items:center;color:#fff;font:11px sans-serif;flex-wrap:wrap;width:150px';
    const f=document.createElement('div'); f.className='parch'; f.style.width='60px'; f.innerHTML='<i class="fpor por"></i>'; cell.appendChild(f);
    portrait(f.querySelector('.fpor'),id,52/40,52,52);
    for(const sz of [30,38]){ CSZ=sz; const p=cPor(id,'',''); p.querySelector('.por').style.width=p.querySelector('.por').style.height=sz+'px'; cell.appendChild(p); }
    const l=document.createElement('span'); l.textContent=id; l.style.width='100%'; cell.appendChild(l); box.appendChild(cell);
    cell.querySelectorAll('.por').forEach(el=>{ const s=getComputedStyle(el), [w,h]=s.backgroundSize.split(' ').map(parseFloat);
      res.push({id,face:(FACE[id]?.idle)||SH[id].hd,d:el.clientWidth,w,h,x:parseFloat(s.backgroundPositionX),y:parseFloat(s.backgroundPositionY),row:SH[id].anim.idle[0],ch:SH[id].ch,W:SH[id].W,H:SH[id].H}); }); }
  return res; }"""

with ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=ROOT)) as srv, sync_playwright() as pw:
    Thread(target=srv.serve_forever, daemon=True).start()
    b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 1152, 'height': 648}, device_scale_factor=2)
    pg.goto(f"http://127.0.0.1:{srv.server_port}/index.html"); pg.wait_for_timeout(800)
    res = pg.evaluate(BUILD); pg.wait_for_timeout(500)
    pg.locator('#qaR').screenshot(path=str(out / 'prancha.png')); b.close()

bad, atlas_cache = [], {}
for r in res:
    if r['id'] not in atlas_cache: atlas_cache[r['id']] = Image.open(ROOT / f"spr/{r['id']}_atlas.png").convert('RGBA')
    im = atlas_cache[r['id']]; pts = head_points(im, 192, 160, r['row'])
    if not pts: bad.append(f"{r['id']} {r['d']}px: cabeça não encontrada"); continue
    k = r['w'] / im.width   # px de tela por px do atlas
    top = (pts[0][0], pts[0][1] - 2); cx, cy = pts[1][0] / 2 + pts[2][0] / 2, pts[1][1]   # topo da cabeça e centro do rosto
    fx, fy = r['face']
    if abs(cx - fx) > 14: cx, cy, top = fx, fy, (fx, fy - 16)   # detector caiu em asa/arma/efeito: confia no FACE medido
    # largura da cabeça: opacos na linha do rosto, perto do centro
    a = im.crop((int(cx) - 30, r['row'] * 160 + int(cy), int(cx) + 30, r['row'] * 160 + int(cy) + 1)).getchannel('A')
    xs = [i for i, v in enumerate(a.tobytes()) if v > 120]
    head_w = (xs[-1] - xs[0] + 1) * k if xs else 0
    sx = r['x'] + cx * k; sy = r['y'] + (r['row'] * r['ch'] + cy) * k; ty = r['y'] + (r['row'] * r['ch'] + top[1]) * k
    d = r['d']; dx, dy = sx / d - .5, sy / d - .5
    msg = []
    if abs(dx) > .22:   # 22%: cabelo/franja longa desloca o centro detectado (Mayoi ~20% e fica bem no olho)
        msg.append(f"rosto {'à direita' if dx > 0 else 'à esquerda'} ({dx:+.0%} do círculo)")
    if not -.2 <= dy <= .14: msg.append(f"rosto {'baixo' if dy > 0 else 'alto'} ({dy:+.0%})")
    if ty < -d * .05: msg.append("topo da cabeça cortado")
    if head_w > d * .85: msg.append(f"zoom alto: cabeça com {head_w / d:.0%} do círculo")
    if msg: bad.append(f"{r['id']} {d}px: " + ', '.join(msg))
print('\n'.join(bad) if bad else 'todos os retratos redondos enquadrados')
print('prancha:', out / 'prancha.png')
sys.exit(1 if bad else 0)
