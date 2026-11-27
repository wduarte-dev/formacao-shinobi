#!/usr/bin/env node
// Teste da regra pura (js/regra.js) em Node, sem navegador: fórmula, escudo, morte, clone, custo em vida, DoT,
// sono, Substituição e os eventos anunciados no BUS. Uso: node tools/test_regra.js  (uma linha "ok" se passou)
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm'), assert=require('assert/strict');
const ROOT=path.resolve(__dirname,'..');
const src=fs.readFileSync(path.join(ROOT,'js/regra.js'),'utf8');

// a regra não pode tocar em DOM, som nem tempo: nada de espera "de design/fluidez" aqui (isso é da apresentação)
for(const bad of ['document','window','sfx.','sleep(','setAnim','fl(','upd(','classList','style.',
                  'await','async','setTimeout','setInterval','requestAnimationFrame','battleAfter','animMs','hitstop','gate(','speed'])
  assert.ok(!src.includes(bad),`regra.js usa ${bad} (apresentação dentro da regra)`);

// o que a regra ainda lê de fora (estado da batalha e as dívidas das próximas fatias)
function mundo(){
  const ctx={round:1,curSide:'p',hitsR:{p:0,e:0},mark:null,fieldA:null,rolls:[.5],vanished:[],refunded:[],U:{p:[],e:[]},
    byFormationCell:us=>[...us].sort((a,b)=>a.cell-b.cell), team:s=>ctx.U[s], foes:u=>ctx.U[u.side==='p'?'e':'p'].filter(x=>x.alive),
    battleRandom(){ return ctx.rolls.length?ctx.rolls.shift():.5; },
    fieldMul:()=>1, unl:()=>null, livingClones:t=>t.clones||[],
    vanishClone(c){ c.alive=false; c.hp=0; ctx.vanished.push(c); },
    clearStatus(u){ u.seal=u.blind=u.sleep=0; },
    refundJutsu(u){ ctx.refunded.push(u); }};
  vm.createContext(ctx);
  vm.runInContext(src+'\n;Object.assign(globalThis,{BUS,hurt,landHit,damageRoll,elemMul,ELADV,ELDIS,canChase,chaseStart,chaseTsunami,chaseOutcome,vista,mostra,mostraChakra});',ctx);
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

// perseguição: a regra escolhe quem entra (ordem das casas, on = estado do alvo, sem paralisado/repetido) e o multiplicador
{ const w=mundo(), evs=[]; for(const k of ['persegue','perseguidor','tsunami','perseguiu'])w.BUS.on(k,e=>evs.push(k));
  const ch=(on,cause,o={})=>({mult:1.2,on,cause,...o});
  const a=ninja({side:'p',cell:3,d:{el:'Fogo',chase:ch('V','D')}}), b=ninja({side:'p',cell:1,d:{el:'Água',chase:ch('V','R',{hits:[.3,.6]})}}),
        z=ninja({side:'p',cell:2,stunned:true,d:{el:'Raio',chase:ch('V','D')}}), t=ninja({state:'V',d:{el:'Terra'}});
  w.U.p=[a,b,z]; w.U.e=[t];
  const P=w.chaseStart('p',t,2);
  assert.equal(P.c,b); assert.equal(b.chaseUsed,true); assert.equal(P.n,3); assert.equal(P.cause,'R');
  assert.ok(Math.abs(P.mult-1.2*1.2)<1e-9); assert.deepEqual([...P.hits],[.3,.6]);   // passo 3 = +20%
  const Q=w.chaseStart('p',t,3);                                                // b já gastou: entra a (casa 3); z paralisado nunca
  assert.equal(Q.c,a); assert.deepEqual([...Q.hits],[0]);
  assert.equal(w.chaseStart('p',t,4),null);                                     // ninguém apto: anuncia e devolve null
  assert.deepEqual(evs,['persegue','perseguidor','persegue','perseguidor','persegue']);
  assert.equal(w.canChase(z,'V'),false); z.stunned=false; assert.equal(w.canChase(z,'V'),true); assert.equal(w.canChase(z,'D'),false);
  // fim do passo: acertou e vivo → aplica cause e segue; acertou e morreu → nada e para; errou → solta (null) e para
  t.alive=true; w.chaseOutcome(P,true); assert.equal(P.s,'R'); assert.equal(P.next,true);
  t.alive=false; w.chaseOutcome(P,true); assert.equal(P.s,undefined); assert.equal(P.next,false);
  t.alive=true; w.chaseOutcome(P,false); assert.equal(P.s,null); assert.equal(P.next,false); }

// Tsunami: só sorteia quem tem chance (não gasta battleRandom à toa) e precisa de 2+ inimigos vivos
{ const w=mundo(), m=ninja({side:'e',cell:1,d:{el:'Água',chase:{on:'D',cause:'R',mult:1,tsunami:.25}}}),
        k=ninja({side:'e',cell:2,d:{el:'Fogo',chase:{on:'D',cause:'V',mult:1}}}), p1=ninja({side:'p',state:'D'}), p2=ninja({side:'p'});
  w.U.e=[m,k]; w.U.p=[p1,p2]; let tsu=0; w.BUS.on('tsunami',e=>{ tsu++; assert.equal(e.alvos.length,2); assert.ok(Math.abs(e.mult-.6)<1e-9); });
  w.rolls=[.1]; const P=w.chaseStart('e',p1,0); assert.equal(w.chaseTsunami(P),true); assert.deepEqual([...P.alvos],[p1,p2]); assert.equal(tsu,1);
  w.rolls=[.3]; assert.equal(w.chaseTsunami(P),false); assert.equal(P.alvos.length,0);
  p2.alive=false; w.rolls=[.1,.9]; assert.equal(w.chaseTsunami(P),false); assert.deepEqual([...w.rolls],[.9]);   // sorteou mas só 1 vivo
  w.rolls=[.1]; const K={c:k,t:p1}; assert.equal(w.chaseTsunami(K),false); assert.deepEqual([...w.rolls],[.1]);   // sem chance: não rola
  assert.equal(tsu,1); }

// cópia da tela (fatia 3a): o dano leva a foto da HUD por VALOR; 'unidade' e 'chakra' anunciam fotos
{ const w=mundo(), t=ninja({shield:30,shM:30,cd:2,stunned:true,dot:{dmg:5,rounds:1},armedSkill:{name:'J'}});
  w.hurt(t,100,''); const v=w.evs[0][1].v;
  assert.deepEqual([v.hp,v.shield,v.shM,v.alive,v.stunned,v.dot,v.cd,v.armed.name,v.field],[930,0,30,true,true,true,2,'J',false]);
  t.hp=1; assert.equal(v.hp,930);                                        // foto não muda quando a regra segue em frente
  const seen=[]; w.BUS.on('unidade',e=>seen.push(e)); w.fieldA={owner:t}; w.mostra(t);
  assert.equal(seen[0].u,t); assert.equal(seen[0].v.hp,1); assert.equal(seen[0].v.field,true);
  const ck=[]; w.BUS.on('chakra',e=>ck.push(e)); w.chakra={p:60,e:20}; w.mostraChakra(); w.chakra.p=0;
  assert.deepEqual([ck[0].p,ck[0].e],[60,20]); }

// a HUD (upd) e a barra de jutsus (drawJ) desenham SÓ pela cópia (u.v / vChakra): nada de ler a unidade da regra
{ const body=(file,name)=>{ const t=fs.readFileSync(path.join(ROOT,file),'utf8'), i=t.indexOf(`function ${name}(`);
    assert.ok(i>=0,`${name} sumiu de ${file}`); return t.slice(i,t.indexOf('\n}',i)); };
  for(const [file,name] of [['js/battle.js','upd'],['js/combat.js','drawJ']]){ const b=body(file,name);
    for(const bad of ['u.hp','u.max','u.shield','u.shM','u.alive','u.stunned','u.armedSkill','u.cd','u.dot','u.seal','u.blind','u.sleep','u.power',
                      'chakra[','canPrepareJutsu','selectedJutsu','availableJutsu','fieldA'])
      assert.ok(!b.replace(/u\.v\b/g,'').includes(bad),`${name} (${file}) lê ${bad} da regra; use a cópia da tela`); } }

console.log('ok');
