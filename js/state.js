// state.js — estado da batalha e posições
"use strict";
let U=null, chakra, round, autoP=false, token=0, maxCombo, foe, hitsR={p:0,e:0}, curSide='p', mark=null, fieldA=null;   // fieldA: campo ativo {side,rounds} (Noite de Névoa)
const ABORT={};
let battleRandom=()=>Math.random();
function seededRandom(seed){
  let state=seed>>>0;
  return ()=>{
    state=(state+0x6D2B79F5)>>>0;
    let value=Math.imul(state^(state>>>15),state|1);
    value^=value+Math.imul(value^(value>>>7),value|61);
    return ((value^(value>>>14))>>>0)/4294967296;
  };
}
let devFrozen=false;
const battleTimers=new Set(), freezeAnimations=new Set();
function armBattleTimer(timer){
  timer.started=performance.now();
  timer.id=setTimeout(()=>{
    battleTimers.delete(timer);
    timer.fn();
  },timer.left);
}
let timeHeld=false;   // o relógio da batalha está parado: pausa do jogador OU congelar do modo dev (uma só autoridade de tempo)
function battleAfter(fn,ms,onAbort){
  const timer={fn,onAbort,left:Math.max(0,ms),started:0,id:null};
  battleTimers.add(timer);
  if(!timeHeld)armBattleTimer(timer);
}
function cancelBattleWork(){
  token++; filaZera();
  for(const timer of battleTimers){
    clearTimeout(timer.id);
    timer.onAbort?.();
  }
  battleTimers.clear();
  for(const animation of $('sBattle').getAnimations({subtree:true})){
    if(animation.constructor===Animation)animation.cancel();
  }
  freezeAnimations.clear();
  sceneOff();
  endCine();
  frozen=false;
  fieldA=null;
  mark=null;
  $('field').classList.remove('hs');
  resetFieldScene();
  resetKazanFx();
  clearBattleFx();
}
// para/retoma temporizadores (sleep, battleAfter) e animações Web Animations quando devFrozen ou paused mudam
function syncTimeHold(){
  const on=devFrozen||paused;
  if(on===timeHeld)return;
  timeHeld=on;
  const now=performance.now();
  for(const timer of battleTimers){
    if(on){
      clearTimeout(timer.id);
      timer.left=Math.max(0,timer.left-(now-timer.started));
    }else armBattleTimer(timer);
  }
  if(on){
    for(const animation of $('sBattle').getAnimations({subtree:true})){
      if(animation.playState!=='running'&&!animation.pending)continue;
      animation.pause();
      freezeAnimations.add(animation);
    }
  }else{
    for(const animation of freezeAnimations)if(animation.playState==='paused')animation.play();
    freezeAnimations.clear();
  }
}
function setDevFreeze(on){
  if(on===devFrozen)return;
  devFrozen=on;
  syncTimeHold();
  bgSound(on||document.hidden);
}
function setPaused(on){
  paused=on; $('bPause').textContent=on?'Continuar':'Pausar';
  syncTimeHold();
}
function sleep(ms){const t=token;return new Promise((res,rej)=>battleAfter(()=>t===token?res():rej(ABORT),ms/speed,()=>rej(ABORT)));}
async function gate(){const t=token;while(paused){await new Promise(r=>setTimeout(r,120));if(t!==token)throw ABORT;}}
const all=()=>[...U.p,...U.e,...U.clones];
function mk(id,side,slot,row,depth,m,d=N[id],scale=3){const a=mkSpr(id,scale);
  return Object.assign(a,{off:{x:0,y:0},d,side,slot,row,depth,max:Math.round(d.hp*m),hp:Math.round(d.hp*m),atk:d.atk*m,def:d.def,cd:0,armedSkill:null,chaseUsed:false,comboUsed:false,stunned:false,shield:0,shM:0,shR:0,nc:0,dot:null,alive:true,state:null});}
const team=s=>U[s].concat(U.clones.filter(u=>u.side===s)), foes=u=>team(u.side==='p'?'e':'p').filter(x=>x.alive);
const livingClones=u=>U.clones.filter(c=>c.owner===u&&c.alive);
function summonClones(owner,sk){
  const group=livingClones(owner), side=team(owner.side);
  for(const c of group){ c.expires=round+sk.duration; c.hp=c.max; mostra(c); }
  const rows=[owner.row,...[0,1,2].filter(r=>r!==owner.row)];
  for(const depth of [0,1,2])for(const row of rows){
    if(group.length===sk.clones)return group;
    if(side.some(u=>u.alive&&u.row===row&&u.depth===depth))continue;
    const d={name:'Clone de vento',el:owner.d.el,c:owner.d.c,size:.78,
      normal:{name:'Palma de Vento',target:'front',mult:1},
      hp:Math.round(owner.max*.35),atk:owner.atk*.35,def:owner.def,dodge:owner.d.dodge};
    const c=mk('utsushic',owner.side,owner.slot,row,depth,1,d,3*d.size);
    c.owner=owner; c.summonedRound=round; c.expires=round+sk.duration; U.clones.push(c); group.push(c); side.push(c);
    mountUnit(c); ACT.push(c); setAnim(c,'birth'); sceneAdd(c); mostra(c);
  }
  return group;
}
function vanishClone(c){
  c.alive=false; c.hp=0; c.dot=null; c.state=null; c.vs=null; c.st.className='st';
  if(mark===c){mark=null; c.el.classList.remove('mk');}
  setAnim(c,'vanish',0,true); dust(c,8); mostra(c);
  const battle=U;
  battleAfter(()=>{   // só a tela: quem tira o clone da lista é a regra (recolheClones, começo da rodada)
    c.el.remove();
    if(U===battle)ACT=ACT.filter(u=>u!==c);
  },animMs(c,'vanish')/speed);
}
const BATTLE_GAP=14;   // cada time recua um pouco da linha do meio: mais espaço entre os ninjas na luta (a Formação não muda)
function pos(u){const c=cell(u.row,u.depth); return{x:u.side==='p'?c.x-BATTLE_GAP:1152-c.x+BATTLE_GAP,y:c.y};}
// posição atual: a casa mais o deslocamento de quando foi lançado, derrubado ou repelido
function cur(u){const p=pos(u); return{x:p.x+(u.off?u.off.x:0),y:p.y+(u.off?u.off.y:0)};}

