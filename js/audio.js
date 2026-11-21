// audio.js — som sintetizado (WebAudio) e música
"use strict";
let AC=null, master=null, sndOn=true, musT=null, NB=null, mStep=0, mNext=0;
function initAudio(){ if(AC){AC.resume&&AC.resume();return;} try{AC=new (window.AudioContext||window.webkitAudioContext)(); master=AC.createGain(); master.gain.value=.5; master.connect(AC.destination);}catch(e){AC=null;} }
function tone(f,dur,type,vol,slide,when){ if(!AC||!sndOn)return; try{
  const t=AC.currentTime+Math.max(0,when||0), o=AC.createOscillator(), g=AC.createGain(); o.type=type||'square';
  o.frequency.setValueAtTime(f,t); if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+dur);
  g.gain.setValueAtTime(vol||.2,t); g.gain.exponentialRampToValueAtTime(.001,t+dur); o.connect(g); g.connect(master); o.start(t); o.stop(t+dur+.02);}catch(e){} }
function noise(dur,vol,freq,when){ if(!AC||!sndOn)return; try{
  if(!NB){NB=AC.createBuffer(1,AC.sampleRate*.5,AC.sampleRate); const d=NB.getChannelData(0); for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
  const t=AC.currentTime+Math.max(0,when||0), b=AC.createBufferSource(), f=AC.createBiquadFilter(), g=AC.createGain();
  b.buffer=NB; f.type='bandpass'; f.frequency.value=freq; g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.001,t+dur);
  b.connect(f); f.connect(g); g.connect(master); b.start(t); b.stop(t+dur+.02);}catch(e){} }
const sfx={
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
function musStart(){ musStop(); if(!AC)return; mStep=0; mNext=AC.currentTime+.1; musT=setInterval(musTick,80); }
function musStop(){ clearInterval(musT); musT=null; }
