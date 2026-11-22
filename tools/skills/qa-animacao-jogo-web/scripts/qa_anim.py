#!/usr/bin/env python3
"""QA visual de animação para jogo de navegador (genérico). Grava a partida em vídeo (Playwright), instrumenta funções globais do jogo
(definidas no --config), calibra vídeo x eventos com um quadro vermelho e gera, por ação, uma TIRA DE QUADROS com os eventos marcados
+ relatorio.txt (linha do tempo, TEMPO MORTO > 450 ms sem evento, ATRASO entre pouso/poeira e dano).
Uso: python3 qa_anim.py --root <pasta do jogo> --config <config.json> [--team a,b,c,d] [--mis 0] [--set "js"] [--only id] [--kind cat|chase]
                        [--fps 12] [--w 288] [--secs 90] [--max 12] [--out /tmp/qa]
Config: ver references/config-formacao-shinobi.json (page, start_js, setup_js com TEAM/MIS, done_js, who, hooks[fn,kind,label,async?,end?])."""
import sys, os, json, time, subprocess, argparse, glob, shutil
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
ap = argparse.ArgumentParser()
ap.add_argument('--root', required=True); ap.add_argument('--config', required=True)
ap.add_argument('--team', default=''); ap.add_argument('--mis', type=int, default=0); ap.add_argument('--set', default='')
ap.add_argument('--only', default=''); ap.add_argument('--kind', default=''); ap.add_argument('--fps', type=int, default=12)
ap.add_argument('--w', type=int, default=288); ap.add_argument('--secs', type=int, default=90); ap.add_argument('--max', type=int, default=12)
ap.add_argument('--out', default='/tmp/qa'); ap.add_argument('--port', type=int, default=8780)
a = ap.parse_args(); C = json.load(open(a.config))
shutil.rmtree(a.out, ignore_errors=True); os.makedirs(a.out + '/vid', exist_ok=True)
srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(a.port), '-d', a.root], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
hooks = ''.join("H(%s,%s,%s,%s,%s);" % (json.dumps(h['fn']), json.dumps(h['kind']), h['label'], 'true' if h.get('async') else 'false', json.dumps(h.get('end', ''))) for h in C['hooks'])
HOOK = """()=>{ window.QAL=[]; const L=(k,o)=>{ if(o)QAL.push(Object.assign({},o,{k,ts:Date.now()})); }; const WHO=%s;
 const H=(f,kind,lab,isA,end)=>{ const o=window[f]; if(typeof o!=='function')return;
  window[f]=isA?async function(...x){ try{L(kind,lab(...x));}catch(e){} try{ return await o.apply(this,x); } finally{ if(end)try{L(end,lab(...x));}catch(e){} } }
              :function(...x){ try{L(kind,lab(...x));}catch(e){} return o.apply(this,x); }; };
 %s }""" % (C.get('who', 'u=>String(u)'), hooks)
team = (a.team or C.get('team', '')).split(',')
errs = []
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={'width': 1152, 'height': 648}, record_video_dir=a.out + '/vid', record_video_size={'width': 1152, 'height': 648})
        pg = ctx.new_page(); t_vid0 = time.time() * 1000
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(f"http://localhost:{a.port}/{C.get('page','index.html')}"); pg.wait_for_timeout(900)
        if C.get('start_js'): pg.evaluate("()=>{%s}" % C['start_js']); pg.wait_for_timeout(300)
        pg.evaluate(HOOK)
        cal_ts = pg.evaluate("()=>{ const d=document.createElement('div'); d.style.cssText='position:fixed;inset:0;background:#f00;z-index:99999'; document.body.appendChild(d); const t=Date.now(); setTimeout(()=>d.remove(),300); return t; }")
        pg.wait_for_timeout(500)
        pg.evaluate("()=>{ const TEAM=%s, MIS=%d; %s; %s }" % (json.dumps(team), a.mis, a.set, C['setup_js']))
        t0 = time.time()
        while time.time() - t0 < a.secs:
            pg.wait_for_timeout(1000)
            if C.get('done_js') and pg.evaluate("()=>{ try{ return !!(%s); }catch(e){ return false; } }" % C['done_js']): break
        ev = pg.evaluate("()=>QAL"); ctx.close(); b.close()
finally:
    srv.terminate()
vid = glob.glob(a.out + '/vid/*.webm')[0]
off = 0
calf = a.out + '/cal'; os.makedirs(calf, exist_ok=True)
subprocess.run(['ffmpeg', '-v', 'error', '-i', vid, '-t', '12', '-vf', 'fps=30,scale=32:18', f'{calf}/%04d.png'])
for j, f in enumerate(sorted(glob.glob(calf + '/*.png'))):
    r, g, b_ = Image.open(f).convert('RGB').getpixel((16, 9))
    if r > 200 and g < 60 and b_ < 60: off = j * 1000 / 30 - (cal_ts - t_vid0); break
shutil.rmtree(calf)
for e in ev: e['ms'] = e['ts'] - t_vid0 + off      # tempo no vídeo, calibrado pelo quadro vermelho (±33ms)
# agrupa por ação: do 'act' até o 'actEnd' do mesmo ninja (perseguições caem dentro da ação que abriu o combo)
acts = []; cur = None
for e in ev:
    if e['k'] == 'act': cur = {'u': e['u'], 's': e.get('s',''), 'kind': e.get('cat','acao'), 'ev': [e], 'chains': 0}; acts.append(cur)
    elif cur:
        cur['ev'].append(e)
        if e['k'] == 'chain': cur['chains'] += 1
        if e['k'] == 'actEnd' and e['u'] == cur['u']: cur = None
def want(x):
    if a.only and not any(ev_['u'].startswith(a.only) for ev_ in x['ev'] if ev_['k'] in ('act', 'anim')): return False
    if a.kind == 'chase': return x['chains'] > 0
    if a.kind and a.kind != 'chase': return x['kind'] == a.kind
    return True
sel = [x for x in acts if want(x)][:a.max]
rep = []
for i, x in enumerate(sel):
    s0, s1 = x['ev'][0]['ms'] - 150, x['ev'][-1]['ms'] + 250
    fr = f"{a.out}/f{i}"; os.makedirs(fr, exist_ok=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{max(0,s0)/1000:.3f}', '-i', vid, '-t', f'{(s1-s0)/1000:.3f}', '-vf', f'fps={a.fps},scale={a.w}:{a.w*9//16}', f'{fr}/%04d.png'])
    fs = sorted(glob.glob(fr + '/*.png'))
    if not fs: continue
    W_, H_ = a.w, a.w * 9 // 16; cols = max(4, 2304 // W_); rows = (len(fs) + cols - 1) // cols; sheet = Image.new('RGB', (cols * W_, rows * (H_ + 16)), (16, 16, 22)); d = ImageDraw.Draw(sheet)
    for j, f in enumerate(fs):
        tms = s0 + j * 1000 / a.fps; tw = tms + 1000 / a.fps
        win = [e for e in x['ev'] if tms <= e['ms'] < tw]
        im = Image.open(f); X, Y = (j % cols) * W_, (j // cols) * (H_ + 16); sheet.paste(im, (X, Y + 16))
        col = (255, 60, 60) if any(e['k'] == 'hurt' for e in win) else (80, 160, 255) if any(e['k'] in ('knock', 'dust') for e in win) else (255, 210, 60) if any(e['k'] == 'anim' and e['u'] == x['u'] for e in win) else None
        if col: d.rectangle([X, Y + 16, X + W_ - 1, Y + H_ + 15], outline=col, width=4)
        lab = f"{int(tms - x['ev'][0]['ms'])}ms " + ' '.join(sorted({(e['k'] if e['k'] != 'anim' else e['n']) for e in win}))[:40]
        d.text((X + 3, Y + 2), lab, fill=(230, 230, 230))
    name = f"{a.out}/acao_{i:02d}_{x['u'].split(':')[0]}_{x['kind']}{'_combo' if x['chains'] else ''}.png"; sheet.save(name); shutil.rmtree(fr)
    # relatório: linha do tempo + tempo morto
    t0e = x['ev'][0]['ms']; lines = [f"== {os.path.basename(name)}: {x['u']} {x['s']} ({x['kind']}, {x['chains']} perseguição(ões))"]
    vis = [e for e in x['ev'] if e['k'] in ('anim', 'hurt', 'knock', 'fx', 'dust', 'dash', 'shot', 'chain')]
    for e in vis: lines.append(f"   {int(e['ms']-t0e):5d} ms  {e['k']:5s} {e.get('u','')} {e.get('n', e.get('s', e.get('d','')))}")
    for p_, q in zip(vis, vis[1:]):
        if q['ms'] - p_['ms'] > 450: lines.append(f"   !! TEMPO MORTO {int(q['ms']-p_['ms'])} ms entre '{p_['k']} {p_.get('n','')}' e '{q['k']} {q.get('n','')}' (em {int(p_['ms']-t0e)} ms)")
    for k, e in enumerate(x['ev']):
        if e['k'] in ('dust', 'dash'):
            h = next((q for q in x['ev'][k+1:] if q['k'] == 'hurt'), None)
            if h and h['ms'] - e['ms'] > 260 and e['k'] == 'dust' and e.get('u','').split(':')[1:] != h.get('u','').split(':')[1:]: lines.append(f"   !! ATRASO: pouso/poeira em {int(e['ms']-t0e)} ms e dano só em {int(h['ms']-t0e)} ms")
    rep += lines
open(a.out + '/relatorio.txt', 'w').write('\n'.join(rep) + '\n')
print('\n'.join(rep)); print(f'{len(sel)} tiras em {a.out}', '| erros:', errs or 'nenhum')
