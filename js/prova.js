// prova.js — Campo de Provas: missão-laboratório ("modo criativo") pra testar mecânica com tudo manipulável
// Não aparece no mapa, não salva progresso. Uso: provaStart({...}) no console ou via tools/prova.py.
// Config (tudo opcional; o que faltar vem de PROVA_BASE):
//   seed            semente do battleRandom (mesma semente + mesma config = mesma luta, evento por evento)
//   p, e            times: [{id,row,depth, hp, mult, res, state, patch}] (1 a 9 por lado; row/depth 0..2)
//                   hp = PV inicial (número) ou fração do máximo (0..1]; mult = multiplicador de atributos
//                   patch = mescla profunda na ficha N[id] SÓ desse ninja (ex.: {chase:{tsunami:1}}, {dodge:0})
//   chance.strong   chance do golpe Forte (padrão STRONG_CHANCE); chance.initiative = face fixa do d6 (1..6)
//   ai, auto        taxa de jutsu do inimigo / Auto do jogador (true/false)
//   chakra {p,e}    chakra antes do ganho da rodada 1 (padrão = jogo: CHAKRA_START); rounds = limite de rodadas; speed = velocidade (2 = normal rápido)
"use strict";
let prova=null, provaEvs=[];
const PROVA_BASE={name:'Campo de Provas',lvl:'Laboratório',bg:'dojo',seed:10,mult:1,ai:1,auto:true,speed:16,rounds:20,   // semente 10: cobre D/V/R/L, escudo, DoT, Forte, clones (varredura de 28/11, com a curva de chakra; a 5 parou de invocar clones); speed não muda o resultado (mesmo hash em 2, 8 e 16)
  chakra:{p:CHAKRA_START,e:CHAKRA_START},chance:{},
  // cobertura máxima: perseguição por estado e por combo, D/V/R/L, instantâneo, clones, paralisia | escudo, cura/Tsunami, campo, contador
  p:[{id:'kaen',row:1,depth:0},{id:'keshin',row:0,depth:1},{id:'utsushi',row:2,depth:1},{id:'hiyori',row:1,depth:2}],
  e:[{id:'iwao',row:1,depth:0},{id:'mizuha',row:0,depth:1},{id:'mayoi',row:2,depth:1},{id:'kazan',row:1,depth:2}]};
const provaMerge=(a,b)=>{ if(!b||typeof b!=='object'||Array.isArray(b))return b===undefined?a:b;
  const o=Array.isArray(a)?[...a]:{...(a||{})}; for(const k in b)o[k]=provaMerge(a?.[k],b[k]); return o; };
const provaFoe=()=>({name:prova.name,lvl:prova.lvl,bg:prova.bg,mult:prova.mult,ai:prova.ai,team:prova.e.map(u=>[u.id,u.row,u.depth])});
const strongChance=()=>prova?.chance?.strong??STRONG_CHANCE;
const provaKey=u=>`${u.side}${u.owner?'c':''}${u.depth*3+u.row+1}:${u.id}`;
function provaStart(cfg={}){
  prova=provaMerge(PROVA_BASE,cfg); if(cfg.p)prova.p=cfg.p; if(cfg.e)prova.e=cfg.e;   // times vêm inteiros, não mesclados
  acad=null; startBattle();
}
function provaOff(){ prova=null; }
// chamado por startBattle2 com U montado e antes do run(): aplica a config e zera o gravador
function provaApply(){
  battleRandom=seededRandom(prova.seed); autoP=!!prova.auto; speed=prova.speed; chakra={...prova.chakra};
  for(const side of ['p','e'])prova[side].forEach((c,i)=>{ const u=U[side][i]; if(!u)return;
    if(c.patch)u.d=provaMerge(u.d,c.patch);
    if(c.mult){ u.max=Math.round(u.d.hp*c.mult); u.hp=u.max; u.atk=u.d.atk*c.mult; }
    if(c.hp!=null)u.hp=Math.max(1,Math.round(c.hp<=1?u.max*c.hp:c.hp));
    if(c.res!=null)u.res=c.res;
    if(c.state)u.state=u.vs=c.state; });
  provaEvs=[];
}
// ---------- gravador: eventos da regra (sem tempo, sem DOM) -> impressão digital ----------
function provaEv(k,o){ if(prova&&U)provaEvs.push({r:round,k,...o}); }
function provaSnap(){ return all().map(u=>[provaKey(u),u.alive?u.hp:0,u.shield|0,u.state||'',u.dot?u.dot.rounds:0,u.stunned?1:0]); }
// escuta os eventos que a regra anuncia (BUS em regra.js); nada de embrulhar função do motor
BUS.on('dano',e=>provaEv('dano',{t:provaKey(e.t),d:e.d,esc:e.esc,cls:e.cls,hp:e.hp}));   // dano real aplicado (depois do escudo); cls distingue dot/cost
BUS.on('estado',e=>provaEv('estado',{t:provaKey(e.t),s:e.s}));
BUS.on('acao',e=>provaEv('acao',{u:provaKey(e.u),sk:e.sk?.name||'',j:e.isJ?1:0,forte:e.sk===e.u.d.strong?1:0}));
BUS.on('persegue',e=>provaEv('persegue',{side:e.side,t:provaKey(e.t),n:e.n}));
BUS.on('rodada',()=>provaEv('rodada',{ch:[chakra.p,chakra.e],u:provaSnap()}));
// cópia da tela (fatia 3a): no fim da luta a HUD (u.v, vChakra) tem que mostrar exatamente o estado da regra; devolve as divergências
function provaCopia(){ const out=all().filter(u=>JSON.stringify(u.v)!==JSON.stringify(vista(u))).map(provaKey);
  if(vChakra.p!==chakra.p||vChakra.e!==chakra.e)out.push('chakra'); return out; }
// resumo + hash (FNV-1a 32 bits, duas passadas) do log de eventos
function provaDigital(){
  const s=JSON.stringify(provaEvs); let h1=0x811c9dc5, h2=0x01000193;
  for(let i=0;i<s.length;i++){ const c=s.charCodeAt(i); h1=Math.imul(h1^c,0x01000193)>>>0; h2=Math.imul(h2^c,0x811c9dc5)>>>0; }
  const n=k=>provaEvs.filter(e=>e.k===k);
  const estados={}; n('estado').forEach(e=>estados[e.s]=(estados[e.s]||0)+1);
  const dmg=side=>n('dano').filter(e=>e.t[0]!==side&&e.cls!=='cost').reduce((a,e)=>a+e.d,0);
  return {hash:h1.toString(16).padStart(8,'0')+h2.toString(16).padStart(8,'0'), res:result(), rodadas:round, eventos:provaEvs.length,
    acoes:n('acao').length, jutsus:n('acao').filter(e=>e.j).length, fortes:n('acao').filter(e=>e.forte).length,
    perseguicoes:n('persegue').length, maiorCombo:maxCombo, estados, danoP:dmg('p'), danoE:dmg('e'),
    absorvido:n('dano').reduce((a,e)=>a+(e.esc>0?e.esc:0),0), dot:n('dano').filter(e=>e.cls==='dot').length,
    clones:new Set(provaEvs.flatMap(e=>e.u&&e.k==='acao'&&e.u.includes(':utsushic')?[e.u]:[])).size, copia:provaCopia()};
}
