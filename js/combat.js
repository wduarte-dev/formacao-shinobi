// combat.js — jutsus, dano, alvos, perseguições, IA, laço da rodada
"use strict";
const availableJutsu=u=>u.d.recast&&fieldA?.owner===u?u.d.recast:u.d.jutsu;
function drawJ(){
  for(const s of ['p','e']){$('tck'+s.toUpperCase()).style.transform=`scaleX(${Math.min(100,chakra[s])/100})`; $('ckn'+s.toUpperCase()).textContent='Chakra '+chakra[s];}
  const b=$('sbar');
  // os botões nascem uma vez por batalha e só mudam de estado depois: assim nenhum clique se perde quando a barra atualiza no meio da ação
  if(b.dataset.t!==String(token)){ b.dataset.t=token; b.innerHTML='';
    U.p.forEach(u=>{const j=availableJutsu(u), w=document.createElement('div'), x=document.createElement('button');
      w.className='skw'; x.className='sk'; x.style.setProperty('--c',u.d.c); x.title=j.name+': '+j.desc;
      const ki=document.createElement('i'); ki.className='ki'; x.appendChild(ki);
      const kp=document.createElement('i'); kp.className='kp'; x.appendChild(kp);
      if(fxIcon(ki,u.id,58)){ x.classList.add('ic'); portrait(kp,u.id,1.0,32,32,'icon'); } else portrait(kp,u.id,2.3,58,58);
      x.insertAdjacentHTML('beforeend',`<span class="cost">${j.cost}</span><span class="cdv"></span>`);
      const lb=document.createElement('span'); lb.className='lb';
      x.onclick=()=>{ if(!battleOn||result()||!u.alive||u.cd>0||u.armed)return;   // armado = comprometido: não dá pra cancelar (só se ele morrer, aí o chakra volta)
        const skill=availableJutsu(u);
        if(chakra.p>=skill.cost){u.armed=true;u.armedSkill=skill;chakra.p-=skill.cost;} else return;
        sfx.arm(); upd(u); drawJ(); };
      w.appendChild(x); w.appendChild(lb); b.appendChild(w); u.sk=x; u.skl=lb; u.skc=x.querySelector('.cdv'); }); }
  U.p.forEach(u=>{const j=u.armedSkill||availableJutsu(u), x=u.sk; if(!x)return;
    const can=u.alive&&u.cd===0&&(u.armed||chakra.p>=j.cost);
    x.classList.toggle('armed',!!u.armed); x.classList.toggle('off',!can);
    x.title=j.name+': '+j.desc; x.querySelector('.cost').textContent=j.cost;
    u.skc.textContent=u.alive&&u.cd>0?u.cd:!u.alive?'✕':'';
    u.skl.textContent=u.armed?(j.instant?'na fila':'preparado'):j.name; });
}
// campo (Noite de Névoa): efeitos vêm de jutsu.fieldFx do dono do campo (data.js)
function fieldMul(a,basic){ if(!fieldA)return 1; const fx=fieldA.fx, mine=a.side===fieldA.side;
  if(mine)return fx.allyAll?.[a.d.el]||(basic&&fx.ally?.[a.d.el])||1; if(!mine&&fx.foe&&fx.foe[a.d.el])return fx.foe[a.d.el]; return 1;}
const unl=u=>u.solto?u.d.jutsu:null;   // forma solta do Yugami: bônus de dano/esquiva vêm do jutsu (uDmg/uDodge)
function dodgeOf(t){return (t.d.dodge||0)+(unl(t)?unl(t).uDodge||0:0)+(fieldA&&fieldA.owner===t?fieldA.fx.dodge||0:0);}
function setField(u,rounds){
  clearField();
  fieldA={side:u.side,rounds,owner:u,fx:u.d.jutsu.fieldFx||{}};
  showFieldScene(fieldA.fx.visual||null); drawJ();
}
// Status: Resistiu (chance por ninja, RES em data.js); seal = sem jutsu, blind = sem básico, sleep = perde a ação e acorda com dano
const STATUS={seal:{name:'Selado',tag:'S'},blind:{name:'Cego',tag:'C'},sleep:{name:'Sono',tag:'Z'}};
function tryStatus(t){ if(Math.random()*100<resOf(t)){ fl(t,'Resistiu','info2'); return false; } return true; }
const clearStatus=u=>{ u.seal=u.blind=u.sleep=0; };
function refundArm(u){
  chakra[u.side]=Math.min(100,chakra[u.side]+(u.armedSkill||u.d.jutsu).cost);
  u.armed=false; u.armedSkill=null;
}
function clearField(consumed=false,keepForgeScene=false){
  if(!fieldA)return;
  const {owner,fx}=fieldA;
  fieldA=null; $('fog').classList.remove('on');
  if(!keepForgeScene)showFieldScene(null);
  if(owner.d.recast){
    if(owner.armedSkill===owner.d.recast)refundArm(owner);
    owner.cd=owner.d.recast.cd;
  }
  if(!consumed)log(fx.visual==='forge'?'O Plano da Forja se apaga':'O campo de névoa se dissipa');
  drawJ();
}
async function dismissField(){
  if(fieldA?.fx.visual)await transitionField(fieldA.fx.visual,false,clearField);
  else clearField();
}
// triângulo elemental (docs/referencia-no.md §15): Fogo>Vento>Raio>Terra>Água>Fogo; Névoa e Gelo herdam Água, Som herda Vento; Espaço e Veneno neutros
const ELBASE={Fogo:'Fogo','Vento':'Vento',Raio:'Raio',Terra:'Terra','Água':'Água','Névoa':'Água',Gelo:'Água',Som:'Vento'}, ELBEAT={Fogo:'Vento',Vento:'Raio',Raio:'Terra',Terra:'Água','Água':'Fogo'}, ELADV=1.25, ELDIS=.8;
let EVADV=0, EVTXT='';   // dmgOf deixa aqui o resultado do triângulo; hurt consome (cor azul/cinza + texto) e zera
function elemMul(a,t,el=a.d.el){ const x=ELBASE[el], y=ELBASE[t.d.el]; if(!x||!y)return 1; if(ELBEAT[x]===y)return ELADV; if(ELBEAT[y]===x)return ELDIS; return 1; }
function dmgOf(a,t,m,basic,el=a.d.el){const em=elemMul(a,t,el); EVADV=em>1?1:em<1?-1:0; EVTXT=em>1?`${el} vence ${t.d.el}`:em<1?`${t.d.el} resiste a ${el}`:''; return Math.max(1,Math.round(em*a.atk*(1+(unl(a)?unl(a).uDmg||0:0))*(1+(a.power?.dmg||0))*m*fieldMul(a,basic)*(.92+Math.random()*.16)*100/(100+t.def)));}
// null indica que a Substituição também evitou o estado associado ao contato.
function landHit(a,t,m,basic,cls,area=false,el){
  if(cls!=='volley')kazanCount(a.side);
  if(t.d.passive==='Substituição'&&t.subRound!==round){
    const clone=livingClones(t)[0];
    if(clone){
      t.subRound=round; sceneAdd(clone); vanishClone(clone); dust(t,8);
      fl(t,t.d.passive,'info2'); log(nm(t)+' usa <b>Substituição</b>');
      hitsR[curSide]++; showHits(); return null;
    }
  }
  const damage=dmgOf(a,t,m,basic,el);
  return hurt(t,area&&t.owner?Math.max(damage,t.hp+t.shield):damage,cls);
}
function hurt(t,d,cls,{pierce=false}={}){
  const cost=cls==='cost';
  let r=d; if(!pierce&&t.shield>0){const ab=Math.min(t.shield,r); t.shield-=ab; r-=ab; if(t.shield<=0)sfx.sbreak(); else sfx.absorb();}
  const hp0=t.hp; if(!cost&&cls!=='dot'&&r>0&&t.hp-r>0)sfx.voz(t,'dor',.3);
  const adv=EVADV, evt=EVTXT; EVADV=0; EVTXT='';
  if(cost){
    t.hp-=r;
    if(r>0)fl(t,'-'+r+' PV','dot');
    if(t.side==='p'&&hp0>=t.max*.25&&t.hp<t.max*.25)sfx.lowhp();
    upd(t); return r;
  }
  if(r>0&&cls!=='dot'&&t.sleep>0&&t.alive){ t.sleep=0; fl(t,'Acordou','info2'); }
  t.hp=Math.max(0,t.hp-r); fl(t,r>0?'-'+r:'bloqueou',(cls||'')+(adv>0?' adv':adv<0?' dis':'')); if(adv&&r>0)fl(t,evt,'elem'+(adv>0?' adv':' dis'));
  const hs=[t.spr,...(t.gl||[])]; hs.forEach(x=>x.classList.add('hit')); battleAfter(()=>hs.forEach(x=>x.classList.remove('hit')),120);
  if(cls!=='dot'){hitsR[curSide]++; showHits();}
  if(t.alive&&t.side==='p'&&t.hp>0&&hp0>=t.max*.25&&t.hp<t.max*.25)sfx.lowhp();
  if(t.hp<=0&&t.owner){ vanishClone(t); return r; }
  if(t.hp<=0&&t.alive){t.alive=false; sfx.death(); sfx.voz(t,'queda'); if(t.side==='p'&&U.p.filter(x=>x.alive&&x!==t).length===1)sfx.last(); t.dot=null; clearStatus(t); if(t===mark){mark=null; t.el.classList.remove('mk');} t.stunned=false; t.state=null; t.st.className='st'; setAnim(t,'die');
    if(t.off&&t.off.y<0){ t.off.y=0; t.mv.style.transition='transform .35s cubic-bezier(.55,0,.9,.55)'; t.mv.style.transform=`translate(${t.off.x}px,0)`; battleAfter(()=>{t.mv.style.transition='';},420); }   // morreu no ar: cai até o chão em vez de ficar flutuando
    if(t.armed)refundArm(t);}
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
async function strikeSequence(u,sk){
  const extra=u.power?.bonusHits[Math.min(round-u.power.start,u.power.bonusHits.length-1)]||0;
  const last=sk.sequence.length-1, total=sk.sequence.length+extra;
  let t=null, dodged=false, launched=false, damage=0, hits=0;
  for(let i=0;i<total;i++){
    await gate();
    if(!t?.alive){
      t=pick(u,sk.target,false);
      if(!t)break;
      dodged=!t.stunned&&!t.state&&Math.random()*100<dodgeOf(t);
      await dashTo(u,t);
    }
    const finisher=i===total-1, part=finisher?last:i%last, an=sk.sequence[part];
    const ms=animMs(u,an), impact=ms*sk.hits[part];
    sfx.swing(); setAnim(u,an,0,true); await sleep(impact);
    if(dodged){ await evade(t); log(`${nm(t)} desvia de <b>${sk.name}</b>`); break; }
    strikeFx(u,t,sk.contactY?.[part]??-75,finisher);
    sfx.hit(u,'atk'); if(i===0)sfx.voz(u,'golpe',.6);
    const dealt=landHit(u,t,sk.mult,true,'');
    if(dealt!==null){ damage+=dealt; hits++; strikeRecoil(t,u.side==='p'?1:-1,finisher); }
    if(result()){ await finale(t); break; }
    if(finisher){
      shake(.65);
      if(dealt!==null&&t.alive&&sk.cause){ launched=true; await smash(u,t,sk.cause); break; }
      sfx.heavy();
    }
    // Troca parte da recuperação pela pausa no contato, mantendo o ritmo do combo.
    const stop=finisher?70:48;
    await hitstop(stop); await sleep(Math.max(0,ms-impact+28-stop));
  }
  if(hits)log(`${nm(u)} usa <b>${sk.name}</b> (${hits} golpes): ${damage} de dano`);
  home(u);
  if(launched){
    chainOpenJ=false; comboShow(u,t); await chain(u.side,t,1,u);
    if(t.alive){ await sleep(140); setState(t,null); t.el.style.zIndex=t.z; }
  }
  await sleep(160);
}
async function doSkill(u,sk,isJ){
  curSide=u.side; const dir=u.side==='p'?1:-1;
  try{
    if(u.d.stationary){ await kazanSkill(u,sk); return; }
    if(sk.sequence){ await strikeSequence(u,sk); return; }
    if(sk.clones){
      await cine(u,sk,[u]); setAnim(u,'atk2',0,true);
      const hit=hitAt(u,'atk2'); await sleep(hit); sfx.jutsu(u); sfx.voz(u,'jutsu');
      const group=summonClones(u,sk);
      jutsuFx(u,group); group.forEach(c=>fxAt(u,'jutsu',c,1.05,15));
      log(nm(u)+' usa <b>'+sk.name+'</b> ('+group.length+' clones)');
      await sleep(animMs(u,'atk2')-hit); home(u); return;
    }
    if(sk.aura){
      await cine(u,sk,[u]); setAnim(u,'atk2',0,true);
      await sleep(hitAt(u,'atk2'));
      const paid=hurt(u,Math.min(u.hp-1,Math.round(u.max*sk.lifeCost)),'cost',{pierce:true});
      u.power={...sk.aura,start:u.power?.start??round,end:round+sk.aura.rounds};
      upd(u); sfx.jutsu(u); sfx.voz(u,'jutsu');
      fxAt(u,'jutsu',u,1.16,12); auraBurst(u); flashSoft();
      fl(u,sk.name,'shieldf');
      log(`${nm(u)} ativa <b>${sk.name}</b> e gasta ${paid} PV`);
      await sleep(animMs(u,'atk2')-hitAt(u,'atk2')); home(u); return;
    }
    if(sk.unleash){   // Lacre Rompido (Yugami): tira o capuz, troca pro atlas solto + distorção em código, buff por N rodadas
      const was=u.solto;
      if(isJ&&!was){await cine(u,sk,[u]); sfx.jutsu(u);}   // sem kiai: o som do lacre quebrando com glitch já diz tudo
      u.sR=sk.unleash; if(!was){ setForm(u,true); setAnim(u,'unhood'); fxAt(u,'jutsu',u,1.3); fl(u,'capuz solto','shieldf'); const p=pos(u);
        em(22,i=>{const g=i/22*6.28; return prt(p.x,p.y-30,Math.cos(g)*10,Math.sin(g)*6,Math.cos(g)*1.8,Math.sin(g)*1.4,0,R(14,22),4,0,pk(PAL['Espaço']));}); }
      log(`${nm(u)} usa <b>${sk.name}</b>: +${Math.round((sk.uDmg||0)*100)}% de dano e +${sk.uDodge||0}% de esquiva por ${sk.unleash} rodadas`);
      await sleep(Math.max(700,animMs(u,'unhood'))); setAnim(u,'idle'); return;
    }
    if(sk.field){
      skTag(u,sk.name); setAnim(u,'cast',0,true);
      sfx.cast(u); fxAt(u,'aura',u,1.04);
      await sleep(animMs(u,'cast')*.65);
      sfx.jutsu(u);
      await transitionField(sk.fieldFx.visual,true,()=>setField(u,sk.field));
      log(`${nm(u)} usa <b>${sk.name}</b> por ${sk.field} rodadas`);
      setAnim(u,'idle'); return;
    }
    if(sk.target==='allies'){
      const al=team(u.side).filter(a=>a.alive);
      if(isJ){await cine(u,sk,al); sfx.jutsu(u);}   // cura/escudo/campo: sem kiai (o grito ficava sem sentido, ex.: Iwao gemendo ao erguer o Gigante)
      setAnim(u,'cast');
      al.forEach(a=>{ const p=pos(a); fxAt(u,'jutsu',a,1.1);
        if(sk.heal){sfx.heal(); healRain(a); const h=Math.round(u.atk*sk.heal); a.hp=Math.min(a.max,a.hp+h); fl(a,'+'+h,'heal'); em(12,()=>prt(p.x,p.y,R(-14,14),-R(0,40),0,R(-1.6,-.6),0,R(24,40),R(3,5),0,pk(['#7dffa6','#ffffff','#3fd07a'])));}
        if(sk.shield){sfx.shield(); stoneWall(a); a.shield=Math.max(a.shield,Math.round(u.atk*sk.shield)); a.shM=a.shield; a.shR=2; fl(a,'escudo','shieldf'); em(18,i=>{const g=i/18*6.28;return prt(p.x,p.y,Math.cos(g)*8,-28+Math.sin(g)*8,Math.cos(g)*1.6,Math.sin(g)*1.6,0,R(14,20),4,0,pk(['#8fd0ff','#ffffff']));});}
        upd(a);});
      log(`${nm(u)} usa <b>${sk.name}</b>`); await sleep(Math.max(650,animMs(u,'cast'))); setAnim(u,'idle'); return;
    }
    const main=pick(u,sk.target,isJ); if(!main)return;
    const area=sk.target==='row'||sk.target==='all';
    // split (Doku): chance do frasco se multiplicar no ar e cair em TODOS os inimigos, mesmo dano, como o Tsunami (todos aparecem e ficam marcados)
    const split=!isJ&&sk.split&&foes(u).length>1&&Math.random()<sk.split;
    const ts=split?foes(u):sk.target==='row'?foes(u).filter(x=>x.row===main.row):sk.target==='all'?foes(u):[main];
    // esquiva: só golpe de alvo único (básico ou jutsu de um alvo); paralisado não desvia
    const canDodge=t=>!t.stunned&&!t.state&&Math.random()*100<dodgeOf(t);
    const dodged=!split&&(sk.target==='front'||sk.target==='weak')&&canDodge(main);
    // ataque básico em área (Rajada Leve): cada alvo testa a esquiva; jutsu de todos não é desviável
    const dodgedSet=new Set(sk.target==='all'&&!isJ?ts.filter(t=>!t.owner&&canDodge(t)):[]), connected=new Set();
    if(isJ)await cine(u,sk,ts); else if(sk===u.d.strong)skTag(u,sk.name);
    if(split){ sceneOn([u,...ts]); markTargets(ts); ink(sk.splitName||'MULTIPLICOU!'); }
    let an, hit; const H=sk.hits||[0], nh=H.length, HA=(u,a)=>sk.hits?Math.max(120,H[0]*animMs(u,a)):hitAt(u,a);   // sk.hits: momentos (fração da anim) de cada soco; o dano se divide entre eles
    const adv=area&&!(sk.ranged&&!isJ);   // área à distância fica parada
    if(adv){an=sk.an||'atk3'; u.el.style.zIndex=60; u.mv.style.transform=`translate(${dir*82}px,0)`; setAnim(u,an,0,true); await sleep(hit=HA(u,an));}
    else if(sk.ranged&&!isJ){an=sk.an||(sk.target==='all'?'atk1':'atk2'); setAnim(u,an,0,true); sfx.shoot(u); await sleep(hit=HA(u,an)*.9); if(split){await shootSplit(u,ts); hit+=480;} else{await shoot(u,main); hit+=190;}}
    else if(isJ&&sk.cast){an=sk.an||'atk2'; u.el.style.zIndex=60; u.mv.style.transform=`translate(${dir*40}px,0)`; setAnim(u,an,0,true); await sleep(hit=HA(u,an));}   // invoca de onde está (ex.: Prisão de Gelo): só um passo à frente
    else{an=sk.an||(isJ?'atk3':'atk1'); sfx.swing(); await dashTo(u,main); setAnim(u,an,0,true); await sleep(hit=HA(u,an));}
    if(isJ){sfx.jutsu(u); sfx.voz(u,'jutsu'); (sk.wave?soundWave:elFx)(u,ts); if(!sk.wave)jutsuFx(u,ts);} else sfx.voz(u,'golpe',sk===u.d.strong?.7:.3);   // jutsu de onda (Poko): anéis em código no lugar das partículas do elemento
    if(dodgedSet.size)for(const t of dodgedSet)evade(t);
    if(dodged){ await evade(main); log(`${nm(main)} desvia de <b>${sk.name}</b>`); }
    else{ let tot=0;
      for(let k=0;k<nh;k++){   // cada soco do golpe causa a sua parte do dano, com faísca e hit-stop próprios
        if(k){ const w=Math.max(70,(H[k]-H[k-1])*animMs(u,an)); await sleep(w); hit+=w; if(!ts.some(t=>t.alive&&!dodgedSet.has(t)))break; }
        ts.forEach(t=>{ if(dodgedSet.has(t)||!t.alive)return; if(!(isJ&&sk.wave))fxAt(u,k?'hit':isJ?'jutsu':'hit',t,k?.7:isJ?1.3:sk.target==='all'?.7:.85); fxAt(u,'imp',t,.55,-8);
          const dealt=landHit(u,t,sk.mult/nh,sk===u.d.normal,isJ?'big':'',area||split);
          if(dealt!==null){ tot+=dealt; connected.add(t); spark(t,u.d.c,isJ?10:6); } });
        if(nh>1&&k<nh-1)sfx.hit(); }
      connected.forEach(t=>{ if(!t.alive)return;
        if(sk.dot&&tryStatus(t))t.dot={dmg:Math.round(u.atk*sk.dot.mult),rounds:sk.dot.rounds+(fieldA&&u.side===fieldA.side&&fieldA.fx.dot?fieldA.fx.dot[u.d.el]||0:0),el:u.d.el}; if(sk.stun&&(t===main||sk.stun==='all')&&tryStatus(t))t.stunned=true;
        if(sk.instakill&&t.alive){ fl(t,sk.name+'!','state'); hurt(t,t.hp,'big',{pierce:true}); }   // Selo Final: derruba o alvo, ignora escudo
        if(sk.status)for(const [k,n] of Object.entries(sk.status))if(tryStatus(t)){ t[k]=Math.max(t[k]||0,n); fl(t,STATUS[k].name,'state'); }   // seal / blind / sleep (rodadas = ações do alvo)
        upd(t); });
      if(sk.dot)sfx.apply(u.d.el==='Fogo'?'burn':'poison'); if(sk.stun)sfx.apply(u.d.el==='Gelo'?'freeze':'stun');
      if(sk.dispel)await dismissField();
      if(isJ){shake();flash();sfx.heavy();sfx.impact(u);}else sfx.hit(u,sk===u.d.normal?'atk':sk===u.d.strong?'forte':'');
      log(`${nm(u)} ${isJ?'solta':'usa'} <b>${sk.name}</b>${nh>1?` (${nh} golpes)`:''}: ${tot} de dano`);
      if(result())await finale(main); }
    const stateHit=connected.has(main)&&sk.cause&&main.alive;
    if(stateHit&&main.d.immuneState)kazanGuard(main);
    const ko=stateHit&&!main.d.immuneState;
    if(ko){ endCine(); await smash(u,main,sk.cause); } else if(!dodged)await hitstop(isJ?70:25);
    // sem duração fixa: espera o resto da anim do atacante e, no jutsu, o efeito acabar
    if(ko)await sleep(60); else{ await sleep(Math.max(isJ?0:200, animMs(u,an)-hit)); if(isJ)await fxWait(420,1400); }   // abriu combo: a perseguição começa já (antes esperava ~650ms o resto da anim do atacante)
    endCine(); home(u);
    if(ko){ chainOpenJ=isJ; comboShow(u,main); await chain(u.side,main,1,u); if(main.alive){await sleep(140); setState(main,null); main.el.style.zIndex=main.z;}}
    await sleep(160);
  }finally{ endCine(); sceneOff(); }
}
// quem vai entrar na perseguição, na ordem (mesma regra do chain: on do próximo = cause do anterior, sem repetir)
function comboPlan(side,state){ const seen=new Set(), out=[]; let s=state;
  for(;;){ const c=team(side).find(x=>x.alive&&!x.chaseUsed&&!x.stunned&&!seen.has(x)&&x.d.chase?.on===s); if(!c)break; seen.add(c); out.push(c); s=c.d.chase.cause; }
  return out; }
// no começo do combo já destaca TODOS que vão combar (estilo NO), não só quem começa
function comboShow(u,t){ const pl=comboPlan(u.side,t.state); if(!pl.length)return;
  if(!scene.on)sceneOn([u,t]); pl.forEach(x=>{ sceneAdd(x); x.el.classList.add('cmb'); }); }
function spritePoint(u,point){
  const p=cur(u), offset=spriteOffset(u,point);
  const pose=new DOMMatrixReadOnly(getComputedStyle(u.st).transform);
  return {x:p.x+pose.m41+offset.x,y:p.y+pose.m42+offset.y};
}
// Ponto no tronco do primeiro quadro de Lançado. As poses estendidas têm o centro
// do corpo fora do centro da célula (em especial Mizuha e Doku).
const AIR_TORSO={
  kaen:[115,87],mizuha:[108,91],raiden:[104,84],iwao:[106,85],fuuka:[99,93],
  hiyori:[86,78],mayoi:[110,90],doku:[112,67],poko:[112,97],
  utsushic:[91,92],utsushi:[90,89],keshin:[85,86],mestre:[85,86],yugami:[96,93],yugamir:[96,93]
};
const airTorso=u=>spritePoint(u,AIR_TORSO[sid(u)]||[96,96]);
// Cada palma sai no quadro da mão estendida e viaja até o corpo visível do alvo.
async function cloneVolley(owner,target){
  const dir=owner.side==='p'?1:-1;
  // cada clone arma a palma em paralelo (escalonados em 90 ms); antes era um por vez e a repulsão do alvo esperava a fila toda (~2 s)
  const one=async(clone,delay)=>{
    await sleep(delay);
    if(!clone.alive||!target.alive)return 0;
    const palm=3, step=1000/an_of(clone).atk1[4];
    sceneAdd(clone); setAnim(clone,'atk1');
    await sleep(palm*step);
    if(!clone.alive||!target.alive)return 0;
    setAnim(clone,'atk1',palm);
    const from=spritePoint(clone,[160,81]), to=airTorso(target);
    const travel=Math.max(115,Math.min(230,Math.hypot(to.x-from.x,to.y-from.y)*.36));
    const proj=FXUSE[owner.id].proj, frames=FXA[owner.id].a[proj][1];
    fxSpr(owner.id,proj,{...from,to,dir,flip:dir<0,sc:.51,fps:1000*frames/travel,linear:true});
    await sleep(travel);
    if(!target.alive)return 0;   // outra palma já derrubou o alvo
    const dealt=landHit(clone,target,owner.d.chase.cloneHit,false,'chase');
    if(dealt===null)return 0;
    chaseContact(to,owner.d.c,6); return dealt;
  };
  const dealt=await Promise.all(livingClones(owner).map((c,i)=>one(c,i*90)));
  return dealt.reduce((a,b)=>a+b,0);
}
function chaseContact(point,color,count){
  em(count,i=>{
    const angle=i*2*Math.PI/count;
    return prt(point.x,point.y,0,0,Math.cos(angle)*3.2,Math.sin(angle)*2.8,.1,R(10,17),R(2,4),1,color);
  });
}
async function aimChaseKick(c,t,put,dir){
  const {phases:[grab,strike],kick}=c.d.chase;
  const home=pos(c), ground=pos(t), target=cur(t);
  const dx=Math.max(70,Math.min(1082,target.x+dir*30))-ground.x;
  const y=Math.max(t.off.y,-150);
  setAnim(t,'launched',0,'frame');
  const contact=airTorso(t);
  contact.y+=y-t.off.y;
  const foot=spriteOffset(c,kick.foot,strike,kick.frame);
  const x=contact.x-foot.x-home.x, footY=contact.y-foot.y-home.y;
  const rise=animMs(c,grab), step=1000/an_of(c)[strike][4];
  setAnim(c,grab,0,true); sfx.swing(); c.el.style.zIndex=60;
  const jump=`transform ${rise*.84/speed}ms cubic-bezier(.16,.75,.3,1)`;
  put(t,t.off.x,y,jump);
  put(c,x-dir*29,footY+14,jump);
  await sleep(rise);
  t.off.y=y; t.mv.style.transition='';
  setAnim(c,strike,0,true);
  put(c,x,footY,`transform ${step*kick.frame/speed}ms ease-out`);
  await sleep(step*kick.frame);
  put(c,x,footY,'none');
  setAnim(c,strike,kick.frame,true);
  chaseContact(contact,c.d.chase.cloneHit?'#d9f4ff':'#ffce72',10);
  sfx.hit(c,'atk');
  return {ground,dx,step};
}
async function finishWindKick(c,t,put,dir,aim,connected){
  const {phases:[,strike,land],kick,cause}=c.d.chase;
  const {ground,dx,step}=aim, h=pos(c);
  await hitstop(65);
  const ms=animMs(c,strike)-step*kick.frame;
  put(c,ground.x+dx-h.x-dir*65,ground.y-h.y,`transform ${ms/speed}ms cubic-bezier(.35,0,.85,.7)`);
  const volley=connected?cloneVolley(c,t):Promise.resolve(0);   // as palmas saem já durante a queda do chute
  await sleep(ms);
  c.mv.style.transition='';
  setAnim(c,land);
  const landing=sleep(animMs(c,land));
  const extra=await volley;
  // a repulsão sai assim que a última palma acerta; o pouso do Utsushi termina em paralelo (antes a repulsão esperava o pouso inteiro, ~0,5 s a mais)
  if(connected&&t.alive)await knock(t,cause);
  await landing;
  if(result())await finale(t);
  return extra;
}
async function landKeshinKick(c,t,put,dir,aim,connected){
  const {phases:[,slam,land],kick,cause}=c.d.chase;
  const {ground,dx,step}=aim, home=pos(c), x=ground.x+dx;
  await hitstop(80);
  const ms=step*(kick.landing-kick.frame);
  const fall=`transform ${ms/speed}ms cubic-bezier(.55,0,.9,.55)`;
  if(connected&&(t.alive||!t.owner))put(t,dx,0,fall);
  put(c,x-dir*38-home.x,ground.y-home.y,fall);
  speedLines('D');
  await sleep(ms);
  setAnim(c,slam,kick.landing,true);
  c.mv.style.transition='';
  if(connected&&(t.alive||!t.owner)){
    t.off={x:dx,y:0}; t.mv.style.transition='';
    if(t.alive){ setState(t,cause); fl(t,ST[cause]+'!','state'); sfx.knock(cause); }
    slamFx(t,c.d.c); crack(x,ground.y); shake(1.15); sfx.thud();
  }
  if(result())await finale(t);
  await sleep(animMs(c,slam)-step*kick.landing);
  setAnim(c,land,0,true); await sleep(animMs(c,land));
}
async function chain(side,t,count,src){
  const c=team(side).find(x=>x.alive&&!x.chaseUsed&&!x.stunned&&x.d.chase?.on===t.state);
  if(!c)return;
  if(!scene.on)sceneOn([src,t].filter(Boolean)); sceneAdd(c); sceneAdd(t); t.el.classList.add('tgt');   // perseguição também é cena isolada; quem entra fica visível e o alvo fica marcado
  c.chaseUsed=true; count++; acadCheck(side,count); sfx.chaseGo(); sfx.voz(c,'golpe',.6); if(side==='p')maxCombo=Math.max(maxCombo,count);
  const CH=c.d.chase, cause=CH.cause, an=an_of(c).chase?'chase':{R:'atk3',L:'atk2',D:'atk1'}[cause];
  const CHA=(u,a)=>CH.hits?Math.max(120,CH.hits[0]*animMs(u,a)):hitAt(u,a);
  const air=!!an_of(c).rise&&t.state==='L';
  const dir=side==='p'?1:-1, h0=pos(c), tb=cur(t);
  const put=(u,x,y,tr)=>{u.mv.style.transition=tr||''; u.mv.style.transform=`translate(${x}px,${y}px)`;};
  let kickAim;
  if(CH.kick)kickAim=await aimChaseKick(c,t,put,dir);
  else if(air){
    setAnim(c,'rise',0,true); sfx.swing(); c.el.style.zIndex=60;
    const riseMs=animMs(c,'rise');
    put(c,tb.x-dir*105-h0.x,Math.max(180,tb.y-76)-h0.y,`transform ${riseMs/speed}ms cubic-bezier(.2,.75,.5,1)`);
    await sleep(riseMs);
    setAnim(c,'meteor',0,true); speedLines('D');
    const contactMs=animMs(c,'meteor')*.9;   // último quadro: pé estendido, antes das chamas cortadas
    put(c,tb.x-dir*54-h0.x,tb.y-52-h0.y,`transform ${contactMs/speed}ms ease-in`);
    await sleep(contactMs);
    setAnim(c,'meteor',seqN(an_of(c).meteor)-1,true);   // garante a pose do contato mesmo com queda de FPS
  }else if(c.d.chase.mv==='slam'){   // salta alto por cima do alvo e despenca nele
    // a anim do golpe começa JÁ no salto: ele sobe, segura no alto e despenca de modo que o pouso caia exatamente no quadro do soco
    const hitT=Math.max(430,CHA(c,an)); setAnim(c,an,0,true); sfx.swing(); c.el.style.zIndex=60;
    put(c,tb.x-dir*70-h0.x,tb.y-190-h0.y,`transform ${300/speed}ms cubic-bezier(.2,.9,.35,1)`); await sleep(hitT-130);
    put(c,tb.x-dir*64-h0.x,tb.y+2-h0.y,`transform ${130/speed}ms cubic-bezier(.6,0,1,.6)`); await sleep(130);
    dust(c,14); shake(); sfx.thud();   // pouso = soco: poeira, tremor, som e (logo abaixo) o dano no mesmo instante
  }else if(c.d.chase.cast){   // invocador (Onda da Mizuha): chega só até uma distância segura, faz o selo/jutsu e a magia surge no alvo (nada de ir socar)
    const ja=an_of(c).atk2?'atk2':an, gx=tb.x-dir*250*(c.d.size||1);
    if((gx-(h0.x+c.off.x))*dir>30){ setAnim(c,'move',0,true); sfx.swing(); put(c,gx-h0.x,tb.y-h0.y,'transform .26s cubic-bezier(.2,.8,.3,1)'); await sleep(260); }
    setAnim(c,ja,0,true); sfx.cast(c); await sleep(Math.min(420,hitAt(c,ja)*.7));
  }else if(c.d.chase.ranged){ sfx.swing(); setAnim(c,an,0,true); await sleep(CHA(c,an)); await shoot(c,t); }   // fica parado, o enxame voa até o alvo
  else{ sfx.swing(); await dashTo(c,t); setAnim(c,an,0,true); await sleep(CHA(c,an)); }
  const tsu=CH.tsunami&&Math.random()<CH.tsunami&&foes(c).length>1;
  let tsFoes=[];
  if(tsu){ ink('TSUNAMI!'); sfx.heavy(); shake(.6);   // parede de água desenhada em código: brota do chão, sobe, avança e desaba no time inteiro
    tsFoes=foes(c); tsFoes.forEach(o=>{ sceneAdd(o); o.el.classList.add('tgt'); o.el.style.zIndex=55; });   // todo mundo que vai levar o golpe aparece e fica marcado; z 55 = ABAIXO do canvas de efeitos (#fxc, 66): a onda passa por cima deles
    const W=tsunamiFx(dir); for(let n=0;!W.hit&&n<90;n++){ await gate(); await sleep(30); }   // espera a crista bater (respeita pausa/velocidade; teto de segurança)
    sfx.heavy(); shake(1.3); flashSoft(); }
  else if(CH.surge){   // Onda normal: onda de água em código que brota embaixo do alvo, cresce, curva e quebra em cima dele (sprite de respingo só como complemento no impacto)
    const p=cur(t), W=waveFx({dir,x:p.x,y:p.y}); for(let n=0;!W.hit&&n<70;n++){ await gate(); await sleep(30); }
    fxAt(c,'hit',t,1.1,-20); sfx.heavy(); }
  sfx.chase(c);
  if(!kickAim){ spark(t,c.d.c,10); if(!air&&!CH.surge)fxAt(c,'chase',t,1.25); fxAt(c,'imp',t,.6,-8); }
  const ch=CH.hits||[0], cm=CH.mult*(1+.1*(count-1)); let d=0, connected=false;
  if(t.state)fl(t,ST[t.state],'state');   // etiqueta do estado em que o alvo foi pego
  for(let k=0;k<ch.length&&t.alive;k++){ if(k){ await sleep(Math.max(70,(ch[k]-ch[k-1])*animMs(c,an))); fxAt(c,'imp',t,.6,-8); spark(t,c.d.c,6); sfx.hit();}
    const dealt=landHit(c,t,cm/ch.length,false,'chase',tsu);
    if(dealt!==null){connected=true; d+=dealt;} }
  if(tsu){ for(const o of tsFoes){ if(o===t||!o.alive)continue; fxAt(c,'hit',o,1.2,-10); fxAt(c,'imp',o,.6,-8); spark(o,c.d.c,10); landHit(c,o,CH.mult*.6,false,'chase',true);
      if(o.alive&&!o.d.stationary){ const of=o.off||{x:0,y:0}; o.mv.style.transition='transform .16s ease-out'; o.mv.style.transform=`translate(${of.x+dir*52}px,${of.y}px)`;   // a água empurra todo mundo (só visual)
        battleAfter(()=>{ o.mv.style.transition='transform .3s ease-in-out'; o.mv.style.transform=`translate(${of.x}px,${of.y}px)`; battleAfter(()=>{o.mv.style.transition='';},340); },240/speed); } }
    battleAfter(()=>tsFoes.forEach(o=>{ if(o!==t&&!o.state)o.el.style.zIndex=o.z; }),900/speed); }
  if(kickAim&&CH.cloneHit)d+=await finishWindKick(c,t,put,dir,kickAim,connected);
  if(!air&&!kickAim&&result())await finale(t);
  comboLine(c.d.chase.name,count,c.id); fl(t,count+' Perseguição!','chasec');
  log(`↳ ${nm(c)}: <b>${c.d.chase.name}</b> ${d} (combo x${count})`,'x');
  if(air){
    const ground=pos(t), landX=Math.max(70,Math.min(1082,tb.x+dir*36)), fallMs=220;
    const fall=`transform ${fallMs/speed}ms cubic-bezier(.55,0,.9,.55)`;
    if(connected){
      shake(.65); flashSoft();
      await hitstop(35);
      if(t.alive||!t.owner){
        put(t,landX-ground.x,0,fall);
        trailFx(tb.x,tb.y-50,landX,ground.y-50,'D');
      }
    }
    put(c,landX-dir*75-h0.x,ground.y-h0.y,fall);
    await sleep(fallMs);
    c.mv.style.transition='';
    setAnim(c,'landing',0,true);
    if(connected&&(t.alive||!t.owner)){
      t.off={x:landX-ground.x,y:0}; t.mv.style.transition='';
      if(t.alive){ setState(t,cause); fl(t,ST[cause]+'!','state'); sfx.knock(cause); }
      slamFx(t,c.d.c); sfx.thud();
    }
    if(result())await finale(t);
    await sleep(animMs(c,'landing'));
    if(!connected)setState(t,null);
    home(c);
    if(connected&&t.alive)await chain(side,t,count);
    return;
  }
  if(kickAim){
    if(!CH.cloneHit)await landKeshinKick(c,t,put,dir,kickAim,connected);
    if(!connected&&t.alive)setState(t,null);
    home(c);
    if(connected&&t.alive)await chain(side,t,count);
    return;
  }
  if(!connected){ setState(t,null); home(c); return; }
  if(t.alive){
    if(CH.mv==='rise'&&cause==='L'){ const g=pos(t);   // sobe junto com o alvo lançado e depois desce
      put(c,tb.x-dir*76-h0.x,g.y-170-h0.y,'transform .3s cubic-bezier(.15,.85,.3,1)'); }
    await smash(c,t,cause);
    if(CH.mv==='rise'&&cause==='L'){ put(c,cur(t).x-dir*76-h0.x,pos(t).y-h0.y,'transform .2s cubic-bezier(.55,0,.9,.55)'); await sleep(200); dust(c,8); c.mv.style.transition=''; }
  }else await hitstop(40);
  await sleep(110); home(c);
  if(t.alive)await chain(side,t,count);
}
function result(){const p=U.p.some(u=>u.alive), e=U.e.some(u=>u.alive);
  if(acad)return acad.done?'win':!e||!p?'lose':null;   // Teste de Perseguição: só vence pela cadeia; Mestre caído ou time derrotado = falhou
  return !e?'win':!p?'lose':null;}
// Teste de Perseguição: a cadeia do jogador chegou na meta (e cumpre o extra do desafio)?
let chainOpenJ=false;
function acadCheck(side,count){ if(!acad||acad.done||side!=='p')return; const c=ACAD[acad.i];
  if(count>=c.goal&&(!c.jutsu||chainOpenJ)&&(!c.fire||U.p.some(u=>u.d.el.includes('Fogo')))){ acad.done=true; ink('DESAFIO CONCLUÍDO!'); } }
function wants(u,rate){const j=u.d.jutsu;
  if(j.unleash)return !u.solto&&Math.random()<rate;
  if(j.heal)return team(u.side).some(a=>a.alive&&a.hp<a.max*.65);
  if(j.aura)return !u.power&&u.hp>u.max*.25&&Math.random()<rate;
  return Math.random()<rate;}
async function castInstants(opening=false){
  await kazanReactions();
  // O laço da luta é o único que executa jutsus: cliques durante uma ação aguardam a próxima janela.
  let pending;
  do{
    pending=false;
    for(const u of all()){
      if(result())return;
      const j=u.armedSkill||availableJutsu(u);
      if(!j?.instant||!u.alive||u.cd>0||u.seal>0)continue;
      const autoRate=u.side==='p'?(autoP?1:0):foe.ai;
      if(!u.armed&&(!opening||!autoRate||chakra[u.side]<j.cost||!wants(u,autoRate)))continue;
      await gate();
      if(!u.armed){
        if(chakra[u.side]<j.cost)continue;
        chakra[u.side]-=j.cost;
      }
      pending=true;
      u.armed=false; u.armedSkill=null; u.cd=j.cd; upd(u); drawJ();
      await doSkill(u,j,true);
      await kazanReactions();
    }
    opening=false;
  }while(pending&&all().some(u=>u.armed&&u.d.jutsu.instant));
}
async function intro(){
  for(const u of all()){u.mv.style.transition='none'; u.mv.style.transform=`translate(${(u.side==='p'?-1:1)*640}px,0)`; setAnim(u,u.d.stationary?'walk':'move',Math.random()*8|0);}
  $('rd').textContent=foe.name; await sleep(120);
  for(const u of all()){u.mv.style.transition='transform .7s linear'; u.mv.style.transform='';}
  await sleep(760);
  for(const u of all()){u.mv.style.transition=''; if(!u.d.stationary)setAnim(u,'idle',Math.random()*8|0);}
  await Promise.all(all().filter(u=>u.d.stationary).map(kazanSit));
  ink('Rodada 1'); await sleep(700); ink('LUTAR!'); sfx.start(); await sleep(1000);
}
function* turnOrder(){
  for(let i=0;i<4;i++)for(const owner of [U.p[i],U.e[i]]){
    if(!owner)continue;
    yield owner;
    yield* livingClones(owner);
  }
}
async function run(){
  let res=null, byTime=false; finDone=false;
  try{
    await intro();
    outer: while(true){
      round++; hitsR={p:0,e:0}; $('rd').textContent='Rodada '+round; log('Rodada '+round,'r');
      if(round>1){
        for(const side of ['p','e']){
          const bonus=fieldA?.side===side?fieldA.fx.chakra||0:0;
          chakra[side]=Math.min(100,chakra[side]+20+bonus);
        }
        sfx.round(); sfx.chakra();
        for(const u of all())if(u.alive&&u.cd>0)u.cd--;
        if(fieldA&&--fieldA.rounds<=0)await dismissField();
        for(const u of all()){ if(!u.alive)continue; if(u.owner&&round>=u.expires){vanishClone(u);continue;} if(u.shR>0&&--u.shR===0){u.shield=0; upd(u);}
          if(u.power&&round>=u.power.end){u.power=null; upd(u);}
          if(u.sR>0&&--u.sR===0&&u.solto){ log(`${nm(u)} recoloca o capuz`); await rehoodCine(u); }
          if(u.dot){sfx.dot(u.dot.el); curSide=u.side==='p'?'e':'p'; hurt(u,u.dot.dmg,'dot'); spark(u,'#ef9a5b',5); if(u.alive&&--u.dot.rounds<=0)u.dot=null; upd(u);} }
      }
      all().forEach(u=>u.chaseUsed=false);
      for(let i=0;i<4;i++)for(const u of [U.p[i],U.e[i]])if(u&&u.alive)fl(u,String(i+1),'ord');
      drawJ(); await sleep(round===1?900:650);
      if((res=result()))break;
      await castInstants(true);
      if((res=result()))break;
      for(const u of turnOrder()){
        if(!u||!u.alive)continue;
        await gate();
        await castInstants();
        if((res=result()))break outer;
        if(!u.alive)continue;
        if(u.owner){
          await doSkill(u,u.d.normal,false); u.stunned=false; upd(u);
          if((res=result()))break outer;
          continue;
        }
        if(u.sleep>0){ fl(u,'Dormindo...','info2'); log(`${nm(u)} está dormindo e perde a ação`); u.sleep--; upd(u); continue; }
        const wasStun=u.stunned;   // paralisia (como no Naruto Online): o ninja age normal (básico, jutsu), só não consegue PERSEGUIR; passa depois da ação dele
        if(wasStun){ fl(u,'sem perseguir','info2'); log(`${nm(u)} está paralisado: age, mas não persegue`); }
        let sk=u.d.normal,isJ=false; const j=u.d.jutsu, sealed=u.seal>0;
        if(sealed&&u.armed&&!j.instant){ refundArm(u); u.armed=false; u.armedSkill=null; upd(u); }   // selado depois de armar: o chakra volta
        if(sealed)fl(u,'Selado','info2');
        if(!sealed&&!j.instant&&u.side==='p'&&!autoP&&!u.armed&&u.cd===0&&chakra.p>=j.cost){   // janela pra armar o jutsu: o botão pulsa um instante antes do golpe
          u.el.classList.add('turn'); u.sk.classList.add('ready');
          for(let w=0;w<1100&&!u.armed&&u.alive;w+=60){ await gate(); await castInstants(); await sleep(60); }
          u.sk.classList.remove('ready'); }
        if((res=result()))break outer;
        if(!u.alive)continue;
        if(sealed){}
        else if(!j.instant&&u.side==='p'){
          if(!u.armed&&autoP&&u.cd===0&&chakra.p>=j.cost&&wants(u,1)){u.armed=true;chakra.p-=j.cost;}
          if(u.armed){u.armed=false;u.armedSkill=null;u.cd=j.cd;sk=j;isJ=true;upd(u);} }
        else if(j.charge){ u.chg=(u.chg||0)+1; if(u.chg>=j.charge){u.chg=0;sk=j;isJ=true;} else fl(u,`${j.name}: ${j.charge-u.chg}`,'info2'); upd(u); }   // carga do Selo Final (Mestre): solta na 3ª vez dele e recomeça
        else if(!j.instant&&u.cd===0&&chakra.e>=j.cost&&wants(u,foe.ai)){chakra.e-=j.cost;u.cd=j.cd;sk=j;isJ=true;}
        if(!isJ&&u.d.strong&&Math.random()<STRONG_CHANCE)sk=u.d.strong;   // ação sem jutsu tem STRONG_CHANCE (30%) de virar o golpe Forte
        if(u.blind>0&&!isJ){ fl(u,'Cego: sem básico','info2'); log(`${nm(u)} está cego e não ataca`); }   // cegueira: só o jutsu sai
        else{ u.el.classList.add('turn'); drawJ(); await doSkill(u,sk,isJ); u.el.classList.remove('turn'); }
        if(u.alive){ if(u.seal>0)u.seal--; if(u.blind>0)u.blind--; upd(u); }
        if(wasStun&&u.alive){u.stunned=false; upd(u);}
        drawJ();
        if((res=result()))break outer;
      }
      await castInstants();
      if((res=result()))break;
      if(round>=20){const s=t=>U[t].reduce((a,u)=>a+u.hp/u.max,0); res=acad?'lose':s('p')>s('e')?'win':'lose'; byTime=!acad; break;}
    }
    if(fieldA)await dismissField();
    musStop(); await sleep(350);
    if(res==='win')for(const u of U.p)if(u.alive&&u.d.stationary)setAnim(u,'victory',0,true);
    $('flash').className='long'; sfx.end(); ink('FIM DO COMBATE',true); await sleep(1500);
  }catch(e){ if(e===ABORT)return; throw e; }
  sfx[res](); battleOn=false; ACT=[];
  const hasNext=!acad&&res==='win'&&foeIx<FOES.length-1;
  if(!acad&&res==='win'&&foeIx>=unlocked&&foeIx<FOES.length-1){unlocked=foeIx+1;save();}
  const newN=!acad&&res==='win'&&FOES[foeIx].unlock&&!have(FOES[foeIx].unlock)?FOES[foeIx].unlock:null; if(newN){own.push(newN);save(); battleAfter(()=>sfx.ui('desbloqueio'),900);}
  if(acad&&res==='win'&&!acadDone.includes(acad.i)){acadDone.push(acad.i); save();}
  $('ink').className=''; $('clist').innerHTML='';
  $('ovT').textContent=acad?(res==='win'?'Desafio concluído!':'Desafio falhou'):res==='win'?'Vitória':'Derrota';
  $('ovP').textContent=`${foe.name} · ${round} rodada${round>1?'s':''}`+(byTime?' · decidido por tempo (mais vida restante)':'');
  $('ovQ').textContent=acad?`Meta: ${ACAD[acad.i].name} · seu maior combo: x${maxCombo||1}`+(res!=='win'&&!U.e.some(u=>u.alive)?' · o Mestre caiu: o teste é de perseguição, não de dano':''):`Seu maior combo: x${maxCombo||1}`+(res==='win'&&foeIx===FOES.length-1?' · Você venceu todas as missões!':'')+(newN?` · ${N[newN].name} desbloqueado! Ele já está na Formação.`:'');
  $('ovN').classList.toggle('hide',!hasNext); $('ovB').textContent=acad?'Academia':'Mapa';
  $('resWin').classList.remove('hide');
}
