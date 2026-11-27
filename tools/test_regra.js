#!/usr/bin/env node
// Teste da regra pura (js/regra.js) em Node, sem navegador: fórmula, escudo, morte, clone, custo em vida, DoT,
// sono, Substituição e os eventos anunciados no BUS. Uso: node tools/test_regra.js  (uma linha "ok" se passou)
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm'), assert=require('assert/strict');
const ROOT=path.resolve(__dirname,'..');
const src=fs.readFileSync(path.join(ROOT,'js/regra.js'),'utf8');

// a regra não pode tocar em DOM, som nem tempo real
for(const bad of ['document','window','sfx.','sleep(','setAnim','fl(','upd(','classList','style.'])
  assert.ok(!src.includes(bad),`regra.js usa ${bad} (apresentação dentro da regra)`);

// o que a regra ainda lê de fora (estado da batalha e as dívidas das próximas fatias)
function mundo(){
  const ctx={round:1,curSide:'p',hitsR:{p:0,e:0},mark:null,fieldA:null,rolls:[.5],vanished:[],refunded:[],
    battleRandom(){ return ctx.rolls.length?ctx.rolls.shift():.5; },
    fieldMul:()=>1, unl:()=>null, livingClones:t=>t.clones||[],
    vanishClone(c){ c.alive=false; c.hp=0; ctx.vanished.push(c); },
    clearStatus(u){ u.seal=u.blind=u.sleep=0; },
    refundJutsu(u){ ctx.refunded.push(u); }};
  vm.createContext(ctx);
  vm.runInContext(src+'\n;Object.assign(globalThis,{BUS,hurt,landHit,damageRoll,elemMul,ELADV,ELDIS});',ctx);
  ctx.evs=[]; for(const k of ['dano','substitui'])ctx.BUS.on(k,e=>ctx.evs.push([k,e]));
  return ctx;
}
const ninja=(o={})=>({side:'e',alive:true,hp:1000,max:1000,shield:0,def:0,atk:100,state:null,sleep:0,d:{el:'Fogo'},...o});

// BUS: on/off/emit, ordem de inscrição
{ const w=mundo(), seen=[]; const f=w.BUS.on('x',o=>seen.push('a'+o.n)); w.BUS.on('x',o=>seen.push('b'+o.n));
  w.BUS.emit('x',{n:1}); w.BUS.off('x',f); w.BUS.emit('x',{n:2}); assert.deepEqual(seen,['a1','b1','b2']); }

// fórmula e triângulo elemental
{ const w=mundo();
  assert.equal(w.elemMul({d:{el:'Fogo'}},{d:{el:'Vento'}}),w.ELADV);
  assert.equal(w.elemMul({d:{el:'Vento'}},{d:{el:'Fogo'}}),w.ELDIS);
  assert.equal(w.elemMul({d:{el:'Gelo'}},{d:{el:'Fogo'}}),w.ELADV);    // Gelo herda Água
  assert.equal(w.elemMul({d:{el:'Veneno'}},{d:{el:'Fogo'}}),1);       // neutro
  assert.equal(w.damageRoll(100,0,1,1,1,1,1,.5),100);
  assert.equal(w.damageRoll(100,100,1,1,1,1,1,.5),50);                  // defesa 100 corta pela metade
  assert.equal(w.damageRoll(1,1000,1,1,1,.01,1,0),1); }                 // mínimo 1

// escudo absorve primeiro; o evento diz quanto passou e quanto o escudo segurou
{ const w=mundo(), t=ninja({shield:30});
  assert.equal(w.hurt(t,100,''),70); assert.equal(t.hp,930); assert.equal(t.shield,0); assert.equal(w.hitsR.p,1);
  const [k,e]=w.evs[0]; assert.equal(k,'dano'); assert.equal(e.t,t); assert.equal(e.d,70); assert.equal(e.esc,30);
  assert.equal(e.shHit,true); assert.equal(e.hp,930); assert.equal(e.hp0,1000); assert.equal(e.died,false); }

// perfurante ignora o escudo; custo em vida não conta hit nem mata pela regra de morte
{ const w=mundo(), t=ninja({shield:50});
  assert.equal(w.hurt(t,100,'cost',{pierce:true}),100); assert.equal(t.shield,50); assert.equal(t.hp,900);
  assert.equal(w.hitsR.p,0); assert.equal(w.evs[0][1].cls,'cost'); }

// DoT não conta hit e não acorda; golpe acorda
{ const w=mundo(), t=ninja({sleep:2});
  w.hurt(t,10,'dot'); assert.equal(t.sleep,2); assert.equal(w.hitsR.p,0);
  w.hurt(t,10,''); assert.equal(t.sleep,0); assert.equal(w.evs[1][1].woke,true); assert.equal(w.hitsR.p,1); }

// morte: limpa estado, devolve chakra, solta a marca
{ const w=mundo(), t=ninja({hp:50,state:'D',stunned:true,dot:{},seal:2});
  w.mark=t; w.hurt(t,80,'');
  assert.equal(t.hp,0); assert.equal(t.alive,false); assert.equal(t.state,null); assert.equal(t.stunned,false);
  assert.equal(t.dot,null); assert.equal(t.seal,0); assert.equal(w.mark,null); assert.deepEqual(w.refunded,[t]);
  const e=w.evs[0][1]; assert.equal(e.died,true); assert.equal(e.wasMark,true); }

// clone zerado some (não "morre" pela regra de morte)
{ const w=mundo(), c=ninja({hp:20,owner:{}});
  w.hurt(c,50,''); assert.deepEqual(w.vanished,[c]); assert.equal(w.evs[0][1].clone,true); assert.equal(w.evs[0][1].died,false); }

// landHit: rola o dano com o triângulo; Substituição engole o golpe 1x por rodada
{ const w=mundo(), a=ninja({side:'p',d:{el:'Fogo'}}), t=ninja({d:{el:'Vento'}});
  assert.equal(w.landHit(a,t,1,true,''),125); assert.equal(w.evs[0][1].adv,1); assert.equal(w.evs[0][1].evt,'Fogo vence Vento');
  const clone=ninja({owner:t}), u=ninja({d:{el:'Fogo',passive:'Substituição'},clones:[clone]});
  assert.equal(w.landHit(a,u,1,true,''),null); assert.deepEqual(w.vanished,[clone]); assert.equal(u.hp,1000);
  assert.equal(w.evs[1][0],'substitui'); assert.equal(w.evs[1][1].clone,clone);
  u.clones=[ninja({owner:u})]; assert.equal(w.landHit(a,u,1,true,''),100); }   // mesma rodada: agora toma

// área em clone: mata o clone de uma vez
{ const w=mundo(), a=ninja({side:'p'}), c=ninja({hp:500,shield:10,owner:{},d:{el:'Fogo'}});
  w.landHit(a,c,1,false,'',true); assert.equal(c.hp,0); }

console.log('ok');
