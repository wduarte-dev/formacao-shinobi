// Dragão de Brasa do Kaen: dragão em peças (molde recolorido), cut-in em faixa, travessia pela fileira, reentrada por cima e queda vertical
// com desintegração. Porta da página de teste aprovada (tools/jutsu_teste_modelo.html). Desenha num canvas #kdc por cima da cena e dispara o
// dano do motor nos instantes reais de contato. Assets: spr/kaen_dragao/ (tools/sprites/kaen_dragao_build.py) e js/kaen-dragao-data.js.
const KD={BIG:3.2,W:1152,H:648,KX:70,GY:250,N:4,SC:.38,CUT:1.0,VA:1100,VB:1700,RECOIL:30,FPS_LIB:24};
const KD_NAMES=['cabeca','corpo','cauda','cabeca_desintegra','corpo_desintegra','cauda_desintegra','impacto_chao','fragmentos','fogo_crista','fogo_corpo','fogo_cauda','brasas','impacto_brasa','queima_loop','chuva_brasa','fogo_chao'];
const KD_PALS={brasa:[[0,[44,12,8]],[.35,[118,34,20]],[.65,[206,76,34]],[.9,[250,152,72]],[1,[255,226,172]]],
  earth:[[0,[36,26,16]],[.35,[90,70,48]],[.65,[160,134,96]],[.9,[216,196,154]],[1,[255,243,214]]]};
const kdIM={}, kdTC={};
let kdPromise=null, kdCv=null, kdCtx=null;
const kdcl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)), kdeo=x=>{x=kdcl(x);return 1-(1-x)*(1-x);}, kdes=x=>{x=kdcl(x);return x*x*(3-2*x);};
function kdGm(st,l){ for(let i=1;i<st.length;i++){ if(l<=st[i][0]){ const a=st[i-1],b=st[i],k=(l-a[0])/(b[0]-a[0]); return [0,1,2].map(c=>a[1][c]+(b[1][c]-a[1][c])*k); } } return st[st.length-1][1]; }
const KD_BRASA=['cabeca','corpo','cauda','cabeca_desintegra','corpo_desintegra','cauda_desintegra','impacto_chao','fragmentos'];   // peças tingidas de brasa
function kdLoad(){   // carrega, DECODIFICA e aquece tudo na tela de carregamento (nunca no instante do golpe); a 1ª chamada acontece ao entrar numa luta com Kaen
  if(kdPromise)return kdPromise;
  const list=[...KD_NAMES.map(n=>[n,`spr/kaen_dragao/${n}.webp`]),['frente','spr/kaen_dragao/frente.webp'],['invoc','spr/kaen_dragao/invoc.webp'],['kitA','spr/kaen_dragao/kitA.webp']];
  kdPromise=Promise.all(list.map(([k,src])=>new Promise(res=>{ const i=new Image(); i.onload=()=>(i.decode?i.decode().catch(()=>{}):Promise.resolve()).then(res); i.onerror=()=>res(); i.src=src; kdIM[k]=i; }))).then(()=>typeof kitLoad==='function'?kitLoad():0).then(kdWarm);
  return kdPromise;
}
// monta de antemão todos os quadros recoloridos (getImageData/putImageData são o que engasgava no 1º golpe), em fatias de ~6 ms pra não travar o carregamento
async function kdWarm(){
  const jobs=[]; KD_NAMES.forEach(n=>{ for(let f=0;f<6;f++){ jobs.push(()=>kdFrame(n,f,'none')); if(KD_BRASA.includes(n))jobs.push(()=>kdFrame(n,f,'brasa')); } });
  for(let f=0;f<6;f++){ jobs.push(()=>kdFront(f)); for(let r=0;r<3;r++)jobs.push(()=>kdInvoc(r,f)); jobs.push(()=>kdKit(0,f)); jobs.push(()=>kdKit(2,f,'brasa')); }
  let t0=performance.now();
  for(const j of jobs){ try{ j(); }catch(e){} if(performance.now()-t0>6){ await new Promise(r=>setTimeout(r,0)); t0=performance.now(); } }
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
function kdPiece(c,cv,x,y,sc,rot,ax,ay,o={}){ c.save(); c.translate(x,y); c.rotate(rot||0); if(o.plane)planeXf(c,o.pf); c.scale(sc*(o.fx||1),sc); c.globalAlpha=o.a===undefined?1:o.a; c.imageSmoothingEnabled=false; c.drawImage(cv,-ax,-ay); c.restore(); }
function kdStrip(c,name,tau,fps,x,y,sc,o={}){ if(tau<0)return; let f=Math.floor(tau*fps); if(f>5){ if(!o.loop)return; f%=6; } kdPiece(c,kdFrame(name,f,o.pal||'none'),x,y,sc,o.rot,128,o.bottom?246:128,o); }
function kdInv(c,row,tau,fps,x,y,sc,o={}){ if(tau<0)return; let f=o.f!==undefined?o.f:Math.floor(tau*fps); if(f>5){ if(!o.loop)return; f%=6; } c.save(); c.translate(x,y); c.scale(sc,sc); c.globalAlpha=o.a===undefined?1:o.a; c.imageSmoothingEnabled=false; c.drawImage(kdInvoc(row,f),-128,o.bottom?-246:-128); c.restore(); }

// modelo da cena: coordenadas "de referência" (Kaen em KX, chão em GY) mapeadas pro palco por uma transformação (dir, posição do Kaen)
function kdModel(u,ts,all){
  const P=KDG.pecas, dir=u.side==='p'?1:-1, p=pos(u), N=KD.N, sc=KD.SC;
  const bodyEsp=(P.corpo.espL+P.corpo.espR)/2, sH=sc*bodyEsp/P.cabeca.espL, sT=sc*bodyEsp/P.cauda.espR;
  const Lb=(P.corpo.r-P.corpo.l)*sc, Lt=(P.cauda.r-P.cauda.l)*sT, Lh=(P.cabeca.r-P.cabeca.l)*sH, tipOff=Lh*.85;
  const tg=ts.map(t=>{ const c=cur(t); return {t,x:KD.KX+(c.x-p.x)*dir,y:KD.GY+(pos(t).y-p.y)}; }).sort((a,b)=>a.x-b.x);
  const av=(all&&all.length?all:ts).map(t=>{ const c=cur(t); return {t,x:KD.KX+(c.x-p.x)*dir,y:KD.GY+(pos(t).y-p.y)}; });
  const slam={x:av.reduce((a,o)=>a+o.x,0)/av.length, y:av.reduce((a,o)=>a+o.y,0)/av.length};   // a queda cai no centro da malha inimiga inteira
  const x0=KD.KX+KDG.ponta[0]+4, y0=KD.GY+KDG.ponta[1];
  const edge=KD.KX+(dir>0?KD.W-p.x:p.x), XE=edge+260;
  const Gx=Lh+N*Lb+Lt+120, D1=(XE-x0)+Gx, XS=slam.x, YS0=-(Lh+80)-(p.y-KD.GY), yEnd=slam.y-Lh+6, D2=yEnd-YS0, Lend=D1+D2;
  const tArm=.7, tR=tArm+.2, tTP=tR+D1/KD.VA, tSlam=tTP+D2/KD.VB;
  const hitG=tg.map(o=>tR+(o.x-tipOff-x0)/KD.VA);
  const STOPS=[{t:tR,d:KD.CUT},...hitG.map(t=>({t,d:.08})),{t:tSlam,d:.16}];
  const M={u,dir,p,tg,av,slam,sc,sH,sT,Lb,Lt,Lh,tipOff,x0,y0,XE,D1,D2,XS,YS0,yEnd,Lend,tR,tTP,tSlam,hitG,STOPS,aH:[P.cabeca.l,P.cabeca.cyL],aB:[(P.corpo.l+P.corpo.r)/2,(P.corpo.cyL+P.corpo.cyR)/2],aT:[P.cauda.r,P.cauda.cyR]};
  M.tgOf=T=>{ let q=T,acc=0; STOPS.forEach(s=>{ const w=s.t+acc; q-=Math.min(Math.max(T-w,0),s.d); acc+=s.d; }); return q; };
  M.Wof=te=>{ let acc=0; STOPS.forEach(s=>{ if(s.t<=te)acc+=s.d; }); return te+acc; };
  M.Lof=t=>t<=tR?0:t<tTP?KD.VA*(t-tR):D1+KD.VB*(t-tTP);
  M.pathAt=L=>L<=D1?[x0+L,y0-8*Math.sin(L*.01)]:[XS,YS0+(L-D1)];
  M.angAt=L=>L<=D1?Math.atan(-.08*Math.cos(L*.01)):Math.PI/2;
  M.gOf=t=>t<tTP?1:1+(KD.BIG-1)*kdes((t-tTP)/((tSlam-tTP)*.9));   // na descida tudo cresce, pra cobrir a malha toda
  M.dieOf=sv=>tSlam;   // o dragão INTEIRO é esmagado no chão de uma vez (nunca peça por peça)
  M.tauT=N*Lb/KD.VA; M.h1=tR+M.tauT+.2;
  M.kxo=tt=>tt<=tR?0:tt<=M.h1?-KD.RECOIL*kdeo((tt-tR)/(M.h1-tR)):-KD.RECOIL*(1-kdes((tt-M.h1)/.5));
  M.LEN=tSlam+(N*Lb+Lt)/(KD.VB*.8)+.5+2.4+.4;
  return M;
}
// o desenho todo, em coordenadas de referência (a transformação do chamador leva pro palco)
// desenha uma célula das folhas gfx (já desenhadas NO PLANO do jogo, não achatar de novo) com o ponto de chão da linha em (x,y)
function kdGfx(c,sheet,name,row,col,x,y,sc,a,rot,flip){ const cv=kitCell(sheet,row,col,'#ffffff'); c.save(); c.translate(x,y); if(rot)c.rotate(rot); c.scale(sc*(flip||1),sc); c.globalAlpha=a===undefined?1:a; c.imageSmoothingEnabled=false; c.drawImage(cv,-GFXX[name][row],-GFXA[name][row]); c.restore(); }
// fogo no chão (folha gfx, no plano): ACENDE (linha 2) -> loop (linha 0 grande / 1 pequena) -> APAGA (linha 3, só a grande). tau = segundos desde que acendeu; dur = quanto dura antes de apagar
function kdFire(c,tau,x,y,sc,small,dur,a){ if(tau<0)return; const A=a===undefined?1:a; if(small){ const fa=tau>dur-.3?Math.max(0,(dur-tau)/.3):1; if(tau<dur)kdGfx(c,'fo','fogo',1,Math.floor(tau*10)%6,x,y,sc,A*fa); return; }
  if(tau<.5)kdGfx(c,'fo','fogo',2,Math.min(5,Math.floor(tau*12)),x,y,sc,A); else if(tau<dur)kdGfx(c,'fo','fogo',0,Math.floor((tau-.5)*10)%6,x,y,sc,A); else if(tau<dur+.5)kdGfx(c,'fo','fogo',3,Math.min(5,Math.floor((tau-dur)*12)),x,y,sc,A); }
// MENOS É MAIS (revisão do beta): o dragão cruza queimando e, na queda, só ficam FOGO no chão e DESTROÇOS no plano (folha gfx do dono); sem explosões, poeira extra, brasas e fragmentos
function kdDraw(c,M,T){
  const {N}=KD, sc=M.sc, t=M.tgOf(T), Lw=M.Lof(t), ph=Math.floor(T*12), tauS=T-M.Wof(M.tSlam), GYs=M.slam.y, XS=M.XS;
  (tauS>=0?M.av:M.tg).forEach((o,j)=>{ const tau=T-M.Wof(M.hitG[j]), tb=tauS>=0?tauS:tau;   // queima nos alvos
    kdFire(c,tb,o.x,o.y+2,.8,true,1.9); });   // fogo pequeno no chão de cada alvo queimando
  // invocação nas mãos: concentra, portal e cone ficam abertos enquanto o dragão sai, depois fecham
  const t0=T-M.Wof(M.tR), tg0=T-M.Wof(M.tR-.35), emDur=M.Wof(M.h1)-M.Wof(M.tR), x0=M.x0, y0=M.y0;
  if(tg0>=0&&tg0<.35)kdInv(c,2,tg0,12,x0-6,y0,.36,{loop:1,a:.95});
  if(t0>=0&&t0<emDur+.3){ const fo=t0>emDur?1-(t0-emDur)/.3:1;
    const fr1=t0<.25?Math.floor(t0*12):(t0<emDur?3+Math.floor((t0-.25)*10)%2:5);
    const fr0=t0<.25?Math.floor(t0*12):(t0<emDur?2+Math.floor((t0-.25)*10)%2:Math.min(5,4+Math.floor((t0-emDur)*10)));
    kdInv(c,1,t0,12,x0+8,y0-4,.52,{f:fr1,a:fo}); kdInv(c,0,t0,12,x0+30,y0-6,.5,{f:fr0,a:.9*fo}); }
  // fogo no chão do centro da malha (plano) por trás do dragão
  if(tauS>=0)kdFire(c,tauS,XS,GYs,1.6,false,1.7,.85);   // fogo grande no centro da malha (acende, loop, apaga)
  // dragão: peças por comprimento de arco; só se desfazem na batida vertical (na descida tudo cresce em volta do centro da malha)
  const gg=M.gOf(t), dead=t>=M.tSlam+.15; c.save(); if(gg!==1){ c.translate(XS,GYs); c.scale(gg,gg); c.translate(-XS,-GYs); }
  if(t>=M.tSlam){ c.translate(XS,GYs); c.scale(1,kdcl(1-(t-M.tSlam)/.14,.03,1)); c.translate(-XS,-GYs); }   // o corpo INTEIRO é esmagado contra o chão de uma vez (achata em ~0,14 s e some), nunca peça por peça
  const sTail=N*M.Lb, LpT=Lw-sTail;
  if(LpT>0&&!dead){ const lc=Math.min(LpT,M.Lend), p=M.pathAt(lc), r=M.angAt(lc), dT=M.dieOf(sTail);
    if(t<dT){ kdPiece(c,kdFrame('fogo_cauda',(ph+1)%6,'none'),p[0],p[1],M.sT,r,M.aT[0],M.aT[1],{a:.9}); kdPiece(c,kdFrame('cauda',(ph+3)%6,'brasa'),p[0],p[1],M.sT,r,M.aT[0],M.aT[1]); }
    else if((t-dT)*18<=5.99)kdPiece(c,kdFrame('cauda_desintegra',Math.floor((t-dT)*18),'brasa'),p[0],p[1],M.sT,r,M.aT[0],M.aT[1]); }
  for(let k=N-1;k>=0&&!dead;k--){ const sk=(k+.5)*M.Lb, Lk=Lw-sk; if(Lk<=0)continue; const lk=Math.min(Lk,M.Lend), p2=M.pathAt(lk), r2=M.angAt(lk), die=M.dieOf(sk);
    if(t<die){ kdPiece(c,kdFrame('fogo_corpo',(ph+k+2)%6,'none'),p2[0],p2[1]-3,sc,r2,M.aB[0],M.aB[1],{a:.9}); kdPiece(c,kdFrame('corpo',(ph+k)%6,'brasa'),p2[0],p2[1],sc,r2,M.aB[0],M.aB[1]); }
    else{ const fd=Math.floor((t-die)*18); if(fd<=5)kdPiece(c,kdFrame('corpo_desintegra',fd,'brasa'),p2[0],p2[1],sc,r2,M.aB[0],M.aB[1]); } }
  if(Lw>0&&!dead){ const lh=Math.min(Lw,M.Lend), hp=M.pathAt(lh), hr=M.angAt(lh);
    if(t<M.tSlam){ kdPiece(c,kdFrame('fogo_crista',(ph+2)%6,'none'),hp[0]-4,hp[1]-2,M.sH,hr,M.aH[0],M.aH[1],{a:.9}); kdPiece(c,kdFrame('cabeca',ph%6,'brasa'),hp[0],hp[1],M.sH,hr,M.aH[0],M.aH[1]); }
    else{ const fh=Math.floor((t-M.tSlam)*18); if(fh<=5)kdPiece(c,kdFrame('cabeca_desintegra',fh,'brasa'),hp[0],hp[1],M.sH,hr,M.aH[0],M.aH[1],{a:kdcl(1-(t-M.tSlam-.04)/.26)}); } }
  for(let j=0;j<=N&&!dead;j++){ const sj=j*M.Lb, Lj=Lw-sj; if(Lj<=0)continue; if(t>=M.dieOf(sj)+.02)continue; const lj=Math.min(Lj,M.Lend), pj=M.pathAt(lj), rj=M.angAt(lj); kdPiece(c,kdFrame('fogo_corpo',(ph+j*2)%6,'none'),pj[0],pj[1]+4,sc*.42,rj,128,170,{a:.9}); }
  c.restore();
  // DESTROÇOS no plano (folha gfx): explodem, caem e ficam amontoados, depois somem; ampliados pra cobrir a malha
  if(tauS>=0){ const S=2.1, fade=tauS>2.1?Math.max(0,1-(tauS-2.1)/.5):1;
    if(tauS<.5)kdGfx(c,'de','destrocos',0,Math.min(5,Math.floor(tauS*12)),XS,GYs,S);
    else if(tauS<1.0)kdGfx(c,'de','destrocos',1,Math.min(5,Math.floor((tauS-.5)*12)),XS,GYs,S);
    else kdGfx(c,'de','destrocos',2,Math.floor((tauS-1)*6)%6,XS,GYs,S,fade); }
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
  sceneOn([u]); skTag(u,sk.name); setAnim(u,'cast'); sfx.cast(u); fxAt(u,'aura',u,1.05,18); u._casting=true; mostra(u);   // aura do kit em loop até soltar
  await sleep(520); await done;
  if(ts.some(t=>t.side!==u.side))markTargets(ts); else ts.forEach(sceneAdd);
  u.el.style.zIndex=60; setAnim(u,'atk2',0,true);
  const rel=Math.max(300,animMs(u,'atk2')*.7), M=kdModel(u,ts,foes(u).filter(t=>t.alive));
  await sleep(rel);
  // ---- liberação: congela com as mãos abertas, cut-in, depois o dragão ----
  setAnim(u,'atk2',28,'frame'); sfx.jutsu(u); sfx.voz(u,'jutsu'); u._casting=false; mostra(u);
  // REGRA em laço fixo (fatia 3b): parede na fileira (ordem do x = ordem do tempo) e depois a queda em todos, resolvidas já; a tela toca cada uma no seu instante
  const plan=adianta(()=>{ const step=(t,share)=>{ if(!t.alive)return null; const dealt=landHit(u,t,sk.mult*share,false,'big',true); if(dealt!==null){ tot+=dealt; connected.add(t); } return {t,dealt,n:marca()}; };
    return {wall:M.tg.map(o=>step(o.t,.4)), slam:M.av.map(o=>step(o.t,.6))}; });
  const hitStep=(r,big)=>{ if(!r)return; fxAt(u,'imp',r.t,.55,-8); tocaAte(r.n); if(r.dealt!==null)spark(r.t,u.d.c,big?12:8); };
  const fired=new Set(), T0=performance.now(); let T=0, last=T0, released=false;
  const wallHit=M.hitG.map(t=>M.Wof(t)-.08), wallSlam=M.Wof(M.tSlam)-.16;
  const mvx=0; u.mv.style.transition='none';
  try{ await new Promise((resolve,reject)=>{
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
      if(T>=M.tR&&!fired.has('c')){ fired.add('c'); sfx.dragonRoar(); flashSoft(); }
      wallHit.forEach((w,j)=>{ if(T>=w&&!fired.has('t'+j)){ fired.add('t'+j); sfx.hit(); shake(.5); hitStep(plan.wall[j],false); } });
      if(T>=wallSlam&&!fired.has('s')){ fired.add('s'); sfx.heavy(); shake(1.1); plan.slam.forEach(r=>hitStep(r,true)); sfx.thud(); }
      if(T>=M.LEN){ ctx.clearRect(0,0,KD.W,KD.H); return resolve(); }
      requestAnimationFrame(tick); };
    requestAnimationFrame(now=>{ last=now; tick(now); }); }); }
  finally{ tocaTudo(); }
  u.mv.style.transition=''; u.mv.style.transform='';
  connected.forEach(t=>{ if(!t.alive)return;
    if(sk.dot)t.dot={dmg:Math.round(u.atk*sk.dot.mult),rounds:sk.dot.rounds+(fieldA&&u.side===fieldA.side&&fieldA.fx.dot?fieldA.fx.dot[u.d.el]||0:0),el:u.d.el}; mostra(t); });
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

// COMBO 18 do Kaen, Chuva de Brasas: ele joga UMA bola de fogo no meio da malha inimiga; no alto ela se divide em quatro e cada uma cai na sua casa. Tudo no plano do chão
// (sombra, fogo, poeira e anéis deitados). Placeholder visual com as peças do dragão; o definitivo vem de sheets gerados pelo dono.
async function kaenRainCombo(u,sk,ts){
  const dir=u.side==='p'?1:-1, connected=new Set(); let tot=0;
  const done=kdLoad(), ctx=kdCanvas(); ctx.clearRect(0,0,KD.W,KD.H);
  const vs=ts.filter(t=>t.alive); if(!vs.length)return;
  sceneOn([u,...vs]); markTargets(vs); setAnim(u,'cast'); sfx.cast(u); u._casting=true; mostra(u);
  await sleep(380); await done;
  u.el.style.zIndex=60; setAnim(u,'atk2',0,true); await sleep(Math.max(300,animMs(u,'atk2')*.7));
  setAnim(u,'atk2',28,true); sfx.jutsu(u); sfx.voz(u,'jutsu'); u._casting=false; mostra(u);
  const p=pos(u), hand={x:p.x+dir*KDG.ponta[0],y:p.y+KDG.ponta[1]}, pts=vs.map(t=>({t,...cur(t)}));
  const C={x:pts.reduce((a,o)=>a+o.x,0)/pts.length,y:pts.reduce((a,o)=>a+o.y,0)/pts.length}, apex={x:C.x,y:Math.max(60,C.y-250)};
  const fires=[], tA=.6, tB=.42, LEN=tA+tB+.07*pts.length+1.6, fired=new Set(); let T=0, last=performance.now();
  // REGRA em laço fixo (fatia 3b): as quatro bolas caem na ordem das casas (j), resolvidas já; a tela toca cada uma quando a bola chega
  const plan=adianta(()=>pts.map(o=>{ const t=o.t; if(!t.alive)return null; const dealt=landHit(u,t,sk.mult,false,'chase',true); if(dealt!==null){ tot+=dealt; connected.add(t); } return {dealt,n:marca()}; }));
  const hit=(o,j)=>{ const t=o.t, r=plan[j]; if(!r)return; tocaAte(r.n); if(r.dealt!==null)spark(t,u.d.c,10);
    kitAdd({sheet:'im',row:1,fps:12,sc:.6,x:o.x,y:o.y+2,ay:GFXA.impacto[1]}); fires.push([o,performance.now()]); sfx.heavy(); if(!j){ shake(.7); flashSoft(); } };
  try{ await new Promise((resolve,reject)=>{
    const tok=token, tick=now=>{
      if(tok!==token){ ctx.clearRect(0,0,KD.W,KD.H); return reject(ABORT); }
      if(paused){ last=now; requestAnimationFrame(tick); return; }
      T+=Math.min(.05,(now-last)/1000)*speed; last=now; const c=ctx; c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,KD.W,KD.H); const ph=Math.floor(T*12);
      const dflip=dir<0?-1:1;   // as folhas apontam pra direita/baixo: espelha pro lado inimigo
      if(T<tA){ const P=k=>{ const e=kdeo(k); return [hand.x+(apex.x-hand.x)*e, hand.y+(apex.y-hand.y)*e-90*Math.sin(Math.PI*k)]; }, k=T/tA, [x,y]=P(k), [x2,y2]=P(Math.min(1,k+.03));   // bola grande em arco até o alto do meio da malha
        const ang=Math.atan2(y2-y,(x2-x)*dflip||dflip*.001);
        c.save(); c.translate(C.x,C.y); c.restore(); kdGfx(c,'bo','bola',3,Math.min(5,Math.floor(k*3)),C.x,C.y,.7);   // sombra no chão do centro
        kdGfx(c,'bo','bola',0,ph%6,x,y,.62+.2*k,.98,ang,dflip); }
      else pts.forEach((o,j)=>{ const tj=T-tA-.07*j, k=Math.max(0,tj/tB);
        if(tj<0&&T<tA+.12){ kdGfx(c,'bo','bola',1,Math.min(5,Math.floor((T-tA)/.12*2)),apex.x,apex.y,.75); return; }   // divide em quatro (linha 2 do gfx, 1 vez)
        if(tj<0){ kdGfx(c,'bo','bola',2,ph%6,apex.x,apex.y,.5); return; }
        if(tj<tB){ const x=apex.x+(o.x-apex.x)*k, y=apex.y+(o.y-18-apex.y)*k*k;   // cai (gravidade) com a sombra crescendo no chão
          kdGfx(c,'bo','bola',3,Math.min(5,Math.floor(k*6)),o.x,o.y,.55); kdGfx(c,'bo','bola',2,(ph+j)%6,x,y,.55-.12*k); }
        else{ if(!fired.has(j)){ fired.add(j); hit(o,j); }
          const tau=tj-tB; kdFire(c,tau,o.x,o.y+2,1.0,true,1.2,.95); } });
      if(T>=LEN){ ctx.clearRect(0,0,KD.W,KD.H); return resolve(); }
      requestAnimationFrame(tick); };
    requestAnimationFrame(now=>{ last=now; tick(now); }); }); }
  finally{ tocaTudo(); }
  connected.forEach(t=>{ if(!t.alive)return; if(sk.dot)t.dot={dmg:Math.round(u.atk*sk.dot.mult),rounds:sk.dot.rounds,el:u.d.el}; mostra(t); });
  if(sk.dot)sfx.apply('burn');
  log(`${nm(u)} solta <b>${sk.name}</b>: ${tot} de dano`);
  if(result())await finale(vs[0]);
  endCine(); home(u); u.el.style.zIndex=u.z; await sleep(160);
}
