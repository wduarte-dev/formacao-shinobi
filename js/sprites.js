// sprites.js — atlas/animações (SH, V2), atores, loop de animação (tick)
"use strict";
// SPR[id] = imagem do atlas; SH[id] = célula, âncora dos pés, tamanho do atlas, fator k e tabela de anims
// (anim: nome -> [linha, coluna inicial, quadros, repete, fps, próxima, pingpong]). Todos vêm do registro V2 abaixo.
const SPR={}, SH={};
// atlas v2 (pipeline tools/sprites, gerado de out/<ninja>_atlas.json): nome:[linha, quadros, fps, loop, pingpong, seq?]
// seq (opcional) = ordem dos quadros, repetindo os que devem durar mais (ex.: o Gigante de Pedra do Iwao fica ~2,5s na tela)
// hd = centro do rosto no quadro do idle (enquadra retratos e o corte do jutsu)
const V2={
 kaen:{hd:[99,60],W:2304,H:3360,a:{idle:[0,6,6,1,1],walk:[1,10,10,1,0],dash:[2,10,14,1,0],attack:[3,8,12,0,0],strong:[4,8,12,0,0],guard:[5,4,8,0,0],hurt:[6,3,10,0,0],dodge:[7,8,12,0,0],seals:[8,8,12,0,0],jutsu:[9,9,12,0,0],buff:[10,7,10,0,0],stun:[11,6,8,1,0],victory:[12,7,8,1,0],defeat:[13,9,8,0,0],knockback:[14,9,10,0,0],launched:[15,8,10,0,0],knockdown:[16,8,8,0,0],chase:[17,10,12,0,0],rise:[18,12,16,0,0],meteor:[19,12,16,0,0],landing:[20,8,12,0,0]}},
 mizuha:{hd:[91,66],H:2880,a:{idle:[0,6,6,1,0],walk:[1,8,10,1,0],dash:[2,8,14,1,0],attack:[3,6,12,0,0],strong:[4,7,12,0,0],guard:[5,4,8,0,0],hurt:[6,3,10,0,0],seals:[7,8,12,0,0],jutsu:[8,7,12,0,0],buff:[9,7,10,0,0],stun:[10,4,8,1,0],victory:[11,6,8,1,0],defeat:[12,8,8,0,0],knockback:[13,8,10,0,0],launched:[14,8,10,0,0],knockdown:[15,8,8,0,0],chase:[16,8,12,0,0],dodge:[17,7,12,0,0]}},
 raiden:{hd:[102,68],H:2880,a:{idle:[0,6,6,1,1],walk:[1,8,10,1,0],dash:[2,8,14,1,0],attack:[3,8,12,0,0],strong:[4,7,12,0,0],guard:[5,4,8,0,0],seals:[6,6,12,0,0],jutsu:[7,8,12,0,0],buff:[8,7,10,0,0],stun:[9,4,8,1,0],victory:[10,7,8,1,0],defeat:[11,7,8,0,0],knockback:[12,8,10,0,0],launched:[13,8,10,0,0],knockdown:[14,8,8,0,0],chase:[15,8,12,0,0],hurt:[16,3,10,0,0],dodge:[17,5,12,0,0]}},
 iwao:{hd:[98,69],H:2880,a:{idle:[0,6,6,1,0],walk:[1,8,10,1,0],dash:[2,8,14,1,0],attack:[3,6,12,0,0],guard:[5,4,8,0,0],hurt:[6,3,10,0,0],seals:[7,8,12,0,0,[0,1,2,3,4,5,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6,6,7]],jutsu:[8,4,12,0,0,[0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,3]],buff:[9,7,10,0,0,[0,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,3,3,4,4,5,5,5,6]],stun:[10,4,8,1,0],victory:[11,6,8,1,0,[0,1,1,1,1,1,1,1,1,1,1,2,2,3,3,3,3,3,3,3,3,3,3,3,3,4,4,5,5]],defeat:[12,8,8,0,0,[0,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,5,5,6,7]],knockback:[13,8,10,0,0],launched:[14,8,10,0,0],knockdown:[15,8,8,0,0],chase:[16,8,12,0,0,[0,0,1,1,2,2,3,3,4,4,4,4,5,5,5,5,6,7,7]],dodge:[17,7,12,0,0]}},
 fuuka:{hd:[99,65],H:2880,a:{idle:[0,6,6,1,1],walk:[1,8,10,1,0],dash:[2,8,14,1,0],attack:[3,7,12,0,0],strong:[4,7,12,0,0],guard:[5,4,8,0,0],hurt:[6,3,10,0,0],dodge:[7,6,12,0,0],seals:[8,6,12,0,0],jutsu:[9,7,12,0,0],buff:[10,5,10,0,0],stun:[11,4,8,1,0],victory:[12,6,8,1,0],defeat:[13,7,8,0,0],knockback:[14,8,10,0,0],launched:[15,8,10,0,0],knockdown:[16,8,8,0,0],chase:[17,8,12,0,0]}},
 hiyori:{hd:[98,63],H:2880,a:{idle:[0,6,6,1,0],walk:[1,8,10,1,0],dash:[2,8,14,1,0],attack:[3,8,12,0,0],strong:[4,7,12,0,0],guard:[5,4,8,0,0],hurt:[6,3,10,0,0],dodge:[7,6,12,0,0],seals:[8,6,12,0,0],jutsu:[9,8,12,0,0],buff:[10,6,10,0,0],stun:[11,4,8,1,0],victory:[12,6,8,1,0],defeat:[13,8,8,0,0],knockback:[14,8,10,0,0],launched:[15,8,10,0,0],knockdown:[16,8,8,0,0],chase:[17,8,12,0,0]}},
 mayoi:{hd:[85,65],H:2880,a:{idle:[0,5,6,1,1],walk:[1,7,10,1,0],dash:[2,8,14,1,0],attack:[3,7,12,0,0],strong:[4,7,12,0,0],guard:[5,4,8,0,0],hurt:[6,3,10,0,0],dodge:[7,8,12,0,0],seals:[8,4,12,0,0],jutsu:[9,8,12,0,0],buff:[10,5,10,0,0],stun:[11,4,8,1,0],victory:[12,6,8,1,0],defeat:[13,7,8,0,0],knockback:[14,8,10,0,0],launched:[15,8,10,0,0],knockdown:[16,8,8,0,0],chase:[17,8,12,0,0]}},
 doku:{hd:[105,48],H:2880,a:{idle:[0,6,6,1,1],walk:[1,8,10,1,0],dash:[2,8,14,1,0],attack:[3,7,12,0,0],strong:[4,8,12,0,0],guard:[5,4,8,0,0],hurt:[6,3,10,0,0],dodge:[7,7,12,0,0],seals:[8,6,12,0,0],jutsu:[9,8,12,0,0],buff:[10,6,10,0,0],stun:[11,4,8,1,0],victory:[12,6,8,1,0],defeat:[13,7,8,0,0],knockback:[14,8,10,0,0],launched:[15,8,10,0,0],knockdown:[16,8,8,0,0],chase:[17,8,12,0,0]}},
 poko:{hd:[108,50],H:2880,a:{idle:[0,5,6,1,1],walk:[1,8,10,1,0],dash:[2,8,14,1,0],attack:[3,7,12,0,0],strong:[4,7,12,0,0],guard:[5,4,8,0,0],hurt:[6,3,10,0,0],dodge:[7,6,12,0,0],seals:[8,7,12,0,0],jutsu:[9,8,12,0,0],buff:[10,7,10,0,0],stun:[11,4,8,1,0],victory:[12,7,8,1,0],defeat:[13,8,8,0,0],knockback:[14,8,10,0,0],launched:[15,8,10,0,0],knockdown:[16,8,8,0,0],chase:[17,8,12,0,0]}},
 yugami:{hd:[102,44],H:2880,a:{idle:[0,6,6,1,1],walk:[1,8,10,1,0],dash:[2,8,14,1,0],attack:[3,7,12,0,0],strong:[4,7,12,0,0],guard:[5,4,8,0,0],dodge:[7,7,12,0,0],seals:[8,6,12,0,0],jutsu:[9,7,12,0,0],buff:[10,6,10,0,0],stun:[11,4,8,1,0],victory:[12,6,8,1,0],defeat:[13,8,8,0,0],knockback:[14,8,10,0,0],launched:[15,8,10,0,0],knockdown:[16,8,8,0,0],chase:[17,8,12,0,0]}},
 yugamir:{hd:[105,44],H:3200,a:{idle:[0,6,6,1,1],walk:[1,8,10,1,0],dash:[2,8,14,1,0],attack:[3,7,12,0,0],strong:[4,7,12,0,0],guard:[5,4,8,0,0],dodge:[7,7,12,0,0],seals:[8,6,12,0,0],jutsu:[9,7,12,0,0],buff:[10,6,10,0,0],stun:[11,4,8,1,0],victory:[12,6,8,1,0],defeat:[13,8,8,0,0],knockback:[14,8,10,0,0],launched:[15,8,10,0,0],knockdown:[16,8,8,0,0],chase:[17,8,12,0,0],unhood:[18,7,10,0,0],rehood:[19,6,10,0,0]}},
};
// nomes do jogo -> nomes do pipeline; golpes voltam pro idle; sem 'hurt' usa 'guard'
const V2MAP={move:'dash',atk1:'attack',atk2:'jutsu',atk3:'strong',cast:'seals',die:'defeat',down:'knockdown',hurt:'guard'};
const V2BACK=['attack','strong','jutsu','guard','hurt','buff','dodge','landing','unhood'];
for(const [id,v] of Object.entries(V2)){
  const T={}; for(const [n,[r,f,fps,l,pp,sq]] of Object.entries(v.a)) T[n]=[r,0,f,l,fps,V2BACK.includes(n)?'idle':undefined,pp,sq];
  for(const [g,p] of Object.entries(V2MAP)) if(!T[g]&&T[p])T[g]=T[p];
  SPR[id]=`url(spr/${id}_atlas.png)`;
  SH[id]={cw:192,ch:160,ax:96,ay:150,W:v.W||1536,H:v.H,k:1/3,hd:v.hd||[96,50],anim:T};
}
// forma solta (Yugami sem capuz): outro atlas (<id>r) com os mesmos nomes de anim; u.solto liga a troca
const sid=u=>u.solto&&SH[u.id+'r']?u.id+'r':u.id;
const an_of=u=>SH[sid(u)].anim;
function setForm(u,on){ u.solto=!!on; const id=sid(u), S=SH[id], e=u.sc*S.k; u.spr.style.backgroundImage=SPR[id]; u.spr.style.backgroundSize=`${S.W*e}px ${S.H*e}px`; glitchSet(u,u.solto); }
// distorção por código: o corpo vira 3 faixas horizontais que escorregam de lado (clones recortados do mesmo quadro)
function glitchSet(u,on){ (u.gl||[]).forEach(c=>c.remove()); u.gl=[]; u.spr.classList.toggle('gl0',on); if(!on)return;
  for(const k of [1,2]){ const c=u.spr.cloneNode(); c.classList.remove('gl0'); c.classList.add('gl'+k); u.spr.after(c); u.gl.push(c); } drawFrame(u); }
// quantos passos tem a anim (pingpong vai e volta sem repetir as pontas)
const seqN=a=>a[7]?a[7].length:a[6]&&a[2]>2?a[2]*2-2:a[2];
const stAnim=(u,s)=>s?{R:'knockback',L:'launched',D:'knockdown'}[s]:'idle';
// duração real de uma animação (quadros / fps) e o momento do impacto (metade dela, com limites)
const animMs=(u,n)=>{const a=an_of(u)[n]; return a?seqN(a)*1000/a[4]:0;};
const hitAt=(u,n)=>Math.max(150,Math.min(600,animMs(u,n)*.5));
let ACT=[];                                   // tudo que está sendo animado na tela
function mkSpr(id,scale){ scale*=(N[id].size||1); const S=SH[id], e=scale*S.k, spr=document.createElement('div'); spr.className='spr';
  spr.style.cssText=`left:${-S.ax*e}px;top:${-S.ay*e}px;width:${S.cw*e}px;height:${S.ch*e}px;background-image:${SPR[id]};background-size:${S.W*e}px ${S.H*e}px;transform-origin:${S.ax*e}px ${S.ay*e}px`;
  return {id,spr,sc:scale,an:'idle',af:0,at:0,hold:false}; }
function setAnim(u,n,f,hold){const a=an_of(u)[n]; if(!a)n='idle'; u.an=n;u.af=(f||0)%seqN(an_of(u)[n]);u.at=0;u.hold=!!hold;drawFrame(u);}
function drawFrame(u){const S=SH[sid(u)], a=an_of(u)[u.an], e=u.sc*S.k, f=a[7]?a[7][u.af]:u.af<a[2]?u.af:2*a[2]-2-u.af; u.spr.style.backgroundPosition=`${-(a[1]+f)*S.cw*e}px ${-a[0]*S.ch*e}px`; if(u.gl)for(const c of u.gl)c.style.backgroundPosition=u.spr.style.backgroundPosition;}
function actor(id,scale,x,y,parent,flip){ const a=mkSpr(id,scale), el=document.createElement('div'); el.className='sp'+(flip?' flip':''); el.style.left=x+'px'; el.style.top=y+'px';
  el.appendChild(a.spr); parent.appendChild(el); a.el=el; setAnim(a,'idle',Math.random()*8|0); ACT.push(a); return a; }
// retrato: centraliza o rosto (hd) do 1º quadro de uma anim ('idle' ou 'cast') numa caixa w x h
function portrait(el,id,scale,w,h,an){ const S=SH[id], e=Math.min(scale*0.62,5)/((N[id]&&N[id].size)||1), row=S.anim[an||'idle'][0];   // ninja grande (size) afasta o zoom pra caber (asa do Poko)
  el.style.backgroundImage=SPR[id]; el.style.backgroundSize=`${S.W*e}px ${S.H*e}px`;
  el.style.backgroundPosition=`${-(S.hd[0]*e-w/2)}px ${-((row*S.ch+S.hd[1])*e-h/2)}px`; }

/* ================= LAÇO DE ANIMAÇÃO ================= */
// modo leve automático: se a batalha roda abaixo de ~30fps por ~3s seguidos (aparelho fraco), liga o modo leve sozinho (dá pra desligar no menu)
let slowAcc=0, slowN=0, slowW=0;
function autoLite(raw){ if(!battleOn||paused||lite||document.hidden||raw<=0){slowAcc=slowN=0; if(!battleOn)slowW=0; return;} if(slowW<100){slowW++;return;}   // 100 quadros de aquecimento (carga de imagens)
  slowAcc+=raw; slowN++;
  if(slowN>=120){ if(slowAcc/slowN>34){ lite=true; save(); document.body.classList.add('lite'); if(typeof liteUi==='function')liteUi(); } slowAcc=slowN=0; } }
let speed=1, paused=false, frozen=false, battleOn=false, lastT=0;
function tick(ts){
  const raw=Math.min(50,ts-lastT); lastT=ts; const dt=raw*(battleOn?speed:1);
  if(!(battleOn&&(frozen||paused))){
    for(const u of ACT){ const a=an_of(u)[u.an], per=1000/a[4]; u.at+=dt;
      while(u.at>=per){ u.at-=per;
        if(u.af<seqN(a)-1)u.af++; else if(a[3])u.af=0; else if(a[5]&&!u.hold){setAnim(u,a[5]);break;} else{u.at=0;break;}
        drawFrame(u);} }
  }
  if(battleOn&&!paused)fxStep(dt/16.7);
  autoLite(raw);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

