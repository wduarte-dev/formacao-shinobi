// academia.js — painel de Combos (Formação e Academia), tooltip de detalhes, Laboratório e lista do Teste de Perseguição.
// A lógica das cadeias fica em combos.js; aqui é só a tela.
"use strict";
let labTeam=[];   // time de teste do Laboratório (não salva; "Usar este time" copia pra Formação)
const STC={D:'#e8862a',L:'#3a9be0',R:'#d8392b'};   // cor do selo de cada estado

// ---- painel de combos ----
let CSZ=30;   // diâmetro do retrato no painel (30 na Formação, 44 na Academia)
function cPor(id,name,cls){ const w=document.createElement('div'); w.className='cpor '+(cls||'');
  const c=document.createElement('i'); c.className='por'; w.appendChild(c); portrait(c,id,CSZ/26,CSZ,CSZ);
  const n=document.createElement('small'); n.textContent=name; w.appendChild(n); return w; }
function cBadge(st){ const b=document.createElement('span'); b.className='cbadge'; b.textContent=st; b.style.background=STC[st]; b.title=ST[st]; return b; }
function cArrow(){ const a=document.createElement('span'); a.className='carr'; a.textContent='→'; return a; }
function drawCombos(el,ids,big){ if(!el)return; el.innerHTML=''; hideTip(); CSZ=big?38:30;
  if(!ids.length){ el.innerHTML='<div class="cnone">Coloque ninjas no campo para ver os combos.</div>'; return; }
  const rows=comboRows(ids), out=comboLeftOut(ids,rows);
  if(!rows.length){ const n=document.createElement('div'); n.className='cnone'; n.textContent='Nenhum combo: ninguém do time persegue os estados que vocês deixam.'; el.appendChild(n); }
  for(const r of rows){ const row=document.createElement('div'); row.className='crow';
    const op=cPor(r.id,N[r.id].name,'open'); const tag=document.createElement('em'); tag.textContent=r.kinds.join('/'); op.appendChild(tag);
    op.onclick=e=>showTip(e.currentTarget,openerDetail(r)); row.appendChild(op);
    if(r.area){ const a=document.createElement('span'); a.className='carea'; a.textContent='em área'; op.appendChild(a); }   // selo sobre o retrato de quem abre (não ocupa espaço na linha)
    r.chain.forEach((c,k)=>{ if(!big)row.appendChild(cArrow()); row.appendChild(cBadge(c.on)); if(!big)row.appendChild(cArrow());
      const p=cPor(c.id,N[c.id].name,N[c.id].chase.tsunami||N[c.id].chase.cloneHit?'spec':''); p.onclick=e=>showTip(e.currentTarget,chaseDetail(c.id)); row.appendChild(p); });
    const num=document.createElement('div'); num.className='cnum'; num.innerHTML=`<b>${r.chain.length}</b><small>perseguiç${r.chain.length>1?'ões':'ão'}</small>`; row.appendChild(num);
    el.appendChild(row); }
  for(const o of out){ const l=document.createElement('div'); l.className='cout'; l.appendChild(cPor(o.id,'','gray')); const t=document.createElement('span'); t.textContent=o.why; l.appendChild(t); el.appendChild(l); }
}
// ---- tooltip (clique numa abertura ou perseguição) ----
function showTip(target,html){ const tip=$('cTip'), st=$('stage').getBoundingClientRect(), k=st.width/1152, r=target.getBoundingClientRect();
  tip.innerHTML=html; tip.classList.remove('hide');
  const x=(r.left+r.width/2-st.left)/k, y=(r.bottom-st.top)/k+6, w=tip.offsetWidth;
  tip.style.left=Math.max(8,Math.min(1144-w,x-w/2))+'px'; tip.style.top=Math.min(600,y)+'px'; }
function hideTip(){ $('cTip')?.classList.add('hide'); }
addEventListener('pointerdown',e=>{ if(!e.target.closest('.cpor,#cTip'))hideTip(); },true);

// ---- Academia ----
const labCell=(row,depth)=>({x:[292,206,120][depth]+(1-row)*12,y:[332,380,428][row]});
const LAB_BOARD={list:()=>labTeam, cell:labCell, redraw:()=>drawAcad(), sc:1.9, tiles:'#aTiles .tile', save:false};
let labInit=false;   // o Laboratório começa com o time salvo só na 1ª vez; depois respeita o que o jogador fizer (até ficar vazio)
function drawAcad(){ BOARD=LAB_BOARD; ACT=[];
  if(!labInit){ labInit=true; if(!labTeam.length)placed.forEach(p=>labTeam.push({...p})); }
  const T=$('aTiles'), Un=$('aUnits'); T.innerHTML=''; Un.innerHTML='';
  for(let row=0;row<3;row++)for(let depth=0;depth<3;depth++){ const c=labCell(row,depth), t=document.createElement('div'); t.className='tile'; t.style.left=c.x+'px'; t.style.top=c.y+'px'; t.dataset.rd=row+','+depth; T.appendChild(t); }
  labTeam.forEach((p,i)=>{ const c=labCell(p.row,p.depth), a=actor(p.id,1.9,c.x,c.y,Un); a.el.style.zIndex=10+p.row;
    const b=document.createElement('div'); b.className='ordb sm'; b.textContent=i+1; a.el.appendChild(b);
    const hit=document.createElement('div'); hit.style.cssText='position:absolute;left:-28px;top:-92px;width:56px;height:94px'; a.el.appendChild(hit);
    hit.onpointerdown=e=>{ startDrag(e,p.id,true); holdStart(p.id,hit); }; });
  const R=$('aRoster'); R.innerHTML='';
  IDS.forEach(id=>{ const used=labTeam.some(p=>p.id===id), b=document.createElement('button'); b.className='slot'+(used?' used':'')+(have(id)?'':' lockd');
    const po=document.createElement('i'); po.className='por'; b.appendChild(po); portrait(po,id,1.15,40,40);
    if(!have(id)){ const s=document.createElement('small'); s.textContent='🔒'; b.appendChild(s); R.appendChild(b); return; }
    b.onpointerdown=e=>{ startDrag(e,id,false); holdStart(id,b); }; R.appendChild(b); });
  drawCombos($('aCombo'),labTeam.map(p=>p.id),true);
  const L=$('aList'); L.innerHTML='';
  ACAD.forEach((c,i)=>{ const card=document.createElement('div'); card.className='acard';
    card.innerHTML=`<span class="an">${i+1} · ${c.name}</span><span class="astar${acadDone.includes(i)?' on':''}">★</span>`;
    const go=document.createElement('button'); go.className='btn sm red'; go.textContent='Lutar'; go.disabled=!acadReady(c); go.onclick=()=>acadFight(i); card.appendChild(go); L.appendChild(card); });
  $('aMestre').innerHTML=''; actor('mestre',3,60,180,$('aMestre'),true);
}
// o time do Laboratório cumpre o desafio? (4 ninjas; no de Fogo, alguém de Fogo). Se não, o Lutar fica cinza: o card já diz o requisito
const acadReady=c=>labTeam.length===4&&(!c.fire||labTeam.some(p=>N[p.id].el.includes('Fogo')));
function acadFight(i){ const c=ACAD[i]; if(!acadReady(c))return;
  sfx.ui('confirma'); acad={i,done:false}; startBattle(); }
$('aUse').onclick=()=>{ if(!labTeam.length)return; placed.length=0; labTeam.forEach(p=>placed.push({...p})); save(); sfx.ui('confirma'); const b=$('aUse'); b.textContent='Copiado!'; setTimeout(()=>b.textContent='Usar este time',1400); };
$('aClear').onclick=()=>{ labTeam.length=0; sfx.ui('cancela'); drawAcad(); };
$('aBack').onclick=()=>{ sfx.ui('cancela'); show('sForm'); };
$('fAcad').onclick=()=>{ sfx.ui('confirma'); show('sAcad'); };
// painel de Combos da Formação minimizável (▼/▲, igual ao log); minimizado mostra o maior combo no título; lembra a escolha
function comboMin(on){ $('fComboW').classList.toggle('min',on); $('fComboT').textContent=on?'▲':'▼'; try{localStorage.setItem('shinobi-combomin',on?'1':'');}catch(e){} comboTitle(); }
function comboTitle(){ const rows=comboRows(placed.map(p=>p.id)), m=rows.length?rows[0].chain.length:0;
  $('fComboH').textContent=$('fComboW').classList.contains('min')?`Combos · máx. ${m}`:'Combos'; }
$('fComboT').onclick=()=>comboMin(!$('fComboW').classList.contains('min'));
try{comboMin(localStorage.getItem('shinobi-combomin')==='1');}catch(e){}
// ---- ficha do ninja (mesmo visual na Formação e no "segurar" da Academia; modelo: docs/refs/mock-ficha.png no repo de contexto) ----
const stB=s=>s?`<span class="cbadge" style="background:${STC[s]}">${s}</span>`:'';
function fichaHtml(id){ const d=N[id], n=d.normal, s=d.strong, j=d.jutsu, c=d.chase;
  const ex=sk=>(sk.burnChance?' + chance de Chamas':sk.dot?' + veneno':'')+(sk.stun?' + paralisa':'')+(sk.split?` · ${Math.round(sk.split*100)}%: acerta todos`:'');
  const row=(cls,lab,txt)=>`<div class="frow"><span class="flab ${cls}">${lab}</span><span>${txt}</span></div>`;
  return `<div class="fhead"><i class="fpor por"></i><div><b style="color:${shade(d.c)}">${d.name}</b><span class="chip">${d.el}</span><span class="chip">${d.role}</span></div></div>
  <div class="fstat"><span>♥ Vida ${d.hp}</span><span>⚔ Ataque ${d.atk}</span><span>⛨ Defesa ${d.def}</span><span>» Esquiva ${d.dodge||0}</span></div>`
  +row('fb','Básico:',`${n.name} (${TG[n.target]})${n.cause?' → '+stB(n.cause):''}${ex(n)}`)
  +row('ff',`Forte (${Math.round(STRONG_CHANCE*100)}%):`,s?`${s.name}${s.cause?' → '+stB(s.cause):''}${ex(s)}`:'—')
  +row('fj','Jutsu:',`${j.name} · ${j.cost} chakra · ${j.desc}${j.cause?' → '+stB(j.cause):''}`)
  +(c?row('fp','Perseguição:',`${c.name} · ${stB(c.on)} → ${stB(c.cause)}`):row('fp','Passiva:',`imune a D/L/R; Bola de Fogo a cada ${KAZAN_LIMIT} contatos do time`)); }
function drawFicha(el,id){ el.innerHTML=fichaHtml(id); portrait(el.querySelector('.fpor'),id,2.2,52,52); }
// segurar um ninja do Laboratório (~0,45 s sem arrastar) abre a ficha por cima do painel; soltar fecha
let holdT=null;
function holdStart(id,slot){ clearTimeout(holdT); holdT=setTimeout(()=>{ const f=$('aFicha'); drawFicha(f,id); f.classList.remove('hide');
  const st=$('stage').getBoundingClientRect(), k=st.width/1152, r=slot.getBoundingClientRect();
  f.style.setProperty('--px',Math.max(20,Math.min(300,(r.left+r.width/2-st.left)/k-f.offsetLeft))+'px'); },450); }
function holdEnd(){ clearTimeout(holdT); holdT=null; $('aFicha')?.classList.add('hide'); }
addEventListener('pointerup',holdEnd); addEventListener('pointercancel',holdEnd);
addEventListener('pointermove',()=>{ if(drag?.moved)holdEnd(); });
