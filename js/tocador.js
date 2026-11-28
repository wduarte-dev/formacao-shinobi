// tocador.js — a tela como TOCADORA da regra (fatia 3b da separação lógica/apresentação)
// A regra (regra.js) pode resolver um trecho ADIANTADO (síncrono, sem esperar animação): tudo o que ela anuncia pra tela
// nesse trecho ('dano', 'substitui', 'unidade', 'chakra') entra na FILA, na ordem, em vez de aparecer na hora.
// A apresentação anima e, no quadro certo (contato do golpe, chegada da palma), chama tocaAte(marca) e a fila aplica
// até ali: número de dano, som, barra, foto da HUD. Assim a tela nunca mostra o futuro, por mais adiantada que a regra esteja.
//   adianta(fn)   roda fn (regra) com a fila ligada; devolve o que fn devolver
//   marca()       posição atual da fila (guarde logo depois de um landHit/hurt pra saber até onde tocar)
//   tocaAte(n)    aplica o que está na fila até a marca n;  tocaTudo() aplica o resto (fim do trecho, sempre)
//   telaOn(k,fn)  ouvinte de APRESENTAÇÃO de um evento da regra: direto se a regra não está adiantada, senão pela fila
//                 (sempre chamado via TELA[k]: ferramentas de QA podem embrulhar, ex. qa_anim marca o acerto na hora que a tela mostra)
// O Campo de Provas e os testes escutam o BUS direto (BUS.on): veem a regra no instante em que ela decide.
"use strict";
let FILA=[], filaN=0, adiantado=0;
const TELA={};
function telaOn(k,fn){
  TELA[k]=fn;
  BUS.on(k,o=>{ if(adiantado)FILA.push({n:++filaN,k,o}); else{ tocaTudo(); TELA[k](o); } });   // fora do trecho adiantado: o que sobrou na fila vem antes (ordem)
}
const marca=()=>filaN;
function tocaAte(n){ while(FILA.length&&FILA[0].n<=n){ const x=FILA.shift(); TELA[x.k](x.o); } }
const tocaTudo=()=>tocaAte(Infinity);
function adianta(fn){ adiantado++; try{ return fn(); } finally{ adiantado--; } }
function filaZera(){ FILA=[]; adiantado=0; }   // luta abortada/nova: nada do trecho anterior chega na tela
