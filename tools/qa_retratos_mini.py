"""Confere TODOS os retratos das telas reais (elenco da Formação e do Laboratório, ficha, Combos, Galeria, HUD da luta,
botões de jutsu, legenda do Forte) de todo o elenco. Para cada elemento com fundo de atlas (menos os bonecos .spr):
descobre a linha do atlas pelo background-position, acha a cabeça no PNG (head_points do qa_retratos; se cair longe do
FACE, usa o FACE) e mede no TAMANHO REAL do elemento: rosto no centro, topo da cabeça visível e zoom (cabeça cabendo).
Uso: python3 tools/qa_retratos_mini.py [--out pasta]   -> lista os defeitos, salva um print de cada tela; erro se houver defeito.
(O cut-in do jutsu tem verificador próprio: tools/qa_retratos.py.)"""
import argparse, sys
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from PIL import Image
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(Path(__file__).resolve().parent))
from qa_retratos import head_points, QuietHandler

ROOT = Path(__file__).resolve().parents[1]
ap = argparse.ArgumentParser(); ap.add_argument('--out', default='/tmp/retratos_mini'); a = ap.parse_args()
out = Path(a.out); out.mkdir(parents=True, exist_ok=True)

# coleta os retratos visíveis da tela atual
COLLECT = """(tag) => { const r=[];
  for(const el of document.querySelectorAll('*')){ if(el.classList.contains('spr'))continue;
    const s=getComputedStyle(el), m=s.backgroundImage.match(/spr\\/(\\w+)_atlas\\.png/); if(!m)continue;
    const b=el.getBoundingClientRect(); if(!b.width||!b.height||s.visibility==='hidden')continue;
    let p=el, vis=true; while(p){ if(getComputedStyle(p).display==='none'){vis=false;break;} p=p.parentElement; } if(!vis)continue;
    const [w,h]=s.backgroundSize.split(' ').map(parseFloat), id=m[1];
    r.push({tag,id,where:(el.id||el.className||el.tagName)+'',cw:el.clientWidth,chh:el.clientHeight,w,x:parseFloat(s.backgroundPositionX),y:parseFloat(s.backgroundPositionY),face:FACE[id]?.idle||SH[id]?.hd,icon:ICON_FACE[id]||null}); }
  return r; }"""

SCENES = [
 ('formacao', """()=>{ placed.length=0; ['kaen','mizuha','raiden','iwao'].forEach((id,i)=>placed.push({id,row:i%3,depth:i>2?1:0})); sel='fuuka'; show('sForm'); }"""),
 ('galeria', """()=>{ show('sGal'); }"""),
 ('academia', """()=>{ show('sAcad'); labTeam.length=0; ['fuuka','mayoi','poko','utsushi'].forEach((id,i)=>labTeam.push({id,row:i%3,depth:i>2?1:0})); drawAcad(); }"""),
]
TEAMS = [['kaen','mizuha','raiden','iwao'], ['fuuka','mayoi','hiyori','doku'], ['yugami','poko','utsushi','kazan'], ['keshin','kaen','mizuha','raiden']]

items = []
with ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=ROOT)) as srv, sync_playwright() as pw:
    Thread(target=srv.serve_forever, daemon=True).start()
    b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 1152, 'height': 648})
    pg.goto(f"http://127.0.0.1:{srv.server_port}/index.html"); pg.wait_for_timeout(800)
    pg.evaluate("()=>{ dev=true; }")   # libera todos (o retrato do bloqueado fica preto de propósito)
    for tag, js in SCENES:
        pg.evaluate(js); pg.wait_for_timeout(400); pg.screenshot(path=str(out / f'{tag}.png')); items += pg.evaluate(COLLECT, tag)
    for id in pg.evaluate("[...IDS]"):   # ficha de cada ninja na Formação
        pg.evaluate(f"()=>{{ show('sForm'); sel='{id}'; drawFicha($('fInfo'),'{id}'); }}"); pg.wait_for_timeout(60)
        items += [x for x in pg.evaluate(COLLECT, 'ficha') if 'fpor' in x['where']]
    for n, team in enumerate(TEAMS + [['mizuha', 'raiden', 'iwao', 'kaen'], ['raiden', 'iwao', 'kaen', 'mizuha'], ['iwao', 'kaen', 'mizuha', 'raiden']]):
        pg.evaluate(f"""()=>{{ run=()=>{{}}; acad=null; placed.length=0; {team}.forEach((id,i)=>placed.push({{id,row:i%3,depth:i>2?1:0}})); foeIx=0; startBattle2(); skTag(U.p[0],'Teste'); }}""")
        pg.wait_for_timeout(500)
        if n == 0: pg.screenshot(path=str(out / 'luta.png'))
        items += [x for x in pg.evaluate(COLLECT, 'luta') if x['where'] != 'cutP']
    b.close()

bad, cache, seen = [], {}, set()
for r in items:
    key = (r['tag'], r['id'], r['where'], r['cw'], r['chh'])
    if key in seen: continue
    seen.add(key)
    if r['id'] not in cache: cache[r['id']] = Image.open(ROOT / f"spr/{r['id']}_atlas.png").convert('RGBA')
    im = cache[r['id']]; k = r['w'] / im.width
    row = int((-r['y'] + r['chh'] / 2) / k // 160)
    is_icon = r['icon'] is not None and r['cw'] <= 34
    fx, fy = r['icon'] if is_icon else r['face']
    cx, cy, ty = fx, fy, fy - 16
    pts = head_points(im, 192, 160, row)
    if pts and row == 0 and not is_icon:
        dx_, dy_ = (pts[1][0] + pts[2][0]) / 2, pts[1][1]
        if abs(dx_ - fx) <= 14: cx, cy, ty = dx_, dy_, pts[0][1] - 2   # detector confiável só perto do FACE (Poko: asa)
    a_ = im.crop((int(cx) - 30, row * 160 + int(cy), int(cx) + 30, row * 160 + int(cy) + 1)).getchannel('A')
    xs = [i for i, v in enumerate(a_.tobytes()) if v > 120]
    head_w = (xs[-1] - xs[0] + 1) * k if xs else 0
    W, H = r['cw'], r['chh']
    sx = r['x'] + cx * k; sy = r['y'] + (row * 160 + cy) * k; top = r['y'] + (row * 160 + ty) * k
    dx, dy = sx / W - .5, sy / H - .5
    msg = []
    if abs(dx) > .22: msg.append(f"rosto {'à direita' if dx > 0 else 'à esquerda'} ({dx:+.0%})")
    if not -.25 <= dy <= .2: msg.append(f"rosto {'baixo' if dy > 0 else 'alto'} ({dy:+.0%})")
    if top < -H * .06: msg.append('topo da cabeça cortado')
    if head_w > min(W, H) * .95: msg.append(f'zoom alto ({head_w / min(W, H):.0%})')
    if msg: bad.append(f"[{r['tag']}] {r['id']} em {r['where']} {W}x{H}: " + ', '.join(msg))
print(f"{len(seen)} retratos conferidos")
print('\n'.join(bad) if bad else 'todos enquadrados')
print('prints em', out)
sys.exit(1 if bad else 0)
