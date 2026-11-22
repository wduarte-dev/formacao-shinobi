// fx.js — partículas e efeitos de elemento (canvas)
"use strict";
let fxDirty=false; const FX=[], BOLT=[], SLN=[]; const fxc=$('fxc').getContext('2d'), K=2.5;
const R=(a,b)=>a+Math.random()*(b-a), pk=a=>a[Math.random()*a.length|0];
// teto de partículas: no modo leve nasce menos e o limite é menor
function em(n,f){ const cap=lite?90:260; if(lite)n=Math.ceil(n*.4); for(let i=0;i<n&&FX.length<cap;i++)FX.push(f(i));}
// valores em "unidades de efeito": o K converte para o tamanho do palco
function prt(x,y,dx,dy,vx,vy,g,life,w,h,col,round){return{x:x+dx*K,y:y+dy*K,vx:vx*K,vy:vy*K,g:g*K,life,max:life,w:w*K,h:(h||w)*K,col,round};}
function fxStep(k){
  const c=fxc; if(!FX.length&&!BOLT.length&&!SLN.length){ if(fxDirty){c.clearRect(0,0,384,216);fxDirty=false;} return; } fxDirty=true; c.clearRect(0,0,384,216);
  for(let i=FX.length-1;i>=0;i--){const p=FX[i]; p.vy+=p.g*k; p.x+=p.vx*k; p.y+=p.vy*k; p.life-=k; if(p.life<=0){FX.splice(i,1);continue;}
    c.globalAlpha=Math.min(1,p.life/p.max*1.6)*(p.round?.7:1); c.fillStyle=p.col;
    if(p.round){c.beginPath();c.arc(p.x/3,p.y/3,p.w/6,0,7);c.fill();}
    else c.fillRect(Math.round((p.x-p.w/2)/3),Math.round((p.y-p.h/2)/3),Math.max(1,Math.round(p.w/3)),Math.max(1,Math.round(p.h/3)));}
  for(let i=BOLT.length-1;i>=0;i--){const b=BOLT[i]; b.life-=k; if(b.life<=0){BOLT.splice(i,1);continue;}
    c.globalAlpha=1; c.strokeStyle=b.col; c.lineWidth=b.lw; c.beginPath(); b.pts.forEach((q,j)=>j?c.lineTo(q[0]/3,q[1]/3):c.moveTo(q[0]/3,q[1]/3)); c.stroke();}
  for(let i=SLN.length-1;i>=0;i--){const l=SLN[i]; l.x+=l.vx*k; l.y+=l.vy*k; l.life-=k; if(l.life<=0){SLN.splice(i,1);continue;}   // linhas de velocidade
    c.globalAlpha=l.a*Math.min(1,l.life/l.max*2); c.fillStyle='#fff'; c.fillRect(l.x|0,l.y|0,l.w,l.h);}
  c.globalAlpha=1;
}
// linhas de velocidade (coordenadas do canvas 384x216): R = horizontais correndo pro lado; L/D = verticais subindo/descendo
function slineFx(state){ const n=lite?9:18, v=state==='R';
  for(let i=0;i<n;i++){ const len=R(30,110), life=R(14,24);
    if(v)SLN.push({x:R(-120,384),y:R(0,216),w:len,h:Math.random()<.3?2:1,vx:R(9,15)*(Math.random()<.5?1:-1),vy:0,life,max:life,a:R(.35,.8)});
    else SLN.push({x:R(0,384),y:R(-120,216),w:Math.random()<.3?2:1,h:len,vx:0,vy:R(9,15)*(state==='L'?-1:1),life,max:life,a:R(.35,.8)}); } }
// rastro de quem foi arremessado: riscos brancos ao longo do caminho (x/y do palco)
function trailFx(x0,y0,x1,y1,state){ const hz=state==='R', n=lite?5:10;
  for(let i=0;i<n;i++){ const f=i/n, x=x0+(x1-x0)*f, y=y0+(y1-y0)*f;
    FX.push(prt(x,y,R(-4,4)*(hz?0:1),R(-14,14)*(hz?1:.3),0,0,0,8+f*10,hz?R(14,30):1.2,hz?1.2:R(14,30),'#ffffffcc')); } }
const PAL={Fogo:['#fff3a0','#ffb327','#e5533d','#8a2424'],'Água':['#ffffff','#9fd4ff','#3d8fe5','#2a5fb0'],Raio:['#ffffff','#fff27a','#e5c33d'],Terra:['#d9b27a','#9a7748','#5a4634'],
  Vento:['#ffffff','#c9f5e2','#5fc9a0'],Sombra:['#c9b4ff','#9a7fe0','#2a2340','#000000'],Névoa:['#ffffff','#d9c8f5','#b79ae0','#7d6aa8'],Gelo:['#ffffff','#c8f1fb','#7fd3e8'],Veneno:['#ead6ff','#a46be0','#6a2d9c'],Som:['#fff3c2','#e8b83a','#e8643a'],'Espaço':['#ffffff','#fff3b0','#f2c14e','#1b2a5c']};
// ondas sonoras desenhadas em código (jutsu com wave): anéis dourados saem do conjurador e cobrem o campo; cada alvo vibra com anéis menores
function soundWave(u,ts){ const a=cur(u), cy=a.y-58*(u.d.size||1), n=lite?3:6, cols=['#ffd34d','#ff9a3c','#fff0b0'];
  const ring=(x,y,size,t,delay,c,bw)=>setTimeout(()=>{ const e=document.createElement('div'); e.className='swave'; e.style.left=x+'px'; e.style.top=y+'px'; if(bw)e.style.setProperty('--b',bw+'px');
    e.style.width=size+'px'; e.style.height=(size*.62)+'px'; e.style.setProperty('--c',c); e.style.setProperty('--t',t+'s'); $('fx').appendChild(e); setTimeout(()=>e.remove(),t*1000+60); },delay/speed);
  for(let i=0;i<n;i++){ ring(a.x,cy,1400,1.2,i*120,cols[i%3],12); ring(a.x,cy,620,.7,i*120+40,cols[(i+1)%3],8); }   // pulsos grandes + médios
  ts.forEach((t,j)=>{ const p=cur(t); for(let k=0;k<(lite?2:4);k++)ring(p.x,p.y-56*(t.d.size||1),210,.5,220+j*40+k*130,cols[k%3],9); });   // alvo vibrando
  em(lite?10:24,()=>prt(a.x,cy,R(-10,10),R(-10,10),R(-3,3),R(-2,2),0,R(18,30),R(3,5),0,pk(cols)));
}
function elFx(u,ts){
  const el=u.d.el, pal=PAL[el], dir=u.side==='p'?1:-1;
  for(const t of ts){ const p=cur(t), x=p.x, y=p.y;
    if(el==='Fogo')em(46,()=>prt(x,y,R(-14,14),-R(0,22),R(-1.8,1.8),R(-4.2,-.6),-.03,R(24,46),R(4,9),0,pk(pal)));
    else if(el==='Água')em(50,()=>prt(x,y,-dir*R(40,95),-R(0,62),dir*R(3,6.5),R(-1,1),.06,R(18,30),R(4,7),0,pk(pal)));
    else if(el==='Raio'){ for(let b=0;b<3;b++){const pts=[]; const bx=x+R(-34,34)*K, ty=y-26*K; for(let k=0;k<=7;k++)pts.push([bx+(x-bx)*k/7+(k<7?R(-10,10)*K:0),ty*k/7]); BOLT.push({pts,life:R(6,13),col:pk(pal),lw:b?1:2});}
      em(22,()=>prt(x,y,0,-26,R(-4.5,4.5),R(-4.5,4.5),0,R(8,16),3,0,pk(pal))); }
    else if(el==='Terra')em(30,()=>prt(x,y,R(-22,22),0,R(-1.3,1.3),R(-6.5,-2.5),.3,R(26,40),R(5,11),0,pk(pal)));
    else if(el==='Vento')em(48,()=>prt(x,y,-dir*R(50,125),-R(0,66),dir*R(6,10),R(-.3,.3),0,R(14,22),R(14,28),2,pk(pal)));
    else if(el==='Sombra'){ em(38,()=>{const a=R(0,6.28),r=R(40,62);return prt(x,y,Math.cos(a)*r,-28+Math.sin(a)*r,-Math.cos(a)*2.5,-Math.sin(a)*2.5,0,R(16,22),R(3,6),0,pk(pal));});
      BOLT.push({pts:[[x-32*K,y-60*K],[x+32*K,y+2*K]],life:9,col:'#ffffff',lw:2},{pts:[[x+32*K,y-60*K],[x-32*K,y+2*K]],life:13,col:'#c9b4ff',lw:2}); }
    else if(el==='Gelo'){ em(18,()=>prt(x,y,R(-28,28),-R(110,175),0,R(7,10),0,R(14,18),4,13,pk(pal))); em(22,()=>prt(x,y,0,-24,R(-3.2,3.2),R(-3.2,3.2),.05,R(26,38),4,0,pk(pal))); }
    else em(34,()=>prt(x,y,R(-28,28),-R(0,46),R(-.5,.5),R(-.9,-.2),0,R(40,64),R(10,19),0,pk(pal),1));
  }
}
function spark(t,col,n){const p=cur(t); em(n,()=>prt(p.x,p.y,0,-28,R(-3,3),R(-3.2,1.5),.12,R(10,18),3,0,pk([col,'#ffffff'])));}


/* ---- efeitos desenhados (lote D de cada ninja): atlas de 288x192 por quadro, 6 linhas ---- */
// gerado de tools/sprites/out/<ninja>_fx.json: nome:[linha, quadros]
const FXA={
 kaen:{c:12,a:{crescent:[0,6],slash:[1,6],dragon:[2,6],meteor:[3,6],impact:[4,6],aura:[5,6]}},
 mizuha:{c:8,a:{jet:[0,6],splash:[1,6],rain:[2,6],wave:[3,6],impact:[4,6],aura:[5,6]}},
 raiden:{c:8,a:{bolt:[0,6],chain:[1,6],burst:[2,6],ground:[3,6],orb:[4,6],spark:[5,5]}},
 iwao:{c:8,a:{dust:[0,7],crack:[1,7],rocks:[2,6],fist:[3,7],dome:[4,7],impact:[5,6]}},
 hiyori:{c:8,a:{blade:[0,7],crescents:[1,7],prison:[2,7],pillar:[3,7],impact:[4,7],aura:[5,7]}},
 fuuka:{c:8,a:{crescent:[0,6],gust:[1,6],tornado:[2,6],whirlwind:[3,6],impact:[4,6],aura:[5,6]}},
 mayoi:{c:8,a:{swarm:[0,6],cloud:[1,6],wave:[2,6],impact:[3,6],aura:[4,6],flash:[5,6]}},
 doku:{c:8,a:{vial:[0,6],burst:[1,6],mist:[2,6],stinger:[3,6],impact:[4,6],aura:[5,5]}},
 poko:{c:8,a:{arc:[0,6],slash:[1,6],buzz:[2,6],reap:[3,6],impact:[4,6],aura:[5,6]}},
 yugami:{c:8,a:{shard:[0,6],fenda:[1,6],lacre:[2,6],rasgo:[3,6],estouro:[4,6],halo:[5,6]}}
};
// qual efeito cada ninja usa em cada momento: hit = básico, jutsu, chase = perseguição, dodge = esquiva,
// imp = faísca de impacto em todo acerto, aura = em volta do conjurador na hora do selo, proj = projétil que viaja
const FXUSE={kaen:{hit:'slash',jutsu:'dragon',chase:'meteor',imp:'impact',aura:'aura',proj:'crescent'},
  mizuha:{hit:'splash',jutsu:'rain',chase:'wave',imp:'impact',aura:'aura',proj:'jet'},
  raiden:{hit:'spark',jutsu:'burst',chase:'chain',imp:'orb',aura:'ground',proj:'bolt'},
  iwao:{hit:'rocks',jutsu:'dome',chase:'crack',imp:'impact',aura:'dust',proj:'fist'},
  hiyori:{hit:'blade',jutsu:'prison',chase:'pillar',imp:'impact',aura:'aura',proj:'crescents'},
  fuuka:{hit:'gust',jutsu:'tornado',chase:'whirlwind',imp:'impact',aura:'aura',proj:'crescent'},
  mayoi:{hit:'impact',jutsu:'cloud',chase:'swarm',dodge:'cloud',imp:'flash',aura:'aura',proj:'swarm'},
  doku:{hit:'burst',jutsu:'mist',chase:'stinger',imp:'impact',aura:'aura',proj:'vial'},
  poko:{hit:'slash',jutsu:'buzz',chase:'reap',imp:'impact',aura:'aura',proj:'arc'},
  yugami:{hit:'fenda',jutsu:'lacre',chase:'rasgo',imp:'estouro',aura:'halo',proj:'shard'}};
// como cada efeito se mexe (nada fica parado feito PNG colado):
// slide = entra deslizando a partir do atacante · dive = desce na diagonal de cima · rise = sobe do chão
// fall = cai de cima · spin = gira leve · float = sobe flutuando · drift = escorrega devagar pra frente
const FXMOVE={dragon:'slide',wave:'slide',slash:'slide',gust:'slide',crescent:'slide',crescents:'slide',blade:'slide',swarm:'slide',chain:'slide',bolt:'slide',jet:'slide',fist:'slide',
  meteor:'dive',pillar:'rise',crack:'drift',rocks:'rise',prison:'fall',rain:'fall',dome:'rise',tornado:'drift',whirlwind:'spin',burst:'spin',
  impact:'spin',orb:'spin',flash:'spin',spark:'spin',aura:'float',dust:'float',ground:'float',cloud:'drift',splash:'rise',vial:'slide',burst:'rise',mist:'drift',stinger:'dive',arc:'slide',shard:'slide',fenda:'slide',lacre:'float',rasgo:'rise',estouro:'spin',halo:'float'};
// toca um efeito do atlas. o: {x,y} centro, flip (inimigo ataca da direita), sc escala, to {x,y} destino (viaja),
// mv tipo de movimento, dir lado do atacante (+1 vem da esquerda), fps. Devolve a duração em ms.
// pré-carga: cada atlas decodificado ocupa ~11-16MB; sem isso o 1º jutsu trava enquanto o navegador decodifica. Guarda as Images pra não serem descartadas.
// Devolve uma Promise; onp(feito,total) alimenta a barra da tela de carregamento.
const KEEP={};
function preloadFx(ids,onp){ const fs=[]; for(const id of new Set(ids)){ fs.push(`spr/${id}_atlas.png`,`spr/${id}_fx.png`); if(id==='yugami')fs.push('spr/yugamir_atlas.png'); }
  let n=0; if(onp)onp(0,fs.length);
  return Promise.all(fs.map(f=>{ if(!KEEP[f]){ const im=KEEP[f]=new Image(); im.src=f; KEEP[f]=im; }
    const im=KEEP[f], done=()=>{ n++; if(onp)onp(n,fs.length); };
    return (im.decode?im.decode():Promise.resolve()).catch(()=>{}).then(done); })); }
let fxLive=0;   // quantos efeitos desenhados existem agora; passou do teto, os de baixa prioridade (o.lo) nem nascem
function fxSpr(id,name,o){ const A=FXA[id]; if(!A||!A.a[name])return 0; if(fxLive>=(lite?3:7)&&o.lo)return 0; if(fxLive>=(lite?5:12))return 0;
  const [r,n]=A.a[name], sc=o.sc||1, w=288*sc, h=192*sc, fps=o.fps||12, dur=n*1000/fps, tk=token, d=o.dir||1;
  const box=document.createElement('div'), rs=document.createElement('div'), img=document.createElement('div');
  let x=o.x, y=o.y, tx=o.x, ty=o.y, rot=0, rot2=0, s0=.55;
  const mv=o.to?'travel':(o.mv||FXMOVE[name]||'pop');
  if(o.to){tx=o.to.x; ty=o.to.y; s0=.8;}
  else if(mv==='slide'){x-=d*110*sc; tx+=d*26*sc;}
  else if(mv==='dive'){x-=d*140*sc; y-=150*sc; tx+=d*10; ty+=10;}
  else if(mv==='rise'){y+=46*sc; ty-=16*sc; s0=.7;}
  else if(mv==='fall'){y-=90*sc; ty+=6; s0=.85;}
  else if(mv==='surge'){x-=d*190*sc; tx+=d*30*sc; s0=.18;}   // vai brotando e crescendo aos poucos
  else if(mv==='drift'){x-=d*30*sc; tx+=d*50*sc;}
  else if(mv==='float'){y+=18; ty-=40*sc;}
  else if(mv==='spin'){rot=R(-25,25); rot2=rot+d*R(30,60);}
  else {rot=R(-6,6); rot2=rot;}
  // só transform/opacity (compositor): box viaja (translate), rs gira/escala/some, img é o atlas. Nada de left/top animado (layout a cada quadro)
  box.className='fxs'; rs.className='fxr'; img.className='fxi';
  box.style.cssText=`left:${x-w/2}px;top:${y-h/2}px;width:${w}px;height:${h}px`;
  rs.style.cssText=`transform:rotate(${rot}deg) scale(${s0});opacity:0`;
  img.style.cssText=`background-image:url(spr/${id}_fx.png);background-size:${A.c*w}px ${6*h}px`+(o.flip?';transform:scaleX(-1)':'');
  rs.appendChild(img); box.appendChild(rs); $('fx').appendChild(box); fxLive++; void box.offsetWidth;
  const ms=dur/speed;
  // entra crescendo e vai até o destino durante quase toda a anim; some esmaecendo no fim
  box.style.transition=`transform ${ms*.85}ms cubic-bezier(.2,.7,.3,1)`;
  rs.style.transition=`transform ${ms*(mv==='surge'?1:.9)}ms ${mv==='surge'?'cubic-bezier(.25,.6,.35,1)':'cubic-bezier(.2,1.4,.4,1)'},opacity ${Math.min(120,ms*.25)}ms`;
  box.style.transform=`translate(${tx-x}px,${ty-y}px)`; rs.style.opacity=1;
  rs.style.transform=`rotate(${rot2}deg) scale(${mv==='travel'?1:1.08})`;
  let f=0;
  const step=()=>{ if(f>=n||tk!==token){box.remove();fxLive--;return;}
    if(!paused){ img.style.backgroundPosition=`${-f*w}px ${-r*h}px`; f++;
      if(f===n-1){rs.style.transition=`opacity ${1000/fps/speed*1.4}ms linear,transform ${1000/fps/speed*1.4}ms`; rs.style.opacity=0; rs.style.transform+=' scale(1.06)';} }
    setTimeout(step,1000/fps/speed); };
  step(); return dur; }
// efeito do ninja u (tipo kind) em cima do alvo t; sobra (dy) sobe ou desce o ponto
function fxAt(u,kind,t,sc,dy,ex){ const nm=(FXUSE[u.id]||{})[kind]; if(!nm)return 0; const p=cur(t);
  return fxSpr(u.id,nm,{x:p.x+R(-6,6),y:p.y-62+(dy||0)+R(-5,5),flip:u.side==='e',dir:u.side==='p'?1:-1,sc,lo:kind==='imp'||kind==='dodge',...(ex||{})}); }
// projétil desenhado: sai do atacante e viaja até o alvo. Devolve false se o ninja não tem projétil.
function fxShot(u,t,ms){ const nm=(FXUSE[u.id]||{}).proj; if(!nm)return false; const a=cur(u), b=cur(t), d=u.side==='p'?1:-1;
  fxSpr(u.id,nm,{x:a.x+d*60,y:a.y-70,to:{x:b.x-d*20,y:b.y-66},flip:d<0,dir:d,sc:.75,fps:6/(ms/1000)});
  return true; }

// ícone de jutsu (estilo barra do NO): recorta o centro do efeito do jutsu e anima os quadros em loop (CSS steps)
function fxIcon(el,id,sz){ const A=FXA[id], nm=(FXUSE[id]||{}).jutsu; if(!A||!nm||!A.a[nm])return false;
  const [r,n]=A.a[nm], e=sz/150, cw=288*e, ch=192*e, ox=(cw-sz)/2, oy=r*ch+(ch-sz)/2;
  el.style.backgroundImage=`url(spr/${id}_fx.png)`; el.style.backgroundSize=`${A.c*cw}px ${6*ch}px`;
  el.style.setProperty('--x0',`${-ox}px`); el.style.setProperty('--x1',`${-ox-n*cw}px`); el.style.backgroundPositionY=`${-oy}px`;
  el.style.backgroundPositionX=`${-ox-Math.floor(n/2)*cw}px`;   // parado (sem chakra/recarga) mostra o quadro do meio
  el.style.animationTimingFunction=`steps(${n})`; el.style.animationDuration=`${n/10}s`;
  return true; }
