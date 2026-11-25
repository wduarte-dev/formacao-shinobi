// ambient.js — vida nos cenários (a imagem é estática): partículas, névoa, brilhos e relâmpago em 2 canvas 384x216
// #ambb fica ATRÁS dos ninjas (brilhos, névoa, vagalumes, relâmpago); #ambf fica NA FRENTE (pétalas, chuva, neve, brasas).
// Coordenadas em fração do palco (0..1). Config por nome do cenário (`foe.bg`).
"use strict";
const AMB={
  sakura:{ fall:{n:34,kind:'petal',col:['#ffc2d4','#f7a8c0','#ffe0ea'],vx:[.12,.3],vy:[.1,.22],sw:.6},
    glow:[[.215,.48,.03],[.245,.48,.025],[.755,.455,.03],[.79,.465,.03],[.86,.47,.03],[.945,.46,.03],[.645,.435,.025]], gcol:'255,200,120',
    mist:{y:.52,a:.16,col:'255,225,225',n:3} },
  santuario:{ fall:{n:90,kind:'rain',col:['#c8d0f0','#9aa4d8'],vx:[-.5,-.4],vy:[2.4,3.4]},
    flash:{every:[3.5,8],col:'215,205,255'}, mist:{y:.5,a:.1,col:'150,150,200',n:2} },
  noite:{ fall:{n:70,kind:'snow',col:['#ffffff','#dff4ff','#bfe6ff'],vx:[-.08,.12],vy:[.12,.34],sw:.8},
    glow:[[.19,.5,.03],[.255,.42,.025],[.805,.41,.03],[.895,.5,.03],[.73,.475,.022],[.51,.19,.2]], gcol:'255,170,90',
    mist:{y:.55,a:.1,col:'200,230,255',n:2} },
  noite_nevoa:{fly:{n:32,col:['#a9b6f4','#e2e2ff']},mist:{y:.65,a:.22,col:'159,172,213',n:4}},
  floresta:{ fly:{n:26,col:['#d8ff7a','#b8f060']}, mist:{y:.5,a:.2,col:'140,200,190',n:4} },
  cinzas:{ fall:{n:34,kind:'ash',col:['#9a8d88','#7d716d','#b5a8a0'],vx:[.2,.5],vy:[.15,.35]},
    rise:{n:30,col:['#ff9a3c','#ff6a20','#ffd070']},
    glow:[[.5,.35,.12]], gcol:'255,110,40', mist:{y:.52,a:.14,col:'120,70,60',n:3} }
};
const AW=384, AH=216; let ambTok=0, ambP=[], ambM=[], ambCfg=null, ambFlash=0, ambNext=0, ambT=0;
const rr=(a,b)=>a+Math.random()*(b-a), aPick=a=>a[Math.random()*a.length|0];
function ambMk(f,first){ const k=f.kind;
  return {x:rr(-.05,1.05)*AW, y:first?rr(0,AH):rr(-.15,0)*AH, vx:rr(f.vx[0],f.vx[1]), vy:rr(f.vy[0],f.vy[1]), c:aPick(f.col), ph:rr(0,6.3), s:k==='rain'?rr(5,9):k==='petal'?rr(1.6,2.6):k==='ash'?rr(1,2):rr(1,2.2), k, sw:f.sw||0}; }
function ambStart(bg){
  ambTok++; ambCfg=AMB[bg]||null; const a=$('ambb'), f=$('ambf');
  for(const c of [a,f])c.getContext('2d').clearRect(0,0,AW,AH);
  if(!ambCfg)return; const m=lite?.4:1; ambP=[]; ambM=[]; ambFlash=0; ambNext=rr(2,5);
  const C=ambCfg; if(C.fall)for(let i=0;i<C.fall.n*m;i++)ambP.push(ambMk(C.fall,true));
  if(C.rise)for(let i=0;i<C.rise.n*m;i++)ambP.push({k:'ember',x:rr(0,AW),y:rr(0,AH),vx:rr(-.1,.25),vy:-rr(.2,.6),c:aPick(C.rise.col),ph:rr(0,6.3),s:rr(1,1.8),sw:.5});
  if(C.fly)for(let i=0;i<C.fly.n*m;i++)ambP.push({k:'fly',x:rr(0,AW),y:rr(AH*.18,AH*.5),vx:0,vy:0,c:aPick(C.fly.col),ph:rr(0,6.3),s:rr(1,1.6),sw:1});
  if(C.mist&&!lite)for(let i=0;i<C.mist.n;i++)ambM.push({x:rr(0,AW),y:C.mist.y*AH+rr(-14,14),w:rr(110,190),v:rr(.05,.14)*(Math.random()<.5?-1:1)});
  ambT=0; const t=ambTok; let last=performance.now();
  (function loop(now){ if(t!==ambTok||$('sBattle').classList.contains('hide'))return; const el=now-last; if(el<30){requestAnimationFrame(loop);return;}   // ambiente a ~30fps: metade do custo, ninguém nota
    const dt=Math.min(.05,el/1000); last=now;
    if(!paused&&!devFrozen&&!document.hidden)ambStep(dt); requestAnimationFrame(loop); })(last);
}
let mistC=null, mistK=null;
function mistSpr(C){ if(mistK===C)return mistC; mistK=C; mistC=document.createElement('canvas'); mistC.width=mistC.height=128; const g=mistC.getContext('2d'), gr=g.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,`rgba(${C.mist.col},${C.mist.a})`); gr.addColorStop(1,`rgba(${C.mist.col},0)`); g.fillStyle=gr; g.fillRect(0,0,128,128); return mistC; }
function ambStep(dt){
  const C=ambCfg, b=$('ambb').getContext('2d'), f=$('ambf').getContext('2d'); ambT+=dt; const k=dt*60;
  b.clearRect(0,0,AW,AH); f.clearRect(0,0,AW,AH);
  for(const m of ambM){ m.x+=m.v*k; if(m.x>AW+m.w)m.x=-m.w; if(m.x<-m.w)m.x=AW+m.w;
    b.drawImage(mistSpr(C),m.x-m.w,m.y-m.w*.2,m.w*2,m.w*.4); }   // névoa: gradiente pré-desenhado (1x por cenário) em vez de recriar todo quadro
  if(C.glow&&!lite){ b.globalCompositeOperation='lighter';
    C.glow.forEach((g,i)=>{ const p=.72+.28*Math.sin(ambT*(2.1+i*.37)+i*1.7)*Math.sin(ambT*.9+i), r=g[2]*AW*(g[2]>.1?1:1.6);
      const gr=b.createRadialGradient(g[0]*AW,g[1]*AH,0,g[0]*AW,g[1]*AH,r); const a=(g[2]>.1?.22:.4)*p; gr.addColorStop(0,`rgba(${C.gcol},${a})`); gr.addColorStop(1,`rgba(${C.gcol},0)`);
      b.fillStyle=gr; b.fillRect(g[0]*AW-r,g[1]*AH-r,r*2,r*2); });
    b.globalCompositeOperation='source-over'; }
  if(C.flash){ ambNext-=dt; if(ambNext<=0){ ambFlash=1; ambNext=rr(C.flash.every[0],C.flash.every[1]); }
    if(ambFlash>0){ const v=ambFlash>.55&&ambFlash<.7?.15:ambFlash; b.fillStyle=`rgba(${C.flash.col},${.4*v*v})`; b.fillRect(0,0,AW,AH*.62); ambFlash-=dt*2.2; } }
  if($('planBg').dataset.theme==='forge'){
    const start=12, n=lite?11:25;
    for(let i=0;i<n;i++){
      const life=(ambT*(.24+i%4*.08)+i*.381966)%1;
      const x=start+i*73%(AW*.93)+Math.sin(ambT*2+i)*6;
      const y=AH-12-i%5*11-life*122;
      f.globalAlpha=(1-life)*.84;
      f.fillStyle=i%3?'#ff841f':'#ffcf61'; f.fillRect(x|0,y|0,i%4?1:2,2);
    }
    f.globalAlpha=1;
  }
  for(const p of ambP){
    if(p.k==='fly'){ p.ph+=dt*1.2; p.x+=Math.sin(p.ph*.7+p.s)*.25*k; p.y+=Math.cos(p.ph*.9)*.2*k; if(p.x<0)p.x=AW; if(p.x>AW)p.x=0; if(p.y<AH*.15)p.y=AH*.15; if(p.y>AH*.52)p.y=AH*.52;
      const a=Math.max(0,Math.sin(p.ph*1.6)); b.globalCompositeOperation='lighter'; b.fillStyle=p.c; b.globalAlpha=a*.9; b.fillRect(p.x|0,p.y|0,2,2); b.globalAlpha=a*.18; b.fillRect((p.x|0)-2,(p.y|0)-2,6,6); b.globalAlpha=1; b.globalCompositeOperation='source-over'; continue; }
    p.ph+=dt*2; p.x+=(p.vx+(p.sw?Math.sin(p.ph)*.25*p.sw:0))*k; p.y+=p.vy*k;
    if(p.k==='ember'){ if(p.y<-4){p.y=AH+4;p.x=rr(0,AW);} f.globalAlpha=.55+.45*Math.sin(p.ph*2.5); f.fillStyle=p.c; f.fillRect(p.x|0,p.y|0,2,2); f.globalAlpha=1; continue; }
    if(p.y>AH+6||p.x>AW+8||p.x<-8){ Object.assign(p,ambMk(C.fall,false)); }
    f.fillStyle=p.c;
    if(p.k==='rain'){ f.globalAlpha=.5; f.fillRect(p.x|0,p.y|0,1,p.s|0); f.globalAlpha=1; }
    else if(p.k==='petal'){ f.save(); f.translate(p.x,p.y); f.rotate(Math.sin(p.ph)*.9); f.fillRect(-p.s/2,-p.s/4,p.s,p.s/2); f.restore(); }
    else { f.globalAlpha=p.k==='ash'?.7:.9; const z=Math.max(1,p.s|0); f.fillRect(p.x|0,p.y|0,z,z); f.globalAlpha=1; }
  }
}
