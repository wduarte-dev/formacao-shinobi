// screens.js — telas: título, hub, formação, mapa, galeria
"use strict";
/* ================= TELAS ================= */
const SCR=['sTitle','sHub','sForm','sMap','sGal','sBattle','sAcad'];
function show(id){ SCR.forEach(s=>$(s).classList.toggle('hide',s!==id)); ACT=[]; battleOn=false;
  if(id==='sHub')drawHub(); if(id==='sForm')drawForm(); if(id==='sAcad')drawAcad(); if(id==='sMap')drawMap(); if(id==='sGal')drawGal(); }
// celular mais largo que 16:9: o palco continua 1152x648 (layout intacto), mas o cenário se estende pras laterais com as pontas da
// própria imagem ESPELHADAS (emenda invisível, chão na mesma altura). Gera uma vez por imagem (canvas → blob) e guarda.
const BGX={}, BGE=300;
function bgExt(el,src){ el.classList.remove('ext'); el.style.backgroundImage=`url(${src})`; el.dataset.bg=src;
  return (BGX[src]||(BGX[src]=new Promise(res=>{ const im=new Image(); im.onerror=()=>res(null);
    im.onload=()=>{ try{ const w=im.width, h=im.height, E=Math.round(BGE*w/1152), c=document.createElement('canvas'), x=c.getContext('2d'); c.width=w+2*E; c.height=h;
      x.drawImage(im,E,0); x.save(); x.translate(E,0); x.scale(-1,1); x.drawImage(im,0,0,E,h,0,0,E,h); x.restore();
      x.save(); x.translate(E+w,0); x.scale(-1,1); x.drawImage(im,w-E,0,E,h,-E,0,E,h); x.restore();
      c.toBlob(b=>res(b?URL.createObjectURL(b):null)); }catch(e){ res(null); } };   // por file:// o canvas fica "sujo": segue sem estender
    im.src=src; }))).then(u=>{ if(u&&el.dataset.bg===src){ el.style.backgroundImage=`url(${u})`; el.classList.add('ext'); } }); }
document.querySelectorAll('.bgi').forEach(el=>{ const m=(el.getAttribute('style')||'').match(/url\(([^)]+)\)/); if(m)bgExt(el,m[1].replace(/["']/g,'')); });
// escala do palco. Em tela cheia/app instalado usa o tamanho da TELA (não da janela): puxar a cortina de notificações mostra a
// barra do sistema por cima e encolhia a janela (o jogo diminuía). Redimensionamento com atraso curto: rotação/teclado não piscam.
function fitStage(){ const full=document.fullscreenElement||document.webkitFullscreenElement||matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches||navigator.standalone;
  let w=innerWidth, h=innerHeight;
  if(full&&screen.width&&screen.height){ const land=w>=h; w=land?Math.max(screen.width,screen.height):Math.min(screen.width,screen.height); h=land?Math.min(screen.width,screen.height):Math.max(screen.width,screen.height); }
  const s=Math.min(w/1152,h/648), stage=$('stage');
  const bleed=Math.max(0,Math.ceil((w/s-1152)/2))+22;
  stage.style.setProperty('--field-bleed',`${Math.max(300,bleed)}px`);
  stage.style.setProperty('--plan-bleed',`${bleed}px`);
  stage.style.transform=`translate(-50%,-50%) scale(${s})`; }
let fitT=0;
addEventListener('resize',()=>{ cancelAnimationFrame(fitT); fitT=requestAnimationFrame(fitStage); }); document.addEventListener('fullscreenchange',fitStage); fitStage();
function stagePt(e){const r=$('stage').getBoundingClientRect(); return{x:(e.clientX-r.left)/r.width*1152,y:(e.clientY-r.top)/r.height*648};}
document.querySelectorAll('.petals').forEach(p=>{for(let i=0;i<22;i++){const d=document.createElement('i'); d.className='petal'; d.style.left=(Math.random()*1800-320)+'px'; d.style.animationDuration=(6+Math.random()*7)+'s'; d.style.animationDelay=(-Math.random()*12)+'s'; p.appendChild(d);}});
document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>{sfx.ui('cancela');show('sHub');});
$('sTitle').onclick=()=>{if(matchMedia('(pointer:coarse)').matches&&!STANDALONE)goFull(); initAudio(); sfx.ui('titulo'); show('sHub'); musMenu();};
$('hMap').onclick=()=>{sfx.ui('clique');show('sMap');}; $('hForm').onclick=()=>{sfx.ui('clique');show('sForm');}; $('hGal').onclick=()=>{sfx.ui('clique');show('sGal');};
$('hSnd').onclick=()=>{sndOn=!sndOn; $('hSnd').classList.toggle('on',sndOn); sndApply(); sfx.arm();};
function liteUi(){document.body.classList.toggle('lite',lite); $('hLite').classList.toggle('on',lite);}
$('hLite').onclick=()=>{lite=!lite; save(); liteUi();}; liteUi();
function devUi(){$('hDev').classList.toggle('on',dev);}
$('hDev').onclick=()=>{dev=!dev; placed=placed.filter(p=>have(p.id)); save(); devUi(); sfx.arm(); if(!have(sel))sel='kaen'; drawHub();}; devUi();
// tela cheia: API padrão ou webkit (Safari antigo/Android velho), no documento inteiro, e trava em paisagem quando dá.
// iPhone não tem API de tela cheia pra página: aí mostra como instalar (PWA abre sem barra do navegador)
const fsEl=()=>document.fullscreenElement||document.webkitFullscreenElement;
const STANDALONE=matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches||navigator.standalone;
function goFull(){ const d=document.documentElement, rq=d.requestFullscreen||d.webkitRequestFullscreen; if(!rq||fsEl())return false;
  try{ const r=rq.call(d,{navigationUI:'hide'}); const lk=()=>{try{screen.orientation.lock('landscape').catch(()=>{});}catch(_){}}; r&&r.then?r.then(lk).catch(()=>{}):lk(); }catch(_){ return false; } return true; }
function toggleFull(){ if(fsEl()){ (document.exitFullscreen||document.webkitExitFullscreen).call(document); return; }
  if(!goFull())$('instHelp').classList.remove('hide'); }
$('hFull').onclick=toggleFull; $('instOk').onclick=()=>$('instHelp').classList.add('hide');
if(STANDALONE)$('hFull').classList.add('hide');   // instalado como app: já abre em tela cheia

// posição dos pés de cada casa do tabuleiro (lado do jogador; o inimigo é espelhado)
function cell(row,depth){return{x:[470,370,270][depth]+(1-row)*16,y:[424,478,532][row]};}   // casa no campo de BATALHA (pos em state.js)
function formCell(row,depth){const c=cell(row,depth); return{x:c.x,y:c.y-92};}   // Formação: mesmo grid, 92px acima (embaixo fica o painel de Combos)

/* ---- menu ---- */
function drawHub(){
  const h=$('hubTeam'); h.innerHTML='';
  placed.forEach((p,i)=>{ const x=640+i*120, y=556-(i%2)*26; actor(p.id,3,x,y,h);
    const n=document.createElement('div'); n.className='nameplate'; n.style.left=x+'px'; n.style.top=(y+12)+'px'; n.textContent=N[p.id].name; h.appendChild(n); });
  $('hubHint').textContent=placed.length<4?'Monte seu time de 4 ninjas na Formação.':'';
}

/* ---- formação no campo ---- */
let drag=null;
// tabuleiro do arrasto: a Formação (time salvo) ou o Laboratório da Academia (time de teste); o arrasto não sabe qual é
const FORM_BOARD={list:()=>placed, cell:(r,d)=>formCell(r,d), redraw:()=>drawForm(), sc:3, tiles:'#fTiles .tile', save:true};
let BOARD=FORM_BOARD;
function drawForm(){ BOARD=FORM_BOARD;
  const T=$('fTiles'), Un=$('fUnits'); T.innerHTML=''; Un.innerHTML=''; ACT=[];
  for(let row=0;row<3;row++)for(let depth=0;depth<3;depth++){ const c=formCell(row,depth), t=document.createElement('div'); t.className='tile'; t.style.left=c.x+'px'; t.style.top=c.y+'px'; t.dataset.rd=row+','+depth; T.appendChild(t); }
  placed.forEach((p,i)=>{ const c=formCell(p.row,p.depth), a=actor(p.id,3,c.x,c.y,Un); a.el.style.zIndex=10+p.row;
    const b=document.createElement('div'); b.className='ordb'; b.textContent=i+1; a.el.appendChild(b);
    const hit=document.createElement('div'); hit.style.cssText='position:absolute;left:-40px;top:-130px;width:80px;height:134px'; a.el.appendChild(hit);
    hit.onpointerdown=e=>startDrag(e,p.id,true); });
  const R=$('fRoster'); R.innerHTML='';
  IDS.forEach(id=>{ const i=placed.findIndex(p=>p.id===id), b=document.createElement('button'); b.className='slot'+(id===sel?' sel':'')+(i>=0?' used':'')+(have(id)?'':' lockd');
    const po=document.createElement('i'); po.className='por'; b.appendChild(po); portrait(po,id,1.6,94,66);
    if(!have(id)){ const s=document.createElement('small'); s.textContent='???'; b.appendChild(s); R.appendChild(b); return; }
    const s=document.createElement('small'); s.textContent=i>=0?N[id].name+' · '+(i+1)+'º':N[id].name; b.appendChild(s);
    b.onpointerdown=e=>startDrag(e,id,false); R.appendChild(b); });
  drawFicha($('fInfo'),sel);
  $('fDone').textContent=placed.length<4?`Faltam ${4-placed.length}`:'Pronto';
  drawCombos($('fCombo'),placed.map(p=>p.id),false); comboTitle();
}
function shade(hex){const n=parseInt(hex.slice(1),16); return `rgb(${(n>>16)*.55|0},${((n>>8)&255)*.55|0},${(n&255)*.55|0})`;}
function startDrag(e,id,fromField){ e.preventDefault(); try{e.target.releasePointerCapture&&e.target.releasePointerCapture(e.pointerId);}catch(_){} const p=stagePt(e); drag={id,fromField,x0:p.x,y0:p.y,moved:false};
  const g=$('drag'); g.innerHTML=''; const a=mkSpr(id,BOARD.sc); drawFrame(a); g.appendChild(a.spr); g.style.left=p.x+'px'; g.style.top=(p.y+50)+'px'; }
function nearTile(p){ let best=null,bd=70; for(let row=0;row<3;row++)for(let depth=0;depth<3;depth++){const c=BOARD.cell(row,depth), d=Math.hypot(p.x-c.x,(p.y+50-c.y)*1.6); if(d<bd){bd=d;best={row,depth};}} return best; }
addEventListener('pointermove',e=>{ if(!drag)return; const p=stagePt(e); if(Math.hypot(p.x-drag.x0,p.y-drag.y0)>10)drag.moved=true;
  if(drag.moved){ $('drag').classList.remove('hide'); $('drag').style.left=p.x+'px'; $('drag').style.top=(p.y+50)+'px';
    const t=nearTile(p); document.querySelectorAll(BOARD.tiles).forEach(el=>el.classList.toggle('hot',!!t&&el.dataset.rd===t.row+','+t.depth)); } });
addEventListener('pointerup',e=>{ if(!drag)return; const d=drag; drag=null; $('drag').classList.add('hide'); const placed=BOARD.list(), p=stagePt(e), i=placed.findIndex(q=>q.id===d.id);
  if(!d.moved){ if(d.fromField){placed.splice(i,1);sfx.ui('pegar');} else sel=d.id; }
  else{ const t=nearTile(p);
    if(t){ const o=placed.findIndex(q=>q.row===t.row&&q.depth===t.depth);
      if(i>=0){ if(o>=0&&o!==i){placed[o].row=placed[i].row;placed[o].depth=placed[i].depth;} placed[i].row=t.row;placed[i].depth=t.depth; }
      else if(o>=0){ placed[o].id=d.id; }
      else if(placed.length<4)placed.push({id:d.id,row:t.row,depth:t.depth});
      sel=d.id; sfx.ui('soltar'); }
    else if(d.fromField){placed.splice(i,1);} }
  if(BOARD.save)save(); BOARD.redraw(); });
// toque cancelado pelo sistema (gesto, notificação, rolagem): solta o arrasto em vez de deixar o fantasma preso na tela
addEventListener('pointercancel',()=>{ if(!drag)return; drag=null; $('drag').classList.add('hide'); BOARD.redraw(); });
$('fClear').onclick=()=>{placed.length=0;save();drawForm();};
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
  ACT=[]; f.team.forEach((t,i)=>actor(t[0],1.75,44+i*70,136,$('mFoes'),true));   // cabe no painel (antes o 4º saía pra fora)
  const b=document.createElement('button'); b.className='btn'; b.textContent=placed.length<4?'Montar o time':'Lutar';
  b.onclick=()=>{ if(placed.length<4)show('sForm'); else{ acad=null; startBattle(); } }; s.appendChild(b);
}

/* ---- galeria ---- */
let gal=null;
function drawGal(){
  const L=$('gList'); L.innerHTML=''; ACT=[];
  IDS.forEach(id=>{ const b=document.createElement('button'); b.className='slot gslot'+(id===sel?' sel':''); const po=document.createElement('i'); po.className='por'; b.appendChild(po); portrait(po,id,1.8,104,66);
    const s=document.createElement('small'); s.textContent=have(id)?N[id].name:'???'; b.appendChild(s); if(!have(id))b.classList.add('lockd'); else b.onclick=()=>{sel=id;sfx.ui('clique');drawGal();}; L.appendChild(b); });
  const V=$('gView'); V.innerHTML=''; gal=actor(sel,6,170,290,V);
  const A=$('gAn'); A.innerHTML=''; A.className='many';
  const d=N[sel], j=d.jutsu, n=d.normal, a=gal;
  const previews={atk1:d.stationary?['dash','atk1','attackB','attackC']:n.sequence,chase:d.chase?.phases};
  if(d.stationary){ previews.walk=['walk','sit']; previews.atk2=['cast','atk2']; }
  let preview=0;
  [['Parado','idle'],d.stationary?['Entrada','walk']:['Correr','move'],['Ataque','atk1'],['Forte','atk3'],['Selos','cast'],['Jutsu','atk2'],['Dano','hurt'],['Esquiva','dodge'],['Defesa','guard'],['Repelido','knockback'],['Lançado','launched'],['Derrubado','knockdown'],['Perseguição','chase'],['Buff','buff'],['Atordoado','stun'],['Bola de Fogo','fireball'],['Vitória','victory'],['Derrota','die']]
   .filter(([,an])=>(previews[an]||an_of(a)[an])&&!(an==='atk3'&&n.sequence&&!d.strong)).forEach(([t,an])=>{ const b=document.createElement('button'); b.className='btn sm'; b.textContent=t;
    b.onclick=async()=>{
      const p=++preview, seq=previews[an];
      if(['atk1','atk2','atk3','chase','dodge'].includes(an))sfx.swing();
      if(!seq){setAnim(a,an); return;}
      for(const phase of seq){
        setAnim(a,phase,0,true);
        await new Promise(resolve=>setTimeout(resolve,animMs(a,phase)));
        if(p!==preview||!ACT.includes(a))return;
      }
      setAnim(a,'idle');
    };
    A.appendChild(b); });
  const causes=[n.cause,j.cause,d.recast?.cause,d.chase?.cause,d.strong&&d.strong.cause].filter(Boolean);
  const after=IDS.filter(o=>o!==sel&&causes.includes(N[o].chase?.on)).map(o=>N[o].name);
  const before=d.chase?IDS.filter(o=>o!==sel&&[N[o].normal.cause,N[o].jutsu.cause,N[o].chase?.cause,N[o].strong&&N[o].strong.cause].includes(d.chase.on)).map(o=>N[o].name):[];
  const st=(t,v,m,c)=>`<div class="stt"><span>${t}</span><div class="bar ${c}"><i style="width:${Math.round(v/m*100)}%"></i></div><b>${v}</b></div>`;
  $('gInfo').innerHTML=`<h4 style="color:${shade(d.c)}">${d.name}</h4><span class="chip" style="margin:0">${d.el}</span><span class="chip">${d.role}</span>
   <div style="height:8px"></div>${st('Vida',d.hp,1500,'g')}${st('Ataque',d.atk,140,'r')}${st('Defesa',d.def,50,'b')}
   <p><u>Normal:</u> ${n.name}. Alvo: ${TG[n.target]}${n.cause?'. Deixa '+ST[n.cause]:''}${n.burnChance?'. Terra, 75% de chance de dividir em duas chamas, 50% de queimar':n.dot?'. Envenena':''}${n.split?`. ${Math.round(n.split*100)}% de chance de se multiplicar e acertar todos`:''}.</p>
   ${d.strong?`<p><u>Forte</u> (30% de chance por ação sem jutsu): ${d.strong.name}. Alvo: ${TG[d.strong.target]}${d.strong.cause?'. Deixa '+ST[d.strong.cause]:''}${d.strong.stun?'. Paralisa':''}${d.strong.dot?'. Envenena':''}.</p>`:''}
   <p><u>Jutsu:</u> ${j.name} (${j.cost} de chakra, recarga ${d.recast?.cd??j.cd}). Alvo: ${TG[j.target]}; ${j.desc}${j.cause?'. Deixa '+ST[j.cause]:''}.</p>
   ${d.passive?`<p><u>${d.passive}</u> — um clone absorve o primeiro golpe recebido na rodada.</p>`:''}
   ${d.chase?`<p><u>Combo:</u> ${d.chase.name}. Persegue ${ST[d.chase.on]} e deixa ${ST[d.chase.cause]}.</p>`:
   `<p><u>${d.recast.name}</u> (${d.recast.cost} de chakra). ${d.recast.desc}.</p>
   <p>Imune a D/L/R. <u>Bola de Fogo:</u> dispara 4 projéteis a cada ${KAZAN_LIMIT} contatos do time.</p>`}
   <p><u>Abre combo para:</u> ${after.join(', ')||'ninguém'}.<br><u>Continua o combo de:</u> ${before.join(', ')||'ninguém'}.</p>`;
}


// versão rodando (menu) + checagem de versão nova no GitHub: ao abrir, ao voltar pro app e a cada 5 min. Só por http(s).
$('ver').textContent='v'+VERSION.v+' · '+VERSION.d;
// Novidades (patch notes de docs/patch-notes.md via js/patch.js): pisca até abrir a versão atual uma vez
function newsSeen(){ try{return localStorage.getItem('shinobi-news')===VERSION.v;}catch(e){return true;} }
function newsUi(){ $('hNews').classList.toggle('new',!newsSeen()); }
$('hNews').onclick=()=>{ sfx.ui('clique'); $('newsL').innerHTML=(typeof PATCH!=='undefined'?PATCH:[]).map(p=>`<h4>v${p.v}<small>${p.d}${p.t?' · '+p.t:''}</small></h4><ul>${p.i.map(x=>`<li>${x}</li>`).join('')}</ul>`).join('');
  $('newsWin').classList.remove('hide'); $('newsL').scrollTop=0; try{localStorage.setItem('shinobi-news',VERSION.v);}catch(e){} newsUi(); };
$('newsOk').onclick=()=>{ sfx.ui('cancela'); $('newsWin').classList.add('hide'); }; newsUi();
async function checkVersion(){ if(!location.protocol.startsWith('http'))return;
  try{ const r=await fetch('version.json?'+Date.now(),{cache:'no-store'}); if(!r.ok)return; const n=await r.json();
    if(n.v&&n.v!==VERSION.v&&!battleOn){ $('updV').textContent='v'+n.v; $('updBar').classList.remove('hide'); } }catch(e){} }
$('updGo').onclick=async()=>{ try{ const rs=await navigator.serviceWorker.getRegistrations(); await Promise.all(rs.map(r=>r.update())); }catch(e){} location.reload(); };
$('updX').onclick=()=>$('updBar').classList.add('hide');
checkVersion(); setInterval(checkVersion,300000); document.addEventListener('visibilitychange',()=>{ if(!document.hidden)checkVersion(); });
