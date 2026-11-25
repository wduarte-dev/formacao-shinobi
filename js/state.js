// state.js — estado da batalha e posições
"use strict";
let U=null, chakra, round, autoP=false, token=0, maxCombo, foe, hitsR={p:0,e:0}, curSide='p', mark=null, fieldA=null;   // fieldA: campo ativo {side,rounds} (Noite de Névoa)
const ABORT={};
function sleep(ms){const t=token;return new Promise((res,rej)=>setTimeout(()=>t===token?res():rej(ABORT),ms/speed));}
async function gate(){const t=token;while(paused){await new Promise(r=>setTimeout(r,120));if(t!==token)throw ABORT;}}
const all=()=>[...U.p,...U.e,...U.clones];
function mk(id,side,slot,row,depth,m,d=N[id],scale=3){const a=mkSpr(id,scale);
  return Object.assign(a,{off:{x:0,y:0},d,side,slot,row,depth,max:Math.round(d.hp*m),hp:Math.round(d.hp*m),atk:d.atk*m,def:d.def,cd:0,armed:false,chaseUsed:false,stunned:false,shield:0,shM:0,shR:0,nc:0,dot:null,alive:true,state:null});}
const team=s=>U[s].concat(U.clones.filter(u=>u.side===s)), foes=u=>team(u.side==='p'?'e':'p').filter(x=>x.alive);
const livingClones=u=>U.clones.filter(c=>c.owner===u&&c.alive);
function summonClones(owner,sk){
  const group=livingClones(owner), side=team(owner.side);
  for(const c of group){ c.expires=round+sk.duration; c.hp=c.max; upd(c); }
  const rows=[owner.row,...[0,1,2].filter(r=>r!==owner.row)];
  for(const depth of [0,1,2])for(const row of rows){
    if(group.length===sk.clones)return group;
    if(side.some(u=>u.alive&&u.row===row&&u.depth===depth))continue;
    const d={name:'Clone de vento',el:owner.d.el,c:owner.d.c,size:.78,
      hp:Math.round(owner.max*.35),atk:owner.atk*.35,def:owner.def,dodge:owner.d.dodge};
    const c=mk('utsushic',owner.side,owner.slot,row,depth,1,d,3*d.size);
    c.owner=owner; c.expires=round+sk.duration; U.clones.push(c); group.push(c); side.push(c);
    mountUnit(c); ACT.push(c); setAnim(c,'birth'); sceneAdd(c); upd(c);
  }
  return group;
}
function vanishClone(c){
  c.alive=false; c.hp=0; c.dot=null; c.state=null; c.st.className='st';
  if(mark===c){mark=null; c.el.classList.remove('mk');}
  setAnim(c,'vanish',0,true); dust(c,8); upd(c);
  const battle=U;
  setTimeout(()=>{
    c.el.remove(); battle.clones=battle.clones.filter(u=>u!==c);
    if(U===battle)ACT=ACT.filter(u=>u!==c);
  },animMs(c,'vanish')/speed);
}
function pos(u){const c=cell(u.row,u.depth); return{x:u.side==='p'?c.x:1152-c.x,y:c.y};}
// posição atual: a casa mais o deslocamento de quando foi lançado, derrubado ou repelido
function cur(u){const p=pos(u); return{x:p.x+(u.off?u.off.x:0),y:p.y+(u.off?u.off.y:0)};}

