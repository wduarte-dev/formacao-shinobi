// fx.js — partículas e efeitos de elemento (canvas)
"use strict";
const FX=[], BOLT=[]; const fxc=$('fxc').getContext('2d'), K=2.5;
const R=(a,b)=>a+Math.random()*(b-a), pk=a=>a[Math.random()*a.length|0];
function em(n,f){for(let i=0;i<n;i++)FX.push(f(i));}
// valores em "unidades de efeito": o K converte para o tamanho do palco
function prt(x,y,dx,dy,vx,vy,g,life,w,h,col,round){return{x:x+dx*K,y:y+dy*K,vx:vx*K,vy:vy*K,g:g*K,life,max:life,w:w*K,h:(h||w)*K,col,round};}
function fxStep(k){
  const c=fxc; c.clearRect(0,0,384,216);
  for(let i=FX.length-1;i>=0;i--){const p=FX[i]; p.vy+=p.g*k; p.x+=p.vx*k; p.y+=p.vy*k; p.life-=k; if(p.life<=0){FX.splice(i,1);continue;}
    c.globalAlpha=Math.min(1,p.life/p.max*1.6)*(p.round?.7:1); c.fillStyle=p.col;
    if(p.round){c.beginPath();c.arc(p.x/3,p.y/3,p.w/6,0,7);c.fill();}
    else c.fillRect(Math.round((p.x-p.w/2)/3),Math.round((p.y-p.h/2)/3),Math.max(1,Math.round(p.w/3)),Math.max(1,Math.round(p.h/3)));}
  for(let i=BOLT.length-1;i>=0;i--){const b=BOLT[i]; b.life-=k; if(b.life<=0){BOLT.splice(i,1);continue;}
    c.globalAlpha=1; c.strokeStyle=b.col; c.lineWidth=b.lw; c.beginPath(); b.pts.forEach((q,j)=>j?c.lineTo(q[0]/3,q[1]/3):c.moveTo(q[0]/3,q[1]/3)); c.stroke();}
  c.globalAlpha=1;
}
const PAL={Fogo:['#fff3a0','#ffb327','#e5533d','#8a2424'],'Água':['#ffffff','#9fd4ff','#3d8fe5','#2a5fb0'],Raio:['#ffffff','#fff27a','#e5c33d'],Terra:['#d9b27a','#9a7748','#5a4634'],
  Vento:['#ffffff','#c9f5e2','#5fc9a0'],Sombra:['#c9b4ff','#9a7fe0','#2a2340','#000000'],Névoa:['#ffffff','#d9c8f5','#b79ae0','#7d6aa8'],Gelo:['#ffffff','#c8f1fb','#7fd3e8'],Veneno:['#d9f59a','#9bc53d','#4d6a1f']};
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
 mayoi:{c:8,a:{swarm:[0,6],cloud:[1,6],wave:[2,6],impact:[3,6],aura:[4,6],flash:[5,6]}}
};
// qual efeito cada ninja usa em cada momento: hit = básico, jutsu, chase = perseguição, dodge = esquiva
const FXUSE={kaen:{hit:'slash',jutsu:'dragon',chase:'meteor'}, mizuha:{hit:'splash',jutsu:'rain',chase:'wave'},
  raiden:{hit:'spark',jutsu:'burst',chase:'chain'}, iwao:{hit:'rocks',jutsu:'dome',chase:'crack'},
  hiyori:{hit:'blade',jutsu:'prison',chase:'pillar'}, fuuka:{hit:'gust',jutsu:'tornado',chase:'whirlwind'},
  mayoi:{hit:'impact',jutsu:'cloud',chase:'swarm',dodge:'cloud'}};
// toca um efeito do atlas em (x,y) do palco; flip espelha (inimigo ataca da direita). Devolve a duração em ms.
function fxSpr(id,name,x,y,flip,sc){ const A=FXA[id]; if(!A||!A.a[name])return 0;
  const [r,n]=A.a[name], w=288*(sc||1), h=192*(sc||1), e=document.createElement('div'), tk=token;
  e.className='fxs'; e.style.cssText=`left:${x-w/2}px;top:${y-h/2}px;width:${w}px;height:${h}px;background-image:url(spr/${id}_fx.png);background-size:${A.c*w}px ${6*h}px`+(flip?';transform:scaleX(-1)':'');
  $('fx').appendChild(e); let f=0;
  const step=()=>{ if(f>=n||tk!==token){e.remove();return;} if(!paused&&!frozen){e.style.backgroundPosition=`${-f*w}px ${-r*h}px`; f++;} setTimeout(step,1000/12/speed); };
  step(); return n*1000/12; }
// efeito do ninja u (tipo kind) em cima do alvo t
function fxAt(u,kind,t,sc){ const nm=(FXUSE[u.id]||{})[kind]; if(!nm)return 0; const p=cur(t); return fxSpr(u.id,nm,p.x,p.y-62,u.side==='e',sc); }
