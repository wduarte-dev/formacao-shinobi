// cine.js — câmera, smash/knock, cenas de jutsu, deslocamentos
"use strict";
function zoomTo(x,y,s,slow){const c=$('cam'); c.classList.toggle('slow',!!slow); c.style.transformOrigin=`${x}px ${y}px`; c.style.transform=`scale(${s})`;}
function zoomOut(slow){const c=$('cam'); c.classList.toggle('slow',!!slow); c.style.transform='';}
function bigSlash(x,y,att,state){ const dir=att.side==='p'?1:-1, ang={R:-6,L:-58,D:52}[state]*dir;
  for(const k of ['','b']){const e=document.createElement('div'); e.className='bslash '+k; e.style.left=x+'px'; e.style.top=(y+(k?14:0))+'px'; e.style.setProperty('--c',att.d.c); e.style.setProperty('--r',ang+'deg'); $('fx').appendChild(e); setTimeout(()=>e.remove(),420);} }
function speedLines(state){ slineFx(state); }   // desenhadas no canvas #fxc (antes: camada de 1552x1048 animando background-position = repintura gigante)
function crack(x,y){ const c=document.createElement('div'); c.className='crack'; c.style.left=x+'px'; c.style.top=y+'px';
  for(let i=0;i<9;i++){const l=document.createElement('i'); l.style.rotate=`${i*40+R(-14,14)}deg`; l.style.setProperty('--w',R(40,110)+'px'); c.appendChild(l);} $('fx').appendChild(c); setTimeout(()=>c.remove(),560); }
// golpe que muda o estado do alvo: zoom no ponto do corte, câmera lenta, e o alvo sai voando
async function smash(att,t,state){
  const p=cur(t);
  zoomTo(p.x,p.y-60,1.5); bigSlash(p.x,p.y-60,att,state); speedLines(state); flashSoft(); sfx.heavy();
  await hitstop(80);
  zoomOut(true); await knock(t,state);
}
// arremessa o alvo conforme o estado: Repelido bate na borda da tela, Lançado sobe, Derrubado desaba no chão
async function knock(t,state){
  const b=pos(t), d=t.side==='p'?-1:1, lim=x=>Math.max(70-b.x,Math.min(1082-b.x,x)); if(!t.off)t.off={x:0,y:0};
  const wasAir=t.off.y<0, p0=cur(t);
  if(state==='R'){t.off.x=(d>0?1082:70)-b.x; t.off.y=wasAir?-70:0;}
  else if(state==='L'){t.off.x=lim(t.off.x+d*60); t.off.y=-230;}
  else{t.off.x=lim(t.off.x+d*46); t.off.y=0;}
  t.state=state; t.st.className='st '+state; setAnim(t,stAnim(t,state)); t.el.style.zIndex=55;
  { const p1=cur(t); trailFx(p0.x,p0.y-60,p1.x,p1.y-60,state); }   // rastro de vento no canvas (antes: drop-shadow de 60px no sprite)
  t.el.classList.add('fly','fly'+state);
  t.mv.style.transform=`translate(${t.off.x}px,${t.off.y}px)`;
  fl(t,ST[state]+'!','state'); sfx.knock(state);
  await sleep(240);
  t.el.classList.remove('flyR','flyL','flyD');
  const p=cur(t);
  if(state==='R'){ shake(); sfx.wall(); dust(t,20); crack(p.x+d*26,p.y-60); zoomTo(p.x,p.y-60,1.16); await sleep(120); zoomOut(true);
    if(wasAir){t.off.y=0; t.mv.style.transform=`translate(${t.off.x}px,0)`;} }
  else if(state==='D'){ sfx.thud(); dust(t,wasAir?22:12); shake(); if(wasAir){zoomTo(p.x,p.y,1.14); await sleep(110); zoomOut(true);} }
  await sleep(150); t.el.classList.remove('fly');
}
// hit-stop: congela anims (não os efeitos) por um instante no impacto
async function hitstop(ms){const f=$('field'); f.classList.add('hs'); frozen=true; try{await sleep(ms);}finally{frozen=false; f.classList.remove('hs');}}
function retrig(el,cls){el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);}
// flash e tremor via Web Animations (só opacity/translate = compositor; sem reflow forçado nem animar margin do campo inteiro)
function flash(){ $('flash').animate([{opacity:.85},{opacity:0}],{duration:300/speed,easing:'ease-out'}); }
function flashSoft(){ $('flash').animate([{opacity:.4},{opacity:0}],{duration:220/speed,easing:'ease-out'}); }
let shakeA=null;
function shake(k){ const m=k||1; if(shakeA)shakeA.cancel();
  shakeA=$('cam').animate([{translate:'0 0'},{translate:`${-12*m}px 0`},{translate:`${12*m}px ${7*m}px`},{translate:`${-7*m}px 0`},{translate:`${5*m}px ${-5*m}px`},{translate:'0 0'}],{duration:280/speed}); }
function ink(txt,hold){$('inkT').textContent=txt; const k=$('ink'); k.className=txt.length>8?'sm':''; void k.offsetWidth; k.classList.add(hold?'hold':'on');}
function showHits(){ const n=hitsR[curSide]; if(n<2)return; const h=$('hits'); h.textContent=n+' Hit'; h.style.left=curSide==='p'?'':'24px'; h.style.right=curSide==='p'?'24px':''; retrig(h,'on');
  if(n>=10&&n%10===0){ const b=$('hband'); b.textContent=`MAIS DE ${n} COMBO`; b.className='hband '+(curSide==='p'?'r':'l'); void b.offsetWidth; b.classList.add('on'); } }   // faixa a cada 10 hits
function comboLine(name,count,id){const c=$('clist'); c.className=curSide==='p'?'l':'r'; const d=document.createElement('div'); d.className='ci'; d.innerHTML=`<i class="cip"></i>${name}<b>${count} Combo</b>`; if(id)portrait(d.firstChild,id,2.2,34,34); sfx.combo(count); c.appendChild(d); setTimeout(()=>d.remove(),1900);}

// cena isolada (jutsu e perseguição): fundo escuro e só os participantes visíveis, do começo ao fim.
// sceneAdd revela mais gente (a perseguição acumula); sceneOff só roda quando todos voltaram pra casa.
const scene={on:false};
function sceneOn(list){ $('field').classList.add('dim'); scene.on=true; all().forEach(x=>x.el.classList.toggle('ghost',!list.includes(x))); }
function sceneAdd(u){ if(scene.on)u.el.classList.remove('ghost'); }
function sceneOff(){ scene.on=false; $('field').classList.remove('dim'); if(U)all().forEach(x=>x.el.classList.remove('ghost','cmb','tgt')); }
// marca quem vai levar o golpe (jutsu, perseguição, tsunami): círculo vermelho pulsando nos pés
function markTargets(ts){ ts.forEach(t=>{ sceneAdd(t); t.el.classList.add('tgt'); }); }
// esquiva: anim 'dodge' do atlas se existir; senão um passo pra trás translúcido. Sem número, sem texto.
async function evade(t){ sfx.dodge(t); fxAt(t,'dodge',t,.9);
  retrig(t.st,'dodge'); if(an_of(t).dodge)setAnim(t,'dodge',0,true);   // passo pra trás em CSS + anim do atlas, se tiver
  await sleep(Math.max(320,animMs(t,'dodge'))); t.st.classList.remove('dodge');
  if(t.alive&&!t.state)setAnim(t,'idle'); }
// espera os efeitos de partícula acabarem (cada jutsu dura o que o efeito dele dura), entre min e max ms
async function fxWait(min,max){ await sleep(min); for(let t=min;t<max&&(FX.length||BOLT.length);t+=60)await sleep(60); }

async function cine(u,sk,ts){
  const tag=$('jtag'), c=$('cut'), cp=$('cutP');
  sceneOn([u]); setAnim(u,'cast'); sfx.cast(u); fxAt(u,'aura',u,1.05,18);
  skTag(u,sk.name);
  await sleep(260);
  c.style.setProperty('--c',u.d.c); cp.className='cp '+(u.side==='p'?'l':'r'); $('cutN').textContent=sk.name; $('cutN').className='cn '+(u.side==='p'?'l':'r'); portrait(cp,u.id,5.2,520,290,'cast',8);
  retrig(c,'on'); await sleep(640);
  if(ts.some(t=>t.side!==u.side))markTargets(ts); else ts.forEach(sceneAdd);   // aliados (cura/escudo) só aparecem; inimigos ficam marcados
}
// golpe final: zoom no último a cair, clarão, "RESULTADO" e hit-stop longo (uma vez por luta; finDone zera no run)
let finDone=false;
async function finale(t){ if(finDone)return; finDone=true; const p=cur(t); zoomTo(p.x,p.y-60,1.35); flash(); ink('RESULTADO'); await hitstop(650); zoomOut(true); }
// legenda lateral com retrato + nome do golpe (jutsu e Forte); some no endCine
function skTag(u,name){ const tag=$('jtag'); tag.className='jtag '+(u.side==='p'?'l':'r'); tag.style.setProperty('--c',u.d.c); portrait($('jtP'),u.id,1.8,50,50); $('jtN').textContent=name; void tag.offsetWidth; tag.classList.add('on'); }
// fim do Lacre Rompido (Yugami): câmera fecha nele e o capuz volta em câmera lenta (~3s no total); u.ts = escala de tempo da anim (tick)
async function rehoodCine(u){ const p=cur(u), sz=u.d.size||1;
  sceneOn([u]); zoomTo(p.x,p.y-70*sz,1.9,true); sfx.cast(u); await sleep(300);
  const ms=Math.max(300,animMs(u,'rehood')); u.ts=Math.min(1,ms/2300); setAnim(u,'rehood',0,true); fxAt(u,'aura',u,1.1,0,{fps:5}); sfx.rehood();
  try{ await sleep(ms/u.ts); } finally{ u.ts=1; }
  if(u.solto)setForm(u,false); setAnim(u,'idle'); flashSoft(); fl(u,'capuz lacrado','shieldf'); await sleep(400);
  zoomOut(true); sceneOff(); await sleep(250); }
function endCine(){ $('jtag').classList.remove('on'); }
async function dashTo(u,t,keep){const a=pos(u), b=cur(t), dir=u.side==='p'?1:-1;
  if(!keep)setAnim(u,'move'); u.el.style.zIndex=60; const reach=82*((u.d.size||1)+(t.d.size||1))/2; u.mv.style.transform=`translate(${b.x-dir*reach-a.x}px,${b.y-a.y+2}px)`; await sleep(190);}
function home(u){u.mv.style.transform=''; u.el.style.zIndex=u.z; if(u.alive&&!u.state)setAnim(u,'idle');}
// frasco que se multiplica no ar (split): sobe até um ponto no meio do campo, estoura em vários e cada um cai num alvo
async function shootSplit(u,ts){ const a=cur(u), d=u.side==='p'?1:-1, ax=ts.reduce((m,t)=>m+cur(t).x,0)/ts.length, m={x:(a.x+ax)/2, y:a.y-190};
  if(!fxShot(u,{x:m.x,y:m.y+66},220))flyDot(u,m,190); await sleep(220);
  flashSoft(); sfx.shoot(u); em(lite?8:20,()=>prt(m.x,m.y,0,0,R(-3,3),R(-3,3),.05,R(12,20),R(3,5),0,pk(PAL[u.d.el]||['#fff'])));
  ts.forEach(t=>{ const b=cur(t); if(!fxShot(u,b,260,m))flyDot(u,{x:b.x,y:b.y-68},230,m); }); await sleep(260); }
function flyDot(u,to,ms,from){ const a=from||{x:cur(u).x+(u.side==='p'?54:-54),y:cur(u).y-72}, e=document.createElement('div');   // projétil genérico (sem atlas)
  e.className='proj'; e.style.left=a.x+'px'; e.style.top=a.y+'px'; e.style.setProperty('--c',u.d.c); $('fx').appendChild(e);
  void e.offsetWidth; e.style.transform=`translate(${to.x-a.x}px,${to.y-a.y}px)`; setTimeout(()=>e.remove(),ms/speed); }
async function shoot(u,t){ if(fxShot(u,t,320)){ await sleep(320); return; }
  const a=pos(u), b=cur(t), dir=u.side==='p'?1:-1, e=document.createElement('div');
  e.className='proj'; e.style.left=(a.x+dir*54)+'px'; e.style.top=(a.y-72)+'px'; e.style.setProperty('--c',u.d.c); $('fx').appendChild(e);
  void e.offsetWidth; e.style.transform=`translate(${b.x-(a.x+dir*54)}px,${b.y-68-(a.y-72)}px)`; try{await sleep(190);}finally{e.remove();}}

