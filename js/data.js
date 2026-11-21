// data.js — dados: estados, alvos, ninjas (N), missões (FOES), save
"use strict";
const ST={D:'Derrubado',L:'Lançado',R:'Repelido'};
const TG={front:'frente da fileira',row:'fileira inteira',all:'todos os inimigos',weak:'inimigo mais fraco',allies:'todos os aliados'};
const N={
 kaen:{name:'Kaen',el:'Fogo',c:'#e5533d',role:'Atacante',hp:950,atk:135,def:20,
  normal:{name:'Corte Ardente',mult:1,target:'front'},
  jutsu:{name:'Dragão de Brasa',cost:40,cd:3,mult:1.5,target:'row',cause:'R',dot:{mult:.35,rounds:2},desc:'queima a fileira'},
  chase:{name:'Chute Meteoro',on:'L',cause:'D',mult:.7}},
 mizuha:{name:'Mizuha',el:'Água',c:'#3d8fe5',role:'Suporte',hp:900,atk:95,def:25,
  normal:{name:"Jato d'Água",mult:.9,target:'front',ranged:true},
  jutsu:{name:'Chuva Serena',cost:40,cd:3,target:'allies',heal:2.5,desc:'cura o time'},
  chase:{name:'Onda',on:'D',cause:'R',mult:.7}},
 raiden:{name:'Raiden',el:'Raio',c:'#e5c33d',role:'Atacante',hp:850,atk:125,def:15,
  normal:{name:'Faísca',mult:1,target:'front'},
  jutsu:{name:'Lâmina Trovão',cost:40,cd:3,mult:1.7,target:'front',cause:'L',stun:true,desc:'paralisa o alvo'},
  chase:{name:'Gancho Relâmpago',on:'R',cause:'L',mult:.7}},
 iwao:{name:'Iwao',el:'Terra',c:'#b08a58',role:'Tanque',hp:1500,atk:85,def:50,
  normal:{name:'Golpe de Pedra',mult:.9,target:'front',cause:'D'},
  jutsu:{name:'Muralha de Pedra',cost:20,cd:3,target:'allies',shield:2.5,desc:'escudo para o time'},
  chase:{name:'Esmagar',on:'R',cause:'D',mult:.7}},
 fuuka:{name:'Fuuka',el:'Vento',c:'#5fc9a0',role:'Atacante',hp:800,atk:120,def:15,dodge:8,
  normal:{name:'Rajada Leve',mult:.4,target:'all',ranged:true},
  jutsu:{name:'Tufão Cortante',cost:40,cd:4,mult:1,target:'all',cause:'L',dispel:true,an:'atk2',desc:'acerta todos e dissipa o campo'},
  chase:{name:'Redemoinho',on:'D',cause:'L',mult:.7}},
 mayoi:{name:'Mayoi',el:'Névoa',c:'#b79ae0',role:'Esquiva/campo',hp:780,atk:110,def:15,dodge:15,
  normal:{name:'Bengala e Mariposas',mult:.9,target:'front'},
  jutsu:{name:'Noite de Névoa',cost:40,cd:5,target:'allies',field:3,an:'atk2',desc:'campo de 3 rodadas'},
  chase:{name:'Tempestade de Mariposas',on:'L',cause:'R',mult:.7,ranged:true}},
 hiyori:{name:'Hiyori',el:'Gelo',c:'#7fd3e8',role:'Controle',hp:880,atk:105,def:25,dodge:10,
  normal:{name:'Combo de Lâmina de Gelo',mult:1.05,target:'front'},
  jutsu:{name:'Prisão de Gelo',cost:20,cd:4,mult:1,target:'front',cause:'D',stun:true,an:'atk2',desc:'paralisa o alvo'},
  chase:{name:'Pilar de Gelo',on:'D',cause:'L',mult:.7}},
 doku:{name:'Doku',el:'Veneno',c:'#9bc53d',role:'Desgaste',hp:900,atk:100,def:20,
  normal:{name:'Agulha Tóxica',mult:.8,target:'front',ranged:true,dot:{mult:.25,rounds:2}},
  jutsu:{name:'Névoa Tóxica',cost:40,cd:3,mult:.6,target:'all',cause:'R',dot:{mult:.4,rounds:3},desc:'envenena todos'},
  chase:{name:'Ferrão',on:'L',cause:'D',mult:.7}}
};

const FOES=[
 {name:'Patrulha da Névoa',lvl:'Fácil',bg:'vila',mult:.8,ai:.4,team:[['iwao',1,0],['kaen',0,1],['doku',2,1],['mizuha',1,2]]},
 {name:'Esquadrão Trovão',lvl:'Médio',bg:'santuario',mult:1,ai:.7,team:[['iwao',1,0],['fuuka',0,1],['raiden',2,0],['hiyori',1,2]]},
 {name:'Irmandade do Gelo',lvl:'Médio',bg:'noite',mult:1.05,ai:.85,team:[['hiyori',1,0],['raiden',0,0],['doku',2,1],['mizuha',1,2]]},
 {name:'Guarda Sombria',lvl:'Difícil',bg:'floresta',mult:1.15,ai:1,team:[['iwao',1,0],['fuuka',0,2],['kaen',2,0],['mayoi',1,1]]},
 {name:'Mestres das Cinzas',lvl:'Muito difícil',bg:'cinzas',mult:1.3,ai:1,team:[['iwao',1,0],['kaen',0,0],['mayoi',2,1],['hiyori',1,2]]}
];
const $=id=>document.getElementById(id);
const IDS=Object.keys(N);

/* ================= ESTADO SALVO ================= */
let placed=[], unlocked=0, sel='kaen', foeIx=0;
try{const s=JSON.parse(localStorage.getItem('shinobi-save'));
  if(s){ if(Array.isArray(s.placed)&&s.placed.every(p=>N[p.id]))placed=s.placed.slice(0,4); unlocked=Math.max(0,Math.min(FOES.length-1,s.unlocked|0)); }}catch(e){}
function save(){try{localStorage.setItem('shinobi-save',JSON.stringify({placed,unlocked}));}catch(e){}}

/* ================= SPRITES ================= */
