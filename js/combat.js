// combat.js — jutsus, dano, alvos, perseguições, IA, laço da rodada
"use strict";
function drawJ(){
  for(const s of ['p','e']){$('tck'+s.toUpperCase()).style.transform=`scaleX(${Math.min(100,chakra[s])/100})`; $('ckn'+s.toUpperCase()).textContent='Chakra '+chakra[s];}
  const b=$('sbar');
  // os botões nascem uma vez por batalha e só mudam de estado depois: assim nenhum clique se perde quando a barra atualiza no meio da ação
  if(b.dataset.t!==String(token)){ b.dataset.t=token; b.innerHTML='';
    U.p.forEach(u=>{const j=u.d.jutsu, w=document.createElement('div'), x=document.createElement('button');
      w.className='skw'; x.className='sk'; x.style.setProperty('--c',u.d.c); x.title=j.name+': '+j.desc;
      const ki=document.createElement('i'); ki.className='ki'; x.appendChild(ki);
      const kp=document.createElement('i'); kp.className='kp'; x.appendChild(kp);
      if(fxIcon(ki,u.id,58)){ x.classList.add('ic'); portrait(kp,u.id,1.6,30,30); } else portrait(kp,u.id,2.7,58,58);
      x.insertAdjacentHTML('beforeend',`<span class="cost">${j.cost}</span><span class="cdv"></span>`);
      const lb=document.createElement('span'); lb.className='lb';
      x.onclick=()=>{ if(!u.alive||u.cd>0||u.armed)return;   // armado = comprometido: não dá pra cancelar (só se ele morrer, aí o chakra volta)
        if(chakra.p>=j.cost){u.armed=true;chakra.p-=j.cost;} else return;
        sfx.arm(); upd(u); drawJ(); };
      w.appendChild(x); w.appendChild(lb); b.appendChild(w); u.sk=x; u.skl=lb; u.skc=x.querySelector('.cdv'); }); }
  U.p.forEach(u=>{const j=u.d.jutsu, x=u.sk; if(!x)return;
    const can=u.alive&&u.cd===0&&(u.armed||chakra.p>=j.cost);
    x.classList.toggle('armed',!!u.armed); x.classList.toggle('off',!can);
    u.skc.textContent=u.alive&&u.cd>0?u.cd:!u.alive?'✕':'';
    u.skl.textContent=u.armed?'preparado':j.name; });
}
// campo Noite de Névoa: Gelo aliado +15% no básico; Fogo inimigo -15% de dano
function fieldMul(a,basic){ if(!fieldA)return 1; const mine=a.side===fieldA.side;
  if(mine&&a.d.el==='Gelo'&&basic)return 1.15; if(!mine&&a.d.el==='Fogo')return .85; return 1;}
function dodgeOf(t){return (t.d.dodge||0)+(t.solto?20:0)+(fieldA&&t.side===fieldA.side&&t.id==='mayoi'?25:0);}
function setField(u,rounds){ fieldA={side:u.side,rounds}; $('fog').classList.add('on'); }
function clearField(){ if(!fieldA)return; fieldA=null; $('fog').classList.remove('on'); log('O campo de névoa se dissipa'); }
function dmgOf(a,t,m,basic){return Math.max(1,Math.round(a.atk*(a.solto?1.35:1)*m*fieldMul(a,basic)*(.92+Math.random()*.16)*100/(100+t.def)));}
function hurt(t,d,cls){
  let r=d; if(t.shield>0){const ab=Math.min(t.shield,r); t.shield-=ab; r-=ab; if(t.shield<=0)sfx.sbreak(); else sfx.absorb();}
  const hp0=t.hp; if(cls!=='dot'&&r>0&&t.hp-r>0)sfx.voz(t,'dor',.3);
  t.hp=Math.max(0,t.hp-r); fl(t,r>0?'-'+r:'bloqueou',cls);
  const hs=[t.spr,...(t.gl||[])]; hs.forEach(x=>x.classList.add('hit')); setTimeout(()=>hs.forEach(x=>x.classList.remove('hit')),120);
  if(cls!=='dot'){hitsR[curSide]++; showHits();}
  if(t.alive&&t.side==='p'&&t.hp>0&&hp0>=t.max*.25&&t.hp<t.max*.25)sfx.lowhp();
  if(t.hp<=0&&t.alive){t.alive=false; sfx.death(); sfx.voz(t,'queda'); if(t.side==='p'&&U.p.filter(x=>x.alive&&x!==t).length===1)sfx.last(); t.dot=null; if(t===mark){mark=null; t.el.classList.remove('mk');} t.stunned=false; t.state=null; t.st.className='st'; setAnim(t,'die');
    if(t.off&&t.off.y<0){ t.off.y=0; t.mv.style.transition='transform .35s cubic-bezier(.55,0,.9,.55)'; t.mv.style.transform=`translate(${t.off.x}px,0)`; setTimeout(()=>{t.mv.style.transition='';},420); }   // morreu no ar: cai até o chão em vez de ficar flutuando
    if(t.armed){t.armed=false; chakra.p=Math.min(100,chakra.p+t.d.jutsu.cost);}}
  else if(t.alive&&!t.state)setAnim(t,'hurt');
  upd(t); return r;
}
function pick(u,mode,isJ){
  const fs=foes(u); if(!fs.length)return null;
  // inimigo marcado (clique) só vale pros jutsus do jogador sem restrição de alvo
  if(isJ&&u.side==='p'&&mark&&mark.alive&&(mode==='front'||mode==='row'))return mark;
  if(mode==='weak')return fs.reduce((a,b)=>b.hp<a.hp?b:a);
  for(const r of [0,1,2].sort((a,b)=>Math.abs(a-u.row)-Math.abs(b-u.row))){
    const c=fs.filter(x=>x.row===r).sort((a,b)=>a.depth-b.depth); if(c.length)return c[0]; }
  return fs[0];
}
async function doSkill(u,sk,isJ){
  curSide=u.side; const dir=u.side==='p'?1:-1;
  try{
    if(sk.unleash){   // Lacre Rompido (Yugami): tira o capuz, troca pro atlas solto + distorção em código, buff por N rodadas
      const was=u.solto;
      if(isJ&&!was){await cine(u,sk,[u]); sfx.jutsu(u);}   // sem kiai: o som do lacre quebrando com glitch já diz tudo
      u.sR=sk.unleash; if(!was){ setForm(u,true); setAnim(u,'unhood'); fxAt(u,'jutsu',u,1.3); fl(u,'capuz solto','shieldf'); const p=pos(u);
        em(22,i=>{const g=i/22*6.28; return prt(p.x,p.y-30,Math.cos(g)*10,Math.sin(g)*6,Math.cos(g)*1.8,Math.sin(g)*1.4,0,R(14,22),4,0,pk(PAL['Espaço']));}); }
      log(`${nm(u)} usa <b>${sk.name}</b>: +35% de dano e +20% de esquiva por ${sk.unleash} rodadas`);
      await sleep(Math.max(700,animMs(u,'unhood'))); setAnim(u,'idle'); return;
    }
    if(sk.target==='allies'){
      const al=team(u.side).filter(a=>a.alive);
      if(isJ){await cine(u,sk,al); sfx.jutsu(u);}   // cura/escudo/campo: sem kiai (o grito ficava sem sentido, ex.: Iwao gemendo ao erguer o Gigante)
      setAnim(u,'cast');
      if(sk.field){setField(u,sk.field); log(`${nm(u)} usa <b>${sk.name}</b>: névoa por ${sk.field} rodadas`);}
      al.forEach(a=>{ const p=pos(a); fxAt(u,'jutsu',a,1.1); if(sk.field){em(14,()=>prt(p.x,p.y,R(-20,20),-R(0,50),R(-1,1),R(-1.4,-.2),0,R(30,50),R(8,14),0,pk(PAL['Névoa']),1)); return;}
        if(sk.heal){sfx.heal(); const h=Math.round(u.atk*sk.heal); a.hp=Math.min(a.max,a.hp+h); fl(a,'+'+h,'heal'); em(12,()=>prt(p.x,p.y,R(-14,14),-R(0,40),0,R(-1.6,-.6),0,R(24,40),R(3,5),0,pk(['#7dffa6','#ffffff','#3fd07a'])));}
        if(sk.shield){sfx.shield(); a.shield=Math.max(a.shield,Math.round(u.atk*sk.shield)); a.shR=2; fl(a,'escudo','shieldf'); em(18,i=>{const g=i/18*6.28;return prt(p.x,p.y,Math.cos(g)*8,-28+Math.sin(g)*8,Math.cos(g)*1.6,Math.sin(g)*1.6,0,R(14,20),4,0,pk(['#8fd0ff','#ffffff']));});}
        upd(a);});
      if(!sk.field)log(`${nm(u)} usa <b>${sk.name}</b>`); await sleep(Math.max(650,animMs(u,'cast'))); setAnim(u,'idle'); return;
    }
    const main=pick(u,sk.target,isJ); if(!main)return;
    const area=sk.target==='row'||sk.target==='all';
    const ts=sk.target==='row'?foes(u).filter(x=>x.row===main.row):sk.target==='all'?foes(u):[main];
    // esquiva: só golpe de alvo único (básico ou jutsu de um alvo); paralisado não desvia
    const canDodge=t=>!t.stunned&&!t.state&&Math.random()*100<dodgeOf(t);
    const dodged=(sk.target==='front'||sk.target==='weak')&&canDodge(main);
    // ataque básico em área (Rajada Leve): cada alvo testa a esquiva; jutsu de todos não é desviável
    const dodgedSet=new Set(sk.target==='all'&&!isJ?ts.filter(canDodge):[]);
    if(isJ)await cine(u,sk,ts); else if(sk===u.d.strong)skTag(u,sk.name);
    let an, hit; const H=sk.hits||[0], nh=H.length, HA=(u,a)=>sk.hits?Math.max(120,H[0]*animMs(u,a)):hitAt(u,a);   // sk.hits: momentos (fração da anim) de cada soco; o dano se divide entre eles
    const adv=area&&!(sk.ranged&&!isJ);   // área à distância fica parada
    if(adv){an=sk.an||'atk3'; u.el.style.zIndex=60; u.mv.style.transform=`translate(${dir*82}px,0)`; setAnim(u,an,0,true); await sleep(hit=HA(u,an));}
    else if(sk.ranged&&!isJ){an=sk.an||(sk.target==='all'?'atk1':'atk2'); setAnim(u,an,0,true); sfx.shoot(u); await sleep(hit=HA(u,an)*.9); await shoot(u,main); hit+=190;}
    else{an=sk.an||(isJ?'atk3':'atk1'); sfx.swing(); await dashTo(u,main); setAnim(u,an,0,true); await sleep(hit=HA(u,an));}
    if(isJ){sfx.jutsu(u); sfx.voz(u,'jutsu'); (sk.wave?soundWave:elFx)(u,ts);} else sfx.voz(u,'golpe',sk===u.d.strong?.7:.3);   // jutsu de onda (Poko): anéis em código no lugar das partículas do elemento
    if(dodgedSet.size)for(const t of dodgedSet)evade(t);
    if(dodged){ await evade(main); log(`${nm(main)} desvia de <b>${sk.name}</b>`); }
    else{ let tot=0;
      for(let k=0;k<nh;k++){   // cada soco do golpe causa a sua parte do dano, com faísca e hit-stop próprios
        if(k){ const w=Math.max(70,(H[k]-H[k-1])*animMs(u,an)); await sleep(w); hit+=w; if(!ts.some(t=>t.alive&&!dodgedSet.has(t)))break; }
        ts.forEach(t=>{ if(dodgedSet.has(t)||!t.alive)return; if(!(isJ&&sk.wave))fxAt(u,k?'hit':isJ?'jutsu':'hit',t,k?.7:isJ?1.3:sk.target==='all'?.7:.85); fxAt(u,'imp',t,.55,-8);
          tot+=hurt(t,dmgOf(u,t,sk.mult/nh,sk===u.d.normal),isJ?'big':''); spark(t,u.d.c,isJ?10:6); });
        if(nh>1&&k<nh-1)sfx.hit(); }
      ts.forEach(t=>{ if(dodgedSet.has(t)||!t.alive)return;
        if(sk.dot)t.dot={dmg:Math.round(u.atk*sk.dot.mult),rounds:sk.dot.rounds+(fieldA&&u.side===fieldA.side&&u.d.el==='Veneno'?1:0),el:u.d.el}; if(sk.stun&&(t===main||sk.stun==='all'))t.stunned=true; upd(t); });
      if(sk.dot)sfx.apply(u.d.el==='Fogo'?'burn':'poison'); if(sk.stun)sfx.apply(u.d.el==='Gelo'?'freeze':'stun');
      if(sk.dispel)clearField();
      if(isJ){shake();flash();sfx.heavy();sfx.impact(u);}else sfx.hit(u,sk===u.d.normal?'atk':sk===u.d.strong?'forte':'');
      log(`${nm(u)} ${isJ?'solta':'usa'} <b>${sk.name}</b>${nh>1?` (${nh} golpes)`:''}: ${tot} de dano`);
      if(result())await finale(main); }
    const ko=!dodged&&!dodgedSet.has(main)&&sk.cause&&main.alive;
    if(ko){ endCine(); await smash(u,main,sk.cause); } else if(!dodged)await hitstop(isJ?70:25);
    // sem duração fixa: espera o resto da anim do atacante e, no jutsu, o efeito acabar
    await sleep(Math.max(ko?120:isJ?0:200, animMs(u,an)-hit)); if(isJ&&!ko)await fxWait(420,1400);
    endCine(); home(u);
    if(ko){ comboShow(u,main); await chain(u.side,main,1,u); if(main.alive){await sleep(140); setState(main,null); main.el.style.zIndex=main.z;}}
    await sleep(160);
  }finally{ endCine(); sceneOff(); }
}
// quem vai entrar na perseguição, na ordem (mesma regra do chain: on do próximo = cause do anterior, sem repetir)
function comboPlan(side,state){ const seen=new Set(), out=[]; let s=state;
  for(;;){ const c=team(side).find(x=>x.alive&&!x.chaseUsed&&!x.stunned&&!seen.has(x)&&x.d.chase.on===s); if(!c)break; seen.add(c); out.push(c); s=c.d.chase.cause; }
  return out; }
// no começo do combo já destaca TODOS que vão combar (estilo NO), não só quem começa
function comboShow(u,t){ const pl=comboPlan(u.side,t.state); if(!pl.length)return;
  if(!scene.on)sceneOn([u,t]); pl.forEach(x=>{ sceneAdd(x); x.el.classList.add('cmb'); }); }
async function chain(side,t,count,src){
  const c=team(side).find(x=>x.alive&&!x.chaseUsed&&!x.stunned&&x.d.chase.on===t.state);
  if(!c)return;
  if(!scene.on)sceneOn([src,t].filter(Boolean)); sceneAdd(c);   // perseguição também é cena isolada; quem entra fica visível
  c.chaseUsed=true; count++; sfx.chaseGo(); sfx.voz(c,'golpe',.6); if(side==='p')maxCombo=Math.max(maxCombo,count);
  const cause=c.d.chase.cause, an=an_of(c).chase?'chase':{R:'atk3',L:'atk2',D:'atk1'}[cause];
  const CHA=(u,a)=>c.d.chase.hits?Math.max(120,c.d.chase.hits[0]*animMs(u,a)):hitAt(u,a);
  const air=!!an_of(c).rise&&t.state==='L';
  const dir=side==='p'?1:-1, h0=pos(c), tb=cur(t);
  const put=(u,x,y,tr)=>{u.mv.style.transition=tr||''; u.mv.style.transform=`translate(${x}px,${y}px)`;};
  if(air){   // perseguição aérea (lote E): salta acima do alvo, mergulha no chute e os dois descem juntos até o chão
    setAnim(c,'rise',0,true); sfx.swing(); c.el.style.zIndex=60;
    put(c,tb.x-dir*120-h0.x,tb.y-120-h0.y,'transform .34s cubic-bezier(.2,.8,.3,1)');
    await sleep(Math.max(340,animMs(c,'rise')*.8));
    setAnim(c,'meteor',0,true); fxAt(c,'chase',t,1.25);
    put(c,tb.x-dir*72-h0.x,tb.y-24-h0.y,'transform .13s ease-in'); await sleep(130);
  }else if(c.d.chase.mv==='slam'){   // salta alto por cima do alvo e despenca nele
    setAnim(c,'move',0,true); sfx.swing(); c.el.style.zIndex=60;
    put(c,tb.x-dir*70-h0.x,tb.y-190-h0.y,'transform .3s cubic-bezier(.2,.9,.35,1)'); await sleep(300);
    setAnim(c,an,0,true); put(c,tb.x-dir*64-h0.x,tb.y+2-h0.y,'transform .13s cubic-bezier(.6,0,1,.6)'); await sleep(130);
    dust(c,14); shake(); sfx.thud(); await sleep(Math.max(60,CHA(c,an)-130));
  }else if(c.d.chase.ranged){ sfx.swing(); setAnim(c,an,0,true); await sleep(CHA(c,an)); await shoot(c,t); }   // fica parado, o enxame voa até o alvo
  else{ sfx.swing(); await dashTo(c,t); setAnim(c,an,0,true); await sleep(CHA(c,an)); }
  const CH0=c.d.chase, tsu=CH0.tsunami&&Math.random()<CH0.tsunami&&foes(c).length>1;
  if(tsu){ ink('TSUNAMI!'); shake(); sfx.heavy(); fxSpr(c.id,'wave',{x:576,y:330,sc:4.4,mv:'surge',fps:5,dir:dir,flip:dir<0}); await sleep(900); shake(); }   // enche a tela e pega o time inteiro
  else if(CH0.surge){ fxAt(c,'chase',t,1.35,0,{mv:'surge',fps:7}); await sleep(560); }   // a onda brota aos poucos e só então bate
  sfx.chase(c); spark(t,c.d.c,10); if(!air&&!CH0.surge)fxAt(c,'chase',t,1.25); fxAt(c,'imp',t,.6,-8);
  const CH=c.d.chase, ch=CH.hits||[0], cm=CH.mult*(1+.1*(count-1)); let d=0;
  if(t.state)fl(t,ST[t.state],'state');   // etiqueta do estado em que o alvo foi pego
  for(let k=0;k<ch.length&&t.alive;k++){ if(k){ await sleep(Math.max(70,(ch[k]-ch[k-1])*animMs(c,an))); fxAt(c,'imp',t,.6,-8); spark(t,c.d.c,6); sfx.hit();}
    d+=hurt(t,dmgOf(c,t,cm/ch.length),'chase'); }
  if(tsu){ for(const o of foes(c)){ if(o===t)continue; fxAt(c,'imp',o,.6,-8); spark(o,c.d.c,8); hurt(o,dmgOf(c,o,CH.mult*.6),'chase'); } }
  if(result())await finale(t);
  comboLine(c.d.chase.name,count,c.id); fl(t,count+' Perseguição!','chasec');
  log(`↳ ${nm(c)}: <b>${c.d.chase.name}</b> ${d} (combo x${count})`,'x');
  if(air&&t.alive){   // o chute empurra o alvo pra baixo: os dois caem juntos, câmera acompanha
    await hitstop(35); const g=pos(t), fall='transform .3s cubic-bezier(.55,0,.9,.55)';
    zoomTo(tb.x,(tb.y+g.y)/2-60,1.22); speedLines('D'); t.el.style.zIndex=55;
    t.off.y=-26; put(t,t.off.x,t.off.y,fall); put(c,tb.x-dir*72-h0.x,g.y-50-h0.y,fall);
    em(10,()=>prt(tb.x,tb.y,R(-10,10),-30,R(-1,1),R(1.5,3),0,R(12,20),R(4,7),0,pk(PAL.Fogo)));
    await sleep(300); t.mv.style.transition=''; c.mv.style.transition='';
    await smash(c,t,'D');
  }else if(t.alive){
    if(CH.mv==='rise'&&cause==='L'){ const g=pos(t);   // sobe junto com o alvo lançado e depois desce
      put(c,tb.x-dir*76-h0.x,g.y-170-h0.y,'transform .3s cubic-bezier(.15,.85,.3,1)'); }
    await smash(c,t,cause);
    if(CH.mv==='rise'&&cause==='L'){ put(c,cur(t).x-dir*76-h0.x,pos(t).y-h0.y,'transform .2s cubic-bezier(.55,0,.9,.55)'); await sleep(200); dust(c,8); c.mv.style.transition=''; }
  }else await hitstop(40);
  if(air&&an_of(c).landing){ const g=pos(t);   // pousa agachado do lado do alvo e levanta
    put(c,cur(t).x-dir*82-h0.x,g.y-h0.y,'transform .12s ease-in'); setAnim(c,'landing',0,true); dust(c,10);
    await sleep(animMs(c,'landing')*.7); c.mv.style.transition=''; }
  await sleep(110); home(c);
  if(t.alive)await chain(side,t,count);
}
function result(){const p=U.p.some(u=>u.alive), e=U.e.some(u=>u.alive); return !e?'win':!p?'lose':null;}
function wants(u,rate){const j=u.d.jutsu;
  if(j.unleash)return !u.solto&&Math.random()<rate;
  if(j.heal)return team(u.side).some(a=>a.alive&&a.hp<a.max*.65);
  return Math.random()<rate;}
async function intro(){
  for(const u of all()){u.mv.style.transition='none'; u.mv.style.transform=`translate(${(u.side==='p'?-1:1)*640}px,0)`; setAnim(u,'move',Math.random()*8|0);}
  $('rd').textContent=foe.name; await sleep(120);
  for(const u of all()){u.mv.style.transition='transform .7s linear'; u.mv.style.transform='';}
  await sleep(760);
  for(const u of all()){u.mv.style.transition=''; setAnim(u,'idle',Math.random()*8|0);}
  ink('Rodada 1'); await sleep(700); ink('LUTAR!'); sfx.start(); await sleep(1000);
}
async function run(){
  let res=null, byTime=false; finDone=false;
  try{
    await intro();
    outer: while(true){
      round++; hitsR={p:0,e:0}; $('rd').textContent='Rodada '+round; log('Rodada '+round,'r');
      if(round>1){
        chakra.p=Math.min(100,chakra.p+20); chakra.e=Math.min(100,chakra.e+20); sfx.round(); sfx.chakra();
        if(fieldA&&--fieldA.rounds<=0)clearField();
        for(const u of all()){ if(!u.alive)continue; if(u.cd>0)u.cd--; if(u.shR>0&&--u.shR===0){u.shield=0; upd(u);}
          if(u.sR>0&&--u.sR===0&&u.solto){ log(`${nm(u)} recoloca o capuz`); await rehoodCine(u); }
          if(u.dot){sfx.dot(u.dot.el); curSide=u.side==='p'?'e':'p'; hurt(u,u.dot.dmg,'dot'); spark(u,'#ef9a5b',5); if(u.alive&&--u.dot.rounds<=0)u.dot=null; upd(u);} }
      }
      all().forEach(u=>u.chaseUsed=false);
      for(let i=0;i<4;i++)for(const u of [U.p[i],U.e[i]])if(u&&u.alive)fl(u,String(i+1),'ord');
      drawJ(); await sleep(round===1?900:650);
      if((res=result()))break;
      for(let i=0;i<4;i++)for(const u of [U.p[i],U.e[i]]){
        if(!u||!u.alive)continue;
        await gate();
        const wasStun=u.stunned;   // paralisia (como no Naruto Online): o ninja age normal (básico, jutsu), só não consegue PERSEGUIR; passa depois da ação dele
        if(wasStun){ fl(u,'sem perseguir','info2'); log(`${nm(u)} está paralisado: age, mas não persegue`); }
        let sk=u.d.normal,isJ=false; const j=u.d.jutsu;
        if(u.side==='p'&&!autoP&&!u.armed&&u.cd===0&&chakra.p>=j.cost){   // janela pra armar o jutsu: o botão pulsa um instante antes do golpe
          u.el.classList.add('turn'); u.sk.classList.add('ready');
          for(let w=0;w<1100&&!u.armed&&u.alive;w+=60){ await gate(); await sleep(60); }
          u.sk.classList.remove('ready'); }
        if(u.side==='p'){
          if(!u.armed&&autoP&&u.cd===0&&chakra.p>=j.cost&&wants(u,1)){u.armed=true;chakra.p-=j.cost;}
          if(u.armed){u.armed=false;u.cd=j.cd;sk=j;isJ=true;upd(u);} }
        else if(u.cd===0&&chakra.e>=j.cost&&wants(u,foe.ai)){chakra.e-=j.cost;u.cd=j.cd;sk=j;isJ=true;}
        if(!isJ&&u.d.strong&&++u.nc%3===0)sk=u.d.strong;   // toda 3ª ação sem jutsu vira o golpe Forte
        u.el.classList.add('turn'); drawJ(); await doSkill(u,sk,isJ); u.el.classList.remove('turn');
        if(wasStun&&u.alive){u.stunned=false; upd(u);}
        drawJ();
        if((res=result()))break outer;
      }
      if(round>=20){const s=t=>U[t].reduce((a,u)=>a+u.hp/u.max,0); res=s('p')>s('e')?'win':'lose'; byTime=true; break;}
    }
    musStop(); await sleep(350); $('flash').className='long'; sfx.end(); ink('FIM DO COMBATE',true); await sleep(1500);
  }catch(e){ if(e===ABORT)return; throw e; }
  sfx[res](); battleOn=false; ACT=[];
  const hasNext=res==='win'&&foeIx<FOES.length-1;
  if(res==='win'&&foeIx>=unlocked&&foeIx<FOES.length-1){unlocked=foeIx+1;save();}
  const newN=res==='win'&&FOES[foeIx].unlock&&!have(FOES[foeIx].unlock)?FOES[foeIx].unlock:null; if(newN){own.push(newN);save(); setTimeout(()=>sfx.ui('desbloqueio'),900);}
  $('ink').className=''; $('clist').innerHTML='';
  $('ovT').textContent=res==='win'?'Vitória':'Derrota';
  $('ovP').textContent=`${foe.name} · ${round} rodada${round>1?'s':''}`+(byTime?' · decidido por tempo (mais vida restante)':'');
  $('ovQ').textContent=`Seu maior combo: x${maxCombo||1}`+(res==='win'&&foeIx===FOES.length-1?' · Você venceu todas as missões!':'')+(newN?` · ${N[newN].name} desbloqueado! Ele já está na Formação.`:'');
  $('ovN').classList.toggle('hide',!hasNext);
  $('resWin').classList.remove('hide');
}
