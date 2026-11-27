// regra.js — regra de combate pura (fatia 1 da separação lógica/apresentação): sem DOM, sem som, sem sleep.
// A regra muda o estado e ANUNCIA o que aconteceu num emissor de eventos (BUS); quem quiser escuta:
// a apresentação (combat.js: som, texto flutuante, tranco, barra), o Campo de Provas (prova.js) e os testes em Node.
// Eventos (payload com as unidades, não com o DOM):
//   'acao'      {u,sk,isJ}                       vez de um ninja (doSkill começou)
//   'dano'      {t,d,esc,cls,hp,hp0,adv,evt,impact,woke,died,clone}  dano aplicado (d = depois do escudo)
//   'substitui' {t,clone}                        Substituição do Utsushi engoliu o golpe
//   'estado'    {t,s}                            estado D/L/V/R aplicado ('imune' no Kazan)
//   'persegue'  {side,t,n}                       um passo de perseguição começou
//   'rodada'    {}                               rodada nova (antes do log)
// Dívida das próximas fatias: vanishClone (state.js) e refundJutsu (combat.js) ainda são chamados daqui.
"use strict";
const BUS={ L:{},
  on(k,fn){ (this.L[k]||(this.L[k]=[])).push(fn); return fn; },
  off(k,fn){ if(this.L[k])this.L[k]=this.L[k].filter(f=>f!==fn); },
  emit(k,o={}){ const L=this.L[k]; if(L)for(const f of L.slice())f(o); return o; } };

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
  e.hp=t.hp; BUS.emit('dano',e); return r;
}
