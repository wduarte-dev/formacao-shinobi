// data.js — dados: estados, alvos, ninjas (N), missões (FOES), save
"use strict";
// hits:[...] = em que fração da animação cai cada soco (o dano do golpe é dividido entre eles). Sem hits = 1 soco no meio da anim.
// strong = golpe Forte: cada ação sem jutsu tem STRONG_CHANCE (30%) de virar ele (anim 'strong' do atlas). chase.mv = dinâmica da perseguição: 'slam' (salta alto e despenca no alvo), 'rise' (golpe que sobe junto com o alvo).
// combo = perseguição por combo (Onda 6): dispara 1x/rodada logo após a ação em que o 'N Hit' do time chega a `at` (hoje 10, 12, 15 ou 18).
//   target 'random' (n alvos distintos) ou 'all' quando não encadeia; 'mark' (alvo marcado, senão aleatório) quando tem `cause` e abre a cadeia por estado.
//   star = só libera com essa estrela (sem sistema de estrelas ainda: só no Modo dev); use = executa outra habilidade do ninja (Kazan: volley).
// L = Lançado baixo (rasteira, anim 'trip' quando o sprite chegar); V = Voo (flutuação alta, o antigo Lançado).
const ST={D:'Derrubado',L:'Lançado',V:'Voo',R:'Repelido'};
const TG={random:'inimigo aleatório',mark:'alvo marcado (senão aleatório)',front:'frente da fileira',row:'fileira inteira',all:'todos os inimigos',weak:'inimigo mais fraco',allies:'todos os aliados',self:'o próprio ninja'};
const N={
 kaen:{name:'Kaen',el:'Fogo',c:'#e5533d',role:'Atacante',hp:950,atk:135,def:20,
  normal:{name:'Corte Ardente',mult:1,target:'front'},
  strong:{name:'Corte Flamejante',an:'atk3',mult:1.4,target:'front',customSfx:false},
  jutsu:{name:'Dragão de Brasa',cost:40,cd:3,mult:1.5,target:'row',cause:'R',an:'atk2',dot:{mult:.35,rounds:2},desc:'queima a fileira'},
  chase:{name:'Chute Meteoro',on:'V',cause:'D',mult:.7},
  combo:{name:'Chuva de Brasas',at:18,star:2,target:'all',ranged:true,an:'atk2',mult:.5,dot:{mult:.25,rounds:2}}},
 mizuha:{name:'Mizuha',el:'Água',c:'#3d8fe5',role:'Suporte',hp:900,atk:95,def:25,
  normal:{name:"Jato d'Água",mult:.9,target:'front',ranged:true},
  jutsu:{name:'Chuva Serena',cost:40,cd:3,target:'allies',heal:2.5,desc:'cura o time'},
  chase:{name:'Onda',on:'D',cause:'R',mult:.7,surge:1,cast:1,tsunami:.25}},   // cast: invoca de longe (anim de jutsu), não vai socar
 raiden:{name:'Raiden',el:'Raio',c:'#e5c33d',role:'Atacante',hp:850,atk:125,def:15,
  normal:{name:'Faísca',mult:1,target:'front',hits:[.28,.53]},
  jutsu:{name:'Lâmina Trovão',cost:40,cd:3,mult:1.7,target:'front',cause:'V',stun:true,desc:'paralisa o alvo (não persegue)'},
  chase:{name:'Gancho Relâmpago',on:'R',cause:'V',mult:.7},
  combo:{name:'Corrente Trovão',at:15,target:'random',n:3,ranged:true,an:'atk2',mult:.6}},
 iwao:{name:'Iwao',el:'Terra',c:'#b08a58',role:'Tanque',hp:1500,atk:85,def:50,
  normal:{name:'Golpe de Pedra',mult:.9,target:'front',cause:'D',hits:[.4,.65]},
  jutsu:{name:'Muralha de Pedra',cost:30,cd:3,target:'allies',shield:2.5,desc:'escudo para o time (2 rodadas, não acumula)'},
  strong:{name:'Punho de Pedra',an:'atk3',mult:1.4,target:'front',cause:'R'},
  chase:{name:'Esmagar',on:'R',cause:'D',mult:.7,mv:'slam',hits:[.45]}},
 fuuka:{name:'Fuuka',el:'Vento',c:'#5fc9a0',role:'Atacante',hp:800,atk:120,def:15,dodge:8,
  normal:{name:'Rajada Leve',mult:.4,target:'all',ranged:true},
  jutsu:{name:'Tufão Cortante',cost:40,cd:4,mult:1,target:'all',cause:'V',dispel:true,an:'atk2',desc:'acerta todos e dissipa o campo'},
  strong:{name:'Corte Giratório',an:'atk3',mult:1.5,target:'front',cause:'D'},
  chase:{name:'Redemoinho',on:'D',cause:'V',mult:.7,mv:'rise',hits:[.4]},
  combo:{name:'Corte Rasante',at:10,star:2,target:'mark',cause:'L',an:'atk3',mult:.7}},
 mayoi:{name:'Mayoi',el:'Névoa',c:'#b79ae0',role:'Esquiva/campo',hp:780,atk:110,def:15,dodge:15,
  normal:{name:'Bengala e Mariposas',mult:.9,target:'front'},
  jutsu:{name:'Noite de Névoa',cost:40,cd:5,target:'allies',field:3,an:'atk2',desc:'campo de 3 rodadas',
   fieldFx:{visual:'mist',dodge:25,ally:{Gelo:1.15},foe:{Fogo:.85},dot:{Veneno:1}}},   // dentro do campo: dono +25 de esquiva; Gelo aliado +15% no básico; Fogo inimigo -15%; veneno aliado +1 rodada
  strong:{name:'Onda de Névoa',an:'atk3',mult:1.3,target:'front',ranged:true},
  chase:{name:'Tempestade de Mariposas',on:'V',cause:'R',mult:.7,ranged:true}},
 hiyori:{name:'Hiyori',el:'Gelo',c:'#7fd3e8',role:'Controle',hp:880,atk:105,def:25,dodge:10,
  normal:{name:'Combo de Lâmina de Gelo',mult:1.05,target:'front',hits:[.28,.53,.65]},
  jutsu:{name:'Prisão de Gelo',cost:20,cd:4,mult:1,target:'front',cause:'D',stun:true,an:'atk2',cast:1,desc:'paralisa o alvo'},
  strong:{name:'Toque Congelante',an:'atk3',mult:1.4,target:'front',stun:true},
  chase:{name:'Pilar de Gelo',on:'D',cause:'V',mult:.7,mv:'rise'}},
 doku:{name:'Doku',el:'Veneno',c:'#a46be0',role:'Desgaste',hp:900,atk:100,def:20,dodge:5,
  normal:{name:'Arremesso de Frascos',mult:.8,target:'front',ranged:true,hits:[.35,.7],dot:{mult:.2,rounds:1},split:.2,splitName:'CHUVA DE FRASCOS!'},   // 20%: o frasco se multiplica e acerta todos (mesmo dano)
  jutsu:{name:'Névoa Tóxica',cost:40,cd:3,mult:.6,target:'all',cause:'R',dot:{mult:.4,rounds:3},desc:'envenena todos'},
  strong:{name:'Agulhas',an:'atk3',mult:1.4,target:'front',dot:{mult:.35,rounds:2}},
  chase:{name:'Ferrão',on:'V',cause:'D',mult:.7},
  combo:{name:'Chuva Ácida',at:12,star:2,target:'random',n:2,ranged:true,an:'atk2',mult:.5,dot:{mult:.3,rounds:2}}},
 yugami:{name:'Yugami',el:'Espaço',c:'#f2c14e',role:'Distorção',hp:860,atk:112,def:18,dodge:12,
  normal:{name:'Corte Dimensional',mult:1,target:'front'},
  jutsu:{name:'Lacre Rompido',cost:30,cd:6,target:'self',unleash:3,uDmg:.35,uDodge:20,an:'atk2',desc:'tira o capuz: +35% de dano e +20% de esquiva por 3 rodadas'},
  strong:{name:'Dupla Fenda',an:'atk3',mult:1.5,target:'front'},
  chase:{name:'Passo Dimensional',on:'D',cause:'R',mult:.7,hits:[.53]}},
 // size = multiplicador do sprite (barra de vida, alcance do golpe e retratos acompanham). Poko: louva-a-deus de Som, bloqueado até vencer a missão 3.
 poko:{name:'Poko',el:'Som',c:'#e8b83a',role:'Velocista',hp:820,atk:115,def:15,dodge:15,size:1.2,
  normal:{name:'Rufo de Foices',mult:1.05,target:'front',hits:[.2,.35,.5,.65,.8]},
  jutsu:{name:'Zumbido Ensurdecedor',cost:40,cd:4,mult:.8,target:'all',stun:'all',an:'atk2',wave:1,desc:'paralisa todos (não perseguem)'},
  strong:{name:'Estridulação',an:'atk3',mult:1.4,target:'front',ranged:true,cause:'R'},
  chase:{name:'Ceifa Relâmpago',on:'R',cause:'V',mult:.7,mv:'rise'}},
 utsushi:{name:'Utsushi',el:'Vento',c:'#9fb0bd',role:'Invocador de clones',passive:'Substituição',hp:760,atk:95,def:12,dodge:20,sfxEl:'Vento',
  normal:{name:'Combo do Vendaval',target:'front',cause:'V',mult:.3,sequence:['atk1','attackB','attackC'],hits:[.54,.54,.54],contactY:[-78,-16,-110]},
  jutsu:{name:'Legião de Ventos',target:'self',clones:3,duration:3,cost:35,cd:3,desc:'invoca até três clones nas casas livres por três rodadas. Relançar restaura os clones e renova a duração'},
  strong:{name:'Rajada Torta',an:'atk3',target:'front',mult:1.4},
  chase:{name:'Rajada Fantasma',cloneHit:.55,on:'V',cause:'R',mult:.8,phases:['chase1','chase2','chase3'],kick:{frame:2,foot:[137,96]}}},
 kazan:{name:'Kazan',el:'Fogo',c:'#e0701c',role:'Ferreiro de campo',hp:850,atk:100,def:14,dodge:0,
  stationary:true,immuneState:true,
  normal:{name:'Martelada da Forja',el:'Terra',mult:.6,target:'random',twoFlames:.75,burnChance:.5},
  jutsu:{name:'Plano da Forja',cost:30,cd:0,target:'allies',instant:true,field:3,
   fieldFx:{visual:'forge',allyAll:{Fogo:1.15},chakra:10},
   desc:'3 rodadas de forja: +15% de dano para aliados de Fogo e +10 de chakra por rodada. Reative para lançar o Dragão de Lava'},
  recast:{name:'Dragão de Lava',cost:20,cd:2,target:'all',instant:true,mult:.9,cause:'R',cutin:'kazan_dragon_cutin',
   desc:'consome o Plano, repele e queima todos os inimigos'},
  volley:{name:'Bola de Fogo',target:'random',mult:.25,shots:4},
  combo:{name:'Bola de Fogo',at:10,use:'volley'}},   // perseguição por combo que executa o volley do Kazan
 keshin:{name:'Keshin',el:'Neutro',c:'#e8803a',role:'Atacante de combos',hp:940,atk:115,def:20,dodge:8,sfxEl:'Raio',
  normal:{name:'Combo Relâmpago',target:'front',cause:'V',mult:.3,sequence:['atk1','attackB','attackC'],hits:[.54,.54,.54],contactY:[-75,-89,-67]},
  jutsu:{name:'Aura Relâmpago',target:'self',instant:true,cost:30,cd:2,lifeCost:.18,
   aura:{rounds:3,bonusHits:[1,2,3],dmg:.2},
   desc:'instantâneo, mantém a ação. Dá +1/+2/+3 golpes e +20% de dano por 3 rodadas. Custa 18% da vida máxima, ignora escudo e deixa pelo menos 1 PV'},
  chase:{name:'Bomba Dinamite',on:'V',cause:'D',mult:.8,phases:['chase1','chase2','chase3'],kick:{frame:1,foot:[122,56],landing:4}},
  combo:{name:'Rasteira Dinamite',at:10,target:'mark',cause:'L',an:'atk3',mult:.7}},
 // Mestre da Academia: chefão dos Testes de Perseguição (npc: fora da Formação e da Galeria). Atlas de reserva = Keshin em cinza (spr/mestre_atlas.png) até ele gerar o sprite.
 mestre:{name:'Mestre ???',el:'Neutro',c:'#9a9a9a',role:'Mestre da Academia',npc:true,customSfx:false,sfxEl:'Raio',hp:20000,atk:110,def:20,dodge:0,
  normal:{name:'Palma do Mestre',target:'front',mult:1},
  strong:{name:'Varredura',an:'atk3',mult:1.3,target:'front',cause:'D'},
  jutsu:{name:'Selo Final',cost:0,cd:0,target:'random',mult:.2,cast:1,an:'atk2',charge:3,instakill:true,desc:'carrega 3 rodadas e derruba um ninja aleatório; recomeça'},
  chase:{name:'Lição Final',on:'D',cause:'R',mult:.8}}
};
// golpe Forte: chance por ação sem jutsu (antes era toda 3ª ação; decisão dele 26/11/2026, igual pra todos)
const STRONG_CHANCE=.3;
const formationCellNumber=({row,depth})=>depth*3+row+1;
const byFormationCell=units=>[...units].sort((a,b)=>formationCellNumber(a)-formationCellNumber(b));

// Teste de Perseguição (Academia): meta = UMA cadeia de "goal" perseguições seguidas; extras: fire = time com ninja de Fogo, jutsu = a cadeia abre por jutsu.
// reward: gancho pra recompensa futura (vazio por enquanto; hoje só a estrela salva em acadDone)
const ACAD=[
 {name:'Cadeia de 2',goal:2},
 {name:'Cadeia de 2 com ninja de Fogo',goal:2,fire:true},
 {name:'Cadeia de 3',goal:3},
 {name:'Cadeia de 3 abrindo por jutsu',goal:3,jutsu:true},
 {name:'Cadeia de 4',goal:4}
].map(c=>({...c,reward:null}));
const ACAD_FOE={name:'Teste de Perseguição',lvl:'Academia',bg:'dojo',mult:1,ai:1,team:[['mestre',1,0]]};
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
const IDS=Object.keys(N).filter(id=>!N[id].npc);

/* ================= ESTADO SALVO ================= */
// chance (%) de resistir a um status (atordoar, veneno, Selamento, Cegueira, Sono): tanque 30, atacante 15, suporte/controle 20, esquiva/velocista 10
const RES={iwao:30,kazan:30,kaen:15,raiden:15,fuuka:15,keshin:15,mestre:30,mizuha:20,hiyori:20,doku:20,yugami:20,utsushi:20,mayoi:10,poko:10};
const resOf=u=>RES[u.id]??20;
const VERSION={v:'1.16',d:'27/11/2026'};   // sobe com tools/bump_version.py (junto com version.json)
let acadDone=[], acad=null;   // estrelas dos Testes de Perseguição (índices) e o teste em andamento (null = missão normal)
let placed=[], unlocked=0, sel='kaen', foeIx=0, lite=false, own=[], dev=false;   // own: ninjas bloqueados já liberados; dev: Modo dev (libera tudo)
const have=id=>!LOCK[id]||dev||own.includes(id);
function normalizeSave(s, lowMemory){
  const own=Array.isArray(s?.own)?[...new Set(s.own.filter(id=>Object.hasOwn(LOCK,id)))]:[];
  const dev=s?.dev===true, placed=[], occupied=new Set(), ids=new Set();
  for(const p of Array.isArray(s?.placed)?s.placed:[]){
    if(placed.length===4)break;
    if(!p||!IDS.includes(p.id)||ids.has(p.id)||(!dev&&Object.hasOwn(LOCK,p.id)&&!own.includes(p.id)))continue;
    const {id,row,depth}=p;
    if(!Number.isInteger(row)||row<0||row>2||!Number.isInteger(depth)||depth<0||depth>2)continue;
    const house=formationCellNumber(p);
    if(occupied.has(house))continue;
    occupied.add(house); ids.add(id); placed.push({id,row,depth});
  }
  const unlocked=Number.isInteger(s?.unlocked)?Math.max(0,Math.min(FOES.length-1,s.unlocked)):0;
  const acadDone=Array.isArray(s?.acadDone)?[...new Set(s.acadDone.filter(i=>Number.isInteger(i)&&i>=0&&i<ACAD.length))]:[];
  return {placed,unlocked,lite:typeof s?.lite==='boolean'?s.lite:lowMemory,own,dev,acadDone};
}
function readSave(){
  let saved;
  try{ saved=JSON.parse(localStorage.getItem('shinobi-save')); }
  catch(error){ console.warn('Falha ao ler o save local.',error); }
  return normalizeSave(saved,!!navigator.deviceMemory&&navigator.deviceMemory<=4);
}
({placed,unlocked,lite,own,dev,acadDone}=readSave());
function save(){
  try{ localStorage.setItem('shinobi-save',JSON.stringify({schema:1,placed,unlocked,lite,own,dev,acadDone})); }
  catch(error){ console.warn('Falha ao gravar o save local.',error); }
}

document.body.classList.toggle('lite',lite);
