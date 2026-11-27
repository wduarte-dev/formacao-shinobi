// regra.js — regra de combate pura (fatia 1 da separação lógica/apresentação): sem DOM, sem som, sem sleep.
// A regra muda o estado e ANUNCIA o que aconteceu num emissor de eventos (BUS); quem quiser escuta:
// a apresentação (combat.js: som, texto flutuante, tranco, barra), o Campo de Provas (prova.js) e os testes em Node.
// Eventos (payload com as unidades, não com o DOM):
//   'acao'      {u,sk,isJ}                       vez de um ninja (doSkill começou)
//   'dano'      {t,d,esc,cls,hp,hp0,adv,evt,impact,woke,died,clone}  dano aplicado (d = depois do escudo)
//   'substitui' {t,clone}                        Substituição do Utsushi engoliu o golpe
//   'estado'    {t,s}                            estado D/L/V/R aplicado ('imune' no Kazan)
//   'persegue'  {side,t,n}                       um passo de perseguição começou (antes de saber se alguém entra)
//   'perseguidor' {side,c,t,n,cause,mult,hits}   a regra escolheu quem persegue (n = passo do combo, mult = dano total do passo)
//   'tsunami'   {c,t,alvos,mult}                 a Onda virou Tsunami (alvos = time inteiro, mult = dano em cada um que não é o alvo)
//   'perseguiu' {c,t,n,connected,s,next}         fim do passo: s = estado a aplicar (cause / null = solta / undefined = nada), next = segue o combo
//   'rodada'    {}                               rodada nova (antes do log)
//   'unidade'   {u,v}                            foto do que a HUD mostra de u (v = vista(u)); a tela guarda em u.v e desenha SÓ dela
//   'chakra'    {p,e}                            chakra dos dois times mudou (a tela guarda em vChakra)
// Cópia da tela (fatia 3a): a apresentação nunca lê vida/escudo/chakra da unidade da regra, só a última foto anunciada.
// Assim, quando o motor passar a simular adiantado (3b), a HUD mostra o momento que está sendo TOCADO, não o futuro.
// Perseguição (fatia 2): a regra só DECIDE (chaseStart/chaseTsunami/chaseOutcome); chain() em combat.js anima e executa o decidido.
// Dívida das próximas fatias: vanishClone (state.js) e refundJutsu (combat.js) ainda são chamados daqui.
"use strict";
const BUS={ L:{},
  on(k,fn){ (this.L[k]||(this.L[k]=[])).push(fn); return fn; },
  off(k,fn){ if(this.L[k])this.L[k]=this.L[k].filter(f=>f!==fn); },
  emit(k,o={}){ const L=this.L[k]; if(L)for(const f of L.slice())f(o); return o; } };

// foto da HUD: valores (cópia), nunca a referência do objeto da regra (o jutsu armado é dado fixo de N, pode ir por referência)
function vista(u){
  return {hp:u.hp,max:u.max,shield:u.shield,shM:u.shM,alive:u.alive,stunned:!!u.stunned,dot:!!u.dot,
    seal:u.seal|0,blind:u.blind|0,sleep:u.sleep|0,cd:u.cd|0,armed:u.armedSkill||null,power:!!u.power,field:fieldA?.owner===u};
}
// curva de chakra (regra do jogo, dos dois times; dono 28/11): a luta começa em CHAKRA_START e cada rodada dá 20, 20, 40, 40, 60, 60, 80… (sobe 20 a cada 2 rodadas); teto do chakra 100
const CHAKRA_START=0, CHAKRA_MAX=100, chakraGain=r=>20*Math.ceil(r/2);
function mostra(u){ BUS.emit('unidade',{u,v:vista(u)}); }
function mostraChakra(){ BUS.emit('chakra',{p:chakra.p,e:chakra.e}); }

// triângulo elemental (docs/referencia-no.md §15): Fogo>Vento>Raio>Terra>Água>Fogo; Névoa e Gelo herdam Água, Som herda Vento; Espaço e Veneno neutros
const ELBASE={Fogo:'Fogo','Vento':'Vento',Raio:'Raio',Terra:'Terra','Água':'Água','Névoa':'Água',Gelo:'Água',Som:'Vento'}, ELBEAT={Fogo:'Vento',Vento:'Raio',Raio:'Terra',Terra:'Água','Água':'Fogo'}, ELADV=1.25, ELDIS=.8;
function elemMul(a,t,el=a.d.el){ const x=ELBASE[el], y=ELBASE[t.d.el]; if(!x||!y)return 1; if(ELBEAT[x]===y)return ELADV; if(ELBEAT[y]===x)return ELDIS; return 1; }
function damageRoll(atk,def,element,form,aura,mult,field,roll){
  return Math.max(1,Math.round(element*atk*form*aura*mult*field*(.92+roll*.16)*100/(100+def)));
}
function landHit(a,t,m,basic,cls,area=false,el,impact){
  if(t.d.passive==='Substituição'&&t.subRound!==round){
    const clone=livingClones(t)[0];
    if(clone){
      t.subRound=round; hitsR[curSide]++;
      BUS.emit('substitui',{t,clone});   // a apresentação põe o clone na cena antes de ele sumir
      vanishClone(clone); return null;
    }
  }
  const element=el??a.d.el, factor=elemMul(a,t,element);
  const damage=damageRoll(a.atk,t.def,factor,1+(unl(a)?.uDmg||0),1+(a.power?.dmg||0),m,fieldMul(a,basic),battleRandom());
  const adv=Math.sign(factor-1);
  const evt=adv>0?`${element} vence ${t.d.el}`:adv<0?`${t.d.el} resiste a ${element}`:'';
  return hurt(t,area&&t.owner?Math.max(damage,t.hp+t.shield):damage,cls,{adv,evt,impact});
}
// aplica o dano: escudo, vida, sono, contador de hits, morte. Devolve o dano que passou do escudo.
function hurt(t,d,cls,{pierce=false,adv=0,evt='',impact}={}){
  const cost=cls==='cost', sh0=t.shield, hp0=t.hp;
  let r=d; if(!pierce&&t.shield>0){const ab=Math.min(t.shield,r); t.shield-=ab; r-=ab;}
  const e={t,d:r,esc:sh0-t.shield,shHit:!pierce&&sh0>0,cls:cls||'',hp0,adv,evt,impact,woke:false,died:false,clone:false};
  if(cost) t.hp-=r;
  else{
    if(r>0&&cls!=='dot'&&t.sleep>0&&t.alive){ t.sleep=0; e.woke=true; }
    t.hp=Math.max(0,t.hp-r);
    if(cls!=='dot')hitsR[curSide]++;
    if(t.hp<=0&&t.owner){ e.clone=true; vanishClone(t); }
    else if(t.hp<=0&&t.alive){ e.died=true; e.wasMark=t===mark;
      t.alive=false; t.dot=null; clearStatus(t); if(t===mark)mark=null; t.stunned=false; t.state=null; refundJutsu(t); }
  }
  e.hp=t.hp; e.v=vista(t); BUS.emit('dano',e); return r;
}

// ── perseguição: decisão pura ──
// pode perseguir: vivo, não perseguiu na rodada, não paralisado, e o 'on' bate com o estado do alvo
const canChase=(u,state)=>u.alive&&!u.chaseUsed&&!u.stunned&&u.d.chase?.on===state;
// passo novo: anuncia, escolhe o primeiro apto na ordem das casas, gasta a perseguição dele e fixa o multiplicador (+10% por passo)
function chaseStart(side,t,count){
  BUS.emit('persegue',{side,t,n:count});
  const c=byFormationCell(team(side)).find(x=>canChase(x,t.state));
  if(!c)return null;
  c.chaseUsed=true;
  const CH=c.d.chase, n=count+1;
  return BUS.emit('perseguidor',{side,c,t,n,cause:CH.cause,mult:CH.mult*(1+.1*(n-1)),hits:CH.hits||[0]});
}
// sorteio do Tsunami (Mizuha). Chamado no MESMO ponto da animação de antes (depois da aproximação), pra não mudar a ordem do battleRandom.
function chaseTsunami(ch){
  const c=ch.c, CH=c.d.chase;
  ch.tsu=!!(CH.tsunami&&battleRandom()<CH.tsunami&&foes(c).length>1);
  ch.alvos=ch.tsu?foes(c):[]; ch.tsMult=CH.mult*.6;
  if(ch.tsu)BUS.emit('tsunami',{c,t:ch.t,alvos:ch.alvos,mult:ch.tsMult});
  return ch.tsu;
}
// fim do passo: acertou → aplica o 'cause' (se o alvo vive) e o combo segue; errou (substituição/esquiva) → alvo solta o estado
function chaseOutcome(ch,connected){
  const t=ch.t;
  ch.connected=connected;
  ch.s=connected?(t.alive?ch.cause:undefined):null;
  ch.next=connected&&t.alive;
  BUS.emit('perseguiu',ch);
  return ch;
}
