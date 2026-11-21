// cine.js — câmera, smash/knock, cenas de jutsu, deslocamentos
"use strict";
function zoomTo(x,y,s,slow){const c=$('cam'); c.classList.toggle('slow',!!slow); c.style.transformOrigin=`${x}px ${y}px`; c.style.transform=`scale(${s})`;}
function zoomOut(slow){const c=$('cam'); c.classList.toggle('slow',!!slow); c.style.transform='';}
function bigSlash(x,y,att,state){ const dir=att.side==='p'?1:-1, ang={R:-6,L:-58,D:52}[state]*dir;
  for(const k of ['','b']){const e=document.createElement('div'); e.className='bslash '+k; e.style.left=x+'px'; e.style.top=(y+(k?14:0))+'px'; e.style.setProperty('--c',att.d.c); e.style.setProperty('--r',ang+'deg'); $('fx').appendChild(e); setTimeout(()=>e.remove(),420);} }
function speedLines(state){const l=$('slines'); l.className=state==='R'?'':'v'; void l.offsetWidth; l.classList.add('on');}
function crack(x,y){ const c=document.createElement('div'); c.className='crack'; c.style.left=x+'px'; c.style.top=y+'px';
  for(let i=0;i<9;i++){const l=document.createElement('i'); l.style.transform=`rotate(${i*40+R(-14,14)}deg)`; l.style.setProperty('--w',R(40,110)+'px'); c.appendChild(l);} $('fx').appendChild(c); setTimeout(()=>c.remove(),560); }
// golpe que muda o estado do alvo: zoom no ponto do corte, câmera lenta, e o alvo sai voando
async function smash(att,t,state){
  const p=cur(t);
  zoomTo(p.x,p.y-60,1.5); bigSlash(p.x,p.y-60,att,state); speedLines(state); retrig($('flash'),'soft'); sfx.heavy();
  await hitstop(190);
  zoomOut(true); await knock(t,state);
}
// arremessa o alvo conforme o estado: Repelido bate na borda da tela, Lançado sobe, Derrubado desaba no chão
async function knock(t,state){
  const b=pos(t), d=t.side==='p'?-1:1, lim=x=>Math.max(70-b.x,Math.min(1082-b.x,x)); if(!t.off)t.off={x:0,y:0};
  const wasAir=t.off.y<0;
  if(state==='R'){t.off.x=(d>0?1082:70)-b.x; t.off.y=wasAir?-70:0;}
  else if(state==='L'){t.off.x=lim(t.off.x+d*60); t.off.y=-230;}
  else{t.off.x=lim(t.off.x+d*46); t.off.y=0;}
  t.state=state; t.st.className='st '+state; setAnim(t,stAnim(t,state)); t.el.style.zIndex=55;
  t.el.classList.add('fly','fly'+state);
  t.mv.style.transform=`translate(${t.off.x}px,${t.off.y}px)`;
  fl(t,ST[state]+'!','state'); sfx.state();
  await sleep(240);
  t.el.classList.remove('flyR','flyL','flyD');
  const p=cur(t);
  if(state==='R'){ shake(); sfx.thud(); dust(t,20); crack(p.x+d*26,p.y-60); zoomTo(p.x,p.y-60,1.16); await sleep(120); zoomOut(true);
    if(wasAir){t.off.y=0; t.mv.style.transform=`translate(${t.off.x}px,0)`;} }
  else if(state==='D'){ sfx.thud(); dust(t,wasAir?22:12); shake(); if(wasAir){zoomTo(p.x,p.y,1.14); await sleep(110); zoomOut(true);} }
  await sleep(150); t.el.classList.remove('fly');
}
function retrig(el,cls){el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);}
function flash(){retrig($('flash'),'on');}
function shake(){retrig($('field'),'shake');}
function ink(txt,hold){$('inkT').textContent=txt; const k=$('ink'); k.className=txt.length>8?'sm':''; void k.offsetWidth; k.classList.add(hold?'hold':'on');}
function showHits(){ const n=hitsR[curSide]; if(n<2)return; const h=$('hits'); h.textContent=n+' Hit'; h.style.left=curSide==='p'?'':'24px'; h.style.right=curSide==='p'?'24px':''; retrig(h,'on'); }
function comboLine(name,count){const c=$('clist'); c.className=curSide==='p'?'l':'r'; const d=document.createElement('div'); d.className='ci'; d.innerHTML=`${name}<b>${count} Combo</b>`; c.appendChild(d); setTimeout(()=>d.remove(),1900);}

// cena isolada (jutsu e perseguição): fundo escuro e só os participantes visíveis, do começo ao fim.
// sceneAdd revela mais gente (a perseguição acumula); sceneOff só roda quando todos voltaram pra casa.
const scene={on:false};
function sceneOn(list){ $('field').classList.add('dim'); scene.on=true; all().forEach(x=>x.el.classList.toggle('ghost',!list.includes(x))); }
function sceneAdd(u){ if(scene.on)u.el.classList.remove('ghost'); }
function sceneOff(){ scene.on=false; $('field').classList.remove('dim'); if(U)all().forEach(x=>x.el.classList.remove('ghost')); }
// esquiva: anim 'dodge' do atlas se existir; senão um passo pra trás translúcido. Sem número, sem texto.
async function evade(t){ sfx.swing();
  retrig(t.st,'dodge'); if(an_of(t).dodge)setAnim(t,'dodge',0,true);   // passo pra trás em CSS + anim do atlas, se tiver
  await sleep(Math.max(320,animMs(t,'dodge'))); t.st.classList.remove('dodge');
  if(t.alive&&!t.state)setAnim(t,'idle'); }
// espera os efeitos de partícula acabarem (cada jutsu dura o que o efeito dele dura), entre min e max ms
async function fxWait(min,max){ await sleep(min); for(let t=min;t<max&&(FX.length||BOLT.length);t+=60)await sleep(60); }

async function cine(u,sk,ts){
  const tag=$('jtag'), c=$('cut'), cp=$('cutP');
  sceneOn([u]); setAnim(u,'cast'); sfx.cast();
  tag.className='jtag '+(u.side==='p'?'l':'r'); tag.style.setProperty('--c',u.d.c); portrait($('jtP'),u.id,3,50,50); $('jtN').textContent=sk.name; void tag.offsetWidth; tag.classList.add('on');
  await sleep(260);
  c.style.setProperty('--c',u.d.c); cp.className='cp '+(u.side==='p'?'l':'r'); portrait(cp,u.id,14,520,290,6,0,28,26);
  retrig(c,'on'); await sleep(640);
  ts.forEach(sceneAdd);
}
function endCine(){ $('jtag').classList.remove('on'); }
async function dashTo(u,t,keep){const a=pos(u), b=cur(t), dir=u.side==='p'?1:-1;
  if(!keep)setAnim(u,'move'); u.el.style.zIndex=60; u.mv.style.transform=`translate(${b.x-dir*82-a.x}px,${b.y-a.y+2}px)`; await sleep(190);}
function home(u){u.mv.style.transform=''; u.el.style.zIndex=u.z; if(u.alive&&!u.state)setAnim(u,'idle');}
async function shoot(u,t){const a=pos(u), b=cur(t), dir=u.side==='p'?1:-1, e=document.createElement('div');
  e.className='proj'; e.style.left=(a.x+dir*54)+'px'; e.style.top=(a.y-72)+'px'; e.style.setProperty('--c',u.d.c); $('fx').appendChild(e);
  void e.offsetWidth; e.style.left=b.x+'px'; e.style.top=(b.y-68)+'px'; try{await sleep(190);}finally{e.remove();}}

