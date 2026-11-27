// Kit de efeitos reutilizáveis (sprites brancos/cinza tingidos por cor em código, cache por cor) num canvas #kfx próprio, só com o que está ativo.
// Linhas de spr/kit_fx.png: 0 anel de choque, 1 setas de buff, 2 estrelas tontas (loop), 3 poeira. spr/kit_brilho.png: 0 faísca, 1 anel, 2 partículas, 3 brilho de 4 pontas.
// Também a CAMADA DE IMPACTO (impactFx): flash + tremor + squash + anéis em eco + faíscas + linhas + rachadura + hit-stop, só pra golpes pesados e jutsus.
const KIT_FILES={fx:'spr/kit_fx.webp',br:'spr/kit_brilho.webp',st:'spr/kit_status.webp'}, STUN_KIT={kaen:1};
const kitIM={}, kitTC={}; let kitP=null, kitCv=null, kitCtx=null, kitList=[], kitOn=false, kitLast=0;
function kitLoad(){ return kitP||(kitP=Promise.all(Object.entries(KIT_FILES).map(([k,src])=>new Promise(res=>{ const i=new Image(); i.onload=()=>(i.decode?i.decode().catch(()=>{}):Promise.resolve()).then(res); i.onerror=()=>res(); i.src=src; kitIM[k]=i; }))).then(kitWarm)); }
// tinge de antemão as cores que a luta usa (impacto, estrelas, buff dos ninjas) pra não recolorir no instante do golpe
async function kitWarm(){ const cols=new Set(['#ffffff','#ff8a3a','#ff9a4a','#ffb060']); if(typeof N!=='undefined')Object.values(N).forEach(d=>d&&d.c&&cols.add(d.c));
  let t0=performance.now(); for(const c of cols){ for(const [sh,rows] of [['fx',[0,1,2]],['br',[0,2,3]]])for(const r of rows)for(let f=0;f<6;f++){ try{ kitCell(sh,r,f,c); }catch(e){} if(performance.now()-t0>6){ await new Promise(r=>setTimeout(r,0)); t0=performance.now(); } } } }
// SOCKETS (pontos de ancoragem): onde um efeito nasce em cada ninja. Fonte: FACE (centro da cabeça medido por ninja e por animação, em px do atlas, pés em [96,150]);
// sem medida usa a proporção do corpo (cabeça a ~82% da altura). Espelha pro lado inimigo e escala por `size`. Nomes: head, chest, hand, feet.
function sockOf(u,name){ const p=cur(u), sz=u.d?.size||1, F=(typeof FACE!=='undefined'&&FACE[u.id])||{}, f=Array.isArray(F[u.an])?F[u.an]:F.idle;
  const head=Array.isArray(f)?[f[0]-96,f[1]-150]:[0,-.82*118], S=({head,chest:[head[0]*.5,head[1]*.55],hand:[head[0]+34,head[1]*.62],feet:[0,0]})[name]||[0,0], m=u.side==='e'?-1:1;
  return {x:p.x+S[0]*sz*m,y:p.y+S[1]*sz}; }
// PLANO DO JOGO: o chão do cenário é um plano oblíquo (linhas de trás mais altas e deslocadas pra direita, como no desenho do dono). Efeito de chão (anéis, poeira, fogo,
// aura, órbita das estrelas) é achatado em F (altura) e inclinado em SHEAR (x por px de y, igual ao deslocamento das casas em cell()) em vez de ficar de frente pra câmera.
const PLANE={F:.42,SHEAR:.3};
function planeXf(c,pf){ const f=pf||PLANE.F; c.transform(1,0,-PLANE.SHEAR*f,f,0,0); }
function kitHex(c){ const n=parseInt((c||'#ffffff').replace('#',''),16); return [n>>16&255,n>>8&255,n&255]; }
function kitCell(sheet,row,col,color){ const k=sheet+row+col+color; if(kitTC[k])return kitTC[k];
  const cv=document.createElement('canvas'); cv.width=cv.height=256; const g=cv.getContext('2d'); g.imageSmoothingEnabled=false; g.drawImage(kitIM[sheet],col*256,row*256,256,256,0,0,256,256);
  if(color&&color!=='#ffffff'){ const d=g.getImageData(0,0,256,256), p=d.data, c=kitHex(color), dark=c.map(v=>v*.3|0);
    for(let i=0;i<p.length;i+=4){ if(!p[i+3])continue; const l=(p[i]*.3+p[i+1]*.59+p[i+2]*.11)/255;
      for(let j=0;j<3;j++)p[i+j]=l<.5?dark[j]+(c[j]-dark[j])*l*2:c[j]+(255-c[j])*(l-.5)*2; } g.putImageData(d,0,0); }
  return kitTC[k]=cv; }
function kitCanvas(){ if(kitCv&&kitCv.isConnected)return kitCtx; kitCv=document.createElement('canvas'); kitCv.id='kfx'; kitCv.width=1152; kitCv.height=648; $('cam').appendChild(kitCv); return kitCtx=kitCv.getContext('2d'); }
// e: {sheet,row,fps,loop,x,y,sc,color,delay,dur,a,follow,dy,rise,rot,stop,end}
function kitAdd(e){ if(!kitIM.fx||!kitIM.fx.complete)return null; e=Object.assign({sheet:'fx',row:0,fps:12,loop:false,sc:.5,color:'#ffffff',delay:0,age:0,a:1,dy:0,rise:0,tok:token},e); if(!e.dur)e.dur=e.loop?99:6/e.fps+.1;
  kitCanvas(); kitList.push(e); if(!kitOn){ kitOn=true; kitLast=performance.now(); requestAnimationFrame(kitTick); } return e; }
function kitTick(now){ const c=kitCtx, dt=Math.min(.05,(now-kitLast)/1000)*(typeof speed==='number'?speed:1); kitLast=now;
  if(typeof paused!=='undefined'&&paused){ requestAnimationFrame(kitTick); return; }
  c.clearRect(0,0,1152,648);
  kitList=kitList.filter(e=>{ if(e.tok!==token||(e.stop&&e.stop())){ e.end&&e.end(); return false; }
    e.age+=dt; const t=e.age-e.delay; if(t<0)return true; if(t>e.dur){ e.end&&e.end(); return false; }
    let f=Math.floor(t*e.fps); if(e.loop)f%=6; else f=Math.min(5,f);
    let x=e.x, y=e.y; if(e.follow){ const s=sockOf(e.follow,e.sock||'head'); x=s.x+(e.ox||0); y=s.y+(e.oy||0); }
    y+=e.dy-e.rise*(t/e.dur); const fade=e.loop?1:t>e.dur*.75?1-(t-e.dur*.75)/(e.dur*.25):1;
    c.save(); c.translate(x,y); if(e.rot)c.rotate(e.rot); if(e.plane)planeXf(c,e.pf); c.scale(e.sc,e.sc); c.globalAlpha=e.a*fade; c.imageSmoothingEnabled=false; c.drawImage(kitCell(e.sheet,e.row,f,e.color),-128,-128); c.restore(); return true; });
  if(kitList.length)requestAnimationFrame(kitTick); else{ kitOn=false; c.clearRect(0,0,1152,648); } }
// estrelas tontas em órbita acima da cabeça enquanto o ninja estiver atordoado (só quem usa o kit no lugar do sprite: STUN_KIT)
function kitStars(u){ if(u._ks||!kitIM.fx)return; u._ks=1; kitAdd({row:2,fps:9,loop:true,sc:.5,follow:u,sock:'head',oy:-8,plane:true,pf:.8,stop:()=>!(u.alive&&u.stunned),end:()=>{u._ks=0;}}); }
// setas de buff subindo pelo corpo, na cor do ninja
function kitBuff(u,color){ const s=sockOf(u,'chest'), sz=u.d?.size||1; kitAdd({row:1,fps:10,sc:.55*sz,x:s.x,y:s.y+8*sz,rise:34,color:color||u.d?.c||'#ffffff'}); kitAdd({row:1,fps:10,sc:.4*sz,x:s.x,y:s.y+18*sz,rise:26,color:'#ffffff',delay:.12,a:.8}); }
// AURA do jutsu em loop enquanto ele arma/executa (placeholder da folha de status do kit, deitada no plano; o definitivo vem de um sheet gerado pelo dono). Liga com u._aura=true
function kitAura(u){ if(u._ka||!kitIM.st)return; u._ka=1; const sz=u.d?.size||1; kitAdd({sheet:'st',row:0,fps:10,loop:true,sc:.62*sz,follow:u,sock:'feet',oy:-30*sz,plane:true,pf:.62,color:u.d?.c||'#ffffff',a:.95,stop:()=>!(u.alive&&u._aura),end:()=>{u._ka=0;}}); }
// CAMADA DE IMPACTO: golpes pesados e jutsus (golpes sutis NÃO usam). o={at:{x,y},pow,color,dir,stop,cam,crack}
async function impactFx(t,o={}){ const p=o.at||(t?cur(t):{x:576,y:400}), pow=o.pow||1, col=o.color||'#ffb060', y=p.y-48*Math.min(1.4,pow);
  flash(); shake(.8+.5*pow);
  kitAdd({sheet:'br',row:0,fps:18,sc:.8*pow,x:p.x,y,color:'#ffffff'}); kitAdd({row:0,fps:14,sc:1.15*pow,x:p.x,y:p.y-4,color:col,plane:true});
  kitAdd({row:0,fps:14,sc:.7*pow,x:p.x,y:p.y-4,color:'#ffffff',delay:.09,a:.8,plane:true});   // eco
  kitAdd({row:3,fps:12,sc:.9*pow,x:p.x,y:p.y-2,color:'#e8dcc4',delay:.03,plane:true,a:.9});   // poeira deitada no chão
  kitAdd({sheet:'br',row:2,fps:12,sc:1.0*pow,x:p.x,y,color:col}); kitAdd({sheet:'br',row:3,fps:14,sc:.38*pow,x:p.x,y:y-10,color:'#ffffff',delay:.04});
  if(o.dir)speedLines(o.dir<0?'R':'D'); else speedLines('D'); if(o.crack)crack(p.x,p.y+2);
  if(t&&t.alive&&t.st)t.st.animate([{scale:'1.22 .8'},{scale:'.94 1.06',offset:.45},{scale:'1'}],{duration:260/speed,easing:'ease-out'});
  if(o.cam){ zoomTo(p.x,p.y-60,1.08); battleAfter(()=>zoomOut(),280/speed); }
  if(o.stop!==0)await hitstop(o.stop||90); }
