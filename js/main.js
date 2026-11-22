// main.js — ligação dos botões e inicialização
"use strict";
function leave(to){token++; battleOn=false; musStop(); ambSndStop(); show(to);}
$('bPause').onclick=()=>{paused=!paused; $('bPause').textContent=paused?'Continuar':'Pausar';};
$('bSpeed').onclick=()=>{speed=speed===1?2:speed===2?.5:1; $('bSpeed').textContent=speed+'x';};
$('bAuto').onclick=()=>{autoP=!autoP; $('bAuto').classList.toggle('on',autoP);};
$('bQuit').onclick=()=>leave('sMap'); $('ovB').onclick=()=>leave('sMap');
$('ovA').onclick=()=>startBattle(); $('ovN').onclick=()=>{foeIx=Math.min(FOES.length-1,foeIx+1); startBattle();};
// log minimizável: ▼ desce (só a última linha aparece), ▲ sobe; lembra a escolha
function logMin(on){$('log').classList.toggle('min',on); $('logT').classList.toggle('min',on); $('logT').textContent=on?'▲':'▼'; try{localStorage.setItem('shinobi-logmin',on?'1':'');}catch(e){}}
$('logT').onclick=()=>logMin(!$('log').classList.contains('min'));
try{logMin(localStorage.getItem('shinobi-logmin')==='1');}catch(e){}
