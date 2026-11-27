#!/usr/bin/env python3
"""Gera beta/kaen.html: panorama do Kaen (cada animação do atlas rodando + status). Roda: python3 tools/kaen_panorama.py"""
import json
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).parent / 'sprites'))
from atlas_registry import registry

R = Path(__file__).resolve().parent.parent
spec = registry((R / 'js/sprites.js').read_text())['kaen']
NOVO = {'attack': 'Corte Ardente (1.16)', 'strong': 'Corte Flamejante (1.16)', 'guard': 'Defesa', 'hurt': 'Dano = quadro da defesa + tranco',
        'seals': 'Selo montado, estático', 'victory': 'Vitória', 'defeat': 'Derrota', 'knockback': 'Voo (repelido)',
        'launched': 'Voo (lançado)', 'knockdown': 'Caído', 'idle': 'Idle de luta (Bitmapflow, 50 quadros, regerado com a cabeça dos golpes)', 'hop': 'Pulo do ataque (3 poses, no lugar do dash)',
        'entrada': 'Entrada: cai pela diagonal do plano e pousa com a mão no chão (regerada)', 'jutsu': 'Dragão de Brasa: selos + liberação (40 quadros)',
        'rise': 'Chute Meteoro: agacha e sobe', 'meteor': 'Chute Meteoro: mergulho (contato no último quadro)', 'landing': 'Chute Meteoro: pouso',
        'chase': 'prévia do Chute Meteoro', 'dodge': 'Esquiva = pulo (passo pra trás em código)', 'stun': 'Atordoado = idle lento (estrelas do kit: pendente)',
        'buff': 'Buff = selo (efeito recolorível do kit: pendente)'}
PEND = {}
anims = []
for n, a in spec.animations.items():
    seq = list(a.sequence) or list(range(a.frames))
    st = 'novo' if n in NOVO else 'antigo'
    anims.append(dict(n=n, row=a.row, frames=a.frames, fps=a.fps, loop=a.loop, pp=a.pingpong, seq=seq, st=st, nota=NOVO.get(n) or PEND.get(n, '')))
anims.sort(key=lambda x: (x['st'] != 'novo', x['n']))
novos = sum(a['st'] == 'novo' for a in anims)
html = """<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kaen — panorama (beta)</title>
<style>:root{--bg:#1d2420;--card:#27302b;--tx:#eee;--mut:#9aa8a0;--ok:#5fd17a;--old:#e0a040}
body{margin:0;background:var(--bg);color:var(--tx);font:15px system-ui,sans-serif;padding:16px}
h1{margin:0 0 4px;font-size:22px}p{color:var(--mut);margin:4px 0 14px}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}
.c{background:var(--card);border-radius:10px;padding:10px;border-top:4px solid var(--old)}.c.novo{border-color:var(--ok)}
canvas{width:100%;image-rendering:pixelated;background:#3a463e;border-radius:6px}
b{display:block;margin-top:6px}small{color:var(--mut);display:block}.t{font-size:12px;font-weight:700}
.novo .t{color:var(--ok)}.antigo .t{color:var(--old)}</style>
<h1>Kaen — panorama geral</h1><p>__RESUMO__ Atlas real do jogo (<code>spr/kaen_atlas.png</code>), cada animação no fps do motor. Página de acompanhamento, não faz parte do jogo.</p>
<div class="g" id="g"></div>
<script>
const A=__DATA__,CW=192,CH=160,img=new Image();img.src='../spr/kaen_atlas.png';
const g=document.getElementById('g'),cv=[];
for(const a of A){const d=document.createElement('div');d.className='c '+a.st;
d.innerHTML='<canvas width="192" height="160"></canvas><b>'+a.n+'</b><span class="t">'+(a.st=='novo'?'NOVO':'ANTIGO / PENDENTE')+'</span><small>'+a.nota+'</small><small>'+a.frames+' quadros · '+a.fps+' fps'+(a.loop?' · loop':'')+'</small>';
g.appendChild(d);cv.push([a,d.querySelector('canvas').getContext('2d')]);}
function frameOf(a,t){const n=a.seq.length;let i=Math.floor(t*a.fps/1000);
if(a.pp&&n>1){const p=2*n-2;i%=p;if(i>=n)i=p-i}else i=a.loop?i%n:Math.min(i,n-1);
if(!a.loop&&!a.pp&&Math.floor(t*a.fps/1000)>=n+Math.ceil(a.fps*.6))return -1;return a.seq[i]}
const COLS=__COLS__;
function tick(t){for(const [a,c] of cv){const f=frameOf(a,t%(((a.frames/a.fps)*1000)+1200));if(f<0)continue;
c.clearRect(0,0,CW,CH);const col=f%COLS,row=a.row+Math.floor(f/COLS);c.drawImage(img,col*CW,row*CH,CW,CH,0,0,CW,CH)}requestAnimationFrame(tick)}
img.onload=()=>requestAnimationFrame(tick);
</script></html>"""
html = html.replace('__COLS__', str(spec.columns)).replace('__DATA__', json.dumps(anims, ensure_ascii=False)).replace('__RESUMO__', f'{novos} de {len(anims)} animações já no estilo novo.')
(R / 'beta/kaen.html').write_text(html)
print('beta/kaen.html', novos, '/', len(anims))
