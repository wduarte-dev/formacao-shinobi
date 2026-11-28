#!/usr/bin/env python3
"""QA visual de animação: grava uma luta em vídeo e monta uma TIRA DE QUADROS por ação (golpe, jutsu, perseguição) com os eventos
marcados (anim trocando, dano, arremesso, efeito), pra enxergar dessincronia e "tempo morto" como um olho humano veria.

Uso: python3 tools/qa_anim.py [--team kaen,iwao,raiden,mizuha] [--mis 0] [--js "N.mizuha.chase.tsunami=1"] [--only iwao] [--kind chase]
                              [--fps 12] [--secs 90] [--out pasta_vazia]
Replay: python3 tools/qa_anim.py --replay kaen --expect-hits 1 --resumo
Saída em --out: acao_NN_<ninja>_<tipo>.png (tira: cada quadro com o tempo em ms desde o início da ação; borda vermelha = quadro com
dano, amarela = troca de anim do atacante, azul = arremesso/queda do alvo) + relatorio.txt (linha do tempo de cada ação e alertas
de TEMPO MORTO: intervalo sem nenhum evento visual > 450 ms dentro da ação, e atraso entre o atacante chegar/pousar e o dano).
Precisa: playwright (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers na nuvem), ffmpeg, Pillow. Não muda nada no jogo: instrumenta por fora."""
import sys, os, time, subprocess, argparse, glob, shutil
from functools import partial
from http.server import ThreadingHTTPServer
from tempfile import mkdtemp
from threading import Thread

from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

from qa_retratos import QuietHandler

ap = argparse.ArgumentParser()
ap.add_argument('--team', default='kaen,iwao,raiden,mizuha'); ap.add_argument('--mis', type=int, default=0)
ap.add_argument('--js', default=''); ap.add_argument('--only', default=''); ap.add_argument('--kind', default='')
ap.add_argument('--fps', type=int, default=12); ap.add_argument('--secs', type=int, default=90); ap.add_argument('--out')
ap.add_argument('--max', type=int, default=12, help='máximo de tiras geradas'); ap.add_argument('--w', type=int, default=288, help='largura de cada quadro na tira')
ap.add_argument('--resumo', action='store_true', help='imprime só contagens e o caminho do relatório completo')
ap.add_argument('--replay', metavar='NINJA', help='grava uma ação pela rotina real de combate')
ap.add_argument('--target', default='iwao', help='ninja do lado oposto no replay')
ap.add_argument('--side', choices=['p', 'e'], default='p', help='lado do atacante no replay')
ap.add_argument('--clones', type=int, choices=range(4), default=0, help='clones vivos do Utsushi antes da ação')
ap.add_argument('--ko', action='store_true', help='começa com o alvo a 1 PV')
ap.add_argument('--speed', type=int, choices=[1, 2], default=1, help='velocidade do replay')
ap.add_argument('--expect-hits', type=int, help='falha se o contador de hits do replay for diferente')
ap.add_argument('--expect-ko', action='store_true', help='falha se o alvo sobreviver ao replay')
a = ap.parse_args()
KAZAN_REPLAYS = ('dragao', 'contador', 'entrada', 'guarda', 'idle', 'stun', 'victory', 'defeat')
if a.replay:
    a.kind = a.kind or 'chase'
    if a.kind not in ('chase', 'jutsu', 'forte', 'basico', *KAZAN_REPLAYS):
        ap.error('--kind deve ser chase, jutsu, forte, basico ou uma ação específica do Kazan')
    if a.kind in KAZAN_REPLAYS and (a.replay != 'kazan' or a.side != 'p'):
        ap.error('as ações específicas do Kazan exigem --replay kazan --side p')
    if a.clones and a.replay != 'utsushi':
        ap.error('--clones exige --replay utsushi')
elif a.expect_hits is not None or a.expect_ko:
    ap.error('--expect-hits e --expect-ko exigem --replay')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
a.out = a.out or mkdtemp(prefix='shinobi-anim-')
if os.path.isdir(a.out) and os.listdir(a.out):
    ap.error('--out deve apontar para uma pasta vazia')
os.makedirs(a.out + '/vid', exist_ok=True)
# instrumentação: embrulha funções globais do jogo e anota eventos com Date.now()
HOOK = r"""()=>{ window.QAL=[]; const L=(k,o)=>QAL.push(Object.assign({},o||{},{k,ts:Date.now()}));
 const nm=u=>u&&u.id?u.id+(u.side?':'+u.side:''):'';
 const wrap=(f,fn)=>{ const o=window[f]; if(!o)return; window[f]=function(...x){ try{fn(...x);}catch(e){} return o.apply(this,x); }; };
 const wrapA=(f,pre,post)=>{ const o=window[f]; if(!o)return; window[f]=async function(...x){ try{pre(...x);}catch(e){} try{ return await o.apply(this,x); } finally{ try{post&&post(...x);}catch(e){} } }; };
 wrapA('doSkill',(u,sk,isJ)=>{ if(window.qaReplayCounter&&sk===u.d.volley)return; L('act',{u:nm(u),s:sk.name,kind:sk===u.d.volley?'contador':sk===u.d.recast?'dragao':isJ?'jutsu':sk===u.d.strong?'forte':'basico'}); },(u,sk)=>{ if(!window.qaReplayCounter||sk!==u.d.volley)L('actEnd',{u:nm(u)}); });
 wrapA('chain',(side,t,count)=>L('chain',{t:nm(t),st:t.state}));
 wrap('comboLine',(name,count,id)=>L('chasePlayed',{u:id,s:name}));
 wrap('setAnim',(u,n)=>{ if(u&&u.side)L('anim',{u:nm(u),n}); });
 // acerto = quando a TELA mostra o dano (tocador.js), não quando a regra calcula: na fatia 3b a regra resolve adiantada
 if(typeof TELA==='object'&&TELA.dano){ const o=TELA.dano; TELA.dano=e=>{ try{L('hurt',{u:nm(e.t),d:e.d+(e.esc||0),c:e.cls});}catch(_){} return o(e); }; } else wrap('hurt',(t,d,c)=>L('hurt',{u:nm(t),d,c}));
 wrap('knock',(t,s)=>L('knock',{u:nm(t),s}));
 wrap('retrig',(el)=>{ if(el.id==='cut')L('fx',{n:'cut-in'}); });
 wrap('ink',text=>L('fx',{n:text}));
 wrap('kazanPoseChanged',u=>{ if(u.an!=='idle')L('frame',{u:nm(u),n:u.an+' '+(u.frame+1)}); });
 let dragonPart=-1;
 wrap('kazanDrawDragon',(c,d)=>{
   const part=Math.floor(d.t/260);
   if(part!==dragonPart){ dragonPart=part; L('fx',{u:'kazan',n:part<2?'erupção':'voo do dragão'}); }
 });
 wrap('kazanDragonBurst',()=>L('fx',{u:'kazan',n:'explosão de lava'}));
 wrapA('transitionField',(theme,enter)=>L('fx',{n:(enter?'entrada ':'saída ')+theme}),(theme)=>L('fx',{n:'revelação '+theme}));
 wrap('kazanShock',p=>L('fx',{u:'kazan',n:'onda de choque'}));
 wrap('kazanCinders',(p,n)=>{ if(n>=13)L('fx',{u:'kazan',n:'brasas'}); });
 wrap('fxSpr',(id,name)=>L('fx',{u:id,n:name}));
 wrap('waveFx',o=>L('fx',{u:'mizuha',n:o&&o.x!=null?'onda':'tsunami'}));
 wrap('dust',t=>L('dust',{u:nm(t)}));
 wrap('dashTo',u=>L('dash',{u:nm(u)}));
 wrap('shoot',u=>L('shot',{u:nm(u)}));
}"""
# Monta uma luta mínima com o HUD, sprites e efeitos normais, sem iniciar os turnos.
REPLAY_SETUP = """async ({id, targetId, side, kind, clones, custom}) => {
    for (const ninja of [id, targetId]) {
        if (!IDS.includes(ninja)) throw Error('Ninja desconhecido: ' + ninja);
    }
    const skill = N[id][{chase:'chase', basico:'normal', forte:'strong', jutsu:'jutsu'}[kind]];
    if (!skill && !custom) throw Error(id + ' não tem ação ' + kind);
    const [ally, enemy] = side === 'p' ? [id, targetId] : [targetId, id];
    const enemies = [[enemy, 1, 1]];
    if (kind === 'dragao') enemies.push(['raiden', 0, 1], ['mizuha', 2, 1]);
    await preloadFx([ally, ...enemies.map(e => e[0])], () => {});
    run = () => {};
    placed = [{id: ally, row: 1, depth: 1}];
    FOES[foeIx] = {...FOES[foeIx], team: enemies, mult: 1};
    startBattle2();
    round = 1;
    if (clones) summonClones(U[side][0], {...N[id].jutsu, clones});
}"""

REPLAY_ACTION = """async ({side, kind, ko, rate}) => {
    const actor = U[side][0], target = U[side === 'p' ? 'e' : 'p'][0];
    const skill = actor.d[{chase:'chase', basico:'normal', forte:'strong', jutsu:'jutsu'}[kind]];
    speed = rate;
    curSide = side;
    if (ko) { target.hp = 1; upd(target); }
    // Usa um valor fixo para as rolagens do motor, sem alterar as fórmulas de combate.
    Math.random = () => .5;
    const hp = target.hp, before = hitsR[side];
    if (kind === 'chase') {
        await knock(target, skill.on);
        const u = actor.id + ':' + side;
        QAL.push({k:'act', u, s:skill.name, kind, ts:Date.now()});
        try { await chain(side, target, 1); }
        finally { sceneOff(); QAL.push({k:'actEnd', u, ts:Date.now()}); }
    } else if (skill) {
        await doSkill(actor, skill, kind === 'jutsu');
    } else {
        const u = actor.id + ':' + side;
        QAL.push({k:'act', u, s:kind, kind, ts:Date.now()});
        try {
            if (kind === 'dragao') {
                setField(actor, actor.d.jutsu.field);
                await kazanSkill(actor, actor.d.recast);
            } else if (kind === 'contador') {
                window.qaReplayCounter = true;
                hitsR[side] = actor.d.combo.at; actor.comboUsed = false;
                await comboReactions();
            } else if (kind === 'guarda') {
                curSide = target.side;
                landHit(target, actor, 1, true, '');
                await knock(actor, 'R');
                await sleep(animMs(actor, 'guard'));
            } else if (kind === 'entrada') {
                await intro();
            } else {
                const anim = kind === 'defeat' ? 'die' : kind;
                setAnim(actor, anim, 0, true);
                await sleep(animMs(actor, anim) + 120);
            }
        } finally {
            endCine(); sceneOff();
            QAL.push({k:'actEnd', u, ts:Date.now()});
        }
    }
    return {name:skill?.name || kind, hits:hitsR[side]-before, hp, left:target.hp, state:target.state, alive:target.alive};
}"""

errs = []
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=ROOT))
Thread(target=server.serve_forever, daemon=True).start()
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={'width': 1152, 'height': 648}, record_video_dir=a.out + '/vid', record_video_size={'width': 1152, 'height': 648})
        pg = ctx.new_page(); t_vid0 = time.time() * 1000
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(f'http://127.0.0.1:{server.server_port}/index.html'); pg.wait_for_timeout(900); pg.click('#sTitle'); pg.wait_for_timeout(300)
        pg.evaluate(HOOK)
        # calibração: tela vermelha por 300ms; acha o 1º quadro vermelho no vídeo e alinha os eventos (Date.now) com o tempo do vídeo
        cal_ts = pg.evaluate("()=>{ const d=document.createElement('div'); d.style.cssText='position:fixed;inset:0;background:#f00;z-index:99999'; document.body.appendChild(d); const t=Date.now(); setTimeout(()=>d.remove(),300); return t; }")
        pg.wait_for_timeout(500)
        if a.replay:
            pg.evaluate(REPLAY_SETUP, dict(id=a.replay, targetId=a.target, side=a.side,
                                          kind=a.kind, clones=a.clones, custom=a.kind in KAZAN_REPLAYS))
            pg.wait_for_timeout(500)
            replay = pg.evaluate(REPLAY_ACTION, dict(side=a.side, kind=a.kind, ko=a.ko, rate=a.speed))
            pg.wait_for_timeout(300)
            print(f"{replay['name']} | {replay['hits']} hits | alvo PV {replay['hp']} → {replay['left']}"
                  f" | estado final: {replay['state'] or '-'}")
        else:
            pos = [(0, 0), (1, 0), (2, 1), (1, 2)]
            pl = ','.join("{id:'%s',row:%d,depth:%d}" % (i, r, d) for i, (r, d) in zip(a.team.split(','), pos))
            pg.evaluate("()=>{ dev=true; placed=[%s]; unlocked=4; foeIx=%d; autoP=true; speed=1; %s; startBattle(); }" % (pl, a.mis, a.js))
            t0 = time.time()
            while time.time() - t0 < a.secs:
                pg.wait_for_timeout(1000)
                if pg.evaluate("()=>U&&!battleOn&&!loadingB"): break
        ev = pg.evaluate("()=>QAL"); ctx.close(); b.close()
finally:
    server.shutdown()
    server.server_close()

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
    if e['k'] == 'act': cur = {'u': e['u'], 's': e['s'], 'kind': e['kind'], 'ev': [e], 'chains': 0}; acts.append(cur)
    elif cur:
        cur['ev'].append(e)
        if e['k'] == 'chasePlayed': cur['chains'] += 1
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
    vis = [e for e in x['ev'] if e['k'] in ('anim', 'frame', 'hurt', 'knock', 'fx', 'dust', 'dash', 'shot', 'chain')]
    for e in vis: lines.append(f"   {int(e['ms']-t0e):5d} ms  {e['k']:5s} {e.get('u','')} {e.get('n', e.get('s', e.get('d','')))}")
    for p_, q in zip(vis, vis[1:]):
        if q['ms'] - p_['ms'] > 450: lines.append(f"   !! TEMPO MORTO {int(q['ms']-p_['ms'])} ms entre '{p_['k']} {p_.get('n','')}' e '{q['k']} {q.get('n','')}' (em {int(p_['ms']-t0e)} ms)")
    for k, e in enumerate(x['ev']):
        if e['k'] in ('dust', 'dash'):
            h = next((q for q in x['ev'][k+1:] if q['k'] == 'hurt'), None)
            if h and h['ms'] - e['ms'] > 260 and e['k'] == 'dust' and e.get('u','').split(':')[1:] != h.get('u','').split(':')[1:]: lines.append(f"   !! ATRASO: pouso/poeira em {int(e['ms']-t0e)} ms e dano só em {int(h['ms']-t0e)} ms")
    rep += lines
open(a.out + '/relatorio.txt', 'w').write('\n'.join(rep) + '\n')
if a.resumo:
    print(f'{len(acts)} ações capturadas, {sum("!!" in line for line in rep)} alertas para revisão. Relatório: {a.out}/relatorio.txt')
else:
    print('\n'.join(rep))
total = len(glob.glob(a.out + '/acao_*.png'))
print(f'{total} tiras em {a.out}', '| erros:', errs or 'nenhum')
if a.expect_hits is not None and replay['hits'] != a.expect_hits:
    sys.exit(f"Esperava {a.expect_hits} hits, obteve {replay['hits']}")
if a.expect_ko and replay['alive']:
    sys.exit('Esperava nocaute, o alvo sobreviveu')
if (a.resumo or a.replay) and (errs or not total):
    sys.exit(1)
