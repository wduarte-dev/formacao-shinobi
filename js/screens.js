// screens.js — telas: título, hub, formação, mapa, galeria
"use strict";
/* ================= TELAS ================= */
const SCR=['sTitle','sHub','sForm','sMap','sGal','sBattle'];
function show(id){ SCR.forEach(s=>$(s).classList.toggle('hide',s!==id)); ACT=[]; battleOn=false;
  if(id==='sHub')drawHub(); if(id==='sForm')drawForm(); if(id==='sMap')drawMap(); if(id==='sGal')drawGal(); }
function fitStage(){ const s=Math.min(innerWidth/1152,innerHeight/648); $('stage').style.transform=`translate(-50%,-50%) scale(${s})`; }
addEventListener('resize',fitStage); fitStage();
function stagePt(e){const r=$('stage').getBoundingClientRect(); return{x:(e.clientX-r.left)/r.width*1152,y:(e.clientY-r.top)/r.height*648};}
document.querySelectorAll('.petals').forEach(p=>{for(let i=0;i<22;i++){const d=document.createElement('i'); d.className='petal'; d.style.left=(Math.random()*1400)+'px'; d.style.animationDuration=(6+Math.random()*7)+'s'; d.style.animationDelay=(-Math.random()*12)+'s'; p.appendChild(d);}});
document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>{sfx.ui('cancela');show('sHub');});
$('sTitle').onclick=()=>{initAudio(); sfx.ui('titulo'); show('sHub');};
$('hMap').onclick=()=>{sfx.ui('clique');show('sMap');}; $('hForm').onclick=()=>{sfx.ui('clique');show('sForm');}; $('hGal').onclick=()=>{sfx.ui('clique');show('sGal');};
$('hSnd').onclick=()=>{sndOn=!sndOn; $('hSnd').classList.toggle('on',sndOn); sndApply(); sfx.arm();};
function liteUi(){document.body.classList.toggle('lite',lite); $('hLite').classList.toggle('on',lite);}
$('hLite').onclick=()=>{lite=!lite; save(); liteUi();}; liteUi();
function devUi(){$('hDev').classList.toggle('on',dev);}
$('hDev').onclick=()=>{dev=!dev; placed=placed.filter(p=>have(p.id)); save(); devUi(); sfx.arm(); if(!have(sel))sel='kaen'; drawHub();}; devUi();
$('hFull').onclick=()=>{try{ if(document.fullscreenElement)document.exitFullscreen(); else $('wrap').requestFullscreen().catch(()=>{}); }catch(e){}};

// posição dos pés de cada casa do tabuleiro (lado do jogador; o inimigo é espelhado)
function cell(row,depth){return{x:[470,370,270][depth]+(1-row)*16,y:[424,478,532][row]};}

/* ---- menu ---- */
function drawHub(){
  const h=$('hubTeam'); h.innerHTML='';
  placed.forEach((p,i)=>{ const x=640+i*120, y=556-(i%2)*26; actor(p.id,3,x,y,h);
    const n=document.createElement('div'); n.className='nameplate'; n.style.left=x+'px'; n.style.top=(y+12)+'px'; n.textContent=N[p.id].name; h.appendChild(n); });
  $('hubHint').textContent=placed.length<4?'Monte seu time de 4 ninjas na Formação.':'';
}

/* ---- formação no campo ---- */
let drag=null;
function drawForm(){
  const T=$('fTiles'), Un=$('fUnits'); T.innerHTML=''; Un.innerHTML=''; ACT=[];
  for(let row=0;row<3;row++)for(let depth=0;depth<3;depth++){ const c=cell(row,depth), t=document.createElement('div'); t.className='tile'; t.style.left=c.x+'px'; t.style.top=c.y+'px'; t.dataset.rd=row+','+depth; T.appendChild(t); }
  placed.forEach((p,i)=>{ const c=cell(p.row,p.depth), a=actor(p.id,3,c.x,c.y,Un); a.el.style.zIndex=10+p.row;
    const b=document.createElement('div'); b.className='ordb'; b.textContent=i+1; a.el.appendChild(b);
    const hit=document.createElement('div'); hit.style.cssText='position:absolute;left:-40px;top:-130px;width:80px;height:134px'; a.el.appendChild(hit);
    hit.onpointerdown=e=>startDrag(e,p.id,true); });
  const R=$('fRoster'); R.innerHTML='';
  IDS.forEach(id=>{ const i=placed.findIndex(p=>p.id===id), b=document.createElement('button'); b.className='slot'+(id===sel?' sel':'')+(i>=0?' used':'')+(have(id)?'':' lockd');
    const po=document.createElement('i'); po.className='por'; b.appendChild(po); portrait(po,id,1.8,104,66);
    if(!have(id)){ const s=document.createElement('small'); s.textContent='???'; b.appendChild(s); R.appendChild(b); return; }
    const s=document.createElement('small'); s.textContent=i>=0?N[id].name+' · '+(i+1)+'º':N[id].name; b.appendChild(s);
    b.onpointerdown=e=>startDrag(e,id,false); R.appendChild(b); });
  $('fInfo').innerHTML=infoHtml(sel);
  $('fDone').textContent=placed.length<4?`Faltam ${4-placed.length}`:'Pronto';
}
function infoHtml(id){ const d=N[id], j=d.jutsu, n=d.normal;
  return `<b style="color:${shade(d.c)}">${d.name}</b><span class="chip">${d.el}</span><span class="chip">${d.role}</span><br>
  Vida ${d.hp} · Ataque ${d.atk} · Defesa ${d.def}<br>
  <u>Normal:</u> ${n.name} (${TG[n.target]})${n.cause?' → '+ST[n.cause]:''}${n.dot?' + veneno':''}<br>
  ${d.strong?`<u>Forte</u> (toda 3ª ação): ${d.strong.name}${d.strong.cause?' → '+ST[d.strong.cause]:''}${d.strong.stun?' + paralisa':''}${d.strong.dot?' + veneno':''}<br>`:''}
  <u>Jutsu:</u> ${j.name}, ${j.cost} de chakra: ${j.desc}${j.cause?' → '+ST[j.cause]:''}<br>
  <u>Combo:</u> persegue ${ST[d.chase.on]} → deixa ${ST[d.chase.cause]}`; }
function shade(hex){const n=parseInt(hex.slice(1),16); return `rgb(${(n>>16)*.55|0},${((n>>8)&255)*.55|0},${(n&255)*.55|0})`;}
function startDrag(e,id,fromField){ e.preventDefault(); const p=stagePt(e); drag={id,fromField,x0:p.x,y0:p.y,moved:false};
  const g=$('drag'); g.innerHTML=''; const a=mkSpr(id,3); drawFrame(a); g.appendChild(a.spr); g.style.left=p.x+'px'; g.style.top=(p.y+50)+'px'; }
function nearTile(p){ let best=null,bd=70; for(let row=0;row<3;row++)for(let depth=0;depth<3;depth++){const c=cell(row,depth), d=Math.hypot(p.x-c.x,(p.y+50-c.y)*1.6); if(d<bd){bd=d;best={row,depth};}} return best; }
addEventListener('pointermove',e=>{ if(!drag)return; const p=stagePt(e); if(Math.hypot(p.x-drag.x0,p.y-drag.y0)>10)drag.moved=true;
  if(drag.moved){ $('drag').classList.remove('hide'); $('drag').style.left=p.x+'px'; $('drag').style.top=(p.y+50)+'px';
    const t=nearTile(p); document.querySelectorAll('.tile').forEach(el=>el.classList.toggle('hot',!!t&&el.dataset.rd===t.row+','+t.depth)); } });
addEventListener('pointerup',e=>{ if(!drag)return; const d=drag; drag=null; $('drag').classList.add('hide'); const p=stagePt(e), i=placed.findIndex(q=>q.id===d.id);
  if(!d.moved){ if(d.fromField){placed.splice(i,1);sfx.ui('pegar');} else sel=d.id; }
  else{ const t=nearTile(p);
    if(t){ const o=placed.findIndex(q=>q.row===t.row&&q.depth===t.depth);
      if(i>=0){ if(o>=0&&o!==i){placed[o].row=placed[i].row;placed[o].depth=placed[i].depth;} placed[i].row=t.row;placed[i].depth=t.depth; }
      else if(o>=0){ placed[o].id=d.id; }
      else if(placed.length<4)placed.push({id:d.id,row:t.row,depth:t.depth});
      sel=d.id; sfx.ui('soltar'); }
    else if(d.fromField){placed.splice(i,1);} }
  save(); drawForm(); });
$('fClear').onclick=()=>{placed=[];save();drawForm();};
$('fDone').onclick=()=>{sfx.ui('confirma');show('sHub');};

/* ---- mapa de fases ---- */
const NODE=[[76,372],[196,268],[330,350],[430,206],[500,96]];
function drawMap(){
  if(foeIx>unlocked)foeIx=unlocked;
  const m=$('mMap'); m.innerHTML=`<svg viewBox="0 0 574 470"><polyline points="${NODE.map(n=>n.join(',')).join(' ')}" fill="none" stroke="#7a5230" stroke-width="5" stroke-dasharray="4 12" stroke-linecap="round"/></svg>`;
  FOES.forEach((f,i)=>{ const b=document.createElement('button'), lock=i>unlocked, done=i<unlocked;
    b.className='node'+(lock?' lock':'')+(done?' done':'')+(i===foeIx?' sel':''); b.style.left=NODE[i][0]+'px'; b.style.top=NODE[i][1]+'px';
    b.innerHTML=lock?'<i style="background-image:url(ui/lock.png)"></i>':done?'<i style="background-image:url(ui/check.png)"></i>':String(i+1);
    b.onclick=()=>{ if(lock)return; foeIx=i; sfx.ui('missao'); drawMap(); }; m.appendChild(b);
    const l=document.createElement('div'); l.className='nlab'; l.style.left=NODE[i][0]+'px'; l.style.top=(NODE[i][1]+38)+'px'; l.textContent=lock?'???':f.name; m.appendChild(l); });
  const f=FOES[foeIx], s=$('mSide');
  s.innerHTML=`<h4>${foeIx+1}. ${f.name}</h4><div>Dificuldade: <b>${f.lvl}</b></div><div>Inimigos:</div><div id="mFoes"></div><div>${f.team.map(t=>N[t[0]].name+' ('+N[t[0]].el+')').join(', ')}</div>`;
  ACT=[]; f.team.forEach((t,i)=>actor(t[0],2,56+i*76,140,$('mFoes'),true));
  const b=document.createElement('button'); b.className='btn'; b.textContent=placed.length<4?'Montar o time':'Lutar';
  b.onclick=()=>{ if(placed.length<4)show('sForm'); else startBattle(); }; s.appendChild(b);
}

/* ---- galeria ---- */
let gal=null;
function drawGal(){
  const L=$('gList'); L.innerHTML=''; ACT=[];
  IDS.forEach(id=>{ const b=document.createElement('button'); b.className='slot gslot'+(id===sel?' sel':''); const po=document.createElement('i'); po.className='por'; b.appendChild(po); portrait(po,id,1.8,104,66);
    const s=document.createElement('small'); s.textContent=have(id)?N[id].name:'???'; b.appendChild(s); if(!have(id))b.classList.add('lockd'); else b.onclick=()=>{sel=id;sfx.ui('clique');drawGal();}; L.appendChild(b); });
  const V=$('gView'); V.innerHTML=''; gal=actor(sel,6,170,290,V);
  const A=$('gAn'); A.innerHTML=''; A.className='many';
  [['Parado','idle'],['Correr','move'],['Ataque','atk1'],['Forte','atk3'],['Selos','cast'],['Jutsu','atk2'],['Dano','hurt'],['Esquiva','dodge'],['Defesa','guard'],['Repelido','knockback'],['Lançado','launched'],['Derrubado','knockdown'],['Perseguição','chase'],['Buff','buff'],['Atordoado','stun'],['Vitória','victory'],['Derrota','die']]
   .filter(([,an])=>an_of(gal)[an]).forEach(([t,an])=>{ const b=document.createElement('button'); b.className='btn sm'; b.textContent=t;
    b.onclick=()=>{setAnim(gal,an); if(['atk1','atk2','atk3','chase','dodge'].includes(an))sfx.swing();}; A.appendChild(b); });
  const d=N[sel], j=d.jutsu, n=d.normal, causes=[n.cause,j.cause,d.chase.cause,d.strong&&d.strong.cause].filter(Boolean);
  const after=IDS.filter(o=>o!==sel&&causes.includes(N[o].chase.on)).map(o=>N[o].name);
  const before=IDS.filter(o=>o!==sel&&[N[o].normal.cause,N[o].jutsu.cause,N[o].chase.cause,N[o].strong&&N[o].strong.cause].includes(d.chase.on)).map(o=>N[o].name);
  const st=(t,v,m,c)=>`<div class="stt"><span>${t}</span><div class="bar ${c}"><i style="width:${Math.round(v/m*100)}%"></i></div><b>${v}</b></div>`;
  $('gInfo').innerHTML=`<h4 style="color:${shade(d.c)}">${d.name}</h4><span class="chip" style="margin:0">${d.el}</span><span class="chip">${d.role}</span>
   <div style="height:8px"></div>${st('Vida',d.hp,1500,'g')}${st('Ataque',d.atk,140,'r')}${st('Defesa',d.def,50,'b')}
   <p><u>Normal:</u> ${n.name}. Alvo: ${TG[n.target]}${n.cause?'. Deixa '+ST[n.cause]:''}${n.dot?'. Envenena':''}.</p>
   ${d.strong?`<p><u>Forte</u> (toda 3ª ação sem jutsu): ${d.strong.name}. Alvo: ${TG[d.strong.target]}${d.strong.cause?'. Deixa '+ST[d.strong.cause]:''}${d.strong.stun?'. Paralisa':''}${d.strong.dot?'. Envenena':''}.</p>`:''}
   <p><u>Jutsu:</u> ${j.name} (${j.cost} de chakra, recarga ${j.cd}). Alvo: ${TG[j.target]}; ${j.desc}${j.cause?'. Deixa '+ST[j.cause]:''}.</p>
   <p><u>Combo:</u> ${d.chase.name}. Persegue ${ST[d.chase.on]} e deixa ${ST[d.chase.cause]}.</p>
   <p><u>Abre combo para:</u> ${after.join(', ')||'ninguém'}.<br><u>Continua o combo de:</u> ${before.join(', ')||'ninguém'}.</p>`;
}

