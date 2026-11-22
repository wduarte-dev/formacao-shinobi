// battle.js — início da batalha, HUD, log, estados D/L/R
"use strict";
// tela de carregamento: decodifica atlas + efeitos de todo mundo da luta antes de começar (nada de carregar imagem no meio do golpe)
let loadingB=false;
function startBattle(){ if(loadingB)return; loadingB=true; const L=$('loading'), bar=L.querySelector('i'); bar.style.width='0'; L.classList.remove('hide');
  const ids=[...placed.map(p=>p.id),...FOES[foeIx].team.map(t=>t[0])], t0=Date.now();
  const fin=()=>{ loadingB=false; L.classList.add('hide'); startBattle2(); };
  Promise.race([preloadFx(ids,(n,t)=>{bar.style.width=(t?n/t*100:100)+'%';}),new Promise(r=>setTimeout(r,20000))]).then(()=>setTimeout(fin,Math.max(0,250-(Date.now()-t0)))).catch(fin); }
function startBattle2(){
  token++; foe=FOES[foeIx]; initAudio(); show('sBattle'); musStart(foeIx);
  U={p:placed.map((p,i)=>mk(p.id,'p',i,p.row,p.depth,1)), e:foe.team.map((t,i)=>mk(t[0],'e',i,t[1],t[2],foe.mult))};
  chakra={p:40,e:40}; round=0; mark=null; fieldA=null; $('fog').classList.remove('on'); paused=false; frozen=false; maxCombo=0; FX.length=0; BOLT.length=0; hitsR={p:0,e:0};
  $('bPause').textContent='Pausar'; $('resWin').classList.add('hide');
  $('log').innerHTML=''; $('units').innerHTML=''; $('fx').innerHTML=''; $('clist').innerHTML=''; $('field').className='field';
  $('ink').className=''; $('flash').className=''; $('cam').style.transform=''; $('cut').className='cut'; $('jtag').classList.remove('on');
  $('bbg').style.backgroundImage=`url(bg/${foe.bg}.png)`; ambStart(foe.bg); ambSndStart(foe.bg);
  portrait($('hpP'),U.p[0].id,3,60,60); portrait($('hpE'),U.e[0].id,3,60,60);
  for(const u of all()){
    const p=pos(u), e=document.createElement('div'); e.className='u '+u.side; e.style.left=p.x+'px'; e.style.top=p.y+'px'; e.style.zIndex=u.z=10+u.row*10+(2-u.depth);
    e.style.setProperty('--c',u.d.c); e.style.setProperty('--h',Math.round(124*(u.d.size||1))+'px');
    e.innerHTML=`<div class="mv"><div class="sh"></div><div class="st"></div><div class="tg"></div><div class="hpb"><i></i></div><div class="hpn"></div><div class="hb"></div></div>`;
    if(u.side==='e'){const hb=e.querySelector('.hb'); hb.onmouseenter=()=>e.classList.add('hov'); hb.onmouseleave=()=>e.classList.remove('hov'); hb.onclick=()=>markFoe(u);}
    u.el=e; u.mv=e.firstChild; u.st=e.querySelector('.st'); u.st.appendChild(u.spr); setAnim(u,'idle',Math.random()*8|0);
    $('units').appendChild(e);
  }
  ACT=all(); all().forEach(upd); battleOn=true; drawJ(); run();
}
function upd(u){
  u.el.querySelector('.hpb i').style.transform=`scaleX(${u.hp/u.max})`; u.el.querySelector('.hpn').textContent=u.hp+'/'+u.max;
  u.el.classList.toggle('dead',!u.alive); u.el.classList.toggle('armed',u.armed&&u.alive);
  u.el.querySelector('.tg').innerHTML=!u.alive?'':(u.stunned?'<span class="s">P</span>':'')+(u.shield>0?'<span class="e">E</span>':'')+(u.dot?'<span class="d">D</span>':'');
  for(const s of ['p','e']){const a=U[s].reduce((x,v)=>x+v.hp,0), b=U[s].reduce((x,v)=>x+v.max,0); $('thp'+s.toUpperCase()).style.transform=`scaleX(${a/b})`;}
}
// clique no inimigo: marca em azul até clicar de novo (os jutsus do jogador miram nele, ver pick)
function markFoe(u){ if(!u.alive)return; const old=mark; mark=old===u?null:u;
  if(old)old.el.classList.remove('mk'); if(mark)mark.el.classList.add('mk'); sfx.arm(); }
function fl(u,txt,cls){const f=document.createElement('div'); f.className='fl '+(cls||''); f.textContent=txt; u.mv.appendChild(f); setTimeout(()=>f.remove(),cls==='ord'?1150:950);}
function log(html,cls){const l=$('log'), d=document.createElement('div'); if(cls)d.className=cls; d.innerHTML=html; l.appendChild(d); while(l.children.length>7)l.firstChild.remove();}
const nm=u=>`<span style="color:${u.d.c}">${u.d.name}</span>`;
function setState(t,s){t.state=s; t.st.className='st'+(s?' '+s:''); if(t.alive)setAnim(t,stAnim(t,s));
  if(!s){t.off={x:0,y:0}; t.mv.style.transform='';}}
function dust(t,n){const p=cur(t); em(n,()=>prt(p.x,p.y,R(-8,8),-R(0,6),R(-2.6,2.6),R(-1.6,-.2),.03,R(14,26),R(4,8),0,pk(['#ffffff','#e8d8b8','#bfae8e']),1));}
