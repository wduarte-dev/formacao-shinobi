// combat.js — jutsus, dano, alvos, perseguições, IA, laço da rodada
"use strict";
const availableJutsu=u=>u.d.recast&&fieldA?.owner===u?u.d.recast:u.d.jutsu;
const selectedJutsu=u=>u.armedSkill||availableJutsu(u);
const canPrepareJutsu=(u,j)=>j&&u.alive&&u.cd===0&&!u.armedSkill&&chakra[u.side]>=j.cost;
function prepareJutsu(u,j,autoRate=null){
  if(!canPrepareJutsu(u,j)||(autoRate!==null&&!wants(u,j,autoRate)))return false;
  chakra[u.side]-=j.cost;
  u.armedSkill=j;
  mostraChakra(); mostra(u);
  return true;
}
function commitJutsu(u){
  const j=u.armedSkill;
  u.armedSkill=null;
  u.cd=j.cd;
  mostra(u);
  return j;
}
function refundJutsu(u){
  if(!u.armedSkill)return;
  chakra[u.side]=Math.min(100,chakra[u.side]+u.armedSkill.cost);
  u.armedSkill=null;
  mostraChakra(); mostra(u);
}
// clique no botão de jutsu = INPUT do jogador pra regra (na 3c vira buffer aplicado na próxima parada)
function armClick(u){ if(!battleOn||result()||!prepareJutsu(u,availableJutsu(u)))return; sfx.arm(); drawJ(); }
// barra de jutsus: desenha SÓ pela cópia da tela (vChakra + u.v), como a HUD
let vChakra={p:0,e:0};
telaOn('chakra',c=>{ vChakra={p:c.p,e:c.e}; });
const shownJutsu=u=>u.v?.armed||(u.d.recast&&u.v?.field?u.d.recast:u.d.jutsu);
const shownReady=(u,j)=>{ const v=u.v; return !!(j&&v&&v.alive&&v.cd===0&&!v.armed&&vChakra[u.side]>=j.cost); };
function drawJ(){
  for(const s of ['p','e']){$('tck'+s.toUpperCase()).style.transform=`scaleX(${Math.min(100,vChakra[s])/100})`; $('ckn'+s.toUpperCase()).textContent='Chakra '+vChakra[s];}
  const b=$('sbar');
  // os botões nascem uma vez por batalha e só mudam de estado depois: assim nenhum clique se perde quando a barra atualiza no meio da ação
  if(b.dataset.t!==String(token)){ b.dataset.t=token; b.innerHTML='';
    U.p.forEach(u=>{const j=shownJutsu(u), w=document.createElement('div'), x=document.createElement('button');
      w.className='skw'; x.className='sk'; x.style.setProperty('--c',u.d.c); x.title=j.name+': '+j.desc;
      const ki=document.createElement('i'); ki.className='ki'; x.appendChild(ki);
      const kp=document.createElement('i'); kp.className='kp'; x.appendChild(kp);
      if(fxIcon(ki,u.id,58)){ x.classList.add('ic'); portrait(kp,u.id,1.0,32,32,'icon'); } else portrait(kp,u.id,2.3,58,58);
      x.insertAdjacentHTML('beforeend',`<span class="cost">${j.cost}</span><span class="cdv"></span>`);
      const lb=document.createElement('span'); lb.className='lb';
      x.onclick=()=>armClick(u);
      w.appendChild(x); w.appendChild(lb); b.appendChild(w); u.sk=x; u.skl=lb; u.skc=x.querySelector('.cdv'); }); }
  U.p.forEach(u=>{const j=shownJutsu(u), x=u.sk, v=u.v; if(!x||!v)return;
    const armed=!!v.armed;
    x.classList.toggle('armed',armed); x.classList.toggle('off',!(armed||shownReady(u,j)));
    x.title=j.name+': '+j.desc; x.querySelector('.cost').textContent=j.cost;
    u.skc.textContent=v.alive&&v.cd>0?v.cd:!v.alive?'✕':'';
    u.skl.textContent=armed?(j.instant?'na fila':'preparado'):j.name; });
}
// campo (Noite de Névoa): efeitos vêm de jutsu.fieldFx do dono do campo (data.js)
function fieldMul(a,basic){ if(!fieldA)return 1; const fx=fieldA.fx, mine=a.side===fieldA.side;
  if(mine)return fx.allyAll?.[a.d.el]||(basic&&fx.ally?.[a.d.el])||1; if(!mine&&fx.foe&&fx.foe[a.d.el])return fx.foe[a.d.el]; return 1;}
const unl=u=>u.solto?u.d.jutsu:null;   // forma solta do Yugami: bônus de dano/esquiva vêm do jutsu (uDmg/uDodge)
function dodgeOf(t){return (t.d.dodge||0)+(unl(t)?unl(t).uDodge||0:0)+(fieldA&&fieldA.owner===t?fieldA.fx.dodge||0:0);}
// campo (regra): liga/desliga e anuncia 'campo'; a tela (telaOn abaixo) troca o cenário, a névoa, o log e a barra
function setField(u,rounds){
  clearField();
  fieldA={side:u.side,rounds,owner:u,fx:u.d.jutsu.fieldFx||{}};
  mostra(u);   // botão do dono troca pro relançamento (vista.field)
  BUS.emit('campo',{on:true,fx:fieldA.fx});
}
telaOn('campo',e=>{
  if(e.on)showFieldScene(e.fx.visual||null);
  else{ $('fog').classList.remove('on'); if(!e.keep)showFieldScene(null);
    if(!e.consumed)log(e.fx.visual==='forge'?'O Plano da Forja se apaga':'O campo de névoa se dissipa'); }
  drawJ(); });
// Status: Resistiu (chance por ninja, RES em data.js); seal = sem jutsu, blind = sem básico, sleep = perde a ação e acorda com dano
const STATUS={seal:{name:'Selado',tag:'S'},blind:{name:'Cego',tag:'C'},sleep:{name:'Sono',tag:'Z'}};
function tryStatus(t){ if(battleRandom()*100<resOf(t)){ BUS.emit('nota',{t,txt:'Resistiu',cls:'info2'}); return false; } return true; }
// texto flutuante que é RESULTADO da regra (Resistiu, Selado, nome do Selo Final): entra na fila e aparece quando a tela chega lá
telaOn('nota',({t,txt,cls})=>fl(t,txt,cls));
const clearStatus=u=>{ u.seal=u.blind=u.sleep=0; };
function clearField(consumed=false,keepForgeScene=false){
  if(!fieldA)return;
  const {owner,fx}=fieldA;
  fieldA=null;
  if(owner.d.recast){
    if(owner.armedSkill===owner.d.recast){ refundJutsu(owner); mostra(owner); }
    if(!consumed)owner.cd=owner.d.recast.cd;
  }
  mostra(owner);
  BUS.emit('campo',{on:false,fx,consumed,keep:keepForgeScene});
}
async function dismissField(){
  if(fieldA?.fx.visual)await transitionField(fieldA.fx.visual,false,clearField);
  else clearField();
}
// apresentação do dano (escuta o evento 'dano' da regra em regra.js): som, texto flutuante, tranco, contador, morte
// lê só o evento e a foto que veio com ele (e.v), nunca a unidade da regra
telaOn('dano',e=>{ const {t,d:r,cls,adv,evt,impact}=e, v=e.v; t.v=v;
  if(e.shHit){ if(v.shield<=0)sfx.sbreak(); else sfx.absorb(); }
  if(cls!=='cost'&&cls!=='dot'&&r>0&&e.hp0-r>0)sfx.voz(t,'dor',.3);
  if(cls==='cost'){
    if(r>0)fl(t,'-'+r+' PV','dot');
    if(t.side==='p'&&e.hp0>=v.max*.25&&v.hp<v.max*.25)sfx.lowhp();
    upd(t); return;
  }
  if(e.woke)fl(t,'Acordou','info2');
  fl(t,r>0?'-'+r:'bloqueou',cls+(adv>0?' adv':adv<0?' dis':''),impact);
  if(adv&&r>0&&(!impact||impact.showElement)){
    fl(t,evt,'elem'+(adv>0?' adv':' dis'),impact?{textX:105,textY:-18,textMs:750}:undefined);
  }
  if(!impact){
    const hs=[t.spr,...(t.gl||[])]; hs.forEach(x=>x.classList.add('hit')); battleAfter(()=>hs.forEach(x=>x.classList.remove('hit')),120);
  }
  if(cls!=='dot')showHits(e.hits,e.side);
  if(t.side==='p'&&v.hp>0&&e.hp0>=v.max*.25&&v.hp<v.max*.25)sfx.lowhp();
  if(e.clone)return;
  if(e.died){ sfx.death(); sfx.voz(t,'queda'); if(t.side==='p'&&U.p.filter(x=>x.v?.alive&&x!==t).length===1)sfx.last(); if(e.wasMark)t.el.classList.remove('mk'); t.vs=null; t.st.className='st'; setAnim(t,'die');
    if(t.off&&t.off.y<0){ t.off.y=0; t.mv.style.transition='transform .35s cubic-bezier(.55,0,.9,.55)'; t.mv.style.transform=`translate(${t.off.x}px,0)`; battleAfter(()=>{t.mv.style.transition='';},420); }   // morreu no ar: cai até o chão em vez de ficar flutuando
  }
  else if(v.alive&&!t.vs)setAnim(t,'hurt');   // t.vs = pose de estado da tela (a regra grava t.state, a tela não lê)
  upd(t); });
telaOn('substitui',({t,clone,hits,side})=>{ sceneAdd(clone); dust(t,8); fl(t,t.d.passive,'info2'); log(nm(t)+' usa <b>Substituição</b>'); showHits(hits,side); });
// clones: a regra cria/some (state.js); a tela monta e anima quando tocar
telaOn('nasce',({c})=>{ mountUnit(c); ACT.push(c); setAnim(c,'birth'); sceneAdd(c); });
telaOn('some',({c,wasMark})=>{
  c.vs=null; c.st.className='st'; if(wasMark)c.el.classList.remove('mk');
  setAnim(c,'vanish',0,true); dust(c,8);
  const battle=U;
  battleAfter(()=>{ c.el.remove(); if(U===battle)ACT=ACT.filter(u=>u!==c); },animMs(c,'vanish')/speed);
});
function pick(u,mode,isJ){
  const fs=foes(u); if(!fs.length)return null;
  if(mode==='random')return fs[Math.floor(battleRandom()*fs.length)];
  if(mode==='mark')return mark?.alive&&mark.side!==u.side?mark:fs[Math.floor(battleRandom()*fs.length)];   // perseguição por combo que encadeia: alvo marcado, senão aleatório
  // inimigo marcado (clique) só vale pros jutsus do jogador sem restrição de alvo
  if(isJ&&u.side==='p'&&mark&&mark.alive&&(mode==='front'||mode==='row'))return mark;
  if(mode==='weak')return fs.reduce((a,b)=>b.hp<a.hp?b:a);
  for(const r of [0,1,2].sort((a,b)=>Math.abs(a-u.row)-Math.abs(b-u.row))){
    const c=fs.filter(x=>x.row===r).sort((a,b)=>a.depth-b.depth); if(c.length)return c[0]; }
  return fs[0];
}
// ───────── AÇÃO = a regra resolve tudo de uma vez + a tela toca o roteiro (fatia 3b) ─────────
// resolve*(…) é só REGRA: síncrona, sem espera. Sorteia, aplica dano/estado/efeito na ordem de sempre (o battleRandom e o hash
// não mudam) e devolve o ROTEIRO: o que aconteceu, com as marcas da FILA (tocador.js) de cada acerto.
// toca*(R) é só TELA: anima lendo o roteiro, a cópia da HUD (u.v) e a pose (t.vs); no contato chama tocaAte(marca).
// A tela nunca lê t.alive/t.state/hp da regra: quando ela toca, a regra já está no FIM da ação.
// abriu perseguição: grava o estado (imune não grava nem anuncia, como o smash fazia), fixa quem vai combar (antes de gastar as
// perseguições), resolve a cadeia inteira e levanta o alvo. openJ undefined = não mexe no chainOpenJ (Dragão do Kaen e Kazan: como antes)
function resolveKo(R,u,t,cause,openJ){
  if(!t.d.immuneState)poeEstado(t,cause);
  if(openJ!==undefined)chainOpenJ=openJ;
  R.cmb=comboPlan(u.side,t.state); R.chain=resolveChain(u.side,t,1);
  R.levanta=t.alive; if(t.alive)soltaEstado(t);
}
async function tocaKo(R,u,t){
  comboShowList(u,t,R.cmb); await tocaChain(R.chain,u);
  if(R.levanta){ await sleep(140); poseEstado(t,null); t.el.style.zIndex=t.z; }
}
// Combo em sequência (Keshin): golpes em cadeia; morreu o alvo, escolhe outro e se aproxima de novo
function resolveSequence(u,sk){
  const extra=u.power?.bonusHits[Math.min(round-u.power.start,u.power.bonusHits.length-1)]||0;
  const last=sk.sequence.length-1, total=sk.sequence.length+extra;
  const R={kind:'sequence',u,sk,steps:[],damage:0,hits:0};
  let t=null, dodged=false;
  for(let i=0;i<total;i++){
    const novo=!t?.alive;
    if(novo){ t=pick(u,sk.target,false); if(!t)break; dodged=!t.stunned&&!t.state&&battleRandom()*100<dodgeOf(t); }
    const finisher=i===total-1, part=finisher?last:i%last;
    const st={t,novo,finisher,part,an:sk.sequence[part],dodged}; R.steps.push(st);
    if(dodged)break;
    st.dealt=landHit(u,t,sk.mult,true,''); st.n=marca();
    if(st.dealt!==null){ R.damage+=st.dealt; R.hits++; }
    if(result()){ st.fim=true; break; }
    if(finisher&&st.dealt!==null&&t.alive&&sk.cause){ st.launch=true; R.t=t; resolveKo(R,u,t,sk.cause,false); break; }
  }
  return R;
}
async function tocaSequence(R){
  const {u,sk}=R; let t=null;
  for(const st of R.steps){
    await gate();
    if(st.novo){ t=st.t; await dashTo(u,t); }
    const ms=animMs(u,st.an), impact=ms*sk.hits[st.part];
    sfx.swing(); setAnim(u,st.an,0,true); await sleep(impact);
    if(st.dodged){ await evade(t); log(`${nm(t)} desvia de <b>${sk.name}</b>`); break; }
    strikeFx(u,t,sk.contactY?.[st.part]??-75,st.finisher);
    sfx.hit(u,'atk'); if(st===R.steps[0])sfx.voz(u,'golpe',.6);
    tocaAte(st.n);
    if(st.dealt!==null)strikeRecoil(t,u.side==='p'?1:-1,st.finisher);
    if(st.fim){ await finale(t); break; }
    if(st.finisher){
      shake(.65);
      if(st.launch){ await smash(u,t,sk.cause); break; }
      sfx.heavy();
    }
    // Troca parte da recuperação pela pausa no contato, mantendo o ritmo do combo.
    const stop=st.finisher?70:48;
    await hitstop(stop); await sleep(Math.max(0,ms-impact+28-stop));
  }
  if(R.hits)log(`${nm(u)} usa <b>${sk.name}</b> (${R.hits} golpes): ${R.damage} de dano`);
  home(u);
  if(R.chain)await tocaKo(R,u,R.t);
  await sleep(160);
}
// Golpes do Kaen com contato no quadro (KAEN_STRIKES): regra em laço fixo, a tela toca cada contato no quadro dele
function resolveContato(R){
  const {u,main:t,sk,dodged,contacts}=R, basic=sk===u.d.normal;
  R.damage=0; R.hits=0;
  R.plan=contacts.map(contact=>{
    if(dodged||!t.alive)return null;
    const dealt=landHit(u,t,sk.mult/contacts.length,basic,'',false,undefined,{...contact,showElement:R.damage===0});
    R.hits++; if(dealt!==null)R.damage+=dealt;
    return {dealt,n:marca()}; });
}
async function playContactStrike(R){
  const {u,main:t,sk,an,contacts,dodged,plan}=R;
  const basic=sk===u.d.normal, dir=u.side==='p'?1:-1, anim=an_of(u)[an];
  const onFrame=new Map();
  function at(frame,action){
    if(!onFrame.has(frame))onFrame.set(frame,[]);
    onFrame.get(frame).push(action);
  }
  let dodge, shown=0;
  contacts.forEach((contact,i)=>{
    for(const effect of contact.effects){
      if(!dodged||effect.arc)at(effect.frame,()=>{if(t.v?.alive||effect.arc)contactFx(u,effect);});
    }
    at(contact.frame,()=>{
      if(dodged){dodge||=evade(t,true).then(()=>null,error=>({error}));return;}
      const r=plan[i]; if(!r)return;
      tocaAte(r.n);
      if(!shown++)sfx.voz(u,'golpe',basic?.3:.7);
      sfx.hit(u,basic?'atk':sk.customSfx===false?'':'forte');
      if(r.dealt!==null){
        if(t.v?.alive)t.st.animate([
          {translate:`${dir*contact.recoil}px 0`,scale:contact.squash?'1.12 .9':'1'},
          {translate:'0 0',scale:'1'},
        ],{duration:(contact.squash?240:135)/speed,easing:'ease-out'});
        hitstop(contact.stop).catch(error=>{if(error!==ABORT)console.error(error);});
      }
    });
  });
  sfx.swing();
  await dashTo(u,t);
  setAnim(u,an,0,true);
  u.onFrame=frame=>onFrame.get(frame)?.forEach(action=>action());
  try{
    await sleep(animMs(u,an));
    while(u.af<seqN(anim)-1||frozen)await sleep(16);
    const failedDodge=dodge&&await dodge;
    if(failedDodge)throw failedDodge.error;
  }finally{ delete u.onFrame; const n=plan.reduce((m,r)=>r?r.n:m,0); tocaAte(n); }   // contato que o quadro não tocou aparece aqui
  if(dodged)log(`${nm(t)} desvia de <b>${sk.name}</b>`);
  else log(`${nm(u)} usa <b>${sk.name}</b>${R.hits>1?` (${R.hits} golpes)`:''}: ${R.damage} de dano`);
  endCine();
  home(u);
  await sleep(160);
}
// golpe comum (básico, Forte, jutsu de alvo/área, perseguição por combo); os três especiais do Kaen saem daqui pro roteiro próprio
function resolveGolpe(u,sk,isJ){
  const main=pick(u,sk.target,isJ); if(!main)return null;
  const area=sk.target==='row'||sk.target==='all';
  // split (Doku): chance do frasco se multiplicar no ar e cair em TODOS os inimigos, mesmo dano, como o Tsunami (todos aparecem e ficam marcados)
  const split=!isJ&&sk.split&&foes(u).length>1&&battleRandom()<sk.split;
  const ts=split?foes(u):sk.target==='row'?foes(u).filter(x=>x.row===main.row):sk.target==='all'?foes(u):sk.n>1?randomFoes(u,main,sk.n):[main];
  const combo=!!sk.at;   // perseguição por combo: não é desviável, marca os alvos e mostra a legenda lateral
  // esquiva: só golpe de alvo único (básico ou jutsu de um alvo); paralisado não desvia
  const canDodge=t=>!t.stunned&&!t.state&&battleRandom()*100<dodgeOf(t);
  const dodged=!split&&(sk.target==='front'||sk.target==='weak')&&canDodge(main);
  // ataque básico em área (Rajada Leve): cada alvo testa a esquiva; jutsu de todos não é desviável
  const dodgedSet=new Set(sk.target==='all'&&!isJ&&!combo?ts.filter(t=>!t.owner&&canDodge(t)):[]);
  const R={kind:'golpe',u,sk,isJ,main,area,split,ts,combo,dodged,dodgedSet};
  if(isJ&&u.id==='kaen'&&sk===u.d.jutsu){ R.kind='dragao'; resolveDragao(R); return R; }
  if(u.id==='kaen'&&sk===u.d.combo){ R.kind='chuva'; resolveChuva(R); return R; }
  if(u.id==='kaen'&&(sk===u.d.normal||sk===u.d.strong)){ R.kind='contato'; R.an=sk.an||'atk1'; R.contacts=KAEN_STRIKES[R.an]; resolveContato(R); return R; }
  const nh=(sk.hits||[0]).length, connected=new Set();
  R.rounds=[]; R.tot=0; R.connected=connected;
  if(!dodged){
    for(let k=0;k<nh;k++){   // cada soco do golpe causa a sua parte do dano
      if(k&&!ts.some(t=>t.alive&&!dodgedSet.has(t)))break;
      R.rounds.push(ts.map(t=>{ if(dodgedSet.has(t)||!t.alive)return null;
        const dealt=landHit(u,t,sk.mult/nh,sk===u.d.normal,isJ?'big':combo?'chase':'',area||split);
        if(dealt!==null){ R.tot+=dealt; connected.add(t); }
        return {t,dealt,n:marca()}; }));
    }
    connected.forEach(t=>{ if(!t.alive)return;
      if(sk.dot&&tryStatus(t))t.dot={dmg:Math.round(u.atk*sk.dot.mult),rounds:sk.dot.rounds+(fieldA&&u.side===fieldA.side&&fieldA.fx.dot?fieldA.fx.dot[u.d.el]||0:0),el:u.d.el}; if(sk.stun&&(t===main||sk.stun==='all')&&tryStatus(t))t.stunned=true;
      if(sk.instakill&&t.alive){ BUS.emit('nota',{t,txt:sk.name+'!',cls:'state'}); hurt(t,t.hp,'big',{pierce:true}); }   // Selo Final: derruba o alvo, ignora escudo
      if(sk.status)for(const [k,n] of Object.entries(sk.status))if(tryStatus(t)){ t[k]=Math.max(t[k]||0,n); BUS.emit('nota',{t,txt:STATUS[k].name,cls:'state'}); }   // seal / blind / sleep (rodadas = ações do alvo)
      mostra(t); });
    R.nEfeito=marca();
    if(sk.dispel&&fieldA){ R.campo=fieldA.fx.visual||null; clearField(); R.nCampo=marca(); }
    R.fim=!!result();
  }
  const stateHit=connected.has(main)&&sk.cause&&main.alive;
  R.guard=stateHit&&main.d.immuneState;
  R.ko=stateHit&&!main.d.immuneState;
  if(R.ko)resolveKo(R,u,main,sk.cause,isJ);
  return R;
}
async function tocaGolpe(R){
  const {u,sk,isJ,main,area,split,ts,combo,dodged,dodgedSet}=R, dir=u.side==='p'?1:-1;
  if(R.kind==='dragao'){ await kaenDragonJutsu(R); return; }
  if(R.kind==='chuva'){ await kaenRainCombo(R); return; }
  if(isJ)await cine(u,sk,ts); else if(sk===u.d.strong||combo)skTag(u,sk.name);
  if(R.kind==='contato'){ await playContactStrike(R); return; }
  if(combo){ sceneOn([u,...ts]); markTargets(ts); }
  if(split){ sceneOn([u,...ts]); markTargets(ts); ink(sk.splitName||'MULTIPLICOU!'); }
  let an, hit; const H=sk.hits||[0], nh=H.length, HA=(u,a)=>sk.hits?Math.max(120,H[0]*animMs(u,a)):hitAt(u,a);   // sk.hits: momentos (fração da anim) de cada soco; o dano se divide entre eles
  const adv=area&&!(sk.ranged&&!isJ);   // área à distância fica parada
  if(adv){an=sk.an||'atk3'; u.el.style.zIndex=60; u.mv.style.transform=`translate(${dir*82}px,0)`; setAnim(u,an,0,true); await sleep(hit=HA(u,an));}
  else if(sk.ranged&&!isJ){an=sk.an||(sk.target==='all'?'atk1':'atk2'); setAnim(u,an,0,true); sfx.shoot(u); await sleep(hit=HA(u,an)*.9); if(split||combo&&ts.length>1){await shootSplit(u,ts); hit+=480;} else{await shoot(u,main); hit+=190;}}
  else if(isJ&&sk.cast){an=sk.an||'atk2'; u.el.style.zIndex=60; u.mv.style.transform=`translate(${dir*40}px,0)`; setAnim(u,an,0,true); await sleep(hit=HA(u,an));}   // invoca de onde está (ex.: Prisão de Gelo): só um passo à frente
  else{an=sk.an||(isJ?'atk3':'atk1'); sfx.swing(); await dashTo(u,main); setAnim(u,an,0,true); await sleep(hit=HA(u,an));}
  if(isJ){sfx.jutsu(u); sfx.voz(u,'jutsu'); (sk.wave?soundWave:elFx)(u,ts); if(!sk.wave)jutsuFx(u,ts);} else sfx.voz(u,'golpe',sk===u.d.strong?.7:.3);   // jutsu de onda (Poko): anéis em código no lugar das partículas do elemento
  for(const t of dodgedSet)evade(t).catch(error=>{if(error!==ABORT)console.error(error);});
  if(dodged){ await evade(main); log(`${nm(main)} desvia de <b>${sk.name}</b>`); }
  else{
    for(let k=0;k<nh;k++){   // cada soco do golpe toca a sua parte, com faísca e hit-stop próprios
      if(k){ const w=Math.max(70,(H[k]-H[k-1])*animMs(u,an)); await sleep(w); hit+=w; if(k>=R.rounds.length)break; }
      R.rounds[k].forEach(r=>{ if(!r)return; const t=r.t;
        if(!(isJ&&sk.wave))fxAt(u,k?'hit':isJ?'jutsu':'hit',t,k?.7:isJ?1.3:sk.target==='all'?.7:.85); fxAt(u,'imp',t,.55,-8);
        tocaAte(r.n); if(r.dealt!==null)spark(t,u.d.c,isJ?10:6); });
      if(nh>1&&k<nh-1)sfx.hit(); }
    tocaAte(R.nEfeito);
    if(sk.dot)sfx.apply(u.d.el==='Fogo'?'burn':'poison'); if(sk.stun)sfx.apply(u.d.el==='Gelo'?'freeze':'stun');
    if(R.campo!==undefined){ if(R.campo)await transitionField(R.campo,false,()=>tocaAte(R.nCampo)); else tocaAte(R.nCampo); }
    if(isJ){shake();flash();sfx.heavy();sfx.impact(u);}else sfx.hit(u,sk===u.d.normal?'atk':sk===u.d.strong?'forte':'');
    log(`${nm(u)} ${isJ?'solta':'usa'} <b>${sk.name}</b>${combo?` (combo ${sk.at})`:''}${nh>1?` (${nh} golpes)`:''}: ${R.tot} de dano`,combo?'x':undefined);
    if(combo&&R.connected.size)comboLine(sk.name,1,u.id,u.side);
    if(R.fim)await finale(main); }
  if(R.guard)kazanGuard(main);
  if(R.ko){ endCine(); await smash(u,main,sk.cause); } else if(!dodged)await hitstop(isJ?70:25);
  // sem duração fixa: espera o resto da anim do atacante e, no jutsu, o efeito acabar
  if(R.ko)await sleep(60); else{ await sleep(Math.max(isJ?0:200, animMs(u,an)-hit)); if(isJ)await fxWait(420,1400); }   // abriu combo: a perseguição começa já (antes esperava ~650ms o resto da anim do atacante)
  endCine(); home(u);
  if(R.ko)await tocaKo(R,u,main);
  await sleep(160);
}
// jutsus sem alvo inimigo (invocação, aura, lacre, campo, cura/escudo): regra curta + cena
function resolveAcao(u,sk,isJ){
  if(u.d.stationary)return resolveKazan(u,sk);
  if(sk.sequence)return resolveSequence(u,sk);
  if(sk.clones)return {kind:'clones',u,sk,group:summonClones(u,sk),n:marca()};
  if(sk.aura){
    const paid=hurt(u,Math.min(u.hp-1,Math.round(u.max*sk.lifeCost)),'cost',{pierce:true});
    u.power={...sk.aura,start:u.power?.start??round,end:round+sk.aura.rounds};
    mostra(u); return {kind:'aura',u,sk,paid,n:marca()};
  }
  if(sk.unleash){ const was=u.solto; u.sR=sk.unleash; if(!was)u.solto=true; return {kind:'unleash',u,sk,isJ,was}; }   // Lacre Rompido (Yugami): forma solta por N rodadas
  if(sk.field){ setField(u,sk.field); return {kind:'field',u,sk,n:marca()}; }
  if(sk.target==='allies'){
    const al=team(u.side).filter(a=>a.alive), R={kind:'allies',u,sk,isJ,al,recs:[]};
    for(const a of al){ const r={a};
      if(sk.heal){ r.h=Math.round(u.atk*sk.heal); a.hp=Math.min(a.max,a.hp+r.h); }
      if(sk.shield){ a.shield=Math.max(a.shield,Math.round(u.atk*sk.shield)); a.shM=a.shield; a.shR=2; }
      mostra(a); r.n=marca(); R.recs.push(r); }
    return R;
  }
  return resolveGolpe(u,sk,isJ);
}
async function tocaAcao(A){
  if(!A)return;
  const {u,sk}=A;
  switch(A.kind){
    case 'kazan': await kazanSkill(A); return;
    case 'sequence': await tocaSequence(A); return;
    case 'clones':{
      await cine(u,sk,[u]); setAnim(u,'atk2',0,true);
      const hit=hitAt(u,'atk2'); await sleep(hit); sfx.jutsu(u); sfx.voz(u,'jutsu');
      tocaAte(A.n);   // os clones nascem aqui
      jutsuFx(u,A.group); A.group.forEach(c=>fxAt(u,'jutsu',c,1.05,15));
      log(nm(u)+' usa <b>'+sk.name+'</b> ('+A.group.length+' clones)');
      await sleep(animMs(u,'atk2')-hit); home(u); return; }
    case 'aura':
      await cine(u,sk,[u]); setAnim(u,'atk2',0,true);
      await sleep(hitAt(u,'atk2'));
      tocaAte(A.n); sfx.jutsu(u); sfx.voz(u,'jutsu');
      fxAt(u,'jutsu',u,1.16,12); auraBurst(u); flashSoft();
      fl(u,sk.name,'shieldf');
      log(`${nm(u)} ativa <b>${sk.name}</b> e gasta ${A.paid} PV`);
      await sleep(animMs(u,'atk2')-hitAt(u,'atk2')); home(u); return;
    case 'unleash':   // tira o capuz: troca pro atlas solto + distorção em código
      if(A.isJ&&!A.was){await cine(u,sk,[u]); sfx.jutsu(u);}   // sem kiai: o som do lacre quebrando com glitch já diz tudo
      if(!A.was){ setForm(u,true); setAnim(u,'unhood'); fxAt(u,'jutsu',u,1.3); fl(u,'capuz solto','shieldf'); const p=pos(u);
        em(22,i=>{const g=i/22*6.28; return prt(p.x,p.y-30,Math.cos(g)*10,Math.sin(g)*6,Math.cos(g)*1.8,Math.sin(g)*1.4,0,R(14,22),4,0,pk(PAL['Espaço']));}); }
      log(`${nm(u)} usa <b>${sk.name}</b>: +${Math.round((sk.uDmg||0)*100)}% de dano e +${sk.uDodge||0}% de esquiva por ${sk.unleash} rodadas`);
      await sleep(Math.max(700,animMs(u,'unhood'))); setAnim(u,'idle'); return;
    case 'field':
      skTag(u,sk.name); setAnim(u,'cast',0,true);
      sfx.cast(u); fxAt(u,'aura',u,1.04);
      await sleep(animMs(u,'cast')*.65);
      sfx.jutsu(u);
      await transitionField(sk.fieldFx.visual,true,()=>tocaAte(A.n));
      log(`${nm(u)} usa <b>${sk.name}</b> por ${sk.field} rodadas`);
      setAnim(u,'idle'); return;
    case 'allies':
      if(A.isJ){await cine(u,sk,A.al); sfx.jutsu(u);}   // cura/escudo/campo: sem kiai (o grito ficava sem sentido, ex.: Iwao gemendo ao erguer o Gigante)
      setAnim(u,'cast');
      A.recs.forEach(({a,h,n})=>{ const p=pos(a); fxAt(u,'jutsu',a,1.1);
        if(sk.heal){sfx.heal(); healRain(a); fl(a,'+'+h,'heal'); em(12,()=>prt(p.x,p.y,R(-14,14),-R(0,40),0,R(-1.6,-.6),0,R(24,40),R(3,5),0,pk(['#7dffa6','#ffffff','#3fd07a'])));}
        if(sk.shield){sfx.shield(); stoneWall(a); kitBuff(a); fl(a,'escudo','shieldf'); em(18,i=>{const g=i/18*6.28;return prt(p.x,p.y,Math.cos(g)*8,-28+Math.sin(g)*8,Math.cos(g)*1.6,Math.sin(g)*1.6,0,R(14,20),4,0,pk(['#8fd0ff','#ffffff']));});}
        tocaAte(n); });
      log(`${nm(u)} usa <b>${sk.name}</b>`); await sleep(Math.max(650,animMs(u,'cast'))); setAnim(u,'idle'); return;
    default: await tocaGolpe(A);
  }
}
async function doSkill(u,sk,isJ){
  BUS.emit('acao',{u,sk,isJ});   // vez do ninja (regra.js)
  const battleToken=token;
  curSide=u.side;
  const R=adianta(()=>resolveAcao(u,sk,isJ));   // REGRA: a ação inteira, já (perseguições e efeitos inclusos)
  try{ await tocaAcao(R); }                     // TELA: toca o roteiro
  finally{ if(battleToken===token){ tocaTudo(); endCine(); sceneOff(); } }
}
// quem vai entrar na perseguição, na ordem (mesma regra do chain: on do próximo = cause do anterior, sem repetir)
function comboPlan(side,state){ const seen=new Set(), out=[]; let s=state;
  const units=byFormationCell(team(side));
  for(;;){ const c=units.find(x=>!seen.has(x)&&canChase(x,s)); if(!c)break; seen.add(c); out.push(c); s=c.d.chase.cause; }
  return out; }
// Perseguição por combo (Onda 6): quando o 'N Hit' do time (hitsR, zera por rodada) chega à faixa `combo.at`, o ninja dispara
// logo após a ação atual. Cada uma vale 1x/rodada (comboUsed, separada da perseguição por estado), na ordem das casas;
// os hits dela contam no contador e podem abrir a próxima faixa (cascata 10→20→30). Paralisado não dispara.
const comboOn=u=>!!u.d.combo&&(!u.d.combo.star||dev);   // sem sistema de estrelas ainda: as de estrela só ligam no Modo dev
const canCombo=u=>u.alive&&!u.comboUsed&&!u.stunned&&comboOn(u)&&hitsR[u.side]>=u.d.combo.at;
function comboReady(){ for(const side of curSide==='e'?['e','p']:['p','e']){ const c=byFormationCell(team(side)).find(canCombo); if(c)return c; } return null; }
function randomFoes(u,main,n){ const rest=foes(u).filter(x=>x!==main), out=[main];
  while(out.length<n&&rest.length)out.push(rest.splice(Math.floor(battleRandom()*rest.length),1)[0]);
  return out; }
async function comboReactions(){
  for(let c=comboReady(); c; c=comboReady()){
    await gate(); if(result())return;
    const cc=c.d.combo; c.comboUsed=true;
    sfx.chaseGo(); fl(c,`Combo ${cc.at}!`,'chasec');
    await doSkill(c,cc.use?c.d[cc.use]:cc,false);
  }
}
// no começo do combo já destaca TODOS que vão combar (estilo NO), não só quem começa; a lista vem do roteiro (comboPlan na regra)
function comboShowList(u,t,pl){ if(!pl?.length)return;
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
// palmas dos clones (Rajada Fantasma do Utsushi). REGRA em laço fixo, na ordem dos clones: antes a ordem dos acertos dependia do
// relógio (mudava com a velocidade). Quem acha o alvo já caído não ataca.
function resolveVolley(owner,target){
  const out=[];
  for(const clone of livingClones(owner)){
    if(!target.alive)break;
    const dealt=landHit(clone,target,owner.d.chase.cloneHit,false,'chase');
    out.push({clone,dealt,n:marca()});
  }
  return out;
}
// TELA: cada clone arma a palma em paralelo (escalonados em 90 ms); antes era um por vez e a repulsão do alvo esperava a fila toda (~2 s)
async function cloneVolley(owner,target,plan){
  const dir=owner.side==='p'?1:-1;
  const one=async({clone,dealt,n},delay)=>{
    await sleep(delay);
    const palm=3, step=1000/an_of(clone).atk1[4];
    sceneAdd(clone); setAnim(clone,'atk1');
    await sleep(palm*step);
    setAnim(clone,'atk1',palm);
    const from=spritePoint(clone,[160,81]), to=airTorso(target);
    const travel=Math.max(115,Math.min(230,Math.hypot(to.x-from.x,to.y-from.y)*.36));
    const proj=FXUSE[owner.id].proj, frames=FXA[owner.id].a[proj][1];
    fxSpr(owner.id,proj,{...from,to,dir,flip:dir<0,sc:.51,fps:1000*frames/travel,linear:true});
    await sleep(travel);
    tocaAte(n);   // contato: número, som e barra desta palma
    if(dealt===null)return;
    chaseContact(to,owner.d.c,6);
  };
  try{ await Promise.all(plan.map((p,i)=>one(p,i*90))); }
  finally{ if(plan.length)tocaAte(plan[plan.length-1].n); }
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
async function finishWindKick(c,t,put,dir,aim,P){
  const {phases:[,strike,land],kick}=c.d.chase;
  const {ground,dx,step}=aim, h=pos(c);
  await hitstop(65);
  const ms=animMs(c,strike)-step*kick.frame;
  put(c,ground.x+dx-h.x-dir*65,ground.y-h.y,`transform ${ms/speed}ms cubic-bezier(.35,0,.85,.7)`);
  const volley=P.connected?cloneVolley(c,t,P.volley):Promise.resolve();   // as palmas saem já durante a queda do chute
  await sleep(ms);
  c.mv.style.transition='';
  setAnim(c,land);
  const landing=sleep(animMs(c,land));
  await volley;
  // a repulsão sai assim que a última palma acerta; o pouso do Utsushi termina em paralelo (antes a repulsão esperava o pouso inteiro, ~0,5 s a mais)
  if(P.s)await knock(t,P.s);
  await landing;
  if(P.fim)await finale(t);
}
async function landKeshinKick(c,t,put,dir,aim,P){
  const {phases:[,slam,land],kick}=c.d.chase;
  const {ground,dx,step}=aim, home=pos(c), x=ground.x+dx;
  await hitstop(80);
  const ms=step*(kick.landing-kick.frame);
  const fall=`transform ${ms/speed}ms cubic-bezier(.55,0,.9,.55)`;
  const hitBody=P.connected&&(t.v?.alive||!t.owner);
  if(hitBody)put(t,dx,0,fall);
  put(c,x-dir*38-home.x,ground.y-home.y,fall);
  speedLines('D');
  await sleep(ms);
  setAnim(c,slam,kick.landing,true);
  c.mv.style.transition='';
  if(hitBody){
    t.off={x:dx,y:0}; t.mv.style.transition='';
    if(P.s){ poseEstado(t,P.s); fl(t,ST[P.s]+'!','state'); sfx.knock(P.s); }
    slamFx(t,c.d.c); crack(x,ground.y); shake(1.15); sfx.thud();
  }
  if(P.fim)await finale(t);
  await sleep(animMs(c,slam)-step*kick.landing);
  setAnim(c,land,0,true); await sleep(animMs(c,land));
}
// ── perseguição: REGRA resolve a cadeia inteira (passo a passo, na ordem de sempre); a TELA toca passo a passo ──
// passo = o que chaseStart devolve + o que aconteceu: hitsR (acertos no alvo), tsR (Tsunami nos outros), volley (palmas), d, connected, s, next, fim
function resolveChain(side,t,count){
  const steps=[];
  for(;;){
    const P=chaseStart(side,t,count);
    if(!P)break;
    count=P.n; P.side=side;
    P.acad=acadCheck(side,count); if(side==='p')maxCombo=Math.max(maxCombo,count);
    const CH=P.c.d.chase;
    chaseTsunami(P);
    let d=0, connected=false;
    P.hitsR=[];
    for(let k=0;k<P.hits.length&&t.alive;k++){
      const dealt=landHit(P.c,t,P.mult/P.hits.length,false,'chase',P.tsu);
      P.hitsR.push({dealt,n:marca()}); if(dealt!==null){connected=true; d+=dealt;}
    }
    P.tsR=P.alvos.map(o=>{ if(o===t||!o.alive)return null; landHit(P.c,o,P.tsMult,false,'chase',true); return {o,n:marca()}; });
    P.volley=CH.kick&&CH.cloneHit&&connected?resolveVolley(P.c,t):[];
    for(const v of P.volley)if(v.dealt!==null)d+=v.dealt;
    chaseOutcome(P,connected);   // decide o estado e se o combo segue
    if(P.s)poeEstado(t,P.s); else if(P.s===null)soltaEstado(t);
    P.d=d; P.fim=!!result();
    steps.push(P);
    if(!P.next)break;
  }
  return steps;
}
async function tocaChain(steps,src){ for(let i=0;i<steps.length;i++)await tocaPasso(steps[i],i?null:src); }
// compatibilidade (diretor do beta): resolve e toca uma perseguição a partir do estado atual do alvo
async function chain(side,t,count,src){ await tocaChain(adianta(()=>resolveChain(side,t,count)),src); }
async function tocaPasso(P,src){
  const c=P.c, t=P.t, side=P.side, count=P.n;
  if(!scene.on)sceneOn([src,t].filter(Boolean)); sceneAdd(c); sceneAdd(t); t.el.classList.add('tgt');   // perseguição também é cena isolada; quem entra fica visível e o alvo fica marcado
  if(P.acad)ink('DESAFIO CONCLUÍDO!');
  sfx.chaseGo(); sfx.voz(c,'golpe',.6);
  const CH=c.d.chase, cause=P.cause, an=an_of(c).chase?'chase':{R:'atk3',V:'atk2',L:'atk1',D:'atk1'}[cause];
  const CHA=(u,a)=>CH.hits?Math.max(120,CH.hits[0]*animMs(u,a)):hitAt(u,a);
  const air=!!an_of(c).rise&&CH.on==='V';   // CH.on = estado em que a regra pegou o alvo (chaseStart)
  const dir=side==='p'?1:-1, h0=pos(c), tb=cur(t);
  const put=(u,x,y,tr)=>{u.mv.style.transition=tr||''; u.mv.style.transform=`translate(${x}px,${y}px)`;};
  let kickAim;
  if(CH.kick)kickAim=await aimChaseKick(c,t,put,dir);
  else if(air){
    setAnim(c,'rise',0,true); sfx.swing(); c.el.style.zIndex=60;
    const riseMs=animMs(c,'rise');
    { const f=sockOf(c,'feet'); kitAdd({sheet:'im',row:3,fps:12,sc:.6,x:f.x,y:f.y+2,ay:GFXA.impacto[3]}); sfx.thud(); }   // arranca do chão: poeira deitada no plano
    put(c,tb.x-dir*105-h0.x,Math.max(180,tb.y-76)-h0.y,`transform ${riseMs/speed}ms cubic-bezier(.08,.9,.3,1)`);   // explosivo: sobe até o inimigo no ar
    await sleep(riseMs);
    setAnim(c,'meteor',0,true); speedLines('D');
    const contactMs=animMs(c,'meteor')*.9;   // último quadro: pé estendido, antes das chamas cortadas
    put(c,tb.x-dir*54-h0.x,tb.y-52-h0.y,`transform ${contactMs/speed}ms cubic-bezier(.65,0,1,.45)`);   // mergulho com vontade
    await sleep(contactMs);
    setAnim(c,'meteor',seqN(an_of(c).meteor)-1,true);   // garante a pose do contato mesmo com queda de FPS
  }else if(CH.mv==='slam'){   // salta alto por cima do alvo e despenca nele
    // a anim do golpe começa JÁ no salto: ele sobe, segura no alto e despenca de modo que o pouso caia exatamente no quadro do soco
    const hitT=Math.max(430,CHA(c,an)); setAnim(c,an,0,true); sfx.swing(); c.el.style.zIndex=60;
    put(c,tb.x-dir*70-h0.x,tb.y-190-h0.y,`transform ${300/speed}ms cubic-bezier(.2,.9,.35,1)`); await sleep(hitT-130);
    put(c,tb.x-dir*64-h0.x,tb.y+2-h0.y,`transform ${130/speed}ms cubic-bezier(.6,0,1,.6)`); await sleep(130);
    dust(c,14); shake(); sfx.thud();   // pouso = soco: poeira, tremor, som e (logo abaixo) o dano no mesmo instante
  }else if(CH.cast){   // invocador (Onda da Mizuha): chega só até uma distância segura, faz o selo/jutsu e a magia surge no alvo (nada de ir socar)
    const ja=an_of(c).atk2?'atk2':an, gx=tb.x-dir*250*(c.d.size||1);
    if((gx-(h0.x+c.off.x))*dir>30){ sfx.swing(); put(c,gx-h0.x,tb.y-h0.y,'transform .26s cubic-bezier(.2,.8,.3,1)'); await sleep(260); }
    setAnim(c,ja,0,true); sfx.cast(c); await sleep(Math.min(420,hitAt(c,ja)*.7));
  }else if(CH.ranged){ sfx.swing(); setAnim(c,an,0,true); await sleep(CHA(c,an)); await shoot(c,t); }   // fica parado, o enxame voa até o alvo
  else{ sfx.swing(); await dashTo(c,t); setAnim(c,an,0,true); await sleep(CHA(c,an)); }
  const tsu=P.tsu, tsFoes=P.alvos;
  if(tsu){ ink('TSUNAMI!'); sfx.heavy(); shake(.6);   // parede de água desenhada em código: brota do chão, sobe, avança e desaba no time inteiro
    tsFoes.forEach(o=>{ sceneAdd(o); o.el.classList.add('tgt'); o.el.style.zIndex=55; });   // todo mundo que vai levar o golpe aparece e fica marcado; z 55 = ABAIXO do canvas de efeitos (#fxc, 66): a onda passa por cima deles
    const W=tsunamiFx(dir); for(let n=0;!W.hit&&n<90;n++){ await gate(); await sleep(30); }   // espera a crista bater (respeita pausa/velocidade; teto de segurança)
    sfx.heavy(); shake(1.3); flashSoft(); }
  else if(CH.surge){   // Onda normal: onda de água em código que brota embaixo do alvo, cresce, curva e quebra em cima dele (sprite de respingo só como complemento no impacto)
    const p=cur(t), W=waveFx({dir,x:p.x,y:p.y}); for(let n=0;!W.hit&&n<70;n++){ await gate(); await sleep(30); }
    fxAt(c,'hit',t,1.1,-20); sfx.heavy(); }
  sfx.chase(c);
  if(!kickAim){ spark(t,c.d.c,10); if(!air&&!CH.surge)fxAt(c,'chase',t,1.25); fxAt(c,'imp',t,.6,-8); }
  const ch=P.hits;
  fl(t,ST[CH.on],'state');   // etiqueta do estado em que o alvo foi pego
  for(let k=0;k<P.hitsR.length;k++){ if(k){ await sleep(Math.max(70,(ch[k]-ch[k-1])*animMs(c,an))); fxAt(c,'imp',t,.6,-8); spark(t,c.d.c,6); sfx.hit();}
    tocaAte(P.hitsR[k].n); }
  if(tsu){ tsFoes.forEach((o,i)=>{ const r=P.tsR[i]; if(!r)return; fxAt(c,'hit',o,1.2,-10); fxAt(c,'imp',o,.6,-8); spark(o,c.d.c,10); tocaAte(r.n);
      if(o.v?.alive&&!o.d.stationary){ const of=o.off||{x:0,y:0}; o.mv.style.transition='transform .16s ease-out'; o.mv.style.transform=`translate(${of.x+dir*52}px,${of.y}px)`;   // a água empurra todo mundo (só visual)
        battleAfter(()=>{ o.mv.style.transition='transform .3s ease-in-out'; o.mv.style.transform=`translate(${of.x}px,${of.y}px)`; battleAfter(()=>{o.mv.style.transition='';},340); },240/speed); } });
    battleAfter(()=>tsFoes.forEach(o=>{ if(o!==t&&!o.vs)o.el.style.zIndex=o.z; }),900/speed); }
  if(kickAim&&CH.cloneHit)await finishWindKick(c,t,put,dir,kickAim,P);
  if(!air&&!kickAim&&P.fim)await finale(t);
  comboLine(CH.name,count,c.id,side); fl(t,count+' Perseguição!','chasec');
  log(`↳ ${nm(c)}: <b>${CH.name}</b> ${P.d} (combo x${count})`,'x');
  if(air){
    const ground=pos(t), landX=Math.max(70,Math.min(1082,tb.x+dir*36)), fallMs=140;
    const fall=`transform ${fallMs/speed}ms cubic-bezier(.65,0,1,.5)`;
    if(P.connected){
      impactFx(t,{pow:1.9,color:'#ff9a4a',cam:true,stop:0,dir,air:true});   // CONTATO no ar: sem poeira de chão (ela só vem no pouso)
      await hitstop(80);
      if(t.v?.alive||!t.owner){
        put(t,landX-ground.x,0,fall);
        trailFx(tb.x,tb.y-50,landX,ground.y-50,'D');
      }
    }
    put(c,landX-dir*75-h0.x,ground.y-h0.y,fall);
    await sleep(fallMs);
    c.mv.style.transition='';
    setAnim(c,'landing',0,true);
    if(P.connected&&(t.v?.alive||!t.owner)){
      t.off={x:landX-ground.x,y:0}; t.mv.style.transition='';
      if(P.s){ poseEstado(t,P.s); fl(t,ST[P.s]+'!','state'); sfx.knock(P.s); }
      slamFx(t,c.d.c); sfx.thud();
      if(c.id==='kaen')impactFx(t,{pow:2,color:'#ff9a4a',crack:true,stop:70,dir:dir,cam:true});   // pouso do Chute Meteoro: camada de impacto
    }
    if(P.fim)await finale(t);
    await sleep(animMs(c,'landing'));
    if(P.s===null)poseEstado(t,null);
    home(c);
    return;
  }
  if(kickAim){
    if(!CH.cloneHit)await landKeshinKick(c,t,put,dir,kickAim,P);
    if(P.s===null&&t.v?.alive)poseEstado(t,null);
    home(c);
    return;
  }
  if(P.s===null){ poseEstado(t,null); home(c); return; }
  if(P.s){
    if(CH.mv==='rise'&&cause==='V'){ const g=pos(t);   // sobe junto com o alvo lançado e depois desce
      put(c,tb.x-dir*76-h0.x,g.y-170-h0.y,'transform .3s cubic-bezier(.15,.85,.3,1)'); }
    await smash(c,t,P.s);
    if(CH.mv==='rise'&&cause==='V'){ put(c,cur(t).x-dir*76-h0.x,pos(t).y-h0.y,'transform .2s cubic-bezier(.55,0,.9,.55)'); await sleep(200); dust(c,8); c.mv.style.transition=''; }
  }else await hitstop(40);
  await sleep(110); home(c);
}
function result(){const p=U.p.some(u=>u.alive), e=U.e.some(u=>u.alive);
  if(acad)return !e||!p?'lose':acad.done?'win':null;   // Mestre caído ou time derrotado = falhou
  return !e?'win':!p?'lose':null;}
// Teste de Perseguição: a cadeia do jogador chegou na meta (e cumpre o extra do desafio)?
let chainOpenJ=false;
function acadCheck(side,count){ if(!acad||acad.done||side!=='p')return false; const c=ACAD[acad.i];
  if(count>=c.goal&&(!c.jutsu||chainOpenJ)&&(!c.fire||U.p.some(u=>u.d.el.includes('Fogo')))){ acad.done=true; return true; } return false; }   // o banner sai no passo (tocaPasso)
function wants(u,j,rate){
  if(j.unleash)return !u.solto&&battleRandom()<rate;
  if(j.heal)return team(u.side).some(a=>a.alive&&a.hp<a.max*.65);
  if(j.aura)return !u.power&&u.hp>u.max*.25&&battleRandom()<rate;
  return battleRandom()<rate;}
async function castInstants(opening=false){
  await comboReactions();
  // O laço da luta é o único que executa jutsus: cliques durante uma ação aguardam a próxima janela.
  let cast;
  do{
    cast=false;
    for(const u of all()){
      await gate();
      if(result())return;
      const j=selectedJutsu(u);
      if(!j?.instant||!u.alive||u.cd>0||u.seal>0)continue;
      if(!u.armedSkill){
        const autoRate=u.side==='p'?Number(autoP):foe.ai;
        if(!opening||!autoRate||!prepareJutsu(u,j,autoRate))continue;
      }
      const skill=commitJutsu(u);
      drawJ();
      await doSkill(u,skill,true);
      await comboReactions();
      cast=true;
    }
    opening=false;
  }while(cast&&all().some(u=>u.armedSkill?.instant));
}
async function intro(){
  // cada ninja entra pela LATERAL da própria área (time da esquerda pelo alto à esquerda, o inimigo pelo alto à direita) e faz uma curva até a sua casa (desenho do dono):
  // x desacelera (translate) e y cai em aceleração (transform), formando o arco da seta
  const DROP=u=>{ const c=pos(u), sx=u.side==='p'?110:1152-110, sy=120+u.row*26; return {dx:sx-c.x, dy:sy-c.y}; };
  for(const u of all()){u.mv.style.transition='none'; if(u.d.stationary)u.mv.style.transform=`translate(${(u.side==='p'?-1:1)*640}px,0)`; else{ const d=DROP(u); u.mv.style.translate=`${d.dx}px 0px`; u.mv.style.transform=`translate(0px,${d.dy}px)`; } setAnim(u,u.d.stationary?'walk':an_of(u).entrada?'entrada':'idle',0);}   // sem walk/run: Kazan (estacionário) mantém o dele
  $('rd').textContent=foe.name; await sleep(120);
  const ENTRY_MS=700;   // deslocamento e corrida acabam juntos em qualquer velocidade (transição escala com speed, como o sleep)
  for(const u of all()){ const air=!u.d.stationary; u.mv.style.transition=air?`transform ${320/speed}ms cubic-bezier(.5,0,.9,.55), translate ${320/speed}ms cubic-bezier(.15,.55,.4,1)`:`transform ${ENTRY_MS/speed}ms linear`; u.mv.style.transform=''; u.mv.style.translate=''; }
  const air=all().filter(u=>!u.d.stationary);
  if(air.length)battleAfter(()=>{ sfx.thud(); air.forEach(u=>{ const s=sockOf(u,'feet'); kitAdd({sheet:'im',row:3,fps:12,sc:.55,x:s.x,y:s.y+2,ay:GFXA.impacto[3]}); }); },320/speed);   // pouso da entrada: som + poeira leve do gfx (já no plano)
  await sleep(ENTRY_MS);
  for(const u of all()){u.mv.style.transition=''; u.mv.style.translate=''; if(!u.d.stationary)setAnim(u,'idle',Math.random()*8|0);}
  await Promise.all(all().filter(u=>u.d.stationary).map(kazanSit));
  $('rd').textContent='Rodada 1'; ink('Rodada 1'); await sleep(700);
}
function rollInitiative(){ return prova?.chance?.initiative||1+Math.floor(battleRandom()*6); }   // Campo de Provas pode fixar a face
const initiativeSide=face=>face%2===0?'p':'e';
function* turnOrder(face){
  const eligible=side=>byFormationCell(team(side).filter(u=>u.alive&&(!u.owner||u.summonedRound<round)));
  const queues={p:eligible('p'),e:eligible('e')};
  let side=initiativeSide(face);
  while(queues.p.length||queues.e.length){
    const queue=queues[side];
    while(queue.length&&!queue[0].alive)queue.shift();
    if(queue.length)yield queue.shift();
    side=side==='p'?'e':'p';
  }
}
async function run(){
  let res=null, byTime=false, firstInitiative=1; finDone=false;
  try{
    outer: while(true){
      round++; hitsR={p:0,e:0}; recolheClones(); $('rd').textContent='Rodada '+round; BUS.emit('rodada'); log('Rodada '+round,'r');
      for(const side of ['p','e']){   // curva de chakra (regra.js): rodada 1 já ganha (+20), depois 20, 40, 40, 60…
        const bonus=fieldA?.side===side?fieldA.fx.chakra||0:0;
        chakra[side]=Math.min(CHAKRA_MAX,chakra[side]+chakraGain(round)+bonus);
      }
      mostraChakra();
      if(round>1){
        sfx.round(); sfx.chakra();
        for(const u of all())if(u.alive&&u.cd>0){ u.cd--; mostra(u); }
        if(fieldA&&--fieldA.rounds<=0)await dismissField();
        for(const u of all()){ if(!u.alive)continue; if(u.owner&&round>=u.expires){vanishClone(u);continue;} if(u.shR>0&&--u.shR===0){u.shield=0; mostra(u);}
          if(u.power&&round>=u.power.end){u.power=null; mostra(u);}
          if(u.sR>0&&--u.sR===0&&u.solto){ u.solto=false; log(`${nm(u)} recoloca o capuz`); await rehoodCine(u); }
          if(u.dot){sfx.dot(u.dot.el); curSide=u.side==='p'?'e':'p'; hurt(u,u.dot.dmg,'dot'); spark(u,'#ef9a5b',5); if(u.alive&&--u.dot.rounds<=0)u.dot=null; mostra(u);} }
      }
      all().forEach(u=>{ u.chaseUsed=false; u.comboUsed=false; });
      drawJ();
      if((res=result()))break;
      if(round===1)firstInitiative=rollInitiative();
      const initiative=round%2===1?firstInitiative:(firstInitiative%2===0?1:2);   // dado só na rodada 1; depois alterna quem começa
      const opening=round===1, units=$('units');
      if(opening)units.classList.add('waiting-entry');
      if(opening)await showInitiative(initiative);
      if(opening){
        const entrance=intro();
        units.classList.remove('waiting-entry');
        await entrance;
        ink('LUTAR!'); sfx.start(); await sleep(1000);
      }
      for(const u of [...U.p,...U.e])if(u.alive)fl(u,String(formationCellNumber(u)),'ord');
      await castInstants(true);
      if((res=result()))break;
      for(const u of turnOrder(initiative)){
        if(!u||!u.alive)continue;
        await gate();
        await castInstants();
        if((res=result()))break outer;
        if(!u.alive)continue;
        if(u.owner){
          await doSkill(u,u.d.normal,false); u.stunned=false; mostra(u);
          if((res=result()))break outer;
          continue;
        }
        let sk=u.d.normal,isJ=false;
        const available=availableJutsu(u);
        if(!u.sleep&&!u.seal&&!available.instant&&u.side==='p'&&!autoP&&canPrepareJutsu(u,available)){   // o botão pulsa antes do golpe
          u.el.classList.add('turn'); u.sk.classList.add('ready');
          for(let w=0;w<1100&&!u.armedSkill&&u.alive&&!u.seal&&!u.sleep;w+=60){ await sleep(60); await castInstants(); }
          u.sk.classList.remove('ready'); u.el.classList.remove('turn');
        }
        if((res=result()))break outer;
        if(!u.alive)continue;
        if(u.sleep>0){ fl(u,'Dormindo...','info2'); log(`${nm(u)} está dormindo e perde a ação`); u.sleep--; mostra(u); continue; }
        const wasStun=u.stunned;   // paralisia bloqueia só a perseguição e passa depois da ação do ninja
        if(wasStun){ fl(u,'sem perseguir','info2'); log(`${nm(u)} está paralisado: age, mas não persegue`); }
        const j=selectedJutsu(u);
        if(u.seal>0){
          if(u.armedSkill&&!j.instant){ refundJutsu(u); mostra(u); }
          fl(u,'Selado','info2');
        }else if(!j.instant){
          if(j.charge&&u.side==='e'){ u.chg=(u.chg||0)+1; if(u.chg>=j.charge){u.chg=0;sk=j;isJ=true;} else fl(u,`${j.name}: ${j.charge-u.chg}`,'info2'); mostra(u); }   // Selo Final do Mestre
          else if(u.armedSkill||((u.side==='e'||autoP)&&prepareJutsu(u,j,u.side==='p'?1:foe.ai))){
            sk=commitJutsu(u); isJ=true;
          }
        }
        if(!isJ&&u.d.strong&&battleRandom()<strongChance())sk=u.d.strong;   // ação sem jutsu tem STRONG_CHANCE (30%) de virar o golpe Forte (o Campo de Provas pode mudar)
        if(u.blind>0&&!isJ){ fl(u,'Cego: sem básico','info2'); log(`${nm(u)} está cego e não ataca`); }   // cegueira: só o jutsu sai
        else{ u.el.classList.add('turn'); drawJ(); await doSkill(u,sk,isJ); u.el.classList.remove('turn'); }
        if(u.alive){ if(u.seal>0)u.seal--; if(u.blind>0)u.blind--; mostra(u); }
        if(wasStun&&u.alive){u.stunned=false; mostra(u);}
        drawJ();
        if((res=result()))break outer;
      }
      await castInstants();
      if((res=result()))break;
      if(round>=(prova?.rounds||20)){const s=t=>U[t].reduce((a,u)=>a+u.hp/u.max,0); res=acad?'lose':s('p')>s('e')?'win':'lose'; byTime=!acad; break;}
    }
    if(fieldA)await dismissField();
    musStop(); await sleep(350);
    if(res==='win')for(const u of U.p)if(u.alive&&u.d.stationary)setAnim(u,'victory',0,true);
    $('flash').className='long'; sfx.end(); ink('FIM DO COMBATE',true); await sleep(1500);
  }catch(e){ if(e===ABORT)return; throw e; }
  sfx[res](); battleOn=false; ACT=[];
  const story=!acad&&!prova;   // Campo de Provas não libera missão nem ninja
  const hasNext=story&&res==='win'&&foeIx<FOES.length-1;
  if(story&&res==='win'&&foeIx>=unlocked&&foeIx<FOES.length-1){unlocked=foeIx+1;save();}
  const newN=story&&res==='win'&&FOES[foeIx].unlock&&!have(FOES[foeIx].unlock)?FOES[foeIx].unlock:null; if(newN){own.push(newN);save(); battleAfter(()=>sfx.ui('desbloqueio'),900);}
  if(acad&&res==='win'&&!acadDone.includes(acad.i)){acadDone.push(acad.i); save();}
  $('ink').className=''; $('clist').innerHTML='';
  $('ovT').textContent=acad?(res==='win'?'Desafio concluído!':'Desafio falhou'):res==='win'?'Vitória':'Derrota';
  $('ovP').textContent=`${foe.name} · ${round} rodada${round>1?'s':''}`+(byTime?' · decidido por tempo (mais vida restante)':'');
  $('ovQ').textContent=acad?`Meta: ${ACAD[acad.i].name} · seu maior combo: x${maxCombo||1}`+(res!=='win'&&!U.e.some(u=>u.alive)?' · o Mestre caiu: o teste é de perseguição, não de dano':''):`Seu maior combo: x${maxCombo||1}`+(res==='win'&&!prova&&foeIx===FOES.length-1?' · Você venceu todas as missões!':'')+(newN?` · ${N[newN].name} desbloqueado! Ele já está na Formação.`:'');
  $('ovN').classList.toggle('hide',!hasNext); $('ovB').textContent=acad?'Academia':'Mapa';
  $('resWin').classList.remove('hide');
}
