// data.js — dados: estados, alvos, ninjas (N), missões (FOES), save
"use strict";
// hits:[...] = em que fração da animação cai cada soco (o dano do golpe é dividido entre eles). Sem hits = 1 soco no meio da anim.
// strong = golpe Forte: toda 3ª ação sem jutsu o básico vira ele (anim 'strong' do atlas). chase.mv = dinâmica da perseguição: 'slam' (salta alto e despenca no alvo), 'rise' (golpe que sobe junto com o alvo).
const ST={D:'Derrubado',L:'Lançado',R:'Repelido'};
const TG={front:'frente da fileira',row:'fileira inteira',all:'todos os inimigos',weak:'inimigo mais fraco',allies:'todos os aliados',self:'o próprio ninja'};
const N={
 kaen:{name:'Kaen',el:'Fogo',c:'#e5533d',role:'Atacante',hp:950,atk:135,def:20,
  normal:{name:'Corte Ardente',mult:1,target:'front',hits:[.3,.7]},
  jutsu:{name:'Dragão de Brasa',cost:40,cd:3,mult:1.5,target:'row',cause:'R',an:'atk2',dot:{mult:.35,rounds:2},desc:'queima a fileira'},
  chase:{name:'Chute Meteoro',on:'L',cause:'D',mult:.7}},
 mizuha:{name:'Mizuha',el:'Água',c:'#3d8fe5',role:'Suporte',hp:900,atk:95,def:25,
  normal:{name:"Jato d'Água",mult:.9,target:'front',ranged:true},
  jutsu:{name:'Chuva Serena',cost:40,cd:3,target:'allies',heal:2.5,desc:'cura o time'},
  chase:{name:'Onda',on:'D',cause:'R',mult:.7,surge:1,cast:1,tsunami:.25}},   // cast: invoca de longe (anim de jutsu), não vai socar
 raiden:{name:'Raiden',el:'Raio',c:'#e5c33d',role:'Atacante',hp:850,atk:125,def:15,
  normal:{name:'Faísca',mult:1,target:'front',hits:[.3,.6]},
  jutsu:{name:'Lâmina Trovão',cost:40,cd:3,mult:1.7,target:'front',cause:'L',stun:true,desc:'paralisa o alvo (não persegue)'},
  chase:{name:'Gancho Relâmpago',on:'R',cause:'L',mult:.7}},
 iwao:{name:'Iwao',el:'Terra',c:'#b08a58',role:'Tanque',hp:1500,atk:85,def:50,
  normal:{name:'Golpe de Pedra',mult:.9,target:'front',cause:'D',hits:[.25,.58]},
  jutsu:{name:'Muralha de Pedra',cost:30,cd:3,target:'allies',shield:2.5,desc:'escudo para o time (2 rodadas, não acumula)'},
  strong:{name:'Punho de Pedra',an:'atk3',mult:1.4,target:'front',cause:'R'},
  chase:{name:'Esmagar',on:'R',cause:'D',mult:.7,mv:'slam',hits:[.42]}},
 fuuka:{name:'Fuuka',el:'Vento',c:'#5fc9a0',role:'Atacante',hp:800,atk:120,def:15,dodge:8,
  normal:{name:'Rajada Leve',mult:.4,target:'all',ranged:true},
  jutsu:{name:'Tufão Cortante',cost:40,cd:4,mult:1,target:'all',cause:'L',dispel:true,an:'atk2',desc:'acerta todos e dissipa o campo'},
  strong:{name:'Corte Giratório',an:'atk3',mult:1.5,target:'front',cause:'D'},
  chase:{name:'Redemoinho',on:'D',cause:'L',mult:.7,mv:'rise'}},
 mayoi:{name:'Mayoi',el:'Névoa',c:'#b79ae0',role:'Esquiva/campo',hp:780,atk:110,def:15,dodge:15,
  normal:{name:'Bengala e Mariposas',mult:.9,target:'front'},
  jutsu:{name:'Noite de Névoa',cost:40,cd:5,target:'allies',field:3,an:'atk2',desc:'campo de 3 rodadas',
   fieldFx:{dodge:25,ally:{Gelo:1.15},foe:{Fogo:.85},dot:{Veneno:1}}},   // dentro do campo: dono +25 de esquiva; Gelo aliado +15% no básico; Fogo inimigo -15%; veneno aliado +1 rodada
  strong:{name:'Onda de Névoa',an:'atk3',mult:1.3,target:'front',ranged:true},
  chase:{name:'Tempestade de Mariposas',on:'L',cause:'R',mult:.7,ranged:true}},
 hiyori:{name:'Hiyori',el:'Gelo',c:'#7fd3e8',role:'Controle',hp:880,atk:105,def:25,dodge:10,
  normal:{name:'Combo de Lâmina de Gelo',mult:1.05,target:'front',hits:[.25,.5,.75]},
  jutsu:{name:'Prisão de Gelo',cost:20,cd:4,mult:1,target:'front',cause:'D',stun:true,an:'atk2',cast:1,desc:'paralisa o alvo'},
  strong:{name:'Toque Congelante',an:'atk3',mult:1.4,target:'front',stun:true},
  chase:{name:'Pilar de Gelo',on:'D',cause:'L',mult:.7,mv:'rise'}},
 doku:{name:'Doku',el:'Veneno',c:'#a46be0',role:'Desgaste',hp:900,atk:100,def:20,dodge:5,
  normal:{name:'Arremesso de Frascos',mult:.8,target:'front',ranged:true,hits:[.35,.7],dot:{mult:.2,rounds:1},split:.2,splitName:'CHUVA DE FRASCOS!'},   // 20%: o frasco se multiplica e acerta todos (mesmo dano)
  jutsu:{name:'Névoa Tóxica',cost:40,cd:3,mult:.6,target:'all',cause:'R',dot:{mult:.4,rounds:3},desc:'envenena todos'},
  strong:{name:'Agulhas',an:'atk3',mult:1.4,target:'front',dot:{mult:.35,rounds:2}},
  chase:{name:'Ferrão',on:'L',cause:'D',mult:.7}},
 yugami:{name:'Yugami',el:'Espaço',c:'#f2c14e',role:'Distorção',hp:860,atk:112,def:18,dodge:12,
  normal:{name:'Corte Dimensional',mult:1,target:'front'},
  jutsu:{name:'Lacre Rompido',cost:30,cd:6,target:'self',unleash:3,uDmg:.35,uDodge:20,an:'atk2',desc:'tira o capuz: +35% de dano e +20% de esquiva por 3 rodadas'},
  strong:{name:'Dupla Fenda',an:'atk3',mult:1.5,target:'front'},
  chase:{name:'Passo Dimensional',on:'D',cause:'R',mult:.7}},
 // size = multiplicador do sprite (barra de vida, alcance do golpe e retratos acompanham). Poko: louva-a-deus de Som, bloqueado até vencer a missão 3.
 poko:{name:'Poko',el:'Som',c:'#e8b83a',role:'Velocista',hp:820,atk:115,def:15,dodge:15,size:1.2,
  normal:{name:'Rufo de Foices',mult:1.05,target:'front',hits:[.2,.35,.5,.65,.8]},
  jutsu:{name:'Zumbido Ensurdecedor',cost:40,cd:4,mult:.8,target:'all',stun:'all',an:'atk2',wave:1,desc:'paralisa todos (não perseguem)'},
  strong:{name:'Estridulação',an:'atk3',mult:1.4,target:'front',ranged:true,cause:'R'},
  chase:{name:'Ceifa Relâmpago',on:'R',cause:'L',mult:.7,mv:'rise'}},
 utsushi:{name:'Utsushi',el:'Vento',c:'#9fb0bd',role:'Invocador de clones',passive:'Substituição',hp:760,atk:95,def:12,dodge:20,sfxEl:'Vento',customSfx:false,
  normal:{name:'Combo do Vendaval',target:'front',cause:'L',mult:.3,sequence:['atk1','attackB','attackC'],hits:[.54,.54,.54],contactY:[-78,-16,-110]},
  jutsu:{name:'Legião de Ventos',target:'self',clones:3,duration:3,cost:35,cd:3,desc:'invoca até três clones nas casas livres por três rodadas. Relançar restaura os clones e renova a duração'},
  strong:{name:'Rajada Torta',an:'atk3',target:'front',mult:1.4},
  chase:{name:'Rajada Fantasma',cloneHit:.55,on:'L',cause:'R',mult:.8,phases:['chase1','chase2','chase3'],hits:[.54]}},
 keshin:{name:'Keshin',el:'Neutro',c:'#e8803a',role:'Atacante de combos',hp:940,atk:115,def:20,dodge:8,sfxEl:'Raio',
  normal:{name:'Combo Relâmpago',target:'front',cause:'L',mult:.3,sequence:['atk1','attackB','attackC'],hits:[.54,.54,.54],contactY:[-75,-89,-67]},
  jutsu:{name:'Aura Relâmpago',target:'self',instant:true,cost:30,cd:2,lifeCost:.18,
   aura:{rounds:3,bonusHits:[1,2,3],dmg:.2},
   desc:'instantâneo, mantém a ação. Dá +1/+2/+3 golpes e +20% de dano por 3 rodadas. Custa 18% da vida máxima, ignora escudo e deixa pelo menos 1 PV'},
  chase:{name:'Bomba Dinamite',on:'L',cause:'D',mult:.8,phases:['chase1','chase2','chase3'],hits:[.7]}}
};
// ninjas bloqueados: id -> missão (índice em FOES) que, vencida, libera. O Modo dev (configurações) libera todos.
const LOCK={poko:2};   // Fuuka/Hiyori/Mayoi/Doku saíram do LOCK em 22/11/2026, depois de regerados no estilo realista. Modo dev libera

const FOES=[
 {name:'Patrulha da Névoa',lvl:'Fácil',bg:'sakura',mult:.8,ai:.4,team:[['iwao',1,0],['kaen',0,1],['doku',2,1],['mizuha',1,2]]},
 {name:'Esquadrão Trovão',lvl:'Médio',bg:'santuario',mult:1,ai:.7,team:[['iwao',1,0],['fuuka',0,1],['raiden',2,0],['hiyori',1,2]]},
 {name:'Irmandade do Gelo',lvl:'Médio',bg:'noite',mult:1.05,ai:.85,team:[['hiyori',1,0],['raiden',0,0],['poko',2,1],['mizuha',1,2]],unlock:'poko'},
 {name:'Guarda Sombria',lvl:'Difícil',bg:'floresta',mult:1.15,ai:1,team:[['iwao',1,0],['fuuka',0,2],['kaen',2,0],['mayoi',1,1]]},
 {name:'Mestres das Cinzas',lvl:'Muito difícil',bg:'cinzas',mult:1.3,ai:1,team:[['iwao',1,0],['kaen',0,0],['mayoi',2,1],['hiyori',1,2]]}
];
const $=id=>document.getElementById(id);
const IDS=Object.keys(N);

/* ================= ESTADO SALVO ================= */
const VERSION={v:'1.9.3',d:'25/11/2026'};   // sobe com tools/bump_version.py (junto com version.json)
let placed=[], unlocked=0, sel='kaen', foeIx=0, lite=false, own=[], dev=false;   // own: ninjas bloqueados já liberados; dev: Modo dev (libera tudo)
const have=id=>!LOCK[id]||dev||own.includes(id);
try{const s=JSON.parse(localStorage.getItem('shinobi-save'));
  if(!s&&navigator.deviceMemory&&navigator.deviceMemory<=4)lite=true;   // aparelho com ≤4GB (ex.: Redmi 13C) já começa no modo leve; depois vale a escolha salva
  if(s){ if(Array.isArray(s.placed)&&s.placed.every(p=>N[p.id]))placed=s.placed.slice(0,4); unlocked=Math.max(0,Math.min(FOES.length-1,s.unlocked|0)); lite=!!s.lite; dev=!!s.dev; if(Array.isArray(s.own))own=s.own.filter(id=>LOCK[id]); }}catch(e){}
placed=placed.filter(p=>have(p.id));
function save(){try{localStorage.setItem('shinobi-save',JSON.stringify({placed,unlocked,lite,own,dev}));}catch(e){}}

document.body.classList.toggle('lite',lite);
