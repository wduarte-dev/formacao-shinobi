// Dragão de Brasa do Kaen: dragão em peças (molde recolorido), cut-in em faixa, travessia pela fileira, reentrada por cima e queda vertical
// com desintegração. Porta da página de teste aprovada (tools/jutsu_teste_modelo.html). Desenha num canvas #kdc por cima da cena e dispara o
// dano do motor nos instantes reais de contato. Assets: spr/kaen_dragao/ (tools/sprites/kaen_dragao_build.py) e js/kaen-dragao-data.js.
const KD={W:1152,H:648,KX:70,GY:250,N:4,SC:.38,CUT:1.0,VA:1100,VB:1700,RECOIL:30,FPS_LIB:24};
const KD_NAMES=['cabeca','corpo','cauda','cabeca_desintegra','corpo_desintegra','cauda_desintegra','impacto_chao','fragmentos','fogo_crista','fogo_corpo','fogo_cauda','brasas','impacto_brasa','queima_loop','chuva_brasa','fogo_chao'];
const KD_PALS={brasa:[[0,[44,12,8]],[.35,[118,34,20]],[.65,[206,76,34]],[.9,[250,152,72]],[1,[255,226,172]]],
  earth:[[0,[36,26,16]],[.35,[90,70,48]],[.65,[160,134,96]],[.9,[216,196,154]],[1,[255,243,214]]]};
const kdIM={}, kdTC={};
let kdPromise=null, kdCv=null, kdCtx=null;
const kdcl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)), kdeo=x=>{x=kdcl(x);return 1-(1-x)*(1-x);}, kdes=x=>{x=kdcl(x);return x*x*(3-2*x);};
function kdGm(st,l){ for(let i=1;i<st.length;i++){ if(l<=st[i][0]){ const a=st[i-1],b=st[i],k=(l-a[0])/(b[0]-a[0]); return [0,1,2].map(c=>a[1][c]+(b[1][c]-a[1][c])*k); } } return st[st.length-1][1]; }
function kdLoad(){   // carrega as peças uma vez (a 1ª chamada acontece ao entrar numa luta com Kaen)
  if(kdPromise)return kdPromise;
  const list=[...KD_NAMES.map(n=>[n,`spr/kaen_dragao/${n}.png`]),['frente','spr/kaen_dragao/frente.png'],['invoc','spr/kaen_dragao/invoc.png'],['kitA','spr/kaen_dragao/kitA.png']];
  kdPromise=Promise.all(list.map(([k,src])=>new Promise(res=>{ const i=new Image(); i.onload=()=>res(); i.onerror=()=>res(); i.src=src; kdIM[k]=i; })));
  return kdPromise;
}
function kdCanvas(){
  if(kdCv&&kdCv.isConnected)return kdCtx;
  kdCv=document.createElement('canvas'); kdCv.id='kdc'; kdCv.width=KD.W; kdCv.height=KD.H; $('cam').appendChild(kdCv); kdCtx=kdCv.getContext('2d'); return kdCtx;
}
function kdRecolor(cv,pal){ if(!pal||pal==='none')return cv; const g=cv.getContext('2d'), d=g.getImageData(0,0,cv.width,cv.height), p=d.data, st=KD_PALS[pal];
  for(let i=0;i<p.length;i+=4){ if(!p[i+3])continue; const l=(p[i]*.3+p[i+1]*.59+p[i+2]*.11)/255, m=kdGm(st,l); p[i]=m[0];p[i+1]=m[1];p[i+2]=m[2]; } g.putImageData(d,0,0); return cv; }
function kdCell(img,sx,sy,w,h){ const cv=document.createElement('canvas'); cv.width=w; cv.height=h; const g=cv.getContext('2d'); g.imageSmoothingEnabled=false; g.drawImage(img,sx,sy,w,h,0,0,w,h); return cv; }
function kdFrame(name,col,pal){ const k=name+col+pal; return kdTC[k]||(kdTC[k]=kdRecolor(kdCell(kdIM[name],col*256,0,256,256),pal)); }
function kdInvoc(row,f){ const k='i'+row+'_'+f; return kdTC[k]||(kdTC[k]=kdCell(kdIM.invoc,f*256,row*256,256,256)); }
function kdFront(f){ const k='f'+f; if(kdTC[k])return kdTC[k]; const cw=kdIM.frente.width/2, ch=kdIM.frente.height/3; return kdTC[k]=kdRecolor(kdCell(kdIM.frente,(f%2)*cw,Math.floor(f/2)*ch,cw,ch),'brasa'); }
function kdKit(row,col,pal='earth'){ const k='kA'+row+col+pal; return kdTC[k]||(kdTC[k]=kdRecolor(kdCell(kdIM.kitA,col*256,row*256,256,256),pal)); }
function kdPiece(c,cv,x,y,sc,rot,ax,ay,o={}){ c.save(); c.translate(x,y); c.rotate(rot||0); c.scale(sc*(o.fx||1),sc); c.globalAlpha=o.a===undefined?1:o.a; c.imageSmoothingEnabled=false; c.drawImage(cv,-ax,-ay); c.restore(); }
function kdStrip(c,name,tau,fps,x,y,sc,o={}){ if(tau<0)return; let f=Math.floor(tau*fps); if(f>5){ if(!o.loop)return; f%=6; } kdPiece(c,kdFrame(name,f,o.pal||'none'),x,y,sc,o.rot,128,o.bottom?246:128,o); }
function kdInv(c,row,tau,fps,x,y,sc,o={}){ if(tau<0)return; let f=o.f!==undefined?o.f:Math.floor(tau*fps); if(f>5){ if(!o.loop)return; f%=6; } c.save(); c.translate(x,y); c.scale(sc,sc); c.globalAlpha=o.a===undefined?1:o.a; c.imageSmoothingEnabled=false; c.drawImage(kdInvoc(row,f),-128,o.bottom?-246:-128); c.restore(); }

// modelo da cena: coordenadas "de referência" (Kaen em KX, chão em GY) mapeadas pro palco por uma transformação (dir, posição do Kaen)
function kdModel(u,ts){
  const P=KDG.pecas, dir=u.side==='p'?1:-1, p=pos(u), N=KD.N, sc=KD.SC;
  const bodyEsp=(P.corpo.espL+P.corpo.espR)/2, sH=sc*bodyEsp/P.cabeca.espL, sT=sc*bodyEsp/P.cauda.espR;
  const Lb=(P.corpo.r-P.corpo.l)*sc, Lt=(P.cauda.r-P.cauda.l)*sT, Lh=(P.cabeca.r-P.cabeca.l)*sH, tipOff=Lh*.85;
  const tg=ts.map(t=>{ const c=cur(t); return {t,x:KD.KX+(c.x-p.x)*dir,y:KD.GY+(pos(t).y-p.y)}; }).sort((a,b)=>a.x-b.x);
  const slam=tg[Math.min(1,tg.length-1)];
  const x0=KD.KX+KDG.ponta[0]+4, y0=KD.GY+KDG.ponta[1];
  const edge=KD.KX+(dir>0?KD.W-p.x:p.x), XE=edge+260;
  const Gx=Lh+N*Lb+Lt+120, D1=(XE-x0)+Gx, XS=slam.x, YS0=-(Lh+80)-(p.y-KD.GY), yEnd=slam.y-Lh+6, D2=yEnd-YS0, Lend=D1+D2;
  const tArm=.7, tR=tArm+.2, tTP=tR+D1/KD.VA, tSlam=tTP+D2/KD.VB;
  const hitG=tg.map(o=>tR+(o.x-tipOff-x0)/KD.VA);
  const STOPS=[{t:tR,d:KD.CUT},...hitG.map(t=>({t,d:.08})),{t:tSlam,d:.16}];
  const M={u,dir,p,tg,slam,sc,sH,sT,Lb,Lt,Lh,tipOff,x0,y0,XE,D1,D2,XS,YS0,yEnd,Lend,tR,tTP,tSlam,hitG,STOPS,aH:[P.cabeca.l,P.cabeca.cyL],aB:[(P.corpo.l+P.corpo.r)/2,(P.corpo.cyL+P.corpo.cyR)/2],aT:[P.cauda.r,P.cauda.cyR]};
  M.tgOf=T=>{ let q=T,acc=0; STOPS.forEach(s=>{ const w=s.t+acc; q-=Math.min(Math.max(T-w,0),s.d); acc+=s.d; }); return q; };
  M.Wof=te=>{ let acc=0; STOPS.forEach(s=>{ if(s.t<=te)acc+=s.d; }); return te+acc; };
  M.Lof=t=>t<=tR?0:t<tTP?KD.VA*(t-tR):D1+KD.VB*(t-tTP);
  M.pathAt=L=>L<=D1?[x0+L,y0-8*Math.sin(L*.01)]:[XS,YS0+(L-D1)];
  M.angAt=L=>L<=D1?Math.atan(-.08*Math.cos(L*.01)):Math.PI/2;
  M.dieOf=sv=>tSlam+sv/(KD.VB*.8);
  M.tauT=N*Lb/KD.VA; M.h1=tR+M.tauT+.2;
  M.kxo=tt=>tt<=tR?0:tt<=M.h1?-KD.RECOIL*kdeo((tt-tR)/(M.h1-tR)):-KD.RECOIL*(1-kdes((tt-M.h1)/.5));
  M.LEN=tSlam+(N*Lb+Lt)/(KD.VB*.8)+.5+2.4+.4;
  return M;
}
// o desenho todo, em coordenadas de referência (a transformação do chamador leva pro palco)
function kdDraw(c,M,T){
  const {N,SC}=KD, sc=M.sc, t=M.tgOf(T), Lw=M.Lof(t), ph=Math.floor(T*12), tauS=T-M.Wof(M.tSlam), GYs=M.slam.y, XS=M.XS;
  if(tauS>=0)kdStrip(c,'fogo_chao',tauS,10,XS,GYs+8,.72,{bottom:1,loop:1,a:.8*(tauS>1.7?Math.max(0,1-(tauS-1.7)/.5):1)});
  M.tg.forEach((o,j)=>{ const tau=T-M.Wof(M.hitG[j]), tb=tauS>=0?tauS:tau, burnS=tauS>=0?.55:.5, gy=o.y;
    if(tb>=0&&tb<1.9){ const fa=tb>1.55?1-(tb-1.55)/.35:1; kdStrip(c,'queima_loop',tb,10,o.x,gy+4,burnS,{loop:1,bottom:1,a:.85*fa}); kdStrip(c,'fogo_chao',tb,10,o.x,gy+4,.4,{loop:1,bottom:1,a:.8*fa}); kdStrip(c,'chuva_brasa',tb,8,o.x,gy-55,.5,{loop:1,a:.75*fa}); } });
  for(let i=0;i*.07<M.h1-M.tR;i++){ const te=M.tR+i*.07, td=T-M.Wof(te); if(td>=0){ const df=Math.floor(td*14); if(df<=5)kdPiece(c,kdKit(0,df),KD.KX+M.kxo(te)-14,KD.GY+6,.38,0,128,246,{fx:-1}); } }
  // invocação nas mãos: concentra, portal e cone ficam abertos enquanto o dragão sai, depois fecham
  const t0=T-M.Wof(M.tR), tg0=T-M.Wof(M.tR-.35), emDur=M.Wof(M.h1)-M.Wof(M.tR), x0=M.x0, y0=M.y0;
  if(tg0>=0&&tg0<.35)kdInv(c,2,tg0,12,x0-6,y0,.36,{loop:1,a:.95});
  if(t0>=0&&t0<emDur+.3){ const fo=t0>emDur?1-(t0-emDur)/.3:1;
    const fr1=t0<.25?Math.floor(t0*12):(t0<emDur?3+Math.floor((t0-.25)*10)%2:5);
    const fr0=t0<.25?Math.floor(t0*12):(t0<emDur?2+Math.floor((t0-.25)*10)%2:Math.min(5,4+Math.floor((t0-emDur)*10)));
    kdInv(c,1,t0,12,x0+8,y0-4,.52,{f:fr1,a:fo}); kdInv(c,0,t0,12,x0+30,y0-6,.5,{f:fr0,a:.9*fo}); kdStrip(c,'brasas',t0,10,x0-4,y0,.4,{loop:1,a:.8*fo}); }
  // dragão: peças por comprimento de arco; só se desfazem na batida vertical
  const sTail=N*M.Lb, LpT=Lw-sTail;
  if(LpT>0){ const lc=Math.min(LpT,M.Lend), p=M.pathAt(lc), r=M.angAt(lc), dT=M.dieOf(sTail);
    if(t<dT){ kdPiece(c,kdFrame('fogo_cauda',(ph+1)%6,'none'),p[0],p[1],M.sT,r,M.aT[0],M.aT[1],{a:.9}); kdPiece(c,kdFrame('cauda',(ph+3)%6,'brasa'),p[0],p[1],M.sT,r,M.aT[0],M.aT[1]); }
    else if((t-dT)*12<=5.99)kdPiece(c,kdFrame('cauda_desintegra',Math.floor((t-dT)*12),'brasa'),p[0],p[1],M.sT,r,M.aT[0],M.aT[1]); }
  for(let k=N-1;k>=0;k--){ const sk=(k+.5)*M.Lb, Lk=Lw-sk; if(Lk<=0)continue; const lk=Math.min(Lk,M.Lend), p2=M.pathAt(lk), r2=M.angAt(lk), die=M.dieOf(sk);
    if(t<die){ kdPiece(c,kdFrame('fogo_corpo',(ph+k+2)%6,'none'),p2[0],p2[1]-3,sc,r2,M.aB[0],M.aB[1],{a:.9}); kdPiece(c,kdFrame('corpo',(ph+k)%6,'brasa'),p2[0],p2[1],sc,r2,M.aB[0],M.aB[1]); }
    else{ const fd=Math.floor((t-die)*12); if(fd<=5){ kdPiece(c,kdFrame('corpo_desintegra',fd,'brasa'),p2[0],p2[1],sc,r2,M.aB[0],M.aB[1]); kdStrip(c,'impacto_brasa',t-die,12,p2[0],p2[1],.3); } kdStrip(c,'brasas',T-M.Wof(die),10,p2[0],p2[1]-6,.4); } }
  if(Lw>0){ const lh=Math.min(Lw,M.Lend), hp=M.pathAt(lh), hr=M.angAt(lh);
    if(t<M.tSlam){ kdPiece(c,kdFrame('fogo_crista',(ph+2)%6,'none'),hp[0]-4,hp[1]-2,M.sH,hr,M.aH[0],M.aH[1],{a:.9}); kdPiece(c,kdFrame('cabeca',ph%6,'brasa'),hp[0],hp[1],M.sH,hr,M.aH[0],M.aH[1]); }
    else{ const fh=Math.floor((t-M.tSlam)*12); if(fh<=5){ kdPiece(c,kdFrame('cabeca_desintegra',fh,'brasa'),hp[0],hp[1],M.sH,hr,M.aH[0],M.aH[1],{a:kdcl(1-(t-M.tSlam-.04)/.26)}); kdStrip(c,'impacto_brasa',t-M.tSlam,12,hp[0],hp[1]+10,.5); } } }
  for(let j=0;j<=N;j++){ const sj=j*M.Lb, Lj=Lw-sj; if(Lj<=0)continue; if(t>=M.dieOf(sj)+.02)continue; const lj=Math.min(Lj,M.Lend), pj=M.pathAt(lj), rj=M.angAt(lj); kdPiece(c,kdFrame('fogo_corpo',(ph+j*2)%6,'none'),pj[0],pj[1]+4,sc*.42,rj,128,170,{a:.9}); }
  // destroços que acumulam no chão e somem devagar
  const svs=[0]; for(let q=0;q<N;q++)svs.push((q+.5)*M.Lb); svs.push(N*M.Lb);
  svs.forEach((sv,qi)=>{ const td=T-M.Wof(M.dieOf(sv)); if(td>=.18&&td<2.1){ const al=td>1.3?Math.max(0,1-(td-1.3)/.8):1, xo=XS-56+qi*(104/(svs.length-1))+((qi*37)%9-4);
    kdPiece(c,kdFrame('impacto_chao',4+(qi%2),'brasa'),xo,GYs+8,.55,0,128,246,{a:al}); kdPiece(c,kdFrame('impacto_chao',5,'brasa'),xo+10,GYs+8,.42,0,128,246,{a:al*.9,fx:-1}); } });
  if(tauS>=0&&tauS<1.7)kdStrip(c,'fragmentos',tauS,8,XS,GYs-50,.6,{loop:1,pal:'brasa',a:.85*(tauS>1.3?Math.max(0,1-(tauS-1.3)/.4):1)});
  if(tauS>=0){ kdStrip(c,'impacto_brasa',tauS,12,XS-8,GYs-72,.86); const dd=Math.floor(tauS*12);
    if(dd<=5){ kdPiece(c,kdKit(0,dd),XS-64,GYs+8,.8,0,128,246); kdPiece(c,kdKit(0,dd),XS+64,GYs+8,.8,0,128,246,{fx:-1}); kdPiece(c,kdKit(2,Math.min(5,Math.floor(tauS*10)),'brasa'),XS,GYs-20,.9,0,128,128); } }
  M.tg.forEach((o,j)=>{ const tau=T-M.Wof(M.hitG[j]); kdStrip(c,'impacto_brasa',tau,14,o.x,o.y-56,.68); kdStrip(c,'impacto_brasa',tau-.04,14,o.x+6,o.y-70,.42); kdStrip(c,'fragmentos',tau-.04,10,o.x-8,o.y-70,.5,{pal:'brasa'});
    if(tauS>=0)kdStrip(c,'impacto_brasa',tauS-.02,14,o.x,o.y-56,.8); });
}
// cut-in em faixa horizontal (25%-74% da altura): cena escurece, linhas de velocidade, dragão de frente à direita, nome em pincelada à esquerda
function kdCutin(c,tc,name){
  if(tc<0||tc>KD.CUT)return; const W=KD.W,H=KD.H, k=Math.min(kdes(tc/.09),kdes((KD.CUT-tc)/.09)), y0=H*.25, y1=H*.74, cy=(y0+y1)/2, hh=(y1-y0)/2*k, S=W/480;
  c.fillStyle=`rgba(0,0,0,${(.62*k).toFixed(2)})`; c.fillRect(0,0,W,H);
  c.save(); c.beginPath(); c.rect(0,cy-hh,W,hh*2); c.clip();
  const g=c.createLinearGradient(0,y0,0,y1); g.addColorStop(0,'#1a0806'); g.addColorStop(.5,'#5a1a0c'); g.addColorStop(1,'#1a0806'); c.fillStyle=g; c.fillRect(0,y0,W,y1-y0);
  c.strokeStyle='rgba(255,220,170,.38)'; c.lineWidth=1.5*S; c.beginPath();
  for(let i=0;i<28;i++){ const ly=y0+((i*37)%100)/100*(y1-y0), sp=(320+((i*53)%220))*S, lx=((tc*sp+i*71)%(W+120))-60, ll=(40+((i*29)%80))*S; c.moveTo(lx,ly); c.lineTo(lx+ll,ly); } c.stroke();
  const ff=tc<.62?Math.min(5,Math.floor(tc*8)):4+(Math.floor(tc*14)%2), sh=tc>.55?Math.sin(tc*90)*2.4*S*Math.exp(-(tc-.55)*2.5):0, zz=1+.025*Math.sin(tc*9);
  c.save(); c.translate(300*S+sh,cy+4*S); c.scale(.45*zz*S,.45*zz*S); c.imageSmoothingEnabled=false; const cv=kdFront(ff); c.drawImage(cv,-cv.width/2,-cv.height/2); c.restore();
  const ts=tc-.1;
  if(ts>=0){ const s2=1+.55*Math.exp(-ts*16); c.save(); c.translate(26*S,cy+12*S); c.rotate(-.1); c.scale(s2*S,s2*S); c.font='italic 900 34px Impact,"Arial Black",sans-serif'; c.textBaseline='alphabetic'; c.lineJoin='round';
    const L=name.toUpperCase().split(' '); const L1=L.slice(0,1).join(' '), L2=L.slice(1).join(' '); c.lineWidth=7; c.strokeStyle='#000'; c.strokeText(L1,0,-16); c.strokeText(L2,6,22); c.fillStyle='#fff6e6'; c.fillText(L1,0,-16); c.fillText(L2,6,22);
    c.font='italic 900 30px Impact,"Arial Black",sans-serif'; c.lineWidth=6; c.strokeText('!!',150,-30); c.fillStyle='#ff7a2a'; c.fillText('!!',150,-30); c.restore(); }
  c.restore();
  c.fillStyle=`rgba(255,170,90,${k.toFixed(2)})`; c.fillRect(0,cy-hh-1,W,2); c.fillRect(0,cy+hh-1,W,2);
}
// jutsu completo do Kaen (motor): selos -> liberação -> cut-in -> dragão cruza a fileira -> reentra por cima e cai -> desintegra
async function kaenDragonJutsu(u,main,sk,ts){
  const dir=u.side==='p'?1:-1, connected=new Set(); let tot=0;
  const done=kdLoad(); const ctx=kdCanvas(); ctx.clearRect(0,0,KD.W,KD.H);
  sceneOn([u]); skTag(u,sk.name); setAnim(u,'cast'); sfx.cast(u); fxAt(u,'aura',u,1.05,18);
  await sleep(520); await done;
  if(ts.some(t=>t.side!==u.side))markTargets(ts); else ts.forEach(sceneAdd);
  u.el.style.zIndex=60; setAnim(u,'atk2',0,true);
  const rel=Math.max(300,animMs(u,'atk2')*.7), M=kdModel(u,ts);
  await sleep(rel);
  // ---- liberação: congela com as mãos abertas, cut-in, depois o dragão ----
  setAnim(u,'atk2',28,'frame'); sfx.jutsu(u); sfx.voz(u,'jutsu');
  const hitStep=(t,share,big)=>{ if(!t.alive)return; fxAt(u,'imp',t,.55,-8); const dealt=landHit(u,t,sk.mult*share,false,'big',true); if(dealt!==null){ tot+=dealt; connected.add(t); spark(t,u.d.c,big?12:8); } };
  const fired=new Set(), T0=performance.now(); let T=0, last=T0, released=false;
  const wallHit=M.hitG.map(t=>M.Wof(t)-.08), wallSlam=M.Wof(M.tSlam)-.16;
  const mvx=0; u.mv.style.transition='none';
  await new Promise((resolve,reject)=>{
    const tok=token, tick=now=>{
      if(tok!==token){ ctx.clearRect(0,0,KD.W,KD.H); return reject(ABORT); }
      if(paused){ last=now; requestAnimationFrame(tick); return; }
      T+=Math.min(.05,(now-last)/1000)*speed; last=now;
      if(!released&&T>=M.tR){ released=true; }
      const t=M.tgOf(T);
      ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,KD.W,KD.H);
      ctx.save(); ctx.setTransform(dir,0,0,1,M.p.x-dir*KD.KX,M.p.y-KD.GY); kdDraw(ctx,M,T); ctx.restore();
      ctx.setTransform(1,0,0,1,0,0); kdCutin(ctx,T-M.tR,sk.name);
      u.mv.style.transform=`translate(${dir*M.kxo(t)}px,0)`;
      if(T>M.tR+KD.CUT&&!fired.has('h1')&&t>=M.h1){ fired.add('h1'); setAnim(u,'atk2',28,true); }
      if(T>=M.tR&&!fired.has('c')){ fired.add('c'); sfx.heavy(); flashSoft(); }
      wallHit.forEach((w,j)=>{ if(T>=w&&!fired.has('t'+j)){ fired.add('t'+j); const o=M.tg[j]; sfx.hit(); shake(.5); hitStep(o.t,.4,false); } });
      if(T>=wallSlam&&!fired.has('s')){ fired.add('s'); sfx.heavy(); shake(1.4); flash(); M.tg.forEach(o=>hitStep(o.t,.6,true)); sfx.thud(); }
      if(T>=M.LEN){ ctx.clearRect(0,0,KD.W,KD.H); return resolve(); }
      requestAnimationFrame(tick); };
    requestAnimationFrame(now=>{ last=now; tick(now); }); });
  u.mv.style.transition=''; u.mv.style.transform='';
  connected.forEach(t=>{ if(!t.alive)return;
    if(sk.dot)t.dot={dmg:Math.round(u.atk*sk.dot.mult),rounds:sk.dot.rounds+(fieldA&&u.side===fieldA.side&&fieldA.fx.dot?fieldA.fx.dot[u.d.el]||0:0),el:u.d.el}; upd(t); });
  if(sk.dot)sfx.apply('burn');
  log(`${nm(u)} solta <b>${sk.name}</b>: ${tot} de dano`);
  if(result())await finale(main);
  const stateHit=connected.has(main)&&sk.cause&&main.alive, ko=stateHit&&!main.d.immuneState;
  if(stateHit&&main.d.immuneState)kazanGuard(main);
  if(ko){ endCine(); await smash(u,main,sk.cause); } else await hitstop(70);
  endCine(); home(u); u.el.style.zIndex=u.z;
  if(ko){ comboShow(u,main); await chain(u.side,main,1,u); if(main.alive){ await sleep(140); setState(main,null); main.el.style.zIndex=main.z; } }
  await sleep(160);
}
