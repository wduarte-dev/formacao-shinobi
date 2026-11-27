// BETA: preview do Kaen. Uma luta REAL (motor do jogo, 4 ninjas inimigos de verdade) em que o "diretor" executa cada golpe do Kaen, um por vez,
// explicando o que é. Cada passo tem APROVADO / NÃO APROVADO (+ comentário) e no fim sai um resumo em formato de prompt. Gerado junto com beta/index.html.
(function(){
const ID='kaen';
const FOE={name:'Preview do Kaen',lvl:'Beta',bg:'noite',mult:1.4,ai:0,team:[['mayoi',1,0],['fuuka',0,1],['doku',2,1],['hiyori',1,2]]};
const REV_KEY='beta-kaen-review';
const $b=id=>document.getElementById(id);
const dodgeOrig=dodgeOf, runOrig=run;
const K=()=>U.p.find(u=>u.id===ID), F=i=>U.e[i];
const front=()=>U.e.find(e=>e.d.normal.target==='front')||U.e[0];
const wait=ms=>sleep(ms);

function reset(){   // devolve a luta ao estado limpo entre passos (todos vivos, de pé, sem status)
  try{ sceneOff(); zoomOut(true); endCine(); }catch(e){}
  frozen=false; $('field').classList.remove('hs'); mark=null; dodgeOf=dodgeOrig; chakra={p:100,e:100}; curSide='p'; round=1;
  for(const u of all()){ u.alive=true; u.hp=u.max; u.state=null; u.stunned=false; u.shield=0; u.dot=null; u.cd=0; u.armedSkill=null; u.chaseUsed=false; u.comboUsed=false; u.off={x:0,y:0};
    u.mv.style.transition='none'; u.mv.style.transform=''; u.st.className='st'; u.el.style.zIndex=u.z; u.el.classList.remove('dead','ghost','tgt','cmb','armed');
    setAnim(u,'idle',0); upd(u); }
  drawJ&&drawJ();
}
const STEPS=[
 {t:'Entrada pelo ar',x:'Essa é a ENTRADA do Kaen na abertura da luta: ele chega pelo ar e pousa em posição de combate (sprite novo, no lugar da corrida antiga).',
  run:async()=>{ await intro(); }},
 {t:'Idle de luta',x:'Esse é o IDLE do Kaen: a postura de luta parada, em loop (48 quadros suaves). Fique de olho no balanço e no cachecol.',
  run:async()=>{ await wait(4200); }},
 {t:'Caminhada e corrida',x:'Essa é a caminhada nova (usada na tela de carregamento) e depois a corrida. Na luta, o ataque não usa mais a corrida: ele PULA (próximo passo).',
  run:async()=>{ const k=K(); setAnim(k,'walk',0); await wait(2400); setAnim(k,'move',0); await wait(2000); }},
 {t:'Pulo (no lugar do dash)',x:'Esse é o PULO: o Kaen salta até o alvo em vez de correr (3 poses: agacha, no ar, aterrissa). Ele vai e volta.',
  run:async()=>{ const k=K(), t=F(0); await dashTo(k,t); await wait(350); home(k); await wait(500); }},
 {t:'Corte Ardente (ataque básico)',x:'Esse é o ATAQUE BÁSICO, o Corte Ardente: dois cortes de espada, cada um com seu hit-stop e o tranco no alvo. Golpe sutil: sem câmera nem flash.',
  run:async()=>{ mark=F(0); await doSkill(K(),K().d.normal,false); await wait(500); }},
 {t:'Corte Flamejante (golpe forte)',x:'Esse é o GOLPE FORTE, o Corte Flamejante: um corte descendente mais pesado (1,4× de dano). No jogo ele sai em 30% das ações sem jutsu.',
  run:async()=>{ mark=F(0); await doSkill(K(),K().d.strong,false); await wait(500); }},
 {t:'Jutsu armado (selo)',x:'Esse é o KAEN ARMADO: com o jutsu escolhido ele fica parado no selo montado, estático, com a aura, até chegar a vez dele.',
  run:async()=>{ const k=K(); k.armedSkill=k.d.jutsu; setAnim(k,'cast',0,true); upd(k); await wait(3200); }},
 {t:'Dragão de Brasa (jutsu)',x:'Esse é o JUTSU: selos, mãos abrindo, CUT-IN com o dragão, o dragão sai das mãos e cruza a fileira queimando, volta por cima e CAI GIGANTE em cima da malha inimiga inteira, se desintegrando. Camada de impacto na queda.',
  run:async()=>{ mark=F(0); await doSkill(K(),K().d.jutsu,true); await wait(1200); }},
 {t:'Chute Meteoro (perseguição)',x:'Essa é a PERSEGUIÇÃO: o inimigo está no ar (Voo), o Kaen agacha, sobe, mergulha com o chute (contato no último quadro) e pousa com a camada de impacto.',
  run:async()=>{ const k=K(), t=F(1); await smash(k,t,'V'); await wait(250); await chain('p',t,1,k); sceneOff(); await wait(600); }},
 {t:'Chuva de Brasas (combo 18)',x:'Esse é o COMBO 18: quando o time soma 18 hits na rodada, o Kaen faz chover brasas em TODOS os inimigos, queimando. Por enquanto só aparece no Modo dev (precisa da estrela).',
  run:async()=>{ await doSkill(K(),K().d.combo,false); await wait(1200); }},
 {t:'Dano (defesa + tranco)',x:'Esse é o DANO: quando leva golpe o Kaen cruza os braços (a pose da defesa nova) e treme com o tranco.',
  run:async()=>{ dodgeOf=()=>0; const a=front(); mark=null; await doSkill(a,a.d.normal,false); await wait(600); }},
 {t:'Esquiva',x:'Essa é a ESQUIVA: o Kaen pula pra trás e o golpe passa direto.',
  run:async()=>{ const k=K(); dodgeOf=t=>t===k?100:0; const a=front(); await doSkill(a,a.d.normal,false); await wait(600); }},
 {t:'Atordoado (estrelas)',x:'Esse é o ATORDOADO (paralisia): ele age normal, só não persegue. As ESTRELAS tontas giram sobre a cabeça (efeito do kit, recolorível).',
  run:async()=>{ const k=K(); k.stunned=true; upd(k); await wait(3600); k.stunned=false; upd(k); await wait(300); }},
 {t:'Buff',x:'Esse é o BUFF: setas subindo pelo corpo na cor do elemento (efeito do kit, serve pra qualquer ninja).',
  run:async()=>{ const k=K(); setAnim(k,'buff',0,true); kitBuff(k); await wait(2200); home(k); }},
 {t:'Repelido, Voo e Caído',x:'Esses são os estados: REPELIDO (voa até a borda e racha), VOO (sobe alto) e DERRUBADO (desaba com poeira). Três pancadas seguidas.',
  run:async()=>{ const k=K(), a=front(); for(const s of ['R','V','D']){ await smash(a,k,s); await wait(900); setState(k,null); k.mv.style.transition=''; await wait(500); } }},
 {t:'Derrota',x:'Essa é a DERROTA: o Kaen cai e fica no chão.',
  run:async()=>{ const k=K(); hurt(k,k.hp+1,'dot'); await wait(3200); }},
 {t:'Vitória',x:'Essa é a VITÓRIA: ele comemora, em loop.',
  run:async()=>{ setAnim(K(),'victory',0); await wait(3800); }},
];
let cur=0, res=[], running=false;
function load(){ try{ return JSON.parse(localStorage.getItem(REV_KEY)||'[]'); }catch(e){ return []; } }
function save(){ try{ localStorage.setItem(REV_KEY,JSON.stringify(res)); }catch(e){} }

function ui(){
  const st=$b('stage')||document.body;
  st.insertAdjacentHTML('beforeend',`<div id="betaRib">BETA · PREVIEW DO KAEN</div>
  <div id="betaIntro"><div class="card"><h2>Kaen — Preview BETA</h2>
   <p>Um jogo à parte só pra revisar o Kaen: <b>uma luta real</b> (motor do jogo, 4 ninjas inimigos de verdade) em que cada golpe, reação e animação dele é mostrada uma por vez, como um tutorial.</p>
   <p>Em cada passo você vê a animação e aperta <b>APROVADO</b> ou <b>NÃO APROVADO</b> (com um comentário, se quiser). No fim sai um <b>resumo em formato de prompt</b> pra colar no chat.</p>
   <p style="font-size:13px">Versão ${VERSION.v} · save separado do jogo principal${window.BETA_ART?'':' · <a href="beta/kaen.html" style="color:#ffb060">panorama de todas as animações</a>'}</p>
   <button class="btn" id="betaGo">Começar a revisão</button></div></div>
  <div id="betaPanel" hidden><div class="top"><b class="t" id="bpT"></b><span class="n" id="bpN"></span></div><div class="txt" id="bpX"></div>
   <div class="row" id="bpRow"><button class="btn sm" id="bpOk" disabled>APROVADO</button><button class="btn sm" id="bpNo" disabled>NÃO APROVADO</button><button class="btn sm" id="bpRe" disabled>Rever</button></div>
   <div class="row" id="bpCm" hidden><input id="bpIn" placeholder="O que mudar? (opcional)" maxlength="240"><button class="btn sm" id="bpSend">Enviar e seguir</button></div></div>
  <div id="betaEnd" hidden><div class="card"><h2>Resumo da revisão</h2><p>Copie o texto abaixo e cole no chat:</p><textarea id="beTxt" readonly></textarea>
   <div class="row" style="display:flex;gap:8px"><button class="btn" id="beCopy">Copiar</button><button class="btn" id="beAgain">Recomeçar</button></div></div></div>`);
  $b('betaGo').onclick=start; $b('bpOk').onclick=()=>decide(true); $b('bpNo').onclick=()=>{ $b('bpCm').hidden=false; $b('bpIn').focus(); setBtns(false,true); };
  $b('bpRe').onclick=()=>play(cur); $b('bpSend').onclick=()=>decide(false,$b('bpIn').value.trim());
  $b('beCopy').onclick=()=>{ const t=$b('beTxt'); t.select(); try{ navigator.clipboard.writeText(t.value); }catch(e){ document.execCommand('copy'); } $b('beCopy').textContent='Copiado!'; };
  $b('beAgain').onclick=()=>{ res=[]; save(); $b('betaEnd').hidden=true; play(0); };
}
function setBtns(on,keepRe){ $b('bpOk').disabled=!on; $b('bpNo').disabled=!on; $b('bpRe').disabled=!(on||keepRe); }
async function start(){
  $b('betaIntro').hidden=true; res=load().filter(r=>r&&STEPS[r.i]); res=[]; save();
  placed=[{id:ID,row:1,depth:0}]; unlocked=4; foeIx=0; acad=null; autoP=false; speed=1; FOES[0]=FOE;
  run=async()=>{};   // o diretor manda: o laço automático da luta não roda
  startBattle();
  for(let i=0;i<400&&!(U&&battleOn&&K());i++)await new Promise(r=>setTimeout(r,100));
  await new Promise(r=>setTimeout(r,2500)); play(0);
}
async function play(i){
  cur=i; running=true; const s=STEPS[i], P=$b('betaPanel'); P.hidden=false; $b('betaPanel').scrollIntoView&&0;
  $b('bpT').textContent=s.t; $b('bpN').textContent=`passo ${i+1} de ${STEPS.length}`; $b('bpX').textContent=s.x; $b('bpCm').hidden=true; $b('bpIn').value=''; setBtns(false); P.classList.add('run');
  try{ if(i!==0)reset(); await s.run(); }catch(e){ if(e!==ABORT)console.error(e); }
  running=false; setBtns(true); P.classList.remove('run');
}
function decide(ok,comment){
  const s=STEPS[cur]; res=res.filter(r=>r.i!==cur); res.push({i:cur,t:s.t,ok,c:comment||''}); save();
  if(cur+1<STEPS.length)play(cur+1); else finish();
}
function finish(){
  reset(); $b('betaPanel').hidden=true;
  const okL=res.filter(r=>r.ok).sort((a,b)=>a.i-b.i), noL=res.filter(r=>!r.ok).sort((a,b)=>a.i-b.i);
  const txt=[`Revisão do preview BETA do Kaen (jogo v${VERSION.v}, ${new Date().toLocaleDateString('pt-BR')}).`,'',
    `APROVADOS (${okL.length}/${STEPS.length}):`,...(okL.length?okL.map(r=>`- ${r.t}`):['- nenhum']),'',
    `NÃO APROVADOS (${noL.length}):`,...(noL.length?noL.map(r=>`- ${r.t}${r.c?': '+r.c:' (sem comentário)'}`):['- nenhum']),'',
    'Tarefa: ajuste só os itens NÃO APROVADOS, sem mexer nos aprovados. Siga a dinâmica de aprovação do repo (perguntas cirúrgicas se houver dúvida, testes, auto-inspeção do print, print + "aprovado?"). Se não houver itens não aprovados, publique o Kaen como está.'].join('\n');
  $b('beTxt').value=txt; $b('betaEnd').hidden=false; $b('beCopy').textContent='Copiar';
}
window.betaDebug={STEPS,play,decide,get cur(){return cur;},get res(){return res;},finish};
ui();
})();
