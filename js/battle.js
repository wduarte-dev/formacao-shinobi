// battle.js — início da batalha, HUD, log, estados D/L/R
"use strict";
// tela de carregamento: decodifica atlas + efeitos de todo mundo da luta antes de começar (nada de carregar imagem no meio do golpe)
let loadingB=false, ldIv=0;
const TIPS=['Perseguição: quem derruba (D), lança (L) ou repele (R) abre combo pra quem continua daquele estado. Monte a formação pensando na corrente!',
 'Cada passo da perseguição dá +10% de dano. Combo longo é dano de verdade.',
 'Cada ninja só faz uma perseguição por rodada. Escolha bem quem abre o combo.',
 'Quem tem golpe Forte tem 30% de chance de soltar ele no lugar do básico.',
 'O chakra sobe 20 por rodada. Jutsu caro na hora errada é chakra jogado fora.',
 'Sem o Auto, o botão do jutsu pulsa um pouco antes da vez de quem pode usar. É a sua deixa!',
 'Jutsu instantâneo sai entre ações. A Aura Relâmpago ainda deixa Keshin atacar na vez dele.',
 'Clique num inimigo pra marcar o alvo dos seus jutsus.',
 'O Kazan conta os contatos do time. No décimo, dispara quatro bolas de fogo.',
 'O escudo da Muralha de Pedra não acumula: fica o maior, e some depois de 2 rodadas.',
 'Jutsu que acerta todos ou uma fileira não dá pra desviar.',
 'Paralisado age normal, mas não consegue perseguir nem desviar. Gelo, raio e som adoram isso.',
 'O Tufão Cortante da Fuuka dissipa o campo de névoa inimigo.',
 'Dentro da Noite de Névoa, a Mayoi ganha muito mais esquiva.',
 'Veneno e queimadura batem toda rodada. Às vezes o dano lento ganha a luta.',
 'Quem fica na frente apanha primeiro. Tanque na frente, suporte atrás.',
 'A Chuva Serena da Mizuha cura o time inteiro de uma vez.',
 'Com o Lacre Rompido, o Yugami bate 35% mais forte por 3 rodadas... e fica difícil de acertar.',
 'Repelido (R) voa até a borda e racha a parede. Lançado (L) sobe. Derrubado (D) vai pro chão.',
 'Vença a Irmandade do Gelo pra ter o Poko no seu time.',
 'O Tsunami da Mizuha (chance na Onda) acerta o time inimigo inteiro.',
 'O Punho de Pedra do Iwao repele (R): abre combo pra Raiden, Poko e o próprio Iwao.',
 'Celular travando? O modo leve liga sozinho quando a luta pesa, e dá pra mudar no menu.',
 'Instale o jogo na tela inicial do celular: abre em tela cheia, como um app.'];
function ldTip(){ const t=$('ldTip'); t.classList.add('out'); setTimeout(()=>{ t.textContent=TIPS[Math.random()*TIPS.length|0]; t.classList.remove('out'); },250); }
// tela de carregamento: decodifica atlas + efeitos de todo mundo da luta antes de começar (nada de carregar imagem no meio do golpe)
// enquanto isso: cenário da missão no fundo, dica girando e o time do jogador correndo em fila no canto (atores normais, o tick anima)
// missão normal ou Teste de Perseguição (acad): de onde vem o inimigo e o time
const curFoe=()=>acad?ACAD_FOE:FOES[foeIx], battleTeam=()=>acad?labTeam:placed;
function startBattle(){ if(loadingB)return; loadingB=true; const L=$('loading'), bar=L.querySelector('.lbar i'), f=curFoe();
  bar.style.transform='scaleX(0)'; $('ldPct').textContent='0%'; bgExt($('ldBg'),`bg/${f.bg}.png`); $('ldT').textContent=acad?f.name+' · '+ACAD[acad.i].name:f.name;
  const R=$('ldRun'); R.innerHTML=''; ACT=[]; battleTeam().forEach((p,i)=>{ const a=actor(p.id,2.6,1060-i*112,604,R); setAnim(a,N[p.id].stationary?'walk':an_of(a).move?'move':'walk',i*2); a.el.style.zIndex=10-i; });
  $('ldTip').textContent=TIPS[Math.random()*TIPS.length|0]; clearInterval(ldIv); ldIv=setInterval(ldTip,3200); L.classList.remove('hide');
  const ids=[...battleTeam().map(p=>p.id),...f.team.map(t=>t[0])], t0=Date.now();
  const fin=()=>{ loadingB=false; clearInterval(ldIv); L.classList.add('hide'); R.innerHTML=''; startBattle2(); };
  Promise.race([preloadFx(ids,(n,t)=>{const k=t?n/t:1; bar.style.transform=`scaleX(${k})`; $('ldPct').textContent=Math.round(k*100)+'%';}),new Promise(r=>setTimeout(r,20000))])
    .then(()=>setTimeout(fin,Math.max(0,1400-(Date.now()-t0)))).catch(fin); }   // mínimo ~1,4s: dá tempo de ler a dica
function startBattle2(){
  setDevFreeze(false);
  $('bFreeze').classList.toggle('hide',!dev);
  token++; foe=curFoe(); if(acad)acad.done=false; initAudio(); show('sBattle'); musStart(acad?0:foeIx);
  U={clones:[],p:battleTeam().map((p,i)=>mk(p.id,'p',i,p.row,p.depth,1)), e:foe.team.map((t,i)=>mk(t[0],'e',i,t[1],t[2],foe.mult))};
  chakra={p:40,e:40}; round=0; mark=null; fieldA=null; $('fog').classList.remove('on'); resetFieldScene(); resetKazanFx(); paused=false; syncTimeHold(); frozen=false; maxCombo=0; FX.length=0; BOLT.length=0; WAVES.length=0; hitsR={p:0,e:0};
  $('bPause').textContent='Pausar'; $('resWin').classList.add('hide');
  $('log').innerHTML=''; $('units').innerHTML=''; $('fx').innerHTML=''; $('clist').innerHTML=''; $('field').className='field';
  $('ink').className=''; $('flash').className=''; $('cam').classList.remove('tracking','slow'); $('cam').style.transform=''; $('cut').className='cut'; $('jtag').classList.remove('on');
  bgExt($('bbg'),`bg/${foe.bg}.png`); ambStart(foe.bg); ambSndStart(foe.bg);
  portrait($('hpP'),U.p[0].id,1.9,60,60); portrait($('hpE'),U.e[0].id,1.9,60,60);
  all().forEach(mountUnit);
  ACT=all(); all().forEach(upd); battleOn=true; drawJ(); run();
}
function mountUnit(u){
    const p=pos(u), e=document.createElement('div'); e.className='u '+u.side; e.style.setProperty('--c',u.d.c); e.style.left=p.x+'px'; e.style.top=p.y+'px'; e.style.zIndex=u.z=10+u.row*10+(2-u.depth);
    e.style.setProperty('--c',u.d.c); e.style.setProperty('--h',Math.round(124*(u.d.size||1))+'px');
    e.innerHTML=`<div class="mv"><div class="sh"></div><div class="aura"><i></i><i></i><i></i></div><div class="st"></div><div class="tg"></div><div class="hpb"><i></i><i class="shb"></i></div><div class="hpn"></div><div class="hb"></div></div>`;
    if(u.side==='e'){const hb=e.querySelector('.hb'); hb.onmouseenter=()=>{if(!devFrozen)e.classList.add('hov');}; hb.onmouseleave=()=>{if(!devFrozen)e.classList.remove('hov');}; hb.onclick=()=>markFoe(u);}
    u.el=e; u.mv=e.firstChild; u.st=e.querySelector('.st'); u.st.appendChild(u.spr); setAnim(u,'idle',Math.random()*8|0);
    if(u.owner)e.classList.add('clone');
    $('units').appendChild(e);
}
// barra branca do escudo no topo: cria se faltar (index.html antigo em cache + JS novo derrubava a luta na 1.6/1.7)
function tshEl(s){ const S=s.toUpperCase(); let el=$('tsh'+S); if(!el){ el=document.createElement('i'); el.id='tsh'+S; el.className='shw'; $('thp'+S).parentNode.appendChild(el); } return el; }
function upd(u){
  if(u.alive&&u.d.stationary){
    if(u.an==='idle'&&u.stunned)setAnim(u,'stun');
    else if(u.an==='stun'&&!u.stunned)setAnim(u,'idle');
  }
  u.el.querySelector('.hpb i').style.transform=`scaleX(${u.hp/u.max})`; u.el.querySelector('.shb').style.transform=`scaleX(${u.alive&&u.shield>0?Math.min(1,u.shield/(u.shM||u.shield)):0})`; u.el.querySelector('.hpn').textContent=u.hp+'/'+u.max;
  u.el.classList.toggle('dead',!u.alive); u.el.classList.toggle('armed',u.armed&&u.alive);
  u.el.classList.toggle('powered',!!u.power&&u.alive);
  u.el.querySelector('.tg').innerHTML=!u.alive?'':(u.stunned?'<span class="s">P</span>':'')+(u.shield>0?'<span class="e">E</span>':'')+(u.dot?'<span class="d">D</span>':'')+(u.seal>0?'<span class="x">S</span>':'')+(u.blind>0?'<span class="x">C</span>':'')+(u.sleep>0?'<span class="x">Z</span>':'');
  for(const s of ['p','e']){const a=U[s].reduce((x,v)=>x+v.hp,0), b=U[s].reduce((x,v)=>x+v.max,0); $('thp'+s.toUpperCase()).style.transform=`scaleX(${a/b})`; const sh=U[s].reduce((x,v)=>x+(v.alive?v.shield:0),0), shm=U[s].reduce((x,v)=>x+(v.alive&&v.shield>0?v.shM||v.shield:0),0); tshEl(s).style.transform=`scaleX(${shm?Math.min(1,sh/shm):0})`;}
}
// clique no inimigo: marca em azul até clicar de novo (os jutsus do jogador miram nele, ver pick)
function markFoe(u){ if(!u.alive)return; const old=mark; mark=old===u?null:u;
  if(old)old.el.classList.remove('mk'); if(mark)mark.el.classList.add('mk'); sfx.arm(); }
function fl(u,txt,cls){const f=document.createElement('div'); f.className='fl '+(cls||''); f.textContent=txt; u.mv.appendChild(f); battleAfter(()=>f.remove(),cls==='ord'?1150:950);}
function log(html,cls){const l=$('log'), d=document.createElement('div'); if(cls)d.className=cls; d.innerHTML=html; l.appendChild(d); while(l.children.length>7)l.firstChild.remove();}
const nm=u=>`<span style="color:${u.d.c}">${u.d.name}</span>`;
function setState(t,s){if(s&&t.d.immuneState){ kazanGuard(t); return; } t.state=s; t.st.className='st'+(s?' '+s:''); if(t.alive)setAnim(t,stAnim(t,s));
  if(!s){t.off={x:0,y:0}; t.mv.style.transform='';}}
function dust(t,n){const p=cur(t); em(n,()=>prt(p.x,p.y,R(-8,8),-R(0,6),R(-2.6,2.6),R(-1.6,-.2),.03,R(14,26),R(4,8),0,pk(['#ffffff','#e8d8b8','#bfae8e']),1));}
