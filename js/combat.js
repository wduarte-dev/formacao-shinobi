// combat.js — jutsus, dano, alvos, perseguições, IA, laço da rodada
"use strict";
function drawJ(){
  for(const s of ['p','e']){$('tck'+s.toUpperCase()).style.width=chakra[s]+'%'; $('ckn'+s.toUpperCase()).textContent='Chakra '+chakra[s];}
  const b=$('sbar'); b.innerHTML='';
  U.p.forEach(u=>{const j=u.d.jutsu, w=document.createElement('div'), x=document.createElement('button');
    const can=u.alive&&u.cd===0&&(u.armed||chakra.p>=j.cost);
    w.className='skw'; x.className='sk'+(u.armed?' armed':'')+(can?'':' off'); x.style.setProperty('--c',u.d.c); x.title=j.name+': '+j.desc;
    const kp=document.createElement('i'); kp.className='kp'; x.appendChild(kp); portrait(kp,u.id,2.7,58,58);
    x.insertAdjacentHTML('beforeend',`<span class="cost">${j.cost}</span>${u.alive&&u.cd>0?`<span class="cdv">${u.cd}</span>`:!u.alive?'<span class="cdv">✕</span>':''}`);
    x.onclick=()=>{ if(!u.alive||u.cd>0)return;
      if(u.armed){u.armed=false;chakra.p+=j.cost;} else if(chakra.p>=j.cost){u.armed=true;chakra.p-=j.cost;} else return;
      sfx.arm(); upd(u); drawJ(); };
    w.appendChild(x); w.appendChild(document.createTextNode(u.armed?'preparado':j.name)); b.appendChild(w);});
}
// campo Noite de Névoa: Gelo aliado +15% no básico; Fogo inimigo -15% de dano
function fieldMul(a,t,m){ if(!fieldA)return 1; const mine=a.side===fieldA.side;
  if(mine&&a.d.el==='Gelo'&&m===a.d.normal.mult)return 1.15; if(!mine&&a.d.el==='Fogo')return .85; return 1;}
function dodgeOf(t){return (t.d.dodge||0)+(fieldA&&t.side===fieldA.side&&t.id==='mayoi'?25:0);}
function setField(u,rounds){ fieldA={side:u.side,rounds}; $('fog').classList.add('on'); }
function clearField(){ if(!fieldA)return; fieldA=null; $('fog').classList.remove('on'); log('O campo de névoa se dissipa'); }
function dmgOf(a,t,m){return Math.max(1,Math.round(a.atk*m*fieldMul(a,t,m)*(.92+Math.random()*.16)*100/(100+t.def)));}
function hurt(t,d,cls){
  let r=d; if(t.shield>0){const ab=Math.min(t.shield,r); t.shield-=ab; r-=ab;}
  t.hp=Math.max(0,t.hp-r); fl(t,r>0?'-'+r:'bloqueou',cls);
  t.spr.classList.add('hit'); setTimeout(()=>t.spr.classList.remove('hit'),120);
  if(cls!=='dot'){hitsR[curSide]++; showHits();}
  if(t.hp<=0&&t.alive){t.alive=false; t.dot=null; if(t===mark){mark=null; t.el.classList.remove('mk');} t.stunned=false; t.state=null; t.st.className='st'; setAnim(t,'die');
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
    if(sk.target==='allies'){
      const al=team(u.side).filter(a=>a.alive);
      if(isJ)await cine(u,sk,al);
      setAnim(u,'cast');
      if(sk.field){setField(u,sk.field); log(`${nm(u)} usa <b>${sk.name}</b>: névoa por ${sk.field} rodadas`);}
      al.forEach(a=>{ const p=pos(a); fxAt(u,'jutsu',a,1.1); if(sk.field){em(14,()=>prt(p.x,p.y,R(-20,20),-R(0,50),R(-1,1),R(-1.4,-.2),0,R(30,50),R(8,14),0,pk(PAL['Névoa']),1)); return;}
        if(sk.heal){sfx.heal(); const h=Math.round(u.atk*sk.heal); a.hp=Math.min(a.max,a.hp+h); fl(a,'+'+h,'heal'); em(12,()=>prt(p.x,p.y,R(-14,14),-R(0,40),0,R(-1.6,-.6),0,R(24,40),R(3,5),0,pk(['#7dffa6','#ffffff','#3fd07a'])));}
        if(sk.shield){sfx.shield(); a.shield+=Math.round(u.atk*sk.shield); fl(a,'escudo','shieldf'); em(18,i=>{const g=i/18*6.28;return prt(p.x,p.y,Math.cos(g)*8,-28+Math.sin(g)*8,Math.cos(g)*1.6,Math.sin(g)*1.6,0,R(14,20),4,0,pk(['#8fd0ff','#ffffff']));});}
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
    if(isJ)await cine(u,sk,ts);
    let an, hit;
    const adv=area&&!(sk.ranged&&!isJ);   // área à distância fica parada
    if(adv){an=sk.an||'atk3'; u.el.style.zIndex=60; u.mv.style.transform=`translate(${dir*82}px,0)`; setAnim(u,an,0,true); await sleep(hit=hitAt(u,an));}
    else if(sk.ranged&&!isJ){an=sk.target==='all'?'atk1':'atk2'; setAnim(u,an,0,true); sfx.shoot(); await sleep(hit=hitAt(u,an)*.9); await shoot(u,main); hit+=190;}
    else{an=sk.an||(isJ?'atk3':'atk1'); sfx.swing(); await dashTo(u,main); setAnim(u,an,0,true); await sleep(hit=hitAt(u,an));}
    if(isJ)elFx(u,ts);
    if(dodgedSet.size)for(const t of dodgedSet)evade(t);
    if(dodged){ await evade(main); log(`${nm(main)} desvia de <b>${sk.name}</b>`); }
    else{ let tot=0;
      ts.forEach(t=>{ if(dodgedSet.has(t))return; fxAt(u,isJ?'jutsu':'hit',t,isJ?1.3:sk.target==='all'?.7:.85); fxAt(u,'imp',t,.55,-8); tot+=hurt(t,dmgOf(u,t,sk.mult),isJ?'big':''); spark(t,u.d.c,isJ?10:6);
        if(t.alive){ if(sk.dot)t.dot={dmg:Math.round(u.atk*sk.dot.mult),rounds:sk.dot.rounds+(fieldA&&u.side===fieldA.side&&u.d.el==='Veneno'?1:0)}; if(sk.stun&&t===main)t.stunned=true; upd(t);} });
      if(sk.dispel)clearField();
      if(isJ){shake();flash();sfx.heavy();}else sfx.hit();
      log(`${nm(u)} ${isJ?'solta':'usa'} <b>${sk.name}</b>: ${tot} de dano`); }
    const ko=!dodged&&!dodgedSet.has(main)&&sk.cause&&main.alive;
    if(ko){ endCine(); await smash(u,main,sk.cause); } else if(!dodged)await hitstop(isJ?140:60);
    // sem duração fixa: espera o resto da anim do atacante e, no jutsu, o efeito acabar
    await sleep(Math.max(ko?120:isJ?0:200, animMs(u,an)-hit)); if(isJ&&!ko)await fxWait(420,1400);
    endCine(); home(u);
    if(ko){await chain(u.side,main,1,u); if(main.alive){await sleep(140); setState(main,null); main.el.style.zIndex=main.z;}}
    await sleep(160);
  }finally{ endCine(); sceneOff(); }
}
async function chain(side,t,count,src){
  const c=team(side).find(x=>x.alive&&!x.chaseUsed&&!x.stunned&&x.d.chase.on===t.state);
  if(!c)return;
  if(!scene.on)sceneOn([src,t].filter(Boolean)); sceneAdd(c);   // perseguição também é cena isolada; quem entra fica visível
  c.chaseUsed=true; count++; if(side==='p')maxCombo=Math.max(maxCombo,count);
  const cause=c.d.chase.cause, an=an_of(c).chase?'chase':{R:'atk3',L:'atk2',D:'atk1'}[cause];
  const air=!!an_of(c).rise&&t.state==='L';
  if(air){   // perseguição aérea (lote E): pula até o alvo no ar e desce no chute
    setAnim(c,'rise',0,true); sfx.swing(); await dashTo(c,t,true); await sleep(animMs(c,'rise')*.45);
    setAnim(c,'meteor',0,true); await sleep(animMs(c,'meteor')*.7);
  }else if(c.d.chase.ranged){ sfx.swing(); setAnim(c,an,0,true); await sleep(hitAt(c,an)); await shoot(c,t); }   // fica parado, o enxame voa até o alvo
  else{ sfx.swing(); await dashTo(c,t); setAnim(c,an,0,true); await sleep(hitAt(c,an)); }
  sfx.chase(); spark(t,c.d.c,10); fxAt(c,'chase',t,1.25); fxAt(c,'imp',t,.6,-8);
  const d=hurt(t,dmgOf(c,t,c.d.chase.mult*(1+.1*(count-1))),'chase'); comboLine(c.d.chase.name,count);
  log(`↳ ${nm(c)}: <b>${c.d.chase.name}</b> ${d} (combo x${count})`,'x');
  if(t.alive)await smash(c,t,cause); else await hitstop(90);
  if(air&&an_of(c).landing){const a=pos(c),b=pos(t),dir=side==='p'?1:-1;   // desce até o chão e pousa agachado
    c.mv.style.transform=`translate(${b.x-dir*82-a.x}px,${b.y-a.y}px)`; setAnim(c,'landing',0,true); await sleep(animMs(c,'landing')*.7);}
  await sleep(110); home(c);
  if(t.alive)await chain(side,t,count);
}
function result(){const p=U.p.some(u=>u.alive), e=U.e.some(u=>u.alive); return !e?'win':!p?'lose':null;}
function wants(u,rate){const j=u.d.jutsu;
  if(j.heal)return team(u.side).some(a=>a.alive&&a.hp<a.max*.65);
  return Math.random()<rate;}
async function intro(){
  for(const u of all()){u.mv.style.transition='none'; u.mv.style.transform=`translate(${(u.side==='p'?-1:1)*640}px,0)`; setAnim(u,'move',Math.random()*8|0);}
  $('rd').textContent=foe.name; await sleep(120);
  for(const u of all()){u.mv.style.transition='transform .7s linear'; u.mv.style.transform='';}
  await sleep(760);
  for(const u of all()){u.mv.style.transition=''; setAnim(u,'idle',Math.random()*8|0);}
  ink('LUTAR!'); sfx.start(); await sleep(1000);
}
async function run(){
  let res=null;
  try{
    await intro();
    outer: while(true){
      round++; hitsR={p:0,e:0}; $('rd').textContent='Rodada '+round; log('Rodada '+round,'r');
      if(round>1){
        chakra.p=Math.min(100,chakra.p+20); chakra.e=Math.min(100,chakra.e+20);
        if(fieldA&&--fieldA.rounds<=0)clearField();
        for(const u of all()){ if(!u.alive)continue; if(u.cd>0)u.cd--;
          if(u.dot){sfx.dot(); curSide=u.side==='p'?'e':'p'; hurt(u,u.dot.dmg,'dot'); spark(u,'#ef9a5b',5); if(u.alive&&--u.dot.rounds<=0)u.dot=null; upd(u);} }
      }
      all().forEach(u=>u.chaseUsed=false);
      for(let i=0;i<4;i++)for(const u of [U.p[i],U.e[i]])if(u&&u.alive)fl(u,String(i+1),'ord');
      drawJ(); await sleep(round===1?900:650);
      if((res=result()))break;
      for(let i=0;i<4;i++)for(const u of [U.p[i],U.e[i]]){
        if(!u||!u.alive)continue;
        await gate();
        if(u.stunned){u.stunned=false; fl(u,'paralisado','info2'); upd(u); log(`${nm(u)} está paralisado`); await sleep(450); continue;}
        let sk=u.d.normal,isJ=false; const j=u.d.jutsu;
        if(u.side==='p'){
          if(!u.armed&&autoP&&u.cd===0&&chakra.p>=j.cost&&wants(u,1)){u.armed=true;chakra.p-=j.cost;}
          if(u.armed){u.armed=false;u.cd=j.cd;sk=j;isJ=true;upd(u);} }
        else if(u.cd===0&&chakra.e>=j.cost&&wants(u,foe.ai)){chakra.e-=j.cost;u.cd=j.cd;sk=j;isJ=true;}
        u.el.classList.add('turn'); drawJ(); await doSkill(u,sk,isJ); u.el.classList.remove('turn');
        drawJ();
        if((res=result()))break outer;
      }
      if(round>=20){const s=t=>U[t].reduce((a,u)=>a+u.hp/u.max,0); res=s('p')>s('e')?'win':'lose'; break;}
    }
    musStop(); await sleep(350); $('flash').className='long'; sfx.end(); ink('FIM DO COMBATE',true); await sleep(1500);
  }catch(e){ if(e===ABORT)return; throw e; }
  sfx[res](); battleOn=false; ACT=[];
  const hasNext=res==='win'&&foeIx<FOES.length-1;
  if(res==='win'&&foeIx>=unlocked&&foeIx<FOES.length-1){unlocked=foeIx+1;save();}
  $('ink').className=''; $('clist').innerHTML='';
  $('ovT').textContent=res==='win'?'Vitória':'Derrota';
  $('ovP').textContent=`${foe.name} · ${round} rodada${round>1?'s':''}`;
  $('ovQ').textContent=`Seu maior combo: x${maxCombo||1}`+(res==='win'&&foeIx===FOES.length-1?' · Você venceu todas as missões!':'');
  $('ovN').classList.toggle('hide',!hasNext);
  $('resWin').classList.remove('hide');
}
