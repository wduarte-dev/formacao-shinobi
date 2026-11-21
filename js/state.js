// state.js — estado da batalha e posições
"use strict";
let U=null, chakra, round, autoP=false, token=0, maxCombo, foe, hitsR={p:0,e:0}, curSide='p', mark=null, fieldA=null;   // fieldA: campo ativo {side,rounds} (Noite de Névoa)
const ABORT={};
function sleep(ms){const t=token;return new Promise((res,rej)=>setTimeout(()=>t===token?res():rej(ABORT),ms/speed));}
async function gate(){const t=token;while(paused){await new Promise(r=>setTimeout(r,120));if(t!==token)throw ABORT;}}
const all=()=>[...U.p,...U.e];
function mk(id,side,slot,row,depth,m){const d=N[id], a=mkSpr(id,3);
  return Object.assign(a,{off:{x:0,y:0},d,side,slot,row,depth,max:Math.round(d.hp*m),hp:Math.round(d.hp*m),atk:d.atk*m,def:d.def,cd:0,armed:false,chaseUsed:false,stunned:false,shield:0,shR:0,nc:0,dot:null,alive:true,state:null});}
const team=s=>U[s], foes=u=>U[u.side==='p'?'e':'p'].filter(x=>x.alive);
function pos(u){const c=cell(u.row,u.depth); return{x:u.side==='p'?c.x:1152-c.x,y:c.y};}
// posição atual: a casa mais o deslocamento de quando foi lançado, derrubado ou repelido
function cur(u){const p=pos(u); return{x:p.x+(u.off?u.off.x:0),y:p.y+(u.off?u.off.y:0)};}

