// main.js — ligação dos botões e inicialização
"use strict";
function leave(to){token++; battleOn=false; musStop(); show(to);}
$('bPause').onclick=()=>{paused=!paused; $('bPause').textContent=paused?'Continuar':'Pausar';};
$('bSpeed').onclick=()=>{speed=speed===1?2:speed===2?.5:1; $('bSpeed').textContent=speed+'x';};
$('bAuto').onclick=()=>{autoP=!autoP; $('bAuto').classList.toggle('on',autoP);};
$('bQuit').onclick=()=>leave('sMap'); $('ovB').onclick=()=>leave('sMap');
$('ovA').onclick=()=>startBattle(); $('ovN').onclick=()=>{foeIx=Math.min(FOES.length-1,foeIx+1); startBattle();};
