// audio.js — som sintetizado (WebAudio) e música
"use strict";
let AC=null, master=null, sndOn=true, musT=null, NB=null, mStep=0, mNext=0;
function initAudio(){ if(AC){AC.resume&&AC.resume();return;} try{AC=new (window.AudioContext||window.webkitAudioContext)(); master=AC.createGain(); master.gain.value=.5; master.connect(AC.destination); loadSfx();}catch(e){AC=null;} }
function tone(f,dur,type,vol,slide,when){ if(!AC||!sndOn)return; try{
  const t=AC.currentTime+Math.max(0,when||0), o=AC.createOscillator(), g=AC.createGain(); o.type=type||'square';
  o.frequency.setValueAtTime(f,t); if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+dur);
  g.gain.setValueAtTime(vol||.2,t); g.gain.exponentialRampToValueAtTime(.001,t+dur); o.connect(g); g.connect(master); o.start(t); o.stop(t+dur+.02);}catch(e){} }
function noise(dur,vol,freq,when){ if(!AC||!sndOn)return; try{
  if(!NB){NB=AC.createBuffer(1,AC.sampleRate*.5,AC.sampleRate); const d=NB.getChannelData(0); for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
  const t=AC.currentTime+Math.max(0,when||0), b=AC.createBufferSource(), f=AC.createBiquadFilter(), g=AC.createGain();
  b.buffer=NB; f.type='bandpass'; f.frequency.value=freq; g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.001,t+dur);
  b.connect(f); f.connect(g); g.connect(master); b.start(t); b.stop(t+dur+.02);}catch(e){} }
// sons sintetizados: reserva quando o arquivo gravado não existe/não carregou (ver sfx, no fim do arquivo)
const SYN={
 swing:()=>noise(.09,.18,3200),
 hit:()=>{noise(.08,.4,900);tone(180,.08,'square',.2,70);},
 heavy:()=>{noise(.28,.6,380);tone(110,.32,'sawtooth',.3,35);},
 chase:()=>{noise(.07,.32,1500);tone(330,.07,'square',.18,160);},
 cast:()=>{tone(280,.55,'sawtooth',.1,1200);tone(420,.55,'triangle',.1,1700);},
 heal:()=>[523,659,784].forEach((f,i)=>tone(f,.18,'triangle',.18,null,i*.08)),
 shield:()=>tone(220,.35,'triangle',.25,440),
 shoot:()=>tone(900,.12,'square',.1,300),
 state:()=>tone(700,.06,'square',.07,950),
 arm:()=>tone(660,.08,'square',.1,990),
 dot:()=>tone(160,.1,'sawtooth',.07,90),
 thud:()=>{noise(.2,.55,170);tone(72,.22,"sine",.4,38);},
 start:()=>{tone(196,.9,'triangle',.3,98);noise(.5,.25,500);},
 end:()=>{tone(147,1.1,'triangle',.3,73);noise(.7,.3,300);},
 win:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.25,'square',.15,null,i*.13)),
 lose:()=>[392,330,262,196].forEach((f,i)=>tone(f,.3,'triangle',.2,null,i*.18))
};
const MEL=[9,null,12,null,14,12,null,9,16,null,14,null,12,null,9,null,7,null,9,null,12,null,14,null,12,9,null,7,9,null,null,null];
const BAS=[0,0,0,0,-4,-4,-2,-2];
function musTick(){ if(!AC||!sndOn)return; if(mNext<AC.currentTime)mNext=AC.currentTime+.05;
  while(mNext<AC.currentTime+.25){ const k=mStep%32, w=mNext-AC.currentTime, m=MEL[k];
    if(m!=null)tone(220*Math.pow(2,m/12),.14,'square',.045,null,w);
    if(k%4===0)tone(110*Math.pow(2,BAS[k/4]/12),.3,'triangle',.13,null,w);
    if(k%8===0)tone(130,.12,'sine',.3,40,w);
    if(k%8===4)noise(.06,.1,2500,w);
    if(k%2===0)noise(.02,.035,7000,w);
    mStep++; mNext+=.107; } }
function musSynth(){ if(!AC)return; mStep=0; mNext=AC.currentTime+.1; musT=setInterval(musTick,80); }

// ===== sons gravados (ElevenLabs, audio/sfx/*.ogg; fonte WAV + conversor em tools/audio/) =====
// Por servidor: fetch + decode em buffers (WebAudio, com variação de tom). Por file://: <audio> direto.
// Arquivo que não existe ou ainda não carregou: cai no SYN (sintetizado) acima.
const SFXD='audio/sfx/', BUF={}, SLAST={}, FILEMODE=location.protocol==='file:';
// variações: <nome>_1.._N (as da API + as que ele baixou à mão no site)
const VAR={swing:11,hit:7,heavy:6,chase:3,cast:8,heal:5,shield:5}, V=k=>Array.from({length:VAR[k]},(_,i)=>k+'_'+(i+1));
const SFILES=('amb-cinzas amb-floresta amb-noite amb-sakura amb-santuario aplic-burn aplic-freeze aplic-poison aplic-stun arm chakra-ganho chase-inicio chase-pronta combo-1 combo-2 combo-3 combo-4 dash dot-burn dot-poison dot end escudo-absorve escudo-quebra fumaca-sumir knock-D knock-L knock-R lose ninja-derrota parede-racha pouso rodada-inicio shoot start state sting-ultimo thud ui-cancela ui-clique ui-confirma ui-desbloqueio ui-missao ui-pegar ui-soltar ui-titulo vida-baixa win '
  +'kaen mizuha raiden iwao fuuka mayoi hiyori doku poko'.split(' ').map(n=>`${n}-atk ${n}-chase esq-${n}`+(['fuuka','mayoi','hiyori','doku','poko'].includes(n)?` ${n}-forte`:'')).join(' ')+' '
  +'fire water lightning earth wind mist ice poison sound'.split(' ').map(e=>`selos-${e} impacto-${e} proj-${e}`).join(' ')+' '
  +'fogo agua raio terra vento nevoa gelo veneno som'.split(' ').map(e=>'jutsu-'+e).join(' ')).split(' ').filter(x=>x&&!x.startsWith('amb-')).concat(Object.keys(VAR).flatMap(V));
const EN={Fogo:'fire','Água':'water',Raio:'lightning',Terra:'earth',Vento:'wind','Névoa':'mist',Gelo:'ice',Veneno:'poison',Som:'sound'};
const PT={Fogo:'fogo','Água':'agua',Raio:'raio',Terra:'terra',Vento:'vento','Névoa':'nevoa',Gelo:'gelo',Veneno:'veneno',Som:'som'};
function loadSfx(){ if(FILEMODE||!AC||loadSfx.on)return; loadSfx.on=1;
  SFILES.forEach(f=>fetch(SFXD+f+'.ogg').then(r=>r.ok?r.arrayBuffer():Promise.reject()).then(b=>AC.decodeAudioData(b)).then(d=>{BUF[f]=d;}).catch(()=>{})); }
// toca um dos arquivos da lista (sorteado); true se tocou. O mesmo arquivo não repete em <40ms (golpe em área não empilha)
function playF(names,vol=1,jit=0){ if(!sndOn)return true; names=[].concat(names);
  const ok=names.filter(n=>FILEMODE?SFILES.includes(n):BUF[n]); if(!ok.length)return false;
  const f=ok[Math.random()*ok.length|0], now=performance.now(); if(now-(SLAST[f]||0)<40)return true; SLAST[f]=now;
  if(FILEMODE){ try{const a=new Audio(SFXD+f+'.ogg'); a.volume=Math.min(1,vol*.6); a.play().catch(()=>{});}catch(e){} return true; }
  if(!AC)return false;
  const s=AC.createBufferSource(), g=AC.createGain(); s.buffer=BUF[f]; s.playbackRate.value=1+(Math.random()*2-1)*jit; g.gain.value=vol*.9; s.connect(g); g.connect(master); s.start(); return true; }
const P=(n,v,j,f)=>playF(n,v,j)||(f&&f(),false);
const SW=V('swing'), HIT=V('hit'), elOf=u=>u&&u.d&&u.d.el;
const sfx={
 swing:()=>P(SW,.75,.05,SYN.swing),
 hit:(u,k)=>(u&&k&&playF(u.id+'-'+k,1,.04))||P(HIT,.9,.05,SYN.hit),     // k: 'atk' (básico do ninja) ou 'forte'
 heavy:()=>P(V('heavy'),1,.03,SYN.heavy),
 impact:u=>playF('impacto-'+EN[elOf(u)],.85),                            // camada do elemento no impacto do jutsu
 chase:c=>(c&&playF(c.id+'-chase',1))||P(V('chase'),.9,0,SYN.chase),
 chaseGo:()=>playF('chase-pronta',.7),
 combo:n=>playF('combo-'+Math.max(1,Math.min(4,n-1)),.65),
 cast:u=>(u&&playF('selos-'+EN[elOf(u)],.9))||P(V('cast'),.9,0,SYN.cast),
 jutsu:u=>playF('jutsu-'+PT[elOf(u)],1),
 heal:()=>P(V('heal'),.8,0,SYN.heal), shield:()=>P(V('shield'),.9,0,SYN.shield),
 shoot:u=>(u&&playF('proj-'+EN[elOf(u)],.8,.04))||P('shoot',.8,.04,SYN.shoot),
 state:()=>P('state',.6,0,SYN.state),
 knock:st=>P('knock-'+st,.9,0,SYN.state),
 wall:()=>P('parede-racha',.9,0,SYN.thud),
 apply:k=>playF('aplic-'+k,.75),
 dodge:t=>(t&&playF('esq-'+t.id,.9))||P(SW,.7,.05,SYN.swing),
 dot:e=>P(e==='Fogo'?'dot-burn':e==='Veneno'?'dot-poison':'dot',.7,0,SYN.dot),
 absorb:()=>playF('escudo-absorve',.75), sbreak:()=>playF('escudo-quebra',.9),
 death:()=>playF('ninja-derrota',.85), lowhp:()=>playF('vida-baixa',.8), last:()=>playF('sting-ultimo',.8),
 round:()=>playF('rodada-inicio',.6), chakra:()=>playF('chakra-ganho',.45),
 arm:()=>P('arm',.6,0,SYN.arm), thud:()=>P('thud',1,.03,SYN.thud),
 start:()=>P('start',1,0,SYN.start), end:()=>P('end',1,0,SYN.end),
 win:()=>P('win',.9,0,SYN.win), lose:()=>P('lose',.9,0,SYN.lose),
 ui:k=>P('ui-'+k,.6,0,SYN.arm)
};
// ambiente (um loop por cenário) e música: <audio> em loop (não decodifica a faixa inteira na memória)
// MUSF: missão -> audio/music/<nome>.ogg. Vazio = música sintetizada (musTick). Ao adicionar faixas, é só listar aqui.
const MUSF=['batalha1','batalha2','batalha3','batalha4','batalhaepica'];   // menu: audio/music/menu.ogg (musMenu)
let AMBA=null, MUSA=null;
function loopA(src,vol){ const a=new Audio(src); a.loop=true; a.volume=sndOn?vol:0; a.dataset.v=vol; a.play().catch(()=>{}); return a; }
function ambSndStart(bg){ ambSndStop(); if(bg)AMBA=loopA(SFXD+'amb-'+bg+'.ogg',.35); }
function ambSndStop(){ if(AMBA){AMBA.pause(); AMBA=null;} }
function musStart(ix){ musStop(); if(!AC)return; const f=MUSF[ix|0]; if(!f)return musSynth();
  const a=MUSA=loopA('audio/music/'+f+'.ogg',.45); a.addEventListener('error',()=>{ if(MUSA===a){MUSA=null; musSynth();} }); }
// música do menu: não reinicia se já estiver tocando (navegar entre telas mantém a faixa)
function musMenu(){ if(!AC||(MUSA&&MUSA.dataset.f==='menu'))return; musStop(); MUSA=loopA('audio/music/menu.ogg',.35); MUSA.dataset.f='menu'; }
function musStop(){ clearInterval(musT); musT=null; if(MUSA){MUSA.pause(); MUSA=null;} }
function sndApply(){ for(const a of [AMBA,MUSA])if(a)a.volume=sndOn?+a.dataset.v:0; }
