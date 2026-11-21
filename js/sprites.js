// sprites.js — atlas/animações (SH, ANIM), atores, loop de animação (tick)
"use strict";
const SPR={}; IDS.forEach(id=>SPR[id]=`url(spr/${id}.png)`);
// atlas por ninja: tamanho do quadro, âncora (pés), tamanho do atlas e fator de escala
const SH={}; IDS.forEach(id=>SH[id]={cw:96,ch:64,ax:24,ay:56,W:1536,H:512,k:1,hd:[27,24]});
// [linha, coluna inicial, quadros, repete, fps, próxima]
const ANIM0={idle:[0,0,8,1,9],move:[1,0,8,1,14],atk1:[2,0,6,0,16,'idle'],atk2:[3,0,6,0,16,'idle'],atk3:[4,0,6,0,16,'idle'],hurt:[5,0,3,0,10,'idle'],down:[5,1,1,1,1],cast:[6,0,8,1,10],die:[7,8,8,0,12]};
const ANIM=ANIM0;
// Kaen: atlas novo (192x160 por quadro, 18 animações)
const KANIM={idle:[0,0,6,1,7],walk:[1,0,8,1,10],move:[2,0,8,1,16],atk1:[3,0,6,0,14,'idle'],atk2:[8,0,5,0,12,'idle'],atk3:[4,0,6,0,14,'idle'],
  guard:[5,0,4,0,8,'idle'],hurt:[6,0,3,0,10,'idle'],cast:[7,0,8,1,12],buff:[9,0,6,0,10,'idle'],knockback:[10,0,8,0,11],launched:[11,0,8,0,10],
  knockdown:[12,0,4,0,10],down:[12,0,4,0,10],stun:[13,0,4,1,8],appear:[14,0,4,0,10,'idle'],chase:[15,0,8,0,16,'idle'],victory:[16,0,5,1,7],die:[17,0,8,0,10]};
SPR.kaen='url(spr/kaen_atlas.png)';
SH.kaen={cw:192,ch:160,ax:96,ay:150,W:1536,H:2880,k:1/3,hd:[96,52],anim:KANIM,rowmap:{0:0,6:7}};
const an_of=u=>SH[u.id].anim||ANIM0;
const stAnim=(u,s)=>{const A=an_of(u); return s&&A.knockback?{R:'knockback',L:'launched',D:'knockdown'}[s]:(s?'down':'idle');};
let ACT=[];                                   // tudo que está sendo animado na tela
function mkSpr(id,scale){ const S=SH[id], e=scale*S.k, spr=document.createElement('div'); spr.className='spr';
  spr.style.cssText=`left:${-S.ax*e}px;top:${-S.ay*e}px;width:${S.cw*e}px;height:${S.ch*e}px;background-image:${SPR[id]};background-size:${S.W*e}px ${S.H*e}px;transform-origin:${S.ax*e}px ${S.ay*e}px`;
  return {id,spr,sc:scale,an:'idle',af:0,at:0,hold:false}; }
function setAnim(u,n,f,hold){u.an=n;u.af=f||0;u.at=0;u.hold=!!hold;drawFrame(u);}
function drawFrame(u){const S=SH[u.id], a=an_of(u)[u.an], e=u.sc*S.k; u.spr.style.backgroundPosition=`${-(a[1]+u.af)*S.cw*e}px ${-a[0]*S.ch*e}px`;}
function actor(id,scale,x,y,parent,flip){ const a=mkSpr(id,scale), el=document.createElement('div'); el.className='sp'+(flip?' flip':''); el.style.left=x+'px'; el.style.top=y+'px';
  el.appendChild(a.spr); parent.appendChild(el); a.el=el; setAnim(a,'idle',Math.random()*8|0); ACT.push(a); return a; }
// recorte do sprite para retratos: centraliza o ponto (fx,fy) do quadro numa caixa w x h
function portrait(el,id,scale,w,h,row,col,fx,fy){ const S=SH[id]; let e=scale*S.k;
  if(S.rowmap){ e=Math.min(scale*0.62,5); row=S.rowmap[row||0]||0; fx=S.hd[0]; fy=S.hd[1]; }
  el.style.backgroundImage=SPR[id]; el.style.backgroundSize=`${S.W*e}px ${S.H*e}px`;
  el.style.backgroundPosition=`${-(((col||0)*S.cw+(fx||S.hd[0]))*e-w/2)}px ${-(((row||0)*S.ch+(fy||S.hd[1]))*e-h/2)}px`; }

/* ================= LAÇO DE ANIMAÇÃO ================= */
let speed=1, paused=false, frozen=false, battleOn=false, lastT=0;
function tick(ts){
  const raw=Math.min(50,ts-lastT); lastT=ts; const dt=raw*(battleOn?speed:1);
  if(!(battleOn&&(frozen||paused))){
    for(const u of ACT){ const a=an_of(u)[u.an], per=1000/a[4]; u.at+=dt;
      while(u.at>=per){ u.at-=per;
        if(u.af<a[2]-1)u.af++; else if(a[3])u.af=0; else if(a[5]&&!u.hold){setAnim(u,a[5]);break;} else{u.at=0;break;}
        drawFrame(u);} }
    if(battleOn)fxStep(dt/16.7);
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ================= SOM (gerado por código, WebAudio) ================= */
